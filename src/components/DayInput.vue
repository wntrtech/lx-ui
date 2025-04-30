<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';

import { getDisplayTexts } from '@/utils/generalUtils';
import { capitalizeFirstLetter } from '@/utils/stringUtils';
import LxTextInput from '@/components/TextInput.vue';
import LxDropDown from '@/components/Dropdown.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  modelValue: { type: [Number, Object], default: null },
  disabled: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  kind: { type: String, default: 'label' }, // result kind: label, icon
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  inputDaysPlaceholder: 'Ievadiet dienu skaitu',
  inputMonthsPlaceholder: 'Ievadiet mēnešu skaitu',
  inputYearsPlaceholder: 'Ievadiet gadu skaitu',
  inputTooltip: 'Dienu, mēnešu vai gadu ievade',
  dropdownPlaceholder: 'Izvēlieties vērtību',
  dropdownTooltip: 'Dienu, mēnešu vai gadu izvēle',
  noResults: 'Nav rezultāta',
  daysPlural: 'dienas',
  monthsPlural: 'mēneši',
  yearsPlural: 'gadi',
  daysSingular: 'diena',
  monthsSingular: 'mēnesis',
  yearsSingular: 'gads',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue', 'changed']);

const inputKind = ref('default');
const inputMask = ref('integer');
const convertToString = ref(true);
const inputMaxLength = ref(4);
const unitOptionTypes = ref([
  { id: 'days', name: capitalizeFirstLetter(displayTexts.value.daysPlural) },
  { id: 'months', name: capitalizeFirstLetter(displayTexts.value.monthsPlural) },
  { id: 'years', name: capitalizeFirstLetter(displayTexts.value.yearsPlural) },
]);

const inputValue = ref();
const selectedUnit = ref('days');
const result = ref('');
const inputPlaceholder = ref('');

const selectedUnitName = computed(() => {
  const selectedUnitType = unitOptionTypes.value.find((unit) => unit.id === selectedUnit.value);
  return selectedUnitType ? selectedUnitType.name : '';
});

const shouldShowInfoIcon = computed(
  () => props.kind === 'icon' && (inputValue.value || !props.readOnly)
);

const tooltipText = computed(() =>
  inputValue.value ? `${inputValue.value} ${selectedUnitName.value}` : ''
);

const computedTitle = computed(() => (props.kind === 'label' ? tooltipText.value : ''));

const displayText = computed(() => {
  if (result.value) {
    return props.readOnly ? tooltipText.value : result.value;
  }
  return !props.readOnly ? displayTexts.value.noResults : '';
});

function updatePlaceholder(unit) {
  if (unit === 'days') {
    inputPlaceholder.value = displayTexts.value.inputDaysPlaceholder;
  } else if (unit === 'months') {
    inputPlaceholder.value = displayTexts.value.inputMonthsPlaceholder;
  } else if (unit === 'years') {
    inputPlaceholder.value = displayTexts.value.inputYearsPlaceholder;
  }
}

function calculateResult() {
  let value = Number(inputValue.value);

  const daysInYear = 365;
  const daysInMonth = 30;
  const monthsInYear = 12;

  let years = 0;
  let months = 0;
  let days = 0;
  let daysResult = 0;

  switch (selectedUnit.value) {
    case 'years':
      years = Math.floor(value);
      daysResult = Math.floor(value * daysInYear);
      break;

    case 'months':
      years = Math.floor(value / monthsInYear);
      months = Math.floor(value % monthsInYear);
      daysResult = Math.floor(value * daysInMonth);
      break;

    case 'days':
      years = Math.floor(value / daysInYear);
      value -= years * daysInYear;
      months = Math.floor(value / daysInMonth);
      days = Math.floor(value - months * daysInMonth);
      daysResult = Math.floor(Number(inputValue.value));
      break;

    default:
      break;
  }

  const yearString = (() => {
    if (years !== 0) {
      return `${years} ${
        years === 1 ? displayTexts.value.yearsSingular : displayTexts.value.yearsPlural
      }`;
    }
    return '';
  })();

  const monthString = (() => {
    if (months !== 0) {
      return `${months} ${
        months === 1 ? displayTexts.value.monthsSingular : displayTexts.value.monthsPlural
      }`;
    }
    return '';
  })();

  const dayString = (() => {
    if (days !== 0) {
      return `${days} ${
        days === 1 ? displayTexts.value.daysSingular : displayTexts.value.daysPlural
      }`;
    }
    return '';
  })();

  result.value = [yearString, monthString, dayString].filter(Boolean).join(', ');

  if (props.modelValue === null && inputValue.value) {
    emits('update:modelValue', daysResult);
  } else if (typeof props.modelValue === 'number') {
    emits('update:modelValue', daysResult);
  } else if (typeof props.modelValue === 'object') {
    emits('update:modelValue', {
      value: inputValue.value,
      unit: selectedUnit.value,
    });
  }
}

watch(
  () => selectedUnit.value,
  (newValue) => {
    updatePlaceholder(newValue);
  },
  { immediate: true }
);

watch(
  () => displayTexts,
  () => {
    updatePlaceholder(selectedUnit.value);
  },
  { deep: true, immediate: true }
);

watch(
  () => inputValue.value,
  () => {
    calculateResult();
  }
);

watch(
  () => selectedUnit.value,
  () => {
    calculateResult();
  }
);

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue === oldValue) return;

    if (typeof newValue === 'object' && typeof oldValue === 'object') {
      if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;
    }

    if (newValue) {
      if (typeof newValue === 'number' && selectedUnit.value === 'days') {
        inputValue.value = newValue;
      }
      if (typeof newValue === 'object') {
        inputValue.value = newValue.value;
        selectedUnit.value = newValue.unit;
      }
    }
  },
  { immediate: true }
);

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);
</script>

<template>
  <div class="lx-field-wrapper">
    <div
      :class="[
        { 'lx-day-input-wrapper': !readOnly },
        { 'lx-day-input-readonly-wrapper': readOnly },
      ]"
    >
      <p v-if="readOnly" class="lx-data" :title="computedTitle" :aria-labelledby="labelledBy">
        <span v-if="!result"> — </span>
        <span v-else>
          {{ result }}
        </span>
      </p>

      <template v-else>
        <LxTextInput
          v-model="inputValue"
          :mask="inputMask"
          :kind="inputKind"
          :maxlength="inputMaxLength"
          :convert-to-string="convertToString"
          :disabled="disabled"
          :placeholder="inputPlaceholder"
          :tooltip="displayTexts.inputTooltip"
          :invalid="invalid"
          :invalidationMessage="invalidationMessage"
          :labelId="labelledBy"
        />

        <LxDropDown
          v-model="selectedUnit"
          :items="unitOptionTypes"
          :placeholder="displayTexts.dropdownPlaceholder"
          :tooltip="displayTexts.dropdownTooltip"
          :disabled="disabled"
          :invalid="invalid"
          :labelId="labelledBy"
        />
      </template>

      <div class="lx-day-input-result-info-icon">
        <LxInfoWrapper v-if="shouldShowInfoIcon" placement="top">
          <LxIcon value="info" />

          <template #panel>
            <p class="lx-data">{{ displayText }}</p>
          </template>
        </LxInfoWrapper>
      </div>
    </div>
  </div>

  <div v-if="!readOnly" class="lx-day-input-result-info-icon">
    <div v-if="kind === 'label'" class="lx-day-input-tooltip-text">{{ result }}</div>
  </div>
</template>
