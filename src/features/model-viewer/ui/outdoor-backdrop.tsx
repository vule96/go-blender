import { cn } from '@/shared/lib/cn';

/*
 * An illustrated outdoor scene behind the 3D canvas: sky, sun, drifting
 * clouds, far hills, a tree line and a meadow. It is plain SVG in the page,
 * entirely separate from the model, and costs nothing on the GPU.
 * Colours come from the map's palette (greens of the north, sand, sky blue).
 */

interface Tree {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly tone: 0 | 1 | 2;
}

const TREE_TONES = ['#5f9e45', '#4e8a3c', '#79b25e'] as const;

// Tree line along the middle hills (x, ground y, scale, tone).
const TREES: readonly Tree[] = [
  { x: 70, y: 640, s: 1.1, tone: 1 },
  { x: 128, y: 632, s: 0.8, tone: 0 },
  { x: 230, y: 626, s: 1.0, tone: 2 },
  { x: 285, y: 630, s: 0.7, tone: 1 },
  { x: 1180, y: 618, s: 1.2, tone: 0 },
  { x: 1245, y: 624, s: 0.8, tone: 1 },
  { x: 1300, y: 630, s: 1.0, tone: 2 },
  { x: 1385, y: 636, s: 0.9, tone: 0 },
  { x: 1450, y: 640, s: 1.15, tone: 1 },
  { x: 1530, y: 646, s: 0.8, tone: 2 },
];

function TreeShape({ x, y, s, tone }: Tree) {
  return (
    <g transform={`translate(${String(x)} ${String(y)}) scale(${String(s)})`}>
      <rect x={-4} y={-26} width={8} height={28} rx={3} fill="#7a5a3c" />
      <circle cx={0} cy={-46} r={26} fill={TREE_TONES[tone]} />
      <circle cx={-15} cy={-34} r={17} fill={TREE_TONES[tone]} />
      <circle cx={16} cy={-35} r={18} fill={TREE_TONES[tone]} />
      <circle cx={-6} cy={-55} r={11} fill="#fff" opacity={0.12} />
    </g>
  );
}

function Cloud({ className, scale = 1 }: { readonly className?: string; readonly scale?: number }) {
  return (
    <g className={className}>
      <g transform={`scale(${String(scale)})`}>
        <path
          d="M0 40c0-14 12-25 27-25 4-14 18-24 34-24 15 0 28 8 33 21 3-1 7-2 11-2 17 0 31 13 31 30z"
          fill="#fff"
        />
        <path d="M0 40h136c0 6-6 10-14 10H12C5 50 0 46 0 40z" fill="#dcecf5" />
      </g>
    </g>
  );
}

export function OutdoorBackdrop({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className={cn('pointer-events-none absolute inset-0 size-full select-none', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4ea" />
          <stop offset="0.55" stopColor="#bfe5f6" />
          <stop offset="0.78" stopColor="#eef7ee" />
        </linearGradient>
        <radialGradient id="bd-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8dc" />
          <stop offset="0.35" stopColor="#fff1b8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff1b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bd-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8cc46c" />
          <stop offset="1" stopColor="#6fa955" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#bd-sky)" />
      <circle cx="1290" cy="170" r="150" fill="url(#bd-sun)" />

      <Cloud className="backdrop-cloud backdrop-cloud-slow" scale={1.5} />
      <g transform="translate(160 120)">
        <Cloud className="backdrop-cloud backdrop-cloud-slow" scale={1.2} />
      </g>
      <g transform="translate(980 70)">
        <Cloud className="backdrop-cloud backdrop-cloud-fast" scale={0.9} />
      </g>
      <g transform="translate(620 210)">
        <Cloud className="backdrop-cloud backdrop-cloud-fast" scale={0.7} />
      </g>

      {/* Far range, hazy */}
      <path
        d="M0 600 C140 540 250 520 380 556 S620 500 760 540 1010 488 1160 528 1420 500 1600 548 V900 H0z"
        fill="#b9dccb"
      />
      {/* Middle hills with the tree line */}
      <path
        d="M0 640 C180 600 330 610 470 640 S760 668 900 650 1150 602 1330 620 1520 642 1600 650 V900 H0z"
        fill="#a6d38a"
      />
      {TREES.map((t) => (
        <TreeShape key={`${String(t.x)}-${String(t.y)}`} {...t} />
      ))}
      {/* Meadow in front */}
      <path d="M0 720 C260 690 520 700 800 716 S1340 700 1600 712 V900 H0z" fill="url(#bd-meadow)" />
    </svg>
  );
}
