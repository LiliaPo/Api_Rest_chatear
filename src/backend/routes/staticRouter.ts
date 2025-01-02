import { Router } from 'express';
import { publicPath } from '../config/configData.js';
import path from 'path';

const staticRouter = Router();

// Redirigir la raíz al login
staticRouter.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Rutas estáticas
staticRouter.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

staticRouter.get('/newUser', (req, res) => {
    res.sendFile(path.join(publicPath, 'newUser.html'));
});

staticRouter.get('/server', (req, res) => {
    res.sendFile(path.join(publicPath, 'server.html'));
});

staticRouter.get('/notifications', (req, res) => {
    res.sendFile(path.join(publicPath, 'notifications.html'));
});

staticRouter.get('/userMessages', (req, res) => {
    res.sendFile(path.join(publicPath, 'userMessages.html'));
});

staticRouter.get('/conversation', (req, res) => {
    res.sendFile(path.join(publicPath, 'conversation.html'));
});

staticRouter.get('/chat', (req, res) => {
    res.sendFile(path.join(publicPath, 'chat.html'));
});

export { staticRouter };

