import { MemeTemplate } from '../types/meme';

function svgToDataUri(svgString: string): string {
  const clean = svgString.trim();
  if (typeof window !== 'undefined' && window.btoa) {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(clean)))}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(clean)}`;
}

// 1. 3 AM Production Deploy (Shocked Tabby Cat at Laptop)
const catLaptopSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="screenGlow" cx="65%" cy="60%" r="55%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#1E293B" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
    <linearGradient id="laptopMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>
  <!-- Dark room background -->
  <rect width="800" height="600" fill="url(#screenGlow)"/>
  <!-- Digital wall clock 03:14 AM -->
  <rect x="70" y="60" width="130" height="52" rx="8" fill="#0F172A" stroke="#334155" stroke-width="2"/>
  <text x="135" y="94" font-family="monospace" font-size="26" font-weight="bold" fill="#EF4444" text-anchor="middle">03:14</text>
  <!-- Desk surface -->
  <rect x="0" y="450" width="800" height="150" fill="#1E1B18"/>
  <line x1="0" y1="450" x2="800" y2="450" stroke="#334155" stroke-width="3"/>
  <!-- Cat Ears -->
  <polygon points="180,220 215,115 280,190" fill="url(#catFur)" stroke="#7C2D12" stroke-width="4"/>
  <polygon points="198,205 220,138 262,188" fill="#FDA4AF"/>
  <polygon points="360,190 425,115 455,225" fill="url(#catFur)" stroke="#7C2D12" stroke-width="4"/>
  <polygon points="375,188 418,138 438,208" fill="#FDA4AF"/>
  <!-- Cat Body & Shoulders -->
  <path d="M 140 470 C 145 340, 495 340, 500 470 Z" fill="url(#catFur)" stroke="#7C2D12" stroke-width="4"/>
  <!-- Cat Head -->
  <ellipse cx="320" cy="275" rx="145" ry="118" fill="url(#catFur)" stroke="#7C2D12" stroke-width="4"/>
  <!-- Forehead Tabby Stripes -->
  <path d="M 295 175 L 305 215 M 320 170 L 320 218 M 345 175 L 335 215" stroke="#7C2D12" stroke-width="7" stroke-linecap="round"/>
  <!-- Wide Shocked Eyes -->
  <circle cx="265" cy="268" r="40" fill="#FEFCE8" stroke="#1E293B" stroke-width="4"/>
  <circle cx="385" cy="268" r="40" fill="#FEFCE8" stroke="#1E293B" stroke-width="4"/>
  <!-- Cyan screen reflection in pupils -->
  <circle cx="275" cy="268" r="19" fill="#0F172A"/>
  <circle cx="395" cy="268" r="19" fill="#0F172A"/>
  <circle cx="283" cy="259" r="7" fill="#38BDF8"/>
  <circle cx="403" cy="259" r="7" fill="#38BDF8"/>
  <circle cx="266" cy="277" r="3.5" fill="#BAE6FD"/>
  <circle cx="386" cy="277" r="3.5" fill="#BAE6FD"/>
  <!-- Wire-rimmed glasses -->
  <circle cx="265" cy="268" r="48" fill="none" stroke="#CBD5E1" stroke-width="4.5"/>
  <circle cx="385" cy="268" r="48" fill="none" stroke="#CBD5E1" stroke-width="4.5"/>
  <line x1="313" y1="268" x2="337" y2="268" stroke="#CBD5E1" stroke-width="4.5"/>
  <line x1="217" y1="262" x2="178" y2="248" stroke="#CBD5E1" stroke-width="4"/>
  <!-- Shocked Open Mouth & Pink Nose -->
  <polygon points="315,308 339,308 327,323" fill="#FB7185"/>
  <ellipse cx="327" cy="350" rx="22" ry="26" fill="#450A0A" stroke="#7C2D12" stroke-width="3"/>
  <path d="M 312 356 Q 327 344 342 356" fill="#FB7185"/>
  <!-- Whiskers -->
  <line x1="150" y1="305" x2="225" y2="318" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round"/>
  <line x1="145" y1="330" x2="225" y2="332" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round"/>
  <line x1="425" y1="318" x2="495" y2="305" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round"/>
  <line x1="425" y1="332" x2="500" y2="330" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round"/>
  <!-- Cat Paws frantic on desk -->
  <ellipse cx="265" cy="462" rx="36" ry="20" fill="#FDBA74" stroke="#7C2D12" stroke-width="3"/>
  <ellipse cx="405" cy="462" rx="36" ry="20" fill="#FDBA74" stroke="#7C2D12" stroke-width="3"/>
  <!--Spilled Coffee Mug-->
  <rect x="95" y="410" width="62" height="72" rx="8" fill="#F8FAFC" stroke="#334155" stroke-width="3"/>
  <path d="M 95 425 C 68 425, 68 465, 95 465" fill="none" stroke="#F8FAFC" stroke-width="8"/>
  <path d="M 110 385 Q 118 365 110 345 M 135 385 Q 143 365 135 345" fill="none" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
  <!-- Glowing Laptop -->
  <polygon points="480,475 735,475 775,235 535,235" fill="url(#laptopMetal)" stroke="#1E293B" stroke-width="4"/>
  <rect x="380" y="470" width="360" height="22" rx="6" fill="#94A3B8" stroke="#1E293B" stroke-width="3"/>
  <!-- Cyan Light Cone -->
  <polygon points="535,245 765,245 485,465 245,250" fill="#38BDF8" fill-opacity="0.14"/>
</svg>
`;

