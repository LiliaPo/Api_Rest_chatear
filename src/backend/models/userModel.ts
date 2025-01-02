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

        // Obtener el usuario actual primero
        const currentUser = await getUserById(userId);
        if (!currentUser) {
            return null;
        }

        const values = [
            data.userName || currentUser.userName,
            data.name || currentUser.name,
            data.first_surname || currentUser.first_surname,
            data.email || currentUser.email,
            userId
        ];

        console.log('Actualizando usuario:', {
            userId,
            currentValues: currentUser,
            newValues: values
        });

        const result = await pool.query(queryString, values);
        
        if (result.rowCount && result.rowCount > 0) {
            console.log('Usuario actualizado:', result.rows[0]);
            return result.rows[0];
        }

        return null;
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
}

export async function createUser(userData: User): Promise<User> {
    try {
        console.log('Iniciando creación de usuario:', userData);

        const query = `
            INSERT INTO "user" ("userName", "name", "first_surname", "email", "password")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        
        const values = [
            userData.userName,
            userData.name,
            userData.first_surname,
            userData.email,
            userData.password
        ];

        console.log('Ejecutando query con valores:', {
            query,
            values: { ...values, password: '***' } // Ocultar contraseña en logs
        });

        const result = await pool.query(query, values);
        
        if (result.rows[0]) {
            console.log('Usuario creado exitosamente:', {
                ...result.rows[0],
                password: '***'
            });
            return result.rows[0];
        }

        throw new Error('No se pudo crear el usuario');
    } catch (error) {
        console.error('Error en createUser:', error);
        throw error;
    }
}
