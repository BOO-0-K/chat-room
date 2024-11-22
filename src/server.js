import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { addUser, removeUser, getUser, getUsers } from './utils/users.js';
import { generateMessage } from './utils/messages.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath, {
    extensions: ['html']
}));

io.on('connection', (socket) => {
    console.log(`👂 새로운 웹소켓(${socket.id})을 연결합니다.`);

    // 유저 입장
    socket.on('join', (data, callback) => {
        const { error, user } = addUser({ id: socket.id, ...data });
        
        if (error) {
            return callback(error);
        }

        socket.join(user.code);

        // 유저 전송
        socket.emit('message', generateMessage('관리자', `${user.name} 님 안녕하세요, 채팅방(${user.code})에 오신 걸 환영합니다.`));
        // 유저 제외 전송
        socket.broadcast.to(user.code).emit('message', generateMessage('관리자', `${user.name} 님이 입장하였습니다.`));

        // 전체 전송
        io.to(user.code).emit('code', {
            code: user.code,
            users: getUsers(user.code)
        });
    });

    // 채팅 전송
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);  // 전송한 유저

        console.log(`🗣 ${user.name}: ${message}`);

        // 전체 전송
        io.to(user.code).emit('message', generateMessage(user.name, message));

        callback();
    });

    // 유저 퇴장
    socket.on('disconnect', () => {
        console.log(`🚪 웹소켓(${socket.id})을 해제합니다.`);
        
        const user = removeUser(socket.id);  // 나간 유저

        if (user) {
            // 전체 전송
            io.to(user.code).emit('message', generateMessage('관리자', `${user.name} 님이 나갔습니다.`));

            // 전체 전송
            io.to(user.code).emit('code', {
                code: user.code,
                users: getUsers(user.code)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`🚀 서버(포트 ${port})를 실행합니다.`);
});