// 2. This Kitchen Is Fine (Calm Golden Retriever in Chaos)
const dogChaosSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="chaosSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7F1D1D"/>
      <stop offset="55%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>
    <linearGradient id="goldFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#chaosSky)"/>
  <!-- Background Flames & Smoke -->
  <path d="M 0 420 Q 90 250 160 390 Q 250 180 350 370 Q 480 190 580 380 Q 690 210 800 390 L 800 500 L 0 500 Z" fill="#F97316" opacity="0.75"/>
  <path d="M 50 450 Q 150 290 240 420 Q 380 240 490 420 Q 630 260 760 430 L 800 500 L 0 500 Z" fill="#FDE047" opacity="0.65"/>
  <!-- Smoke puffs -->
  <circle cx="140" cy="110" r="65" fill="#27272A" opacity="0.55"/>
  <circle cx="240" cy="85" r="80" fill="#18181B" opacity="0.6"/>
  <circle cx="620" cy="95" r="75" fill="#27272A" opacity="0.55"/>
  <circle cx="710" cy="130" r="60" fill="#18181B" opacity="0.5"/>
  <!-- Flying spaghetti & tilted picture frame -->
  <g transform="rotate(-18 165 210)">
    <rect x="105" y="160" width="120" height="95" fill="#FEF3C7" stroke="#451A03" stroke-width="6"/>
    <circle cx="165" cy="208" r="24" fill="#FB7185"/>
  </g>
  <g transform="rotate(24 640 215)">
    <ellipse cx="640" cy="215" rx="52" ry="26" fill="#94A3B8" stroke="#1E293B" stroke-width="4"/>
    <path d="M 605 195 Q 640 140 675 195 M 620 190 Q 655 150 685 205" fill="none" stroke="#FDE68A" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- Kitchen Table -->
  <rect x="0" y="455" width="800" height="145" fill="#78350F"/>
  <rect x="0" y="455" width="800" height="18" fill="#92400E"/>
  <!-- Calm Golden Retriever -->
  <!-- Floppy Ears -->
  <ellipse cx="275" cy="295" rx="38" ry="78" transform="rotate(14 275 295)" fill="#B45309" stroke="#451A03" stroke-width="4"/>
  <ellipse cx="525" cy="295" rx="38" ry="78" transform="rotate(-14 525 295)" fill="#B45309" stroke="#451A03" stroke-width="4"/>
  <!-- Torso -->
  <path d="M 275 458 C 285 335, 515 335, 525 458 Z" fill="url(#goldFur)" stroke="#451A03" stroke-width="4"/>
  <!-- Head -->
  <rect x="295" y="195" width="210" height="175" rx="82" fill="url(#goldFur)" stroke="#451A03" stroke-width="4"/>
  <!-- Little Bowler Hat -->
  <ellipse cx="400" cy="195" rx="76" ry="16" fill="#18181B" stroke="#09090B" stroke-width="3"/>
  <path d="M 345 192 C 345 135, 455 135, 455 192 Z" fill="#27272A" stroke="#09090B" stroke-width="3"/>
  <rect x="347" y="178" width="106" height="10" fill="#E11D48"/>
  <!-- Calm Happy Eyes -->
  <circle cx="355" cy="268" r="18" fill="#FFFBEB" stroke="#1C1917" stroke-width="3.5"/>
  <circle cx="358" cy="268" r="9" fill="#1C1917"/>
  <circle cx="361" cy="264" r="3" fill="#FFFFFF"/>
  <circle cx="445" cy="268" r="18" fill="#FFFBEB" stroke="#1C1917" stroke-width="3.5"/>
  <circle cx="442" cy="268" r="9" fill="#1C1917"/>
  <circle cx="445" cy="264" r="3" fill="#FFFFFF"/>
  <!-- Snout & Polite Smile -->
  <ellipse cx="400" cy="312" rx="52" ry="38" fill="#FEF08A" stroke="#451A03" stroke-width="3"/>
  <ellipse cx="400" cy="296" rx="18" ry="12" fill="#1C1917"/>
  <path d="M 366 322 Q 400 348 434 322" fill="none" stroke="#451A03" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Pink tongue blep -->
  <path d="M 390 334 Q 400 356 410 334 Z" fill="#FB7185" stroke="#451A03" stroke-width="2.5"/>
  <!-- Red Bowtie -->
  <polygon points="370,368 400,382 370,396" fill="#E11D48" stroke="#881337" stroke-width="2.5"/>
  <polygon points="430,368 400,382 430,396" fill="#E11D48" stroke="#881337" stroke-width="2.5"/>
  <circle cx="400" cy="382" r="7" fill="#FB7185"/>
  <!-- Dainty Teacup on Table -->
  <ellipse cx="565" cy="462" rx="44" ry="10" fill="#F8FAFC" stroke="#475569" stroke-width="3"/>
  <path d="M 535 420 L 595 420 L 585 458 L 545 458 Z" fill="#F8FAFC" stroke="#475569" stroke-width="3"/>
  <path d="M 595 426 C 612 426, 612 448, 588 448" fill="none" stroke="#F8FAFC" stroke-width="5"/>
