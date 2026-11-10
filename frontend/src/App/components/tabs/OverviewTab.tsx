import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AlertTriangle,
  Mail,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import axios from 'axios';

interface Breach {
  id: number;
  name: string;
  source: string;
  breach_date: string;
  severity: number;
  description?: string;
}

interface Incident {
  id: number;
  email: string;
  breach: Breach;
}

interface OverviewTabProps {
  userEmail: string;
}

export function OverviewTab({ userEmail }: OverviewTabProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    axios.get('http://localhost:3000/incidents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      // Zabezpieczenie: Sprawdzamy czy odpowiedź to na pewno tablica
      if (Array.isArray(response.data)) {
        setIncidents(response.data);
      } else {
        setIncidents([]);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Błąd pobierania danych z API:", err);
      setIncidents([]);
      setIsLoading(false);
    });
  }, []);

  // Bezpieczne obliczenia oparte o tablicę
  const isDataValid = Array.isArray(incidents);
  const totalBreaches = isDataValid ? incidents.length : 0;
  
  // Unikalne maile dotknięte wyciekami
  const uniqueAffectedEmails = isDataValid 
    ? Array.from(new Set(incidents.map(i => i?.email).filter(Boolean)))
    : [];
  const affectedEmailsCount = uniqueAffectedEmails.length;

  // Bezpieczne sortowanie i pobieranie najnowszych incydentów z filtrowaniem uszkodzonych struktur
  const recentBreaches = isDataValid
    ? [...incidents]
        .filter(item => item?.breach?.breach_date) // Odrzucamy niekompletne wpisy
        .sort((a, b) => new Date(b.breach.breach_date).getTime() - new Date(a.breach.breach_date).getTime())
        .slice(0, 3)
    : [];

  // Dynamiczny Risk Score
  const riskScore = Math.min(100, totalBreaches * 20);
  const riskLevel = riskScore > 70 ? 'High' : riskScore > 35 ? 'Medium' : totalBreaches > 0 ? 'Low' : 'Safe';
  
  const riskColor = riskScore > 70 
    ? 'text-red-600 dark:text-red-500' 
    : riskScore > 35 
      ? 'text-orange-600 dark:text-orange-500' 
      : 'text-green-600 dark:text-green-500';

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-600 dark:text-slate-400">
        Loading security data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back!</h2>
        <p className="text-slate-600 dark:text-slate-400">Here's your email security summary</p>
      </div>

      {totalBreaches > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Breaches Found!</AlertTitle>
          <AlertDescription>
            Your email addresses were found in {totalBreaches} data breaches.
            Review the details and apply the recommended security steps.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Active Profile</CardTitle>
            <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate text-slate-900 dark:text-white">{userEmail || 'Unknown'}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Currently monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Detected Breaches</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{totalBreaches}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Across {affectedEmailsCount} tracked addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Risk Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</div>
            <Progress value={riskScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBreaches > 0 ? 'text-amber-500' : 'text-green-600'}`}>
              {totalBreaches > 0 ? 'Action Required' : 'Secured'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {totalBreaches > 0 ? 'Fix vulnerabilities' : 'No active threats'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recently Detected Breaches</CardTitle>
            <CardDescription>
              Latest security incidents affecting your addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBreaches.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">No breaches detected in the system</p>
            ) : (
              recentBreaches.map((item, index) => {
                if (!item?.breach) return null;
                return (
                  <div key={index} className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{item.breach.name}</p>
                        <Badge variant={item.breach.severity >= 8 ? 'destructive' : 'secondary'}>
                          Level {item.breach.severity}/10
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.email}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {item.breach.breach_date ? new Date(item.breach.breach_date).toLocaleDateString() : '---'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              Steps you should take to improve security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {totalBreaches > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-red-900 dark:text-red-400">Change Passwords</p>
                    <p className="text-xs text-red-700 dark:text-red-500 mt-1">
                      Change passwords for all compromised accounts
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-400">Enable 2FA</p>
                  <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                    Secure accounts with two-factor authentication
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-amber-900 dark:text-amber-400">Review Account Activity</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                    Check recent logins in your services
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
