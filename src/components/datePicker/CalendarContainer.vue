<script setup>
import { ref, computed, watch } from 'vue';
import { subYears, addYears, subMonths, addMonths, isSameDay } from 'date-fns';
import { useWindowSize, onClickOutside } from '@vueuse/core';

import { formatLocalizedDate } from '@/utils/dateUtils';
import { capitalizeFirstLetter, generateUUID } from '@/utils/stringUtils';
import {
  getTimeOrderIndex,
  getMonthNameByOrder,
  canSelectDate,
  canSelectTime,
  isSameMonth,
  getSurroundingHours,
  getSurroundingMinutes,
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
} from '@/components/datePicker/helpers';

import LxButton from '@/components/Button.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [String, Date, Object], default: null },
  mode: { type: String, default: 'date' }, // 'date', 'time', 'date-time', 'month', 'year', 'month-year', 'quarters'
  variant: { type: String, default: 'default' }, // 'default', 'picker', 'full', 'full-rows', 'full-columns'
  disabled: { type: Boolean, default: false },
  locale: { type: String, default: 'lv-LV' },
  specialDatesAttributes: { type: Array, default: null },
  firstDayOfTheWeek: { type: Number, default: 1 },
  localizedMonthsList: { type: Array, default: () => [] },
  weekDaysList: { type: Array, default: () => [] },
  minDateRef: { type: [String, Date], default: null },
  maxDateRef: { type: [String, Date], default: null },
  closeMenu: { type: Function, default: () => {} },
  openMenu: { type: Function, default: () => {} },
  menuState: { type: Boolean, default: false },
  cadenceOfMinutes: { type: Number, default: 1 }, // 1, 5, 15
  clearIfNotExact: { type: Boolean, default: false },
  pickerType: { type: String, default: 'single' }, // 'single', 'range'
  activeInput: { type: String, default: 'startInput' }, // 'startInput', 'endInput'
  setActiveInput: { type: Function, default: () => {} },
  texts: {
    type: Object,
    default: () => ({
      clear: 'Attīrīt',
      clearButton: 'Attīrīt vērtību',
      todayButton: 'Šodiena',
      clearStart: 'Notīrīt sākuma vērtību',
      clearEnd: 'Notīrīt beigu vērtību',
      next: 'Nākošais',
      previous: 'Iepriekšējais',
      doNotIndicateStart: 'Nenorādīt sākumu',
      doNotIndicateEnd: 'Nenorādīt beigas',
    }),
  },
});

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

// Hours and minutes arrays
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

