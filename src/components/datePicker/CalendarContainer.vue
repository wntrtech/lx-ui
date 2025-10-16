<script setup>
import { ref, computed, watch } from 'vue';
import { subYears, addYears, subMonths, addMonths } from 'date-fns';
import { useWindowSize, onClickOutside } from '@vueuse/core';

import { formatLocalizedDate } from '@/utils/dateUtils';
import { capitalizeFirstLetter, generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import {
  getTimeOrderIndex,
  getMonthNameByOrder,
  canSelectDate,
  canSelectTime,
  isSameMonth,
  getSurroundingHours,
  getSurroundingMinutesOrSeconds,
  checkForSpecialDate,
  hasSpecialDates,
  getDaysInMonthGrid,
  getGrid,
  getMonthGrid,
  getMonths,
  isQuarterValid,
  zeroPad,
  dateFromYearAndQuarter,
  extractQuarterFromDate,
  getDayTabIndex,
  quarterFromMonth,
  findDecadeStartYear,
  isStartOrEndYear,
  isDefined,
  isNil,
} from '@/components/datePicker/helpers';

import LxButton from '@/components/Button.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [String, Date, Object], default: null },
  mode: { type: String, default: 'date' }, // 'date', 'time', 'time-full' 'date-time', 'date-time-full' 'month', 'year', 'month-year', 'quarters'
  variant: { type: String, default: 'default' }, // 'default', 'picker', 'full', 'full-rows', 'full-columns'
  disabled: { type: Boolean, default: false },
  locale: { type: String, default: 'lv-LV' },
  specialDatesAttributes: { type: Array, default: null },
  firstDayOfTheWeek: { type: Number, default: 2 },
  localizedMonthsList: { type: Array, default: () => [] },
  weekDaysList: { type: Array, default: () => [] },
  minDateRef: { type: [String, Date], default: null },
  maxDateRef: { type: [String, Date], default: null },
  closeMenu: { type: Function, default: () => {} },
  openMenu: { type: Function, default: () => {} },
  menuState: { type: Boolean, default: false },
  cadenceOfMinutes: { type: Number, default: 1 }, // 1, 5, 15
  cadenceOfSeconds: { type: Number, default: 1 }, // 1, 5, 15
  clearIfNotExact: { type: Boolean, default: false },
  pickerType: { type: String, default: 'single' }, // 'single', 'range'
  activeInput: { type: String, default: 'startInput' }, // 'startInput', 'endInput'
  setActiveInput: { type: Function, default: () => {} },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const textsDefault = {
  clear: 'Attīrīt',
  clearButton: 'Attīrīt vērtību',
  todayButton: 'Atgriezties uz šodienu',
  clearStart: 'Notīrīt sākuma vērtību',
  clearEnd: 'Notīrīt beigu vērtību',
  next: 'Nākamais',
  previous: 'Iepriekšējais',
  nextMonth: 'Nākamais mēnesis',
  previousMonth: 'Iepriekšējais mēnesis',
  nextYear: 'Nākamais gads',
  previousYear: 'Iepriekšējais gads',
  nextDecade: 'Nākamā dekāde',
  previousDecade: 'Iepriekšējā dekāde',
  doNotIndicateStart: 'Nenorādīt sākumu',
  doNotIndicateEnd: 'Nenorādīt beigas',
  scrollUp: 'Ritināt uz augšu',
  scrollDown: 'Ritināt uz leju',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue']);

const containerRef = ref();

const transitionName = ref('lx-next-slide');
const showCalendar = ref(false);

// Layouts for different selections, like mont days, months and years
const regularLayout = ref(true);
const monthsLayout = ref(false);
const yearsLayout = ref(false);
const quartersLayout = ref(false);
const mobileTimeLayout = ref(false);

// Todays date reference
const todayDate = ref(new Date());

// Selected date if value is provided
const currentDate = ref(todayDate.value);
const selectedManually = ref(false);

const selectedDate = ref();
const selectedDay = ref();
const selectedYear = ref();
const selectedMonth = ref();
const selectedQuarter = ref();

const selectedStartDate = ref(null);
const selectedStartDay = ref(null);
const selectedEndDate = ref(null);
const selectedEndDay = ref(null);
const selectedStartYear = ref();
const selectedEndYear = ref();
const selectedStartMonth = ref();
const selectedEndMonth = ref();

const hoveredDate = ref(null);

const startYear = ref(findDecadeStartYear(todayDate.value.getFullYear()) - 1);
const endYear = ref(findDecadeStartYear(todayDate.value.getFullYear()) + 10);

const startQuarterYear = ref(findDecadeStartYear(todayDate.value.getFullYear()));
const endQuarterYear = ref(findDecadeStartYear(todayDate.value.getFullYear()) + 9);

const shouldCloseMenu = ref(true);

const windowSize = useWindowSize();

// Hours, minutes and seconds arrays
const hours = ref(
  Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    orderIndex: i,
  }))
);

const minutes = ref(
  Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    orderIndex: i,
  }))
);

const seconds = ref(
  Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    orderIndex: i,
  }))
);

// State to store the currently visible hours, minutes and seconds
const visibleHours = ref([]);
const visibleMinutes = ref([]);
const visibleSeconds = ref([]);

const selectedHour = ref(null);
const selectedMinute = ref(null);
const selectedSecond = ref(null);

const outsideOfToday = ref(false);

const isMobileScreen = computed(() => windowSize.width.value < 640);

function openMonthSelect() {
  if (props.mode === 'month-year' && monthsLayout.value) return;

  monthsLayout.value = !monthsLayout.value;
  if (monthsLayout.value) {
    regularLayout.value = false;
    yearsLayout.value = false;
  } else {
    regularLayout.value = true;
  }
}

function openYearSelect() {
  yearsLayout.value = !yearsLayout.value;
  if (yearsLayout.value) {
    regularLayout.value = false;
    monthsLayout.value = false;
  } else {
    if (props.mode === 'month' || props.mode === 'month-year') {
      monthsLayout.value = true;
      return;
    }

    regularLayout.value = true;
  }
}

function openMobileTimeSelect() {
  mobileTimeLayout.value = !mobileTimeLayout.value;
  if (mobileTimeLayout.value) {
    regularLayout.value = false;
    yearsLayout.value = false;
    monthsLayout.value = false;
  } else {
    regularLayout.value = true;
  }
}

const computedPrevTransitionName = computed(() =>
  props.variant === 'full-rows' ? 'lx-previous-full-row-slide' : 'lx-previous-slide'
);

const computedNextTransitionName = computed(() =>
  props.variant === 'full-rows' ? 'lx-next-full-row-slide' : 'lx-next-slide'
);

function selectPreviousSlide() {
  transitionName.value = computedPrevTransitionName.value;

  const prevMonthOrYear = new Date(currentDate.value);

  if (regularLayout.value && currentDate.value) {
    const monthOffset = props.variant === 'full' ? 2 : 1;
    prevMonthOrYear.setDate(1);
    prevMonthOrYear.setMonth(currentDate.value.getMonth() - monthOffset);
  }
  if (monthsLayout.value && currentDate.value) {
    prevMonthOrYear.setDate(1);
    prevMonthOrYear.setFullYear(currentDate.value.getFullYear() - 1);
  }
  if (yearsLayout.value) {
    startYear.value -= 10;
    endYear.value -= 10;
  }
  if (quartersLayout.value) {
    startQuarterYear.value -= 10;
    endQuarterYear.value -= 10;
  }
  currentDate.value = prevMonthOrYear;
}

function selectNextSlide() {
  transitionName.value = computedNextTransitionName.value;

  const nextMonthOrYear = new Date(currentDate.value);

  if (regularLayout.value && currentDate.value) {
    const monthOffset = props.variant === 'full' ? 2 : 1;
    nextMonthOrYear.setDate(1);
    nextMonthOrYear.setMonth(currentDate.value.getMonth() + monthOffset);
  }
  if (monthsLayout.value && currentDate.value) {
    nextMonthOrYear.setDate(1);
    nextMonthOrYear.setFullYear(currentDate.value.getFullYear() + 1);
  }
  if (yearsLayout.value) {
    startYear.value += 10;
    endYear.value += 10;
  }
  if (quartersLayout.value) {
    startQuarterYear.value += 10;
    endQuarterYear.value += 10;
  }
  currentDate.value = nextMonthOrYear;
}

function clearSelectedValues(handleActiveInputSwitch = true) {
  selectedDate.value = null;
  selectedDay.value = null;
  selectedMonth.value = null;
  selectedYear.value = null;
  selectedHour.value = null;
  selectedMinute.value = null;
  selectedSecond.value = null;
  selectedQuarter.value = null;

  selectedStartDate.value = null;
  selectedStartDay.value = null;
  selectedStartMonth.value = null;
  selectedStartYear.value = null;

  selectedEndDate.value = null;
  selectedEndDay.value = null;
  selectedEndMonth.value = null;
  selectedEndYear.value = null;

  hoveredDate.value = null;
  selectedManually.value = false;

  shouldCloseMenu.value = true;

  emits('update:modelValue', null);

  if (props.pickerType === 'range' && handleActiveInputSwitch) {
    props.setActiveInput('startInput', props.id);
  }
}

function handleDoNotIndicateStart() {
  selectedManually.value = false;
  props.setActiveInput(props.activeInput, props.id);

  if (selectedStartDate.value && !selectedEndDate.value && props.activeInput === 'startInput') {
    selectedStartDate.value = null;
    selectedStartDay.value = null;
    selectedStartMonth.value = null;
    selectedStartYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: null,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && !selectedEndDate.value && props.activeInput === 'endInput') {
    selectedStartDate.value = null;
    selectedStartDay.value = null;
    selectedStartMonth.value = null;
    selectedStartYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: null,
    });
    hoveredDate.value = null;
    return;
  }

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    selectedStartDate.value = null;
    selectedStartDay.value = null;
    selectedStartMonth.value = null;
    selectedStartYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    selectedStartDate.value = null;
    selectedStartDay.value = null;
    selectedStartMonth.value = null;
    selectedStartYear.value = null;
    emits('update:modelValue', {
      start: null,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'endInput') {
    selectedStartDate.value = null;
    selectedStartDay.value = null;
    selectedStartMonth.value = null;
    selectedStartYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
  }
}

function handleDoNotIndicateEnd() {
  selectedManually.value = false;
  props.setActiveInput(props.activeInput, props.id);

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    selectedEndDate.value = null;
    selectedEndDay.value = null;
    selectedEndMonth.value = null;
    selectedEndYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: null,
    });
    hoveredDate.value = null;
    return;
  }

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'endInput') {
    selectedEndDate.value = null;
    selectedEndDay.value = null;
    selectedEndMonth.value = null;
    selectedEndYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: null,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && !selectedEndDate.value && props.activeInput === 'endInput') {
    selectedEndDate.value = null;
    selectedEndDay.value = null;
    selectedEndMonth.value = null;
    selectedEndYear.value = null;

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: null,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    selectedEndDate.value = null;
    selectedEndDay.value = null;
    selectedEndMonth.value = null;
    selectedEndYear.value = null;

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: null,
    });
    hoveredDate.value = null;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'endInput') {
    selectedEndDate.value = null;
    selectedEndDay.value = null;
    selectedEndMonth.value = null;
    selectedEndYear.value = null;

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: null,
    });
    hoveredDate.value = null;
  }
}

function handleLayoutDisplay() {
  if (showCalendar.value) {
    // Case when month only selection active
    if (props.mode === 'month') {
      monthsLayout.value = true;
      yearsLayout.value = false;
      return;
    }
    // Case when year only selection active
    if (props.mode === 'year') {
      yearsLayout.value = true;
      return;
    }
    if (props.mode === 'month-year') {
      yearsLayout.value = false;
      monthsLayout.value = true;
      return;
    }
    if (props.mode === 'quarters') {
      yearsLayout.value = false;
      monthsLayout.value = false;
      quartersLayout.value = true;
      return;
    }

    if (isMobileScreen.value && (props.mode === 'date-time' || props.mode === 'date-time-full')) {
      regularLayout.value = true;
      mobileTimeLayout.value = false;
      return;
    }

    monthsLayout.value = false;
    yearsLayout.value = false;
    quartersLayout.value = false;
    regularLayout.value = true;
  }
}

// Compute properties for months, years and quarters grid
const monthsList = computed(() =>
  getMonths(currentDate.value, props.variant, props.mode, props.pickerType, isMobileScreen.value)
);

// Create a computed property for filtering minutes based on cadence
const filteredMinutes = computed(() => {
  const validCadenceValues = [1, 5, 15];
  let cadence = props.cadenceOfMinutes;

  if (!validCadenceValues.includes(cadence)) {
    cadence = 1;
  }

  // Filter the minutes array based on the cadence
  let filtered = minutes.value.filter((_, index) => index % cadence === 0);

  // Extend the array if it has fewer than 9 items (for consistent rendering)
  const minVisibleItems = 9; // Minimum number of visible items for smooth scrolling
  if (filtered.length < minVisibleItems) {
    while (filtered.length < minVisibleItems) {
      filtered = filtered.concat(filtered);
    }
  }

  // Map over filtered array to add unique IDs (to avoid key duplication issues)
  return filtered.map((item) => ({ ...item, id: generateUUID() }));
});

// Create a computed property for filtering seconds based on cadence
const filteredSeconds = computed(() => {
  const validCadenceValues = [1, 5, 15];
  let cadence = props.cadenceOfSeconds;

  if (!validCadenceValues.includes(cadence)) {
    cadence = 1;
  }

  // Filter the seconds array based on the cadence
  let filtered = seconds.value.filter((_, index) => index % cadence === 0);

  // Extend the array if it has fewer than 9 items (for consistent rendering)
  const minVisibleItems = 9; // Minimum number of visible items for smooth scrolling
  if (filtered.length < minVisibleItems) {
    while (filtered.length < minVisibleItems) {
      filtered = filtered.concat(filtered);
    }
  }

  // Map over filtered array to add unique IDs (to avoid key duplication issues)
  return filtered.map((item) => ({ ...item, id: generateUUID() }));
});

const currentHourIndex = ref(getTimeOrderIndex(hours.value, todayDate.value.getHours()));
const currentMinuteIndex = ref(
  getTimeOrderIndex(filteredMinutes.value, todayDate.value.getMinutes(), props.cadenceOfMinutes)
);
const selectedMinuteId = ref(null);
const selectedMinuteCenterId = ref(filteredMinutes.value[currentMinuteIndex.value]?.id);
const currentSecondIndex = ref(
  getTimeOrderIndex(filteredSeconds.value, todayDate.value.getSeconds(), props.cadenceOfSeconds)
);
const selectedSecondId = ref(null);
const selectedSecondCenterId = ref(filteredSeconds.value[currentSecondIndex.value]?.id);

// Update visible hours
function updateVisibleHours() {
  visibleHours.value = getSurroundingHours(
    hours.value,
    currentHourIndex.value,
    isMobileScreen.value
  );
}

// Update visible minutes
function updateVisibleMinutes() {
  visibleMinutes.value = getSurroundingMinutesOrSeconds(
    filteredMinutes.value,
    selectedMinuteCenterId.value,
    isMobileScreen.value
  );
}

// Update visible seconds
function updateVisibleSeconds() {
  visibleSeconds.value = getSurroundingMinutesOrSeconds(
    filteredSeconds.value,
    selectedSecondCenterId.value,
    isMobileScreen.value
  );
}

// Helper functions for setting and resetting dates
function setStartDate(date) {
  selectedStartDate.value = date;
  selectedStartDay.value = date.getDate();
  selectedStartMonth.value = date.getMonth();
  selectedStartYear.value = date.getFullYear();
}

function setEndDate(date) {
  selectedEndDate.value = date;
  selectedEndDay.value = date.getDate();
  selectedEndMonth.value = date.getMonth();
  selectedEndYear.value = date.getFullYear();
}

function resetEndDate() {
  selectedEndDate.value = null;
  selectedEndDay.value = null;
  selectedEndMonth.value = null;
  selectedEndYear.value = null;
}

function updateRange(start, end) {
  emits('update:modelValue', { start, end });
}

function updateStart(date) {
  setStartDate(date);
  hoveredDate.value = date;
}