</svg>
`;

// 3. Wait, It's All Rubber Ducks? (Astronauts in Orbit)
const astronautDuckSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="deepSpace" cx="30%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="goldVisor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#deepSpace)"/>
  <!-- Stars -->
  <circle cx="90" cy="80" r="2" fill="#F8FAFC"/>
  <circle cx="210" cy="140" r="1.5" fill="#94A3B8"/>
  <circle cx="460" cy="70" r="2.5" fill="#F8FAFC"/>
  <circle cx="710" cy="95" r="2" fill="#F8FAFC"/>
  <circle cx="640" cy="230" r="1.5" fill="#CBD5E1"/>
  <circle cx="130" cy="280" r="2" fill="#E2E8F0"/>
  <!-- Giant Planet-Sized Rubber Duck in Orbit -->
  <g transform="translate(150, 120)">
    <!-- Planet atmosphere glow -->
    <circle cx="165" cy="195" r="165" fill="#38BDF8" opacity="0.12"/>
    <!-- Duck Body -->
    <path d="M 55 245 C 35 170, 115 145, 165 165 C 215 165, 275 145, 295 205 C 315 265, 255 320, 155 320 C 75 320, 65 280, 55 245 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="5"/>
    <!-- Duck Head -->
    <circle cx="125" cy="115" r="64" fill="#FACC15" stroke="#CA8A04" stroke-width="5"/>
    <!-- Duck Beak -->
    <path d="M 62 110 C 22 105, 22 138, 68 138 Z" fill="#F97316" stroke="#C2410C" stroke-width="4"/>
    <!-- Duck Eye -->
    <circle cx="105" cy="102" r="11" fill="#09090B"/>
    <circle cx="108" cy="98" r="4" fill="#FFFFFF"/>
    <!-- Duck Wing -->
    <path d="M 135 215 Q 205 190 235 245 Q 185 285 135 245 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="4"/>
  </g>
  <!-- Astronaut 1 (Looking at Giant Duck) -->
  <g transform="translate(455, 215)">
    <!-- Backpack -->
    <rect x="65" y="75" width="110" height="145" rx="14" fill="#CBD5E1" stroke="#475569" stroke-width="4"/>
    <!-- Suit Body -->
    <path d="M 25 265 C 30 140, 165 140, 175 265 Z" fill="#F8FAFC" stroke="#475569" stroke-width="4"/>
    <!-- Helmet -->
    <circle cx="95" cy="95" r="68" fill="#F8FAFC" stroke="#475569" stroke-width="4"/>
    <!-- Gold Reflective Visor -->
    <ellipse cx="78" cy="95" rx="50" ry="42" fill="url(#goldVisor)" stroke="#1E293B" stroke-width="4"/>
    <!-- Reflection highlight -->
    <path d="M 50 72 Q 75 60 102 74" fill="none" stroke="#FEF9C3" stroke-width="5" stroke-linecap="round"/>
    <!-- Pointing Arm -->
    <path d="M 45 175 L -35 145" stroke="#F8FAFC" stroke-width="34" stroke-linecap="round"/>
    <path d="M 45 175 L -35 145" stroke="#475569" stroke-width="38" stroke-linecap="round" opacity="0.25"/>
    <circle cx="-42" cy="142" r="16" fill="#94A3B8" stroke="#334155" stroke-width="3"/>
  </g>
</svg>
`;

// 4. Still Waiting on That Review (Skeleton on Autumn Park Bench)
const skeletonBenchSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="autumnSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="65%" stop-color="#64748B"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#autumnSky)"/>
  <!-- Distant Autumn Trees -->
  <circle cx="140" cy="220" r="110" fill="#B45309" opacity="0.5"/>
  <circle cx="670" cy="200" r="125" fill="#9A3412" opacity="0.5"/>
  <!-- Park Ground -->
  <rect x="0" y="440" width="800" height="160" fill="#292524"/>
  <!-- Wooden Park Bench -->
  <rect x="110" y="270" width="580" height="28" rx="4" fill="#78350F" stroke="#451A03" stroke-width="3"/>
  <rect x="110" y="312" width="580" height="28" rx="4" fill="#78350F" stroke="#451A03" stroke-width="3"/>
  <rect x="110" y="354" width="580" height="28" rx="4" fill="#78350F" stroke="#451A03" stroke-width="3"/>
  <rect x="85" y="395" width="630" height="32" rx="6" fill="#92400E" stroke="#451A03" stroke-width="3"/>
  <rect x="155" y="427" width="24" height="85" fill="#1C1917"/>
  <rect x="620" y="427" width="24" height="85" fill="#1C1917"/>
  <!-- Patient Skeleton -->
  <!-- Ribcage & Spine -->
  <line x1="400" y1="245" x2="400" y2="395" stroke="#E2E8F0" stroke-width="14" stroke-linecap="round"/>
  <path d="M 350 285 Q 400 302 450 285 M 355 315 Q 400 332 445 315 M 365 345 Q 400 360 435 345" fill="none" stroke="#E2E8F0" stroke-width="10" stroke-linecap="round"/>
  <!-- Cozy Knitted Red Scarf -->
  <path d="M 340 245 Q 400 268 460 245" fill="none" stroke="#E11D48" stroke-width="26" stroke-linecap="round"/>
  <rect x="415" y="248" width="26" height="82" rx="8" fill="#E11D48" stroke="#9F1239" stroke-width="2"/>
  <!-- Skull -->
  <circle cx="400" cy="165" r="58" fill="#F1F5F9" stroke="#475569" stroke-width="4"/>
  <rect x="372" y="205" width="56" height="36" rx="10" fill="#F1F5F9" stroke="#475569" stroke-width="4"/>
  <!-- Hollow Eye Sockets -->
  <circle cx="378" cy="165" r="16" fill="#0F172A"/>
  <circle cx="422" cy="165" r="16" fill="#0F172A"/>
  <!-- Nasal cavity -->
  <polygon points="400,180 392,196 408,196" fill="#0F172A"/>
  <!-- Teeth -->
  <line x1="378" y1="223" x2="422" y2="223" stroke="#475569" stroke-width="3"/>
  <line x1="388" y1="214" x2="388" y2="232" stroke="#475569" stroke-width="3"/>
  <line x1="400" y1="214" x2="400" y2="232" stroke="#475569" stroke-width="3"/>
  <line x1="412" y1="214" x2="412" y2="232" stroke="#475569" stroke-width="3"/>
  <!-- Skeleton Arms holding Smartphone with Cobwebs -->
  <path d="M 350 275 L 315 355 L 365 365" fill="none" stroke="#E2E8F0" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 450 275 L 485 355 L 435 365" fill="none" stroke="#E2E8F0" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Smartphone -->
  <rect x="372" y="330" width="46" height="72" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
  <!-- Falling Autumn Leaves -->
  <ellipse cx="230" cy="385" rx="14" ry="8" transform="rotate(-25 230 385)" fill="#EA580C"/>
  <ellipse cx="560" cy="395" rx="16" ry="9" transform="rotate(18 560 395)" fill="#D97706"/>
  <ellipse cx="290" cy="190" rx="14" ry="7" transform="rotate(40 290 190)" fill="#F59E0B"/>
