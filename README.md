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

## Testing

### Backend Tests

The backend uses Jest for testing. Tests are organized into three categories:

1. **API Tests** (`src/__tests__/api/`): Integration tests for API endpoints
2. **Controller Tests** (`src/__tests__/controllers/`): Unit tests for controllers
3. **Transaction Tests** (`src/__tests__/transactions/`): Unit tests for database transactions

To run the backend tests:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run all tests:
```bash
npm test
```

3. Run tests with coverage:
```bash
npm run test:coverage
```

4. Run specific test files:
```bash
npm test -- src/__tests__/api/orders.test.ts
```

### Frontend Tests

The frontend uses Jest for testing with React Testing Library. Tests are located in the `src/__tests__` directory and include:

- Component tests
- Context tests
- Integration tests
- Mock implementations for:
  - Local Storage
  - Intersection Observer
  - Window Match Media
  - Environment Variables

To run the frontend tests:

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Run all tests:
```bash
npm test
```

3. Run tests with coverage:
```bash
npm run test:coverage
```

4. Run tests in watch mode:
```bash
npm test -- --watch
```

### Test Database

The backend tests use a separate test database to avoid affecting the development database. The test database is automatically set up and torn down for each test run.

Make sure your PostgreSQL server is running and accessible with the credentials specified in your `.env` file before running the tests.

### Writing Tests

When writing new tests:

1. Follow the existing test structure and patterns
2. Use descriptive test names that explain the expected behavior
3. Test both success and error cases
4. Clean up test data after each test
5. Use transactions to ensure test isolation

Example test structure:
```typescript
describe('Feature', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Clean up test data
  });

  it('should handle success case', async () => {
    // Test implementation
  });

  it('should handle error case', async () => {
    // Test implementation
  });
});
```