function updateEnd(date) {
  setEndDate(date);
  hoveredDate.value = date;
}

function handleRangeDifferentCaseValidation(date) {
  const start = selectedStartDate.value;
  const end = selectedEndDate.value;
  const input = props.activeInput;

  // Case 1: No dates selected
  if (!start && !end) {
    if (input === 'startInput') {
      updateStart(date);
      updateRange(date, null);
      props.setActiveInput('endInput', props.id);
    } else {
      updateEnd(date);
      updateRange(null, date);
      props.setActiveInput('startInput', props.id);
    }
    return;
  }

  // Case 2: Start is selected, end is not
  if (start && !end) {
    if (input === 'startInput') {
      updateStart(date);
      updateRange(date, null);
      props.setActiveInput('endInput', props.id);
    } else {
      if (date >= start) {
        updateEnd(date);
        updateRange(start, date);
        hoveredDate.value = null;
        handleLayoutDisplay();
      } else {
        updateStart(date);
        updateRange(date, null);
      }
      props.setActiveInput('endInput', props.id);
    }
    return;
  }

  // Case 3: End is selected, start is not
  if (!start && end) {
    if (input === 'startInput') {
      if (date > end) {
        updateStart(date);
        resetEndDate();
        updateRange(date, null);
      } else {
        setStartDate(date);
        updateRange(date, end);
        hoveredDate.value = null;
      }
      props.setActiveInput('endInput', props.id);
    } else {
      updateEnd(date);
      updateRange(start, end);
      hoveredDate.value = date;
      handleLayoutDisplay();
      props.setActiveInput('startInput', props.id);
    }
    return;
  }

  // Case 4: Both start and end are selected
  if (start && end) {
    if (input === 'endInput') {
      if (date >= start) {
        updateEnd(date);
        updateRange(start, date);
        hoveredDate.value = null;
        handleLayoutDisplay();
      } else {
        updateStart(date);
        resetEndDate();
        updateRange(date, null);
        hoveredDate.value = date;
      }
      props.setActiveInput('endInput', props.id);
    } else {
      if (date <= end) {
        updateStart(date);
        updateRange(date, end);
        hoveredDate.value = null;
        handleLayoutDisplay();
      } else {
        updateStart(date);
        resetEndDate();
        updateRange(date, null);
        hoveredDate.value = date;
      }
      props.setActiveInput('endInput', props.id);
    }
  }
}

function checkMinutesCadence(cadence, filteredIndexParameter, minutesValue) {
  let filteredIndex = filteredIndexParameter;
  // Check if cadence is 5 and filteredMinutes length is 12
  if (cadence === 5 && filteredMinutes.value.length === 12) {
    filteredIndex = filteredMinutes.value.findIndex((item) => Number(item.value) === minutesValue);
  }
  // Check if cadence is 15 and filteredMinutes length is 16
  else if (cadence === 15 && filteredMinutes.value.length === 16) {
    filteredIndex = filteredMinutes.value.findIndex((item) => Number(item.value) === minutesValue);
  }

  return filteredIndex;
}

function checkSecondsCadence(cadence, filteredIndexParameter, secondsValue) {
  let filteredIndex = filteredIndexParameter;
  // Check if cadence is 5 and filteredSeconds length is 12
  if (cadence === 5 && filteredSeconds.value.length === 12) {
    filteredIndex = filteredSeconds.value.findIndex((item) => Number(item.value) === secondsValue);
  }
  // Check if cadence is 15 and filteredSeconds length is 16
  else if (cadence === 15 && filteredSeconds.value.length === 16) {
    filteredIndex = filteredSeconds.value.findIndex((item) => Number(item.value) === secondsValue);
  }

  return filteredIndex;
}

function handleDateLayoutAutoScroll(date) {
  const flatList = monthsList.value.flat();
  const lastMonth = flatList[flatList.length - 1];

  const isDateVisible = flatList.some((d) => d.getMonth() === date.getMonth());

  if (!isDateVisible) {
    const scrolledDate = new Date(date);
    if (props.variant === 'full') scrolledDate.setMonth(date.getMonth() - 3);
    if (['full-rows', 'full-columns'].includes(props.variant))
      scrolledDate.setMonth(date.getMonth() - 1);

    transitionName.value =
      date > lastMonth ? computedNextTransitionName.value : computedPrevTransitionName.value;
    currentDate.value = scrolledDate;
  }
}

function isPartialTimeSelection() {
  return (
    selectedDay.value &&
    (selectedHour.value === null || selectedMinute.value === null || selectedSecond.value === null)
  );
}

function isCompleteTimeSelection() {
  return (
    selectedHour.value !== null &&
    selectedHour.value !== undefined &&
    selectedMinute.value !== null &&
    selectedMinute.value !== undefined
  );
}

function isCompleteTimeFullSelection() {
  return (
    selectedHour.value !== null &&
    selectedHour.value !== undefined &&
    selectedMinute.value !== null &&
    selectedMinute.value !== undefined &&
    selectedSecond.value !== null &&
    selectedSecond.value !== undefined
  );
}

function applyHourBoundsIfNeeded(date) {
  if (props.clearIfNotExact) return;

  const sameMinDay =
    props.minDateRef &&
    date.getFullYear() === props.minDateRef.getFullYear() &&
    date.getMonth() === props.minDateRef.getMonth() &&
    date.getDate() === props.minDateRef.getDate();

  const sameMaxDay =
    props.maxDateRef &&
    date.getFullYear() === props.maxDateRef.getFullYear() &&
    date.getMonth() === props.maxDateRef.getMonth() &&
    date.getDate() === props.maxDateRef.getDate();

  if (
    sameMinDay &&
    (selectedHour.value == null || selectedHour.value < props.minDateRef.getHours())
  ) {
    selectedHour.value = props.minDateRef.getHours();
    currentHourIndex.value = getTimeOrderIndex(hours.value, selectedHour.value);
    updateVisibleHours();
  }

  if (
    sameMaxDay &&
    (selectedHour.value == null || selectedHour.value > props.maxDateRef.getHours())
  ) {
    selectedHour.value = props.maxDateRef.getHours();
    currentHourIndex.value = getTimeOrderIndex(hours.value, selectedHour.value);
    updateVisibleHours();
  }
}

function applyMinuteBoundsIfNeeded(date) {
  if (props.clearIfNotExact) return;

  const cadence = props.cadenceOfMinutes;
  let filteredIndex = -1;

  const sameMinDay = props.minDateRef && date.getDate() === props.minDateRef.getDate();
  if (
    sameMinDay &&
    (isNil(selectedMinute.value) || selectedMinute.value < props.minDateRef.getMinutes())
  ) {
    selectedMinute.value = props.minDateRef.getMinutes();
    filteredIndex = checkMinutesCadence(cadence, filteredIndex, selectedMinute.value);
  }

  const sameMaxDay = props.maxDateRef && date.getDate() === props.maxDateRef.getDate();
  if (
    sameMaxDay &&
    (isNil(selectedMinute.value) || selectedMinute.value > props.maxDateRef.getMinutes())
  ) {
    selectedMinute.value = props.maxDateRef.getMinutes();
    filteredIndex = checkMinutesCadence(cadence, filteredIndex, selectedMinute.value);
  }

  if (filteredIndex === -1) {
    filteredIndex = getTimeOrderIndex(filteredMinutes.value, selectedMinute.value, cadence);
  }

  currentMinuteIndex.value = Math.max(0, filteredIndex);
  selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value].id;
  selectedMinuteId.value = filteredMinutes.value[currentMinuteIndex.value].id;
  updateVisibleMinutes();
}

function applySecondBoundsIfNeeded(date) {
  if (props.clearIfNotExact) return;

  const cadence = props.cadenceOfSeconds;
  let filteredIndex = -1;

  const sameMinDay = props.minDateRef && date.getDate() === props.minDateRef.getDate();
  if (
    sameMinDay &&
    (isNil(selectedSecond.value) || selectedSecond.value < props.minDateRef.getSeconds())
  ) {
    selectedSecond.value = props.minDateRef.getSeconds();
    filteredIndex = checkSecondsCadence(cadence, filteredIndex, selectedSecond.value);
  }

  const sameMaxDay = props.maxDateRef && date.getDate() === props.maxDateRef.getDate();
  if (
    sameMaxDay &&
    (isNil(selectedSecond.value) || selectedSecond.value > props.maxDateRef.getSeconds())
  ) {
    selectedSecond.value = props.maxDateRef.getSeconds();
    filteredIndex = checkSecondsCadence(cadence, filteredIndex, selectedSecond.value);
  }

  if (filteredIndex === -1) {
    filteredIndex = getTimeOrderIndex(filteredSeconds.value, selectedSecond.value, cadence);
  }

  currentSecondIndex.value = Math.max(0, filteredIndex);

  selectedSecondCenterId.value = filteredSeconds.value[currentSecondIndex.value].id;
  selectedSecondId.value = filteredSeconds.value[currentSecondIndex.value].id;
  updateVisibleSeconds();
}

function buildAndEmitFinalDateTime(date, baseDate, fullTime = false) {
  if (props.minDateRef && baseDate.getDate() === props.minDateRef.getDate()) {
    if (selectedHour.value < props.minDateRef.getHours())
      selectedHour.value = props.minDateRef.getHours();
    if (selectedMinute.value < props.minDateRef.getMinutes())
      selectedMinute.value = props.minDateRef.getMinutes();
    if (selectedSecond.value < props.minDateRef.getSeconds() && fullTime)
      selectedSecond.value = props.minDateRef.getSeconds();
  }

  if (props.maxDateRef && baseDate.getDate() === props.maxDateRef.getDate()) {
    if (selectedHour.value > props.maxDateRef.getHours())
      selectedHour.value = props.maxDateRef.getHours();
    if (selectedMinute.value > props.maxDateRef.getMinutes())
      selectedMinute.value = props.maxDateRef.getMinutes();
    if (selectedSecond.value > props.maxDateRef.getSeconds() && fullTime)
      selectedSecond.value = props.maxDateRef.getSeconds();
  }

  date.setHours(selectedHour.value);
  date.setMinutes(selectedMinute.value);
  if (selectedSecond.value && fullTime) date.setSeconds(selectedSecond.value);

  currentDate.value = date;

  emits('update:modelValue', date);
  handleLayoutDisplay();
  if (shouldCloseMenu.value) props.closeMenu();
  props.setActiveInput('startInput', props.id);
}

function handleDateSelection(selectedValue) {
  selectedDay.value = selectedValue.getDate();
  selectedMonth.value = selectedValue.getMonth();
  selectedYear.value = selectedValue.getFullYear();

  const updatedDate = new Date(selectedYear.value, selectedMonth.value, selectedDay.value);
  selectedDate.value = updatedDate;

  if (props.mode === 'date') {
    handleDateLayoutAutoScroll(updatedDate);
    emits('update:modelValue', updatedDate);
    handleLayoutDisplay();
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
    return;
  }

  if (props.mode === 'date-time') {
    if (props.clearIfNotExact && isPartialTimeSelection()) {
      clearSelectedValues();
      return;
    }

    // Hour & minute bound enforcement
    if (!mobileTimeLayout.value) {
      applyHourBoundsIfNeeded(selectedValue);
      applyMinuteBoundsIfNeeded(selectedValue);

      if (isCompleteTimeSelection()) {
        buildAndEmitFinalDateTime(updatedDate, selectedValue);
      }
    }
  }

  if (props.mode === 'date-time-full') {
    if (props.clearIfNotExact && isPartialTimeSelection()) {
      clearSelectedValues();
      return;
    }

    // Hour, minute & second bound enforcement
    if (!mobileTimeLayout.value) {
      applyHourBoundsIfNeeded(selectedValue);
      applyMinuteBoundsIfNeeded(selectedValue);
      applySecondBoundsIfNeeded(selectedValue);

      if (isCompleteTimeFullSelection()) {
        buildAndEmitFinalDateTime(updatedDate, selectedValue, true);
      }
    }
  }
}

function handleMonthSelection(selectedValue, newDate) {
  newDate.setDate(1);
  newDate.setMonth(selectedValue.orderIndex);
  currentDate.value = newDate;

  const monthIndex = Number(selectedValue.orderIndex);
  selectedMonth.value = monthIndex;

  if (props.mode === 'month') {
    emits('update:modelValue', newDate);
    handleLayoutDisplay();
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
    return;
  }

  if (props.mode === 'month-year') {
    selectedYear.value = Number(selectedValue.year);

    if (selectedYear.value) {
      const updatedDate = new Date(selectedYear.value, monthIndex, 1);
      emits('update:modelValue', updatedDate);
      handleLayoutDisplay();
      props.closeMenu();
      props.setActiveInput('startInput', props.id);
    } else {
      monthsLayout.value = false;
      yearsLayout.value = true;
    }
    return;
  }

  monthsLayout.value = false;
  regularLayout.value = true;
  props.setActiveInput(props.activeInput, props.id);
}

function handleYearSelection(selectedValue, newDate) {
  const numericYear = Number(selectedValue);
  newDate.setFullYear(numericYear);
  currentDate.value = newDate;

  selectedYear.value = numericYear;

  const decadeStart = findDecadeStartYear(numericYear);
  startYear.value = decadeStart - 1;
  endYear.value = decadeStart + 10;

  if (numericYear === startYear.value) transitionName.value = computedPrevTransitionName.value;
  if (numericYear === endYear.value) transitionName.value = computedNextTransitionName.value;

  if (props.mode === 'month') {
    yearsLayout.value = false;
    monthsLayout.value = true;
    return;
  }

  if (props.mode === 'year') {
    emits('update:modelValue', newDate);
    handleLayoutDisplay();
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
    return;
  }

  if (props.mode === 'month-year') {
    if (
      selectedMonth.value !== null &&
      !canSelectDate(
        new Date(numericYear, selectedMonth.value, 1),
        props.minDateRef,
        props.maxDateRef,
        'month-year'
      )
    ) {
      selectedMonth.value = null;
      emits('update:modelValue', null);
    } else if (selectedMonth.value !== null) {
      const updatedDate = new Date(numericYear, selectedMonth.value, 1);
      emits('update:modelValue', updatedDate);
      props.closeMenu();
      handleLayoutDisplay();
      props.setActiveInput('startInput', props.id);
      return;
    }
    yearsLayout.value = false;
    monthsLayout.value = true;
    return;
  }

  yearsLayout.value = false;
  regularLayout.value = true;
  props.setActiveInput(props.activeInput, props.id);
}

function handleQuarterSelection(selectedValue) {
  selectedQuarter.value = selectedValue?.quarter;
  selectedYear.value = selectedValue?.year;

  const updatedDate = dateFromYearAndQuarter(selectedYear.value, selectedQuarter.value);
  emits('update:modelValue', updatedDate);
  props.closeMenu();
  props.setActiveInput('startInput', props.id);
}

function handleSingleSelection(selectedValue, selectionType, isNotSelectable = false) {
  if (props.disabled || isNotSelectable) return;
  selectedManually.value = true;

  const newDate = new Date(currentDate.value);

  switch (selectionType) {
    case 'date':
      handleDateSelection(selectedValue);
      break;
    case 'month':
      handleMonthSelection(selectedValue, newDate);
      break;
    case 'year':
      handleYearSelection(selectedValue, newDate);
      break;
    case 'quarter':
      handleQuarterSelection(selectedValue);
      break;
    default:
      break;
  }
}

