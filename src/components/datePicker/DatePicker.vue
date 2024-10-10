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
  modelValue: { type: [String, Date], default: null },
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
  texts: {
    type: Object,
    default: () => ({
      clear: 'Attīrīt',
      todayButton: 'Šodiena',
      clearButton: 'Attīrīt vērtību',
      next: 'Nākošais',
      previous: 'Iepriekšējais',
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

const windowSize = useWindowSize();

function validateIfExact(e) {
  if (!e.target.value) {
    emits('update:modelValue', null);
    return;
  }

  if (props.mode === 'date') {
    const date = e.target.value;
    const inputMask = props.masks?.input || 'dd.MM.yyyy.';

    if (inputMask.length !== date.length) {
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

    // Check if the constructed date is valid
    if (!isDateValid(`${year}-${normalizedMonth}-${normalizedDay}`)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    // Check if the date is within the min/max range
    if (
      !canSelectDate(
        new Date(`${year}-${normalizedMonth}-${normalizedDay}`),
        props.minDate,
        props.maxDate,
        'date'
      )
    ) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }
    // Update the value with the valid date
    const updatedValue = new Date(year, month - 1, day);
    emits('update:modelValue', updatedValue);
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

const handleFocusOut = (e) => {
  if (e.relatedTarget && !containerRef.value.contains(e.relatedTarget)) {
    dropDownMenuRef.value?.closeMenu();
  }
};

function handleOpen() {
  // Prevent opening the menu again if it's already open
  if (!dropDownMenuRef.value?.menuOpen) {
    dropDownMenuRef.value?.openMenu();
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

const isMobileScreen = computed(() => windowSize.width.value < 450);

// Computed determines offset amount for right popper placement in different modes
const offsetSkidByKind = computed(() => {
  if (isMobileScreen.value) return '0';

  if (props.mode === 'time') return '0';
  if (props.mode === 'date-time') return '144';
  if (props.mode === 'month') return '40';
  if (props.mode === 'month-year') return '60';
  if (props.mode === 'quarters') return '89';

  return '88';
});

const mode = computed(() => props.mode);

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
    if (newValue === null || newValue === undefined) {
      modelInput.value = null;
      return;
    }

    switch (props.mode) {
      case 'date':
        modelInput.value = formatInputRawDate(props.masks.input, newValue);
        break;
      case 'date-time':
        modelInput.value = formatInputRawDateTime(props.masks.inputDateTime24hr, newValue);
        break;
      case 'time':
        modelInput.value = formatInputRawTime(props.masks.inputTime24hr, newValue);
        break;
      case 'month':
        modelInput.value = getMonthNameByOrder(
          localizedMonthsList.value,
          newValue.getMonth(),
          true
        );
        break;
      case 'year':
        modelInput.value = newValue.getFullYear();
        break;
      case 'month-year': {
        modelInput.value = getMonthYearString(
          props.locale,
          newValue?.getMonth(),
          newValue?.getFullYear()
        );
        break;
      }
      case 'quarters':
        modelInput.value = extractQuarterFromDate(newValue, props.masks.inputQuarters);
        break;

      default:
        modelInput.value = formatInputRawDate(props.masks.input, newValue);
        break;
    }
  },
  { immediate: true }
);

watch(
  () => props.mode,
  () => {
    // Watch for mode change and reset input
    modelInput.value = ''; // Clear input when switching modes
    model.value = null;
  }
);

onMounted(async () => {
  localizedMonthsList.value = getMonthNames(props.locale);
  weekDaysList.value = getWeekdayNames(props.locale, props.firstDayOfTheWeek);
});
</script>

<template>
  <div
    ref="containerRef"
    class="lx-datepicker-default"
    @focusout="handleFocusOut"
    @focusin="handleOpen"
  >
    <LxDropDownMenu
      v-if="variant === 'default'"
      ref="dropDownMenuRef"
      :offset-skid="offsetSkidByKind"
      :disabled="disabled"
      :preventClickAway="true"
    >
      <div
        class="lx-datepicker-input-container"
        @click="dropDownMenuRef?.preventClose"
        @keydown="dropDownMenuRef?.preventClose"
      >
        <label class="lx-visually-hidden" :for="id"></label>
        <input
          type="text"
          class="lx-date-time-picker"
          :value="modelInput"
          :id="id"
          :placeholder="placeholderComputed"
          :disabled="disabled"
          :class="[{ 'lx-invalid': invalid }]"
          autocomplete="off"
          :readonly="
            mode === 'month' || mode === 'year' || mode === 'month-year' || mode === 'quarters'
          "
          @click="handleOpen"
          @keydown="handleOpen"
          @change="validateIfExact"
        />
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
      :texts="texts"
    />
  </div>
</template>
