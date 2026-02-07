import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, ChevronDown, ChevronRight, Building2, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SEED_CLIENTS, getClientWithAssets, SEED_ASSET_CATEGORIES, SEED_ENTITIES, SEED_ENTITY_OWNERSHIP } from '@/lib/asset-seed-data';
import { isLiability, getAssetTypeLabel, type Asset } from '@/types/assets';
import { AssetForm } from '@/components/assets/AssetForm';
import { AssetDetail } from '@/components/assets/AssetDetail';

type DateRangePreset = 'cy2024' | 'cy2025' | 'ytd' | 'custom';

export default function ClientNetWorth() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const [datePreset, setDatePreset] = useState<DateRangePreset>('cy2025');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(new Date('2024-12-31'));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date('2025-12-31'));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-investments', 'cat-retirement', 'cat-real-estate', 'cat-life-insurance']));
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState(false);

  const client = SEED_CLIENTS.find(c => c.id === clientId);
  const assets = useMemo(() => clientId ? getClientWithAssets(clientId) : [], [clientId]);
  const entities = SEED_ENTITIES.filter(e => e.client_id === clientId);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  // Get date range based on preset
  const getDateRange = () => {
    const now = new Date();
    switch (datePreset) {
      case 'cy2024':
        return { start: '2023-12-31', end: '2024-12-31', startLabel: '12/31/23', endLabel: '12/31/24' };
      case 'cy2025':
        return { start: '2024-12-31', end: '2025-12-31', startLabel: '12/31/24', endLabel: '12/31/25' };
      case 'ytd':
        return { start: `${now.getFullYear() - 1}-12-31`, end: format(now, 'yyyy-MM-dd'), startLabel: `12/31/${now.getFullYear() - 1}`, endLabel: 'Current' };
      case 'custom':
        return { 
          start: customStartDate ? format(customStartDate, 'yyyy-MM-dd') : '2024-12-31',
          end: customEndDate ? format(customEndDate, 'yyyy-MM-dd') : '2025-12-31',
          startLabel: customStartDate ? format(customStartDate, 'MM/dd/yy') : '12/31/24',
          endLabel: customEndDate ? format(customEndDate, 'MM/dd/yy') : '12/31/25'
        };
    }
  };

  const dateRange = getDateRange();

  // Check if asset was owned during the selected date range
  const isOwnedDuringPeriod = (asset: Asset) => {
    if (!asset.ownership || asset.ownership.length === 0) return true;
    
    const endDate = new Date(dateRange.end);
    const startDate = new Date(dateRange.start);
    
    return asset.ownership.some(o => {
      const ownerStart = new Date(o.start_date);
      const ownerEnd = o.end_date ? new Date(o.end_date) : new Date('2099-12-31');
      return ownerStart <= endDate && ownerEnd >= startDate;
    });
  };

  // Calculate ownership-adjusted value for an asset
  const getAdjustedValue = (asset: Asset, valueDate: string) => {
    const rawValue = asset.values?.find(v => v.value_date === valueDate)?.value || 0;
    
    // Check if owned by entity and apply entity ownership percentage
    const entityOwnership = asset.ownership?.find(o => o.owner_type === 'entity');
    if (entityOwnership && entityOwnership.entity_id) {
      const entityOwnershipRecords = SEED_ENTITY_OWNERSHIP.filter(eo => eo.entity_id === entityOwnership.entity_id);
      // Sum ownership for this client's members
      const clientOwnershipPercent = entityOwnershipRecords
        .filter(eo => client.members.includes(eo.owner_name))
        .reduce((sum, eo) => sum + eo.ownership_percentage, 0);
      return rawValue * (clientOwnershipPercent / 100);
    }

    // For individual ownership, use the ownership percentage
    if (asset.ownership && asset.ownership.length > 0) {
      const totalPercent = asset.ownership
        .filter(o => o.owner_type === 'individual' && client.members.includes(o.owner_name))
        .reduce((sum, o) => sum + o.ownership_percentage, 0);
      return rawValue * (totalPercent / 100);
    }

    return rawValue;
  };

  // Filter and group assets
  const filteredAssets = assets.filter(isOwnedDuringPeriod);
  
  const assetsByCategory = SEED_ASSET_CATEGORIES.reduce((acc, category) => {
    const categoryAssets = filteredAssets.filter(a => a.category_id === category.id);
    if (categoryAssets.length > 0) {
      acc[category.id] = {
        category,
        assets: categoryAssets
      };
    }
    return acc;
  }, {} as Record<string, { category: typeof SEED_ASSET_CATEGORIES[0]; assets: typeof assets }>);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Calculate totals
  const totals = filteredAssets.reduce((acc, asset) => {
    const val1 = getAdjustedValue(asset, dateRange.start === '2023-12-31' ? '2024-12-31' : dateRange.start);
    const val2 = getAdjustedValue(asset, dateRange.end);
    
    if (isLiability(asset.asset_type)) {
      acc.liabilities1 += Math.abs(val1);
      acc.liabilities2 += Math.abs(val2);
    } else {
      acc.assets1 += val1;
      acc.assets2 += val2;
    }
    return acc;
  }, { assets1: 0, assets2: 0, liabilities1: 0, liabilities2: 0 });

  const netWorth1 = totals.assets1 - totals.liabilities1;
  const netWorth2 = totals.assets2 - totals.liabilities2;
  const netWorthChange = netWorth2 - netWorth1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/my-clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">Comparative Net Worth Statement</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DateRangePreset)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cy2024">Calendar Year 2024</SelectItem>
                <SelectItem value="cy2025">Calendar Year 2025</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {datePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {customStartDate ? format(customStartDate, 'MM/dd/yyyy') : 'Start'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {customEndDate ? format(customEndDate, 'MM/dd/yyyy') : 'End'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Asset / Liability
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Asset or Liability</DialogTitle>
              </DialogHeader>
              <AssetForm 
                clientId={clientId!} 
                onSuccess={() => setShowAddDialog(false)}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Entities Summary */}
      {entities.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entities.map(entity => {
                const ownership = SEED_ENTITY_OWNERSHIP.filter(eo => eo.entity_id === entity.id);
                return (
                  <Badge key={entity.id} variant="secondary" className="gap-2">
                    {entity.name} ({entity.entity_type})
                    <span className="text-muted-foreground text-xs">
                      {ownership.map(o => `${o.owner_name}: ${o.ownership_percentage}%`).join(', ')}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Comparative Net Worth Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comparative Net Worth
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Comparing {dateRange.startLabel} to {dateRange.endLabel}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead className="text-right">{dateRange.startLabel}</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">{dateRange.endLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Assets Section */}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={4} className="text-success">ASSETS</TableCell>
              </TableRow>

              {Object.values(assetsByCategory)
                .filter(({ category }) => category.category_type === 'asset')
                .sort((a, b) => a.category.display_order - b.category.display_order)
                .map(({ category, assets: categoryAssets }) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const categoryTotal1 = categoryAssets.reduce((sum, a) => sum + getAdjustedValue(a, dateRange.start === '2023-12-31' ? '2024-12-31' : dateRange.start), 0);
                  const categoryTotal2 = categoryAssets.reduce((sum, a) => sum + getAdjustedValue(a, dateRange.end), 0);
                  const categoryChange = categoryTotal2 - categoryTotal1;

                  return (
                    <div key={category.id} className="contents">
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {category.name}
                            <Badge variant="outline" className="text-xs">{categoryAssets.length}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(categoryTotal1)}</TableCell>
                        <TableCell className={cn('text-right', categoryChange >= 0 ? 'text-success' : 'text-destructive')}>
                          {categoryChange >= 0 ? '+' : ''}{formatCurrency(categoryChange)}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(categoryTotal2)}</TableCell>
                      </TableRow>

                      {isExpanded && categoryAssets.map(asset => {
                        const val1 = getAdjustedValue(asset, dateRange.start === '2023-12-31' ? '2024-12-31' : dateRange.start);
                        const val2 = getAdjustedValue(asset, dateRange.end);
                        const change = val2 - val1;

                        return (
                          <TableRow 
                            key={asset.id}
                            className="bg-muted/20 cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowAssetDetail(true);
                            }}
                          >
                            <TableCell className="pl-10">
                              <div className="flex flex-col">
                                <span>{asset.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getAssetTypeLabel(asset.asset_type)}
                                  {asset.ownership?.map(o => ` • ${o.owner_name} (${o.ownership_percentage}%)`).join('')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{formatCurrency(val1)}</TableCell>
                            <TableCell className={cn('text-right text-sm', change >= 0 ? 'text-success' : 'text-destructive')}>
                              {change >= 0 ? '+' : ''}{formatCurrency(change)}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(val2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </div>
                  );
                })}

              {/* Total Assets */}
              <TableRow className="bg-success/10 font-semibold border-t-2">
                <TableCell>Total Assets</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.assets1)}</TableCell>
                <TableCell className={cn('text-right', totals.assets2 - totals.assets1 >= 0 ? 'text-success' : 'text-destructive')}>
                  {totals.assets2 - totals.assets1 >= 0 ? '+' : ''}{formatCurrency(totals.assets2 - totals.assets1)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totals.assets2)}</TableCell>
              </TableRow>

              {/* Liabilities Section */}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={4} className="text-destructive">LIABILITIES</TableCell>
              </TableRow>

              {Object.values(assetsByCategory)
                .filter(({ category }) => category.category_type === 'liability')
                .sort((a, b) => a.category.display_order - b.category.display_order)
                .map(({ category, assets: categoryAssets }) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const categoryTotal1 = categoryAssets.reduce((sum, a) => sum + Math.abs(getAdjustedValue(a, dateRange.start === '2023-12-31' ? '2024-12-31' : dateRange.start)), 0);
                  const categoryTotal2 = categoryAssets.reduce((sum, a) => sum + Math.abs(getAdjustedValue(a, dateRange.end)), 0);
                  const categoryChange = categoryTotal2 - categoryTotal1;

                  return (
                    <div key={category.id} className="contents">
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {category.name}
                            <Badge variant="outline" className="text-xs">{categoryAssets.length}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">({formatCurrency(categoryTotal1)})</TableCell>
                        <TableCell className={cn('text-right', categoryChange <= 0 ? 'text-success' : 'text-destructive')}>
                          {categoryChange > 0 ? '+' : ''}{formatCurrency(categoryChange)}
                        </TableCell>
                        <TableCell className="text-right font-medium">({formatCurrency(categoryTotal2)})</TableCell>
                      </TableRow>

                      {isExpanded && categoryAssets.map(asset => {
                        const val1 = Math.abs(getAdjustedValue(asset, dateRange.start === '2023-12-31' ? '2024-12-31' : dateRange.start));
                        const val2 = Math.abs(getAdjustedValue(asset, dateRange.end));
                        const change = val2 - val1;

                        return (
                          <TableRow 
                            key={asset.id}
                            className="bg-muted/20 cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowAssetDetail(true);
                            }}
                          >
                            <TableCell className="pl-10">
                              <div className="flex flex-col">
                                <span>{asset.name}</span>
                                <span className="text-xs text-muted-foreground">{getAssetTypeLabel(asset.asset_type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">({formatCurrency(val1)})</TableCell>
                            <TableCell className={cn('text-right text-sm', change <= 0 ? 'text-success' : 'text-destructive')}>
                              {change > 0 ? '+' : ''}{formatCurrency(change)}
                            </TableCell>
                            <TableCell className="text-right">({formatCurrency(val2)})</TableCell>
                          </TableRow>
                        );
                      })}
                    </div>
                  );
                })}

              {/* Total Liabilities */}
              <TableRow className="bg-destructive/10 font-semibold border-t-2">
                <TableCell>Total Liabilities</TableCell>
                <TableCell className="text-right">({formatCurrency(totals.liabilities1)})</TableCell>
                <TableCell className={cn('text-right', totals.liabilities2 - totals.liabilities1 <= 0 ? 'text-success' : 'text-destructive')}>
                  {totals.liabilities2 - totals.liabilities1 > 0 ? '+' : ''}{formatCurrency(totals.liabilities2 - totals.liabilities1)}
                </TableCell>
                <TableCell className="text-right">({formatCurrency(totals.liabilities2)})</TableCell>
              </TableRow>

              {/* Net Worth */}
              <TableRow className="bg-primary/10 font-bold text-lg border-t-4">
                <TableCell>NET WORTH</TableCell>
                <TableCell className="text-right">{formatCurrency(netWorth1)}</TableCell>
                <TableCell className={cn('text-right', netWorthChange >= 0 ? 'text-success' : 'text-destructive')}>
                  {netWorthChange >= 0 ? '+' : ''}{formatCurrency(netWorthChange)}
                  <span className="text-sm ml-1">
                    ({netWorth1 !== 0 ? ((netWorthChange / netWorth1) * 100).toFixed(1) : 0}%)
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(netWorth2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Asset Detail Dialog */}
      <Dialog open={showAssetDetail} onOpenChange={setShowAssetDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAsset && (
            <AssetDetail 
              asset={selectedAsset}
              clientMembers={client.members}
              onClose={() => setShowAssetDetail(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
