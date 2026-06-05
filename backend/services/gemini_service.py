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
       # Thử ép sử dụng transport và cấu hình cơ bản nhất
       genai.configure(api_key=self.api_key)
       
       # Nâng cấp lên dòng Model 3.5 mới nhất (Phát hành tháng 5/2026)
       self.models_to_try = [
           "gemini-3.5-flash", 
           "gemini-3.5-flash-lite",
           "gemini-1.5-flash"
       ]
       self.current_model_name = "gemini-3.5-flash"
       
       # Cấu hình để tối ưu hóa cho dòng 3.5
       genai.configure(api_key=self.api_key, transport='rest')
       
       try:
           self.model = genai.GenerativeModel(
               model_name=self.current_model_name,
               system_instruction=SYSTEM_PROMPT
           )
       except:
           # Fallback sang bản 1.5 nếu vùng của bạn chưa cập nhật kịp 3.5
           self.model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    def get_model(self):
        return self.model

    async def generate_response(self, prompt: str, history=None):
        try:
            model = self.get_model()
            # Không cần nhúng SYSTEM_PROMPT vào prompt nữa vì đã có system_instruction
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Text Error: {str(e)}")
            return f"Dạ, trợ lý đang gặp chút lỗi kết nối. Bạn thử lại nhé!"

    async def generate_response_from_audio(self, audio_path: str, mime_type: str = None):
        last_error = ""
        # Thử lần lượt các model trong danh sách để tránh lỗi 404
        for model_name in self.models_to_try:
            try:
                # Read the audio bytes directly
                with open(audio_path, 'rb') as f:
                    audio_data = f.read()

                audio_part = {
                    "mime_type": mime_type or "audio/webm",
                    "data": audio_data
                }

                task_prompt = "Hãy NGHE và DỊCH âm thanh này sang tiếng Việt. Xác định phương ngữ. Trả về JSON: {\"transcription\": \"...\", \"dialect\": \"...\", \"response\": \"...\"}"
                
                # Khởi tạo model tạm thời để thử nghiệm
                temp_model = genai.GenerativeModel(model_name=model_name)
                response = temp_model.generate_content([audio_part, task_prompt])
                
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
                last_error = str(e)
                print(f"Trial with {model_name} failed: {last_error}")
                continue # Thử model tiếp theo
                
        return {"error": last_error, "response": "AI hiện không tìm thấy Model phù hợp trên server. Bạn hãy thử tạo lại API Key mới nhé!"}
Line 75: 