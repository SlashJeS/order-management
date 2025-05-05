import { pool } from './index';
import bcrypt from 'bcryptjs';

const products = [
  {
    name: 'Laptop Pro X1',
    price: 10.53,
    stock: 50
  },
  {
    name: 'Wireless Mouse',
    price: 20,
    stock: 100
  },
  {
    name: '4K Monitor',
    price: 30,
    stock: 30
  },
  {
    name: 'Mechanical Keyboard',
    price: 5,
    stock: 75
  },
  {
    name: 'Gaming Headset',
    price: 1.50,
    stock: 60
  },
  {
    name: 'USB-C Hub',
    price: 2,
    stock: 10
  },
  {
    name: 'External SSD',
    price: 50,
    stock: 1
  },
  {
    name: 'Webcam HD',
    price: 3,
    stock: 15
  }
];

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    balance: 100
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    balance: 500
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await pool.query('TRUNCATE orders, products, users CASCADE');
    console.log('Cleared existing data');

    // Insert users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(`
        INSERT INTO users (name, email, password, balance)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `, [user.name, user.email, hashedPassword, user.balance]);
    }
    console.log('Successfully seeded users');

    // Insert products
    for (const product of products) {
      await pool.query(`
        INSERT INTO products (name, price, stock)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [product.name, product.price, product.stock]);
    }
    console.log('Successfully seeded products');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }); 