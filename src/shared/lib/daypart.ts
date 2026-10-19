/**
 * Day or night, from the visitor's own clock, unless they picked one with the
 * toggle. The 3D page switches its sky and lighting with it.
 */
export type Daypart = 'day' | 'night';

/** Local hours: day runs from DAY_START (inclusive) to DAY_END (exclusive). */
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 18;

/** `?daypart=night` (or `day`) pins the daypart, to preview the other theme. */
export const DAYPART_PARAM = 'daypart';

/** sessionStorage key for the visitor's pick from the toggle (kept for the tab's session). */
export const DAYPART_STORAGE_KEY = 'goblender:daypart';

export function daypartAt(date: Date): Daypart {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? 'day' : 'night';
}

export function parseDaypart(value: string | null | undefined): Daypart | null {
  return value === 'day' || value === 'night' ? value : null;
}

/** Browser only: the visitor's pick, if any. Storage can be blocked, so this never throws. */
export function readPickedDaypart(): Daypart | null {
  try {
    return parseDaypart(window.sessionStorage.getItem(DAYPART_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writePickedDaypart(daypart: Daypart | null): void {
  try {
    if (daypart) window.sessionStorage.setItem(DAYPART_STORAGE_KEY, daypart);
    else window.sessionStorage.removeItem(DAYPART_STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the pick still holds in memory for this page.
  }
}

/** Browser only: URL override, then the visitor's pick, then the local clock. */
export function currentDaypart(picked: Daypart | null = readPickedDaypart()): Daypart {
  const pinned = parseDaypart(new URLSearchParams(window.location.search).get(DAYPART_PARAM));
  return pinned ?? picked ?? daypartAt(new Date());
}

/**
 * Runs in <head> before the body is parsed, so the first paint already has the
 * right sky (no flash of daylight at night). Mirrors `currentDaypart()`.
 */
export const DAYPART_SCRIPT = `(function(){try{var ok=function(v){return v==='day'||v==='night'};var p=new URLSearchParams(location.search).get('${DAYPART_PARAM}');var s=null;try{s=sessionStorage.getItem('${DAYPART_STORAGE_KEY}')}catch(e){}var h=new Date().getHours();document.documentElement.dataset.daypart=ok(p)?p:ok(s)?s:h>=${String(DAY_START_HOUR)}&&h<${String(DAY_END_HOUR)}?'day':'night'}catch(e){}})()`;
