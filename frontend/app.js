document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const loginForm = document.getElementById('login-form');
    const chatForm = document.getElementById('chat-form');
    const introContainer = document.getElementById('intro-container');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const logoutBtn = document.getElementById('logout-btn');
    const startDiscoveryBtn = document.getElementById('start-discovery');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun');
    const moonIcon = themeToggle.querySelector('.moon');

    const navItems = document.querySelectorAll('.nav-item');
    const chatView = document.getElementById('chat-messages');
    const mapView = document.getElementById('map-view');
    const knowledgeView = document.getElementById('knowledge-view');
    const knowledgeGrid = document.getElementById('knowledge-grid');
    const chatInputContainer = document.querySelector('.chat-input-container');

    const heritageModal = document.getElementById('heritage-modal');
    const closeHeritage = document.getElementById('close-heritage');

    // === DATA DATABASES ===
    const DIALECT_DB = {
        "mô": { mean: "đâu / ở đâu", region: "Miền Trung", ex: "Anh đi mô rứa? (Anh đi đâu thế?)" },
        "răng": { mean: "sao / làm sao", region: "Miền Trung", ex: "Răng mà lạ rứa? (Sao mà lạ thế?)" },
        "chi": { mean: "gì / cái gì", region: "Miền Trung", ex: "Cái chi tề? (Cái gì kia?)" },
        "rứa": { mean: "thế / như vậy", region: "Miền Trung", ex: "Đúng rứa! (Đúng thế!)" },
        "tề": { mean: "kìa / đằng kia", region: "Miền Trung", ex: "Con chi tề? (Con gì kìa?)" },
        "hén": { mean: "nhỉ / đúng không", region: "Miền Nam/Trung", ex: "Đẹp hén? (Đẹp nhỉ?)" },
        "u": { mean: "mẹ", region: "Miền Bắc (cổ)", ex: "U con mới về. (Mẹ con mới về.)" },
        "mần": { mean: "làm", region: "Miền Trung/Nam", ex: "Đang mần chi đó? (Đang làm gì đấy?)" }
    };

    const KNOWLEDGE_DB = [
        {
            id: 1,
            title: "Gốm Bát Tràng - Tinh hoa từ đất",
            summary: "Làng gốm lâu đời nhất Việt Nam với những kỹ thuật men rạn độc đáo.",
            content: "Nằm bên bờ sông Hồng, làng gốm Bát Tràng đã có lịch sử hơn 700 năm. Các sản phẩm gốm ở đây nổi tiếng với cốt đầy, chắc và lớp men trắng thường ngả màu ngà, đục. Đặc biệt là các dòng men rạn, men ngọc quý hiếm chỉ có tại đây.",
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800",
            category: "Làng nghề"
        },
        {
            id: 2,
            title: "Lụa Vạn Phúc - Mịn màng như mây",
            summary: "Làng lụa nức tiếng Hà Đông với dòng lụa vân đặc sản.",
            content: "Lụa Vạn Phúc có đặc điểm là ấm áp vào mùa đông và mát mẻ vào mùa hè. Hoa văn trên lụa rất đa dạng, trang nhã, tinh xảo. Sản phẩm tiêu biểu nhất là lụa Vân - loại lụa mà hoa văn nổi trên mặt vải mịn màng.",
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800",
            category: "Làng nghề"
        },
        {
            id: 3,
            title: "Nón lá Huế - Nét duyên xứ Kinh kỳ",
            summary: "Biểu tượng của vẻ đẹp dịu dàng của người phụ nữ cố đô.",
            content: "Nón lá Huế không chỉ là vật che mưa nắng mà còn là một tác phẩm nghệ thuật. Nổi tiếng nhất là nón bài thơ, khi soi lên ánh sáng ta có thể thấy những hình ảnh phong cảnh hoặc câu thơ được cắt khéo léo kẹp giữa hai lớp lá.",
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800",
            category: "Phong tục"
        },
        {
            id: 4,
            title: "Ẩm thực miền Tây - Vị ngọt phù sa",
            summary: "Khám phá nét dân dã, hào sảng qua những món ăn sông nước.",
            content: "Ẩm thực miền Tây Nam Bộ đặc sắc với vị ngọt tự nhiên từ rau củ, nước dừa và cá tôm tươi sống. Các món như canh chua cá linh, bông điên điển hay lẩu mắm là linh hồn của vùng đất này.",
            img: "https://images.unsplash.com/photo-1562967962-d28448ec628c?auto=format&fit=crop&q=80&w=800",
            category: "Ẩm thực"
        }
    ];

    const CRAFT_LOCATIONS = [
        { name: "Gốm Bát Tràng", lat: 20.9633, lng: 105.9133, desc: "Làng gốm di sản ven sông Hồng." },
        { name: "Lụa Vạn Phúc", lat: 20.9782, lng: 105.7761, desc: "Trung tâm lụa truyền thống nức tiếng." },
        { name: "Đồ gỗ Đồng Kỵ", lat: 21.1333, lng: 105.9500, desc: "Làng nghề đồ gỗ mỹ nghệ tinh xảo." },
        { name: "Nón lá Huế", lat: 16.4637, lng: 107.5908, desc: "Nơi sinh ra những chiếc nón bài thơ duyên dáng." },
        { name: "Nước mắm Phú Quốc", lat: 10.2181, lng: 103.9607, desc: "Đặc sản nước mắm truyền thống lâu đời." }
    ];

    // === STATE ===
    let user = { name: '', email: '', messages: [] };
    let map = null;

    // === NAVIGATION LOGIC ===
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Hide all
            chatView.classList.add('hidden');
            mapView.classList.add('hidden');
            knowledgeView.classList.add('hidden');
            chatInputContainer.classList.add('hidden');

            if (index === 0) {
                chatView.classList.remove('hidden');
                chatInputContainer.classList.remove('hidden');
            } else if (index === 1) {
                mapView.classList.remove('hidden');
                initMap();
            } else if (index === 2) {
                knowledgeView.classList.remove('hidden');
                renderKnowledge();
            }
        });
    });

    // === MAP LOGIC ===
    function initMap() {
        if (map) return;
        // Set view to Vietnam but allow zoom out to world level (minZoom: 2)
        map = L.map('map', {
            minZoom: 2,
            maxZoom: 18
        }).setView([16.0, 106.0], 5);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);


        CRAFT_LOCATIONS.forEach(loc => {
            L.marker([loc.lat, loc.lng]).addTo(map)
                .bindPopup(`<b>${loc.name}</b><br>${loc.desc}`);
        });
    }

    // === KNOWLEDGE LOGIC ===
    function renderKnowledge() {
        if (knowledgeGrid.children.length > 0) return;
        knowledgeGrid.innerHTML = KNOWLEDGE_DB.map(k => `
            <div class="card glass" onclick="showHeritageDetail(${k.id})">
                <div class="card-img" style="background-image: url('${k.img}')"></div>
                <div class="card-content">
                    <span class="region">${k.category}</span>
                    <h3>${k.title}</h3>
                    <p>${k.summary}</p>
                </div>
            </div>
        `).join('');
    }

    window.showHeritageDetail = (id) => {
        const item = KNOWLEDGE_DB.find(k => k.id === id);
        if (!item) return;
        document.getElementById('modal-title').textContent = item.title;
        document.getElementById('modal-img').src = item.img;
        document.getElementById('modal-content').innerHTML = `<p>${item.content}</p>`;
        heritageModal.classList.remove('hidden');
    };

    closeHeritage.addEventListener('click', () => heritageModal.classList.add('hidden'));

    // === CHAT LOGIC (Pure JS & Dictionary) ===
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage('user', text);
        chatInput.value = '';
        
        const typingId = addTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator(typingId);
            const response = getBotResponse(text);
            addMessage('assistant', response);
        }, 600);
    });

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();
        let responses = [];

        for (const word in DIALECT_DB) {
            if (lowerInput.includes(word)) {
                const info = DIALECT_DB[word];
                responses.push(`Từ "<strong>${word}</strong>" là một phương ngữ phổ biến ở <b>${info.region}</b>.\n- Nghĩa là: ${info.mean}.\n- Ví dụ: <em>${info.ex}</em>`);
            }
        }

        if (responses.length > 0) {
            return responses.join('\n\n--- \n\n');
        }

        // Common interactions
        if (lowerInput.includes("chào") || lowerInput.includes("hi")) {
            return "Xin chào! Tôi là Trợ lý LocalViet. Bạn muốn hỏi về phương ngữ hay làng nghề nào không?";
        }

        return "Tôi chưa học từ này hoặc thông tin này. Bạn dạy tôi nhé! Hoặc hãy thử hỏi tôi về các từ như: mô, răng, rứa, chi, hén...";
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = content.replace(/\n/g, '<br>');
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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

    // === THEME & INTRO ===
    startDiscoveryBtn.addEventListener('click', () => {
        introContainer.style.opacity = '0';
        introContainer.style.transform = 'scale(1.1)';
        setTimeout(() => {
            introContainer.classList.add('hidden');
            if (user.isLoggedIn) {
                appContainer.classList.remove('hidden');
                chatView.classList.remove('hidden');
                chatInputContainer.classList.remove('hidden');
            } else {
                loginContainer.classList.remove('hidden');
            }
        }, 500);
    });


    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        user.name = document.getElementById('user-name').value;
        user.email = document.getElementById('user-email').value;
        document.getElementById('display-name').textContent = user.name;
        document.getElementById('display-email').textContent = user.email;
        document.getElementById('avatar-initial').textContent = user.name.charAt(0).toUpperCase();
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        localStorage.setItem('localviet_user', JSON.stringify(user));
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('localviet_user');
        window.location.reload();
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
        moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
    }

    themeToggle.addEventListener('click', () => {
        setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    setTheme(localStorage.getItem('theme') || 'light');

    const savedUser = localStorage.getItem('localviet_user');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        document.getElementById('display-name').textContent = parsed.name;
        document.getElementById('display-email').textContent = parsed.email;
        document.getElementById('avatar-initial').textContent = parsed.name.charAt(0).toUpperCase();
        
        // Use a flag to skip login later, but keep Intro visible now
        user.isLoggedIn = true;
        document.getElementById('user-name').value = parsed.name;
        document.getElementById('user-email').value = parsed.email;
    }


});
