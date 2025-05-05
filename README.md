# Order Management System

A full-stack order management system built with React, Node.js, and PostgreSQL.

## Project Structure

```
order-management/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main application component
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── db/            # Database configuration and migrations
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript type definitions
│   │   └── app.ts         # Express application setup
│   ├── package.json
│   └── tsconfig.json
│
└── docker-compose.yml       # Docker compose configuration
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Docker and Docker Compose (for containerized setup)

### Frontend Development

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Development

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb order_management
```

2. Run the database initialization script:
```bash
psql -d order_management -f backend/src/db/init.sql
```

## Docker Setup

To run the entire application using Docker Compose:

1. From the project root, run:
```bash
docker-compose up --build
```

This will start:
- Frontend container (http://localhost:5173)
- Backend container (http://localhost:3000)
- PostgreSQL container (localhost:5432)

To stop all containers:
```bash
docker-compose down
```

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user
- GET `/auth/me` - Get current user info

### Products
- GET `/products` - Get all products
- GET `/products/:id` - Get product by ID

### Orders
- POST `/orders` - Create a new order
- GET `/orders` - Get user's orders

## Features

- User authentication and authorization
- Product management
- Order creation with stock validation
- User balance management
- Transaction-based order processing
- Real-time balance updates
- Responsive UI with Tailwind CSS

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - React Query
  - React Router
  - React Toastify

- Backend:
  - Node.js
  - Express
  - TypeScript
  - PostgreSQL
  - JWT Authentication

- Development:
  - Docker
  - Docker Compose
  - Vite
  - ESLint
  - Prettier

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 