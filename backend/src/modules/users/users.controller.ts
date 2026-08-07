import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserMembershipDto } from './dto/update-user-membership.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin User Management')
@Controller('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Admin lấy danh sách người dùng (hỗ trợ phân trang, lọc theo role, hạng thẻ, tìm kiếm)' })
  @Get()
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @ApiOperation({ summary: 'Admin xem chi tiết thông tin người dùng' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Admin phân quyền người dùng (CUSTOMER, ADMIN, SCANNER)' })
  @Put(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, updateUserRoleDto);
  }

  @ApiOperation({ summary: 'Admin cập nhật hạng hội viên CGV, số điểm thưởng hoặc số dư ví CGV Card' })
  @Put(':id/membership')
  async updateMembership(
    @Param('id') id: string,
    @Body() updateUserMembershipDto: UpdateUserMembershipDto,
  ) {
    return this.usersService.updateMembership(id, updateUserMembershipDto);
  }

  @ApiOperation({ summary: 'Admin xóa tài khoản người dùng' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
