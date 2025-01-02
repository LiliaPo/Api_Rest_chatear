import { Router } from 'express';
import { sendNotification } from '../controllers/notificationController.js';

const notificationRouter = Router();

notificationRouter.post('/', sendNotification);

export default notificationRouter;