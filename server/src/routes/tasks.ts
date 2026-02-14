import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, adminMiddleware, createTask);
router.put('/:id', authMiddleware, adminMiddleware, updateTask);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTask);

export default router;