function handleRangeSelection(selectedValue, selectionType, isNotSelectable = false) {
  if (props.disabled || isNotSelectable) return;
  selectedManually.value = true;

  // Declare new cloned date reference
  const newDate = new Date(currentDate.value);

  switch (selectionType) {
    case 'month':
      newDate.setDate(1);
      newDate.setMonth(selectedValue.orderIndex);
      if (props.mode === 'date') currentDate.value = newDate;

      // Set selectedMonth from the selected value
      selectedMonth.value = Number(selectedValue.orderIndex);

      if (props.mode === 'month') {
        newDate.setDate(1);
        newDate.setMonth(selectedValue.orderIndex);
        newDate.setHours(0, 0, 0, 0);
        handleRangeDifferentCaseValidation(newDate);
        break;
      }

      if (props.mode === 'month-year') {
        newDate.setDate(1);
        newDate.setMonth(selectedValue.orderIndex);
        newDate.setFullYear(selectedValue.year);
        newDate.setHours(0, 0, 0, 0);
        handleRangeDifferentCaseValidation(newDate);
        break;
      }

      monthsLayout.value = false;
      regularLayout.value = true;
      break;
    case 'year':
      newDate.setFullYear(selectedValue);
      if (props.mode === 'date' || props.mode === 'month-year') currentDate.value = newDate;

      // Set selectedYear from the selected value
      selectedYear.value = Number(selectedValue);

      if (props.mode === 'year') {
        newDate.setDate(1);
        newDate.setMonth(1);
        newDate.setHours(0, 0, 0, 0);
        handleRangeDifferentCaseValidation(newDate);
        break;
      }

      if (props.mode === 'month-year') {
        yearsLayout.value = false;
        monthsLayout.value = true;
        break;
      }

      yearsLayout.value = false;
      regularLayout.value = true;
      break;
    case 'quarter': {
      const updatedDate = dateFromYearAndQuarter(selectedValue?.year, selectedValue?.quarter);
      // Set selectedYear from the selected value
      selectedYear.value = Number(selectedValue?.year);
      handleRangeDifferentCaseValidation(updatedDate);
      break;
    }
    case 'date':
      handleRangeDifferentCaseValidation(selectedValue);
      break;
    default:
      break;
  }
}

function handleSelections(selectedValue, selectionType, isNotSelectable = false) {
  if (props.pickerType === 'single') {
    return handleSingleSelection(selectedValue, selectionType, isNotSelectable);
  }
  return handleRangeSelection(selectedValue, selectionType, isNotSelectable);
}

// When hovering over a date
const hoverDate = (date) => {
  if (props.pickerType === 'single') return;
  if (!selectedManually.value) return;
  hoveredDate.value = date; // Set the hovered date to show potential range
};

// Check if a date is in the hovering range
const isHoveringRange = (date) => {
  // Case where only the start date is selected and hover date exists (forward range)
  if (selectedStartDate.value && !selectedEndDate.value && hoveredDate.value) {
    if (hoveredDate.value >= selectedStartDate.value) {
      // Hovered date is after the start date (forward selection)
      return date >= selectedStartDate.value && date <= hoveredDate.value;
    }
    // Hovered date is before the start date (backward selection)
    return date >= hoveredDate.value && date <= selectedStartDate.value;
  }

  // Case where only the end date is selected and hover date exists (backward range)
  if (selectedEndDate.value && !selectedStartDate.value && hoveredDate.value) {
    if (hoveredDate.value <= selectedEndDate.value) {
      // Hovered date is before the end date (backward selection)
      return date >= hoveredDate.value && date <= selectedEndDate.value;
    }
    // Hovered date is after the end date (forward selection)
    return date >= selectedEndDate.value && date <= hoveredDate.value;
  }

  // Return false if none of the conditions match
  return false;
};

function isMonthBetweenInYear(startMth, endMth, targetMth, targetYr, expectedYr) {
  if (targetYr !== expectedYr) return false;
  const [min, max] = [startMth, endMth].sort((a, b) => a - b);
  return targetMth >= min && targetMth <= max;
}

function isMonthInForwardMultiYearRange(startYr, startMth, endYr, endMth, month) {
  if (month.year === startYr) {
    return month.orderIndex >= startMth;
  }
  if (month.year === endYr) {
    return month.orderIndex <= endMth;
  }
  return month.year > startYr && month.year < endYr;
}

function isMonthInBackwardMultiYearRange(startYr, startMth, endYr, endMth, month) {
  if (month.year === startYr) {
    return month.orderIndex <= startMth;
  }
  if (month.year === endYr) {
    return month.orderIndex >= endMth;
  }
  return month.year < startYr && month.year > endYr;
}

function isMonthInHoverRange({ anchorYear, anchorMonth, hoverYear, hoverMonth, month }) {
  const isSameYear = anchorYear === hoverYear;
  const isForward = hoverYear > anchorYear || (isSameYear && hoverMonth >= anchorMonth);
  const isBackward = hoverYear < anchorYear || (isSameYear && hoverMonth < anchorMonth);

  if (isSameYear) {
    return isMonthBetweenInYear(anchorMonth, hoverMonth, month.orderIndex, month.year, anchorYear);
  }

  if (isForward) {
    return isMonthInForwardMultiYearRange(anchorYear, anchorMonth, hoverYear, hoverMonth, month);
  }

  if (isBackward) {
    return isMonthInBackwardMultiYearRange(anchorYear, anchorMonth, hoverYear, hoverMonth, month);
  }

  return false;
}

// Check if a month/month-year is in the hovering range
const isHoveringMonthRange = (month) => {
  if (!hoveredDate.value) return false;

  // Case 1: Start selected, end null
  if (selectedStartMonth.value !== null && selectedEndMonth.value === null) {
    return isMonthInHoverRange({
      anchorYear: selectedStartYear.value,
      anchorMonth: selectedStartMonth.value,
      hoverYear: hoveredDate.value.getFullYear(),
      hoverMonth: hoveredDate.value.getMonth(),
      month,
    });
  }

  // Case 2: End selected, start null
  if (selectedEndMonth.value !== null && selectedStartMonth.value === null) {
    return isMonthInHoverRange({
      anchorYear: selectedEndYear.value,
      anchorMonth: selectedEndMonth.value,
      hoverYear: hoveredDate.value.getFullYear(),
      hoverMonth: hoveredDate.value.getMonth(),
      month,
    });
  }

  return false;
};

// Check if a year is in the hovering range
const isHoveringYearRange = (year) => {
  // Case where only the start year is selected and we're hovering forward or backward
  if (selectedStartYear.value && !selectedEndYear.value && hoveredDate.value) {
    const hoveredYear = hoveredDate.value.getFullYear();
    if (hoveredYear >= selectedStartYear.value) {
      // Forward hovering range (hovered year is after or equal to the start year)
      return year >= selectedStartYear.value && year <= hoveredYear;
    }
    // Backward hovering range (hovered year is before the start year)
    return year >= hoveredYear && year <= selectedStartYear.value;
  }

  // Case where only the end year is selected and we're hovering backward or forward
  if (selectedEndYear.value && !selectedStartYear.value && hoveredDate.value) {
    const hoveredYear = hoveredDate.value.getFullYear();
    if (hoveredYear <= selectedEndYear.value) {
      // Backward hovering range (hovered year is before or equal to the end year)
      return year >= hoveredYear && year <= selectedEndYear.value;
    }
    // Forward hovering range (hovered year is after the end year)
    return year >= selectedEndYear.value && year <= hoveredYear;
  }

  // Return false if no conditions match
  return false;
};

const isSelectedDateRange = (date) => {
  if (selectedStartDate.value && selectedEndDate.value) {
    return date >= selectedStartDate.value && date <= selectedEndDate.value;
  }
  if (selectedStartDate.value && !selectedEndDate.value && !selectedManually.value) {
    return date >= selectedStartDate.value;
  }
  if (!selectedStartDate.value && selectedEndDate.value && !selectedManually.value) {
    return date <= selectedEndDate.value;
  }
  return false;
};

function isMonthInOpenRangeForward({ anchorYear, anchorMonth, month }) {
  if (month.year === anchorYear) {
    return month.orderIndex >= anchorMonth;
  }
  return month.year > anchorYear;
}

function isMonthInOpenRangeBackward({ anchorYear, anchorMonth, month }) {
  if (month.year === anchorYear) {
    return month.orderIndex <= anchorMonth;
  }
  return month.year < anchorYear;
}

function isMonthInFullSelectedRange({ sYear, sMonth, eYear, eMonth, month }) {
  if (sYear === eYear) {
    return month.year === sYear && month.orderIndex >= sMonth && month.orderIndex <= eMonth;
  }

  if (month.year === sYear) {
    return month.orderIndex >= sMonth;
  }

  if (month.year === eYear) {
    return month.orderIndex <= eMonth;
  }

  return month.year > sYear && month.year < eYear;
}

const isSelectedMonthRange = (month) => {
  if (!selectedManually.value) {
    // Single start selection (range open-ended)
    if (selectedStartMonth.value !== null && selectedEndMonth.value === null) {
      return isMonthInOpenRangeForward({
        anchorYear: selectedStartYear.value,
        anchorMonth: selectedStartMonth.value,
        month,
      });
    }

    // Single end selection (range open-ended backwards)
    if (selectedStartMonth.value === null && selectedEndMonth.value !== null) {
      return isMonthInOpenRangeBackward({
        anchorYear: selectedEndYear.value,
        anchorMonth: selectedEndMonth.value,
        month,
      });
    }
  }

  // Full range selected
  if (selectedStartMonth.value !== null && selectedEndMonth.value !== null) {
    return isMonthInFullSelectedRange({
      sYear: selectedStartYear.value,
      sMonth: selectedStartMonth.value,
      eYear: selectedEndYear.value,
      eMonth: selectedEndMonth.value,
      month,
    });
  }

  return false;
};

const isSelectedYearRange = (year) => {
  if (selectedStartYear.value && selectedEndYear.value) {
    return year >= selectedStartYear.value && year <= selectedEndYear.value;
  }
  if (selectedStartYear.value && !selectedEndYear.value && !selectedManually.value) {
    return year >= selectedStartYear.value;
  }
  if (!selectedStartYear.value && selectedEndYear.value && !selectedManually.value) {
    return year <= selectedEndYear.value;
  }

  return false;
};

const isSelectedQuarterRange = (quarterYear, quarterItem) => {
  // Check if both start and end month and year are selected
  if (selectedStartMonth.value !== null && selectedEndMonth.value !== null) {
    // When both start and end are in the same year
    if (selectedStartYear.value === selectedEndYear.value) {
      return (
        quarterYear === Number(selectedStartYear.value) &&
        quarterItem >= quarterFromMonth(selectedStartMonth.value) &&
        quarterItem <= quarterFromMonth(selectedEndMonth.value)
      );
    }

    // When start year is earlier than end year
    if (quarterYear === Number(selectedStartYear.value)) {
      return quarterItem >= quarterFromMonth(selectedStartMonth.value); // Hovering in the start year
    }
    if (quarterYear === Number(selectedEndYear.value)) {
      return quarterItem <= quarterFromMonth(selectedEndMonth.value); // Hovering in the end year
    }

    // For years between the start and end years
    if (
      quarterYear > Number(selectedStartYear.value) &&
      quarterYear < Number(selectedEndYear.value)
    ) {
      return true; // Hovering for all months in the intermediate years
    }
  }

  // Case where only the start month and year are selected
  if (
    selectedStartMonth.value !== null &&
    selectedEndMonth.value === null &&
    !selectedManually.value
  ) {
    // Forward selection from the start quarter
    if (quarterYear === Number(selectedStartYear.value)) {
      return quarterItem >= quarterFromMonth(selectedStartMonth.value);
    }
    // Selection spans across future years
    if (quarterYear > Number(selectedStartYear.value)) {
      return true; // Include all quarters in years after the start year
    }
  }

  // Case where only the end month and year are selected
  if (
    selectedEndMonth.value !== null &&
    selectedStartMonth.value === null &&
    !selectedManually.value
  ) {
    // Backward selection to the end quarter
    if (quarterYear === Number(selectedEndYear.value)) {
      return quarterItem <= quarterFromMonth(selectedEndMonth.value);
    }
    // Selection spans across previous years
    if (quarterYear < Number(selectedEndYear.value)) {
      return true; // Include all quarters in years before the end year
    }
  }
  // No match for selected range
  return false;
};

function returnToToday() {
  const newDate = new Date();

  // Check if the mode is not 'year' or 'quarters' to handle month transitions
  if (props.mode !== 'year' && props.mode !== 'quarters') {
    if (currentDate.value > newDate) {
      transitionName.value = computedPrevTransitionName.value;
    } else {
      transitionName.value = computedNextTransitionName.value;
    }
  } else if (props.mode === 'year') {
    // Handle year transitions
    if (startYear.value > newDate.getFullYear() && endYear.value > newDate.getFullYear()) {
      transitionName.value = computedPrevTransitionName.value;
    } else {
      transitionName.value = computedNextTransitionName.value;
    }
  } else if (props.mode === 'quarters') {
    // Handle quarter transitions
    if (
      startQuarterYear.value > newDate.getFullYear() &&
      endQuarterYear.value > newDate.getFullYear()
    ) {
      transitionName.value = computedPrevTransitionName.value;
    } else {
      transitionName.value = computedNextTransitionName.value;
    }
  }

  currentDate.value = newDate;
  startYear.value = findDecadeStartYear(newDate.getFullYear()) - 1;
  endYear.value = findDecadeStartYear(newDate.getFullYear()) + 10;

  startQuarterYear.value = findDecadeStartYear(newDate.getFullYear());
  endQuarterYear.value = findDecadeStartYear(newDate.getFullYear()) + 9;

  currentHourIndex.value = getTimeOrderIndex(hours.value, newDate.getHours());
  currentMinuteIndex.value = getTimeOrderIndex(
    filteredMinutes.value,
    newDate.getMinutes(),
    props.cadenceOfMinutes
  );
  selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;

  currentSecondIndex.value = getTimeOrderIndex(
    filteredSeconds.value,
    newDate.getSeconds(),
    props.cadenceOfSeconds
  );
  selectedSecondCenterId.value = filteredSeconds.value[currentSecondIndex.value]?.id;

  updateVisibleHours();
  updateVisibleMinutes();
  updateVisibleSeconds();

  handleLayoutDisplay();
}

// Handle scrolling to update the hour or minute
function onScrollClick(direction, type) {
  if (type === 'hours') {
    if (hours.value.length) {
      currentHourIndex.value =
        (currentHourIndex.value + direction + hours.value.length) % hours.value.length;
      updateVisibleHours();
    }
  } else if (type === 'minutes') {
    if (filteredMinutes.value.length) {
      // Update the currentMinuteIndex based on cadence
      currentMinuteIndex.value =
        (currentMinuteIndex.value + direction + filteredMinutes.value.length) %
        filteredMinutes.value.length;

      // Set the selectedMinuteId based on the updated currentMinuteIndex
      selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value].id;

      updateVisibleMinutes();
    }
  } else if (type === 'seconds') {
    if (filteredSeconds.value.length) {
      // Update the currentSecondIndex based on cadence
      currentSecondIndex.value =
        (currentSecondIndex.value + direction + filteredSeconds.value.length) %
        filteredSeconds.value.length;

      // Set the selectedSecondId based on the updated currentSecondIndex
      selectedSecondCenterId.value = filteredSeconds.value[currentSecondIndex.value].id;

      updateVisibleSeconds();
    }
  }
}

const scrollThreshold = 100; // Threshold to trigger scroll
let scrollAccumulated = 0;

function onScrollWheel(event, type) {
  event.preventDefault(); // Prevent default scroll behavior

  scrollAccumulated += event.deltaY;

  if (Math.abs(scrollAccumulated) >= scrollThreshold) {
    // Determine scroll direction based on accumulated scroll
    const direction = scrollAccumulated > 0 ? 1 : -1;

    // Call the function to change the visible hours
    onScrollClick(direction, type);

    // Reset scroll accumulator for smooth scrolling
    scrollAccumulated = 0;
  }
}

