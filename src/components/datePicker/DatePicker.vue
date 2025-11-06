<script setup>
import { ref, computed, watch, onMounted, inject, nextTick } from 'vue';
import { useMediaQuery, useWindowSize } from '@vueuse/core';
import { getDisplayTexts } from '@/utils/generalUtils';

import {
  parseDate,
  getMonthNames,
  getWeekdayNames,
  getMonthYearString,
  isDateValid,
  isTimeValid,
  formatLocalizedDate,
  isTimeFullValid,
} from '@/utils/dateUtils';
import {
  getMonthNameByOrder,
  formatInputRawDate,
  formatInputRawDateTime,
  formatInputRawTime,
  canSelectDate,
  zeroPad,
  extractQuarterFromDate,
  validateDateByMask,
  removeLastNonAlphanumeric,
  sanitizeDateInput,
  formatInputRawTimeFull,
  formatInputRawDateTimeFull,
  validateDateRange,
} from '@/components/datePicker/helpers';
import { DATE_VALIDATION_RESULT } from '@/constants';
import LxCalendarContainer from '@/components/datePicker/CalendarContainer.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [String, Date, Object], default: null },
  mode: { type: String, default: 'date' }, // 'date', 'time', 'time-full', 'date-time', 'date-time-full', 'month', 'year', 'month-year', 'quarters',
  variant: { type: String, default: 'default' }, // 'default', 'picker', 'full', 'full-rows', 'full-columns'
  masks: { type: Object, default: () => {} },
  placeholder: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  minDate: { type: [String, Date], default: null },
  maxDate: { type: [String, Date], default: null },
  required: { type: Boolean, default: false },
  locale: { type: String, default: 'lv-LV' },
  firstDayOfTheWeek: { type: Number, default: 2 },
  specialDatesAttributes: { type: Array, default: null },
  clearIfNotExact: { type: Boolean, default: false },
  cadenceOfMinutes: { type: Number, default: 1 }, // 1, 5, 15
  cadenceOfSeconds: { type: Number, default: 1 }, // 1, 5, 15
  pickerType: { type: String, default: 'single' }, // 'single', 'range'
  labelledBy: { type: String, default: null },
  legacyMode: { type: Boolean, default: false }, // legacy mode flag to separate logic without breaking date mode flow and validations
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
  startDateLabel: 'Sākuma datums',
  endDateLabel: 'Beigu datums',
  dateFormatMessage: 'Datuma formāts ir diena, mēnesis, gads, atdalīts ar punktu',
  selectedStartDate: 'Izvēlēts sākuma datums',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue', 'outOfRange']);

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

// Refs for active input state handling
const activeInput = ref(null);
const startInputRefs = ref({});
const endInputRefs = ref({});

const liveMessage = ref('');
const inputDescriptionMsg = ref(displayTexts.value.dateFormatMessage);

const tapStage = ref(0);

const windowSize = useWindowSize();

const isTouchSensitive = inject('isTouchMode', ref(false));
const isTouchMode = useMediaQuery('(pointer: coarse), (pointer: none)');

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

function setActiveInput(type, id, defaultFocus = true) {
  activeInput.value = type;

  if (isTouchSensitive.value && defaultFocus) return;

  if (startInputRefs.value[id] && type === 'startInput') {
    startInputRefs.value[id].focus();
    return;
  }
  if (endInputRefs.value[id] && type === 'endInput') {
    endInputRefs.value[id].focus();
    endInputRefs.value[id].select();
  }
}

