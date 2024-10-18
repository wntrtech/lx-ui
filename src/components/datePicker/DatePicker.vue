<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useWindowSize } from '@vueuse/core';

import {
  parseDate,
  getMonthNames,
  getWeekdayNames,
  getMonthYearString,
  isDateValid,
  isTimeValid,
} from '@/utils/dateUtils';
import {
  getMonthNameByOrder,
  formatInputRawDate,
  formatInputRawDateTime,
  formatInputRawTime,
  canSelectDate,
  zeroPad,
  extractQuarterFromDate,
} from '@/components/datePicker/helpers';

import LxCalendarContainer from '@/components/datePicker/CalendarContainer.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [String, Date, Object], default: null },
  mode: { type: String, default: 'date' }, // 'date', 'time', 'date-time', 'month', 'year', 'month-year', 'quarters'
  variant: { type: String, default: 'default' }, // 'default', 'picker', 'full', 'full-rows', 'full-columns'
  masks: { type: Object, default: () => {} },
  placeholder: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  minDate: { type: [String, Date], default: null },
  maxDate: { type: [String, Date], default: null },
  required: { type: Boolean, default: false },
  locale: { type: String, default: 'lv-LV' },
  firstDayOfTheWeek: { type: Number, default: 1 },
  specialDatesAttributes: { type: Array, default: null },
  clearIfNotExact: { type: Boolean, default: false },
  cadenceOfMinutes: { type: Number, default: 1 }, // 1, 5, 15
  pickerType: { type: String, default: 'single' }, // 'single', 'range'
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
const dropDownMenuRef = ref();

// Localized month and week days lists
const localizedMonthsList = ref([]);
const weekDaysList = ref([]);

// Refs for min and max date range local use
const minDateRef = ref(null);
const maxDateRef = ref(null);

const modelInput = ref(null);
const modelEndDateInput = ref(null);

const activeInput = ref(null);

const windowSize = useWindowSize();

