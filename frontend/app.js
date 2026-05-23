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
            title: "Ẩm thực miền Tây - Vị quê dân dã",
            summary: "Nơi sông nước hữu tình với những món ăn đậm chất Nam Bộ.",
            content: "Miền Tây nổi tiếng với các món cá lóc nướng trui, lẩu mắm, bánh xèo... Đặc trưng ẩm thực ở đây là sự kết hợp hài hòa giữa vị ngọt của đường thốt nốt, vị mặn của mắm và tươi ngon của rau trái miệt vườn.",
            img: "https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=800",
            category: "Ẩm thực"
        }
    ];

    const CRAFT_LOCATIONS = [
        {
            id: 1,
            name: "Làng gốm Bát Tràng",
            location: "Gia Lâm, Hà Nội",
            lat: 20.9800,
            lng: 105.9200,
            desc: "Làng gốm di sản ven sông Hồng với kỹ thuật men rạn cổ truyền.",
            history: "Hình thành từ thời nhà Lý (thế kỷ 11), khi các nghệ nhân từ Thanh Hóa theo triều đình ra Thăng Long lập nghiệp.",
            products: "Gốm gia dụng, đồ thờ cúng, gốm trang trí nghệ thuật với các loại men cổ như men rạn, men lam.",
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 2,
            name: "Làng lụa Vạn Phúc",
            location: "Hà Đông, Hà Nội",
            lat: 20.9500,
            lng: 105.7600,
            desc: "Nổi tiếng với dòng lụa vân mịn màng, ấm vào mùa đông, mát vào mùa hè.",
            history: "Có lịch sử hơn 1000 năm. Tương truyền bà A Lã Thị Nương đã truyền nghề dệt cho dân làng.",
            products: "Lụa vân, gấm, satin với hoa văn tinh xảo như mây trời, hoa cúc.",
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 3,
            name: "Làng đúc đồng Đồng Xâm",
            location: "Kiến Xương, Thái Bình",
            lat: 20.4500,
            lng: 106.3400,
            desc: "Đỉnh cao nghệ thuật chạm bạc và đúc đồng mỹ nghệ.",
            history: "Hình thành từ thời Hậu Lê. Nghệ nhân Nguyễn Kim Lâu được coi là tổ nghề của vùng đất này.",
            products: "Tranh đồng, lư hương, bộ đồ sành sứ bao bạc, trang sức bạc.",
            img: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 4,
            name: "Làng mộc Đồng Kỵ",
            location: "Từ Sơn, Bắc Ninh",
            lat: 21.0800,
            lng: 105.9900,
            desc: "Thủ phủ đồ gỗ mỹ nghệ tinh xảo từ các loại gỗ quý.",
            history: "Nổi danh từ nhiều thế kỷ trước nhờ kỹ thuật mộc chạm khắc tinh vi không nơi nào sánh kịp.",
            products: "Bàn ghế bát tiên, tủ chè, sập gụ khảm trai truyền thống.",
            img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 5,
            name: "Làng nón lá Huế",
            location: "Thừa Thiên Huế",
            lat: 16.4670,
            lng: 107.5900,
            desc: "Biểu tượng của vẻ đẹp dịu dàng và tinh tế của phụ nữ Cố đô.",
            history: "Nghề chằm nón tại Huế phát triển mạnh dưới thời Nguyễn, nổi tiếng nhất là nón bài thơ.",
            products: "Nón bài thơ, nón lá cỏ, nón thêu phong cảnh cung đình Huế.",
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 6,
            name: "Làng gốm Thanh Hà",
            location: "Hội An, Quảng Nam",
            lat: 15.8800,
            lng: 108.3300,
            desc: "Dòng gốm mộc không dùng men, mang hơi thở đất nung Hội An.",
            history: "Phát triển cùng thời với phố cổ Hội An (thế kỷ 16-17), chuyên cung cấp gạch ngói cho các ngôi nhà cổ.",
            products: "Chậu hoa, tượng gốm mộc, các vật dụng nhà bếp bằng đất nung đỏ.",
            img: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=800"
        },
        // Sovereignty Markers (Hoàng Sa & Trường Sa)
        { 
            name: "Quần đảo Hoàng Sa – Việt Nam", 
            lat: 16.5, 
            lng: 112.5, 
            desc: "Lãnh thổ thuộc chủ quyền không thể chối cãi của Việt Nam.",
            isSovereign: true 
        },
        { 
            name: "Quần đảo Trường Sa – Việt Nam", 
            lat: 10.0, 
            lng: 114.5, 
            desc: "Lãnh thổ thuộc chủ quyền không thể chối cãi của Việt Nam.",
            isSovereign: true
        }
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
                // Hiệu ứng bay từ tầm nhìn toàn cầu về Việt Nam (Yêu cầu 2)
                if (map) {
                    map.setView([20, 0], 2); // Bắt đầu từ góc nhìn toàn cầu
                    setTimeout(() => {
                        map.flyTo([14.0583, 108.2772], 7, {
                            duration: 2.5,
                            easeLinearity: 0.25
                        });
                    }, 500);
                }
            } else if (index === 2) {
                knowledgeView.classList.remove('hidden');
                renderKnowledge();
            }
        });
    });

    // === MAP LOGIC ===
    function initMap() {
        if (map) return;
        
        // Giới hạn bản đồ (Yêu cầu 3)
        const southWest = L.latLng(-10, 90);
        const northEast = L.latLng(40, 140); 
        const bounds = L.latLngBounds(southWest, northEast);

        map = L.map('map', {
            minZoom: 2,
            maxZoom: 14,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0
        }).setView([20, 0], 2);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <b>Hoàng Sa - Trường Sa là của Việt Nam</b>'
        }).addTo(map);

        CRAFT_LOCATIONS.forEach(loc => {
            if (loc.isSovereign) {
                const sovereignIcon = L.divIcon({
                    className: 'sovereign-marker',
                    html: `<div style="background: #ff0000; color: #ffffff; padding: 4px 8px; border: 2px solid #ffff00; border-radius: 4px; font-weight: bold; white-space: nowrap; box-shadow: 0 0 10px rgba(0,0,0,0.5); font-size: 11px;">📍 ${loc.name}</div>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                });

                L.marker([loc.lat, loc.lng], { icon: sovereignIcon, zIndexOffset: 1000 }).addTo(map)
                    .bindPopup(`<b>${loc.name}</b><br>${loc.desc}`);
            } else {
                const marker = L.marker([loc.lat, loc.lng]).addTo(map);
                const popupContent = `
                    <div style="width: 200px;">
                        <img src="${loc.img}" style="width:100%; border-radius:8px; margin-bottom:8px;">
                        <b style="font-size:1.1rem; color:var(--primary);">${loc.name}</b>
                        <p style="font-size:0.85rem; margin:5px 0;">${loc.desc}</p>
                        <button onclick="showHeritageDetail(${loc.id}, 'craft')" style="background:var(--primary); color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; width:100%; font-weight:600;">🔍 Xem chi tiết</button>
                    </div>
                `;
                marker.bindPopup(popupContent);
            }
        });
    }

    // === KNOWLEDGE LOGIC ===
    function renderKnowledge() {
        if (knowledgeGrid.children.length > 0) return;
        knowledgeGrid.innerHTML = KNOWLEDGE_DB.map(k => `
            <div class="card glass" onclick="showHeritageDetail(${k.id}, 'knowledge')">
                <div class="card-img" style="background-image: url('${k.img}')"></div>
                <div class="card-content">
                    <span class="region">${k.category}</span>
                    <h3>${k.title}</h3>
                    <p>${k.summary}</p>
                </div>
            </div>
        `).join('');
    }

    window.showHeritageDetail = (id, type) => {
        let item;
        if (type === 'craft') {
            item = CRAFT_LOCATIONS.find(c => c.id === id);
            if (!item) return;
            document.getElementById('modal-title').textContent = item.name;
            document.getElementById('modal-img').src = item.img;
            document.getElementById('modal-content').innerHTML = `
                <div class="article-text">
                    <p><strong>📍 Địa điểm:</strong> ${item.location}</p>
                    <h4>Sơ lược lịch sử</h4>
                    <p>${item.history}</p>
                    <h4>Sản phẩm tiêu biểu</h4>
                    <p>${item.products}</p>
                </div>
            `;
        } else {
            item = KNOWLEDGE_DB.find(k => k.id === id);
            if (!item) return;
            document.getElementById('modal-title').textContent = item.title;
            document.getElementById('modal-img').src = item.img;
            document.getElementById('modal-content').innerHTML = `<div class="article-text"><p>${item.content}</p></div>`;
        }
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
