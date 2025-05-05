import { OrderTransaction } from '../../transactions/order';
import { testPool, setupTestDatabase, cleanupTestData } from '../setup';
import { v4 as uuidv4 } from 'uuid';
import { jest, describe, beforeAll, afterEach, afterAll, beforeEach, it, expect } from '@jest/globals';

describe('OrderTransaction', () => {
  const userId = uuidv4();
  const productId = uuidv4();
  let orderTransaction: OrderTransaction;

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
      expect(userCheck.rows.length).toBe(1);

      const productCheck = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
      expect(productCheck.rows.length).toBe(1);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    orderTransaction = new OrderTransaction();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await testPool.end();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const result = await orderTransaction.createOrder({
        userId,
        productId,
        quantity: 1
      });

      expect(result).toEqual(
        expect.objectContaining({
          user_id: userId,
          product_id: productId,
          quantity: 1,
          total_price: '10.00'
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
        expect(userCheck.rows.length).toBe(1);
        expect(parseFloat(userCheck.rows[0].balance)).toBe(5.00);

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      await expect(orderTransaction.createOrder({
        userId,
        productId,
        quantity: 1
      })).rejects.toThrow('Insufficient balance');
    });

    it('should handle out of stock', async () => {
      // First verify product exists
      const client = await testPool.connect();
      try {
        const productCheck = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
        expect(productCheck.rows.length).toBe(1);
      } finally {
        client.release();
      }

      await expect(orderTransaction.createOrder({
        userId,
        productId,
        quantity: 10
      })).rejects.toThrow('Not enough stock available');
    });
  });
}); 