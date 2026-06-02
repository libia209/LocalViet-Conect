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
       api_key = api_key.strip()
       genai.configure(api_key=api_key)
       # Use the fully qualified model name
       self.model = genai.GenerativeModel(
           model_name="models/gemini-1.5-flash",
           system_instruction=SYSTEM_PROMPT
       )


    async def generate_response(self, prompt: str, history=None):
        # We can implement history management here if needed, 
        # but for now we'll pass the full prompt.
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    async def generate_response_from_audio(self, audio_path: str, mime_type: str = None):
        try:
            # Read the audio bytes directly from the temporary file
            with open(audio_path, 'rb') as f:
                audio_data = f.read()

            # Prepare the audio part for Gemini
            audio_part = {
                "mime_type": mime_type or "audio/webm",
                "data": audio_data
            }

            prompt = """TASK: YOU ARE A TRANSCRIBER. 
1. LISTEN carefully to the audio.
2. TRANSCRIBE the full Vietnamese text.
3. IDENTIFY the regional dialect (e.g., Miền Bắc, Miền Trung, Miền Nam).
4. RESPOND briefly to what they said in a friendly cultural assistant way.

CRITICAL: You MUST output a valid JSON object only.

Format:
{
  "transcription": "chuỗi văn bản đã dịch",
  "dialect": "tên vùng miền",
  "detected_features": [],
  "response": "câu trả lời của bạn"
}"""
            
            # Send both the audio data and the prompt in one request
            response = self.model.generate_content([audio_part, prompt])
            
            text = response.text.strip()
            # Handle potential markdown blocks in Gemini's output
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()

            import json
            import re
            
            # Try to extract anything between curly braces
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    return {
                        "response": text,
                        "dialect": "Không xác định",
                        "transcription": text[:100] + "..."
                    }
            else:
                return {
                    "response": text,
                    "dialect": "Không xác định",
                    "transcription": text
                }
        except Exception as e:
            print(f"Gemini Service Error (Direct Bytes): {str(e)}")
            return {"error": str(e), "response": "Xin lỗi, tôi gặp sự cố kỹ thuật khi nghe giọng của bạn."}
