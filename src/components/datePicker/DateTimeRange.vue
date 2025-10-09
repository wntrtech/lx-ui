<script setup lang="ts">
import { computed, onBeforeMount, ref, inject } from 'vue';

import useLx from '@/hooks/useLx';
import {
  formatDateJSON,
  formatDate,
  parseDate,
  getMonthNames,
  getMonthYearString,
} from '@/utils/dateUtils';
import { generateUUID } from '@/utils/stringUtils';

import {
  dateFromYearAndQuarter,
  extractMonthFromDate,
  extractQuarterFromDate,
  extractYearFromDate,
  extractYearMonthFromDate,
  getMonthNameByOrder,
} from '@/components/datePicker/helpers';
import LxDatePicker from '@/components/datePicker/DatePicker.vue';
import { getDisplayTexts } from '@/utils/generalUtils';
import { DATE_VALIDATION_RESULT } from '@/constants';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  kind: { type: String, default: 'date' }, // 'date', 'month', 'year', 'month-year', 'quarters'
  placeholder: { type: String, default: null },
  tooltip: { type: String, default: null },
  minDate: { type: String, default: null },
  maxDate: { type: String, default: null },
  maxRangeLength: { type: Number, default: null },
  required: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  timeAdjust: { type: String, default: null },
  locale: { type: Object, default: () => useLx().getGlobals()?.locale },
  rangeMonth: { type: String, default: 'next' }, // next, previous
  clearIfNotExact: { type: Boolean, default: false },
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
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

const emits = defineEmits([
  'update:startDate',
  'update:endDate',
  'outOfRange:startDate',
  'outOfRange:endDate',
  'outOfRange',
]);

const { dateFormat, dateTimeFormat } = useLx().getGlobals();

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
    inputMonthYear: 'yyyy-MM',
    inputQuarters: 'yyyy-QQQ',
  };

  return props.locale?.masks ? props.locale.masks : defaultMasks;
});

function updateStartValue(startValue) {
  if (props.kind === 'date' || props.kind === 'legacy') {
    const nv = formatDateJSON(startValue);
    emits('update:startDate', nv);
  } else if (props.kind === 'month') {
    const nv = extractMonthFromDate(startValue);
    emits('update:startDate', nv);
  } else if (props.kind === 'year') {
    const nv = extractYearFromDate(startValue);
    emits('update:startDate', nv);
  } else if (props.kind === 'month-year') {
    const nv = extractYearMonthFromDate(startValue, localeMasks.value.monthYearFormat);
    emits('update:startDate', nv);
  } else if (props.kind === 'quarters') {
    const nv = extractQuarterFromDate(startValue);
    emits('update:startDate', nv);
  }
}

function updateEndValue(endValue) {
  if (props.kind === 'date' || props.kind === 'legacy') {
    const nv = formatDateJSON(endValue);
    emits('update:endDate', nv);
  } else if (props.kind === 'month') {
    const nv = extractMonthFromDate(endValue);
    emits('update:endDate', nv);
  } else if (props.kind === 'year') {
    const nv = extractYearFromDate(endValue);
    emits('update:endDate', nv);
  } else if (props.kind === 'month-year') {
    const nv = extractYearMonthFromDate(endValue, localeMasks.value.monthYearFormat);
    emits('update:endDate', nv);
  } else if (props.kind === 'quarters') {
    const nv = extractQuarterFromDate(endValue);
    emits('update:endDate', nv);
  }
}

function getMonthModel() {
  let newStartDate;
  let newEndDate;

  if (typeof props.startDate === 'string' && props.startDate?.length === 2) {
    newStartDate = new Date();
    newStartDate.setDate(1); // Set to the first day of the month
    newStartDate.setHours(0, 0, 0, 0);
    newStartDate.setMonth(Number(props.startDate) - 1);
  } else {
    newStartDate = props.startDate;
  }
  if (typeof props.endDate === 'string' && props.endDate?.length === 2) {
    newEndDate = new Date();
    newEndDate.setDate(1); // Set to the first day of the month
    newEndDate.setHours(0, 0, 0, 0);
    newEndDate.setMonth(Number(props.endDate) - 1);
  } else {
    newEndDate = props.endDate;
  }
  return {
    start: newStartDate ? parseDate(newStartDate) : null,
    end: newEndDate ? parseDate(newEndDate) : null,
  };
}

