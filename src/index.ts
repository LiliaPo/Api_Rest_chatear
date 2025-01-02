import Express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { errorHandler } from './backend/middlewares/errorHandler.js';
import userRouter from './backend/routes/userRouter.js';
import messageRouter from './backend/routes/messageRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(Express.static(path.join(__dirname, '../public')));

// Rutas API
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

// Ruta principal redirige a login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Manejo de errores
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});