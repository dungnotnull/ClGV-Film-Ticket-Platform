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
exports.CinemaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CinemaService = class CinemaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCinema(createCinemaDto) {
        const city = await this.prisma.city.findUnique({
            where: { id: createCinemaDto.cityId },
        });
        if (!city) {
            throw new common_1.NotFoundException({
                code: 'CITY_NOT_FOUND',
                message: 'Thành phố được chọn không tồn tại',
            });
        }
        const existingCinema = await this.prisma.cinema.findFirst({
            where: {
                name: { equals: createCinemaDto.name.trim(), mode: 'insensitive' },
            },
        });
        if (existingCinema) {
            throw new common_1.ConflictException({
                code: 'DUPLICATE_CINEMA_NAME',
                message: 'Tên cụm rạp đã tồn tại trong hệ thống',
            });
        }
        return this.prisma.cinema.create({
            data: {
                cityId: createCinemaDto.cityId,
                name: createCinemaDto.name.trim(),
                address: createCinemaDto.address,
                phone: createCinemaDto.phone,
                amenities: createCinemaDto.amenities || [],
            },
        });
    }
    async updateCinema(id, updateCinemaDto) {
        const existingCinema = await this.findOneCinema(id);
        if (updateCinemaDto.cityId) {
            const city = await this.prisma.city.findUnique({
                where: { id: updateCinemaDto.cityId },
            });
            if (!city) {
                throw new common_1.NotFoundException({
                    code: 'CITY_NOT_FOUND',
                    message: 'Thành phố được chọn không tồn tại',
                });
            }
        }
        if (updateCinemaDto.name && updateCinemaDto.name.trim() !== existingCinema.name) {
            const duplicateCinema = await this.prisma.cinema.findFirst({
                where: {
                    id: { not: id },
                    name: { equals: updateCinemaDto.name.trim(), mode: 'insensitive' },
                },
            });
            if (duplicateCinema) {
                throw new common_1.ConflictException({
                    code: 'DUPLICATE_CINEMA_NAME',
                    message: 'Tên cụm rạp đã tồn tại trong hệ thống',
                });
            }
        }
        return this.prisma.cinema.update({
            where: { id },
            data: {
                ...(updateCinemaDto.cityId && { cityId: updateCinemaDto.cityId }),
                ...(updateCinemaDto.name && { name: updateCinemaDto.name.trim() }),
                ...(updateCinemaDto.address && { address: updateCinemaDto.address }),
                ...(updateCinemaDto.phone !== undefined && { phone: updateCinemaDto.phone }),
                ...(updateCinemaDto.amenities && { amenities: updateCinemaDto.amenities }),
            },
        });
    }
    async deleteCinema(id) {
        await this.findOneCinema(id);
        await this.prisma.cinema.delete({
            where: { id },
        });
        return {
            success: true,
            message: 'Xóa cụm rạp thành công',
        };
    }
    async findAllCinemas(cityId) {
        return this.prisma.cinema.findMany({
            where: {
                ...(cityId && { cityId }),
            },
            include: {
                city: true,
                halls: {
                    select: { id: true, name: true, screenType: true },
                },
            },
        });
    }
    async findOneCinema(id) {
        const cinema = await this.prisma.cinema.findUnique({
            where: { id },
            include: {
                city: true,
                halls: true,
            },
        });
        if (!cinema) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Cụm rạp không tồn tại',
            });
        }
        return cinema;
    }
    async createHall(createHallDto) {
        await this.findOneCinema(createHallDto.cinemaId);
        const existingHall = await this.prisma.hall.findFirst({
            where: {
                cinemaId: createHallDto.cinemaId,
                name: { equals: createHallDto.name.trim(), mode: 'insensitive' },
            },
        });
        if (existingHall) {
            throw new common_1.ConflictException({
                code: 'DUPLICATE_HALL_NAME',
                message: 'Tên phòng chiếu đã tồn tại trong rạp này',
            });
        }
        return this.prisma.hall.create({
            data: {
                cinemaId: createHallDto.cinemaId,
                name: createHallDto.name.trim(),
                screenType: createHallDto.screenType,
                roomMatrix: createHallDto.roomMatrix,
            },
        });
    }
    async deleteHall(hallId) {
        const hall = await this.prisma.hall.findUnique({
            where: { id: hallId },
        });
        if (!hall) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Phòng chiếu không tồn tại',
            });
        }
        await this.prisma.hall.delete({
            where: { id: hallId },
        });
        return {
            success: true,
            message: 'Xóa phòng chiếu thành công',
        };
    }
    async getHallMatrix(hallId) {
        const hall = await this.prisma.hall.findUnique({
            where: { id: hallId },
            include: { cinema: true },
        });
        if (!hall) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Phòng chiếu không tồn tại',
            });
        }
        return {
            hallId: hall.id,
            name: hall.name,
            screenType: hall.screenType,
            cinemaName: hall.cinema.name,
            matrix: hall.roomMatrix,
        };
    }
    async updateHallMatrix(hallId, updateMatrixDto) {
        await this.getHallMatrix(hallId);
        return this.prisma.hall.update({
            where: { id: hallId },
            data: {
                roomMatrix: updateMatrixDto.roomMatrix,
            },
        });
    }
};
exports.CinemaService = CinemaService;
exports.CinemaService = CinemaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CinemaService);
//# sourceMappingURL=cinema.service.js.map