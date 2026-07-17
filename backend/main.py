from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from services.gemini_service import GeminiService
from services.authenticity_service import AuthenticityService
import os
import json
import shutil
import asyncio
import tempfile
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")

# Load environment variables from .env
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = FastAPI(title="LocalViet Connect API")

# Mount static files (Frontend)
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = GeminiService()
authenticity = AuthenticityService()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.get("/")
async def root():
    from fastapi.responses import FileResponse
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# === CONCURRENT MULTI-INTENT SEARCH HELPERS ===
async def fetch_product_match(query: str, location: str) -> Optional[dict]:
    await asyncio.sleep(0.1)  # Simulate network latency
    q = query.lower()
    loc = location.lower()
    for p in SHOP_PRODUCTS_DB:
        name_match = q in p["name_vi"].lower() or q in p["name_en"].lower()
        loc_match = (
            loc in p["name_vi"].lower() or 
            loc in p["name_en"].lower() or 
            loc in p["region"].lower() or 
            (p["village_id"] == 1 and "bát tràng" in loc) or 
            (p["village_id"] == 2 and "vạn phúc" in loc) or 
            (p["village_id"] == 5 and "hội an" in loc)
        )
        if name_match and loc_match:
            return p
    return None

async def fetch_workshop_match(query: str, location: str) -> Optional[dict]:
    await asyncio.sleep(0.1)  # Simulate network latency
    q = query.lower()
    loc = location.lower()
    for w in WORKSHOPS_DB:
        title_match = q in w["title_vi"].lower() or q in w["title_en"].lower() or "workshop" in q
        loc_match = (
            loc in w["title_vi"].lower() or 
            loc in w["title_en"].lower() or 
            loc in w["address_vi"].lower() or 
            (w["village_id"] == 1 and "bát tràng" in loc) or 
            (w["village_id"] == 2 and "vạn phúc" in loc) or 
            (w["village_id"] == 5 and "hội an" in loc)
        )
        if title_match and loc_match:
            return w
    return None