// Selection handling
const selectHour = (hourObj, isNotSelectable) => {
  if (props.disabled) return;
  if (isNotSelectable) return;
  currentHourIndex.value = hourObj.orderIndex;
  updateVisibleHours();
  selectedHour.value = Number(hourObj.value);

  if (
    props.mode === 'time' &&
    selectedMinute.value !== null &&
    selectedMinute.value !== undefined
  ) {
    const updatedDate = new Date(
      todayDate.value.getFullYear(),
      todayDate.value.getMonth(),
      todayDate.value.getDate(),
      selectedHour.value,
      selectedMinute.value
    );
    emits('update:modelValue', updatedDate);
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }

  if (
    props.mode === 'time-full' &&
    selectedMinute.value !== null &&
    selectedMinute.value !== undefined &&
    selectedSecond.value !== null &&
    selectedSecond.value !== undefined
  ) {
    const updatedDate = new Date(
      todayDate.value.getFullYear(),
      todayDate.value.getMonth(),
      todayDate.value.getDate(),
      selectedHour.value,
      selectedMinute.value,
      selectedSecond.value
    );
    emits('update:modelValue', updatedDate);
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }

  if (
    isDefined(selectedYear.value) &&
    isDefined(selectedMonth.value) &&
    isDefined(selectedDay.value) &&
    isDefined(selectedHour.value) &&
    isDefined(selectedMinute.value) &&
    (props.mode === 'date-time' ||
      (props.mode === 'date-time-full' && isDefined(selectedSecond.value)))
  ) {
    // Construct the date (include seconds only for full mode)
    const updatedDate = new Date(
      selectedYear.value,
      selectedMonth.value,
      selectedDay.value,
      selectedHour.value,
      selectedMinute.value,
      props.mode === 'date-time-full' ? selectedSecond.value : 0
    );

    selectedDate.value = updatedDate;
    currentDate.value = updatedDate;
    emits('update:modelValue', updatedDate);

    if (!isMobileScreen.value) {
      handleLayoutDisplay();
      if (shouldCloseMenu.value) props.closeMenu();
      props.setActiveInput('startInput', props.id);
    }
  }
};

const selectMinute = (minuteObj, isNotSelectable) => {
  if (props.disabled) return;
  if (isNotSelectable) return;
  currentMinuteIndex.value = minuteObj.orderIndex;

  selectedMinute.value = Number(minuteObj.value);
  selectedMinuteId.value = minuteObj.id;
  selectedMinuteCenterId.value = minuteObj.id;

  updateVisibleMinutes();

  if (props.mode === 'time' && selectedHour.value !== null && selectedHour.value !== undefined) {
    const updatedDate = new Date(
      todayDate.value.getFullYear(),
      todayDate.value.getMonth(),
      todayDate.value.getDate(),
      selectedHour.value,
      selectedMinute.value
    );

    emits('update:modelValue', updatedDate);
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }

  if (
    props.mode === 'time-full' &&
    selectedHour.value !== null &&
    selectedHour.value !== undefined &&
    selectedSecond.value !== null &&
    selectedSecond.value !== undefined
  ) {
    const updatedDate = new Date(
      todayDate.value.getFullYear(),
      todayDate.value.getMonth(),
      todayDate.value.getDate(),
      selectedHour.value,
      selectedMinute.value,
      selectedSecond.value
    );
    emits('update:modelValue', updatedDate);
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }

  if (
    isDefined(selectedYear.value) &&
    isDefined(selectedMonth.value) &&
    isDefined(selectedDay.value) &&
    isDefined(selectedHour.value) &&
    isDefined(selectedMinute.value) &&
    (props.mode === 'date-time' ||
      (props.mode === 'date-time-full' && isDefined(selectedSecond.value)))
  ) {
    const updatedDate = new Date(
      selectedYear.value,
      selectedMonth.value,
      selectedDay.value,
      Number(selectedHour.value),
      Number(selectedMinute.value),
      props.mode === 'date-time-full' ? Number(selectedSecond.value) : 0
    );

    selectedDate.value = updatedDate;
    currentDate.value = updatedDate;
    emits('update:modelValue', updatedDate);

    if (!isMobileScreen.value) {
      handleLayoutDisplay();
      if (shouldCloseMenu.value) props.closeMenu();
      props.setActiveInput('startInput', props.id);
    }
  }
};

const selectSecond = (secondObj, isNotSelectable) => {
  if (props.disabled) return;
  if (isNotSelectable) return;
  currentSecondIndex.value = secondObj.orderIndex;

  selectedSecond.value = Number(secondObj.value);
  selectedSecondId.value = secondObj.id;
  selectedSecondCenterId.value = secondObj.id;

  updateVisibleSeconds();

  if (
    props.mode === 'time-full' &&
    selectedHour.value !== null &&
    selectedHour.value !== undefined &&
    selectedMinute.value !== null &&
    selectedMinute.value !== undefined &&
    selectedSecond.value !== null &&
    selectedSecond.value !== undefined
  ) {
    const updatedDate = new Date(
      todayDate.value.getFullYear(),
      todayDate.value.getMonth(),
      todayDate.value.getDate(),
      selectedHour.value,
      selectedMinute.value,
      selectedSecond.value
    );

    emits('update:modelValue', updatedDate);
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }

  if (
    isDefined(selectedYear.value) &&
    isDefined(selectedMonth.value) &&
    isDefined(selectedDay.value) &&
    isDefined(selectedHour.value) &&
    isDefined(selectedMinute.value) &&
    (props.mode === 'date-time' ||
      (props.mode === 'date-time-full' && isDefined(selectedSecond.value)))
  ) {
    const updatedDate = new Date(
      selectedYear.value,
      selectedMonth.value,
      selectedDay.value,
      Number(selectedHour.value),
      Number(selectedMinute.value),
      props.mode === 'date-time-full' ? Number(selectedSecond.value) : undefined
    );

    selectedDate.value = updatedDate;
    currentDate.value = updatedDate;
    emits('update:modelValue', updatedDate);

    if (!isMobileScreen.value) {
      handleLayoutDisplay();
      if (shouldCloseMenu.value) props.closeMenu();
      props.setActiveInput('startInput', props.id);
    }
  }
};

function moveCalendar(minDate, maxDate) {
  const now = new Date();

  // Case 1: both in the future
  if (minDate && maxDate && minDate > now && maxDate > now) {
    currentDate.value = new Date(minDate);
    startYear.value = minDate.getFullYear() - 5;
    endYear.value = minDate.getFullYear() + 6;
    outsideOfToday.value = true;
    return;
  }

  // Case 2: both in the past
  if (minDate && maxDate && minDate < now && maxDate < now) {
    currentDate.value = new Date(maxDate);
    startYear.value = maxDate.getFullYear() - 5;
    endYear.value = maxDate.getFullYear() + 6;
    outsideOfToday.value = true;
    return;
  }

  // Case 3: only minDate in the future
  if (minDate && minDate > now && !maxDate) {
    currentDate.value = new Date(minDate);
    startYear.value = minDate.getFullYear() - 5;
    endYear.value = minDate.getFullYear() + 6;
    outsideOfToday.value = true;
    return;
  }

  // Case 4: only maxDate in the past
  if (maxDate && maxDate < now && !minDate) {
    currentDate.value = new Date(maxDate);
    startYear.value = maxDate.getFullYear() - 5;
    endYear.value = maxDate.getFullYear() + 6;
    outsideOfToday.value = true;
  }
}

function handleDateTimeSelection() {
  if (props.mode === 'date-time') {
    if (props.clearIfNotExact) {
      if (!selectedDay.value || selectedHour.value === null || selectedMinute.value === null) {
        clearSelectedValues();
      }
    }

    if (!props.clearIfNotExact) {
      // Only date is selected, then time is set to 00:00
      if (selectedDay.value && selectedHour.value === null && selectedMinute.value === null) {
        const updatedDate = new Date(
          selectedYear.value,
          selectedMonth.value,
          selectedDay.value,
          0,
          0
        );
        selectedDate.value = updatedDate;
        currentDate.value = updatedDate;
        emits('update:modelValue', updatedDate);
      }
      // Date and hours selected, then minutes are set to :00
      if (selectedDay.value && selectedHour.value !== null && selectedMinute.value === null) {
        const updatedDate = new Date(
          selectedYear.value,
          selectedMonth.value,
          selectedDay.value,
          Number(selectedHour.value),
          0
        );

        // Check and update minutes based on min/max date
        if (
          props.minDateRef &&
          selectedDay.value === props.minDateRef.getDate() &&
          updatedDate.getMinutes() < props.minDateRef?.getMinutes()
        ) {
          updatedDate.setMinutes(props.minDateRef?.getMinutes());
        }
        // Check and update minutes based on min/max date
        if (
          props.maxDateRef &&
          selectedDay.value === props.maxDateRef.getDate() &&
          updatedDate.getMinutes() > props.maxDateRef?.getMinutes()
        ) {
          updatedDate.setMinutes(props.maxDateRef?.getMinutes());
        }

        selectedDate.value = updatedDate;
        currentDate.value = updatedDate;
        emits('update:modelValue', updatedDate);
      }
      // Date and minutes selected, then hours are set to 00:
      if (selectedDay.value && selectedHour.value === null && selectedMinute.value !== null) {
        const updatedDate = new Date(
          selectedYear.value,
          selectedMonth.value,
          selectedDay.value,
          0,
          Number(selectedMinute.value)
        );

        // Check and update hours based on min/max date
        if (
          props.minDateRef &&
          selectedDay.value === props.minDateRef.getDate() &&
          updatedDate.getHours() < props.minDateRef?.getHours()
        ) {
          updatedDate.setHours(props.minDateRef?.getHours());
        }
        // Check and update hours based on min/max date
        if (
          props.maxDateRef &&
          selectedDay.value === props.maxDateRef.getDate() &&
          updatedDate.getHours() > props.maxDateRef?.getHours()
        ) {
          updatedDate.setHours(props.maxDateRef?.getHours());
        }

        selectedDate.value = updatedDate;
        currentDate.value = updatedDate;
        emits('update:modelValue', updatedDate);
      }
      // Only time selected, then date is set to "today"
      if (!selectedDay.value && selectedHour.value !== null && selectedMinute.value !== null) {
        const updatedDate = new Date(
          todayDate.value.getFullYear(),
          todayDate.value.getMonth(),
          todayDate.value.getDate(),
          Number(selectedHour.value),
          Number(selectedMinute.value)
        );
        selectedDate.value = updatedDate;
        currentDate.value = updatedDate;
        emits('update:modelValue', updatedDate);
      }
      // Only hours selected, then date is set to "today" and minutes to :00
      if (!selectedDay.value && selectedHour.value !== null && selectedMinute.value === null) {
        const updatedDate = new Date(
          todayDate.value.getFullYear(),
          todayDate.value.getMonth(),
          todayDate.value.getDate(),
          Number(selectedHour.value),
          0
        );
        selectedDate.value = updatedDate;
        currentDate.value = updatedDate;
        emits('update:modelValue', updatedDate);
      }
      // Only minutes selected, then date is set to "today" and hours to 00:
      if (!selectedDay.value && selectedHour.value === null && selectedMinute.value !== null) {
        const updatedDate = new Date(
          todayDate.value.getFullYear(),
          todayDate.value.getMonth(),
          todayDate.value.getDate(),
          0,
          Number(selectedMinute.value)
        );
        selectedDate.value = updatedDate;
        currentDate.value = updatedDate;
        emits('update:modelValue', updatedDate);
      }
    }
  }

  if (props.mode === 'time') {
    if (props.clearIfNotExact) {
      if (selectedHour.value === null || selectedMinute.value === null) {
        clearSelectedValues();
      }
    }

    if (!props.clearIfNotExact) {
      // Only hours selected, then minutes are set to :00
      if (selectedHour.value !== null && selectedMinute.value === null) {
        const updatedDate = new Date(
          todayDate.value.getFullYear(),
          todayDate.value.getMonth(),
          todayDate.value.getDate(),
          Number(selectedHour.value),
          0
        );
        emits('update:modelValue', updatedDate);
      }
      // Only minutes selected, then hours are set to 00:
      if (selectedHour.value === null && selectedMinute.value !== null) {
        const updatedDate = new Date(
          todayDate.value.getFullYear(),
          todayDate.value.getMonth(),
          todayDate.value.getDate(),
          0,
          Number(selectedMinute.value)
        );
        emits('update:modelValue', updatedDate);
      }
    }
  }
}

function handleOutsideClickRangeSelection() {
  if (props.activeInput === 'startInput' && !selectedStartDate.value && selectedEndDate.value) {
    if (props.clearIfNotExact) {
      clearSelectedValues();
      emits('update:modelValue', null);
      return;
    }
    handleDoNotIndicateStart();
    return;
  }

  if (props.activeInput === 'endInput' && selectedStartDate.value && !selectedEndDate.value) {
    if (props.clearIfNotExact) {
      clearSelectedValues();
      emits('update:modelValue', null);
      return;
    }
    handleDoNotIndicateEnd();
  }
}

const handleFocusOut = (e) => {
  if (e.relatedTarget && !containerRef.value.contains(e.relatedTarget)) {
    handleDateTimeSelection();
  }
};

function handleClose(e) {
  props.setActiveInput(props.activeInput, props.id);
  e.stopPropagation();
  if (props.pickerType === 'range') {
    handleOutsideClickRangeSelection();
  }
  props.closeMenu();
}

const updateCurrentDateIfNotInMonthsList = (selectedDateValue) => {
  if (props.mode === 'month-year' && props.pickerType === 'range') return;
  // Check if the selectedStartDate month/year exists in monthsList
  const monthExists = monthsList.value.some((monthsArray) =>
    monthsArray.some((month) => {
      const monthDate = new Date(month); // Convert the month string to a Date object
      return (
        monthDate.getMonth() === selectedDateValue.getMonth() &&
        monthDate.getFullYear() === selectedDateValue.getFullYear()
      );
    })
  );

  // If the month doesn't exist in monthsList, update currentDate.value
  if (!monthExists) {
    currentDate.value = selectedDateValue;
  }
};

const isCalendarRootAvailable = computed(
  () =>
    props.mode === 'date' ||
    props.mode === 'date-time' ||
    props.mode === 'date-time-full' ||
    props.mode === 'month' ||
    props.mode === 'year' ||
    props.mode === 'month-year' ||
    props.mode === 'quarters'
);

const yearsPeriodPlaceholder = computed(() => {
  if (props.mode === 'year') {
    return `${startYear.value + 1}-${endYear.value - 1}`;
  }
  if (props.mode === 'quarters') {
    return `${startQuarterYear.value}-${endQuarterYear.value}`;
  }
  return '';
});

const previousMonth = computed(() => subMonths(currentDate.value, 1));
const nextMonth = computed(() => addMonths(currentDate.value, 1));
const previousYear = computed(() => subYears(currentDate.value, 1));
const nextYear = computed(() => addYears(currentDate.value, 1));

const canSelectPrevious = computed(() => {
  if (props.disabled) return false;
  if (props.mode === 'month') return false;

  // Always enable if minDateRef is null
  if (!props.minDateRef) return true;

  // Disable previous button only in 'regular' layout
  if (regularLayout.value) {
    const prevMonthYear = previousMonth.value.getFullYear();
    const prevMonthNum = previousMonth.value.getMonth();

    const minYear = props.minDateRef.getFullYear();
    const minMonth = props.minDateRef.getMonth();

    // Case 1: Previous month year is greater than min year - allow
    if (prevMonthYear > minYear) return true;

    // Case 2: Previous month year is less than min year - disable
    if (prevMonthYear < minYear) return false;

    // Case 3: Same year, compare months
    return prevMonthNum >= minMonth;
  }

  // Check only years for 'months' layout
  if (monthsLayout.value) {
    return previousYear.value.getFullYear() >= props.minDateRef.getFullYear() && !props.disabled;
  }

  // Check only years for 'quarters' layout
  if (quartersLayout.value) {
    return startQuarterYear.value > props.minDateRef.getFullYear() && !props.disabled;
  }

  // Check only years for 'years' layout
  if (yearsLayout.value) {
    return startYear.value > props.minDateRef.getFullYear() && !props.disabled;
  }

  // Always enable in other cases
  return true;
});

const canSelectNext = computed(() => {
  if (props.disabled) return false;
  if (props.mode === 'month') return false;

  // Always enable if maxDateRef is null
  if (!props.maxDateRef) return true;

  // Disable next button only in 'regular' layout
  if (regularLayout.value) {
    const nextMonthYear = nextMonth.value.getFullYear();
    const nextMonthNum = nextMonth.value.getMonth();

    const maxYear = props.maxDateRef.getFullYear();
    const maxMonth = props.maxDateRef.getMonth();

    // Case 1: Next month year is less than max year - allow
    if (nextMonthYear < maxYear) return true;

    // Case 2: Next month year is greater than max year - disable
    if (nextMonthYear > maxYear) return false;

    // Case 3: Same year, compare months
    return nextMonthNum <= maxMonth;
  }

  // Check only years for 'months' layout
  if (monthsLayout.value) {
    return nextYear.value.getFullYear() <= props.maxDateRef.getFullYear() && !props.disabled;
  }

  // Check only years for 'quarters' layout
  if (quartersLayout.value) {
    return endQuarterYear.value < props.maxDateRef.getFullYear() && !props.disabled;
  }

  // Check only years for 'years' layout
  if (yearsLayout.value) {
    return endYear.value < props.maxDateRef.getFullYear() && !props.disabled;
  }

  // Always enable in other cases
  return true;
});

