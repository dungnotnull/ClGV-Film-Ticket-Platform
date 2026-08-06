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
exports.CreateCinemaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCinemaDto {
}
exports.CreateCinemaDto = CreateCinemaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'city_hcm', description: 'ID thành phố' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'City ID không được để trống' }),
    __metadata("design:type", String)
], CreateCinemaDto.prototype, "cityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CGV Vincom Đồng Khởi', description: 'Tên cụm rạp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên cụm rạp không được để trống' }),
    __metadata("design:type", String)
], CreateCinemaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '72 Lê Thánh Tôn, Q.1, TP.HCM', description: 'Địa chỉ cụm rạp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Địa chỉ không được để trống' }),
    __metadata("design:type", String)
], CreateCinemaDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1900 6017', description: 'Số điện thoại liên hệ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCinemaDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['Bãi đậu xe', 'Popcorn Bar', 'L\'Amour'], description: 'Danh sách tiện ích' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCinemaDto.prototype, "amenities", void 0);
//# sourceMappingURL=create-cinema.dto.js.map