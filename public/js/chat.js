class ChatManager {
    constructor() {
        this.currentUserId = localStorage.getItem('userId');
        this.currentUserName = localStorage.getItem('userName');
        this.selectedUserId = null;
        this.chats = new Map(); // Almacena los mensajes por usuario

        this.initializeElements();
        this.loadUsers();
        this.setupEventListeners();
    }

    initializeElements() {
        this.usersList = document.getElementById('usersList');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatHeader = document.getElementById('chatHeader');
        this.messageForm = document.getElementById('messageForm');
        this.messageInput = document.getElementById('messageInput');
    }

    setupEventListeners() {
        this.messageForm.addEventListener('submit', (e) => this.handleMessageSubmit(e));
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            
            this.usersList.innerHTML = users
                .filter(user => user.id !== this.currentUserId)
                .map(user => this.createUserElement(user))
                .join('');
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    }

    createUserElement(user) {
        return `
            <div class="user-item" data-user-id="${user.id}" onclick="chatManager.selectUser(${user.id}, '${user.userName}')">
                <strong>${user.userName}</strong>
                <div class="text-muted small">${user.name} ${user.first_surname}</div>
            </div>
        `;
    }

    selectUser(userId, userName) {
        this.selectedUserId = userId;
        this.chatHeader.innerHTML = `<h5>${userName}</h5>`;
        
        // Marcar usuario seleccionado
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.userId === userId.toString()) {
                item.classList.add('active');
            }
        });

        this.loadChat(userId);
    }

    async loadChat(userId) {
        if (!this.chats.has(userId)) {
            // Cargar mensajes del backend
            try {
                const response = await fetch(`/api/messages/${userId}`);
                const messages = await response.json();
                this.chats.set(userId, messages);
            } catch (error) {
                console.error('Error cargando mensajes:', error);
                this.chats.set(userId, []);
            }
        }

        this.displayMessages(userId);
    }

    displayMessages(userId) {
        const messages = this.chats.get(userId) || [];
        this.chatMessages.innerHTML = messages.map(msg => this.createMessageElement(msg)).join('');
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    createMessageElement(message) {
        const isOwnMessage = message.sender_id === parseInt(this.currentUserId);
        const time = new Date(message.created_at).toLocaleTimeString('es', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="message ${isOwnMessage ? 'sent' : 'received'}">
                <div class="message-content">${message.content}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
    }

    async handleMessageSubmit(e) {
        e.preventDefault();
        if (!this.selectedUserId || !this.messageInput.value.trim()) return;

        const messageData = {
            sender_id: parseInt(this.currentUserId),
            receiver_id: parseInt(this.selectedUserId),
            content: this.messageInput.value.trim()
        };

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            const result = await response.json();

            if (response.ok) {
                // Usar el mensaje devuelto por el servidor en lugar del messageData
                const messages = this.chats.get(this.selectedUserId) || [];
                messages.push(result.data); // Usar result.data que incluye id y created_at
                this.chats.set(this.selectedUserId, messages);
                this.displayMessages(this.selectedUserId);
                this.messageInput.value = '';
                
                // Auto-scroll al último mensaje
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            } else {
                alert(result.message || 'Error al enviar mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar mensaje');
        }
    }
}

// Inicializar el chat
const chatManager = new ChatManager(); 