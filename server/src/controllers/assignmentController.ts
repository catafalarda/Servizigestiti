import { Request, Response } from 'express';
import { TaskAssignment } from '../models/TaskAssignment';

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, userId } = req.query;
    const filter: any = {};

    if (date) filter.date = new Date(date as string);
    if (userId) filter.assignedUserId = userId;

    const assignments = await TaskAssignment.find(filter)
      .populate('taskDefinitionId')
      .populate('assignedUserId', '-password')
      .sort({ date: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = new TaskAssignment(req.body);
    await assignment.save();
    await assignment.populate('taskDefinitionId');
    await assignment.populate('assignedUserId', '-password');
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create assignment' });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await TaskAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};
