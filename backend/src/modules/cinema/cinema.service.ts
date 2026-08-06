import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateMatrixDto } from './dto/update-matrix.dto';

@Injectable()
export class CinemaService {
  constructor(private prisma: PrismaService) {}

  // Admin tạo mới cụm rạp
  async createCinema(createCinemaDto: CreateCinemaDto) {
    const city = await this.prisma.city.findUnique({
      where: { id: createCinemaDto.cityId },
    });

    if (!city) {
      throw new NotFoundException({
        code: 'CITY_NOT_FOUND',
        message: 'Thành phố được chọn không tồn tại',
      });
    }

    return this.prisma.cinema.create({
      data: {
        cityId: createCinemaDto.cityId,
        name: createCinemaDto.name,
        address: createCinemaDto.address,
        phone: createCinemaDto.phone,
        amenities: createCinemaDto.amenities || [],
      },
    });
  }

  // Danh sách cụm rạp lọc theo thành phố
  async findAllCinemas(cityId?: string) {
    return this.prisma.cinema.findMany({
      where: {
        ...(cityId && { cityId }),
      },
      include: {
        city: true,
        halls: {
          select: { id: true, name: true, screenType: true },
        },
      },
    });
  }

  // Chi tiết cụm rạp
  async findOneCinema(id: string) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
      include: {
        city: true,
        halls: true,
      },
    });

    if (!cinema) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Cụm rạp không tồn tại',
      });
    }

    return cinema;
  }

  // Admin tạo phòng chiếu (Hall)
  async createHall(createHallDto: CreateHallDto) {
    await this.findOneCinema(createHallDto.cinemaId);

    return this.prisma.hall.create({
      data: {
        cinemaId: createHallDto.cinemaId,
        name: createHallDto.name,
        screenType: createHallDto.screenType,
        roomMatrix: createHallDto.roomMatrix,
      },
    });
  }

  // Lấy chi tiết ma trận ghế của phòng chiếu
  async getHallMatrix(hallId: string) {
    const hall = await this.prisma.hall.findUnique({
      where: { id: hallId },
      include: { cinema: true },
    });

    if (!hall) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Phòng chiếu không tồn tại',
      });
    }

    return {
      hallId: hall.id,
      name: hall.name,
      screenType: hall.screenType,
      cinemaName: hall.cinema.name,
      matrix: hall.roomMatrix,
    };
  }

  // Admin cập nhật ma trận ghế động
  async updateHallMatrix(hallId: string, updateMatrixDto: UpdateMatrixDto) {
    await this.getHallMatrix(hallId);

    return this.prisma.hall.update({
      where: { id: hallId },
      data: {
        roomMatrix: updateMatrixDto.roomMatrix,
      },
    });
  }
}