// Compute properties for months, years and quarters grid
const monthsInYear = computed(() =>
  getMonthGrid(
    props.pickerType,
    props.mode,
    currentDate.value.getFullYear(),
    3,
    props.localizedMonthsList,
    isMobileScreen.value
  )
);
const yearsList = computed(() => getGrid('years', 3, startYear.value, endYear.value));
const quartersList = computed(() =>
  getGrid('quarters', 5, startQuarterYear.value, endQuarterYear.value)
);

const monthsSelectButtonLabel = computed(() => {
  if (
    (props.mode === 'date' && props.variant === 'full' && props.pickerType === 'single') ||
    (props.mode === 'date' && props.variant === 'full-rows' && props.pickerType === 'single') ||
    (props.mode === 'date' && props.variant === 'full-columns' && props.pickerType === 'single') ||
    (props.pickerType === 'range' && !isMobileScreen.value)
  ) {
    // Flatten the monthsList array to handle the different structures
    const flattenedMonths = monthsList.value.flat();

    if (flattenedMonths.length > 0) {
      // Get the first and last month from the flattened array
      const firstMonth = flattenedMonths[0];
      const lastMonth = flattenedMonths[flattenedMonths.length - 1];

      // Format the first and last month names
      const firstMonthName = getMonthNameByOrder(
        props.localizedMonthsList,
        firstMonth.getMonth(),
        true,
        'short'
      );

      const lastMonthName = getMonthNameByOrder(
        props.localizedMonthsList,
        lastMonth.getMonth(),
        true,
        'short'
      );

      // Return the formatted range (e.g., "Aug.-Sept.")
      return `${firstMonthName}-${lastMonthName}`;
    }
  }
  // Default case: return the current month full name
  return getMonthNameByOrder(props.localizedMonthsList, currentDate.value.getMonth(), true);
});

const yearsSelectButtonLabel = computed(() => {
  if (
    (props.mode === 'date' && props.variant === 'full' && props.pickerType === 'single') ||
    (props.mode === 'date' && props.variant === 'full-rows' && props.pickerType === 'single') ||
    (props.mode === 'date' && props.variant === 'full-columns' && props.pickerType === 'single')
  ) {
    // Flatten the monthsList array to handle the different structures
    const flattenedMonths = monthsList.value.flat();

    if (flattenedMonths.length > 0) {
      // Get the first and last month from the flattened array
      const firstMonth = flattenedMonths[0];
      const lastMonth = flattenedMonths[flattenedMonths.length - 1];

      if (firstMonth.getFullYear() === lastMonth.getFullYear()) {
        return `${firstMonth.getFullYear()}`;
      }
      // Return the formatted split year range (e.g., "2024-2025")
      return `${firstMonth.getFullYear()}-${lastMonth.getFullYear()}`;
    }
  }
  if (props.mode === 'month-year' && props.pickerType === 'range') {
    if (monthsInYear.value.length > 0) {
      // Get the first and last month from the flattened array
      const firstYear = monthsInYear.value[0];
      const lastYear = monthsInYear.value[monthsInYear.value.length - 1];

      const flattenedFirstYear = firstYear.flat();
      const flattenedLastYear = lastYear.flat();

      // Return the formatted split year range (e.g., "2024-2025")
      return `${flattenedFirstYear[0].year}-${flattenedLastYear[0].year}`;
    }
  }

  // Default case: return the current year
  return currentDate.value.getFullYear().toString();
});

const timeSelectButtonLabel = computed(() => {
  // Check if selected hour and minute are available
  if (selectedHour.value !== null && selectedMinute.value !== null) {
    const hoursToShow = zeroPad(selectedHour.value);
    const minutesToShow = zeroPad(selectedMinute.value);
    return `${hoursToShow}:${minutesToShow}`;
  }

  // Fallback to current time
  const currentHours = zeroPad(currentDate.value.getHours());
  const currentMinutes = zeroPad(currentDate.value.getMinutes());

  return `${currentHours}:${currentMinutes}`;
});

const doNotIndicateStartDisableState = computed(
  () =>
    props.disabled ||
    (!selectedStartDate.value && !selectedManually.value) ||
    (!selectedStartDate.value && !selectedEndDate.value)
);

const clearButtonDisableState = computed(() => {
  if (props.disabled) return true;
  // Picker type is "single" and date is not selected: disabled
  if (props.pickerType === 'single') {
    if (
      props.mode !== 'quarters' &&
      !selectedDate.value &&
      selectedHour.value === null &&
      selectedMinute.value === null &&
      selectedSecond.value === null
    ) {
      return true;
    }
    if (props.mode === 'quarters' && !selectedQuarter.value) {
      return true;
    }
  }

  // Picker type is "range" and start/end dates are not selected: disabled
  if (props.pickerType === 'range' && !selectedStartDate.value && !selectedEndDate.value) {
    return true;
  }
  // Default case: enabled
  return false;
});

const doNotIndicateEndDisableState = computed(
  () =>
    props.disabled ||
    (!selectedEndDate.value && !selectedManually.value) ||
    (!selectedEndDate.value && !selectedStartDate.value)
);

const isMinMaxInFuture = computed(() =>
  props.minDateRef && props.maxDateRef
    ? props.minDateRef > new Date() && props.maxDateRef > new Date()
    : false
);

const isMinMaxInPast = computed(() =>
  props.minDateRef && props.maxDateRef
    ? props.minDateRef < new Date() && props.maxDateRef < new Date()
    : false
);

const previousSlideButtonLabel = computed(() => {
  if (regularLayout.value) return displayTexts.value.previousMonth;
  if (monthsLayout.value) return displayTexts.value.previousYear;
  if (yearsLayout.value) return displayTexts.value.previousDecade;
  if (quartersLayout.value) return displayTexts.value.previousDecade;
  return displayTexts.value.previous;
});

const nextSlideButtonLabel = computed(() => {
  if (regularLayout.value) return displayTexts.value.nextMonth;
  if (monthsLayout.value) return displayTexts.value.nextYear;
  if (yearsLayout.value) return displayTexts.value.nextDecade;
  if (quartersLayout.value) return displayTexts.value.nextDecade;
  return displayTexts.value.next;
});

const onToday = computed(() => {
  const date = currentDate.value;
  const hour = currentHourIndex.value;
  const minute = currentMinuteIndex.value;
  const second = currentSecondIndex.value;

  const now = new Date();

  switch (props.mode) {
    case 'date': {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    case 'date-time': {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        hour === now.getHours() &&
        minute === now.getMinutes()
      );
    }

    case 'date-time-full': {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        hour === now.getHours() &&
        minute === now.getMinutes() &&
        second === now.getSeconds()
      );
    }

    case 'time': {
      return hour === now.getHours() && minute === now.getMinutes();
    }

    case 'time-full': {
      return hour === now.getHours() && minute === now.getMinutes() && second === now.getSeconds();
    }

    case 'year': {
      return startYear.value < now.getFullYear() && endYear.value > now.getFullYear();
    }

    case 'quarters': {
      return startQuarterYear.value < now.getFullYear() && endQuarterYear.value > now.getFullYear();
    }

    case 'month-year': {
      return date.getFullYear() === now.getFullYear();
    }

    default:
      return false;
  }
});

onClickOutside(
  containerRef,
  () => {
    if (props.pickerType === 'single' && props.variant !== 'default') {
      handleDateTimeSelection();
    }
    if (props.pickerType === 'range') {
      handleOutsideClickRangeSelection();
    }
  },
  {
    ignore: ['#poppers'],
  }
);

watch(
  () => [selectedDate.value, selectedHour.value, selectedMinute.value],
  (_, [oldSelectDate, oldSelectHour, oldSelectMinute]) => {
    if (props.mode !== 'date-time' && props.mode !== 'date-time-full') return;
    if (oldSelectDate && oldSelectHour && oldSelectMinute) {
      shouldCloseMenu.value = false;
    }
  }
);

watch(
  () => [props.minDateRef, props.maxDateRef],
  ([newMinDate, newMaxDate]) => {
    // Only run if at least one date is present
    if (newMinDate || newMaxDate) {
      moveCalendar(newMinDate, newMaxDate);
    }
  },
  { immediate: true }
);

watch(
  () => isMobileScreen.value,
  () => {
    updateVisibleHours();
    updateVisibleMinutes();
    updateVisibleSeconds();
  }
);

watch(
  () => props.mode,
  (newKind) => {
    if (newKind === 'month') {
      regularLayout.value = false;
      monthsLayout.value = true;
      yearsLayout.value = false;
      quartersLayout.value = false;
      return;
    }
    if (newKind === 'year') {
      regularLayout.value = false;
      monthsLayout.value = false;
      yearsLayout.value = true;
      quartersLayout.value = false;
      return;
    }
    if (newKind === 'month-year') {
      regularLayout.value = false;
      monthsLayout.value = true;
      yearsLayout.value = false;
      quartersLayout.value = false;
      return;
    }
    if (newKind === 'quarters') {
      regularLayout.value = false;
      monthsLayout.value = false;
      yearsLayout.value = false;
      quartersLayout.value = true;
      return;
    }

    regularLayout.value = true;
    monthsLayout.value = false;
    yearsLayout.value = false;
    quartersLayout.value = false;
  },
  { immediate: true }
);

