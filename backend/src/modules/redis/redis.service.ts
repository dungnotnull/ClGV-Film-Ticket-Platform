import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private subClient: Redis | null = null;
  private isConnected = false;

  // In-memory fallback map cho môi trường dev khi Redis chưa sẵn sàng
  private readonly memoryStore = new Map<string, { value: string; expiresAt: number }>();

  private onSeatExpiredCallback: ((showtimeId: string, seatId: string) => void) | null = null;
  private fallbackInterval: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    try {
      this.client = new Redis({
        host,
        port,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Chuyển sang In-Memory Fallback Store do không kết nối được Redis');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
        lazyConnect: true,
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        this.logger.log(`Kết nối thành công Redis tại ${host}:${port}`);
        this.setupKeyspaceSubscriber(host, port);
      }).catch((err) => {
        this.logger.warn(`Redis connection failed: ${err.message}. Sử dụng In-Memory Fallback.`);
        this.setupFallbackInterval();
      });
    } catch (error) {
      this.logger.warn('Sử dụng In-Memory Fallback Store cho Redis');
      this.setupFallbackInterval();
    }
  }

  setSeatExpiredCallback(cb: (showtimeId: string, seatId: string) => void) {
    this.onSeatExpiredCallback = cb;
  }

  private setupKeyspaceSubscriber(host: string, port: number) {
    try {
      this.subClient = new Redis({ host, port, lazyConnect: true });
      this.subClient.connect().then(() => {
        // Bật keyspace notifications cho các key hết hạn (Ex)
        this.client?.config('SET', 'notify-keyspace-events', 'Ex').catch(() => {});
        this.subClient?.subscribe('__keyevent@0__:expired').catch(() => {});
        
        this.subClient?.on('message', (channel, message) => {
          if (channel === '__keyevent@0__:expired' && message.startsWith('lock:seat:')) {
            const parts = message.split(':');
            if (parts.length >= 4) {
              const showtimeId = parts[2];
              const seatId = parts[3];
              if (this.onSeatExpiredCallback) {
                this.onSeatExpiredCallback(showtimeId, seatId);
              }
            }
          }
        });
      }).catch(() => {});
    } catch (e) {}
  }

  private setupFallbackInterval() {
    if (this.fallbackInterval) return;
    this.fallbackInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.memoryStore.entries()) {
        if (data.expiresAt <= now) {
          this.memoryStore.delete(key);
          if (key.startsWith('lock:seat:')) {
            const parts = key.split(':');
            if (parts.length >= 4 && this.onSeatExpiredCallback) {
              this.onSeatExpiredCallback(parts[2], parts[3]);
            }
          }
        }
      }
    }, 1000); // Kiểm tra mỗi giây
  }

  onModuleDestroy() {
    this.client?.disconnect();
    this.subClient?.disconnect();
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
    }
  }

  /**
   * Đặt khóa phân tán Redis Redlock cho ghế (SET key value NX EX ttlSeconds)
   */
  async acquireSeatLock(showtimeId: string, seatId: string, userId: string, ttlSeconds = 600): Promise<boolean> {
    const key = `lock:seat:${showtimeId}:${seatId}`;
    if (this.isConnected && this.client) {
      const res = await this.client.set(key, userId, 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    }

    // Fallback In-Memory logic
    const now = Date.now();
    const existing = this.memoryStore.get(key);
    if (existing && existing.expiresAt > now) {
      return false;
    }
    this.memoryStore.set(key, { value: userId, expiresAt: now + ttlSeconds * 1000 });
    return true;
  }

  /**
   * Giải phóng khóa Redlock ghế
   */
  async releaseSeatLock(showtimeId: string, seatId: string): Promise<boolean> {
    const key = `lock:seat:${showtimeId}:${seatId}`;
    if (this.isConnected && this.client) {
      await this.client.del(key);
      return true;
    }
    this.memoryStore.delete(key);
    return true;
  }

  /**
   * Lấy người dùng đang giữ ghế
   */
  async getSeatLockHolder(showtimeId: string, seatId: string): Promise<string | null> {
    const key = `lock:seat:${showtimeId}:${seatId}`;
    if (this.isConnected && this.client) {
      return await this.client.get(key);
    }
    const existing = this.memoryStore.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      return existing.value;
    }
    return null;
  }

  /**
   * Broadcast sự kiện Pub/Sub
   */
  async publish(channel: string, message: string): Promise<number> {
    if (this.isConnected && this.client) {
      return await this.client.publish(channel, message);
    }
    return 0;
  }
}
