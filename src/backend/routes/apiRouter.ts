import { Router } from 'express';
import userRouter from './userRouter.js';
import messageRouter from './messageRouter.js';

const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/messages', messageRouter);

export default apiRouter;