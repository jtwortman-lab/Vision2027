import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncomeTrajectoryChartProps {
  advisorId: string;
  advisorName: string;
}

// Generate realistic income data for the past 10 years
const generateIncomeData = (advisorId: string) => {
  // Use advisor ID to seed consistent random data
  const seed = advisorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min) + min);
  };

  const currentYear = new Date().getFullYear();
  const data = [];

  // Base values that grow over time
  let leadBase = random(150000, 300000);
  let backupBase = random(30000, 80000);
  let originationBase = random(20000, 60000);

  for (let i = 9; i >= 0; i--) {
    const year = currentYear - i;
    
    // Add some growth and variation
    const growthFactor = 1 + (9 - i) * 0.08; // ~8% annual growth
    const variation = 0.85 + random(0, 30, i) / 100; // 85-115% variation
    
    const lead = Math.round(leadBase * growthFactor * variation);
    const backup = Math.round(backupBase * growthFactor * (0.9 + random(0, 20, i + 100) / 100));
    const origination = Math.round(originationBase * growthFactor * (0.8 + random(0, 40, i + 200) / 100));
    
    data.push({
      year: year.toString(),
      Lead: lead,
      Backup: backup,
      Origination: origination,
      total: lead + backup + origination,
    });
  }

  return data;
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
};

type IncomeType = 'Lead' | 'Backup' | 'Origination';

