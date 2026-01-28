import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AuthRequest } from '../auth/types/auth-request.type';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  add(@Req() req: AuthRequest, @Body('productId') productId: string) {
    return this.cartService.addItem(req.user.userId, productId);
  }

  @Get()
  get(@Req() req: AuthRequest) {
    return this.cartService.getCart(req.user.userId);
  }
}
