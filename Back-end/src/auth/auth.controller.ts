import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto.js';
import { CurrentUser, JwtAuthGuard, type AuthUser } from './guards.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** POST /api/auth/register → { accessToken, user } */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /** POST /api/auth/login → { accessToken, user } */
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** POST /api/auth/logout — JWT không lưu phiên ở server; client xóa token. */
  @Post('logout')
  @HttpCode(200)
  logout() {
    return { message: 'Đã đăng xuất' };
  }

  /** GET /api/auth/me */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  /** PATCH /api/auth/me — cập nhật thông tin cá nhân */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.id, dto);
  }

  /** POST /api/auth/forgot-password (nâng cao) — chưa tích hợp gửi email, không tiết lộ email có tồn tại. */
  @Post('forgot-password')
  @HttpCode(200)
  forgot(@Body() _dto: ForgotPasswordDto) {
    return { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư của bạn.' };
  }
}
