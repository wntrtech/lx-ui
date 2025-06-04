<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import LxTextInput from '@/components/TextInput.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 9999 },
  step: { type: Number, default: 1 },
  stepMultiplier: { type: Number, default: 5 },
  hasInput: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  labelId: { type: String, default: null },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return Number(props.modelValue);
  },
  set(value) {
    emits('update:modelValue', Number(value));
  },
});

watch(
  () => model.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      model.value = Number(newValue);
    }

    if (model.value <= props.min) {
      model.value = props.min;
    }
    if (model.value >= props.max) {
      model.value = props.max;
    }
  }
);

const tooltip = computed(() => model.value.toString());

const onIncreaseMultiplier = () => {
  model.value += props.stepMultiplier - 1;
};
const onDecreaseMultiplier = () => {
  model.value -= props.stepMultiplier - 1;
};
const onIncreaseStep = () => {
  model.value += Number(props.step) - 1;
};
const onDecreaseStep = () => {
  model.value -= Number(props.step) - 1;
};
const fillingUp = computed(() => ((model.value - props.min) / (props.max - props.min)) * 100);

const color = ref('--color-data');
function onFocus() {
  color.value = '--color-brand';
}
function deFocus() {
  color.value = '--color-data';
}

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);
</script>
<template>
  <div class="lx-field-wrapper">
    <p v-if="readOnly" class="lx-data" :aria-labelledby="labelledBy">{{ model }}</p>
    <div class="input-slider-container-wrapper" v-if="!readOnly">
      <div class="input-slider-range-label">
        <p>{{ props.min }}</p>
      </div>

      <div class="input-slider">
        <input
          v-model="model"
          @focusin="onFocus"
          @focusout="deFocus"
          :title="tooltip"
          type="range"
          class="lx-number-slider"
          :id="id"
          :min="props.min"
          :max="props.max"
          :aria-labelledby="labelledBy"
          @keydown.up="onIncreaseStep"
          @keydown.right="onIncreaseStep"
          @keydown.down="onDecreaseStep"
          @keydown.left="onDecreaseStep"
          @keydown.shift.up.exact="onIncreaseMultiplier"
          @keydown.shift.right.exact="onIncreaseMultiplier"
          @keydown.shift.down.exact="onDecreaseMultiplier"
          @keydown.shift.left.exact="onDecreaseMultiplier"
        />
        <div
          class="input-slider-filled"
          :style="`width: ${fillingUp}%; background-color: var(${color})`"
        />
        <div class="input-slider-full" />
      </div>

      <div class="input-slider-range-label">
        <p>{{ props.max }}</p>
      </div>
      <div class="input-slider-range-text" v-show="hasInput">
        <LxTextInput type="text" v-model="model" mask="integer" :labelId="labelledBy" />
      </div>
    </div>
  </div>
</template>
