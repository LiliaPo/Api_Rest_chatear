import { Router } from 'express';
import userRouter from './userRouter.js';
import messageRouter from './messageRouter.js';
import notificationRouter from './notificationRouter.js';

const apiRouter = Router();

// Rutas API
apiRouter.use('/messages', messageRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/notifications', notificationRouter);

export default apiRouter;