export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (req.method === 'PUT') {
    try {
      const { context, medicalHistory = [] } = req.body;

      if (!global.sessions || !global.sessions.has(sessionId)) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = global.sessions.get(sessionId);
      session.context = context;
      session.medicalHistory = medicalHistory;

      global.sessions.set(sessionId, session);

      res.status(200).json({ 
        success: true, 
        message: 'Context updated successfully' 
      });

    } catch (error) {
      console.error('Error updating context:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      if (!global.sessions || !global.sessions.has(sessionId)) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = global.sessions.get(sessionId);
      
      res.status(200).json({
        sessionId,
        context: session.context,
        medicalHistory: session.medicalHistory || [],
        transcript: session.transcript,
        questions: session.questions || []
      });

    } catch (error) {
      console.error('Error fetching context:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}