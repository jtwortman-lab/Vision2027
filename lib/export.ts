import type { AdvisorWithProfile, ClientWithNeeds, MatchScore } from '@/types/database';
import { showLoading, showSuccess, showError, dismissToast } from './toasts';

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  
  const dataRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      
      return value;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ============================================================================
// ADVISOR EXPORTS
// ============================================================================

export async function exportAdvisorsToCSV(advisors: AdvisorWithProfile[]) {
  const toastId = showLoading('Exporting Advisors', 'Preparing CSV file...');
  
  try {
    const data = advisors.map((advisor) => ({
      Name: advisor.profile.full_name,
      Email: advisor.profile.email,
      Office: advisor.profile.office || '',
      Team: advisor.profile.team || '',
      'Years Experience': advisor.years_experience,
      'Max Capacity': advisor.max_families,
      'Current Families': advisor.current_families,
      'Capacity %': advisor.capacityPercentage.toFixed(1),
      'Target Segment': advisor.target_segment,
      'Availability': advisor.availability_status,
      Certifications: advisor.certifications.join('; '),
      'Skills Count': advisor.skills?.length || 0,
    }));
    
    const csv = convertToCSV(data, Object.keys(data[0]));
    const filename = `advisors-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, csv);
    
    dismissToast(toastId);
    showSuccess('Export Complete', `${advisors.length} advisors exported`);
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export advisors');
    console.error('Export error:', error);
  }
}

export async function exportAdvisorSkillsToCSV(advisor: AdvisorWithProfile) {
  const toastId = showLoading('Exporting Skills', 'Preparing CSV file...');
  
  try {
    const data = (advisor.skills || []).map((skill) => ({
      Domain: skill.subtopic?.domain?.name || '',
      Subtopic: skill.subtopic?.name || '',
      'Skill Level': skill.skill_level,
      'Case Count': skill.case_count,
      Evidence: skill.evidence || '',
      'Last Assessed': skill.last_assessed_at || '',
    }));
    
    const csv = convertToCSV(data, Object.keys(data[0] || {}));
    const filename = `${advisor.profile.full_name.replace(/\s+/g, '-')}-skills-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, csv);
    
    dismissToast(toastId);
    showSuccess('Export Complete', `${data.length} skills exported`);
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export skills');
    console.error('Export error:', error);
  }
}

// ============================================================================
// CLIENT EXPORTS
// ============================================================================

export async function exportClientsToCSV(clients: ClientWithNeeds[]) {
  const toastId = showLoading('Exporting Clients', 'Preparing CSV file...');
  
  try {
    const data = clients.map((client) => ({
      Name: client.name,
      Segment: client.segment,
      'Complexity Tier': client.complexity_tier,
      'AUM Band': client.aum_band || '',
      'Net Worth Band': client.net_worth_band || '',
      Office: client.office || '',
      City: client.city || '',
      State: client.state || '',
      'Is Prospect': client.is_prospect ? 'Yes' : 'No',
      'Needs Count': client.needs?.length || 0,
      'Client Since': client.valeo_client_since || '',
    }));
    
    const csv = convertToCSV(data, Object.keys(data[0]));
    const filename = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, csv);
    
    dismissToast(toastId);
    showSuccess('Export Complete', `${clients.length} clients exported`);
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export clients');
    console.error('Export error:', error);
  }
}

export async function exportClientNeedsToCSV(client: ClientWithNeeds) {
  const toastId = showLoading('Exporting Needs', 'Preparing CSV file...');
  
  try {
    const data = (client.needs || []).map((need) => ({
      Domain: need.subtopic?.domain?.name || '',
      Subtopic: need.subtopic?.name || '',
      Importance: need.importance,
      Urgency: need.urgency,
      Horizon: need.horizon,
      Notes: need.notes || '',
    }));
    
    const csv = convertToCSV(data, Object.keys(data[0] || {}));
    const filename = `${client.name.replace(/\s+/g, '-')}-needs-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, csv);
    
    dismissToast(toastId);
    showSuccess('Export Complete', `${data.length} needs exported`);
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export needs');
    console.error('Export error:', error);
  }
}

// ============================================================================
// MATCH EXPORTS
// ============================================================================

export async function exportMatchResultsToCSV(matches: MatchScore[], clientName: string) {
  const toastId = showLoading('Exporting Matches', 'Preparing CSV file...');
  
  try {
    const data = matches.map((match) => ({
      Advisor: match.advisor.profile.full_name,
      'Lead Score': match.leadScore,
      'Backup Score': match.backupScore,
      'Support Score': match.supportScore,
      'Confidence': match.confidenceScore,
      'Skill Coverage %': match.metrics.skillCoverage,
      'Avg Skill Gap': match.metrics.averageSkillGap,
      'Capacity %': match.metrics.capacityUtilization,
      'Experience Level': match.metrics.experienceLevel,
      'Years Experience': match.advisor.years_experience,
      Office: match.advisor.profile.office || '',
      'Current Families': match.advisor.current_families,
      'Max Families': match.advisor.max_families,
      'Top Drivers': match.explanation.top_drivers.join('; '),
      Gaps: match.explanation.gaps.join('; '),
    }));
    
    const csv = convertToCSV(data, Object.keys(data[0]));
    const filename = `match-results-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, csv);
    
    dismissToast(toastId);
    showSuccess('Export Complete', `${matches.length} matches exported`);
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export matches');
    console.error('Export error:', error);
  }
}

