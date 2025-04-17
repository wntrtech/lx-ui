import { parse, parseJSON, format, formatRFC3339, isDate } from 'date-fns';
import useLx from '@/hooks/useLx';
import { capitalizeFirstLetter } from '@/utils/stringUtils';

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
  // Check the basic format first using regex
  const timePattern = /^\d{2}:\d{2}$/;
  if (!timePattern.test(value)) return false;
  // Split the time string into hours and minutes
  const [hours, minutes] = value.split(':').map(Number);
  // Check if hours and minutes are within valid ranges
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function isSameDate(date1, date2) {
  // Check if both dates are dates
  if (!isDateValid(date1) || !isDateValid(date2)) return false;
  // Compare ISO date strings
  return date1.toISOString() === date2.toISOString();
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
    d = new Date(date);
  }
  return format(d, dateFormatToUse);
}

export function formatDateTime(date, empty = '') {
  const { dateTimeFormat } = useLx().getGlobals();
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';

  if (!date) return empty;
  let d = date;

  if (typeof d === 'string') {
    d = new Date(date);
  }

  return format(d, dateTimeFormatToUse);
}

export function formatFull(date, empty = '') {
  const { dateTimeFullFormat } = useLx().getGlobals();
  const dateTimeFullFormatToUse = dateTimeFullFormat || 'dd.MM.yyyy. HH:mm:ss';

  if (!date) return empty;
  let d = date;

  if (typeof d === 'string') {
    d = new Date(date);
  }

  return format(d, dateTimeFullFormatToUse);
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getMonthNames(localeId = 'lv-LV') {
  const dates = [];
  for (let i = 0; i < 12; i += 1) {
    dates.push(new Date(2000, i));
  }

  const fullMonthDtf = new Intl.DateTimeFormat(localeId, {
    month: 'long',
  });
  const shortMonthDtf = new Intl.DateTimeFormat(localeId, {
    month: 'short',
  });

  return dates.map((d, orderIndex) => {
    const fullName = fullMonthDtf.format(d);
    let shortName = shortMonthDtf.format(d);

    // Fallback for locales like "lt-LT" where shortName might be numeric
    if (/^\d+$/.test(shortName)) {
      // Take the first 3 letters of the full name, check length for dots
      shortName = fullName.length === 5 ? fullName : `${fullName.substring(0, 4)}.`;
    }

    return {
      fullName,
      shortName,
      orderIndex,
    };
  });
}

export function getWeekdayNames(localeId = 'lv-LV', firstDayOfTheWeek = 2) {
  const dates = [];
  for (let i = 1; i <= 7; i += 1) {
    dates.push(new Date(2000, 0, i + firstDayOfTheWeek));
  }
  const fullWeekDtf = new Intl.DateTimeFormat(localeId, {
    weekday: 'long',
  });
  const shortWeekDtf = new Intl.DateTimeFormat(localeId, {
    weekday: 'short',
  });
  const narrowWeekDtf = new Intl.DateTimeFormat(localeId, {
    weekday: 'narrow',
  });

  return dates.map((d, orderIndex) => {
    const fullName = fullWeekDtf.format(d);
    const shortName = shortWeekDtf.format(d);
    const narrowName = narrowWeekDtf.format(d);

    return {
      fullName,
      shortName,
      narrowName,
      orderIndex,
    };
  });
}

// Examples: "Thursday, September 12, 2012"
export function formatLocalizedDate(localeId, date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  let formattedDate = date.toLocaleDateString(localeId, options);
  formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  return formattedDate;
}

export function getMonthYearString(localeId, month, year) {
  if (month === null || month === undefined) return null;
  if (year === null || year === undefined) return null;

  const formatter = new Intl.DateTimeFormat(localeId, {
    year: 'numeric',
    month: 'long',
  });
  return formatter.format(new Date(year, month, 1));
}

export function extractTimeFromDate(localeId, dateString) {
  if (!dateString) return null;

  const dateObj = new Date(dateString);
  if (!isDate(dateObj)) return null;

  const time = dateObj.toLocaleTimeString(localeId, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return time;
}

export function extractMonthFromDate(localeId, dateString, capitalize = true) {
  if (!dateString) return null;

  const dateObj = new Date(dateString);
  if (!isDate(dateObj)) return null;

  const month = dateObj.toLocaleDateString(localeId, {
    month: 'long',
  });
  return capitalize ? capitalizeFirstLetter(month) : month;
}
