import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let prismaMock: any;
  let redisMock: any;
  let websocketMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      showtime: { findUnique: vi.fn() },
      showtimeSeat: { findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
      booking: { create: vi.fn(), update: vi.fn() },
      ticket: { create: vi.fn() },
      user: { findUnique: vi.fn(), update: vi.fn() },
      combo: { findMany: vi.fn() },
      voucher: { findUnique: vi.fn() },
      $transaction: vi.fn((cb) => cb(prismaMock)),
    };
    redisMock = {
      acquireSeatLock: vi.fn().mockResolvedValue(true),
      releaseSeatLock: vi.fn().mockResolvedValue(true),
    };
    websocketMock = {
      broadcastSeatState: vi.fn(),
    };
    configMock = {
      get: vi.fn().mockReturnValue('mock-secret'),
    };

    service = new BookingService(prismaMock, redisMock, websocketMock, configMock);
  });

  it('nên giữ ghế thành công khi Redlock chưa có ai giữ', async () => {
    prismaMock.showtime.findUnique.mockResolvedValue({ id: 'st_456' });

    const res = await service.holdSeats('usr_101', {
      showtimeId: 'st_456',
      seatIds: ['H12', 'H13'],
    });

    expect(res.heldSeats).toEqual(['H12', 'H13']);
    expect(res.ttlSeconds).toBe(600);
    expect(websocketMock.broadcastSeatState).toHaveBeenCalledTimes(2);
  });

  it('nên báo lỗi 409 SEAT_ALREADY_HELD khi Redlock đã bị khóa bởi người khác', async () => {
    prismaMock.showtime.findUnique.mockResolvedValue({ id: 'st_456' });
    redisMock.acquireSeatLock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(
      service.holdSeats('usr_101', {
        showtimeId: 'st_456',
        seatIds: ['H12', 'H13'],
      }),
    ).rejects.toThrow();
  });

  it('nên báo lỗi SEAT_ALREADY_SOLD khi ghế đã bị bán trong Database', async () => {
    prismaMock.showtime.findUnique.mockResolvedValue({ id: 'st_456' });
    prismaMock.showtimeSeat.findMany.mockResolvedValue([{ seatId: 'H12', status: 'SOLD' }]);

    await expect(
      service.holdSeats('usr_101', {
        showtimeId: 'st_456',
        seatIds: ['H12'],
      }),
    ).rejects.toThrow();
  });
});