async def fetch_hotel_match(location: str) -> Optional[dict]:
    await asyncio.sleep(0.1)  # Simulate network latency
    loc = location.lower()
    hotels = [
        {"id": 101, "title": "Bát Tràng Homestay & Spa", "subtitle": "⭐ 4.7 | Gần sông Hồng", "price_text": "750,000 VND / đêm", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400", "lat": 20.9785, "lng": 105.9215, "city": "bát tràng"},
        {"id": 102, "title": "Hội An Silk Marina Resort & Spa", "subtitle": "⭐ 4.8 | Cách trung tâm 500m", "price_text": "1,150,000 VND / đêm", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400", "lat": 15.8752, "lng": 108.3211, "city": "hội an"},
        {"id": 103, "title": "Khách sạn lụa Vạn Phúc", "subtitle": "⭐ 4.5 | Trung tâm Hà Đông", "price_text": "600,000 VND / đêm", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400", "lat": 20.9535, "lng": 105.7695, "city": "vạn phúc"}
    ]
    for h in hotels:
        if h["city"] in loc:
            return h
    return None

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    
    last_message = request.messages[-1].content
    lower_msg = last_message.lower().strip()

    # Check if this is a general topic query (e.g. user just typed "gốm" or "lụa")
    # without specific action verbs (like "workshop", "mua", "khách sạn"...)
    is_general_gốm = "gốm" in lower_msg and not any(k in lower_msg for k in ["mua", "sản phẩm", "đồ lưu niệm", "tác phẩm", "workshop", "học làm", "trải nghiệm", "lớp", "đặt chỗ", "khách sạn", "hotel", "bộ kit", "chất lượng"])
    is_general_lụa = any(k in lower_msg for k in ["lụa", "vải"]) and not any(k in lower_msg for k in ["mua", "sản phẩm", "đồ lưu niệm", "tác phẩm", "workshop", "học làm", "trải nghiệm", "lớp", "đặt chỗ", "khách sạn", "hotel", "chất lượng"])
    is_general_đèn_lồng = "đèn lồng" in lower_msg and not any(k in lower_msg for k in ["mua", "sản phẩm", "đồ lưu niệm", "tác phẩm", "workshop", "học làm", "trải nghiệm", "lớp", "đặt chỗ", "khách sạn", "hotel", "chất lượng"])
    
    if is_general_gốm:
        return {
            "response": "Chào bạn! Bạn đang quan tâm đến nghệ thuật **Gốm sứ truyền thống** đúng không ạ?\nĐể em hỗ trợ tốt nhất, bạn muốn tham gia hoạt động nào dưới đây:",
            "cards": [],
            "global_actions": [
                {"type": "send_chat_message", "label": "🎨 Tham quan & Trải nghiệm (Workshop)", "target_params": {"message": "Tôi muốn đăng ký workshop làm gốm"}},
                {"type": "send_chat_message", "label": "🛍️ Tự làm quà lưu niệm (DIY Kit)", "target_params": {"message": "Tôi muốn mua bộ kit tự vẽ gốm"}},
                {"type": "deep_link_heritage", "label": "🏛️ Tìm hiểu kiến thức di sản (Chi tiết)", "target_params": {"id": 1, "type": "craft"}}
            ],
            "violations": []
        }
    elif is_general_lụa:
        return {
            "response": "Chào bạn! Bạn đang quan tâm đến nghề **Dệt lụa tơ tằm cổ truyền** đúng không ạ?\nĐể em hỗ trợ tốt nhất, bạn muốn tham gia hoạt động nào dưới đây:",
            "cards": [],
            "global_actions": [
                {"type": "send_chat_message", "label": "🎨 Tham quan & Trải nghiệm (Workshop)", "target_params": {"message": "Tôi muốn đăng ký workshop dệt lụa"}},
                {"type": "send_chat_message", "label": "🛍️ Tự làm quà lưu niệm (Mua hàng)", "target_params": {"message": "Tôi muốn mua khăn lụa tơ tằm"}},
                {"type": "deep_link_heritage", "label": "🏛️ Tìm hiểu kiến thức di sản (Chi tiết)", "target_params": {"id": 2, "type": "craft"}}
            ],
            "violations": []
        }
    elif is_general_đèn_lồng:
        return {
            "response": "Chào bạn! Bạn đang quan tâm đến nghệ thuật làm **Đèn lồng tre Hội An** đúng không ạ?\nĐể em hỗ trợ tốt nhất, bạn muốn tham gia hoạt động nào dưới đây:",
            "cards": [],
            "global_actions": [
                {"type": "send_chat_message", "label": "🎨 Tham quan & Trải nghiệm (Workshop)", "target_params": {"message": "Tôi muốn đăng ký workshop làm đèn lồng"}},
                {"type": "send_chat_message", "label": "🛍️ Tự làm quà lưu niệm (Mua hàng)", "target_params": {"message": "Tôi muốn mua đèn lồng gấm"}},
                {"type": "deep_link_heritage", "label": "🏛️ Tìm hiểu kiến thức di sản (Chi tiết)", "target_params": {"id": 5, "type": "craft"}}
            ],
            "violations": []
        }

    # Determine location context (Bát Tràng, Vạn Phúc, Hội An)
    location = "Hội An"
    if "bát tràng" in lower_msg or "gốm" in lower_msg:
        location = "Bát Tràng"
    elif "vạn phúc" in lower_msg or "lụa" in lower_msg:
        location = "Vạn Phúc"

    # Multi-intent extraction:
    # 1. Product (mua, đèn lồng, gốm, lụa, sản phẩm, đồ lưu niệm, bộ kit)
    # 2. Workshop (workshop, học làm, trải nghiệm, lớp, đặt chỗ)
    # 3. Hotel/Map search (khách sạn, hotel, homestay, chỗ ở, nơi ở, đặt phòng)
    has_product = any(k in lower_msg for k in ["mua", "đèn lồng", "gốm", "lụa", "sản phẩm", "đồ lưu niệm", "tác phẩm", "bộ kit", "kit"])
    has_workshop = any(k in lower_msg for k in ["workshop", "học làm", "trải nghiệm", "lớp", "đặt chỗ"])
    has_hotel = any(k in lower_msg for k in ["khách sạn", "hotel", "homestay", "chỗ ở", "nghỉ", "đặt phòng"])

    # If any card intent is detected, fetch and return matching cards
    if has_product or has_workshop or has_hotel:
        prod_query = "đèn lồng" if "đèn lồng" in lower_msg else ("khăn lụa" if "lụa" in lower_msg else ("kit" if "kit" in lower_msg or "bộ kit" in lower_msg else "bình gốm"))
        ws_query = "workshop"
        
        prod_task = fetch_product_match(prod_query, location) if has_product else None
        ws_task = fetch_workshop_match(ws_query, location) if has_workshop else None
        hotel_task = fetch_hotel_match(location) if has_hotel else None
        
        tasks = []
        task_indices = {}
        if prod_task:
            task_indices["product"] = len(tasks)
            tasks.append(prod_task)
        if ws_task:
            task_indices["workshop"] = len(tasks)
            tasks.append(ws_task)
        if hotel_task:
            task_indices["hotel"] = len(tasks)
            tasks.append(hotel_task)
            
        results = await asyncio.gather(*tasks) if tasks else []
        
        product = results[task_indices["product"]] if "product" in task_indices else None
        workshop = results[task_indices["workshop"]] if "workshop" in task_indices else None
        hotel = results[task_indices["hotel"]] if "hotel" in task_indices else None
        
        cards = []
        res_texts = []
        
        if product:
            cards.append({
                "type": "shop_product",
                "id": product["id"],
                "title": product["name_vi"],
                "subtitle": f"Chính gốc từ làng {location}",
                "price_text": f"{int(product['price']):,} VND",
                "image_url": product["img"],
                "action_label": "🛒 Mua ngay"
            })
            res_texts.append(f"sản phẩm **{product['name_vi']}** ({int(product['price']):,} VND)")
            
        if workshop:
            cards.append({
                "type": "workshop",
                "id": workshop["id"],
                "title": workshop["title_vi"],
                "subtitle": f"⭐ {workshop['rating']} | {workshop['address_vi']}",
                "price_text": f"{int(workshop['price']):,} VND",
                "image_url": "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=400",
                "action_label": "🎨 Đặt workshop - Xem trên bản đồ",
                "lat": float(workshop["latitude"]),
                "lng": float(workshop["longitude"])
            })
            res_texts.append(f"workshop trải nghiệm làm **{workshop['title_vi']}**")
            
        if hotel:
            cards.append({
                "type": "hotel",
                "id": hotel["id"],
                "title": hotel["title"],
                "subtitle": hotel["subtitle"],
                "price_text": hotel["price_text"],
                "image_url": hotel["image_url"],
                "action_label": "🏨 Xem trên bản đồ",
                "lat": float(hotel["lat"]),
                "lng": float(hotel["lng"])
            })
            res_texts.append(f"khách sạn **{hotel['title']}**")
            
        if cards:
            resp_text = f"Dạ, em tìm thấy thông tin bạn yêu cầu tại **{location}**:\n\n"
            resp_text += "Em xin gửi bạn thông tin về " + " và ".join(res_texts) + ".\n\n"
            resp_text += "Bạn có thể nhấn vào các thẻ bên dưới để xem trực tiếp hoặc thao tác nhé!"
            
            global_actions = []
            if product and workshop and hotel:
                global_actions.append({
                    "type": "create_itinerary",
                    "label": "🗓️ Tạo lịch trình trọn gói",
                    "target_params": {
                        "destination": location,
                        "hotel": hotel["title"],
                        "workshop": workshop["title_vi"],
                        "product": product["name_vi"]
                    }
                })
                
            return {
                "response": resp_text,
                "cards": cards,
                "global_actions": global_actions,
                "violations": []
            }

    # Scenario C: Default standard response
    # Check for authenticity violations
    violations = authenticity.check_violations(last_message)
    extra_context = ""
    if violations:
        v = violations[0]
        extra_context = f"\n\n[QUAN TRỌNG: Người dùng yêu cầu vi phạm quy tắc làng nghề.\n- Làng nghề: {v['craft']}\n- Vi phạm: {v['warning']}\n- Được phép: {', '.join(v['alternatives'])}\nHãy TỪ CHỐI lịch sự và đề xuất thay thế.]"

    # Check for policy questions (RAG)
    policies_context = ""
    try:
        import json
        policies_path = os.path.join(BASE_DIR, "data", "policies_db.json")
        if os.path.exists(policies_path):
            with open(policies_path, "r", encoding="utf-8") as pf:
                policies_db = json.load(pf)
            
            matched_policies = []
            lower_msg = last_message.lower()
            
            if any(k in lower_msg for k in ["đặt", "book", "hủy", "hoàn tiền", "cancellation", "trẻ em", "nhóm"]):
                matched_policies.append(json.dumps(policies_db.get("workshop_booking"), ensure_ascii=False))
            if any(k in lower_msg for k in ["thanh toán", "pay", "vietqr", "momo", "tiền mặt", "chuyển khoản", "credit"]):
                matched_policies.append(json.dumps(policies_db.get("payment_methods"), ensure_ascii=False))
            if any(k in lower_msg for k in ["vận chuyển", "ship", "gửi hàng", "nước ngoài", "hải quan", "tax", "dễ vỡ"]):
                matched_policies.append(json.dumps(policies_db.get("shipping_policy"), ensure_ascii=False))
                
            if matched_policies:
                policies_context = "\n\n[DỮ LIỆU CHÍNH SÁCH BẮT BUỘC SỬ DỤNG ĐỂ TRẢ LỜI NGƯỜI DÙNG:\n" + "\n".join(matched_policies) + "\nHãy tư vấn chính xác theo chính sách này, trả lời bằng cùng ngôn ngữ của người dùng.]"
    except Exception as pe:
        print(f"Policy RAG Error: {str(pe)}")

    # Prepare prompt with history (simple version)
    prompt = last_message + extra_context + policies_context
    response_text = await gemini.generate_response(prompt)
    
    if "lỗi kết nối" in response_text or response_text.startswith("Dạ, trợ lý đang gặp chút"):
        # Check if it's a virtual guide site-specific query
        if "hướng dẫn viên bản xứ" in last_message.lower():
            import re
            loc_match = re.search(r"tại (.*?)\. Câu hỏi:", last_message, re.IGNORECASE)
            q_match = re.search(r"Câu hỏi: (.*?)\. Bối cảnh", last_message, re.IGNORECASE)
            
            extracted_loc = loc_match.group(1).strip() if loc_match else "Làng nghề"
            extracted_q = q_match.group(1).strip() if q_match else last_message
            
            response_text = generate_offline_guide_response(extracted_q, extracted_loc)
        else:
            response_text = generate_offline_chat_response(last_message, location, policies_context)
    
    return {
        "response": response_text,
        "violations": violations
    }

@app.post("/api/chat-audio")
async def chat_audio(file: UploadFile = File(...), mime_type: str = Form(None)):
    # Use the mime_type from form if provided, else from file header
    actual_mime = mime_type or file.content_type
    
    # Determine extension based on content type
    ext = ".wav"
    if "webm" in actual_mime:
        ext = ".webm"
    elif "ogg" in actual_mime:
        ext = ".ogg"
    elif "mp4" in actual_mime:
        ext = ".m4a"
    elif "mpeg" in actual_mime:
        ext = ".mp3"

    # Save uploaded file to a temporary location with correct suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
        shutil.copyfileobj(file.file, temp_audio)
        temp_path = temp_audio.name

    try:
        # Process audio with Gemini
        # We pass the mime_type explicitly to the service if needed, 
        # but upload_file usually detects it from suffix.
        result = await gemini.generate_response_from_audio(temp_path, mime_type=file.content_type)
        
        # Clean up
        os.remove(temp_path)
        
        return result
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/config")
async def get_config():
    return {
        "google_maps_api_key": os.getenv("GOOGLE_MAPS_API_KEY", "")
    }

@app.get("/api/crafts")
async def get_crafts():
    import json
    path = os.path.join(BASE_DIR, "data", "craft_rules.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/dialects")
async def get_dialects():
    import json
    path = os.path.join(BASE_DIR, "data", "dialect_db.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# === MOCK SHOP & WORKSHOP DATABASE ===
SHOP_PRODUCTS_DB = [
    {
        "id": 1,
        "name_vi": "Bình gốm vẽ tay Bát Tràng",
        "name_en": "Bat Trang Hand-painted Ceramic Vase",
        "price": 750000.0,
        "category": "ceramics",
        "region": "north",
        "village_id": 1,
        "workshop_id": 12,
        "is_diy_kit": False,
        "img": "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800",
        "desc_vi": "Bình gốm cao cấp từ làng cổ Bát Tràng được nghệ nhân vẽ tay tinh xảo họa tiết sơn thủy. Sử dụng lớp men rạn tự nhiên độc bản.",
        "desc_en": "Premium ceramic vase from Bat Trang ancient village, hand-painted with landscape patterns by skilled artisans. Features unique natural crackle glaze."
    },
    {
        "id": 2,
        "name_vi": "Bộ Kit Tự Vẽ Gốm Bát Tràng",
        "name_en": "Bat Trang DIY Pottery Painting Kit",
        "price": 180000.0,
        "category": "ceramics",
        "region": "north",
        "village_id": 1,
        "workshop_id": 12,
        "is_diy_kit": True,
        "img": "https://images.unsplash.com/photo-1590640927838-8979ca6fdd12?auto=format&fit=crop&q=80&w=800",
        "desc_vi": "Bộ Kit tự thực hành tại nhà gồm: 1 sản phẩm gốm mộc (chưa nung men), bộ cọ vẽ chuyên dụng, 5 hũ màu khoáng tự nhiên và link video hướng dẫn của nghệ nhân.",
        "desc_en": "At-home DIY kit includes: 1 raw clay ceramic piece (unfired), professional brushes, 5 natural mineral color jars, and video tutorial link from the artisan."
    },
    {
        "id": 3,
        "name_vi": "Khăn Lụa Vân Vạn Phúc",
        "name_en": "Van Phuc Cloud Silk Scarf",
        "price": 450000.0,
        "category": "textiles",
        "region": "north",
        "village_id": 2,
        "workshop_id": 13,
        "is_diy_kit": False,
        "img": "https://images.unsplash.com/photo-1528646332357-c341772b233b?auto=format&fit=crop&q=80&w=800",
        "desc_vi": "Khăn lụa tơ tằm dệt thủ công theo kỹ thuật vân mịn màng của làng lụa Vạn Phúc. Hoa văn chìm ẩn hiện óng ánh theo ánh sáng mặt trời.",
        "desc_en": "Pure silk scarf woven by traditional cloud-weaving technique of Van Phuc village. Subtle patterns shimmer dynamically under sunlight."
    },
    {
        "id": 4,
        "name_vi": "Đèn Lồng Lụa Hội An cổ truyền",
        "name_en": "Traditional Hoi An Silk Lantern",
        "price": 150000.0,
        "category": "textiles",
        "region": "central",
        "village_id": 5,
        "workshop_id": 15,
        "is_diy_kit": False,
        "img": "https://images.unsplash.com/photo-1549429451-9128f7311749?auto=format&fit=crop&q=80&w=800",
        "desc_vi": "Đèn lồng tre bọc lụa gấm thêu hoa nổi bật. Chế tác bởi nghệ nhân Hội An, có cấu trúc khung tre già bền bỉ, dễ dàng xếp gọn.",
        "desc_en": "Bamboo lantern wrapped in premium brocade silk with embroidered patterns. Crafted by Hoi An artisans, features aging bamboo frame and foldable design."
    },
    {
        "id": 5,
        "name_vi": "Bộ Kit Làm Đèn Lồng Hội An",
        "name_en": "Hoi An DIY Lantern Making Kit",
        "price": 95000.0,
        "category": "textiles",
        "region": "central",
        "village_id": 5,
        "workshop_id": 15,
        "is_diy_kit": True,
        "img": "https://images.unsplash.com/photo-1568285141006-2f107f97f742?auto=format&fit=crop&q=80&w=800",
        "desc_vi": "Bộ Kit tự làm đèn lồng tại nhà gồm: khung tre đã liên kết sẵn, mảnh vải lụa tơ tằm cắt sẵn theo kích thước, keo dán, dây treo và hướng dẫn xếp nếp bọc vải.",
        "desc_en": "At-home DIY lantern making kit: pre-connected bamboo frame, pre-cut silk fabric segments, special glue, hanging rope, and fabric-wrapping guide."
    }
]

WORKSHOPS_DB = [
    {
        "id": 12,
        "title_vi": "Workshop nặn gốm & vẽ họa tiết Bát Tràng",
        "title_en": "Bat Trang Pottery & Painting Workshop",
        "village_id": 1,
        "price": 50000.0,
        "rating": 4.9,
        "address_vi": "Xóm 3, Làng cổ Bát Tràng, Gia Lâm, Hà Nội",
        "address_en": "Commune 3, Bat Trang Ancient Village, Gia Lam, Hanoi",
        "latitude": 20.9791,
        "longitude": 105.9221
    },
    {
        "id": 13,
        "title_vi": "Workshop dệt lụa vân truyền thống",
        "title_en": "Traditional Cloud Silk Weaving Workshop",
        "village_id": 2,
        "price": 100000.0,
        "rating": 4.8,
        "address_vi": "Phố lụa Vạn Phúc, Hà Đông, Hà Nội",
        "address_en": "Van Phuc Silk St, Ha Dong, Hanoi",
        "latitude": 20.9520,
        "longitude": 105.7680
    },
    {
        "id": 15,
        "title_vi": "Workshop làm đèn lồng Hội An nghệ nhân",
        "title_en": "Hoi An Artisan Lantern Making Workshop",
        "village_id": 5,
        "price": 120000.0,
        "rating": 4.9,
        "address_vi": "Nhà cổ 14 Nguyễn Thái Học, Minh An, Hội An",
        "address_en": "14 Nguyen Thai Học Ancient House, Minh An, Hoi An",
        "latitude": 15.8778,
        "longitude": 108.3262
    }
]

# === API ENDPOINTS ===
@app.get("/api/shop/products")
async def get_shop_products(category: str = "all", region: str = "all"):
    filtered = SHOP_PRODUCTS_DB
    if category != "all":
        filtered = [p for p in filtered if p["category"] == category]
    if region != "all":
        filtered = [p for p in filtered if p["region"] == region]
    return {"products": filtered}

@app.get("/api/shop/products/{product_id}/workshops")
async def get_product_workshops(product_id: int):
    prod = next((p for p in SHOP_PRODUCTS_DB if p["id"] == product_id), None)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    w_id = prod.get("workshop_id")
    workshops = [w for w in WORKSHOPS_DB if w["id"] == w_id]
    return {"workshops": workshops}

@app.get("/api/workshops")
async def get_workshops():
    return {"workshops": WORKSHOPS_DB}

class RoutePlanRequest(BaseModel):
    interest: str
    start_location: str
    duration_days: int = 1
    duration_value: Optional[int] = None
    duration_unit: Optional[str] = None
    budget: Optional[str] = None
    group_type: Optional[str] = None

def generate_offline_guide_response(user_question: str, location: str) -> str:
    msg = user_question.lower().strip()
    
    # Avoid substring match bug: use regex for word boundaries
    import re
    has_photo = bool(re.search(r"\b(chụp|ảnh|checkin|check-in|hình|đẹp)\b", msg))
    has_history = bool(re.search(r"\b(lịch sử|bao lâu|nguồn gốc|từ khi nào|năm nào|sáng lập|tổ nghề)\b", msg))
    has_location = bool(re.search(r"\b(vị trí|ở đâu|địa chỉ|tọa độ|đường đi|phương tiện|xe bus|bus|đi lại|bản đồ)\b", msg))
    has_technique = bool(re.search(r"\b(làm|chế tác|bí quyết|kỹ thuật|nguyên liệu|sản xuất|quy trình|đất|men|sợi|nhuộm|se hương)\b", msg))
    
    # 1. Location & Address queries
    if has_location:
        if "thủy xuân" in location.lower():
            return "Làng hương Thủy Xuân nằm tại đường Huyền Trân Công Chúa, cách trung tâm TP Huế khoảng 7km về phía Tây Nam. Từ Đại Nội Huế, bạn đi theo hướng lăng Tự Đức là tới ngay. Rất dễ đi bằng xe máy hoặc taxi!"
        elif "bát tràng" in location.lower():
            return "Làng gốm Bát Tràng tọa lạc tại xã Bát Tràng, huyện Gia Lâm, Hà Nội, nằm ven sông Hồng cách trung tâm thủ đô khoảng 13km. Bạn có thể bắt xe bus 47A từ Long Biên đi thẳng đến cổng làng."
        elif "vạn phúc" in location.lower():
            return "Làng lụa Vạn Phúc nằm ở phường Vạn Phúc, quận Hà Đông, Hà Nội. Bạn có thể bắt tàu điện trên cao Cát Linh - Hà Đông tới ga Phùng Khoang, sau đó đón xe ôm đi thêm khoảng 1km."
        elif "chu đậu" in location.lower():
            return "Làng gốm Chu Đậu nằm tại xã Thái Tân, huyện Nam Sách, tỉnh Hải Dương, cách Hà Nội khoảng 60km. Rất thích hợp cho các chuyến du lịch trải nghiệm trong ngày."
        elif "thanh hà" in location.lower():
            return "Làng gốm Thanh Hà nằm ngay bên bờ sông Thu Bồn, thuộc khối phố Nam Diêu, phường Thanh Hà, TP Hội An (cách Phố Cổ khoảng 3km về phía Tây). Bạn có thể đạp xe thong thả dọc bờ sông là tới."
        elif "bàu trúc" in location.lower():
            return "Làng gốm Bàu Trúc tọa lạc tại thị trấn Phước Dân, huyện Ninh Phước, tỉnh Ninh Thuận (cách trung tâm thành phố Phan Rang khoảng 10km về phía Nam)."
        else:
            return f"Địa danh {location} nằm ở khu vực di sản thuận tiện đi lại. Bạn có thể xem chỉ dẫn đường đi tối ưu nhất trực tiếp trên Bản đồ số của LocalViet Connect nhé!"

    # 2. Photo & Check-in queries
    elif has_photo:
        return f"Mẹo chụp hình lung linh tại {location}: Bạn nên chọn thời điểm nắng xiên dịu nhẹ (8h - 10h sáng hoặc 3h - 5h chiều). Đứng cạnh những sản phẩm rực rỡ sắc màu đặc trưng ở đây để tạo nên bối cảnh chụp ảnh tuyệt đẹp nhé!"

    # 3. History queries
    elif has_history:
        if "thủy xuân" in location.lower():
            return "Làng hương Thủy Xuân có lịch sử hơn 700 năm, từ thời nhà Nguyễn. Ban đầu hương được làm để cung cấp cho cung đình và các đền đài tế tự của triều đình."
        elif "bát tràng" in location.lower():
            return "Làng gốm Bát Tràng có niên đại hơn 1.000 năm từ thời vua Lý Công Uẩn dời đô về Thăng Long, khi các dòng họ thợ gốm di cư tới tả ngạn sông Hồng khai phá đất sét trắng."
        elif "vạn phúc" in location.lower():
            return "Làng lụa Vạn Phúc có lịch sử hơn 1.100 năm, do bà Tổ nghề A Lã Thị Nương truyền dạy nghề dệt tơ tằm từ thời kỳ Bắc thuộc xa xưa."
        else:
            return f"Làng nghề {location} có truyền thống lâu đời được truyền qua nhiều đời nghệ nhân giỏi. Lịch sử của làng gắn liền với sự hưng thịnh của vùng đất di sản này."

    # 4. Techniques & Secrets queries
    elif has_technique:
        if "thủy xuân" in location.lower():
            return "Nghề se hương Thủy Xuân đòi hỏi sự tỉ mỉ ở khâu trộn bột thảo mộc (quế, hồi, thảo quả, trầm) và kỹ thuật se tăm tre tròn đều để hương cháy đều, khói thơm dịu nhẹ."
        elif "bát tràng" in location.lower():
            return "Đặc trưng của gốm Bát Tràng là xương gốm dày dặn dẻo dai từ đất sét trắng tinh lọc, kết hợp kỹ thuật tráng men độc bản như men rạn cổ, men lam, nung lò bầu nhiệt độ cao."
        elif "vạn phúc" in location.lower():
            return "Kỹ thuật dệt lụa Vạn Phúc nổi tiếng với các sợi vân ẩn hiện óng ả nhờ khung cửi Jacquard cổ, sờ vào thấy mát rượi và giặt không bao giờ phai màu."
        else:
            return f"Kỹ thuật chế tác tại {location} là bí quyết gia truyền độc đáo của dòng họ địa phương, sử dụng các vật liệu tự nhiên và công nghệ thủ công truyền thống tinh xảo."

    # 5. Default guide dialog
    return f"Chào bạn! Mình là Hướng dẫn viên bản địa ảo tại {location}. Bạn có câu hỏi nào về các di tích cổ, góc check-in đẹp hay quy trình làm nghề thủ công đặc sắc ở đây không?"

def generate_offline_chat_response(message: str, location: str, policies_context: str) -> str:
    msg = message.lower().strip()
    
    # 0. Intercept confirmations & greetings
    if msg in ["có", "co", "ok", "được", "đồng ý", "yes", "xem sản phẩm", "xem"]:
        return f"Dạ tuyệt vời! Bạn có thể gõ từ khóa sản phẩm hoặc dịch vụ bạn muốn tìm (ví dụ: 'gốm', 'lụa', 'workshop', 'khách sạn') để em hiển thị thẻ thông tin trực tiếp nhé!"
    
    if msg in ["không", "khong", "no"]:
        return "Dạ vâng ạ. Nếu bạn có bất kỳ câu hỏi nào về phương ngữ hay văn hóa làng nghề Việt Nam, cứ tự nhiên hỏi em nhé!"

    if any(k in msg for k in ["hello", "hi", "xin chào", "chào", "chào bạn"]):
        return f"Chào bạn! Trợ lý ảo LocalViet đang hoạt động ở chế độ Offline. Làng nghề {location} rất nổi tiếng với các sản phẩm làm tay tinh xảo. Bạn có muốn đặt lịch trải nghiệm làm gốm/dệt lụa hay xem sản phẩm nào không ạ?"
    
    # 1. Check if it's a virtual guide site-specific question
    if any(k in msg for k in ["hướng dẫn viên", "hdv", "cột", "cổng", "mái", "lịch sử", "chụp hình", "check-in"]):
        if "cổng" in msg:
            return f"Chào bạn! Cổng ở làng cổ {location} được xây thấp chủ yếu theo quan niệm xưa nhằm thể hiện sự cung kính khi ra vào làng, đồng thời buộc người cưỡi ngựa hay đi xe kéo phải xuống xe để đi bộ thong thả, đảm bảo an ninh và sự thanh bình cho đời sống chung."
        elif "cột" in msg:
            return f"Các cột trụ ở đây thường được làm bằng gỗ mít hoặc gỗ lim cổ thụ. Gỗ mít có đặc tính chịu lực cực tốt, thớ dai, không bị mối mọt đục khoét và có mùi thơm nhẹ đặc trưng, giúp kết cấu gỗ trường tồn qua hàng trăm năm thời tiết nóng ẩm."
        elif "chụp hình" in msg or "check-in" in msg or "ảnh" in msg:
            return f"Mẹo chụp hình đẹp tại {location}: Bạn nên canh chụp vào lúc nắng nhẹ (8h-10h sáng hoặc 3h-5h chiều). Hãy đứng từ các góc ngõ rêu phong hoặc trước các mái ngói cổ cong vút để tôn lên vẻ đẹp di sản cổ kính nhé!"
        else:
            return f"Địa danh {location} là một di sản văn hóa đặc sắc với lịch sử lâu đời hơn 500 năm. Nơi đây lưu giữ kiến trúc nhà cổ độc đáo cùng nghề thủ công truyền qua nhiều thế hệ nghệ nhân. Bạn cứ tự nhiên hỏi thêm về kiến trúc hoặc vật liệu nhé!"

    # 2. Check if we have policies in the context and user asks about booking, shipping, or payments
    if policies_context:
        if any(k in msg for k in ["ship", "gửi", "vận chuyển"]):
            return "Chính sách vận chuyển của chúng tôi gồm:\n- Vận chuyển Tiêu chuẩn (7-14 ngày): Mỹ $25/kg, Châu Âu $22/kg, Nhật/Hàn $15/kg.\n- Vận chuyển Nhanh (3-5 ngày): Mỹ $45/kg, Châu Âu $40/kg, Nhật/Hàn $28/kg.\n- Hàng dễ vỡ như gốm sứ được đóng thùng gỗ chuyên dụng và bảo hiểm 100% giá trị nứt vỡ."
        elif any(k in msg for k in ["đặt", "book", "hủy", "cancel"]):
            return "Chính sách hủy và đặt chỗ workshop:\n- Hủy trước 24 giờ: Hoàn tiền 100% không mất phí.\n- Hủy trong vòng 24 giờ: Hoàn tiền 50% hoặc hỗ trợ dời lịch miễn phí 1 lần.\n- Trẻ em dưới 10 tuổi được giảm giá 30% khi tham gia cùng người lớn."
        elif any(k in msg for k in ["thanh toán", "pay", "vietqr", "momo"]):
            return "Phương thức thanh toán hỗ trợ:\n- Chuyển khoản qua mã VietQR.\n- Ví điện tử MoMo, ZaloPay.\n- Đối với khách nước ngoài: Thẻ tín dụng Visa, MasterCard, JCB hoặc Apple Pay/Google Pay tích hợp sẵn."

    # 3. Default friendly conversational response
    return f"Chào bạn! Trợ lý ảo LocalViet đang hoạt động ở chế độ Offline. Làng nghề {location} rất nổi tiếng với các sản phẩm làm tay tinh xảo. Bạn có muốn đặt lịch trải nghiệm làm gốm/dệt lụa hay xem sản phẩm nào không ạ?"

@app.post("/api/route-plan")
async def route_plan(req: RoutePlanRequest):
    locations_context = """
    1. Làng Ngũ Xã (Đúc đồng, Ba Đình, Hà Nội, lat: 21.0400, lng: 105.8380)
    2. Làng gốm Bát Tràng (Gốm sứ, Gia Lâm, Hà Nội, lat: 20.9800, lng: 105.9200)
    3. Làng gốm Chu Đậu (Gốm sứ, Nam Sách, Hải Dương, lat: 20.9833, lng: 106.3333)
    4. Làng lụa Vạn Phúc (Dệt lụa, Hà Đông, Hà Nội, lat: 20.9500, lng: 105.7667)
    5. Làng Sơn Đồng (Tượng gỗ tâm linh, Hoài Đức, Hà Nội, lat: 21.0167, lng: 105.7167)
    6. Sơn mài Hạ Thái (Sơn mài, Thường Tín, Hà Nội, lat: 20.8833, lng: 105.8667)
    7. Làng Phường Đúc (Đúc đồng, Huế, lat: 16.4500, lng: 107.5667)
    8. Làng gốm Bàu Trúc (Gốm sứ Chăm, Ninh Thuận, lat: 11.5333, lng: 108.9667)
    9. Làng gốm Thanh Hà (Gốm sứ, Hội An, lat: 15.8833, lng: 108.3000)
    10. Làng hương Thủy Xuân (Làm hương, Huế, lat: 16.4450, lng: 107.5600)
    11. Làng lụa Tân Châu (Lụa Lãnh Mỹ A, An Giang, lat: 10.8167, lng: 105.2333)
    12. Đá Non Nước (Điêu khắc đá, Đà Nẵng, lat: 16.0333, lng: 108.2500)
    """
    
    duration_str = f"{req.duration_value} {req.duration_unit}" if req.duration_value and req.duration_unit else f"{req.duration_days} ngày"
    budget_str = req.budget if req.budget else "Tự do / Chưa xác định"
    group_type_str = req.group_type if req.group_type else "Chưa xác định"

    prompt = f"""
    Hãy lập một lộ trình du lịch tự hành tối ưu dựa trên:
    - Điểm xuất phát: {req.start_location}
    - Sở thích chính: {req.interest}
    - Thời gian: {duration_str}
    - Ngân sách chi trả dự kiến: {budget_str}
    - Hình thức chuyến đi: {group_type_str} (cá nhân hay đi theo đoàn đông người)

    Danh sách các làng nghề trong hệ thống:
    {locations_context}

    Hãy chọn ra các địa điểm phù hợp nhất, sắp xếp hành trình tối ưu, tư vấn hoạt động và mẹo du lịch phù hợp với ngân sách và hình thức di chuyển (cá nhân hay theo đoàn).
    Trả về định dạng JSON chuẩn nằm trong thẻ ```json ... ```:
    {{
      "route_name": "[Tên lộ trình hấp dẫn]",
      "summary": "[Mô tả ngắn gọn lộ trình, có đề cập ngắn đến điểm xuất phát, thời gian du lịch, ngân sách và hình thức chuyến đi để tăng tính cá nhân hóa]",
      "steps": [
         {{
           "day": 1,
           "place_name": "[Tên địa điểm]",
           "coordinates": {{"lat": [vĩ độ], "lng": [kinh độ]}},
           "activity": "[Hoạt động đề xuất]",
           "tips": "[Mẹo nhỏ cho khách du lịch, phù hợp với ngân sách/đoàn]",
           "craft_id": [ID số tương ứng ở trên: 1 cho Bát Tràng, 2 cho Vạn Phúc, 9 cho Thanh Hà, 10 cho Thủy Xuân, v.v., hoặc null nếu không có]
         }}
      ]
    }}
    Lưu ý phần coordinates: Hãy tra cứu và điền đúng vĩ độ (lat) và kinh độ (lng) thực tế của địa điểm đó làm số thực (float).
    """
    
    try:
        response_text = await gemini.generate_response(prompt)
        if "lỗi kết nối" in response_text or response_text.startswith("Dạ, trợ lý đang gặp chút"):
            raise ConnectionError("Google Gemini API is unreachable via proxy.")
        
        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json")[-1].split("```")[0].strip()
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError("JSON parsing failed")
    except Exception as e:
        print(f"Route Plan API failed, activating offline local fallback for {req.start_location} + {req.interest}: {str(e)}")
        start = req.start_location.lower()
        interest = req.interest.lower()
        
        steps = []
        if "hà nội" in start or "hanoi" in start or "an giang" in start:
            if "craft" in interest:
                steps = [
                    {
                        "day": 1,
                        "place_name": "Làng gốm Bát Tràng",
                        "coordinates": {"lat": 20.9800, "lng": 105.9200},
                        "activity": "Trải nghiệm nặn gốm xoay tay và tham quan Bảo tàng Gốm Bát Tràng.",
                        "tips": f"Phù hợp cho chuyến đi {group_type_str}. Nên đi xe bus 47 hoặc taxi. Ngân sách đề xuất: {budget_str}.",
                        "craft_id": 1
                    },
                    {
                        "day": 2,
                        "place_name": "Làng lụa Vạn Phúc",
                        "coordinates": {"lat": 20.9500, "lng": 105.7667},
                        "activity": "Khám phá xưởng dệt lụa truyền thống, chụp hình tại con đường ô rực rỡ.",
                        "tips": "Hãy cảm nhận lụa tơ tằm bằng mu bàn tay để thấy độ mát tự nhiên.",
                        "craft_id": 2
                    }
                ]
            else:
                steps = [
                    {
                        "day": 1,
                        "place_name": "Làng Ngũ Xã",
                        "coordinates": {"lat": 21.0400, "lng": 105.8380},
                        "activity": "Tìm hiểu di sản đúc đồng cổ truyền, tham quan đền Thần Quang.",
                        "tips": "Thưởng thức phở cuốn Ngũ Xã nổi tiếng ngay tại hồ Trúc Bạch.",
                        "craft_id": 101
                    },
                    {
                        "day": 2,
                        "place_name": "Làng Sơn Đồng",
                        "coordinates": {"lat": 21.0167, "lng": 105.7167},
                        "activity": "Chiêm ngưỡng các nghệ nhân tạc tượng gỗ tâm linh thếp vàng bạc.",
                        "tips": "Tôn trọng các pho tượng phật đang trong quá trình tạo hình.",
                        "craft_id": 112
                    }
                ]
        elif "huế" in start or "hue" in start:
            steps = [
                {
                    "day": 1,
                    "place_name": "Làng hương Thủy Xuân",
                    "coordinates": {"lat": 16.4450, "lng": 107.5600},
                    "activity": "Chụp hình cùng những bó hương xòe hoa, tự tay trải nghiệm se hương.",
                    "tips": f"Phù hợp cho hình thức {group_type_str}. Nên mua một vài món quà lưu niệm nhỏ ủng hộ các mệ.",
                    "craft_id": 5
                },
                {
                    "day": 2,
                    "place_name": "Làng Phường Đúc",
                    "coordinates": {"lat": 16.4500, "lng": 107.5667},
                    "activity": "Khám phá kỹ thuật đúc chuông đồng khổng lồ truyền đời.",
                    "tips": "Lắng nghe nghệ nhân giải thích về tỷ lệ hợp kim đồng cổ truyền.",
                    "craft_id": 201
                }
            ]
        else: # Default/Hội An
            steps = [
                {
                    "day": 1,
                    "place_name": "Làng gốm Thanh Hà",
                    "coordinates": {"lat": 15.8833, "lng": 108.3000},
                    "activity": "Trải nghiệm nặn tò he đất, xem kỹ thuật xoay gốm bằng đôi bàn chân vàng.",
                    "tips": f"Rất tuyệt vời khi đi {group_type_str}. Vé vào cổng đã bao gồm quà tò he nhỏ.",
                    "craft_id": 202
                },
                {
                    "day": 2,
                    "place_name": "Hội An cổ truyền",
                    "coordinates": {"lat": 15.8833, "lng": 108.3000},
                    "activity": "Tự tay làm đèn lồng tre bọc vải lụa gấm thêu hoa dưới sự hướng dẫn.",
                    "tips": "Khung tre lồng có thể xếp gọn cực kỳ tiện lợi để mang về nước.",
                    "craft_id": 5
                }
            ]
            
        return {
            "route_name": f"Hành trình {req.interest.capitalize()} từ {req.start_location} (Offline)",
            "summary": f"Lộ trình tối ưu được lập tự động dựa trên sở thích khám phá di sản ({duration_str}, ngân sách {budget_str}, đi {group_type_str}).",
            "steps": steps[:req.duration_days * 2] if req.duration_days > 0 else steps
        }

@app.post("/api/dialect-translate")
async def dialect_translate(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    mime_type: Optional[str] = Form(None)
):
    source_text = text
    
    if file:
        actual_mime = mime_type or file.content_type
        ext = ".wav"
        if "webm" in actual_mime:
            ext = ".webm"
        elif "ogg" in actual_mime:
            ext = ".ogg"
        elif "mp4" in actual_mime:
            ext = ".m4a"
        elif "mpeg" in actual_mime:
            ext = ".mp3"

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name

        try:
            audio_prompt = "Hãy NGHE đoạn âm thanh tiếng Việt hoặc tiếng địa phương này. Ghi lại văn bản (transcription) chính xác nhất có thể bao gồm cả các từ địa phương. Trả về JSON: {\"transcription\": \"...\"}"
            audio_res = await gemini.generate_response_from_audio(temp_path, mime_type=actual_mime, task_prompt=audio_prompt)
            os.remove(temp_path)
            
            if isinstance(audio_res, dict) and "transcription" in audio_res:
                source_text = audio_res["transcription"]
            elif isinstance(audio_res, dict) and "response" in audio_res:
                source_text = audio_res["response"]
            else:
                source_text = str(audio_res)
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise HTTPException(status_code=500, detail=f"Lỗi chuyển giọng nói: {str(e)}")

    if not source_text:
        raise HTTPException(status_code=400, detail="Không nhận được văn bản hoặc âm thanh cần dịch")

    # Load dialect database (local RAG)
    dialect_context = ""
    matched_words = []
    try:
        db_path = os.path.join(BASE_DIR, "data", "dialect_db.json")
        if os.path.exists(db_path):
            with open(db_path, "r", encoding="utf-8") as df:
                db = json.load(df)
            
            categories = db.get("categories", {})
            phonology = db.get("phonology", [])
            
            lower_text = source_text.lower()
            for cat, items in categories.items():
                for item in items:
                    word = item["word"].lower()
                    if word in lower_text:
                        matched_words.append(item)
            
            if matched_words:
                dialect_context = "Các từ địa phương tra được từ Từ điển:\n" + "\n".join([
                    f"- Từ: {w['word']} | Nghĩa phổ thông: {w['meaning']} | Vùng miền: {w['region']} | Sắc thái: {w.get('nuance', '')}"
                    for w in matched_words[:8]
                ])
                dialect_context += "\n\nMột số quy luật biến âm tham khảo:\n" + "\n".join([
                    f"- '{p['standard']}' biến đổi thành '{p['variation']}' ở vùng {p['region']} (Ví dụ: {p['example']})"
                    for p in phonology[:4]
                ])
    except Exception as e:
        print(f"Error reading dialect DB: {str(e)}")

    prompt = f"""
    Nhiệm vụ: Hãy phân tích phương ngữ và dịch đoạn văn/hội thoại sau:
    "{source_text}"

    {dialect_context}

    Hãy dịch đoạn văn trên sang tiếng Việt phổ thông mượt mà (hoặc dịch sang tiếng Anh nếu đoạn văn gốc là tiếng Anh/người dùng là người nước ngoài).
    Sau đó giải thích các từ địa phương được sử dụng.
    Trả về kết quả dưới dạng JSON chuẩn trong thẻ ```json ... ```:
    {{
      "original_text": "{source_text}",
      "detected_region": "[Vùng miền phát hiện, ví dụ: Miền Trung (Quảng Nam/Huế), Miền Tây (Nam Bộ), v.v.]",
      "translated_text": "[Bản dịch hoàn thiện]",
      "dialect_words": [
         {{
           "word": "[từ gốc]",
           "meaning": "[nghĩa phổ thông]",
           "region": "[vùng miền]",
           "nuance": "[sắc thái biểu cảm]"
         }}
      ],
      "explanation": "[Giải thích chi tiết về ngữ cảnh văn hóa, cách dùng hoặc các lưu ý đặc biệt]"
    }}
    """
    
    try:
        response_text = await gemini.generate_response(prompt)
        if "lỗi kết nối" in response_text or response_text.startswith("Dạ, trợ lý đang gặp chút"):
            raise ConnectionError("Google Gemini API is unreachable via proxy.")

        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json")[-1].split("```")[0].strip()
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            res = json.loads(json_match.group())
            if not res.get("dialect_words") and matched_words:
                res["dialect_words"] = [
                    {"word": w["word"], "meaning": w["meaning"], "region": w["region"], "nuance": w.get("nuance", "")}
                    for w in matched_words
                ]
            return res
        raise ValueError("JSON parsing failed")
    except Exception as e:
        print(f"Dialect translation API failed, activating offline local fallback. Error: {str(e)}")
        translated_text = source_text
        detected_region = "Chưa xác định"
        
        # Build a list of specific dialect word replacements for natural sentence building.
        # We sort by length descending to replace longer phrases first.
        replacements = [
            ("ăn cái chi rứa", "ăn cái gì thế"),
            ("ăn cái chi", "ăn cái gì"),
            ("đi chơi mô rứa", "đi chơi đâu thế"),
            ("đi chơi mô", "đi chơi đâu"),
            ("đi ruộng dìa", "đi ruộng về"),
            ("mần răng", "làm sao"),
            ("mệ nớ", "bà ấy"),
            ("bậu ơi", "bạn ơi"),
            ("ăn chi rứa", "ăn gì thế"),
            ("ăn chi", "ăn gì"),
            ("mần chi", "làm gì"),
            ("nói rứa", "nói thế"),
            ("chi rứa", "gì thế"),
            ("mô rứa", "đâu thế"),
            ("mi", "mày"),
            ("tau", "tao"),
            ("tui", "tôi"),
            ("chi", "gì"),
            ("răng", "sao"),
            ("rứa", "thế"),
            ("mô", "đâu"),
            ("dìa", "về"),
            ("bậu", "bạn"),
            ("hắn", "nó"),
            ("mệ", "bà"),
            ("nớ", "ấy"),
            ("tê", "kia"),
            ("mần", "làm")
        ]
        
        # Apply case-insensitive replacements for sentence translation
        import re
        for dialect_term, standard_term in replacements:
            pattern = re.compile(re.escape(dialect_term), re.IGNORECASE)
            translated_text = pattern.sub(standard_term, translated_text)
            
        # Determine region
        if matched_words:
            detected_region = f"Miền {matched_words[0]['region']}"
        else:
            lower_src = source_text.lower()
            if any(k in lower_src for k in ["mô", "tê", "răng", "rứa"]):
                detected_region = "Miền Trung"
            elif any(k in lower_src for k in ["bậu", "tía", "má", "lóc", "dìa"]):
                detected_region = "Miền Nam"
                
        words_list = [
            {
                "word": w["word"],
                "meaning": w["meaning"],
                "region": w["region"],
                "nuance": w.get("nuance", "Từ ngữ địa phương đặc trưng vùng miền.")
            }
            for w in matched_words
        ]
        
        explanation = "Bản dịch được thực hiện qua bộ từ điển địa phương Offline của LocalViet Connect. "
        if matched_words:
            explanation += f"Đã phát hiện {len(matched_words)} từ địa phương thuộc vùng {detected_region}."
        else:
            explanation += "Không phát hiện thấy từ địa phương quen thuộc trong cơ sở dữ liệu."
            
        return {
            "original_text": source_text,
            "detected_region": detected_region,
            "translated_text": translated_text,
            "dialect_words": words_list,
            "explanation": explanation
        }

@app.post("/api/scan-heritage")
async def scan_heritage(file: UploadFile = File(...)):
    actual_mime = file.content_type
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_img:
        shutil.copyfileobj(file.file, temp_img)
        temp_path = temp_img.name
        
    context = ""
    try:
        rules_path = os.path.join(BASE_DIR, "data", "craft_rules.json")
        if os.path.exists(rules_path):
            with open(rules_path, "r", encoding="utf-8") as rf:
                rules = json.load(rf)
                context += "Quy tắc bảo vệ di sản làng nghề:\n" + json.dumps(rules, ensure_ascii=False) + "\n\n"
    except Exception as e:
        print(f"Error loading rules context: {str(e)}")

    prompt = f"""
    Nhiệm vụ: Hãy phân tích hình ảnh này để nhận diện sản phẩm thủ công mỹ nghệ hoặc di sản văn hóa Việt Nam (ví dụ: gốm Bát Tràng, gốm Chu Đậu, lụa Vạn Phúc, áo dài, nón lá, kiến trúc chùa chiền, tranh Đông Hồ...).

    Dữ liệu tham khảo quy tắc làng nghề & di sản:
    {context}

    Hãy trả về phản hồi dưới dạng JSON có cấu trúc như sau (đảm bảo hợp lệ, chỉ chứa JSON trong khối ```json ... ```):
    {{
      "heritage_name": "[Tên di sản/sản phẩm]",
      "origin": "[Làng nghề / Vùng nguồn gốc]",
      "estimated_age": "[Niên đại / Lịch sử ước lượng]",
      "story": "[Kể một câu chuyện hấp dẫn truyền cảm hứng (Storytelling) về lịch sử, ý nghĩa văn hóa của vật phẩm này cho du khách]",
      "guardrails_summary": {{
         "dos": ["[Các yếu tố truyền thống cần bảo tồn, khuyên dùng]"],
         "donts": ["[Các lỗi hoặc vi phạm bản sắc thường gặp, ví dụ: gốm Bàu Trúc phủ men hoặc lụa Vạn Phúc nhuộm hóa học]"]
      }},
      "village_id": [ID số của làng nghề nếu thuộc danh sách này: 1 (Bát Tràng), 2 (Vạn Phúc), 5 (Hội An/Hương Thủy Xuân), 102 (Bàu Trúc), 111 (Chu Đậu). Nếu không khớp thì để null]
    }}
    """
    
    try:
        response_text = await gemini.generate_response_from_image(temp_path, prompt, mime_type=actual_mime)
        os.remove(temp_path)
        
        if "lỗi kết nối" in response_text or response_text.startswith("Dạ, trợ lý đang gặp chút"):
            raise ConnectionError("Google Gemini API is unreachable via proxy.")

        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json")[-1].split("```")[0].strip()
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError("JSON parsing failed")
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Scan heritage API failed, activating offline fallback. Error: {str(e)}")
        
        # Check filename or fallback to default Bat Trang
        filename = file.filename.lower()
        if "chudah" in filename or "chu dau" in filename or "chudau" in filename:
            return {
                "heritage_name": "Gốm Chu Đậu vẽ tay",
                "origin": "Làng gốm Chu Đậu (Hải Dương)",
                "estimated_age": "Thế kỷ XIII-XIV",
                "story": "Gốm Chu Đậu là một dòng gốm quý cổ truyền của Việt Nam, nổi bật với men trắng rạn và hoa văn xanh chàm vẽ tay, phản ánh đời sống văn hóa thuần nông yên bình.",
                "guardrails_summary": {
                    "dos": ["Nên gõ nhẹ nghe tiếng kêu vang thanh khiết", "Hỏi thăm câu chuyện cá hóa rồng truyền thuyết"],
                    "donts": ["Không chùi rửa bằng cọ sắt thô ráp", "Tránh làm rơi nứt vỡ lớp men bóng"]
                },
                "village_id": 111
            }
        elif "aodai" in filename or "ao dai" in filename:
            return {
                "heritage_name": "Áo dài lụa vân gấm",
                "origin": "Làng lụa Vạn Phúc (Hà Đông)",
                "estimated_age": "Thời Nguyễn",
                "story": "Áo dài tơ tằm dệt lụa vân gấm tinh xảo với hoa văn dây leo chữ thọ mang sắc thái quý phái, là quốc phục mang đậm bản sắc văn hóa Việt Nam.",
                "guardrails_summary": {
                    "dos": ["Giặt khô để giữ độ óng ánh tự nhiên của tơ", "Ủi hơi nước nhiệt độ thấp ở mặt trái"],
                    "donts": ["Tránh phơi trực tiếp dưới nắng gắt", "Không vắt xoắn mạnh tay làm sần bề mặt sợi lụa"]
                },
                "village_id": 2
            }
        else:
            return {
                "heritage_name": "Bình gốm rạn Bát Tràng",
                "origin": "Làng gốm cổ Bát Tràng (Gia Lâm, Hà Nội)",
                "estimated_age": "Thế kỷ XVI",
                "story": "Tác phẩm bình gốm men rạn vẽ hoa sen tay tinh tế, thể hiện kỹ thuật đun lò và điều chỉnh nhiệt độ tài tình của các nghệ nhân sông Hồng.",
                "guardrails_summary": {
                    "dos": ["Sử dụng chổi lông gà quét bụi nhẹ nhàng", "Trưng bày nơi khô ráo, thoáng mát"],
                    "donts": ["Tránh va đập mạnh làm nứt xương gốm dày", "Không ngâm nước nóng lâu ngày"]
                },
                "village_id": 1
            }

@app.get("/api/villages/{village_id}/details")
async def get_village_details(village_id: str):
    details_path = os.path.join(BASE_DIR, "data", "villages_details.json")
    if not os.path.exists(details_path):
        raise HTTPException(status_code=404, detail="Database file not found")
        
    with open(details_path, "r", encoding="utf-8") as f:
        db = json.load(f)
        
    details = db.get(str(village_id))
    if not details:
        details = {
            "name_vi": f"Làng nghề di sản (ID: {village_id})",
            "name_en": f"Heritage Craft Village (ID: {village_id})",
            "history_vi": "Thông tin đang được cập nhật từ các nguồn tài liệu của Viện Nghiên cứu Văn hóa nghệ thuật Quốc gia.",
            "history_en": "Information is currently being updated from the National Institute of Culture and Arts Studies.",
            "secrets_vi": "Bí quyết chế tác truyền dạy nội bộ qua nhiều thế hệ nghệ nhân bản địa.",
            "secrets_en": "Craft secrets passed down internally through generations of local master artisans.",
            "visitor_guide_vi": {
                "ticket_price": "Miễn phí vào cửa tự do.",
                "workshop_price": "Liên hệ trực tiếp ban quản lý làng nghề.",
                "transport": "Khuyên dùng phương tiện di chuyển cá nhân hoặc taxi công nghệ.",
                "best_time": "Vào mùa khô mát mẻ, đặc biệt là các dịp lễ hội làng nghề đầu xuân.",
                "artisan_contacts": []
            },
            "visitor_guide_en": {
                "ticket_price": "Free entry.",
                "workshop_price": "Contact the local craft board directly.",
                "transport": "Ride-hailing taxi or private transport is recommended.",
                "best_time": "Dry season, especially during early spring village festivals.",
                "artisan_contacts": []
            }
        }
    return details

if __name__ == "__main__":
    import uvicorn
    # Tự động lấy Port từ Render, nếu không có thì mặc định 8000
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0" if "PORT" in os.environ else "127.0.0.1"
    uvicorn.run(app, host=host, port=port)
