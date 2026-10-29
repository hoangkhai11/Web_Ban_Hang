import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { toUserDto } from '../common/mappers.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async issue(user: { id: number; role: string }) {
    return this.jwt.signAsync({ sub: user.id, role: user.role });
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã được sử dụng');
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        role: 'CUSTOMER', // không bao giờ nhận role từ client
      },
    });
    return { accessToken: await this.issue(user), user: toUserDto(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (dto.admin && user.role !== 'ADMIN') throw new ForbiddenException('Tài khoản không có quyền quản trị');
    return { accessToken: await this.issue(user), user: toUserDto(user) };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return toUserDto(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { fullName: dto.fullName, phone: dto.phone, address: dto.address },
    });
    return toUserDto(user);
  }
}
