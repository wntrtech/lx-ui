<script setup>
defineProps({
  kind: { type: String, default: 'default' }, // default | form | list
  layout: { type: String, default: 'default' }, // default
});
</script>
<template>
  <div class="lx-view-layout">
    <div v-if="kind !== 'form' && $slots?.filters" class="filters-container">
      <slot name="filters" />
    </div>
    <div v-if="$slots?.default" class="default-container"><slot /></div>
    <div v-if="$slots?.aside" class="aside-container"><slot name="aside" /></div>
  </div>
</template>
