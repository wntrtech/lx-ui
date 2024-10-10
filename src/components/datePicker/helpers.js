import { formatDateJSON } from '@/utils/dateUtils';
import { capitalizeFirstLetter } from '@/utils/stringUtils';
import {
  endOfMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  format,
} from 'date-fns';
import useLx from '@/hooks/useLx';

export const zeroPad = (value) => {
  if (value === null) return null;
  return Number(value) > 9 ? value : `0${Number(value)}`;
};

export function getTimeOrderIndex(arr, value) {
  const timeUnit = arr.find((itm) => itm.orderIndex === value);
  if (!timeUnit) return null;
  const { orderIndex } = timeUnit;
  return orderIndex;
}

export function getMonthNameByOrder(arrList, orderNumber, capitalize = false, nameType = 'full') {
  const month = arrList.find((m) => m.orderIndex === orderNumber);
  if (!month) return null;

  // Choose between fullName or shortName based on the 'type' parameter
  const monthName = nameType === 'full' ? month.fullName : month.shortName;

  return capitalize ? capitalizeFirstLetter(monthName) : monthName;
}

export function canSelectDate(date, minDate, maxDate, mode = 'date') {
  if (!date) return false;

  // Parse minDate and maxDate if they are strings
  const minDateParsed = minDate ? new Date(minDate) : null;
  const maxDateParsed = maxDate ? new Date(maxDate) : null;

  if (mode === 'date') {
    // Normalize the date by stripping the time
    const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const normalizedDate = normalizeDate(new Date(date));
    const normalizedMinDate = minDateParsed ? normalizeDate(minDateParsed) : null;
    const normalizedMaxDate = maxDateParsed ? normalizeDate(maxDateParsed) : null;

    const isAfterMinDate = !normalizedMinDate || normalizedDate >= normalizedMinDate;
    const isBeforeMaxDate = !normalizedMaxDate || normalizedDate <= normalizedMaxDate;

    return isAfterMinDate && isBeforeMaxDate;
  }

  if (mode === 'year') {
    const selectedYear = date.getFullYear();
    const isAfterMinYear = !minDateParsed || selectedYear >= minDateParsed.getFullYear();
    const isBeforeMaxYear = !maxDateParsed || selectedYear <= maxDateParsed.getFullYear();
    return isAfterMinYear && isBeforeMaxYear;
  }

  if (mode === 'month-year') {
    const selectedYear = date.getFullYear();
    const selectedMonth = date.getMonth();

    const minYear = minDateParsed ? minDateParsed.getFullYear() : null;
    const maxYear = maxDateParsed ? maxDateParsed.getFullYear() : null;

    const minMonth = minDateParsed ? minDateParsed.getMonth() : null;
    const maxMonth = maxDateParsed ? maxDateParsed.getMonth() : null;

    // Validate year and month together
    const isAfterMinYearMonth =
      !minDateParsed ||
      selectedYear > minYear ||
      (selectedYear === minYear && selectedMonth >= minMonth);

    const isBeforeMaxYearMonth =
      !maxDateParsed ||
      selectedYear < maxYear ||
      (selectedYear === maxYear && selectedMonth <= maxMonth);

    return isAfterMinYearMonth && isBeforeMaxYearMonth;
  }

  // For other modes, compare full date-time
  const isAfterMinDate = !minDate || date >= minDateParsed;
  const isBeforeMaxDate = !maxDate || date <= maxDateParsed;
  return isAfterMinDate && isBeforeMaxDate;
}

