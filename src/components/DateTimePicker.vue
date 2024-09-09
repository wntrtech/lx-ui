<script setup>
import { shallowRef, computed, watch, ref, nextTick } from 'vue';
import { DatePicker } from 'v-calendar';
import {
  parseDate,
  formatJSON,
  formatDateJSON,
  formatDate,
  formatDateTime,
  isDateValid,
  isTimeValid,
} from '@/utils/dateUtils';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import { lxDateUtils, lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import LxValuePicker from '@/components/ValuePicker.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [String, Date], default: null },
  kind: { type: String, default: 'date' }, // 'date' or 'time' or 'date-time'
  placeholder: { type: String, default: null },
  tooltip: { type: String, default: null },
  minDate: { type: String, default: null },
  maxDate: { type: String, default: null },
  required: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  timeAdjust: { type: String, default: null },
  clearIfNotExact: { type: Boolean, default: false },
  locale: { type: Object, default: () => useLx().getGlobals()?.locale },
  specialDates: { type: Array, default: () => [] },
  dictionary: { type: Array, default: () => [] },
  variant: { type: String, default: 'default' }, // default || picker || full || full-columns || full-rows
  texts: {
    type: Object,
    default: () => ({ clear: 'Notīrīt', todayButton: 'Šodiena', clearButton: 'Attīrīt vērtību' }),
  },
});

const emits = defineEmits(['update:modelValue']);
const { dateFormat, dateTimeFormat, environment } = useLx().getGlobals();

const valueText = ref(null);
const inputRaw = ref();
const dateNow = new Date();

function extractTime(datetimeStr) {
  const timeRegex = /(\d{2}:\d{2}(:\d{2})?(\s?[APMapm]{2})?)/;
  const match = datetimeStr.match(timeRegex);
  if (match) return match[0];
  return null;
}

function activate() {
  if (props.kind === 'time') {
    if (props.modelValue?.length === 5) {
      valueText.value?.setHours(Number(props.modelValue?.slice(0, 2)));
      valueText.value?.setMinutes(Number(props.modelValue?.slice(3, 5)));
    } else {
      valueText.value = props.modelValue;
    }
  } else {
    valueText.value = parseDate(props.modelValue);
  }
}
activate();

function getModelConfigMask() {
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';

  switch (props.kind) {
    case 'date':
      return dateFormatToUse;
    case 'time':
      return 'HH:mm';
    case 'dateTime':
    case 'date-time':
      return dateTimeFormatToUse;
    default:
      return null;
  }
}

const localeComputed = computed(() => (props.locale?.locale ? props.locale?.locale : 'lv-LV'));
const localeFirstDay = computed(() =>
  props.locale?.firstDayOfTheWeek ? props.locale?.firstDayOfTheWeek : 2
);

function convertDatePartToUpperCase(format) {
  if (!format) return format;
  const parts = format.split(' ');
  if (parts.length > 0) {
    parts[0] = parts[0].toUpperCase();
  }
  return parts.join(' ');
}

function processMasks(masks) {
  const processedMasks = {
    inputDateTime24hr: convertDatePartToUpperCase(masks.inputDateTime24hr),
    input: convertDatePartToUpperCase(masks.input),
    inputTime24hr: masks.inputTime24hr,
  };

  return processedMasks;
}

const localeMasks = computed(() => {
  const dateFormatToUse = convertDatePartToUpperCase(dateFormat) || 'DD.MM.YYYY.';
  const dateTimeFormatToUse = convertDatePartToUpperCase(dateTimeFormat) || 'DD.MM.YYYY. HH:mm';

  const defaultMasks = {
    inputDateTime24hr: dateTimeFormatToUse,
    input: dateFormatToUse,
    inputTime24hr: 'HH:mm',
  };

  return props.locale?.masks ? processMasks(props.locale.masks) : defaultMasks;
});

const modelConfig = computed(() => ({
  type: 'string',
  mask: getModelConfigMask(),
  timeAdjust: props.timeAdjust,
}));

const placeholderComputed = computed(() => {
  if (props.placeholder !== null) {
    return props.placeholder;
  }

  switch (props.kind) {
    case 'date':
      return 'dd.mm.gggg.';
    case 'time':
      return 'st:mi';
    case 'dateTime':
    case 'date-time':
      return 'dd.mm.gggg. st:mi';
    default:
      return null;
  }
});

