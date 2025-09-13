import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, transcript, context = '', questionType = 'open' } = req.body;

    if (!sessionId || !transcript) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId and transcript' 
      });
    }

    // Get session data
    if (!global.sessions || !global.sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = global.sessions.get(sessionId);
    
    // Update session context
    session.transcript += (session.transcript ? ' ' : '') + transcript;
    session.context = context;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are an AI assistant helping doctors during medical consultations. 
    Based on the patient's response and medical context, generate appropriate follow-up questions.

    Patient Response: "${transcript}"
    Medical Context: "${context}"
    Question Type: ${questionType}
    Session History: "${session.transcript}"

    Generate 3-5 clinically appropriate follow-up questions that will help the doctor:
    1. Gather more medical information
    2. Clarify symptoms
    3. Understand patient concerns
    4. Assess treatment effectiveness

    Also analyze the patient's emotional state and provide alerts if needed.

    Respond in JSON format:
    {
      "questions": [
        "Question 1",
        "Question 2",
        "Question 3"
      ],
      "suggestedQuestion": "Most relevant question to ask next",
      "emotionAlert": false,
      "emotionDetails": {
        "detected": "confused/distressed/calm/anxious",
        "confidence": 0.8,
        "recommendation": "Consider reassuring the patient"
      },
      "medicalInsights": [
        "Key medical insight 1",
        "Key medical insight 2"
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const questionData = JSON.parse(response.text());

    // Update session with new questions
    session.questions.push({
      timestamp: new Date().toISOString(),
      transcript,
      generatedQuestions: questionData.questions,
      suggestedQuestion: questionData.suggestedQuestion,
      emotionAlert: questionData.emotionAlert
    });

    global.sessions.set(sessionId, session);

    res.status(200).json({
      questions: questionData.questions,
      suggestedQuestion: questionData.suggestedQuestion,
      emotionAlert: questionData.emotionAlert,
      emotionDetails: questionData.emotionDetails,
      medicalInsights: questionData.medicalInsights,
      sessionId
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      error: 'Question generation failed',
      details: error.message 
    });
  }
}