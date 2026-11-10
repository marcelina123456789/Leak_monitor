import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, User, Bell, Shield, Lock } from 'lucide-react';

interface SettingsTabProps {
  user: any;
}

export function SettingsTab({ user }: SettingsTabProps) {
  const [activeSection, setActiveSection] = useState('account');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: ''
  });

  // Wymuszenie czyszczenia stanów po załadowaniu sekcji, aby zablokować autofill przeglądarki
  useEffect(() => {
    const timer = setTimeout(() => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [activeSection]);

  const getEmailString = (u: any): string => {
    if (!u) return 'Wczytywanie...';
    if (typeof u === 'string') return u;

    if (u.email && typeof u.email === 'string') return u.email;
    if (u.user?.email && typeof u.user.email === 'string') return u.user.email;
    if (u.data?.email && typeof u.data.email === 'string') return u.data.email;
    if (u.data?.user?.email && typeof u.data.user.email === 'string') return u.data.user.email;
    
    for (const key in u) {
      if (typeof u[key] === 'string' && u[key].includes('@')) {
        return u[key];
      }
    }

    try {
      const jsonString = JSON.stringify(u);
      const emailMatch = jsonString.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) return emailMatch[0];
    } catch (e) {}

    return 'test@gmail.com';
  };

  const displayEmail = getEmailString(user);

  const sections = [
    { id: 'account', label: 'Account Information', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock },
  ];

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword) {
      alert("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Password updated successfully");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Update failed. Double check your current password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'account' && (
            <div className="space-y-6">
              <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={displayEmail} disabled className="bg-slate-50 dark:bg-slate-800 text-slate-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input 
                        type="password" 
                        name="old-pass-ignore"
                        autoComplete="new-password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                        className="bg-white text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input 
                        type="password" 
                        name="new-pass-ignore"
                        autoComplete="new-password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                        className="bg-white text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input 
                        type="password" 
                        name="confirm-pass-ignore"
                        autoComplete="new-password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        className="bg-white text-slate-900"
                      />
                    </div>

                    <Button type="button" onClick={handlePasswordUpdate} disabled={isUpdatingPassword}>
                      {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </div>
          )}
          
          {activeSection !== 'account' && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Lock className="w-12 h-12 mb-2 stroke-1" />
                <p className="text-sm">This section is currently under development.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
