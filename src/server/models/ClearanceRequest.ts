import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartmentClearance {
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: Date;
  staffId?: string;
  staffName?: string;
  comment?: string;
}

export interface IClearanceRequest extends Document {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  program?: string;
  overallStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  departmentClearances: {
    library: IDepartmentClearance;
    finance: IDepartmentClearance;
    accommodation: IDepartmentClearance;
    it: IDepartmentClearance;
    academic: IDepartmentClearance;
  };
  submittedAt: Date;
  lastUpdated: Date;
}

const DepartmentClearanceSchema = new Schema<IDepartmentClearance>({
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  timestamp: Date,
  staffId: String,
  staffName: String,
  comment: String
});

const ClearanceRequestSchema = new Schema<IClearanceRequest>({
  studentId: {
    type: String,
    required: true,
    ref: 'User'
  },
  studentName: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  program: String,
  overallStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  departmentClearances: {
    library: { type: DepartmentClearanceSchema, default: {} },
    finance: { type: DepartmentClearanceSchema, default: {} },
    accommodation: { type: DepartmentClearanceSchema, default: {} },
    it: { type: DepartmentClearanceSchema, default: {} },
    academic: { type: DepartmentClearanceSchema, default: {} }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance
ClearanceRequestSchema.index({ studentId: 1 });
ClearanceRequestSchema.index({ registrationNumber: 1 });
ClearanceRequestSchema.index({ overallStatus: 1 });

// Method to update overall status based on department clearances
ClearanceRequestSchema.methods.updateOverallStatus = function() {
  const departments = Object.keys(this.departmentClearances);
  const statuses = departments.map(dept => this.departmentClearances[dept].status);
  
  const allApproved = statuses.every(status => status === 'approved');
  const anyRejected = statuses.some(status => status === 'rejected');
  const anyInProgress = statuses.some(status => status === 'approved') && !allApproved;
  
  if (anyRejected) {
    this.overallStatus = 'rejected';
  } else if (allApproved) {
    this.overallStatus = 'completed';
  } else if (anyInProgress) {
    this.overallStatus = 'in_progress';
  } else {
    this.overallStatus = 'pending';
  }
  
  this.lastUpdated = new Date();
};

export const ClearanceRequest = mongoose.model<IClearanceRequest>('ClearanceRequest', ClearanceRequestSchema);
