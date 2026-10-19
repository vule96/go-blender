import type { SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

/** Marks a landmark that has a 3D model: a small isometric cube. */
export function ModelCubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" {...props}>
      <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" fill="var(--color-coral-500)" />
      <path d="M8 8.5 14 5v6l-6 3.5z" fill="#000" fillOpacity="0.22" />
      <path d="M8 8.5 2 5l6-3.5L14 5z" fill="#fff" fillOpacity="0.3" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      {...props}
    >
      <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" />
      <path
        d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" {...props}>
      <path d="M13.5 10.2A5.8 5.8 0 0 1 5.8 2.5a5.8 5.8 0 1 0 7.7 7.7z" fill="currentColor" />
    </svg>
  );
}
