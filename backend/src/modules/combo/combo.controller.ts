import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComboService } from './combo.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('F&B Combos')
@Controller()
export class ComboController {
  constructor(private readonly comboService: ComboService) {}

  @Get('combos')
  @ApiOperation({ summary: 'Lấy danh sách bắp nước & combo CGV' })
  async getCombos() {
    return this.comboService.getAllActiveCombos();
  }

  @Post('admin/combos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo mới bắp nước combo' })
  async createCombo(@Body() dto: CreateComboDto) {
    return this.comboService.createCombo(dto);
  }

  @Put('admin/combos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật bắp nước combo' })
  async updateCombo(@Param('id') id: string, @Body() dto: Partial<CreateComboDto>) {
    return this.comboService.updateCombo(id, dto);
  }

  @Delete('admin/combos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa bắp nước combo' })
  async deleteCombo(@Param('id') id: string) {
    return this.comboService.deleteCombo(id);
  }
}
