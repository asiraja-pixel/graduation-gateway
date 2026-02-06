import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectToDatabase, mongoose } from "./db.js";

// Import routes
import userRoutes from "./routes/users.js";
import clearanceRoutes from "./routes/clearanceRequests.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clearance-requests', clearanceRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
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

const port = Number(process.env.PORT ?? 4000);

async function start() {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();

