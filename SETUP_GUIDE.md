# Store Rating Application - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- PostgreSQL (v12 or higher) - [Download](https://www.postgresql.org/download/)
- Git - [Download](https://git-scm.com/)
- npm (comes with Node.js)

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

Open PostgreSQL command line or use pgAdmin:

```bash
# For Windows with psql:
createdb store_rating_db
```

Or in pgAdmin:
1. Right-click "Databases" → Create → Database
2. Name: `store_rating_db`
3. Click "Create"

### 1.2 Verify Database Creation

```bash
psql -U postgres -d store_rating_db -c "\dt"
```

### 1.3 If `psql` is not found or pgAdmin shows a template/collation error

If you see errors like `psql: command not found` in Git Bash/terminal, or when creating a database in pgAdmin you see a message about `template1` collation version mismatch, use one of the workarounds below.

- Quick check for `psql` (Windows CMD):

```cmd
where psql
```

If `where psql` returns no path, the PostgreSQL client bin directory is not on your PATH. The default install location is usually `C:\Program Files\PostgreSQL\<version>\bin`.

- Temporarily add PostgreSQL `bin` to PATH (CMD session only):

```cmd
:: replace <version> with your installed version, e.g. 14
set PATH=%PATH%;"C:\Program Files\PostgreSQL\<version>\bin"
psql -U postgres -d store_rating_db -c "\dt"
```

- Permanently add to PATH (Windows):
  1. Open Start → Edit the system environment variables → Environment Variables.
  2. Edit `Path` under your user or System variables and add `C:\Program Files\PostgreSQL\<version>\bin`.
  3. Open a new terminal and run `psql`.

- Workaround for the `template1` collation mismatch (use `template0`):

If pgAdmin reports a collation/template mismatch when creating a database, create the database using `template0` which avoids copying locale/collation metadata from `template1`:

```sql
-- In pgAdmin Query Tool (or via psql)
CREATE DATABASE store_rating_db TEMPLATE template0;

-- Or from the command line (once psql/createdb are available):
createdb -T template0 store_rating_db
```

This will create a new database without inheriting the problematic `template1` collation.

If you prefer the pgAdmin GUI, open the Query Tool for the server (right-click server → Query Tool) and run the `CREATE DATABASE ... TEMPLATE template0;` SQL above.


## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install:
- express (web framework)
- pg (PostgreSQL client)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- cors (cross-origin requests)
- express-validator (input validation)
- dotenv (environment variables)

### 2.3 Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Windows (CMD):
type nul > .env

# Or create manually and add:
PORT=5000
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
JWT_SECRET=your-secret-key-change-in-production
```

**Important:** Change `DB_PASSWORD` to your PostgreSQL password.

### 2.4 Start Backend Server

```bash
# Development mode with auto-reload:
npm run dev

# Or production mode:
npm start
```

Expected output:
```
Database tables created successfully
Server running on port 5000
```

The backend is ready when you see these messages. The database tables will be created automatically.

## Step 3: Frontend Setup

### 3.1 Open New Terminal/Command Prompt

Navigate to the frontend directory:

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install:
- react (UI framework)
- react-router-dom (routing)
- axios (HTTP client)

### 3.3 Start Frontend Server

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

## Step 4: Create Initial Data

Once both servers are running, you can:

### Option A: Create Admin via UI
1. Sign up as a normal user first
2. This creates test data
3. Manually update the user role in the database to `admin`:

```bash
# Connect to database:
psql -U postgres -d store_rating_db

# Update user to admin (replace email):
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Option B: Create Admin Directly via Database

```bash
psql -U postgres -d store_rating_db

# Insert admin user:
INSERT INTO users (name, email, password, address, role) 
VALUES (
  'System Administrator',
  'admin@example.com',
  '$2a$10$...hashedpassword...',
  'Admin Address',
  'admin'
);
```

**Note:** Password hashing is complex. Use Option A instead.

## Step 5: Test the Application

### 5.1 Normal User Flow

1. Go to `http://localhost:3000`
2. Click "Sign up"
3. Fill in form (Name: min 20 chars, Password: 8-16 chars with uppercase & special char)
4. Submit
5. Explore stores and submit ratings

Example credentials for signup:
- Name: `John Doe Test User` (exactly 20+ chars)
- Email: `john@example.com`
- Address: `123 Main Street, Springfield`
- Password: `TestPass123!`

### 5.2 Admin Flow

1. Log in with admin account created above
2. View Dashboard (see user/store/rating counts)
3. Go to Users: Add users, filter, view details
4. Go to Stores: Add stores, filter by name/email
5. Manage the platform

### 5.3 Store Owner Flow

1. Admin creates a store
2. Admin creates a user with role "store_owner"
3. Log in with store owner account
4. View dashboard showing ratings for your store
5. See average rating and all user ratings

## Troubleshooting

### Backend Issues

**Error: "database store_rating_db does not exist"**
```bash
# Create the database:
createdb store_rating_db
```

**Error: "connect ECONNREFUSED 127.0.0.1:5432"**
- PostgreSQL service is not running
- Start PostgreSQL: 
  - Windows: Services → PostgreSQL → Start
  - Mac: `brew services start postgresql`
  - Linux: `sudo systemctl start postgresql`

**Error: "password authentication failed"**
- Update DB_PASSWORD in `.env` to match your PostgreSQL password
- Restart the server

**Error: "Port 5000 already in use"**
```bash
# Find and kill process on port 5000:
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Frontend Issues

**Error: "Cannot find module 'react'"**
```bash
# Reinstall dependencies:
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 3000 already in use"**
- Another application is using port 3000
- Stop the other application or change port:
```bash
# Change port (set for this session):
set PORT=3001 && npm start  # Windows
PORT=3001 npm start          # Mac/Linux
```

**API calls failing (CORS error)**
- Ensure backend is running on `http://localhost:5000`
- Check that JWT_SECRET in backend .env is set
- Clear browser cache and cookies

### Database Issues

**Tables not created**
- Restart the backend server
- Check database connection in `.env`
- Verify PostgreSQL is running

**Want to reset database**
```bash
# Drop and recreate:
dropdb store_rating_db
createdb store_rating_db

# Restart backend to recreate tables
```

## Useful Commands

```bash
# Backend commands:
npm run dev          # Development with auto-reload
npm start            # Production mode
npm test             # Run tests (if configured)

# Frontend commands:
npm start            # Start dev server
npm build            # Build for production
npm test             # Run tests

# Database commands:
psql -U postgres -d store_rating_db    # Connect to database
\dt                                      # List all tables
\du                                      # List users
\q                                       # Quit psql
```

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` in `.env` to a strong random string
2. Update database credentials
3. Use environment variables for sensitive data
4. Enable HTTPS
5. Implement rate limiting
6. Add CSRF protection
7. Sanitize all inputs
8. Use HTTPS in production

## File Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── schema.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── userController.js
│   │   │   └── storeOwnerController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Store.js
│   │   │   └── Rating.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── storeOwnerRoutes.js
│   │   └── index.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UsersList.js
│   │   │   ├── StoresList.js
│   │   │   ├── AddUser.js
│   │   │   ├── AddStore.js
│   │   │   ├── UserDetails.js
│   │   │   ├── StoresListing.js
│   │   │   ├── StoreOwnerDashboard.js
│   │   │   └── UserSettings.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── validation.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── .gitignore
│   └── package.json
└── README.md
```

## Next Steps

1. ✅ Complete backend and frontend setup
2. ✅ Create test users and stores
3. ✅ Test all functionality:
   - User signup/login
   - Store rating submission
   - Admin dashboard
   - Store owner dashboard
4. 📝 Deploy to production when ready

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review error messages in browser console (F12)
3. Check backend logs in terminal
4. Verify all environment variables are set correctly

## Production Deployment

When ready to deploy:
1. Build frontend: `cd frontend && npm run build`
2. Configure production database
3. Update environment variables
4. Use a process manager (PM2, Docker, etc.)
5. Set up SSL/HTTPS
6. Configure firewall rules
7. Set up monitoring and logging
