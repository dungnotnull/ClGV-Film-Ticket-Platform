import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { BannerStatus } from '@prisma/client';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  // Admin tạo banner mới
  async create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        title: createBannerDto.title,
        imageUrl: createBannerDto.imageUrl,
        linkUrl: createBannerDto.linkUrl,
        displayOrder: createBannerDto.displayOrder || 0,
        status: createBannerDto.status || BannerStatus.ACTIVE,
      },
    });
  }

  // Lấy danh sách banner active
  async findActive() {
    return this.prisma.banner.findMany({
      where: { status: BannerStatus.ACTIVE },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // Admin lấy tất cả banner
  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  // Admin xóa banner
  async remove(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Banner không tồn tại',
      });
    }

    return this.prisma.banner.delete({ where: { id } });
  }
}
