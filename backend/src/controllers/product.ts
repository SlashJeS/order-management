import { Request, Response } from 'express';
import { pool } from '../db';

export class ProductController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const result = await pool.query(
        'SELECT id, name, price, stock FROM products'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 