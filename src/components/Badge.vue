<script setup lang="ts">
import useLx from '@/hooks/useLx';
import LxIcon from '@/components/Icon.vue';

defineProps({
  icon: { type: String, default: null },
  iconSet: { type: String, default: () => useLx().getGlobals()?.iconSet },
  value: { type: String, default: null },
  tooltip: { type: String, required: true },
});
</script>
<template>
  <div
    v-if="icon || value"
    class="lx-badge-wrapper"
    :class="{ 'with-gap': icon && value }"
    :title="tooltip"
    :aria-label="value ? null : tooltip"
  >
    <LxIcon v-if="icon" class="lx-badge-icon" :value="icon" :iconSet="iconSet" :title="tooltip" />
    <p class="lx-data lx-badge-text">{{ value }}</p>
  </div>
</template>
