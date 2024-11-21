<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';

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
  texts: {
    type: Object,
    default: () => ({
      inputDaysPlaceholder: 'Ievadiet dienu skaitu',
      inputMonthsPlaceholder: 'Ievadiet mēnešu skaitu',
      inputYearsPlaceholder: 'Ievadiet gadu skaitu',
      inputTooltip: 'Dienu, mēnešu vai gadu ievade',
      dropdownPlaceholder: 'Izvēlieties vērtību',
      dropdownTooltip: 'Dienu, mēnešu vai gadu izvēle',
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'changed']);

const inputKind = ref('default');
const inputMask = ref('integer');
const convertToString = ref(true);
const inputMaxLength = ref(4);
const unitOptionTypes = ref([
  { id: 'days', name: 'Dienas' },
  { id: 'months', name: 'Mēneši' },
  { id: 'years', name: 'Gadi' },
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
  return !props.readOnly ? 'Nav rezultāta' : '';
});

function updatePlaceholder(unit) {
  if (unit === 'days') {
    inputPlaceholder.value = props.texts.inputDaysPlaceholder;
  } else if (unit === 'months') {
    inputPlaceholder.value = props.texts.inputMonthsPlaceholder;
  } else if (unit === 'years') {
    inputPlaceholder.value = props.texts.inputYearsPlaceholder;
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

  const yearString = years !== 0 ? `${years} ${years === 1 ? 'gads' : 'gadi'}` : '';
  const monthString = months !== 0 ? `${months} ${months === 1 ? 'mēnesis' : 'mēneši'}` : '';
  const dayString = days !== 0 ? `${days} ${days === 1 ? 'diena' : 'dienas'}` : '';

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
  () => props.texts,
  () => {
    updatePlaceholder(selectedUnit.value);
  },
  { deep: true, immediate: true }
);

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    // Compare primitive values
    if (newValue === oldValue) return;

    // Compare object stringified values
    if (typeof newValue === 'object' && typeof oldValue === 'object') {
      if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;
    }

    if (props.modelValue) {
      if (typeof props.modelValue === 'number') {
        inputValue.value = props.modelValue;
      }
      if (typeof props.modelValue === 'object') {
        inputValue.value = props.modelValue.value;
        selectedUnit.value = props.modelValue.unit;
      }
      calculateResult();
    }
  },
  { immediate: true }
);

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);
</script>

<template>
  <div
    :class="[{ 'lx-day-input-wrapper': !readOnly }, { 'lx-day-input-readonly-wrapper': readOnly }]"
  >
    <p v-if="readOnly" class="lx-data" :title="computedTitle">{{ result }}</p>

    <template v-else>
      <LxTextInput
        v-model="inputValue"
        :mask="inputMask"
        :kind="inputKind"
        :maxlength="inputMaxLength"
        :convert-to-string="convertToString"
        :disabled="disabled"
        :placeholder="inputPlaceholder"
        :tooltip="texts.inputTooltip"
        :invalid="invalid"
        :invalidationMessage="invalidationMessage"
        :labelId="labelledBy"
        @update:modelValue="calculateResult"
      />

      <LxDropDown
        v-model="selectedUnit"
        :items="unitOptionTypes"
        :placeholder="texts.dropdownPlaceholder"
        :tooltip="texts.dropdownTooltip"
        :disabled="disabled"
        :invalid="invalid"
        :labelId="labelledBy"
        @update:modelValue="calculateResult"
      />
    </template>

    <div class="lx-day-input-result-info-icon">
      <LxInfoWrapper v-if="shouldShowInfoIcon" :placement="'top'">
        <LxIcon value="info" />

        <template #panel>
          <p class="lx-data">{{ displayText }}</p>
        </template>
      </LxInfoWrapper>
    </div>
  </div>

  <div v-if="!readOnly" class="lx-day-input-result-info-icon">
    <div v-if="kind === 'label'" class="lx-day-input-tooltip-text">{{ result }}</div>
  </div>
</template>
