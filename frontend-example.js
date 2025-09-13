// Frontend Integration Example for Medical Consultation System
// This file shows how to integrate with the API endpoints

class MedicalConsultationAPI {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  // Start a new consultation session
  async startSession(doctorId, patientName, sessionType = 'audio') {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          patientName,
          sessionType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  // Transcribe audio file
  async transcribeAudio(audioFile) {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch(`${this.baseURL}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  // Generate follow-up questions
  async generateQuestions(sessionId, transcript, context = '', questionType = 'open') {
    try {
      const response = await fetch(`${this.baseURL}/api/questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          transcript,
          context,
          questionType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  // Update session context
  async updateContext(sessionId, context, medicalHistory = []) {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions/${sessionId}/context`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          medicalHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating context:', error);
      throw error;
    }
  }

  // Get session context
  async getContext(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions/${sessionId}/context`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting context:', error);
      throw error;
    }
  }

  // End session
  async endSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions/${sessionId}/end`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }
}

// React Component Example
const MedicalConsultationComponent = () => {
  const [api] = useState(() => new MedicalConsultationAPI());
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Start a new consultation session
  const handleStartSession = async () => {
    try {
      const result = await api.startSession('doc123', 'Patient Name', 'audio');
      setSessionId(result.sessionId);
      console.log('Session started:', result);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await handleTranscription(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Handle audio transcription
  const handleTranscription = async (audioFile) => {
    try {
      const result = await api.transcribeAudio(audioFile);
      setTranscript(result.transcript);
      console.log('Transcription result:', result);

      // Generate questions based on transcription
      if (sessionId) {
        await generateQuestions(result.transcript);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  // Generate follow-up questions
  const generateQuestions = async (transcriptText) => {
    try {
      const result = await api.generateQuestions(sessionId, transcriptText);
      setQuestions(result.questions);
      console.log('Generated questions:', result);

      // Show emotion alert if needed
      if (result.emotionAlert) {
        alert(`Patient emotion detected: ${result.emotionDetails.detected}`);
      }
    } catch (error) {
      console.error('Question generation failed:', error);
    }
  };

  // End session
  const handleEndSession = async () => {
    try {
      const result = await api.endSession(sessionId);
      console.log('Session ended:', result);
      setSessionId(null);
      setTranscript('');
      setQuestions([]);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return (
    <div className="medical-consultation">
      <h2>Medical Consultation System</h2>
      
      {!sessionId ? (
        <button onClick={handleStartSession}>
          Start New Session
        </button>
      ) : (
        <div>
          <h3>Session Active</h3>
          <p>Session ID: {sessionId}</p>
          
          <div className="recording-controls">
            {!isRecording ? (
              <button onClick={startRecording}>
                Start Recording
              </button>
            ) : (
              <button onClick={stopRecording}>
                Stop Recording
              </button>
            )}
          </div>

          {transcript && (
            <div className="transcript">
              <h4>Transcription:</h4>
              <p>{transcript}</p>
            </div>
          )}

          {questions.length > 0 && (
            <div className="questions">
              <h4>Suggested Questions:</h4>
              <ul>
                {questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleEndSession}>
            End Session
          </button>
        </div>
      )}
    </div>
  );
};

// Usage example
const App = () => {
  return (
    <div>
      <MedicalConsultationComponent />
    </div>
  );
};

export default App;