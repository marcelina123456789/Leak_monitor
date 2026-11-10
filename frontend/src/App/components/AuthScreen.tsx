import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ShieldAlert } from 'lucide-react';
import axios from 'axios';

// Poprawiony interfejs - przyjmuje obiekt użytkownika dopasowany do stanu w App.tsx
interface AuthScreenProps {
  onLogin: (user: { email: string; id: string }) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  // Rozdzielone stany dla formularza logowania
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Rozdzielone stany dla formularza rejestracji
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  // Stan do wyświetlania błędów z API
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Klasa Tailwind wymuszająca widoczność tekstu (ciemny tekst na białym tle inputu)
  const inputStyle = "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:bg-white focus:text-slate-900 focus-visible:text-slate-900 focus-visible:bg-white";

  // Obsługa logowania
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      // Zapisujemy token JWT do localStorage
      localStorage.setItem('token', response.data.access_token);
      
      // Przekazujemy pełny obiekt użytkownika z bazy danych (id oraz email) do stanu nadrzędnego
      if (response.data.user) {
        onLogin({
          email: response.data.user.email,
          id: String(response.data.user.id)
        });
      } else {
        // Fallback w razie braku usera w odpowiedzi
        onLogin({ email: loginEmail, id: '102' });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid login credentials');
    }
  };

  // Obsługa rejestracji
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (registerPassword !== registerConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:3000/auth/register', {
        email: registerEmail,
        password: registerPassword,
      });

      setMessage('Account created successfully! You can now log in.');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirm('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Leak Monitor</h1>
        </div>

        {/* Komunikaty o błędach i sukcesach */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm font-medium">
            {message}
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register to monitor your email addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email address</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      value={registerConfirm}
                      onChange={(e) => setRegisterConfirm(e.target.value)}
                      className={inputStyle}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
          Connected to secure backend system
        </p>
      </div>
    </div>
  );
}
