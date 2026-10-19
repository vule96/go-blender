import { BACKDROP, type Puff, VIEW_H, VIEW_W } from '@/features/model-viewer/lib/backdrop-geometry';
import { cn } from '@/shared/lib/cn';

/*
 * The landscape behind the 3D canvas, in two lights: day and night. Plain SVG
 * in the page, fully separate from the model. Both variants are in the markup;
 * CSS shows one from `<html data-daypart>` (set before first paint, then kept
 * in sync by useDaypart) and cross-fades when the hour turns.
 *
 * Realism comes from atmospheric perspective (far ridges fade into a blue
 * haze), procedural ridgelines, SVG turbulence for cloud edges, foliage and
 * grass, and light that matches the sky (warm sun, cool moon).
 */

interface Palette {
  readonly id: 'day' | 'night';
  readonly sky: readonly (readonly [offset: number, color: string])[];
  readonly far: string;
  readonly mid: string;
  readonly hills: string;
  readonly forest: string;
  readonly meadowTop: string;
  readonly meadowBottom: string;
  readonly haze: string;
  readonly hazeOpacity: number;
  readonly cloudLit: string;
  readonly cloudBase: string;
  readonly cloudShade: string;
  readonly cloudOpacity: number;
  readonly grainOpacity: number;
}

const DAY: Palette = {
  id: 'day',
  sky: [
    [0, '#2c68ae'],
    [0.3, '#5a94d0'],
    [0.56, '#9cc3e3'],
    [0.68, '#cadeea'],
    [1, '#e2e9e3'],
  ],
  far: '#9db5c6',
  mid: '#7d9a9f',
  hills: '#6b8a54',
  forest: '#3b5c31',
  meadowTop: '#7b994a',
  meadowBottom: '#58763a',
  haze: '#d5e3ea',
  hazeOpacity: 0.75,
  cloudLit: '#ffffff',
  cloudBase: '#d3dde8',
  cloudShade: '#9fb2c6',
  cloudOpacity: 0.95,
  grainOpacity: 0.22,
};

const NIGHT: Palette = {
  id: 'night',
  sky: [
    [0, '#02050d'],
    [0.32, '#071229'],
    [0.56, '#102246'],
    [0.68, '#1b335d'],
    [1, '#223b66'],
  ],
  far: '#1a2946',
  mid: '#142037',
  hills: '#0f1a20',
  forest: '#08110e',
  meadowTop: '#111e18',
  meadowBottom: '#09110d',
  haze: '#2b426c',
  hazeOpacity: 0.55,
  cloudLit: '#3f5078',
  cloudBase: '#24324f',
  cloudShade: '#141d36',
  cloudOpacity: 0.6,
  grainOpacity: 0.12,
};

const LAYER = 'pointer-events-none absolute inset-0 size-full select-none';
const VIEW_BOX = `0 0 ${String(VIEW_W)} ${String(VIEW_H)}`;
// Anchored to the bottom so the horizon stays put on any aspect ratio.
const ASPECT = 'xMidYMax slice';

function variant(p: Palette) {
  return p.id === 'day' ? 'backdrop-day' : 'backdrop-night';
}

