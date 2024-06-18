<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeMount } from 'vue';
import { DatePicker } from 'v-calendar';
import { formatDateJSON, formatDate, formatJSON, isDateValid } from '@/utils/dateUtils';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import useLx from '@/hooks/useLx';
import LxValuePicker from '@/components/ValuePicker.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { lxDevUtils } from '@/utils';

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
  texts: {
    type: Object,
    default: () => ({
      clear: 'Notīrīt',
      clearButton: 'Notīrīt vērtības',
      todayButton: 'Atgriezties uz šodienu',
      clearStart: 'Notīrīt sākuma vērtību',
      clearEnd: 'Notīrīt beigu vērtību',
    }),
  },
});
const emits = defineEmits(['update:startDate', 'update:endDate']);
const dp = ref();
const changingKey = ref(1);
const inputStart = ref();
const inputEnd = ref();
const idEnd = ref('idEnd');
const startRaw = ref('');
const endRaw = ref('');
const calendarValue = ref({ start: null, end: null });
const disableMinMax = ref(false);
const dropDownMenu = ref();

const { dateFormat, dateTimeFormat } = useLx().getGlobals();

function updateEndValue(endValue) {
  if (props.kind === 'date') {
    if (typeof endValue !== 'string') {
      if (formatDateJSON(endValue) !== '9999-12-31')
        emits('update:endDate', formatDateJSON(endValue));
      else emits('update:endDate', null);
    } else if (endValue !== '9999-12-31') {
      emits('update:endDate', endValue);
    } else if (endValue === '9999-12-31') emits('update:endDate', null);
    changingKey.value += 1;
  }
}
function updateStartValue(startValue) {
  if (props.kind === 'date') {
    if (typeof startValue !== 'string') {
      if (formatDateJSON(startValue) !== '1900-01-01')
        emits('update:startDate', formatDateJSON(startValue));
      else emits('update:startDate', null);
    } else if (startValue !== '1900-01-01') {
      emits('update:startDate', startValue);
    } else if (startValue === '1900-01-01') emits('update:startDate', null);
  }
}
const model = computed({
  get() {
    return { start: props.startDate, end: props.endDate };
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
      } else emits('update:endDate', null);
      if (value.end) {
        updateEndValue(value.end);
      } else emits('update:endDate', null);
    }
  },
});

function formatToLocale(string) {
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  let res = props.locale?.masks?.input || dateFormatToUse;
  const date = new Date(string);
  const year = date?.getFullYear();
  let month = date?.getMonth();
  if (month || month === 0) month += 1;
  const day = date?.getDate();
  res = res
    .replace('yyyy', year)
    .replace('MM', month > 9 ? month : `0${month}`)
    .replace('dd', day > 9 ? day : `0${day}`);
  if (day && month && year) return res;
  return null;
}

function formatFromLocale(string) {
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';
  const res = props.locale?.masks?.input || dateTimeFormatToUse;
  const day = string?.substr(res?.indexOf('dd'), 2);
  const month = string?.substr(res?.indexOf('MM'), 2);
  const year = string?.substr(res?.indexOf('yyyy'), 4);
  if (isDateValid(`${year}-${month}-${day}`)) {
    return `${year}-${month}-${day}`;
  }
  return null;
}

function isTheSameDate(dateOne, dateTwo) {
  let one = dateOne;
  let two = dateTwo;
  if (dateOne && typeof dateOne !== 'string') one = formatJSON(dateOne)?.split('T')[0];
  if (dateTwo && typeof dateTwo !== 'string') two = formatJSON(dateTwo)?.split('T')[0];
  return one === two;
}

const globalEnvironment = useLx().getGlobals()?.environment;

watch(
  () => model.value,
  (newValue, oldValue) => {
    if (newValue?.start !== oldValue?.start || newValue?.end !== oldValue?.end) {
      let resetStart = false;
      let resetEnd = false;
      if (props.startDate) {
        if (props.minDate && newValue?.start <= props.minDate) {
          resetStart = true;
        } else {
          startRaw.value = formatToLocale(props.startDate);
        }
      } else {
        startRaw.value = '';
      }
      if (props.endDate) {
        if (props.maxDate && newValue?.end >= props.maxDate) {
          resetEnd = true;
        } else {
          endRaw.value = formatToLocale(props.endDate);
        }
      } else {
        endRaw.value = '';
      }
      if (resetStart || resetEnd) {
        lxDevUtils.log('Piešķirtā vērtībā ir ārpus min-max robežām!', globalEnvironment, 'warn');
        model.value = {
          start: resetStart ? oldValue?.start : newValue?.start,
          end: resetEnd ? oldValue?.end : newValue?.end,
        };
      }
    }
    if (
      !isTheSameDate(calendarValue.value?.start, props.startDate) ||
      !isTheSameDate(calendarValue.value?.end, props.endDate) ||
      newValue?.start <= newValue?.end ||
      newValue?.start >= props.minDate ||
      newValue?.end <= props.maxDate
    ) {
      let resStart = null;
      let resEnd = null;
      disableMinMax.value = true;

      if (newValue.start)
        resStart = newValue?.start <= props.minDate ? oldValue?.start : newValue?.start;
      if (newValue.end) resEnd = newValue?.end >= props.maxDate ? oldValue?.end : newValue?.end;
      if (!resStart && !resEnd) {
        calendarValue.value = {
          start: null,
          end: null,
        };
      } else
        calendarValue.value = {
          start: resStart || '1900-01-01',
          end: resEnd || '9999-12-31',
        };
      nextTick(() => {
        disableMinMax.value = false;
      });
    }
  },
  { immediate: true }
);

