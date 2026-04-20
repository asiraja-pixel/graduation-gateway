# Graduation Gateway - IUK Clearance System

A unified Graduation Clearance System with a React frontend and an Express/Node.js backend. This system streamlines the graduation process for IUK (IUK) students and staff through real-time updates and secure authentication.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend    │    │   Backend     │    │   Database     │
│   (React)    │◄──►│  (Node.js)    │◄──►│  (MongoDB)    │
│               │    │               │    │               │
│ Socket.IO     │    │   Socket.IO    │    │   Mongoose     │
│   Client      │    │   Server       │    │   ODM          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Key Features

### 🔐 Secure Authentication & User Management
- **Role-Based Access Control**: Separate flows for Students, Staff, and Admin.
- **Secure Storage**: Passwords hashed using `bcrypt` (12 salt rounds).
- **JWT Integration**: Token-based authentication for both API and Socket.IO connections.
- **Forgot Password**: Complete token-based reset flow via email.
- **IUK Branding**: Unified "IUK Clearance" institutional branding across login and signup.
- **Staff Departments**: 5 pre-defined departments (Library, Finance, Accommodation, IT, Academic Office).

### 🔄 Real-time Clearance System
- **Live Status Updates**: Instant clearance status changes across all clients using Socket.IO.
- **Department Rooms**: Staff join specific rooms to manage their department's requests.
- **Automated Notifications**: Real-time alerts for new requests and status changes.

### 📧 SMTP Email Integration
- **Dynamic URL Detection**: Auto-detects frontend URLs (8080, 8081, etc.) for email links.
- **Professional Templates**: Responsive HTML emails for password resets and welcome messages.
- **Gmail Support**: Pre-configured for Gmail SMTP with app passwords.

## 📂 Project Structure

- `src/`: React frontend source code (Vite-based)
- `src/server/`: Express backend source code
- `src/components/`: Reusable UI components (shadcn/ui)
- `src/contexts/`: React Context providers (Auth, Socket, Clearance)
- `public/`: Static assets for the frontend
- `dist/`: Build artifacts

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance

### Installation
```sh
npm install
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:8080

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Development
To run both the frontend and backend with hot-reload:
```sh
npm run dev
```
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000`

### Production
```sh
npm run build
npm start
```

## 🔧 Scripts
- `npm run dev`: Start both frontend and backend in development mode.
- `npm run build`: Build both frontend and backend for production.
- `npm start`: Start the production server.
- `npm test`: Run vitest for frontend.
- `npm run lint`: Run ESLint.

## 🛡️ Security Measures
- **Password Security**: No plain text storage; all passwords hashed.
- **Email Protection**: Email enumeration protection on auth routes.
- **Token Expiry**: Password reset tokens expire after 24 hours.
- **CORS Configuration**: Restrictive origins for production environments.

---
*Documentation consolidated from project implementation reports.*
