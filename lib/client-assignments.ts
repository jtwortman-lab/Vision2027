import { SEED_ADVISORS, SEED_SUBTOPICS, generateSampleNeeds } from './seed-data';
import type { Client, ClientNeed, AdvisorWithProfile } from '@/types/database';

// Generate existing clients (not prospects) with assignments to advisors
export interface ClientAssignment {
  client: Client;
  needs: ClientNeed[];
  leadAdvisorId: string;
  fitScore: number;
  annualFee?: number;
}

// Create sample existing clients
const EXISTING_CLIENTS: Client[] = [
  { id: 'client-1', name: 'Anderson Family Trust', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$25M+', net_worth_band: '$50M+', city: 'New York', state: 'NY', valeo_client_since: '2018-03-15', my_client_since: '2020-01-10', backup_advisor: 'Sarah Chen', support_advisor: 'Mike Johnson', originator: 'David Park', constraints: {}, preferences: {}, notes: 'Long-standing client, multi-generational', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-2', name: 'The Baker Foundation', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'Manhattan', state: 'NY', valeo_client_since: '2020-06-22', my_client_since: '2020-06-22', backup_advisor: 'James Wilson', support_advisor: 'Emily Davis', originator: 'Sarah Chen', constraints: {}, preferences: {}, notes: 'Charitable foundation', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-3', name: 'Chen Tech Holdings', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$10M-$25M', net_worth_band: '$25M-$50M', city: 'San Francisco', state: 'CA', valeo_client_since: '2019-11-08', my_client_since: '2021-03-15', backup_advisor: 'David Park', support_advisor: 'Lisa Wang', originator: 'James Wilson', constraints: {}, preferences: {}, notes: 'Tech entrepreneur, complex equity', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-4', name: 'Davis Retirement Account', segment: 'essentials', complexity_tier: 'standard', aum_band: '$1M-$2M', net_worth_band: '$2M-$5M', city: 'Chicago', state: 'IL', valeo_client_since: '2021-02-14', my_client_since: '2021-02-14', backup_advisor: 'Emily Davis', support_advisor: 'Sarah Chen', originator: 'Mike Johnson', constraints: {}, preferences: {}, notes: 'Retiree, income focused', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-5', name: 'Evans Medical Group', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'Boston', state: 'MA', valeo_client_since: '2017-09-30', my_client_since: '2019-05-20', backup_advisor: 'Mike Johnson', support_advisor: 'James Wilson', originator: 'Emily Davis', constraints: {}, preferences: {}, notes: 'Medical practice partners', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-6', name: 'Fisher Family Office', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$25M+', net_worth_band: '$50M+', city: 'Miami', state: 'FL', valeo_client_since: '2016-04-18', my_client_since: '2018-08-01', backup_advisor: 'Lisa Wang', support_advisor: 'David Park', originator: 'Sarah Chen', constraints: {}, preferences: {}, notes: 'Third generation wealth', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-7', name: 'Green Energy Investors', segment: 'traditional', complexity_tier: 'standard', aum_band: '$2M-$5M', net_worth_band: '$5M-$10M', city: 'Seattle', state: 'WA', valeo_client_since: '2022-01-10', my_client_since: '2022-01-10', backup_advisor: 'Sarah Chen', support_advisor: 'Emily Davis', originator: 'David Park', constraints: {}, preferences: {}, notes: 'ESG focused portfolio', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-8', name: 'Harris Private Trust', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'Dallas', state: 'TX', valeo_client_since: '2019-07-25', my_client_since: '2020-12-05', backup_advisor: 'James Wilson', support_advisor: 'Mike Johnson', originator: 'Lisa Wang', constraints: {}, preferences: {}, notes: 'Oil & gas background', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-9', name: 'Irving Manufacturing LLC', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'Chicago', state: 'IL', valeo_client_since: '2020-11-03', my_client_since: '2020-11-03', backup_advisor: 'David Park', support_advisor: 'Sarah Chen', originator: 'James Wilson', constraints: {}, preferences: {}, notes: 'Business sale in progress', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-10', name: 'Johnson Estate', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$10M-$25M', net_worth_band: '$25M-$50M', city: 'Atlanta', state: 'GA', valeo_client_since: '2015-12-01', my_client_since: '2017-06-15', backup_advisor: 'Emily Davis', support_advisor: 'Lisa Wang', originator: 'Mike Johnson', constraints: {}, preferences: {}, notes: 'Estate planning focus', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-11', name: 'Klein Wealth Partners', segment: 'traditional', complexity_tier: 'standard', aum_band: '$2M-$5M', net_worth_band: '$5M-$10M', city: 'Denver', state: 'CO', valeo_client_since: '2021-08-17', my_client_since: '2021-08-17', backup_advisor: 'Mike Johnson', support_advisor: 'James Wilson', originator: 'Emily Davis', constraints: {}, preferences: {}, notes: 'Investment advisory', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-12', name: 'Lopez Family Trust', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'Los Angeles', state: 'CA', valeo_client_since: '2018-05-22', my_client_since: '2019-09-10', backup_advisor: 'Lisa Wang', support_advisor: 'David Park', originator: 'Sarah Chen', constraints: {}, preferences: {}, notes: 'Real estate holdings', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-13', name: 'Morgan Charitable Fund', segment: 'essentials', complexity_tier: 'standard', aum_band: '$500K-$1M', net_worth_band: '$1M-$2M', city: 'Boston', state: 'MA', valeo_client_since: '2022-03-28', my_client_since: '2022-03-28', backup_advisor: 'Sarah Chen', support_advisor: 'Emily Davis', originator: 'James Wilson', constraints: {}, preferences: {}, notes: 'Donor advised fund', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-14', name: 'Nelson Industries', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'San Francisco', state: 'CA', valeo_client_since: '2019-02-14', my_client_since: '2020-04-20', backup_advisor: 'James Wilson', support_advisor: 'Mike Johnson', originator: 'David Park', constraints: {}, preferences: {}, notes: 'Manufacturing business', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-15', name: 'OBrien Retirement', segment: 'essentials', complexity_tier: 'standard', aum_band: '$1M-$2M', net_worth_band: '$2M-$5M', city: 'Brooklyn', state: 'NY', valeo_client_since: '2020-09-10', my_client_since: '2020-09-10', backup_advisor: 'David Park', support_advisor: 'Lisa Wang', originator: 'Emily Davis', constraints: {}, preferences: {}, notes: 'Fixed income focused', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-16', name: 'Peterson Holdings', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$25M+', net_worth_band: '$50M+', city: 'Chicago', state: 'IL', valeo_client_since: '2014-06-30', my_client_since: '2016-02-15', backup_advisor: 'Emily Davis', support_advisor: 'Sarah Chen', originator: 'Mike Johnson', constraints: {}, preferences: {}, notes: 'Private equity investments', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-17', name: 'Quinn Medical PLLC', segment: 'traditional', complexity_tier: 'standard', aum_band: '$2M-$5M', net_worth_band: '$5M-$10M', city: 'Miami', state: 'FL', valeo_client_since: '2021-04-05', my_client_since: '2021-04-05', backup_advisor: 'Mike Johnson', support_advisor: 'James Wilson', originator: 'Lisa Wang', constraints: {}, preferences: {}, notes: 'Physician group practice', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-18', name: 'Roberts Tech Ventures', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', city: 'Seattle', state: 'WA', valeo_client_since: '2019-10-18', my_client_since: '2021-01-25', backup_advisor: 'Lisa Wang', support_advisor: 'David Park', originator: 'Sarah Chen', constraints: {}, preferences: {}, notes: 'Angel investor', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-19', name: 'Smith Family Foundation', segment: 'traditional', complexity_tier: 'standard', aum_band: '$2M-$5M', net_worth_band: '$5M-$10M', city: 'Denver', state: 'CO', valeo_client_since: '2022-07-12', my_client_since: '2022-07-12', backup_advisor: 'Sarah Chen', support_advisor: 'Emily Davis', originator: 'James Wilson', constraints: {}, preferences: {}, notes: 'Philanthropic focus', is_prospect: false, created_at: '', updated_at: '' },
  { id: 'client-20', name: 'Taylor Private Wealth', segment: 'ultra_hnw', complexity_tier: 'complex', aum_band: '$10M-$25M', net_worth_band: '$25M-$50M', city: 'Dallas', state: 'TX', valeo_client_since: '2017-01-20', my_client_since: '2018-11-08', backup_advisor: 'James Wilson', support_advisor: 'Mike Johnson', originator: 'David Park', constraints: {}, preferences: {}, notes: 'Multi-asset portfolio', is_prospect: false, created_at: '', updated_at: '' },
];

