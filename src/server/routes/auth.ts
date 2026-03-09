import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { emailService } from '../services/EmailService.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string, accountType: string) => {
  return jwt.sign(
    { id: userId, accountType },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

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

    // Generate JWT token
    const token = generateToken(newUser._id.toString(), newUser.accountType);

    // Send welcome email
    try {
      const welcomeEmailSent = await emailService.sendWelcomeEmail(
        newUser.email, 
        newUser.name, 
        newUser.accountType
      );
      
      if (welcomeEmailSent) {
        console.log(`✅ Welcome email sent to: ${newUser.email}`);
      } else {
        console.log(`⚠️ Failed to send welcome email to: ${newUser.email}`);
      }
    } catch (emailError) {
      console.log(`⚠️ Welcome email error: ${emailError}`);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      token
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
  console.log('Login attempt for email:', req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found in DB:', user ? user.email : 'NOT FOUND');

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    console.log('Comparing password for user:', user.email);
    console.log('Has hashed password:', !!user.password);
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

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.accountType);

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error: any) {
    console.error('CRITICAL Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error during login',
      details: error.message
    });
  }
});

// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token (in production, you'd use a proper token service)
    const resetToken = generateToken(user._id.toString(), user.accountType);
    
    // Dynamic frontend URL configuration
    const getFrontendUrl = (req: any) => {
      // Check if FRONTEND_URL is explicitly set in environment
      if (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== 'undefined') {
        return process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
      }
      
      // Development fallbacks - try common ports
      const host = req?.get('host') || 'localhost:4000'; // Fallback to backend host
      
      // Try common frontend ports
      const frontendPorts = [8080, 8081, 3000, 5173];
      for (const port of frontendPorts) {
        if (host.includes(`:${port}`)) {
          return `http://${host.split(':')[0]}:${port}`;
        }
      }
      
      // Default to port 8080 for development
      return `http://localhost:8080`;
    };
    
    const resetLink = `${getFrontendUrl(req)}/reset-password?token=${resetToken}`;
    
    console.log(`🔗 Using frontend URL: ${getFrontendUrl(req)}`);
    console.log(`🔗 Generated reset link: ${resetLink}`);

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetLink, user.name);
    
    if (emailSent) {
      console.log(`✅ Password reset email sent to: ${email}`);
    } else {
      console.log(`⚠️ Failed to send password reset email to: ${email}`);
      // Still return success to prevent email enumeration
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Internal server error during password reset request' 
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        error: 'Token and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded || !decoded.id) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'User not found' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await User.findByIdAndUpdate(decoded.id, { 
      password: hashedPassword 
    });

    res.json({ 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }
    res.status(500).json({ 
      error: 'Internal server error during password reset' 
    });
  }
});

export default router;
