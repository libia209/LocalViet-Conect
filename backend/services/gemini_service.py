import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SYSTEM_PROMPT = """You are LocalViet Connect - a Vietnamese Culture & Craft Villages Assistant.

CRITICAL LANGUAGE RULE (MUST FOLLOW):
- If the user writes in English → You MUST respond 100% in English. NEVER use Vietnamese.
- If the user writes in Vietnamese → You MUST respond 100% in Vietnamese. NEVER use English.
- This is the MOST IMPORTANT rule. Violating it is unacceptable.

YOUR PERSONALITY: Friendly, approachable, professional, meticulous, supportive.

CORE RULES:
1. NEVER allow products that violate Vietnamese cultural traditions or distort local identity.
2. When explaining dialects: provide the original Vietnamese word + meaning + 1 example + 1 "Small tip".
3. When users ask about crafting/buying handicrafts: ALWAYS check craft village rules before consulting.
4. Goal: Translate the "spirit" more accurately than the "letter"."""

class GeminiService:
    def __init__(self):
       api_key = os.getenv("GEMINI_API_KEY")
       if not api_key:
           raise RuntimeError("GEMINI_API_KEY is not set")
       self.api_key = api_key.strip()
       # Use REST transport to bypass gRPC issues on some hosting environments
       genai.configure(api_key=self.api_key, transport='rest')

    def get_model(self):
        # Just-in-time initialization
        return genai.GenerativeModel(model_name="gemini-1.5-flash")

    async def generate_response(self, prompt: str, history=None):
        try:
            model = self.get_model()
            full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {prompt}"
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Text Error: {str(e)}")
            return f"Dạ, trợ lý đang gặp chút lỗi kết nối (404/503). Bạn thử lại nhé!"

    async def generate_response_from_audio(self, audio_path: str, mime_type: str = None):
        try:
            model = self.get_model()
            with open(audio_path, 'rb') as f:
                audio_data = f.read()

            audio_part = {
                "mime_type": mime_type or "audio/webm",
                "data": audio_data
            }

            task_prompt = "TRANSCRIBE this audio into Vietnamese and identify the regional dialect. Format as JSON: {\"transcription\": \"...\", \"dialect\": \"...\", \"response\": \"...\"}"
            
            # Direct generation call
            response = model.generate_content([audio_part, task_prompt])
            
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[-1].split("```")[0].strip()
            
            import json
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"response": text, "dialect": "Không xác định", "transcription": ""}
        except Exception as e:
            print(f"Audio Error: {str(e)}")
            return {"error": str(e), "response": "AI không thể nghe rõ lúc này. Vui lòng kiểm tra API Key."}