watch(
  () => props.menuState,
  (newValue) => {
    if (newValue) {
      showCalendar.value = true;
      handleLayoutDisplay();
    }

    // Handle missing date time parts when calendar menu closes
    if (!newValue) {
      if (props.pickerType === 'single') {
        handleDateTimeSelection();

        if (!selectedDate.value && !isMinMaxInFuture.value && !isMinMaxInPast.value) {
          returnToToday();
        }

        if (props.mode === 'date' && selectedDate.value && props.variant === 'default') {
          currentDate.value = selectedDate.value;
        }
        if (
          ((props.mode === 'date-time' && selectedDate.value) || props.mode === 'time') &&
          selectedHour.value !== null &&
          selectedMinute.value !== null &&
          props.variant === 'default'
        ) {
          if (props.mode === 'date-time') {
            currentDate.value = selectedDate.value;
          }
          currentHourIndex.value = getTimeOrderIndex(hours.value, selectedHour.value);
          const cadence = props.cadenceOfMinutes;
          const minutesValue = selectedMinute.value;
          let filteredIndex = -1;

          filteredIndex = checkMinutesCadence(cadence, filteredIndex, minutesValue);

          // Use fallback index (0) if filteredIndex is invalid
          currentMinuteIndex.value =
            filteredIndex !== -1
              ? filteredIndex
              : getTimeOrderIndex(filteredMinutes.value, minutesValue, props.cadenceOfMinutes);

          // Ensure currentMinuteIndex is valid, otherwise default to 0
          if (
            currentMinuteIndex.value === null ||
            currentMinuteIndex.value === undefined ||
            currentMinuteIndex.value < 0
          ) {
            currentMinuteIndex.value = 0;
          }

          selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value].id;
          selectedMinuteId.value = filteredMinutes.value[currentMinuteIndex.value].id;

          updateVisibleHours();
          updateVisibleMinutes();
          updateVisibleSeconds();
        }
      }

      if (props.pickerType === 'range') {
        if (!selectedStartDate.value && !selectedEndDate.value) {
          returnToToday();
        }

        if (
          (selectedStartDate.value && !selectedEndDate.value) ||
          (selectedStartDate.value && selectedEndDate.value)
        ) {
          startYear.value = findDecadeStartYear(selectedStartDate.value.getFullYear()) - 1;
          endYear.value = findDecadeStartYear(selectedStartDate.value.getFullYear()) + 10;
          startQuarterYear.value = findDecadeStartYear(selectedStartDate.value.getFullYear());
          endQuarterYear.value = findDecadeStartYear(selectedStartDate.value.getFullYear()) + 9;

          currentDate.value = selectedStartDate.value;
        }

        if (!selectedStartDate.value && selectedEndDate.value) {
          startYear.value = findDecadeStartYear(selectedEndDate.value.getFullYear()) - 1;
          endYear.value = findDecadeStartYear(selectedEndDate.value.getFullYear()) + 10;
          startQuarterYear.value = findDecadeStartYear(selectedEndDate.value.getFullYear());
          endQuarterYear.value = findDecadeStartYear(selectedEndDate.value.getFullYear()) + 9;

          currentDate.value = selectedEndDate.value;
        }
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.cadenceOfMinutes,
  () => {
    if (props.mode !== 'time' && props.mode !== 'date-time') return;

    selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;
    updateVisibleHours();
    updateVisibleMinutes();
  },
  { immediate: true }
);

watch(
  () => props.cadenceOfSeconds,
  () => {
    if (props.mode !== 'time-full' && props.mode !== 'date-time-full') return;

    selectedSecondCenterId.value = filteredSeconds.value[currentSecondIndex.value]?.id;
    updateVisibleHours();
    updateVisibleMinutes();
    updateVisibleSeconds();
  },
  { immediate: true }
);

watch(
  () => props.mode,
  () => {
    // Watch for mode change and reset everything
    clearSelectedValues();
    emits('update:modelValue', null);
  }
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (isNil(newValue) && props.pickerType === 'single') {
      clearSelectedValues();
      emits('update:modelValue', null);
      return;
    }

    if ((isNil(newValue) || (!newValue.start && !newValue.end)) && props.pickerType === 'range') {
      clearSelectedValues(false);
      emits('update:modelValue', null);
      return;
    }

    if (
      props.pickerType === 'single' &&
      props.mode !== 'month' &&
      props.mode !== 'quarters' &&
      !canSelectDate(newValue, props.minDateRef, props.maxDateRef, props.mode)
    ) {
      clearSelectedValues();
      emits('update:modelValue', null);
      return;
    }

    if (props.pickerType === 'single' && isDefined(newValue)) {
      if (props.mode === 'date' || props.mode === 'date-time' || props.mode === 'date-time-full') {
        selectedDate.value = newValue;
        if (!selectedManually.value) currentDate.value = selectedDate.value;

        selectedDay.value = newValue.getDate();
        selectedMonth.value = newValue.getMonth();
        selectedYear.value = newValue.getFullYear();

        selectedHour.value = newValue.getHours();
        selectedMinute.value = newValue.getMinutes();
        selectedSecond.value = newValue.getSeconds();
        currentHourIndex.value = getTimeOrderIndex(hours.value, newValue.getHours());

        const cadenceM = props.cadenceOfMinutes;
        const cadenceS = props.cadenceOfSeconds;
        const minutesValue = newValue.getMinutes();
        const secondsValue = newValue.getSeconds();
        let filteredMinuteIndex = -1;
        let filteredSecondIndex = -1;

        filteredMinuteIndex = checkMinutesCadence(cadenceM, filteredMinuteIndex, minutesValue);
        filteredSecondIndex = checkSecondsCadence(cadenceS, filteredSecondIndex, secondsValue);

        // Use fallback index (0) if filteredMinuteIndex is invalid
        currentMinuteIndex.value =
          filteredMinuteIndex !== -1
            ? filteredMinuteIndex
            : getTimeOrderIndex(filteredMinutes.value, minutesValue, props.cadenceOfMinutes);

        // Use fallback index (0) if filteredSecondIndex is invalid
        currentSecondIndex.value =
          filteredSecondIndex !== -1
            ? filteredSecondIndex
            : getTimeOrderIndex(filteredSeconds.value, secondsValue, props.cadenceOfSeconds);

        // Ensure currentMinuteIndex is valid, otherwise default to 0
        if (
          currentMinuteIndex.value === null ||
          currentMinuteIndex.value === undefined ||
          currentMinuteIndex.value < 0
        ) {
          currentMinuteIndex.value = 0;
        }

        // Ensure currentSecondIndex is valid, otherwise default to 0
        if (
          currentSecondIndex.value === null ||
          currentSecondIndex.value === undefined ||
          currentSecondIndex.value < 0
        ) {
          currentSecondIndex.value = 0;
        }

        selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value].id;
        selectedMinuteId.value = filteredMinutes.value[currentMinuteIndex.value].id;

        selectedSecondCenterId.value = filteredSeconds.value[currentSecondIndex.value].id;
        selectedSecondId.value = filteredSeconds.value[currentSecondIndex.value].id;

        const decadeStartYear = findDecadeStartYear(newValue.getFullYear());
        startYear.value = decadeStartYear - 1;
        endYear.value = decadeStartYear + 10;

        emits('update:modelValue', newValue);
      }

      if (props.mode === 'time') {
        currentHourIndex.value = getTimeOrderIndex(hours.value, newValue.getHours());

        const cadence = props.cadenceOfMinutes;
        const minutesValue = newValue.getMinutes();
        let filteredIndex = -1;

        filteredIndex = checkMinutesCadence(cadence, filteredIndex, minutesValue);

        // Use fallback index (0) if filteredIndex is invalid
        currentMinuteIndex.value =
          filteredIndex !== -1
            ? filteredIndex
            : getTimeOrderIndex(filteredMinutes.value, minutesValue, props.cadenceOfMinutes);

        // Ensure currentMinuteIndex is valid, otherwise default to 0
        if (
          currentMinuteIndex.value === null ||
          currentMinuteIndex.value === undefined ||
          currentMinuteIndex.value < 0
        ) {
          currentMinuteIndex.value = 0;
        }

        selectedHour.value = newValue.getHours();
        selectedMinute.value = newValue.getMinutes();
        selectedMinuteId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;
        selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;

        emits('update:modelValue', newValue);
      }

      if (props.mode === 'time-full') {
        currentHourIndex.value = getTimeOrderIndex(hours.value, newValue.getHours());

        const cadenceM = props.cadenceOfMinutes;
        const cadenceS = props.cadenceOfSeconds;
        const minutesValue = newValue.getMinutes();
        const secondsValue = newValue.getSeconds();
        let filteredIndexM = -1;
        let filteredIndexS = -1;

        filteredIndexM = checkMinutesCadence(cadenceM, filteredIndexM, minutesValue);
        filteredIndexS = checkSecondsCadence(cadenceS, filteredIndexS, secondsValue);

        // Use fallback index (0) if filteredIndexM is invalid
        currentMinuteIndex.value =
          filteredIndexM !== -1
            ? filteredIndexM
            : getTimeOrderIndex(filteredMinutes.value, minutesValue, props.cadenceOfMinutes);

        // Use fallback index (0) if filteredIndexS is invalid
        currentSecondIndex.value =
          filteredIndexS !== -1
            ? filteredIndexS
            : getTimeOrderIndex(filteredSeconds.value, secondsValue, props.cadenceOfSeconds);

        // Ensure currentMinuteIndex is valid, otherwise default to 0
        if (
          currentMinuteIndex.value === null ||
          currentMinuteIndex.value === undefined ||
          currentMinuteIndex.value < 0
        ) {
          currentMinuteIndex.value = 0;
        }

        // Ensure currentSecondIndex is valid, otherwise default to 0
        if (
          currentSecondIndex.value === null ||
          currentSecondIndex.value === undefined ||
          currentSecondIndex.value < 0
        ) {
          currentSecondIndex.value = 0;
        }

        selectedHour.value = newValue.getHours();

        selectedMinute.value = newValue.getMinutes();
        selectedMinuteId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;
        selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;

        selectedSecond.value = newValue.getSeconds();
        selectedSecondId.value = filteredSeconds.value[currentSecondIndex.value]?.id;
        selectedSecondCenterId.value = filteredSeconds.value[currentSecondIndex.value]?.id;

        emits('update:modelValue', newValue);
      }

      if (props.mode === 'month') {
        selectedDate.value = newValue;
        selectedMonth.value = newValue.getMonth();
        if (!selectedManually.value) currentDate.value = selectedDate.value;
        emits('update:modelValue', selectedDate.value);
      }

      if (props.mode === 'year') {
        selectedDate.value = newValue;
        selectedYear.value = newValue.getFullYear();

        const decadeStartYear = findDecadeStartYear(newValue.getFullYear());
        startYear.value = decadeStartYear - 1;
        endYear.value = decadeStartYear + 10;

        emits('update:modelValue', selectedDate.value);
      }

      if (props.mode === 'month-year') {
        selectedDate.value = newValue;
        selectedMonth.value = newValue.getMonth();
        selectedYear.value = newValue.getFullYear();
        if (!selectedManually.value) currentDate.value = selectedDate.value;

        const decadeStartYear = findDecadeStartYear(newValue.getFullYear());
        startYear.value = decadeStartYear - 1;
        endYear.value = decadeStartYear + 10;

        emits('update:modelValue', selectedDate.value);
      }

      if (props.mode === 'quarters') {
        const getQuarterStringFromDateObj = extractQuarterFromDate(newValue);
        const [year, quarter] = getQuarterStringFromDateObj.split('-');
        const normalizedQuarter = quarter.split('Q');
        const constructedQuarterObj = {
          year: Number(year),
          quarter: normalizedQuarter[1],
        };

        if (!isQuarterValid(constructedQuarterObj, props.minDateRef, props.maxDateRef)) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        selectedQuarter.value = constructedQuarterObj?.quarter;
        selectedYear.value = constructedQuarterObj?.year;

        startQuarterYear.value = findDecadeStartYear(constructedQuarterObj.year);
        endQuarterYear.value = findDecadeStartYear(constructedQuarterObj.year) + 9;
        emits('update:modelValue', newValue);
      }
    }

    if (props.pickerType === 'range' && newValue) {
      if (newValue.start && newValue.end) {
        if (props.mode !== 'quarters' && newValue.start > newValue.end) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        if (
          (props.mode !== 'month' &&
            props.mode !== 'quarters' &&
            !canSelectDate(newValue.start, props.minDateRef, props.maxDateRef, props.mode)) ||
          (props.mode !== 'month' &&
            props.mode !== 'quarters' &&
            !canSelectDate(newValue.end, props.minDateRef, props.maxDateRef, props.mode))
        ) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        if (props.mode === 'quarters') {
          const getStartQuarterStringFromDateObj = extractQuarterFromDate(newValue.start);
          const getEndQuarterStringFromDateObj = extractQuarterFromDate(newValue.end);
          const [startQrYear, startQuarter] = getStartQuarterStringFromDateObj.split('-');
          const [endQrYear, endQuarter] = getEndQuarterStringFromDateObj.split('-');
          const normalizeStartQuarter = startQuarter.split('Q');
          const normalizeEndQuarter = endQuarter.split('Q');

          const constructedStartQuarterObj = {
            year: Number(startQrYear),
            quarter: normalizeStartQuarter[1],
          };
          const constructedEndQuarterObj = {
            year: Number(endQrYear),
            quarter: normalizeEndQuarter[1],
          };

          if (getStartQuarterStringFromDateObj > getEndQuarterStringFromDateObj) {
            clearSelectedValues();
            emits('update:modelValue', null);
            return;
          }
          if (
            !isQuarterValid(constructedStartQuarterObj, props.minDateRef, props.maxDateRef) ||
            !isQuarterValid(constructedEndQuarterObj, props.minDateRef, props.maxDateRef)
          ) {
            clearSelectedValues();
            emits('update:modelValue', null);
            return;
          }

          const decadeStartYear = findDecadeStartYear(constructedStartQuarterObj.year);
          startQuarterYear.value = decadeStartYear;
          endQuarterYear.value = decadeStartYear + 9;
        }

        if (!props.menuState) {
          currentDate.value = newValue.start;
        } else {
          updateCurrentDateIfNotInMonthsList(newValue.start);
        }

        selectedStartDate.value = newValue.start;
        selectedStartDay.value = newValue.start.getDate();
        selectedStartMonth.value = newValue.start.getMonth();
        selectedStartYear.value = newValue.start.getFullYear();
        selectedEndDate.value = newValue.end;
        selectedEndDay.value = newValue.end.getDate();
        selectedEndMonth.value = newValue.end.getMonth();
        selectedEndYear.value = newValue.end.getFullYear();

        const decadeStartYear = findDecadeStartYear(newValue.start.getFullYear());
        startYear.value = decadeStartYear - 1;
        endYear.value = decadeStartYear + 10;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });
      } else if (newValue.start && !newValue.end) {
        if (
          props.mode !== 'month' &&
          props.mode !== 'quarters' &&
          !canSelectDate(newValue.start, props.minDateRef, props.maxDateRef, props.mode)
        ) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        if (props.mode === 'quarters') {
          const getStartQuarterStringFromDateObj = extractQuarterFromDate(newValue.start);
          const [startQrYear, startQuarter] = getStartQuarterStringFromDateObj.split('-');
          const normalizeStartQuarter = startQuarter.split('Q');

          const constructedStartQuarterObj = {
            year: Number(startQrYear),
            quarter: normalizeStartQuarter[1],
          };

          if (!isQuarterValid(constructedStartQuarterObj, props.minDateRef, props.maxDateRef)) {
            clearSelectedValues();
            emits('update:modelValue', null);
            return;
          }

          const decadeStartYear = findDecadeStartYear(constructedStartQuarterObj.year);
          startQuarterYear.value = decadeStartYear;
          endQuarterYear.value = decadeStartYear + 9;
        }

        if (!props.menuState) {
          currentDate.value = newValue.start;
        } else {
          updateCurrentDateIfNotInMonthsList(newValue.start);
        }

        selectedStartDate.value = newValue.start;
        selectedStartDay.value = newValue.start.getDate();
        selectedStartMonth.value = newValue.start.getMonth();
        selectedStartYear.value = newValue.start.getFullYear();

        selectedEndDate.value = null;
        selectedEndDay.value = null;
        selectedEndMonth.value = null;
        selectedEndYear.value = null;

        const decadeStartYear = findDecadeStartYear(newValue.start.getFullYear());
        startYear.value = decadeStartYear - 1;
        endYear.value = decadeStartYear + 10;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: null,
        });
      } else if (!newValue.start && newValue.end) {
        if (
          props.mode !== 'month' &&
          props.mode !== 'quarters' &&
          !canSelectDate(newValue.end, props.minDateRef, props.maxDateRef, props.mode)
        ) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        if (props.mode === 'quarters') {
          const getEndQuarterStringFromDateObj = extractQuarterFromDate(newValue.end);
          const [endQrYear, endQuarter] = getEndQuarterStringFromDateObj.split('-');
          const normalizeEndQuarter = endQuarter.split('Q');

          const constructedEndQuarterObj = {
            year: Number(endQrYear),
            quarter: normalizeEndQuarter[1],
          };

          if (!isQuarterValid(constructedEndQuarterObj, props.minDateRef, props.maxDateRef)) {
            clearSelectedValues();
            emits('update:modelValue', null);
            return;
          }

          const decadeStartYear = findDecadeStartYear(constructedEndQuarterObj.year);
          startQuarterYear.value = decadeStartYear;
          endQuarterYear.value = decadeStartYear + 9;
        }

        if (!props.menuState) {
          currentDate.value = newValue.end;
        } else {
          updateCurrentDateIfNotInMonthsList(newValue.end);
        }

        selectedStartDate.value = null;
        selectedStartDay.value = null;
        selectedStartMonth.value = null;
        selectedStartYear.value = null;

        selectedEndDate.value = newValue.end;
        selectedEndDay.value = newValue.end.getDate();
        selectedEndMonth.value = newValue.end.getMonth();
        selectedEndYear.value = newValue.end.getFullYear();

        const decadeStartYear = findDecadeStartYear(newValue.end.getFullYear());
        startYear.value = decadeStartYear - 1;
        endYear.value = decadeStartYear + 10;

        emits('update:modelValue', {
          start: null,
          end: selectedEndDate.value,
        });
      }
    }

    // Initialize the visible hours, minutes and seconds
    updateVisibleHours();
    updateVisibleMinutes();
    updateVisibleSeconds();
  },
  { immediate: true }
);
</script>

