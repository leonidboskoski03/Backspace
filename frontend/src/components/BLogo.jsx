export function BLogo({ className = 'w-8 h-8' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-emerald-500" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-white font-bold leading-none"
        style={{ fontFamily: 'system-ui, sans-serif', fontSize: 18 }}
      >
        B
      </text>
    </svg>
  )
}
