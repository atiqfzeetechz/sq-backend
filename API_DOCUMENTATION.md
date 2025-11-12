# API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Register User
**POST** `/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login User
**POST** `/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Add Customer
**POST** `/customers` (Protected)

**Body:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "1234567890"
}
```

### 4. Get All Customers
**GET** `/customers` (Protected)

### 5. Add Test for Customer
**POST** `/tests` (Protected)

**Body:**
```json
{
  "testName": "Blood Test",
  "testType": "Laboratory",
  "result": "Normal",
  "customerId": "customer-id-here"
}
```

### 6. Get Tests for Specific Customer
**GET** `/tests/:customerId` (Protected)

### 7. Get All Tests
**GET** `/tests` (Protected)

## Usage Example

1. Register/Login to get token
2. Use token in Authorization header for all other requests
3. Add customers first
4. Add tests for customers using their IDs