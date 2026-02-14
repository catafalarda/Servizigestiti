import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskAssignment extends Document {
  taskDefinitionId: mongoose.Types.ObjectId;
  assignedUserId: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskAssignmentSchema = new Schema<ITaskAssignment>(
  {
    taskDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskDefinition',
      required: true
    },
    assignedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

taskAssignmentSchema.index({ taskDefinitionId: 1, date: 1 });
taskAssignmentSchema.index({ assignedUserId: 1, date: 1 });

export const TaskAssignment = mongoose.model<ITaskAssignment>(
  'TaskAssignment',
  taskAssignmentSchema
);
