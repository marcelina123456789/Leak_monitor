import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';

// Definicja typu zgodna z backendem
export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  status: 'otwarty' | 'w trakcie' | 'rozwiązany';
  created_at: string;
  resolved_at: string | null;
}

export function IncidentsTab() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: ''
  });

  const API_URL = 'http://localhost:3000/incidents';
  const token = localStorage.getItem('token');

  // 1. Pobieranie incydentów z bazy
  const fetchIncidents = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(response.data);
    } catch (error) {
      console.error("Błąd pobierania incydentów:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // 2. Wysyłanie nowego incydentu do backendu
  const handleSubmitIncident = async () => {
    if (newIncident.title && newIncident.description) {
      try {
        const response = await axios.post(API_URL, newIncident, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Dodajemy nowe zgłoszenie na górę listy
        setIncidents([response.data, ...incidents]);
        setNewIncident({ title: '', description: '' });
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Błąd zapisywania incydentu:", error);
      }
    }
  };

  // 3. Aktualizacja statusu w bazie danych
  const handleUpdateStatus = async (id: string, status: IncidentReport['status']) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIncidents(incidents.map(incident =>
        incident.id === id ? response.data : incident
      ));
    } catch (error) {
      console.error("Błąd aktualizacji statusu:", error);
    }
  };

  const getStatusBadge = (status: IncidentReport['status']) => {
    switch (status) {
      case 'otwarty':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Otwarty
          </Badge>
        );
      case 'w trakcie':
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3" />
            W trakcie
          </Badge>
        );
      case 'rozwiązany':
        return (
          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3" />
            Rozwiązany
          </Badge>
        );
    }
  };

  const openIncidents = incidents.filter(i => i.status === 'otwarty').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'w trakcie').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'rozwiązany').length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Zgłoszenia incydentów</h2>
          <p className="text-slate-600 mt-1">Zgłaszaj i śledź problemy bezpieczeństwa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nowe zgłoszenie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Zgłoś incydent bezpieczeństwa</DialogTitle>
              <DialogDescription>
                Opisz problem lub podejrzaną aktywność związaną z Twoim kontem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="incident-title">Tytuł zgłoszenia</Label>
                <Input
                  id="incident-title"
                  placeholder="np. Podejrzane logowanie z Chin"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident-description">Szczegółowy opis</Label>
                <Textarea
                  id="incident-description"
                  placeholder="Opisz dokładnie co się stało..."
                  rows={6}
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
                <Button onClick={handleSubmitIncident} disabled={!newIncident.title}>Wyślij zgłoszenie</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Otwarte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{openIncidents}</div>
            <p className="text-xs text-slate-600 mt-1">Wymagają uwagi</p>
          </CardContent>
        </Card>
        {/* ... Pozostałe karty statystyk analogicznie ... */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">W trakcie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{inProgressIncidents}</div>
            <p className="text-xs text-slate-600 mt-1">W rozwiązzywaniu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rozwiązane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{resolvedIncidents}</div>
            <p className="text-xs text-slate-600 mt-1">Zamknięte pomyślnie</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-600">Brak zgłoszeń</p>
            </CardContent>
          </Card>
        ) : (
          incidents.map((incident) => (
            <Card key={incident.id} className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      {getStatusBadge(incident.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3" />
                      ID: #{incident.id.slice(0,8)} | Zgłoszono: {new Date(incident.created_at).toLocaleString('pl-PL')}
                    </CardDescription>
                  </div>
                  <Select
                    value={incident.status}
                    onValueChange={(value) => handleUpdateStatus(incident.id, value as IncidentReport['status'])}
                  >
                    <SelectTrigger className="w-[150px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otwarty">Otwarty</SelectItem>
                      <SelectItem value="w trakcie">W trakcie</SelectItem>
                      <SelectItem value="rozwiązany">Rozwiązany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {incident.description}
                </p>
                {incident.status === 'rozwiązany' && incident.resolved_at && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-800 font-medium">
                      Rozwiązano: {new Date(incident.resolved_at).toLocaleString('pl-PL')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
  );
}
