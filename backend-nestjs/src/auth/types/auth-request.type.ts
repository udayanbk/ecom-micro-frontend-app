import { Request } from 'express';
import { JwtUser } from './jwt-user.type';

export interface AuthRequest extends Request {
  user: JwtUser;
}