</svg>
`;

// 5. Victorian Monocle Skeptic (Lord Pemberton Squints at Phone)
const victorianSkepticSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="portraitBg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#451A03"/>
      <stop offset="100%" stop-color="#1C1917"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#portraitBg)"/>
  <!-- Ornate Gold Frame Corner Accents -->
  <rect x="28" y="28" width="744" height="544" fill="none" stroke="#B45309" stroke-width="4" stroke-dasharray="18 8"/>
  <!-- Velvet Coat & High Cravat Collar -->
  <path d="M 180 560 C 195 385, 545 385, 560 560 Z" fill="#4C0519" stroke="#881337" stroke-width="4"/>
  <polygon points="325,380 415,380 395,475 345,475" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>
  <!-- Gentleman Head -->
  <ellipse cx="370" cy="255" rx="95" ry="118" fill="#FDE68A" stroke="#92400E" stroke-width="4"/>
  <!-- Silver Victorian Sideburns & Swept Hair -->
  <path d="M 275 215 C 260 120, 480 120, 465 215 C 445 165, 295 165, 275 215 Z" fill="#CBD5E1" stroke="#475569" stroke-width="3"/>
  <ellipse cx="278" cy="265" rx="18" ry="42" fill="#CBD5E1" stroke="#475569" stroke-width="3"/>
  <ellipse cx="462" cy="265" rx="18" ry="42" fill="#CBD5E1" stroke="#475569" stroke-width="3"/>
  <!-- Raised Skeptical Eyebrow -->
  <path d="M 305 208 Q 335 220 355 215" fill="none" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <path d="M 390 198 Q 418 175 445 198" fill="none" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <!-- Squinting Eyes + Gold Monocle -->
  <line x1="315" y1="238" x2="350" y2="238" stroke="#1E293B" stroke-width="5" stroke-linecap="round"/>
  <circle cx="418" cy="236" r="14" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
  <circle cx="422" cy="236" r="6" fill="#0F172A"/>
  <!-- Brass Monocle & Chain -->
  <circle cx="418" cy="236" r="32" fill="#38BDF8" fill-opacity="0.18" stroke="#F59E0B" stroke-width="5"/>
  <path d="M 448 248 Q 465 330 430 420" fill="none" stroke="#F59E0B" stroke-width="3" stroke-dasharray="5 4"/>
  <!-- Grand Handlebar Mustache -->
  <path d="M 370 302 C 330 290, 290 330, 275 310 C 295 348, 345 335, 370 316 C 395 335, 445 348, 465 310 C 450 330, 410 290, 370 302 Z" fill="#CBD5E1" stroke="#475569" stroke-width="3"/>
  <!-- Hand holding tiny glowing modern smartphone at arm's length -->
  <rect x="565" y="255" width="58" height="102" rx="10" fill="#0F172A" stroke="#38BDF8" stroke-width="4"/>
  <rect x="573" y="267" width="42" height="76" rx="4" fill="#E0F2FE"/>
  <circle cx="555" cy="320" r="24" fill="#FDE68A" stroke="#92400E" stroke-width="3"/>
</svg>
`;

// 6. Two Red Buttons Dilemma (Sweating Control Room Engineer)
const twoButtonsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="consoleBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#consoleBg)"/>
  <!-- Metallic Control Panel with Two Red Buttons -->
  <polygon points="70,330 730,330 780,570 20,570" fill="#94A3B8" stroke="#334155" stroke-width="5"/>
  <!-- Left Button Base & Red Dome -->
  <ellipse cx="265" cy="445" rx="88" ry="42" fill="#334155" stroke="#0F172A" stroke-width="4"/>
  <ellipse cx="265" cy="430" rx="68" ry="30" fill="#EF4444" stroke="#991B1B" stroke-width="4"/>
  <ellipse cx="248" cy="422" rx="24" ry="8" fill="#FCA5A5" opacity="0.7"/>
  <!-- Right Button Base & Red Dome -->
  <ellipse cx="535" cy="445" rx="88" ry="42" fill="#334155" stroke="#0F172A" stroke-width="4"/>
  <ellipse cx="535" cy="430" rx="68" ry="30" fill="#EF4444" stroke="#991B1B" stroke-width="4"/>
  <ellipse cx="518" cy="422" rx="24" ry="8" fill="#FCA5A5" opacity="0.7"/>
  <!-- Nervous Engineer in top half -->
  <circle cx="400" cy="175" r="92" fill="#FDBA74" stroke="#9A3412" stroke-width="4"/>
  <!-- Wide Nervous Eyes -->
  <ellipse cx="368" cy="168" rx="20" ry="26" fill="#FFFFFF" stroke="#0F172A" stroke-width="3.5"/>
  <circle cx="368" cy="172" r="8" fill="#0F172A"/>
  <ellipse cx="432" cy="168" rx="20" ry="26" fill="#FFFFFF" stroke="#0F172A" stroke-width="3.5"/>
  <circle cx="432" cy="172" r="8" fill="#0F172A"/>
  <!-- Gritted Teeth Grimace -->
  <rect x="362" y="218" width="76" height="24" rx="10" fill="#FFFFFF" stroke="#0F172A" stroke-width="3.5"/>
  <line x1="362" y1="230" x2="438" y2="230" stroke="#0F172A" stroke-width="2.5"/>
  <!-- Sweat Drops -->
  <path d="M 300 135 Q 292 155 300 162 Q 308 155 300 135 Z" fill="#38BDF8"/>
  <path d="M 495 145 Q 487 165 495 172 Q 503 165 495 145 Z" fill="#38BDF8"/>
  <path d="M 480 195 Q 472 215 480 222 Q 488 215 480 195 Z" fill="#38BDF8"/>
  <!-- Trembling Hand hovering between buttons -->
  <ellipse cx="400" cy="345" rx="42" ry="26" fill="#FDBA74" stroke="#9A3412" stroke-width="4"/>
  <path d="M 335 335 Q 320 345 335 355 M 465 335 Q 480 345 465 355" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
