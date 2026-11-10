import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Search, Calendar, Database, AlertTriangle, X, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

// Interfejs odzwierciedlający strukturę danych wycieku z bazy/Elasticsearch
export interface Breach {
  id: number | string;
  name: string;
  description: string;
  breach_date: string;
  discovered_date: string;
  source: string;
  severity: number;
  data_types_exposed: string[];
}

export function BreachesTab() {
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedBreach, setSelectedBreach] = useState<Breach | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Pobieranie danych z prawdziwego backendu z autoryzacją JWT
  useEffect(() => {
    const fetchBreaches = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:3000/breaches', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Zabezpieczenie na wypadek, gdyby API nie zwróciło tablicy
        setBreaches(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Błąd podczas pobierania bazy wycieków:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreaches();
  }, []);

  // Filtrowanie pobranych z API danych na żywo po stronie klienta
  const filteredBreaches = breaches.filter(breach => {
    const matchesSearch = 
      (breach.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (breach.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' ||
      (severityFilter === 'high' && breach.severity >= 8) ||
      (severityFilter === 'medium' && breach.severity >= 5 && breach.severity < 8) ||
      (severityFilter === 'low' && breach.severity < 5);

    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity: number) => {
    if (severity >= 8) return <Badge variant="destructive">High</Badge>;
    if (severity >= 5) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Breach Database</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Browse all known security incidents</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search breaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Severity Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High (8-10)</SelectItem>
            <SelectItem value="medium">Medium (5-7)</SelectItem>
            <SelectItem value="low">Low (1-4)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Breach List */}
        <div className="space-y-3">
          {filteredBreaches.map(breach => (
            <Card
              key={breach.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md dark:hover:bg-slate-800',
                selectedBreach?.id === breach.id && 'ring-2 ring-red-500 dark:ring-red-400'
              )}
              onClick={() => setSelectedBreach(breach)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{breach.name}</CardTitle>
                  {getSeverityBadge(breach.severity)}
                </div>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="w-3 h-3" />
                  {breach.breach_date ? new Date(breach.breach_date).toLocaleDateString() : 'Unknown'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {breach.description}
                </p>
              </CardContent>
            </Card>
          ))}

          {filteredBreaches.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No breaches match your criteria</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Breach Details */}
        <div className="lg:sticky lg:top-6 h-fit">
          {selectedBreach ? (
            <Card className="dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                      <CardTitle className="text-2xl">{selectedBreach.name}</CardTitle>
                    </div>
                    <CardDescription>Detailed breach information</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBreach(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-white">Description</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedBreach.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-white">Breach Date</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                      {selectedBreach.breach_date ? new Date(selectedBreach.breach_date).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-white">Discovered</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                      {selectedBreach.discovered_date ? new Date(selectedBreach.discovered_date).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-white">Source</h4>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <Badge variant="outline">{selectedBreach.source}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-white">Exposed Data Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBreach.data_types_exposed?.map(type => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    )) || <span className="text-xs text-slate-400">None specified</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-slate-900 dark:text-white">Severity Level</h4>
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(selectedBreach.severity)}
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedBreach.severity}/10
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    Recommended Actions
                  </h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 ml-6 list-disc">
                    <li>Change passwords for accounts linked to this service</li>
                    <li>Enable two-factor authentication (2FA)</li>
                    <li>Review account activity for unauthorized access</li>
                    <li>Monitor for unusual activities on your accounts</li>
                    {selectedBreach.data_types_exposed?.includes('Credit Card') && (
                      <li className="text-red-600 dark:text-red-400 font-medium">
                        Contact your bank and consider blocking the card
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="dark:bg-slate-900">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Database className="w-16 h-16 text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Select a breach from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
