import app from './app.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
    console.log('\nRutas API disponibles:');
    console.log('GET    /api/messages/between/:userId1/:userId2');
    console.log('GET    /api/messages/:userId');
    console.log('POST   /api/messages');
    console.log('GET    /api/users');
    console.log('POST   /api/users');
    console.log('POST   /api/notifications');
}); 