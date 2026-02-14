import express from 'express';
import {
  getAssignments,
  createAssignment,
  deleteAssignment
} from '../controllers/assignmentController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getAssignments);
router.post('/', authMiddleware, adminMiddleware, createAssignment);
router.delete('/:id', authMiddleware, adminMiddleware, deleteAssignment);

export default router;
