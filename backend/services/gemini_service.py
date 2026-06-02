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
       
       # Print available models to backend logs for debugging
       try:
           print("--- AVAILABLE MODELS AS PER YOUR API KEY ---")
           for m in genai.list_models():
               if 'generateContent' in m.supported_generation_methods:
                   print(m.name)
       except:
           pass

       # Initialize with the most reliable model name
       self.model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    async def generate_response(self, prompt: str, history=None):
        try:
            # Shift SYSTEM_PROMPT here for maximum compatibility
            full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {prompt}"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    async def generate_response_from_audio(self, audio_path: str, mime_type: str = None):
        try:
            # Read the audio bytes directly
            with open(audio_path, 'rb') as f:
                audio_data = f.read()

            audio_part = {
                "mime_type": mime_type or "audio/webm",
                "data": audio_data
            }

            # Combine system prompt and task for audio processing
            full_prompt = f"{SYSTEM_PROMPT}\n\nTASK: YOU ARE A TRANSCRIBER. \n1. LISTEN carefully to the audio.\n2. TRANSCRIBE the full Vietnamese text.\n3. IDENTIFY the regional dialect.\n4. RESPOND briefly.\n\nOutput valid JSON object only."
            
            response = self.model.generate_content([audio_part, full_prompt])
            
            text = response.text.strip()
            # Handle potential markdown
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()

            import json
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    return {"response": text, "dialect": "Không xác định", "transcription": text[:50]}
            else:
                return {"response": text, "dialect": "Không xác định", "transcription": text}
        except Exception as e:
            print(f"Gemini Service Error: {str(e)}")
            return {"error": str(e), "response": "Dạ, hệ thống đang gặp chút sự cố kết nối AI. Bạn thử lại nhé!"}
