# Store Rating Application

A full-stack web application that allows users to submit ratings for stores registered on the platform. Built with React, Express.js, and PostgreSQL.

## Features

### System Administrator
- Add new stores, normal users, and admin users
- Dashboard displaying total users, stores, and ratings
- View and filter users and stores by name, email, address, and role
- View detailed user information
- Display store owner ratings

### Normal User
- Sign up and log in
- View all registered stores
- Search stores by name and address
- Submit and modify store ratings (1-5 scale) with optional review comments
- Update password
- View store ratings and reviews

### Store Owner
- Log in to platform
- View dashboard with store information
- View all user ratings for their store with comments
- See average store rating
- Update password

## Form Validations

- **Name:** 20-60 characters
- **Address:** Max 400 characters
- **Password:** 8-16 characters with at least one uppercase letter and one special character
- **Email:** Standard email validation
- **Rating Comment:** Max 500 characters (optional)

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Context API for state management

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your database configuration:
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
JWT_SECRET=your-secret-key

# Optional (for password reset emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password-or-app-password
EMAIL_FROM=your-email@example.com
```

4. Create the PostgreSQL database:
```bash
createdb store_rating_db
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change user password

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `POST /api/admin/users` - Add new user
- `POST /api/admin/stores` - Add new store
- `GET /api/admin/users` - List all users with filters
- `GET /api/admin/stores` - List all stores with filters
- `GET /api/admin/users/:userId` - Get user details
 - `PUT /api/admin/users/:userId` - Update user (admin can update name, email, address, role, password)
 - `DELETE /api/admin/users/:userId` - Delete user
 - `PUT /api/admin/stores/:storeId` - Update store (admin can update name, email, address, owner_id)
 - `DELETE /api/admin/stores/:storeId` - Delete store

### Normal User
- `GET /api/users/stores` - List all stores
- `POST /api/users/stores/:storeId/rating` - Submit/update rating

### Password Reset
- `POST /api/auth/reset-password-request` - Request a password reset link (body: `{ "email": "..." }`)
- `POST /api/auth/reset-password` - Perform password reset (body: `{ "token": "...", "newPassword": "..." }`)

### Store Owner
- `GET /api/store-owner/dashboard` - Get store dashboard

## Database Schema

### Users Table
- id (Primary Key)
- name (20-60 characters)
- email (unique)
- password (hashed)
- address (max 400 characters)
- role (admin, normal_user, store_owner)
- created_at, updated_at

### Stores Table
- id (Primary Key)
- name (20-60 characters)
- email (unique)
- address (max 400 characters)
- owner_id (Foreign Key to users)
- created_at, updated_at

### Ratings Table
- id (Primary Key)
- user_id (Foreign Key to users)
- store_id (Foreign Key to stores)
- rating (1-5)
- comment (VARCHAR 500, optional)
- created_at, updated_at
- Unique constraint on (user_id, store_id)

## Default Admin Credentials

You can manually create an admin user in the database or use the signup/add user functionality to create one with admin role.

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Running the Application

1. Start PostgreSQL service
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm start`
4. Open `http://localhost:3000` in your browser

## Testing Flow

1. **Sign up** as a normal user
2. **Login** and view stores
3. **Submit ratings** for stores
4. **Create admin account** (or use existing)
5. **Login as admin** to manage users and stores
6. **Create store owner** account
7. **Login as store owner** to view ratings

## Best Practices Implemented

- Input validation on both frontend and backend
- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- RESTful API design
- Error handling and validation
- SQL injection prevention using parameterized queries
- Responsive UI design
- Organized project structure
- Environment variable configuration

## License

ISC
