<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: null },
  groupId: { type: String, default: null },
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  value: { type: String, default: 'none' },
  tabindex: { type: Number, default: null },
});

const emits = defineEmits(['update:modelValue', 'click']);

const model = computed({
  get() {
    return !!props.modelValue;
  },
  set(value) {
    emits('update:modelValue', !!value);
  },
});

const click = (e) => {
  emits('click', e);
};

const idValue = ref('');

onMounted(() => {
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }
});
</script>

<template>
  <div class="lx-radio-button-wrapper">
    <input
      type="radio"
      class="lx-radio-button"
      :id="idValue"
      :name="groupId"
      v-model="model"
      :checked="model"
      :aria-label="label"
      :aria-checked="model"
      :disabled="disabled"
      :value="value"
      :tabindex="tabindex"
      @click="click"
    />
    <label :for="idValue" class="lx-radio-button-label-wrapper">
      <span class="lx-radio-button-appearance">
        <span class="lx-radio-thumb" />
      </span>
      <span class="lx-radio-button-label" v-if="label">{{ label }}</span>
      <template v-else><slot /></template>
    </label>
  </div>
</template>
