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
exports.MovieService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MovieService = class MovieService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMovieDto) {
        return this.prisma.movie.create({
            data: {
                title: createMovieDto.title,
                titleOriginal: createMovieDto.titleOriginal,
                director: createMovieDto.director,
                cast: createMovieDto.cast,
                genres: createMovieDto.genres || [],
                durationMinutes: createMovieDto.durationMinutes,
                releaseDate: new Date(createMovieDto.releaseDate),
                posterUrl: createMovieDto.posterUrl,
                trailerUrl: createMovieDto.trailerUrl,
                ageRating: createMovieDto.ageRating,
                languageType: createMovieDto.languageType || 'SUB',
                status: createMovieDto.status || client_1.MovieStatus.NOW_SHOWING,
                description: createMovieDto.description,
            },
        });
    }
    async findAll(status, genre, search) {
        return this.prisma.movie.findMany({
            where: {
                ...(status && { status }),
                ...(genre && { genres: { has: genre } }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { director: { contains: search, mode: 'insensitive' } },
                        { cast: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            orderBy: { releaseDate: 'desc' },
        });
    }
    async findOne(id) {
        const movie = await this.prisma.movie.findUnique({
            where: { id },
            include: {
                showtimes: {
                    where: { startTime: { gte: new Date() } },
                    include: {
                        cinema: true,
                        hall: { select: { id: true, name: true, screenType: true } },
                    },
                    orderBy: { startTime: 'asc' },
                },
                reviews: {
                    include: { user: { select: { id: true, fullName: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!movie) {
            throw new common_1.NotFoundException({
                code: 'NOT_FOUND',
                message: 'Phim không tồn tại',
            });
        }
        return movie;
    }
    async update(id, updateMovieDto) {
        await this.findOne(id);
        return this.prisma.movie.update({
            where: { id },
            data: {
                ...(updateMovieDto.title && { title: updateMovieDto.title }),
                ...(updateMovieDto.titleOriginal && { titleOriginal: updateMovieDto.titleOriginal }),
                ...(updateMovieDto.director && { director: updateMovieDto.director }),
                ...(updateMovieDto.cast && { cast: updateMovieDto.cast }),
                ...(updateMovieDto.genres && { genres: updateMovieDto.genres }),
                ...(updateMovieDto.durationMinutes && { durationMinutes: updateMovieDto.durationMinutes }),
                ...(updateMovieDto.releaseDate && { releaseDate: new Date(updateMovieDto.releaseDate) }),
                ...(updateMovieDto.posterUrl && { posterUrl: updateMovieDto.posterUrl }),
                ...(updateMovieDto.trailerUrl && { trailerUrl: updateMovieDto.trailerUrl }),
                ...(updateMovieDto.ageRating && { ageRating: updateMovieDto.ageRating }),
                ...(updateMovieDto.languageType && { languageType: updateMovieDto.languageType }),
                ...(updateMovieDto.status && { status: updateMovieDto.status }),
                ...(updateMovieDto.description && { description: updateMovieDto.description }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.movie.delete({
            where: { id },
        });
    }
};
exports.MovieService = MovieService;
exports.MovieService = MovieService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MovieService);
//# sourceMappingURL=movie.service.js.map