export function canSelectTime(date, minDate, maxDate, selectedDay, timeUnit) {
  if (!date) return false;
  // Parse minDate and maxDate if they are strings
  const minDateParsed = minDate ? new Date(minDate) : null;
  const maxDateParsed = maxDate ? new Date(maxDate) : null;

  const selectedHours = date.getHours();
  const selectedMinutes = date.getMinutes();

  if (timeUnit === 'hour') {
    // Only allow hours equal to or after minDate's hour
    if (minDateParsed && selectedDay === minDateParsed.getDate()) {
      return selectedHours >= minDateParsed.getHours();
    }
    // Only allow hours equal to or before maxDate's hour
    if (maxDateParsed && selectedDay === maxDateParsed.getDate()) {
      return selectedHours <= maxDateParsed.getHours();
    }
    // Enable all hours for other cases
    return true;
  }

  if (timeUnit === 'minute') {
    // Only allow minutes equal to or after minDate's minute
    if (minDateParsed && selectedDay === minDateParsed.getDate()) {
      return selectedMinutes >= minDateParsed.getMinutes();
    }
    // Only allow minutes equal to or before maxDate's minute
    if (maxDateParsed && selectedDay === maxDateParsed.getDate()) {
      return selectedMinutes <= maxDateParsed.getMinutes();
    }
    // Enable all minutes for other cases
    return true;
  }

  return true;
}

export function isSameMonth(date, comparisonDate) {
  return date.getMonth() === comparisonDate.getMonth();
}

export function getSurroundingHours(arr, centerValue, visibleRange) {
  if (!arr.length) return [];

  // Find the index of the center value in the array (wrapped correctly for filtered array)
  const normalizedIndex = Math.min(centerValue, arr.length - 1);

  // Get the start and end of the surrounding range
  const start = (normalizedIndex - visibleRange + arr.length) % arr.length;
  const end = (normalizedIndex + visibleRange + 1) % arr.length;

  // Return the visible surrounding range of items
  if (start < end) {
    return arr.slice(start, end);
  }
  return [...arr.slice(start), ...arr.slice(0, end)];
}

export function getSurroundingMinutes(arr, selectedId, visibleRange) {
  if (!arr.length) return [];

  // Find the item in the array by the selected ID
  const selectedItem = arr.find((item) => item.id === selectedId);
  if (!selectedItem) return [];

  // Find the index of the selected item in the extended array
  const selectedIndex = arr.findIndex((item) => item.id === selectedId);

  // Calculate the start and end indexes for surrounding items
  const start = (selectedIndex - visibleRange + arr.length) % arr.length;
  const end = (selectedIndex + visibleRange + 1) % arr.length;

  // Return the visible surrounding range of items
  if (start < end) {
    return arr.slice(start, end);
  }
  return [...arr.slice(start), ...arr.slice(0, end)];
}

// Helper to determine if an item is the center and should be active
export const isCenterActive = (index, isMobileScreen, mode) => {
  if (isMobileScreen && mode === 'date-time') return index === 4; // Since we always render 9 elements in mobile screen, the 5th one is the center
  return index === 3; // Since we always render 7 elements in other screens, the 4th one is the center
};

export function checkForSpecialDate(dayToCheck, datesArr) {
  return datesArr?.some((date) => date === formatDateJSON(dayToCheck));
}

// Function to checks if a day has any special dates
export const hasSpecialDates = (day, specialDatesArr) =>
  specialDatesArr?.some((attr) => checkForSpecialDate(day, attr.dates));

