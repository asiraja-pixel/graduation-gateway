import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { ClearanceRequest, IDepartmentClearance } from '../models/ClearanceRequest.js';
import { emailService } from './EmailService.js';

type DepartmentClearance = IDepartmentClearance;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: IUser;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HTTPServer) {
    const allowedFrontend = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:8080')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedFrontend,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.user?.name} (${socket.userId})`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId!, socket);

      // Join user to their personal room for updates
      socket.join(`user_${socket.userId}`);

      // Join staff to department rooms
      if (socket.user?.accountType === 'staff') {
        socket.join(`department_${socket.user.department}`);
        console.log(`Staff ${socket.user.name} joined department room: ${socket.user.department}`);
      }

      // Handle joining department rooms (for staff)
      socket.on('join_department', (department: string) => {
        if (socket.user?.accountType === 'staff' && socket.user.department === department) {
          socket.join(`department_${department}`);
          console.log(`Staff joined department room: ${department}`);
        }
      });

      // Handle new clearance request submission
      socket.on('clearance_request', async (requestData: Record<string, unknown>) => {
        try {
          if (!socket.user) return;
          const clearanceRequest = new ClearanceRequest({
            ...requestData,
            studentId: socket.userId,
            studentName: socket.user!.name,
            registrationNumber: socket.user!.registrationNumber,
            program: socket.user!.program
          });

          await clearanceRequest.save();

          // Fetch populated request for emission
          const populatedRequest = await ClearanceRequest.findById(clearanceRequest._id)
            .populate('studentId', 'name registrationNumber')
            .lean();

          const formattedRequest = {
            ...populatedRequest,
            id: populatedRequest!._id.toString(),
            studentName: (populatedRequest!.studentId as any)?.name || populatedRequest!.studentName,
            registrationNumber: (populatedRequest!.studentId as any)?.registrationNumber || populatedRequest!.registrationNumber
          };

          // Emit to all department rooms
          const departments = ['library', 'finance', 'accommodation', 'dean', 'registrar', 'department'];
          departments.forEach(dept => {
            this.io.to(`department_${dept}`).emit('new_request', {
              ...formattedRequest,
              type: 'new_request'
            });
          });

          // Also broadcast to all connected clients (e.g., dashboard views)
          this.io.emit('new_request', {
            ...formattedRequest,
            type: 'new_request'
          });

          // Emit to student
          socket.emit('request_submitted', formattedRequest);

          console.log(`New clearance request submitted by ${socket.user.name}`);

        } catch (error) {
          console.error('Error submitting clearance request:', error);
          socket.emit('error', { message: 'Failed to submit clearance request' });
        }
      });

      // Handle department status updates
      socket.on('status_update', async (updateData: {
        requestId: string;
        department: 'library' | 'finance' | 'accommodation' | 'dean' | 'registrar' | 'department';
        status: 'approved' | 'rejected';
        comment?: string;
      }) => {
        try {
          const { requestId, department, status, comment } = updateData;

          // Validate staff permissions
          if (socket.user?.accountType !== 'staff' || socket.user.department !== department) {
            socket.emit('error', { message: 'Unauthorized to update this department' });
            return;
          }

          const clearanceRequest = await ClearanceRequest.findById(requestId);
          if (!clearanceRequest) {
            socket.emit('error', { message: 'Clearance request not found' });
            return;
          }

          const oldOverallStatus = clearanceRequest.overallStatus;

          // Fetch staff signature from DB
          const staffUser = await User.findById(socket.userId).select('signature');

          // Update department status
          const deptClearances = clearanceRequest.departmentClearances as Record<string, DepartmentClearance>;
          deptClearances[department] = {
            status,
            timestamp: new Date(),
            staffId: socket.userId,
            staffName: socket.user!.name,
            staffSignature: staffUser?.signature,
            comment
          };

          // Update overall status
          const requestWithMethod = clearanceRequest as any;
          if (typeof requestWithMethod.updateOverallStatus === 'function') {
            requestWithMethod.updateOverallStatus();
          }
          await clearanceRequest.save();

          // Trigger email notification if clearance is completed or rejected
          if (
            (clearanceRequest.overallStatus === 'completed' || clearanceRequest.overallStatus === 'rejected') && 
            clearanceRequest.overallStatus !== oldOverallStatus
          ) {
            try {
              // Populate student info to get email
              const populatedRequest = await ClearanceRequest.findById(clearanceRequest._id).populate('studentId', 'name email');
              const student = populatedRequest?.studentId as any;
              
              if (student && student.email) {
                const deptUpdates = Object.entries(clearanceRequest.departmentClearances).map(([key, value]: [string, any]) => ({
                  name: key.charAt(0).toUpperCase() + key.slice(1),
                  status: value.status,
                  comment: value.comment
                }));

                await emailService.sendClearanceStatusUpdateEmail(
                  student.email,
                  student.name,
                  clearanceRequest.overallStatus,
                  deptUpdates
                );
                console.log(`✅ [Socket] Clearance completion email sent to student: ${student.email}`);
              }
            } catch (emailError) {
              console.error('⚠️ [Socket] Failed to send clearance update email:', emailError);
            }
          }

          const updatedRequest = clearanceRequest.toObject();

          // Emit to all connected clients
          this.io.emit('status_changed', {
            requestId,
            department,
            status,
            updatedRequest,
            updatedBy: socket.user!.name,
            timestamp: new Date()
          });

          // Emit specific updates
          this.io.to(`user_${clearanceRequest.studentId}`).emit('your_request_updated', updatedRequest);
          this.io.to(`department_${department}`).emit('department_request_updated', updatedRequest);

          console.log(`Department ${department} updated request ${requestId} to ${status} by ${socket.user.name}`);

        } catch (error) {
          console.error('Error updating status:', error);
          socket.emit('error', { message: 'Failed to update status' });
        }
      });

      // Handle getting user's clearance requests
      socket.on('get_my_requests', async () => {
        try {
          const requests = await ClearanceRequest.find({ studentId: socket.userId })
            .sort({ submittedAt: -1 });
          
          socket.emit('my_requests', requests);
        } catch (error) {
          console.error('Error fetching requests:', error);
          socket.emit('error', { message: 'Failed to fetch requests' });
        }
      });

      // Handle getting department requests (for staff)
      socket.on('get_department_requests', async () => {
        try {
          if (socket.user?.accountType !== 'staff') {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          const requests = await ClearanceRequest.find({})
            .sort({ submittedAt: -1 })
            .limit(50); // Limit for performance
          
          socket.emit('department_requests', requests);
        } catch (error) {
          console.error('Error fetching department requests:', error);
          socket.emit('error', { message: 'Failed to fetch requests' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user?.name} (${socket.userId})`);
        this.connectedUsers.delete(socket.userId!);
      });

      // Send initial data
      socket.emit('connected', {
        message: 'Connected to clearance system',
        user: socket.user
      });
    });
  }

  // Method to broadcast system notifications
  public broadcastNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.io.emit('system_notification', {
      message,
      type,
      timestamp: new Date()
    });
  }

  // Method to get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}
