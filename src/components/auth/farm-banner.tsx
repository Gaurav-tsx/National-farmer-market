import React from "react";

export function SignInFarmBanner() {
  return (
    <div className="w-full h-36 sm:h-44 bg-gradient-to-b from-emerald-100/70 via-emerald-50 to-white relative overflow-hidden rounded-t-2xl border-b border-emerald-100 flex items-end justify-center select-none">
      <svg
        viewBox="0 0 600 220"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="60%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>
          <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="220" fill="url(#skyGrad)" />

        {/* Sun & Clouds */}
        <circle cx="480" cy="50" r="28" fill="#fef08a" opacity="0.6" />
        <ellipse cx="140" cy="40" rx="35" ry="12" fill="#ffffff" opacity="0.8" />
        <ellipse cx="160" cy="35" rx="25" ry="14" fill="#ffffff" opacity="0.8" />

        {/* Distant Windmills */}
        <g stroke="#94a3b8" strokeWidth="1.5" fill="none">
          <line x1="120" y1="130" x2="120" y2="70" />
          <line x1="120" y1="70" x2="105" y2="60" />
          <line x1="120" y1="70" x2="135" y2="60" />
          <line x1="120" y1="70" x2="120" y2="85" />

          <line x1="150" y1="135" x2="150" y2="85" strokeWidth="1.2" />
          <line x1="150" y1="85" x2="138" y2="76" strokeWidth="1.2" />
          <line x1="150" y1="85" x2="162" y2="76" strokeWidth="1.2" />
        </g>

        {/* Background Green Hills */}
        <path
          d="M-20,160 Q120,100 260,135 T540,110 T640,150 L640,220 L-20,220 Z"
          fill="url(#hillBack)"
          opacity="0.75"
        />

        {/* Water Canal / Stream */}
        <path
          d="M180,220 Q240,165 310,170 T420,155 L440,165 Q330,180 230,220 Z"
          fill="url(#roadGrad)"
          opacity="0.8"
        />

        {/* Foreground Fields */}
        <path
          d="M-20,185 Q140,140 300,170 T620,155 L620,220 L-20,220 Z"
          fill="url(#hillFront)"
        />

        {/* Small Tractor on left */}
        <g transform="translate(60, 155) scale(0.65)">
          {/* Body */}
          <rect x="25" y="10" width="32" height="20" rx="3" fill="#16a34a" />
          <rect x="10" y="18" width="20" height="12" rx="2" fill="#15803d" />
          <polygon points="25,10 40,0 52,0 52,10" fill="#e2e8f0" opacity="0.9" />
          <rect x="18" y="4" width="3" height="14" fill="#0f172a" />
          {/* Big Back Wheel */}
          <circle cx="45" cy="30" r="14" fill="#1e293b" />
          <circle cx="45" cy="30" r="7" fill="#cbd5e1" />
          {/* Small Front Wheel */}
          <circle cx="15" cy="34" r="8" fill="#1e293b" />
          <circle cx="15" cy="34" r="4" fill="#cbd5e1" />
        </g>

        {/* IoT Crop Sensor Tower */}
        <g transform="translate(135, 140) scale(0.65)">
          <rect x="4" y="0" width="24" height="26" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
          <circle cx="16" cy="10" r="4" fill="#10b981" />
          <path d="M10,20 L13,16 L19,16 L22,20" stroke="#10b981" strokeWidth="2" fill="none" />
          <line x1="16" y1="26" x2="16" y2="48" stroke="#64748b" strokeWidth="3" />
          {/* Wifi waves */}
          <path d="M10, -4 Q16,-8 22,-4" stroke="#059669" strokeWidth="1.5" fill="none" />
          <path d="M7, -9 Q16,-15 25,-9" stroke="#059669" strokeWidth="1.5" fill="none" />
        </g>

        {/* Smartphone Displaying e-NAM in Center */}
        <g transform="translate(265, 90) scale(0.85)">
          <rect x="0" y="0" width="46" height="85" rx="8" fill="#0f172a" />
          <rect x="3" y="4" width="40" height="77" rx="6" fill="#f0fdf4" />
          <circle cx="23" cy="77" r="2.5" fill="#94a3b8" />
          {/* Phone Screen Elements */}
          <rect x="7" y="10" width="32" height="22" rx="3" fill="#15803d" />
          <path d="M12,24 Q18,14 23,24 T34,20" stroke="#86efac" strokeWidth="2" fill="none" />
          <rect x="7" y="38" width="18" height="5" rx="2" fill="#22c55e" />
          <rect x="7" y="46" width="32" height="4" rx="2" fill="#cbd5e1" />
          <rect x="7" y="53" width="24" height="4" rx="2" fill="#e2e8f0" />
          {/* Wireless signal */}
          <path d="M16, -6 Q23,-12 30,-6" stroke="#16a34a" strokeWidth="2" fill="none" />
          <path d="M12, -12 Q23,-20 34,-12" stroke="#16a34a" strokeWidth="2" fill="none" />
        </g>

        {/* Farmer Figure (Left of phone) */}
        <g transform="translate(230, 115) scale(0.85)">
          {/* Straw Hat */}
          <ellipse cx="20" cy="12" rx="16" ry="4.5" fill="#f59e0b" />
          <path d="M12,12 Q20,2 28,12 Z" fill="#d97706" />
          {/* Head */}
          <circle cx="20" cy="18" r="6" fill="#fed7aa" />
          {/* Shirt / Overalls */}
          <path d="M10,26 L30,26 L32,60 L8,60 Z" fill="#ea580c" />
          {/* Arms */}
          <line x1="10" y1="30" x2="3" y2="45" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="30" x2="38" y2="40" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Buyer / Executive Figure (Right of phone) */}
        <g transform="translate(325, 115) scale(0.85)">
          {/* Hair */}
          <ellipse cx="18" cy="14" rx="6" ry="6" fill="#1e293b" />
          {/* Face */}
          <circle cx="18" cy="17" r="5" fill="#fbcfe8" />
          {/* Blazer Suit */}
          <path d="M9,25 L27,25 L30,60 L6,60 Z" fill="#1e3a8a" />
          {/* Shirt tie */}
          <polygon points="17,25 19,25 18.5,35 17.5,35" fill="#ef4444" />
          {/* Hand holding device */}
          <line x1="10" y1="30" x2="4" y2="42" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
          <line x1="26" y1="30" x2="32" y2="44" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function CreateAccountFarmBanner() {
  return (
    <div className="w-full h-36 sm:h-44 bg-gradient-to-b from-amber-50 via-emerald-50 to-white relative overflow-hidden rounded-t-2xl border-b border-emerald-100 flex items-end justify-center select-none">
      <svg
        viewBox="0 0 600 220"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGradCa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="soilBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="soilFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="220" fill="url(#skyGradCa)" />

        {/* Distant Sun */}
        <circle cx="500" cy="50" r="32" fill="#fde047" opacity="0.6" />

        {/* Wind Turbines */}
        <g stroke="#94a3b8" strokeWidth="1.2" fill="none">
          <line x1="530" y1="120" x2="530" y2="60" />
          <line x1="530" y1="60" x2="518" y2="52" />
          <line x1="530" y1="60" x2="542" y2="52" />
          <line x1="530" y1="60" x2="530" y2="72" />
        </g>

        {/* Green Hills in Background */}
        <path
          d="M-20,160 Q180,110 380,135 T620,120 L620,220 L-20,220 Z"
          fill="url(#soilBack)"
          opacity="0.8"
        />

        {/* Soil Bed in Foreground */}
        <path
          d="M-20,185 Q200,165 420,175 T620,170 L620,220 L-20,220 Z"
          fill="url(#soilFront)"
        />

        {/* Golden Wheat Stalks Group Left */}
        <g transform="translate(380, 110) scale(0.9)">
          {/* Stalk 1 */}
          <path d="M10,70 Q15,40 12,15" stroke="#f59e0b" strokeWidth="3" fill="none" />
          <circle cx="10" cy="15" r="4.5" fill="#fbbf24" />
          <circle cx="14" cy="22" r="4.5" fill="#f59e0b" />
          <circle cx="9" cy="30" r="4.5" fill="#d97706" />
          {/* Stalk 2 */}
          <path d="M25,70 Q30,35 38,10" stroke="#f59e0b" strokeWidth="3" fill="none" />
          <circle cx="36" cy="10" r="4.5" fill="#fbbf24" />
          <circle cx="32" cy="18" r="4.5" fill="#f59e0b" />
          <circle cx="28" cy="27" r="4.5" fill="#d97706" />
          {/* Stalk 3 */}
          <path d="M45,70 Q40,40 48,20" stroke="#f59e0b" strokeWidth="3" fill="none" />
          <circle cx="48" cy="20" r="4.5" fill="#fbbf24" />
          <circle cx="44" cy="28" r="4.5" fill="#f59e0b" />
        </g>

        {/* Smart Agriculture Device Displaying Crops */}
        <g transform="translate(460, 95) scale(0.85)">
          <rect x="0" y="0" width="44" height="80" rx="8" fill="#0f172a" />
          <rect x="3" y="4" width="38" height="72" rx="6" fill="#f0fdf4" />
          <rect x="6" y="8" width="32" height="26" rx="3" fill="#15803d" />
          {/* Plant glyph on screen */}
          <path d="M22,28 L22,14 Q28,14 28,18 Q28,24 22,24" fill="#86efac" />
          <path d="M22,22 Q16,22 16,17 Q16,14 22,16" fill="#4ade80" />
          <rect x="6" y="40" width="22" height="4" rx="2" fill="#22c55e" />
          <rect x="6" y="48" width="30" height="3" rx="1.5" fill="#cbd5e1" />
          {/* Signals */}
          <path d="M15, -4 Q22,-10 29,-4" stroke="#16a34a" strokeWidth="2" fill="none" />
        </g>

        {/* Sprouting Green Crops on Left */}
        <g transform="translate(80, 160) scale(0.8)">
          <path d="M20,30 Q20,10 32,5 Q32,15 20,20" fill="#22c55e" />
          <path d="M20,30 Q20,12 8,7 Q8,17 20,22" fill="#16a34a" />
          <line x1="20" y1="30" x2="20" y2="15" stroke="#15803d" strokeWidth="2.5" />
        </g>
        <g transform="translate(140, 155) scale(0.85)">
          <path d="M20,30 Q20,10 32,5 Q32,15 20,20" fill="#22c55e" />
          <path d="M20,30 Q20,12 8,7 Q8,17 20,22" fill="#16a34a" />
          <line x1="20" y1="30" x2="20" y2="15" stroke="#15803d" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}
