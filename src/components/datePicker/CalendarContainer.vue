<script setup>
import { ref, computed, watch } from 'vue';
import { subYears, addYears, subMonths, addMonths } from 'date-fns';
import { useWindowSize, onClickOutside } from '@vueuse/core';

import { formatDateJSON, formatLocalizedDate } from '@/utils/dateUtils';
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
  getMonths,
  isQuarterValid,
  zeroPad,
  dateFromYearAndQuarter,
  extractQuarterFromDate,
  getDayTabIndex,
} from '@/components/datePicker/helpers';

import LxButton from '@/components/Button.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';

const props = defineProps({
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
// const selectedStartQuarter = ref();
// const selectedEndQuarter = ref();

const hoveredDate = ref(null);

const startYear = ref(todayDate.value.getFullYear() - 5);
const endYear = ref(todayDate.value.getFullYear() + 6);

const startQuarterYear = ref(todayDate.value.getFullYear() - 4);
const endQuarterYear = ref(todayDate.value.getFullYear() + 5);

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

function selectPreviousSlide() {
  transitionName.value = 'lx-previous-slide';
  const prevMonthOrYear = new Date(currentDate.value);

  if (regularLayout.value && currentDate.value) {
    prevMonthOrYear.setMonth(currentDate.value.getMonth() - 1);
  }
  if (monthsLayout.value && currentDate.value) {
    prevMonthOrYear.setFullYear(currentDate.value.getFullYear() - 1);
  }
  if (yearsLayout.value) {
    startYear.value -= 12;
    endYear.value -= 12;
  }
  if (quartersLayout.value) {
    startQuarterYear.value -= 10;
    endQuarterYear.value -= 10;
  }
  currentDate.value = prevMonthOrYear;
  selectedMonth.value = prevMonthOrYear.getMonth();
}

function selectNextSlide() {
  transitionName.value = 'lx-next-slide';
  const nextMonthOrYear = new Date(currentDate.value);

  if (regularLayout.value && currentDate.value) {
    nextMonthOrYear.setMonth(currentDate.value.getMonth() + 1);
  }
  if (monthsLayout.value && currentDate.value) {
    nextMonthOrYear.setFullYear(currentDate.value.getFullYear() + 1);
  }
  if (yearsLayout.value) {
    startYear.value += 12;
    endYear.value += 12;
  }
  if (quartersLayout.value) {
    startQuarterYear.value += 10;
    endQuarterYear.value += 10;
  }
  currentDate.value = nextMonthOrYear;
  selectedMonth.value = nextMonthOrYear.getMonth();
}

function clearSelectedValues() {
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

  emits('update:modelValue', null);
  props.setActiveInput('startInput');
}

function handleDoNotIndicateStart() {
  // Declare new date reference
  const newStartDate = new Date('1900-01-01');

  selectedManually.value = false;

  if (selectedStartDate.value && !selectedEndDate.value && props.activeInput === 'startInput') {
    selectedEndDate.value = selectedStartDate.value;
    selectedEndDay.value = selectedStartDate.value.getDate();
    selectedEndMonth.value = selectedStartDate.value.getMonth();
    selectedEndYear.value = selectedStartDate.value.getFullYear();

    emits('update:modelValue', {
      start: newStartDate,
      end: selectedEndDate.value,
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
      start: newStartDate,
      end: null,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    emits('update:modelValue', {
      start: newStartDate,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
    return;
  }

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    selectedStartDate.value = newStartDate;
    selectedStartDay.value = newStartDate.getDate();
    selectedStartMonth.value = newStartDate.getMonth();
    selectedStartYear.value = newStartDate.getFullYear();

    emits('update:modelValue', {
      start: selectedStartDate.value,
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
      start: newStartDate,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
    return;
  }

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'endInput') {
    selectedStartDate.value = newStartDate;
    selectedStartDay.value = newStartDate.getDate();
    selectedStartMonth.value = newStartDate.getMonth();
    selectedStartYear.value = newStartDate.getFullYear();

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
  }
}

function handleDoNotIndicateEnd() {
  // Declare new date reference
  const newEndDate = new Date('9999-12-31');

  selectedManually.value = false;

  if (selectedStartDate.value && !selectedEndDate.value && props.activeInput === 'endInput') {
    selectedEndDate.value = newEndDate;
    selectedEndDay.value = newEndDate.getDate();
    selectedEndMonth.value = newEndDate.getMonth();
    selectedEndYear.value = newEndDate.getFullYear();

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: selectedEndDate.value,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: newEndDate,
    });
    hoveredDate.value = null;
    return;
  }

  if (selectedStartDate.value && selectedEndDate.value && props.activeInput === 'endInput') {
    selectedEndDate.value = newEndDate;
    selectedEndDay.value = newEndDate.getDate();
    selectedEndMonth.value = newEndDate.getMonth();
    selectedEndYear.value = newEndDate.getFullYear();

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: newEndDate,
    });
    hoveredDate.value = null;
    return;
  }

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'endInput') {
    selectedStartDate.value = selectedEndDate.value;
    selectedStartDay.value = selectedEndDate.value.getDate();
    selectedStartMonth.value = selectedEndDate.value.getMonth();
    selectedStartYear.value = selectedEndDate.value.getFullYear();

    emits('update:modelValue', {
      start: selectedStartDate.value,
      end: newEndDate,
    });
    hoveredDate.value = null;
  }

  if (!selectedStartDate.value && selectedEndDate.value && props.activeInput === 'startInput') {
    selectedEndDate.value = null;
    selectedEndDay.value = null;
    selectedEndMonth.value = null;
    selectedEndYear.value = null;

    emits('update:modelValue', {
      start: null,
      end: newEndDate,
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

function handleSingleSelection(selectedValue, selectionType, isNotSelectable = false) {
  if (props.disabled) return;
  if (isNotSelectable) return;
  selectedManually.value = true;

  // Declare new cloned date reference
  const newDate = new Date(currentDate.value);

  if (selectionType === 'month') {
    newDate.setMonth(selectedValue);
    currentDate.value = newDate;
    selectedMonth.value = Number(selectedValue);

    if (props.mode === 'month') {
      emits('update:modelValue', newDate);
      // Handle layout display and close the menu
      handleLayoutDisplay();
      props.closeMenu();
      return;
    }

    if (props.mode === 'month-year') {
      if (selectedYear.value) {
        // Construct the updated date based on the variant condition
        const updatedDate = new Date(selectedYear.value, selectedMonth.value, 1);
        emits('update:modelValue', updatedDate);
        handleLayoutDisplay();
        props.closeMenu();
        return;
      }

      monthsLayout.value = false;
      yearsLayout.value = true;
      return;
    }

    monthsLayout.value = false;
    regularLayout.value = true;
    return;
  }

  if (selectionType === 'year') {
    newDate.setFullYear(selectedValue);
    currentDate.value = newDate;

    // Set selectedYear from the selected value
    selectedYear.value = Number(selectedValue);

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
      return;
    }

    if (props.mode === 'month-year') {
      if (selectedMonth.value) {
        // Construct the updated date based on the variant condition
        const updatedDate = new Date(selectedYear.value, selectedMonth.value, 1);
        emits('update:modelValue', updatedDate);
        handleLayoutDisplay();
        props.closeMenu();
        return;
      }
      yearsLayout.value = false;
      monthsLayout.value = true;
      return;
    }

    yearsLayout.value = false;
    regularLayout.value = true;
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
  }

  if (selectionType === 'date') {
    // Set selected Day, Month, Year from the selected value
    selectedDay.value = selectedValue.getDate();
    selectedMonth.value = selectedValue.getMonth();
    selectedYear.value = selectedValue.getFullYear();

    // Check if the variant is 'full'
    const useSelectedValue =
      props.variant === 'full' || props.variant === 'full-rows' || props.variant === 'full-columns';

    // Construct the updated date based on the variant condition
    const updatedDate = new Date(
      selectedValue.getFullYear(),
      selectedValue.getMonth(),
      useSelectedValue ? selectedValue.getDate() : selectedDay.value
    );
    selectedDate.value = updatedDate;

    if (props.mode === 'date') {
      // Get the last element of the flattened monthsList array
      const clonedArray = [...monthsList.value.flat()];
      const lastDateInMonthList = clonedArray.slice(-1)[0];

      // Check if the updatedDate exists in the flattened monthsList array
      const isDateInMonthList = monthsList.value
        .flat()
        .some((monthDate) => monthDate.getMonth() === updatedDate.getMonth());

      // Check if the updatedDate is after the lastDateInMonthList
      if (updatedDate > lastDateInMonthList) {
        // Set currentDate to the updatedDate minus 3 months
        const threeMonthsBeforeDate = new Date(updatedDate);
        if (props.variant === 'full') {
          threeMonthsBeforeDate.setMonth(threeMonthsBeforeDate.getMonth() - 3);
        }
        if (props.variant === 'full-rows' || props.variant === 'full-columns') {
          threeMonthsBeforeDate.setMonth(threeMonthsBeforeDate.getMonth() - 3);
        }
        currentDate.value = threeMonthsBeforeDate;
      }
      // If updatedDate is NOT in the monthsList, update currentDate.value
      else if (!isDateInMonthList) {
        currentDate.value = updatedDate;
      }

      // Emit the event with updated value
      emits('update:modelValue', updatedDate);

      // Handle layout display and close the menu
      handleLayoutDisplay();
      props.closeMenu();
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
      props.closeMenu();
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
    newDate.setMonth(selectedValue);
    currentDate.value = newDate;

    // Set selectedMonth from the selected value
    selectedMonth.value = Number(selectedValue);

    if (props.mode === 'month') {
      // Declare new cloned date reference
      const newStartDate = new Date(currentDate.value);
      const newEndDate = new Date(currentDate.value);

      if (!selectedStartMonth.value) {
        newStartDate.setMonth(selectedValue);
        // If start date is not selected, set the start date
        selectedStartMonth.value = selectedValue;
        hoveredDate.value = selectedValue;
      } else if (selectedStartMonth.value && !selectedEndMonth.value) {
        // If start month is selected, but end month is not, set the end month
        // Ensure the end month is after the start month
        if (selectedValue >= selectedStartDate.value) {
          newEndDate.setMonth(selectedValue);
          selectedEndMonth.value = selectedValue;

          // Update the selectedDate value and emit the event
          emits('update:modelValue', {
            start: newStartDate,
            end: newEndDate,
          });

          // Reset hover and close the menu
          hoveredDate.value = null;
          // Handle layout display and close the menu
          handleLayoutDisplay();
          return;
        }
      } else {
        // If the clicked date is before the start date, reset the selection
        newStartDate.setMonth(selectedValue);
        selectedStartMonth.value = selectedValue;
        hoveredDate.value = selectedValue;
      }
      // emits('update:modelValue', newDate);
      // Handle layout display and close the menu
      // handleLayoutDisplay();

      return;
    }

    monthsLayout.value = false;
    regularLayout.value = true;
    return;
  }

  if (selectionType === 'year') {
    newDate.setFullYear(selectedValue);
    currentDate.value = newDate;

    // Set selectedYear from the selected value
    selectedYear.value = Number(selectedValue);

    yearsLayout.value = false;
    regularLayout.value = true;
    return;
  }

  if (selectionType === 'date') {
    if (props.activeInput === 'startInput' && !selectedStartDate.value) {
      if (selectedEndDate.value && selectedValue >= selectedEndDate.value) {
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();
        selectedEndDate.value = null;
        selectedEndDay.value = null;
        selectedEndMonth.value = null;
        selectedEndYear.value = null;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover and close the menu
        hoveredDate.value = null;
        // Handle layout display and close the menu
        handleLayoutDisplay();
        props.setActiveInput('endInput');
      } else {
        // If start date is not selected, set the start date
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();
        hoveredDate.value = selectedValue;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        props.setActiveInput('endInput');
      }
    } else if (
      props.activeInput === 'endInput' &&
      selectedStartDate.value &&
      !selectedEndDate.value
    ) {
      // If start date is selected, but end date is not, set the end date
      // Ensure the end date is after the start date
      if (selectedValue >= selectedStartDate.value) {
        selectedEndDate.value = selectedValue;
        selectedEndDay.value = selectedValue.getDate();
        selectedEndMonth.value = selectedValue.getMonth();
        selectedEndYear.value = selectedValue.getFullYear();

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover and close the menu
        hoveredDate.value = null;
        // Handle layout display and close the menu
        handleLayoutDisplay();
      } else {
        // If the clicked date is before the start date, flip selected values
        selectedEndDate.value = selectedStartDate.value;
        selectedEndDay.value = selectedStartDate.value.getDate();
        selectedEndMonth.value = selectedStartDate.value.getMonth();
        selectedEndYear.value = selectedStartDate.value.getFullYear();
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover
        hoveredDate.value = null;
        handleLayoutDisplay();
      }
    } else if (selectedStartDate.value && selectedEndDate.value) {
      // Both start and end dates are selected, and a new date is selected
      if (props.activeInput === 'endInput' && selectedValue >= selectedStartDate.value) {
        // If the new date is greater than or equal to the start date, update the end date
        selectedEndDate.value = selectedValue;
        selectedEndDay.value = selectedValue.getDate();
        selectedEndMonth.value = selectedValue.getMonth();
        selectedEndYear.value = selectedValue.getFullYear();

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover
        hoveredDate.value = null;
        handleLayoutDisplay();

        if (formatDateJSON(selectedStartDate.value) === '1900-01-01') {
          props.setActiveInput('startInput');
        }
      }
      // Case for updating the start date when the 'startInput' is active
      else if (props.activeInput === 'startInput' && selectedValue <= selectedEndDate.value) {
        // If the new date is less than or equal to the end date, update the start date
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover
        hoveredDate.value = null;
        handleLayoutDisplay();

        props.setActiveInput('endInput');
      } else if (props.activeInput === 'startInput' && selectedValue > selectedEndDate.value) {
        // If the new date is greater than or equal to the end date, update the start date
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();
        selectedEndDate.value = null;
        selectedEndDay.value = null;
        selectedEndMonth.value = null;
        selectedEndYear.value = null;

        hoveredDate.value = selectedValue;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: null,
        });

        props.setActiveInput('endInput');
      } else if (props.activeInput === 'endInput' && selectedValue < selectedStartDate.value) {
        // If the new date is less than the start date, update the end date
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();
        selectedEndDate.value = null;
        selectedEndDay.value = null;
        selectedEndMonth.value = null;
        selectedEndYear.value = null;

        hoveredDate.value = selectedValue;

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: null,
        });
        props.setActiveInput('endInput');
      } else if (props.activeInput === 'startInput' && selectedValue >= selectedStartDate.value) {
        // If the new date is less than the start date, update the end date
        selectedStartDate.value = null;
        selectedStartDay.value = null;
        selectedStartMonth.value = null;
        selectedStartYear.value = null;
        selectedEndDate.value = selectedValue;
        selectedEndDay.value = selectedValue.getDate();
        selectedEndMonth.value = selectedValue.getMonth();
        selectedEndYear.value = selectedValue.getFullYear();

        hoveredDate.value = selectedValue;
        props.setActiveInput('endInput');
      }
    } else if (props.activeInput === 'endInput' && !selectedEndDate.value) {
      selectedEndDate.value = selectedValue;
      selectedEndDay.value = selectedValue.getDate();
      selectedEndMonth.value = selectedValue.getMonth();
      selectedEndYear.value = selectedValue.getFullYear();
      hoveredDate.value = selectedValue;

      emits('update:modelValue', {
        start: null,
        end: selectedEndDate.value,
      });
      props.setActiveInput('startInput');
    } else if (
      props.activeInput === 'endInput' &&
      !selectedStartDate.value &&
      selectedEndDate.value
    ) {
      // If end date is selected, but start date is not, set the start date
      // Ensure the start date is before the end date
      if (selectedValue <= selectedEndDate.value) {
        selectedStartDate.value = selectedValue;
        selectedStartDay.value = selectedValue.getDate();
        selectedStartMonth.value = selectedValue.getMonth();
        selectedStartYear.value = selectedValue.getFullYear();

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover
        hoveredDate.value = null;
        handleLayoutDisplay();
        props.setActiveInput('startInput');
      } else {
        // If the clicked date is after the end date, flip selected values
        selectedStartDate.value = selectedEndDate.value;
        selectedStartDay.value = selectedEndDate.value.getDate();
        selectedStartMonth.value = selectedEndDate.value.getMonth();
        selectedStartYear.value = selectedEndDate.value.getFullYear();
        selectedEndDate.value = selectedValue;
        selectedEndDay.value = selectedValue.getDate();
        selectedEndMonth.value = selectedValue.getMonth();
        selectedEndYear.value = selectedValue.getFullYear();

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });

        // Reset hover
        hoveredDate.value = null;
        handleLayoutDisplay();
      }
    }
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

  if (props.mode === 'date') {
    hoveredDate.value = date; // Set the hovered date to show potential range
  }

  if (props.mode === 'month' && selectedStartMonth.value && !selectedEndMonth.value) {
    hoveredDate.value = date; // Set the hovered date to show potential range
  }
};

