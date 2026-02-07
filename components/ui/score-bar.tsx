import { cn } from '@/lib/utils';

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBar({ score, maxScore = 100, showLabel = false, size = 'md', className }: ScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  const getColor = () => {
    if (percentage >= 80) return 'bg-score-excellent';
    if (percentage >= 60) return 'bg-score-good';
    if (percentage >= 40) return 'bg-score-moderate';
    return 'bg-score-poor';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('score-bar', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{score}</span>
          <span>{maxScore}</span>
        </div>
      )}
    </div>
  );
}
