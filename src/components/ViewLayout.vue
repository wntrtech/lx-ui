<script setup>
import LxButton from '@/components/Button.vue';

defineProps({
  kind: { type: String, default: 'default' }, // default | form | list
  layout: { type: String, default: 'default' }, // default
  actionDefinitions: { type: Array, default: () => [] },
  customClass: { type: String, default: '' },
});

const emits = defineEmits(['actionClick']);
</script>
<template>
  <div class="lx-view-layout" :class="[{ customClass }]">
    <div class="header-container" v-if="actionDefinitions?.length > 0">
      <LxButton
        v-for="action in actionDefinitions"
        :key="action?.id"
        :icon="action?.icon"
        :iconSet="action?.iconSet"
        :label="action?.name || action?.label"
        :title="action?.title"
        :variant="action?.variant || 'icon-only'"
        :kind="action?.kind || 'ghost'"
        :disabled="action?.disabled"
        :loading="action?.loading"
        :busy="action?.busy"
        :href="action?.href"
        @click="emits('actionClick', action?.id)"
      />
    </div>
    <div v-if="kind !== 'form' && $slots?.filters" class="filters-container">
      <slot name="filters" />
    </div>
    <div v-if="$slots?.default" class="default-container"><slot /></div>
    <div v-if="$slots?.aside" class="aside-container"><slot name="aside" /></div>
    <div v-if="$slots?.footer" class="footer-container"><slot name="footer" /></div>
  </div>
</template>
