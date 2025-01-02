import { Server, Socket } from 'socket.io';

export function setupChat(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('Usuario conectado');

        socket.on('chat message', (msg) => {
            socket.broadcast.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.log('Usuario desconectado');
        });
    });
} 