function validateIfExact(e, type = 'startInput') {
  if (props.pickerType === 'single' && !e.target.value) {
    emits('update:modelValue', null);
    return;
  }

  if (props.mode === 'date') {
    const date = e.target.value;
    const inputMask = props.masks?.input || 'dd.MM.yyyy.';

    const cleanedDate = removeLastNonAlphanumeric(date);
    const cleanedMask = removeLastNonAlphanumeric(inputMask);

    if (date && !validateDateByMask(cleanedDate, cleanedMask)) {
      if (props.pickerType === 'range') {
        if (type === 'startInput' && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'startInput' && !model.value.end && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'endInput' && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'endInput' && !model.value.end && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
      }

      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newDay = new Date().getDate();
      const newMonth = new Date().getMonth();
      const newYear = new Date().getFullYear();

      const newDateString = inputMask
        .replace('dd', zeroPad(newDay))
        .replace('MM', zeroPad(newMonth + 1))
        .replace('yyyy', newYear);

      e.target.value = props.clearIfNotExact ? null : newDateString;
      return;
    }

    const dayIndex = cleanedMask?.indexOf('dd');
    const monthIndex = cleanedMask?.indexOf('MM');
    const yearIndex = cleanedMask?.indexOf('yyyy');

    const day = Number(cleanedDate.substring(dayIndex, dayIndex + 2));
    const month = Number(cleanedDate.substring(monthIndex, monthIndex + 2));
    const year = Number(cleanedDate.substring(yearIndex, yearIndex + 4));

    const normalizedDay = zeroPad(day);
    const normalizedMonth = zeroPad(month);

    const dateString = `${year}-${normalizedMonth}-${normalizedDay}`; // "YYYY-MM-DD"

    // Check if the constructed date is valid
    if (day && month && year && !isDateValid(new Date(dateString))) {
      if (props.pickerType === 'range') {
        if (type === 'startInput' && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
        if (type === 'startInput' && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'endInput' && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
        if (type === 'endInput' && !model.value.start) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
      }

      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newDay = new Date().getDate();
      const newMonth = new Date().getMonth();
      const newYear = new Date().getFullYear();

      const newDateString = inputMask
        .replace('dd', zeroPad(newDay))
        .replace('MM', zeroPad(newMonth + 1))
        .replace('yyyy', newYear);

      e.target.value = props.clearIfNotExact ? null : newDateString;
      return;
    }
    const dateRangeValidationResult = validateDateRange(
      new Date(dateString),
      props.minDate,
      props.maxDate
    );

    // Check if the date is within the min/max range
    if (
      day &&
      month &&
      year &&
      dateRangeValidationResult !== DATE_VALIDATION_RESULT.VALID &&
      dateRangeValidationResult !== DATE_VALIDATION_RESULT.NO_VALUE
    ) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      if (
        [DATE_VALIDATION_RESULT.OUT_OF_RANGE_MAX, DATE_VALIDATION_RESULT.OUT_OF_RANGE_MIN].includes(
          // @ts-ignore TS2345:: value narrowed at runtime via includes();
          dateRangeValidationResult
        )
      ) {
        emits('outOfRange', dateRangeValidationResult);
      }
      emits('update:modelValue', updatedValue);

      const newDay = new Date().getDate();
      const newMonth = new Date().getMonth();
      const newYear = new Date().getFullYear();

      const newDateString = inputMask
        .replace('dd', zeroPad(newDay))
        .replace('MM', zeroPad(newMonth + 1))
        .replace('yyyy', newYear);

      e.target.value = props.clearIfNotExact ? null : newDateString;
      return;
    }

    // Update the value with the valid date
    const updatedValue = day && month && year ? new Date(year, month - 1, day) : null;

    if (props.pickerType === 'single') {
      emits('update:modelValue', updatedValue);
    }

    if (props.pickerType === 'range') {
      if (type === 'startInput') {
        if (!updatedValue && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
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
          let updatedDatesObject = {
            start: updatedValue,
            end: model.value.end,
          };

          if (updatedValue > model.value.end) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
          }

          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
          return;
        }
        if (updatedValue && !model.value.start && model.value.end) {
          let updatedDatesObject = {
            start: updatedValue,
            end: model.value.end,
          };

          if (updatedValue > model.value.end) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
          }
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
          return;
        }
        if (updatedValue && !model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
          return;
        }
      }

      if (type === 'endInput') {
        if (!updatedValue && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
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
          let updatedDatesObject = {
            start: model.value.start,
            end: updatedValue,
          };

          if (updatedValue < model.value.start) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
            liveMessage.value = `${displayTexts.value.selectedStartDate}: ${formatLocalizedDate(
              props.locale,
              updatedValue
            )}`;
          }

          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && !model.value.end) {
          let updatedDatesObject = {
            start: model.value.start,
            end: updatedValue,
          };

          if (updatedValue < model.value.start) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
            liveMessage.value = `${displayTexts.value.selectedStartDate}: ${formatLocalizedDate(
              props.locale,
              updatedValue
            )}`;
          }
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && !model.value.start && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('startInput', props.id);
          return;
        }
        if (updatedValue && !model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: null,
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
    const time = e.target.value;
    const inputTime24hrMask = props.masks?.inputTime24hr || 'HH:mm';

    if (inputTime24hrMask.length !== time.length || !validateDateByMask(time, inputTime24hrMask)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newHours = new Date().getHours();
      const newMinutes = new Date().getMinutes();

      const newTimeString = inputTime24hrMask
        .replace('HH', zeroPad(newHours))
        .replace('mm', zeroPad(newMinutes));

      e.target.value = props.clearIfNotExact ? null : newTimeString;
      return;
    }

    const hoursIndex = inputTime24hrMask?.indexOf('HH');
    const minutesIndex = inputTime24hrMask?.indexOf('mm');

    const hours = Number(time.substring(hoursIndex, hoursIndex + 2));
    const minutes = Number(time.substring(minutesIndex, minutesIndex + 2));

    const normalizedHours = zeroPad(hours);
    const normalizedMinutes = zeroPad(minutes);

    // Check if the constructed time is valid
    if (!isTimeValid(`${normalizedHours}:${normalizedMinutes}`)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newHours = new Date().getHours();
      const newMinutes = new Date().getMinutes();

      const newTimeString = inputTime24hrMask
        .replace('HH', zeroPad(newHours))
        .replace('mm', zeroPad(newMinutes));

      e.target.value = props.clearIfNotExact ? null : newTimeString;
      return;
    }

    // Update the value with the valid date
    const updatedValue = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    emits('update:modelValue', updatedValue);
  }

  if (props.mode === 'time-full') {
    const now = new Date();
    const timeFull = e.target.value;
    const inputTimeFull24hrMask = props.masks?.inputTimeFull24hr || 'HH:mm:ss';

    if (
      inputTimeFull24hrMask.length !== timeFull.length ||
      !validateDateByMask(timeFull, inputTimeFull24hrMask)
    ) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newHours = new Date().getHours();
      const newMinutes = new Date().getMinutes();
      const newSeconds = new Date().getSeconds();

      const newTimeString = inputTimeFull24hrMask
        .replace('HH', zeroPad(newHours))
        .replace('mm', zeroPad(newMinutes))
        .replace('ss', zeroPad(newSeconds));

      e.target.value = props.clearIfNotExact ? null : newTimeString;
      return;
    }

    const hoursIndex = inputTimeFull24hrMask?.indexOf('HH');
    const minutesIndex = inputTimeFull24hrMask?.indexOf('mm');
    const secondsIndex = inputTimeFull24hrMask?.indexOf('ss');

    const hours = Number(timeFull.substring(hoursIndex, hoursIndex + 2));
    const minutes = Number(timeFull.substring(minutesIndex, minutesIndex + 2));
    const seconds = Number(timeFull.substring(secondsIndex, secondsIndex + 2));

    const normalizedHours = zeroPad(hours);
    const normalizedMinutes = zeroPad(minutes);
    const normalizedSeconds = zeroPad(seconds);

    // Check if the constructed time is valid
    if (!isTimeFullValid(`${normalizedHours}:${normalizedMinutes}:${normalizedSeconds}`)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newHours = new Date().getHours();
      const newMinutes = new Date().getMinutes();
      const newSeconds = new Date().getSeconds();

      const newTimeString = inputTimeFull24hrMask
        .replace('HH', zeroPad(newHours))
        .replace('mm', zeroPad(newMinutes))
        .replace('ss', zeroPad(newSeconds));

      e.target.value = props.clearIfNotExact ? null : newTimeString;
      return;
    }

    // Update the value with the valid date
    const updatedValue = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      seconds
    );

    emits('update:modelValue', updatedValue);
  }

  if (props.mode === 'date-time') {
    const dateTime = e.target.value;
    const inputDateTime24hrMask = props.masks?.inputDateTime24hr || 'dd.MM.yyyy. HH:mm';

    const [date, time] = dateTime.split(' ');
    const [dateMask, timeMask] = inputDateTime24hrMask.split(' ');

    const cleanedDate = removeLastNonAlphanumeric(date);
    const cleanedMask = removeLastNonAlphanumeric(dateMask);

    const constructedDateTimeString = `${cleanedDate} ${time}`;
    const constructedMaskString = `${cleanedMask} ${timeMask}`;

    if (
      (dateTime && !validateDateByMask(constructedDateTimeString, constructedMaskString)) ||
      timeMask.length !== time.length ||
      cleanedDate.length !== cleanedMask.length
    ) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newDay = new Date().getDate();
      const newMonth = new Date().getMonth();
      const newYear = new Date().getFullYear();
      const newHours = new Date().getHours();
      const newMinutes = new Date().getMinutes();

      const newDateTimeString = inputDateTime24hrMask
        .replace('dd', zeroPad(newDay))
        .replace('MM', zeroPad(newMonth + 1))
        .replace('yyyy', newYear)
        .replace('HH', newHours)
        .replace('mm', newMinutes);

      e.target.value = props.clearIfNotExact ? null : newDateTimeString;
      return;
    }

    const dayIndex = constructedMaskString?.indexOf('dd');
    const monthIndex = constructedMaskString?.indexOf('MM');
    const yearIndex = constructedMaskString?.indexOf('yyyy');
    const hoursIndex = constructedMaskString?.indexOf('HH');
    const minutesIndex = constructedMaskString?.indexOf('mm');

    const day = constructedDateTimeString?.substring(dayIndex, dayIndex + 2);
    const month = constructedDateTimeString?.substring(monthIndex, monthIndex + 2);
    const year = constructedDateTimeString?.substring(yearIndex, yearIndex + 4);
    const hours = constructedDateTimeString?.substring(hoursIndex, hoursIndex + 2);
    const minutes = constructedDateTimeString?.substring(minutesIndex, minutesIndex + 2);

    const normalizedDay = zeroPad(day);
    const normalizedMonth = zeroPad(month);
    const normalizedHours = zeroPad(hours);
    const normalizedMinutes = zeroPad(minutes);
    const normalizedSeconds = zeroPad(0);

    const dateString = `${year}-${normalizedMonth}-${normalizedDay}`; // "YYYY-MM-DD"
    const timeString = `${normalizedHours}:${normalizedMinutes}`; // "HH:mm"
    const fullTimeString = `${normalizedHours}:${normalizedMinutes}:${normalizedSeconds}`; // "HH:mm:ss"

    // Check if the constructed date and time is valid
    if (!isDateValid(dateString) || !isTimeValid(timeString)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    // Combine the date and time strings into a valid ISO string
    const dateTimeString = `${dateString}T${fullTimeString}`;

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

  if (props.mode === 'date-time-full') {
    const dateTimeFull = e.target.value;
    const inputDateTimeFull24hrMask = props.masks?.inputDateTimeFull24hr || 'dd.MM.yyyy. HH:mm:ss';

    const [date, time] = dateTimeFull.split(' ');
    const [dateMask, timeMask] = inputDateTimeFull24hrMask.split(' ');

    const cleanedDate = removeLastNonAlphanumeric(date);
    const cleanedMask = removeLastNonAlphanumeric(dateMask);

    const constructedDateTimeString = `${cleanedDate} ${time}`;
    const constructedMaskString = `${cleanedMask} ${timeMask}`;

    if (
      (dateTimeFull && !validateDateByMask(constructedDateTimeString, constructedMaskString)) ||
      timeMask.length !== time.length ||
      cleanedDate.length !== cleanedMask.length
    ) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      const newDay = new Date().getDate();
      const newMonth = new Date().getMonth();
      const newYear = new Date().getFullYear();
      const newHours = new Date().getHours();
      const newMinutes = new Date().getMinutes();
      const newSeconds = new Date().getSeconds();

      const newDateTimeFullString = inputDateTimeFull24hrMask
        .replace('dd', zeroPad(newDay))
        .replace('MM', zeroPad(newMonth + 1))
        .replace('yyyy', newYear)
        .replace('HH', newHours)
        .replace('mm', newMinutes)
        .replace('ss', newSeconds);

      e.target.value = props.clearIfNotExact ? null : newDateTimeFullString;
      return;
    }

    const dayIndex = constructedMaskString?.indexOf('dd');
    const monthIndex = constructedMaskString?.indexOf('MM');
    const yearIndex = constructedMaskString?.indexOf('yyyy');
    const hoursIndex = constructedMaskString?.indexOf('HH');
    const minutesIndex = constructedMaskString?.indexOf('mm');
    const secondsIndex = constructedMaskString?.indexOf('ss');

    const day = constructedDateTimeString?.substring(dayIndex, dayIndex + 2);
    const month = constructedDateTimeString?.substring(monthIndex, monthIndex + 2);
    const year = constructedDateTimeString?.substring(yearIndex, yearIndex + 4);
    const hours = constructedDateTimeString?.substring(hoursIndex, hoursIndex + 2);
    const minutes = constructedDateTimeString?.substring(minutesIndex, minutesIndex + 2);
    const seconds = constructedDateTimeString?.substring(secondsIndex, secondsIndex + 2);

    const normalizedDay = zeroPad(day);
    const normalizedMonth = zeroPad(month);
    const normalizedHours = zeroPad(hours);
    const normalizedMinutes = zeroPad(minutes);
    const normalizedSeconds = zeroPad(seconds);

    const dateString = `${year}-${normalizedMonth}-${normalizedDay}`; // "YYYY-MM-DD"
    const fullTimeString = `${normalizedHours}:${normalizedMinutes}:${normalizedSeconds}`; // "HH:mm:ss"

    // Check if the constructed date and time is valid
    if (!isDateValid(dateString) || !isTimeFullValid(fullTimeString)) {
      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);
      return;
    }

    // Combine the date and time strings into a valid ISO string
    const dateTimeString = `${dateString}T${fullTimeString}`;

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

  if (props.mode === 'year') {
    const now = new Date();
    const year = e.target.value;
    const inputYear = props.masks?.inputYear || 'yyyy';

    if (inputYear.length !== year.length || !validateDateByMask(year, inputYear)) {
      if (props.pickerType === 'range') {
        if (type === 'startInput' && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'startInput' && !model.value.end && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'endInput' && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'endInput' && !model.value.end && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
      }

      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      e.target.value = props.clearIfNotExact ? null : now.getFullYear();
      return;
    }

    const dateString = `${year}-${1}-${1}`; // "YYYY-MM-DD"

    // Check if the year is within the min/max range
    if (year && !canSelectDate(new Date(dateString), props.minDate, props.maxDate, 'year')) {
      if (props.pickerType === 'range') {
        if (type === 'startInput' && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
        if (type === 'startInput' && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }

        if (type === 'endInput' && model.value.start) {
          const updatedDatesObject = {
            start: model.value.start,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
        if (type === 'endInput' && !model.value.start) {
          const updatedDatesObject = {
            start: null,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          e.target.value = null;
          return;
        }
      }

      const updatedValue = props.clearIfNotExact ? null : new Date();
      emits('update:modelValue', updatedValue);

      e.target.value = props.clearIfNotExact ? null : now.getFullYear();
      return;
    }

    // Update the value with the valid date
    const updatedValue = new Date(year, 1, 1, 0, 0);

    if (props.pickerType === 'single') {
      emits('update:modelValue', updatedValue);
    }
    if (props.pickerType === 'range') {
      if (type === 'startInput') {
        if (!updatedValue && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: model.value.end,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
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
          let updatedDatesObject = {
            start: updatedValue,
            end: model.value.end,
          };

          if (updatedValue > model.value.end) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
          }

          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
          return;
        }
        if (updatedValue && !model.value.start && model.value.end) {
          let updatedDatesObject = {
            start: updatedValue,
            end: model.value.end,
          };

          if (updatedValue > model.value.end) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
          }
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
          return;
        }
        if (updatedValue && !model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: updatedValue,
            end: null,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('endInput', props.id);
          return;
        }
      }

      if (type === 'endInput') {
        if (!updatedValue && model.value.start) {
          const updatedDatesObject = {
            start: props.modelValue.start,
            end: null,
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
          let updatedDatesObject = {
            start: model.value.start,
            end: updatedValue,
          };

          if (updatedValue < model.value.start) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
            setActiveInput('endInput', props.id);
          }

          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && model.value.start && !model.value.end) {
          let updatedDatesObject = {
            start: model.value.start,
            end: updatedValue,
          };

          if (updatedValue < model.value.start) {
            updatedDatesObject = {
              start: updatedValue,
              end: null,
            };
          }
          emits('update:modelValue', updatedDatesObject);
          return;
        }
        if (updatedValue && !model.value.start && model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
          setActiveInput('startInput', props.id);
          return;
        }
        if (updatedValue && !model.value.start && !model.value.end) {
          const updatedDatesObject = {
            start: null,
            end: updatedValue,
          };
          emits('update:modelValue', updatedDatesObject);
        }
      }
    }
  }
}

function openMenu(type) {
  if (props.disabled) return;
  activeInput.value = type;
  dropDownMenuRef.value?.openMenu();
}

function closeMenu() {
  activeInput.value = null;
  tapStage.value = 0;
  dropDownMenuRef.value?.closeMenu();
}

function blurActiveElement() {
  nextTick(() => {
    const el = document.activeElement;
    if (el && typeof el.blur === 'function') el.blur();
  });
}

function handleTouchToggle(isOpen, type) {
  if (!isOpen) {
    tapStage.value = 1;
    openMenu(type);
    return;
  }

  switch (tapStage.value) {
    case 1:
      tapStage.value = 2;
      nextTick(() => setActiveInput(type, props.id, false));
      break;

    case 2:
      if (activeInput.value !== type) {
        nextTick(() => setActiveInput(type, props.id, false));
      } else {
        closeMenu();
        blurActiveElement();
      }
      break;

    default:
      tapStage.value = 0;
      closeMenu();
      blurActiveElement();
      break;
  }
}

function handleDesktopToggle(isOpen, type) {
  if (!isOpen) {
    openMenu(type);
  } else {
    closeMenu();
  }
}

function toggleMenu(e, type) {
  if (props.disabled) return;

  const menu = dropDownMenuRef.value;
  const isOpen = menu?.menuOpen;

  if (!isTouchSensitive.value) {
    handleDesktopToggle(isOpen, type);
    return;
  }

  handleTouchToggle(isOpen, type);
}

function preventDefaultFocus(e) {
  if (isTouchSensitive.value && !isTouchMode.value) {
    e.preventDefault();
  }
}

function onTouchStart(e, type) {
  if (isTouchSensitive.value) {
    e.preventDefault();
    toggleMenu(e, type);
  }
}

// Helper function to format date according to mode
function formatDateByMode(date) {
  switch (props.mode) {
    case 'date':
      return formatInputRawDate(props.masks.input, date);
    case 'date-time':
      return formatInputRawDateTime(props.masks.inputDateTime24hr, date);
    case 'date-time-full':
      return formatInputRawDateTimeFull(props.masks.inputDateTimeFull24hr, date);
    case 'time':
      return formatInputRawTime(props.masks.inputTime24hr, date);
    case 'time-full':
      return formatInputRawTimeFull(props.masks.inputTimeFull24hr, date);
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
    case 'time-full':
      return 'st:mi:ss';
    default:
      return null;
  }
});

const isMobileScreen = computed(() => windowSize.width.value < 640);

const computedPlacement = computed(() => {
  if (isMobileScreen.value) return 'bottom';
  return 'bottom-start';
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

// Function to determine maxLength based on mode
const getMaxLength = computed(() => {
  if (mode.value === 'date') {
    const inputMask = props.masks?.input || 'dd.MM.yyyy.';
    return inputMask.length;
  }
  if (mode.value === 'time') {
    const inputTime24hrMask = props.masks?.inputTime24hr || 'HH:mm';
    return inputTime24hrMask.length;
  }
  if (mode.value === 'time-full') {
    const inputTime24hrMask = props.masks?.inputTimeFull24hr || 'HH:mm:ss';
    return inputTime24hrMask.length;
  }
  if (mode.value === 'date-time') {
    const inputDateTime24hrMask = props.masks?.inputDateTime24hr || 'dd.MM.yyyy. HH:mm';
    return inputDateTime24hrMask.length;
  }
  if (mode.value === 'date-time-full') {
    const inputDateTime24hrMask = props.masks?.inputDateTimeFull24hr || 'dd.MM.yyyy. HH:mm:ss';
    return inputDateTime24hrMask.length;
  }
  return null; // No limit if not a specific mode
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
  () => [props.minDate, props.maxDate, props.mode],
  ([newMinDate, newMaxDate]) => {
    if (newMinDate) {
      const parsedMinDate = parseDate(newMinDate);
      if (parsedMinDate) {
        let normalizedMinDate;
        if (props.mode === 'time-full' || props.mode === 'date-time-full') {
          normalizedMinDate = parsedMinDate.setMilliseconds(0);
        } else {
          normalizedMinDate = parsedMinDate.setSeconds(0, 0);
        }
        minDateRef.value = new Date(normalizedMinDate);
      }
    } else {
      minDateRef.value = null;
    }

    if (newMaxDate) {
      const parsedMaxDate = parseDate(newMaxDate);
      if (parsedMaxDate) {
        let normalizedMaxDate;
        if (props.mode === 'time-full' || props.mode === 'date-time-full') {
          normalizedMaxDate = parsedMaxDate.setMilliseconds(0);
        } else {
          normalizedMaxDate = parsedMaxDate.setSeconds(0, 0);
        }
        maxDateRef.value = new Date(normalizedMaxDate);
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
      tapStage.value = 0;
    }
  }
);

onMounted(async () => {
  localizedMonthsList.value = getMonthNames(props.locale);
  weekDaysList.value = getWeekdayNames(props.locale, props.firstDayOfTheWeek);
});
</script>

<template>
  <div ref="containerRef" class="lx-datepicker-default">
    <div :id="`${id}-lx-range-input-description`" class="lx-invisible">
      {{ inputDescriptionMsg }}
    </div>

    <div
      :id="`${id}-announce`"
      class="lx-invisible"
      aria-live="assertive"
      role="status"
      aria-atomic="true"
    >
      {{ liveMessage }}
    </div>

    <LxDropDownMenu
      v-if="variant === 'default'"
      ref="dropDownMenuRef"
      :placement="computedPlacement"
      :disabled="disabled"
      tabindex="-1"
    >
      <div
        class="lx-datepicker-input-container"
        :class="[
          { 'lx-disabled': disabled },
          { 'lx-invalid': invalid },
          { range: pickerType === 'range' },
          { 'month-year': mode === 'month-year' },
        ]"
        :aria-labelledby="pickerType === 'range' ? labelledBy : null"
        @click="dropDownMenuRef?.preventClose"
        @keydown="dropDownMenuRef?.preventClose"
      >
        <div
          class="lx-start-input-and-separator-wrapper lx-input-wrapper"
          :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
        >
          <div class="pseudo-input" />
          <input
            :ref="(el) => (startInputRefs[id] = el)"
            type="text"
            class="lx-date-time-picker lx-input-area"
            :class="[{ 'lx-invalid': invalid }, { 'input-active': activeInput === 'startInput' }]"
            :value="modelInput"
            :id="pickerType === 'range' ? 'from-' + id : id"
            :placeholder="placeholderComputed"
            :disabled="disabled"
            autocomplete="off"
            :readonly="mode === 'month' || mode === 'month-year' || mode === 'quarters'"
            :tabindex="startInputIndex"
            :maxlength="getMaxLength"
            :aria-invalid="invalid"
            :aria-label="
              pickerType === 'range'
                ? displayTexts.startDateLabel
                : pickerType === 'single' && legacyMode
                ? labelledBy
                : null
            "
            :aria-labelledby="pickerType === 'single' && !legacyMode ? labelledBy : null"
            :aria-describedby="
              pickerType === 'range' || (pickerType === 'single' && legacyMode)
                ? `${id}-lx-range-input-description`
                : null
            "
            @mousedown="preventDefaultFocus"
            @touchstart="onTouchStart($event, 'startInput')"
            @click="toggleMenu($event, 'startInput')"
            @keydown.arrow-down.prevent="openMenu('startInput')"
            @keyup.enter.stop="toggleMenu('startInput')"
            @keyup.space.stop="toggleMenu('startInput')"
            @keydown.esc.prevent="closeMenu"
            @change="validateIfExact($event, 'startInput')"
            @input="sanitizeDateInput($event, mode)"
          />
          <div v-if="invalid && variant === 'default'" class="lx-input-icon-wrapper">
            <LxIcon customClass="lx-invalidation-icon" value="invalid" />
          </div>
          <div
            v-if="!invalid && mode !== 'time' && variant === 'default'"
            class="lx-input-icon-wrapper"
          >
            <LxIcon customClass="lx-date-time-icon lx-modifier-icon" value="calendar" />
          </div>
          <div
            v-if="!invalid && mode === 'time' && variant === 'default'"
            class="lx-input-icon-wrapper"
          >
            <LxIcon customClass="lx-date-time-icon lx-modifier-icon" value="time" />
          </div>
        </div>

        <template v-if="pickerType === 'range'">
          <span class="lx-date-time-range-separator">–</span>
        </template>

        <template v-if="pickerType === 'range'">
          <div
            class="lx-input-wrapper"
            :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
          >
            <div class="pseudo-input" />
            <input
              :ref="(el) => (endInputRefs[id] = el)"
              type="text"
              class="lx-date-time-picker lx-input-area"
              :class="[{ 'lx-invalid': invalid }, { 'input-active': activeInput === 'endInput' }]"
              :value="modelEndDateInput"
              :id="'till-' + id"
              :placeholder="placeholderComputed"
              :disabled="disabled"
              autocomplete="off"
              :readonly="mode === 'month' || mode === 'month-year' || mode === 'quarters'"
              :tabindex="endInputIndex"
              :maxlength="getMaxLength"
              :aria-invalid="invalid"
              :aria-label="displayTexts.endDateLabel"
              :aria-describedby="`${id}-lx-range-input-description`"
              @mousedown="preventDefaultFocus"
              @touchstart="onTouchStart($event, 'endInput')"
              @click="toggleMenu($event, 'endInput')"
              @keydown.arrow-down.prevent="openMenu('endInput')"
              @keyup.enter.stop="toggleMenu($event, 'endInput')"
              @keyup.space.stop="toggleMenu($event, 'endInput')"
              @keydown.esc.prevent="closeMenu"
              @change="validateIfExact($event, 'endInput')"
              @input="sanitizeDateInput($event, mode)"
            />
            <div v-if="invalid" class="lx-input-icon-wrapper">
              <LxIcon customClass="lx-invalidation-icon" value="invalid" />
            </div>
            <div v-if="!invalid" class="lx-input-icon-wrapper">
              <LxIcon customClass="lx-date-time-icon lx-modifier-icon" value="calendar" />
            </div>
          </div>
        </template>
      </div>

      <template #clickSafePanel>
        <LxCalendarContainer
          :id="id"
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
          :cadenceOfSeconds="cadenceOfSeconds"
          :clearIfNotExact="clearIfNotExact"
          :pickerType="pickerType"
          :activeInput="activeInput"
          :setActiveInput="setActiveInput"
          :texts="displayTexts"
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
      :id="id"
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
      :cadenceOfSeconds="cadenceOfSeconds"
      :clearIfNotExact="clearIfNotExact"
      :pickerType="pickerType"
      :texts="displayTexts"
    />
    <div v-if="invalid && !legacyMode" class="lx-invalidation-message">
      {{ invalidationMessage }}
    </div>
  </div>
</template>
