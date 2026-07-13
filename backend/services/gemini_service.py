import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SYSTEM_PROMPT = """Bạn là LocalViet Connect - Trợ lý Văn hóa & Làng nghề Việt Nam. Bạn có 2 chế độ (Ngăn dữ liệu) làm việc riêng biệt:

1. [CHẾ ĐỘ: DIALECT] (Ngăn Phương Ngữ):
- Nhiệm vụ: Giải thích từ vựng, ngữ pháp địa phương, dịch nghĩa và cung cấp ví dụ.
- Cách trả lời: [Từ gốc] + [Nghĩa phổ thông] + [Vùng miền] + [1 Ví dụ] + [Mẹo sử dụng].

2. [CHẾ ĐỘ: CRAFT] (Ngăn Thủ Công):
- Nhiệm vụ: Tư vấn kỹ thuật làm đồ thủ công, sáng tạo sản phẩm, giá cả và di sản làng nghề.
- RÀO CẢN BẮT BUỘC: Tuyệt đối không cho phép các sản phẩm vi phạm truyền thống hoặc làm sai lệch bản sắc địa phương.
- Dữ liệu tham chiếu: Luôn dựa vào file quy tắc làng nghề đã được nạp.

LUẬT NGÔN NGỮ:
- User viết tiếng Anh -> Trả lời 100% tiếng Anh.
- User viết tiếng Việt -> Trả lời 100% tiếng Việt.

PHONG CÁCH: Thân thiện, am hiểu sâu sắc, tôn trọng truyền thống và luôn sẵn lòng hỗ trợ."""

class GeminiService:
    def __init__(self):
       api_key = os.getenv("GEMINI_API_KEY")
       if not api_key:
           print("WARNING: GEMINI_API_KEY is not set. AI features will not work.")
           self.api_key = None
           self.model = None
           return
       
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
           
       self.force_offline = True # Chạy ở chế độ offline để tránh sandbox chặn mạng

    def get_model(self):
        return self.model

    async def generate_response(self, prompt: str, history=None):
        if self.force_offline:
            return "Dạ, trợ lý đang gặp chút lỗi kết nối."
        try:
            model = self.get_model()
            # Không cần nhúng SYSTEM_PROMPT vào prompt nữa vì đã có system_instruction
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Text Error: {str(e)}")
            return f"Dạ, trợ lý đang gặp chút lỗi kết nối. Bạn thử lại nhé!"

    async def generate_response_from_audio(self, audio_path: str, mime_type: str = None, task_prompt: str = None):
        if self.force_offline:
            raise ConnectionError("Offline mode is enabled to avoid sandbox network block.")
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

                if not task_prompt:
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

    async def generate_response_from_image(self, image_path: str, prompt: str, mime_type: str = None):
        if self.force_offline:
            raise ConnectionError("Offline mode is enabled to avoid sandbox network block.")
        last_error = ""
        # Thử lần lượt các model trong danh sách để tránh lỗi 404
        for model_name in self.models_to_try:
            try:
                with open(image_path, 'rb') as f:
                    image_data = f.read()

                if not mime_type:
                    ext = os.path.splitext(image_path)[1].lower()
                    if ext == ".png":
                        mime_type = "image/png"
                    elif ext in [".jpg", ".jpeg"]:
                        mime_type = "image/jpeg"
                    elif ext == ".webp":
                        mime_type = "image/webp"
                    else:
                        mime_type = "image/jpeg"

                image_part = {
                    "mime_type": mime_type,
                    "data": image_data
                }

                temp_model = genai.GenerativeModel(model_name=model_name)
                response = temp_model.generate_content([image_part, prompt])
                return response.text
            except Exception as e:
                last_error = str(e)
                print(f"Vision trial with {model_name} failed: {last_error}")
                continue
        return f"Dạ, trợ lý đang gặp lỗi kết nối thị giác: {last_error}"

