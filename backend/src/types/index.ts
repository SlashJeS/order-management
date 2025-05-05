import { Request } from 'express';

// Base interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

// Express type declarations
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Custom request types
export type AuthenticatedRequest = Request & {
  user: User;
}; 