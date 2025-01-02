import pool from "../config/configDb.js";

export interface Notification {
    id?: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at?: Date;
    read?: boolean;
}

export async function createNotification(notification: Notification): Promise<Notification> {
    try {
        const query = `
            INSERT INTO notifications (sender_id, receiver_id, content, created_at, read)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, false)
            RETURNING *;
        `;
        
        const values = [notification.sender_id, notification.receiver_id, notification.content];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error en createNotification:', error);
        throw error;
    }
}

// Asignar notificación a usuario
export async function assignNotificationToUser(userId: number, notificationId: number): Promise<void> {
    const queryString = `
        INSERT INTO user_notifications (user_id, notification_id, read)
        VALUES ($1, $2, false)`;
    await pool.query(queryString, [userId, notificationId]);
}

// Obtener notificaciones de usuario
export async function getUserNotifications(userId: number): Promise<Notification[]> {
    const queryString = `
        SELECT n.*, un.read
        FROM notifications n
        JOIN user_notifications un ON n.id = un.notification_id
        WHERE un.user_id = $1
        ORDER BY n.created_at DESC`;
    const result = await pool.query(queryString, [userId]);
    return result.rows;
}

// Marcar notificación como leída
export async function markNotificationAsRead(userId: number, notificationId: number): Promise<void> {
    const queryString = `
        UPDATE user_notifications
        SET read = true
        WHERE user_id = $1 AND notification_id = $2`;
    await pool.query(queryString, [userId, notificationId]);
}

export async function getNotificationById(id: number): Promise<Notification | null> {
    const queryString = `SELECT * FROM notifications WHERE id = $1`;
    const result = await pool.query(queryString, [id]);
    return result.rows[0] || null;
} 