function validateIfExact() {
  if (props.kind === 'date') {
    if (props.clearIfNotExact) {
      const date = inputRaw.value;
      const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
      const inputMask = props.locale?.masks?.input || dateFormatToUse;

      const dayIndex = inputMask?.indexOf('dd');
      const monthIndex = inputMask?.indexOf('MM');
      const yearIndex = inputMask?.indexOf('yyyy');

      const day = date?.substring(dayIndex, dayIndex + 2);
      const month = date?.substring(monthIndex, monthIndex + 2);
      const year = date?.substring(yearIndex, yearIndex + 4);

      if (!isDateValid(`${year}-${month}-${day}`)) {
        valueText.value = null;
        inputRaw.value = null;
      }
    } else {
      const res = valueText.value;
      valueText.value = null;
      nextTick(() => {
        valueText.value = res;
      });
    }
  }

  if (props.clearIfNotExact && props.kind === 'time') {
    const date = inputRaw.value;
    const inputTime24hrMask = props.locale?.masks?.inputTime24hr || 'HH:mm';

    const hoursIndex = inputTime24hrMask?.indexOf('HH');
    const minutesIndex = inputTime24hrMask?.indexOf('mm');

    const hours = date?.substring(hoursIndex, hoursIndex + 2);
    const minutes = date?.substring(minutesIndex, minutesIndex + 2);

    if (hours > 23 || hours < 0 || minutes > 59 || minutes < 0) valueText.value = null;
  }

  if (props.kind === 'dateTime' || props.kind === 'date-time') {
    if (props.clearIfNotExact) {
      const date = inputRaw.value;
      const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';
      const inputDateTime24hrMask = props.locale?.masks?.inputTime24hr || dateTimeFormatToUse;

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

      if (
        !isDateValid(`${year}-${month}-${day}`) ||
        hours > 23 ||
        hours < 0 ||
        minutes > 59 ||
        minutes < 0
      )
        valueText.value = null;
    } else {
      const res = valueText.value;
      valueText.value = null;
      nextTick(() => {
        valueText.value = res;
      });
    }
  }

  const res = formatDateJSON(valueText.value);
  if (res === props.modelValue && props.clearIfNotExact) {
    valueText.value = null;
  } else if ((props.kind === 'dateTime' || props.kind === 'date-time') && props.clearIfNotExact) {
    const dateModelValue = new Date(props.modelValue);
    if (formatJSON(dateModelValue) === formatJSON(valueText.value)) {
      valueText.value = null;
    }
  }
}

const calendar = ref();

function setTimeOnInput() {
  if (props.kind === 'time' && !valueText.value) {
    const tempDate = new Date();

    tempDate.setHours(0);
    tempDate.setMinutes(0);
    valueText.value = tempDate;
  }
}

function onInputClick() {
  setTimeOnInput();
  let maxDateString = props.maxDate;
  let minDateString = props.minDate;
  const currentDateValue = formatJSON(new Date());
  if (typeof maxDateString !== 'string') maxDateString = formatJSON(props.maxDate);
  if (typeof minDateString !== 'string') minDateString = formatJSON(props.minDate);
  if (valueText.value === null && currentDateValue > maxDateString)
    calendar.value.move(maxDateString);
  else if (valueText.value === null && currentDateValue < minDateString)
    calendar.value.move(minDateString);
  else if (valueText.value === null) calendar.value.move(new Date());
}

function clear() {
  valueText.value = '';
}

function isSameDay(min, max) {
  if (!min || !max) return false;
  if (min.length === 5 || max.length === 5) return false;

  return (
    min?.getFullYear() === max?.getFullYear() &&
    min?.getMonth() === max?.getMonth() &&
    min?.getDate() === max?.getDate()
  );
}

function isSameHour(min, max) {
  if (isSameDay(min, max)) {
    if (min?.getHours() === max?.getHours()) return true;
  }
  return false;
}

const isNotDropdown = computed(
  () =>
    props.kind === 'date' ||
    props.kind === 'time' ||
    props.kind === 'dateTime' ||
    props.kind === 'date-time'
);

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    const formattedMinDate = props.kind === 'date' ? formatDateJSON(props.minDate) : props.minDate;
    const formattedMaxDate = props.kind === 'date' ? formatDateJSON(props.maxDate) : props.maxDate;

    if (isNotDropdown.value) {
      // we don't want to update the valueText if the seconds or milliseconds changed,
      // because it seems that with slower calculations, this event keeps firing a lot
      const oldMs = parseDate(oldValue)?.setSeconds(0, 0);
      const newMs = parseDate(newValue)?.setSeconds(0, 0);

      if (props.kind === 'time') {
        let temp = newValue;
        if (props.modelValue?.length === 5) {
          temp = new Date();
          temp.setHours(newValue.substring(0, 2));
          temp.setMinutes(newValue.substring(3, 5));
        }
        valueText.value = temp;
      } else if (newValue > formattedMaxDate || newValue < formattedMinDate) {
        if (oldValue > formattedMaxDate || oldValue < formattedMinDate) {
          emits('update:modelValue', null);
        } else {
          emits('update:modelValue', oldValue);
        }
        lxDevUtils.log('Piešķirtā vērtībā ir ārpus min-max robežām!', environment, 'warn');
      } else if (isDateValid(newValue) && oldMs !== newMs) {
        valueText.value = parseDate(newValue);
      } else if (newValue === null) {
        valueText.value = null;
        inputRaw.value = '';
      } else if (props.kind === 'date' && typeof newValue === 'string' && oldMs !== newMs) {
        valueText.value = newValue;
      }
    }
  }
);

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

