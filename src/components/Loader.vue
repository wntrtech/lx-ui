<script setup lang="ts">
import { computed, watch } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';

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
  ariaHidden: { type: Boolean, default: false },
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

const radius = computed(() => (props.size === 's' ? 42 : 45));
const strokeDashArray = computed(() => 2 * Math.PI * radius.value);
const defaultLoaderValue = computed(
  () => 2 * Math.PI * radius.value * ((100 - Number(model.value) * 100) / 100)
);

const strokeWidth = computed(() => (props.size === 's' ? 15 : 10));

const loaderAriaHidden = computed(() => {
  if (props.ariaHidden) {
    return true;
  }
  return !props.label;
});
</script>

<template>
  <div class="lx-loader-wrapper" :id="id" :aria-hidden="loaderAriaHidden" :aria-label="props.label">
    <div
      class="lx-loader-indeterminate"
      :class="[{ 'lx-small': size === 's' }, { bar: variant === 'bar' }]"
      v-if="loading && kind === 'indeterminate'"
      :title="props.description"
    >
      <div
        v-if="variant === 'default' && state === 'default'"
        class="lx-loader"
        :class="[{ 'lx-small': size === 's' }, { 'lx-large': size === 'l' }]"
      >
        <svg viewBox="0 0 100 100">
          <circle
            v-if="size === 's'"
            class="lx-loader-background"
            cx="50%"
            cy="50%"
            r="44"
          ></circle>
          <circle class="lx-loader-stroke" cx="50%" cy="50%" r="44"></circle>
        </svg>
      </div>
      <div v-if="variant === 'default' && state !== 'default'" class="lx-loader-state">
        <LxIcon v-if="state === 'error'" customClass="lx-invalidation-icon" value="invalid" />
        <LxIcon
          v-if="state === 'success'"
          customClass="lx-success-icon"
          value="notification-success"
        />
      </div>
      <div
        class="lx-loader-data"
        v-if="variant === 'default' && (props.label || (props.description && size !== 's'))"
      >
        <p class="lx-primary">{{ props.label }}</p>
        <p class="lx-secondary" v-if="size !== 's'">{{ props.description }}</p>
      </div>
      <div class="lx-loader-bar-header" v-if="variant === 'bar'">
        <p class="lx-primary">{{ props.label }}</p>
        <div class="lx-loader-state-bar">
          <LxIcon v-if="state === 'error'" customClass="lx-invalidation-icon" value="invalid" />
          <LxIcon
            v-if="state === 'success'"
            customClass="lx-success-icon"
            value="notification-success"
          />
        </div>
      </div>

      <div
        v-if="variant === 'bar'"
        class="lx-loader-bar-track"
        :class="[{ 'lx-small': size === 's' }, { 'lx-large': size === 'l' }]"
      >
        <div class="lx-loader-bar-indeterminate"></div>
      </div>
      <p class="lx-secondary" v-if="variant === 'bar'">{{ props.description }}</p>
    </div>
    <div
      v-if="kind === 'progress'"
      class="lx-loader-progress"
      role="progressbar"
      :aria-valuenow="model"
      :aria-valuemin="0"
      :aria-valuemax="1"
      :class="[{ 'state-error': state === 'error' }, { 'state-success': state === 'success' }]"
    >
      <div class="lx-loader-bar-header" v-if="variant === 'bar'">
        <p class="lx-primary">{{ props.label }}</p>
        <div class="lx-loader-state-bar">
          <LxIcon v-if="state === 'error'" customClass="lx-invalidation-icon" value="invalid" />
          <LxIcon
            v-if="state === 'success'"
            customClass="lx-success-icon"
            value="notification-success"
          />
        </div>
      </div>
      <div
        v-if="variant === 'bar'"
        class="lx-loader-bar-track"
        :class="[{ 'lx-small': size === 's' }, { 'lx-large': size === 'l' }]"
      >
        <div
          class="lx-loader-bar-progress"
          :style="[
            { width: Number(model) * 100 + '%' },
            props.faked
              ? { transition: `width ${props.fakedDuration}ms cubic-bezier(0.22,0.05,0,0.87)` }
              : {},
          ]"
        ></div>
      </div>
      <p class="lx-secondary" v-if="variant === 'bar'">{{ props.description }}</p>
      <div
        v-if="variant === 'default'"
        class="lx-loader-default-progress"
        :class="[{ 'lx-small': size === 's' }, { 'lx-large': size === 'l' }]"
      >
        <svg viewBox="0 0 100 100" v-if="state === 'default'">
          <circle
            class="lx-loader-default-progress-default-track"
            :r="radius"
            cx="50%"
            cy="50%"
            :stroke-width="strokeWidth"
            :stroke-dasharray="strokeDashArray"
            stroke-dashoffset="0"
          ></circle>
          <circle
            class="lx-loader-default-progress-default-fill"
            :style="[
              props.faked
                ? {
                    transition: `stroke-dashoffset ${props.fakedDuration}ms cubic-bezier(0.22,0.05,0,0.87)`,
                  }
                : {},
            ]"
            :r="radius"
            cx="50%"
            cy="50%"
            :stroke-width="strokeWidth"
            :stroke-dashoffset="defaultLoaderValue"
            :stroke-dasharray="strokeDashArray"
          ></circle>
        </svg>
        <div class="lx-loader-state" v-else>
          <LxIcon v-if="state === 'error'" customClass="lx-invalidation-icon" value="invalid" />
          <LxIcon
            v-if="state === 'success'"
            customClass="lx-success-icon"
            value="notification-success"
          />
        </div>
        <div class="lx-loader-data">
          <p class="lx-primary">{{ props.label }}</p>
          <p class="lx-secondary" v-if="size !== 's'">{{ props.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
