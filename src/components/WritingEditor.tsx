import { useState, useRef, useEffect } from 'react';
import { Session, KeystrokeData, PasteEvent } from '../types/session';
import { calculateAnalytics } from '../utils/analytics';

interface WritingEditorProps {
  userId: string;
  email: string;
  onLogout: () => void;
  onViewSessions: () => void;
}

const WritingEditor = ({ userId, email, onLogout, onViewSessions }: WritingEditorProps) => {
  const [text, setText] = useState('');
  const [sessionData, setSessionData] = useState<Session>({
    sessionId: generateSessionId(),
    userId: userId,
    keystrokeData: [],
    pasteEvents: [],
    textContent: '',
    analytics: {
      wpm: 0,
      pauseCount: 0,
      avgPauseTime: 0,
      authenticityFlag: 'Human'
    }
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const lastKeyTimeRef = useRef<number>(0);
  const keyDownTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());

  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
      return;
    }
    keyDownTimeRef.current = Date.now();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
      return;
    }

    const keyUpTime = Date.now();
    const keyDownTime = keyDownTimeRef.current;
    const interval = lastKeyTimeRef.current ? keyUpTime - lastKeyTimeRef.current : 0;

    const keystroke: KeystrokeData = {
      keyDownTime,
      keyUpTime,
      interval
    };

    setSessionData(prev => ({
      ...prev,
      keystrokeData: [...prev.keystrokeData, keystroke]
    }));

    lastKeyTimeRef.current = keyUpTime;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    const pasteEvent: PasteEvent = {
      timestamp: Date.now(),
      length: pastedText.length
    };

    setSessionData(prev => ({
      ...prev,
      pasteEvents: [...prev.pasteEvents, pasteEvent]
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const saveSession = async () => {
    setSaveStatus('saving');
    try {
      const dataToSave = {
        ...sessionData,
        textContent: text
      };

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });

      await response.json();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
      setSaveStatus('idle');
    }
  };

  // Update analytics in real-time
  useEffect(() => {
    const analytics = calculateAnalytics(
      text.length,
      sessionData.keystrokeData,
      sessionData.pasteEvents,
      sessionStartTimeRef.current
    );

    setSessionData(prev => ({
      ...prev,
      textContent: text,
      analytics
    }));
  }, [text, sessionData.keystrokeData.length, sessionData.pasteEvents.length]);

  return (
    <div className="fade-in" style={{ 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '25px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Vi-Notes Editor
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onViewSessions}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📚 My Sessions
            </button>
            <span style={{ 
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              {email}
            </span>
            <button
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6268';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {sessionData.keystrokeData.length}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
              Keystrokes
            </div>
          </div>
          
          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {sessionData.pasteEvents.length}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
              Pastes
            </div>
          </div>
          
          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {text.length}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
              Characters
            </div>
          </div>

          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {sessionData.analytics?.wpm || 0}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
              WPM
            </div>
          </div>

          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            borderRadius: '12px',
            color: '#333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {sessionData.analytics?.pauseCount || 0}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Pauses
            </div>
          </div>

          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            borderRadius: '12px',
            color: '#333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {sessionData.analytics?.avgPauseTime 
                ? `${(sessionData.analytics.avgPauseTime / 1000).toFixed(1)}s`
                : '0s'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Avg Pause
            </div>
          </div>
        </div>

        {/* Authenticity Status */}
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          borderRadius: '12px',
          background: sessionData.analytics?.authenticityFlag === 'Human'
            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            : sessionData.analytics?.authenticityFlag === 'Suspicious'
            ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
            : 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
          color: 'white',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          {sessionData.analytics?.authenticityFlag === 'Human' && '✓ '}
          {sessionData.analytics?.authenticityFlag === 'Suspicious' && '⚠ '}
          {sessionData.analytics?.authenticityFlag === 'Possibly AI' && '🤖 '}
          {sessionData.analytics?.authenticityFlag === 'Unnatural typing' && '⚡ '}
          Authenticity: {sessionData.analytics?.authenticityFlag || 'Human'}
        </div>

        {/* Editor */}
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onPaste={handlePaste}
          placeholder="Start writing your authentic content here..."
          style={{
            width: '100%',
            minHeight: '450px',
            padding: '20px',
            fontSize: '17px',
            lineHeight: '1.8',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            fontFamily: 'Georgia, serif',
            resize: 'vertical',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: '#fafafa'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.backgroundColor = '#fff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.backgroundColor = '#fafafa';
          }}
        />

        {/* Save Button */}
        <button
          onClick={saveSession}
          disabled={saveStatus === 'saving'}
          style={{
            marginTop: '20px',
            padding: '14px 30px',
            fontSize: '16px',
            fontWeight: '600',
            background: saveStatus === 'saved' 
              ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
              : saveStatus === 'saving'
              ? '#ccc'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            if (saveStatus === 'idle') {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (saveStatus === 'idle') {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          {saveStatus === 'saving' ? '💾 Saving...' : saveStatus === 'saved' ? '✓ Saved!' : '💾 Save Session'}
        </button>

        {/* Session ID */}
        <div style={{ 
          marginTop: '15px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          Session ID: {sessionData.sessionId}
        </div>
      </div>
    </div>
  );
};

export default WritingEditor;
