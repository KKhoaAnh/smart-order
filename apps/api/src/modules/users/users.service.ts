import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  /**
   * Lấy tất cả users thuộc store (ẩn password_hash)
   */
  async findByStore(storeId: number) {
    const users = await this.userRepo.find({
      where: { store_id: storeId },
      relations: ['roles'],
      order: { created_at: 'DESC' },
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      full_name: u.full_name,
      phone: u.phone,
      is_active: u.is_active,
      store_id: u.store_id,
      roles: u.roles.map((r) => r.role_name),
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));
  }

  /**
   * Tạo nhân viên mới
   */
  async create(storeId: number, dto: CreateUserDto) {
    // Kiểm tra username trùng
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Validate roles
    const roles = await this.resolveRoles(dto.roles);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Tạo user
    const user = new User();
    user.store_id = storeId;
    user.username = dto.username;
    user.password_hash = passwordHash;
    user.full_name = dto.full_name;
    user.phone = dto.phone || '';
    user.is_active = true;
    user.roles = roles;

    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      username: saved.username,
      full_name: saved.full_name,
      phone: saved.phone,
      is_active: saved.is_active,
      store_id: saved.store_id,
      roles: saved.roles.map((r) => r.role_name),
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    };
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  async update(userId: number, storeId: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, store_id: storeId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    // Cập nhật info
    if (dto.full_name !== undefined) user.full_name = dto.full_name;
    if (dto.phone !== undefined) user.phone = dto.phone || '';

    // Cập nhật password nếu có
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(dto.password, salt);
    }

    // Cập nhật roles nếu có
    if (dto.roles) {
      user.roles = await this.resolveRoles(dto.roles);
    }

    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      username: saved.username,
      full_name: saved.full_name,
      phone: saved.phone,
      is_active: saved.is_active,
      store_id: saved.store_id,
      roles: saved.roles.map((r) => r.role_name),
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    };
  }

  /**
   * Bật/tắt trạng thái active
   */
  async toggleActive(userId: number, storeId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId, store_id: storeId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    user.is_active = !user.is_active;
    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      username: saved.username,
      full_name: saved.full_name,
      is_active: saved.is_active,
      roles: saved.roles.map((r) => r.role_name),
    };
  }

  /**
   * Resolve role names → Role entities
   */
  private async resolveRoles(roleNames: string[]): Promise<Role[]> {
    if (!roleNames || roleNames.length === 0) {
      throw new BadRequestException('Phải chọn ít nhất 1 vai trò');
    }

    const roles = await this.roleRepo.find({
      where: { role_name: In(roleNames) },
    });

    if (roles.length !== roleNames.length) {
      const found = roles.map((r) => r.role_name);
      const missing = roleNames.filter((n) => !found.includes(n));
      throw new BadRequestException(`Vai trò không hợp lệ: ${missing.join(', ')}`);
    }

    return roles;
  }
}
