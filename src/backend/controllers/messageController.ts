import { Request, Response, RequestHandler, NextFunction } from 'express';
import * as messageModel from '../models/messageModel.js';

type AsyncRequestHandler<P = {}, ResBody = any, ReqBody = any> = (
    req: Request<P, ResBody, ReqBody>,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<void>;

interface MessageSuccess {
    id?: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at?: Date;
    read?: boolean;
}

interface MessageError {
    message: string;
    debug?: any;
}

type MessageResponse = MessageSuccess | MessageError;

export const sendMessage: AsyncRequestHandler<{}, MessageResponse> = async (req, res, next) => {
    try {
        console.log('Recibiendo mensaje:', req.body);
        const { senderId, receiverId, content } = req.body;

        if (!senderId || !receiverId || !content) {
            res.status(400).json({ 
                message: "Faltan datos requeridos",
                debug: { received: req.body }
            });
        } else {
            const message = await messageModel.createMessage({
                sender_id: parseInt(senderId),
                receiver_id: parseInt(receiverId),
                content: content.trim()
            });

            console.log('Mensaje creado:', message);
            res.status(201).json(message);
        }
    } catch (error) {
        next(error);
    }
};

export const getMessages: RequestHandler = async (req, res) => {
    try {
        const currentUserId = parseInt(req.params.userId);
        const otherUserId = parseInt(req.params.otherId);
        
        const messages = await messageModel.getMessagesBetweenUsers(currentUserId, otherUserId);
        res.json(messages);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ message: "Error al obtener mensajes" });
    }
}; 