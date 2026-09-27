export type IconProps = { size?: number };

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function BellIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function CalendarIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function TrashIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function PowerIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 2v9" />
      <path d="M6.5 5.5a8 8 0 1 0 11 0" />
    </svg>
  );
}

export function KeyIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.5 12.5 20 3" />
      <path d="M16 7l3 3M13 10l2.5 2.5" />
    </svg>
  );
}

export function UnlockIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
    </svg>
  );
}

export function HomeIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function UsersIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 6.2" />
      <path d="M15.5 14c2.9.3 5 2 5.5 6" />
    </svg>
  );
}

export function GraduationCapIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M2 8l10-4 10 4-10 4-10-4Z" />
      <path d="M6 10.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5" />
      <path d="M22 8v6" />
    </svg>
  );
}

export function StethoscopeIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M5 3v6a4 4 0 0 0 8 0V3" />
      <path d="M9 13v2a5 5 0 0 0 10 0v-2.5" />
      <circle cx="19" cy="9" r="1.8" />
    </svg>
  );
}

export function TagIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12.5 3H5a2 2 0 0 0-2 2v7.5a2 2 0 0 0 .59 1.41l8.5 8.5a2 2 0 0 0 2.82 0l7-7a2 2 0 0 0 0-2.82l-8.5-8.5A2 2 0 0 0 12.5 3Z" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BankIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v9M10 10v9M14 10v9M19 10v9" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function ChartIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function BuildingIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </svg>
  );
}

export function TeamIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="7" cy="8" r="3" />
      <circle cx="17" cy="8" r="3" />
      <path d="M2 20a5 5 0 0 1 10 0" />
      <path d="M12 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

export function MessageIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5h16v11H8l-4 4Z" />
    </svg>
  );
}

export function ClipboardIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="6" y="4" width="12" height="17" rx="1.5" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

export function GearIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  );
}

export function SearchIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function ToothIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3c-2.5 0-3.5 1.5-5 1.5S4 3 3 3c-1.2 0-1.5 2-1.2 4.5.3 2.3 1.2 4.5 1.7 7 .3 1.6.9 3.5 2 3.5 1.3 0 1-4 2.5-4s1.2 4 2.5 4c1.1 0 1.7-1.9 2-3.5.5-2.5 1.4-4.7 1.7-7C14.5 5 14.2 3 13 3c-1 0-1.5.5-1 0" />
    </svg>
  );
}

export function SparkleIcon({ size }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
    </svg>
  );
}