// Check if a day is in the hovering range
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

const isSelectedDateRange = (date) => {
  if (selectedStartDate.value && selectedEndDate.value) {
    return date >= selectedStartDate.value && date <= selectedEndDate.value;
  }
  return false;
};

const isSelectedMonthRange = (monthIndex) => {
  const currentYear = currentDate.value.getFullYear();

  // Check if both start and end month and year are selected
  if (selectedStartMonth.value !== null && selectedEndMonth.value !== null) {
    // When both start and end are in the same year
    if (selectedStartYear.value === selectedEndYear.value) {
      return (
        currentYear === selectedStartYear.value &&
        monthIndex >= selectedStartMonth.value &&
        monthIndex <= selectedEndMonth.value
      );
    }

    // When start year is earlier than end year
    if (currentYear === selectedStartYear.value) {
      return monthIndex >= selectedStartMonth.value; // Hovering in the start year
    }
    if (currentYear === selectedEndYear.value) {
      return monthIndex <= selectedEndMonth.value; // Hovering in the end year
    }

    // For years between the start and end years
    if (currentYear > selectedStartYear.value && currentYear < selectedEndYear.value) {
      return true; // Hovering for all months in the intermediate years
    }
  }
  return false;
};

const isSelectedYearRange = (year) => {
  if (selectedStartYear.value && selectedEndYear.value) {
    return year >= selectedStartYear.value && year <= selectedEndYear.value;
  }
  return false;
};

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
  const visibleCount = isMobileScreen.value && props.mode === 'date-time' ? 4 : 3; // Number of hours to show before and after the current one
  visibleHours.value = getSurroundingHours(hours.value, currentHourIndex.value, visibleCount);
}

