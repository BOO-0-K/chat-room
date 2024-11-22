const socket = io();

// Elements
const sidebar = document.querySelector('#sidebar');
const messages = document.querySelector('#messages');
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');

// Templetes
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const messageTemplate = document.querySelector('#message-template').innerHTML;

const query = new URLSearchParams(location.search);
const name = query.get('name');
const code = query.get('code');

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

// 입장 (클라이언트 -> 서버)
socket.emit('join', { name, code }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
})

// 입장 (서버 -> 클라이언트) : 사이드 바 정보 변경
socket.on('code', ({ code, users }) => {
   const html = Mustache.render(sidebarTemplate, { code, users });
   sidebar.innerHTML = html;
});

// 입장 (서버 -> 클라이언트) : 환영 메세지 전송
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        name: message.name,
        message: message.text,
        createdAt: moment(message.createdAt).format('YYYY년 MM월 DD일 HH시 mm분')
    });
    messages.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
});

// 채팅 전송
messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    messageFormButton.setAttribute('disabled', 'disabled');

    const message = event.target.elements.message.value;

    // 전송 (클라이언트 -> 서버)
    socket.emit('sendMessage', message, (error) => {
        messageFormButton.removeAttribute('disabled');
        messageFormInput.value = '';
        messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
    });
});