import { User } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: User;
};

export {}; 