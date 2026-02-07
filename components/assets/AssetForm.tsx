import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SEED_ASSET_CATEGORIES } from '@/lib/asset-seed-data';
import { ASSET_TYPE_CONFIG, type AssetType } from '@/types/assets';

interface AssetFormProps {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category_id: z.string().min(1, 'Category is required'),
  asset_type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  current_value: z.coerce.number().optional(),
  value_date: z.string().optional(),
});

export function AssetForm({ clientId, onSuccess, onCancel }: AssetFormProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AssetType | ''>('');

  const form = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: '',
      category_id: '',
      asset_type: '',
      description: '',
      current_value: 0,
      value_date: new Date().toISOString().split('T')[0],
    },
  });

  const assetCategories = SEED_ASSET_CATEGORIES.filter(c => c.category_type === 'asset');
  const liabilityCategories = SEED_ASSET_CATEGORIES.filter(c => c.category_type === 'liability');

  const getTypesForCategory = (categoryId: string) => {
    const category = SEED_ASSET_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];
    
    return Object.entries(ASSET_TYPE_CONFIG)
      .filter(([_, config]) => config.category === category.name)
      .map(([type, config]) => ({ type: type as AssetType, label: config.label }));
  };

  const availableTypes = getTypesForCategory(selectedCategory);
  const typeConfig = selectedType ? ASSET_TYPE_CONFIG[selectedType] : null;

  const onSubmit = (data: z.infer<typeof baseSchema>) => {
    // In a real app, this would save to Supabase
    console.log('Saving asset:', { ...data, client_id: clientId });
    toast({
      title: 'Asset Added',
      description: `${data.name} has been added successfully.`,
    });
    onSuccess();
  };

  const renderTypeSpecificFields = () => {
    if (!selectedType || !typeConfig) return null;

    const fields = typeConfig.fields;

    return (
      <div className="space-y-4">
        <Separator />
        <h3 className="font-medium">Details for {typeConfig.label}</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {fields.includes('institution') && (
            <FormItem>
              <FormLabel>Institution/Company</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Fidelity, Chase" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('account_number') && (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Last 4 digits" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('carrier') && (
            <FormItem>
              <FormLabel>Insurance Carrier</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Northwestern Mutual" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('policy_number') && (
            <FormItem>
              <FormLabel>Policy Number</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('face_amount') && (
            <FormItem>
              <FormLabel>Face Amount / Death Benefit</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('cash_value') && (
            <FormItem>
              <FormLabel>Cash Value</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('premium_annual') && (
            <FormItem>
              <FormLabel>Annual Premium</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('term_years') && (
            <FormItem>
              <FormLabel>Term Length (Years)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="20" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('expiration_date') && (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input type="date" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('insured') && (
            <FormItem>
              <FormLabel>Insured</FormLabel>
              <FormControl>
                <Input placeholder="Name of insured person" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('beneficiary_primary') && (
            <FormItem>
              <FormLabel>Primary Beneficiary</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('beneficiary_contingent') && (
            <FormItem>
              <FormLabel>Contingent Beneficiary</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('rating_class') && (
            <FormItem>
              <FormLabel>Rating Class</FormLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preferred_plus">Preferred Plus</SelectItem>
                  <SelectItem value="preferred">Preferred</SelectItem>
                  <SelectItem value="standard_plus">Standard Plus</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="substandard">Substandard</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}

          {fields.includes('address') && (
            <FormItem className="md:col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Street address" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('city') && (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('state') && (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input maxLength={2} placeholder="IL" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('zip') && (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <Input maxLength={10} />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('purchase_date') && (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input type="date" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('purchase_price') && (
            <FormItem>
              <FormLabel>Purchase Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('rental_income_monthly') && (
            <FormItem>
              <FormLabel>Monthly Rental Income</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('cost_basis') && (
            <FormItem>
              <FormLabel>Cost Basis</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('unrealized_gain_loss') && (
            <FormItem>
              <FormLabel>Unrealized Gain/Loss</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('employer_match') && (
            <FormItem>
              <FormLabel>Employer Match (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('interest_rate') && (
            <FormItem>
              <FormLabel>Interest Rate (%)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('lender') && (
            <FormItem>
              <FormLabel>Lender</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('original_amount') && (
            <FormItem>
              <FormLabel>Original Loan Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('current_balance') && (
            <FormItem>
              <FormLabel>Current Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('payment_monthly') && (
            <FormItem>
              <FormLabel>Monthly Payment</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('maturity_date') && (
            <FormItem>
              <FormLabel>Maturity Date</FormLabel>
              <FormControl>
                <Input type="date" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('make') && (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Toyota" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('model') && (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Camry" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('year') && (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2024" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('company') && (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('grant_date') && (
            <FormItem>
              <FormLabel>Grant Date</FormLabel>
              <FormControl>
                <Input type="date" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('shares_granted') && (
            <FormItem>
              <FormLabel>Shares Granted</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('shares_vested') && (
            <FormItem>
              <FormLabel>Shares Vested</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('exercise_price') && (
            <FormItem>
              <FormLabel>Exercise Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('current_stock_price') && (
            <FormItem>
              <FormLabel>Current Stock Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('option_type') && (
            <FormItem>
              <FormLabel>Option Type</FormLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISO">ISO (Incentive Stock Option)</SelectItem>
                  <SelectItem value="NSO">NSO (Non-Qualified Stock Option)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}

          {fields.includes('entity_name') && (
            <FormItem>
              <FormLabel>Entity Name</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('entity_type') && (
            <FormItem>
              <FormLabel>Entity Type</FormLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="S-Corp">S-Corporation</SelectItem>
                  <SelectItem value="C-Corp">C-Corporation</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Sole Prop">Sole Proprietorship</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}

          {fields.includes('ownership_percentage') && (
            <FormItem>
              <FormLabel>Ownership Percentage</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" max="100" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('valuation_date') && (
            <FormItem>
              <FormLabel>Valuation Date</FormLabel>
              <FormControl>
                <Input type="date" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('revenue_annual') && (
            <FormItem>
              <FormLabel>Annual Revenue</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('ebitda') && (
            <FormItem>
              <FormLabel>EBITDA</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}

          {fields.includes('dividend_option') && (
            <FormItem>
              <FormLabel>Dividend Option</FormLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid_up_additions">Paid-Up Additions</SelectItem>
                  <SelectItem value="premium_reduction">Premium Reduction</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="accumulate">Accumulate at Interest</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}

          {fields.includes('loan_balance') && (
            <FormItem>
              <FormLabel>Policy Loan Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" />
              </FormControl>
            </FormItem>
          )}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Asset/Liability Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Primary Checking, 401(k), Home Mortgage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedCategory(value);
                    setSelectedType('');
                    form.setValue('asset_type', '');
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="" disabled>Assets</SelectItem>
                    {assetCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                    <SelectItem value="" disabled>Liabilities</SelectItem>
                    {liabilityCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asset_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedType(value as AssetType);
                  }}
                  disabled={!selectedCategory}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCategory ? "Select type" : "Select category first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTypes.map(({ type, label }) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Value</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>As of Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description / Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {renderTypeSpecificFields()}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Add Asset
          </Button>
        </div>
      </form>
    </Form>
  );
}
