export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="#1d4ed8" />
      {/* Upward trend curve */}
      <path
        d="M5 21 Q9 21 13 15 Q17 9 22 6.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dot at the tip — the "tracker" marker */}
      <circle cx="22" cy="6.5" r="2.5" fill="white" />
    </svg>
  );
}

export function LogoWordmark({ iconSize = 28 }: { iconSize?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={iconSize} />
      <span className="text-[15px] font-bold tracking-tight text-gray-900">
        DCA<span className="font-normal text-gray-500 ml-1">Tracker</span>
      </span>
    </span>
  );
}
