<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: String, default: null },
  placeholder: { type: String, default: null },
  rows: { type: Number, default: 3 },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  maxlength: { type: Number, default: null },
  dynamicHeight: { type: Boolean, default: false },
  tooltip: { type: String, default: null },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue?.toString();
  },
  set(value) {
    emits('update:modelValue', value?.toString());
  },
});

const textarea = ref(null);

const isInvalid = computed(() => {
  let ret = false;
  if (props.invalid) {
    ret = true;
  }
  return ret;
});

function resize() {
  textarea.value.style.height = '1rem';
  textarea.value.style.height = `${textarea.value.scrollHeight}px`;
}

watch(
  model,
  () => {
    if (props.dynamicHeight) {
      nextTick(() => {
        resize();
      });
    }
  },
  { immediate: true }
);
function focus() {
  if (textarea.value !== null && textarea.value !== undefined) textarea.value.focus();
}
defineExpose({ focus });
</script>

<template>
  <div class="lx-field-wrapper">
    <p v-if="readOnly" class="lx-data">{{ model }} <span v-if="!model">—</span></p>
    <template v-else>
      <div class="lx-text-area-wrapper" :data-invalid="isInvalid ? '' : null">
        <lx-icon v-show="isInvalid" customClass="lx-invalidation-icon" value="invalid" />
        <textarea
          v-model="model"
          ref="textarea"
          class="lx-text-area"
          :class="[{ 'lx-invalid': isInvalid }, { 'lx-text-area-dynamic': dynamicHeight }]"
          :id="id"
          :placeholder="placeholder"
          :rows="rows"
          :disabled="disabled"
          :maxlength="maxlength"
          :title="tooltip"
        ></textarea>
        <div v-if="maxlength" class="lx-text-length">
          {{ model?.toString()?.length || 0 }}/{{ maxlength }}
        </div>
      </div>
      <div class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </template>
  </div>
</template>
