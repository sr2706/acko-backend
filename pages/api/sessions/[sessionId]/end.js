export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!global.sessions || !global.sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = global.sessions.get(sessionId);
    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const totalDuration = Math.round((endTime - startTime) / 1000); // in seconds

    // Generate session summary
    const summary = {
      sessionId,
      doctorId: session.doctorId,
      patientName: session.patientName,
      startTime: session.startTime,
      endTime: endTime.toISOString(),
      totalDuration,
      totalQuestions: session.questions.length,
      transcriptLength: session.transcript.length,
      emotionAlerts: session.questions.filter(q => q.emotionAlert).length
    };

    // Mark session as ended
    session.status = 'ended';
    session.endTime = endTime.toISOString();
    global.sessions.set(sessionId, session);

    res.status(200).json({
      success: true,
      summary,
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}