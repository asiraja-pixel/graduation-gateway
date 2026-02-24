import 'dotenv/config';

// Debug: print cwd and whether MONGODB_URI is present
console.log('cwd:', process.cwd());
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

import express from "express";
import cors from "cors";
import { createServer } from 'http';
import { connectToDatabase, mongoose } from "./db.js";

// Import routes
import userRoutes from "./routes/users.js";
import clearanceRoutes from "./routes/clearanceRequests.js";
import authRoutes from "./routes/auth.js";
import { SocketService } from './services/SocketService.js';

const app = express();
const server = createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);

// Configure CORS to accept one or more frontend origins (comma-separated in FRONTEND_URL)
const allowedFrontend = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:8080')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests like curl or same-origin (no origin)
    if (!origin) return callback(null, true);
    if (allowedFrontend.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clearance-requests', clearanceRoutes);

app.get("/health", (_req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    connectedUsers: socketService.getConnectedUsersCount()
  });
});

app.get("/db-health", (_req, res) => {
  const state = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    state: states[state] ?? "unknown",
    readyState: state,
  });
});

// Security test endpoint
app.get("/test-security", async (_req, res) => {
  try {
    const { testAuthSecurity } = await import('./test/authSecurity.js');
    const result = await testAuthSecurity();
    res.json({ 
      message: 'Security test completed',
      success: result 
    });
  } catch (error) {
    console.error('Security test error:', error);
    res.status(500).json({ 
      error: 'Security test failed' 
    });
  }
});

const port = Number(process.env.PORT ?? 4000);

async function start() {
  try {
    await connectToDatabase();

    server.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
      console.log(`Socket.IO server running for real-time updates`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
