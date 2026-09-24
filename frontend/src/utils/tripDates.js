function toLocalDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date) {
  // toISOString() converts to UTC first, which shifts the calendar day
  // backward in timezones ahead of UTC (e.g. Turkey, UTC+3) for local
  // midnight dates. Read the local Y/M/D components instead.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Builds an inclusive array of ISO date strings between startDate and
 * endDate. Returns an empty array for missing/invalid input or when
 * endDate is before startDate.
 */
export function buildDateRange(startDate, endDate) {
  const start = toLocalDate(startDate);
  const end = toLocalDate(endDate);

  if (!start || !end || end < start) {
    return [];
  }

  const days = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
