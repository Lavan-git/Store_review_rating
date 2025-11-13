# Quick Start Guide

## Fast Setup (5 minutes)

### Prerequisites Check
- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] Git installed

### Quick Setup Steps

```bash
# 1. CREATE DATABASE
createdb store_rating_db

# 2. BACKEND SETUP (Terminal 1)
cd backend
npm install
# Edit .env - change DB_PASSWORD to your PostgreSQL password
npm run dev

# 3. FRONTEND SETUP (Terminal 2)
cd frontend
npm install
npm start

# Opens http://localhost:3000 automatically
```

## Default Test Credentials

After signup, use these for testing:

### Normal User
- Email: any email you create
- Password: Must be 8-16 chars with uppercase + special char (e.g., `TestPass123!`)
- Name: Min 20 characters (e.g., `John Doe Test User 123`)

### Admin User (setup after signup)
```bash
# After creating a user via signup, promote to admin:
psql -U postgres -d store_rating_db

UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Key Features

✅ **Admin**
- Dashboard with stats
- Add/manage users and stores
- Filter and sort listings
- View user details

✅ **Normal User**
- Sign up and login
- Browse and search stores
- Submit 1-5 star ratings
- Update ratings anytime
- Change password

✅ **Store Owner**
- View store dashboard
- See all user ratings
- View average rating
- Change password

## File Locations

| Component | File Location |
|-----------|--------------|
| Backend Server Config | `backend/src/index.js` |
| Database Setup | `backend/src/config/schema.js` |
| API Routes | `backend/src/routes/` |
| Frontend App | `frontend/src/App.js` |
| React Pages | `frontend/src/pages/` |
| API Service | `frontend/src/services/api.js` |

## Validation Rules

```
Name:        20-60 characters
Email:       standard email format
Address:     max 400 characters
Password:    8-16 chars, 1 uppercase, 1 special char (!@#$%^&*)
Rating:      1-5 stars
```

## Common Issues

| Issue | Solution |
|-------|----------|
| `Port 5000 in use` | `netstat -ano \| findstr :5000` then kill process |
| `Port 3000 in use` | Kill other process or `set PORT=3001 && npm start` |
| `DB connection error` | Check .env password matches PostgreSQL password |
| `CORS error` | Make sure backend is running on port 5000 |
| `Tables not created` | Restart backend server |

## API Endpoints

```
Authentication:
  POST /api/auth/signup              - Register
  POST /api/auth/login               - Login
  POST /api/auth/change-password     - Change password

Admin:
  GET  /api/admin/dashboard          - Dashboard stats
  GET  /api/admin/users              - List users (with filters)
  GET  /api/admin/stores             - List stores (with filters)
  POST /api/admin/users              - Add user
  POST /api/admin/stores             - Add store
  GET  /api/admin/users/:id          - User details

Users:
  GET  /api/users/stores             - List all stores
  POST /api/users/stores/:id/rating  - Submit rating

Store Owner:
  GET  /api/store-owner/dashboard    - Dashboard
```

## Database Schema

```
Users
├── id (PK)
├── name (20-60 chars)
├── email (unique)
├── password (hashed)
├── address (max 400 chars)
├── role (admin|normal_user|store_owner)
└── timestamps

Stores
├── id (PK)
├── name (20-60 chars)
├── email (unique)
├── address (max 400 chars)
├── owner_id (FK to users)
└── timestamps

Ratings
├── id (PK)
├── user_id (FK to users)
├── store_id (FK to stores)
├── rating (1-5)
└── timestamps
```

## Testing Workflow

1. **Signup**: Create normal user account
2. **Login**: Use created account
3. **Browse**: View available stores
4. **Rate**: Submit ratings to stores
5. **Update**: Modify existing ratings
6. **Admin**: Create admin account
7. **Manage**: Add users/stores as admin
8. **View**: Check admin dashboard

## Stopping Servers

```bash
# Backend (Terminal 1)
Ctrl + C

# Frontend (Terminal 2)
Ctrl + C
```

## Next Steps

- [ ] Review SETUP_GUIDE.md for detailed instructions
- [ ] Check README.md for full documentation
- [ ] Explore API endpoints with Postman
- [ ] Deploy to production when ready

## Emergency Reset

```bash
# Reset database completely:
dropdb store_rating_db
createdb store_rating_db

# Restart backend to recreate tables
# Clear browser cache (Ctrl+Shift+Delete)
# Login again
```

## Environment Variables Reference

```
# backend/.env
PORT=5000                          # Server port
DB_USER=postgres                   # Database user
DB_PASSWORD=password               # Database password (CHANGE THIS!)
DB_HOST=localhost                  # Database host
DB_PORT=5432                       # Database port
DB_NAME=store_rating_db            # Database name
JWT_SECRET=your-secret-key         # JWT signing key
```

---

**Need help?** Check SETUP_GUIDE.md for troubleshooting section.
