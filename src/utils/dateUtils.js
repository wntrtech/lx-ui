import { parse, parseJSON, format, formatRFC3339, isDate } from 'date-fns';

export function parseDate(date) {
  if (!date) {
    return null;
  }
  if (date.length === 10) {
    return parse(date, 'yyyy-MM-dd', new Date());
  }
  return isDate(date) ? date : parseJSON(date);
}

export function formatJSON(date) {
  if (!date) {
    return null;
  }
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

export function formatDateJSON(date) {
  if (!date) {
    return null;
  }
  let d = date;
  if (typeof d === 'string') {
    d = formatJSON(d);
  }
  if (isDateValid(d)) return format(d, 'yyyy-MM-dd');
  return null;
}

export function formatDate(date, empty = '') {
  if (!date) {
    return empty;
  }
  let d = date;
  if (typeof d === 'string') {
    if (d.length === 10) {
      d += 'T00:00:00';
    }
    d = parseJSON(d);
  }

  return format(d, 'dd.MM.yyyy');
}

export function formatDateTime(date, empty = '') {
  if (!date) {
    return empty;
  }
  let d = date;
  if (typeof d === 'string') {
    d = parseJSON(date);
  }

  return format(d, 'dd.MM.yyyy HH:mm');
}

export function formatFull(date, empty = '') {
  if (!date) {
    return empty;
  }
  let d = date;
  if (typeof d === 'string') {
    d = parseJSON(date);
  }

  return format(d, 'dd.MM.yyyy HH:mm:ss');
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
