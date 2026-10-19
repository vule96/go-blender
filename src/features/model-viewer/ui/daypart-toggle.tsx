'use client';

import { cn } from '@/shared/lib/cn';
import { pickDaypart, useDaypart } from '@/shared/lib/use-daypart';
import { MoonIcon, SunIcon } from '@/shared/ui/icons';

/**
 * Day / night switch for the 3D page. The pick holds for the tab's session (so
 * it carries over to the next landmark); without one, the visitor's clock decides.
 */
export function DaypartToggle({ className }: { readonly className?: string }) {
  const daypart = useDaypart();
  const night = daypart === 'night';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label="Ban đêm"
      title={night ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'}
      onClick={() => {
        pickDaypart(night ? 'day' : 'night');
      }}
      className={cn(
        'group relative flex h-9 w-[4.5rem] items-center rounded-full border border-white/40 p-1 shadow-md backdrop-blur transition-colors',
        night ? 'bg-[#13254a]/80' : 'bg-white/70',
        className,
      )}
    >
      <SunIcon
        className={cn(
          'absolute left-2.5 size-4 transition-opacity',
          night ? 'text-white opacity-40' : 'opacity-0',
        )}
        aria-hidden="true"
      />
      <MoonIcon
        className={cn(
          'absolute right-2.5 size-4 transition-opacity',
          night ? 'opacity-0' : 'text-ink opacity-50',
        )}
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className={cn(
          'grid size-7 place-items-center rounded-full shadow transition-transform duration-300 ease-out motion-reduce:transition-none',
          night ? 'translate-x-9 bg-[#2b416e] text-[#f3f0e4]' : 'translate-x-0 bg-[#ffd76a] text-[#8a5a00]',
        )}
      >
        {night ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
      </span>
    </button>
  );
}