</svg>
`;

export const TRENDING_TEMPLATES: MemeTemplate[] = [
  {
    id: 'glamorous-woman-reaction',
    title: 'Glamorous Woman Reaction',
    category: 'Human Reaction',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'WHEN YOU WALK IN KNOWING',
    defaultBottomText: 'YOU ARE THE MAIN PLOT TWIST',
    defaultFullCaption: 'Me pretending to listen politely while knowing I already won the argument 10 minutes ago:',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=960&q=85',
    description: 'Natural 35mm portrait of a stunning, confident woman with an expressive side-eye gaze.',
    precomputedCaptions: [
      {
        id: 'glam-1',
        topText: 'WHEN YOU WALK IN KNOWING',
        bottomText: 'YOU ARE THE MAIN PLOT TWIST',
        fullCaption: 'Me pretending to listen politely while knowing I already won the argument 10 minutes ago:',
        angle: 'Confident',
      },
      {
        id: 'glam-2',
        topText: 'HIM: "I LIKE NATURAL, LOW-MAINTENANCE"',
        bottomText: 'ALSO HIM WHEN SHE WALKS BY:',
        fullCaption: 'Guys saying they want something simple vs. losing all ability to speak the second a glamorous woman walks in:',
        angle: 'Cheeky',
      },
      {
        id: 'glam-3',
        topText: 'DRESSED UP JUST TO GET ICED COFFEE',
        bottomText: 'AND IGNORE EVERY TEXT MESSAGE',
        fullCaption: 'Looking like a 10/10 editorial shoot just to buy groceries and go straight back to my couch:',
        angle: 'Relatable',
      },
      {
        id: 'glam-4',
        topText: 'WHEN HE TRIES TO EXPLAIN THE JOKE',
        bottomText: 'THAT YOU LITERALLY JUST MADE',
        fullCaption: 'The exact facial expression when someone repeats your own joke back to you, but louder:',
        angle: 'Deadpan',
      },
      {
        id: 'glam-5',
        topText: 'ACTING CASUAL WHEN SOMEONE SAYS',
        bottomText: '"ACT NORMAL, DONT LOOK OVER THERE"',
        fullCaption: 'My friend: "Don\'t make it obvious" / Me turning my entire head in 4K Ultra HD:',
        angle: 'Plot Twist',
      },
    ],
  },
  {
    id: 'simple-guy-deadpan',
    title: 'Simple Guy Deadpan',
    category: 'Human Reaction',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'IM A SIMPLE MAN',
    defaultBottomText: 'I SEE GOOD VIBES, I CLICK IMMEDIATELY',
    defaultFullCaption: 'Me standing there with a completely blank expression trying to process what was just said in the group chat:',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=960&q=85',
    description: 'Candid real-life portrait of a simple everyday guy in casual attire with a relatable reaction.',
    precomputedCaptions: [
      {
        id: 'guy-1',
        topText: 'IM A SIMPLE MAN',
        bottomText: 'I DONT ASK QUESTIONS, I JUST NOD',
        fullCaption: 'I am a simple man: give me good food, peace and quiet, and zero unexpected phone calls:',
        angle: 'Relatable',
      },
      {
        id: 'guy-2',
        topText: 'MY BRAIN TRYING TO ACT NORMAL',
        bottomText: 'WHEN MY CRUSH SAYS "HEY"',
        fullCaption: 'Practicing a cool conversation in the mirror for 20 minutes vs. saying "You too!" when she asks how I am:',
        angle: 'Self-Own',
      },
      {
        id: 'guy-3',
        topText: 'SMILING POLITELY WHEN YOU DIDNT HEAR',
        bottomText: 'FOR THE THIRD TIME IN A ROW',
        fullCaption: 'After saying "What?" twice so now you just smile, nod, and hope you didn\'t agree to run a marathon:',
        angle: 'Everyday',
      },
      {
        id: 'guy-4',
        topText: 'HER: "HE IS PROBABLY OVERTHINKING"',
        bottomText: 'HIM: "HOW DO PENGUINS HAVE KNEES"',
        fullCaption: 'What she thinks I\'m thinking about vs. me wondering why round pizzas come in square boxes:',
        angle: 'Deadpan',
      },
      {
        id: 'guy-5',
        topText: 'SHOWING UP IN THE SAME PLAIN T-SHIRT',
        bottomText: 'FOR EVERY SINGLE OCCASION SINCE 2019',
        fullCaption: 'Why overcomplicate fashion when the same simple crew-neck t-shirt works for 99% of human events:',
        angle: 'Simple Life',
      },
    ],
  },
  {
    id: 'couple-contrast-meme',
    title: 'Distracted Contrast Scene',
    category: 'Relationship & Contrast',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'MY RESPONSIBLE WEEKEND PLANS',
    defaultBottomText: 'ONE TEXT SAYING "YOU UP FOR BAD IDEAS?"',
    defaultFullCaption: 'Me promising to be productive all weekend vs. abandoning every plan in 0.3 seconds:',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=960&q=85',
    description: 'Candid real-life couple photograph ideal for relationship dynamics and contrast humor.',
    precomputedCaptions: [
      {
        id: 'cpl-1',
        topText: 'MY RESPONSIBLE WEEKEND PLANS',
        bottomText: 'ONE TEXT SAYING "YOU UP FOR BAD IDEAS?"',
        fullCaption: 'Me promising to be disciplined all weekend vs. folding in 0.3 seconds:',
        angle: 'Relatable',
      },
      {
        id: 'cpl-2',
        topText: 'HER: EXPLAINING 45 MINUTES OF DRAMA',
        bottomText: 'HIM: JUST HAPPY TO BE INCLUDED',
        fullCaption: 'Not knowing any of the people in her story but gasping at all the right moments like a supportive teammate:',
        angle: 'Wholesome',
      },
      {
        id: 'cpl-3',
        topText: 'TRYING TO PLAY IT COOL AND MYSTERIOUS',
        bottomText: 'FOLDING THE SECOND SHE SMILES',
        fullCaption: 'Me: "I\'m going to be stoic and unbothered" / Also me 4 seconds later:',
        angle: 'Self-Own',
      },
      {
        id: 'cpl-4',
        topText: 'WHEN YOU BOTH MAKE EYE CONTACT',
        bottomText: 'ACROSS THE ROOM WHEN SOMEONE LIES',
        fullCaption: 'That telepathic look you share across the table when someone tells an obviously fake story:',
        angle: 'Plot Twist',
      },
      {
        id: 'cpl-5',
        topText: 'ASKING "WHAT DO YOU WANT TO EAT?"',
        bottomText: 'KNOWING THIS DEBATE WILL TAKE 2 HOURS',
        fullCaption: '"I\'m fine with anything" — the most dangerous four words in any relationship:',
        angle: 'Everyday',
      },
    ],
  },
  {
    id: 'cat-deploy-3am',
    title: '3 AM Production Deploy',
    category: 'Tech & Work',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'PUSHED ONE TINY CSS FIX ON FRIDAY',
    defaultBottomText: 'WHY IS THE DATABASE SPEAKING LATIN',
    defaultFullCaption: 'Nobody: / Me at 3:14 AM watching my "harmless one-line hotfix" take down three regions:',
    imageUrl: svgToDataUri(catLaptopSvg),
    description: 'Shocked tabby cat in wire-rimmed glasses staring into a glowing laptop at 3:14 AM.',
    precomputedCaptions: [
      {
        id: 'cat-1',
        topText: 'PUSHED ONE TINY CSS FIX ON FRIDAY',
        bottomText: 'WHY IS THE DATABASE SPEAKING LATIN',
        fullCaption: 'Me at 3:14 AM watching my "harmless one-line hotfix" take down three regions:',
        angle: 'Work Life',
      },
      {
        id: 'cat-2',
        topText: 'SAID "JUST ONE MORE EPISODE"',
        bottomText: 'BIRDS ARE CHIRPING OUTSIDE MY WINDOW',
        fullCaption: 'When you click "Next Episode" and suddenly hear commuters starting their cars outside:',
        angle: 'Relatable',
      },
      {
        id: 'cat-3',
        topText: 'CHECKING MY BANK BALANCE AFTER',
        bottomText: 'SAYING "MONEY COMES BACK, MEMORIES DONT"',
        fullCaption: 'Opening my banking app on Monday morning after living like a Victorian oil baron all weekend:',
        angle: 'Self-Own',
      },
      {
        id: 'cat-4',
        topText: 'GOOGLED A MILD HEADACHE AT 2 AM',
        bottomText: 'WEBMD SAYS I EXPIRED IN 1997',
        fullCaption: 'Me reading page 4 of medical search results for a slightly stubbed toe:',
        angle: 'Overthinking',
      },
      {
        id: 'cat-5',
        topText: 'WHEN THE CODE COMPILES ON THE FIRST TRY',
        bottomText: 'SOMETHING IS DEFINITELY WRONG',
        fullCaption: 'Zero warnings, zero errors on the first build—my trust issues have never been higher:',
        angle: 'Deadpan',
      },
    ],
  },
  {
    id: 'dog-chaos-kitchen',
    title: 'This Kitchen Is Fine',
    category: 'Everyday Chaos',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: '14 UNREAD SLACK PINGS AND 3 DEADLINES',
    defaultBottomText: 'TIME TO MAKE A VERY SLOW POUR-OVER COFFEE',
    defaultFullCaption: 'Me calmly sipping my iced matcha while every single project timeline burns in the background:',
    imageUrl: svgToDataUri(dogChaosSvg),
    description: 'Polite golden retriever in a bowtie enjoying tea while the kitchen erupts in chaos.',
    precomputedCaptions: [
      {
        id: 'dog-1',
        topText: '14 UNREAD SLACK PINGS AND 3 DEADLINES',
        bottomText: 'TIME TO MAKE A VERY SLOW POUR-OVER COFFEE',
        fullCaption: 'Me calmly sipping my pour-over coffee while every project timeline burns in the background:',
        angle: 'Work Life',
      },
      {
        id: 'dog-2',
        topText: 'TRIED COOKING ONE "EASY 15-MINUTE PASTA"',
        bottomText: 'USED EVERY POT IN THE NORTHERN HEMISPHERE',
        fullCaption: 'Recipe: "Simple 1-pot weeknight meal" / My kitchen 12 minutes later:',
        angle: 'Relatable',
      },
      {
        id: 'dog-3',
        topText: 'MY SLEEP SCHEDULE, HYDRATION, AND BUDGET',
        bottomText: 'AT LEAST MY PLAYLIST TRANSITIONS ARE SMOOTH',
        fullCaption: 'Everything in my life is on fire, but this curated 4-hour playlist is immaculate:',
        angle: 'Wholesome Chaos',
      },
      {
        id: 'dog-4',
        topText: 'WHEN THE GROUP TRIP ITINERARY COLLAPSES',
        bottomText: 'IM JUST HERE FOR THE AIRPORT SNACKS',
        fullCaption: 'Watching the group chat argue about dinner reservations while I already ordered room service:',
        angle: 'Deadpan',
      },
      {
        id: 'dog-5',
        topText: 'SENIOR ENGINEER ON THEIR LAST WEEK',
        bottomText: 'SOUNDS LIKE A FASCINATING Q4 PROBLEM',
        fullCaption: 'Two weeks notice submitted and suddenly every production alert sounds like peaceful rain:',
        angle: 'Corporate',
      },
    ],
  },
  {
    id: 'astronaut-rubber-duck',
    title: 'Wait, It Is All Rubber Ducks?',
    category: 'Plot Twist',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'WAIT, SENIOR ENGINEERING IS JUST',
    defaultBottomText: 'RENAMING VARIABLES AND ASKING WHAT CHANGED?',
    defaultFullCaption: 'Wait, enterprise architecture is just 47 spreadsheets held together by one bash script? Always has been.',
    imageUrl: svgToDataUri(astronautDuckSvg),
    description: 'Astronaut in orbit realizing the entire planet below is a giant golden rubber duck.',
    precomputedCaptions: [
      {
        id: 'astro-1',
        topText: 'WAIT, SENIOR ENGINEERING IS JUST',
        bottomText: 'RENAMING VARIABLES AND ASKING WHAT CHANGED?',
        fullCaption: 'Wait, enterprise architecture is just 47 spreadsheets held together by a bash script? Always has been.',
        angle: 'Plot Twist',
      },
      {
        id: 'astro-2',
        topText: 'WAIT, ADULTHOOD IS JUST DECIDING',
        bottomText: 'WHAT TO EAT FOR DINNER EVERY SINGLE NIGHT?',
        fullCaption: 'Realizing 80% of being a responsible adult is just washing the same cutting board forever:',
        angle: 'Relatable',
      },
      {
        id: 'astro-3',
        topText: 'OPENING THE "PROPRIETARY AI ENGINE"',
        bottomText: 'ITS THREE IF-STATEMENTS IN A TRENCH COAT',
        fullCaption: 'Looking under the hood of the legacy codebase they told you never to touch:',
        angle: 'Tech & Work',
      },
      {
        id: 'astro-4',
        topText: 'WAIT, THE MEETING COULD HAVE BEEN',
        bottomText: 'A TWO-SENTENCE EMAIL ALL ALONG?',
        fullCaption: '45 minutes into a sync call when everyone agrees to "take this offline":',
        angle: 'Corporate',
      },
      {
        id: 'astro-5',
        topText: 'CHECKING WHY MY CLOUD BILL SPIKED',
        bottomText: 'ONE FORGOT TO STOP THE TEST CLUSTER',
        fullCaption: 'Discovering the staging server from 2023 has been rendering 8K fractals nonstop:',
        angle: 'Self-Own',
      },
    ],
  },
  {
    id: 'skeleton-waiting-bench',
    title: 'Still Waiting on That Review',
    category: 'Waiting Forever',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'WAITING FOR MY FRIEND WHO SAID',
    defaultBottomText: '"IM PARKING RIGHT NOW, BE THERE IN 2 MINS"',
    defaultFullCaption: 'Waiting for the "quick 5-minute code review" I requested three sprints ago:',
    imageUrl: svgToDataUri(skeletonBenchSvg),
    description: 'Skeleton in a cozy red scarf sitting patiently on an autumn park bench checking a phone.',
    precomputedCaptions: [
      {
        id: 'skel-1',
        topText: 'WAITING FOR MY FRIEND WHO SAID',
        bottomText: '"IM PARKING RIGHT NOW, BE THERE IN 2 MINS"',
        fullCaption: 'Me waiting outside the restaurant after they texted "literally pulling up right now" 40 minutes ago:',
        angle: 'Relatable',
      },
      {
        id: 'skel-2',
        topText: 'WAITING FOR SOMEONE TO APPROVE MY',
        bottomText: '2-LINE TYPO FIX PULL REQUEST',
        fullCaption: '500-line refactor: approved in 30 seconds ("LGTM"). 2-line typo fix: 19 comments and 4 days waiting:',
        angle: 'Tech & Work',
      },
      {
        id: 'skel-3',
        topText: 'WAITING FOR THE RIGHT MOMENT TO USE',
        bottomText: 'THE NICE NOTEBOOK I BOUGHT IN 2019',
        fullCaption: 'Saving my good stationery for a "worthy project" until the sun expands into a red giant:',
        angle: 'Self-Own',
      },
      {
        id: 'skel-4',
        topText: 'WAITING FOR THE MICROWAVE TO HIT 0:01',
        bottomText: 'LONGEST FORTY-FIVE SECONDS IN PHYSICS',
        fullCaption: 'Time dilation next to a black hole vs. watching the last 30 seconds of a washing machine cycle:',
        angle: 'Deadpan',
      },
      {
        id: 'skel-5',
        topText: 'WAITING FOR THE GROUP CHAT TO PICK',
        bottomText: 'ONE SINGLE WEEKEND WHERE EVERYONE IS FREE',
        fullCaption: 'Trying to schedule dinner with 4 friends in your thirties—next available slot is November 2029:',
        angle: 'Wholesome Chaos',
      },
    ],
  },
  {
    id: 'victorian-monocle-skeptic',
    title: 'Victorian Monocle Skeptic',
    category: 'Reaction',
    aspectRatioLabel: '4:3',
    defaultLayout: 'modern-header',
    defaultTopText: 'READING AN EMAIL THAT STARTS WITH',
    defaultBottomText: '"PER MY PREVIOUS MESSAGE, AS DISCUSSED"',
    defaultFullCaption: 'Me inspecting the restaurant QR code menu after it asks me to create an account and accept 49 cookies just to see the price of fries:',
    imageUrl: svgToDataUri(victorianSkepticSvg),
    description: 'Aristocratic Victorian gentleman squinting skeptically through a brass monocle at a tiny phone.',
    precomputedCaptions: [
      {
        id: 'vic-1',
        topText: 'INSPECTING THE QR CODE MENU',
        bottomText: 'THAT WANTS MY EMAIL TO SHOW FRIES',
        fullCaption: 'Me inspecting the restaurant QR code menu after it asks me to create an account just to see the price of fries:',
        angle: 'Relatable',
      },
      {
        id: 'vic-2',
        topText: 'READING MY OWN CODE FROM',
        bottomText: 'THREE WEEKS AGO WITHOUT COMMENTS',
        fullCaption: 'Who wrote this inscrutable spaghetti logic? *runs git blame* Ah, it was me last Tuesday:',
        angle: 'Self-Own',
      },
      {
        id: 'vic-3',
        topText: 'EXAMINING THE "FREE DELIVERY" PROMO',
        bottomText: 'WITH A $19.99 SERVICE AND CONVENIENCE FEE',
        fullCaption: '$0.00 Delivery Fee! (Subtotal: $12, Regulatory Aura Surcharge: $18.50):',
        angle: 'Deadpan',
      },
      {
        id: 'vic-4',
        topText: 'WHEN SOMEONE SENDS A VOICE NOTE',
        bottomText: 'THAT IS SEVEN MINUTES AND FORTY SECONDS LONG',
        fullCaption: 'Receiving an 8-minute voice memo instead of a text—I did not subscribe to this audiobook:',
        angle: 'Plot Twist',
      },
      {
        id: 'vic-5',
        topText: 'READING A JOB POSTING THAT REQUIRES',
        bottomText: '10 YEARS EXPERIENCE IN A 2-YEAR-OLD FRAMEWORK',
        fullCaption: 'Entry-level role: must have 12 years of experience, a Turing Award, and own a forklift:',
        angle: 'Corporate',
      },
    ],
  },
  {
    id: 'two-red-buttons-dilemma',
    title: 'Two Red Buttons Dilemma',
    category: 'Tough Decisions',
    aspectRatioLabel: '4:3',
    defaultLayout: 'classic-split',
    defaultTopText: 'FIX THE BUG PROPERLY IN 20 MINUTES',
    defaultBottomText: 'SPEND 6 HOURS AUTOMATING IT SO I NEVER DO IT AGAIN',
    defaultFullCaption: 'Go to bed at a reasonable hour to feel rested tomorrow vs. Stay up until 2 AM researching medieval trebuchet engineering:',
    imageUrl: svgToDataUri(twoButtonsSvg),
    description: 'Sweating control room operator torn between two identical glowing red launch buttons.',
    precomputedCaptions: [
      {
        id: 'btn-1',
        topText: 'FIX THE BUG MANUAL IN 10 MINUTES',
        bottomText: 'SPEND 6 HOURS WRITING A SCRIPT TO AUTOMATE IT',
        fullCaption: 'Do the 5-minute manual task once vs. Spend 6 hours writing an automation script that breaks next week:',
        angle: 'Tech & Work',
      },
      {
        id: 'btn-2',
        topText: 'SLEEP 8 HOURS AND FEEL GREAT',
        bottomText: 'REVENGE BEDTIME PROCRASTINATION UNTIL 2 AM',
        fullCaption: 'Me every night at 11:30 PM choosing between a healthy circadian rhythm and watching 1990s woodworking videos:',
        angle: 'Relatable',
      },
      {
        id: 'btn-3',
        topText: 'EAT THE HEALTHY MEAL PREP IN THE FRIDGE',
        bottomText: 'ORDER TACOS BECAUSE TODAY WAS mildly STRESSFUL',
        fullCaption: 'The Tupperware of steamed broccoli watching me open the food delivery app for the third night in a row:',
        angle: 'Self-Own',
      },
      {
        id: 'btn-4',
        topText: 'CLOSE THE 84 OPEN BROWSER TABS',
        bottomText: 'OPEN A NEW WINDOW AND PRETEND THEY DONT EXIST',
        fullCaption: 'My 32GB of RAM begging for mercy while I keep 90 tabs open "just in case I read them this weekend":',
        angle: 'Overthinking',
      },
      {
        id: 'btn-5',
        topText: 'REPLY TO THE TEXT IMMEDIATELY',
        bottomText: 'WAIT 10 MINUTES THEN FORGET FOR 6 DAYS',
        fullCaption: 'There is no middle ground: I either reply in 0.4 seconds or mentally reply and vanish until next month:',
        angle: 'Wholesome Chaos',
      },
    ],
  },
];
