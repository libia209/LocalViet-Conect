document.addEventListener('DOMContentLoaded', () => {
    // === CẤP CỨU LỖI ===
    window.onerror = function(message, source, lineno, colno, error) {
        console.error("LỖI JS:", message, "tại dòng:", lineno);
        alert("Phát hiện lỗi JS tại dòng " + lineno + ": " + message);
        return false;
    };

    // === DOM ELEMENTS ===
    const loginForm = document.getElementById('login-form');
    let user = { name: '', email: '', messages: [], lang: 'vi', isLoggedIn: false };
    const chatForm = document.getElementById('chat-form');
    const introContainer = document.getElementById('intro-container');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle ? themeToggle.querySelector('.sun') : null;
    const moonIcon = themeToggle ? themeToggle.querySelector('.moon') : null;

    const navItems = document.querySelectorAll('.nav-item');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const chatView = document.getElementById('chat-messages');
    const mapView = document.getElementById('map-view');
    const knowledgeView = document.getElementById('knowledge-view');
    const knowledgeGrid = document.getElementById('knowledge-grid');
    const chatInputContainer = document.querySelector('.chat-input-container');

    const btnToggleBoard = document.getElementById('btn-toggle-board');
    const contentBoard = document.getElementById('content-board');
    const boardOverlay = document.getElementById('board-overlay');
    const closeBoard = document.getElementById('close-board');
    const boardNavButtons = document.querySelectorAll('.board-nav-btn');
    const boardKnowledgeList = document.getElementById('board-knowledge-list');
    const boardCraftList = document.getElementById('board-craft-list');

    const shopView = document.getElementById('shop-view');
    const shopProductsGrid = document.getElementById('shop-products-grid');
    const shopFilterCategory = document.getElementById('shop-filter-category');
    const shopFilterRegion = document.getElementById('shop-filter-region');
    const btnViewCart = document.getElementById('btn-view-cart');
    const cartCount = document.getElementById('cart-count');
    const shopProductModal = document.getElementById('shop-product-modal');
    const closeProductModal = document.getElementById('close-product-modal');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.getElementById('close-cart-modal');
    const inAppNotification = document.getElementById('in-app-notification');

    // === INTRO BUTTON (ưu tiên khởi tạo đầu tiên) ===
    const startDiscoveryBtn = document.getElementById('start-discovery');
    if (startDiscoveryBtn) {
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
    }

    const heritageModal = document.getElementById('heritage-modal');
    const closeHeritage = document.getElementById('close-heritage');
    const guardrailContent = document.getElementById('guardrail-content');


    // === DATA DATABASES ===
    let DIALECT_DB = {};
    let PHONOLOGY_RULES = [];

    async function fetchData() {
        try {
            const response = await fetch('/api/dialects');
            const data = await response.json();

            if (data.phonology) PHONOLOGY_RULES = data.phonology;

            if (data.categories) {
                for (const cat in data.categories) {
                    data.categories[cat].forEach(item => {
                        DIALECT_DB[item.word.toLowerCase()] = {
                            mean: item.meaning,
                            region: item.region,
                            ex: item.example,
                            nuance: item.nuance
                        };
                    });
                }
            }
        } catch (err) {
            console.error("Failed to load dialect data:", err);
            // Fallback
            DIALECT_DB = {
                "mô": { mean: "đâu", region: "Miền Trung", ex: "Mi đi mô rứa?" },
                "răng": { mean: "sao", region: "Miền Trung", ex: "Răng mà khóc?" }
            };
        }
    }
    fetchData();

    const KNOWLEDGE_DB = [
        {
            id: 1,
            category: { vi: "Hành trình di sản", en: "Heritage Itinerary" },
            title: { vi: "Gốm Bát Tràng - Tinh hoa ngàn năm", en: "Bat Trang Pottery - Millennial Essence" },
            summary: { vi: "Khám phá mê cung ngõ nhỏ và quy trình vuốt men ngọc di sản.", en: "Explore narrow alleys and the heritage celadon glazing process." },
            content: {
                vi: "<b>Mô tả:</b> Nằm bên bờ sông Hồng, ngôi làng 1.000 năm tuổi này sở hữu Bảo tàng đương đại ấn tượng. Du khách sẽ trải nghiệm nặn gốm trên bàn xoay thủ công.<br><br><b>Quy tắc ứng xử:</b> Nên hỏi về 'Câu chuyện Tổ nghề' trước khi quay phim. Không chạm vào sản phẩm chờ nung lần hai.<br><br><b>Chi phí tham khảo:</b> Xe Grab từ trung tâm: 200k. Trải nghiệm nặn gốm: 50k. Bình gốm cao cấp: 2.5tr - 15tr VND.",
                en: "<b>Description:</b> A 1,000-year-old village on the Red River with a stunning contemporary Museum. Experience manual potter's wheels.<br><br><b>Etiquette:</b> Ask for the 'Ancestral Story' before filming. Do not touch pieces waiting for the 'Second Firing'.<br><br><b>Costs:</b> Grab ride: $10. DIY pottery: $2. High-end vases: $100 - $600."
            },
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 2,
            category: { vi: "Hành trình di sản", en: "Heritage Itinerary" },
            title: { vi: "Lụa Vạn Phúc - Con đường tơ lụa Hà Đông", en: "Van Phuc Silk - Ha Dong Silk Road" },
            summary: { vi: "Kỹ thuật dệt lụa Vân ẩn hiện và con đường ô rực rỡ.", en: "Van silk weaving technique and vibrant umbrella streets." },
            content: {
                vi: "<b>Mô tả:</b> Làng lụa nổi tiếng with lụa vân mịn màng. Du khách nghe tiếng 'lách cách' của khung cửi cổ và ngắm hoa văn ẩn hiện theo ánh sáng.<br><br><b>Quy tắc ứng xử:</b> Dùng mu bàn tay cảm nhận lụa. Tránh đeo phụ kiện sắc nhọn làm xước lụa thô.<br><br><b>Chi phí tham khảo:</b> Bún chả: 50k. Khăn lụa: 300k - 800k. Lụa vân nguyên chất: 1.5tr/mét.",
                en: "<b>Description:</b> Famous for smooth Van silk. Witness 'Cloud Pattern Weaving' where patterns appear/disappear with light.<br><br><b>Etiquette:</b> Feel silk with the back of your hand. Avoid sharp accessories that might snag fabric.<br><br><b>Costs:</b> Lunch: $2. Silk scarves: $12 - $32. Pure Van Silk: $60/meter."
            },
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 3,
            category: { vi: "Hành trình di sản", en: "Heritage Itinerary" },
            title: { vi: "Tranh Đông Hồ - Hồn dân tộc trên giấy Điệp", en: "Dong Ho Paintings - Folk Spirit" },
            summary: { vi: "Tìm hiểu quy trình làm giấy Điệp lấp lánh và in màu tự nhiên.", en: "Learn the sparkling Diep paper process and natural color printing." },
            content: {
                vi: "<b>Mô tả:</b> Du khách chứng kiến quy trình làm giấy Điệp từ vỏ sò điệp sông. Trải nghiệm dùng bản khắc gỗ dập màu tự nhiên lên hình ảnh biểu tượng như 'Lợn ăn cây ráy'.<br><br><b>Quy tắc ứng xử:</b> Không chạm vào tranh vừa in còn ướt. Tìm hiểu ý nghĩa biểu tượng của các con vật.<br><br><b>Chi phí tham khảo:</b> Xe khứ hồi từ HN: 500k. Tranh đơn: 50k. Tranh đóng khung cao cấp: 1tr - 3.5tr VND.",
                en: "<b>Description:</b> Witness Diep paper creation from oyster shells. Use hand-carved woodblocks to press natural colors onto folk images.<br><br><b>Etiquette:</b> Never touch a wet print. Ask about the symbolism of the animals.<br><br><b>Costs:</b> Private round trip: $25. Simple prints: $2. Framed masterpieces: $40 - $140."
            },
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 4,
            category: { vi: "Hành trình di sản", en: "Heritage Itinerary" },
            title: { vi: "Hương Thủy Xuân - Bản giao hưởng màu sắc", en: "Thuy Xuan Incense - Color Symphony" },
            summary: { vi: "Rực rỡ những bó hương xòe hoa dưới chân đồi Vọng Cảnh.", en: "Vibrant incense bouquets blooming at the foot of Vong Canh hill." },
            content: {
                vi: "<b>Mô tả:</b> Ngôi làng rực rỡ with những bó tăm hương đa sắc. Du khách xem quy trình trộn bột quế và se hương thủ công.<br><br><b>Quy tắc ứng xử:</b> Mua ủng hộ quà lưu niệm nếu chụp ảnh nhiều. Tôn trọng giá trị tâm linh của hương.<br><br><b>Chi phí tham khảo:</b> Bún bò Huế: 35k. Bó hương: 40k. Nón bài thơ: 150k - 300k VND.",
                en: "<b>Description:</b> A village characterized by multi-colored incense 'bouquets'. Watch cinnamon powder mixing and manual rolling.<br><br><b>Etiquette:</b> Buy a souvenir if you take many photos. Respect the sacred role of incense.<br><br><b>Costs:</b> Bun Bo Hue: $1.5. Incense bundles: $1.6. Special poem conical hats: $6 - $12."
            },
            img: "https://images.unsplash.com/photo-1549429451-9128f7311749?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 5,
            category: { vi: "Hành trình di sản", en: "Heritage Itinerary" },
            title: { vi: "Lụa Tân Châu - Nữ hoàng tơ tằm phương Nam", en: "Tan Chau Silk - Southern Queen" },
            summary: { vi: "Di sản Lãnh Mỹ A nhuộm từ trái mặc nưa 100 lần công phu.", en: "Legendary Lanh My A silk dyed 100 times with Mac Nua fruit." },
            content: {
                vi: "<b>Mô tả:</b> Đỉnh cao dệt may Mekong. Lụa đen bóng được phơi trên bãi cỏ bạt ngàn và đập bằng búa gỗ để tạo độ bóng da thuộc.<br><br><b>Quy tắc ứng xử:</b> Tuyệt đối không giẫm lên lụa đang phơi trên cỏ. Không mặc cả cho hàng xa xỉ.<br><br><b>Chi phí tham khảo:</b> Bún cá Châu Đốc: 40k. Khăn Lãnh Mỹ A: 1.2tr - 2.5tr. Vải lụa mộc: 1.5tr/mét VND.",
                en: "<b>Description:</b> The pinnacle of Mekong textiles. Black silk dyed 100 times, spread on vast grass fields and hammered for metallic sheen.<br><br><b>Etiquette:</b> Never walk across silk drying on grass. No bargaining for luxury items.<br><br><b>Costs:</b> Fish noodles: $1.6. Lanh My A scarves: $48 - $100. Fabric: $60/meter."
            },
            img: "https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=800"
        }
    ];

    const GUARDRAILS_DB = {
        bronze: {
            name: { vi: "Đúc đồng", en: "Bronze Casting" },
            fixed: {
                vi: "Sản phẩm phải đảm bảo tỉ lệ hợp kim đồng truyền thống để duy trì độ vang (chuông, chiêng) và độ bền cơ học. Các quy chuẩn về hình dáng bộ Tam sự, Ngũ sự và diện mạo tượng Phật, danh nhân phải tuân thủ nghiêm ngặt điển tích và tỷ lệ nhân trắc học truyền thống.",
                en: "Must adhere to traditional alloy ratios for resonance and durability. Strictly follow traditional iconography and anatomical proportions for ritual sets and statues."
            },
            variable: {
                vi: "Kích thước tùy chỉnh để phù hợp không gian trưng bày, lựa chọn lớp hoàn thiện (dát vàng 24k, mạ bạc, màu giả cổ). Hỗ trợ khắc thêm tên gia tộc hoặc lời chúc.",
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
            name: { vi: "Sơn mài", en: "Lacquerware" },
            fixed: {
                vi: "Sử dụng mủ cây sơn tự nhiên (sơn then, sơn cánh gián), kỹ thuật 'ủ ẩm - mài mòn'. Các nguyên liệu quý như vàng/bạc thếp, vỏ trứng, vỏ trai.",
                en: "Use natural lacquer sap, 'humidity-curing & sanding' technique. Gold/silver leaf, eggshells, mother-of-pearl."
            },
            variable: {
                vi: "Cốt vật liệu (gỗ, mây tre, gốm), đề tài hội họa tùy chỉnh (từ chân dung đến phong cảnh).",
                en: "Base materials (wood, bamboo, ceramic), custom themes (portraits to landscapes)."
            },
            warning: {
                vi: "Tuyệt đối không dùng máy sấy nhiệt hoặc sơn PU công nghiệp; quy trình ủ ẩm tự nhiên là bắt buộc để đạt độ bền 50-200 năm.",
                en: "Strictly Forbidden to use heat dryers or industrial PU paint. Natural curing ensures 50-200 years durability."
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
            name: { vi: "Dệt thủ công", en: "Textiles" },
            fixed: {
                vi: "Tơ tằm tự nhiên hoặc sợi lanh. Họa tiết xoắn ốc (người Mông) hoặc hoa văn móng tay (người Chăm) giữ đúng cấu trúc tâm linh.",
                en: "Natural silk or linen. Sacred motifs (spiral, fingernails) must preserve spiritual structure."
            },
            variable: {
                vi: "Màu sắc nhuộm từ thực vật, thiết kế kiểu dáng hiện đại (áo dài, túi xách) trên khổ vải truyền thống.",
                en: "Natural dye colors, modern fashion designs on traditional fabric widths."
            },
            warning: {
                vi: "Không dùng thuốc nhuộm hóa học; không biến tấu sai lệch các họa tiết tâm linh gắn với vòng đời.",
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
                vi: "Vật liệu tự nhiên (gỗ mít, đá nguyên khối). Sơn son thếp vàng/bạc thủ công đảm bảo độ rực rỡ và trang nghiêm.",
                en: "Natural materials (jackfruit wood, solid stone). Manual gold/silver leafing for solemnity."
            },
            variable: {
                vi: "Tùy chỉnh kích thước cho không gian thờ tự hoặc tiểu cảnh; lựa chọn vân gỗ hoặc màu đá.",
                en: "Custom sizes for worship or gardens, wood grain or stone selection."
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
            name: { vi: "Trang sức bạc", en: "Ethnic Silver" },
            fixed: {
                vi: "Bạc nõn nguyên chất, kỹ thuật cán, kéo sợi và chạm khắc thủ công. Họa tiết xoắn ốc và tua bạc tạo âm thanh leng keng.",
                en: "Pure Silver (bạc nõn), manual wire-drawing and engraving. Spiral motifs and tinkling tassels."
            },
            variable: {
                vi: "Tùy chỉnh công năng (vòng thành nhẫn/phụ kiện), điều chỉnh số lượng tua để thay đổi âm thanh.",
                en: "Modified functions (neck ring to brooch), adjustable tassels for sound profile."
            },
            warning: {
                vi: "Không pha trộn kim loại tạp chất vào bạc vì bạc là 'vệ sĩ' bảo vệ hồn vía và sức khỏe.",
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
        // --- MIỀN BẮC ---
        {
            id: 101,
            name: { vi: "Làng Ngũ Xã", en: "Ngu Xa Village" },
            location: { vi: "Ba Đình, Hà Nội", en: "Ba Dinh, Hanoi" },
            lat: 21.0400, lng: 105.8380,
            desc: {
                vi: "Hình thành từ thế kỷ XVII, tinh hoa đúc đồng bậc nhất Kinh thành Thăng Long. Showroom: 178 Phố Trấn Vũ.",
                en: "Established in the 17th century, one of the elite crafts of ancient Thang Long. Showroom: 178 Tran Vu St."
            },
            img: "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'bronze'
        },
        {
            id: 110,
            name: { vi: "Làng Tống Xá", en: "Tong Xa Village" },
            location: { vi: "Ý Yên, Nam Định", en: "Y Yen, Nam Dinh" },
            lat: 20.3500, lng: 105.9500,
            desc: {
                vi: "Cái nôi 900 năm nghề đúc đồng. Showroom: 66 Nguyễn Xiển, Hà Nội.",
                en: "The 900-year cradle of bronze casting. Showroom: 66 Nguyen Xien, Hanoi."
            },
            img: "https://images.unsplash.com/photo-1599508704512-2f19fe912037?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'bronze'
        },
        {
            id: 1,
            name: { vi: "Làng gốm Bát Tràng", en: "Bat Trang Pottery Village" },
            location: { vi: "Gia Lâm, Hà Nội", en: "Gia Lam, Hanoi" },
            lat: 20.9800, lng: 105.9200,
            desc: {
                vi: "Di sản 1.000 năm ven sông Hồng. Nghệ nhân tiêu biểu: Phạm Đạt, Trần Độ. Bảo tàng Gốm: Xóm 7.",
                en: "1,000-year heritage on the Red River. Famous artisans: Pham Dat, Tran Do. Ceramic Museum: Commune 7."
            },
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'ceramics'
        },
        {
            id: 111,
            name: { vi: "Làng gốm Chu Đậu", en: "Chu Dau Ceramics" },
            location: { vi: "Nam Sách, Hải Dương", en: "Nam Sach, Hai Duong" },
            lat: 20.9833, lng: 106.3333,
            desc: {
                vi: "Gốm di sản thế kỷ XIII-XIV. Sử dụng đất sét trắng Trúc Thôn, men trắng trong họa tiết xanh chàm.",
                en: "13th-14th century heritage. Features bamboo-white clay and cobalt blue patterns."
            },
            img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'ceramics'
        },
        {
            id: 2,
            name: { vi: "Làng lụa Vạn Phúc", en: "Van Phuc Silk Village" },
            location: { vi: "Hà Đông, Hà Nội", en: "Ha Dong, Hanoi" },
            lat: 20.9500, lng: 105.7667,
            desc: {
                vi: "Nổi tiếng với lụa Vân ẩn hiện. Con đường ô rực rỡ và tiếng khung cửi lách cách.",
                en: "Famous for exquisite Van silk. Known for vibrant umbrella streets and ancient loams."
            },
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },
        {
            id: 112,
            name: { vi: "Làng Sơn Đồng", en: "Son Dong Village" },
            location: { vi: "Hoài Đức, Hà Nội", en: "Hoai Duc, Hanoi" },
            lat: 21.0167, lng: 105.7167,
            desc: {
                vi: "Thủ phủ điêu khắc tượng gỗ tâm linh. Sử dụng gỗ mít chất lượng cao, thếp vàng bạc thủ công.",
                en: "Capital of spiritual wood carving. Specialized in high-quality jackfruit wood and manual gold leafing."
            },
            img: "https://images.unsplash.com/photo-1518331318466-281ca04df77a?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'sculpture'
        },
        {
            id: 113,
            name: { vi: "Sơn mài Hạ Thái", en: "Ha Thai Lacquer" },
            location: { vi: "Thường Tín, Hà Nội", en: "Thuong Tin, Hanoi" },
            lat: 20.8833, lng: 105.8667,
            desc: {
                vi: "Làng sơn mài di sản. Bắt buộc ủ ẩm tự nhiên, không dùng máy sấy nhiệt hay sơn PU.",
                en: "Heritage lacquer village. Mandatory natural curing without heat dryers or PU paint."
            },
            img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'lacquer'
        },
        {
            id: 114,
            name: { vi: "Trang sức bạc Mông", en: "H'Mong Silver Jewelry" },
            location: { vi: "Lào Cai / Hà Giang", en: "Lao Cai / Ha Giang" },
            lat: 22.4833, lng: 103.9667,
            desc: {
                vi: "Bạc nõn bảo vệ hồn vía. Họa tiết xoắn ốc và tua bạc leng keng đặc trưng.",
                en: "Pure silver protectors. Features sacred spirals and distinctive tinkling tassels."
            },
            img: "https://images.unsplash.com/photo-1621600411666-ac748c080486?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'jewelry'
        },

        // --- MIỀN TRUNG ---
        {
            id: 201,
            name: { vi: "Làng Phường Đúc", en: "Phuong Duc Village" },
            location: { vi: "Huế", en: "Hue" },
            lat: 16.4500, lng: 107.5667,
            desc: {
                vi: "Đúc đồng cung đình Huế với kỹ thuật tinh xảo cho đại hồng chung.",
                en: "Royal Hue bronze casting, specialized in intricate temple bells."
            },
            img: "https://images.unsplash.com/photo-1599508704512-2f19fe912037?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'bronze'
        },
        {
            id: 102,
            name: { vi: "Làng gốm Bàu Trúc", en: "Bau Truc Pottery" },
            location: { vi: "Ninh Thuận", en: "Ninh Thuan" },
            lat: 11.5333, lng: 108.9667,
            desc: {
                vi: "Gốm cổ Chăm nung lộ thiên, không bàn xoay, không phủ men. Kỹ thuật 'vừa đi vừa nặn'.",
                en: "Ancient Champa pottery. Hand-molded and open-fired without glazes or wheels."
            },
            img: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'ceramics'
        },
        {
            id: 202,
            name: { vi: "Làng gốm Thanh Hà", en: "Thanh Ha Pottery" },
            location: { vi: "Hội An, Quảng Nam", en: "Hoi An, Quang Nam" },
            lat: 15.8833, lng: 108.3000,
            desc: {
                vi: "Kỹ thuật 'đôi chân vàng': một người đạp bàn xoay, một người vuốt đất. Vé: 35.000đ.",
                en: "The 'Golden Feet' technique: one kicks the wheel, one shapes the clay. Fee: 35,000 VND."
            },
            img: "https://images.unsplash.com/photo-1512413316925-fd450ddbec12?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'ceramics'
        },
        {
            id: 203,
            name: { vi: "Đá mỹ nghệ Non Nước", en: "Non Nuoc Stone Carving" },
            location: { vi: "Ngũ Hành Sơn, Đà Nẵng", en: "Da Nang" },
            lat: 16.0333, lng: 108.2500,
            desc: {
                vi: "Sử dụng đá nguyên khối tự nhiên. Cấm tuyệt đối nhựa composite giả đá.",
                en: "Uses solid natural stone. Strictly forbidden to use composite resin imitations."
            },
            img: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'sculpture'
        },
        {
            id: 5,
            name: { vi: "Làng hương Thủy Xuân", en: "Thuy Xuan Incense" },
            location: { vi: "Huế", en: "Hue" },
            lat: 16.4450, lng: 107.5600,
            desc: {
                vi: "Rực rỡ những 'bó hoa' hương. Du khách xem quy trình trộn bột quế và se tăm hương.",
                en: "Vibrant 'bouquets' of incense. Watch the cinnamon powder mixing and manual rolling."
            },
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },

        // --- MIỀN NAM ---
        {
            id: 103,
            name: { vi: "Sơn mài Tương Bình Hiệp", en: "Tuong Binh Hiep Lacquer" },
            location: { vi: "Bình Dương", en: "Binh Duong" },
            lat: 10.9833, lng: 106.6500,
            desc: {
                vi: "Tinh hoa sơn mài phương Nam. Độ bền tác phẩm từ 50-100 năm nhờ mủ cây sơn tự nhiên.",
                en: "Southern lacquer essence. Works last 50-100 years using natural tree sap."
            },
            img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'lacquer'
        },
        {
            id: 104,
            name: { vi: "Làng lụa Tân Châu", en: "Tan Chau Silk Village" },
            location: { vi: "An Giang", en: "An Giang" },
            lat: 10.8167, lng: 105.2333,
            desc: {
                vi: "Nổi tiếng với Lãnh Mỹ A đen bóng nhuộm từ trái mặc nưa. Không mặc cả cho hàng xa xỉ.",
                en: "Home of shiny black Lanh My A silk dyed with Mac Nua fruit. No bargaining for luxury items."
            },
            img: "https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },
        {
            id: 301,
            name: { vi: "Nước mắm Phú Quốc", en: "Phu Quoc Fish Sauce" },
            location: { vi: "Phú Quốc, Kiên Giang", en: "Phu Quoc Island" },
            lat: 10.2167, lng: 103.9667,
            desc: {
                vi: "Di sản nhà thùng khổng lồ. Nước mắm cốt nhĩ 45 độ đạm màu hổ phách.",
                en: "Giant barrel-house heritage. Amber-colored, 45N protein premium fish sauce."
            },
            img: "https://images.unsplash.com/photo-1596484552979-3d7143d24029?auto=format&fit=crop&q=80&w=800",
            guardrailKey: 'textiles'
        },

        // --- SOVEREIGNTY ---
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
    let map = null;
    let mapOverlay = null;
    let activeInfoWindow = null;
    let googleMarkers = {};
    let googleInfoWindows = {};

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
        // Update content board text if it is active
        if (contentBoard && contentBoard.classList.contains('active')) {
            renderBoardContent();
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
        if (shopView) shopView.classList.add('hidden');
        chatInputContainer.classList.add('hidden');

        if (index === 0) {
            chatView.classList.remove('hidden');
            chatInputContainer.classList.remove('hidden');
        } else if (index === 1) {
            mapView.classList.remove('hidden');
            initMap();
            if (map) {
                const zoom = window.innerWidth < 768 ? 5.5 : 6;
                setTimeout(() => {
                    if (typeof map.invalidateSize === 'function') {
                        map.invalidateSize();
                        map.panTo([15.75, 106.125]);
                        map.setZoom(zoom);
                    } else if (typeof map.panTo === 'function') {
                        map.panTo({ lat: 15.75, lng: 106.125 });
                        map.setZoom(zoom);
                    }
                }, 100);
            }
        } else if (index === 2) {
            knowledgeView.classList.remove('hidden');
            renderKnowledge();
        } else if (index === 3) {
            if (shopView) shopView.classList.remove('hidden');
            renderShopProducts();
        }
    }

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => switchTab(index));
    });

    mobileNavItems.forEach((item, index) => {
        item.addEventListener('click', () => switchTab(index));
    });

    // === MAP LOGIC (Leaflet Fallback & Google Maps Config) ===
    const FORCE_GOOGLE_MAPS = false; // Đổi thành true khi lọt vào vòng sau để chuyển sang Google Maps

    async function initMap() {
        if (map) return;

        if (!FORCE_GOOGLE_MAPS) {
            console.log("Using Leaflet fallback map (free, clean design, Vietnamese place labels).");
            initializeLeafletMap();
            return;
        }

        // 1. Fetch Google Maps API Key from Backend
        try {
            const res = await fetch('/api/config');
            const config = await res.json();
            const apiKey = config.google_maps_api_key;

            if (!apiKey || apiKey.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
                console.warn("Google Maps API Key is missing or invalid. Falling back to Leaflet.");
                initializeLeafletMap();
                return;
            }

            // 2. Load Google Maps script dynamically
            window.initGoogleMap = function () {
                initializeGoogleMap();
            };

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

        } catch (err) {
            console.error("Failed to load map configuration, falling back to Leaflet:", err);
            initializeLeafletMap();
        }
    }

    function initializeLeafletMap() {
        map = L.map('map', {
            center: [15.9, 106.1],
            zoom: 6,
            minZoom: 5,
            maxZoom: 18
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CartoDB'
        }).addTo(map);

        // Add Sovereignty Banner Overlay
        const banner = document.createElement('div');
        banner.className = 'sovereignty-banner-ol';
        banner.style.position = 'absolute';
        banner.style.top = '10px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.zIndex = '999';
        banner.innerHTML = '🇻🇳 Quần đảo Hoàng Sa & Trường Sa thuộc chủ quyền Việt Nam';
        document.getElementById('map-container').appendChild(banner);

        CRAFT_LOCATIONS.forEach(loc => {
            const locName = typeof loc.name === 'object' ? loc.name[user.lang] : loc.name;
            const locDesc = typeof loc.desc === 'object' ? loc.desc[user.lang] : loc.desc;

            let emoji = '🏺';
            if (loc.isSovereign) {
                emoji = '🇻🇳';
            } else {
                const key = loc.guardrailKey;
                if (key === 'ceramics') emoji = '🏺';
                else if (key === 'bronze') emoji = '🔔';
                else if (key === 'textiles') emoji = '🧵';
                else if (key === 'sculpture') emoji = '🗿';
                else if (key === 'lacquer') emoji = '🎨';
                else if (key === 'jewelry') emoji = '💍';
            }

            const customIcon = L.divIcon({
                html: `<div style="font-size: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;">${emoji}</div>`,
                className: 'custom-emoji-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

            const infoWindowContent = loc.isSovereign ?
                `<div style="color:#d32f2f; font-family:Montserrat,sans-serif; padding:5px; font-size:0.95rem;"><b>${locName}</b><br>${locDesc}</div>` :
                `<div style="width: 220px; font-family:Montserrat,sans-serif; padding:5px;">
                    <img src="${loc.img}" style="width:100%; border-radius:8px; margin-bottom:8px; height:120px; object-fit:cover;">
                    <b style="font-size:1.1rem; color:var(--primary);">${locName}</b>
                    <p style="font-size:0.85rem; margin:5px 0; color:#333; line-height:1.4;">${locDesc}</p>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                        <button onclick="showHeritageDetail(${loc.id}, 'craft')" style="background:var(--primary); color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem; width:100%;">${user.lang === 'en' ? '🔍 View Details' : '🔍 Xem chi tiết'}</button>
                        ${loc.guardrailKey ? `<button onclick="showHeritageDetail(${loc.id}, 'craft')" style="background:var(--accent); color:var(--primary); border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem; width:100%;">${user.lang === 'en' ? '📜 Craft Process' : '📜 Quy trình chế tác'}</button>` : ''}
                        ${[1, 2, 5].includes(loc.id) ? `<button onclick="triggerWorkshopCompletion(${loc.id})" style="background:#2e7d32; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem; width:100%;">${user.lang === 'en' ? '✅ Complete Workshop' : '✅ Hoàn thành Workshop'}</button>` : ''}
                    </div>
                </div>`;

            marker.bindPopup(infoWindowContent);

            if (loc.id) {
                googleMarkers[loc.id] = marker;
            }
        });
    }

    function initializeGoogleMap() {
        // Create the map centered on Vietnam
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 15.9, lng: 106.1 },
            zoom: 6,
            minZoom: 5,
            maxZoom: 18,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        });

        // Add Sovereignty Banner Overlay
        const banner = document.createElement('div');
        banner.className = 'sovereignty-banner-ol';
        banner.style.position = 'absolute';
        banner.style.top = '10px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.zIndex = '99';
        banner.innerHTML = '🇻🇳 Quần đảo Hoàng Sa & Trường Sa thuộc chủ quyền Việt Nam';
        document.getElementById('map-container').appendChild(banner);

        CRAFT_LOCATIONS.forEach(loc => {
            const locName = typeof loc.name === 'object' ? loc.name[user.lang] : loc.name;
            const locDesc = typeof loc.desc === 'object' ? loc.desc[user.lang] : loc.desc;

            let markerOptions = {
                position: { lat: loc.lat, lng: loc.lng },
                map: map,
                title: locName
            };

            if (loc.isSovereign) {
                markerOptions.label = {
                    text: '🇻🇳',
                    fontSize: '16px'
                };
            } else {
                let emoji = '🏺';
                const key = loc.guardrailKey;
                if (key === 'ceramics') emoji = '🏺';
                else if (key === 'bronze') emoji = '🔔';
                else if (key === 'textiles') emoji = '🧵';
                else if (key === 'sculpture') emoji = '🗿';
                else if (key === 'lacquer') emoji = '🎨';
                else if (key === 'jewelry') emoji = '💍';
                
                markerOptions.label = {
                    text: emoji,
                    fontSize: '14px'
                };
            }

            const marker = new google.maps.Marker(markerOptions);

            const infoWindowContent = loc.isSovereign ?
                `<div style="color:#d32f2f; font-family:Montserrat,sans-serif; padding:5px; font-size:0.95rem;"><b>${locName}</b><br>${locDesc}</div>` :
                `<div style="width: 220px; font-family:Montserrat,sans-serif; padding:5px;">
                    <img src="${loc.img}" style="width:100%; border-radius:8px; margin-bottom:8px; height:120px; object-fit:cover;">
                    <b style="font-size:1.1rem; color:var(--primary);">${locName}</b>
                    <p style="font-size:0.85rem; margin:5px 0; color:#333; line-height:1.4;">${locDesc}</p>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                        <button onclick="showHeritageDetail(${loc.id}, 'craft')" style="background:var(--primary); color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem;">${user.lang === 'en' ? '🔍 View Details' : '🔍 Xem chi tiết'}</button>
                        ${loc.guardrailKey ? `<button onclick="showGuardrailDetail('${loc.guardrailKey}', ${loc.id})" style="background:var(--accent); color:var(--primary); border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem;">${user.lang === 'en' ? '📜 Craft Process' : '📜 Quy trình chế tác'}</button>` : ''}
                        ${[1, 2, 5].includes(loc.id) ? `<button onclick="triggerWorkshopCompletion(${loc.id})" style="background:#2e7d32; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.8rem;">${user.lang === 'en' ? '✅ Complete Workshop' : '✅ Hoàn thành Workshop'}</button>` : ''}
                    </div>
                </div>`;

            const infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });

            if (loc.id) {
                googleMarkers[loc.id] = marker;
                googleInfoWindows[loc.id] = infoWindow;
            }

            marker.addListener('click', () => {
                if (activeInfoWindow) {
                    activeInfoWindow.close();
                }
                infoWindow.open(map, marker);
                activeInfoWindow = infoWindow;
            });
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
        const isEn = lang === 'en';

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
                ${getRelatedProductsHtml(item.id)}
            `;
        } else {
            item = KNOWLEDGE_DB.find(k => k.id === id);
            if (!item) return;
            document.getElementById('modal-title').textContent = item.title[user.lang];
            guardrailContent.innerHTML = `
                <img src="${item.img}" class="full-img">
                <div class="article-text"><p>${item.content[user.lang]}</p></div>
                ${getRelatedProductsHtml(item.id)}
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

        const typingId = addTypingIndicator();
        try {
            // Kiểm tra Ngăn dữ liệu dựa trên bộ từ khóa toàn diện
            let mode = null;
            const lowerText = text.toLowerCase();
            
            // 1. Định nghĩa từ khóa cho ngăn Phương Ngữ (DIALECT)
            const dialectTriggers = [
                'phương ngữ', 'tiếng địa phương', 'dịch từ', 'dịch tiếng', 'nghĩa là gì', 
                'nghĩa là chi', 'tiếng huế', 'tiếng miền', 'tiếng nghệ an', 'tiếng quảng nam', 
                'tiếng hà tĩnh', 'từ địa phương', 'nói tiếng', 'nói giọng', 'giọng miền', 
                'giọng huế', 'giọng quảng', 'nghĩa của từ', 'dialect', 'accent', 'nghĩa là thế nào'
            ];

            let isDialect = dialectTriggers.some(trigger => lowerText.includes(trigger)) || lowerText.startsWith('/pn');

            // Kiểm tra thêm từ điển DIALECT_DB động để tự động bắt các từ cụ thể
            if (!isDialect && typeof DIALECT_DB === 'object') {
                for (const word in DIALECT_DB) {
                    const regex = new RegExp(`(^|[^a-zA-ZÀ-ỹ])(${word})([^a-zA-ZÀ-ỹ]|$)`, 'i');
                    if (regex.test(lowerText)) {
                        isDialect = true;
                        break;
                    }
                }
            }

            // 2. Định nghĩa từ khóa cho ngăn Thủ Công (CRAFT)
            const craftTriggers = [
                // Địa danh & Làng nghề (Module A)
                'bát tràng', 'vạn phúc', 'ngũ xã', 'tống xá', 'sơn đồng', 'chu đậu', 
                'thủy xuân', 'non nước', 'thanh hà', 'bàu trúc', 'bầu trúc', 'tương bình hiệp', 
                'tân châu', 'phú quốc', 'hà giang', 'nam định', 'hải dương', 'bình dương', 
                'an giang', 'đà nẵng', 'quảng nam', 'ninh thuận', 'làng nghề', 'thủ công', 
                'di sản', 'truyền thống',
                // Vật phẩm & Chất liệu
                'gốm', 'sứ', 'lụa', 'đồng', 'tượng', 'chuông', 'điêu khắc', 'gỗ', 
                'sơn mài', 'bạc', 'trang sức', 'nhang', 'hương', 'đá', 'nước mắm', 
                'nhà thùng', 'khăn lụa', 'áo lụa', 'vải lụa', 'mỹ nghệ',
                // Sáng tạo & Trải nghiệm (Module B)
                'workshop', 'trải nghiệm', 'lớp học', 'diy', 'học làm', 'học dệt', 
                'học vẽ', 'học nặn', 'học nhuộm', 'học đúc', 'nặn gốm', 'vẽ gốm', 
                'nhuộm lụa', 'vẽ sơn mài', 'lớp dạy', 'sáng tạo',
                // Giá cả & Thương mại (Module C)
                'giá', 'báo giá', 'giá cả', 'giá tiền', 'giá bán', 'giá tham khảo', 
                'bảng giá', 'chi phí', 'định giá', 'bao nhiêu', 'mua', 'cửa hàng', 
                'shop', 'quà lưu niệm', 'quà tặng', 'đặc sản', 'handmade',
                // Tiếng Anh (English Keywords)
                'pottery', 'ceramic', 'silk', 'bronze', 'wood carving', 'stone carving', 
                'sculpture', 'lacquer', 'incense', 'fish sauce', 'silver', 'souvenir', 
                'handicraft', 'price', 'cost', 'how much', 'workshop', 'diy', 'class', 
                'traditional village', 'artisan village', 'craft village'
            ];

            let isCraft = craftTriggers.some(trigger => lowerText.includes(trigger)) || lowerText.startsWith('/tc');

            // 3. Quyết định chế độ (Ưu tiên DIALECT)
            if (isDialect) {
                mode = 'DIALECT';
            } else if (isCraft) {
                mode = 'CRAFT';
            }

            if (!mode) {
                removeTypingIndicator(typingId);
                addMessage('assistant', "🤖 Chào bạn! Để hỗ trợ tốt nhất, vui lòng chọn ngăn dữ liệu bằng cách hỏi về:\n\n1️⃣ **Phương ngữ**: Hỏi 'dịch tiếng Huế', 'nghĩa từ răng rứa là gì', hoặc dùng các từ địa phương.\n2️⃣ **Thủ công & Giá cả**: Hỏi về 'làng gốm Bát Tràng', 'lụa Vạn Phúc', 'giá cả', 'workshop', 'mua đồ lưu niệm'...");
                return;
            }

            // Gọi AI từ Backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [{ role: 'user', content: `[CHẾ ĐỘ: ${mode}] ${text}` }] 
                })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);
            
            let prefix = mode === 'DIALECT' ? "🏮 [NGĂN PHƯƠNG NGỮ]\n" : "🎨 [NGĂN THỦ CÔNG MỸ NGHỆ]\n";
            addMessage('assistant', prefix + data.response, data.cards, data.global_actions);

        } catch (error) {
            removeTypingIndicator(typingId);
            addMessage('assistant', "Lỗi kết nối bộ não AI. Bạn thử lại nhé!");
        }
    });

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();
        let responses = [];

        // 1. Check Phonology patterns (The "Ngăn 1" rules)
        PHONOLOGY_RULES.forEach(rule => {
            const variations = rule.variation.split(' hoặc ');
            variations.forEach(v => {
                const words = lowerInput.split(/\max\s+/);
                // Simple heuristic: if input contains a variation word mentioned in example
                if (rule.example.toLowerCase().includes(lowerInput) || (lowerInput.length > 3 && rule.example.toLowerCase().includes(lowerInput))) {
                    // This is tricky, let's keep it simple: just inform about the rule if relevant
                }
            });
        });

        // 2. Check Dictionary words
        for (const word in DIALECT_DB) {
            // Use word boundary to avoid partial matches (e.g., "mô" in "môn")
            const regex = new RegExp(`(^|[^a-zA-ZÀ-ỹ])(${word})([^a-zA-ZÀ-ỹ]|$)`, 'i');
            if (regex.test(lowerInput)) {
                const info = DIALECT_DB[word];
                let resp = `✨ Từ "<strong>${word}</strong>" (${info.mean}) là một đặc trưng của <b>${info.region}</b>.\n`;
                if (info.nuance) resp += `💡 <i>Sắc thái:</i> ${info.nuance}\n`;
                resp += `📝 <i>Ví dụ:</i> "<em>${info.ex}</em>"`;
                responses.push(resp);
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

    function addMessage(role, content, cards = null, globalActions = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = content.replace(/\n/g, '<br>');
        messageDiv.appendChild(bubble);

        // If there are rich cards, render them
        if (cards && cards.length > 0) {
            const carousel = document.createElement('div');
            carousel.className = 'chat-cards-container';
            carousel.innerHTML = cards.map(c => {
                let actionFn = '';
                if (c.type === 'shop_product') {
                    actionFn = `openProductDetail(${c.id})`;
                } else if (c.type === 'workshop') {
                    actionFn = `bookRelatedWorkshop(${c.id})`;
                } else if (c.type === 'hotel') {
                    actionFn = `focusMapHotel(${c.lat}, ${c.lng}, '${c.title.replace(/'/g, "\\'")}')`;
                }

                return `
                    <div class="chat-card glass">
                        <img src="${c.image_url}" class="chat-card-img">
                        <div class="chat-card-body">
                            <h4>${c.title}</h4>
                            <p class="chat-card-sub">${c.subtitle}</p>
                            <p class="chat-card-price">${c.price_text}</p>
                            <button class="chat-card-action-btn" onclick="${actionFn}">${c.action_label}</button>
                        </div>
                    </div>
                `;
            }).join('');
            messageDiv.appendChild(carousel);
        }

        // If there are global actions, render them
        if (globalActions && globalActions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'chat-global-actions';
            globalActions.forEach(act => {
                if (act.type === 'create_itinerary') {
                    const btn = document.createElement('button');
                    btn.className = 'btn-primary chat-global-action-btn';
                    btn.textContent = act.label;
                    btn.addEventListener('click', () => {
                        generateUnifiedItinerary(act.target_params);
                    });
                    actionsDiv.appendChild(btn);
                }
            });
            messageDiv.appendChild(actionsDiv);
        }

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


    // === LOGIN HANDLING ===


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
        if (sunIcon) sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
        if (moonIcon) moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
    }

    let hasDraggedThemeBtn = false;
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            if (hasDraggedThemeBtn) {
                hasDraggedThemeBtn = false;
                e.preventDefault();
                return;
            }
            setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });

        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let dragThreshold = 5;

        const dragStart = (e) => {
            const rect = themeToggle.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            themeToggle.style.right = 'auto';
            themeToggle.style.left = initialLeft + 'px';
            themeToggle.style.top = initialTop + 'px';
            themeToggle.style.position = 'fixed';

            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;
            isDragging = true;
            hasDraggedThemeBtn = false;
            themeToggle.style.transition = 'none';
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;

            if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
                hasDraggedThemeBtn = true;
            }

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const btnWidth = themeToggle.offsetWidth;
            const btnHeight = themeToggle.offsetHeight;
            newLeft = Math.max(10, Math.min(window.innerWidth - btnWidth - 10, newLeft));
            newTop = Math.max(10, Math.min(window.innerHeight - btnHeight - 10, newTop));

            themeToggle.style.left = newLeft + 'px';
            themeToggle.style.top = newTop + 'px';
        };

        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            themeToggle.style.transition = 'transform 0.2s ease, background 0.3s ease';
        };

        themeToggle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

        themeToggle.addEventListener('touchstart', dragStart, { passive: true });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }

    setTheme(localStorage.getItem('theme') || 'light');

    const savedUser = localStorage.getItem('localviet_user');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            if (parsed) {
                if (parsed.name) {
                    document.getElementById('display-name').textContent = parsed.name;
                    document.getElementById('avatar-initial').textContent = parsed.name.charAt(0).toUpperCase();
                    document.getElementById('user-name').value = parsed.name;
                }
                if (parsed.email) {
                    document.getElementById('display-email').textContent = parsed.email;
                    document.getElementById('user-email').value = parsed.email;
                }
                user.isLoggedIn = !!(parsed.name && parsed.email);
            }
        } catch (e) {
            console.error("Lỗi parse savedUser:", e);
            localStorage.removeItem('localviet_user');
        }
    }

    // === VOICE RECORDING IMPLEMENTATION (UPGRADED) ===
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    const btnPlus = document.getElementById('btn-chat-options');
    const optionsMenu = document.getElementById('chat-options-menu');
    const menuVoice = document.getElementById('menu-voice');
    const chatInputWrapper = document.querySelector('.input-actions-wrapper');

    // Speech recognition variables
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    // Toggle menu
    if (btnPlus && optionsMenu) {
        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsMenu.classList.toggle('hidden');
            btnPlus.innerHTML = optionsMenu.classList.contains('hidden') ? '＋' : '×';
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            optionsMenu.classList.add('hidden');
            btnPlus.innerHTML = '＋';
        });

        optionsMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    async function toggleVoiceRecording() {
        if (!isRecording) {
            await startVoiceRecording();
        } else {
            stopVoiceRecording();
        }
    }

    async function startVoiceRecording() {
        if (SpeechRecognition) {
            // Real-time speech recognition
            try {
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = user.lang === 'en' ? 'en-US' : 'vi-VN';

                // Add recording indicator overlay
                const indicator = document.createElement('div');
                indicator.className = 'recording-overlay';
                indicator.id = 'recording-indicator';
                indicator.innerHTML = '<div class="recording-dot"></div> Đang nhận diện giọng nói... (Nhấn để hoàn tất)';
                chatInputWrapper.appendChild(indicator);

                indicator.onclick = stopVoiceRecording;

                let finalTranscript = '';

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                    // Update input box real-time
                    chatInput.value = finalTranscript + interimTranscript;
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    stopVoiceRecording();
                };

                recognition.onend = () => {
                    isRecording = false;
                    const indicator = document.getElementById('recording-indicator');
                    if (indicator) indicator.remove();
                    chatInput.focus();
                };

                recognition.start();
                isRecording = true;
                optionsMenu.classList.add('hidden');
                if (btnPlus) btnPlus.innerHTML = '＋';
            } catch (err) {
                console.error("Speech recognition start error:", err);
                alert("Không thể khởi động bộ nhận diện giọng nói!");
            }
        } else {
            // Fallback: Batch recording with MediaRecorder + Gemini
            console.log("Web Speech API không được hỗ trợ. Chuyển sang cơ chế dự phòng MediaRecorder.");
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                // Add recording indicator overlay
                const indicator = document.createElement('div');
                indicator.className = 'recording-overlay';
                indicator.id = 'recording-indicator';
                indicator.innerHTML = '<div class="recording-dot"></div> Đang thu âm... (Nhấn để dừng)';
                chatInputWrapper.appendChild(indicator);

                // Listener to stop by clicking the indicator
                indicator.onclick = stopVoiceRecording;

                mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
                mediaRecorder.onstop = async () => {
                    // Use the MIME type produced by the recorder (e.g., audio/webm or audio/ogg)
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

                    // Show "Transcribing..." state
                    const originalPlaceholder = chatInput.placeholder;
                    chatInput.value = "";
                    chatInput.placeholder = "⌛ Đang chuyển giọng nói thành văn bản...";
                    chatInput.disabled = true;

                    // Send to backend for transcription
                    const transcription = await transcribeAudio(audioBlob);

                    // Set the transcribed text into input box
                    if (transcription) {
                        chatInput.value = transcription;
                        chatInput.focus();
                    }

                    chatInput.placeholder = originalPlaceholder;
                    chatInput.disabled = false;
                };

                mediaRecorder.start();
                isRecording = true;
                optionsMenu.classList.add('hidden');
                if (btnPlus) btnPlus.innerHTML = '＋';
            } catch (err) {
                console.error("Mic error:", err);
                alert("Vui lòng cấp quyền truy cập microphone!");
            }
        }
    }

    function stopVoiceRecording() {
        if (SpeechRecognition && recognition) {
            recognition.stop();
            recognition = null;
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        isRecording = false;
        const indicator = document.getElementById('recording-indicator');
        if (indicator) indicator.remove();
    }

    if (menuVoice) menuVoice.addEventListener('click', toggleVoiceRecording);

    async function transcribeAudio(blob) {
        // Create form data
        const formData = new FormData();

        // Clean MIME type (remove codecs=... if present)
        let cleanMimeType = blob.type.split(';')[0];

        // Use a generic name, the backend will determine the type via tempfile suffix
        formData.append('file', blob, 'recording');
        formData.append('mime_type', cleanMimeType);

        try {
            const response = await fetch('/api/chat-audio', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Server error');
            }

            const data = await response.json();
            console.log("Transcription response:", data);

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.transcription) {
                return data.transcription;
            } else if (data.response) {
                // If transcription is empty but response has text, use response
                // This happens if Gemini puts the transcription in the main text
                return data.response.replace(/\{.*\}/s, '').trim();
            }

            throw new Error("Không tìm thấy văn bản trong phản hồi từ AI.");
        } catch (err) {
            console.error("Transcription full error:", err);
            alert(`Lỗi chuyển đổi: ${err.message}`);
            return "";
        }
    }

    // === CONTENT BOARD DRAWER LOGIC ===
    function toggleBoard(show) {
        if (!contentBoard) return;
        if (show) {
            contentBoard.classList.add('active');
            renderBoardContent();
        } else {
            contentBoard.classList.remove('active');
        }
    }

    if (btnToggleBoard) {
        btnToggleBoard.addEventListener('click', () => toggleBoard(true));
    }
    if (boardOverlay) {
        boardOverlay.addEventListener('click', () => toggleBoard(false));
    }
    if (closeBoard) {
        closeBoard.addEventListener('click', () => toggleBoard(false));
    }

    // Dynamic Board Content Rendering
    function renderBoardContent() {
        if (!boardKnowledgeList || !boardCraftList) return;

        // Language dependent labels
        const lang = user.lang;
        const isEn = lang === 'en';

        // Update titles based on language
        const boardTitle = document.getElementById('board-title');
        const sectionViewsTitle = document.getElementById('section-views-title');
        const sectionArticlesTitle = document.getElementById('section-articles-title');
        const sectionCraftsTitle = document.getElementById('section-crafts-title');

        if (boardTitle) boardTitle.textContent = isEn ? 'Explore Heritage' : 'Khám phá di sản';
        if (sectionViewsTitle) sectionViewsTitle.textContent = isEn ? 'Views' : 'Chế độ xem';
        if (sectionArticlesTitle) sectionArticlesTitle.textContent = isEn ? 'Featured Articles' : 'Bài viết nổi bật';
        if (sectionCraftsTitle) sectionCraftsTitle.textContent = isEn ? 'Traditional Craft Villages' : 'Làng nghề truyền thống';

        // Render quick nav buttons labels
        const labels = {
            chat: isEn ? 'Chat' : 'Trò chuyện',
            map: isEn ? 'Map' : 'Bản đồ',
            heritage: isEn ? 'Heritage' : 'Di sản'
        };
        document.querySelectorAll('.btn-lbl').forEach(lbl => {
            const key = lbl.getAttribute('data-key');
            if (labels[key]) lbl.textContent = labels[key];
        });

        // 1. Render Heritage Articles
        boardKnowledgeList.innerHTML = KNOWLEDGE_DB.map(k => `
            <div class="board-item" data-id="${k.id}" data-type="knowledge">
                <div class="board-item-img" style="background-image: url('${k.img}')"></div>
                <div class="board-item-content">
                    <h4>${k.title[lang]}</h4>
                    <p>${k.summary[lang]}</p>
                </div>
            </div>
        `).join('');

        // 2. Render Craft Villages
        const villages = CRAFT_LOCATIONS.filter(loc => !loc.isSovereign);
        boardCraftList.innerHTML = villages.map(v => {
            const locName = typeof v.name === 'object' ? v.name[lang] : v.name;
            const locDesc = typeof v.desc === 'object' ? v.desc[lang] : v.desc;
            return `
                <div class="board-item" data-id="${v.id}" data-type="craft">
                    <div class="board-item-img" style="background-image: url('${v.img}')"></div>
                    <div class="board-item-content">
                        <h4>${locName}</h4>
                        <p>${locDesc}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Add Click Listeners to items
        document.querySelectorAll('.board-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.getAttribute('data-id'));
                const type = item.getAttribute('data-type');
                
                toggleBoard(false); // Close drawer on selection

                if (type === 'knowledge') {
                    switchTab(2); // Switch to Heritage tab
                    setTimeout(() => {
                        window.showHeritageDetail(id, 'knowledge');
                    }, 100);
                } else if (type === 'craft') {
                    selectCraftLocation(id);
                }
            });
        });
    }

    // Handle Quick Nav click
    if (boardNavButtons) {
        boardNavButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabIndex = parseInt(btn.getAttribute('data-tab'));
                toggleBoard(false);
                switchTab(tabIndex);
            });
        });
    }

    // Helper to select and highlight craft location on map
    function selectCraftLocation(id) {
        const loc = CRAFT_LOCATIONS.find(c => c.id === id);
        if (!loc) return;

        switchTab(1); // Switch to Map tab

        // Wait a bit for map view load
        setTimeout(() => {
            if (map) {
                const marker = googleMarkers[id];
                if (marker) {
                    if (typeof marker.getPosition === 'function') {
                        // Google Maps
                        const infoWindow = googleInfoWindows[id];
                        map.panTo(marker.getPosition());
                        map.setZoom(13);
                        if (infoWindow) {
                            if (activeInfoWindow) activeInfoWindow.close();
                            infoWindow.open(map, marker);
                            activeInfoWindow = infoWindow;
                        }
                    } else if (typeof marker.getLatLng === 'function') {
                        // Leaflet
                        map.panTo(marker.getLatLng());
                        map.setZoom(13);
                        marker.openPopup();
                    }
                } else {
                    window.showHeritageDetail(id, 'craft');
                }
            } else {
                window.showHeritageDetail(id, 'craft');
            }
        }, 300);
    }

    // === MOCK PRODUCTS & WORKSHOPS DATABASE (Frontend Sync) ===
    const SHOP_PRODUCTS_DB = [
        {
            id: 1,
            name: { vi: "Bình gốm vẽ tay Bát Tràng", en: "Bat Trang Hand-painted Ceramic Vase" },
            price: 750000,
            category: "ceramics",
            region: "north",
            villageId: 1,
            workshopId: 12,
            is_diy_kit: false,
            img: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800",
            desc: {
                vi: "Bình gốm cao cấp từ làng cổ Bát Tràng được nghệ nhân vẽ tay tinh xảo họa tiết sơn thủy. Sử dụng lớp men rạn tự nhiên độc bản.",
                en: "Premium ceramic vase from Bat Trang ancient village, hand-painted with landscape patterns by skilled artisans. Features unique natural crackle glaze."
            }
        },
        {
            id: 2,
            name: { vi: "Bộ Kit Tự Vẽ Gốm Bát Tràng", en: "Bat Trang DIY Pottery Painting Kit" },
            price: 180000,
            category: "ceramics",
            region: "north",
            villageId: 1,
            workshopId: 12,
            is_diy_kit: true,
            img: "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800",
            desc: {
                vi: "Bộ Kit tự thực hành tại nhà gồm: 1 sản phẩm gốm mộc (chưa nung men), bộ cọ vẽ chuyên dụng, 5 hũ màu khoáng tự nhiên và link video hướng dẫn của nghệ nhân.",
                en: "At-home DIY kit includes: 1 raw clay ceramic piece (unfired), professional brushes, 5 natural mineral color jars, and video tutorial link from the artisan."
            }
        },
        {
            id: 3,
            name: { vi: "Khăn Lụa Vân Vạn Phúc", en: "Van Phuc Cloud Silk Scarf" },
            price: 450000,
            category: "textiles",
            region: "north",
            villageId: 2,
            workshopId: 13,
            is_diy_kit: false,
            img: "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800",
            desc: {
                vi: "Khăn lụa tơ tằm dệt thủ công theo kỹ thuật vân mịn màng của làng lụa Vạn Phúc. Hoa văn chìm ẩn hiện óng ánh theo ánh sáng mặt trời.",
                en: "Pure silk scarf woven by traditional cloud-weaving technique of Van Phuc village. Subtle patterns shimmer dynamically under sunlight."
            }
        },
        {
            id: 4,
            name: { vi: "Đèn Lồng Lụa Hội An cổ truyền", en: "Traditional Hoi An Silk Lantern" },
            price: 150000,
            category: "textiles",
            region: "central",
            villageId: 5,
            workshopId: 15,
            is_diy_kit: false,
            img: "https://images.unsplash.com/photo-1549429451-9128f7311749?auto=format&fit=crop&q=80&w=800",
            desc: {
                vi: "Đèn lồng tre bọc lụa gấm thêu hoa nổi bật. Chế tác bởi nghệ nhân Hội An, có cấu trúc khung tre già bền bỉ, dễ dàng xếp gọn.",
                en: "Bamboo lantern wrapped in premium brocade silk with embroidered patterns. Crafted by Hoi An artisans, features aging bamboo frame and foldable design."
            }
        },
        {
            id: 5,
            name: { vi: "Bộ Kit Làm Đèn Lồng Hội An", en: "Hoi An DIY Lantern Making Kit" },
            price: 95000,
            category: "textiles",
            region: "central",
            villageId: 5,
            workshopId: 15,
            is_diy_kit: true,
            img: "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800",
            desc: {
                vi: "Bộ Kit tự làm đèn lồng tại nhà gồm: khung tre đã liên kết sẵn, mảnh vải lụa tơ tằm cắt sẵn theo kích thước, keo dán, dây treo và hướng dẫn xếp nếp bọc vải.",
                en: "At-home DIY lantern making kit: pre-connected bamboo frame, pre-cut silk fabric segments, special glue, hanging rope, and fabric-wrapping guide."
            }
        }
    ];

    const WORKSHOPS_DB = [
        {
            id: 12,
            title: { vi: "Workshop nặn gốm & vẽ họa tiết Bát Tràng", en: "Bat Trang Pottery & Painting Workshop" },
            villageId: 1,
            price: 50000,
            rating: 4.9,
            address: { vi: "Xóm 3, Làng cổ Bát Tràng, Gia Lâm, Hà Nội", en: "Commune 3, Bat Trang Ancient Village, Gia Lam, Hanoi" },
            lat: 20.9791,
            lng: 105.9221
        },
        {
            id: 13,
            title: { vi: "Workshop dệt lụa vân truyền thống", en: "Traditional Cloud Silk Weaving Workshop" },
            villageId: 2,
            price: 100000,
            rating: 4.8,
            address: { vi: "Phố lụa Vạn Phúc, Hà Đông, Hà Nội", en: "Van Phuc Silk St, Ha Dong, Hanoi" },
            lat: 20.9520,
            lng: 105.7680
        },
        {
            id: 15,
            title: { vi: "Workshop làm đèn lồng Hội An nghệ nhân", en: "Hoi An Artisan Lantern Making Workshop" },
            villageId: 5,
            price: 120000,
            rating: 4.9,
            address: { vi: "Nhà cổ 14 Nguyễn Thái Học, Minh An, Hội An", en: "14 Nguyen Thai Hoc Ancient House, Minh An, Hoi An" },
            lat: 15.8778,
            lng: 108.3262
        }
    ];

    // Shopping Cart State
    let cart = [];
    let currentSelectedProductId = null;
    let mapLoadingQueue = null;

    // === SHOP RENDER ENGINE ===
    function renderShopProducts() {
        if (!shopProductsGrid) return;

        const catFilter = shopFilterCategory ? shopFilterCategory.value : "all";
        const regFilter = shopFilterRegion ? shopFilterRegion.value : "all";
        const lang = user.lang;
        const isEn = lang === 'en';

        // Update translations
        const viewTitle = document.getElementById('shop-view-title');
        const viewDesc = document.getElementById('shop-view-desc');
        const labelFilterCat = document.getElementById('lbl-filter-cat');
        const labelFilterReg = document.getElementById('lbl-filter-reg');
        if (viewTitle) viewTitle.textContent = isEn ? "🛍️ Genuine Craft Shop" : "🛍️ Shop Sản Phẩm Thủ Công Mỹ Nghệ";
        if (viewDesc) viewDesc.textContent = isEn ? "Original products directly from verified heritage artisans." : "Sản phẩm chính gốc từ các nghệ nhân làng nghề di sản.";
        if (labelFilterCat) labelFilterCat.textContent = isEn ? "Category" : "Phân loại";
        if (labelFilterReg) labelFilterReg.textContent = isEn ? "Region" : "Vùng miền";

        // Filter Products
        let filtered = SHOP_PRODUCTS_DB;
        if (catFilter !== 'all') {
            filtered = filtered.filter(p => p.category === catFilter);
        }
        if (regFilter !== 'all') {
            filtered = filtered.filter(p => p.region === regFilter);
        }

        shopProductsGrid.innerHTML = filtered.map(p => {
            const nameText = p.name[lang];
            const priceFormatted = p.price.toLocaleString() + " VND";
            const village = CRAFT_LOCATIONS.find(v => v.id === p.villageId);
            const villageName = village ? (typeof village.name === 'object' ? village.name[lang] : village.name) : "";

            return `
                <div class="card glass" onclick="openProductDetail(${p.id})">
                    <div class="card-img" style="background-image: url('${p.img}')"></div>
                    <div class="card-content">
                        <span class="region">${villageName || (p.region === 'north' ? 'Miền Bắc' : p.region === 'central' ? 'Miền Trung' : 'Miền Nam')}</span>
                        <h3>${nameText}</h3>
                        <p class="price">${priceFormatted}</p>
                        <button class="btn-primary" style="margin-top:auto;">${isEn ? 'Buy Now 🛒' : 'Mua ngay 🛒'}</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Set filters change event
    if (shopFilterCategory) shopFilterCategory.addEventListener('change', renderShopProducts);
    if (shopFilterRegion) shopFilterRegion.addEventListener('change', renderShopProducts);

    // === PRODUCT DETAIL MODAL ===
    window.openProductDetail = (productId) => {
        const prod = SHOP_PRODUCTS_DB.find(p => p.id === productId);
        if (!prod || !shopProductModal) return;

        currentSelectedProductId = productId;
        const lang = user.lang;
        const isEn = lang === 'en';

        // Set Product Info
        const modalTitle = document.getElementById('product-modal-title');
        const modalImg = document.getElementById('product-modal-img');
        const modalOrigin = document.getElementById('product-modal-origin');
        const modalPrice = document.getElementById('product-modal-price');
        const modalDesc = document.getElementById('product-modal-desc');
        const qtySpan = document.getElementById('product-qty');

        if (modalTitle) modalTitle.textContent = prod.name[lang];
        if (modalImg) modalImg.src = prod.img;
        if (modalPrice) modalPrice.textContent = prod.price.toLocaleString() + " VND";
        if (modalDesc) modalDesc.textContent = prod.desc[lang];
        if (qtySpan) qtySpan.textContent = "1";

        // Find associated village details
        const village = CRAFT_LOCATIONS.find(v => v.id === prod.villageId);
        const villageName = village ? (typeof village.name === 'object' ? village.name[lang] : village.name) : "";
        const villageSummary = village ? (typeof village.desc === 'object' ? village.desc[lang] : village.desc) : "";
        
        if (modalOrigin) modalOrigin.textContent = villageName;

        // Origin Village Section (Two-way Link)
        const villageTitle = document.getElementById('product-village-title');
        const villageSum = document.getElementById('product-village-summary');
        const villageWarn = document.getElementById('product-village-warning');
        const viewVillageBtn = document.getElementById('btn-view-village-detail');

        if (villageTitle) villageTitle.textContent = isEn ? `🏛️ About ${villageName}` : `🏛️ Về làng nghề ${villageName}`;
        if (villageSum) villageSum.textContent = villageSummary;
        
        // Setup Artisan Warnings (retrieved from guardrails database)
        let warningText = "";
        let guardrailKey = village ? village.guardrailKey : null;
        if (guardrailKey && GUARDRAILS_DB[guardrailKey]) {
            warningText = GUARDRAILS_DB[guardrailKey].warning[lang];
        }
        if (villageWarn) {
            if (warningText) {
                villageWarn.innerHTML = `<strong>⚠️ ${isEn ? 'Artisan Recommendation' : 'Khuyến nghị nghệ nhân'}:</strong> ${warningText}`;
                villageWarn.classList.remove('hidden');
            } else {
                villageWarn.classList.add('hidden');
            }
        }

        if (viewVillageBtn) {
            viewVillageBtn.textContent = isEn ? "📖 View Village Details" : "📖 Xem chi tiết làng nghề";
            // Replace click listener
            const newBtn = viewVillageBtn.cloneNode(true);
            viewVillageBtn.parentNode.replaceChild(newBtn, viewVillageBtn);
            newBtn.addEventListener('click', () => {
                if (shopProductModal) shopProductModal.classList.add('hidden');
                selectCraftLocation(prod.villageId);
            });
        }

        // Associated Workshop Section (Shop -> Workshop Link)
        const workshopSec = document.getElementById('product-workshop-section');
        const wsTitleLabel = document.getElementById('product-workshop-title');
        const miniWsTitle = document.getElementById('mini-ws-title');
        const miniWsLoc = document.getElementById('mini-ws-loc');
        const miniWsRating = document.getElementById('mini-ws-rating');
        const bookWsBtn = document.getElementById('btn-book-related-ws');

        const workshop = WORKSHOPS_DB.find(w => w.id === prod.workshopId);
        if (workshop && workshopSec) {
            if (wsTitleLabel) wsTitleLabel.textContent = isEn ? "🎨 Related Craft Workshop" : "🎨 Trải nghiệm làm sản phẩm này";
            if (miniWsTitle) miniWsTitle.textContent = workshop.title[lang];
            if (miniWsLoc) miniWsLoc.textContent = `📍 ${workshop.address[lang]}`;
            if (miniWsRating) miniWsRating.textContent = `⭐ ${workshop.rating} (${isEn ? '120 reviews' : '120 đánh giá'})`;
            
            if (bookWsBtn) {
                bookWsBtn.textContent = isEn ? "Book Workshop" : "Đặt workshop ngay";
                const newBookBtn = bookWsBtn.cloneNode(true);
                bookWsBtn.parentNode.replaceChild(newBookBtn, bookWsBtn);
                newBookBtn.addEventListener('click', () => {
                    if (shopProductModal) shopProductModal.classList.add('hidden');
                    bookRelatedWorkshop(workshop.id);
                });
            }
            workshopSec.classList.remove('hidden');
        } else if (workshopSec) {
            workshopSec.classList.add('hidden');
        }

        shopProductModal.classList.remove('hidden');
    };

    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => shopProductModal.classList.add('hidden'));
    }

    // Modal Qty Controls
    const btnQtyMinus = document.getElementById('btn-qty-minus');
    const btnQtyPlus = document.getElementById('btn-qty-plus');
    const productQty = document.getElementById('product-qty');

    if (btnQtyMinus && productQty) {
        btnQtyMinus.addEventListener('click', () => {
            let qty = parseInt(productQty.textContent);
            if (qty > 1) {
                productQty.textContent = (qty - 1).toString();
            }
        });
    }
    if (btnQtyPlus && productQty) {
        btnQtyPlus.addEventListener('click', () => {
            let qty = parseInt(productQty.textContent);
            productQty.textContent = (qty + 1).toString();
        });
    }

    // Add to Cart
    const btnAddToCart = document.getElementById('btn-add-to-cart');
    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', () => {
            const qty = parseInt(productQty.textContent);
            const prod = SHOP_PRODUCTS_DB.find(p => p.id === currentSelectedProductId);
            if (!prod) return;

            // Check if item already in cart
            const cartItem = cart.find(item => item.productId === currentSelectedProductId);
            if (cartItem) {
                cartItem.qty += qty;
            } else {
                cart.push({ productId: currentSelectedProductId, qty: qty });
            }

            // Update UI count
            updateCartCount();
            if (shopProductModal) shopProductModal.classList.add('hidden');
            
            // Show toast confirmation
            showInAppNotification(
                user.lang === 'en' 
                    ? `Added ${qty}x ${prod.name.en} to your cart!` 
                    : `Đã thêm ${qty}x ${prod.name.vi} vào giỏ hàng!`, 
                null, 
                null
            );
        });
    }

    function updateCartCount() {
        if (!cartCount) return;
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalQty.toString();
    }

    // === CART & CHECKOUT MODAL ===
    if (btnViewCart) {
        btnViewCart.addEventListener('click', () => {
            renderCartItems();
            if (cartModal) cartModal.classList.remove('hidden');
        });
    }
    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => cartModal.classList.add('hidden'));
    }

    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPrice = document.getElementById('cart-total-price');

    function renderCartItems() {
        if (!cartItemsList || !cartTotalPrice) return;
        const lang = user.lang;
        const isEn = lang === 'en';

        // Update labels
        const cartTitle = document.getElementById('cart-modal-title');
        const cartTotalLbl = document.getElementById('lbl-cart-total');
        if (cartTitle) cartTitle.textContent = isEn ? "Shopping Cart" : "Giỏ hàng thủ công";
        if (cartTotalLbl) cartTotalLbl.textContent = isEn ? "Total:" : "Tổng cộng:";

        if (cart.length === 0) {
            cartItemsList.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-muted);">${isEn ? 'Your cart is empty' : 'Giỏ hàng đang trống'}</p>`;
            cartTotalPrice.textContent = "0 VND";
            return;
        }

        let total = 0;
        cartItemsList.innerHTML = cart.map(item => {
            const prod = SHOP_PRODUCTS_DB.find(p => p.id === item.productId);
            if (!prod) return "";
            const subtotal = prod.price * item.qty;
            total += subtotal;

            return `
                <div class="cart-item">
                    <img src="${prod.img}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${prod.img ? prod.name[lang] : ""}</h4>
                        <p>${prod.price.toLocaleString()} VND</p>
                    </div>
                    <div class="cart-item-qty">x${item.qty}</div>
                    <button class="btn-remove-item" onclick="removeFromCart(${item.productId})">&times;</button>
                </div>
            `;
        }).join('');

        cartTotalPrice.textContent = total.toLocaleString() + " VND";
    }

    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.productId !== productId);
        updateCartCount();
        renderCartItems();
    };

    // Checkout submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const lang = user.lang;
            const isEn = lang === 'en';

            // Clear cart
            cart = [];
            updateCartCount();
            if (cartModal) cartModal.classList.add('hidden');

            alert(isEn 
                ? "🎉 Order placed successfully! We will process your handcrafted products shortly." 
                : "🎉 Đặt hàng thành công! Đơn hàng sản phẩm thủ công của bạn đang được xử lý.");
        });
    }

    // === DEEP LINKING TO MAP & LOADING GUARD ===
    function bookRelatedWorkshop(workshopId) {
        const workshop = WORKSHOPS_DB.find(w => w.id === workshopId);
        if (!workshop) return;

        switchTab(1); // Switch to Map tab

        // Check if map and its markers are loaded
        if (map && googleMarkers[workshopId]) {
            executeMapFocus(workshopId);
        } else {
            // Queue the action
            mapLoadingQueue = workshopId;
            // Listen for tiles loaded or dynamic load trigger
            if (map) {
                if (typeof google !== 'undefined' && google.maps && google.maps.event) {
                    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
                        if (mapLoadingQueue === workshopId) {
                            executeMapFocus(workshopId);
                            mapLoadingQueue = null;
                        }
                    });
                } else {
                    // Leaflet fallback
                    setTimeout(() => {
                        if (mapLoadingQueue === workshopId) {
                            executeMapFocus(workshopId);
                            mapLoadingQueue = null;
                        }
                    }, 100);
                }
            } else {
                // If map is completely null, wait and check recursively
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (map && googleMarkers[workshopId]) {
                        executeMapFocus(workshopId);
                        clearInterval(checkInterval);
                    } else if (attempts > 15) {
                        // Fallback: show detail modal directly
                        clearInterval(checkInterval);
                        window.showHeritageDetail(workshop.villageId, 'craft');
                    }
                }, 300);
            }
        }
    }

    function executeMapFocus(workshopId) {
        const marker = googleMarkers[workshopId];
        if (!marker) return;

        if (typeof marker.getPosition === 'function') {
            // Google Maps
            const infoWindow = googleInfoWindows[workshopId];
            map.panTo(marker.getPosition());
            map.setZoom(14);
            if (infoWindow) {
                if (activeInfoWindow) activeInfoWindow.close();
                infoWindow.open(map, marker);
                activeInfoWindow = infoWindow;
            }
        } else if (typeof marker.getLatLng === 'function') {
            // Leaflet
            map.panTo(marker.getLatLng());
            map.setZoom(14);
            marker.openPopup();
        }
    }

    // Let's define triggerWorkshopCompletion:
    window.triggerWorkshopCompletion = (villageId) => {
        // Only products with "is_diy_kit": true and matching villageId/workshopId
        const product = SHOP_PRODUCTS_DB.find(p => p.villageId === villageId && p.is_diy_kit === true);
        if (!product) return;

        const lang = user.lang;
        const isEn = lang === 'en';
        const msg = isEn 
            ? `Thanks for completing the workshop! Click here to buy the DIY Kit: "${product.name.en}" and practice at home.`
            : `Chúc mừng bạn đã hoàn thành workshop! Bấm vào đây để đặt mua bộ Kit tự làm: "${product.name.vi}" về thực hành tại nhà.`;

        showInAppNotification(msg, isEn ? "View Kit" : "Xem bộ Kit", () => {
            openProductDetail(product.id);
        });
    };

    // === IN-APP NOTIFICATION SYSTEM ===
    let notificationTimeout = null;

    function showInAppNotification(message, actionLabel = null, actionCallback = null) {
        if (!inAppNotification) return;

        const msgEl = document.getElementById('notification-message');
        const actBtn = document.getElementById('btn-notification-action');
        const closeBtn = document.getElementById('close-notification');

        if (msgEl) msgEl.innerHTML = message;

        if (actBtn) {
            if (actionLabel && actionCallback) {
                actBtn.textContent = actionLabel;
                actBtn.classList.remove('hidden');
                
                // Clone to clear event listeners
                const newBtn = actBtn.cloneNode(true);
                actBtn.parentNode.replaceChild(newBtn, actBtn);
                newBtn.addEventListener('click', () => {
                    actionCallback();
                    inAppNotification.classList.remove('show');
                });
            } else {
                actBtn.classList.add('hidden');
            }
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                inAppNotification.classList.remove('show');
            });
        }

        // Show notification
        inAppNotification.classList.remove('hidden');
        setTimeout(() => {
            inAppNotification.classList.add('show');
        }, 50);

        // Auto dismiss after 8 seconds
        if (notificationTimeout) clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            inAppNotification.classList.remove('show');
        }, 8000);
    }

    // === TWO-WAY INTEGRATION: HERITAGE ARTICLE PRODUCTS CAROUSEL ===
    function getRelatedProductsHtml(villageId) {
        const products = SHOP_PRODUCTS_DB.filter(p => p.villageId === villageId);
        if (products.length === 0) return "";

        const lang = user.lang;
        const isEn = lang === 'en';

        return `
            <div class="heritage-products-section" style="margin-top:25px; border-top:1px dashed var(--glass-border); padding-top:20px;">
                <h4 style="font-family:'Playfair Display',serif; color:var(--primary); font-size:1.2rem; margin-bottom:15px;">🛍️ ${isEn ? 'Authentic Products From This Village' : 'Sản phẩm chính gốc từ làng nghề này'}</h4>
                <div class="chat-cards-container">
                    ${products.map(p => `
                        <div class="chat-card glass">
                            <img src="${p.img}" class="chat-card-img">
                            <div class="chat-card-body">
                                <h4 style="font-size:0.85rem; font-weight:700; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-main);">${p.name[lang]}</h4>
                                <p style="font-size:0.8rem; font-weight:700; color:var(--primary); margin:5px 0;">${p.price.toLocaleString()} VND</p>
                                <button class="chat-card-action-btn" onclick="heritageBuyProduct(${p.id})">${isEn ? 'Buy Now 🛒' : 'Mua ngay 🛒'}</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    window.heritageBuyProduct = (productId) => {
        if (heritageModal) heritageModal.classList.add('hidden');
        switchTab(3); // Switch to Shop
        setTimeout(() => {
            openProductDetail(productId);
        }, 100);
    };

    window.focusMapHotel = (lat, lng, name) => {
        switchTab(1); // Switch to Map
        
        setTimeout(() => {
            if (map) {
                if (typeof google !== 'undefined' && google.maps) {
                    map.panTo({ lat: lat, lng: lng });
                    map.setZoom(15);
                    
                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="padding:10px; font-family:Montserrat,sans-serif;">
                            <h4 style="margin:0 0 5px 0; color:var(--primary); font-size:1rem;">🏨 ${name}</h4>
                            <p style="margin:0; font-size:0.85rem; color:#555;">Địa điểm đã chọn từ hội thoại chat.</p>
                            <button onclick="alert('Đã kết nối với hệ thống đặt phòng đối tác!')" style="background:var(--primary); color:white; border:none; padding:6px 12px; border-radius:4px; font-size:0.75rem; font-weight:600; cursor:pointer; margin-top:8px;">Đặt phòng ngay</button>
                        </div>`
                    });

                    const marker = new google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        map: map,
                        title: name,
                        icon: {
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }
                    });

                    if (activeInfoWindow) activeInfoWindow.close();
                    infoWindow.open(map, marker);
                    activeInfoWindow = infoWindow;
                } else {
                    // Leaflet fallback
                    map.panTo([lat, lng]);
                    map.setZoom(15);

                    const customIcon = L.divIcon({
                        html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;">🏨</div>`,
                        className: 'custom-hotel-marker',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                    const popupContent = `<div style="padding:10px; font-family:Montserrat,sans-serif; width: 180px;">
                        <h4 style="margin:0 0 5px 0; color:var(--primary); font-size:1rem;">🏨 ${name}</h4>
                        <p style="margin:0; font-size:0.85rem; color:#555; line-height: 1.4;">Địa điểm đã chọn từ hội thoại chat.</p>
                        <button onclick="alert('Đã kết nối với hệ thống đặt phòng đối tác!')" style="background:var(--primary); color:white; border:none; padding:6px 12px; border-radius:4px; font-size:0.75rem; font-weight:600; cursor:pointer; margin-top:8px; width: 100%;">Đặt phòng ngay</button>
                    </div>`;

                    marker.bindPopup(popupContent).openPopup();
                }
            }
        }, 300);
    };

    function generateUnifiedItinerary(params) {
        const lang = user.lang;
        const isEn = lang === 'en';
        
        const destination = params.destination;
        const hotel = params.hotel;
        const workshop = params.workshop;
        const product = params.product;

        const itText = isEn 
            ? `🗓️ **UNIFIED TRAVEL ITINERARY PLAN: ${destination.toUpperCase()}**\n\n` +
              `• **Day 1: Arrival & Check-in**\n` +
              `  - Stay at: **${hotel}**\n` +
              `  - Afternoon: Relax and walk around the local ancient village.\n\n` +
              `• **Day 2: Cultural Experience & Souvenirs**\n` +
              `  - Morning: Attend **${workshop}** to craft your own souvenir.\n` +
              `  - Afternoon: Visit craft shop to pick up local products like: **${product}**.\n\n` +
              `*Draft schedule created. Let me know if you would like to edit or book!*`
            : `🗓️ **KẾ HOẠCH LỊCH TRÌNH DU LỊCH TRỌN GÓI: ${destination.toUpperCase()}**\n\n` +
              `• **Ngày 1: Check-in & Nghỉ dưỡng**\n` +
              `  - Lưu trú tại: **${hotel}**\n` +
              `  - Chiều: Khám phá không gian văn hóa & phong vị ẩm thực địa phương.\n\n` +
              `• **Ngày 2: Trải nghiệm di sản & Mua sắm**\n` +
              `  - Sáng: Tham gia **${workshop}** để tự tay chế tác sản phẩm lưu niệm.\n` +
              `  - Chiều: Ghé Shop thủ công để nhận sắm các tặng phẩm chính hiệu: **${product}**.\n\n` +
              `*Lịch trình nháp đã được lưu. Bạn có muốn điều chỉnh thêm hoặc tiến hành đặt dịch vụ không ạ?*`;

        addMessage('assistant', itText);
    }

    // === COLLAPSIBLE SIDEBAR LOGIC ===
    const sidebar = document.getElementById('sidebar');
    const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');

    if (sidebar && btnCollapseSidebar) {
        const toggleSidebar = (collapse) => {
            if (collapse) {
                sidebar.classList.add('collapsed');
                btnCollapseSidebar.textContent = '▶';
                btnCollapseSidebar.title = user.lang === 'en' ? 'Expand sidebar' : 'Mở rộng thanh bên';
                localStorage.setItem('sidebar_collapsed', 'true');
            } else {
                sidebar.classList.remove('collapsed');
                btnCollapseSidebar.textContent = '◀';
                btnCollapseSidebar.title = user.lang === 'en' ? 'Collapse sidebar' : 'Thu nhỏ thanh bên';
                localStorage.setItem('sidebar_collapsed', 'false');
            }
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        };

        btnCollapseSidebar.addEventListener('click', () => {
            const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
            toggleSidebar(!isCurrentlyCollapsed);
        });

        const isCollapsedSaved = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsedSaved) {
            sidebar.style.transition = 'none';
            toggleSidebar(true);
            setTimeout(() => {
                sidebar.style.transition = 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), padding 0.3s ease';
            }, 50);
        }
    }

});

