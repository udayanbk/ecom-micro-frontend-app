import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokenResponse, UserResponse } from './types/auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthRequest } from './types/auth-request.type';
import { JwtUser } from './types/jwt-user.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokenResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<UserResponse> {
    return this.authService.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthRequest): JwtUser {
    return req.user;
  }

  @Post('google')
  google(@Body('credential') credential: string) {
    return this.authService.googleLogin(credential);
  }
}
