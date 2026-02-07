// Asset and Liability Types

export type AssetCategoryType = 'asset' | 'liability';

export interface AssetCategory {
  id: string;
  name: string;
  category_type: AssetCategoryType;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Entity {
  id: string;
  client_id: string;
  name: string;
  entity_type: string; // LLC, Trust, Corporation, Partnership
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  client_id: string;
  category_id: string;
  name: string;
  description?: string;
  asset_type: AssetType;
  details: AssetDetails;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: AssetCategory;
  values?: AssetValue[];
  ownership?: AssetOwnership[];
}

export interface AssetValue {
  id: string;
  asset_id: string;
  value_date: string;
  value: number;
  notes?: string;
  created_at: string;
}

export interface AssetOwnership {
  id: string;
  asset_id: string;
  owner_type: 'individual' | 'entity';
  owner_name: string;
  entity_id?: string;
  ownership_percentage: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  entity?: Entity;
}

export interface EntityOwnership {
  id: string;
  entity_id: string;
  owner_name: string;
  ownership_percentage: number;
  start_date: string;
  end_date?: string;
  created_at: string;
}

// Asset Types
export type AssetType =
  // Cash & Equivalents
  | 'checking'
  | 'savings'
  | 'money_market'
  | 'cd'
  // Investment Accounts
  | 'brokerage'
  | 'managed_account'
  | 'hedge_fund'
  | 'private_equity'
  // Retirement
  | '401k'
  | 'ira'
  | 'roth_ira'
  | 'sep_ira'
  | '403b'
  | 'pension'
  | 'deferred_comp'
  // Real Estate
  | 'primary_residence'
  | 'vacation_home'
  | 'rental_property'
  | 'commercial_property'
  | 'land'
  // Life Insurance
  | 'term_life'
  | 'whole_life'
  | 'universal_life'
  | 'variable_life'
  // Business
  | 'business_interest'
  | 'llc_interest'
  | 'partnership_interest'
  | 'stock_options'
  | 'restricted_stock'
  // Personal Property
  | 'vehicle'
  | 'jewelry'
  | 'art'
  | 'collectibles'
  | 'household'
  // Other
  | 'receivable'
  | 'royalties'
  | 'other_asset'
  // Liabilities
  | 'mortgage'
  | 'heloc'
  | 'auto_loan'
  | 'student_loan'
  | 'credit_card'
  | 'personal_loan'
  | 'business_loan'
  | 'margin_loan'
  | 'other_liability';

// Type-specific details interfaces
export interface BaseAssetDetails {
  institution?: string;
  account_number?: string;
  notes?: string;
}

export interface CashAccountDetails extends BaseAssetDetails {
  interest_rate?: number;
  maturity_date?: string; // for CDs
}

export interface InvestmentAccountDetails extends BaseAssetDetails {
  account_type?: string;
  cost_basis?: number;
  unrealized_gain_loss?: number;
  asset_allocation?: {
    stocks?: number;
    bonds?: number;
    alternatives?: number;
    cash?: number;
  };
}

export interface RetirementAccountDetails extends BaseAssetDetails {
  beneficiary_primary?: string;
  beneficiary_contingent?: string;
  employer_match?: number;
  vesting_schedule?: string;
  rmd_start_date?: string;
}

export interface RealEstateDetails extends BaseAssetDetails {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_market_value?: number;
  property_tax_annual?: number;
  rental_income_monthly?: number;
  mortgage_balance?: number;
}

export interface TermLifeDetails extends BaseAssetDetails {
  policy_number?: string;
  carrier?: string;
  face_amount?: number;
  premium_annual?: number;
  term_years?: number;
  expiration_date?: string;
  insured?: string;
  beneficiary_primary?: string;
  beneficiary_contingent?: string;
  rating_class?: string;
}

export interface WholeLifeDetails extends BaseAssetDetails {
  policy_number?: string;
  carrier?: string;
  face_amount?: number;
  cash_value?: number;
  surrender_value?: number;
  premium_annual?: number;
  insured?: string;
  beneficiary_primary?: string;
  beneficiary_contingent?: string;
  loan_balance?: number;
  dividend_option?: string;
  paid_up_additions?: number;
}

export interface UniversalLifeDetails extends BaseAssetDetails {
  policy_number?: string;
  carrier?: string;
  face_amount?: number;
  cash_value?: number;
  surrender_value?: number;
  premium_target?: number;
  premium_minimum?: number;
  insured?: string;
  beneficiary_primary?: string;
  beneficiary_contingent?: string;
  crediting_rate?: number;
  cost_of_insurance?: number;
  projected_lapse_age?: number;
}

export interface BusinessInterestDetails extends BaseAssetDetails {
  entity_name?: string;
  entity_type?: string;
  ownership_percentage?: number;
  valuation_date?: string;
  valuation_method?: string;
  revenue_annual?: number;
  ebitda?: number;
  industry?: string;
  buy_sell_agreement?: boolean;
  key_person_insurance?: number;
}

export interface StockOptionsDetails extends BaseAssetDetails {
  company?: string;
  grant_date?: string;
  vesting_schedule?: string;
  shares_granted?: number;
  shares_vested?: number;
  exercise_price?: number;
  current_stock_price?: number;
  expiration_date?: string;
  option_type?: 'ISO' | 'NSO';
}

export interface VehicleDetails extends BaseAssetDetails {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  loan_balance?: number;
}

export interface LoanDetails extends BaseAssetDetails {
  lender?: string;
  original_amount?: number;
  current_balance?: number;
  interest_rate?: number;
  payment_monthly?: number;
  maturity_date?: string;
  collateral?: string;
  is_tax_deductible?: boolean;
}

// Union type for all details
export type AssetDetails =
  | BaseAssetDetails
  | CashAccountDetails
  | InvestmentAccountDetails
  | RetirementAccountDetails
  | RealEstateDetails
  | TermLifeDetails
  | WholeLifeDetails
  | UniversalLifeDetails
  | BusinessInterestDetails
  | StockOptionsDetails
  | VehicleDetails
  | LoanDetails;

// Asset type metadata for forms
export const ASSET_TYPE_CONFIG: Record<AssetType, {
  label: string;
  category: string;
  fields: string[];
}> = {
  // Cash & Equivalents
  checking: { label: 'Checking Account', category: 'Cash & Equivalents', fields: ['institution', 'account_number', 'interest_rate'] },
  savings: { label: 'Savings Account', category: 'Cash & Equivalents', fields: ['institution', 'account_number', 'interest_rate'] },
  money_market: { label: 'Money Market', category: 'Cash & Equivalents', fields: ['institution', 'account_number', 'interest_rate'] },
  cd: { label: 'Certificate of Deposit', category: 'Cash & Equivalents', fields: ['institution', 'account_number', 'interest_rate', 'maturity_date'] },
  
  // Investment Accounts
  brokerage: { label: 'Brokerage Account', category: 'Investment Accounts', fields: ['institution', 'account_number', 'cost_basis', 'unrealized_gain_loss'] },
  managed_account: { label: 'Managed Account', category: 'Investment Accounts', fields: ['institution', 'account_number', 'cost_basis'] },
  hedge_fund: { label: 'Hedge Fund', category: 'Investment Accounts', fields: ['institution', 'account_number', 'cost_basis'] },
  private_equity: { label: 'Private Equity', category: 'Investment Accounts', fields: ['institution', 'account_number', 'cost_basis'] },
  
  // Retirement
  '401k': { label: '401(k)', category: 'Retirement Accounts', fields: ['institution', 'beneficiary_primary', 'beneficiary_contingent', 'employer_match'] },
  ira: { label: 'Traditional IRA', category: 'Retirement Accounts', fields: ['institution', 'beneficiary_primary', 'beneficiary_contingent'] },
  roth_ira: { label: 'Roth IRA', category: 'Retirement Accounts', fields: ['institution', 'beneficiary_primary', 'beneficiary_contingent'] },
  sep_ira: { label: 'SEP IRA', category: 'Retirement Accounts', fields: ['institution', 'beneficiary_primary', 'beneficiary_contingent'] },
  '403b': { label: '403(b)', category: 'Retirement Accounts', fields: ['institution', 'beneficiary_primary', 'beneficiary_contingent'] },
  pension: { label: 'Pension', category: 'Retirement Accounts', fields: ['institution', 'beneficiary_primary'] },
  deferred_comp: { label: 'Deferred Compensation', category: 'Retirement Accounts', fields: ['institution', 'vesting_schedule'] },
  
  // Real Estate
  primary_residence: { label: 'Primary Residence', category: 'Real Estate', fields: ['address', 'city', 'state', 'zip', 'purchase_date', 'purchase_price'] },
  vacation_home: { label: 'Vacation Home', category: 'Real Estate', fields: ['address', 'city', 'state', 'zip', 'purchase_date', 'purchase_price'] },
  rental_property: { label: 'Rental Property', category: 'Real Estate', fields: ['address', 'city', 'state', 'zip', 'purchase_date', 'purchase_price', 'rental_income_monthly'] },
  commercial_property: { label: 'Commercial Property', category: 'Real Estate', fields: ['address', 'city', 'state', 'zip', 'purchase_date', 'purchase_price', 'rental_income_monthly'] },
  land: { label: 'Land', category: 'Real Estate', fields: ['address', 'city', 'state', 'zip', 'purchase_date', 'purchase_price'] },
  
  // Life Insurance
  term_life: { label: 'Term Life Insurance', category: 'Life Insurance', fields: ['carrier', 'policy_number', 'face_amount', 'premium_annual', 'term_years', 'expiration_date', 'insured', 'beneficiary_primary', 'beneficiary_contingent', 'rating_class'] },
  whole_life: { label: 'Whole Life Insurance', category: 'Life Insurance', fields: ['carrier', 'policy_number', 'face_amount', 'cash_value', 'surrender_value', 'premium_annual', 'insured', 'beneficiary_primary', 'beneficiary_contingent', 'dividend_option', 'loan_balance'] },
  universal_life: { label: 'Universal Life Insurance', category: 'Life Insurance', fields: ['carrier', 'policy_number', 'face_amount', 'cash_value', 'premium_target', 'insured', 'beneficiary_primary', 'crediting_rate'] },
  variable_life: { label: 'Variable Life Insurance', category: 'Life Insurance', fields: ['carrier', 'policy_number', 'face_amount', 'cash_value', 'insured', 'beneficiary_primary'] },
  
  // Business
  business_interest: { label: 'Business Interest', category: 'Business Interests', fields: ['entity_name', 'entity_type', 'ownership_percentage', 'valuation_date', 'revenue_annual', 'ebitda'] },
  llc_interest: { label: 'LLC Interest', category: 'Business Interests', fields: ['entity_name', 'ownership_percentage', 'valuation_date'] },
  partnership_interest: { label: 'Partnership Interest', category: 'Business Interests', fields: ['entity_name', 'ownership_percentage', 'valuation_date'] },
  stock_options: { label: 'Stock Options', category: 'Business Interests', fields: ['company', 'grant_date', 'shares_granted', 'shares_vested', 'exercise_price', 'current_stock_price', 'expiration_date', 'option_type'] },
  restricted_stock: { label: 'Restricted Stock', category: 'Business Interests', fields: ['company', 'grant_date', 'shares_granted', 'shares_vested', 'vesting_schedule'] },
  
  // Personal Property
  vehicle: { label: 'Vehicle', category: 'Personal Property', fields: ['make', 'model', 'year', 'vin', 'loan_balance'] },
  jewelry: { label: 'Jewelry', category: 'Personal Property', fields: ['notes'] },
  art: { label: 'Art', category: 'Personal Property', fields: ['notes'] },
  collectibles: { label: 'Collectibles', category: 'Personal Property', fields: ['notes'] },
  household: { label: 'Household Items', category: 'Personal Property', fields: ['notes'] },
  
  // Other Assets
  receivable: { label: 'Notes Receivable', category: 'Other Assets', fields: ['notes', 'interest_rate', 'maturity_date'] },
  royalties: { label: 'Royalties', category: 'Other Assets', fields: ['notes'] },
  other_asset: { label: 'Other Asset', category: 'Other Assets', fields: ['notes'] },
  
  // Liabilities
  mortgage: { label: 'Mortgage', category: 'Mortgages', fields: ['lender', 'original_amount', 'current_balance', 'interest_rate', 'payment_monthly', 'maturity_date', 'is_tax_deductible'] },
  heloc: { label: 'HELOC', category: 'Mortgages', fields: ['lender', 'original_amount', 'current_balance', 'interest_rate'] },
  auto_loan: { label: 'Auto Loan', category: 'Auto Loans', fields: ['lender', 'original_amount', 'current_balance', 'interest_rate', 'payment_monthly', 'maturity_date'] },
  student_loan: { label: 'Student Loan', category: 'Student Loans', fields: ['lender', 'original_amount', 'current_balance', 'interest_rate', 'payment_monthly'] },
  credit_card: { label: 'Credit Card', category: 'Credit Cards', fields: ['lender', 'current_balance', 'interest_rate'] },
  personal_loan: { label: 'Personal Loan', category: 'Other Liabilities', fields: ['lender', 'original_amount', 'current_balance', 'interest_rate', 'payment_monthly'] },
  business_loan: { label: 'Business Loan', category: 'Business Debt', fields: ['lender', 'original_amount', 'current_balance', 'interest_rate', 'payment_monthly', 'collateral'] },
  margin_loan: { label: 'Margin Loan', category: 'Other Liabilities', fields: ['lender', 'current_balance', 'interest_rate'] },
  other_liability: { label: 'Other Liability', category: 'Other Liabilities', fields: ['lender', 'current_balance', 'interest_rate', 'notes'] },
};

// Helpers
export const isLiability = (assetType: AssetType): boolean => {
  return ['mortgage', 'heloc', 'auto_loan', 'student_loan', 'credit_card', 'personal_loan', 'business_loan', 'margin_loan', 'other_liability'].includes(assetType);
};

export const getAssetTypeLabel = (assetType: AssetType): string => {
  return ASSET_TYPE_CONFIG[assetType]?.label || assetType;
};

export const getAssetTypesByCategory = (categoryName: string): AssetType[] => {
  return Object.entries(ASSET_TYPE_CONFIG)
    .filter(([_, config]) => config.category === categoryName)
    .map(([type]) => type as AssetType);
};
