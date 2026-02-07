import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Building2, Users, UserCog, MapPin, X, Search, ChevronDown, DollarSign, TrendingUp, Wallet, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortField = 'name' | 'office' | 'adm' | 'clients' | 'fitScore' | 'feeWeightedFit' | 'valeoYears' | 'industryYears' | 'serviceIncome' | 'originationIncome' | 'totalIncome';
type SortDirection = 'asc' | 'desc';

// Mock data - in production this would come from Supabase
// IDs match SEED_ADVISORS format (advisor-1 through advisor-10)
const mockAdvisors = [
  { id: 'advisor-1', name: 'Sarah Mitchell', office: 'Chicago', team: 'Wealth Management', adm: 'Michael Torres', segment: 'Private Client', clients: 42, fitScore: 92, feeWeightedFit: 94, valeoYears: 8, industryYears: 15, serviceIncome: 485000, originationIncome: 125000, clientNetWorth: 168000000 },
  { id: 'advisor-2', name: 'James Chen', office: 'Denver', team: 'Private Client', adm: 'Jennifer Adams', segment: 'Ultra HNW', clients: 28, fitScore: 88, feeWeightedFit: 91, valeoYears: 5, industryYears: 12, serviceIncome: 720000, originationIncome: 180000, clientNetWorth: 420000000 },
  { id: 'advisor-3', name: 'Maria Rodriguez', office: 'Indianapolis', team: 'Family Office', adm: 'Michael Torres', segment: 'Traditional', clients: 55, fitScore: 85, feeWeightedFit: 83, valeoYears: 12, industryYears: 18, serviceIncome: 380000, originationIncome: 45000, clientNetWorth: 82500000 },
  { id: 'advisor-4', name: 'David Thompson', office: 'Richmond', team: 'Wealth Management', adm: 'Robert Chen', segment: 'Private Client', clients: 38, fitScore: 91, feeWeightedFit: 89, valeoYears: 6, industryYears: 10, serviceIncome: 425000, originationIncome: 95000, clientNetWorth: 152000000 },
  { id: 'advisor-5', name: 'Emily Johnson', office: 'Remote', team: 'Private Client', adm: 'Jennifer Adams', segment: 'Ultra HNW', clients: 31, fitScore: 94, feeWeightedFit: 96, valeoYears: 9, industryYears: 14, serviceIncome: 890000, originationIncome: 210000, clientNetWorth: 558000000 },
  { id: 'advisor-6', name: 'Michael Wong', office: 'Chicago', team: 'Family Office', adm: 'Michael Torres', segment: 'Traditional', clients: 48, fitScore: 79, feeWeightedFit: 77, valeoYears: 3, industryYears: 8, serviceIncome: 295000, originationIncome: 35000, clientNetWorth: 72000000 },
  { id: 'advisor-7', name: 'Rachel Kim', office: 'Denver', team: 'Wealth Management', adm: 'Robert Chen', segment: 'Private Client', clients: 35, fitScore: 87, feeWeightedFit: 90, valeoYears: 7, industryYears: 11, serviceIncome: 510000, originationIncome: 140000, clientNetWorth: 175000000 },
  { id: 'advisor-8', name: 'Alex Martinez', office: 'Indianapolis', team: 'Private Client', adm: 'Jennifer Adams', segment: 'Traditional', clients: 52, fitScore: 82, feeWeightedFit: 80, valeoYears: 10, industryYears: 20, serviceIncome: 345000, originationIncome: 55000, clientNetWorth: 91000000 },
  { id: 'advisor-9', name: 'Jennifer Lee', office: 'Richmond', team: 'Wealth Management', adm: 'Michael Torres', segment: 'Ultra HNW', clients: 25, fitScore: 96, feeWeightedFit: 97, valeoYears: 4, industryYears: 9, serviceIncome: 650000, originationIncome: 175000, clientNetWorth: 375000000 },
  { id: 'advisor-10', name: 'Robert Taylor', office: 'Remote', team: 'Family Office', adm: 'Robert Chen', segment: 'Private Client', clients: 44, fitScore: 84, feeWeightedFit: 86, valeoYears: 11, industryYears: 16, serviceIncome: 475000, originationIncome: 110000, clientNetWorth: 198000000 },
];

const offices = ['Chicago', 'Denver', 'Indianapolis', 'Richmond', 'Remote'];
const teams = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const adms = ['Michael Torres', 'Jennifer Adams', 'Robert Chen'];

interface MultiSelectDropdownProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  onClear: () => void;
  counts: Record<string, number>;
  labelPrefix?: string;
}

