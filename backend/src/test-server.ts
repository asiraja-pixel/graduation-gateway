import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Mock auth routes for testing
app.post('/api/auth/signup', (req, res) => {
  console.log('Signup request received:', req.body);
  res.status(201).json({ 
    message: 'User created successfully (mock)',
    user: {
      id: 'mock-id',
      name: req.body.name,
      email: req.body.email,
      registrationNumber: req.body.registrationNumber,
      accountType: req.body.accountType,
      program: req.body.program,
      department: req.body.department
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({ 
    message: 'Login successful (mock)',
    user: {
      id: 'mock-id',
      name: 'Test User',
      email: req.body.email,
      registrationNumber: 'TEST001',
      accountType: 'student',
      program: 'Computer Science'
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Test backend listening on http://localhost:${port}`);
  console.log('MongoDB connection disabled for testing');
});
