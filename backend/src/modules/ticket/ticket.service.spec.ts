import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketService } from './ticket.service';
import * as crypto from 'crypto';

describe('TicketService', () => {
  let service: TicketService;
  let prismaMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      ticket: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    };
    configMock = {
      get: vi.fn((key: string, defaultVal: string) => {
        if (key === 'TURNSTILE_SECRET_KEY') return 'turnstile-secret-key-2026';
        if (key === 'TICKET_HMAC_SECRET') return 'clgv-ticket-secret-key-2026';
        return defaultVal;
      }),
    };

    service = new TicketService(prismaMock, configMock);
  });

  it('nên báo lỗi UnauthorizedException khi X-Scanner-Key không khớp', async () => {
    await expect(service.verifyQrTicket('WRONG_KEY', 'TKT.test.sig')).rejects.toThrow(
      'Header X-Scanner-Key không hợp lệ',
    );
  });

  it('nên báo lỗi UnprocessableEntityException khi định dạng qrToken không phải TKT.payload.sig', async () => {
    await expect(
      service.verifyQrTicket('turnstile-secret-key-2026', 'INVALID_TOKEN'),
    ).rejects.toThrow();
  });

  it('nên xác thực mã QR HMAC-SHA256 thành công', async () => {
    const secret = 'clgv-ticket-secret-key-2026';
    const payload = {
      ticketId: 'tkt_001',
      showtimeId: 'st_456',
      seatId: 'H12',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
    const token = `TKT.${payloadBase64}.${sig}`;

    prismaMock.ticket.findUnique.mockResolvedValue({
      id: 'tkt_001',
      seatId: 'H12',
      status: 'UNUSED',
      booking: {
        showtime: {
          movie: { title: 'Avatar 3' },
          cinema: { name: 'CGV Vincom' },
          hall: { name: 'Hall 1' },
        },
        combos: [],
      },
    });
    prismaMock.ticket.update.mockResolvedValue({
      id: 'tkt_001',
      status: 'CHECKED_IN',
      updatedAt: new Date(),
    });

    const result = await service.verifyQrTicket('turnstile-secret-key-2026', token);
    expect(result.verified).toBe(true);
    expect(result.ticketId).toBe('tkt_001');
    expect(result.status).toBe('CHECKED_IN');
  });
});
