import { OrderController } from '../../controllers/order';
import { testPool, setupTestDatabase, cleanupTestData } from '../setup';
import { v4 as uuidv4 } from 'uuid';
import { jest, describe, beforeAll, afterEach, afterAll, beforeEach, it, expect } from '@jest/globals';

describe('OrderController', () => {
  const userId = uuidv4();
  const productId = uuidv4();
  let orderController: OrderController;
  let mockReq: any;
  let mockRes: any;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    // Clean up and wait for completion
    await cleanupTestData();

    // Insert test user and product in a transaction
    const client = await testPool.connect();
    try {
      await client.query('BEGIN');

      // Insert test user
      await client.query(
        'INSERT INTO users (id, name, email, password, balance) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'Test User', `test-${userId}@example.com`, 'password', 100.00]
      );

      // Insert test product
      await client.query(
        'INSERT INTO products (id, name, price, stock) VALUES ($1, $2, $3, $4)',
        [productId, 'Test Product', 10.00, 5]
      );

      await client.query('COMMIT');

      // Verify data was inserted
      const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userCheck.rows.length !== 1) {
        throw new Error('User not inserted properly');
      }

      const productCheck = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
      if (productCheck.rows.length !== 1) {
        throw new Error('Product not inserted properly');
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    orderController = new OrderController();

    // Set up mock request and response
    mockReq = {
      body: {
        product_id: productId,
        quantity: 1
      },
      user: {
        id: userId,
        balance: 100.00
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await testPool.end();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            user_id: userId,
            product_id: productId,
            quantity: 1,
            total_price: '10.00'
          })
        })
      );
    });

    it('should handle insufficient balance', async () => {
      // Update user balance to be insufficient
      const client = await testPool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'UPDATE users SET balance = $1 WHERE id = $2',
          [5.00, userId]
        );

        // Verify user exists and balance was updated
        const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length !== 1) {
          throw new Error('User not found');
        }
        if (parseFloat(userCheck.rows[0].balance) !== 5.00) {
          throw new Error('Balance not updated properly');
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      mockReq.user.balance = 5.00;

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Insufficient balance'
      });
    });

    it('should handle out of stock', async () => {
      // First verify product exists
      const client = await testPool.connect();
      try {
        const productCheck = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productCheck.rows.length !== 1) {
          throw new Error('Product not found');
        }
      } finally {
        client.release();
      }

      mockReq.body.quantity = 10;

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not enough stock available'
      });
    });
  });

  describe('getUserOrders', () => {
    it('should get user orders', async () => {
      // Insert test order in a transaction
      const client = await testPool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
          [userId, productId, 2, 20.00]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      await orderController.getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: userId,
            product_id: productId,
            quantity: 2,
            total_price: '20.00',
            product_name: 'Test Product'
          })
        ])
      );
    });
  });
}); 