// Computed model value for selected date handling
const model = computed({
  get() {
    if (!props.modelValue) return null;
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

function validateIfExact(e, type = 'startInput') {
  if (props.pickerType === 'single' && !e.target.value) {
    emits('update:modelValue', null);
    return;
  }

  if (props.mode === 'date') {
    const date = e.target.value;
    const inputMask = props.masks?.input || 'dd.MM.yyyy.';

    if (date && inputMask.length !== date.length) {
      if (props.pickerType === 'range') {
        if (type === 'startInput' && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }

        if (type === 'endInput' && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
      }

      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    const dayIndex = inputMask?.indexOf('dd');
    const monthIndex = inputMask?.indexOf('MM');
    const yearIndex = inputMask?.indexOf('yyyy');

    const day = Number(date.substring(dayIndex, dayIndex + 2));
    const month = Number(date.substring(monthIndex, monthIndex + 2));
    const year = Number(date.substring(yearIndex, yearIndex + 4));

    const normalizedDay = zeroPad(day);
    const normalizedMonth = zeroPad(month);

    const dateString = `${year}-${normalizedMonth}-${normalizedDay}`; // "YYYY-MM-DD"

    // Check if the constructed date is valid
    if (day && month && year && !isDateValid(dateString)) {
      if (props.pickerType === 'range') {
        if (type === 'startInput' && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }

        if (type === 'endInput' && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
      }

      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    // Check if the date is within the min/max range
    if (
      day &&
      month &&
      year &&
      !canSelectDate(new Date(dateString), props.minDate, props.maxDate, 'date')
    ) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    // Update the value with the valid date
    const updatedValue = day && month && year ? new Date(year, month - 1, day) : null;
    const updatedStartValue = new Date('1900-01-01');
    const updatedEndValue = new Date('9999-12-31');

    if (props.pickerType === 'single') {
      emits('update:modelValue', updatedValue);
    }
    if (props.pickerType === 'range') {
      if (type === 'startInput') {
        if (!updatedValue && model.value.end) {
          const updatedDatesObject = {
            start: updatedStartValue,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (!updatedValue && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && !model.value.start && model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && !model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: updatedEndValue,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
      }

      if (type === 'endInput') {
        if (!updatedValue && model.value.start) {
          const updatedDatesObject = {
            start: props.modelValue.start,
            end: updatedEndValue,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (!updatedValue && !model.value.start) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && model.value.end) {
          const updatedDatesObject = {
            start: model.value.start,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: model.value.start,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && !model.value.start && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && !model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedStartValue,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
          return;
        }
      }
    }
  }

  if (props.mode === 'time') {
    const now = new Date();
    const date = e.target.value;
    const inputTime24hrMask = props.masks?.inputTime24hr || 'HH:mm';

    if (inputTime24hrMask.length !== date.length) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    const hoursIndex = inputTime24hrMask?.indexOf('HH');
    const minutesIndex = inputTime24hrMask?.indexOf('mm');

    const hours = Number(date.substring(hoursIndex, hoursIndex + 2));
    const minutes = Number(date.substring(minutesIndex, minutesIndex + 2));

    const normalizedHours = zeroPad(hours);
    const normalizedMinutes = zeroPad(minutes);

    // Check if the constructed time is valid
    if (!isTimeValid(`${normalizedHours}:${normalizedMinutes}`)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    // Update the value with the valid date
    const updatedValue = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    emits('update:modelValue', updatedValue);
  }

  if (props.mode === 'date-time') {
    const date = e.target.value;
    const inputDateTime24hrMask = props.masks?.inputDateTime24hr || 'dd.MM.yyyy. HH:mm';

    if (inputDateTime24hrMask.length !== date.length) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    const dayIndex = inputDateTime24hrMask?.indexOf('dd');
    const monthIndex = inputDateTime24hrMask?.indexOf('MM');
    const yearIndex = inputDateTime24hrMask?.indexOf('yyyy');
    const hoursIndex = inputDateTime24hrMask?.indexOf('HH');
    const minutesIndex = inputDateTime24hrMask?.indexOf('mm');

    const day = date?.substring(dayIndex, dayIndex + 2);
    const month = date?.substring(monthIndex, monthIndex + 2);
    const year = date?.substring(yearIndex, yearIndex + 4);
    const hours = date?.substring(hoursIndex, hoursIndex + 2);
    const minutes = date?.substring(minutesIndex, minutesIndex + 2);

    const normalizedDay = zeroPad(day);
    const normalizedMonth = zeroPad(month);
    const normalizedHours = zeroPad(hours);
    const normalizedMinutes = zeroPad(minutes);
    const normalizedSeconds = zeroPad(0);

    const dateString = `${year}-${normalizedMonth}-${normalizedDay}`; // "YYYY-MM-DD"
    const timeString = `${normalizedHours}:${normalizedMinutes}:${normalizedSeconds}`; // "HH:mm"

    // Check if the constructed date and time is valid
    if (!isDateValid(dateString) || !isTimeValid(timeString)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
    }

    // Combine the date and time strings into a valid ISO string
    const dateTimeString = `${dateString}T${timeString}`;

    // Check if the date is within the min/max range
    if (!canSelectDate(new Date(dateTimeString), props.minDate, props.maxDate, props.mode)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      modelInput.value = null;
      return;
    }

    // Update the value with the valid date
    const updatedValue = new Date(dateTimeString);
    emits('update:modelValue', updatedValue);
  }
}

const handleFocusOut = (e) => {
  if (e.relatedTarget && !containerRef.value.contains(e.relatedTarget)) {
    dropDownMenuRef.value?.closeMenu();
  }
};

function handleOpen(type) {
  activeInput.value = type;
  // Prevent opening the menu again if it's already open
  if (!dropDownMenuRef.value?.menuOpen) {
    dropDownMenuRef.value?.openMenu();
  }
}

function handleClose() {
  activeInput.value = null;
  // Prevent closing the menu again if it's already close
  if (dropDownMenuRef.value?.menuOpen) {
    dropDownMenuRef.value?.closeMenu();
  }
}

// Helper function to format date according to mode
function formatDateByMode(date) {
  switch (props.mode) {
    case 'date':
      return formatInputRawDate(props.masks.input, date);
    case 'date-time':
      return formatInputRawDateTime(props.masks.inputDateTime24hr, date);
    case 'time':
      return formatInputRawTime(props.masks.inputTime24hr, date);
    case 'month':
      return getMonthNameByOrder(localizedMonthsList.value, date.getMonth(), true);
    case 'year':
      return date.getFullYear();
    case 'month-year':
      return getMonthYearString(props.locale, date?.getMonth(), date?.getFullYear());
    case 'quarters':
      return extractQuarterFromDate(date, props.masks.inputQuarters);
    default:
      return formatInputRawDate(props.masks.input, date);
  }
}

const placeholderComputed = computed(() => {
  if (props.placeholder !== null) {
    return props.placeholder;
  }
  switch (props.mode) {
    case 'date':
      return 'dd.mm.gggg.';
    case 'date-time':
      return 'dd.mm.gggg. st:mi';
    case 'time':
      return 'st:mi';
    default:
      return null;
  }
});

const isMobileScreen = computed(() => windowSize.width.value < 640);

// Computed determines offset amount for right popper placement in different modes
const offsetSkidByKind = computed(() => {
  if (isMobileScreen.value) return '0';

  if (props.mode === 'time' && props.pickerType === 'single') return '0';
  if (props.mode === 'date-time' && props.pickerType === 'single') return '144';
  if (props.mode === 'month' && props.pickerType === 'single') return '40';
  if (props.mode === 'month-year' && props.pickerType === 'single') return '60';
  if (props.mode === 'quarters' && props.pickerType === 'single') return '89';

  if (props.mode === 'date' && props.pickerType === 'range') return '147';
  if (props.mode === 'month' && props.pickerType === 'range') return '0';
  if (props.mode === 'year' && props.pickerType === 'range') return '0';
  if (props.mode === 'month-year' && props.pickerType === 'range') return '147';
  if (props.mode === 'quarters' && props.pickerType === 'range') return '0';

  return '88';
});

const mode = computed(() => props.mode);

const startInputIndex = computed(() => {
  if (activeInput.value === 'endInput' && dropDownMenuRef.value?.menuOpen) return '-1';
  return '0';
});

const endInputIndex = computed(() => {
  if (activeInput.value === 'startInput' && dropDownMenuRef.value?.menuOpen) return '-1';
  return '0';
});

watch(
  () => [props.locale, props.firstDayOfTheWeek],
  /**
   * @param {[string, number]} newValues
   */
  ([newLocaleVal, newFirstDayVal]) => {
    localizedMonthsList.value = getMonthNames(newLocaleVal);
    weekDaysList.value = getWeekdayNames(newLocaleVal, newFirstDayVal);
  },
  { immediate: true }
);

watch(
  () => [props.minDate, props.maxDate],
  ([newMinDate, newMaxDate]) => {
    if (newMinDate) {
      const parsedMinDate = parseDate(newMinDate);
      if (parsedMinDate) {
        minDateRef.value = new Date(parsedMinDate);
      }
    } else {
      minDateRef.value = null;
    }

    if (newMaxDate) {
      const parsedMaxDate = parseDate(newMaxDate);
      if (parsedMaxDate) {
        maxDateRef.value = new Date(parsedMaxDate);
      }
    } else {
      maxDateRef.value = null;
    }
  },
  { immediate: true }
);

// Watcher to modelValue changes to format input value
watch(
  () => props.modelValue,
  (newValue) => {
    if ((newValue === null || newValue === undefined) && props.pickerType === 'single') {
      modelInput.value = null;
      return;
    }
    if (
      (newValue === null || newValue === undefined || (!newValue.start && !newValue.end)) &&
      props.pickerType === 'range'
    ) {
      modelInput.value = null;
      modelEndDateInput.value = null;
      return;
    }

    // Handle single and range picker types
    if (props.pickerType === 'single') {
      // Process the single value based on mode
      modelInput.value = formatDateByMode(newValue);
    }
    if (props.pickerType === 'range') {
      // For range date picker, process both start and end dates
      if (newValue.start && newValue.end) {
        const formattedStart = formatDateByMode(newValue.start);
        const formattedEnd = formatDateByMode(newValue.end);
        modelInput.value = formattedStart;
        modelEndDateInput.value = formattedEnd;
      } else if (newValue.start && !newValue.end) {
        // When only the start date is selected
        const formattedStart = formatDateByMode(newValue.start);
        modelInput.value = formattedStart;
        modelEndDateInput.value = null;
      } else if (!newValue.start && newValue.end) {
        // When only the end date is selected
        const formattedEnd = formatDateByMode(newValue.end);
        modelInput.value = null;
        modelEndDateInput.value = formattedEnd;
      } else {
        // In case of no valid range, clear the input
        modelInput.value = null;
        modelEndDateInput.value = null;
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.mode,
  () => {
    // Watch for mode change and reset input
    modelInput.value = null; // Clear input when switching modes
    modelEndDateInput.value = null;
    model.value = null;
  }
);

watch(
  () => dropDownMenuRef.value?.menuOpen,
  (newValue) => {
    if (!newValue) {
      activeInput.value = null;
    }
  }
);

onMounted(async () => {
  localizedMonthsList.value = getMonthNames(props.locale);
  weekDaysList.value = getWeekdayNames(props.locale, props.firstDayOfTheWeek);
});
</script>

<template>
  <div ref="containerRef" class="lx-datepicker-default" @focusout="handleFocusOut">
    <LxDropDownMenu
      v-if="variant === 'default'"
      ref="dropDownMenuRef"
      :offset-skid="offsetSkidByKind"
      :disabled="disabled"
      :preventClickAway="true"
    >
      <div
        class="lx-datepicker-input-container"
        :class="[{ range: pickerType === 'range' }]"
        @click="dropDownMenuRef?.preventClose"
        @keydown="dropDownMenuRef?.preventClose"
      >
        <div class="lx-start-input-and-separator-wrapper">
          <label class="lx-visually-hidden" :for="id"></label>
          <input
            type="text"
            class="lx-date-time-picker"
            :class="[{ 'lx-invalid': invalid }, { 'input-active': activeInput === 'startInput' }]"
            :value="modelInput"
            :id="id"
            :placeholder="placeholderComputed"
            :disabled="disabled"
            autocomplete="off"
            :readonly="
              mode === 'month' || mode === 'year' || mode === 'month-year' || mode === 'quarters'
            "
            :tabindex="startInputIndex"
            @click="handleOpen('startInput')"
            @keydown.arrow-down.prevent="handleOpen('startInput')"
            @keydown.esc.prevent="handleClose"
            @change="validateIfExact($event, 'startInput')"
          />

          <template v-if="pickerType === 'range'">
            <span class="lx-date-time-range-separator"> - </span>
          </template>
        </div>

        <template v-if="pickerType === 'range'">
          <label class="lx-visually-hidden" :for="id"></label>
          <input
            type="text"
            class="lx-date-time-picker"
            :class="[{ 'lx-invalid': invalid }, { 'input-active': activeInput === 'endInput' }]"
            :value="modelEndDateInput"
            :id="id"
            :placeholder="placeholderComputed"
            :disabled="disabled"
            autocomplete="off"
            :readonly="
              mode === 'month' || mode === 'year' || mode === 'month-year' || mode === 'quarters'
            "
            :tabindex="endInputIndex"
            @click="handleOpen('endInput')"
            @keydown.arrow-down.prevent="handleOpen('endInput')"
            @keydown.esc.prevent="handleClose"
            @change="validateIfExact($event, 'endInput')"
          />
        </template>
      </div>

      <template #clickSafePanel>
        <LxCalendarContainer
          v-model="model"
          :mode="mode"
          :variant="variant"
          :disabled="disabled"
          :locale="locale"
          :special-dates-attributes="specialDatesAttributes"
          :first-day-of-the-week="firstDayOfTheWeek"
          :localized-months-list="localizedMonthsList"
          :week-days-list="weekDaysList"
          :minDateRef="minDateRef"
          :maxDateRef="maxDateRef"
          :closeMenu="dropDownMenuRef?.closeMenu"
          :openMenu="dropDownMenuRef?.openMenu"
          :menuState="dropDownMenuRef?.menuOpen"
          :cadenceOfMinutes="cadenceOfMinutes"
          :clearIfNotExact="clearIfNotExact"
          :pickerType="pickerType"
          :activeInput="activeInput"
          :texts="texts"
        />
      </template>
    </LxDropDownMenu>

    <LxCalendarContainer
      v-if="
        variant === 'picker' ||
        variant === 'full' ||
        variant === 'full-rows' ||
        variant === 'full-columns'
      "
      v-model="model"
      :mode="mode"
      :variant="variant"
      :disabled="disabled"
      :locale="locale"
      :special-dates-attributes="specialDatesAttributes"
      :first-day-of-the-week="firstDayOfTheWeek"
      :localized-months-list="localizedMonthsList"
      :week-days-list="weekDaysList"
      :minDateRef="minDateRef"
      :maxDateRef="maxDateRef"
      :cadenceOfMinutes="cadenceOfMinutes"
      :clearIfNotExact="clearIfNotExact"
      :pickerType="pickerType"
      :texts="texts"
    />
  </div>
</template>