// State to store the currently visible hours and minutes
const visibleHours = ref([]);
const visibleMinutes = ref([]);
const selectedHour = ref(null);
const selectedMinute = ref(null);

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

    if (isMobileScreen.value && props.mode === 'date-time') {
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

const currentHourIndex = ref(getTimeOrderIndex(hours.value, todayDate.value.getHours()));
const currentMinuteIndex = ref(
  getTimeOrderIndex(filteredMinutes.value, todayDate.value.getMinutes(), props.cadenceOfMinutes)
);
const selectedMinuteId = ref(null);
const selectedMinuteCenterId = ref(filteredMinutes.value[currentMinuteIndex.value]?.id);

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
  visibleMinutes.value = getSurroundingMinutes(
    filteredMinutes.value,
    selectedMinuteCenterId.value,
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

function resetStartDate() {
  selectedStartDate.value = null;
  selectedStartDay.value = null;
  selectedStartMonth.value = null;
  selectedStartYear.value = null;
}

function resetEndDate() {
  selectedEndDate.value = null;
  selectedEndDay.value = null;
  selectedEndMonth.value = null;
  selectedEndYear.value = null;
}

function handleRangeDifferentCaseValidation(date) {
  // If start and end date is not selected
  if (!selectedStartDate.value && !selectedEndDate.value) {
    if (props.activeInput === 'startInput') {
      setStartDate(date);
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: null,
      });

      props.setActiveInput('endInput', props.id);
      return;
    }

    if (props.activeInput === 'endInput') {
      setEndDate(date);
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: null,
        end: selectedEndDate.value,
      });

      props.setActiveInput('startInput', props.id);
      return;
    }
  }

  // If start date is selected, but end date is not
  if (selectedStartDate.value && !selectedEndDate.value) {
    if (props.activeInput === 'startInput') {
      setStartDate(date);
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: null,
      });

      props.setActiveInput('endInput', props.id);
      return;
    }

    if (props.activeInput === 'endInput') {
      // Ensure the end date is after the start date
      if (date >= selectedStartDate.value) {
        setEndDate(date);

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        hoveredDate.value = null;
        handleLayoutDisplay();
        props.setActiveInput('endInput', props.id);
        return;
      }

      setStartDate(date);
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: null,
      });

      props.setActiveInput('endInput', props.id);
      return;
    }
  }

  // If end date is selected, but start date is not
  if (!selectedStartDate.value && selectedEndDate.value) {
    if (props.activeInput === 'startInput') {
      // Ensure the start date is before the end date
      if (date > selectedEndDate.value) {
        setStartDate(date);
        resetEndDate();
        hoveredDate.value = date;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: null,
        });

        props.setActiveInput('endInput', props.id);
        return;
      }

      if (date < selectedEndDate.value) {
        setStartDate(date);

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        hoveredDate.value = null;
        props.setActiveInput('endInput', props.id);
        return;
      }
      if (isSameDay(date, selectedEndDate.value)) {
        setStartDate(date);

        emits('update:modelValue', {
          start: date,
          end: date,
        });

        hoveredDate.value = null;
        props.setActiveInput('endInput', props.id);
        return;
      }
    }

    if (props.activeInput === 'endInput') {
      setEndDate(date);
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: selectedEndDate.value,
      });

      handleLayoutDisplay();
      props.setActiveInput('startInput', props.id);
      return;
    }
  }

  // If start and end date is selected
  if (selectedStartDate.value && selectedEndDate.value) {
    if (props.activeInput === 'endInput' && date >= selectedStartDate.value) {
      // If the new date is greater than or equal to the start date, update the end date
      setEndDate(date);

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: selectedEndDate.value,
      });

      hoveredDate.value = null;
      handleLayoutDisplay();

      if (!selectedStartDate.value) {
        props.setActiveInput('startInput', props.id);
      } else {
        props.setActiveInput('endInput', props.id);
      }
    }

    if (props.activeInput === 'startInput' && date <= selectedEndDate.value) {
      // If the new date is less than or equal to the end date, update the start date
      setStartDate(date);

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: selectedEndDate.value,
      });

      hoveredDate.value = null;
      handleLayoutDisplay();
      props.setActiveInput('endInput', props.id);
      return;
    }

    if (props.activeInput === 'startInput' && date > selectedEndDate.value) {
      // If the new date is greater than the end date, update the start date and reset end date
      setStartDate(date);
      resetEndDate();
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: null,
      });

      props.setActiveInput('endInput', props.id);
      return;
    }

    if (props.activeInput === 'endInput' && date < selectedStartDate.value) {
      // If the new date is less than the start date, update the start date and reset end date
      setStartDate(date);
      resetEndDate();
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: selectedStartDate.value,
        end: null,
      });

      props.setActiveInput('endInput', props.id);
      return;
    }

    if (props.activeInput === 'startInput' && date >= selectedStartDate.value) {
      // If the new date is greater than or equal to the start date, update the end date and reset start date
      setEndDate(date);
      resetStartDate();
      hoveredDate.value = date;

      emits('update:modelValue', {
        start: null,
        end: selectedEndDate.value,
      });

      props.setActiveInput('endInput', props.id);
    }
  }
}

