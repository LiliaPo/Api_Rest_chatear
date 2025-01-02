import Express from 'express';
import { publicPath } from './config/configData.js';
import { staticRouter } from './routes/staticRouter.js';
import routerApi from './routes/apiRouter.js';

const app = Express();
const port = 3000;

// Importar las rutas
import notificationsRoutes from './routes/notificationRouter.js';
import usersRoutes from './routes/userRouter.js';

app.use(Express.urlencoded({ extended: true }));    
app.use(Express.static(publicPath));

// Middlewares
app.use(Express.json()); // Para manejar JSON en las peticiones

app.use("/", staticRouter);
app.use("/api/v1/", routerApi);

// Configurar las rutas
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);

app.listen(port, function () {
    console.log(`Example app listening on port ${port}`);
});

export default app;


