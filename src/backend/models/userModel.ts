import pool from "../config/configDb.js";

export interface User {
    id?: number;
    userName: string;
    name: string;
    first_surname: string;
    email: string;
    password: string;
}

export interface DeleteResult {
    success: boolean;
    message: string;
    rowsAffected?: number;
}

// Obtener todos los usuarios
export async function getAllUsers(): Promise<User[]> {
    try {
        const queryString = 'SELECT * FROM "user" ORDER BY id ASC';
        const result = await pool.query(queryString);
        return result.rows;
    } catch (error) {
        console.error('Error en getAllUsers:', error);
        throw error;
    }
}

// Obtener usuario por ID
export async function getUserById(userId: string): Promise<User | null> {
    const queryString = `SELECT * FROM "user" WHERE id = $1`;
    const result = await pool.query(queryString, [userId]);
    return result.rows[0] || null;
}

// Guardar nuevo usuario
export async function saveNewUser(data: User): Promise<User> {
    try {
        const queryString = `
            INSERT INTO "user" ("userName", "name", "first_surname", "password", "email") 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`;
        
        const values = [
            data.userName,
            data.name,
            data.first_surname,
            data.password,
            data.email
        ];

        const result = await pool.query(queryString, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error en saveNewUser:', error);
        throw error;
    }
}

// Eliminar usuario
export async function deleteUser(userId: string): Promise<DeleteResult> {
    try {
        const queryString = `DELETE FROM "user" WHERE id = $1 RETURNING *`;
        const result = await pool.query(queryString, [userId]);
        
        return {
            success: result.rowCount ? result.rowCount > 0 : false,
            message: result.rowCount && result.rowCount > 0 
                ? "Usuario eliminado correctamente" 
                : "Usuario no encontrado",
            rowsAffected: result.rowCount || 0
        };
    } catch (error) {
        return {
            success: false,
            message: "Error al eliminar usuario"
        };
    }
}

// Actualizar usuario
export async function updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    try {
        // Convertir el ID a número y verificar que es válido
        const id = parseInt(userId);
        if (isNaN(id)) {
            throw new Error('ID inválido');
        }

        const queryString = `
            UPDATE "user" 
            SET 
                "userName" = $1,
                "name" = $2,
                "first_surname" = $3,
                "email" = $4
            WHERE id = $5
            RETURNING *;
        `;

        const values = [
            data.userName,
            data.name,
            data.first_surname,
            data.email,
            id  // Usamos el ID convertido a número
        ];

        const result = await pool.query(queryString, values);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
}

export const createUser = async (userData: any) => {
    const { userName, name, first_surname, email, password } = userData;
    const query = `
        INSERT INTO "user" (userName, name, first_surname, email, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [userName, name, first_surname, email, password];
    const result = await pool.query(query, values);
    return result.rows[0];
};
