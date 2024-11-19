<script setup>
const props = defineProps({
  class: { type: String, default: null },
});
</script>

<template>
  <div class="lx-group" :class="props.class" role="group">
    <slot />
  </div>
</template>
