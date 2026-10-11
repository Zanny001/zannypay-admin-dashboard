import { formatAge } from './format-age';

describe('formatAge', () => {
  const NOW = new Date('2026-08-10T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function minutesAgo(n: number) {
    return new Date(NOW - n * 60 * 1000).toISOString();
  }
  function hoursAgo(n: number) {
    return new Date(NOW - n * 60 * 60 * 1000).toISOString();
  }

  it('shows minutes for anything under an hour, never rounding down to 0m', () => {
    expect(formatAge(minutesAgo(30)).label).toBe('30m ago');
    // 30 seconds should still read as "1m ago", not "0m ago" — nothing in
    // a review queue should claim to have happened "0" of anything.
    expect(formatAge(new Date(NOW - 30 * 1000).toISOString()).label).toBe('1m ago');
  });

  it('shows hours between 1 and 24 hours', () => {
    expect(formatAge(hoursAgo(1)).label).toBe('1h ago');
    expect(formatAge(hoursAgo(5)).label).toBe('5h ago');
    expect(formatAge(hoursAgo(23)).label).toBe('23h ago');
  });

  it('shows days at 24 hours and beyond', () => {
    expect(formatAge(hoursAgo(24)).label).toBe('1d ago');
    expect(formatAge(hoursAgo(48)).label).toBe('2d ago');
  });

  it('flags isOverdue at exactly the threshold, using the default 24h', () => {
    expect(formatAge(hoursAgo(24)).isOverdue).toBe(true);
    expect(formatAge(hoursAgo(23)).isOverdue).toBe(false);
    expect(formatAge(hoursAgo(23.99)).isOverdue).toBe(false);
  });

  it('respects a custom overdueAfterHours threshold', () => {
    expect(formatAge(hoursAgo(5), 4).isOverdue).toBe(true);
    expect(formatAge(hoursAgo(3), 4).isOverdue).toBe(false);
  });
});
