import { Request } from 'express';
import { User } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
      };
    }
  }
}

export interface CustomRequest extends Request {
  user?: User;
} 