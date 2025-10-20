<script setup>
import { computed, inject, ref } from 'vue';

import {
  parseDate,
  formatJSON,
  formatDate,
  formatDateTime,
  formatDateJSON,
  isDateValid,
  isTimeValid,
  getMonthYearString,
  getMonthNames,
  formatFull,
} from '@/utils/dateUtils';
import { lxDateUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import {
  dateFromYearAndQuarter,
  extractMonthFromDate,
  extractQuarterFromDate,
  extractYearFromDate,
  extractYearMonthFromDate,
  getMonthNameByOrder,
} from '@/components/datePicker/helpers';
import { generateUUID } from '@/utils/stringUtils';

import LxDatePicker from '@/components/datePicker/DatePicker.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: [String, Date], default: null },
  kind: { type: String, default: 'date' }, // 'date', 'time', 'date-time', 'month', 'year', 'month-year', 'quarters'
  placeholder: { type: String, default: null },
  tooltip: { type: String, default: null },
  minDate: { type: Date, default: null },
  maxDate: { type: Date, default: null },
  required: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  clearIfNotExact: { type: Boolean, default: false },
  locale: { type: Object, default: () => useLx().getGlobals()?.locale },
  specialDates: { type: Array, default: () => [] },
  dictionary: { type: Array, default: () => [] },
  variant: { type: String, default: 'default' }, // 'default', 'picker', 'full', 'full-rows', 'full-columns'
  cadenceOfMinutes: { type: Number, default: 1 }, // 1, 5, 15
  cadenceOfSeconds: { type: Number, default: 1 }, // 1, 5, 15
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  clear: 'Attīrīt',
  todayButton: 'Atgriezties uz šodienu',
  clearButton: 'Attīrīt vērtību',
  next: 'Nākamais',
  previous: 'Iepriekšējais',
  nextMonth: 'Nākamais mēnesis',
  previousMonth: 'Iepriekšējais mēnesis',
  nextYear: 'Nākamais gads',
  previousYear: 'Iepriekšējais gads',
  nextDecade: 'Nākamā dekāde',
  previousDecade: 'Iepriekšējā dekāde',
  scrollUp: 'Ritināt uz augšu',
  scrollDown: 'Ritināt uz leju',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue']);
const { dateFormat, dateTimeFormat, dateTimeFullFormat } = useLx().getGlobals();

function extractTime(datetimeStr) {
  const timeRegex = /(\d{2}:\d{2}(:\d{2})?(\s?[APMapm]{2})?)/;
  const match = datetimeStr.match(timeRegex);
  if (match) return match[0];
  return null;
}

const localeComputed = computed(() => (props.locale?.locale ? props.locale?.locale : 'lv-LV'));
const localeFirstDay = computed(() =>
  props.locale?.firstDayOfTheWeek ? props.locale?.firstDayOfTheWeek : 2
);

const localeMasks = computed(() => {
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';
  const dateTimeFullFormatToUse = dateTimeFullFormat || 'dd.MM.yyyy. HH:mm:ss';

  const defaultMasks = {
    inputDateTime24hr: dateTimeFormatToUse,
    inputDateTimeFull24hr: dateTimeFullFormatToUse,
    input: dateFormatToUse,
    inputTime24hr: 'HH:mm',
    inputTimeFull24hr: 'HH:mm:ss',
    inputMonthYear: 'yyyy-MM',
    inputQuarters: 'yyyy-QQQ',
    inputYear: 'yyyy',
  };
  return props.locale?.masks ? props.locale.masks : defaultMasks;
});

const model = computed({
  get() {
    switch (props.kind) {
      case 'time':
        if (typeof props.modelValue === 'string' && props.modelValue?.length === 5) {
          const newDate = new Date();
          newDate.setDate(1); // Set to the first day of the month
          newDate.setHours(Number(props.modelValue?.slice(0, 2)));
          newDate.setMinutes(Number(props.modelValue?.slice(3, 5)));
          return newDate;
        }
        return parseDate(props.modelValue);
      case 'time-full':
        if (typeof props.modelValue === 'string' && props.modelValue?.length === 8) {
          const newDate = new Date();
          newDate.setDate(1); // Set to the first day of the month
          newDate.setHours(Number(props.modelValue?.slice(0, 2)));
          newDate.setMinutes(Number(props.modelValue?.slice(3, 5)));
          newDate.setSeconds(Number(props.modelValue?.slice(6, 8)));
          return newDate;
        }
        return parseDate(props.modelValue);
      case 'month':
        if (typeof props.modelValue === 'string' && props.modelValue?.length === 2) {
          const newDate = new Date();
          newDate.setDate(1); // Set to the first day of the month
          newDate.setMonth(Number(props.modelValue) - 1);
          return newDate;
        }
        return parseDate(props.modelValue);
      case 'year':
        if (typeof props.modelValue === 'string' && props.modelValue?.length === 4) {
          const newDate = new Date();
          newDate.setDate(1); // Set to the first day of the month
          newDate.setFullYear(Number(props.modelValue));
          return newDate;
        }
        return parseDate(props.modelValue);
      case 'month-year':
        if (typeof props.modelValue === 'string' && props.modelValue?.length === 7) {
          const newDate = new Date();
          newDate.setDate(1); // Set to the first day of the month
          newDate.setFullYear(Number(props.modelValue?.slice(0, 4)));
          newDate.setMonth(Number(props.modelValue?.slice(5, 7)) - 1);
          return newDate;
        }
        return parseDate(props.modelValue);
      case 'quarters':
        if (typeof props.modelValue === 'string' && props.modelValue?.length === 7) {
          const [year, quarter] = props.modelValue.split('-');
          const normalizedQuarter = quarter.split('Q');
          const newDate = dateFromYearAndQuarter(year, normalizedQuarter[1]);
          return newDate;
        }
        return parseDate(props.modelValue);
      default:
        return parseDate(props.modelValue);
    }
  },
  set(newValue) {
    if (props.kind === 'time') {
      const nv = extractTime(formatDateTime(newValue));
      emits('update:modelValue', nv);
    } else if (props.kind === 'time-full') {
      const nv = extractTime(formatFull(newValue));
      emits('update:modelValue', nv);
    } else if (props.kind === 'date') {
      const nv = formatDateJSON(newValue);
      emits('update:modelValue', nv);
    } else if (
      props.kind === 'dateTime' ||
      props.kind === 'date-time' ||
      props.kind === 'date-time-full'
    ) {
      const nv = formatJSON(newValue);
      emits('update:modelValue', nv);
    } else if (props.kind === 'month') {
      const nv = extractMonthFromDate(newValue);
      emits('update:modelValue', nv);
    } else if (props.kind === 'year') {
      const nv = extractYearFromDate(newValue);
      emits('update:modelValue', nv);
    } else if (props.kind === 'month-year') {
      const nv = extractYearMonthFromDate(newValue, localeMasks.value.monthYearFormat);
      emits('update:modelValue', nv);
    } else if (props.kind === 'quarters') {
      const nv = extractQuarterFromDate(newValue);
      emits('update:modelValue', nv);
    } else {
      const nv = formatJSON(newValue);
      if (nv === props.modelValue) return;
      emits('update:modelValue', nv);
    }
  },
});

function getNameDate() {
  if (isDateValid(props.modelValue)) {
    return formatDate(new Date(props.modelValue));
  }
  if (typeof props.modelValue !== 'string') {
    return formatDate(props.modelValue);
  }
  return null;
}

function getNameTime() {
  if (isTimeValid(props.modelValue)) {
    return props.modelValue;
  }
  if (typeof props.modelValue !== 'string') {
    return extractTime(formatDateTime(props.modelValue));
  }
  return null;
}

function getNameDateTime() {
  if (isDateValid(props.modelValue)) {
    return formatDateTime(new Date(props.modelValue));
  }
  if (typeof props.modelValue !== 'string') {
    return formatDateTime(props.modelValue);
  }
  return null;
}

function getNameMonth() {
  if (typeof props.modelValue === 'string') {
    const monthsList = getMonthNames(localeComputed.value);
    return getMonthNameByOrder(monthsList, new Date(props.modelValue)?.getMonth(), true);
  }
  if (typeof props.modelValue !== 'string') {
    const monthsList = getMonthNames(localeComputed.value);
    return getMonthNameByOrder(monthsList, props.modelValue?.getMonth(), true);
  }
  return null;
}

function getNameMonthYear() {
  if (typeof props.modelValue === 'string') {
    return getMonthYearString(
      localeComputed.value,
      new Date(props.modelValue)?.getMonth(),
      new Date(props.modelValue)?.getFullYear()
    );
  }
  if (typeof props.modelValue !== 'string') {
    return getMonthYearString(
      localeComputed.value,
      props.modelValue?.getMonth(),
      props.modelValue?.getFullYear()
    );
  }
  return null;
}

function getName() {
  if (props.modelValue === '') return null;

  switch (props.kind) {
    case 'date':
      return getNameDate();

    case 'time':
      return getNameTime();

    case 'dateTime':
    case 'date-time':
      return getNameDateTime();

    case 'month':
      return getNameMonth();

    case 'month-year':
      return getNameMonthYear();

    default:
      return props.modelValue;
  }
}

const modelValueIso = computed(() => {
  let res = props.modelValue;
  if (
    ((props.kind === 'date' || props.kind === 'dateTime' || props.kind === 'date-time') &&
      props.modelValue?.length !== 5) ||
    (props.modelValue?.length !== 5 && props.kind === 'time')
  ) {
    res = lxDateUtils.formatJSON(lxDateUtils.parseDate(props.modelValue));
  } else if (props.kind === 'time') {
    res = lxDateUtils.formatJSON(props.modelValue);
  }
  return res;
});

const colors = [
  { id: 'draft', color: 'lx-draft' },
  { id: 'new', color: 'lx-new' },
  { id: 'editing', color: 'lx-editing' },
  { id: 'edited', color: 'lx-edited' },
  { id: 'disabling', color: 'lx-disabling' },
  { id: 'inactive', color: 'lx-inactive' },
  { id: 'finishing', color: 'lx-finishing' },
  { id: 'finished', color: 'lx-finished' },
  { id: 'deleting', color: 'lx-deleting' },
  { id: 'red-full', color: 'lx-red' },
  { id: 'red', color: 'lx-red' },
  { id: 'green-full', color: 'lx-green' },
  { id: 'green', color: 'lx-green' },
  { id: 'orange-full', color: 'lx-orange' },
  { id: 'orange', color: 'lx-orange' },
  { id: 'purple-full', color: 'lx-purple' },
  { id: 'purple', color: 'lx-purple' },
  { id: 'blue-full', color: 'lx-blue' },
  { id: 'blue', color: 'lx-blue' },
  { id: 'yellow-full', color: 'lx-yellow' },
  { id: 'yellow', color: 'lx-yellow' },
  { id: 'black-full', color: 'lx-black' },
  { id: 'black', color: 'lx-black' },
];

const attributesComputed = computed(() => {
  const res = [];
  props.specialDates.forEach((element) => {
    const found = props.dictionary.find((el) => el?.id === element?.category);
    if (found) {
      const colorFind = colors.find((el) => el.id === found?.displayType)?.color;
      res.push({
        barColor: colorFind || 'blue',
        dates: element?.dates,
        popoverLabel: found?.name,
      });
    }
  });
  return res;
});

const mode = computed(() => {
  switch (props.kind) {
    case 'date-time':
    case 'dateTime':
      return 'date-time';
    default:
      return props.kind;
  }
});

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);
</script>

