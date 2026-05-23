document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const chatForm = document.getElementById('chat-form');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const logoutBtn = document.getElementById('logout-btn');
    const termsLink = document.getElementById('terms-link');
    const termsModal = document.getElementById('terms-modal');
    const closeTerms = document.getElementById('close-terms');

    const navItems = document.querySelectorAll('.nav-item');
    const chatView = document.getElementById('chat-messages');
    const mapView = document.getElementById('map-view');
    const knowledgeView = document.getElementById('knowledge-view');
    const chatInputContainer = document.querySelector('.chat-input-container');

    let user = {
        name: '',
        email: '',
        messages: []
    };

    const API_URL = '/api/chat';

    // === NAVIGATION ===
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Hide all views
            chatView.classList.add('hidden');
            mapView.classList.add('hidden');
            knowledgeView.classList.add('hidden');
            chatInputContainer.classList.add('hidden');

            if (index === 0) {
                chatView.classList.remove('hidden');
                chatInputContainer.classList.remove('hidden');
            } else if (index === 1) {
                mapView.classList.remove('hidden');
                loadCrafts();
            } else if (index === 2) {
                knowledgeView.classList.remove('hidden');
                loadDialects();
            }
        });
    });

    async function loadCrafts() {
        const list = document.getElementById('craft-list');
        if (list.children.length > 0) return; // Already loaded

        try {
            const res = await fetch('/api/crafts');
            const crafts = await res.json();
            list.innerHTML = crafts.map(c => `
                <div class="card glass">
                    <span class="region">${c.region}</span>
                    <h3>${c.name}</h3>
                    <p>${c.description}</p>
                    <div class="meta">
                        <span>📍 ${c.location}</span>
                        <span>⏱ ${c.estimated_time}</span>
                    </div>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    }

    async function loadDialects() {
        const list = document.getElementById('dialect-list');
        if (list.children.length > 0) return; // Already loaded

        try {
            const res = await fetch('/api/dialects');
            const data = await res.json();
            let html = '';
            for (const region in data) {
                const r = data[region];
                html += `
                    <div class="card glass">
                        <span class="region">PHƯƠNG NGỮ</span>
                        <h3>${r.name}</h3>
                        <p>Lời chào: <em>${r.greeting.replace('{pronoun}', 'bạn').replace('{weather}', 'mát mẻ')}</em></p>
                        <div class="meta">
                            <span>Mẫu câu tiêu biểu:</span>
                        </div>
                        <p style="margin-top: 10px; font-style: italic;">"${Object.values(r.terms)[0].example}"</p>
                    </div>
                `;
            }
            list.innerHTML = html;
        } catch (e) { console.error(e); }
    }

    // === AUTH LOGIC ===
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        user.name = document.getElementById('user-name').value;
        user.email = document.getElementById('user-email').value;

        // Update UI
        document.getElementById('display-name').textContent = user.name;
        document.getElementById('display-email').textContent = user.email;
        document.getElementById('avatar-initial').textContent = user.name.charAt(0).toUpperCase();

        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        // Save to local storage for persistence
        localStorage.setItem('localviet_user', JSON.stringify(user));
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('localviet_user');
        window.location.reload();
    });

    // === CHAT LOGIC ===
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage('user', text);
        chatInput.value = '';
        
        // Show typing indicator
        const typingId = addTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: user.messages
                })
            });

            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            
            removeTypingIndicator(typingId);
            addMessage('assistant', data.response);

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingId);
            addMessage('assistant', 'Xin lỗi, đã có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng thử lại sau.');
        }
    });

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Simple markdown-like formatting for new lines
        bubble.innerHTML = content.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Update history
        user.messages.push({ role, content });
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.id = id;
        typingDiv.innerHTML = '<div class="bubble">...</div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // === MODAL LOGIC ===
    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.classList.remove('hidden');
    });

    closeTerms.addEventListener('click', () => {
        termsModal.classList.add('hidden');
    });

    // Check for existing session
    const savedUser = localStorage.getItem('localviet_user');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        document.getElementById('user-name').value = parsed.name;
        document.getElementById('user-email').value = parsed.email;
        // Optionally auto-login, but let's keep it safe for now
    }
});
