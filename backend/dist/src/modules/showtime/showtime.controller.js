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
exports.ShowtimeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const showtime_service_1 = require("./showtime.service");
const create_showtime_dto_1 = require("./dto/create-showtime.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ShowtimeController = class ShowtimeController {
    constructor(showtimeService) {
        this.showtimeService = showtimeService;
    }
    async findAll(movieId, cinemaId, date) {
        return this.showtimeService.findAll(movieId, cinemaId, date);
    }
    async getShowtimeSeats(id) {
        return this.showtimeService.getShowtimeSeats(id);
    }
    async create(createShowtimeDto) {
        return this.showtimeService.create(createShowtimeDto);
    }
};
exports.ShowtimeController = ShowtimeController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách các suất chiếu (lọc theo phim, rạp, ngày)' }),
    (0, swagger_1.ApiQuery)({ name: 'movieId', required: false, description: 'ID Phim' }),
    (0, swagger_1.ApiQuery)({ name: 'cinemaId', required: false, description: 'ID Cụm rạp' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Ngày chiếu (YYYY-MM-DD)' }),
    (0, common_1.Get)('showtimes'),
    __param(0, (0, common_1.Query)('movieId')),
    __param(1, (0, common_1.Query)('cinemaId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ShowtimeController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy sơ đồ ma trận ghế và trạng thái thời gian thực của suất chiếu' }),
    (0, common_1.Get)('showtimes/:id/seats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShowtimeController.prototype, "getShowtimeSeats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin tạo mới suất chiếu (kiểm tra trùng lặp lịch chiếu)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('admin/showtimes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_showtime_dto_1.CreateShowtimeDto]),
    __metadata("design:returntype", Promise)
], ShowtimeController.prototype, "create", null);
exports.ShowtimeController = ShowtimeController = __decorate([
    (0, swagger_1.ApiTags)('Showtimes'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [showtime_service_1.ShowtimeService])
], ShowtimeController);
//# sourceMappingURL=showtime.controller.js.map