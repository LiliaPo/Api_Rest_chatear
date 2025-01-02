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

export const loginUser: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email y contraseña son requeridos" });
            return;
        }

        const queryString = `SELECT * FROM "user" WHERE email = $1`;
        const result = await pool.query(queryString, [email]);
        const user = result.rows[0];

        if (!user || user.password !== password) {
            res.status(401).json({ message: "Email o contraseña incorrectos" });
            return;
        }

        res.json({
            message: "Login exitoso",
            user: {
                id: user.id,
                userName: user.userName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};