// Generate needs for existing clients
function generateClientNeeds(clientId: string, complexity: string): ClientNeed[] {
  const needs: ClientNeed[] = [];
  const horizons: ('now' | '1yr' | '3yr' | '5yr')[] = ['now', '1yr', '3yr', '5yr'];
  
  const subtopicsToInclude = complexity === 'highly_complex'
    ? SEED_SUBTOPICS.slice(0, 15)
    : complexity === 'complex'
    ? SEED_SUBTOPICS.slice(0, 10)
    : SEED_SUBTOPICS.slice(0, 6);

  subtopicsToInclude.forEach((subtopic, idx) => {
    needs.push({
      id: `need-${clientId}-${subtopic.id}`,
      client_id: clientId,
      subtopic_id: subtopic.id,
      importance: Math.min(10, Math.floor(Math.random() * 4) + 6),
      urgency: Math.min(10, Math.floor(Math.random() * 5) + 4),
      horizon: horizons[idx % 4],
      notes: '',
      created_at: '',
      updated_at: '',
      subtopic: subtopic as any,
    });
  });

  return needs;
}

// Calculate fit score between advisor and client needs
export function calculateClientFitScore(advisor: AdvisorWithProfile, needs: ClientNeed[]): number {
  if (!advisor.skills || needs.length === 0) return 50;

  let totalScore = 0;
  let totalWeight = 0;

  needs.forEach((need) => {
    const skill = advisor.skills?.find((s) => s.subtopic_id === need.subtopic_id);
    const skillLevel = skill?.skill_level ?? 0;
    const required = need.importance;
    const weight = (need.importance + need.urgency) / 2;

    let contribution = 0;
    if (skillLevel >= required) {
      const overSkill = skillLevel - required;
      contribution = weight * (1 - (overSkill * 0.05)); // Small penalty for overskill
    } else {
      const underSkill = required - skillLevel;
      contribution = weight * (1 - (underSkill * 0.15)); // Larger penalty for underskill
    }

    totalScore += Math.max(0, contribution);
    totalWeight += weight;
  });

  return Math.round((totalScore / totalWeight) * 100);
}

