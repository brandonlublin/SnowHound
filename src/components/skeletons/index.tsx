// Skeleton loading components for better UX

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-white/10 rounded w-full"></div>
        <div className="h-3 bg-white/10 rounded w-5/6"></div>
        <div className="h-3 bg-white/10 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function LocationSkeleton() {
  return (
    <div className="card mb-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="h-20 bg-white/10 rounded-lg"></div>
        <div className="h-20 bg-white/10 rounded-lg"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-white/10 rounded-lg w-32"></div>
        <div className="h-10 bg-white/10 rounded-lg w-32"></div>
        <div className="h-10 bg-white/10 rounded-lg w-32"></div>
      </div>
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-white/10 rounded w-48"></div>
        <div className="h-6 bg-white/10 rounded w-24"></div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 glass rounded-lg">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16">
                <div className="h-4 bg-white/10 rounded w-12 mb-1"></div>
                <div className="h-3 bg-white/10 rounded w-16"></div>
              </div>
              <div className="flex-1">
                <div className="h-6 bg-white/10 rounded w-20 mb-1"></div>
                <div className="h-3 bg-white/10 rounded w-32"></div>
              </div>
              <div className="w-24 h-2 bg-white/10 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card animate-pulse overflow-x-auto">
      <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="pb-3">
              <div className="h-4 bg-white/10 rounded w-16"></div>
            </th>
            {Array.from({ length: 3 }).map((_, i) => (
              <th key={i} className="pb-3 px-4">
                <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 7 }).map((_, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="py-3">
                <div className="h-4 bg-white/10 rounded w-24"></div>
              </td>
              {Array.from({ length: 3 }).map((_, j) => (
                <td key={j} className="py-3 px-4 text-center">
                  <div className="h-5 bg-white/10 rounded w-16 mx-auto mb-1"></div>
                  <div className="h-3 bg-white/10 rounded w-12 mx-auto"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-24"></div>
          </div>
          <div className="h-8 bg-white/10 rounded w-20 mb-1"></div>
          <div className="h-3 bg-white/10 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
}

export function ComparisonViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2">
        <div className="h-10 bg-white/10 rounded-lg w-24"></div>
        <div className="h-10 bg-white/10 rounded-lg w-24"></div>
        <div className="h-10 bg-white/10 rounded-lg w-24"></div>
      </div>
      <div className="card">
        <div className="h-64 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

