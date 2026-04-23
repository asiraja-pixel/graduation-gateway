import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  accountType: 'student' | 'staff' | 'admin';
  program?: string;
  department?: string;
  nationality?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  startYear?: string;
  endYear?: string;
  signature?: string; // Base64 signature for staff
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['student', 'staff', 'admin']
  },
  program: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  department: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'staff';
    }
  },
  nationality: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  gender: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  phoneNumber: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  address: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  startYear: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  endYear: {
    type: String,
    required: function(this: IUser) {
      return this.accountType === 'student';
    }
  },
  signature: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
