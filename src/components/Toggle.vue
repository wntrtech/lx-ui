<script setup lang="ts">
import { computed, ref, watch, onMounted, useSlots, inject, nextTick } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';
import { formatValueBool } from '@/utils/formatUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: Boolean, default: null },
  size: { type: String, default: 'm' }, // 's' (small) or 'm' (medium)
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  tooltip: { type: String, default: null },
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const slots = useSlots();
const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (!props.readOnly) emits('update:modelValue', value);
  },
});

const textsDefault = { valueYes: 'Jā', valueNo: 'Nē' };
const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const input = ref({});

function checkModelState() {
  if (!input.value) return;

  if (model.value === null) {
    input.value.indeterminate = true;
    input.value.checked = false;
  } else {
    input.value.indeterminate = false;
    input.value.checked = model.value;
  }
}

const booleanTexts = computed(() => ({
  yes: displayTexts.value.valueYes,
  no: displayTexts.value.valueNo,
}));

const tooltipValue = computed(() => {
  let res = '';

  if (!props.tooltip && (!slots.on || !slots.off)) {
    res = formatValueBool(model.value, booleanTexts.value);
  } else if (props.tooltip && (!slots.on || !slots.off)) {
    res = `${props.tooltip}: ${formatValueBool(model.value, booleanTexts.value)}`;
  } else if (props.tooltip) {
    res = props.tooltip;
  }
  return res;
});

const hasSlots = computed(() => !!(slots.on || slots.off || slots.indeterminate || slots.default));

function toggleValue() {
  input.value?.click();
}

watch(model, () => {
  checkModelState();
});

watch(
  () => props.readOnly,
  () => {
    nextTick(() => {
      checkModelState();
    });
  }
);

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  checkModelState();
});
</script>

<template>
  <div class="lx-field-wrapper">
    <div v-if="readOnly" class="lx-toggle-label-wrapper lx-toggle-read-only">
      <span
        class="lx-toggle-text"
        v-if="!$slots.on && !$slots.off && !$slots.indeterminate && !$slots.default"
      >
        <p class="lx-data">{{ formatValueBool(modelValue, booleanTexts) }}</p>
      </span>
      <span class="lx-toggle-text" v-else>
        <span v-show="!$slots.on && !$slots.off && !$slots.indeterminate">
          <p class="lx-data"><slot />: {{ formatValueBool(modelValue, booleanTexts) }}</p>
        </span>
        <span v-show="model === null">
          <slot name="indeterminate" />
        </span>
        <span v-show="model === false">
          <slot name="off" />
        </span>
        <span v-show="model === true">
          <slot name="on" />
        </span>
      </span>
    </div>
    <div
      v-else
      class="lx-toggle-wrapper"
      :class="{ 'lx-small': size === 's' }"
      :data-disabled="disabled ? '' : null"
      :data-invalid="invalid ? '' : null"
      :title="tooltipValue"
    >
      <!-- it's labelled by the label below, or if that's absent, by aria-label -->
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label-->
      <input
        ref="input"
        v-model="model"
        type="checkbox"
        class="lx-toggle"
        :class="[{ 'lx-invalid': invalid }]"
        :id="id"
        :name="id"
        :checked="model"
        :disabled="disabled"
        role="switch"
        :aria-checked="model"
        :aria-invalid="invalid"
        :aria-label="!(size !== 's' && hasSlots) ? tooltipValue : null"
        :aria-labelledby="labelledBy"
      />
      <!-- it's fine, because key events are being caught by the input above, clicks aren't -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events-->
      <div class="lx-toggle-label-wrapper" @click.stop.prevent="toggleValue">
        <LxIcon v-if="model && size === 'm'" value="check" />
        <span class="lx-toggle-appearance" role="presentation" />

        <label class="lx-toggle-text" v-if="size !== 's' && hasSlots" :for="id">
          <span v-show="!$slots.on && !$slots.off && !$slots.indeterminate"> <slot /> </span>
          <span v-show="model === null">
            <slot name="indeterminate" />
          </span>
          <span v-show="model === false">
            <slot name="off" />
          </span>
          <span v-show="model === true">
            <slot name="on" />
          </span>
        </label>
      </div>
      <div v-show="invalid && !hasSlots" class="lx-invalidation-icon-wrapper">
        <LxIcon customClass="lx-invalidation-icon" value="invalid" />
      </div>
    </div>
    <div v-if="invalid && !readOnly" class="lx-invalidation-message">{{ invalidationMessage }}</div>
  </div>
</template>
