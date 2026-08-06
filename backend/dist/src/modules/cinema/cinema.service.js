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
        return this.prisma.cinema.create({
            data: {
                cityId: createCinemaDto.cityId,
                name: createCinemaDto.name,
                address: createCinemaDto.address,
                phone: createCinemaDto.phone,
                amenities: createCinemaDto.amenities || [],
            },
        });
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
        return this.prisma.hall.create({
            data: {
                cinemaId: createHallDto.cinemaId,
                name: createHallDto.name,
                screenType: createHallDto.screenType,
                roomMatrix: createHallDto.roomMatrix,
            },
        });
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