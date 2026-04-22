// Discreet payment trust indicator shown below the Premium CTA on /tarifs.
// Inline SVGs (no external images) to avoid extra network requests and
// layout shift. Colors are subtle — we want "reassuring", not "pushy".

export function PaymentBadge() {
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <LockIcon />
        <span>Paiement sécurisé par Stripe</span>
      </div>
      <div className="flex items-center gap-2 opacity-70">
        <StripeLogo />
        <span className="w-px h-3 bg-gray-200" aria-hidden />
        <VisaLogo />
        <MastercardLogo />
        <AmexLogo />
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 7V5a4 4 0 1 1 8 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg
      width="34"
      height="14"
      viewBox="0 0 60 25"
      fill="none"
      aria-label="Stripe"
      role="img"
    >
      <path
        d="M59.5 12.9c0-4.3-2.1-7.7-6.1-7.7s-6.4 3.4-6.4 7.7c0 5.1 2.9 7.7 7 7.7 2 0 3.5-.5 4.7-1.1v-3.4c-1.2.6-2.5 1-4.2 1-1.7 0-3.1-.6-3.3-2.6h8.3v-1.6zm-8.4-1.6c0-1.9 1.2-2.7 2.3-2.7s2.2.8 2.2 2.7h-4.5zM42.6 5.2c-1.6 0-2.7.8-3.3 1.3l-.2-1h-3.7v19.7l4.2-.9v-4.8c.6.5 1.5 1.1 3 1.1 3 0 5.7-2.4 5.7-7.8 0-4.9-2.8-7.6-5.7-7.6zm-1 11.6c-1 0-1.6-.4-2-.8l0-6.5c.5-.5 1.1-.8 2-.8 1.5 0 2.6 1.7 2.6 4 0 2.4-1 4.1-2.6 4.1zM28.7 4.1l4.2-.9V.1L28.7 1v3.1zM28.7 5.5h4.2v14.9h-4.2V5.5zM24.2 6.7l-.3-1.2h-3.6v14.9h4.2v-10.1c1-1.3 2.7-1.1 3.2-.9V5.5c-.5-.2-2.5-.5-3.5 1.2zM15.7 1.8l-4.1.9-.0 13.7c0 2.5 1.9 4.4 4.4 4.4 1.4 0 2.4-.3 3-.6v-3.4c-.5.2-3.2 1-3.2-1.5V9.1h3.2V5.5h-3.2l0-3.7zM4.3 9.8c0-.7.5-.9 1.4-.9 1.3 0 2.9.4 4.1 1V5.9c-1.4-.5-2.8-.8-4.1-.8C2.3 5.2 0 6.9 0 9.8c0 4.6 6.2 3.9 6.2 5.8 0 .8-.7 1-1.7 1-1.4 0-3.3-.6-4.6-1.4v4c1.4.6 2.9.9 4.6.9 3.4 0 5.8-1.7 5.8-4.6C10.4 10.6 4.3 11.5 4.3 9.8z"
        fill="#635bff"
      />
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg
      width="28"
      height="14"
      viewBox="0 0 48 16"
      fill="none"
      aria-label="Visa"
      role="img"
    >
      <rect width="48" height="16" rx="2" fill="#1a1f71" />
      <text
        x="24"
        y="11.5"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="8.5"
        fill="#fff"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg
      width="22"
      height="14"
      viewBox="0 0 32 20"
      fill="none"
      aria-label="Mastercard"
      role="img"
    >
      <circle cx="12" cy="10" r="8" fill="#eb001b" />
      <circle cx="20" cy="10" r="8" fill="#f79e1b" />
      <path
        d="M16 4.5a7.98 7.98 0 0 1 0 11 7.98 7.98 0 0 1 0-11z"
        fill="#ff5f00"
      />
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg
      width="28"
      height="14"
      viewBox="0 0 48 16"
      fill="none"
      aria-label="American Express"
      role="img"
    >
      <rect width="48" height="16" rx="2" fill="#2e77bc" />
      <text
        x="24"
        y="11"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="6.8"
        fill="#fff"
        letterSpacing="0.3"
      >
        AMEX
      </text>
    </svg>
  );
}
