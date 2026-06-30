interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-danger",
    neutral: "text-text-muted",
  }[changeType];

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      {change && (
        <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
      )}
    </div>
  );
}
