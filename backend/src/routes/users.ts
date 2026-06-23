import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import { protect } from '../middlewares/auth.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';

const router = Router();

// protect all routes below this line
router.use(protect);

router.get('/',       getAllUsers);
router.get('/:id',    getUserById);
router.post('/',      validate(createUserSchema), createUser);
router.put('/:id',    validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;