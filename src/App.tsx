import { useState } from 'react';
import WritingEditor from './components/WritingEditor';
import Auth from './components/Auth';
import SessionList from './components/SessionList';

function App() {
  const [user, setUser] = useState<{ userId: string; email: string } | null>(null);
  const [view, setView] = useState<'editor' | 'sessions'>('editor');

  const handleLogin = (userId: string, email: string) => {
    setUser({ userId, email });
  };

  const handleLogout = () => {
    setUser(null);
    setView('editor');
  };

  return (
    <div className="App">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : view === 'editor' ? (
        <WritingEditor 
          userId={user.userId} 
          email={user.email} 
          onLogout={handleLogout}
          onViewSessions={() => setView('sessions')}
        />
      ) : (
        <SessionList 
          userId={user.userId} 
          onBack={() => setView('editor')} 
        />
      )}
    </div>
  );
}

export default App;
