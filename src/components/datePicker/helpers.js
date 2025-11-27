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
import { DATE_VALIDATION_RESULT } from '@/constants';
import { isDefined, isNil } from '@/utils/generalUtils';

export const normalizeDate = (d, mode = 'date') => {
  if (!d) return null;

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  switch (mode) {
    case 'date-time-full':
      return new Date(year, month, day, hours, minutes, seconds, 0);
    case 'date-time':
      return new Date(year, month, day, hours, minutes, 0, 0);
    case 'date':
    default:
      return new Date(year, month, day, 0, 0, 0, 0);
  }
};

export const zeroPad = (value) => {
  if (isNil(value)) return null;
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

/**
 * Checks whether a date (mode = 'date') is within the allowed range and returns an enum describing the result.
 * @returns {import('@/constants').DATE_VALIDATION_RESULT } Validation result
 */
export function validateDateRange(date, minDate, maxDate) {
  if (!date) return DATE_VALIDATION_RESULT.NO_VALUE;

  // Parse minDate and maxDate if they are strings
  const minDateParsed = minDate ? new Date(minDate) : null;
  const maxDateParsed = maxDate ? new Date(maxDate) : null;

  const normalizedDate = normalizeDate(new Date(date));
  const normalizedMinDate = minDateParsed ? normalizeDate(minDateParsed) : null;
  const normalizedMaxDate = maxDateParsed ? normalizeDate(maxDateParsed) : null;

  const isAfterMinDate = !normalizedMinDate || normalizedDate >= normalizedMinDate;
  const isBeforeMaxDate = !normalizedMaxDate || normalizedDate <= normalizedMaxDate;

  if (!isAfterMinDate) {
    return DATE_VALIDATION_RESULT.OUT_OF_RANGE_MIN;
  }
  if (!isBeforeMaxDate) {
    return DATE_VALIDATION_RESULT.OUT_OF_RANGE_MAX;
  }

  return DATE_VALIDATION_RESULT.VALID;
}

export function canSelectDate(date, minDate, maxDate, mode = 'date') {
  if (!date) return false;

  // Parse minDate and maxDate if they are strings
  const minDateParsed = minDate ? new Date(minDate) : null;
  const maxDateParsed = maxDate ? new Date(maxDate) : null;

  if (mode === 'date') {
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

    const minHour = minDateParsed?.getHours();
    const minMinute = minDateParsed?.getMinutes();
    const maxHour = maxDateParsed?.getHours();
    const maxMinute = maxDateParsed?.getMinutes();

    const isAfterMinHours = !minDateParsed || selectedHours > minHour;
    const isBeforeMaxHours = !maxDateParsed || selectedHours < maxHour;

    // If hour is strictly between min and max, allow all minutes
    if (isAfterMinHours && isBeforeMaxHours) return true;

    // If on min hour, minutes must be >= minMinute
    if (minDateParsed && selectedHours === minHour && selectedMinutes < minMinute) {
      return false;
    }

    // If on max hour, minutes must be <= maxMinute
    if (maxDateParsed && selectedHours === maxHour && selectedMinutes > maxMinute) {
      return false;
    }

    // If selected hour is before min hour
    if (selectedHours < minHour) {
      return false;
    }

    // If selected hour is after max hour
    if (selectedHours > maxHour) {
      return false;
    }

    // Otherwise, allow all
    return true;
  }

  if (mode === 'time-full') {
    const selectedHours = date.getHours();
    const selectedMinutes = date.getMinutes();
    const selectedSeconds = date.getSeconds();

    const minHour = minDateParsed?.getHours();
    const minMinute = minDateParsed?.getMinutes();
    const minSecond = minDateParsed?.getSeconds();

    const maxHour = maxDateParsed?.getHours();
    const maxMinute = maxDateParsed?.getMinutes();
    const maxSecond = maxDateParsed?.getSeconds();

    // Check against minDate
    if (minDateParsed) {
      if (selectedHours < minHour) return false;
      if (selectedHours === minHour) {
        if (selectedMinutes < minMinute) return false;
        if (selectedMinutes === minMinute && selectedSeconds < minSecond) return false;
      }
    }

    // Check against maxDate
    if (maxDateParsed) {
      if (selectedHours > maxHour) return false;
      if (selectedHours === maxHour) {
        if (selectedMinutes > maxMinute) return false;
        if (selectedMinutes === maxMinute && selectedSeconds > maxSecond) return false;
      }
    }

    return true;
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

  // For other modes, compare full date and time
  const isAfterMinDate =
    !minDate || normalizeDate(date, mode) >= normalizeDate(minDateParsed, mode);
  const isBeforeMaxDate =
    !maxDate || normalizeDate(date, mode) <= normalizeDate(maxDateParsed, mode);

  return isAfterMinDate && isBeforeMaxDate;
}

export const isSameDay = (d1, d2) =>
  d1?.getDate() === d2?.getDate() &&
  d1?.getMonth() === d2?.getMonth() &&
  d1?.getFullYear() === d2?.getFullYear();

export const isSameMonth = (d1, d2) => d1?.getMonth() === d2?.getMonth();

export const isSameYear = (d1, d2) => d1?.getFullYear() === d2?.getFullYear();

export function canSelectTime(
  hourMinuteOrSecondValue,
  minDate,
  maxDate,
  selectedDay,
  selectedMonth,
  selectedYear,
  timeUnit,
  selectedHours,
  selectedMinutes,
  selectedSeconds,
  timeOnly
) {
  if (isNil(hourMinuteOrSecondValue)) return false;

  // Parse minDate and maxDate if they are strings
  const minDateParsed = minDate ? new Date(minDate) : null;
  const maxDateParsed = maxDate ? new Date(maxDate) : null;

  // If timeOnly is true, we ignore date validation and only focus on time validation
  if (timeOnly) {
    if (timeUnit === 'hour') {
      const hour = Number(hourMinuteOrSecondValue);

      const minHour = minDateParsed?.getHours();
      const minMinute = minDateParsed?.getMinutes();
      const minSecond = minDateParsed?.getSeconds();
      const maxHour = maxDateParsed?.getHours();
      const maxMinute = maxDateParsed?.getMinutes();
      const maxSecond = maxDateParsed?.getSeconds();

      // If no minutes selected (or no seconds when seconds are needed), validate hour normally
      if (isNil(selectedMinutes) && isNil(selectedSeconds)) {
        if (minDateParsed && hour < minHour) return false;
        if (maxDateParsed && hour > maxHour) return false;
        return true;
      }

      // minutes selected but no seconds
      if (!isNil(selectedMinutes) && isNil(selectedSeconds)) {
        if (
          minDateParsed &&
          (hour < minHour || (hour === minHour && selectedMinutes < minMinute))
        ) {
          return false;
        }
        if (
          maxDateParsed &&
          (hour > maxHour || (hour === maxHour && selectedMinutes > maxMinute))
        ) {
          return false;
        }
        return true;
      }

      // both minutes and seconds selected
      if (!isNil(selectedMinutes) && !isNil(selectedSeconds)) {
        if (
          minDateParsed &&
          (hour < minHour ||
            (hour === minHour && selectedMinutes < minMinute) ||
            (hour === minHour && selectedMinutes === minMinute && selectedSeconds < minSecond))
        ) {
          return false;
        }

        if (
          maxDateParsed &&
          (hour > maxHour ||
            (hour === maxHour && selectedMinutes > maxMinute) ||
            (hour === maxHour && selectedMinutes === maxMinute && selectedSeconds > maxSecond))
        ) {
          return false;
        }
        return true;
      }

      // only seconds selected (no minutes)
      // keep hours within min/max hour boundaries (don’t unlock everything)
      if (isNil(selectedMinutes) && !isNil(selectedSeconds)) {
        if (minDateParsed && hour < minHour) return false;
        if (maxDateParsed && hour > maxHour) return false;
        return true;
      }

      return true;
    }

    if (timeUnit === 'minute') {
      const minute = Number(hourMinuteOrSecondValue);

      const minHour = minDateParsed?.getHours();
      const minMinute = minDateParsed?.getMinutes();
      const minSecond = minDateParsed?.getSeconds();

      const maxHour = maxDateParsed?.getHours();
      const maxMinute = maxDateParsed?.getMinutes();
      const maxSecond = maxDateParsed?.getSeconds();

      if (isNil(selectedSeconds)) {
        // If no hour selected — allow all minutes
        if (isNil(selectedHours)) return true;

        if (
          minDateParsed &&
          (selectedHours < minHour || (selectedHours === minHour && minute < minMinute))
        ) {
          return false;
        }

        if (
          maxDateParsed &&
          (selectedHours > maxHour || (selectedHours === maxHour && minute > maxMinute))
        ) {
          return false;
        }

        return true;
      }

      if (!isNil(selectedSeconds)) {
        // If no hour selected — allow all minutes
        if (isNil(selectedHours)) return true;

        // Below minDate
        if (
          minDateParsed &&
          (selectedHours < minHour ||
            (selectedHours === minHour && minute < minMinute) ||
            (selectedHours === minHour && minute === minMinute && selectedSeconds < minSecond))
        ) {
          return false;
        }

        // Above maxDate
        if (
          maxDateParsed &&
          (selectedHours > maxHour ||
            (selectedHours === maxHour && minute > maxMinute) ||
            (selectedHours === maxHour && minute === maxMinute && selectedSeconds > maxSecond))
        ) {
          return false;
        }

        return true;
      }

      return true;
    }

    if (timeUnit === 'second') {
      // If no hours or minutes selected yet, validate seconds normally
      if (isNil(selectedHours) || isNil(selectedMinutes)) {
        return true;
      }

      const second = Number(hourMinuteOrSecondValue);

      const minHour = minDateParsed?.getHours();
      const minMinute = minDateParsed?.getMinutes();
      const minSecond = minDateParsed?.getSeconds();

      const maxHour = maxDateParsed?.getHours();
      const maxMinute = maxDateParsed?.getMinutes();
      const maxSecond = maxDateParsed?.getSeconds();

      const isAfterMinHours = !minDateParsed || selectedHours > minHour;
      const isBeforeMaxHours = !maxDateParsed || selectedHours < maxHour;

      if (isAfterMinHours && isBeforeMaxHours) return true;

      if (
        minDateParsed &&
        selectedHours === minHour &&
        selectedMinutes === minMinute &&
        second < minSecond
      ) {
        return false;
      }

      if (
        maxDateParsed &&
        selectedHours === maxHour &&
        selectedMinutes === maxMinute &&
        second > maxSecond
      ) {
        return false;
      }

      if (selectedHours < minHour) {
        return false;
      }

      if (selectedHours > maxHour) {
        return false;
      }

      return true;
    }

    // Allow any time if timeUnit isn't specified
    return true;
  }

  // Regular date and time validation if timeOnly is false
  // Validate hours
  if (timeUnit === 'hour') {
    const hasMinute = selectedMinutes !== null && selectedMinutes !== undefined;
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const isMinDay = minDateParsed && selectedDate.toDateString() === minDateParsed.toDateString();
    const isMaxDay = maxDateParsed && selectedDate.toDateString() === maxDateParsed.toDateString();

    // Validate when minute is selected
    if (hasMinute && minDateParsed && maxDateParsed) {
      const sameDay = isMinDay && isMaxDay;

      if (sameDay) {
        if (
          selectedMinutes === minDateParsed.getMinutes() ||
          selectedMinutes === maxDateParsed.getMinutes() ||
          (selectedMinutes > minDateParsed.getMinutes() &&
            selectedMinutes < maxDateParsed.getMinutes())
        ) {
          return (
            hourMinuteOrSecondValue >= minDateParsed.getHours() &&
            hourMinuteOrSecondValue <= maxDateParsed.getHours()
          );
        }
        return false;
      }

      if (isMinDay && !isMaxDay && selectedMinutes < minDateParsed.getMinutes()) {
        return hourMinuteOrSecondValue > minDateParsed.getHours();
      }

      if (!isMinDay && isMaxDay && selectedMinutes > maxDateParsed.getMinutes()) {
        return hourMinuteOrSecondValue < maxDateParsed.getHours();
      }
    }

    // If no minute selected, fall back to basic min/max hour bounds
    if (isMinDay && hourMinuteOrSecondValue < minDateParsed.getHours()) {
      return false;
    }

    if (isMaxDay && hourMinuteOrSecondValue > maxDateParsed.getHours()) {
      return false;
    }

    return true;
  }

  // Validate minutes
  if (timeUnit === 'minute') {
    if (selectedYear == null || selectedMonth == null || selectedDay == null) {
      return true;
    }

    const minute = Number(hourMinuteOrSecondValue);

    if (isNil(selectedHours)) return true;

    const current = new Date(
      selectedYear,
      selectedMonth,
      selectedDay,
      selectedHours,
      minute,
      isNil(selectedSeconds) ? 0 : selectedSeconds
    );

    if (minDateParsed && current < minDateParsed) return false;
    if (maxDateParsed && current > maxDateParsed) return false;

    return true;
  }

  // Validate seconds
  if (timeUnit === 'second') {
    const hasHour = isDefined(selectedHours);
    const hasMinute = isDefined(selectedMinutes);

    const isMinDay = isSameDay(new Date(selectedYear, selectedMonth, selectedDay), minDateParsed);
    const isMaxDay = isSameDay(new Date(selectedYear, selectedMonth, selectedDay), maxDateParsed);

    if (hasHour && hasMinute) {
      // If same day
      if (isMinDay && isMaxDay) {
        if (selectedHours > minDateParsed.getHours() && selectedHours < maxDateParsed.getHours()) {
          return true;
        }

        if (
          selectedHours === minDateParsed.getHours() &&
          selectedMinutes > minDateParsed.getMinutes() &&
          selectedHours < maxDateParsed.getHours()
        ) {
          return true;
        }

        if (
          selectedHours === maxDateParsed.getHours() &&
          selectedMinutes < maxDateParsed.getMinutes() &&
          selectedHours > minDateParsed.getHours()
        ) {
          return true;
        }

        // On min hour and min minute
        if (
          selectedHours === minDateParsed.getHours() &&
          selectedMinutes === minDateParsed.getMinutes()
        ) {
          return hourMinuteOrSecondValue >= minDateParsed.getSeconds();
        }

        // On max hour and max minute
        if (
          selectedHours === maxDateParsed.getHours() &&
          selectedMinutes === maxDateParsed.getMinutes()
        ) {
          return hourMinuteOrSecondValue <= maxDateParsed.getSeconds();
        }

        // Between min/max hour/minute
        return (
          selectedHours >= minDateParsed.getHours() &&
          selectedHours <= maxDateParsed.getHours() &&
          selectedMinutes >= minDateParsed.getMinutes() &&
          selectedMinutes <= maxDateParsed.getMinutes() &&
          hourMinuteOrSecondValue >= minDateParsed.getSeconds() &&
          hourMinuteOrSecondValue <= maxDateParsed.getSeconds()
        );
      }

      // Only minDate limit
      if (isMinDay) {
        if (
          selectedHours === minDateParsed.getHours() &&
          selectedMinutes === minDateParsed.getMinutes()
        ) {
          return hourMinuteOrSecondValue >= minDateParsed.getSeconds();
        }
        return (
          selectedHours > minDateParsed.getHours() ||
          (selectedHours === minDateParsed.getHours() &&
            selectedMinutes > minDateParsed.getMinutes())
        );
      }

      // Only maxDate limit
      if (isMaxDay) {
        if (
          selectedHours === maxDateParsed.getHours() &&
          selectedMinutes === maxDateParsed.getMinutes()
        ) {
          return hourMinuteOrSecondValue <= maxDateParsed.getSeconds();
        }
        return (
          selectedHours < maxDateParsed.getHours() ||
          (selectedHours === maxDateParsed.getHours() &&
            selectedMinutes < maxDateParsed.getMinutes())
        );
      }
    }

    // If no hour or minute selected, allow all seconds
    return true;
  }

  // Allow everything if no unit is specified
  return true;
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

export function getSurroundingMinutesOrSeconds(arr, selectedId, isMobileScreen) {
  if (!arr.length) return [];

  const resolvedId = selectedId || arr[0].id;

  // Find the index of the selected item
  const selectedIndex = arr.findIndex((item) => item.id === resolvedId);
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

function formatGrid(items, rowLength) {
  const rows = [];
  let currentRow = [];

  items.forEach((item, idx) => {
    currentRow.push(item);

    if ((idx + 1) % rowLength === 0) {
      rows.push(currentRow);
      currentRow = [];
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

export function getMonthGrid(pickerType, mode, currentYear, rowLgth, localListArr, isMobileScreen) {
  // Create arrays for the current and next years
  if (pickerType === 'range' && mode === 'month-year' && !isMobileScreen) {
    const currentYearMonths = localListArr.map((month, index) => ({
      ...month,
      year: currentYear,
      orderIndex: index,
    }));

    const nextYearMonths = localListArr.map((month, index) => ({
      ...month,
      year: currentYear + 1,
      orderIndex: index,
    }));

    return [formatGrid(currentYearMonths, rowLgth), formatGrid(nextYearMonths, rowLgth)];
  }

  // Create array for the current years
  const currentYearMonths = localListArr.map((month, index) => ({
    ...month,
    year: currentYear,
    orderIndex: index,
  }));

  return [formatGrid(currentYearMonths, rowLgth)];
}

export function getGrid(type, rowLgth, startYr, endYr) {
  const items = [];

  if (type === 'years') {
    for (let year = startYr; year <= endYr; year += 1) {
      items.push(year);
    }

    return formatGrid(items, rowLgth);
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

  return [];
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

export function formatInputRawDateTimeFull(mask, newValue) {
  if (!newValue) return null;
  const { dateTimeFullFormat } = useLx().getGlobals();
  const dateTimeFullFormatToUse = dateTimeFullFormat || 'dd.MM.yyyy. HH:mm:ss';
  let res = mask || dateTimeFullFormatToUse;
  const year = newValue?.getFullYear();
  let month = newValue?.getMonth();
  if (month || month === 0) month += 1;
  const day = newValue?.getDate();
  const hours = newValue?.getHours();
  const minutes = newValue?.getMinutes();
  const seconds = newValue?.getSeconds() || 0;
  res = res
    .replace('yyyy', year)
    .replace('MM', zeroPad(month))
    .replace('dd', zeroPad(day))
    .replace('HH', zeroPad(hours))
    .replace('mm', zeroPad(minutes))
    .replace('ss', zeroPad(seconds));
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

export function formatInputRawTimeFull(mask, newValue) {
  if (!newValue) return null;
  const timeFullFormatToUse = 'HH:mm:ss';
  let res = mask || timeFullFormatToUse;
  const hours = newValue?.getHours();
  const minutes = newValue?.getMinutes();
  const seconds = newValue?.getSeconds() || 0;
  res = res
    .replace('HH', zeroPad(hours))
    .replace('mm', zeroPad(minutes))
    .replace('ss', zeroPad(seconds));
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
    if (delimiters[i] && valueIndex <= cleanValue.length) {
      formattedValue += delimiters[i];
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

export function quarterFromMonth(month) {
  // Calculate the quarter from the 0-indexed month (0-11)
  return Math.floor(month / 3) + 1;
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

  // Case 3: Date from another month, penultimate week of the last month for default and picker variants
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().length === 1 &&
    (variant === 'default' || variant === 'picker') &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 2 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }

  // Case 4: Date from another month, last week of the last month for full variant
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 3 &&
    variant === 'full' &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 1 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }

  // Case 5: Date from another month, penultimate week of the last month for full variant
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 3 &&
    variant === 'full' &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 2 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }

  // Case 6: Date from another month, last week of the last month for full-rows, full-columns variants or range pickerType
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 1 &&
    (variant === 'full-rows' || variant === 'full-columns' || pickerType === 'range') &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 1 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }

  // Case 7: Date from another month, penultimate week of the last month for full-rows, full-columns variants or range pickerType
  if (
    !isSameMonth(date, month) &&
    monthsList.flat().indexOf(month) === 1 &&
    (variant === 'full-rows' || variant === 'full-columns' || pickerType === 'range') &&
    getDaysInMonthGrid(month, firstDayOfTheWeek).length - 2 === weekIndex &&
    canSelectDate(date, minDateRef, maxDateRef)
  ) {
    return '0';
  }

  // Case 8: Date in the same month and is selectable
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
  } else if (mode === 'date-time' || mode === 'date-time-full') {
    allowedChars = /[^0-9.,/\- :]/g; // number, dot, comma, slash, dash, space, colon
  } else if (mode === 'time' || mode === 'time-full') {
    allowedChars = /[^0-9.,:]/g; // only number and colon
  } else if (mode === 'year') {
    allowedChars = /[^0-9]/g; // only number
  }

  // Remove any disallowed characters
  e.target.value = input.replace(allowedChars, '');
};

// Helper function to get decade start year
export function findDecadeStartYear(year) {
  return year - (year % 10);
}

// Helper function to check if the year is start or end
export function isStartOrEndYear(year, startYear, endYear) {
  return year === startYear || year === endYear;
}

function ensureTwoDigits(n) {
  return n.toString().padStart(2, '0');
}

function isValidTime(h, m, s, supportSeconds) {
  if (h < 0 || h > 23) return false;
  if (m < 0 || m > 59) return false;
  if (supportSeconds && (s < 0 || s > 59)) return false;
  return true;
}

export function normalizeFlexibleTimeInput(raw, supportSeconds = false) {
  if (!raw) return null;

  const value = raw.replace(/[.,]/g, ':').replace(/\s+/g, '');

  const build = (h, m, s = 0) => {
    if (!isValidTime(h, m, s, supportSeconds)) return null;

    if (!supportSeconds) {
      return `${ensureTwoDigits(h)}:${ensureTwoDigits(m)}`;
    }

    return `${ensureTwoDigits(h)}:${ensureTwoDigits(m)}:${ensureTwoDigits(s)}`;
  };

  if (value.includes(':')) {
    const parts = value.split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1] ?? 0);
    const s = Number(parts[2] ?? 0);

    if ([h, m, s].some((v) => Number.isNaN(v))) return null;

    return build(h, m, s);
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length === 1) {
    const h = Number(digits);
    return build(h, 0, 0);
  }

  if (digits.length === 2) {
    const h = Number(digits);
    return build(h, 0, 0);
  }

  if (digits.length === 3) {
    const h = Number(digits.slice(0, 1));
    const m = Number(digits.slice(1));
    return build(h, m, 0);
  }

  if (digits.length === 4) {
    const h = Number(digits.slice(0, 2));
    const m = Number(digits.slice(2));
    return build(h, m, 0);
  }

  if (digits.length === 5) {
    if (!supportSeconds) return null;
    const h = Number(digits.slice(0, 1));
    const m = Number(digits.slice(1, 3));
    const s = Number(digits.slice(3));
    return build(h, m, s);
  }

  if (digits.length === 6) {
    if (!supportSeconds) return null;
    const h = Number(digits.slice(0, 2));
    const m = Number(digits.slice(2, 4));
    const s = Number(digits.slice(4));
    return build(h, m, s);
  }

  return null;
}

export function isStandardTimeMask(mask) {
  const h = mask.indexOf('HH');
  const m = mask.indexOf('mm');
  const s = mask.indexOf('ss');

  const baseValid = h !== -1 && m !== -1 && h < m;

  if (s !== -1) return baseValid && m < s;
  return baseValid;
}

function timeToSeconds(time) {
  if (!time) return null;

  let h;
  let m;
  let s;

  if (time instanceof Date) {
    h = time.getHours();
    m = time.getMinutes();
    s = time.getSeconds();
  } else if (typeof time === 'string') {
    const p = time.split(':');
    h = Number(p[0]) || 0;
    m = Number(p[1]) || 0;
    s = Number(p[2]) || 0;
  } else {
    return null;
  }

  return h * 3600 + m * 60 + s;
}

export function isTimeWithinMinMax(time, min, max) {
  const t = timeToSeconds(time);
  if (t === null) return false;

  const minS = timeToSeconds(min);
  const maxS = timeToSeconds(max);

  if (minS !== null && t < minS) return false;
  if (maxS !== null && t > maxS) return false;

  return true;
}
