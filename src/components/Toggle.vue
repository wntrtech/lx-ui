<script setup lang="ts">
import { computed, ref, watch, onMounted, useSlots } from 'vue';
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

const tooltipValue = computed(() => {
  let res = '';
  if (!props.tooltip && (!slots.on || !slots.off)) res = formatValueBool(model.value);
  else if (props.tooltip && (!slots.on || !slots.off))
    res = `${props.tooltip}: ${formatValueBool(model.value)}`;
  else if (props.tooltip) {
    res = props.tooltip;
  }
  return res;
});

watch(model, () => {
  checkModelState();
});

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
      <lx-icon v-show="invalid" customClass="lx-invalidation-icon" value="invalid" />
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
        role="switch"
        :disabled="disabled"
      />
      <label :for="idValue" class="lx-toggle-label-wrapper">
        <template v-if="!readOnly">
          <span class="lx-toggle-appearance"></span>
          <span class="lx-toggle-text" v-if="size !== 's'">
            <span v-show="!$slots.on && !$slots.off && !$slots.indeterminate"> <slot></slot> </span>
            <span v-show="model === null">
              <slot name="indeterminate"></slot>
            </span>
            <span v-show="model === false">
              <slot name="off"></slot>
            </span>
            <span v-show="model === true">
              <slot name="on"></slot>
            </span>
          </span>
        </template>
        <template v-else>
          <span
            class="lx-toggle-text"
            v-if="!$slots.on && !$slots.off && !$slots.indeterminate && !$slots.default"
            ><p class="lx-data">{{ formatValueBool(modelValue) }}</p></span
          >
          <span class="lx-toggle-text" v-else>
            <span v-show="!$slots.on && !$slots.off && !$slots.indeterminate">
              <p class="lx-data"><slot></slot>: {{ formatValueBool(modelValue) }}</p>
            </span>
            <span v-show="model === null">
              <slot name="indeterminate"></slot>
            </span>
            <span v-show="model === false">
              <slot name="off"></slot>
            </span>
            <span v-show="model === true">
              <slot name="on"></slot>
            </span>
          </span>
        </template>
      </label>
    </div>
    <div class="lx-invalidation-message">{{ invalidationMessage }}</div>
  </div>
</template>
