'use client';

import { getRating as getCoreRating } from '@aiready/core/client';
import { cn } from '../utils/cn';

export type ScoreRating = 'excellent' | 'good' | 'fair' | 'needs-work' | 'critical';

export interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label: string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ratingConfig: Record<ScoreRating, { color: string; bgColor: string; label: string }> = {
  excellent: { color: 'bg-green-500', bgColor: 'bg-green-100', label: 'Excellent' },
  good: { color: 'bg-emerald-500', bgColor: 'bg-emerald-100', label: 'Good' },
  fair: { color: 'bg-amber-500', bgColor: 'bg-amber-100', label: 'Fair' },
  'needs-work': { color: 'bg-orange-500', bgColor: 'bg-orange-100', label: 'Needs Work' },
  critical: { color: 'bg-red-500', bgColor: 'bg-red-100', label: 'Critical' },
};

// Convert Title Case rating from core to lowercase for component use
function getRating(score: number): ScoreRating {
  const coreRating = getCoreRating(score);
  const ratingMap: Record<string, ScoreRating> = {
    'Excellent': 'excellent',
    'Good': 'good',
    'Fair': 'fair',
    'Needs Work': 'needs-work',
    'Critical': 'critical',
  };
  return ratingMap[coreRating] || 'critical';
}

const sizeConfig = {
  sm: { height: 'h-1.5', text: 'text-xs', score: 'text-sm' },
  md: { height: 'h-2', text: 'text-sm', score: 'text-base' },
  lg: { height: 'h-3', text: 'text-base', score: 'text-lg' },
};

export function ScoreBar({
  score,
  maxScore = 100,
  label,
  showScore = true,
  size = 'md',
  className,
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const rating = getRating(percentage);
  const config = ratingConfig[rating];
  const sizes = sizeConfig[size];

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className={cn('text-slate-700', sizes.text)}>{label}</span>
        {showScore && (
          <span className={cn('font-bold text-slate-900', sizes.score)}>
            {score}/{maxScore}
          </span>
        )}
      </div>
      <div className={cn('w-full rounded-full bg-slate-200', sizes.height)}>
        <div
          className={cn('rounded-full transition-all duration-500', config.color, sizes.height)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface ScoreCardProps {
  score: number;
  title?: string;
  breakdown?: Array<{
    label: string;
    score: number;
    weight?: number;
  }>;
  className?: string;
}

export function ScoreCard({ score, title, breakdown, className }: ScoreCardProps) {
  const rating = getRating(score);
  const config = ratingConfig[rating];

  return (
    <div className={cn('rounded-xl border-2 border-slate-200 bg-white p-6 shadow-lg', className)}>
      <div className="mb-4">
        <div className="text-4xl font-black text-slate-900">{score}/100</div>
        <div className={cn('text-lg font-bold', `text-${rating === 'excellent' ? 'green' : rating === 'good' ? 'emerald' : rating === 'fair' ? 'amber' : rating === 'needs-work' ? 'orange' : 'red'}-600`)}>
          {config.label} Rating
        </div>
        {title && <p className="text-sm text-slate-600 mt-1">{title}</p>}
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <ScoreBar
              key={index}
              score={item.score}
              label={item.label}
              size="sm"
            />
          ))}
        </div>
      )}

      {breakdown && breakdown.length > 0 && (
        <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
          <strong>Formula:</strong> {breakdown.map(item => 
            `${item.score}×${item.weight || 1}`
          ).join(' + ')} / 100 = {score}
        </div>
      )}
    </div>
  );
}
