import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const router = express.Router();

// POST /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, registrationNumber, password, accountType, program, department } = req.body;

    // Validate required fields
    if (!name || !email || !registrationNumber || !password || !accountType) {
      return res.status(400).json({ 
        error: 'All required fields must be provided' 
      });
    }

    // Validate account type specific fields
    if (accountType === 'student' && !program) {
      return res.status(400).json({ 
        error: 'Program is required for student accounts' 
      });
    }

    if (accountType === 'staff' && !department) {
      return res.status(400).json({ 
        error: 'Department is required for staff accounts' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { registrationNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or registration number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      name,
      email,
      registrationNumber,
      password: hashedPassword,
      accountType,
      program: accountType === 'student' ? program : undefined,
      department: accountType === 'staff' ? department : undefined
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      registrationNumber: newUser.registrationNumber,
      accountType: newUser.accountType,
      program: newUser.program,
      department: newUser.department
    };

    res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error during signup' 
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      registrationNumber: user.registrationNumber,
      accountType: user.accountType,
      program: user.program,
      department: user.department
    };

    res.json({ 
      message: 'Login successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

export default router;
