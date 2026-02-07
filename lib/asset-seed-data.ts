import type { Asset, AssetCategory, AssetValue, AssetOwnership, Entity, EntityOwnership } from '@/types/assets';

// Seed Asset Categories
export const SEED_ASSET_CATEGORIES: AssetCategory[] = [
  { id: 'cat-cash', name: 'Cash & Equivalents', category_type: 'asset', display_order: 1, is_active: true, created_at: '' },
  { id: 'cat-investments', name: 'Investment Accounts', category_type: 'asset', display_order: 2, is_active: true, created_at: '' },
  { id: 'cat-retirement', name: 'Retirement Accounts', category_type: 'asset', display_order: 3, is_active: true, created_at: '' },
  { id: 'cat-real-estate', name: 'Real Estate', category_type: 'asset', display_order: 4, is_active: true, created_at: '' },
  { id: 'cat-life-insurance', name: 'Life Insurance', category_type: 'asset', display_order: 5, is_active: true, created_at: '' },
  { id: 'cat-business', name: 'Business Interests', category_type: 'asset', display_order: 6, is_active: true, created_at: '' },
  { id: 'cat-personal', name: 'Personal Property', category_type: 'asset', display_order: 7, is_active: true, created_at: '' },
  { id: 'cat-other-assets', name: 'Other Assets', category_type: 'asset', display_order: 8, is_active: true, created_at: '' },
  { id: 'cat-mortgages', name: 'Mortgages', category_type: 'liability', display_order: 10, is_active: true, created_at: '' },
  { id: 'cat-credit-cards', name: 'Credit Cards', category_type: 'liability', display_order: 11, is_active: true, created_at: '' },
  { id: 'cat-auto-loans', name: 'Auto Loans', category_type: 'liability', display_order: 12, is_active: true, created_at: '' },
  { id: 'cat-student-loans', name: 'Student Loans', category_type: 'liability', display_order: 13, is_active: true, created_at: '' },
  { id: 'cat-business-debt', name: 'Business Debt', category_type: 'liability', display_order: 14, is_active: true, created_at: '' },
  { id: 'cat-other-liabilities', name: 'Other Liabilities', category_type: 'liability', display_order: 15, is_active: true, created_at: '' },
];

// Seed Entities for clients
export const SEED_ENTITIES: Entity[] = [
  { id: 'ent-1', client_id: 'client-1', name: 'Williams Family LLC', entity_type: 'LLC', created_at: '', updated_at: '' },
  { id: 'ent-2', client_id: 'client-1', name: 'Williams Family Trust', entity_type: 'Trust', created_at: '', updated_at: '' },
  { id: 'ent-3', client_id: 'client-2', name: 'Chen Investments LLC', entity_type: 'LLC', created_at: '', updated_at: '' },
  { id: 'ent-4', client_id: 'client-3', name: 'Rodriguez Holdings LP', entity_type: 'Partnership', created_at: '', updated_at: '' },
];

export const SEED_ENTITY_OWNERSHIP: EntityOwnership[] = [
  { id: 'eo-1', entity_id: 'ent-1', owner_name: 'John Williams', ownership_percentage: 50, start_date: '2015-01-01', created_at: '' },
  { id: 'eo-2', entity_id: 'ent-1', owner_name: 'Mary Williams', ownership_percentage: 50, start_date: '2015-01-01', created_at: '' },
  { id: 'eo-3', entity_id: 'ent-2', owner_name: 'Williams Family LLC', ownership_percentage: 100, start_date: '2018-01-01', created_at: '' },
  { id: 'eo-4', entity_id: 'ent-3', owner_name: 'James Chen', ownership_percentage: 100, start_date: '2020-01-01', created_at: '' },
  { id: 'eo-5', entity_id: 'ent-4', owner_name: 'Maria Rodriguez', ownership_percentage: 60, start_date: '2019-01-01', created_at: '' },
  { id: 'eo-6', entity_id: 'ent-4', owner_name: 'Carlos Rodriguez', ownership_percentage: 40, start_date: '2019-01-01', created_at: '' },
];

// Sample clients (matching existing)
const clientIds = ['client-1', 'client-2', 'client-3', 'client-4', 'client-5'];
const clientNames = [
  { id: 'client-1', name: 'Williams Family Trust', members: ['John Williams', 'Mary Williams'] },
  { id: 'client-2', name: 'Chen Household', members: ['James Chen', 'Linda Chen'] },
  { id: 'client-3', name: 'Rodriguez Estate', members: ['Maria Rodriguez', 'Carlos Rodriguez'] },
  { id: 'client-4', name: 'Thompson Family', members: ['David Thompson', 'Sarah Thompson'] },
  { id: 'client-5', name: 'Johnson Household', members: ['Emily Johnson', 'Robert Johnson'] },
];

