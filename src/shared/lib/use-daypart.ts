'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { currentDaypart, type Daypart } from './daypart';

const CHECK_EVERY_MS = 60_000;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onChange);
  };
}

function getServerSnapshot(): Daypart {
  return 'day';
}

/**
 * The current daypart, re-checked every minute and when the tab comes back, so
 * a page left open switches from day to night on its own. It also keeps
 * `<html data-daypart>` (first set by DAYPART_SCRIPT) in sync for CSS.
 */
export function useDaypart(): Daypart {
  const daypart = useSyncExternalStore(subscribe, currentDaypart, getServerSnapshot);

  useEffect(() => {
    // During hydration the first commit carries the server snapshot ('day');
    // writing it would flash daylight at night, so only write a live value.
    if (daypart === currentDaypart()) document.documentElement.dataset['daypart'] = daypart;
  }, [daypart]);

  return daypart;
}
