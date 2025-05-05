import { Pool } from 'pg';
import { pool } from '../db';
import { testPool } from '../__tests__/setup';

interface CreateOrderParams {
  userId: string;
  productId: string;
  quantity: number;
}

export class OrderTransaction {
  private pool: Pool;

  constructor(dbPool?: Pool) {
    this.pool = dbPool || (process.env.NODE_ENV === 'test' ? testPool : pool);
  }

  async createOrder({ userId, productId, quantity }: CreateOrderParams) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get product price and check stock
      const productResult = await client.query(
        'SELECT price, stock FROM products WHERE id = $1',
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const { price, stock } = productResult.rows[0];
      if (stock < quantity) {
        throw new Error('Not enough stock available');
      }

      // Check user balance
      const userResult = await client.query(
        'SELECT balance FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const { balance } = userResult.rows[0];
      const totalPrice = price * quantity;

      if (balance < totalPrice) {
        throw new Error('Insufficient balance');
      }

      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, productId, quantity, totalPrice]
      );

      // Update stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [quantity, productId]
      );

      // Update user balance
      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [totalPrice, userId]
      );

      await client.query('COMMIT');
      return orderResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} 