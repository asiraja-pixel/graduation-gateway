import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  accountType: 'student' | 'staff';
  program?: string;
  department?: string;
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
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