<template>
  <div class="lx-field-wrapper">
    <template v-if="readOnly">
      <p class="lx-data" :aria-labelledby="labelledBy">
        <time :datetime="modelValueIso">
          {{ getName() }}
          <span v-if="model === null || model === undefined">—</span>
        </time>
      </p>
    </template>

    <template v-else>
      <div
        class="lx-date-time-picker-wrapper"
        :class="{
          'lx-date': kind === 'date' || kind === 'month' || kind === 'year' || kind === 'quarters',
          'lx-time': kind === 'time' || kind === 'time-full',
          'lx-date-time': kind === 'dateTime' || kind === 'date-time' || kind === 'month-year',
          'lx-date-time-full': kind === 'dateTimeFull' || kind === 'date-time-full',
        }"
        :data-invalid="invalid ? '' : null"
        :data-disabled="disabled ? '' : null"
        :title="tooltip"
      >
        <LxDatePicker
          :id="id"
          v-model="model"
          :mode="mode"
          :variant="variant"
          :masks="localeMasks"
          :placeholder="placeholder"
          :disabled="disabled"
          :invalid="invalid"
          :invalidationMessage="invalidationMessage"
          :min-date="minDate"
          :max-date="maxDate"
          :locale="localeComputed"
          :first-day-of-the-week="localeFirstDay"
          :special-dates-attributes="attributesComputed"
          :clearIfNotExact="clearIfNotExact"
          :cadenceOfMinutes="cadenceOfMinutes"
          :cadenceOfSeconds="cadenceOfSeconds"
          :texts="displayTexts"
          :labelled-by="labelledBy"
        />
      </div>
    </template>
  </div>
</template>
