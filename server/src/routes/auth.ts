import express from 'express';
import { login, getCurrentUser, getUsers } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.get('/user', authMiddleware, getCurrentUser);
router.get('/users', authMiddleware, getUsers);

export default router;
