<script setup>
import { computed } from 'vue';

import {
  parseDate,
  formatJSON,
  formatDate,
  formatDateTime,
  formatDateJSON,
  isDateValid,
  isTimeValid,
} from '@/utils/dateUtils';
import { lxDateUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import {
  dateFromYearAndQuarter,
  extractMonthFromDate,
  extractQuarterFromDate,
  extractYearFromDate,
  extractYearMonthFromDate,
} from '@/components/datePicker/helpers';
import { generateUUID } from '@/utils/stringUtils';

import LxDatePicker from '@/components/datePicker/DatePicker.vue';

const props = defineProps({
  id: { type: String, default: generateUUID() },
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
const { dateFormat, dateTimeFormat } = useLx().getGlobals();

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

  const defaultMasks = {
    inputDateTime24hr: dateTimeFormatToUse,
    input: dateFormatToUse,
    inputTime24hr: 'HH:mm',
    inputMonthYear: 'yyyy-MM',
    inputQuarters: 'yyyy-QQQ',
  };
  return props.locale?.masks ? props.locale.masks : defaultMasks;
});

const model = computed({
  get() {
    if (props.kind === 'time') {
      if (typeof props.modelValue === 'string' && props.modelValue?.length === 5) {
        const newDate = new Date();
        newDate.setDate(1); // Set to the first day of the month
        newDate.setHours(Number(props.modelValue?.slice(0, 2)));
        newDate.setMinutes(Number(props.modelValue?.slice(3, 5)));
        return newDate;
      }
      return parseDate(props.modelValue);
    }
    if (props.kind === 'month') {
      if (typeof props.modelValue === 'string' && props.modelValue?.length === 2) {
        const newDate = new Date();
        newDate.setDate(1); // Set to the first day of the month
        newDate.setMonth(Number(props.modelValue) - 1);
        return newDate;
      }
      return parseDate(props.modelValue);
    }
    if (props.kind === 'year') {
      if (typeof props.modelValue === 'string' && props.modelValue?.length === 4) {
        const newDate = new Date();
        newDate.setDate(1); // Set to the first day of the month
        newDate.setFullYear(Number(props.modelValue));
        return newDate;
      }
      return parseDate(props.modelValue);
    }
    if (props.kind === 'month-year') {
      if (typeof props.modelValue === 'string' && props.modelValue?.length === 7) {
        const newDate = new Date();
        newDate.setDate(1); // Set to the first day of the month
        newDate.setFullYear(Number(props.modelValue?.slice(0, 4)));
        newDate.setMonth(Number(props.modelValue?.slice(5, 7)) - 1);
        return newDate;
      }
      return parseDate(props.modelValue);
    }
    if (props.kind === 'quarters') {
      if (typeof props.modelValue === 'string' && props.modelValue?.length === 7) {
        const [year, quarter] = props.modelValue.split('-');
        const normalizedQuarter = quarter.split('Q');
        const newDate = dateFromYearAndQuarter(year, normalizedQuarter[1]);
        return newDate;
      }
      return parseDate(props.modelValue);
    }
    return parseDate(props.modelValue);
  },
  set(newValue) {
    if (props.kind === 'time') {
      const nv = extractTime(formatDateTime(newValue));
      emits('update:modelValue', nv);
    } else if (props.kind === 'date') {
      const nv = formatDateJSON(newValue);
      emits('update:modelValue', nv);
    } else if (props.kind === 'dateTime' || props.kind === 'date-time') {
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

function getName() {
  if (props.modelValue === '') return null;

  switch (props.kind) {
    case 'date':
      if (isDateValid(props.modelValue)) {
        return formatDate(new Date(props.modelValue));
      }
      if (typeof props.modelValue !== 'string') {
        return formatDate(props.modelValue);
      }
      break;

    case 'time':
      if (isTimeValid(props.modelValue)) {
        return props.modelValue;
      }
      if (typeof props.modelValue !== 'string') {
        return extractTime(formatDateTime(props.modelValue));
      }
      break;

    case 'dateTime':
    case 'date-time':
      if (isDateValid(props.modelValue)) {
        return formatDateTime(new Date(props.modelValue));
      }
      if (typeof props.modelValue !== 'string') {
        return formatDateTime(props.modelValue);
      }
      break;

    default:
      return props.modelValue;
  }

  return null;
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
</script>

<template>
  <div class="lx-field-wrapper">
    <template v-if="readOnly">
      <p class="lx-data">
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
          'lx-time': kind === 'time',
          'lx-date-time': kind === 'dateTime' || kind === 'date-time' || kind === 'month-year',
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
          :texts="texts"
        />
      </div>
    </template>
  </div>
</template>
