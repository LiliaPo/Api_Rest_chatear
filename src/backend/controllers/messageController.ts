import { Request, Response, RequestHandler } from 'express';
import pool from '../config/configDb.js';

export const createMessage: RequestHandler = async (req, res) => {
    try {
        const { sender_id, receiver_id, content } = req.body;
        console.log('Creando mensaje:', { sender_id, receiver_id, content });

        const query = `
            INSERT INTO messages (sender_id, receiver_id, content, created_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const result = await pool.query(query, [sender_id, receiver_id, content]);
        const newMessage = result.rows[0];
        
        // Devolver el mensaje con formato para mostrar inmediatamente
        res.status(201).json({
            message: "Mensaje enviado",
            data: {
                ...newMessage,
                isOwnMessage: true
            }
        });
    } catch (error) {
        console.error('Error al crear mensaje:', error);
        res.status(500).json({ message: "Error al crear mensaje" });
    }
};

export const getMessagesByUser: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT * FROM messages 
            WHERE sender_id = $1 OR receiver_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ message: "Error al obtener mensajes" });
    }
};

export const getMessagesBetweenUsers: RequestHandler = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        console.log('Obteniendo mensajes entre usuarios:', userId1, userId2);

        const query = `
            SELECT m.*, 
                   u1.username as sender_name,
                   u2.username as receiver_name
            FROM messages m
            JOIN "user" u1 ON m.sender_id = u1.id
            JOIN "user" u2 ON m.receiver_id = u2.id
            WHERE (sender_id = $1 AND receiver_id = $2)
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `;
        
        const result = await pool.query(query, [userId1, userId2]);
        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ message: "Error al obtener mensajes" });
    }
}; 