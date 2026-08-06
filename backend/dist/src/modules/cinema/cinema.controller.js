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
exports.CinemaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const cinema_service_1 = require("./cinema.service");
const create_cinema_dto_1 = require("./dto/create-cinema.dto");
const create_hall_dto_1 = require("./dto/create-hall.dto");
const update_matrix_dto_1 = require("./dto/update-matrix.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CinemaController = class CinemaController {
    constructor(cinemaService) {
        this.cinemaService = cinemaService;
    }
    async findAllCinemas(cityId) {
        return this.cinemaService.findAllCinemas(cityId);
    }
    async findOneCinema(id) {
        return this.cinemaService.findOneCinema(id);
    }
    async createCinema(createCinemaDto) {
        return this.cinemaService.createCinema(createCinemaDto);
    }
    async createHall(createHallDto) {
        return this.cinemaService.createHall(createHallDto);
    }
    async getHallMatrix(id) {
        return this.cinemaService.getHallMatrix(id);
    }
    async updateHallMatrix(id, updateMatrixDto) {
        return this.cinemaService.updateHallMatrix(id, updateMatrixDto);
    }
};
exports.CinemaController = CinemaController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách các cụm rạp (có thể lọc theo thành phố)' }),
    (0, swagger_1.ApiQuery)({ name: 'cityId', required: false, description: 'ID thành phố' }),
    (0, common_1.Get)('cinemas'),
    __param(0, (0, common_1.Query)('cityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CinemaController.prototype, "findAllCinemas", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin chi tiết cụm rạp' }),
    (0, common_1.Get)('cinemas/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CinemaController.prototype, "findOneCinema", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin tạo mới cụm rạp' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('cinemas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cinema_dto_1.CreateCinemaDto]),
    __metadata("design:returntype", Promise)
], CinemaController.prototype, "createCinema", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin tạo mới phòng chiếu' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('halls'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_hall_dto_1.CreateHallDto]),
    __metadata("design:returntype", Promise)
], CinemaController.prototype, "createHall", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy sơ đồ ma trận ghế của phòng chiếu' }),
    (0, common_1.Get)('halls/:id/matrix'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CinemaController.prototype, "getHallMatrix", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin cập nhật sơ đồ ma trận ghế động' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Put)('halls/:id/matrix'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_matrix_dto_1.UpdateMatrixDto]),
    __metadata("design:returntype", Promise)
], CinemaController.prototype, "updateHallMatrix", null);
exports.CinemaController = CinemaController = __decorate([
    (0, swagger_1.ApiTags)('Cinemas & Halls'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [cinema_service_1.CinemaService])
], CinemaController);
//# sourceMappingURL=cinema.controller.js.map