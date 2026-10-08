/**
 * One small generated illustration per destination: a sky at golden hour, the brand dot as the
 * sun, and two layers of terrain. No photographs, no landmarks, no prices.
 *
 * Palettes are illustration data, not UI colours (see `*.art.tsx` in eslint.config.mjs).
 */
type Terrain = 'plain' | 'hills' | 'peak' | 'sea' | 'river' | 'strait';

type Art = {
  sky: [string, string];
  land: [string, string];
  sun: [number, number];
  terrain: Terrain;
};

const ART: Record<string, Art> = {
  MHD: {
    sky: ['#2A1B3D', '#E58A4E'],
    land: ['#3A2247', '#1C1226'],
    sun: [226, 92],
    terrain: 'plain',
  },
  SYZ: {
    sky: ['#2B1840', '#E0706F'],
    land: ['#4A2552', '#20122C'],
    sun: [84, 86],
    terrain: 'hills',
  },
  IFN: {
    sky: ['#14294A', '#E9A45F'],
    land: ['#1D3F63', '#0E1D33'],
    sun: [236, 84],
    terrain: 'river',
  },
  TBZ: {
    sky: ['#33203F', '#E2835C'],
    land: ['#5A3048', '#221226'],
    sun: [92, 70],
    terrain: 'peak',
  },
  KIH: {
    sky: ['#0F3350', '#F0A861'],
    land: ['#14566A', '#0B2233'],
    sun: [168, 112],
    terrain: 'sea',
  },
  AWZ: {
    sky: ['#3A1F2A', '#EE9A4A'],
    land: ['#5A2B2A', '#22110F'],
    sun: [150, 96],
    terrain: 'river',
  },
  BND: {
    sky: ['#183247', '#EFAE5C'],
    land: ['#1C5A66', '#0C202C'],
    sun: [96, 108],
    terrain: 'sea',
  },
  IST: {
    sky: ['#241B48', '#E77A86'],
    land: ['#46326E', '#171030'],
    sun: [240, 98],
    terrain: 'strait',
  },
};

const SUN = '#FDB814';
const SUN_GLOW = '#FFE9A8';
const GLINT = '#FFD98A';

function Glint({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 22} ${y}h44M${x - 13} ${y + 10}h26M${x - 6} ${y + 20}h12`}
      stroke={GLINT}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity=".7"
    />
  );
}

function Land({ art }: { art: Art }) {
  const [far, near] = art.land;
  const x = art.sun[0];
  switch (art.terrain) {
    case 'plain':
      return (
        <>
          <path fill={far} d="M0 150Q160 132 320 148V200H0z" />
          <path fill={near} d="M0 174Q120 160 320 178V200H0z" />
        </>
      );
    case 'hills':
      return (
        <>
          <path fill={far} d="M0 150Q70 118 150 142T320 132V200H0z" />
          <path fill={near} d="M0 176Q90 150 190 172T320 164V200H0z" />
        </>
      );
    case 'peak':
      return (
        <>
          <path fill={far} d="M0 156C60 150 110 70 160 96S250 150 320 120V200H0z" />
          <path fill={near} d="M0 178Q110 150 200 174T320 168V200H0z" />
        </>
      );
    case 'sea':
      return (
        <>
          <path fill={far} d="M0 138H320V200H0z" />
          <Glint x={x} y={148} />
          <path fill={near} d="M0 188Q120 176 320 192V200H0z" />
        </>
      );
    case 'river':
      return (
        <>
          <path fill={far} d="M0 146Q160 134 320 144V200H0z" />
          <path fill={near} d="M0 162H320V200H0z" />
          <Glint x={x} y={170} />
        </>
      );
    case 'strait':
      return (
        <>
          <path fill={far} d="M0 150Q60 118 132 150zM186 150Q262 114 320 140V150z" />
          <path fill={near} d="M0 150H320V200H0z" />
          <Glint x={x} y={160} />
        </>
      );
  }
}

export function DestinationArt({ code, className }: { code: string; className?: string }) {
  const art = ART[code];
  if (!art) return null;
  const [cx, cy] = art.sun;
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id={`sky-${code}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.sky[0]} />
          <stop offset=".8" stopColor={art.sky[1]} />
        </linearGradient>
        <radialGradient id={`glow-${code}`}>
          <stop offset="0" stopColor={SUN_GLOW} stopOpacity=".6" />
          <stop offset="1" stopColor={SUN_GLOW} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#sky-${code})`} />
      <g className="transition-transform duration-900 ease-out-soft group-hover:-translate-y-3">
        <circle cx={cx} cy={cy} r="52" fill={`url(#glow-${code})`} />
        <circle cx={cx} cy={cy} r="13" fill={SUN} />
      </g>
      <Land art={art} />
    </svg>
  );
}