function handleSingleSelection(selectedValue, selectionType, isNotSelectable = false) {
  if (props.disabled) return;
  if (isNotSelectable) return;
  selectedManually.value = true;

  // Declare new cloned date reference
  const newDate = new Date(currentDate.value);

  if (selectionType === 'month') {
    newDate.setDate(1);
    newDate.setMonth(selectedValue.orderIndex);

    currentDate.value = newDate;

    if (props.mode === 'month') {
      newDate.setMonth(selectedValue.orderIndex);
      selectedMonth.value = Number(selectedValue.orderIndex);

      emits('update:modelValue', newDate);
      // Handle layout display and close the menu
      handleLayoutDisplay();
      props.closeMenu();
      props.setActiveInput('startInput', props.id);
      return;
    }

    if (props.mode === 'month-year') {
      selectedMonth.value = Number(selectedValue.orderIndex);
      selectedYear.value = Number(selectedValue.year);

      if (selectedYear.value) {
        // Construct the updated date based on the variant condition
        const updatedDate = new Date(selectedYear.value, selectedMonth.value, 1);

        emits('update:modelValue', updatedDate);
        // Handle layout display and close the menu
        handleLayoutDisplay();
        props.closeMenu();
        props.setActiveInput('startInput', props.id);
        return;
      }

      monthsLayout.value = false;
      yearsLayout.value = true;
      return;
    }

    monthsLayout.value = false;
    regularLayout.value = true;
    props.setActiveInput(props.activeInput, props.id);
    return;
  }

  if (selectionType === 'year') {
    newDate.setFullYear(selectedValue);
    currentDate.value = newDate;

    if (selectedYear.value === startYear.value) {
      transitionName.value = computedPrevTransitionName.value;
    }
    if (selectedYear.value === endYear.value) {
      transitionName.value = computedNextTransitionName.value;
    }

    startYear.value = findDecadeStartYear(selectedValue) - 1;
    endYear.value = findDecadeStartYear(selectedValue) + 10;

    if (selectedYear.value === startYear.value) {
      transitionName.value = computedPrevTransitionName.value;
    }
    if (selectedYear.value === endYear.value) {
      transitionName.value = computedNextTransitionName.value;
    }

    startYear.value = findDecadeStartYear(selectedValue) - 1;
    endYear.value = findDecadeStartYear(selectedValue) + 10;

    if (props.mode === 'month') {
      yearsLayout.value = false;
      monthsLayout.value = true;
      return;
    }

    if (props.mode === 'year') {
      emits('update:modelValue', newDate);

      // Handle layout display and close the menu
      handleLayoutDisplay();
      props.closeMenu();
      props.setActiveInput('startInput', props.id);
      return;
    }

    if (props.mode === 'month-year') {
      selectedYear.value = Number(selectedValue);
      if (
        selectedMonth.value !== null &&
        !canSelectDate(
          new Date(selectedYear.value, selectedMonth.value, 1),
          props.minDateRef,
          props.maxDateRef,
          'month-year'
        )
      ) {
        selectedMonth.value = null;
        emits('update:modelValue', null);
      }
      if (selectedMonth.value !== null) {
        // Construct the updated date based on the variant condition
        const updatedDate = new Date(selectedYear.value, selectedMonth.value, 1);
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
    return;
  }

  if (selectionType === 'quarter') {
    // Set selectedQuarter from the selected value
    selectedQuarter.value = selectedValue?.quarter;
    // Set selectedYear from the selected value
    selectedYear.value = selectedValue?.year;

    // Construct the updated date based on the variant condition
    const updatedDate = dateFromYearAndQuarter(selectedValue?.year, selectedValue?.quarter);
    emits('update:modelValue', updatedDate);
    props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }

  if (selectionType === 'date') {
    // Set selected Day, Month, Year from the selected value
    selectedDay.value = selectedValue.getDate();
    selectedMonth.value = selectedValue.getMonth();
    selectedYear.value = selectedValue.getFullYear();

    // Construct the updated date based on the variant condition
    const updatedDate = new Date(
      selectedValue.getFullYear(),
      selectedValue.getMonth(),
      selectedValue.getDate()
    );
    selectedDate.value = updatedDate;

    if (props.mode === 'date') {
      // Get the last element of the flattened monthsList array
      const clonedArray = [...monthsList.value.flat()];
      const lastMonthInList = clonedArray[clonedArray.length - 1];

      // Check if the updatedDate exists in the flattened monthsList array
      const isDateInMonthList = clonedArray.some(
        (monthDate) => monthDate.getMonth() === updatedDate.getMonth()
      );

      // Check if the updatedDate is after the lastDateInMonthList
      if (!isDateInMonthList && updatedDate > lastMonthInList) {
        // Set currentDate to the updatedDate minus 3 months
        const threeMonthsBeforeDate = new Date(updatedDate);
        if (props.variant === 'full') {
          threeMonthsBeforeDate.setMonth(threeMonthsBeforeDate.getMonth() - 3);
        }
        if (props.variant === 'full-rows' || props.variant === 'full-columns') {
          threeMonthsBeforeDate.setMonth(threeMonthsBeforeDate.getMonth() - 1);
        }

        transitionName.value = computedNextTransitionName.value;
        currentDate.value = threeMonthsBeforeDate;
      }
      // If updatedDate is NOT in the monthsList, update currentDate.value
      else if (!isDateInMonthList) {
        transitionName.value = computedPrevTransitionName.value;
        currentDate.value = updatedDate;
      }

      // Emit the event with updated value
      emits('update:modelValue', updatedDate);

      // Handle layout display and close the menu
      handleLayoutDisplay();
      props.closeMenu();
      props.setActiveInput('startInput', props.id);
    }

    if (
      props.mode === 'date-time' &&
      selectedHour.value !== null &&
      selectedMinute.value === null &&
      !mobileTimeLayout.value
    ) {
      if (props.clearIfNotExact) {
        if (!selectedDay.value || selectedHour.value === null || selectedMinute.value === null) {
          clearSelectedValues();
        }
      }
      // Check and update hours based on min date
      if (
        props.minDateRef &&
        selectedValue.getDate() === props.minDateRef.getDate() &&
        !props.clearIfNotExact
      ) {
        if (selectedHour.value < props.minDateRef?.getHours()) {
          selectedHour.value = props.minDateRef?.getHours();
          currentHourIndex.value = getTimeOrderIndex(hours.value, selectedHour.value);
          updateVisibleHours();
        }
      }
      // Check and update hours based on max date
      if (
        props.maxDateRef &&
        selectedValue.getDate() === props.maxDateRef.getDate() &&
        !props.clearIfNotExact
      ) {
        if (selectedHour.value > props.maxDateRef?.getHours()) {
          selectedHour.value = props.maxDateRef?.getHours();
          currentHourIndex.value = getTimeOrderIndex(hours.value, selectedHour.value);
          updateVisibleHours();
        }
      }
    }

    if (
      props.mode === 'date-time' &&
      selectedHour.value === null &&
      selectedMinute.value !== null &&
      !mobileTimeLayout.value
    ) {
      if (props.clearIfNotExact) {
        if (!selectedDay.value || selectedHour.value === null || selectedMinute.value === null) {
          clearSelectedValues();
        }
      }
      // Check and update minutes based on min date
      if (
        props.minDateRef &&
        selectedValue.getDate() === props.minDateRef.getDate() &&
        !props.clearIfNotExact
      ) {
        if (selectedMinute.value < props.minDateRef?.getMinutes()) {
          selectedMinute.value = props.minDateRef?.getMinutes();
          const cadence = props.cadenceOfMinutes;
          const minutesValue = selectedMinute.value;
          let filteredIndex = -1;

          // Check if cadence is 5 and filteredMinutes length is 12
          if (cadence === 5 && filteredMinutes.value.length === 12) {
            filteredIndex = filteredMinutes.value.findIndex(
              (item) => Number(item.value) === minutesValue
            );
          }
          // Check if cadence is 15 and filteredMinutes length is 16
          else if (cadence === 15 && filteredMinutes.value.length === 16) {
            filteredIndex = filteredMinutes.value.findIndex(
              (item) => Number(item.value) === minutesValue
            );
          }

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
          updateVisibleMinutes();
        }
      }
      // Check and update minutes based on max date
      if (
        props.maxDateRef &&
        selectedValue.getDate() === props.maxDateRef.getDate() &&
        !props.clearIfNotExact
      ) {
        if (selectedMinute.value > props.maxDateRef?.getMinutes()) {
          selectedMinute.value = props.maxDateRef?.getMinutes();
          const cadence = props.cadenceOfMinutes;
          const minutesValue = selectedMinute.value;
          let filteredIndex = -1;

          // Check if cadence is 5 and filteredMinutes length is 12
          if (cadence === 5 && filteredMinutes.value.length === 12) {
            filteredIndex = filteredMinutes.value.findIndex(
              (item) => Number(item.value) === minutesValue
            );
          }
          // Check if cadence is 15 and filteredMinutes length is 16
          else if (cadence === 15 && filteredMinutes.value.length === 16) {
            filteredIndex = filteredMinutes.value.findIndex(
              (item) => Number(item.value) === minutesValue
            );
          }

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
          updateVisibleMinutes();
        }
      }
    }

    if (
      props.mode === 'date-time' &&
      selectedHour.value !== null &&
      selectedHour.value !== undefined &&
      selectedMinute.value !== null &&
      selectedMinute.value !== undefined &&
      !mobileTimeLayout.value
    ) {
      updatedDate.setHours(selectedHour.value);
      updatedDate.setMinutes(selectedMinute.value);

      // Check and update hours/minutes based on min date
      if (
        props.minDateRef &&
        selectedValue.getDate() === props.minDateRef.getDate() &&
        !props.clearIfNotExact
      ) {
        if (selectedHour.value < props.minDateRef?.getHours()) {
          updatedDate.setHours(props.minDateRef?.getHours());
        }
        if (selectedMinute.value < props.minDateRef?.getMinutes()) {
          updatedDate.setMinutes(props.minDateRef?.getMinutes());
        }
      }
      // Check and update hours/minutes based on max date
      if (
        props.maxDateRef &&
        selectedValue.getDate() === props.maxDateRef.getDate() &&
        !props.clearIfNotExact
      ) {
        if (selectedHour.value > props.maxDateRef?.getHours()) {
          updatedDate.setHours(props.maxDateRef?.getHours());
        }
        if (selectedMinute.value > props.maxDateRef?.getMinutes()) {
          updatedDate.setMinutes(props.maxDateRef?.getMinutes());
        }
      }

      // Update the selectedDate value and emit the event
      currentDate.value = updatedDate;
      emits('update:modelValue', updatedDate);

      // Handle layout display and close the menu
      handleLayoutDisplay();
      if (shouldCloseMenu.value) props.closeMenu();
      props.setActiveInput('startInput', props.id);
    }
  }
}

function handleRangeSelection(selectedValue, selectionType, isNotSelectable = false) {
  if (props.disabled) return;
  if (isNotSelectable) return;
  selectedManually.value = true;

  // Declare new cloned date reference
  const newDate = new Date(currentDate.value);

  if (selectionType === 'month') {
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
      return;
    }

    if (props.mode === 'month-year') {
      newDate.setDate(1);
      newDate.setMonth(selectedValue.orderIndex);
      newDate.setFullYear(selectedValue.year);
      newDate.setHours(0, 0, 0, 0);
      handleRangeDifferentCaseValidation(newDate);
      return;
    }

    monthsLayout.value = false;
    regularLayout.value = true;
    return;
  }

  if (selectionType === 'year') {
    newDate.setFullYear(selectedValue);
    if (props.mode === 'date' || props.mode === 'month-year') currentDate.value = newDate;

    // Set selectedYear from the selected value
    selectedYear.value = Number(selectedValue);

    if (props.mode === 'year') {
      newDate.setDate(1);
      newDate.setMonth(1);
      newDate.setHours(0, 0, 0, 0);
      handleRangeDifferentCaseValidation(newDate);
      return;
    }

    if (props.mode === 'month-year') {
      yearsLayout.value = false;
      monthsLayout.value = true;
      return;
    }

    yearsLayout.value = false;
    regularLayout.value = true;
    return;
  }

  if (selectionType === 'quarter') {
    const updatedDate = dateFromYearAndQuarter(selectedValue?.year, selectedValue?.quarter);
    // Set selectedYear from the selected value
    selectedYear.value = Number(selectedValue?.year);
    handleRangeDifferentCaseValidation(updatedDate);
    return;
  }

  if (selectionType === 'date') {
    handleRangeDifferentCaseValidation(selectedValue);
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

// Check if a month/month-year is in the hovering range
const isHoveringMonthRange = (month) => {
  if (selectedStartMonth.value !== null && selectedEndMonth.value === null && hoveredDate.value) {
    const startYr = selectedStartYear.value;
    const startMth = selectedStartMonth.value;
    const hoverYr = hoveredDate.value.getFullYear();
    const hoverMth = hoveredDate.value.getMonth();

    // Forward selection in the same year from start month to hovered month
    if (month.year === startYr && hoverYr === startYr && hoverMth >= startMth) {
      return month.orderIndex >= startMth && month.orderIndex <= hoverMth;
    }

    // Backward selection in the same year from start month to hovered month
    if (month.year === startYr && hoverYr === startYr && hoverMth < startMth) {
      return month.orderIndex <= startMth && month.orderIndex >= hoverMth;
    }

    // Forward selection across years (hovered date in a future year)
    if (hoverYr > startYr) {
      // Starting year: include months from the start month to the end of the year
      if (month.year === startYr) {
        return month.orderIndex >= startMth;
      }
      // Hovered year: include months from the beginning of the year to the hovered month
      if (month.year === hoverYr) {
        return month.orderIndex <= hoverMth;
      }
      // Intermediate years: include all months
      if (month.year > startYr && month.year < hoverYr) {
        return true;
      }
    }

    // Backward selection across years (hovered date in a previous year)
    if (hoverYr < startYr) {
      // Starting year: include months from the start month to the beginning of the year
      if (month.year === startYr) {
        return month.orderIndex <= startMth;
      }
      // Hovered year: include months from the hovered month to the end of the year
      if (month.year === hoverYr) {
        return month.orderIndex >= hoverMth;
      }
      // Intermediate years: include all months
      if (month.year < startYr && month.year > hoverYr) {
        return true;
      }
    }
  }

  // Case where only the end month is selected and we're hovering backwards
  if (selectedEndMonth.value !== null && selectedStartMonth.value === null && hoveredDate.value) {
    const endYr = selectedEndYear.value;
    const endMth = selectedEndMonth.value;
    const hoverYr = hoveredDate.value.getFullYear();
    const hoverMth = hoveredDate.value.getMonth();

    // Forward selection in the same year from start month to hovered month
    if (month.year === endYr && hoverYr === endYr && hoverMth >= endMth) {
      return month.orderIndex >= endMth && month.orderIndex <= hoverMth;
    }

    // Backward selection in the same year from start month to hovered month
    if (month.year === endYr && hoverYr === endYr && hoverMth < endMth) {
      return month.orderIndex <= endMth && month.orderIndex >= hoverMth;
    }

    // Forward selection across years (hovered date in a future year)
    if (hoverYr > endYr) {
      // Starting year: include months from the start month to the end of the year
      if (month.year === endYr) {
        return month.orderIndex >= endMth;
      }
      // Hovered year: include months from the beginning of the year to the hovered month
      if (month.year === hoverYr) {
        return month.orderIndex <= hoverMth;
      }
      // Intermediate years: include all months
      if (month.year > endYr && month.year < hoverYr) {
        return true;
      }
    }

    // Backward selection across years (hovered date in a previous year)
    if (hoverYr < endYr) {
      // Starting year: include months from the start month to the beginning of the year
      if (month.year === endYr) {
        return month.orderIndex <= endMth;
      }
      // Hovered year: include months from the hovered month to the end of the year
      if (month.year === hoverYr) {
        return month.orderIndex >= hoverMth;
      }
      // Intermediate years: include all months
      if (month.year < endYr && month.year > hoverYr) {
        return true;
      }
    }
  }

  // Return false if no conditions match
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

const isSelectedMonthRange = (month) => {
  // Check if only the start month and year are selected
  if (
    selectedStartMonth.value !== null &&
    selectedEndMonth.value === null &&
    !selectedManually.value
  ) {
    // When in the same start year, select months from start month onward
    if (month.year === selectedStartYear.value) {
      return month.orderIndex >= selectedStartMonth.value;
    }

    // Select all months in the years following the start year
    if (month.year > selectedStartYear.value) {
      return true;
    }
  }

  // Check if only the start month and year are selected
  if (
    selectedStartMonth.value === null &&
    selectedEndMonth.value !== null &&
    !selectedManually.value
  ) {
    // When in the same start year, select months from start month onward
    if (month.year === selectedEndYear.value) {
      return month.orderIndex <= selectedEndMonth.value;
    }

    // Select all months in the years following the start year
    if (month.year < selectedEndYear.value) {
      return true;
    }
  }

  // Check if both start and end month and year are selected
  if (selectedStartMonth.value !== null && selectedEndMonth.value !== null) {
    // When both start and end are in the same year
    if (selectedStartYear.value === selectedEndYear.value) {
      return (
        month.year === selectedStartYear.value &&
        month.orderIndex >= selectedStartMonth.value &&
        month.orderIndex <= selectedEndMonth.value
      );
    }

    // When start year is earlier than end year
    if (month.year === selectedStartYear.value) {
      return month.orderIndex >= selectedStartMonth.value; // Hovering in the start year
    }
    if (month.year === selectedEndYear.value) {
      return month.orderIndex <= selectedEndMonth.value; // Hovering in the end year
    }

    // For years between the start and end years
    if (month.year > selectedStartYear.value && month.year < selectedEndYear.value) {
      return true; // Hovering for all months in the intermediate years
    }
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

  updateVisibleHours();
  updateVisibleMinutes();

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
    props.mode === 'date-time' &&
    selectedYear.value &&
    selectedMonth.value !== null &&
    selectedMonth.value !== undefined &&
    selectedDay.value &&
    selectedMinute.value !== null &&
    selectedMinute.value !== undefined
  ) {
    // Construct the updated date based on the variant condition
    const updatedDate = new Date(
      selectedYear.value,
      selectedMonth.value,
      selectedDay.value,
      selectedHour.value,
      selectedMinute.value
    );

    // Update the selectedDate value and emit the event
    selectedDate.value = updatedDate;
    currentDate.value = updatedDate;
    emits('update:modelValue', updatedDate);

    if (isMobileScreen.value) return;

    // Handle layout display and close the menu
    handleLayoutDisplay();
    if (shouldCloseMenu.value) props.closeMenu();
    props.setActiveInput('startInput', props.id);
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
    props.mode === 'date-time' &&
    selectedYear.value &&
    selectedMonth.value !== null &&
    selectedMonth.value !== undefined &&
    selectedDay.value &&
    selectedHour.value !== null &&
    selectedHour.value !== undefined
  ) {
    // Construct the updated date based on the variant condition
    const updatedDate = new Date(
      selectedYear.value,
      selectedMonth.value,
      selectedDay.value,
      Number(selectedHour.value),
      Number(selectedMinute.value)
    );

    // Update the selectedDate value and emit the event
    selectedDate.value = updatedDate;
    currentDate.value = updatedDate;
    emits('update:modelValue', updatedDate);

    if (isMobileScreen.value) return;

    // Handle layout display and close the menu
    handleLayoutDisplay();
    if (shouldCloseMenu.value) props.closeMenu();
    props.setActiveInput('startInput', props.id);
  }
};

function moveCalendar(minDate, maxDate) {
  const now = new Date();
  // Check if both minDate and maxDate are in the future
  if (minDate > now && maxDate > now) {
    currentDate.value = new Date(minDate);
    startYear.value = minDate.getFullYear() - 5;
    endYear.value = minDate.getFullYear() + 6;
    return;
  }

  // Check if both minDate and maxDate are in the past
  if (minDate < now && maxDate < now) {
    currentDate.value = new Date(maxDate);
    startYear.value = maxDate.getFullYear() - 5;
    endYear.value = maxDate.getFullYear() + 6;
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

const doNotIndicateStartDisableState = computed(() => {
  if (props.disabled) return true;
  // Start date already selected as not set: disabled
  if (!selectedStartDate.value && !selectedManually.value) return true;
  if (!selectedStartDate.value && !selectedEndDate.value) return true;

  // Default case: enabled
  return false;
});

const clearButtonDisableState = computed(() => {
  if (props.disabled) return true;
  // Picker type is "single" and date is not selected: disabled
  if (props.pickerType === 'single') {
    if (
      props.mode !== 'quarters' &&
      !selectedDate.value &&
      selectedHour.value === null &&
      selectedMinute.value === null
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

const doNotIndicateEndDisableState = computed(() => {
  if (props.disabled) return true;
  // End date already selected as not set: disabled
  if (!selectedEndDate.value && !selectedManually.value) return true;
  if (!selectedStartDate.value && !selectedEndDate.value) return true;

  // Default case: enabled
  return false;
});

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

onClickOutside(containerRef, () => {
  if (props.pickerType === 'single' && props.variant !== 'default') {
    handleDateTimeSelection();
  }
  if (props.pickerType === 'range') {
    handleOutsideClickRangeSelection();
  }
});

watch(
  () => [selectedDate.value, selectedHour.value, selectedMinute.value],
  (_, [oldSelectDate, oldSelectHour, oldSelectMinute]) => {
    if (props.mode !== 'date-time') return;
    if (oldSelectDate && oldSelectHour && oldSelectMinute) {
      shouldCloseMenu.value = false;
    }
  }
);

watch(
  () => [props.minDateRef, props.maxDateRef],
  ([newMinDate, newMaxDate]) => {
    // Check if both dates are present
    if (newMinDate && newMaxDate) {
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

          // Check if cadence is 5 and filteredMinutes length is 12
          if (cadence === 5 && filteredMinutes.value.length === 12) {
            filteredIndex = filteredMinutes.value.findIndex(
              (item) => Number(item.value) === minutesValue
            );
          }
          // Check if cadence is 15 and filteredMinutes length is 16
          else if (cadence === 15 && filteredMinutes.value.length === 16) {
            filteredIndex = filteredMinutes.value.findIndex(
              (item) => Number(item.value) === minutesValue
            );
          }

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
    selectedMinuteCenterId.value = filteredMinutes.value[currentMinuteIndex.value]?.id;
    updateVisibleHours();
    updateVisibleMinutes();
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
    if ((newValue === null || newValue === undefined) && props.pickerType === 'single') {
      clearSelectedValues();
      emits('update:modelValue', null);
      return;
    }

    if (
      (newValue === null || newValue === undefined || (!newValue.start && !newValue.end)) &&
      props.pickerType === 'range'
    ) {
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

    if (props.pickerType === 'single' && newValue !== null && newValue !== undefined) {
      if (props.mode === 'date' || props.mode === 'date-time') {
        selectedDate.value = newValue;
        if (!selectedManually.value) currentDate.value = selectedDate.value;

        selectedDay.value = newValue.getDate();
        selectedMonth.value = newValue.getMonth();
        selectedYear.value = newValue.getFullYear();
        selectedHour.value = newValue.getHours();
        selectedMinute.value = newValue.getMinutes();
        currentHourIndex.value = getTimeOrderIndex(hours.value, newValue.getHours());

        const cadence = props.cadenceOfMinutes;
        const minutesValue = newValue.getMinutes();
        let filteredIndex = -1;

        // Check if cadence is 5 and filteredMinutes length is 12
        if (cadence === 5 && filteredMinutes.value.length === 12) {
          filteredIndex = filteredMinutes.value.findIndex(
            (item) => Number(item.value) === minutesValue
          );
        }
        // Check if cadence is 15 and filteredMinutes length is 16
        else if (cadence === 15 && filteredMinutes.value.length === 16) {
          filteredIndex = filteredMinutes.value.findIndex(
            (item) => Number(item.value) === minutesValue
          );
        }

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

        // Check if cadence is 5 and filteredMinutes length is 12
        if (cadence === 5 && filteredMinutes.value.length === 12) {
          filteredIndex = filteredMinutes.value.findIndex(
            (item) => Number(item.value) === minutesValue
          );
        }
        // Check if cadence is 15 and filteredMinutes length is 16
        else if (cadence === 15 && filteredMinutes.value.length === 16) {
          filteredIndex = filteredMinutes.value.findIndex(
            (item) => Number(item.value) === minutesValue
          );
        }

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

    // Initialize the visible hours and minutes
    updateVisibleHours();
    updateVisibleMinutes();
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
        v-if="mode !== 'time' && mode !== 'month' && mode !== 'year' && mode !== 'quarters'"
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
        :title="texts.todayButton"
        :disabled="disabled"
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
            'mobile-date-time': mode === 'date-time' && isMobileScreen,
            'date-time-only': mode === 'date-time' && isMobileScreen && mobileTimeLayout,
            'months-only': mode === 'month' && !isMobileScreen,
            'range-month-year': pickerType === 'range' && mode === 'month-year' && !isMobileScreen,
          },
        ]"
      >
        <LxButton
          v-if="(isMobileScreen && !mobileTimeLayout) || (mode !== 'month' && !isMobileScreen)"
          customClass="lx-previous-slide-button"
          :title="texts.previous"
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
                          <LxInfoWrapper
                            placement="auto"
                            :disabled="
                              !hasSpecialDates(date, specialDatesAttributes) ||
                              (!isSameMonth(date, month) &&
                                !canSelectDate(date, minDateRef, maxDateRef, 'date')) ||
                              pickerType === 'range'
                            "
                            :arrow="true"
                          >
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
                            >
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
                                role="cell"
                                :aria-label="formatLocalizedDate(props.locale, date)"
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
                                @keydown.enter.prevent="
                                  handleSelections(
                                    date,
                                    'date',
                                    !canSelectDate(date, minDateRef, maxDateRef, 'date')
                                  )
                                "
                                @focusin="hoverDate(date)"
                                @mouseover="hoverDate(date)"
                              >
                                <div class="lx-calendar-day-content">
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
                            </div>

                            <template #panel>
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
                          @keydown.enter.prevent="
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
                                  selectedMonth !== null ? selectedMonth : todayDate.getMonth(),
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
                        @keydown.enter.prevent="
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
                        @keydown.enter.prevent="
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
          :title="texts.next"
          kind="ghost"
          :icon="variant === 'full-rows' ? 'caret-down' : 'next-page'"
          variant="icon-only"
          :disabled="!canSelectNext"
          @click.stop.prevent="selectNextSlide"
        />
      </div>

      <div
        v-if="
          ((mode === 'time' || mode === 'date-time') && !isMobileScreen) ||
          (mode === 'time' && isMobileScreen) ||
          (mode === 'date-time' && isMobileScreen && mobileTimeLayout)
        "
        class="lx-calendar-time-picker"
        :class="[
          {
            'date-time-only': mode === 'time',
          },
        ]"
      >
        <div class="lx-time-picker-time-list-wrapper">
          <LxButton
            kind="ghost"
            icon="caret-up"
            variant="icon-only"
            :disabled="disabled"
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
                    'lx-disabled-hour':
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
                        mode === 'time'
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
                    mode === 'time'
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
                      mode === 'time'
                    )
                  )
                "
                @keydown.enter.stop.prevent="
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
                      mode === 'time'
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
            @click.stop.prevent="onScrollClick(1, 'hours')"
          />
        </div>

        <span class="lx-time-lists-separator">:</span>

        <div class="lx-time-picker-time-list-wrapper">
          <LxButton
            kind="ghost"
            icon="caret-up"
            variant="icon-only"
            :disabled="disabled"
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
                    'lx-disabled-hour':
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
                        mode === 'time'
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
                    mode === 'time'
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
                      mode === 'time'
                    )
                  )
                "
                @keydown.enter.stop.prevent="
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
                      mode === 'time'
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
            @click.stop.prevent="onScrollClick(1, 'minutes')"
          />
        </div>
      </div>
    </div>

    <div
      v-if="isMobileScreen && mode === 'date-time'"
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
          'text-unavailable': pickerType === 'range' && !texts.doNotIndicateStart,
        },
      ]"
    >
      <LxButton
        v-if="pickerType === 'range'"
        custom-class="min-date-button"
        :title="texts.doNotIndicateStart"
        :label="texts.doNotIndicateStart"
        kind="ghost"
        icon="min-date"
        :variant="
          mode === 'month' ||
          mode === 'year' ||
          mode === 'quarters' ||
          isMobileScreen ||
          !texts.doNotIndicateStart
            ? 'icon-only'
            : 'default'
        "
        :disabled="doNotIndicateStartDisableState"
        @click.stop.prevent="handleDoNotIndicateStart"
      />

      <LxButton
        :title="texts.clearButton"
        :label="texts.clear"
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
        :title="texts.doNotIndicateEnd"
        :label="texts.doNotIndicateEnd"
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
