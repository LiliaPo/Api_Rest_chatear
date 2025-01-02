import { Request, Response, NextFunction } from 'express';
import * as notificationModel from '../models/notificationModel.js';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const sendNotification: AsyncHandler = async (req, res, next) => {
    try {
        const { userIds, message } = req.body;

        if (!userIds?.length || !message) {
            res.status(400).json({ message: "Se requieren destinatarios y mensaje" });
            return;
        }

        const notifications = await Promise.all(
            userIds.map((userId: number) => 
                notificationModel.createNotification({
                    sender_id: 1,
                    receiver_id: userId,
                    content: message
                })
            )
        );

        res.status(201).json({
            message: "Notificaciones enviadas correctamente",
            notifications
        });
    } catch (error) {
        next(error);
    }
};

export async function getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
        const userId = parseInt(req.params.userId);
        console.log('Buscando notificaciones para usuario:', userId); // Para debugging
        
        const notifications = await notificationModel.getUserNotifications(userId);
        res.json(notifications);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: "Error al obtener las notificaciones" });
    }
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
        const userId = parseInt(req.params.userId);
        const notificationId = parseInt(req.params.notificationId);
        console.log('Marcando como leída:', { userId, notificationId }); // Para debugging
        
        await notificationModel.markNotificationAsRead(userId, notificationId);
        res.json({ message: "Notificación marcada como leída" });
    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({ message: "Error al marcar la notificación" });
    }
}