// Update visible minutes
function updateVisibleMinutes() {
  const visibleCount = isMobileScreen.value && props.mode === 'date-time' ? 4 : 3; // Number of minutes to show before and after the current one

  visibleMinutes.value = getSurroundingMinutes(
    filteredMinutes.value,
    selectedMinuteCenterId.value,
    visibleCount
  );
}

function returnToToday() {
  const newDate = new Date();
  currentDate.value = newDate;
  startYear.value = newDate.getFullYear() - 5;
  endYear.value = newDate.getFullYear() + 6;

  startQuarterYear.value = newDate.getFullYear() - 5;
  endQuarterYear.value = newDate.getFullYear() + 6;

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

const scrollThreshold = 60; // Adjust this value to control how fast or slow the scroll is
let scrollAccumulated = 0;

function onScrollWheel(e, type) {
  scrollAccumulated += e.deltaY;

  if (Math.abs(scrollAccumulated) >= scrollThreshold) {
    if (scrollAccumulated > 0) {
      onScrollClick(1, type); // Scroll down
    } else {
      onScrollClick(-1, type); // Scroll up
    }

    scrollAccumulated = 0; // Reset after scroll
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
  }

  if (
    props.mode === 'date-time' &&
    selectedYear.value &&
    selectedMonth.value &&
    selectedDay.value &&
    selectedMinute.value
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
    props.closeMenu();
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
  }

  if (
    props.mode === 'date-time' &&
    selectedYear.value &&
    selectedMonth.value &&
    selectedDay.value &&
    selectedHour.value
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
    props.closeMenu();
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
    handleDoNotIndicateStart();
    return;
  }

  if (props.activeInput === 'endInput' && selectedStartDate.value && !selectedEndDate.value) {
    handleDoNotIndicateEnd();
  }
}

const handleFocusOut = (e) => {
  if (!containerRef.value.contains(e.relatedTarget)) {
    handleDateTimeSelection();
  }
};

function handleClose() {
  handleOutsideClickRangeSelection();
  props.closeMenu();
}

const updateCurrentDateIfNotInMonthsList = (selectedDateValue) => {
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
    return `${startYear.value}-${endYear.value}`;
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
    return startYear.value >= props.minDateRef.getFullYear() && !props.disabled;
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
    return endYear.value <= props.maxDateRef.getFullYear() && !props.disabled;
  }

  // Check only years for 'years' layout
  if (yearsLayout.value) {
    return endYear.value < props.maxDateRef.getFullYear() && !props.disabled;
  }

  // Always enable in other cases
  return true;
});

