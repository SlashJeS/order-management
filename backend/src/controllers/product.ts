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

  async createProduct(req: Request, res: Response) {
    try {
      const { name, price, stock } = req.body;

      if (!name || !price || !stock) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const result = await pool.query(
        'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING id, name, price, stock',
        [name, price, stock]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 