export function IncomeTrajectoryChart({ advisorId, advisorName }: IncomeTrajectoryChartProps) {
  const data = useMemo(() => generateIncomeData(advisorId), [advisorId]);
  const [hiddenSeries, setHiddenSeries] = useState<Set<IncomeType>>(new Set());

  const latestYear = data[data.length - 1];
  const previousYear = data[data.length - 2];
  const yoyGrowth = previousYear 
    ? Math.round(((latestYear.total - previousYear.total) / previousYear.total) * 100)
    : 0;

  const handleLegendClick = (dataKey: IncomeType) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const renderLegend = () => {
    const items: { key: IncomeType; color: string; label: string }[] = [
      { key: 'Lead', color: 'hsl(var(--primary))', label: 'Lead' },
      { key: 'Backup', color: 'hsl(var(--success))', label: 'Backup' },
      { key: 'Origination', color: 'hsl(var(--warning))', label: 'Origination' },
    ];

    return (
      <div className="flex justify-center gap-6 mt-4">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => handleLegendClick(item.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all hover:bg-muted ${
              hiddenSeries.has(item.key) ? 'opacity-40' : ''
            }`}
          >
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className={`text-sm font-medium ${hiddenSeries.has(item.key) ? 'line-through' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  // Calculate visible total for each bar
  const dataWithVisibleTotal = data.map(d => ({
    ...d,
    visibleTotal: 
      (hiddenSeries.has('Lead') ? 0 : d.Lead) +
      (hiddenSeries.has('Backup') ? 0 : d.Backup) +
      (hiddenSeries.has('Origination') ? 0 : d.Origination),
  }));


  const renderDataTable = () => {
    const incomeTypes: { key: IncomeType; label: string; color: string }[] = [
      { key: 'Lead', label: 'Lead', color: 'text-primary' },
      { key: 'Backup', label: 'Backup', color: 'text-success' },
      { key: 'Origination', label: 'Origination', color: 'text-warning' },
    ];

    // Calculate YoY % change for each income type
    const calculateYoY = (type: IncomeType) => {
      if (hiddenSeries.has(type)) return null;
      const latest = latestYear[type];
      const previous = previousYear[type];
      if (!previous) return null;
      return Math.round(((latest - previous) / previous) * 100);
    };

    // Calculate total YoY based on visible series
    const calculateTotalYoY = () => {
      const latestVisible = 
        (hiddenSeries.has('Lead') ? 0 : latestYear.Lead) +
        (hiddenSeries.has('Backup') ? 0 : latestYear.Backup) +
        (hiddenSeries.has('Origination') ? 0 : latestYear.Origination);
      const previousVisible = 
        (hiddenSeries.has('Lead') ? 0 : previousYear.Lead) +
        (hiddenSeries.has('Backup') ? 0 : previousYear.Backup) +
        (hiddenSeries.has('Origination') ? 0 : previousYear.Origination);
      if (!previousVisible) return null;
      return Math.round(((latestVisible - previousVisible) / previousVisible) * 100);
    };

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-1 font-medium text-muted-foreground w-24">Type</th>
              {dataWithVisibleTotal.map(d => (
                <th key={d.year} className="text-right py-2 px-1 font-medium text-muted-foreground">
                  {d.year.slice(-2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incomeTypes.map(type => {
              if (hiddenSeries.has(type.key)) return null;
              return (
                <tr key={type.key} className="border-b border-muted/50">
                  <td className={`py-1.5 px-1 font-medium ${type.color}`}>{type.label}</td>
                  {data.map(d => (
                    <td key={d.year} className="text-right py-1.5 px-1 tabular-nums">
                      {formatCurrencyShort(d[type.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="bg-muted/30 font-semibold">
              <td className="py-2 px-1">Total</td>
              {dataWithVisibleTotal.map(d => (
                <td key={d.year} className="text-right py-2 px-1 tabular-nums">
                  {formatCurrencyShort(d.visibleTotal)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="py-2 px-1 font-medium text-muted-foreground">YoY %</td>
              {dataWithVisibleTotal.map((d, index) => {
                if (index === 0) {
                  return (
                    <td key={d.year} className="text-right py-2 px-1 text-muted-foreground">
                      —
                    </td>
                  );
                }
                const prevData = dataWithVisibleTotal[index - 1];
                const yoyChange = prevData.visibleTotal > 0 
                  ? Math.round(((d.visibleTotal - prevData.visibleTotal) / prevData.visibleTotal) * 100)
                  : null;
                return (
                  <td key={d.year} className={`text-right py-2 px-1 tabular-nums font-medium ${
                    yoyChange !== null && yoyChange >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {yoyChange !== null ? `${yoyChange >= 0 ? '+' : ''}${yoyChange}%` : '—'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Income Trajectory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataWithVisibleTotal} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {!hiddenSeries.has('Lead') && (
                <Bar 
                  dataKey="Lead" 
                  stackId="income" 
                  fill="hsl(var(--primary))" 
                  name="Lead"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {!hiddenSeries.has('Backup') && (
                <Bar 
                  dataKey="Backup" 
                  stackId="income" 
                  fill="hsl(var(--success))" 
                  name="Backup"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {!hiddenSeries.has('Origination') && (
                <Bar 
                  dataKey="Origination" 
                  stackId="income" 
                  fill="hsl(var(--warning))" 
                  name="Origination"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="visibleTotal" 
                    position="top" 
                    formatter={formatCurrencyShort}
                    style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </Bar>
              )}
              {/* If Origination is hidden but others visible, show label on top-most visible bar */}
              {hiddenSeries.has('Origination') && !hiddenSeries.has('Backup') && (
                <Bar 
                  dataKey="Backup" 
                  stackId="income" 
                  fill="hsl(var(--success))" 
                  name="Backup"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="visibleTotal" 
                    position="top" 
                    formatter={formatCurrencyShort}
                    style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </Bar>
              )}
              {hiddenSeries.has('Origination') && hiddenSeries.has('Backup') && !hiddenSeries.has('Lead') && (
                <Bar 
                  dataKey="Lead" 
                  stackId="income" 
                  fill="hsl(var(--primary))" 
                  name="Lead"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="visibleTotal" 
                    position="top" 
                    formatter={formatCurrencyShort}
                    style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {renderLegend()}
        {renderDataTable()}
      </CardContent>
    </Card>
  );
}
