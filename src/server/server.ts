import { config } from 'dotenv';
config({ override: true });

// Debug: print cwd and whether MONGODB_URI is present
console.log('cwd:', process.cwd());
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

// Debug SMTP environment variables
console.log('SMTP Environment Variables:');
console.log('  SMTP_HOST:', process.env.SMTP_HOST);
console.log('  SMTP_PORT:', process.env.SMTP_PORT);
console.log('  SMTP_USER:', process.env.SMTP_USER);
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'MISSING');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL);

import express from "express";
import cors from "cors";
import { createServer } from 'http';
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase, mongoose } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import userRoutes from "./routes/users.js";
import clearanceRoutes from "./routes/clearanceRequests.js";
import authRoutes from "./routes/auth.js";
import settingsRoutes from "./routes/settings.js";
import { SocketService } from './services/SocketService.js';

const app = express();
const server = createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);

// Configure CORS to accept one or more frontend origins (comma-separated in FRONTEND_URL)
const allowedFrontend = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:8080,http://localhost:4000,http://127.0.0.1:5173,http://127.0.0.1:8080,http://127.0.0.1:4000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests like curl or same-origin (no origin)
    if (!origin) return callback(null, true);
    
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    // In development, be permissive to avoid browser-specific issues
    if (isDevelopment) {
      return callback(null, true);
    }

    if (allowedFrontend.includes(origin)) return callback(null, true);
    
    console.warn(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clearance-requests', clearanceRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('GLOBAL ERROR HANDLER:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serve static files from the React app
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, "index.html"));
  }
});

const port = Number(process.env.PORT ?? 4000);

async function start() {
  try {
    await connectToDatabase();

    server.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
      console.log(`Socket.IO server running for real-time updates`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
