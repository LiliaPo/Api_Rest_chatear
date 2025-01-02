import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, loginUser, toggleUserStatus } from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);
userRouter.put('/:userId/toggle-status', toggleUserStatus);

export default userRouter;

