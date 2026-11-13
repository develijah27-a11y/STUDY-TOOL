import React from "react";

interface IllustrationProps {
  className?: string;
}

/**
 * Editorial Illustration 1: University Notes & Solved Papers
 * Styled strictly in the brand palette: Deep Navy (#142B45), Academic Teal (#147D78), Muted Gold (#E9B949), Soft White (#F7F8FA).
 */
export function UniversityEditorialIllustration({ className = "w-full h-full" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="400" height="220" fill="#142B45" rx="16" />
      {/* Background scholarly geometry */}
      <circle cx="340" cy="40" r="80" fill="#1E3E62" fillOpacity="0.5" />
      <circle cx="50" cy="180" r="60" fill="#147D78" fillOpacity="0.2" />

      {/* Stacked Lecture Notes / Past Exam Papers */}
      <g transform="translate(110, 30)">
        {/* Back paper sheet */}
        <rect x="20" y="10" width="140" height="150" rx="8" fill="#F7F8FA" fillOpacity="0.2" />
        {/* Middle sheet */}
        <rect x="10" y="20" width="140" height="150" rx="8" fill="#F7F8FA" fillOpacity="0.4" />
        {/* Front publication book */}
        <rect x="0" y="30" width="145" height="150" rx="8" fill="#FFFFFF" />
        {/* Header bar on cover */}
        <rect x="0" y="30" width="145" height="34" rx="8" fill="#147D78" />
        <rect x="14" y="44" width="45" height="7" rx="3.5" fill="#E9B949" />
        <rect x="65" y="45" width="60" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Note lines */}
        <rect x="16" y="80" width="105" height="6" rx="3" fill="#142B45" />
        <rect x="16" y="94" width="112" height="5" rx="2.5" fill="#243244" fillOpacity="0.6" />
        <rect x="16" y="106" width="90" height="5" rx="2.5" fill="#243244" fillOpacity="0.6" />
        <rect x="16" y="118" width="100" height="5" rx="2.5" fill="#243244" fillOpacity="0.6" />

        {/* Marking Scheme Check Badge */}
        <circle cx="118" cy="148" r="16" fill="#E9B949" />
        <path
          d="M112 148L116 152L124 144"
          stroke="#142B45"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating university tag */}
      <rect x="24" y="30" width="64" height="24" rx="12" fill="#E9B949" fillOpacity="0.2" stroke="#E9B949" strokeWidth="1" />
      <text x="56" y="46" fill="#E9B949" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        MAK • KYU
      </text>
    </svg>
  );
}

/**
 * Editorial Illustration 2: Vocational & Practical Handbooks
 * Technical workshop, UBTEB syllabus, schematics & engineering tools in brand palette.
 */
export function VocationalEditorialIllustration({ className = "w-full h-full" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="400" height="220" fill="#102538" rx="16" />
      {/* Blueprint grid lines */}
      <path
        d="M20 50H380 M20 100H380 M20 150H380 M80 20V200 M160 20V200 M240 20V200 M320 20V200"
        stroke="#147D78"
        strokeOpacity="0.2"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Technical Handbook / Workshop Guide */}
      <g transform="translate(125, 25)">
        <rect x="0" y="15" width="150" height="165" rx="10" fill="#FFFFFF" />
        {/* Technical spine */}
        <rect x="0" y="15" width="16" height="165" rx="4" fill="#147D78" />
        {/* Gear icon accent */}
        <circle cx="85" cy="65" r="24" fill="#F7F8FA" stroke="#147D78" strokeWidth="3" />
        <circle cx="85" cy="65" r="10" fill="#E9B949" />

        {/* Practical handbook lines */}
        <rect x="30" y="110" width="95" height="6" rx="3" fill="#142B45" />
        <rect x="30" y="124" width="80" height="5" rx="2.5" fill="#243244" fillOpacity="0.6" />
        <rect x="30" y="136" width="100" height="5" rx="2.5" fill="#243244" fillOpacity="0.6" />

        {/* UBTEB Practical Seal */}
        <rect x="30" y="152" width="60" height="16" rx="4" fill="#147D78" fillOpacity="0.15" />
        <text x="60" y="164" fill="#147D78" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
          UBTEB LAB
        </text>
      </g>

      {/* Institute Pill */}
      <rect x="24" y="30" width="76" height="24" rx="12" fill="#147D78" fillOpacity="0.3" stroke="#147D78" strokeWidth="1" />
      <text x="62" y="46" fill="#6EE7B7" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        BRIBTE • KPM
      </text>
    </svg>
  );
}

/**
 * Editorial Illustration 3: Instant MoMo & WhatsApp Access
 * Culturally authentic Ugandan Mobile Money (*165# / *185#) + WhatsApp group one-tap access.
 */
export function MoMoEditorialIllustration({ className = "w-full h-full" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="400" height="220" fill="#142B45" rx="16" />
      {/* Background glow circles */}
      <circle cx="330" cy="170" r="90" fill="#147D78" fillOpacity="0.3" />
      <circle cx="70" cy="60" r="60" fill="#E9B949" fillOpacity="0.15" />

      {/* Central Smartphone Outline */}
      <g transform="translate(135, 15)">
        <rect x="0" y="0" width="130" height="190" rx="18" fill="#0B192C" stroke="#334E68" strokeWidth="3" />
        {/* Screen glass */}
        <rect x="6" y="10" width="118" height="170" rx="12" fill="#FFFFFF" />

        {/* Phone Speaker Notch */}
        <rect x="46" y="14" width="38" height="4" rx="2" fill="#CBD5E1" />

        {/* Top MoMo prompt card inside phone */}
        <rect x="14" y="28" width="102" height="48" rx="8" fill="#F7F8FA" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="22" y="36" width="40" height="6" rx="3" fill="#142B45" />
        <rect x="22" y="46" width="60" height="4" rx="2" fill="#64748B" />
        <text x="22" y="65" fill="#147D78" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          UGX 5,000
        </text>

        {/* Instant Unlock Button inside screen */}
        <rect x="14" y="84" width="102" height="28" rx="7" fill="#147D78" />
        <text x="65" y="102" fill="#FFFFFF" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
          Instant Unlock
        </text>

        {/* WhatsApp Notification Bubble */}
        <rect x="14" y="120" width="102" height="44" rx="8" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1" />
        <circle cx="28" cy="136" r="6" fill="#22C55E" />
        <rect x="40" y="132" width="65" height="5" rx="2.5" fill="#166534" />
        <rect x="40" y="142" width="45" height="4" rx="2" fill="#15803D" fillOpacity="0.8" />
      </g>

      {/* Floating high-contrast text badges */}
      <g transform="translate(24, 85)">
        <rect x="0" y="0" width="90" height="24" rx="12" fill="#E9B949" />
        <text x="45" y="16" fill="#142B45" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          MTN MoMo
        </text>
      </g>

      <g transform="translate(285, 85)">
        <rect x="0" y="0" width="90" height="24" rx="12" fill="#EF4444" />
        <text x="45" y="16" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          Airtel Money
        </text>
      </g>
    </svg>
  );
}

