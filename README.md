# Order Management System

A full-stack application for managing orders, built with Node.js, Express, PostgreSQL, and React.

## Features

- User authentication (register/login)
- Product management
- Order creation and tracking
- Real-time order status updates
- Responsive design

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Knex.js
- JWT authentication
- Docker

### Frontend
- React with TypeScript
- Vite
- React Query
- React Router
- Tailwind CSS
- Docker

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SlashJeS/order-management.git
   cd order-management
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Orders

- `POST /orders` - Create a new order
- `GET /orders` - Get user's orders

### Products

- `GET /products` - Get all products

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 