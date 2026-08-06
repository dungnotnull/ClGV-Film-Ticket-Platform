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
exports.HomeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let HomeService = class HomeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomePageData(cityId) {
        const [banners, nowShowingMovies, comingSoonMovies, cities, featuredCinemas] = await Promise.all([
            this.prisma.banner.findMany({
                where: { status: client_1.BannerStatus.ACTIVE },
                orderBy: { displayOrder: 'asc' },
            }),
            this.prisma.movie.findMany({
                where: { status: client_1.MovieStatus.NOW_SHOWING },
                orderBy: { releaseDate: 'desc' },
                take: 10,
            }),
            this.prisma.movie.findMany({
                where: { status: client_1.MovieStatus.COMING_SOON },
                orderBy: { releaseDate: 'asc' },
                take: 10,
            }),
            this.prisma.city.findMany({
                orderBy: { displayOrder: 'asc' },
                include: {
                    _count: { select: { cinemas: true } },
                },
            }),
            this.prisma.cinema.findMany({
                where: {
                    ...(cityId && { cityId }),
                },
                include: {
                    city: true,
                    halls: { select: { id: true, name: true, screenType: true } },
                },
                take: 12,
            }),
        ]);
        return {
            banners,
            movies: {
                nowShowing: nowShowingMovies,
                comingSoon: comingSoonMovies,
            },
            cities: cities.map((c) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                cinemaCount: c._count.cinemas,
            })),
            featuredCinemas,
        };
    }
};
exports.HomeService = HomeService;
exports.HomeService = HomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomeService);
//# sourceMappingURL=home.service.js.map