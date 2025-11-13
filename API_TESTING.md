# API Testing Guide & Examples

## Setup for API Testing

You can test the API using:
- Postman (GUI) - [Download](https://www.postman.com/downloads/)
- curl (Command line)
- Insomnia (GUI alternative)
- Thunder Client (VS Code extension)

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints (No Auth Required)

### 1. User Signup
```
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe Test User",
  "email": "john@example.com",
  "address": "123 Main Street, Springfield",
  "password": "TestPass123!"
}

Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe Test User",
    "email": "john@example.com",
    "address": "123 Main Street, Springfield",
    "role": "normal_user"
  }
}
```

### 2. User Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "TestPass123!"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe Test User",
    "email": "john@example.com",
    "role": "normal_user",
    "address": "123 Main Street, Springfield"
  }
}
```

---

## Protected Endpoints - Authentication

### 1. Change Password
```
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "TestPass123!",
  "newPassword": "NewPass456!"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

---

## Admin Endpoints (Requires admin role)

### 1. Get Dashboard Stats
```
GET /admin/dashboard
Authorization: Bearer <admin_token>

Response (200):
{
  "totalUsers": 5,
  "totalStores": 10,
  "totalRatings": 25
}
```

### 2. Add New User
```
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Smith Administrator",
  "email": "jane@example.com",
  "password": "AdminPass789!",
  "address": "456 Oak Avenue, Shelbyville",
  "role": "admin"
}

Response (201):
{
  "message": "User added successfully",
  "user": {
    "id": 2,
    "name": "Jane Smith Administrator",
    "email": "jane@example.com",
    "address": "456 Oak Avenue, Shelbyville",
    "role": "admin"
  }
}
```

### 3. Add New Store
```
POST /admin/stores
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Springfield Super Market",
  "email": "supermarket@example.com",
  "address": "789 Commerce Street, Springfield"
}

Response (201):
{
  "message": "Store added successfully",
  "store": {
    "id": 1,
    "name": "Springfield Super Market",
    "email": "supermarket@example.com",
    "address": "789 Commerce Street, Springfield",
    "owner_id": 3
  }
}
```

### 4. List Users with Filters
```
GET /admin/users?name=John&email=john&address=Main&role=normal_user&sortBy=name&sortDir=asc
Authorization: Bearer <admin_token>

Query Parameters:
- name (optional) - Filter by name
- email (optional) - Filter by email
- address (optional) - Filter by address
- role (optional) - Filter by role (admin, normal_user, store_owner)
- sortBy (optional) - Sort field (name, email, address, role, created_at)
- sortDir (optional) - Sort direction (asc, desc)

Response (200):
{
  "users": [
    {
      "id": 1,
      "name": "John Doe Test User",
      "email": "john@example.com",
      "address": "123 Main Street, Springfield",
      "role": "normal_user",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 5. List Stores with Filters
```
GET /admin/stores?name=Super&sortBy=average_rating&sortDir=desc
Authorization: Bearer <admin_token>

Query Parameters:
- name (optional) - Filter by name
- email (optional) - Filter by email
- address (optional) - Filter by address
- sortBy (optional) - Sort field (name, email, address, average_rating)
- sortDir (optional) - Sort direction (asc, desc)

Response (200):
{
  "stores": [
    {
      "id": 1,
      "name": "Springfield Super Market",
      "email": "supermarket@example.com",
      "address": "789 Commerce Street, Springfield",
      "owner_id": 3,
      "average_rating": "4.50"
    }
  ]
}
```

### 6. Get User Details
```
GET /admin/users/1
Authorization: Bearer <admin_token>

Response (200):
{
  "id": 1,
  "name": "John Doe Test User",
  "email": "john@example.com",
  "address": "123 Main Street, Springfield",
  "role": "normal_user",
  "created_at": "2024-01-15T10:30:00Z"
}

Note: If user is store_owner, response includes:
{
  "id": 3,
  "name": "Store Owner Name",
  "email": "owner@example.com",
  "role": "store_owner",
  "average_rating": "4.75"
}
```

---

## Normal User Endpoints (Requires normal_user role)

### 1. List All Stores
```
GET /users/stores
Authorization: Bearer <user_token>

Optional Query Parameters:
- search (optional) - Search by store name or address
- sortBy (optional) - Sort field (name, address, average_rating)
- sortDir (optional) - Sort direction (asc, desc)

