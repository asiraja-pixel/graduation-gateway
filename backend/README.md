# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/graduation-gateway

# Server Configuration
PORT=4000

# Environment
NODE_ENV=development
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on your system

3. Start the backend server:
```bash
npm start
```

The server will run on http://localhost:4000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Health Check
- `GET /health` - Server health check
- `GET /db-health` - Database connection status
