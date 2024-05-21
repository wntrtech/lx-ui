<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import LxTextInput from '@/components/TextInput.vue';
import LxDropDown from '@/components/Dropdown.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  modelValue: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  kind: { type: String, default: 'label' }, // result kind: label, icon
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
  {
    id: 'days',
    name: 'Dienas',
  },
  {
    id: 'months',
    name: 'Mēneši',
  },
  {
    id: 'years',
    name: 'Gadi',
  },
]);

const inputValue = ref(props.modelValue);
const selectedUnit = ref('days');
const result = ref('');
const inputPlaceholder = ref('');

const selectedUnitName = computed(() => {
  const selectedUnitType = unitOptionTypes.value.find((unit) => unit.id === selectedUnit.value);
  return selectedUnitType ? selectedUnitType.name : '';
});

const shouldShowInfoIcon = computed(
  () =>
    (props.kind === 'icon' && !props.readOnly) ||
    (props.kind === 'icon' && props.readOnly && inputValue.value)
);

function calculateResult() {
  let value = Number(inputValue.value);
  const unit = selectedUnit.value;

  const daysInYear = 365.25;
  const daysInMonth = 30.44;
  const monthsInYear = 12;

  let years = 0;
  let months = 0;
  let days = 0;
  let daysResult = 0;

  switch (unit) {
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
      daysResult = Math.floor(value);
      break;
    default:
      break;
  }

  const yearString = years !== 0 ? `${years} ${years === 1 ? 'gads' : 'gadi'}` : '';
  const monthString = months !== 0 ? `${months} ${months === 1 ? 'mēnesis' : 'mēneši'}` : '';
  const dayString = days !== 0 ? `${days} ${days === 1 ? 'diena' : 'dienas'}` : '';

  result.value = [yearString, monthString, dayString].filter(Boolean).join(', ');

  emits('update:modelValue', daysResult);
}

watch(
  () => selectedUnit.value,
  (newValue) => {
    if (newValue === 'days') {
      inputPlaceholder.value = props.texts.inputDaysPlaceholder;
    } else if (newValue === 'months') {
      inputPlaceholder.value = props.texts.inputMonthsPlaceholder;
    } else if (newValue === 'years') {
      inputPlaceholder.value = props.texts.inputYearsPlaceholder;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    :class="[{ 'lx-day-input-wrapper': !readOnly }, { 'lx-day-input-readonly-wrapper': readOnly }]"
  >
    <template v-if="readOnly">
      <p>
        <span v-if="inputValue">{{ inputValue }}</span>
        <span v-else>—</span>
        <span v-if="inputValue">—</span>
        <span v-if="inputValue">{{ selectedUnitName }}</span>
      </p>
    </template>

    <template v-else>
      <LxTextInput
        v-model="inputValue"
        :mask="inputMask"
        :kind="inputKind"
        :maxlength="inputMaxLength"
        :convert-to-string="convertToString"
        :readOnly="readOnly"
        :disabled="disabled"
        :placeholder="inputPlaceholder"
        :tooltip="texts.inputTooltip"
        @update:modelValue="calculateResult"
      />

      <LxDropDown
        v-model="selectedUnit"
        :items="unitOptionTypes"
        :readOnly="readOnly"
        :placeholder="texts.dropdownPlaceholder"
        :tooltip="texts.dropdownTooltip"
        :disabled="disabled"
        @update:modelValue="calculateResult"
      ></LxDropDown>
    </template>

    <div
      :class="[
        'lx-day-input-result-info-icon',
        { 'lx-day-input-result-readonly-wrapper': readOnly },
      ]"
    >
      <LxInfoWrapper v-if="shouldShowInfoIcon" :placement="'top'">
        <LxIcon value="info" />

        <template #panel>
          <p v-if="result" class="lx-data">{{ result }}</p>
          <p v-else class="lx-data">Nav rezultāta</p>
        </template>
      </LxInfoWrapper>
    </div>
  </div>

  <div
    :class="['lx-day-input-result-info-icon', { 'lx-day-input-result-readonly-wrapper': readOnly }]"
  >
    <div v-if="kind === 'label'" class="lx-day-input-tooltip-text">{{ result }}</div>
  </div>
</template>
