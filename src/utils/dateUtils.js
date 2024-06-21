import { parse, parseJSON, format, formatRFC3339, isDate } from 'date-fns';
import useLx from '@/hooks/useLx';

export function parseDate(date) {
  if (!date) return null;
  if (date.length === 10) {
    return parse(date, 'yyyy-MM-dd', new Date());
  }
  return isDate(date) ? date : parseJSON(date);
}

export function formatJSON(date) {
  if (!date) return null;
  let d = date;
  if (typeof d === 'string') {
    if (d.length === 10) {
      d = parse(d, 'dd.MM.yyyy', new Date());
    } else if (d.length === 11) {
      d = parse(d, 'dd.MM.yyyy.', new Date());
    } else if (d.length === 16) {
      d = parse(d, 'dd.MM.yyyy HH:mm', new Date());
    } else if (d.length === 17) {
      d = parse(d, 'dd.MM.yyyy. HH:mm', new Date());
    }
    return d;
  }
  return formatRFC3339(d);
}

export function isDateValid(date) {
  return parseDate(date) instanceof Date && !Number.isNaN(Number(parseDate(date)));
}

export function isTimeValid(value) {
  return /^\d{2}:\d{2}$/.test(value);
}

export function formatDateJSON(date) {
  if (!date) return null;
  let d = date;
  if (typeof d === 'string') {
    d = formatJSON(d);
  }
  if (isDateValid(d)) return format(d, 'yyyy-MM-dd');
  return null;
}

export function formatDate(date, empty = '') {
  const { dateFormat } = useLx().getGlobals();
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';

  if (!date) return empty;
  let d = date;
  if (typeof d === 'string') {
    if (d.length === 10) {
      d += 'T00:00:00';
    }
    d = parseJSON(d);
  }
  return format(d, dateFormatToUse);
}

export function formatDateTime(date, empty = '') {
  const { dateTimeFormat } = useLx().getGlobals();
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';

  if (!date) return empty;
  let d = date;
  if (typeof d === 'string') {
    d = parseJSON(date);
  }
  return format(d, dateTimeFormatToUse);
}

export function formatFull(date, empty = '') {
  const { dateTimeFullFormat } = useLx().getGlobals();
  const dateTimeFullFormatToUse = dateTimeFullFormat || 'dd.MM.yyyy. HH:mm:ss';

  if (!date) return empty;
  let d = date;
  if (typeof d === 'string') {
    d = parseJSON(date);
  }
  return format(d, dateTimeFullFormatToUse);
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
