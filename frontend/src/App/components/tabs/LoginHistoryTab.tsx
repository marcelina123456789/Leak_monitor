import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface LoginLog {
  id: number;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  loginTime: string;
}

export function LoginHistoryTab() {
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:3000/auth/login-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(response.data)) {
          setLoginHistory(response.data);
        } else {
          setLoginHistory([]);
        }
        setError(null);
      } catch (err) {
        console.error("Błąd pobierania historii logowania:", err);
        setError("Could not load login history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const failedLogins = Array.isArray(loginHistory) 
    ? loginHistory.filter(login => login && !login.success) 
    : [];

  const suspiciousIPs = new Set(
    Array.isArray(loginHistory)
      ? loginHistory
          .filter(login => login?.ipAddress && !login.ipAddress.startsWith('192.168') && !login.ipAddress.startsWith('127.0') && !login.ipAddress.startsWith('::'))
          .map(login => login.ipAddress)
      : []
  );

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return { os: 'Unknown', icon: '❓' };
    if (userAgent.includes('Windows')) return { os: 'Windows', icon: '🖥' };
    if (userAgent.includes('Mac OS X')) return { os: 'macOS', icon: '🍎' };
    if (userAgent.includes('Linux')) return { os: 'Linux', icon: '🐧' };
    if (userAgent.includes('iPhone')) return { os: 'iOS', icon: '📱' };
    if (userAgent.includes('Android')) return { os: 'Android', icon: '📱' };
    return { os: 'Unknown', icon: '❓' };
  };

  const getBrowser = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getIPLocation = (ip: string) => {
    if (!ip) return { city: 'Unknown', country: 'Unknown', flag: '🌍' };
    
    const cleanIP = ip.replace(/^::ffff:/, '');

    if (cleanIP === '127.0.0.1' || cleanIP === '::1' || cleanIP === 'localhost') {
      return { city: 'Localhost', country: 'Internal', flag: '💻' };
    }
    
    if (cleanIP.startsWith('192.168') || cleanIP.startsWith('10.') || cleanIP.startsWith('172.')) {
      return { city: 'Local Network', country: 'LAN', flag: '🏠' };
    }

    return { city: 'Remote Access', country: 'External', flag: '🌐' };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading security logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Login History</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor your account activity and security logs</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Total Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{loginHistory.length}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Recorded sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Failed Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{failedLogins.length}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {failedLogins.length > 0 ? 'Potential unauthorized access' : 'Security optimal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 dark:text-slate-400">Suspicious IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{suspiciousIPs.size}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {suspiciousIPs.size > 0 ? 'Unique remote addresses' : 'Only known networks'}
            </p>
          </CardContent>
        </Card>
      </div>

      {failedLogins.length > 3 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Warning</AlertTitle>
          <AlertDescription>
            Multiple failed login attempts detected. We recommend changing your password.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Logs are stored for 30 days for security auditing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Browser</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                      No login records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  loginHistory.map((login) => {
                    if (!login) return null;
                    const device = getDeviceInfo(login.userAgent);
                    const browser = getBrowser(login.userAgent);
                    const location = getIPLocation(login.ipAddress);

                    return (
                      <TableRow key={login.id}>
                        <TableCell>
                          {login.success ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 border-none">
                              <CheckCircle2 className="w-3 h-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div className="text-xs">
                              <div className="font-medium text-slate-900 dark:text-white">
                                {login.loginTime ? new Date(login.loginTime).toLocaleDateString() : '---'}
                              </div>
                              <div className="text-slate-500">
                                {login.loginTime ? new Date(login.loginTime).toLocaleTimeString() : '---'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {login.ipAddress || '---'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{location.flag}</span>
                            <span className="text-xs">{location.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs">
                            <span>{device.icon}</span>
                            <span>{device.os}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                          {browser}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
