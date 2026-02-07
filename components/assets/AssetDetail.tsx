import { useState } from 'react';
import { Edit2, Plus, Trash2, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type Asset, getAssetTypeLabel, ASSET_TYPE_CONFIG, isLiability } from '@/types/assets';
import { format } from 'date-fns';

interface AssetDetailProps {
  asset: Asset;
  clientMembers: string[];
  onClose: () => void;
}

export function AssetDetail({ asset, clientMembers, onClose }: AssetDetailProps) {
  const [showAddValue, setShowAddValue] = useState(false);
  const [showAddOwnership, setShowAddOwnership] = useState(false);

  const typeConfig = ASSET_TYPE_CONFIG[asset.asset_type];
  const isLiabilityType = isLiability(asset.asset_type);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MM/dd/yyyy');
  };

  const renderDetailField = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="flex justify-between py-2 border-b border-border/50">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  };

  const renderTypeSpecificDetails = () => {
    const details = asset.details as any;
    if (!details) return null;

    const fields: { label: string; value: any }[] = [];

    // Common fields
    if (details.institution) fields.push({ label: 'Institution', value: details.institution });
    if (details.account_number) fields.push({ label: 'Account Number', value: details.account_number });

    // Life Insurance specific
    if (details.carrier) fields.push({ label: 'Insurance Carrier', value: details.carrier });
    if (details.policy_number) fields.push({ label: 'Policy Number', value: details.policy_number });
    if (details.face_amount) fields.push({ label: 'Face Amount', value: formatCurrency(details.face_amount) });
    if (details.cash_value) fields.push({ label: 'Cash Value', value: formatCurrency(details.cash_value) });
    if (details.surrender_value) fields.push({ label: 'Surrender Value', value: formatCurrency(details.surrender_value) });
    if (details.premium_annual) fields.push({ label: 'Annual Premium', value: formatCurrency(details.premium_annual) });
    if (details.term_years) fields.push({ label: 'Term Length', value: `${details.term_years} years` });
    if (details.expiration_date) fields.push({ label: 'Expiration Date', value: formatDate(details.expiration_date) });
    if (details.insured) fields.push({ label: 'Insured', value: details.insured });
    if (details.beneficiary_primary) fields.push({ label: 'Primary Beneficiary', value: details.beneficiary_primary });
    if (details.beneficiary_contingent) fields.push({ label: 'Contingent Beneficiary', value: details.beneficiary_contingent });
    if (details.rating_class) fields.push({ label: 'Rating Class', value: details.rating_class });
    if (details.dividend_option) fields.push({ label: 'Dividend Option', value: details.dividend_option });
    if (details.loan_balance) fields.push({ label: 'Policy Loan Balance', value: formatCurrency(details.loan_balance) });

    // Real Estate specific
    if (details.address) fields.push({ label: 'Address', value: details.address });
    if (details.city) fields.push({ label: 'City', value: details.city });
    if (details.state) fields.push({ label: 'State', value: details.state });
    if (details.zip) fields.push({ label: 'ZIP', value: details.zip });
    if (details.purchase_date) fields.push({ label: 'Purchase Date', value: formatDate(details.purchase_date) });
    if (details.purchase_price) fields.push({ label: 'Purchase Price', value: formatCurrency(details.purchase_price) });
    if (details.rental_income_monthly) fields.push({ label: 'Monthly Rental Income', value: formatCurrency(details.rental_income_monthly) });

    // Investment specific
    if (details.cost_basis) fields.push({ label: 'Cost Basis', value: formatCurrency(details.cost_basis) });
    if (details.unrealized_gain_loss !== undefined) fields.push({ label: 'Unrealized Gain/Loss', value: formatCurrency(details.unrealized_gain_loss) });
    if (details.employer_match) fields.push({ label: 'Employer Match', value: `${details.employer_match}%` });

    // Loan specific
    if (details.lender) fields.push({ label: 'Lender', value: details.lender });
    if (details.original_amount) fields.push({ label: 'Original Amount', value: formatCurrency(details.original_amount) });
    if (details.current_balance) fields.push({ label: 'Current Balance', value: formatCurrency(details.current_balance) });
    if (details.interest_rate) fields.push({ label: 'Interest Rate', value: `${details.interest_rate}%` });
    if (details.payment_monthly) fields.push({ label: 'Monthly Payment', value: formatCurrency(details.payment_monthly) });
    if (details.maturity_date) fields.push({ label: 'Maturity Date', value: formatDate(details.maturity_date) });
    if (details.is_tax_deductible !== undefined) fields.push({ label: 'Tax Deductible', value: details.is_tax_deductible ? 'Yes' : 'No' });

    // Vehicle specific
    if (details.make) fields.push({ label: 'Make', value: details.make });
    if (details.model) fields.push({ label: 'Model', value: details.model });
    if (details.year) fields.push({ label: 'Year', value: details.year });
    if (details.vin) fields.push({ label: 'VIN', value: details.vin });

    // Stock options specific
    if (details.company) fields.push({ label: 'Company', value: details.company });
    if (details.grant_date) fields.push({ label: 'Grant Date', value: formatDate(details.grant_date) });
    if (details.shares_granted) fields.push({ label: 'Shares Granted', value: details.shares_granted.toLocaleString() });
    if (details.shares_vested) fields.push({ label: 'Shares Vested', value: details.shares_vested.toLocaleString() });
    if (details.exercise_price) fields.push({ label: 'Exercise Price', value: formatCurrency(details.exercise_price) });
    if (details.current_stock_price) fields.push({ label: 'Current Price', value: formatCurrency(details.current_stock_price) });
    if (details.option_type) fields.push({ label: 'Option Type', value: details.option_type });

    // Business specific
    if (details.entity_name) fields.push({ label: 'Entity Name', value: details.entity_name });
    if (details.entity_type) fields.push({ label: 'Entity Type', value: details.entity_type });
    if (details.ownership_percentage) fields.push({ label: 'Ownership %', value: `${details.ownership_percentage}%` });
    if (details.valuation_date) fields.push({ label: 'Valuation Date', value: formatDate(details.valuation_date) });
    if (details.revenue_annual) fields.push({ label: 'Annual Revenue', value: formatCurrency(details.revenue_annual) });
    if (details.ebitda) fields.push({ label: 'EBITDA', value: formatCurrency(details.ebitda) });

    if (fields.length === 0) return null;

    return (
      <div className="space-y-1">
        {fields.map(({ label, value }) => renderDetailField(label, value))}
      </div>
    );
  };

  // Sort values by date descending
  const sortedValues = [...(asset.values || [])].sort(
    (a, b) => new Date(b.value_date).getTime() - new Date(a.value_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{asset.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isLiabilityType ? 'destructive' : 'default'}>
              {getAssetTypeLabel(asset.asset_type)}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{asset.category?.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Current Value Card */}
      <Card className={cn('bg-muted/30', isLiabilityType && 'border-destructive/30')}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className={cn('text-3xl font-bold', isLiabilityType ? 'text-destructive' : 'text-success')}>
                {isLiabilityType && '('}
                {formatCurrency(sortedValues[0]?.value || 0)}
                {isLiabilityType && ')'}
              </p>
              {sortedValues[0] && (
                <p className="text-xs text-muted-foreground mt-1">
                  As of {formatDate(sortedValues[0].value_date)}
                </p>
              )}
            </div>
            {sortedValues.length >= 2 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Change</p>
                {(() => {
                  const change = sortedValues[0].value - sortedValues[1].value;
                  const changePercent = sortedValues[1].value !== 0 
                    ? (change / sortedValues[1].value) * 100 
                    : 0;
                  const isPositive = isLiabilityType ? change < 0 : change > 0;
                  return (
                    <div className={cn('flex items-center gap-2', isPositive ? 'text-success' : 'text-destructive')}>
                      <TrendingUp className={cn('h-4 w-4', !isPositive && 'rotate-180')} />
                      <span className="font-semibold">
                        {change > 0 ? '+' : ''}{formatCurrency(change)}
                        <span className="text-sm ml-1">({changePercent.toFixed(1)}%)</span>
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="values">Value History</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Asset Details</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTypeSpecificDetails() || (
                <p className="text-muted-foreground text-sm">No additional details recorded.</p>
              )}
            </CardContent>
          </Card>

          {asset.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{asset.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="values" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Value History
                </CardTitle>
                <Dialog open={showAddValue} onOpenChange={setShowAddValue}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Value
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Historical Value</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Value Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input placeholder="Optional notes..." />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddValue(false)}>Cancel</Button>
                        <Button onClick={() => setShowAddValue(false)}>Add Value</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedValues.map((value, idx) => {
                    const prevValue = sortedValues[idx + 1];
                    const change = prevValue ? value.value - prevValue.value : 0;
                    const changePercent = prevValue && prevValue.value !== 0
                      ? (change / prevValue.value) * 100
                      : 0;

                    return (
                      <TableRow key={value.id}>
                        <TableCell>{formatDate(value.value_date)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(value.value)}
                        </TableCell>
                        <TableCell className={cn('text-right', change >= 0 ? 'text-success' : 'text-destructive')}>
                          {prevValue && (
                            <>
                              {change >= 0 ? '+' : ''}{formatCurrency(change)}
                              <span className="text-xs ml-1">({changePercent.toFixed(1)}%)</span>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {value.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sortedValues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No value history recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ownership Records
                </CardTitle>
                <Dialog open={showAddOwnership} onOpenChange={setShowAddOwnership}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Owner
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Ownership Record</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Owner Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="entity">Entity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Owner Name</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientMembers.map(member => (
                              <SelectItem key={member} value={member}>{member}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ownership Percentage</Label>
                        <Input type="number" placeholder="100" max={100} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date (Optional)</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddOwnership(false)}>Cancel</Button>
                        <Button onClick={() => setShowAddOwnership(false)}>Add Owner</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Ownership %</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asset.ownership?.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">{owner.owner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {owner.owner_type === 'individual' ? 'Individual' : 'Entity'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{owner.ownership_percentage}%</TableCell>
                      <TableCell>{formatDate(owner.start_date)}</TableCell>
                      <TableCell>{owner.end_date ? formatDate(owner.end_date) : 'Current'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!asset.ownership || asset.ownership.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No ownership records
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