function getYearModel() {
  let newStartDate;
  let newEndDate;

  if (typeof props.startDate === 'string' && props.startDate?.length === 4) {
    newStartDate = new Date();
    newStartDate.setDate(1); // Set to the first day of the month
    newStartDate.setMonth(1);
    newStartDate.setHours(0, 0, 0, 0);
    newStartDate.setFullYear(Number(props.startDate));
  }
  if (typeof props.endDate === 'string' && props.endDate?.length === 4) {
    newEndDate = new Date();
    newEndDate.setDate(1); // Set to the first day of the month
    newEndDate.setMonth(1);
    newEndDate.setHours(0, 0, 0, 0);
    newEndDate.setFullYear(Number(props.endDate));
  }
  return {
    start: newStartDate ? parseDate(newStartDate) : null,
    end: newEndDate ? parseDate(newEndDate) : null,
  };
}

function getYearMonthModel() {
  let newStartDate;
  let newEndDate;

  if (typeof props.startDate === 'string' && props.startDate?.length === 7) {
    newStartDate = new Date();
    newStartDate.setDate(1); // Set to the first day of the month
    newStartDate.setHours(0, 0, 0, 0);
    newStartDate.setFullYear(Number(props.startDate?.slice(0, 4)));
    newStartDate.setMonth(Number(props.startDate?.slice(5, 7)) - 1);
  }
  if (typeof props.endDate === 'string' && props.endDate?.length === 7) {
    newEndDate = new Date();
    newEndDate.setDate(1); // Set to the first day of the month
    newEndDate.setHours(0, 0, 0, 0);
    newEndDate.setFullYear(Number(props.endDate?.slice(0, 4)));
    newEndDate.setMonth(Number(props.endDate?.slice(5, 7)) - 1);
  }
  return {
    start: newStartDate ? parseDate(newStartDate) : null,
    end: newEndDate ? parseDate(newEndDate) : null,
  };
}

function getQuarterModel() {
  let newStartDate;
  let newEndDate;

  if (typeof props.startDate === 'string' && props.startDate?.length === 7) {
    const [year, quarter] = props.startDate.split('-');
    const normalizedQuarter = quarter.split('Q');
    newStartDate = dateFromYearAndQuarter(year, normalizedQuarter[1]);
  }
  if (typeof props.endDate === 'string' && props.endDate?.length === 7) {
    const [year, quarter] = props.endDate.split('-');
    const normalizedQuarter = quarter.split('Q');
    newEndDate = dateFromYearAndQuarter(year, normalizedQuarter[1]);
  }
  return {
    start: newStartDate ? parseDate(newStartDate) : null,
    end: newEndDate ? parseDate(newEndDate) : null,
  };
}

const model = computed({
  get() {
    if (props.kind === 'month') {
      return getMonthModel();
    }

    if (props.kind === 'year') {
      return getYearModel();
    }
    if (props.kind === 'month-year') {
      return getYearMonthModel();
    }
    if (props.kind === 'quarters') {
      return getQuarterModel();
    }

    return { start: parseDate(props.startDate), end: parseDate(props.endDate) };
  },
  set(value) {
    if (!value || (!value.start && !value.end)) {
      emits('update:startDate', null);
      emits('update:endDate', null);
    }
    if (value) {
      if (value.start) {
        updateStartValue(value.start);
      } else {
        emits('update:startDate', null);
      }
      if (value.end) {
        updateEndValue(value.end);
      } else {
        emits('update:endDate', null);
      }
    }
  },
});

function getNameStart() {
  switch (props.kind) {
    case 'date':
    case 'legacy':
      if (props.startDate) {
        return formatDate(new Date(props.startDate));
      }
      break;

    case 'month':
      if (props.startDate) {
        const monthsList = getMonthNames(localeComputed.value);
        return getMonthNameByOrder(monthsList, new Date(props.startDate)?.getMonth(), true);
      }
      break;

    case 'month-year':
      if (props.startDate) {
        return getMonthYearString(
          localeComputed.value,
          new Date(props.startDate)?.getMonth(),
          new Date(props.startDate)?.getFullYear()
        );
      }
      break;

    default:
      return props.startDate;
  }

  return null;
}

function getNameEnd() {
  switch (props.kind) {
    case 'date':
    case 'legacy':
      if (props.endDate) {
        return formatDate(new Date(props.endDate));
      }
      break;

    case 'month':
      if (props.endDate) {
        const monthsList = getMonthNames(localeComputed.value);
        return getMonthNameByOrder(monthsList, new Date(props.endDate)?.getMonth(), true);
      }
      break;

    case 'month-year':
      if (props.endDate) {
        return getMonthYearString(
          localeComputed.value,
          new Date(props.endDate)?.getMonth(),
          new Date(props.endDate)?.getFullYear()
        );
      }
      break;

    default:
      return props.endDate;
  }

  return null;
}

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

// Computed properties to handle individual updates for start and end dates
const modelStart = computed({
  get: () => parseDate(props.startDate),
  set: (value) => {
    if (value) {
      updateStartValue(value);
    } else {
      emits('update:startDate', null);
    }
  },
});