// Generate mock assets for each client
export function generateClientAssets(clientId: string): Asset[] {
  const clientInfo = clientNames.find(c => c.id === clientId);
  if (!clientInfo) return [];

  const assets: Asset[] = [];
  const baseDate = new Date();
  
  // Cash accounts
  assets.push({
    id: `${clientId}-checking`,
    client_id: clientId,
    category_id: 'cat-cash',
    name: 'Primary Checking',
    asset_type: 'checking',
    details: { institution: 'Chase Bank', account_number: '****1234' },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  assets.push({
    id: `${clientId}-savings`,
    client_id: clientId,
    category_id: 'cat-cash',
    name: 'Emergency Fund',
    asset_type: 'savings',
    details: { institution: 'Ally Bank', account_number: '****5678', interest_rate: 4.5 },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Brokerage Account
  assets.push({
    id: `${clientId}-brokerage`,
    client_id: clientId,
    category_id: 'cat-investments',
    name: 'Joint Brokerage',
    asset_type: 'brokerage',
    details: { institution: 'Fidelity', account_number: '****9012', cost_basis: 450000, unrealized_gain_loss: 125000 },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // 401k accounts
  assets.push({
    id: `${clientId}-401k-1`,
    client_id: clientId,
    category_id: 'cat-retirement',
    name: `${clientInfo.members[0]} 401(k)`,
    asset_type: '401k',
    details: { institution: 'Vanguard', beneficiary_primary: clientInfo.members[1], employer_match: 6 },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  if (clientInfo.members[1]) {
    assets.push({
      id: `${clientId}-401k-2`,
      client_id: clientId,
      category_id: 'cat-retirement',
      name: `${clientInfo.members[1]} 401(k)`,
      asset_type: '401k',
      details: { institution: 'Fidelity', beneficiary_primary: clientInfo.members[0], employer_match: 4 },
      is_active: true,
      created_at: '',
      updated_at: ''
    });
  }

  // IRA
  assets.push({
    id: `${clientId}-ira`,
    client_id: clientId,
    category_id: 'cat-retirement',
    name: `${clientInfo.members[0]} Traditional IRA`,
    asset_type: 'ira',
    details: { institution: 'Schwab', beneficiary_primary: clientInfo.members[1] || 'Estate' },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Primary Residence
  assets.push({
    id: `${clientId}-home`,
    client_id: clientId,
    category_id: 'cat-real-estate',
    name: 'Primary Residence',
    asset_type: 'primary_residence',
    details: { 
      address: '123 Main Street', 
      city: 'Chicago', 
      state: 'IL', 
      zip: '60601',
      purchase_date: '2018-06-15',
      purchase_price: 650000
    },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Term Life
  assets.push({
    id: `${clientId}-term-life`,
    client_id: clientId,
    category_id: 'cat-life-insurance',
    name: `${clientInfo.members[0]} Term Life`,
    asset_type: 'term_life',
    details: {
      carrier: 'Northwestern Mutual',
      policy_number: 'TL-123456',
      face_amount: 2000000,
      premium_annual: 1800,
      term_years: 20,
      expiration_date: '2038-01-01',
      insured: clientInfo.members[0],
      beneficiary_primary: clientInfo.members[1] || 'Estate',
      rating_class: 'Preferred Plus'
    },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Whole Life
  assets.push({
    id: `${clientId}-whole-life`,
    client_id: clientId,
    category_id: 'cat-life-insurance',
    name: `${clientInfo.members[0]} Whole Life`,
    asset_type: 'whole_life',
    details: {
      carrier: 'MassMutual',
      policy_number: 'WL-789012',
      face_amount: 500000,
      cash_value: 125000,
      surrender_value: 118000,
      premium_annual: 8500,
      insured: clientInfo.members[0],
      beneficiary_primary: clientInfo.members[1] || 'Estate',
      dividend_option: 'Paid-Up Additions'
    },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Vehicle
  assets.push({
    id: `${clientId}-vehicle`,
    client_id: clientId,
    category_id: 'cat-personal',
    name: '2022 Mercedes GLE',
    asset_type: 'vehicle',
    details: { make: 'Mercedes-Benz', model: 'GLE 450', year: 2022, vin: 'WDCZF4KB1NA123456' },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Mortgage
  assets.push({
    id: `${clientId}-mortgage`,
    client_id: clientId,
    category_id: 'cat-mortgages',
    name: 'Primary Residence Mortgage',
    asset_type: 'mortgage',
    details: {
      lender: 'Wells Fargo',
      original_amount: 520000,
      current_balance: 420000,
      interest_rate: 3.25,
      payment_monthly: 2265,
      maturity_date: '2048-06-01',
      is_tax_deductible: true
    },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // Credit Card
  assets.push({
    id: `${clientId}-cc`,
    client_id: clientId,
    category_id: 'cat-credit-cards',
    name: 'Chase Sapphire Reserve',
    asset_type: 'credit_card',
    details: { lender: 'Chase', current_balance: 4500, interest_rate: 22.99 },
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  return assets;
}

// Generate asset values for comparison dates
export function generateAssetValues(asset: Asset): AssetValue[] {
  const values: AssetValue[] = [];
  
  // Base values by asset type
  const getBaseValue = (asset: Asset): number => {
    switch (asset.asset_type) {
      case 'checking': return 25000 + Math.random() * 50000;
      case 'savings': return 75000 + Math.random() * 75000;
      case 'brokerage': return 500000 + Math.random() * 300000;
      case '401k': return 350000 + Math.random() * 200000;
      case 'ira': return 150000 + Math.random() * 100000;
      case 'primary_residence': return 750000 + Math.random() * 250000;
      case 'term_life': return 0; // Term life has no cash value
      case 'whole_life': return (asset.details as any).cash_value || 125000;
      case 'vehicle': return 45000 + Math.random() * 20000;
      case 'mortgage': return -(420000 + Math.random() * 50000);
      case 'credit_card': return -(2000 + Math.random() * 8000);
      default: return 50000 + Math.random() * 50000;
    }
  };

  const baseValue = getBaseValue(asset);
  
  // 12/31/2024 value
  values.push({
    id: `${asset.id}-val-2024`,
    asset_id: asset.id,
    value_date: '2024-12-31',
    value: Math.round(baseValue * 0.92),
    created_at: ''
  });

  // 12/31/2025 value (current)
  values.push({
    id: `${asset.id}-val-2025`,
    asset_id: asset.id,
    value_date: '2025-12-31',
    value: Math.round(baseValue),
    created_at: ''
  });

  return values;
}

// Generate ownership for assets
export function generateAssetOwnership(asset: Asset): AssetOwnership[] {
  const clientInfo = clientNames.find(c => c.id === asset.client_id);
  if (!clientInfo) return [];

  const ownership: AssetOwnership[] = [];
  
  // Joint ownership for most assets
  if (['brokerage', 'checking', 'savings', 'primary_residence'].includes(asset.asset_type)) {
    clientInfo.members.forEach((member, idx) => {
      ownership.push({
        id: `${asset.id}-own-${idx}`,
        asset_id: asset.id,
        owner_type: 'individual',
        owner_name: member,
        ownership_percentage: 100 / clientInfo.members.length,
        start_date: '2020-01-01',
        created_at: ''
      });
    });
  } else if (['401k', 'ira', 'term_life', 'whole_life'].includes(asset.asset_type)) {
    // Individual ownership for retirement/insurance
    const ownerName = asset.name.includes(clientInfo.members[0]) ? clientInfo.members[0] : clientInfo.members[1] || clientInfo.members[0];
    ownership.push({
      id: `${asset.id}-own-0`,
      asset_id: asset.id,
      owner_type: 'individual',
      owner_name: ownerName,
      ownership_percentage: 100,
      start_date: '2020-01-01',
      created_at: ''
    });
  } else {
    // Default to first member
    ownership.push({
      id: `${asset.id}-own-0`,
      asset_id: asset.id,
      owner_type: 'individual',
      owner_name: clientInfo.members[0],
      ownership_percentage: 100,
      start_date: '2020-01-01',
      created_at: ''
    });
  }

  return ownership;
}

// Full client data with assets
export function getClientWithAssets(clientId: string) {
  const assets = generateClientAssets(clientId);
  return assets.map(asset => ({
    ...asset,
    values: generateAssetValues(asset),
    ownership: generateAssetOwnership(asset),
    category: SEED_ASSET_CATEGORIES.find(c => c.id === asset.category_id)
  }));
}

// Get all seeded clients with basic info
export const SEED_CLIENTS = clientNames.map(c => ({
  id: c.id,
  name: c.name,
  members: c.members,
  segment: ['ultra_hnw', 'private_client', 'private_client', 'traditional', 'traditional'][clientNames.indexOf(c)] as any,
  complexity_tier: ['highly_complex', 'complex', 'complex', 'standard', 'standard'][clientNames.indexOf(c)] as any,
}));
