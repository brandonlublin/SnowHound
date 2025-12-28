import { CardSkeleton, ForecastSkeleton, LocationSkeleton, TableSkeleton } from './skeletons';

interface SkeletonLoaderProps {
  type?: 'card' | 'forecast' | 'location' | 'table';
  count?: number;
}

export default function SkeletonLoader({ type = 'card', count = 1 }: SkeletonLoaderProps) {
  const SkeletonComponent = {
    card: CardSkeleton,
    forecast: ForecastSkeleton,
    location: LocationSkeleton,
    table: TableSkeleton,
  }[type];

  if (count === 1) {
    return <SkeletonComponent />;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