function Sky({ p }: { readonly p: Palette }) {
  const id = `bd-sky-${p.id}`;
  return (
    <g className={variant(p)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${id})`} />
      {p.id === 'day' ? <Sun /> : <NightSky />}
    </g>
  );
}

function Sun() {
  return (
    <>
      <defs>
        <radialGradient id="bd-sun-halo">
          <stop offset="0" stopColor="#fffdf2" stopOpacity="0.95" />
          <stop offset="0.1" stopColor="#fff6d6" stopOpacity="0.7" />
          <stop offset="0.35" stopColor="#fff0c7" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff0c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1190" cy="120" r="380" fill="url(#bd-sun-halo)" />
      <circle cx="1190" cy="120" r="24" fill="#fffef8" />
    </>
  );
}

function NightSky() {
  return (
    <>
      <defs>
        <radialGradient id="bd-moon-halo">
          <stop offset="0" stopColor="#dfe7ff" stopOpacity="0.45" />
          <stop offset="0.25" stopColor="#b9c9f0" stopOpacity="0.12" />
          <stop offset="1" stopColor="#b9c9f0" stopOpacity="0" />
        </radialGradient>
        {/* Faint warm glow of a town beyond the mountains. */}
        <radialGradient id="bd-town-glow" cx="0.5" cy="1" r="0.6">
          <stop offset="0" stopColor="#e9a066" stopOpacity="0.28" />
          <stop offset="1" stopColor="#e9a066" stopOpacity="0" />
        </radialGradient>
      </defs>
      {BACKDROP.stars.map((s) => (
        <circle
          key={`${String(s.x)}:${String(s.y)}`}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#f4f6ff"
          opacity={s.o}
        />
      ))}
      <ellipse cx="520" cy="560" rx="520" ry="150" fill="url(#bd-town-glow)" />
      <circle cx="1170" cy="130" r="260" fill="url(#bd-moon-halo)" />
      <circle cx="1170" cy="130" r="21" fill="#f3f0e4" />
      <circle cx="1163" cy="124" r="5" fill="#dcd7c5" opacity="0.8" />
      <circle cx="1177" cy="137" r="3.5" fill="#dcd7c5" opacity="0.7" />
      <circle cx="1167" cy="140" r="2.5" fill="#dcd7c5" opacity="0.6" />
    </>
  );
}

function CloudShape({ puffs }: { readonly puffs: readonly Puff[] }) {
  return (
    <>
      {puffs.map((c) => (
        <ellipse key={`${String(c.cx)}:${String(c.cy)}`} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} />
      ))}
    </>
  );
}

/** Vertical extent of a cloud, for its top-lit gradient. */
function cloudSpan(puffs: readonly Puff[]) {
  let top = Infinity;
  let bottom = -Infinity;
  for (const c of puffs) {
    top = Math.min(top, c.cy - c.ry);
    bottom = Math.max(bottom, c.cy + c.ry);
  }
  return { top, bottom };
}

function Clouds({ p }: { readonly p: Palette }) {
  return (
    <g className={variant(p)} opacity={p.cloudOpacity}>
      {BACKDROP.cirrus.map(([cx, cy, rx, ry]) => (
        <ellipse
          key={`${String(cx)}:${String(cy)}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={p.cloudLit}
          opacity={0.5}
          filter="url(#bd-cirrus)"
        />
      ))}
      {BACKDROP.clouds.map(({ key, puffs }) => {
        const { top, bottom } = cloudSpan(puffs);
        const gradient = `bd-cloud-${p.id}-${key}`;
        return (
          <g key={key}>
            <defs>
              {/* Lit from above: bright crown, greyer flat base. */}
              <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={bottom}>
                <stop offset="0.25" stopColor={p.cloudLit} />
                <stop offset="1" stopColor={p.cloudBase} />
              </linearGradient>
            </defs>
            {/* A soft, darker underside peeks out below the heap. */}
            <g fill={p.cloudShade} transform="translate(0 7)" filter="url(#bd-cloud-shade)" opacity={0.8}>
              <CloudShape puffs={puffs} />
            </g>
            <g fill={`url(#${gradient})`} filter="url(#bd-cloud)">
              <CloudShape puffs={puffs} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

function Land({ p }: { readonly p: Palette }) {
  const ids = {
    haze: `bd-haze-${p.id}`,
    meadow: `bd-meadow-${p.id}`,
    clip: `bd-meadow-clip-${p.id}`,
  };
  return (
    <g className={variant(p)}>
      <defs>
        <linearGradient id={ids.haze} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.haze} stopOpacity="0" />
          <stop offset="1" stopColor={p.haze} stopOpacity={p.hazeOpacity} />
        </linearGradient>
        <linearGradient id={ids.meadow} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.meadowTop} />
          <stop offset="1" stopColor={p.meadowBottom} />
        </linearGradient>
        <clipPath id={ids.clip}>
          <path d={BACKDROP.meadow} />
        </clipPath>
      </defs>

      <path d={BACKDROP.farMountains} fill={p.far} />
      <rect y="470" width={VIEW_W} height="140" fill={`url(#${ids.haze})`} />
      <path d={BACKDROP.midMountains} fill={p.mid} />
      <rect y="540" width={VIEW_W} height="100" fill={`url(#${ids.haze})`} opacity="0.8" />
      <path d={BACKDROP.hills} fill={p.hills} />
      <path d={BACKDROP.forest} fill={p.forest} filter="url(#bd-foliage)" />
      <rect y="620" width={VIEW_W} height="70" fill={`url(#${ids.haze})`} opacity="0.12" />
      <path d={BACKDROP.meadow} fill={`url(#${ids.meadow})`} />
      <rect
        y="640"
        width={VIEW_W}
        height="260"
        clipPath={`url(#${ids.clip})`}
        filter="url(#bd-grain)"
        opacity={p.grainOpacity}
      />
    </g>
  );
}

/** Filters shared by both variants and all three layers (ids resolve document-wide). */
function Filters() {
  return (
    <defs>
      <filter id="bd-cloud" x="-30%" y="-80%" width="160%" height="260%">
        <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="4" seed="8" />
        <feDisplacementMap in="SourceGraphic" scale="44" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <filter id="bd-cloud-shade" x="-30%" y="-80%" width="160%" height="260%">
        <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="4" seed="8" />
        <feDisplacementMap in="SourceGraphic" scale="44" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <filter id="bd-cirrus" x="-20%" y="-400%" width="140%" height="900%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.08" numOctaves="3" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="26" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="3 1.5" />
      </filter>
      <filter id="bd-foliage" x="-2%" y="-20%" width="104%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="5" />
        <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* Grass texture: horizontal-ish noise turned into dark speckles. */}
      <filter id="bd-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7 0.16" numOctaves="2" seed="12" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0.04  0 0 0 0 0  2.4 0 0 0 -1" />
      </filter>
    </defs>
  );
}

export function OutdoorBackdrop({ className }: { readonly className?: string }) {
  return (
    <div className={cn(LAYER, className)} aria-hidden="true">
      <svg viewBox={VIEW_BOX} preserveAspectRatio={ASPECT} className={LAYER}>
        <Filters />
        <Sky p={DAY} />
        <Sky p={NIGHT} />
      </svg>
      {/* Clouds sit on their own composited layer: drifting them moves pixels, it doesn't re-run the filters. */}
      <div className="backdrop-drift pointer-events-none absolute inset-y-0 -right-[8%] -left-[8%]">
        <svg viewBox={VIEW_BOX} preserveAspectRatio={ASPECT} className={LAYER}>
          <Clouds p={DAY} />
          <Clouds p={NIGHT} />
        </svg>
      </div>
      <svg viewBox={VIEW_BOX} preserveAspectRatio={ASPECT} className={LAYER}>
        <Land p={DAY} />
        <Land p={NIGHT} />
      </svg>
    </div>
  );
}
