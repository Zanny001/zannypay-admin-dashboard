// A small, dependency-free relative-time formatter — "3h ago", "2d ago" —
// used to surface how long something has been sitting in a review queue.
// `isOverdue` flags anything past the given threshold so the UI can call
// it out visually instead of the age being just another quiet data point.
export function formatAge(dateString: string, overdueAfterHours = 24): { label: string; isOverdue: boolean } {
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const hours = (now - then) / (1000 * 60 * 60);

  let label: string;
  if (hours < 1) label = `${Math.max(1, Math.round(hours * 60))}m ago`;
  else if (hours < 24) label = `${Math.round(hours)}h ago`;
  else label = `${Math.round(hours / 24)}d ago`;

  return { label, isOverdue: hours >= overdueAfterHours };
}
