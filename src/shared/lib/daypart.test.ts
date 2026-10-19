import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { DAYPART_SCRIPT, daypartAt, parseDaypart } from './daypart';

function at(hour: number, minute = 0) {
  return new Date(2026, 9, 19, hour, minute);
}

describe('daypartAt', () => {
  it('is day from 06:00 up to 17:59', () => {
    expect(daypartAt(at(6))).toBe('day');
    expect(daypartAt(at(12, 30))).toBe('day');
    expect(daypartAt(at(17, 59))).toBe('day');
  });

  it('is night from 18:00 up to 05:59', () => {
    expect(daypartAt(at(18))).toBe('night');
    expect(daypartAt(at(0))).toBe('night');
    expect(daypartAt(at(5, 59))).toBe('night');
  });
});

describe('parseDaypart', () => {
  it('accepts only the two dayparts', () => {
    expect(parseDaypart('night')).toBe('night');
    expect(parseDaypart('day')).toBe('day');
    expect(parseDaypart('dusk')).toBeNull();
    expect(parseDaypart(null)).toBeNull();
  });
});

/** Runs the inline script in a sandbox with a fake clock and URL. */
function runScript(hour: number, search = '', stored: string | null = null): string | undefined {
  const root = { dataset: {} as Record<string, string> };
  class FixedDate {
    getHours() {
      return hour;
    }
  }
  runInNewContext(DAYPART_SCRIPT, {
    document: { documentElement: root },
    location: { search },
    Date: FixedDate,
    URLSearchParams,
    sessionStorage: { getItem: () => stored },
  });
  return root.dataset['daypart'];
}

describe('DAYPART_SCRIPT', () => {
  it('sets the same daypart as daypartAt', () => {
    for (const hour of [0, 5, 6, 12, 17, 18, 23]) {
      expect(runScript(hour)).toBe(daypartAt(at(hour)));
    }
  });

  it("uses the visitor's pick over the clock, and the URL over both", () => {
    expect(runScript(12, '', 'night')).toBe('night');
    expect(runScript(22, '', 'day')).toBe('day');
    expect(runScript(22, '?daypart=night', 'day')).toBe('night');
  });

  it('ignores an unreadable or invalid stored pick', () => {
    expect(runScript(12, '', 'dusk')).toBe('day');
  });

  it('honours the URL override', () => {
    expect(runScript(12, '?daypart=night')).toBe('night');
    expect(runScript(22, '?daypart=day')).toBe('day');
  });
});
