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
exports.CreateMovieDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateMovieDto {
}
exports.CreateMovieDto = CreateMovieDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mai', description: 'Tiêu đề tiếng Việt' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên phim không được để trống' }),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mai (2024)', description: 'Tên gốc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "titleOriginal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Trấn Thành', description: 'Đạo diễn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "director", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Phương Anh Đào, Tuấn Trần', description: 'Diễn viên' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "cast", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['Tâm lý', 'Tình cảm'], description: 'Danh sách thể loại' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMovieDto.prototype, "genres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 131, description: 'Thời lượng tính theo phút' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMovieDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-02-10T00:00:00Z', description: 'Ngày khởi chiếu' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "releaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://images.cgv.vn/poster/mai.jpg', description: 'Poster URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Poster URL không được để trống' }),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "posterUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://youtube.com/watch?v=123', description: 'Trailer URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "trailerUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.AgeRating, example: client_1.AgeRating.T18, description: 'Phân loại độ tuổi' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AgeRating),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "ageRating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SUB', description: 'Định dạng tiếng: SUB, DUB, THUYT_MINH' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "languageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.MovieStatus, example: client_1.MovieStatus.NOW_SHOWING, description: 'Trạng thái phim' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MovieStatus),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nội dung xoay quanh cuộc đời của Mai...', description: 'Mô tả tóm tắt nội dung phim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mô tả không được để trống' }),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "description", void 0);
//# sourceMappingURL=create-movie.dto.js.map