export function getDaysInMonthGrid(date, firstDayOfWeek) {
  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);

  // Calculate the start and end of the calendar grid
  // @ts-ignore
  const startCalendar = startOfWeek(startMonth, { weekStartsOn: firstDayOfWeek - 1 });
  // @ts-ignore
  const endCalendar = endOfWeek(endMonth, { weekStartsOn: firstDayOfWeek - 1 });

  // Generate all days to display in the calendar grid
  const days = eachDayOfInterval({
    start: startCalendar,
    end: endCalendar,
  });

  // Group days by weeks
  const weeks = [];
  let currentWeek = [];

  days.forEach((day, index) => {
    currentWeek.push(day);

    // Start a new week when we reach the end of a week
    if ((index + 1) % 7 === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Push the last week if it has remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export function getGrid(type, rowLgth, startYr, endYr, localListArr) {
  const items = [];

  if (type === 'months') {
    items.push(...localListArr);
  }

  if (type === 'years') {
    for (let year = startYr; year <= endYr; year += 1) {
      items.push(year);
    }
  }

  if (type === 'quarters') {
    for (let year = startYr; year <= endYr; year += 1) {
      items.push({
        year,
        items: ['1', '2', '3', '4'],
      });
    }

    return items;
  }

  const rows = [];
  let currentRow = [];

  items.forEach((item, idx) => {
    currentRow.push(item);

    // Start a new row when we reach the end of a row (3 for months and years or 7 for days items per row)
    if ((idx + 1) % rowLgth === 0) {
      rows.push(currentRow);
      currentRow = [];
    }
  });

  // Push the last row if it has remaining items
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

// Function to get months layout array for different cases ([Array(2),[Array(2)], [Array(1),[Array(1)], [Array(2)])
export function getMonths(currentDate, variant, mode) {
  const months = [];
  let monthsToShow = 0;
  let elemInRow = 1;

  // Determine the number of months to show and elements per row based on variant and mode
  if (variant === 'full' && mode === 'date') {
    monthsToShow = 3; // Show the current month and the next 3 months
    elemInRow = 2; // 2 items per row
  }
  if (variant === 'full-rows' && mode === 'date') {
    monthsToShow = 1; // Show the current month and the next 3 months
    elemInRow = 1; // 1 item per row
  }
  if (variant === 'full-columns' && mode === 'date') {
    monthsToShow = 1; // Show the current month and the next 3 months
    elemInRow = 2; // 2 items per row
  }

  // Calculate the current month and the next 3 months
  for (let i = 0; i <= monthsToShow; i += 1) {
    const month = addMonths(currentDate, i); // Add months to the current date
    months.push(month);
  }

  const rows = [];
  let currentRow = [];

  // Arrange months into rows based on elemInRow value
  months.forEach((item, idx) => {
    currentRow.push(item);

    // Push the row when the row is full
    if ((idx + 1) % elemInRow === 0) {
      rows.push(currentRow);
      currentRow = [];
    }
  });

  // Push any remaining months into the last row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

export function isQuarterValid(quarterObject, minDateRef, maxDateRef) {
  // Extract the year and quarter number from the quarter object
  const { year, quarter } = quarterObject;

  // Calculate the start and end month for the given quarter
  const quarterStartMonth = (Number(quarter) - 1) * 3; // 0 for Q1, 3 for Q2, etc.
  const quarterEndMonth = quarterStartMonth + 2;

  // Create start and end dates for the quarter
  const quarterStartDate = new Date(year, quarterStartMonth, 1);
  const quarterEndDate = new Date(year, quarterEndMonth + 1, 0); // Last day of the quarter

  // Convert minDateRef and maxDateRef to Date objects
  const minDate = minDateRef ? new Date(minDateRef) : null;
  const maxDate = maxDateRef ? new Date(maxDateRef) : null;

  // Check if the quarter is within the min and max date range
  const isValid =
    (!minDate || quarterEndDate >= minDate) && (!maxDate || quarterStartDate <= maxDate);

  return isValid;
}

export function formatInputRawDate(mask, newValue) {
  if (!newValue) return null;
  const { dateFormat } = useLx().getGlobals();
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  let res = mask || dateFormatToUse;
  const year = newValue?.getFullYear();
  let month = newValue?.getMonth();
  if (month || month === 0) month += 1;
  const day = newValue?.getDate();
  res = res.replace('yyyy', year).replace('MM', zeroPad(month)).replace('dd', zeroPad(day));
  return res;
}

export function formatInputRawDateTime(mask, newValue) {
  if (!newValue) return null;
  const { dateTimeFormat } = useLx().getGlobals();
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';
  let res = mask || dateTimeFormatToUse;
  const year = newValue?.getFullYear();
  let month = newValue?.getMonth();
  if (month || month === 0) month += 1;
  const day = newValue?.getDate();
  const hours = newValue?.getHours();
  const minutes = newValue?.getMinutes();
  res = res
    .replace('yyyy', year)
    .replace('MM', zeroPad(month))
    .replace('dd', zeroPad(day))
    .replace('HH', zeroPad(hours))
    .replace('mm', zeroPad(minutes));
  return res;
}

export function formatInputRawTime(mask, newValue) {
  if (!newValue) return null;
  const timeFormatToUse = 'HH:mm';
  let res = mask || timeFormatToUse;
  const hours = newValue?.getHours();
  const minutes = newValue?.getMinutes();
  res = res.replace('HH', zeroPad(hours)).replace('mm', zeroPad(minutes));
  return res;
}

// The formatDate function remains unchanged
function formatDate(value, mask) {
  const cleanValue = value.replace(/[^\d]/g, ''); // Strip all non-numeric characters
  const maskParts = mask.split(/[^a-zA-Z]/); // Extract parts like "dd", "MM", "yyyy", "HH", "mm"
  const delimiters = mask.match(/[^a-zA-Z]/g) || []; // Extract delimiters like dots, colons, spaces

  let formattedValue = '';
  let valueIndex = 0;

  // Loop through each mask part and insert corresponding value and delimiter
  for (let i = 0; i < maskParts.length; i += 1) {
    const part = maskParts[i];

    if (cleanValue.length >= valueIndex + part.length) {
      formattedValue += cleanValue.slice(valueIndex, valueIndex + part.length);
      valueIndex += part.length;
    } else {
      formattedValue += cleanValue.slice(valueIndex);
      break;
    }

    // Append delimiter if available and not at the end
    if (delimiters[i] && valueIndex < cleanValue.length) {
      formattedValue += delimiters[i];
    } else if (delimiters[i] && valueIndex === cleanValue.length) {
      formattedValue += delimiters[i]; // Automatically add final delimiter if at the end
    }
  }

  return formattedValue;
}

const applyMaskLogic = (el, mask) => {
  const applyMask = (event) => {
    const { value } = event.target;

    const formattedValue = formatDate(value, mask);

    if (formattedValue !== value) {
      // eslint-disable-next-line no-param-reassign
      event.target.value = formattedValue;

      const cursorPosition = event.target.value.length;
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  };

  const handleBackspace = (event) => {
    if (event.key === 'Backspace') {
      const { value } = event.target;
      const cursorPosition = event.target.selectionStart;

      const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
      // eslint-disable-next-line no-param-reassign
      event.target.value = formatDate(newValue, mask);

      const newCursorPosition = cursorPosition - 1;
      event.target.setSelectionRange(newCursorPosition, newCursorPosition);
      event.preventDefault(); // Prevent default backspace behavior
    }
  };

  el.addEventListener('input', applyMask);
  el.addEventListener('keydown', handleBackspace);
};

export const vDateMask = {
  mounted(el, binding) {
    const mask = binding.value;
    applyMaskLogic(el, mask);
  },

  updated(el, binding) {
    const mask = binding.value;
    applyMaskLogic(el, mask);
  },
};

export function extractMonthFromDate(dateObj) {
  if (!dateObj) return null;
  return format(dateObj, 'MM');
}

export function extractYearFromDate(dateObj) {
  if (!dateObj) return null;
  return format(dateObj, 'yyyy');
}

export function extractYearMonthFromDate(dateObj, mask) {
  if (!dateObj) return null;
  const maskToUse = mask || 'yyyy-MM';
  return format(dateObj, maskToUse);
}

export function extractQuarterFromDate(dateObj, mask) {
  if (!dateObj) return null;
  const maskToUse = mask || 'yyyy-QQQ';
  return format(dateObj, maskToUse);
}

export function dateFromYearAndQuarter(year, quarter) {
  // Map quarter to the corresponding starting month
  const quarterStartMonth = {
    1: 0, // Q1 starts in January (0-indexed)
    2: 3, // Q2 starts in April
    3: 6, // Q3 starts in July
    4: 9, // Q4 starts in October
  };
  // Construct a new Date object using the year and the starting month of the quarter
  return new Date(year, quarterStartMonth[quarter], 1); // Day is set to 1st of the quarter's starting month
}

export function getQuarterStringFromDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: January is 0, December is 11
  // Determine the quarter based on the month
  const quarter = Math.floor(month / 3) + 1;
  return `${year}-Q${quarter}`;
}
