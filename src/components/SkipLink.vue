<script setup lang="ts">
import { generateUUID } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';

const emits = defineEmits(['click']);

function click() {
  emits('click');
}

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  label: { type: String, default: '' },
  title: { type: String, default: '' },
  tabindex: { type: Number, default: 1 },
});
</script>
<template>
  <div class="lx-skip-link-wrapper">
    <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
    <LxButton
      :id="props.id"
      :label="props.label"
      :title="props.title"
      :tabindex="props.tabindex"
      @click="click"
    />
  </div>
</template>
