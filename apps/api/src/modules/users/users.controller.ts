import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/users — Lấy danh sách nhân viên cùng store */
  @Get()
  async findAll(@CurrentUser('store_id') storeId: number) {
    return this.usersService.findByStore(storeId);
  }

  /** POST /api/users — Tạo nhân viên mới */
  @Post()
  async create(
    @CurrentUser('store_id') storeId: number,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(storeId, dto);
  }

  /** PATCH /api/users/:id — Cập nhật thông tin nhân viên */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('store_id') storeId: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, storeId, dto);
  }

  /** PATCH /api/users/:id/toggle-active — Bật/tắt trạng thái */
  @Patch(':id/toggle-active')
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('store_id') storeId: number,
  ) {
    return this.usersService.toggleActive(id, storeId);
  }
}
