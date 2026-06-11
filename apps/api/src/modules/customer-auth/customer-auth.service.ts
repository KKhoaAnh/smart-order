import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '../../database/entities/customer.entity';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/customer-auth.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    let customer = await this.customerRepo.findOne({
      where: { phone: dto.phone },
    });

    if (!customer) {
      customer = this.customerRepo.create(dto);
      customer = await this.customerRepo.save(customer);
    }

    const payload = {
      sub: customer.id,
      phone: customer.phone,
      type: 'customer',
    };

    return {
      access_token: this.jwtService.sign(payload),
      customer,
    };
  }

  async login(dto: LoginDto) {
    const customer = await this.customerRepo.findOne({
      where: { phone: dto.phone },
    });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng với số điện thoại này');
    }

    const payload = {
      sub: customer.id,
      phone: customer.phone,
      type: 'customer',
    };

    return {
      access_token: this.jwtService.sign(payload),
      customer,
    };
  }

  async getProfile(customerId: number) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return customer;
  }

  async updateProfile(customerId: number, dto: UpdateProfileDto) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    customer.name = dto.name;
    return this.customerRepo.save(customer);
  }
}
