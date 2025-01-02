import pool from '../config/configDb.js';
import { Request, Response, RequestHandler, NextFunction } from 'express';
import * as userModel from '../models/userModel.js';
import { User } from '../types/user.js';

interface CreateUserResponse {
    status: string;
    data?: {
        id: number;
        userName: string;
        email: string;
    };
    redirect?: string;
    message?: string;
}

type AsyncRequestHandler<P = {}, ResBody = any, ReqBody = any> = (
    req: Request<P, ResBody, ReqBody>,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<void>;

interface LoginResponse {
    message: string;
    user?: {
        id: number;
        userName: string;
        email: string;
    };
    debug?: {
        provided: string;
        stored: string;
        note?: string;
    };
}

function validatePassword(password: string): { isValid: boolean; message: string } {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: `La contraseña debe tener al menos ${minLength} caracteres` };
    }
    if (!hasUpperCase) {
        return { isValid: false, message: "La contraseña debe tener al menos una mayúscula" };
    }
    if (!hasLowerCase) {
        return { isValid: false, message: "La contraseña debe tener al menos una minúscula" };
    }
    if (!hasNumbers) {
        return { isValid: false, message: "La contraseña debe tener al menos un número" };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: "La contraseña debe tener al menos un carácter especial" };
    }

    return { isValid: true, message: "Contraseña válida" };
}

export const getAllUsers: RequestHandler = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        console.log('Usuarios encontrados:', users);
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            status: "error",
            message: "Error al obtener usuarios" 
        });
    }
};

export const getUserById: RequestHandler = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: "Error al obtener usuario" });
    }
};

export const createUser: AsyncRequestHandler<{}, CreateUserResponse, User> = async (req, res, next) => {
    try {
        const { userName, name, first_surname, email, password } = req.body;
        
        if (!userName || !name || !first_surname || !email || !password) {
            res.status(400).json({
                status: "error",
                message: "Todos los campos son requeridos"
            });
        } else {
            // Validar contraseña
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                res.status(400).json({
                    status: "error",
                    message: passwordValidation.message
                });
                return;
            }

            try {
                const newUser = await userModel.createUser({
                    userName, name, first_surname, email, password
                });

                if (!newUser.id) {
                    throw new Error('Usuario creado sin ID');
                }

                res.status(201).json({
                    status: "success",
                    data: {
                        id: newUser.id,
                        userName: newUser.userName,
                        email: newUser.email
                    },
                    redirect: '/chat.html'
                });
            } catch (error: any) {
                if (error.constraint === 'user_userName_key') {
                    res.status(400).json({
                        status: "error",
                        message: "Este nombre de usuario ya está en uso. Por favor, elige otro."
                    });
                } else if (error.constraint === 'user_email_key') {
                    res.status(400).json({
                        status: "error",
                        message: "Este email ya está registrado. Por favor, usa otro o inicia sesión."
                    });
                } else {
                    throw error;
                }
            }
        }
    } catch (error) {
        next(error);
    }
};

export const deleteUser: RequestHandler = async (req, res) => {
    try {
        const result = await userModel.deleteUser(req.params.id);
        if (result.success) {
            res.json({ message: result.message });
        } else {
            res.status(404).json({ message: result.message });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
};

export const updateUser: RequestHandler = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        console.log('Intentando actualizar usuario:', { userId, userData });

        const updatedUser = await userModel.updateUser(userId, userData);

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

export const loginUser: AsyncRequestHandler<{}, LoginResponse> = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('\n--- Intento de Login ---');
        console.log('Email recibido:', email);
        console.log('Password recibido:', password);

        if (!email || !password) {
            res.status(400).json({ message: "Email y contraseña son requeridos" });
        } else {
            const queryString = `SELECT * FROM "user" WHERE email = $1`;
            const result = await pool.query(queryString, [email]);
            
            console.log('\nResultado de la consulta:', {
                encontrado: result.rows.length > 0,
                usuario: result.rows[0] ? {
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                    password: result.rows[0].password,
                    userName: result.rows[0].userName
                } : null
            });

            const user = result.rows[0];

            if (!user) {
                res.status(401).json({ message: "Usuario no encontrado" });
            } else if (user.password !== password) {
                console.log('\nAnálisis detallado de contraseñas:');
                console.log('Proporcionada:', {
                    valor: password,
                    longitud: password.length,
                    caracteres: [...password].map(c => ({ char: c, code: c.charCodeAt(0) }))
                });
                console.log('Almacenada:', {
                    valor: user.password,
                    longitud: user.password.length,
                    caracteres: [...user.password].map(c => ({ char: c, code: c.charCodeAt(0) }))
                });
                console.log('¿Coinciden?:', password === user.password);
                
                res.status(401).json({ 
                    message: "Contraseña incorrecta",
                    debug: { 
                        provided: password,
                        stored: user.password,
                        note: "Revisa que no haya espacios extra o mayúsculas/minúsculas incorrectas"
                    }
                });
            } else {
                res.json({
                    message: "Login exitoso",
                    user: {
                        id: user.id,
                        userName: user.userName,
                        email: user.email
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error en login:', error);
        next(error);
    }
};