function fillArray(max) {
  return Array.from({ length: max }, (_, index) => index);
}

function fillWithHours(min, max, arr) {
  const temp = arr;
  for (let hour = min; hour <= max; hour += 1) {
    temp.push(hour);
  }
  return temp;
}

function getAvailableTime(min, max, now) {
  let availableHours = [];
  let availableMinutes = [];

  const minParsedDate = parseDate(min);
  const maxParsedDate = parseDate(max);

  const minHour = minParsedDate?.getHours();
  const maxHour = maxParsedDate?.getHours();
  const minMinute = minParsedDate?.getMinutes();
  const maxMinute = maxParsedDate?.getMinutes();

  if (isSameDay(minParsedDate, maxParsedDate)) {
    availableHours = fillWithHours(minHour, maxHour, availableHours);
  } else if (isSameDay(now, maxParsedDate)) {
    availableHours = fillWithHours(0, maxHour, availableHours);
  } else if (isSameDay(minParsedDate, now)) {
    availableHours = fillWithHours(minHour, 23, availableHours);
  } else {
    availableHours = fillArray(24);
  }

  if (isSameHour(now, maxParsedDate)) {
    for (let minute = 0; minute <= maxMinute; minute += 1) {
      availableMinutes.push(minute);
    }
  } else if (isSameHour(minParsedDate, now)) {
    for (let minute = minMinute; minute <= 59; minute += 1) {
      availableMinutes.push(minute);
    }
  } else {
    availableMinutes = fillArray(60);
  }

  return {
    availableHours,
    availableMinutes,
  };
}

const allowedHours = ref([]);
const allowedMinutes = ref([]);
const minDat = ref(parseDate(props.minDate));
const maxDat = ref(parseDate(props.maxDate));

function allowedHoursFunction(min, max, now) {
  if (!min && !max) {
    return fillArray(24);
  }
  if (!min) {
    return getAvailableTime(null, max, now).availableHours;
  }
  if (!max) {
    return getAvailableTime(min, null, now).availableHours;
  }
  return getAvailableTime(min, max, now).availableHours;
}

function allowedMinutesFunction(min, max, now) {
  if (!min && !max) {
    return fillArray(60);
  }
  if (!min) {
    return getAvailableTime(null, max, now).availableMinutes;
  }
  if (!max) {
    return getAvailableTime(min, null, now).availableMinutes;
  }
  return getAvailableTime(min, max, now).availableMinutes;
}

allowedHours.value = allowedHoursFunction(minDat.value, maxDat.value, valueText.value);
allowedMinutes.value = allowedMinutesFunction(minDat.value, maxDat.value, valueText.value);

watch(
  () => [props.minDate, props.maxDate],
  (newValue) => {
    minDat.value = parseDate(newValue[0]);
    maxDat.value = parseDate(newValue[1]);
    allowedHours.value = allowedHoursFunction(props.minDate, props.maxDate, valueText.value);
    allowedMinutes.value = allowedMinutesFunction(props.minDate, props.maxDate, valueText.value);
  }
);

function checkMinMaxTimeLimits() {
  if (props.maxDate && valueText.value > parseDate(props.maxDate)) {
    valueText.value = parseDate(props.maxDate);
  } else if (props.minDate && valueText.value < parseDate(props.minDate)) {
    valueText.value = parseDate(props.minDate);
  }
}

function setInputRawDate(newValue) {
  if (!newValue) return;
  const dateFormatToUse = dateFormat || 'dd.MM.yyyy.';
  let res = props.locale?.masks?.input || dateFormatToUse;
  const year = newValue?.getFullYear();
  let month = newValue?.getMonth();
  if (month || month === 0) month += 1;
  const day = newValue?.getDate();
  res = res
    .replace('yyyy', year)
    .replace('MM', month > 9 ? month : `0${month}`)
    .replace('dd', day > 9 ? day : `0${day}`);
  if (day && month && year) inputRaw.value = res;
}

