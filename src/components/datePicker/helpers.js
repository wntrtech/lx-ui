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
  isMatch,
  addDays,
} from 'date-fns';
import useLx from '@/hooks/useLx';

export const zeroPad = (value) => {
  if (value === null) return null;
  return Number(value) > 9 ? value : `0${Number(value)}`;
};

export function getTimeOrderIndex(arr, value, cadence = 1) {
  // Round value to the nearest multiple of the cadence
  const roundedValue = Math.round(value / cadence) * cadence;
  // Find the index of the closest item in the array based on the rounded value
  const index = arr.findIndex((itm) => itm.orderIndex === roundedValue);
  // If no match found, return zero as fallback index
  if (index === -1) return 0;
  // Return the index of the found item in the array
  return index;
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

  if (mode === 'time') {
    const selectedHours = date.getHours();
    const selectedMinutes = date.getMinutes();

    const isAfterMinHours = !minDateParsed || selectedHours >= minDateParsed.getHours();
    const isBeforeMaxHours = !maxDateParsed || selectedHours <= maxDateParsed.getHours();

    const isAfterMinMinutes = !minDateParsed || selectedMinutes >= minDateParsed.getMinutes();
    const isBeforeMaxMinutes = !maxDateParsed || selectedMinutes <= maxDateParsed.getMinutes();

    return isAfterMinHours && isBeforeMaxHours && isAfterMinMinutes && isBeforeMaxMinutes;
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

export function canSelectTime(
  hourOrMinuteValue,
  minDate,
  maxDate,
  selectedDay,
  timeUnit,
  selectedHours,
  selectedMinutes,
  timeOnly
) {
  if (hourOrMinuteValue === null && hourOrMinuteValue === undefined) return false;

  // Parse minDate and maxDate if they are strings
  const minDateParsed = minDate ? new Date(minDate) : null;
  const maxDateParsed = maxDate ? new Date(maxDate) : null;

  // If timeOnly is true, we ignore date validation and only focus on time validation
  if (timeOnly) {
    if (timeUnit === 'hour') {
      if (minDateParsed && Number(hourOrMinuteValue) < minDateParsed.getHours()) return false;
      if (maxDateParsed && Number(hourOrMinuteValue) > maxDateParsed.getHours()) return false;
      return true;
    }

    if (timeUnit === 'minute') {
      if (minDateParsed && Number(hourOrMinuteValue) < minDateParsed.getMinutes()) return false;
      if (maxDateParsed && Number(hourOrMinuteValue) > maxDateParsed.getMinutes()) return false;
      return true;
    }

    return true; // Allow any time if timeUnit isn't specified
  }

  // Regular date and time validation if timeOnly is false
  // Validate hours
  if (timeUnit === 'hour') {
    // When the minute is already selected, validate hour with minute
    if (selectedMinutes !== null) {
      // If selecting on minDate day
      if (
        minDateParsed &&
        maxDateParsed &&
        selectedDay === minDateParsed.getDate() &&
        selectedDay !== maxDateParsed.getDate()
      ) {
        // If the selected minute is earlier than minDate minute, only allow hours after minDate's hour
        if (selectedMinutes < minDateParsed.getMinutes()) {
          return hourOrMinuteValue > minDateParsed.getHours();
        }
      }
      // If selecting on maxDate day
      if (
        minDateParsed &&
        maxDateParsed &&
        selectedDay !== minDateParsed.getDate() &&
        selectedDay === maxDateParsed.getDate()
      ) {
        // If the selected minute is later than maxDate minute, only allow hours before maxDate's hour
        if (selectedMinutes > maxDateParsed.getMinutes()) {
          return hourOrMinuteValue < maxDateParsed.getHours();
        }
      }
      // If selecting on minDate and maxDate day
      if (
        minDateParsed &&
        maxDateParsed &&
        selectedDay === minDateParsed.getDate() &&
        selectedDay === maxDateParsed.getDate()
      ) {
        // If the selected minute is the same as minDate minute, validate hours before maxDate hours and after minDate hours
        if (selectedMinutes === minDateParsed.getMinutes()) {
          return (
            hourOrMinuteValue >= minDateParsed.getHours() &&
            hourOrMinuteValue <= maxDateParsed.getHours()
          );
        }
        // If the selected minute is the same as maxDate minute, validate hours before maxDate hours and after minDate hours
        if (selectedMinutes === maxDateParsed.getMinutes()) {
          return (
            hourOrMinuteValue >= minDateParsed.getHours() &&
            hourOrMinuteValue <= maxDateParsed.getHours()
          );
        }
        if (
          selectedMinutes >= minDateParsed.getMinutes() &&
          selectedMinutes <= maxDateParsed.getMinutes()
        ) {
          return (
            hourOrMinuteValue >= minDateParsed.getHours() &&
            hourOrMinuteValue <= maxDateParsed.getHours()
          );
        }
        return false;
      }
    }

    // Check if it's the same day as minDate
    if (minDateParsed && selectedDay === minDateParsed.getDate()) {
      if (hourOrMinuteValue < minDateParsed.getHours()) return false; // Must be after minDate's hour
    }
    // Check if it's the same day as maxDate
    if (maxDateParsed && selectedDay === maxDateParsed.getDate()) {
      if (hourOrMinuteValue > maxDateParsed.getHours()) return false; // Must be before maxDate's hour
    }
    return true; // Allow all hours otherwise
  }

  // Validate minutes
  if (timeUnit === 'minute') {
    // When the hour is already selected, validate minute with hour
    if (selectedHours !== null) {
      // If selecting on minDate day
      if (
        minDateParsed &&
        maxDateParsed &&
        selectedDay === minDateParsed.getDate() &&
        selectedDay !== maxDateParsed.getDate()
      ) {
        // If the selected hour is the same as minDate hour, validate minutes after minDate minutes
        if (selectedHours === minDateParsed.getHours()) {
          return hourOrMinuteValue >= minDateParsed.getMinutes();
        }
        if (selectedHours > minDateParsed.getHours()) {
          return true;
        }
      }
      // If selecting on maxDate day
      if (
        minDateParsed &&
        maxDateParsed &&
        selectedDay !== minDateParsed.getDate() &&
        selectedDay === maxDateParsed.getDate()
      ) {
        // If the selected hour is the same as maxDate hour, validate minutes before maxDate minutes
        if (selectedHours === maxDateParsed.getHours()) {
          return hourOrMinuteValue <= maxDateParsed.getMinutes();
        }
      }
      // If selecting on minDate and maxDate day
      if (
        minDateParsed &&
        maxDateParsed &&
        selectedDay === minDateParsed.getDate() &&
        selectedDay === maxDateParsed.getDate()
      ) {
        // If the selected hour is the same as minDate hour, validate minutes before maxDate minutes and after minDate minutes
        if (selectedHours === minDateParsed.getHours()) {
          return (
            hourOrMinuteValue >= minDateParsed.getMinutes() &&
            hourOrMinuteValue <= maxDateParsed.getMinutes()
          );
        }
        // If the selected hour is the same as maxDate hour, validate minutes before maxDate minutes and after minDate minutes
        if (selectedHours === maxDateParsed.getHours()) {
          return (
            hourOrMinuteValue >= minDateParsed.getMinutes() &&
            hourOrMinuteValue <= maxDateParsed.getMinutes()
          );
        }
        if (
          selectedHours >= minDateParsed.getHours() &&
          selectedHours <= maxDateParsed.getHours()
        ) {
          return (
            hourOrMinuteValue >= minDateParsed.getMinutes() &&
            hourOrMinuteValue <= maxDateParsed.getMinutes()
          );
        }
        return false;
      }
    }
    return true; // Allow all minutes otherwise
  }

  return true; // Allow everything if no unit is specified
}

export function isSameMonth(date, comparisonDate) {
  return date.getMonth() === comparisonDate.getMonth();
}

export function getSurroundingHours(arr, centerValue, isMobileScreen) {
  if (!arr.length) return [];

  // Ensure the center value index is within array bounds
  const centerIndex = Math.min(centerValue, arr.length - 1);

  // Number of items before the center to reach desired position (4th position)
  const offset = isMobileScreen ? 7 : 6;

  // Calculate the starting index to bring the center to the 4th position
  const startIndex = (centerIndex - offset + arr.length) % arr.length;

  // Reorder the array so it starts from startIndex and wraps around
  return [...arr.slice(startIndex), ...arr.slice(0, startIndex)];
}

export function getSurroundingMinutes(arr, selectedId, isMobileScreen) {
  if (!arr.length) return [];

  // Find the index of the selected item
  const selectedIndex = arr.findIndex((item) => item.id === selectedId);
  if (selectedIndex === -1) return []; // Return empty if the selected item is not found

  // Number of items before the center to reach desired position (4th position)
  const offset = isMobileScreen ? 7 : 6;

  // Calculate the starting index to bring the selected item to the 4th position
  const startIndex = (selectedIndex - offset + arr.length) % arr.length;

  // Return all items in order, starting from the calculated startIndex and wrapping around
  return [
    ...arr.slice(startIndex), // From calculated startIndex to the end
    ...arr.slice(0, startIndex), // Wrap around from start to calculated startIndex
  ];
}

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

  // If there are fewer than 6 weeks, fill remaining rows with days from the next month
  const lastDay = endCalendar;
  while (weeks.length < 6) {
    const nextWeek = [];
    for (let i = 0; i < 7; i += 1) {
      nextWeek.push(addDays(lastDay, i + 1));
    }
    weeks.push(nextWeek);
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
export function getMonths(currentDate, variant, mode, pickerType, isMobileScreen) {
  const months = [];
  let monthsToShow = 0;

  // Determine the number of months to show and elements per row based on variant and mode
  if (variant === 'full' && mode === 'date' && pickerType === 'single') {
    monthsToShow = 3; // Show the current month and the next 3 months
  }
  if (variant === 'full-rows' && mode === 'date' && pickerType === 'single') {
    monthsToShow = 1; // Show the current month and the next month
  }
  if (
    (variant === 'full-columns' && mode === 'date' && pickerType === 'single') ||
    (pickerType === 'range' && !isMobileScreen)
  ) {
    monthsToShow = 1; // Show the current month and the next month
  }

  // Generate the list of months based on the calculated monthsToShow
  for (let i = 0; i <= monthsToShow; i += 1) {
    const month = addMonths(currentDate, i); // Add months to the current date
    months.push(month);
  }

  const rows = [[], []];

  // Special logic for 'full-columns' variant: add two months to the first row
  if (
    (variant === 'full-columns' && mode === 'date' && pickerType === 'single') ||
    (pickerType === 'range' && !isMobileScreen)
  ) {
    rows[0].push(months[0], months[1]); // First two months go to the first row
    // Remaining months in alternating rows
    months.slice(2).forEach((month, index) => {
      if (index % 2 === 0) {
        rows[1].push(month); // Alternate remaining months to row 1
      } else {
        rows[0].push(month); // Alternate remaining months to row 0
      }
    });
  } else {
    // Default alternating pattern for other variants
    months.forEach((month, index) => {
      if (index % 2 === 0) {
        rows[0].push(month);
      } else {
        rows[1].push(month);
      }
    });
  }

  // Remove empty rows if any
  return rows.filter((row) => row.length > 0);
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

export const getDayTabIndex = (
  date,
  month,
  weekIndex,
  firstDayOfTheWeek,
  monthsList,
  variant,
  pickerType,
  minDateRef,
  maxDateRef
) => {
  // Case 1: Date from another month, first week of the first month
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 0 &&
    weekIndex === 0 &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }
  // Case 2: Date from another month, last week of the last month for default and picker variants
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().length === 1 &&
    (variant === 'default' || variant === 'picker') &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 1 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }
  // Case 3: Date from another month, last week of the last month for full variant
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 3 &&
    variant === 'full' &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 1 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }
  // Case 4: Date from another month, last week of the last month for full-rows, full-columns variants or range pickerType
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 1 &&
    (variant === 'full-rows' || variant === 'full-columns' || pickerType === 'range') &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 1 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }
  // Case 7: Date in the same month and is selectable
  if (isSameMonth(date, month) && canSelectDate(date, minDateRef, maxDateRef)) {
    return '0';
  }
  // Default case: Not focusable
  return '-1';
};

// Removes last character thats is not number or letter
export const removeLastNonAlphanumeric = (input) => input.replace(/[^a-zA-Z0-9]$/, '');

// Validate the date based on the mask
export const validateDateByMask = (date, mask) => isMatch(date, mask);

// Function to sanitize the input based on mode (date, date-time, or time)
export const sanitizeDateInput = (e, mode) => {
  let allowedChars;
  const input = e.target.value;

  // Set allowed characters based on the mode
  if (mode === 'date') {
    allowedChars = /[^0-9.,/-]/g; // number, dot, comma, slash, dash
  } else if (mode === 'date-time') {
    allowedChars = /[^0-9.,/\- :]/g; // number, dot, comma, slash, dash, space, colon
  } else if (mode === 'time') {
    allowedChars = /[^0-9:]/g; // only number and colon
  }

  // Remove any disallowed characters
  e.target.value = input.replace(allowedChars, '');
};
