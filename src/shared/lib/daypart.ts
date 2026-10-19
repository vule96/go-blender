/**
 * Day or night, from the visitor's own clock. The 3D page switches its sky and
 * lighting with it.
 */
export type Daypart = 'day' | 'night';

/** Local hours: day runs from DAY_START (inclusive) to DAY_END (exclusive). */
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 18;

/** `?daypart=night` (or `day`) pins the daypart, to preview the other theme. */
export const DAYPART_PARAM = 'daypart';

export function daypartAt(date: Date): Daypart {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? 'day' : 'night';
}

export function parseDaypart(value: string | null | undefined): Daypart | null {
  return value === 'day' || value === 'night' ? value : null;
}

/** Browser only: the URL override if present, otherwise the local clock. */
export function currentDaypart(): Daypart {
  const pinned = parseDaypart(new URLSearchParams(window.location.search).get(DAYPART_PARAM));
  return pinned ?? daypartAt(new Date());
}

/**
 * Runs in <head> before the body is parsed, so the first paint already has the
 * right sky (no flash of daylight at night). Mirrors `currentDaypart()`.
 */
export const DAYPART_SCRIPT = `(function(){try{var p=new URLSearchParams(location.search).get('${DAYPART_PARAM}');var h=new Date().getHours();document.documentElement.dataset.daypart=p==='day'||p==='night'?p:h>=${String(DAY_START_HOUR)}&&h<${String(DAY_END_HOUR)}?'day':'night'}catch(e){}})()`;
