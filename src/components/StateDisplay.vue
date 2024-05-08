<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  value: { type: [Object, String] },
  dictionary: { type: Object },
});

const definition = computed(() =>
  props.dictionary?.find((o) => o.value?.toString() === props.value?.toString())
);
</script>
<template>
  <!--
    displayTypes: 
        draft, new, editing, edited, disabling, inactive, finishing, finished, deleting
        red, green, blue, black, purple, orange, yellow, 
        red-full, green-full, blue-full, black-full, purple-full, orange-full, yellow-full;
    displayShapes: circle, diamond;
  -->

  <div
    class="lx-state"
    :class="`lx-state-${definition?.displayType} ${
      definition?.displayShape ? `lx-state-shape-${definition?.displayShape}` : ''
    }`"
  >
    <div class="lx-state-icon">
      <div class="lx-state-indicator"></div>
    </div>
    <p class="lx-primary">{{ definition?.displayName }}</p>
  </div>
</template>
