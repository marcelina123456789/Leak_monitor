import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';

export default function App() {
  // Bezpieczna inicjalizacja stanu autoryzacji z localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('token') !== null;
    } catch {
      return false;
    }
  });
  
  // Bezpieczne parsowanie obiektu użytkownika z obsługą błędów string/JSON
  const [currentUser, setCurrentUser] = useState<{ email: string; id: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return null;
      
      if (savedUser.startsWith('{')) {
        return JSON.parse(savedUser);
      }
      
      return { email: savedUser, id: '1' };
    } catch (e) {
      console.error("Błąd parsowania użytkownika z localStorage:", e);
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sprawdzanie i ładowanie motywu graficznego
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Przyjmuje string email (tak jak wysyła AuthScreen) i tworzy pełny obiekt użytkownika
  const handleLogin = (email: string) => {
    const userData = { email: email, id: '1' }; 
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Czyszczenie sesji przy wylogowaniu
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className="w-full h-screen bg-slate-50 dark:bg-slate-950">
      {!isAuthenticated ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        currentUser && (
          <Dashboard
            user={currentUser}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        )
      )}
    </div>
  );
}
