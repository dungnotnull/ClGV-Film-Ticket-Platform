"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowtimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ShowtimeService = class ShowtimeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createShowtimeDto) {
        const startTime = new Date(createShowtimeDto.startTime);
        const endTime = new Date(createShowtimeDto.endTime);
        const bufferedStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
        const bufferedEndTime = new Date(endTime.getTime() + 15 * 60 * 1000);
        const conflictingShowtimes = await this.prisma.showtime.findMany({
            where: {
                hallId: createShowtimeDto.hallId,
                OR: [
                    {
                        startTime: { lte: bufferedEndTime },
                        endTime: { gte: bufferedStartTime },
                    },
                ],
            },
        });
        if (conflictingShowtimes.length > 0) {
            throw new common_1.ConflictException({
                code: 'SHOWTIME_CONFLICT',
                message: 'Suất chiếu bị trùng lặp thời gian hoặc vi phạm khoảng nghỉ 15 phút dọn phòng chiếu',
            });
        }
        const hall = await this.prisma.hall.findUnique({
            where: { id: createShowtimeDto.hallId },
        });
        if (!hall) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Phòng chiếu không tồn tại',
            });
        }
        const showtime = await this.prisma.showtime.create({
            data: {
                movieId: createShowtimeDto.movieId,
                cinemaId: createShowtimeDto.cinemaId,
                hallId: createShowtimeDto.hallId,
                startTime,
                endTime,
                basePrice: createShowtimeDto.basePrice,
            },
        });
        const matrix = hall.roomMatrix;
        if (matrix && matrix.grid && Array.isArray(matrix.grid)) {
            const seatsToCreate = [];
            for (const row of matrix.grid) {
                if (Array.isArray(row)) {
                    for (const seat of row) {
                        if (seat && seat.type !== 'EMPTY_SPACE') {
                            seatsToCreate.push({
                                showtimeId: showtime.id,
                                seatId: seat.id,
                                row: seat.row,
                                col: seat.col,
                                type: seat.type,
                                status: seat.isBlocked ? client_1.SeatStatus.BLOCKED : client_1.SeatStatus.AVAILABLE,
                                priceModifier: seat.priceModifier || 1.0,
                            });
                        }
                    }
                }
            }
            if (seatsToCreate.length > 0) {
                await this.prisma.showtimeSeat.createMany({
                    data: seatsToCreate,
                });
            }
        }
        return showtime;
    }
    async findAll(movieId, cinemaId, date) {
        let startDate;
        let endDate;
        if (date) {
            startDate = new Date(`${date}T00:00:00.000Z`);
            endDate = new Date(`${date}T23:59:59.999Z`);
        }
        return this.prisma.showtime.findMany({
            where: {
                ...(movieId && { movieId }),
                ...(cinemaId && { cinemaId }),
                ...(date && {
                    startTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
            include: {
                movie: { select: { id: true, title: true, durationMinutes: true, posterUrl: true, ageRating: true } },
                cinema: { select: { id: true, name: true, address: true } },
                hall: { select: { id: true, name: true, screenType: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async getShowtimeSeats(showtimeId) {
        const showtime = await this.prisma.showtime.findUnique({
            where: { id: showtimeId },
            include: {
                movie: { select: { title: true } },
                cinema: { select: { name: true } },
                hall: { select: { name: true, screenType: true } },
                seats: {
                    orderBy: [{ row: 'asc' }, { col: 'asc' }],
                },
            },
        });
        if (!showtime) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Suất chiếu không tồn tại',
            });
        }
        return showtime;
    }
};
exports.ShowtimeService = ShowtimeService;
exports.ShowtimeService = ShowtimeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShowtimeService);
//# sourceMappingURL=showtime.service.js.map