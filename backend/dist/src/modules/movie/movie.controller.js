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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const movie_service_1 = require("./movie.service");
const create_movie_dto_1 = require("./dto/create-movie.dto");
const update_movie_dto_1 = require("./dto/update-movie.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let MovieController = class MovieController {
    constructor(movieService) {
        this.movieService = movieService;
    }
    async findAll(status, genre, search) {
        return this.movieService.findAll(status, genre, search);
    }
    async findOne(id) {
        return this.movieService.findOne(id);
    }
    async create(createMovieDto) {
        return this.movieService.create(createMovieDto);
    }
    async update(id, updateMovieDto) {
        return this.movieService.update(id, updateMovieDto);
    }
    async remove(id) {
        return this.movieService.remove(id);
    }
};
exports.MovieController = MovieController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách phim (lọc theo trạng thái, thể loại, từ khóa)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.MovieStatus, required: false, description: 'Trạng thái phim (NOW_SHOWING, COMING_SOON, SNEAK_SHOW)' }),
    (0, swagger_1.ApiQuery)({ name: 'genre', required: false, description: 'Thể loại phim' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' }),
    (0, common_1.Get)('movies'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('genre')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết thông tin phim theo ID' }),
    (0, common_1.Get)('movies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin tạo mới phim (hiển thị động ngay lên trang chủ)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('admin/movies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_movie_dto_1.CreateMovieDto]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin cập nhật thông tin phim' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Put)('admin/movies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_movie_dto_1.UpdateMovieDto]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin xóa phim' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)('admin/movies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "remove", null);
exports.MovieController = MovieController = __decorate([
    (0, swagger_1.ApiTags)('Movies'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [movie_service_1.MovieService])
], MovieController);
//# sourceMappingURL=movie.controller.js.map