'use client';

import { useEffect, useSyncExternalStore } from 'react';

import {
  currentDaypart,
  type Daypart,
  DAYPART_PARAM,
  readPickedDaypart,
  writePickedDaypart,
} from './daypart';

const CHECK_EVERY_MS = 60_000;

/**
 * The visitor's pick from the toggle, shared by every component on the page.
 * `undefined` = not read from sessionStorage yet; `null` = follow the clock.
 */
let picked: Daypart | null | undefined;
const listeners = new Set<() => void>();

function getPicked(): Daypart | null {
  if (picked === undefined) picked = readPickedDaypart();
  return picked;
}

/** Pick day or night for the rest of the tab's session; `null` goes back to the clock. */
export function pickDaypart(daypart: Daypart | null): void {
  picked = daypart;
  writePickedDaypart(daypart);
  // A `?daypart=` preview link would otherwise outrank the pick; drop it from the URL.
  const url = new URL(window.location.href);
  if (url.searchParams.has(DAYPART_PARAM)) {
    url.searchParams.delete(DAYPART_PARAM);
    window.history.replaceState(window.history.state, '', url);
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const timer = window.setInterval(onChange, CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    listeners.delete(onChange);
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onChange);
  };
}

function getSnapshot(): Daypart {
  return currentDaypart(getPicked());
}

function getServerSnapshot(): Daypart {
  return 'day';
}

/**
 * The current daypart: the visitor's pick if they made one, otherwise the
 * clock, re-checked every minute and when the tab comes back (a page left open
 * switches from day to night on its own). It also keeps `<html data-daypart>`
 * (first set by DAYPART_SCRIPT) in sync for CSS.
 */
export function useDaypart(): Daypart {
  const daypart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // During hydration the first commit carries the server snapshot ('day');
    // writing it would flash daylight at night, so only write a live value.
    if (daypart === getSnapshot()) document.documentElement.dataset['daypart'] = daypart;
  }, [daypart]);

  return daypart;
}
