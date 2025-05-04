import db from '../database/connection';
import { Product } from './product';
import { User } from './user';

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface OrderInput {
  user_id: number;
  product_id: number;
  quantity: number;
}

export const OrderModel = {
  async create(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const [newOrder] = await db('orders').insert(order).returning('*');
    return newOrder;
  },

  async findByUserId(userId: number): Promise<Order[]> {
    return db('orders')
      .join('products', 'orders.product_id', 'products.id')
      .select(
        'orders.id',
        'products.name as product_name',
        'orders.quantity',
        'orders.total_price',
        'orders.created_at'
      )
      .where('orders.user_id', userId)
      .orderBy('orders.created_at', 'desc');
  },

  async findById(id: number): Promise<Order | undefined> {
    return db('orders').where({ id }).first();
  },

  async updateStatus(id: number, status: Order['status']): Promise<Order> {
    const [updatedOrder] = await db('orders')
      .where({ id })
      .update({ status })
      .returning('*');
    return updatedOrder;
  },
}; 