import { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { AuthenticatedRequest } from '../types';

const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
});

export class OrderController {
  async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const { product_id, quantity } = validatedData;

      // Get product price and check stock
      const productResult = await pool.query(
        'SELECT price, stock FROM products WHERE id = $1',
        [product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const product = productResult.rows[0];

      // Check if enough stock is available
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      const total_price = product.price * quantity;

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if user has enough balance
        const userResult = await client.query(
          'SELECT balance FROM users WHERE id = $1',
          [req.user.id]
        );

        if (userResult.rows[0].balance < total_price) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create order
        const orderResult = await client.query(
          'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
          [req.user.id, product_id, quantity, total_price]
        );

        // Update product stock
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [quantity, product_id]
        );

        // Update user balance
        await client.query(
          'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING id, name, email, balance',
          [total_price, req.user.id]
        );

        await client.query('COMMIT');

        // Get updated user data
        const updatedUserResult = await client.query(
          'SELECT id, name, email, balance FROM users WHERE id = $1',
          [req.user.id]
        );

        res.status(201).json({
          order: orderResult.rows[0],
          user: updatedUserResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT 
          o.id, 
          p.name as product_name, 
          o.quantity, 
          CAST(o.total_price AS FLOAT) as total_price
         FROM orders o
         JOIN products p ON o.product_id = p.id
         WHERE o.user_id = $1
         ORDER BY o.id DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 