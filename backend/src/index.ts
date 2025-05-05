import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthController } from './controllers/auth';
import { OrderController } from './controllers/order';
import { ProductController } from './controllers/product';
import { verifyToken } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limit';
import { pool } from './db';
import { User } from './models/user';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(rateLimiter);

// Controllers
const authController = new AuthController();
const orderController = new OrderController();
const productController = new ProductController();

// Routes
app.post('/api/auth/register', (req: Request, res: Response) => authController.register(req, res));
app.post('/api/auth/login', (req: Request, res: Response) => authController.login(req, res));
app.get('/api/auth/me', verifyToken, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// Protected routes
app.post('/api/orders', verifyToken, (req: Request, res: Response) => orderController.createOrder(req as any, res));
app.get('/api/orders', verifyToken, (req: Request, res: Response) => orderController.getUserOrders(req as any, res));

// Product routes
app.get('/api/products', verifyToken, (req: Request, res: Response) => productController.getAllProducts(req, res));
app.post('/api/products', verifyToken, (req: Request, res: Response) => productController.createProduct(req, res));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize database connection
if (process.env.NODE_ENV !== 'test') {
  pool.connect()
    .then(() => {
      console.log('Connected to PostgreSQL database');
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error('Error connecting to database:', err);
      process.exit(1);
    });
}

export default app; 