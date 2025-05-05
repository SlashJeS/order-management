/// <reference types="jest" />
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Mock localStorage with simple functions
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

// Setup global localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Create a test pool with a single connection to avoid deadlocks
export const testPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'order_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 1, // Use a single connection to avoid deadlocks
  idleTimeoutMillis: 0, // Disable idle timeout
  connectionTimeoutMillis: 5000, // 5 second timeout
  allowExitOnIdle: true // Allow the pool to close when idle
});

// Track active clients
let activeClients: any[] = [];
let poolEnded = false;

// Helper function to get a client with retry
async function getClient(retries = 3, delay = 1000) {
  if (poolEnded) {
    throw new Error('Pool has been ended');
  }

  for (let i = 0; i < retries; i++) {
    try {
      const client = await testPool.connect();
      activeClients.push(client);
      return client;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Failed to connect to database after retries');
}

// Helper function to release a client
function releaseClient(client: any) {
  const index = activeClients.indexOf(client);
  if (index > -1) {
    activeClients.splice(index, 1);
  }
  client.release();
}

// Helper function to release all clients
async function releaseAllClients() {
  for (const client of activeClients) {
    try {
      await client.query('ROLLBACK');
    } catch (error) {
      // Ignore rollback errors
    }
    client.release();
  }
  activeClients = [];
}

export async function setupTestDatabase() {
  const client = await getClient();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Drop existing tables if they exist
    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
    `);

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await client.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Commit transaction
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    releaseClient(client);
  }
}

export async function cleanupTestData() {
  const client = await getClient();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Delete all data from tables in correct order
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM users');

    // Commit transaction
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cleaning up test data:', error);
    throw error;
  } finally {
    releaseClient(client);
  }
}

export async function teardownTestDatabase() {
  const client = await getClient();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
    `);

    // Commit transaction
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error tearing down test database:', error);
    throw error;
  } finally {
    releaseClient(client);
  }
}

// Cleanup function to be called after all tests
export async function cleanup() {
  if (!poolEnded) {
    await releaseAllClients();
    await testPool.end();
    poolEnded = true;
  }
} 