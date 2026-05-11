export const SkeletonCard = () => (
  <div className="glass rounded-2xl p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 skeleton rounded-xl" />
      <div className="w-16 h-6 skeleton rounded-lg" />
    </div>
    <div className="w-24 h-3 skeleton rounded mb-2" />
    <div className="w-32 h-8 skeleton rounded" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
    <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
    <div className="flex-1">
      <div className="w-32 h-4 skeleton rounded mb-2" />
      <div className="w-20 h-3 skeleton rounded" />
    </div>
    <div className="w-20 h-5 skeleton rounded" />
  </div>
);

export const SkeletonChart = () => (
  <div className="glass rounded-2xl p-6 animate-pulse">
    <div className="w-40 h-5 skeleton rounded mb-6" />
    <div className="h-48 skeleton rounded-xl" />
  </div>
);

export default function Skeleton({ className }) {
  return <div className={`skeleton ${className}`} />;
}
