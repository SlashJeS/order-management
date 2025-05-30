import knex from 'knex';
import { config } from 'dotenv';

config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'order_management',
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts',
  },
});

export default db; 