function getModelConfigMask() {
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  if (props.kind === 'date') return dateFormatToUse;
  return null;
}

const modelConfig = computed(() => ({
  type: 'string',
  mask: getModelConfigMask(),
  timeAdjust: props.timeAdjust,
}));

const placeholderComputed = computed(() => {
  if (props.placeholder !== null) return props.placeholder;
  if (props.kind === 'date') return 'dd.mm.gggg.';
  return null;
});

function onInputClick() {
  const currentDate = formatJSON(new Date());
  if ((!props.startDate || !props.endDate) && currentDate > props.maxDate) {
    dp.value.move(new Date(props.maxDate));
  } else if ((!props.startDate || !props.endDate) && currentDate < props.minDate) {
    dp.value.move(new Date(props.minDate));
  } else if (!props.startDate || !props.endDate) {
    dp.value.move(new Date());
  }
}

function clear() {
  emits('update:startDate', null);
  emits('update:endDate', null);
}
function focus(source = null) {
  if (source === 'start') {
    inputStart.value.focus();
    nextTick(() => dp.value.showPopover());
  } else if (source === 'end') {
    inputEnd.value.focus();
  }
}

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

      minMonth += 1;
      if (minMonth === 13) {
        minYear += 1;
        minMonth = 1;
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
      quarter += 1;
      if (quarter === 5) {
        quarter = 1;
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

      minMonth += 1;
      if (minMonth === 13) {
        minYear += 1;
        minMonth = 1;
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
      quarter += 1;
      if (quarter === 5) {
        quarter = 1;
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

function changeStart() {
  if ((props.minDate && formatFromLocale(startRaw.value) >= props.minDate) || !props.minDate) {
    if (startRaw.value !== '' && endRaw.value === '') {
      disableMinMax.value = true;
      calendarValue.value = {
        start: `${formatFromLocale(startRaw.value)}`,
        end: '9999-12-31',
      };
      nextTick(() => {
        disableMinMax.value = false;
      });
      model.value = { start: formatFromLocale(startRaw.value), end: null };
    } else {
      calendarValue.value = {
        start: formatFromLocale(startRaw.value),
        end: formatFromLocale(endRaw.value),
      };
      model.value = {
        start: formatFromLocale(startRaw.value),
        end: formatFromLocale(endRaw.value),
      };
    }
  } else if (startRaw.value === '' && endRaw.value !== '') {
    disableMinMax.value = true;
    calendarValue.value = {
      start: '1900-01-01',
      end: `${formatFromLocale(endRaw.value)}`,
    };
    nextTick(() => {
      disableMinMax.value = false;
    });
    model.value = {
      start: null,
      end: formatFromLocale(endRaw.value),
    };
  } else if (startRaw.value === '' && endRaw.value === '') {
    calendarValue.value = {
      start: null,
      end: null,
    };
    model.value = null;
  } else startRaw.value = formatToLocale(props.startDate);
}

function changeEnd() {
  if ((props.maxDate && formatFromLocale(endRaw.value) <= props.maxDate) || !props.maxDate) {
    if (endRaw.value !== '' && startRaw.value === '') {
      disableMinMax.value = true;
      calendarValue.value = {
        start: '1900-01-01',
        end: `${formatFromLocale(endRaw.value)}`,
      };
      nextTick(() => {
        disableMinMax.value = false;
      });
      model.value = { start: null, end: formatFromLocale(endRaw.value) };
    } else {
      calendarValue.value = {
        start: formatFromLocale(startRaw.value),
        end: formatFromLocale(endRaw.value),
      };
      model.value = {
        start: formatFromLocale(startRaw.value),
        end: formatFromLocale(endRaw.value),
      };
    }
  } else if (startRaw.value !== '' && endRaw.value === '') {
    disableMinMax.value = true;
    calendarValue.value = {
      start: `${formatFromLocale(startRaw.value)}`,
      end: '9999-12-31',
    };
    nextTick(() => {
      disableMinMax.value = false;
    });
    model.value = {
      start: formatFromLocale(startRaw.value),
      end: null,
    };
  } else if (startRaw.value === '' && endRaw.value === '') {
    calendarValue.value = {
      start: null,
      end: null,
    };
    model.value = null;
  } else endRaw.value = formatToLocale(props.endDate);
}

function nullStartValue() {
  disableMinMax.value = true;
  if (endRaw.value === '') {
    calendarValue.value = {
      start: null,
      end: null,
    };
  } else
    calendarValue.value = {
      start: '1900-01-01',
      end: `${formatDateJSON(endRaw.value)}`,
    };
  nextTick(() => {
    disableMinMax.value = false;
  });
  startRaw.value = '';
}

function nullEndValue() {
  disableMinMax.value = true;
  if (startRaw.value === '') {
    calendarValue.value = {
      start: null,
      end: null,
    };
  } else
    calendarValue.value = {
      start: `${formatDateJSON(startRaw.value)}`,
      end: '9999-12-31',
    };
  nextTick(() => {
    disableMinMax.value = false;
  });
  endRaw.value = '';
}

function moveTo() {
  if (model.value?.start) {
    dp.value.move(calendarValue.value?.start);
  } else if (model.value?.end) {
    dp.value.move(calendarValue.value?.end);
  } else dp.value.move(new Date());
}

function openDropDownMenu() {
  dropDownMenu.value.openMenu();
  moveTo();
}

function updateCalendar() {
  model.value = {
    start: formatJSON(calendarValue.value?.start)?.split('T')[0] || null,
    end: formatJSON(calendarValue.value?.end)?.split('T')[0] || null,
  };
  if (formatJSON(calendarValue.value?.start)?.split('T')[0] === '1900-01-01') startRaw.value = '';
  else {
    startRaw.value = formatToLocale(calendarValue.value?.start);
  }
  if (formatJSON(calendarValue.value?.end)?.split('T')[0] === '9999-12-31') endRaw.value = '';
  else {
    endRaw.value = formatToLocale(calendarValue.value?.end);
  }
}

onBeforeMount(() => {
  if (props.startDate && props.endDate && props.endDate < props.startDate) {
    model.value = {
      start: props.startDate,
      end: null,
    };
    endRaw.value = '';
  }
});

defineExpose({ focus });
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
          'lx-date': kind === 'date',
        }"
        :data-invalid="invalid ? '' : null"
        :data-disabled="disabled ? '' : null"
        v-if="kind === 'date'"
      >
        <LxDropDownMenu ref="dropDownMenu">
          <div
            class="lx-date-time-range-input-fields"
            @click="moveTo()"
            @keyup.tab="openDropDownMenu()"
          >
            <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
            <input
              ref="inputStart"
              :id="id"
              type="text"
              class="lx-date-time-picker"
              :class="[{ 'lx-invalid': invalid }]"
              :placeholder="placeholderComputed"
              :disabled="disabled"
              v-model="startRaw"
              autocomplete="off"
              @click="onInputClick()"
              @change="changeStart()"
              @keydown.tab="openDropDownMenu()"
            />
            <div class="lx-date-time-range-separator">
              <p>-</p>
            </div>
            <div>
              <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
              <input
                ref="inputEnd"
                :id="idEnd"
                type="text"
                class="lx-date-time-picker"
                :class="[{ 'lx-invalid': invalid }]"
                :placeholder="placeholderComputed"
                :disabled="disabled"
                v-model="endRaw"
                autocomplete="off"
                @click="onInputClick()"
                @change="changeEnd()"
                @keydown.tab="openDropDownMenu()"
              />
              <LxIcon v-show="invalid" customClass="lx-invalidation-icon" value="invalid" />
              <LxIcon
                v-show="!invalid && kind !== 'time'"
                customClass="lx-date-time-icon"
                value="calendar"
              />
              <LxIcon v-show="invalid" customClass="lx-invalidation-icon-end" value="invalid" />
              <LxIcon
                v-show="!invalid && kind !== 'time'"
                customClass="lx-date-time-icon-end"
                value="calendar"
              />
            </div>
          </div>
          <template #clickSafePanel>
            <DatePicker
              ref="dp"
              v-model.range="calendarValue"
              :model-config="modelConfig"
              :mode="kind"
              :title="tooltip"
              :min-date="disableMinMax ? null : props.minDate"
              :max-date="disableMinMax ? null : props.maxDate"
              :is-required="required"
              is24hr
              :locale="localeComputed"
              :update-on-input="true"
              :columns="2"
              :first-day-of-week="localeFirstDay"
              :masks="localeMasks"
              :input-debounce="0"
              @update:model-value="updateCalendar()"
            >
              <template #footer>
                <div class="footer-buttons">
                  <LxButton
                    @click="nullStartValue"
                    icon="first-page"
                    kind="ghost"
                    :title="props.texts.clearStart"
                  />
                  <lx-button
                    :title="props.texts.todayButton"
                    kind="ghost"
                    icon="reset"
                    variant="icon-only"
                    @click="dp.move(new Date())"
                  />
                  <LxButton
                    @click="nullEndValue"
                    icon="last-page"
                    kind="ghost"
                    :title="props.texts.clearEnd"
                  />
                  <lx-button
                    :title="props.texts.clearButton"
                    kind="ghost"
                    icon="close"
                    :destructive="true"
                    variant="icon-only"
                    @click="clear"
                  />
                </div>
              </template>
            </DatePicker>
          </template>
        </LxDropDownMenu>
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
