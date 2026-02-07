import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// CARD SKELETONS
// ============================================================================

export const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-[200px]" />
      <Skeleton className="h-4 w-[300px] mt-2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-[100px] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </CardContent>
  </Card>
);

export const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-[120px]" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-[80px] mb-2" />
      <Skeleton className="h-3 w-[150px]" />
    </CardContent>
  </Card>
);

export const ChartCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-[180px]" />
      <Skeleton className="h-4 w-[250px] mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </CardContent>
  </Card>
);

// ============================================================================
// TABLE SKELETONS
// ============================================================================

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 items-center">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DataTableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="rounded-md border">
    <div className="p-4 border-b">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
    <TableSkeleton rows={rows} columns={5} />
  </div>
);

// ============================================================================
// LIST SKELETONS
// ============================================================================

export const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-3 w-[150px]" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
  <div className="rounded-md border">
    {Array.from({ length: items }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
);

// ============================================================================
// ADVISOR SKELETONS
// ============================================================================

export const AdvisorCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-[120px]" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
    </CardContent>
  </Card>
);

export const AdvisorListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <AdvisorCardSkeleton key={i} />
    ))}
  </div>
);

// ============================================================================
// MATCH RESULT SKELETONS
// ============================================================================

export const MatchResultSkeleton = () => (
  <Card className="relative overflow-hidden">
    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary/20 to-primary/5" />
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[180px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-8 w-16 ml-auto" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-[95%]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const MatchResultsSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <MatchResultSkeleton key={i} />
    ))}
  </div>
);

// ============================================================================
// DASHBOARD SKELETONS
// ============================================================================

export const DashboardStatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
  </div>
);

export const DashboardGridSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="space-y-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="space-y-6">
      <ChartCardSkeleton />
      <CardSkeleton />
    </div>
    <div className="space-y-6">
      <CardSkeleton />
      <ChartCardSkeleton />
    </div>
  </div>
);

// ============================================================================
// FORM SKELETONS
// ============================================================================

export const FormFieldSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-[100px]" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <FormFieldSkeleton key={i} />
    ))}
    <Skeleton className="h-10 w-[120px]" />
  </div>
);

// ============================================================================
// CLIENT SKELETONS
// ============================================================================

export const ClientCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// DETAIL PAGE SKELETONS
// ============================================================================

export const DetailPageSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-5 w-[180px]" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-[120px]" />
    </div>

    {/* Stats */}
    <DashboardStatsSkeleton />

    {/* Content Grid */}
    <div className="grid gap-6 md:grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
      <ChartCardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

// ============================================================================
// EMPTY STATE (not skeleton, but useful)
// ============================================================================

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>}
    {action}
  </div>
);
