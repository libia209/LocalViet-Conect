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

    const craftTrigger = document.getElementById('craft-creator-trigger');
    const craftWindow = document.getElementById('craft-creator-window');
    const closeCraft = document.getElementById('close-craft');
    const minimizeCraft = document.getElementById('minimize-craft');
    const craftForm = document.getElementById('craft-chat-form');
    const craftInput = document.getElementById('craft-input');
    const craftMessages = document.getElementById('craft-messages');
    const suggestionChips = document.querySelectorAll('.chip');

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
                ư en: "Industrial glazes on Bàu Trúc or thin Bát Tràng bodies invalidate core heritage value."
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
            guưardrailKey: 'jewelry'
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

    const CRAFT_CREATOR_DATA = {
        pricing: {
            pottery: {
                "Ấm trà Bát Tràng": "500.000 - 2.000.000 VND",
                "Bình gốm trang trí (30cm)": "300.000 - 800.000 VND",
                "Chén bát bộ 6": "150.000 - 400.000 VND",
                "Tượng gốm lớn (60cm)": "1.500.000 - 5.000.000 VND"
            },
            bronze: {
                "Chuông đồng nhỏ (20cm)": "800.000 - 1.500.000 VND",
                "Chuông đồng lớn (1m)": "8.000.000 - 25.000.000 VND",
                "Tượng đồng (40cm)": "3.000.000 - 10.000.000 VND",
                "Lư hương đồng": "1.500.000 - 4.000.000 VND"
            },
            lacquer: {
                "Bức sơn mài (40x60cm)": "2.000.000 - 8.000.000 VND",
                "Bình sơn mài": "1.000.000 - 5.000.000 VND",
                "Tranh sơn mài mini": "500.000 - 1.500.000 VND"
            },
            wood: {
                "Tượng Phật gỗ mít (30cm)": "1.500.000 - 4.000.000 VND",
                "Bộ tượng Tam thế": "5.000.000 - 15.000.000 VND",
                "Hoành phi câu đối (1m)": "2.000.000 - 6.000.000 VND"
            },
            silver: {
                "Vòng tay bạc Mông": "300.000 - 800.000 VND",
                "Vòng cổ bạc": "800.000 - 2.500.000 VND",
                "Bộ trang sức cưới": "3.000.000 - 8.000.000 VND"
            }
        },
        leadTime: {
            pottery: "7 - 20 ngày",
            bronze: "15 ngày - 6 tháng (tùy kích thước)",
            lacquer: "4 - 8 tháng",
            wood: "1 - 4 tháng",
            silver: "5 - 15 ngày"
        },
        customizations: {
            pottery: ["khắc tên", "vẽ logo", "thay đổi kích thước", "chọn màu men"],
            bronze: ["dát vàng 24k", "mạ bạc", "khắc chữ", "tạo màu giả cổ"],
            lacquer: ["chọn đề tài", "thay đổi kích thước", "phối màu riêng"],
            wood: ["chọn loại gỗ", "sơn son thếp vàng", "khắc họa tiết riêng"]
        }
    };

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
            // Hide Craft Creator on main chat tab
            craftTrigger.classList.add('hidden');
            craftWindow.classList.add('hidden');
        } else if (index === 1) {
            mapView.classList.remove('hidden');
            craftTrigger.classList.remove('hidden');
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
            craftTrigger.classList.remove('hidden');
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

        const typingId = addTypingIndicator();
        try {
            // Kiểm tra Ngăn dữ liệu dựa trên từ khóa
            let mode = null;
            const lowerText = text.toLowerCase();
            
            if (lowerText.startsWith('/pn') || lowerText.includes('phương ngữ') || lowerText.includes('tiếng địa phương')) {
                mode = 'DIALECT';
            } else if (lowerText.startsWith('/tc') || lowerText.includes('thủ công') || lowerText.includes('sáng tạo') || lowerText.includes('làng nghề')) {
                mode = 'CRAFT';
            }

            if (!mode) {
                removeTypingIndicator(typingId);
                addMessage('assistant', "🤖 Chào bạn! Để hỗ trợ tốt nhất, vui lòng chọn ngăn dữ liệu bằng cách thêm từ khóa:\n\n1️⃣ **Phương ngữ**: Gõ '/pn' hoặc nhắc đến 'phương ngữ'.\n2️⃣ **Thủ công**: Gõ '/tc' hoặc nhắc đến 'thủ công'.");
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
            
            // Nếu là chế độ phương ngữ, vẫn kiểm tra từ điển nhanh trước
            let prefix = mode === 'DIALECT' ? "🏮 [NGĂN PHƯƠNG NGỮ]\n" : "🎨 [NGĂN THỦ CÔNG MỸ NGHỆ]\n";
            addMessage('assistant', prefix + data.response);

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

    // === CRAFT CREATOR LOGIC ===
    craftTrigger.addEventListener('click', () => craftWindow.classList.toggle('hidden'));
    closeCraft.addEventListener('click', () => craftWindow.classList.add('hidden'));
    minimizeCraft.addEventListener('click', () => craftWindow.classList.add('hidden'));

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            craftInput.value = chip.textContent;
            craftForm.dispatchEvent(new Event('submit'));
        });
    });

    craftForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = craftInput.value.trim();
        if (!text) return;

        addCraftMessage('user', text);
        craftInput.value = '';

        setTimeout(() => {
            const response = getCraftCreatorResponse(text);
            addCraftMessage('assistant', response);
        }, 600);
    });

    function addCraftMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.innerHTML = `<div class="bubble">${content.replace(/\n/g, '<br>')}</div>`;
        craftMessages.appendChild(msgDiv);
        craftMessages.scrollTop = craftMessages.scrollHeight;
    }

    function getCraftCreatorResponse(input) {
        const lowerInput = input.toLowerCase();

        // Define Categories
        const categories = {
            pottery: ['gốm', 'ấm trà', 'bát tràng', 'pottery', 'ceramic'],
            bronze: ['đồng', 'chuông', 'tượng đồng', 'lư hương', 'bronze'],
            lacquer: ['sơn mài', 'tranh sơn mài', 'lacquer'],
            wood: ['gỗ', 'tượng phật', 'hoành phi', 'wood'],
            silver: ['bạc', 'trang sức', 'vòng tay', 'silver']
        };

        let selectedCat = null;
        for (const cat in categories) {
            if (categories[cat].some(kw => lowerInput.includes(kw))) {
                selectedCat = cat;
                break;
            }
        }

        // Pricing check
        if (lowerInput.includes('giá') || lowerInput.includes('bao nhiêu') || lowerInput.includes('price')) {
            if (selectedCat) {
                const items = CRAFT_CREATOR_DATA.pricing[selectedCat];
                let resp = `Bảng giá tham khảo cho dòng **${selectedCat}**:\n`;
                for (const item in items) resp += `• ${item}: ${items[item]}\n`;
                return resp + "\nBạn muốn đặt làm mẫu nào trong số này không?";
            }
        }

        // leadTime check
        if (lowerInput.includes('bao lâu') || lowerInput.includes('thời gian') || lowerInput.includes('time')) {
            if (selectedCat) {
                return `Thời gian hoàn thiện sản phẩm **${selectedCat}** thường mất khoảng **${CRAFT_CREATOR_DATA.leadTime[selectedCat]}**.\nBạn có cần nhận hàng gấp vào ngày cụ thể nào không?`;
            }
        }

        // Customization check
        if (lowerInput.includes('tùy chỉnh') || lowerInput.includes('thiết kế') || lowerInput.includes('khắc') || lowerInput.includes('custom')) {
            if (selectedCat) {
                return `Với dòng ${selectedCat}, chúng tôi có thể: **${CRAFT_CREATOR_DATA.customizations[selectedCat].join(', ')}**.\nBạn muốn cá nhân hóa vật phẩm của mình như thế nào?`;
            }
        }

        // Comparison
        if (lowerInput.includes('so sánh') || lowerInput.includes('khác gì')) {
            return "Sự khác biệt chính nằm ở chất liệu và quy trình: Gốm mang vẻ đẹp mộc mạc từ đất, Sơn mài đòi hỏi sự kiên nhẫn với nhiều lớp sơn ủ ẩm, còn Đồ đồng mang giá trị tâm linh vĩnh cửu. Bạn ưu tiên yếu tố nào hơn?";
        }

        // Default Ordering Response
        if (selectedCat) {
            return `Tôi đã ghi nhận yêu cầu về sản phẩm **${selectedCat}** của bạn. Để báo giá chính xác nhất, bạn có thể cho tôi biết thêm về kích thước hoặc yêu cầu đặc biệt nào không?`;
        }

        return "Chào bạn! Tôi là Craft Creator. Tôi có thể giúp bạn:\n• Tư vấn giá & thời gian đặt làm đồ thủ công\n• Thiết kế vật phẩm theo yêu cầu\n• So sánh các loại chất liệu di sản\n\nBạn đang quan tâm đến món đồ nào ạ?";
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

        user.isLoggedIn = true;
        document.getElementById('user-name').value = parsed.name;
        document.getElementById('user-email').value = parsed.email;
    }

    // === VOICE RECORDING IMPLEMENTATION (UPGRADED) ===
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    const btnPlus = document.getElementById('btn-chat-options');
    const optionsMenu = document.getElementById('chat-options-menu');
    const menuVoice = document.getElementById('menu-voice');
    const chatInputWrapper = document.querySelector('.input-actions-wrapper');

    // Toggle menu
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

    async function toggleVoiceRecording() {
        if (!isRecording) {
            await startVoiceRecording();
        } else {
            stopVoiceRecording();
        }
    }

    async function startVoiceRecording() {
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

    function stopVoiceRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            const indicator = document.getElementById('recording-indicator');
            if (indicator) indicator.remove();
        }
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

});