function setInputRawDateTime(newValue) {
  if (!newValue) return;
  const dateTimeFormatToUse = dateTimeFormat || 'dd.MM.yyyy. HH:mm';
  let res = props.locale?.masks?.inputDateTime24hr || dateTimeFormatToUse;
  const year = newValue?.getFullYear();
  let month = newValue?.getMonth();
  if (month || month === 0) month += 1;
  const day = newValue?.getDate();
  const hours = newValue?.getHours();
  const minutes = newValue?.getMinutes();
  res = res
    .replace('yyyy', year)
    .replace('MM', month > 9 ? month : `0${month}`)
    .replace('dd', day > 9 ? day : `0${day}`)
    .replace('HH', hours > 9 ? hours : `0${hours}`)
    .replace('mm', minutes > 9 ? minutes : `0${minutes}`);
  inputRaw.value = res;
}

watch(valueText, (newValue, oldValue) => {
  if (newValue === oldValue) return;

  if (newValue && oldValue) {
    allowedHours.value = allowedHoursFunction(minDat.value, maxDat.value, newValue);
    allowedMinutes.value = allowedMinutesFunction(minDat.value, maxDat.value, newValue);
    if (props.kind === 'dateTime' || props.kind === 'date-time') {
      setTimeout(checkMinMaxTimeLimits, 1);
    }
  }

  if (props.kind === 'time') {
    const nv = extractTime(formatDateTime(newValue));

    if (newValue) {
      let res = props.locale?.masks?.inputTime24hr || 'HH:mm';
      res = res
        .replace('HH', newValue?.getHours() > 9 ? newValue?.getHours() : `0${newValue?.getHours()}`)
        .replace(
          'mm',
          newValue?.getMinutes() > 9 ? newValue?.getMinutes() : `0${newValue?.getMinutes()}`
        );
      inputRaw.value = res;
    } else {
      inputRaw.value = '';
    }

    emits('update:modelValue', nv);
  } else if (props.kind === 'date') {
    const nv = formatDateJSON(newValue);

    if (nv === props.modelValue) {
      setInputRawDate(newValue);
      return;
    }

    if (newValue) {
      setInputRawDate(newValue);
    } else {
      inputRaw.value = '';
    }

    emits('update:modelValue', nv);
  } else if (props.kind === 'dateTime' || props.kind === 'date-time') {
    const nv = formatJSON(newValue);

    if (nv === props.modelValue) {
      setInputRawDateTime(newValue);
      return;
    }

    if (newValue) {
      setInputRawDateTime(newValue);
    } else {
      inputRaw.value = '';
    }

    emits('update:modelValue', nv);
  } else {
    const nv = formatJSON(newValue);
    if (nv === props.modelValue) return;
    emits('update:modelValue', nv);
  }
});

watch(
  () => props.kind,
  (newValue) => {
    if (
      (newValue === 'date' ||
        newValue === 'time' ||
        newValue === 'dateTime' ||
        newValue === 'date-time') &&
      props.variant === 'default'
    ) {
      nextTick(() => {
        const res = valueText.value;
        valueText.value = null;
        nextTick(() => {
          valueText.value = res;
        });
      });
    }
  },
  { immediate: true }
);

const requiredSet = shallowRef(false);

function clearButton() {
  if (props.required) {
    requiredSet.value = true;
    valueText.value = null;
    setTimeout(() => {
      requiredSet.value = false;
    }, 50);
  } else {
    valueText.value = null;
  }
}

const rules = ref({
  hours: allowedHours,
  minutes: allowedMinutes,
});

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

const rowsComputed = computed(() => {
  if (props.variant === 'full-rows' || props.variant === 'full') return 2;
  return 1;
});

const columnsComputed = computed(() => {
  if (props.variant === 'full-columns' || props.variant === 'full') return 2;
  return 1;
});

