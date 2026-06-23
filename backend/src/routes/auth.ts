import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { protect } from '../middlewares/auth.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/logout',   protect,                  logout);

export default router;