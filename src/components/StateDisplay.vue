<script setup>
import { computed } from 'vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  value: { type: [Object, String], default: null },
  dictionary: { type: Array, default: () => [{}] },
});

const outlineTypes = [
  'draft',
  'editing',
  'finishing',
  'disabling',
  'deleting',
  'red',
  'green',
  'blue',
  'black',
  'purple',
  'orange',
  'yellow',
];

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

function getCustomStatusIcon(options, displayType) {
  const numDictionary = {
    0: 'zero',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
  };
  const numIcon = numDictionary[options?.num];

  if (numIcon) {
    return outlineTypes.includes(displayType)
      ? `status-${numIcon}-outline`
      : `status-${numIcon}-filled`;
  }
  return 'status-default';
}
</script>
<template>
  <!--
    displayTypes: 
        draft, new, editing, edited, disabling, disabled, inactive, finishing, finished, deleting, deleted, ongoing, incomplete, waiting, signed, error, default
        red, green, blue, black, purple, orange, yellow, 
        red-full, green-full, blue-full, black-full, purple-full, orange-full, yellow-full;
    displayShapes: circle, diamond, icon, custom;
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
    <div
      v-if="definition?.displayShape !== 'icon' && definition?.displayShape !== 'custom'"
      class="lx-state-icon"
    >
      <div class="lx-state-indicator"></div>
    </div>
    <LxIcon
      v-else
      class="lx-state-icon"
      :value="
        definition?.displayShape === 'icon'
          ? getStatusIcon(definition?.displayType)
          : getCustomStatusIcon(definition?.options, definition?.displayType)
      "
      :title="definition?.title"
      :iconSet="definition?.iconSet"
    />
    <p class="lx-primary">{{ definition?.displayName }}</p>
  </div>
</template>
