<script setup lang="ts">
import { computed, ref } from 'vue';
import Popper from 'vue3-popper';
import { useWindowSize } from '@vueuse/core';

import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  placement: { type: String, default: 'bottom' },
  offsetSkid: { type: String, default: null },
  offsetDistance: { type: String, default: '12' },
  hover: { type: Boolean, default: true },
  arrow: { type: Boolean, default: true },
  arrowPadding: { type: String, default: '10' },
  disabled: { type: Boolean, default: false },
  openDelay: { type: String, default: '0' },
  closeDelay: { type: String, default: '0' },
  interactive: { type: Boolean, default: true },
  content: { default: null },
  locked: { type: Boolean, default: false },
});

const width = ref(useWindowSize().width);
const showPopper = ref(false);
const container = ref();
const posX = ref(0);
const baseOffset = ref('0');

function determineSide() {
  if (posX.value < width.value / 2) {
    // .lx-nav-panel width: var(--row-size); + .popper width / 2 = approximately 160px
    if (posX.value < 160) {
      baseOffset.value = '50';
      return;
    }
    baseOffset.value = '0';
    return;
  }
  if (width.value - posX.value < 75) {
    baseOffset.value = '-50';
    return;
  }
  baseOffset.value = '0';
}

function calculateOffset() {
  if (!container.value) return;
  posX.value =
    container.value.getBoundingClientRect().x + container.value.getBoundingClientRect().width / 2;
  determineSide();
}

const selectOffset = computed(() => {
  if (!props.offsetSkid) {
    return baseOffset.value;
  }
  return props.offsetSkid;
});

const handleMouseLeave = () => {
  showPopper.value = false;
};

const handleMouseEnter = () => {
  calculateOffset();
  showPopper.value = true;
};

const closePopper = () => {
  showPopper.value = false;
};
</script>
<template>
  <div class="lx-info-wrapper" ref="container">
    <Popper
      :placement="props.placement"
      :offset-skid="selectOffset"
      :offset-distance="props.offsetDistance"
      :hover="props.hover"
      :arrow="props.arrow"
      :arrow-padding="props.arrowPadding"
      :disabled="props.disabled"
      :open-delay="props.openDelay"
      :close-delay="props.closeDelay"
      :interactive="props.interactive"
      :content="props.content"
      :show="showPopper"
      :locked="props.locked"
    >
      <div
        class="lx-info-wrapper-content"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @focusin="handleMouseEnter"
        @focusout="handleMouseLeave"
        :tabindex="$slots.panel ? '0' : '-1'"
        :aria-describedby="`${id}-description`"
        @keydown.esc.prevent="closePopper"
      >
        <slot />
      </div>
      <template #content v-if="$slots.panel">
        <div class="lx-info-wrapper-panel" role="tooltip" :id="`${id}-description`">
          <slot name="panel" />
        </div>
      </template>
    </Popper>
  </div>
</template>
