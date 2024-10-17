<script setup lang="ts">
import { computed, onBeforeMount, watch } from 'vue';

// TODO: at the end need to remove v-calendar package
// import { DatePicker } from 'v-calendar';

import useLx from '@/hooks/useLx';
import { formatDateJSON, formatDate, parseDate } from '@/utils/dateUtils';

import LxIcon from '@/components/Icon.vue';
import LxDatePicker from '@/components/datePicker/DatePicker.vue';
import LxValuePicker from '@/components/ValuePicker.vue';

const props = defineProps({
  id: { type: String, default: null },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  kind: { type: String, default: 'date' }, // 'date'
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
const emits = defineEmits(['update:startDate', 'update:endDate']);

const { dateFormat, dateTimeFormat } = useLx().getGlobals();

function updateStartValue(startValue) {
  if (props.kind === 'date') {
    if (typeof startValue !== 'string') {
      if (formatDateJSON(startValue) !== '1900-01-01') {
        const nv = formatDateJSON(startValue);
        emits('update:startDate', nv);
      } else {
        emits('update:startDate', null);
      }
    } else if (startValue !== '1900-01-01') {
      emits('update:startDate', startValue);
    } else if (startValue === '1900-01-01') {
      emits('update:startDate', null);
    }
  }
}

function updateEndValue(endValue) {
  if (props.kind === 'date') {
    if (typeof endValue !== 'string') {
      if (formatDateJSON(endValue) !== '9999-12-31') {
        const nv = formatDateJSON(endValue);
        emits('update:endDate', nv);
      } else {
        emits('update:endDate', null);
      }
    } else if (endValue !== '9999-12-31') {
      emits('update:endDate', endValue);
    } else if (endValue === '9999-12-31') {
      emits('update:endDate', null);
    }
  }
}

const model = computed({
  get() {
    return { start: parseDate(props.startDate), end: parseDate(props.endDate) };
  },
  set(value) {
    if (!value || (!value.start && !value.end)) {
      if (props.kind === 'date') {
        emits('update:startDate', null);
        emits('update:endDate', null);
      }
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

const localeComputed = computed(() => (props.locale?.locale ? props.locale?.locale : 'lv-LV'));
const localeFirstDay = computed(() =>
  props.locale?.firstDayOfTheWeek ? props.locale?.firstDayOfTheWeek : 2
);
const localeMasks = computed(() => {
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';

  return props.locale?.masks
    ? props?.locale?.masks
    : { inputDateTime24hr: [dateTimeFormatToUse, dateFormatToUse] };
});

function getNameStart() {
  if (props.startDate && props.kind === 'date') return formatDate(new Date(props.startDate));
  return props.startDate;
}

function getNameEnd() {
  if (props.endDate && props.kind === 'date') return formatDate(new Date(props.endDate));
  return props.endDate;
}

function getMonthString(monthNumber) {
  const monthNames = new Intl.DateTimeFormat(props.locale?.locale, { month: 'long' }).formatToParts(
    new Date(2000, monthNumber - 1, 1)
  );
  return monthNames.find((part) => part.type === 'month').value;
}

function getMonthYearString(month, year) {
  const formatter = new Intl.DateTimeFormat(props.locale.locale, {
    year: 'numeric',
    month: 'long',
  });
  return formatter.format(new Date(Number(year), Number(month) - 1));
}

const months = computed(() => [
  { id: '01', name: getMonthString('01') },
  { id: '02', name: getMonthString('02') },
  { id: '03', name: getMonthString('03') },
  { id: '04', name: getMonthString('04') },
  { id: '05', name: getMonthString('05') },
  { id: '06', name: getMonthString('06') },
  { id: '07', name: getMonthString('07') },
  { id: '08', name: getMonthString('08') },
  { id: '09', name: getMonthString('09') },
  { id: '10', name: getMonthString('10') },
  { id: '11', name: getMonthString('11') },
  { id: '12', name: getMonthString('12') },
]);

const startItems = computed(() => {
  let minYear = new Date(props.minDate)?.getFullYear();
  let maxYear = new Date(props.maxDate)?.getFullYear();
  let minMonth = new Date(props.minDate)?.getMonth();
  let maxMonth = new Date(props.maxDate)?.getMonth();
  let res = [];

  if (props.kind === 'month') {
    if (!props.startDate && !props.endDate) {
      res = months.value;
    } else if (props.endDate) {
      months.value.forEach((x) => {
        if (x.id <= props.endDate) res.push(x);
      });
    } else if (props.startDate) {
      res = months.value;
    }
  } else if (props.kind === 'year') {
    let difference = maxYear - minYear;
    if (props.endDate) {
      difference = Number(props.endDate) - minYear;
    }

    if (
      (!props.minDate && !props.maxDate) ||
      (props.minDate && !props.maxDate) ||
      difference > 99
    ) {
      difference = 99;
    }

    for (let i = 0; i <= difference; i += 1) {
      const obj = { id: minYear?.toString(), name: minYear?.toString() };
      res.push(obj);
      minYear += 1;
    }
  } else if (props.kind === 'month-year') {
    if (props.endDate) {
      maxYear = new Date(props.endDate)?.getFullYear();
      maxMonth = new Date(props.endDate)?.getMonth();
    }
    minMonth += 1;
    maxMonth += 1;
    let diff = 12 * (maxYear - minYear) + (maxMonth - minMonth);

    if (
      (props.minDate && !props.maxDate) ||
      (!props.minDate && !props.maxDate) ||
      (!props.minDate && props.maxDate) ||
      diff > 99
    )
      diff = 99;
    if (!props.minDate && props.maxDate) {
      if (maxMonth > 3) {
        minYear = maxYear - 8;
        minMonth = maxMonth - 3;
      } else {
        minYear = maxYear - 9;
        minMonth = maxMonth - 3 + 12;
      }
    }
    for (let i = 0; i <= diff; i += 1) {
      let obj = {};
      const value = minMonth > 9 ? `${minYear}-${minMonth}` : `${minYear}-0${minMonth}`;
      obj = {
        id: value,
        name: getMonthYearString(minMonth, minYear),
      };
      res.push(obj);

      minMonth = (minMonth % 12) + 1;
      if (minMonth === 1) {
        minYear += 1;
      }
    }
  } else if (props.kind === 'quarters') {
    if (props.endDate) {
      maxYear = Number(props.endDate?.slice(0, 4));
      maxMonth = Number(props.endDate?.slice(-1)) * 3 - 1;
    }

    const monthDiff = Math.floor(maxMonth / 3) - Math.floor(minMonth / 3);
    let diff = 4 * (maxYear - minYear) + monthDiff;
    let quarter = Math.floor(minMonth / 3) + 1;

    if ((!props.minDate && !props.maxDate) || (props.minDate && !props.maxDate) || diff > 99) {
      diff = 99;
    }
    if (!props.minDate && props.maxDate) {
      minYear = maxYear - 25;
      quarter = Math.floor(maxMonth / 3) + 1;
      diff = 100;
    }

    for (let i = 0; i <= diff; i += 1) {
      const obj = { id: `${minYear}-Q${quarter}`, name: `${minYear}-Q${quarter}` };
      res.push(obj);
      quarter = (quarter % 4) + 1;
      if (quarter === 1) {
        minYear += 1;
      }
    }
  }

  return res;
});

const endItems = computed(() => {
  let minYear = new Date(props.minDate)?.getFullYear();
  const maxYear = new Date(props.maxDate)?.getFullYear();
  let minMonth = new Date(props.minDate)?.getMonth();
  let maxMonth = new Date(props.maxDate)?.getMonth();

  let res = [];
  if (props.kind === 'month') {
    if (!props.startDate && !props.endDate) {
      res = months.value;
    } else if (props.startDate) {
      months.value.forEach((x) => {
        if (x.id >= props.startDate) res.push(x);
      });
    } else if (props.endDate) {
      res = months.value;
    }
  }
  if (props.kind === 'year') {
    let difference = maxYear - minYear;
    if (props.startDate) {
      difference = maxYear - Number(props.startDate);
      minYear = Number(props.startDate);
    }

    if (
      (!props.minDate && !props.maxDate) ||
      (props.minDate && !props.maxDate) ||
      difference > 99
    ) {
      difference = 99;
    }

    for (let i = 0; i <= difference; i += 1) {
      const obj = { id: minYear?.toString(), name: minYear?.toString() };
      res.push(obj);
      minYear += 1;
    }
  } else if (props.kind === 'month-year') {
    if (props.startDate) {
      minYear = new Date(props.startDate)?.getFullYear();
      minMonth = new Date(props.startDate)?.getMonth();
    }
    minMonth += 1;
    maxMonth += 1;

    let diff = 12 * (maxYear - minYear) + (maxMonth - minMonth);

    if (
      (props.minDate && !props.maxDate) ||
      (!props.minDate && !props.maxDate) ||
      (!props.minDate && props.maxDate) ||
      diff > 99
    )
      diff = 99;
    if (!props.minDate && props.maxDate) {
      if (maxMonth > 3) {
        minYear = maxYear - 8;
        minMonth = maxMonth - 3;
      } else {
        minYear = maxYear - 9;
        minMonth = maxMonth - 3 + 12;
      }
    }
    for (let i = 0; i <= diff; i += 1) {
      let obj = {};
      const value = minMonth > 9 ? `${minYear}-${minMonth}` : `${minYear}-0${minMonth}`;
      obj = {
        id: value,
        name: getMonthYearString(minMonth, minYear),
      };
      res.push(obj);

      minMonth = (minMonth % 12) + 1;
      if (minMonth === 1) {
        minYear += 1;
      }
    }
  } else if (props.kind === 'quarters') {
    if (props.startDate) {
      minYear = Number(props.startDate?.slice(0, 4));
      minMonth = Number(props.startDate?.slice(-1)) * 3 - 1;
    }

    const monthDiff = Math.floor(maxMonth / 3) - Math.floor(minMonth / 3);
    let diff = 4 * (maxYear - minYear) + monthDiff;
    let quarter = Math.floor(minMonth / 3) + 1;

    if ((!props.minDate && !props.maxDate) || (props.minDate && !props.maxDate) || diff > 99) {
      diff = 99;
    }
    if (!props.minDate && props.maxDate) {
      minYear = maxYear - 25;
      quarter = Math.floor(maxMonth / 3) + 1;
      diff = 100;
    }

    for (let i = 0; i <= diff; i += 1) {
      const obj = { id: `${minYear}-Q${quarter}`, name: `${minYear}-Q${quarter}` };
      res.push(obj);
      quarter = (quarter % 4) + 1;
      if (quarter === 1) {
        minYear += 1;
      }
    }
  }
  return res;
});

const startDropDownModel = computed({
  get() {
    return props.startDate;
  },
  set(value) {
    if (!Array.isArray(value)) emits('update:startDate', value);
  },
});

const endDropDownModel = computed({
  get() {
    return props.endDate;
  },
  set(value) {
    if (!Array.isArray(value)) emits('update:endDate', value);
  },
});

watch(
  () => props.kind,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      startDropDownModel.value = null;
      endDropDownModel.value = null;
    }
  }
);

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
    <p v-if="readOnly" class="lx-data">
      <time :datetime="startDate">{{ getNameStart() }}</time> -
      <time :datetime="endDate">{{ getNameEnd() }}</time>
    </p>
    <template v-else>
      <div
        class="lx-date-time-picker-wrapper lx-date-time-range-wrapper"
        :class="{
          'lx-date':
            kind === 'date' ||
            kind === 'month' ||
            kind === 'year' ||
            kind === 'month-year' ||
            kind === 'quarters',
        }"
        :data-invalid="invalid ? '' : null"
        :data-disabled="disabled ? '' : null"
        v-if="kind === 'date'"
      >
        <LxIcon v-show="invalid" customClass="lx-invalidation-icon" value="invalid" />
        <LxIcon v-show="!invalid" customClass="lx-date-time-icon" value="calendar" />
        <LxIcon v-show="invalid" customClass="lx-invalidation-icon-end" value="invalid" />
        <LxIcon v-show="!invalid" customClass="lx-date-time-icon-end" value="calendar" />

        <LxDatePicker
          :id="id"
          v-model="model"
          :mode="kind"
          :masks="localeMasks"
          :placeholder="placeholder"
          :disabled="disabled"
          :invalid="invalid"
          :min-date="minDate"
          :max-date="maxDate"
          :locale="localeComputed"
          :first-day-of-the-week="localeFirstDay"
          picker-type="range"
          :texts="texts"
        />
      </div>

      <div v-if="kind !== 'date'" class="lx-date-dropdowns" :data-invalid="invalid ? '' : null">
        <LxValuePicker
          id="start"
          variant="dropdown"
          :nullable="true"
          :items="startItems"
          v-model="startDropDownModel"
          :disabled="disabled"
          :invalid="invalid"
          :tooltip="tooltip"
          :placeholder="placeholder"
        />
        -
        <LxValuePicker
          id="end"
          variant="dropdown"
          :nullable="true"
          :items="endItems"
          v-model="endDropDownModel"
          :disabled="disabled"
          :invalid="invalid"
          :tooltip="tooltip"
          :placeholder="placeholder"
        />
      </div>

      <div class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </template>
  </div>
</template>
