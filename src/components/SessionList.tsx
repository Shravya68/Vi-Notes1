import { useState, useEffect } from 'react';
import { Session } from '../types/session';

interface SessionListProps {
  userId: string;
  onBack: () => void;
}

const SessionList = ({ userId, onBack }: SessionListProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchUserSessions();
  }, [userId]);

  const fetchUserSessions = async () => {
    try {
      const response = await fetch(`/api/session/user/${userId}`);
      const data = await response.json();
      setSessions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  if (selectedSession) {
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
          <button
            onClick={() => setSelectedSession(null)}
            style={{
              padding: '10px 20px',
              marginBottom: '25px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a6268';
              e.currentTarget.style.transform = 'translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ← Back to List
          </button>

          <h2 style={{ 
            fontSize: '24px',
            marginBottom: '20px',
            color: '#333'
          }}>
            Session Details
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Created</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {new Date(selectedSession.createdAt!).toLocaleString()}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Keystrokes</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {selectedSession.keystrokeData.length}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Paste Events</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {selectedSession.pasteEvents.length}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Characters</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {selectedSession.textContent.length}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>WPM</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {selectedSession.analytics?.wpm || 0}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '12px',
              color: '#333'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>Pauses</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {selectedSession.analytics?.pauseCount || 0}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '12px',
              color: '#333'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>Avg Pause</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {selectedSession.analytics?.avgPauseTime 
                  ? `${(selectedSession.analytics.avgPauseTime / 1000).toFixed(1)}s`
                  : '0s'}
              </div>
            </div>
          </div>

          {/* Authenticity Badge */}
          <div style={{
            padding: '15px 20px',
            marginBottom: '25px',
            borderRadius: '12px',
            background: selectedSession.analytics?.authenticityFlag === 'Human'
              ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
              : selectedSession.analytics?.authenticityFlag === 'Suspicious'
              ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
              : 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            Authenticity: {selectedSession.analytics?.authenticityFlag || 'Human'}
          </div>

          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>Content</h3>
          <div style={{
            padding: '25px',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            minHeight: '300px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Georgia, serif',
            fontSize: '17px',
            lineHeight: '1.8',
            color: '#333'
          }}>
            {selectedSession.textContent}
          </div>
        </div>
      </div>
    );
  }

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
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            marginBottom: '25px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a6268';
            e.currentTarget.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ← Back to Editor
        </button>

        <h2 style={{ 
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '25px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          My Writing Sessions
        </h2>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            <div style={{ 
              fontSize: '40px',
              marginBottom: '10px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              📝
            </div>
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>✍️</div>
            <p style={{ fontSize: '16px' }}>
              No sessions found. Start writing to create your first session!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {sessions.map((session, index) => (
              <div
                key={session.sessionId}
                className="slide-in"
                style={{
                  padding: '20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s ease',
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={() => setSelectedSession(session)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px' 
                }}>
                  <strong style={{ fontSize: '16px', color: '#333' }}>
                    📅 {new Date(session.createdAt!).toLocaleDateString()} at {new Date(session.createdAt!).toLocaleTimeString()}
                  </strong>
                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#666' }}>
                  <span>⌨️ {session.keystrokeData.length}</span>
                  <span>📋 {session.pasteEvents.length}</span>
                  <span>⚡ {session.analytics?.wpm || 0} WPM</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: session.analytics?.authenticityFlag === 'Human' 
                      ? '#d4edda' 
                      : session.analytics?.authenticityFlag === 'Suspicious'
                      ? '#f8d7da'
                      : '#fff3cd',
                    color: session.analytics?.authenticityFlag === 'Human'
                      ? '#155724'
                      : session.analytics?.authenticityFlag === 'Suspicious'
                      ? '#721c24'
                      : '#856404'
                  }}>
                    {session.analytics?.authenticityFlag || 'Human'}
                  </span>
                </div>
                </div>
                <p style={{ 
                  color: '#666', 
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '15px'
                }}>
                  {session.textContent.substring(0, 120)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionList;
