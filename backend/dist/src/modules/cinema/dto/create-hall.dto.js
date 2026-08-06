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
exports.CreateHallDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateHallDto {
}
exports.CreateHallDto = CreateHallDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID cụm rạp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Cinema ID không được để trống' }),
    __metadata("design:type", String)
], CreateHallDto.prototype, "cinemaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Phòng 01 (IMAX)', description: 'Tên phòng chiếu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên phòng chiếu không được để trống' }),
    __metadata("design:type", String)
], CreateHallDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ScreenType, example: client_1.ScreenType.IMAX, description: 'Loại màn hình' }),
    (0, class_validator_1.IsEnum)(client_1.ScreenType, { message: 'Loại màn hình không hợp lệ' }),
    __metadata("design:type", String)
], CreateHallDto.prototype, "screenType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sơ đồ ma trận ghế JSON' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Cấu trúc ma trận ghế không được để trống' }),
    __metadata("design:type", Object)
], CreateHallDto.prototype, "roomMatrix", void 0);
//# sourceMappingURL=create-hall.dto.js.map