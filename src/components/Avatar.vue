<script setup>
import { computed } from 'vue';
import { generateUUID, generateIntegerInRange } from '@/utils/stringUtils';
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
    const index = generateIntegerInRange(props.value, BACKGROUND_COLORS.length, 1);
    return `#${BACKGROUND_COLORS[index]}`;
  }
  return 'transparent';
});
const shapeColor = computed(() => {
  if (props.value) {
    const index = generateIntegerInRange(props.value, SHAPE_COLORS.length, 2);
    return `#${SHAPE_COLORS[index]}`;
  }
  return 'transparent';
});
const shape = computed(() => {
  if (props.value) {
    const index = generateIntegerInRange(props.value, 59, 3);
    return SHAPES.icons[index + 1];
  }
  return '';
});
</script>
<template>
  <div
    class="lx-avatar-display"
    :aria-hidden="true"
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
