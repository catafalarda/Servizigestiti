import mongoose, { Schema, Document } from 'mongoose';

export enum ExecutionStatus {
  PENDING = 'PENDING',
  OK = 'OK',
  KO = 'KO'
}

export interface IExecutionLog extends Document {
  assignmentId: mongoose.Types.ObjectId;
  status: ExecutionStatus;
  notes: string;
  completedByUserId: mongoose.Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const executionLogSchema = new Schema<IExecutionLog>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskAssignment',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ExecutionStatus),
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    completedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

executionLogSchema.index({ assignmentId: 1 });
executionLogSchema.index({ completedByUserId: 1, timestamp: 1 });

export const ExecutionLog = mongoose.model<IExecutionLog>(
  'ExecutionLog',
  executionLogSchema
);
