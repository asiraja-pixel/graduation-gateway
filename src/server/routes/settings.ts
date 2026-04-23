import express from 'express';
import { SystemSettings } from '../models/SystemSettings.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user?.accountType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all settings
router.get('/', authenticateToken, isAdmin, async (_req, res) => {
  try {
    const settings = await SystemSettings.find({});
    // Convert array of {key, value} to a single object
    const settingsObj = settings.reduce((acc: Record<string, unknown>, curr: { key: string; value: unknown }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.post('/', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const settings = req.body; // Expecting an object of key-value pairs
    
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return SystemSettings.findOneAndUpdate(
        { key },
        { 
          value, 
          updatedAt: new Date(),
          updatedBy: req.user!.name 
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updatePromises);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
