import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
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

    // Kiểm tra không cho phép trùng tên rạp chiếu trong hệ thống
    const existingCinema = await this.prisma.cinema.findFirst({
      where: {
        name: { equals: createCinemaDto.name.trim(), mode: 'insensitive' },
      },
    });

    if (existingCinema) {
      throw new ConflictException({
        code: 'DUPLICATE_CINEMA_NAME',
        message: 'Tên cụm rạp đã tồn tại trong hệ thống',
      });
    }

    return this.prisma.cinema.create({
      data: {
        cityId: createCinemaDto.cityId,
        name: createCinemaDto.name.trim(),
        address: createCinemaDto.address,
        phone: createCinemaDto.phone,
        amenities: createCinemaDto.amenities || [],
      },
    });
  }

  // Admin cập nhật thông tin cụm rạp
  async updateCinema(id: string, updateCinemaDto: UpdateCinemaDto) {
    const existingCinema = await this.findOneCinema(id);

    if (updateCinemaDto.cityId) {
      const city = await this.prisma.city.findUnique({
        where: { id: updateCinemaDto.cityId },
      });
      if (!city) {
        throw new NotFoundException({
          code: 'CITY_NOT_FOUND',
          message: 'Thành phố được chọn không tồn tại',
        });
      }
    }

    if (updateCinemaDto.name && updateCinemaDto.name.trim() !== existingCinema.name) {
      const duplicateCinema = await this.prisma.cinema.findFirst({
        where: {
          id: { not: id },
          name: { equals: updateCinemaDto.name.trim(), mode: 'insensitive' },
        },
      });

      if (duplicateCinema) {
        throw new ConflictException({
          code: 'DUPLICATE_CINEMA_NAME',
          message: 'Tên cụm rạp đã tồn tại trong hệ thống',
        });
      }
    }

    return this.prisma.cinema.update({
      where: { id },
      data: {
        ...(updateCinemaDto.cityId && { cityId: updateCinemaDto.cityId }),
        ...(updateCinemaDto.name && { name: updateCinemaDto.name.trim() }),
        ...(updateCinemaDto.address && { address: updateCinemaDto.address }),
        ...(updateCinemaDto.phone !== undefined && { phone: updateCinemaDto.phone }),
        ...(updateCinemaDto.amenities && { amenities: updateCinemaDto.amenities }),
      },
    });
  }

  // Admin xóa cụm rạp
  async deleteCinema(id: string) {
    await this.findOneCinema(id);

    await this.prisma.cinema.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Xóa cụm rạp thành công',
    };
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

    // Kiểm tra không cho phép trùng tên phòng chiếu trong cùng 1 rạp
    const existingHall = await this.prisma.hall.findFirst({
      where: {
        cinemaId: createHallDto.cinemaId,
        name: { equals: createHallDto.name.trim(), mode: 'insensitive' },
      },
    });

    if (existingHall) {
      throw new ConflictException({
        code: 'DUPLICATE_HALL_NAME',
        message: 'Tên phòng chiếu đã tồn tại trong rạp này',
      });
    }

    return this.prisma.hall.create({
      data: {
        cinemaId: createHallDto.cinemaId,
        name: createHallDto.name.trim(),
        screenType: createHallDto.screenType,
        roomMatrix: createHallDto.roomMatrix,
      },
    });
  }

  // Admin xóa phòng chiếu (Hall)
  async deleteHall(hallId: string) {
    const hall = await this.prisma.hall.findUnique({
      where: { id: hallId },
    });

    if (!hall) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Phòng chiếu không tồn tại',
      });
    }

    await this.prisma.hall.delete({
      where: { id: hallId },
    });

    return {
      success: true,
      message: 'Xóa phòng chiếu thành công',
    };
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

