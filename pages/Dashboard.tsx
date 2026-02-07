import { useState } from 'react';
import { TeamOverviewStats } from '@/components/dashboard/manager/TeamOverviewStats';
import { TeamPerformanceCard } from '@/components/dashboard/manager/TeamPerformanceCard';
import { SkillDevelopmentCard } from '@/components/dashboard/manager/SkillDevelopmentCard';
import { PracticeGrowthCard } from '@/components/dashboard/manager/PracticeGrowthCard';
import { ActionItemsCard } from '@/components/dashboard/manager/ActionItemsCard';
import { ClientFitDistributionCard } from '@/components/dashboard/manager/ClientFitDistributionCard';
import { CapacityOverview } from '@/components/dashboard/CapacityOverview';
import { ProspectQueue } from '@/components/dashboard/ProspectQueue';
import { ADMSelector } from '@/components/dashboard/manager/ADMSelector';

export default function Dashboard() {
  const [selectedADM, setSelectedADM] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Oversee advisor performance, skill development, and practice growth across your team.
          </p>
        </div>
        <ADMSelector selectedADM={selectedADM} onSelectADM={setSelectedADM} />
      </div>

      {/* Team Overview Stats */}
      <TeamOverviewStats selectedADM={selectedADM} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Action Items & Performance */}
        <div className="space-y-6">
          <ActionItemsCard selectedADM={selectedADM} />
          <TeamPerformanceCard selectedADM={selectedADM} />
        </div>

        {/* Middle Column - Client Fit & Growth */}
        <div className="space-y-6">
          <ClientFitDistributionCard selectedADM={selectedADM} />
          <PracticeGrowthCard selectedADM={selectedADM} />
        </div>

        {/* Right Column - Skills & Capacity */}
        <div className="space-y-6">
          <SkillDevelopmentCard selectedADM={selectedADM} />
          <CapacityOverview selectedADM={selectedADM} />
        </div>
      </div>

      {/* Prospect Queue - Full Width */}
      <ProspectQueue />
    </div>
  );
}
