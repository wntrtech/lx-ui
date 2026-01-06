<script setup lang="ts">
import { computed } from 'vue';
import useLx from '@/hooks/useLx';
import LxIcon from '@/components/Icon.vue';
import { lxDevUtils } from '@/utils';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  icon: { type: String, default: null },
  iconSet: { type: String, default: () => useLx().getGlobals()?.iconSet },
  value: { type: String, default: null },
  tooltip: {
    type: String,
    default: null,
    validator: (v, p) => {
      // If icon or value is non-empty, tooltip must be non-empty
      if ((p.icon || p.value) && !v) {
        lxDevUtils.logWarn(
          `Warning: LxBadge "tooltip" is required when "icon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },
  type: { type: String, default: 'auto' }, // auto, number, text
});

const isValueNumber = computed(() => {
  if (props.type === 'auto') return !Number.isNaN(Number(String(props.value)?.trim()));
  return props.type === 'number';
});
</script>
<template>
  <div
    v-if="icon || value"
    class="lx-badge"
    :class="{ 'with-gap': icon && value }"
    :title="tooltip"
    :id="id"
    :aria-label="tooltip"
  >
    <LxIcon
      v-if="icon"
      class="lx-badge-icon"
      :value="icon"
      :iconSet="iconSet"
      :title="tooltip"
      :aria-hidden="true"
    />
    <div
      v-if="tooltip && (icon || value)"
      :id="`${id}-tooltip`"
      class="lx-invisible"
      aria-hidden="false"
    >
      ({{ tooltip }}):
    </div>
    <div
      v-if="value"
      class="lx-data lx-badge-text"
      :class="{ 'lx-badge-type-number': isValueNumber }"
    >
      {{ value }}
    </div>
  </div>
</template>
