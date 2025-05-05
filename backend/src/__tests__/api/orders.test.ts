import request from 'supertest';
import { testPool, setupTestDatabase, cleanupTestData } from '../setup';
import app from '../../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jest, describe, beforeAll, afterEach, afterAll, beforeEach, it, expect } from '@jest/globals';

// Disable rate limiting for tests
jest.mock('../../middleware/rate-limit', () => ({
  rateLimiter: (req: any, res: any, next: any) => next(),
}));

describe('Orders API', () => {
  let token: string;
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const productId = '123e4567-e89b-12d3-a456-426614174001';

  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    // Clean up existing data
    await cleanupTestData();

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await testPool.query(
      'INSERT INTO users (id, name, email, password, balance) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'Test User', 'test@example.com', hashedPassword, 100.00]
    );

    // Verify user exists
    const userCheck = await testPool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    expect(userCheck.rows.length).toBe(1);

    // Generate JWT token
    token = jwt.sign({ userId: userId }, process.env.JWT_SECRET || 'your-secret-key');

    // Create a test product
    await testPool.query(
      'INSERT INTO products (id, name, price, stock) VALUES ($1, $2, $3, $4)',
      [productId, 'Test Product', 10.00, 5]
    );

    // Verify product exists
    const productCheck = await testPool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    expect(productCheck.rows.length).toBe(1);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await testPool.end();
  });

  describe('POST /api/orders', () => {
    it('should create an order successfully', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: productId,
          quantity: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order.quantity).toBe(2);
      expect(parseFloat(response.body.order.total_price)).toBe(20.00);
    });

    it('should handle insufficient balance', async () => {
      // Update user balance to be too low
      await testPool.query(
        'UPDATE users SET balance = $1 WHERE id = $2',
        [5.00, userId]
      );

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: productId,
          quantity: 2,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Insufficient balance');
    });

    it('should handle out of stock products', async () => {
      // Update product stock to be too low
      await testPool.query(
        'UPDATE products SET stock = $1 WHERE id = $2',
        [1, productId]
      );

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: productId,
          quantity: 2,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Not enough stock available');
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      // Create a test order first
      await testPool.query(
        'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
        [userId, productId, 2, 20.00]
      );

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('product_name');
      expect(response.body[0]).toHaveProperty('quantity');
      expect(response.body[0]).toHaveProperty('total_price');
    });
  });
}); 