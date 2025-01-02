import express from 'express';
import apiRouter from './routes/apiRouter.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Rutas API
app.use('/api', apiRouter);

// Log de rutas al iniciar
console.log('Configurando aplicación...');

export default app;