const modelEnd = computed({
  get: () => parseDate(props.endDate),
  set: (value) => {
    if (value) {
      updateEndValue(value);
    } else {
      emits('update:endDate', null);
    }
  },
});

// Conditional min and max dates for each picker
const startMaxDate = computed(() => modelEnd.value || props.maxDate);
const endMinDate = computed(() => modelStart.value || props.minDate);

function onOutOfRangeStartDate(payload) {
  if (
    [DATE_VALIDATION_RESULT.OUT_OF_RANGE_MIN, DATE_VALIDATION_RESULT.OUT_OF_RANGE_MAX].includes(
      payload
    )
  ) {
    emits('outOfRange:startDate', payload);
  }
}

function onOutOfRangeEndDate(payload) {
  if (
    [DATE_VALIDATION_RESULT.OUT_OF_RANGE_MIN, DATE_VALIDATION_RESULT.OUT_OF_RANGE_MAX].includes(
      payload
    )
  ) {
    emits('outOfRange:endDate', payload);
  }
}

function onOutOfRange(payload) {
  if (
    [DATE_VALIDATION_RESULT.OUT_OF_RANGE_MIN, DATE_VALIDATION_RESULT.OUT_OF_RANGE_MAX].includes(
      payload
    )
  ) {
    emits('outOfRange', payload);
  }
}

onBeforeMount(() => {
  if (props.startDate && props.endDate && props.endDate < props.startDate) {
    model.value = {
      start: props.startDate,
      end: null,
    };
  }
});
</script>

<template>
  <div class="lx-field-wrapper">
    <p v-if="readOnly" class="lx-data" :aria-labelledby="labelledBy">
      <span v-if="!startDate && !endDate">—</span>
      <span v-else>
        <time :datetime="startDate">{{ getNameStart() }}</time
        >–<time :datetime="endDate">{{ getNameEnd() }}</time>
      </span>
    </p>
    <template v-else>
      <div
        class="lx-date-time-picker-wrapper lx-date-time-range-wrapper"
        :class="[
          {
            'lx-date':
              kind === 'date' ||
              kind === 'month' ||
              kind === 'year' ||
              kind === 'month-year' ||
              kind === 'quarters',
          },
          {
            'month-year': kind === 'month-year',
          },
        ]"
        :data-invalid="invalid ? '' : null"
        :data-disabled="disabled ? '' : null"
      >
        <LxDatePicker
          v-if="kind !== 'legacy'"
          :id="id"
          v-model="model"
          :mode="kind"
          :masks="localeMasks"
          :placeholder="placeholder"
          :disabled="disabled"
          :invalid="invalid"
          :invalidation-message="invalidationMessage"
          :min-date="minDate"
          :max-date="maxDate"
          :locale="localeComputed"
          :first-day-of-the-week="localeFirstDay"
          picker-type="range"
          :clearIfNotExact="clearIfNotExact"
          :texts="displayTexts"
          :labelled-by="labelledBy"
          @outOfRange="onOutOfRange"
        />

        <div v-if="kind === 'legacy'" class="legacy-pickers-wrapper" :aria-labelledby="labelledBy">
          <LxDatePicker
            :id="'from-' + id"
            v-model="modelStart"
            mode="date"
            :masks="localeMasks"
            :placeholder="placeholder"
            :disabled="disabled"
            :invalid="invalid"
            :invalidationMessage="invalidationMessage"
            :min-date="minDate"
            :max-date="startMaxDate"
            :locale="localeComputed"
            :first-day-of-the-week="localeFirstDay"
            :clearIfNotExact="clearIfNotExact"
            :texts="displayTexts"
            :labelled-by="displayTexts.startDateLabel"
            @outOfRange="onOutOfRangeStartDate"
            legacy-mode
          />

          <span class="lx-date-time-range-separator">–</span>

          <LxDatePicker
            :id="'till-' + id"
            v-model="modelEnd"
            mode="date"
            :masks="localeMasks"
            :placeholder="placeholder"
            :disabled="disabled"
            :invalid="invalid"
            :min-date="endMinDate"
            :max-date="maxDate"
            :locale="localeComputed"
            :first-day-of-the-week="localeFirstDay"
            :clearIfNotExact="clearIfNotExact"
            :texts="displayTexts"
            :labelled-by="displayTexts.endDateLabel"
            @outOfRange="onOutOfRangeEndDate"
            legacy-mode
          />
        </div>

        <div v-if="invalid && kind === 'legacy'" class="lx-invalidation-message">
          {{ invalidationMessage }}
        </div>
      </div>
    </template>
  </div>
</template>