// Generate advisor-client assignments with fit scores
export function getAdvisorClientBook(advisorId: string): ClientAssignment[] {
  const advisor = SEED_ADVISORS.find((a) => a.id === advisorId);
  if (!advisor) return [];

  // Assign clients to advisors in a round-robin fashion based on advisor index
  const advisorIndex = SEED_ADVISORS.findIndex((a) => a.id === advisorId);
  
  // Each advisor gets 2-4 clients
  const clientsPerAdvisor = 2 + (advisorIndex % 3);
  const startIndex = (advisorIndex * 2) % EXISTING_CLIENTS.length;
  
  const assignedClients: ClientAssignment[] = [];
  
  for (let i = 0; i < clientsPerAdvisor; i++) {
    const clientIndex = (startIndex + i) % EXISTING_CLIENTS.length;
    const client = EXISTING_CLIENTS[clientIndex];
    const needs = generateClientNeeds(client.id, client.complexity_tier);
    const fitScore = calculateClientFitScore(advisor, needs);
    // Generate a realistic annual fee based on segment
    const annualFee = client.segment === 'ultra_hnw' ? 75000 + Math.floor(Math.random() * 150000)
      : client.segment === 'private_client' ? 25000 + Math.floor(Math.random() * 50000)
      : client.segment === 'traditional' ? 10000 + Math.floor(Math.random() * 15000)
      : 5000 + Math.floor(Math.random() * 10000); // essentials
    
    assignedClients.push({
      client,
      needs,
      leadAdvisorId: advisorId,
      fitScore,
      annualFee,
    });
  }

  return assignedClients;
}

// Find better matching advisors for a client
export interface TransferRecommendation {
  client: Client;
  currentScore: number;
  betterAdvisor: AdvisorWithProfile;
  newScore: number;
  improvement: number;
  reasons: string[];
}

