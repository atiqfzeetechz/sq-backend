# sq-backend

A complete backend API with user authentication and customer/test management.

## Features
- User registration and login with JWT authentication
- Customer management (add/view customers)
- Test management for customers
- MongoDB with Mongoose
- Express.js REST API

## Setup

1. Install dependencies:
```bash
bun install
```

2. Make sure MongoDB is running on your system

3. Start the server:
```bash
bun run index.ts
# or for development with auto-reload:
bun run dev
```

4. Server will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Customers (Protected)
- `POST /api/customers` - Add new customer
- `GET /api/customers` - Get all customers

### Tests (Protected)
- `POST /api/tests` - Add test for customer
- `GET /api/tests` - Get all tests
- `GET /api/tests/:customerId` - Get tests for specific customer

## Testing

Run the test script to verify all endpoints:
```bash
node test-api.js
```

See `API_DOCUMENTATION.md` for detailed API usage examples.