function MultiSelectDropdown({ 
  title, 
  icon, 
  items, 
  selectedItems, 
  onToggle, 
  onClear,
  counts,
  labelPrefix = ''
}: MultiSelectDropdownProps) {
  const hasSelection = selectedItems.length > 0;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between h-auto min-h-[2.5rem] py-2',
            hasSelection && 'border-primary'
          )}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
            {hasSelection && (
              <Badge variant="secondary" className="ml-1">
                {selectedItems.length}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-popover z-50" align="start">
        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{title}</span>
            {hasSelection && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onClear}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {items.map((item) => {
            const isSelected = selectedItems.includes(item);
            const count = counts[item] || 0;
            return (
              <div
                key={item}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent',
                  isSelected && 'bg-accent'
                )}
                onClick={() => onToggle(item)}
              >
                <Checkbox
                  checked={isSelected}
                  className="pointer-events-none"
                />
                <span className="flex-1 text-sm">
                  {labelPrefix}{item}
                </span>
                <Badge variant="outline" className="h-5 min-w-5 px-1.5 text-xs">
                  {count}
                </Badge>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function FirmDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedAdms, setSelectedAdms] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFilter = (
    item: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedOffices([]);
    setSelectedTeams([]);
    setSelectedAdms([]);
    setSearchQuery('');
  };

  const hasAnyFilter = selectedOffices.length > 0 || selectedTeams.length > 0 || selectedAdms.length > 0 || searchQuery.length > 0;

  // Filter and sort advisors based on selections
  const filteredAdvisors = useMemo(() => {
    const filtered = mockAdvisors.filter((advisor) => {
      const matchesSearch = searchQuery === '' || 
        advisor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOffice = selectedOffices.length === 0 || selectedOffices.includes(advisor.office);
      const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(advisor.team);
      const matchesAdm = selectedAdms.length === 0 || selectedAdms.includes(advisor.adm);
      return matchesSearch && matchesOffice && matchesTeam && matchesAdm;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'totalIncome') {
        aValue = a.serviceIncome + a.originationIncome;
        bValue = b.serviceIncome + b.originationIncome;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }, [searchQuery, selectedOffices, selectedTeams, selectedAdms, sortField, sortDirection]);

  const SortHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
        sortField === field && 'text-foreground font-medium',
        className
      )}
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );

  // Calculate counts for filter badges (based on current filters)
  const officeCounts = useMemo(() => {
    const baseFiltered = mockAdvisors.filter((a) => {
      const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(a.team);
      const matchesAdm = selectedAdms.length === 0 || selectedAdms.includes(a.adm);
      return matchesTeam && matchesAdm;
    });
    return offices.reduce((acc, office) => {
      acc[office] = baseFiltered.filter((a) => a.office === office).length;
      return acc;
    }, {} as Record<string, number>);
  }, [selectedTeams, selectedAdms]);

  const teamCounts = useMemo(() => {
    const baseFiltered = mockAdvisors.filter((a) => {
      const matchesOffice = selectedOffices.length === 0 || selectedOffices.includes(a.office);
      const matchesAdm = selectedAdms.length === 0 || selectedAdms.includes(a.adm);
      return matchesOffice && matchesAdm;
    });
    return teams.reduce((acc, team) => {
      acc[team] = baseFiltered.filter((a) => a.team === team).length;
      return acc;
    }, {} as Record<string, number>);
  }, [selectedOffices, selectedAdms]);

  const admCounts = useMemo(() => {
    const baseFiltered = mockAdvisors.filter((a) => {
      const matchesOffice = selectedOffices.length === 0 || selectedOffices.includes(a.office);
      const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(a.team);
      return matchesOffice && matchesTeam;
    });
    return adms.reduce((acc, adm) => {
      acc[adm] = baseFiltered.filter((a) => a.adm === adm).length;
      return acc;
    }, {} as Record<string, number>);
  }, [selectedOffices, selectedTeams]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 90) return 'text-destructive';
    if (capacity >= 75) return 'text-warning';
    return 'text-success';
  };

  const getFitColor = (fit: number) => {
    if (fit >= 90) return 'text-success';
    if (fit >= 80) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Firm Dashboard</h1>
              <p className="text-muted-foreground">
                Filter and explore advisors across the firm
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Advisors</p>
                <p className="text-2xl font-bold">{mockAdvisors.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Showing</p>
                <p className="text-2xl font-bold">{filteredAdvisors.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Insights Cards */}
        {(() => {
          const totalClients = filteredAdvisors.reduce((sum, a) => sum + a.clients, 0);
          const totalFees = filteredAdvisors.reduce((sum, a) => sum + a.serviceIncome + a.originationIncome, 0);
          const avgFeePerClient = totalClients > 0 ? totalFees / totalClients : 0;
          const totalNetWorth = filteredAdvisors.reduce((sum, a) => sum + a.clientNetWorth, 0);
          const avgNetWorthPerClient = totalClients > 0 ? totalNetWorth / totalClients : 0;
          
          const formatCurrency = (value: number) => {
            if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
            return `$${value.toFixed(0)}`;
          };

          return (
            <div className="grid gap-4 md:grid-cols-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-primary/10">
                      <UserCog className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Advisors</p>
                      <p className="text-2xl font-bold">{filteredAdvisors.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clients</p>
                      <p className="text-2xl font-bold">{totalClients.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-success/10">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Fees</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalFees)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-warning/10">
                      <TrendingUp className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Fee/Client</p>
                      <p className="text-2xl font-bold">{formatCurrency(avgFeePerClient)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Net Worth</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalNetWorth)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-success/10">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg NW/Client</p>
                      <p className="text-2xl font-bold">{formatCurrency(avgNetWorthPerClient)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48">
            <MultiSelectDropdown
              title="Locations"
              icon={<MapPin className="h-4 w-4" />}
              items={offices}
              selectedItems={selectedOffices}
              onToggle={(item) => toggleFilter(item, selectedOffices, setSelectedOffices)}
              onClear={() => setSelectedOffices([])}
              counts={officeCounts}
            />
          </div>
          <div className="w-48">
            <MultiSelectDropdown
              title="Teams"
              icon={<Users className="h-4 w-4" />}
              items={teams}
              selectedItems={selectedTeams}
              onToggle={(item) => toggleFilter(item, selectedTeams, setSelectedTeams)}
              onClear={() => setSelectedTeams([])}
              counts={teamCounts}
              labelPrefix="Team "
            />
          </div>
          <div className="w-56">
            <MultiSelectDropdown
              title="ADMs"
              icon={<UserCog className="h-4 w-4" />}
              items={adms}
              selectedItems={selectedAdms}
              onToggle={(item) => toggleFilter(item, selectedAdms, setSelectedAdms)}
              onClear={() => setSelectedAdms([])}
              counts={admCounts}
            />
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search advisors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasAnyFilter && (
            <Button variant="ghost" onClick={clearAllFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasAnyFilter && (
          <div className="flex flex-wrap gap-2">
            {selectedOffices.map((office) => (
              <Badge key={office} variant="secondary" className="gap-1 pr-1">
                <MapPin className="h-3 w-3" />
                {office}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => toggleFilter(office, selectedOffices, setSelectedOffices)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {selectedTeams.map((team) => (
              <Badge key={team} variant="secondary" className="gap-1 pr-1">
                <Users className="h-3 w-3" />
                Team {team}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => toggleFilter(team, selectedTeams, setSelectedTeams)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {selectedAdms.map((adm) => (
              <Badge key={adm} variant="secondary" className="gap-1 pr-1">
                <UserCog className="h-3 w-3" />
                {adm}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => toggleFilter(adm, selectedAdms, setSelectedAdms)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Advisors List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Advisors
              <Badge variant="outline" className="ml-2">
                {filteredAdvisors.length} of {mockAdvisors.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAdvisors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No advisors match your current filters</p>
                <Button variant="link" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Column Headers */}
                <div className="hidden md:flex items-center gap-4 px-4 py-2 border-b">
                  <div className="w-10" /> {/* Avatar space */}
                  <div className="flex-1 min-w-0">
                    <SortHeader field="name">Name</SortHeader>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="min-w-[100px]">
                      <SortHeader field="office">Location</SortHeader>
                    </div>
                    <div className="min-w-[120px]">
                      <SortHeader field="adm">ADM</SortHeader>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <SortHeader field="clients" className="justify-end">Clients</SortHeader>
                    </div>
                    <div className="text-right min-w-[50px]">
                      <SortHeader field="fitScore" className="justify-end">Fit %</SortHeader>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <SortHeader field="feeWeightedFit" className="justify-end">Fee Wtd</SortHeader>
                    </div>
                    <div className="text-right min-w-[50px]">
                      <SortHeader field="valeoYears" className="justify-end">Valeo</SortHeader>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <SortHeader field="industryYears" className="justify-end">Industry</SortHeader>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <SortHeader field="serviceIncome" className="justify-end">Service</SortHeader>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <SortHeader field="originationIncome" className="justify-end">Origination</SortHeader>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <SortHeader field="totalIncome" className="justify-end">Total</SortHeader>
                    </div>
                  </div>
                </div>

                {/* Advisor Rows */}
                {filteredAdvisors.map((advisor) => (
                  <Link
                    key={advisor.id}
                    to={`/advisor-dashboard/${advisor.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(advisor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{advisor.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{advisor.segment}</span>
                        <span>•</span>
                        <span>Team {advisor.team}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 min-w-[100px]">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{advisor.office}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-[120px]">
                        <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{advisor.adm}</span>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-medium">{advisor.clients}</p>
                      </div>
                      <div className="text-right min-w-[50px]">
                        <p className={cn('font-medium', getFitColor(advisor.fitScore))}>
                          {advisor.fitScore}%
                        </p>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <p className={cn('font-medium', getFitColor(advisor.feeWeightedFit))}>
                          {advisor.feeWeightedFit}%
                        </p>
                      </div>
                      <div className="text-right min-w-[50px]">
                        <p className="font-medium">{advisor.valeoYears} yr</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-medium">{advisor.industryYears} yr</p>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <p className="font-medium">${(advisor.serviceIncome / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <p className="font-medium">${(advisor.originationIncome / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold">${((advisor.serviceIncome + advisor.originationIncome) / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
