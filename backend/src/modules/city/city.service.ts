import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  // Admin tạo địa điểm/thành phố mới
  async create(createCityDto: CreateCityDto) {
    const existing = await this.prisma.city.findUnique({
      where: { code: createCityDto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException({
        code: 'CITY_CODE_EXISTS',
        message: `Mã code thành phố ${createCityDto.code} đã tồn tại`,
      });
    }

    return this.prisma.city.create({
      data: {
        name: createCityDto.name,
        code: createCityDto.code.toUpperCase(),
        displayOrder: createCityDto.displayOrder || 0,
      },
    });
  }

  // Lấy danh sách thành phố kèm số lượng rạp
  async findAll() {
    const cities = await this.prisma.city.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { cinemas: true },
        },
      },
    });

    return cities.map((city) => ({
      id: city.id,
      name: city.name,
      code: city.code,
      displayOrder: city.displayOrder,
      cinemaCount: city._count.cinemas,
    }));
  }

  // Lấy chi tiết thành phố theo ID
  async findOne(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: { cinemas: true },
    });

    if (!city) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Thành phố không tồn tại',
      });
    }

    return city;
  }

  // Admin cập nhật thành phố
  async update(id: string, updateCityDto: UpdateCityDto) {
    await this.findOne(id);

    return this.prisma.city.update({
      where: { id },
      data: {
        ...(updateCityDto.name && { name: updateCityDto.name }),
        ...(updateCityDto.code && { code: updateCityDto.code.toUpperCase() }),
        ...(updateCityDto.displayOrder !== undefined && { displayOrder: updateCityDto.displayOrder }),
      },
    });
  }

  // Admin xóa thành phố
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.city.delete({
      where: { id },
    });
  }
}
