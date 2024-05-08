<script setup>
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  columnSpan: {
    type: [Number, String],
    default: 1,
  },
  rowSpan: {
    type: [Number, String],
    default: 1,
  },
});
</script>

<template>
  <div
    class="lx-placeholder"
    :id="id"
    :class="[
      { 'lx-row-column-2': Number(props.columnSpan) === 2 },
      { 'lx-row-column-3': Number(props.columnSpan) === 3 },
      { 'lx-row-column-4': Number(props.columnSpan) === 4 },
      { 'lx-row-column-8': Number(props.columnSpan) === 8 },
      { 'lx-row-row-2': Number(props.rowSpan) === 2 },
      { 'lx-row-row-3': Number(props.rowSpan) === 3 },
      { 'lx-row-row-4': Number(props.rowSpan) === 4 },
      { 'lx-row-row-8': Number(props.rowSpan) === 8 },
    ]"
  ></div>
</template>
