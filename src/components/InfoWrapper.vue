<script setup lang="ts">
import { nextTick, ref, computed } from 'vue';
import Popper from 'vue3-popper';
import { useWindowSize } from '@vueuse/core';

const props = defineProps({
  id: { type: String, default: null },
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

const contentLeave = ref(null);
const container = ref();
const elementToMonitor = ref();
function popperClose() {
  contentLeave.value = false;
  nextTick(() => {
    contentLeave.value = null;
  });
}
const handleMouseLeave = () => {
  popperClose();
};

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
  posX.value =
    container.value.getBoundingClientRect().x + container.value.getBoundingClientRect().width / 2;
  determineSide();
}
const handleMouseEnter = () => {
  if (elementToMonitor.value) {
    elementToMonitor.value?.addEventListener('mouseleave', handleMouseLeave);
  }
  calculateOffset();
};

const selectOffset = computed(() => {
  if (!props.offsetSkid) {
    return baseOffset.value;
  }
  return props.offsetSkid;
});
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
      :show="contentLeave"
      :locked="props.locked"
    >
      <div class="lx-info-wrapper-content" ref="elementToMonitor" @mouseenter="handleMouseEnter">
        <slot />
      </div>
      <template #content>
        <div class="lx-info-wrapper-panel">
          <slot name="panel" />
        </div>
      </template>
    </Popper>
  </div>
</template>