export function getTransferRecommendations(advisorId: string): TransferRecommendation[] {
  const currentAdvisor = SEED_ADVISORS.find((a) => a.id === advisorId);
  if (!currentAdvisor) return [];

  const clientBook = getAdvisorClientBook(advisorId);
  const recommendations: TransferRecommendation[] = [];

  clientBook.forEach(({ client, needs, fitScore }) => {
    // Find better matching advisors
    const otherAdvisors = SEED_ADVISORS.filter((a) => 
      a.id !== advisorId && 
      a.capacityPercentage < 85 // Only suggest if they have capacity
    );

    let bestMatch: { advisor: AdvisorWithProfile; score: number } | null = null;

    otherAdvisors.forEach((advisor) => {
      const score = calculateClientFitScore(advisor, needs);
      if (score > fitScore + 5 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { advisor, score };
      }
    });

    if (bestMatch && bestMatch.score > fitScore) {
      const improvement = bestMatch.score - fitScore;
      const reasons: string[] = [];

      // Generate reasons for the recommendation
      needs.slice(0, 3).forEach((need) => {
        const currentSkill = currentAdvisor.skills?.find((s) => s.subtopic_id === need.subtopic_id);
        const newSkill = bestMatch!.advisor.skills?.find((s) => s.subtopic_id === need.subtopic_id);
        
        if (newSkill && currentSkill && newSkill.skill_level > currentSkill.skill_level) {
          reasons.push(`${need.subtopic?.name || 'Unknown'}: ${newSkill.skill_level}/10 vs ${currentSkill.skill_level}/10`);
        }
      });

      if (bestMatch.advisor.capacityPercentage < currentAdvisor.capacityPercentage) {
        reasons.push(`Better capacity: ${bestMatch.advisor.capacityPercentage}% vs ${currentAdvisor.capacityPercentage}%`);
      }

      recommendations.push({
        client,
        currentScore: fitScore,
        betterAdvisor: bestMatch.advisor,
        newScore: bestMatch.score,
        improvement,
        reasons: reasons.slice(0, 3),
      });
    }
  });

  return recommendations.sort((a, b) => b.improvement - a.improvement);
}

// Calculate book statistics
export interface BookStats {
  totalClients: number;
  averageScore: number;
  feeWeightedScore: number;
  totalAnnualFees: number;
  excellentMatches: number;
  goodMatches: number;
  poorMatches: number;
  potentialScoreAfterOptimization: number;
}

export function getBookStats(advisorId: string): BookStats {
  const clientBook = getAdvisorClientBook(advisorId);
  const recommendations = getTransferRecommendations(advisorId);
  
  if (clientBook.length === 0) {
    return {
      totalClients: 0,
      averageScore: 0,
      feeWeightedScore: 0,
      totalAnnualFees: 0,
      excellentMatches: 0,
      goodMatches: 0,
      poorMatches: 0,
      potentialScoreAfterOptimization: 0,
    };
  }

  const scores = clientBook.map((c) => c.fitScore);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  // Calculate fee-weighted fit score
  const totalFees = clientBook.reduce((sum, c) => sum + (c.annualFee || 0), 0);
  const feeWeightedScore = totalFees > 0
    ? Math.round(clientBook.reduce((sum, c) => sum + (c.fitScore * (c.annualFee || 0)), 0) / totalFees)
    : averageScore;
  
  // Calculate potential score if we transfer recommended clients
  const clientsToKeep = clientBook.filter(
    (c) => !recommendations.find((r) => r.client.id === c.client.id)
  );
  
  const keptScores = clientsToKeep.map((c) => c.fitScore);
  const potentialScoreAfterOptimization = keptScores.length > 0
    ? Math.round(keptScores.reduce((a, b) => a + b, 0) / keptScores.length)
    : averageScore;

  return {
    totalClients: clientBook.length,
    averageScore,
    feeWeightedScore,
    totalAnnualFees: totalFees,
    excellentMatches: scores.filter((s) => s >= 80).length,
    goodMatches: scores.filter((s) => s >= 60 && s < 80).length,
    poorMatches: scores.filter((s) => s < 60).length,
    potentialScoreAfterOptimization,
  };
}

// Aggregate stats for all advisors (for summary cards)
export function getAggregateStats() {
  let totalClients = 0;
  let totalFitScoreSum = 0;
  let totalFeeWeightedScoreSum = 0;
  let totalAnnualFees = 0;
  let advisorCount = 0;

  SEED_ADVISORS.forEach((advisor) => {
    const stats = getBookStats(advisor.id);
    totalClients += stats.totalClients;
    totalFitScoreSum += stats.averageScore;
    totalFeeWeightedScoreSum += stats.feeWeightedScore * stats.totalAnnualFees;
    totalAnnualFees += stats.totalAnnualFees;
    advisorCount++;
  });

  return {
    totalClients,
    avgFitScore: advisorCount > 0 ? Math.round(totalFitScoreSum / advisorCount) : 0,
    feeWeightedFitScore: totalAnnualFees > 0 ? Math.round(totalFeeWeightedScoreSum / totalAnnualFees) : 0,
    totalAnnualFees,
  };
}
