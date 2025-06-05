<script setup lang="ts">
import { shallowRef, computed, watch, defineAsyncComponent } from 'vue';
import IconDefault from '@/components/icons/Default.vue';
import useLx from '@/hooks/useLx';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  value: { type: String, default: 'default' },
  iconSet: { type: String, default: () => useLx().getGlobals()?.iconSet },
  variant: { type: String, default: 'default' }, // 'default', 'gradient-brand', 'gradient-brand-vertical'
  customClass: { type: String, default: '' },
  animation: { type: String, default: 'default' }, // 'default', 'spin'
  meaningful: { type: Boolean, default: false }, // If true, icon will be announced by screen reader
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const defaultTexts = {
  iconLabel: 'Piktogramma',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, defaultTexts));

const iconPath = shallowRef(null);

const iconSetComputed = computed(() => (props.iconSet ? props.iconSet : 'cds'));

const icon = computed(() => {
  // Separate icon name by '-' if any

  if (typeof props.value === 'object') {
    return null;
  }
  const parts = props.value?.split('-');

  let ret = '';
  parts?.forEach((part) => {
    // Make first letter of each part uppercase and concat them to match icon file name
    ret += `${part?.charAt(0).toUpperCase()}${part?.slice(1)}`;
  });

  return ret;
});

function loadIcon() {
  if (icon.value && iconSetComputed.value) {
    iconPath.value = defineAsyncComponent({
      loader: () =>
        import(
          `@/components/icons/${iconSetComputed.value ? iconSetComputed.value : 'cds'}/${
            icon.value
          }.vue`
        ),
      errorComponent: IconDefault,
    });
  }
}

watch(
  [icon, iconSetComputed],
  () => {
    loadIcon();
  },
  { immediate: true }
);
const viewBoxType = computed(() => {
  if (iconSetComputed.value === 'cds' || iconSetComputed.value === 'brand') {
    return '0 0 32 32';
  }
  if (iconSetComputed.value === 'phosphor') {
    return '0 0 256 256';
  }
  return '0 96 960 960';
});

const gradientComputed = computed(() => {
  if (props.variant === 'gradient-brand') {
    return 'fill: url(#gradient)';
  }
  if (props.variant === 'gradient-brand-vertical') {
    return 'fill: url(#gradient-vertical)';
  }
  return null;
});
</script>

<template>
  <svg
    :class="customClass"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="viewBoxType"
    :style="gradientComputed"
    :aria-hidden="value === 'none' ? true : !meaningful"
    focusable="false"
  >
    <title>{{ props.title }}</title>
    <desc>{{ props.desc ? props.desc : `${displayTexts.iconLabel} "${icon}"` }}</desc>
    <defs v-if="variant !== 'default'">
      <linearGradient id="gradient">
        <stop offset="0%" stop-color="var(--color-brand)" />
        <stop offset="50%" stop-color="var(--color-brand-secondary)" />
      </linearGradient>
      <linearGradient id="gradient-vertical" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="var(--color-brand)" />
        <stop offset="100%" stop-color="var(--color-brand-secondary)" />
      </linearGradient>
    </defs>
    <Transition :name="`icon-${animation}`">
      <icon-path />
    </Transition>
  </svg>
</template>
