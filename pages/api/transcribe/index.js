import { GoogleGenerativeAI } from '@google/generative-ai';
import formidable from 'formidable';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes('audio');
      }
    });

    const [fields, files] = await form.parse(req);
    const audioFile = files.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Read audio file
    const audioBuffer = fs.readFileSync(audioFile.filepath);
    const audioBase64 = audioBuffer.toString('base64');

    // Use Gemini for transcription
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
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
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: audioBase64,
          mimeType: audioFile.mimetype
        }
      }
    ]);

    const response = await result.response;
    const transcriptionResult = JSON.parse(response.text());

    // Clean up uploaded file
    fs.unlinkSync(audioFile.filepath);

    res.status(200).json({
      transcript: transcriptionResult.transcript,
      language: transcriptionResult.language,
      confidence: transcriptionResult.confidence,
      sentiment: transcriptionResult.sentiment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ 
      error: 'Transcription failed',
      details: error.message 
    });
  }
}