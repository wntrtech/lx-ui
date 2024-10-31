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
const shadowTextarea = ref(null);

function triggerResize() {
  if (!textarea.value || !shadowTextarea.value) return;

  shadowTextarea.value.value = model.value || '';
  const newHeight = `${shadowTextarea.value.scrollHeight}px`;
  textarea.value.style.height = newHeight;
}

watch(
  model,
  () => {
    if (props.dynamicHeight) {
      nextTick(triggerResize);
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
    <p v-if="props.readOnly" class="lx-data">{{ model }} <span v-if="!model">—</span></p>
    <template v-else>
      <div class="lx-text-area-wrapper" :data-invalid="invalid ? '' : null">
        <div
          class="lx-input-wrapper"
          :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
        >
          <div class="pseudo-input" />
          <label class="lx-visually-hidden" :for="props.id"></label>
          <textarea
            v-model="model"
            ref="textarea"
            :class="[
              'lx-text-area',
              'lx-input-area',
              { 'lx-text-area-dynamic': props.dynamicHeight },
            ]"
            :id="props.id"
            :placeholder="props.placeholder"
            :rows="props.rows"
            :disabled="props.disabled"
            :maxlength="props.maxlength"
            :title="props.tooltip"
            @input="triggerResize"
          ></textarea>

          <!-- Hidden template textarea for height calculation -->
          <label class="lx-visually-hidden" :for="props.id"></label>
          <textarea
            v-if="props.dynamicHeight"
            ref="shadowTextarea"
            class="lx-text-area lx-text-area-template lx-input-area"
            :id="props.id"
            readonly
            :tabindex="-1"
          ></textarea>

          <div v-if="invalid" class="lx-invalidation-icon-wrapper">
            <LxIcon customClass="lx-invalidation-icon" value="invalid" />
          </div>
        </div>
        <div v-if="props.maxlength" class="lx-text-length">
          {{ model?.toString()?.length || 0 }}/{{ props.maxlength }}
        </div>
        <div v-if="invalid && !readOnly" class="lx-invalidation-message">
          {{ props.invalidationMessage }}
        </div>
      </div>
    </template>
  </div>
</template>
