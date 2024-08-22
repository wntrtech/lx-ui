<script setup>
import { computed } from 'vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  value: { type: [Object, String], default: null },
  dictionary: { type: Array, default: () => [{}] },
});

const definition = computed(() =>
  props.dictionary?.find((o) => o.value?.toString() === props.value?.toString())
);

function getStatusIcon(displayType) {
  let iconName = displayType;

  switch (displayType) {
    case 'finishing':
      iconName = 'finished';
      break;
    case 'editing':
      iconName = 'edited';
      break;
    case 'deleting':
      iconName = 'deleted';
      break;
    case 'disabling':
      iconName = 'disabled';
      break;
    default:
      break;
  }
  const availableIcons = [
    'draft',
    'new',
    'edited',
    'disabled',
    'inactive',
    'finished',
    'deleted',
    'ongoing',
    'incomplete',
    'waiting',
    'signed',
    'error',
    'default',
  ];
  return availableIcons.includes(iconName) ? `status-${iconName}` : 'status-default';
}
</script>
<template>
  <!--
    displayTypes: 
        draft, new, editing, edited, disabling, disabled, inactive, finishing, finished, deleting, deleted, ongoing, incomplete, waiting, signed, error, default
        red, green, blue, black, purple, orange, yellow, 
        red-full, green-full, blue-full, black-full, purple-full, orange-full, yellow-full;
    displayShapes: circle, diamond, icon;
  -->

  <div
    class="lx-state"
    :class="[
      `lx-state-${definition?.displayType} ${
        definition?.displayShape ? `lx-state-shape-${definition?.displayShape}` : ''
      }`,
      { 'lx-tooltip-state': definition?.title },
    ]"
    :title="definition?.title"
  >
    <div v-if="definition?.displayShape !== 'icon'" class="lx-state-icon">
      <div class="lx-state-indicator"></div>
    </div>
    <LxIcon
      v-else
      class="lx-state-icon"
      :value="getStatusIcon(definition?.displayType)"
      :title="definition?.title"
    />
    <p class="lx-primary">{{ definition?.displayName }}</p>
  </div>
</template>
