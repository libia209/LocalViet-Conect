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
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
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

    async def generate_response_from_audio(self, audio_path: str):
        try:
            # Upload the file to Gemini's file service
            sample_file = genai.upload_file(path=audio_path, display_name="user_voice_message")
            
            prompt = """Analyze this audio:
1. Transcribe it accurately into Vietnamese.
2. Identify the regional dialect (North, Central, South, or specific province if detectable).
3. Identify any specific dialect words or slang.
4. Respond naturally to the user's content as 'LocalViet Connect'.

Format your response as a JSON object with:
{
  "transcription": "...",
  "dialect": "...",
  "detected_features": ["word1", "word2"],
  "response": "..."
}"""
            
            response = self.model.generate_content([sample_file, prompt])
            
            # Extract JSON from response (Gemini sometimes adds markdown blocks)
            import json
            import re
            text = response.text
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    "response": text,
                    "dialect": "Không xác định",
                    "transcription": ""
                }
        except Exception as e:
            return {"error": str(e), "response": "Xin lỗi, tôi gặp sự cố khi nghe giọng của bạn."}
