import Express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, loginUser } from '../controllers/userController.js';

const userRouter = Express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
userRouter.put('/:id', updateUser);  // Sin middleware de validación
userRouter.delete('/:id', deleteUser);

export default userRouter;

