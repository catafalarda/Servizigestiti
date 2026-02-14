import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'Admin',
  SERVICE_MANAGER = 'Service Manager',
  TEAM_LEADER = 'Team Leader',
  OPERATOR = 'Operatore'
}

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.OPERATOR
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
