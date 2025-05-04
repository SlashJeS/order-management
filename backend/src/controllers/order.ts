import { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { ProductModel } from '../models/product';

const createOrderSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
});

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const { product_id, quantity } = validatedData;

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get product price
      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const total_price = product.price * quantity;

      // Create order
      const result = await pool.query(
        'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, product_id, quantity, total_price]
      );

      // Update product stock
      await ProductModel.updateStock(product_id, quantity);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await pool.query(
        `SELECT o.id, p.name as product_name, o.quantity, o.total_price, o.created_at
         FROM orders o
         JOIN products p ON o.product_id = p.id
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 