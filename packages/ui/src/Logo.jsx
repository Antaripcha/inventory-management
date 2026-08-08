export function Logo({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" className="fill-current opacity-10" />
      <path
        d="M8 12L16 8L24 12V22L16 26L8 22V12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 12L16 16L24 12M16 16V26" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
