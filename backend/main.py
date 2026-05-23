from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from services.gemini_service import GeminiService
from services.authenticity_service import AuthenticityService
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")

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

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    
    last_message = request.messages[-1].content
    
    # Check for authenticity violations
    violations = authenticity.check_violations(last_message)
    extra_context = ""
    if violations:
        v = violations[0]
        extra_context = f"\n\n[QUAN TRỌNG: Người dùng yêu cầu vi phạm quy tắc làng nghề.\n- Làng nghề: {v['craft']}\n- Vi phạm: {v['warning']}\n- Được phép: {', '.join(v['alternatives'])}\nHãy TỪ CHỐI lịch sự và đề xuất thay thế.]"

    # Prepare prompt with history (simple version)
    # Ideally we'd pass history to Gemini correctly, but for now we'll simulate it
    prompt = last_message + extra_context
    
    response_text = await gemini.generate_response(prompt)
    
    return {
        "response": response_text,
        "violations": violations
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
