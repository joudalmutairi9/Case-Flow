type Segment = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  centerLabel,
}: {
  segments: Segment[];
  centerLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const size = 168;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapPx = total > 0 ? 3 : 0;

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.value <= 0) return null;
              const segLength = (seg.value / total) * circumference;
              const dash = Math.max(segLength - gapPx, 0);
              const dashArray = `${dash} ${circumference - dash}`;
              const dashOffset = -offset;
              offset += segLength;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-card-foreground">{total}</span>
          <span className="text-xs text-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 1000) / 10 : 0;
          return (
            <li key={seg.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
                aria-hidden
              />
              <span className="text-card-foreground">{seg.label}</span>
              <span className="font-bold text-card-foreground">{seg.value}</span>
              <span className="text-xs text-muted">({pct}% من الإجمالي)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
