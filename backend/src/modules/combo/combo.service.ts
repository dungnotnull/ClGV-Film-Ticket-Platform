import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComboDto } from './dto/create-combo.dto';

@Injectable()
export class ComboService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllActiveCombos() {
    return this.prisma.combo.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCombo(dto: CreateComboDto) {
    return this.prisma.combo.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        price: dto.price,
        status: 'ACTIVE',
      },
    });
  }

  async updateCombo(id: string, dto: Partial<CreateComboDto>) {
    const existing = await this.prisma.combo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy combo với ID: ${id}`);
    }

    return this.prisma.combo.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteCombo(id: string) {
    const existing = await this.prisma.combo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy combo với ID: ${id}`);
    }

    return this.prisma.combo.delete({ where: { id } });
  }
}
