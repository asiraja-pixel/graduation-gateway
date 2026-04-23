import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (_req: AuthRequest, res: Response, next: express.NextFunction) => {
  if (_req.user?.accountType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/users - Get all users (for admin purposes)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow user to get their own profile or admin to get any profile
    if (req.user?.accountType !== 'admin' && req.user?.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - Create a new user (admin only)
router.post('/', authenticateToken, isAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { 
      name, email, password, registrationNumber, accountType, 
      program, department, nationality, gender, phoneNumber, 
      address, startYear, endYear 
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !registrationNumber || !accountType) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { registrationNumber }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or registration number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      registrationNumber,
      accountType,
      program,
      department,
      nationality,
      gender,
      phoneNumber,
      address,
      startYear,
      endYear
    });

    await newUser.save();
    
    const userResponse = newUser.toObject() as unknown as Record<string, unknown>;
    const { password: _, ...result } = userResponse;
    
    res.status(201).json(result);
  } catch (error: unknown) {
    console.error('Create user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    res.status(400).json({ error: message });
  }
});

// PUT /api/users/:id - Update a user (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { 
      name, email, password, registrationNumber, accountType, 
      program, department, nationality, gender, phoneNumber, 
      address, startYear, endYear 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for unique constraints if they are changing
    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(400).json({ error: 'Email already exists' });
      user.email = email.toLowerCase();
    }

    if (registrationNumber && registrationNumber !== user.registrationNumber) {
      const existingReg = await User.findOne({ registrationNumber });
      if (existingReg) return res.status(400).json({ error: 'Registration number already exists' });
      user.registrationNumber = registrationNumber;
    }

    if (name) user.name = name;
    if (accountType) user.accountType = accountType;
    if (password) user.password = await bcrypt.hash(password, 12);
    
    // Update other fields
    if (program !== undefined) user.program = program;
    if (department !== undefined) user.department = department;
    if (nationality !== undefined) user.nationality = nationality;
    if (gender !== undefined) user.gender = gender;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (startYear !== undefined) user.startYear = startYear;
    if (endYear !== undefined) user.endYear = endYear;

    await user.save();
    
    const userResponse = user.toObject() as unknown as Record<string, unknown>;
    const { password: _, ...result } = userResponse;
    
    res.json(result);
  } catch (error: unknown) {
    console.error('Update user error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user';
    res.status(400).json({ error: message });
  }
});

// DELETE /api/users/:id - Delete a user (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
