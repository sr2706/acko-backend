from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import base64
import json
from typing import List, Optional
import uvicorn

app = FastAPI(title="AI Medical Consultation Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class TranscriptionRequest(BaseModel):
    audio_data: str  # base64 encoded audio
    mime_type: str

class QuestionGenerationRequest(BaseModel):
    transcript: str
    context: str = ""
    question_type: str = "open"
    session_history: str = ""

class SentimentAnalysisRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "AI Medical Consultation Service", "status": "running"}

@app.post("/transcribe")
async def transcribe_audio(request: TranscriptionRequest):
    """Transcribe audio using Gemini"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(request.audio_data)
        
        prompt = """
        Transcribe the following audio to text. 
        The audio contains a medical consultation conversation in Hindi and English.
        Please provide:
        1. The transcribed text
        2. The primary language detected
        3. Confidence score (0-1)
        4. Sentiment analysis (positive, negative, neutral, confused, distressed)
        
        Format your response as JSON:
        {
            "transcript": "transcribed text here",
            "language": "hi" or "en",
            "confidence": 0.95,
            "sentiment": {
                "label": "positive/negative/neutral/confused/distressed",
                "score": 0.8
            }
        }
        """
        
        response = model.generate_content([
            prompt,
            {
                "mime_type": request.mime_type,
                "data": audio_bytes
            }
        ])
        
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/generate-questions")
async def generate_questions(request: QuestionGenerationRequest):
    """Generate follow-up questions using Gemini"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an AI assistant helping doctors during medical consultations. 
        Based on the patient's response and medical context, generate appropriate follow-up questions.

        Patient Response: "{request.transcript}"
        Medical Context: "{request.context}"
        Question Type: {request.question_type}
        Session History: "{request.session_history}"

        Generate 3-5 clinically appropriate follow-up questions that will help the doctor:
        1. Gather more medical information
        2. Clarify symptoms
        3. Understand patient concerns
        4. Assess treatment effectiveness

        Also analyze the patient's emotional state and provide alerts if needed.

        Respond in JSON format:
        {{
            "questions": [
                "Question 1",
                "Question 2",
                "Question 3"
            ],
            "suggestedQuestion": "Most relevant question to ask next",
            "emotionAlert": false,
            "emotionDetails": {{
                "detected": "confused/distressed/calm/anxious",
                "confidence": 0.8,
                "recommendation": "Consider reassuring the patient"
            }},
            "medicalInsights": [
                "Key medical insight 1",
                "Key medical insight 2"
            ]
        }}
        """
        
        response = model.generate_content(prompt)
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

@app.post("/analyze-sentiment")
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Analyze sentiment using Gemini"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze the sentiment of the following medical consultation text:
        "{request.text}"
        
        Consider medical context and patient emotions. Respond in JSON format:
        {{
            "sentiment": "positive/negative/neutral/confused/distressed/anxious",
            "confidence": 0.85,
            "emotions": ["confusion", "anxiety", "relief"],
            "recommendation": "Consider reassuring the patient"
        }}
        """
        
        response = model.generate_content(prompt)
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-medical-consultation"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)