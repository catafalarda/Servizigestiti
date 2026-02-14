import express from 'express';
import { getLogs, createLog } from '../controllers/logController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getLogs);
router.post('/', authMiddleware, createLog);

export default router;