<template>
  <div
    ref="containerRef"
    class="lx-calendar-container"
    tabindex="-1"
    @focusout="handleFocusOut"
    @keydown.esc.prevent="handleClose"
  >
    <div
      class="lx-calendar-header"
      v-if="
        (mode !== 'month' && !isMobileScreen) ||
        (mode !== 'time' && isMobileScreen && !mobileTimeLayout)
      "
    >
      <LxButton
        v-if="
          mode !== 'time' &&
          mode !== 'time-full' &&
          mode !== 'month' &&
          mode !== 'year' &&
          mode !== 'month-year' &&
          mode !== 'quarters'
        "
        customClass="lx-calendar-months-select-button"
        :label="monthsSelectButtonLabel"
        kind="ghost"
        :icon="monthsLayout ? 'chevron-up' : 'chevron-down'"
        :active="monthsLayout"
        :disabled="disabled"
        @click.stop.prevent="openMonthSelect"
      />

      <LxButton
        v-if="
          mode !== 'time' &&
          mode !== 'time-full' &&
          mode !== 'month' &&
          mode !== 'year' &&
          mode !== 'quarters'
        "
        customClass="lx-calendar-years-select-button"
        :label="yearsSelectButtonLabel"
        kind="ghost"
        :icon="yearsLayout ? 'chevron-up' : 'chevron-down'"
        :active="yearsLayout"
        :disabled="disabled"
        @click.stop.prevent="openYearSelect"
      />

      <div v-else class="lx-year-period-placeholder">
        {{ yearsPeriodPlaceholder }}
      </div>

      <LxButton
        customClass="lx-calendar-return-to-today-button"
        kind="ghost"
        icon="reset"
        variant="icon-only"
        :label="displayTexts.todayButton"
        :disabled="disabled || outsideOfToday || onToday"
        @click.stop.prevent="returnToToday"
      />
    </div>

    <div class="lx-calendar-main">
      <div
        v-if="isCalendarRootAvailable"
        class="lx-calendar-layouts-wrapper"
        :class="[
          {
            'date-only':
              pickerType === 'single' &&
              mode === 'date' &&
              !isMobileScreen &&
              (variant === 'default' || variant === 'picker'),
            'lx-quarters': mode === 'quarters',
            'mobile-quarters': mode === 'quarters' && isMobileScreen,
            'lx-full-layout':
              (mode === 'date' && variant === 'full') ||
              (mode === 'date' && variant === 'full-rows'),
            'lx-full-rows': mode === 'date' && variant === 'full-rows',
            'lx-full-columns':
              (pickerType === 'single' && mode === 'date' && variant === 'full-columns') ||
              (pickerType === 'range' &&
                !isMobileScreen &&
                mode !== 'month' &&
                mode !== 'year' &&
                mode !== 'quarters'),
            'mobile-date-time':
              (mode === 'date-time' || mode === 'date-time-full') && isMobileScreen,
            'date-time-only':
              (mode === 'date-time' || mode === 'date-time-full') &&
              isMobileScreen &&
              mobileTimeLayout,
            'months-only': mode === 'month' && !isMobileScreen,
            'range-month-year': pickerType === 'range' && mode === 'month-year' && !isMobileScreen,
          },
        ]"
      >
        <LxButton
          v-if="(isMobileScreen && !mobileTimeLayout) || (mode !== 'month' && !isMobileScreen)"
          customClass="lx-previous-slide-button"
          :label="previousSlideButtonLabel"
          kind="ghost"
          :icon="variant === 'full-rows' ? 'caret-up' : 'previous-page'"
          variant="icon-only"
          :disabled="!canSelectPrevious"
          @click.stop.prevent="selectPreviousSlide"
        />

        <div
          class="lx-calendar-layouts"
          :class="[
            {
              'lx-full-layout':
                (mode === 'date' && variant === 'full' && pickerType === 'single') ||
                (mode === 'date' && variant === 'full-columns' && pickerType === 'single') ||
                (pickerType === 'range' &&
                  !isMobileScreen &&
                  mode !== 'month' &&
                  mode !== 'year' &&
                  mode !== 'quarters'),
              'date-time-only': isMobileScreen && mobileTimeLayout,
              'range-month': pickerType === 'range' && mode === 'month' && !isMobileScreen,
              'range-year': pickerType === 'range' && mode === 'year' && !isMobileScreen,
            },
          ]"
          role="grid"
        >
          <template v-for="(monthsRows, monthsRowsIdx) in monthsList" :key="monthsRowsIdx">
            <div v-if="regularLayout" class="lx-calendar-regular-layout">
              <div
                v-for="(month, monthIdx) in monthsRows"
                :key="monthIdx"
                class="lx-calendar-regular-layout-month-wrapper"
              >
                <TransitionGroup :name="transitionName">
                  <div
                    :key="`${currentDate ? currentDate.getFullYear() : todayDate.getFullYear()}-${
                      currentDate ? currentDate.getMonth() : todayDate.getMonth()
                    }`"
                    class="lx-calendar-regular-layout-month"
                  >
                    <div
                      v-if="
                        (mode === 'date' && variant === 'full') ||
                        (mode === 'date' && variant === 'full-rows') ||
                        (mode === 'date' && variant === 'full-columns') ||
                        (pickerType === 'range' && !isMobileScreen)
                      "
                      class="lx-calendar-regular-layout-month-label"
                    >
                      {{ getMonthNameByOrder(localizedMonthsList, month.getMonth(), true) }}
                    </div>

                    <div class="lx-calendar-weekdays" role="row">
                      <span
                        v-for="(item, idx) in weekDaysList"
                        :key="idx"
                        class="lx-calendar-weekday"
                        role="columnheader"
                        :title="item.fullName"
                        :aria-label="item.fullName"
                      >
                        {{ item.narrowName }}
                      </span>
                    </div>

                    <div
                      class="lx-calendar-weeks"
                      :class="[
                        { 'first-month': monthsList.flat().indexOf(month) === 0 },
                        {
                          'last-month':
                            monthsList.flat().indexOf(month) === 3 && variant === 'full',
                        },
                        {
                          'last-month':
                            monthsList.flat().indexOf(month) === 1 &&
                            (variant === 'full-rows' ||
                              variant === 'full-columns' ||
                              pickerType === 'range'),
                        },
                        {
                          'last-month':
                            monthsList.flat().length === 1 &&
                            (variant === 'default' || variant === 'picker'),
                        },
                      ]"
                      role="rowgroup"
                    >
                      <div
                        v-for="(week, weekIndex) in getDaysInMonthGrid(month, firstDayOfTheWeek)"
                        :key="weekIndex"
                        class="lx-calendar-week"
                        :class="[
                          { 'first-week': weekIndex === 0 },
                          {
                            'penultimate-week':
                              getDaysInMonthGrid(month, firstDayOfTheWeek).length - 2 === weekIndex,
                          },
                          {
                            'last-week':
                              getDaysInMonthGrid(month, firstDayOfTheWeek).length - 1 === weekIndex,
                          },
                        ]"
                        role="row"
                      >
                        <template v-for="(date, dayIndex) in week" :key="dayIndex">
                          <div
                            class="lx-calendar-day-wrapper"
                            :class="[
                              {
                                'hovering-range':
                                  (isHoveringRange(date) || isSelectedDateRange(date)) &&
                                  isSameMonth(date, month),
                              },
                              {
                                'start-day':
                                  date.getDate() === selectedStartDay &&
                                  date.getMonth() === selectedStartDate.getMonth() &&
                                  date.getFullYear() === selectedStartDate.getFullYear(),
                              },
                              {
                                'end-day':
                                  date.getDate() === selectedEndDay &&
                                  date.getMonth() === selectedEndDate.getMonth() &&
                                  date.getFullYear() === selectedEndDate.getFullYear(),
                              },
                            ]"
                            role="cell"
                          >
                            <LxInfoWrapper
                              :disabled="
                                !hasSpecialDates(date, specialDatesAttributes) ||
                                (!isSameMonth(date, month) &&
                                  !canSelectDate(date, minDateRef, maxDateRef, 'date')) ||
                                pickerType === 'range'
                              "
                              :arrow="true"
                              :focusable="false"
                            >
                              <!-- There are cases in which the button must not be focusable. For instance, when the date is out of the min/max range.-->
                              <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -->
                              <div
                                class="lx-calendar-day"
                                :class="[
                                  { 'lx-other-month': !isSameMonth(date, month) },
                                  {
                                    'lx-today':
                                      date.getDate() === todayDate.getDate() &&
                                      date.getMonth() === todayDate.getMonth() &&
                                      date.getFullYear() === todayDate.getFullYear(),
                                  },
                                  {
                                    'lx-selected-day':
                                      date.getDate() === selectedDay &&
                                      date.getMonth() === selectedDate.getMonth() &&
                                      date.getFullYear() === selectedDate.getFullYear(),
                                  },
                                  {
                                    'lx-selected-start-day':
                                      date.getDate() === selectedStartDay &&
                                      date.getMonth() === selectedStartDate.getMonth() &&
                                      date.getFullYear() === selectedStartDate.getFullYear(),
                                  },
                                  {
                                    'lx-selected-end-day':
                                      date.getDate() === selectedEndDay &&
                                      date.getMonth() === selectedEndDate.getMonth() &&
                                      date.getFullYear() === selectedEndDate.getFullYear(),
                                  },
                                  {
                                    'lx-disabled-date':
                                      !canSelectDate(date, minDateRef, maxDateRef, 'date') ||
                                      disabled,
                                  },
                                  {
                                    'hovering-range':
                                      isHoveringRange(date) || isSelectedDateRange(date),
                                  },
                                ]"
                                :aria-current="
                                  date.getDate() === todayDate.getDate() &&
                                  date.getMonth() === todayDate.getMonth() &&
                                  date.getFullYear() === todayDate.getFullYear()
                                    ? 'date'
                                    : null
                                "
                                role="button"
                                :tabindex="
                                  getDayTabIndex(
                                    date,
                                    month,
                                    weekIndex,
                                    firstDayOfTheWeek,
                                    monthsList,
                                    variant,
                                    pickerType,
                                    minDateRef,
                                    maxDateRef
                                  )
                                "
                                @click.stop.prevent="
                                  handleSelections(
                                    date,
                                    'date',
                                    !canSelectDate(date, minDateRef, maxDateRef, 'date')
                                  )
                                "
                                @keyup.enter.prevent="
                                  handleSelections(
                                    date,
                                    'date',
                                    !canSelectDate(date, minDateRef, maxDateRef, 'date')
                                  )
                                "
                                @focusin="hoverDate(date)"
                                @mouseover="hoverDate(date)"
                              >
                                <div
                                  class="lx-calendar-day-content"
                                  :aria-label="
                                    !hasSpecialDates(date, specialDatesAttributes)
                                      ? formatLocalizedDate(props.locale, date)
                                      : undefined
                                  "
                                >
                                  {{ date.getDate() }}
                                </div>

                                <div class="lx-calendar-day-layer">
                                  <div class="lx-day-layer-bars">
                                    <template
                                      v-for="(attr, attrIndex) in specialDatesAttributes"
                                      :key="attrIndex"
                                    >
                                      <span
                                        v-if="checkForSpecialDate(date, attr.dates)"
                                        class="lx-day-layer-bar"
                                        :class="['bar-' + attr.barColor]"
                                      ></span>
                                    </template>
                                  </div>
                                </div>
                              </div>

                              <template #panel v-if="hasSpecialDates(date, specialDatesAttributes)">
                                <div class="lx-day-layer-popper-layout">
                                  <span class="lx-day-layer-popper-header">
                                    {{ formatLocalizedDate(props.locale, date) }}
                                  </span>

                                  <div class="lx-day-layer-popper-main">
                                    <ul class="lx-list">
                                      <template
                                        v-for="(attr, attrIndex) in specialDatesAttributes"
                                        :key="attrIndex"
                                      >
                                        <li v-if="checkForSpecialDate(date, attr.dates)">
                                          <span
                                            class="lx-day-layer-popper-bar"
                                            :class="['bar-' + attr.barColor]"
                                          ></span>

                                          <div class="lx-row">
                                            <p class="lx-data">{{ attr.popoverLabel }}</p>
                                          </div>
                                        </li>
                                      </template>
                                    </ul>
                                  </div>
                                </div>
                              </template>
                            </LxInfoWrapper>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </template>

          <div v-if="monthsLayout" class="lx-calendar-months">
            <div class="lx-calendar-months-wrapper">
              <TransitionGroup :name="transitionName">
                <div
                  class="lx-calendar-months"
                  :class="[
                    {
                      'month-year': mode === 'month-year',
                    },
                  ]"
                  :key="currentDate ? currentDate.getFullYear() : todayDate.getFullYear()"
                  role="rowgroup"
                >
                  <div
                    v-for="(monthsList, yearIndex) in monthsInYear"
                    :key="yearIndex"
                    class="lx-calendar-month-row-wrapper"
                  >
                    <div
                      v-if="pickerType === 'range' && mode === 'month-year' && !isMobileScreen"
                      class="lx-calendar-month-layout-year-label"
                    >
                      {{
                        yearIndex === 0 ? currentDate.getFullYear() : currentDate.getFullYear() + 1
                      }}
                    </div>
                    <div
                      v-for="(months, monthsRowIndex) in monthsList"
                      :key="monthsRowIndex"
                      class="lx-calendar-month-row"
                      role="row"
                    >
                      <div
                        v-for="(month, monthIndex) in months"
                        :key="monthIndex"
                        class="lx-calendar-month-wrapper"
                        :class="[
                          {
                            'full-layout':
                              pickerType === 'single' && mode === 'date' && variant === 'full',
                          },
                          {
                            'hovering-range':
                              isHoveringMonthRange(month) || isSelectedMonthRange(month),
                          },
                          {
                            'start-month':
                              (month.orderIndex === selectedStartMonth &&
                                currentDate.getFullYear() === Number(selectedStartYear) &&
                                mode === 'date') ||
                              (month.orderIndex === selectedStartMonth && mode === 'month') ||
                              (month.orderIndex === selectedStartMonth &&
                                month.year === Number(selectedStartYear) &&
                                mode === 'month-year'),
                          },
                          {
                            'end-month':
                              (month.orderIndex === selectedEndMonth &&
                                currentDate.getFullYear() === Number(selectedEndYear) &&
                                mode === 'date') ||
                              (month.orderIndex === selectedEndMonth && mode === 'month') ||
                              (month.orderIndex === selectedEndMonth &&
                                month.year === Number(selectedEndYear) &&
                                mode === 'month-year'),
                          },
                        ]"
                      >
                        <div
                          class="lx-calendar-month"
                          :class="[
                            {
                              'lx-today':
                                month.orderIndex === todayDate.getMonth() &&
                                month.year === todayDate.getFullYear(),
                            },
                            {
                              'lx-selected-month':
                                (month.orderIndex === selectedMonth &&
                                  month.year === selectedYear &&
                                  pickerType === 'single') ||
                                (month.orderIndex === selectedMonth &&
                                  mode === 'month' &&
                                  pickerType === 'single'),
                            },
                            {
                              'lx-selected-start-month':
                                (month.orderIndex === selectedStartMonth &&
                                  currentDate.getFullYear() === Number(selectedStartYear) &&
                                  mode === 'date') ||
                                (month.orderIndex === selectedStartMonth && mode === 'month') ||
                                (month.orderIndex === selectedStartMonth &&
                                  month.year === Number(selectedStartYear) &&
                                  mode === 'month-year'),
                            },
                            {
                              'lx-selected-end-month':
                                (month.orderIndex === selectedEndMonth &&
                                  currentDate.getFullYear() === Number(selectedEndYear) &&
                                  mode === 'date') ||
                                (month.orderIndex === selectedEndMonth && mode === 'month') ||
                                (month.orderIndex === selectedEndMonth &&
                                  month.year === Number(selectedEndYear) &&
                                  mode === 'month-year'),
                            },
                            {
                              'lx-disabled-month':
                                (mode !== 'month' &&
                                  !canSelectDate(
                                    new Date(month.year, month.orderIndex, currentDate.getDate()),
                                    minDateRef,
                                    maxDateRef,
                                    'month-year'
                                  )) ||
                                disabled,
                            },
                            {
                              'lx-full-layout': mode === 'date' && variant === 'full',
                            },
                            {
                              'hovering-range':
                                isHoveringMonthRange(month) || isSelectedMonthRange(month),
                            },
                          ]"
                          :aria-label="`${capitalizeFirstLetter(month.fullName)}, ${month.year}`"
                          role="cell"
                          :tabindex="
                            mode !== 'month' &&
                            !canSelectDate(
                              new Date(month.year, month.orderIndex, currentDate.getDate()),
                              minDateRef,
                              maxDateRef,
                              'month-year'
                            )
                              ? '-1'
                              : '0'
                          "
                          @click.stop.prevent="
                            handleSelections(
                              month,
                              'month',
                              mode !== 'month' &&
                                !canSelectDate(
                                  new Date(month.year, month.orderIndex, currentDate.getDate()),
                                  minDateRef,
                                  maxDateRef,
                                  'month-year'
                                )
                            )
                          "
                          @keyup.enter.prevent="
                            handleSelections(
                              month,
                              'month',
                              mode !== 'month' &&
                                !canSelectDate(
                                  new Date(month.year, month.orderIndex, currentDate.getDate()),
                                  minDateRef,
                                  maxDateRef,
                                  'month-year'
                                )
                            )
                          "
                          @focusin="hoverDate(new Date(month.year, month.orderIndex, 1, 0, 0, 0))"
                          @mouseover="hoverDate(new Date(month.year, month.orderIndex, 1, 0, 0, 0))"
                        >
                          <span class="lx-calendar-month-content">
                            {{
                              capitalizeFirstLetter(
                                mode === 'date' && variant === 'full'
                                  ? month.fullName
                                  : month.shortName
                              )
                            }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <div v-if="yearsLayout" class="lx-calendar-years">
            <div class="lx-calendar-years-wrapper">
              <TransitionGroup :name="transitionName">
                <div class="lx-calendar-years" :key="startYear" role="rowgroup">
                  <div
                    v-for="(years, yearsRowIndex) in yearsList"
                    :key="yearsRowIndex"
                    class="lx-calendar-year-row"
                    role="row"
                  >
                    <div
                      v-for="(year, yearIndex) in years"
                      :key="yearIndex"
                      class="lx-calendar-year-wrapper"
                      :class="[
                        {
                          'hovering-range': isHoveringYearRange(year) || isSelectedYearRange(year),
                        },
                        {
                          'start-year': year === selectedStartYear,
                        },
                        {
                          'end-year': year === selectedEndYear,
                        },
                      ]"
                    >
                      <div
                        class="lx-calendar-year"
                        :class="[
                          { 'other-decade-year': isStartOrEndYear(year, startYear, endYear) },
                          {
                            'lx-today': todayDate.getFullYear() === year,
                          },
                          {
                            'lx-selected-year': selectedYear === year && pickerType === 'single',
                          },
                          {
                            'lx-selected-start-year': year === selectedStartYear,
                          },
                          {
                            'lx-selected-end-year': year === selectedEndYear,
                          },
                          {
                            'lx-disabled-year':
                              !canSelectDate(
                                new Date(
                                  year,
                                  selectedMonth !== null && selectedMonth !== undefined
                                    ? selectedMonth
                                    : todayDate.getMonth(),
                                  1
                                ),
                                minDateRef,
                                maxDateRef,
                                'year'
                              ) || disabled,
                          },
                          {
                            'hovering-range':
                              isHoveringYearRange(year) || isSelectedYearRange(year),
                          },
                        ]"
                        :aria-label="year"
                        role="cell"
                        :tabindex="
                          canSelectDate(
                            new Date(year, todayDate.getMonth(), todayDate.getDate()),
                            minDateRef,
                            maxDateRef,
                            'year'
                          )
                            ? '0'
                            : '-1'
                        "
                        @click.stop.prevent="
                          handleSelections(
                            year,
                            'year',
                            !canSelectDate(
                              new Date(year, todayDate.getMonth(), todayDate.getDate()),
                              minDateRef,
                              maxDateRef,
                              'year'
                            )
                          )
                        "
                        @keyup.enter.prevent="
                          handleSelections(
                            year,
                            'year',
                            !canSelectDate(
                              new Date(year, todayDate.getMonth(), todayDate.getDate()),
                              minDateRef,
                              maxDateRef,
                              'year'
                            )
                          )
                        "
                        @focusin="hoverDate(new Date(year, 1, 1, 0, 0, 0))"
                        @mouseover="hoverDate(new Date(year, 1, 1, 0, 0, 0))"
                      >
                        <span class="lx-calendar-month-content">
                          {{ year }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <div v-if="quartersLayout" class="lx-calendar-quarters-wrapper">
            <TransitionGroup :name="transitionName">
              <div class="lx-calendar-quarters" :key="startQuarterYear" role="rowgroup">
                <div
                  v-for="(quarter, quartersRowIndex) in quartersList"
                  :key="quartersRowIndex"
                  class="lx-calendar-quarter-row"
                  role="row"
                >
                  <div class="lx-calendar-quarter-wrapper">
                    <div class="lx-calendar-quarter-label">
                      {{ quarter.year }}
                    </div>
                    <div
                      v-for="(quarterItem, listItemIndex) in quarter.items"
                      :key="listItemIndex"
                      class="lx-calendar-quarter-inner-wrapper"
                      :class="[
                        {
                          'hovering-range':
                            isHoveringRange(dateFromYearAndQuarter(quarter.year, quarterItem)) ||
                            isSelectedQuarterRange(quarter.year, Number(quarterItem)),
                        },
                        {
                          'start-quarter':
                            Number(quarterItem) === quarterFromMonth(selectedStartMonth) &&
                            quarter.year === Number(selectedStartYear),
                        },
                        {
                          'end-quarter':
                            Number(quarterItem) === quarterFromMonth(selectedEndMonth) &&
                            quarter.year === Number(selectedEndYear),
                        },
                      ]"
                    >
                      <div
                        class="lx-calendar-quarter"
                        :class="[
                          {
                            'lx-today':
                              quarterFromMonth(todayDate.getMonth()) === Number(quarterItem) &&
                              todayDate.getFullYear() === quarter.year,
                          },
                          {
                            'lx-selected-quarter':
                              selectedQuarter === quarterItem && selectedYear === quarter.year,
                          },
                          {
                            'lx-selected-start-quarter':
                              Number(quarterItem) === quarterFromMonth(selectedStartMonth) &&
                              quarter.year === Number(selectedStartYear),
                          },
                          {
                            'lx-selected-end-quarter':
                              Number(quarterItem) === quarterFromMonth(selectedEndMonth) &&
                              quarter.year === Number(selectedEndYear),
                          },
                          {
                            'lx-disabled-quarter': !isQuarterValid(
                              {
                                year: quarter.year,
                                quarter: quarterItem,
                              },
                              minDateRef,
                              maxDateRef
                            ),
                          },
                          {
                            'hovering-range':
                              isHoveringRange(dateFromYearAndQuarter(quarter.year, quarterItem)) ||
                              isSelectedQuarterRange(quarter.year, Number(quarterItem)),
                          },
                        ]"
                        :aria-label="quarterItem"
                        role="cell"
                        tabindex="0"
                        @click.stop.prevent="
                          handleSelections(
                            {
                              year: quarter.year,
                              quarter: quarterItem,
                            },
                            'quarter',
                            !isQuarterValid(
                              {
                                year: quarter.year,
                                quarter: quarterItem,
                              },
                              minDateRef,
                              maxDateRef
                            )
                          )
                        "
                        @keyup.enter.prevent="
                          handleSelections(
                            {
                              year: quarter.year,
                              quarter: quarterItem,
                            },
                            'quarter',
                            !isQuarterValid(
                              {
                                year: quarter.year,
                                quarter: quarterItem,
                              },
                              minDateRef,
                              maxDateRef
                            )
                          )
                        "
                        @focusin="hoverDate(dateFromYearAndQuarter(quarter.year, quarterItem))"
                        @mouseover="hoverDate(dateFromYearAndQuarter(quarter.year, quarterItem))"
                      >
                        {{ `Q${quarterItem}` }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <LxButton
          v-if="(isMobileScreen && !mobileTimeLayout) || (mode !== 'month' && !isMobileScreen)"
          customClass="lx-next-slide-button"
          :label="nextSlideButtonLabel"
          kind="ghost"
          :icon="variant === 'full-rows' ? 'caret-down' : 'next-page'"
          variant="icon-only"
          :disabled="!canSelectNext"
          @click.stop.prevent="selectNextSlide"
        />
      </div>

      <div
        v-if="
          ((mode === 'time' ||
            mode === 'date-time' ||
            mode === 'time-full' ||
            mode === 'date-time-full') &&
            !isMobileScreen) ||
          ((mode === 'time' || mode === 'time-full') && isMobileScreen) ||
          ((mode === 'date-time' || mode === 'date-time-full') &&
            isMobileScreen &&
            mobileTimeLayout)
        "
        class="lx-calendar-time-picker"
        :class="[
          {
            'date-time-only': mode === 'time' || mode === 'time-full',
          },
        ]"
      >
        <!-- Hours -->
        <div class="lx-time-picker-time-list-wrapper">
          <LxButton
            kind="ghost"
            icon="caret-up"
            variant="icon-only"
            :disabled="disabled"
            :label="displayTexts.scrollUp"
            @click.stop.prevent="onScrollClick(-1, 'hours')"
          />

          <div
            class="time-picker-wrapper"
            :class="[
              {
                'date-time-only':
                  (mode === 'date-time' && isMobileScreen && mobileTimeLayout) ||
                  (mode === 'time' && isMobileScreen),
              },
            ]"
          >
            <TransitionGroup
              tag="div"
              class="lx-time-picker-time-list"
              :class="[
                {
                  'date-time-only': mode === 'date-time' && isMobileScreen && mobileTimeLayout,
                },
              ]"
              @wheel.prevent="onScrollWheel($event, 'hours')"
            >
              <div
                v-for="(hour, index) in visibleHours"
                :key="hour.orderIndex"
                class="lx-time-list-item"
                :class="[
                  {
                    'is-active':
                      index >= 3 &&
                      index <= (isMobileScreen ? 11 : 9) &&
                      Number(hour.value) === selectedHour,
                  },
                  {
                    'lx-disabled-time-unit':
                      !canSelectTime(
                        hour.value,
                        minDateRef,
                        maxDateRef,
                        selectedDay,
                        selectedMonth,
                        selectedYear,
                        'hour',
                        selectedHour,
                        selectedMinute,
                        selectedSecond,
                        mode === 'time' || mode === 'time-full'
                      ) || disabled,
                  },
                ]"
                :tabindex="
                  index >= 3 &&
                  index <= (isMobileScreen ? 11 : 9) &&
                  canSelectTime(
                    hour.value,
                    minDateRef,
                    maxDateRef,
                    selectedDay,
                    selectedMonth,
                    selectedYear,
                    'hour',
                    selectedHour,
                    selectedMinute,
                    selectedSecond,
                    mode === 'time' || mode === 'time-full'
                  )
                    ? '0'
                    : '-1'
                "
                @click.stop.prevent="
                  selectHour(
                    hour,
                    !canSelectTime(
                      hour.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      selectedMonth,
                      selectedYear,
                      'hour',
                      selectedHour,
                      selectedMinute,
                      selectedSecond,
                      mode === 'time' || mode === 'time-full'
                    )
                  )
                "
                @keyup.enter.stop.prevent="
                  selectHour(
                    hour,
                    !canSelectTime(
                      hour.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      selectedMonth,
                      selectedYear,
                      'hour',
                      selectedHour,
                      selectedMinute,
                      selectedSecond,
                      mode === 'time' || mode === 'time-full'
                    )
                  )
                "
              >
                {{ hour.value }}
              </div>
            </TransitionGroup>
          </div>

          <LxButton
            kind="ghost"
            icon="caret-down"
            variant="icon-only"
            :disabled="disabled"
            :label="displayTexts.scrollDown"
            @click.stop.prevent="onScrollClick(1, 'hours')"
          />
        </div>

        <span class="lx-time-lists-separator">:</span>

        <!-- Minutes -->
        <div class="lx-time-picker-time-list-wrapper">
          <LxButton
            kind="ghost"
            icon="caret-up"
            variant="icon-only"
            :disabled="disabled"
            :label="displayTexts.scrollUp"
            @click.stop.prevent="onScrollClick(-1, 'minutes')"
          />

          <div
            class="time-picker-wrapper"
            :class="[
              {
                'date-time-only':
                  (mode === 'date-time' && isMobileScreen && mobileTimeLayout) ||
                  (mode === 'time' && isMobileScreen),
              },
            ]"
          >
            <TransitionGroup
              tag="div"
              class="lx-time-picker-time-list"
              @wheel.prevent="onScrollWheel($event, 'minutes')"
            >
              <div
                v-for="(minute, index) in visibleMinutes"
                :key="minute.id"
                class="lx-time-list-item"
                :class="[
                  {
                    'is-active':
                      index >= 3 &&
                      index <= (isMobileScreen ? 11 : 9) &&
                      minute.orderIndex === selectedMinute &&
                      minute.id === selectedMinuteId,
                  },
                  {
                    'lx-disabled-time-unit':
                      !canSelectTime(
                        minute.value,
                        minDateRef,
                        maxDateRef,
                        selectedDay,
                        selectedMonth,
                        selectedYear,
                        'minute',
                        selectedHour,
                        selectedMinute,
                        selectedSecond,
                        mode === 'time' || mode === 'time-full'
                      ) || disabled,
                  },
                ]"
                :tabindex="
                  index >= 3 &&
                  index <= (isMobileScreen ? 11 : 9) &&
                  canSelectTime(
                    minute.value,
                    minDateRef,
                    maxDateRef,
                    selectedDay,
                    selectedMonth,
                    selectedYear,
                    'minute',
                    selectedHour,
                    selectedMinute,
                    selectedSecond,
                    mode === 'time' || mode === 'time-full'
                  )
                    ? '0'
                    : '-1'
                "
                @click.stop.prevent="
                  selectMinute(
                    minute,
                    !canSelectTime(
                      minute.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      selectedMonth,
                      selectedYear,
                      'minute',
                      selectedHour,
                      selectedMinute,
                      selectedSecond,
                      mode === 'time' || mode === 'time-full'
                    )
                  )
                "
                @keyup.enter.stop.prevent="
                  selectMinute(
                    minute,
                    !canSelectTime(
                      minute.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      selectedMonth,
                      selectedYear,
                      'minute',
                      selectedHour,
                      selectedMinute,
                      selectedSecond,
                      mode === 'time' || mode === 'time-full'
                    )
                  )
                "
              >
                {{ minute.value }}
              </div>
            </TransitionGroup>
          </div>

          <LxButton
            kind="ghost"
            icon="caret-down"
            variant="icon-only"
            :disabled="disabled"
            :label="displayTexts.scrollDown"
            @click.stop.prevent="onScrollClick(1, 'minutes')"
          />
        </div>

        <span
          v-if="mode === 'time-full' || mode === 'date-time-full'"
          class="lx-time-lists-separator"
          >:</span
        >

        <!-- Seconds -->
        <div
          v-if="mode === 'time-full' || mode === 'date-time-full'"
          class="lx-time-picker-time-list-wrapper"
        >
          <LxButton
            kind="ghost"
            icon="caret-up"
            variant="icon-only"
            :disabled="disabled"
            :label="displayTexts.scrollUp"
            @click.stop.prevent="onScrollClick(-1, 'seconds')"
          />

          <div
            class="time-picker-wrapper"
            :class="[
              {
                'date-time-only':
                  (mode === 'date-time-full' && isMobileScreen && mobileTimeLayout) ||
                  (mode === 'time-full' && isMobileScreen),
              },
            ]"
          >
            <TransitionGroup
              tag="div"
              class="lx-time-picker-time-list"
              @wheel.prevent="onScrollWheel($event, 'seconds')"
            >
              <div
                v-for="(second, index) in visibleSeconds"
                :key="second.id"
                class="lx-time-list-item"
                :class="[
                  {
                    'is-active':
                      index >= 3 &&
                      index <= (isMobileScreen ? 11 : 9) &&
                      second.orderIndex === selectedSecond &&
                      second.id === selectedSecondId,
                  },
                  {
                    'lx-disabled-time-unit':
                      !canSelectTime(
                        second.value,
                        minDateRef,
                        maxDateRef,
                        selectedDay,
                        selectedMonth,
                        selectedYear,
                        'second',
                        selectedHour,
                        selectedMinute,
                        selectedSecond,
                        mode === 'time-full'
                      ) || disabled,
                  },
                ]"
                :tabindex="
                  index >= 3 &&
                  index <= (isMobileScreen ? 11 : 9) &&
                  canSelectTime(
                    second.value,
                    minDateRef,
                    maxDateRef,
                    selectedDay,
                    selectedMonth,
                    selectedYear,
                    'second',
                    selectedHour,
                    selectedMinute,
                    selectedSecond,
                    mode === 'time-full'
                  )
                    ? '0'
                    : '-1'
                "
                @click.stop.prevent="
                  selectSecond(
                    second,
                    !canSelectTime(
                      second.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      selectedMonth,
                      selectedYear,
                      'second',
                      selectedHour,
                      selectedMinute,
                      selectedSecond,
                      mode === 'time-full'
                    )
                  )
                "
                @keyup.enter.stop.prevent="
                  selectSecond(
                    second,
                    !canSelectTime(
                      second.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      selectedMonth,
                      selectedYear,
                      'second',
                      selectedHour,
                      selectedMinute,
                      selectedSecond,
                      mode === 'time-full'
                    )
                  )
                "
              >
                {{ second.value }}
              </div>
            </TransitionGroup>
          </div>

          <LxButton
            kind="ghost"
            icon="caret-down"
            variant="icon-only"
            :disabled="disabled"
            :label="displayTexts.scrollDown"
            @click.stop.prevent="onScrollClick(1, 'seconds')"
          />
        </div>
      </div>
    </div>

    <div
      v-if="(mode === 'date-time' || mode === 'date-time-full') && isMobileScreen"
      class="lx-mobile-time-selection-button-wrapper"
    >
      <LxButton
        customClass="lx-mobile-time-selection-button"
        :label="timeSelectButtonLabel"
        kind="ghost"
        :icon="mobileTimeLayout ? 'chevron-up' : 'chevron-down'"
        :active="mobileTimeLayout"
        :disabled="disabled"
        @click.stop.prevent="openMobileTimeSelect"
      />
    </div>

    <div
      class="lx-calendar-footer"
      :class="[
        {
          'range-buttons': pickerType === 'range',
          'range-buttons-icon':
            pickerType === 'range' && mode !== 'month' && mode !== 'year' && mode !== 'quarters',
          'text-unavailable': pickerType === 'range' && !displayTexts.doNotIndicateStart,
        },
      ]"
    >
      <LxButton
        v-if="pickerType === 'range'"
        custom-class="min-date-button"
        :label="displayTexts.doNotIndicateStart"
        kind="ghost"
        icon="min-date"
        :variant="
          mode === 'month' ||
          mode === 'year' ||
          mode === 'quarters' ||
          isMobileScreen ||
          !displayTexts.doNotIndicateStart
            ? 'icon-only'
            : 'default'
        "
        :disabled="doNotIndicateStartDisableState"
        @click.stop.prevent="handleDoNotIndicateStart"
      />

      <LxButton
        :title="displayTexts.clearButton"
        :label="displayTexts.clear"
        kind="ghost"
        icon="clear"
        :variant="
          (mode === 'time' && !isMobileScreen) || (pickerType === 'range' && isMobileScreen)
            ? 'icon-only'
            : 'default'
        "
        :disabled="clearButtonDisableState"
        @click.stop.prevent="clearSelectedValues"
      />

      <LxButton
        v-if="pickerType === 'range'"
        custom-class="max-date-button"
        :label="displayTexts.doNotIndicateEnd"
        kind="ghost"
        icon="max-date"
        :variant="
          mode === 'month' || mode === 'year' || mode === 'quarters' || isMobileScreen
            ? 'icon-only'
            : 'default'
        "
        :disabled="doNotIndicateEndDisableState"
        @click.stop.prevent="handleDoNotIndicateEnd"
      />
    </div>
  </div>
</template>
