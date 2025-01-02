<script setup lang="ts">
import { computed, ref, watch, onMounted, useSlots, inject } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';
import { formatValueBool } from '@/utils/formatUtils';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: Boolean, default: null },
  size: { type: String, default: 'm' }, // 's' (small) or 'm' (medium)
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  tooltip: { type: String, default: null },
  labelId: { type: String, default: null },
  texts: {
    type: Object,
    default: () => ({
      valueYes: 'Jā',
      valueNo: 'Nē',
    }),
  },
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

const idValue = ref('');
const input = ref({});

function checkModelState() {
  if (model.value === null) {
    input.value.indeterminate = true;
    input.value.checked = false;
  } else {
    input.value.indeterminate = false;
    input.value.checked = model.value;
  }
}

const booleanTexts = computed(() => ({
  yes: props.texts.valueYes,
  no: props.texts.valueNo,
}));

const tooltipValue = computed(() => {
  let res = '';

  if (!props.tooltip && (!slots.on || !slots.off))
    res = formatValueBool(model.value, booleanTexts.value);
  else if (props.tooltip && (!slots.on || !slots.off))
    res = `${props.tooltip}: ${formatValueBool(model.value, booleanTexts.value)}`;
  else if (props.tooltip) {
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

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }

  checkModelState();
});
</script>

<template>
  <div class="lx-field-wrapper">
    <div
      class="lx-toggle-wrapper"
      :class="{ 'lx-small': size === 's' }"
      :data-disabled="disabled ? '' : null"
      :data-invalid="invalid ? '' : null"
      :title="tooltipValue"
    >
      <lx-icon v-show="invalid && !hasSlots" customClass="lx-invalidation-icon" value="invalid" />
      <!-- it's labelled by the label below, or if that's absent, by aria-label -->
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label-->
      <input
        ref="input"
        type="checkbox"
        class="lx-toggle"
        :class="[{ 'lx-invalid': invalid }]"
        :id="idValue"
        :name="idValue"
        v-model="model"
        :checked="model"
        :aria-checked="model"
        :aria-invalid="invalid"
        :aria-label="!(size !== 's' && hasSlots) ? tooltipValue : null"
        role="switch"
        :disabled="disabled"
        :aria-labelledby="labelledBy"
      />
      <div class="lx-toggle-label-wrapper" :class="{ 'lx-toggle-read-only': readOnly }">
        <template v-if="!readOnly">
          <!-- it's fine, because key events are being caught by the input above, clicks aren't -->
          <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events-->
          <span class="lx-toggle-appearance" @click="toggleValue" role="presentation" />
          <label class="lx-toggle-text" v-if="size !== 's' && hasSlots" :for="idValue">
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
        </template>
        <template v-else>
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
        </template>
      </div>
    </div>
    <div class="lx-invalidation-message">{{ invalidationMessage }}</div>
  </div>
</template>