Response (200):
{
  "stores": [
    {
      "id": 1,
      "name": "Springfield Super Market",
      "email": "supermarket@example.com",
      "address": "789 Commerce Street, Springfield",
      "owner_id": 3,
      "average_rating": "4.50",
      "userRating": 5
    },
    {
      "id": 2,
      "name": "Kwik-E-Mart",
      "email": "kwik@example.com",
      "address": "321 Elm Street, Springfield",
      "owner_id": 4,
      "average_rating": "3.75",
      "userRating": null
    }
  ]
}
```

### 2. Submit/Update Rating
```
POST /users/stores/1/rating
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "rating": 4
}

Response (200):
{
  "message": "Rating submitted successfully",
  "rating": {
    "id": 1,
    "user_id": 1,
    "store_id": 1,
    "rating": 4,
    "created_at": "2024-01-15T11:20:00Z",
    "updated_at": "2024-01-15T11:20:00Z"
  }
}

Note: If rating already exists, message will be "Rating updated successfully"
```

---

## Store Owner Endpoints (Requires store_owner role)

### 1. Get Store Dashboard
```
GET /store-owner/dashboard
Authorization: Bearer <store_owner_token>

Response (200):
{
  "store": {
    "id": 1,
    "name": "Springfield Super Market",
    "email": "supermarket@example.com",
    "address": "789 Commerce Street, Springfield",
    "owner_id": 3,
    "average_rating": "4.50"
  },
  "ratings": [
    {
      "id": 1,
      "user_id": 1,
      "rating": 5,
      "created_at": "2024-01-15T10:45:00Z",
      "user_name": "John Doe Test User",
      "user_email": "john@example.com"
    },
    {
      "id": 2,
      "user_id": 2,
      "rating": 4,
      "created_at": "2024-01-15T11:20:00Z",
      "user_name": "Jane Smith Administrator",
      "user_email": "jane@example.com"
    }
  ],
  "totalRatings": 2,
  "averageRating": "4.50"
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "errors": [
    {
      "value": "short",
      "msg": "Name must be between 20 and 60 characters",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "No token provided"
}
```

### Authorization Error (403)
```json
{
  "error": "Insufficient permissions"
}
```

### Not Found Error (404)
```json
{
  "error": "User not found"
}
```

### Conflict Error (400)
```json
{
  "error": "Email already registered"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## cURL Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Test User",
    "email": "john@example.com",
    "address": "123 Main Street, Springfield",
    "password": "TestPass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123!"
  }'
```

### Get Stores (with token)
```bash
curl -X GET "http://localhost:5000/api/users/stores" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Submit Rating
```bash
curl -X POST http://localhost:5000/api/users/stores/1/rating \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

---

## Testing Checklist

### Public Routes
- [ ] Signup with valid data
- [ ] Signup with invalid email
- [ ] Signup with short name
- [ ] Signup with short password
- [ ] Login with correct credentials
- [ ] Login with wrong password

### Admin Routes
- [ ] Dashboard returns stats
- [ ] Add user successfully
- [ ] Add duplicate email (should fail)
- [ ] List users with filters
- [ ] List stores with sorting
- [ ] Get user details

### User Routes
- [ ] List stores
- [ ] Search stores
- [ ] Submit rating
- [ ] Update existing rating
- [ ] Change password

### Store Owner Routes
- [ ] Get dashboard
- [ ] View store ratings
- [ ] Change password

---

## Postman Collection

You can import this as a Postman collection or use the examples above to test manually.

For automated testing, consider using:
- Jest for unit tests
- Supertest for API testing
- Thunder Client for quick testing

---

## Rate Limiting Notes

Currently, the API does not have rate limiting. In production, implement:
- IP-based rate limiting
- User-based rate limiting
- Token-based rate limiting

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (frontend)
- Add more origins as needed in production

---

## Token Expiration

Tokens expire in 24 hours. Users need to log in again after expiration.

---

## Common Testing Scenarios

### Scenario 1: Complete User Flow
1. Signup as normal user
2. Login to get token
3. List stores
4. Submit rating to a store
5. Get updated store list (verify rating appears)
6. Update rating
7. Change password

### Scenario 2: Admin Flow
1. Create admin user
2. Login as admin
3. View dashboard
4. Add new user
5. Add new store
6. List and filter users
7. List and filter stores
8. View user details

### Scenario 3: Store Owner Flow
1. Admin creates store owner account
2. Admin creates store for owner
3. Login as store owner
4. View dashboard
5. See all user ratings
6. Verify average rating calculation
