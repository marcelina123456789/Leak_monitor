import { useState } from 'react';
import { Button } from './ui/button';
import {
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  Mail,
  Database,
  History,
  Settings as SettingsIcon,
  Moon,
  Sun
} from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { EmailsTab } from './tabs/EmailsTab';
import { BreachesTab } from './tabs/BreachesTab';
import { LoginHistoryTab } from './tabs/LoginHistoryTab';
import { SettingsTab } from './tabs/SettingsTab';
import { cn } from './ui/utils';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Dashboard({ user, onLogout, isDarkMode, toggleTheme }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'breaches', label: 'Breaches', icon: Database },
    { id: 'history', label: 'Login History', icon: History },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // GWARANCJA BEZPIECZEŃSTWA: Wyciągamy string z zagnieżdżonego obiektu
  let displayEmail = 'Unknown User';
  if (user) {
    if (typeof user.email === 'object' && user.email !== null) {
      displayEmail = user.email.email || 'No Email';
    } else if (typeof user.email === 'string') {
      displayEmail = user.email;
    } else if (user.user && typeof user.user.email === 'string') {
      displayEmail = user.user.email;
    }
  }

  return (
    // NAPRAWA: Główne tło korzysta teraz z systemowej zmiennej --background dopasowanej do v4
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Left Sidebar */}
      {/* NAPRAWA: Używamy zmiennych bg-sidebar oraz border-sidebar-border zdefiniowanych w theme.css */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-colors duration-300">
        
        {/* Logo/Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Leak Monitor</h1>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="outline"
            onClick={toggleTheme}
            className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      {/* NAPRAWA: Usunięcie konfliktowych klas bg-slate-50, nadanie czystego bg-background */}
      <main className="flex-1 overflow-auto bg-background transition-colors duration-300">
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab userEmail={displayEmail} />}
          {activeTab === 'emails' && <EmailsTab />}
          {activeTab === 'breaches' && <BreachesTab />}
          {activeTab === 'history' && <LoginHistoryTab />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </div>
      </main>
    </div>
  );
}
