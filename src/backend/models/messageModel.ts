import pool from "../config/configDb.js";

export interface Message {
    id?: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at?: Date;
    read?: boolean;
}

export async function createMessage(message: Message): Promise<Message> {
    try {
        const query = `
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        
        const values = [message.sender_id, message.receiver_id, message.content];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error en createMessage:', error);
        throw error;
    }
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    try {
        const query = `
            SELECT 
                id,
                sender_id as "senderId",
                receiver_id as "receiverId",
                content,
                timestamp,
                read
            FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2)
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY timestamp ASC;
        `;
        
        const result = await pool.query(query, [userId1, userId2]);
        console.log('Mensajes encontrados:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error en getMessagesBetweenUsers:', error);
        throw error;
    }
} 