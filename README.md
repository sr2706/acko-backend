# AI Medical Consultation System

A real-time voice transcription and reflexive question generation system for medical consultations, built for Vercel deployment.

## Architecture

- **Frontend**: Next.js (deployed on Vercel)
- **AI Service**: Python FastAPI (deployed on Railway/Render)
- **AI Model**: Google Gemini (free tier)
- **Database**: In-memory storage (can be upgraded to Vercel Postgres)

## Features

✅ Real-time voice transcription (Hindi + English)
✅ Sentiment analysis and emotion detection
✅ Dynamic question generation
✅ Doctor interface for session management
✅ Bilingual support with language detection

## Quick Setup

### 1. Deploy Python AI Service

1. Go to [Railway.app](https://railway.app) or [Render.com](https://render.com)
2. Create a new project and connect your GitHub repo
3. Select the `python-ai-service` folder
4. Add environment variable: `GEMINI_API_KEY=your_gemini_key`
5. Deploy and get the service URL

### 2. Deploy Main Application

1. Fork this repository
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `GEMINI_API_KEY=your_gemini_key`
   - `PYTHON_SERVICE_URL=https://your-python-service.railway.app`
5. Deploy

## API Endpoints

### Session Management
```javascript
// Start session
POST /api/sessions/start
{
  "doctorId": "doc123",
  "patientName": "John Doe",
  "sessionType": "audio"
}

// Update context
PUT /api/sessions/{sessionId}/context
{
  "context": "Patient has diabetes",
  "medicalHistory": ["hypertension", "diabetes"]
}

// End session
POST /api/sessions/{sessionId}/end
```

### Voice Transcription
```javascript
// Transcribe audio
POST /api/transcribe
FormData: { audio: File }
Response: {
  "transcript": "Patient says...",
  "language": "en",
  "confidence": 0.95,
  "sentiment": {
    "label": "neutral",
    "score": 0.8
  }
}
```

### Question Generation
```javascript
// Generate questions
POST /api/questions/generate
{
  "sessionId": "session123",
  "transcript": "Patient response...",
  "context": "Medical context",
  "questionType": "open"
}
Response: {
  "questions": ["Question 1", "Question 2"],
  "suggestedQuestion": "Most relevant question",
  "emotionAlert": false,
  "emotionDetails": {...},
  "medicalInsights": [...]
}
```

## Frontend Integration

### React Component Example
```jsx
import { useState } from 'react';

const MedicalConsultation = () => {
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [questions, setQuestions] = useState([]);

  const startSession = async () => {
    const response = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: 'doc123',
        patientName: 'Patient Name',
        sessionType: 'audio'
      })
    });
    const data = await response.json();
    setSessionId(data.sessionId);
  };

  const transcribeAudio = async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    setTranscript(data.transcript);
    return data;
  };

  const generateQuestions = async (transcript) => {
    const response = await fetch('/api/questions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        transcript,
        context: '',
        questionType: 'open'
      })
    });
    const data = await response.json();
    setQuestions(data.questions);
    return data;
  };

  return (
    <div>
      <button onClick={startSession}>Start Session</button>
      <div>Transcript: {transcript}</div>
      <div>Questions: {questions.map(q => <div key={q}>{q}</div>)}</div>
    </div>
  );
};
```

## Environment Variables

### Vercel Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PYTHON_SERVICE_URL`: URL of your deployed Python service

### Python Service Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Port number (default: 8000)

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your environment variables

## Deployment Steps

1. **Deploy Python Service**:
   - Push code to GitHub
   - Connect to Railway/Render
   - Add environment variables
   - Deploy

2. **Deploy Main App**:
   - Connect GitHub repo to Vercel
   - Add environment variables
   - Deploy

3. **Test**:
   - Use the API endpoints to test functionality
   - Check logs in Vercel and Railway/Render

## Features Implemented

- ✅ Real-time voice transcription using Gemini
- ✅ Bilingual support (Hindi + English)
- ✅ Sentiment analysis and emotion detection
- ✅ Dynamic question generation
- ✅ Session management
- ✅ Doctor interface endpoints
- ✅ Vercel-ready deployment
- ✅ Free AI model integration

## Support

For issues or questions, please check the logs in your deployment platforms or create an issue in the repository.