// Compute properties for months, years and quarters grid
const monthsInYear = computed(() => getGrid('months', 3, 0, 0, props.localizedMonthsList));
const yearsList = computed(() => getGrid('years', 3, startYear.value, endYear.value));
const quartersList = computed(() =>
  getGrid('quarters', 5, startQuarterYear.value, endQuarterYear.value)
);

const monthsSelectButtonLabel = computed(() => {
  if (
    (props.mode === 'date' && props.variant === 'full' && props.pickerType === 'single') ||
    (props.mode === 'date' && props.variant === 'full-rows' && props.pickerType === 'single') ||
    (props.mode === 'date' && props.variant === 'full-columns' && props.pickerType === 'single') ||
    props.pickerType === 'range'
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
  if (formatDateJSON(selectedStartDate.value) === '1900-01-01') {
    return true;
  }
  if (!selectedStartDate.value && !selectedEndDate.value) {
    return true;
  }
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
  if (formatDateJSON(selectedEndDate.value) === '9999-12-31') {
    return true;
  }
  if (!selectedStartDate.value && !selectedEndDate.value) {
    return true;
  }
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

        if (props.mode === 'date' && selectedDate.value) {
          currentDate.value = selectedDate.value;
        }
        if (
          ((props.mode === 'date-time' && selectedDate.value) || props.mode === 'time') &&
          selectedHour.value !== null &&
          selectedMinute.value !== null
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

        if (selectedStartDate.value && !selectedEndDate.value) {
          currentDate.value = selectedStartDate.value;
        }

        if (selectedStartDate.value && selectedEndDate.value) {
          // Check for special cases like 1900-01-01 and 9999-12-31
          if (formatDateJSON(selectedStartDate.value) === '1900-01-01') {
            currentDate.value = selectedEndDate.value; // Update to end date
          } else if (formatDateJSON(selectedEndDate.value) === '9999-12-31') {
            currentDate.value = selectedStartDate.value; // Update to start date
          } else {
            currentDate.value = selectedStartDate.value;
          }
        }

        if (!selectedStartDate.value && selectedEndDate.value) {
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
      clearSelectedValues();
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
        selectedDate.value = new Date(newValue);
        if (!selectedManually.value) currentDate.value = selectedDate.value;

        selectedHour.value = selectedDate.value.getHours();
        selectedMinute.value = selectedDate.value.getMinutes();
        currentHourIndex.value = getTimeOrderIndex(hours.value, selectedDate.value.getHours());

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

        handleSelections(selectedDate.value, 'date');
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

        selectHour({
          value: newValue.getHours(),
          orderIndex: newValue.getHours(),
        });

        selectMinute({
          value: newValue.getMinutes(),
          orderIndex: currentMinuteIndex.value,
          id: filteredMinutes.value[currentMinuteIndex.value]?.id,
        });
      }

      if (props.mode === 'month') {
        selectedDate.value = newValue;
        if (!selectedManually.value) currentDate.value = selectedDate.value;

        handleSelections(selectedDate.value.getMonth(), 'month');
      }

      if (props.mode === 'year') {
        selectedDate.value = newValue;
        handleSelections(selectedDate.value.getFullYear(), 'year');
      }

      if (props.mode === 'month-year') {
        selectedDate.value = newValue;
        selectedMonth.value = selectedDate.value.getMonth();
        handleSelections(selectedDate.value.getFullYear(), 'year');
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
        handleSelections(constructedQuarterObj, 'quarter');
      }
    }

    if (props.pickerType === 'range' && newValue) {
      if (newValue.start && newValue.end) {
        if (
          !canSelectDate(newValue.start, props.minDateRef, props.maxDateRef, props.mode) ||
          !canSelectDate(newValue.end, props.minDateRef, props.maxDateRef, props.mode)
        ) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
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

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: selectedEndDate.value,
        });
      } else if (newValue.start && !newValue.end) {
        if (!canSelectDate(newValue.start, props.minDateRef, props.maxDateRef, props.mode)) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        if (!props.menuState) {
          currentDate.value = newValue.start;
        } else {
          updateCurrentDateIfNotInMonthsList(newValue.start);
        }

        const newEndDate = new Date('9999-12-31');

        selectedStartDate.value = newValue.start;
        selectedStartDay.value = newValue.start.getDate();
        selectedStartMonth.value = newValue.start.getMonth();
        selectedStartYear.value = newValue.start.getFullYear();

        if (!selectedManually.value) {
          selectedEndDate.value = newEndDate;
          selectedEndDay.value = newEndDate.getDate();
          selectedEndMonth.value = newEndDate.getMonth();
          selectedEndYear.value = newEndDate.getFullYear();
        } else {
          selectedEndDate.value = null;
          selectedEndDay.value = null;
          selectedEndMonth.value = null;
          selectedEndYear.value = null;
        }

        emits('update:modelValue', {
          start: selectedStartDate.value,
          end: newEndDate,
        });
      } else if (!newValue.start && newValue.end) {
        if (!canSelectDate(newValue.end, props.minDateRef, props.maxDateRef, props.mode)) {
          clearSelectedValues();
          emits('update:modelValue', null);
          return;
        }

        if (!props.menuState) {
          currentDate.value = newValue.end;
        } else {
          updateCurrentDateIfNotInMonthsList(newValue.end);
        }

        const newStartDate = new Date('1900-01-01');

        if (!selectedManually.value) {
          selectedStartDate.value = newStartDate;
          selectedStartDay.value = newStartDate.getDate();
          selectedStartMonth.value = newStartDate.getMonth();
          selectedStartYear.value = newStartDate.getFullYear();
        } else {
          selectedStartDate.value = null;
          selectedStartDay.value = null;
          selectedStartMonth.value = null;
          selectedStartYear.value = null;
        }

        selectedEndDate.value = newValue.end;
        selectedEndDay.value = newValue.end.getDate();
        selectedEndMonth.value = newValue.end.getMonth();
        selectedEndYear.value = newValue.end.getFullYear();

        emits('update:modelValue', {
          start: newStartDate,
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
            'lx-quarters': quartersLayout,
            'lx-full-layout':
              (mode === 'date' && variant === 'full') ||
              (mode === 'date' && variant === 'full-rows'),
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
          },
        ]"
      >
        <LxButton
          v-if="(isMobileScreen && !mobileTimeLayout) || (mode !== 'month' && !isMobileScreen)"
          customClass="lx-previous-slide-button"
          :title="texts.previous"
          kind="ghost"
          icon="previous-page"
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
              'range-month': pickerType === 'range' && mode === 'month',
              'range-year': pickerType === 'range' && mode === 'year',
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
                    :key="currentDate ? currentDate.getMonth() : todayDate.getMonth()"
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
                  :key="currentDate ? currentDate.getFullYear() : todayDate.getFullYear()"
                  role="rowgroup"
                >
                  <div
                    v-for="(months, monthsRowIndex) in monthsInYear"
                    :key="monthsRowIndex"
                    class="lx-calendar-month-row"
                    role="row"
                  >
                    <div
                      v-for="(month, monthIndex) in months"
                      :key="monthIndex"
                      class="lx-calendar-month"
                      :class="[
                        {
                          'lx-today':
                            month.orderIndex === todayDate.getMonth() &&
                            currentDate.getFullYear() === todayDate.getFullYear(),
                        },
                        {
                          'lx-selected-month':
                            (month.orderIndex === selectedMonth &&
                              currentDate.getFullYear() === Number(selectedYear) &&
                              pickerType === 'single') ||
                            (month.orderIndex === selectedMonth && mode === 'month'),
                        },
                        {
                          'lx-selected-start-month':
                            (month.orderIndex === selectedStartMonth &&
                              currentDate.getFullYear() === Number(selectedStartYear)) ||
                            (month.orderIndex === selectedStartMonth && mode === 'month'),
                        },
                        {
                          'lx-selected-end-month':
                            (month.orderIndex === selectedEndMonth &&
                              currentDate.getFullYear() === Number(selectedEndYear)) ||
                            (month.orderIndex === selectedEndMonth && mode === 'month'),
                        },
                        {
                          'lx-disabled-month':
                            (mode !== 'month' &&
                              !canSelectDate(
                                new Date(
                                  currentDate.getFullYear(),
                                  month.orderIndex,
                                  currentDate.getDate()
                                ),
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
                          'hovering-range': isSelectedMonthRange(month.orderIndex),
                        },
                      ]"
                      :aria-label="capitalizeFirstLetter(month.fullName)"
                      role="cell"
                      :tabindex="
                        mode !== 'month' &&
                        !canSelectDate(
                          new Date(
                            currentDate.getFullYear(),
                            month.orderIndex,
                            currentDate.getDate()
                          ),
                          minDateRef,
                          maxDateRef,
                          'month-year'
                        )
                          ? '-1'
                          : '0'
                      "
                      @click.stop.prevent="
                        handleSelections(
                          month.orderIndex,
                          'month',
                          mode !== 'month' &&
                            !canSelectDate(
                              new Date(
                                currentDate.getFullYear(),
                                month.orderIndex,
                                currentDate.getDate()
                              ),
                              minDateRef,
                              maxDateRef,
                              'month-year'
                            )
                        )
                      "
                      @keydown.enter.prevent="
                        handleSelections(
                          month.orderIndex,
                          'month',
                          mode !== 'month' &&
                            !canSelectDate(
                              new Date(
                                currentDate.getFullYear(),
                                month.orderIndex,
                                currentDate.getDate()
                              ),
                              minDateRef,
                              maxDateRef,
                              'month-year'
                            )
                        )
                      "
                      @focusin="hoverDate(month.orderIndex)"
                      @mouseover="hoverDate(month.orderIndex)"
                    >
                      <span class="lx-calendar-month-content">
                        {{
                          capitalizeFirstLetter(
                            mode === 'date' && variant === 'full' ? month.fullName : month.shortName
                          )
                        }}
                      </span>
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
                      class="lx-calendar-year"
                      :class="[
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
                              new Date(year, todayDate.getMonth(), todayDate.getDate()),
                              minDateRef,
                              maxDateRef,
                              'year'
                            ) || disabled,
                        },
                        {
                          'hovering-range': isSelectedYearRange(year),
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
                    >
                      <span class="lx-calendar-month-content">
                        {{ year }}
                      </span>
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
                      class="lx-calendar-quarter"
                      :class="[
                        {
                          'lx-selected-quarter':
                            selectedQuarter === quarterItem && selectedYear === quarter.year,
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
                    >
                      {{ `Q${quarterItem}` }}
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
          icon="next-page"
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
            class="lx-time-picker-time-list"
            :class="[
              {
                'date-time-only': mode === 'date-time' && isMobileScreen && mobileTimeLayout,
              },
            ]"
            @wheel.prevent="onScrollWheel($event, 'hours')"
          >
            <div
              v-for="hour in visibleHours"
              :key="hour.id"
              class="lx-time-list-item"
              :class="[
                { 'is-active': Number(hour.value) === selectedHour },
                {
                  'lx-disabled-hour':
                    !canSelectTime(
                      hour.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      'hour',
                      selectedHour,
                      selectedMinute,
                      mode === 'time'
                    ) || disabled,
                },
              ]"
              :tabindex="
                !canSelectTime(
                  hour.value,
                  minDateRef,
                  maxDateRef,
                  selectedDay,
                  'hour',
                  selectedHour,
                  selectedMinute,
                  mode === 'time'
                )
                  ? '-1'
                  : '0'
              "
              @click.stop.prevent="
                selectHour(
                  hour,
                  !canSelectTime(
                    hour.value,
                    minDateRef,
                    maxDateRef,
                    selectedDay,
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
            class="lx-time-picker-time-list"
            :class="[
              {
                'date-time-only': mode === 'date-time' && isMobileScreen && mobileTimeLayout,
              },
            ]"
            @wheel.prevent="onScrollWheel($event, 'minutes')"
          >
            <div
              v-for="minute in visibleMinutes"
              :key="minute.id"
              class="lx-time-list-item"
              :class="[
                {
                  'is-active':
                    minute.orderIndex === selectedMinute && minute.id === selectedMinuteId,
                },
                {
                  'lx-disabled-hour':
                    !canSelectTime(
                      minute.value,
                      minDateRef,
                      maxDateRef,
                      selectedDay,
                      'minute',
                      selectedHour,
                      selectedMinute,
                      mode === 'time'
                    ) || disabled,
                },
              ]"
              :tabindex="
                !canSelectTime(
                  minute.value,
                  minDateRef,
                  maxDateRef,
                  selectedDay,
                  'minute',
                  selectedHour,
                  selectedMinute,
                  mode === 'time'
                )
                  ? '-1'
                  : '0'
              "
              @click.stop.prevent="
                selectMinute(
                  minute,
                  !canSelectTime(
                    minute.value,
                    minDateRef,
                    maxDateRef,
                    selectedDay,
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
          'range-buttons': pickerType === 'range' && mode !== 'month',
          'range-buttons-icon':
            pickerType === 'range' && mode !== 'month' && mode !== 'year' && mode !== 'quarters',
          'text-unavailable': pickerType === 'range' && !texts.doNotIndicateStart,
        },
      ]"
    >
      <LxButton
        v-if="pickerType === 'range' && mode !== 'month'"
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
        v-if="pickerType === 'range' && mode !== 'month'"
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
