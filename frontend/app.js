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
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const chatView = document.getElementById('chat-messages');
    const mapView = document.getElementById('map-view');
    const knowledgeView = document.getElementById('knowledge-view');
    const knowledgeGrid = document.getElementById('knowledge-grid');
    const chatInputContainer = document.querySelector('.chat-input-container');

    const heritageModal = document.getElementById('heritage-modal');
    const closeHeritage = document.getElementById('close-heritage');
    const guardrailContent = document.getElementById('guardrail-content');

    const artisanTrigger = document.getElementById('artisan-chat-trigger');
    const artisanWindow = document.getElementById('artisan-chat-window');
    const closeArtisan = document.getElementById('close-artisan-chat');
    const artisanForm = document.getElementById('artisan-chat-form');
    const artisanInput = document.getElementById('artisan-input');
    const artisanMessages = document.getElementById('artisan-messages');

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
            category: { vi: "Làng nghề", en: "Craft Village" },
            title: { vi: "Gốm Bát Tràng - Tinh hoa từ đất", en: "Bat Trang Ceramics - Essence of Earth" },
            summary: { vi: "Làng gốm lâu đời nhất Việt Nam với kỹ thuật men rạn.", en: "Vietnam's oldest pottery village with unique crackle glazes." },
            content: { 
                vi: "Nằm bên bờ sông Hồng, làng gốm Bát Tràng có lịch sử hơn 700 năm. Nổi tiếng với các dòng men rạn, men ngọc quý hiếm.",
                en: "Located on the Red River bank, Bat Trang has a 700-year history. Famous for rare crackle and celadon glazes."
            },
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 2,
            category: { vi: "Làng nghề", en: "Craft Village" },
            title: { vi: "Lụa Vạn Phúc - Mịn màng như mây", en: "Van Phuc Silk - Smooth as Clouds" },
            summary: { vi: "Làng lụa nức tiếng Hà Đông với dòng lụa vân đặc sản.", en: "Famous silk village in Ha Dong known for premium Van silk." },
            content: { 
                vi: "Lụa Vạn Phúc ấm vào mùa đông, mát vào mùa hè. Hoa văn trang nhã, tinh xảo, đặc biệt là lụa Vân.",
                en: "Van Phuc silk is warm in winter and cool in summer. Elegant, intricate patterns, especially Van silk."
            },
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 3,
            category: { vi: "Phong tục", en: "Customs" },
            title: { vi: "Nón lá Huế - Nét duyên Kinh kỳ", en: "Hue Conical Hat - Royal Grace" },
            summary: { vi: "Biểu tượng của vẻ đẹp phụ nữ cố đô.", en: "A symbol of the gentle beauty of Hue women." },
            content: { 
                vi: "Nón lá Huế là tác phẩm nghệ thuật. Nổi tiếng nhất là nón bài thơ với hình ảnh phong cảnh ẩn hiện.",
                en: "Hue conical hats are masterpieces. The 'poem hat' reveals scenery when held to the light."
            },
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800"
        }
    ];

    const GUARDRAILS_DB = {
        bronze: {
            name: { vi: "Đúc đồng", en: "Bronze Casting" },
            fixed: {
                vi: "Sản phẩm phải đảm bảo tỉ lệ hợp kim đồng truyền thống để duy trì độ vang (chuông, chiêng) và độ bền cơ học. Tuân thủ nghiêm ngặt điển tích và tỷ lệ nhân trắc học truyền thống.",
                en: "Must adhere to traditional alloy ratios for resonance and durability. Strictly follow traditional iconography and anatomical proportions."
            },
            variable: {
                vi: "Kích thước tùy chỉnh, lớp hoàn thiện (dát vàng 24k, mạ bạc, màu giả cổ). Khắc thêm tên gia tộc hoặc lời chúc.",
                en: "Custom dimensions, finishes (24k gold, silver plating, antique patinas). Engraving family names or blessings."
            },
            warning: {
                vi: "Tuyệt đối không thay thế kỹ thuật chạm khắc tay bằng máy dập công nghiệp cho các vật phẩm tâm linh vì sẽ làm mất đi 'thần thái'.",
                en: "Strictly Forbidden to replace hand-carving with industrial machine stamping for spiritual artifacts. Preserves the 'aura'."
            },
            steps: {
                vi: ["Tạo khuôn đất sét", "Nấu chảy đồng ~1200°C", "Rót đồng và để nguội tự nhiên", "Dỡ khuôn và làm sạch", "Chạm khắc họa tiết thủ công"],
                en: ["Create clay molds", "Melt bronze ~1200°C", "Pour and cool naturally", "De-mold and clean", "Hand-carve patterns"]
            },
            donts: {
                vi: ["Không làm nguội bằng nước", "Không dùng đồng tạp chất", "Không mặc cả quá sâu"],
                en: ["Don't cool with water", "Don't use impure metals", "Don't bargain excessively"]
            },
            leadTime: { vi: "15 ngày - 6 tháng", en: "15 days - 6 months" },
            impact: { vi: "Rất cao", en: "Very High" }
        },
        ceramics: {
            name: { vi: "Gốm sứ", en: "Ceramics & Pottery" },
            fixed: {
                vi: "Bát Tràng: Xương gốm chắc chắn, men rạn/ngọc. Chu Đậu: Đất sét Trúc Thôn, men trắng trong, họa tiết xanh chàm. Bàu Trúc: Không bàn xoay, nung lộ thiên.",
                en: "Bát Tràng: Sturdy body, Crackle/Jade glazes. Chu Đậu: White clay, cobalt patterns. Bàu Trúc: No potter's wheel, open-fired."
            },
            variable: {
                vi: "Thay đổi công năng (chum thành bình trang trí), in logo, vẽ họa tiết cá nhân.",
                en: "Functional modifications (jar to vase), custom logos, hand-painted patterns."
            },
            warning: {
                vi: "Dùng men công nghiệp trên gốm Bàu Trúc hoặc làm xương gốm Bát Tràng quá mỏng sẽ làm mất giá trị di sản.",
                en: "Industrial glazes on Bàu Trúc or thin Bát Tràng bodies invalidate core heritage value."
            },
            steps: {
                vi: ["Nhào đất và ủ ẩm 3-5 ngày", "Tạo hình trên bàn xoay/khuôn", "Phơi khô tự nhiên 2-3 ngày", "Sửa chi tiết, gọt chân", "Phủ men + Vẽ họa tiết", "Nung 1200-1300°C trong 8-12h"],
                en: ["Knead and cure clay 3-5 days", "Shape on wheel or mold", "Dry naturally 2-3 days", "Refine and trim", "Glaze and paint", "Fire at 1200-1300°C for 8-12h"]
            },
            donts: {
                vi: ["Không yêu cầu xong trong 2-3 ngày", "Không dùng máy sấy nhiệt", "Không dùng men công nghiệp"],
                en: ["Don't ask for 2-3 day delivery", "Don't use heat dryers", "Don't use industrial glazes"]
            },
            leadTime: { vi: "7 - 20 ngày", en: "7 - 20 days" },
            impact: { vi: "Cao", en: "High" }
        },
        lacquer: {
            name: { vi: "Sơn mài", en: "Traditional Lacquerware" },
            fixed: {
                vi: "Sử dụng mủ cây sơn tự nhiên, kỹ thuật 'ủ ẩm - mài mòn'. Các nguyên liệu quý như vàng/bạc thếp, vỏ trứng, vỏ trai.",
                en: "Use natural lacquer sap, 'humidity-curing & sanding' technique. Gold/silver leaf, eggshells, mother-of-pearl."
            },
            variable: {
                vi: "Cốt vật liệu (gỗ, mây tre, gốm), đề tài hội họa tùy chỉnh.",
                en: "Base materials (wood, bamboo, ceramic), custom artistic themes."
            },
            warning: {
                vi: "Tuyệt đối không dùng máy sấy nhiệt hoặc sơn PU công nghiệp; quy trình ủ ẩm tự nhiên là bắt buộc.",
                en: "Strictly Forbidden to use heat dryers or industrial PU paint. Natural curing is mandatory."
            },
            steps: {
                vi: ["Làm cốt và sơn lót", "Dán vải, phủ sơn then", "Mài thô và phủ sơn cánh gián", "Trang trí (vàng/bạc/vỏ trứng)", "Ủ ẩm mỗi lớp 7-10 ngày", "Mài mòn lộ hình và đánh bóng"],
                en: ["Prep base and primer", "Apply cloth and sap", "Sanding and amber lacquer", "Decorate (gold/silver/eggshell)", "Cure each layer 7-10 days", "Wet-sanding and polishing"]
            },
            donts: {
                vi: ["Không dùng sơn PU", "Không dùng máy sấy nhiệt", "Không yêu cầu làm dưới 6 tháng"],
                en: ["Don't use industrial PU", "Don't use heat dryers", "Don't ask for < 6 months"]
            },
            leadTime: { vi: "Trung bình 6 tháng", en: "Average 6 months" },
            impact: { vi: "Đặc biệt cao", en: "Critically High" }
        },
        textiles: {
            name: { vi: "Dệt thủ công", en: "Hand-Woven Textiles" },
            fixed: {
                vi: "Tơ tằm tự nhiên hoặc sợi lanh. Họa tiết xoắn ốc (người Mông) hoặc hoa văn móng tay (người Chăm) giữ đúng cấu trúc.",
                en: "Natural silk or linen. Sacred motifs (spiral, fingernails) must preserve spiritual structure."
            },
            variable: {
                vi: "Màu sắc nhuộm thực vật, thiết kế kiểu dáng hiện đại (áo dài, túi xách) trên khổ vải truyền thống.",
                en: "Natural dye colors, modern fashion designs on traditional fabric widths."
            },
            warning: {
                vi: "Không dùng thuốc nhuộm hóa học; không biến tấu sai lệch các họa tiết tâm linh.",
                en: "No chemical dyes allowed. Sacred motifs must not be altered."
            },
            steps: {
                vi: ["Trồng dâu nuôi tằm/Trồng lanh", "Quay tơ, mắc cửi", "Nhuộm màu tự nhiên", "Dệt hoa văn trên khung", "Hấp nhuộm cầm màu"],
                en: ["Sericulture/Hemp growing", "Spinning and warping", "Natural dyeing", "Weaving patterns", "Steaming to set dye"]
            },
            donts: {
                vi: ["Không nhuộm hóa học", "Không ép dệt sai khổ vải", "Không giặt xà phòng mạnh"],
                en: ["Don't use chemical dyes", "Don't force non-traditional widths", "Don't use harsh detergents"]
            },
            leadTime: { vi: "10 - 30 ngày", en: "10 - 30 days" },
            impact: { vi: "Trung bình đến Cao", en: "Medium to High" }
        },
        sculpture: {
            name: { vi: "Điêu khắc", en: "Sculpture & Carving" },
            fixed: {
                vi: "Vật liệu tự nhiên (gỗ mít, đá nguyên khối). Sơn son thếp vàng/bạc thủ công.",
                en: "Natural materials (jackfruit wood, solid stone). Manual gold/silver leafing."
            },
            variable: {
                vi: "Tùy chỉnh kích thước cho không gian thờ tự; lựa chọn vân gỗ hoặc màu đá.",
                en: "Custom sizes for worship spaces, wood grain or stone color selection."
            },
            warning: {
                vi: "Tuyệt đối không dùng nhựa composite giả đá/gỗ vì sẽ triệt tiêu sự kết nối tâm linh.",
                en: "Strictly Forbidden to use composite resins. Severs the spiritual connection."
            },
            steps: {
                vi: ["Tìm gỗ/đá nguyên khối", "Phác thảo tỷ lệ", "Đục thô định hình", "Chạm tinh xảo", "Sơn son thếp vàng"],
                en: ["Find solid wood/stone", "Sketch proportions", "Rough carving", "Fine detailing", "Lacquer and gold leaf"]
            },
            donts: {
                vi: ["Không dùng nhựa composite", "Không bỏ qua tẩy uế vật liệu", "Không dùng vàng giả"],
                en: ["Don't use resins", "Don't skip purification rituals", "Don't use fake gold leaf"]
            },
            leadTime: { vi: "1 - 4 tháng", en: "1 - 4 months" },
            impact: { vi: "Cao", en: "High" }
        },
        jewelry: {
            name: { vi: "Trang sức bạc", en: "Ethnic Silver Jewelry" },
            fixed: {
                vi: "Bạc nõn nguyên chất, kỹ thuật cán, kéo sợi và chạm khắc thủ công. Họa tiết xoắn ốc và tua bạc tạo âm thanh.",
                en: "Pure Silver (bạc nõn), manual wire-drawing and engraving. Spiral motifs and tinkling tassels."
            },
            variable: {
                vi: "Tùy chỉnh công năng (vòng thành nhẫn/phụ kiện), số lượng tua bạc để đổi âm thanh.",
                en: "Modified functions (neck ring to brooch), adjustable tassels for sound profile."
            },
            warning: {
                vi: "Không pha trộn kim loại tạp chất vào bạc vì bạc là 'vệ sĩ' bảo vệ hồn vía.",
                en: "Do Not mix impure metals into silver. Guardian of health and soul."
            },
            steps: {
                vi: ["Luyện bạc nõn", "Cán mỏng/kéo sợi", "Uốn họa tiết xoắn ốc", "Hàn chi tiết thủ công", "Đánh bóng bằng thảo mộc"],
                en: ["Smelt pure silver", "Roll or draw filaments", "Twist ethnic patterns", "Manual welding", "Polish with herbs"]
            },
            donts: {
                vi: ["Không pha đồng/kẽm", "Không dập máy công nghiệp", "Không tẩy rửa hóa chất mạnh"],
                en: ["Don't mix with alloys", "Don't use industrial stamps", "Don't use harsh chemicals"]
            },
            leadTime: { vi: "5 - 15 ngày", en: "5 - 15 days" },
            impact: { vi: "Trung bình", en: "Medium" }
        }
    };

    const CRAFT_LOCATIONS = [
        {
            id: 101,
            name: { vi: "Làng Ngũ Xã", en: "Ngu Xa Village" },
            location: { vi: "Ba Đình, Hà Nội", en: "Ba Dinh, Hanoi" },
            lat: 21.0333,
            lng: 105.8333,
            desc: { vi: "Tinh hoa đúc đồng Thăng Long thế kỷ XVII.", en: "The essence of 17th-century Thang Long bronze casting." },
            img: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'bronze'
        },
        {
            id: 1,
            name: { vi: "Làng gốm Bát Tràng", en: "Bat Trang Pottery Village" },
            location: { vi: "Gia Lâm, Hà Nội", en: "Gia Lam, Hanoi" },
            lat: 20.9800,
            lng: 105.9200,
            desc: { vi: "Làng gốm di sản ven sông Hồng.", en: "Heritage pottery village along the Red River." },
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'ceramics'
        },
        {
            id: 2,
            name: { vi: "Làng lụa Vạn Phúc", en: "Van Phuc Silk Village" },
            location: { vi: "Hà Đông, Hà Nội", en: "Ha Dong, Hanoi" },
            lat: 20.9500,
            lng: 105.7667,
            desc: { vi: "Nơi dệt nên dòng lụa vân mịn màng.", en: "Where smooth and exquisite Van silk is woven." },
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },
        {
            id: 102,
            name: { vi: "Làng gốm Bàu Trúc", en: "Bau Truc Pottery" },
            location: { vi: "Ninh Thuận", en: "Ninh Thuan" },
            lat: 11.5667,
            lng: 108.9833,
            desc: { vi: "Gốm cổ người Chăm, nung lộ thiên.", en: "Ancient Cham pottery, open-fired without wheels." },
            img: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'ceramics'
        },
        {
            id: 103,
            name: { vi: "Sơn mài Tương Bình Hiệp", en: "Tuong Binh Hiep Lacquer" },
            location: { vi: "Bình Dương", en: "Binh Duong" },
            lat: 10.9500,
            lng: 106.6667,
            desc: { vi: "Cái nôi sơn mài nổi tiếng nhất miền Nam.", en: "The most famous lacquerware cradle in Southern Vietnam." },
            img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'lacquer'
        },
        {
            id: 104,
            name: { vi: "Làng lụa Tân Châu", en: "Tan Chau Silk Village" },
            location: { vi: "An Giang", en: "An Giang" },
            lat: 10.8000,
            lng: 105.2000,
            desc: { vi: "Lãnh Mỹ A đen bóng huyền thoại.", en: "The legendary shiny black Lanh My A silk." },
            img: "https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },
        {
            id: 3,
            name: { vi: "Làng đúc đồng Đồng Xâm", en: "Dong Xam Bronze/Silver" },
            location: { vi: "Thái Bình", en: "Thai Binh" },
            lat: 20.4500,
            lng: 106.3400,
            desc: { vi: "Đỉnh cao chạm bạc và đúc đồng mỹ nghệ.", en: "The peak of silver engraving and artistic bronze casting." },
            img: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'bronze'
        },
        {
            id: 5,
            name: { vi: "Làng nón lá Huế", en: "Hue Conical Hat Village" },
            location: { vi: "Huế", en: "Hue" },
            lat: 16.4670,
            lng: 107.5900,
            desc: { vi: "Biểu tượng vẻ đẹp phụ nữ Cố đô.", en: "The iconic beauty symbol of the ancient capital." },
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },
        // Sovereignty Markers
        { 
            name: { vi: "Quần đảo Hoàng Sa", en: "Hoang Sa Archipelago" }, 
            lat: 16.5, lng: 112.5, 
            desc: { vi: "Chủ quyền Việt Nam.", en: "Vietnam's Sovereignty." }, 
            isSovereign: true 
        },
        { 
            name: { vi: "Quần đảo Trường Sa", en: "Truong Sa Archipelago" }, 
            lat: 10.0, lng: 114.5, 
            desc: { vi: "Chủ quyền Việt Nam.", en: "Vietnam's Sovereignty." }, 
            isSovereign: true 
        }
    ];

    // === STATE ===
    let user = { name: '', email: '', messages: [], lang: 'vi' };
    let map = null;
    let mapOverlay = null;

    // === LANGUAGE DETECTION & AUTO-SWITCH ===
    function detectAndSwitchLanguage(input) {
        const viKeywords = ["chào", "tôi", "làm thế nào", "giá bao nhiêu", "mua", "ở đâu", "việt nam"];
        const enKeywords = ["hello", "how much", "what is", "i want", "buy", "process", "where"];
        const lowerInput = input.toLowerCase();
        
        let newLang = user.lang;
        
        const isVi = viKeywords.some(key => lowerInput.includes(key)) || /[àáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũưừứựửữỳýỵỷỹđ]/.test(lowerInput);
        const isEn = enKeywords.some(key => lowerInput.includes(key)) || (/^[a-zA-Z0-9\s?.,!]*$/.test(lowerInput) && lowerInput.split(' ').length > 1);

        if (isVi) newLang = 'vi';
        else if (isEn) newLang = 'en';

        if (newLang !== user.lang) {
            user.lang = newLang;
            updateUILanguage();
        }
    }

    function updateUILanguage() {
        // Re-render Knowledge if visible
        if (!knowledgeView.classList.contains('hidden')) {
            knowledgeGrid.innerHTML = '';
            renderKnowledge();
        }
        // Update sovereignty banner
        const banner = document.querySelector('.sovereignty-banner-ol');
        if (banner) {
            banner.innerHTML = user.lang === 'en' 
                ? '🇻🇳 Hoang Sa & Truong Sa Archipelagos belong to Vietnam'
                : '🇻🇳 Quần đảo Hoàng Sa & Trường Sa thuộc chủ quyền Việt Nam';
        }
    }

    // === NAVIGATION LOGIC ===
    function switchTab(index) {
        // Desktop updates
        navItems.forEach((item, idx) => {
            if (idx === index) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Mobile updates
        mobileNavItems.forEach((item, idx) => {
            if (idx === index) item.classList.add('active');
            else item.classList.remove('active');
        });

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
            if (map) {
                const view = map.getView();
                const zoom = window.innerWidth < 768 ? 6 : 7;
                setTimeout(() => {
                    view.animate({
                        center: ol.proj.fromLonLat([108.2772, 14.0583]),
                        zoom: zoom,
                        duration: 1500
                    });
                }, 100);
            }
        } else if (index === 2) {
            knowledgeView.classList.remove('hidden');
            renderKnowledge();
        }
    }

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => switchTab(index));
    });

    mobileNavItems.forEach((item, index) => {
        item.addEventListener('click', () => switchTab(index));
    });

    // === MAP LOGIC (OpenLayers Migration) ===
    function initMap() {
        if (map) return;

        const container = document.getElementById('ol-popup');
        const content = document.getElementById('ol-popup-content');
        const closer = document.getElementById('ol-popup-closer');

        mapOverlay = new ol.Overlay({
            element: container,
            autoPan: { animation: { duration: 250 } },
        });

        closer.onclick = function () {
            mapOverlay.setPosition(undefined);
            closer.blur();
            return false;
        };

        const vectorSource = new ol.source.Vector();
        const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            zIndex: 100
        });

        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <b>Hoàng Sa - Trường Sa - Việt Nam</b>'
                    })
                }),
                vectorLayer
            ],
            overlays: [mapOverlay],
            view: new ol.View({
                center: ol.proj.fromLonLat([0, 20]),
                zoom: 2,
                minZoom: 2,
                maxZoom: 18
            })
        });

        // Add Sovereignty Banner Overlay
        const banner = document.createElement('div');
        banner.className = 'sovereignty-banner-ol';
        banner.innerHTML = '🇻🇳 Quần đảo Hoàng Sa & Trường Sa thuộc chủ quyền Việt Nam';
        document.getElementById('map-container').appendChild(banner);

        CRAFT_LOCATIONS.forEach(loc => {
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([loc.lng, loc.lat])),
                data: loc
            });

            if (loc.isSovereign) {
                feature.setStyle(new ol.style.Style({
                    text: new ol.style.Text({
                        text: '📍 ' + loc.name,
                        font: 'bold 12px Montserrat, sans-serif',
                        fill: new ol.style.Fill({ color: '#ffffff' }),
                        backgroundFill: new ol.style.Fill({ color: '#d32f2f' }),
                        padding: [4, 8, 4, 8],
                        offsetY: -20
                    })
                }));
            } else {
                feature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({ color: '#8B0000' }),
                        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                    })
                }));
            }
            vectorSource.addFeature(feature);
        });

        map.on('singleclick', function (evt) {
            const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
            if (feature) {
                const loc = feature.get('data');
                if (!loc) return;
                
                const locName = typeof loc.name === 'object' ? loc.name[user.lang] : loc.name;
                const locDesc = typeof loc.desc === 'object' ? loc.desc[user.lang] : loc.desc;

                const coordinate = evt.coordinate;
                content.innerHTML = loc.isSovereign ? 
                    `<b style="color:#d32f2f">${locName}</b><br>${locDesc}` :
                    `<div style="width: 220px;">
                        <img src="${loc.img}" style="width:100%; border-radius:8px; margin-bottom:8px;">
                        <b style="font-size:1.1rem; color:var(--primary);">${locName}</b>
                        <p style="font-size:0.85rem; margin:5px 0;">${locDesc}</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button onclick="showHeritageDetail(${loc.id}, 'craft')" style="background:var(--primary); color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem;">${user.lang === 'en' ? '🔍 View Details' : '🔍 Xem chi tiết'}</button>
                            ${loc.guardrailKey ? `<button onclick="showGuardrailDetail('${loc.guardrailKey}', ${loc.id})" style="background:var(--accent); color:var(--primary); border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem;">${user.lang === 'en' ? '📜 Craft Process' : '📜 Quy trình chế tác'}</button>` : ''}
                        </div>
                    </div>`;
                mapOverlay.setPosition(coordinate);
                container.style.display = 'block';
            } else {
                mapOverlay.setPosition(undefined);
                container.style.display = 'none';
            }
        });

        map.on('pointermove', function (e) {
            const pixel = map.getEventPixel(e.originalEvent);
            const hit = map.hasFeatureAtPixel(pixel);
            map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });
    }

    // === KNOWLEDGE LOGIC ===
    function renderKnowledge() {
        if (knowledgeGrid.children.length > 0) return;
        knowledgeGrid.innerHTML = KNOWLEDGE_DB.map(k => `
            <div class="card glass" onclick="showHeritageDetail(${k.id}, 'knowledge')">
                <div class="card-img" style="background-image: url('${k.img}')"></div>
                <div class="card-content">
                    <span class="region">${k.category[user.lang]}</span>
                    <h3>${k.title[user.lang]}</h3>
                    <p>${k.summary[user.lang]}</p>
                </div>
            </div>
        `).join('');
    }

    window.showGuardrailDetail = (key, locId) => {
        const guard = GUARDRAILS_DB[key];
        const loc = CRAFT_LOCATIONS.find(c => c.id === locId);
        if (!guard || !loc) return;

        document.getElementById('modal-title').textContent = typeof loc.name === 'object' ? loc.name[user.lang] : loc.name;
        
        const lang = user.lang;

        guardrailContent.innerHTML = `
            <div class="guardrail-section">
                <div class="guardrail-title">🏛️ ${isEn ? 'CORE IDENTITY' : 'BẢN SẮC CỐ ĐỊNH'} <span class="guardrail-badge">${guard.name[lang]}</span></div>
                <p>${guard.fixed[lang]}</p>
            </div>
            <div class="guardrail-section">
                <div class="guardrail-title">🎨 ${isEn ? 'PERSONALIZATION' : 'THÔNG SỐ BIẾN THIÊN'}</div>
                <p>${guard.variable[lang]}</p>
            </div>
            <div class="guardrail-warning">
                <strong>⚠️ ${isEn ? "ARTISAN'S WARNING" : 'CẢNH BÁO TỪ NGHỆ NHÂN'}:</strong>
                <p>${guard.warning[lang]}</p>
            </div>

            <div class="guardrail-section" style="background: rgba(var(--primary-glow), 0.1);">
                <div class="guardrail-title">🔧 ${isEn ? 'CRAFTING PROCESS' : 'QUY TRÌNH CHẾ TÁC'}</div>
                <ul style="padding-left: 20px; line-height: 1.6;">
                    ${guard.steps[lang].map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>

            <div class="guardrail-section" style="background: rgba(255, 82, 82, 0.05); border-color: rgba(255, 82, 82, 0.2);">
                <div class="guardrail-title" style="color: #ff5252;">🚫 ${isEn ? "DOS & DON'TS" : 'ĐIỀU KHÔNG NÊN LÀM'}</div>
                <ul style="padding-left: 20px; line-height: 1.6;">
                    ${guard.donts[lang].map(dont => `<li>${dont}</li>`).join('')}
                </ul>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div class="guardrail-section">
                    <div class="guardrail-title">⏱️ ${isEn ? 'LEAD TIME' : 'THỜI GIAN CHẾ TÁC'}</div>
                    <p>${guard.leadTime[lang]}</p>
                </div>
                <div class="guardrail-section">
                    <div class="guardrail-title">📊 ${isEn ? 'IMPACT' : 'MỨC ĐỘ TÁC ĐỘNG'}</div>
                    <p>${guard.impact[lang]}</p>
                </div>
            </div>
            <img src="${loc.img}" class="full-img" style="margin-top:20px;">
        `;
        heritageModal.classList.remove('hidden');
    };

    window.showHeritageDetail = (id, type) => {
        let item;
        if (type === 'craft') {
            item = CRAFT_LOCATIONS.find(c => c.id === id);
            if (!item) return;
            document.getElementById('modal-title').textContent = typeof item.name === 'object' ? item.name[user.lang] : item.name;
            guardrailContent.innerHTML = `
                <img id="modal-img" src="${item.img}" class="full-img">
                <div class="article-text">
                    <p><strong>📍 ${user.lang === 'en' ? 'Location' : 'Địa điểm'}:</strong> ${typeof item.location === 'object' ? item.location[user.lang] : item.location}</p>
                    <p>${typeof item.desc === 'object' ? item.desc[user.lang] : item.desc}</p>
                </div>
            `;
        } else {
            item = KNOWLEDGE_DB.find(k => k.id === id);
            if (!item) return;
            document.getElementById('modal-title').textContent = item.title[user.lang];
            guardrailContent.innerHTML = `
                <img src="${item.img}" class="full-img">
                <div class="article-text"><p>${item.content[user.lang]}</p></div>
            `;
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
        
        detectAndSwitchLanguage(text);
        
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

        if (user.lang === 'en') {
            return "Hello! I am your LocalViet Assistant. Would you like to ask about dialects, heritage sites, or travel tips?";
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

    // === ARTISAN AI LOGIC ===
    artisanTrigger.addEventListener('click', () => artisanWindow.classList.toggle('hidden'));
    closeArtisan.addEventListener('click', () => artisanWindow.classList.add('hidden'));

    artisanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = artisanInput.value.trim();
        if (!text) return;

        addArtisanMessage('user', text);
        artisanInput.value = '';

        detectAndSwitchLanguage(text);

        setTimeout(() => {
            const response = getArtisanResponse(text);
            addArtisanMessage('assistant', response);
        }, 500);
    });

    function addArtisanMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.innerHTML = `<div class="bubble">${content.replace(/\n/g, '<br>')}</div>`;
        artisanMessages.appendChild(msgDiv);
        artisanMessages.scrollTop = artisanMessages.scrollHeight;
    }

    function getArtisanResponse(input) {
        const isEnglish = user.lang === 'en' || (/^[a-zA-Z0-9\s?.,!]*$/.test(input) && input.split(' ').length > 1);
        const lowerInput = input.toLowerCase();
        const lang = isEnglish ? 'en' : 'vi';

        // NEW: Craft Process & Don'ts Logic
        const processKeywords = isEnglish ? ['how to', 'process', 'steps', 'make'] : ['cách làm', 'quy trình', 'các bước', 'làm thế nào'];
        const dontsKeywords = isEnglish ? ["don't", "forbidden", "prohibited", "rules"] : ['không nên', 'cấm', 'quy tắc', 'lưu ý'];
        
        let targetCategory = null;
        for (const key in GUARDRAILS_DB) {
            const cat = GUARDRAILS_DB[key];
            if (lowerInput.includes(cat.name.vi.toLowerCase()) || lowerInput.includes(cat.name.en.toLowerCase()) || lowerInput.includes(key)) {
                targetCategory = key;
                break;
            }
        }

        if (processKeywords.some(kw => lowerInput.includes(kw)) || dontsKeywords.some(kw => lowerInput.includes(kw))) {
            if (!targetCategory) {
                return isEnglish 
                    ? "Which craft category are you interested in (Bronze, Ceramics, Lacquer, Textiles, Sculpture, Jewelry)?"
                    : "Bạn đang quan tâm đến nhóm nghề nào (Đúc đồng, Gốm sứ, Sơn mài, Dệt, Điêu khắc, Trang sức bạc)?";
            }

            const guard = GUARDRAILS_DB[targetCategory];
            const steps = guard.steps[lang].slice(0, 3);
            const donts = guard.donts[lang].slice(0, 2);

            if (isEnglish) {
                return `The process for **${guard.name.en}** has these main steps:\n\n` +
                       steps.map((s, i) => `${i + 1}️⃣ **${s}**`).join('\n') +
                       `\n\n🚫 **Don'ts**:\n` +
                       donts.map(d => `- ${d}`).join('\n') +
                       `\n\nWould you like me to explain any specific step in detail?`;
            } else {
                return `Quy trình làm **${guard.name.vi}** gồm các bước chính:\n\n` +
                       steps.map((s, i) => `${i + 1}️⃣ **${s}**`).join('\n') +
                       `\n\n🚫 **Điều không nên làm**:\n` +
                       donts.map(d => `- ${d}`).join('\n') +
                       `\n\nBạn muốn tôi giải thích kỹ hơn về bước nào không?`;
            }
        }

        if (isEnglish) {
            if (lowerInput.includes('buy') || lowerInput.includes('purchase') || lowerInput.includes('workshop')) {
                return "I'd love to help you find a workshop or make a purchase! Could you please share your current city or province so I can find the nearest authentic artisan for you?";
            }
            return "Hello! I am your Artisan AI. I can guide you through traditional processes, lead times, and authentic craft standards. How can I help you today?";
        } else {
            if (lowerInput.includes('mua') || lowerInput.includes('đặt hàng') || lowerInput.includes('xưởng')) {
                return "Chào bạn! Tôi rất sẵn lòng hỗ trợ bạn tìm xưởng hoặc đặt hàng. Để tôi có thể gợi ý nơi gần bạn nhất, vui lòng cho tôi biết bạn đang ở tỉnh/thành phố nào nhé?";
            }
            return "Chào bạn, tôi là Nghệ nhân AI. Tôi có thể giải đáp về các quy tắc bản sắc (Guardrails), thời gian và giá cả của các làng nghề thủ công. Bạn muốn hỏi gì ạ?";
        }
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
