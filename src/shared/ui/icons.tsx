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
