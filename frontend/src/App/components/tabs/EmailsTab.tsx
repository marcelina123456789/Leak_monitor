import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  Mail,
  Plus,
  CheckCircle2,
  XCircle,
  Trash2,
  Send,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Breach {
  id: number;
  source: string;
  leakedData: string;
  createdAt: string;
}

interface MonitoredEmail {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  incidents?: Breach[]; // Oznaczone jako opcjonalne dla bezpieczeństwa
}

export function EmailsTab() {
  const [emails, setEmails] = useState<MonitoredEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/emails/list', getAuthHeaders());
      setEmails(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleAddEmail = async () => {
    if (newEmail && !emails.find(e => e.email === newEmail)) {
      try {
        const response = await axios.post(
          'http://localhost:3000/emails/add', 
          { email: newEmail },
          getAuthHeaders()
        );
        
        if (response.data) {
          setEmails([...emails, response.data]);
        } else {
          fetchEmails();
        }
        setNewEmail('');
        setIsDialogOpen(false);
      } catch (error: any) {
        console.error("Błąd podczas dodawania adresu:", error);
        alert(error.response?.data?.message || "Błąd podczas dodawania adresu.");
      }
    }
  };

  const handleRemoveEmail = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz przestać monitorować ten adres?")) {
      try {
        await axios.delete(`http://localhost:3000/emails/${id}`, getAuthHeaders());
        setEmails(emails.filter(e => e.id !== id));
      } catch (error) {
        console.error("Błąd usuwania:", error);
        alert("Nie udało się usunąć adresu.");
      }
    }
  };

  // Bezpieczne obliczenia statystyk z gwarancją typów i wartości domyślnych
  const safeEmails = Array.isArray(emails) ? emails : [];
  const totalEmails = safeEmails.length;
  const verifiedEmails = safeEmails.filter(e => e?.isVerified).length;
  const totalBreaches = safeEmails.reduce((acc, email) => acc + (Array.isArray(email?.incidents) ? email.incidents.length : 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Email Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor your identities in real-time</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Email Address</DialogTitle>
              <DialogDescription>
                We will check this address against our leak database immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <Alert>
                <Send className="h-4 w-4" />
                <AlertDescription>
                  A verification link will be sent to confirm ownership.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddEmail}>Add & Scan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEmails}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{verifiedEmails}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalBreaches}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {safeEmails.map(email => {
          const incidentCount = Array.isArray(email?.incidents) ? email.incidents.length : 0;
          const hasBreaches = incidentCount > 0;

          return (
            <Card key={email.id} className="overflow-hidden transition-all hover:shadow-md bg-white dark:bg-slate-900">
              <Collapsible
                open={expandedEmail === email.id}
                onOpenChange={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedEmail === email.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <Mail className={hasBreaches ? 'text-red-500 w-5 h-5' : 'text-green-500 w-5 h-5'} />
                      
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{email.email}</p>
                        <Badge variant={email.isVerified ? "secondary" : "outline"} className="mt-1">
                          {email.isVerified ? <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" /> : <XCircle className="w-3 h-3 mr-1 text-amber-500" />}
                          {email.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-xl font-bold ${hasBreaches ? 'text-red-600' : 'text-green-600'}`}>
                          {incidentCount}
                        </div>
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Leaks</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveEmail(email.id)}>
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="pl-12 space-y-4">
                      {hasBreaches && email.incidents ? (
                        email.incidents.map((incident) => (
                          <div key={incident.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border-l-4 border-red-500">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{incident.source || 'Unknown Source'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Detected: {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : '---'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm py-2">
                          <CheckCircle2 className="w-4 h-4" /> No data leaks found for this address.
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </Card>
          );
        })}
        
        {safeEmails.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <p className="text-slate-400">No emails added yet. Start by adding your first address.</p>
          </div>
        )}
      </div>
    </div>
  );
}
