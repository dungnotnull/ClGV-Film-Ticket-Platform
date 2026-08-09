import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFileType {
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private configService: ConfigService) {
    // Đảm bảo thư mục uploads tồn tại khi khởi động service
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Xử lý lưu tập tin ảnh được upload
  async handleFileUpload(file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'Vui lòng chọn tập tin ảnh để tải lên',
      });
    }

    // Tự động kiểm tra định dạng ảnh hợp lệ
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        code: 'INVALID_FILE_TYPE',
        message: 'Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF',
      });
    }

    // Tạo tên file duy nhất tránh trùng lặp
    const fileExt = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join(this.uploadDir, filename);

    // Ghi tập tin vào ổ đĩa
    await fs.promises.writeFile(filePath, file.buffer);

    // Trả về đường dẫn truy cập công khai
    const port = this.configService.get<number>('PORT') || 4000;
    const fileUrl = `http://localhost:${port}/uploads/${filename}`;

    return {
      url: fileUrl,
      filename,
      originalName: file.originalname || filename,
      mimeType: file.mimetype || 'image/jpeg',
      size: file.size || file.buffer.length,
    };
  }
}
