from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from services.gemini_service import GeminiService
from services.authenticity_service import AuthenticityService
import os
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
    lower_msg = last_message.lower()

    # Determine location context (Bát Tràng, Vạn Phúc, Hội An)
    location = "Hội An"
    if "bát tràng" in lower_msg:
        location = "Bát Tràng"
    elif "vạn phúc" in lower_msg:
        location = "Vạn Phúc"

    # Multi-intent extraction:
    # 1. Product (mua, đèn lồng, gốm, tranh, lụa, sản phẩm)
    # 2. Workshop (workshop, học làm, trải nghiệm, lớp)
    # 3. Hotel/Map search (khách sạn, hotel, homestay, chỗ ở, nơi ở)
    has_product = any(k in lower_msg for k in ["mua", "đèn lồng", "bình gốm", "khăn lụa", "bộ kit", "sản phẩm"])
    has_workshop = any(k in lower_msg for k in ["workshop", "học làm", "trải nghiệm", "lớp"])
    has_hotel = any(k in lower_msg for k in ["khách sạn", "hotel", "homestay", "chỗ ở", "nghỉ", "đặt phòng"])

    # Scenario A: Phức hợp mua hàng + workshop + khách sạn
    if has_product and has_workshop and has_hotel:
        prod_query = "đèn lồng" if "đèn lồng" in lower_msg else ("bình gốm" if "gốm" in lower_msg else "khăn lụa")
        ws_query = "workshop"

        # Call concurrently via asyncio.gather
        prod_task = fetch_product_match(prod_query, location)
        ws_task = fetch_workshop_match(ws_query, location)
        hotel_task = fetch_hotel_match(location)

        product, workshop, hotel = await asyncio.gather(prod_task, ws_task, hotel_task)

        cards = []
        errors = []

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
        else:
            errors.append("sản phẩm thủ công")

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
        else:
            errors.append("workshop làm sản phẩm")

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
        else:
            errors.append("khách sạn gần đó")

        # Compile response message
        resp_text = f"Dạ, em đã tìm thấy thông tin bạn yêu cầu tại **{location}**:\n\n"
        if errors:
            resp_text += f"*(Rất tiếc, hiện tại em chưa tìm thấy {', '.join(errors)} nào phù hợp tại địa điểm này ạ.)*\n\n"
        resp_text += "Bạn có thể bấm vào các thẻ bên dưới để xem trực tiếp hoặc nhấn nút **Tạo lịch trình trọn gói** bên dưới để em sắp xếp giúp nhé!"

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

    # Scenario B: Tìm khách sạn (Deep link sang Bản đồ)
    elif has_hotel:
        hotel = await fetch_hotel_match(location)
        if hotel:
            cards = [{
                "type": "hotel",
                "id": hotel["id"],
                "title": hotel["title"],
                "subtitle": hotel["subtitle"],
                "price_text": hotel["price_text"],
                "image_url": hotel["image_url"],
                "action_label": "🏨 Xem trên bản đồ",
                "lat": float(hotel["lat"]),
                "lng": float(hotel["lng"])
            }]
            return {
                "response": f"Dạ, em đã tìm thấy khách sạn phù hợp gần làng cổ **{location}** cho bạn:\n\n**{hotel['title']}**\nGiá phòng: {hotel['price_text']}\n\nBạn có thể bấm nút **Xem trên bản đồ** để chuyển sang tab Bản đồ và xem vị trí chính xác của khách sạn nhé!",
                "cards": cards,
                "violations": []
            }

    # Scenario C: Default standard response
    # Check for authenticity violations
    violations = authenticity.check_violations(last_message)
    extra_context = ""
    if violations:
        v = violations[0]
        extra_context = f"\n\n[QUAN TRỌNG: Người dùng yêu cầu vi phạm quy tắc làng nghề.\n- Làng nghề: {v['craft']}\n- Vi phạm: {v['warning']}\n- Được phép: {', '.join(v['alternatives'])}\nHãy TỪ CHỐI lịch sự và đề xuất thay thế.]"

    # Prepare prompt with history (simple version)
    prompt = last_message + extra_context
    response_text = await gemini.generate_response(prompt)
    
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

if __name__ == "__main__":
    import uvicorn
    # Tự động lấy Port từ Render, nếu không có thì mặc định 8000
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0" if "PORT" in os.environ else "127.0.0.1"
    uvicorn.run(app, host=host, port=port)
