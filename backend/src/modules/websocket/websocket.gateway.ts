import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.redisService.setSeatExpiredCallback((showtimeId, seatId) => {
      this.logger.log(`Redis Keyspace Notification: Ghế ${seatId} suất ${showtimeId} đã hết hạn khóa. Broadcast AVAILABLE.`);
      this.broadcastSeatState(showtimeId, seatId, 'AVAILABLE');
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client kết nối Socket.io: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ngắt kết nối Socket.io: ${client.id}`);
  }

  @SubscribeMessage('join:showtime')
  handleJoinShowtime(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string },
  ) {
    if (!data?.showtimeId) return;
    const room = `showtime:${data.showtimeId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} tham gia phòng WebSocket: ${room}`);
  }

  @SubscribeMessage('seat:select')
  async handleSeatSelect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string; seatId: string; userId?: string },
  ) {
    if (!data?.showtimeId || !data?.seatId) return;
    const userId = data.userId || client.id;
    const locked = await this.redisService.acquireSeatLock(data.showtimeId, data.seatId, userId, 600);

    if (locked) {
      const expiresAt = new Date(Date.now() + 600 * 1000).toISOString();
      const payload = {
        showtimeId: data.showtimeId,
        seatId: data.seatId,
        status: 'HOLDING',
        heldByUserId: userId,
        expiresAt,
      };
      this.server.to(`showtime:${data.showtimeId}`).emit('seat:state_changed', payload);
    } else {
      client.emit('seat:error', {
        code: 'SEAT_ALREADY_HELD',
        message: `Ghế ${data.seatId} hiện đang được giữ bởi người dùng khác`,
      });
    }
  }

  @SubscribeMessage('seat:deselect')
  async handleSeatDeselect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string; seatId: string },
  ) {
    if (!data?.showtimeId || !data?.seatId) return;
    await this.redisService.releaseSeatLock(data.showtimeId, data.seatId);

    const payload = {
      showtimeId: data.showtimeId,
      seatId: data.seatId,
      status: 'AVAILABLE',
      heldByUserId: null,
      expiresAt: null,
    };
    this.server.to(`showtime:${data.showtimeId}`).emit('seat:state_changed', payload);
  }

  /**
   * Broadcast trạng thái ghế tới tất cả các client đang xem suất chiếu
   */
  broadcastSeatState(showtimeId: string, seatId: string, status: string, heldByUserId: string | null = null, expiresAt: string | null = null) {
    if (!this.server) return;
    this.server.to(`showtime:${showtimeId}`).emit('seat:state_changed', {
      showtimeId,
      seatId,
      status,
      heldByUserId,
      expiresAt,
    });
  }
}
