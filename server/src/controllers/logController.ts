import { Request, Response } from 'express';
import { ExecutionLog } from '../models/ExecutionLog';

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, userId, startDate, endDate } = req.query;
    const filter: any = {};

    if (assignmentId) filter.assignmentId = assignmentId;
    if (userId) filter.completedByUserId = userId;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await ExecutionLog.find(filter)
      .populate('assignmentId')
      .populate('completedByUserId', '-password')
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

export const createLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = new ExecutionLog({
      ...req.body,
      completedByUserId: req.userId
    });
    await log.save();
    await log.populate('assignmentId');
    await log.populate('completedByUserId', '-password');
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create log' });
  }
};
