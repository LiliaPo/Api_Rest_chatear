import { Router } from 'express';
import { createMessage, getMessagesByUser, getMessagesBetweenUsers } from '../controllers/messageController.js';

const messageRouter = Router();

// Rutas específicas primero
messageRouter.get('/between/:userId1/:userId2', getMessagesBetweenUsers);
messageRouter.get('/:userId', getMessagesByUser);
messageRouter.post('/', createMessage);

export default messageRouter; 