import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const messageRouter = Router();

messageRouter.post('/', sendMessage);
messageRouter.get('/:userId/:otherId', getMessages);

export default messageRouter; 