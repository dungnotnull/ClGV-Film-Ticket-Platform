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
exports.CityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CityService = class CityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCityDto) {
        const existing = await this.prisma.city.findUnique({
            where: { code: createCityDto.code.toUpperCase() },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'CITY_CODE_EXISTS',
                message: `Mã code thành phố ${createCityDto.code} đã tồn tại`,
            });
        }
        return this.prisma.city.create({
            data: {
                name: createCityDto.name,
                code: createCityDto.code.toUpperCase(),
                displayOrder: createCityDto.displayOrder || 0,
            },
        });
    }
    async findAll() {
        const cities = await this.prisma.city.findMany({
            orderBy: { displayOrder: 'asc' },
            include: {
                _count: {
                    select: { cinemas: true },
                },
            },
        });
        return cities.map((city) => ({
            id: city.id,
            name: city.name,
            code: city.code,
            displayOrder: city.displayOrder,
            cinemaCount: city._count.cinemas,
        }));
    }
    async findOne(id) {
        const city = await this.prisma.city.findUnique({
            where: { id },
            include: { cinemas: true },
        });
        if (!city) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Thành phố không tồn tại',
            });
        }
        return city;
    }
    async update(id, updateCityDto) {
        await this.findOne(id);
        return this.prisma.city.update({
            where: { id },
            data: {
                ...(updateCityDto.name && { name: updateCityDto.name }),
                ...(updateCityDto.code && { code: updateCityDto.code.toUpperCase() }),
                ...(updateCityDto.displayOrder !== undefined && { displayOrder: updateCityDto.displayOrder }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.city.delete({
            where: { id },
        });
    }
};
exports.CityService = CityService;
exports.CityService = CityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CityService);
//# sourceMappingURL=city.service.js.map