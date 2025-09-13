import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { doctorId, patientName, sessionType = 'audio' } = req.body;

    if (!doctorId || !patientName) {
      return res.status(400).json({ 
        error: 'Missing required fields: doctorId and patientName' 
      });
    }

    const sessionId = uuidv4();
    const session = {
      sessionId,
      doctorId,
      patientName,
      sessionType,
      status: 'active',
      startTime: new Date().toISOString(),
      transcript: '',
      context: '',
      questions: []
    };

    // Store session in memory (in production, use database)
    if (!global.sessions) {
      global.sessions = new Map();
    }
    global.sessions.set(sessionId, session);

    res.status(201).json({
      sessionId,
      status: 'active',
      message: 'Session started successfully'
    });

  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}