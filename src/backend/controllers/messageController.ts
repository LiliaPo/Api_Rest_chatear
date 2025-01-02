import { RequestHandler } from 'express';
import * as messageModel from '../models/messageModel.js';

export const sendMessage: RequestHandler = async (req, res) => {
    try {
        const message = await messageModel.createMessage(req.body);
        res.status(201).json(message);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ message: "Error al enviar mensaje" });
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