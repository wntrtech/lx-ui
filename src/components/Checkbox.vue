<script setup>
import { ref, computed, onMounted } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  id: { type: String, default: null },
  groupId: { type: String, default: null },
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  value: { type: String, default: 'none' },
  tabindex: { type: String, default: '0' },
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

const idValue = ref('');

onMounted(() => {
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }
});

const click = (e) => {
  emits('click', e);
};
</script>

<template>
  <div class="lx-checkbox-wrapper">
    <input
      type="checkbox"
      class="lx-checkbox"
      :id="idValue"
      :name="groupId"
      v-model="model"
      :checked="model"
      :aria-checked="model"
      :disabled="disabled"
      :value="value"
      :tabindex="tabindex"
      @click="click"
    />
    <label :for="idValue" class="lx-checkbox-label-wrapper">
      <span class="lx-checkbox-appearance">
        <span class="lx-checkbox-thumb">
          <LxIcon value="check" />
        </span>
      </span>
      <span class="lx-checkbox-label" v-if="label">{{ label }}</span>
      <template v-else><slot /></template>
    </label>
  </div>
</template>
