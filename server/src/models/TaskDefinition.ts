import mongoose, { Schema, Document } from 'mongoose';

export enum TaskFrequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  SPECIFIC = 'Specific'
}

export interface ITaskDefinition extends Document {
  title: string;
  description: string;
  frequency: TaskFrequency;
  startDate: Date;
  scheduledTime: string;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskDefinitionSchema = new Schema<ITaskDefinition>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      enum: Object.values(TaskFrequency),
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    scheduledTime: {
      type: String,
      required: true,
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    },
    endDate: {
      type: Date
    }
  },
  { timestamps: true }
);

export const TaskDefinition = mongoose.model<ITaskDefinition>(
  'TaskDefinition',
  taskDefinitionSchema
);
