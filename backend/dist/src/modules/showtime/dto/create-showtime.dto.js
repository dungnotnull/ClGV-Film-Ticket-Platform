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
exports.CreateShowtimeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateShowtimeDto {
}
exports.CreateShowtimeDto = CreateShowtimeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Movie ID không được để trống' }),
    __metadata("design:type", String)
], CreateShowtimeDto.prototype, "movieId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID cụm rạp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Cinema ID không được để trống' }),
    __metadata("design:type", String)
], CreateShowtimeDto.prototype, "cinemaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phòng chiếu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Hall ID không được để trống' }),
    __metadata("design:type", String)
], CreateShowtimeDto.prototype, "hallId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-10T14:00:00Z', description: 'Thời gian bắt đầu' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateShowtimeDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-10T16:15:00Z', description: 'Thời gian kết thúc' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateShowtimeDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120000, description: 'Giá vé cơ bản (VND Integer)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: 'Giá vé phải lớn hơn hoặc bằng 0' }),
    __metadata("design:type", Number)
], CreateShowtimeDto.prototype, "basePrice", void 0);
//# sourceMappingURL=create-showtime.dto.js.map