// ============================================================================
// DETAILED MATCH REPORT (with skill breakdown)
// ============================================================================

export async function exportDetailedMatchReport(match: MatchScore, clientName: string) {
  const toastId = showLoading('Exporting Report', 'Preparing detailed match report...');
  
  try {
    // Header information
    const header = [
      `Match Report: ${match.advisor.profile.full_name} → ${clientName}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '=== OVERALL SCORES ===',
      `Lead Score: ${match.leadScore}`,
      `Backup Score: ${match.backupScore}`,
      `Support Score: ${match.supportScore}`,
      `Confidence: ${match.confidenceScore}%`,
      '',
      '=== METRICS ===',
      `Skill Coverage: ${match.metrics.skillCoverage}%`,
      `Average Skill Gap: ${match.metrics.averageSkillGap}`,
      `Capacity Utilization: ${match.metrics.capacityUtilization}%`,
      `Experience Level: ${match.metrics.experienceLevel}`,
      '',
      '=== TOP DRIVERS ===',
      ...match.explanation.top_drivers.map((d) => `• ${d}`),
      '',
      '=== GAPS ===',
      ...match.explanation.gaps.map((g) => `• ${g}`),
      '',
      '=== CONFIDENCE FACTORS ===',
      ...match.explanation.confidence_factors.map((c) => `• ${c}`),
      '',
      '=== SKILL BREAKDOWN ===',
      '',
    ].join('\n');
    
    // Skill details
    const skillData = match.skillMatches.map((skill) => ({
      Domain: skill.domainName,
      Subtopic: skill.subtopicName,
      Required: skill.required,
      Actual: skill.actual,
      'Match Quality': skill.matchQuality,
      Contribution: skill.contribution.toFixed(2),
      Gap: skill.isGap ? 'Yes' : 'No',
      Overskill: skill.isOverskill ? 'Yes' : 'No',
    }));
    
    const skillCSV = convertToCSV(skillData, Object.keys(skillData[0]));
    
    const fullReport = header + '\n' + skillCSV;
    
    const filename = `match-report-${match.advisor.profile.full_name.replace(/\s+/g, '-')}-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, fullReport);
    
    dismissToast(toastId);
    showSuccess('Export Complete', 'Detailed match report exported');
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export report');
    console.error('Export error:', error);
  }
}

// ============================================================================
// TEAM ANALYTICS EXPORT
// ============================================================================

export async function exportTeamAnalytics(advisors: AdvisorWithProfile[]) {
  const toastId = showLoading('Exporting Analytics', 'Preparing analytics export...');
  
  try {
    // Calculate team metrics
    const totalCapacity = advisors.reduce((sum, a) => sum + a.max_families, 0);
    const totalUsed = advisors.reduce((sum, a) => sum + a.current_families, 0);
    const avgUtilization = (totalUsed / totalCapacity) * 100;
    const atCapacity = advisors.filter((a) => a.capacityPercentage >= 100).length;
    const nearCapacity = advisors.filter((a) => a.capacityPercentage >= 80 && a.capacityPercentage < 100).length;
    
    const summary = [
      '=== TEAM ANALYTICS SUMMARY ===',
      `Report Date: ${new Date().toLocaleString()}`,
      '',
      '=== CAPACITY OVERVIEW ===',
      `Total Team Capacity: ${totalCapacity} families`,
      `Current Utilization: ${totalUsed} families (${avgUtilization.toFixed(1)}%)`,
      `Available Capacity: ${totalCapacity - totalUsed} families`,
      `Advisors at Capacity: ${atCapacity}`,
      `Advisors Near Capacity (80%+): ${nearCapacity}`,
      '',
      '=== ADVISOR DETAILS ===',
      '',
    ].join('\n');
    
    const advisorData = advisors.map((advisor) => ({
      Name: advisor.profile.full_name,
      Office: advisor.profile.office || '',
      'Capacity %': advisor.capacityPercentage.toFixed(1),
      'Current/Max': `${advisor.current_families}/${advisor.max_families}`,
      'Years Exp': advisor.years_experience,
      'Skills Count': advisor.skills?.length || 0,
      'Avg Skill Level': advisor.skills && advisor.skills.length > 0
        ? (advisor.skills.reduce((sum, s) => sum + s.skill_level, 0) / advisor.skills.length).toFixed(1)
        : '0',
      Status: advisor.availability_status,
    }));
    
    const csv = convertToCSV(advisorData, Object.keys(advisorData[0]));
    const fullReport = summary + csv;
    
    const filename = `team-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(filename, fullReport);
    
    dismissToast(toastId);
    showSuccess('Export Complete', 'Team analytics exported');
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export analytics');
    console.error('Export error:', error);
  }
}

// ============================================================================
// GENERIC EXPORT FUNCTION
// ============================================================================

export async function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
) {
  const toastId = showLoading('Exporting Data', 'Preparing CSV file...');
  
  try {
    const columns = headers || (data.length > 0 ? Object.keys(data[0]) : []);
    const csv = convertToCSV(data, columns);
    const fullFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    
    downloadCSV(fullFilename, csv);
    
    dismissToast(toastId);
    showSuccess('Export Complete', `${data.length} rows exported`);
  } catch (error) {
    dismissToast(toastId);
    showError('Export Failed', 'Failed to export data');
    console.error('Export error:', error);
  }
}
