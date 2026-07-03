function getSingaporeDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '1970');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '01') - 1;
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '01');

  return { year, month, day };
}

export function getSingaporeTodayParts(date = new Date()) {
  return getSingaporeDateParts(date);
}

export function getSingaporeTodayKey(date = new Date()) {
  const { year, month, day } = getSingaporeDateParts(date);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isDateOnOrBeforeSingaporeToday(year: number, monthIndex: number, day: number) {
  const today = getSingaporeDateParts();
  if (year < today.year) {
    return true;
  }
  if (year > today.year) {
    return false;
  }
  if (monthIndex < today.month) {
    return true;
  }
  if (monthIndex > today.month) {
    return false;
  }

  return day <= today.day;
}

export function isMonthInFutureSingapore(year: number, monthIndex: number) {
  const today = getSingaporeDateParts();
  return year > today.year || (year === today.year && monthIndex > today.month);
}