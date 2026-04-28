import express from 'express';
import { ClearanceRequest, IDepartmentClearance } from '../models/ClearanceRequest.js';
import { User } from '../models/User.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

type DepartmentClearance = IDepartmentClearance;

const router = express.Router();

// Get all clearance requests (for staff)
router.get('/', authenticateToken, async (_req: AuthRequest, res) => {
  try {
    const requests = await ClearanceRequest.find({})
      .populate('studentId', 'name registrationNumber')
      .sort({ submittedAt: -1 })
      .limit(100);
    
    // Ensure we use the latest name from the User model if available
    const formattedRequests = requests.map(req => {
      const doc = req.toObject();
      const student = req.studentId as any;
      return {
        ...doc,
        id: doc._id?.toString() || doc.id,
        studentName: student?.name || doc.studentName,
        registrationNumber: student?.registrationNumber || doc.registrationNumber,
        studentId: student?._id?.toString() || doc.studentId
      };
    });
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching clearance requests:', error);
    res.status(500).json({ error: 'Failed to fetch clearance requests' });
  }
});

// Get user's clearance requests
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const requests = await ClearanceRequest.find({ studentId: req.user!.id })
      .populate('studentId', 'name registrationNumber')
      .sort({ submittedAt: -1 });
    
    const formattedRequests = requests.map(req => {
      const doc = req.toObject();
      const student = req.studentId as any;
      return {
        ...doc,
        id: doc._id?.toString() || doc.id,
        studentName: student?.name || doc.studentName,
        registrationNumber: student?.registrationNumber || doc.registrationNumber,
        studentId: student?._id?.toString() || doc.studentId
      };
    });
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching user clearance requests:', error);
    res.status(500).json({ error: 'Failed to fetch clearance requests' });
  }
});

// Get single clearance request
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const request = await ClearanceRequest.findById(req.params.id)
      .populate('studentId', 'name registrationNumber');
    
    if (!request) {
      return res.status(404).json({ error: 'Clearance request not found' });
    }

    const doc = request.toObject();
    const student = request.studentId as any;
    const formattedRequest = {
      ...doc,
      id: doc._id?.toString() || doc.id,
      studentName: student?.name || doc.studentName,
      registrationNumber: student?.registrationNumber || doc.registrationNumber,
      studentId: student?._id?.toString() || doc.studentId
    };

    // Check if user has permission to view this request
    if (req.user!.accountType === 'student' && formattedRequest.studentId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to view this request' });
    }

    res.json(formattedRequest);
  } catch (error) {
    console.error('Error fetching clearance request:', error);
    res.status(500).json({ error: 'Failed to fetch clearance request' });
  }
});

// Create new clearance request
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user!.accountType !== 'student') {
      return res.status(403).json({ error: 'Only students can submit clearance requests' });
    }

    // Check if student already has a pending or in-progress request
    const existingRequest = await ClearanceRequest.findOne({
      studentId: req.user!.id,
      overallStatus: { $in: ['pending', 'in_progress'] }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You already have a pending clearance request' 
      });
    }

    const clearanceRequest = new ClearanceRequest({
      studentId: req.user!.id,
      studentName: req.user!.name,
      registrationNumber: req.user!.registrationNumber,
      program: req.user!.program,
      nationality: req.user!.nationality,
      gender: req.user!.gender,
      phoneNumber: req.user!.phoneNumber,
      address: req.user!.address,
      startYear: req.user!.startYear,
      endYear: req.user!.endYear
    });

    await clearanceRequest.save();
    
    res.status(201).json(clearanceRequest);
  } catch (error) {
    console.error('Error creating clearance request:', error);
    res.status(500).json({ error: 'Failed to create clearance request' });
  }
});

// Update department status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { department, status, comment } = req.body;

    if (!department || !status) {
      return res.status(400).json({ 
        error: 'Department and status are required' 
      });
    }

    if (!['library', 'finance', 'accommodation', 'dean', 'registrar', 'department'].includes(department)) {
      return res.status(400).json({ 
        error: 'Invalid department' 
      });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status' 
      });
    }

    const isStaff = req.user!.accountType === 'staff';
    const isAdmin = req.user!.accountType === 'admin';

    if (!isStaff && !isAdmin) {
      return res.status(403).json({ error: 'Only staff or admin can update clearance status' });
    }

    if (isStaff && req.user!.department !== department) {
      return res.status(403).json({ 
        error: 'You can only update your own department' 
      });
    }

    const clearanceRequest = await ClearanceRequest.findById(req.params.id);
    
    if (!clearanceRequest) {
      return res.status(404).json({ error: 'Clearance request not found' });
    }

    // Fetch staff signature from DB
    const staffUser = await User.findById(req.user!.id).select('signature');

    // Update department status
    const deptClearances = (clearanceRequest.departmentClearances as Record<string, DepartmentClearance>);
    deptClearances[department] = {
      status,
      timestamp: new Date(),
      staffId: req.user!.id,
      staffName: req.user!.name,
      staffSignature: staffUser?.signature,
      comment: isAdmin ? (comment || 'Overridden by admin') : comment
    };

    // Update overall status
    const requestWithMethod = clearanceRequest as unknown as { updateOverallStatus: () => void };
    if (typeof requestWithMethod.updateOverallStatus === 'function') {
      requestWithMethod.updateOverallStatus();
    }
    await clearanceRequest.save();

    res.json(clearanceRequest);
  } catch (error) {
    console.error('Error updating clearance status:', error);
    res.status(500).json({ error: 'Failed to update clearance status' });
  }
});

// Delete clearance request (admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user!.accountType !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete clearance requests' });
    }

    const clearanceRequest = await ClearanceRequest.findByIdAndDelete(req.params.id);
    
    if (!clearanceRequest) {
      return res.status(404).json({ error: 'Clearance request not found' });
    }

    res.json({ message: 'Clearance request deleted successfully' });
  } catch (error) {
    console.error('Error deleting clearance request:', error);
    res.status(500).json({ error: 'Failed to delete clearance request' });
  }
});

export default router;
