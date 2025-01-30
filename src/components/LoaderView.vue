<script setup lang="ts">
import { computed, watch } from 'vue';
import LxLoader from '@/components/Loader.vue';

import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  loading: { type: Boolean, default: false },
  size: { type: String, default: 'l' }, // 's' (small) or 'l' (large)
  variant: { type: String, default: 'default' }, // 'default' or 'bar'
  modelValue: { type: [Number, String], default: 0 },
  kind: { type: String, default: 'indeterminate' }, // 'indeterminate' or 'progress'
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  fakedDuration: { type: Number, default: 2000 },
  faked: { type: Boolean, default: false },
  state: { type: String, default: 'default' },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

watch(
  () => model.value,
  (newVal) => {
    if (Number(newVal) > 1) {
      model.value = 1;
    }
    if (Number(newVal) < 0) {
      model.value = 0;
    }
  }
);
</script>

<template>
  <div class="lx-loader-view-wrapper" :id="props.id">
    <div
      class="lx-loader-view-loader-wrapper"
      role="alert"
      aria-live="assertive"
      :aria-label="props.label"
    >
      <LxLoader
        v-if="props.loading"
        :modelValue="model"
        :loading="props.loading"
        :size="props.size"
        :variant="props.variant"
        :kind="props.kind"
        :label="props.label"
        :description="props.description"
        :faked-duration="props.fakedDuration"
        :faked="props.faked"
        :state="props.state"
        :aria-hidden="true"
      ></LxLoader>
    </div>
    <div v-show="!props.loading" class="lx-loader-view-content-wrapper" aria-live="polite">
      <slot />
    </div>
  </div>
</template>