function currentDate() {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}`;
}

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
        bar: {
          color: colorFind || 'blue',
          style: {
            backgroundColor: colorFind || 'blue',
          },
        },
        dates: element?.dates,
        popover: {
          label: found?.name,
        },
      });
    }
  });
  return res;
});

const dropDownModel = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

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

const dropDownItems = computed(() => {
  let res = [];
  let minYear = new Date(props.minDate)?.getFullYear();
  const maxYear = new Date(props.maxDate)?.getFullYear();
  let minMonth = new Date(props.minDate)?.getMonth();
  let maxMonth = new Date(props.maxDate)?.getMonth();

  if (props.kind === 'month') {
    res = [
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
    ];
  } else if (props.kind === 'year') {
    let difference = maxYear - minYear;
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

/**
 * Check if the date is within the min and max date range
 * @param {Date} date
 * @returns {boolean}
 */
function canSelectDate(date) {
  return (!minDat.value || date >= minDat.value) && (!maxDat.value || date <= maxDat.value);
}

const canSelectToday = computed(() => canSelectDate(dateNow) && !props.disabled);
</script>

<template>
  <div class="lx-field-wrapper">
    <template v-if="readOnly">
      <p class="lx-data">
        <time :datetime="modelValueIso">
          {{ getName() }}
          <span v-if="valueText === null || valueText === undefined">—</span>
        </time>
      </p>
    </template>

    <template v-else>
      <div
        class="lx-date-time-picker-wrapper"
        :class="{
          'lx-date': kind === 'date',
          'lx-time': kind === 'time',
          'lx-date-time': kind === 'dateTime' || kind === 'date-time',
        }"
        :data-invalid="invalid ? '' : null"
        :data-disabled="disabled ? '' : null"
        :title="tooltip"
        v-if="isNotDropdown"
      >
        <LxIcon
          v-show="invalid && variant === 'default'"
          customClass="lx-invalidation-icon"
          value="invalid"
        />
        <LxIcon
          v-show="!invalid && kind !== 'time' && variant === 'default'"
          customClass="lx-date-time-icon"
          value="calendar"
        />
        <LxIcon
          v-show="!invalid && kind === 'time' && variant === 'default'"
          customClass="lx-date-time-icon"
          value="time"
        />
        <div
          v-if="kind === 'time' && valueText && !disabled && variant === 'default'"
          class="lx-clear"
        >
          <LxButton
            :title="texts.clear"
            kind="ghost"
            icon="remove"
            variant="icon-only"
            :destructive="true"
            @click="clear"
          />
        </div>
        <DatePicker
          ref="calendar"
          v-model="valueText"
          :model-config="modelConfig"
          :masks="localeMasks"
          :mode="kind === 'date-time' ? 'dateTime' : kind"
          :rows="rowsComputed"
          :columns="columnsComputed"
          :min-date="minDate"
          :max-date="maxDate"
          :is-required="requiredSet ? false : required"
          :rules="rules"
          :popover="{ positionFixed: true, visibility: 'focus' }"
          is24hr
          :locale="localeComputed"
          :update-on-input="false"
          :first-day-of-week="localeFirstDay"
          :attributes="attributesComputed"
          @click="setTimeOnInput"
        >
          <template v-slot="{ inputValue, inputEvents }" v-if="variant === 'default'">
            <label class="lx-visually-hidden" :for="id"></label>
            <input
              ref="input"
              :id="id"
              type="text"
              class="lx-date-time-picker"
              :class="[{ 'lx-invalid': invalid }]"
              :placeholder="placeholderComputed"
              :disabled="disabled"
              v-model="inputRaw"
              v-on="inputEvents"
              autocomplete="off"
              @click="onInputClick"
              @change="validateIfExact"
            />
          </template>
          <template #footer>
            <div class="footer-buttons">
              <LxButton
                :disabled="!canSelectToday"
                :title="props.texts.todayButton"
                kind="ghost"
                icon="undo"
                variant="icon-only"
                @click="emits('update:modelValue', formatJSON(dateNow))"
              />
              <LxButton
                :title="props.texts.clearButton"
                kind="ghost"
                icon="close"
                :destructive="true"
                variant="icon-only"
                @click="clearButton"
              />
            </div>
          </template>
        </DatePicker>

        <div class="time-footer-slot" v-if="variant !== 'default' && kind === 'time'">
          <LxButton
            :title="props.texts.todayButton"
            kind="ghost"
            icon="undo"
            variant="icon-only"
            @click="emits('update:modelValue', currentDate())"
          />
          <LxButton
            :title="texts.clear"
            kind="ghost"
            icon="remove"
            variant="icon-only"
            :destructive="true"
            @click="clear"
          />
        </div>
      </div>
      <div v-if="isNotDropdown" class="lx-invalidation-message">{{ invalidationMessage }}</div>
      <div v-if="!isNotDropdown" class="lx-date-picker-dropdown">
        <LxValuePicker
          variant="dropdown"
          :nullable="true"
          v-model="dropDownModel"
          :items="dropDownItems"
          :disabled="disabled"
          :invalid="invalid"
          :invalidationMessage="invalidationMessage"
          :tooltip="tooltip"
          :placeholder="placeholder"
        />
      </div>
    </template>
  </div>
</template>
