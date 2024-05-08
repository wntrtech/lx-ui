<script setup>
import { defineProps, computed } from 'vue';
import { generateUUID, generateIntegerHash } from '@/utils/stringUtils';
import { BACKGROUND_COLORS, SHAPE_COLORS, SHAPES } from '@/utils/decorationUtils';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  value: {
    type: String,
    default: 'lx',
  },
  size: {
    type: String,
    default: 'm' /* 's', 'm', 'l', 'xl' */,
  },
});

const background = computed(() => {
  if (props.value) {
    const hash = generateIntegerHash(props.value, 1);
    const index = Math.abs(hash % BACKGROUND_COLORS.length);
    return `#${BACKGROUND_COLORS[index]}`;
  }
  return 'transparent';
});
const shapeColor = computed(() => {
  if (props.value) {
    const hash = generateIntegerHash(props.value, 2);
    const index = Math.abs(hash % SHAPE_COLORS.length);
    return `#${SHAPE_COLORS[index]}`;
  }
  return 'transparent';
});
const shape = computed(() => {
  if (props.value) {
    const hash = generateIntegerHash(props.value, 3);
    const index = Math.abs(hash % 59);
    return SHAPES.icons[index + 1];
  }
  return '';
});
</script>
<template>
  <div
    class="lx-avatar-display"
    :class="[
      { 'lx-avatar-display-s': size === 's' },
      { 'lx-avatar-display-l': size === 'l' },
      { 'lx-avatar-display-xl': size === 'xl' },
    ]"
    :style="`background-color: ${background};`"
  >
    <svg viewBox="0 0 32 32" :style="`fill: ${shapeColor};`" v-html="shape"></svg>
  </div>
</template>
