<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxPopper from '@/components/Popper.vue';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  placement: { type: String, default: 'bottom' },
  offsetSkid: { type: String, default: '0' },
  offsetDistance: { type: String, default: '12' },
  hover: { type: Boolean, default: true },
  arrow: { type: Boolean, default: true },
  arrowPadding: { type: String, default: '0' },
  disabled: { type: Boolean, default: false },
  openDelay: { type: String, default: '0' },
  closeDelay: { type: String, default: '0' },
  interactive: { type: Boolean, default: false },
  content: { default: null },
  locked: { type: Boolean, default: false },
  focusable: { type: Boolean, default: true },
});

const showPopper = ref(false);
const triggerWrapper = ref(null);

let openTimeout = null;
let closeTimeout = null;

const parseDelay = (v) => Number(v) || 0;

const handleMouseEnter = () => {
  if (!props.hover || props.disabled) return;

  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  const delay = parseDelay(props.openDelay);
  openTimeout = setTimeout(() => {
    showPopper.value = true;
  }, delay);
};

const handleMouseLeave = () => {
  if (props.interactive) return;

  if (openTimeout) {
    clearTimeout(openTimeout);
    openTimeout = null;
  }

  const delay = parseDelay(props.closeDelay);
  closeTimeout = setTimeout(() => {
    showPopper.value = false;
  }, delay);
};

const handleFocusIn = () => {
  if (props.disabled) return;
  showPopper.value = true;
};

const handleClose = () => {
  if (openTimeout) clearTimeout(openTimeout);
  if (closeTimeout) clearTimeout(closeTimeout);
  showPopper.value = false;
};

onMounted(() => {
  const el = triggerWrapper.value?.firstElementChild;
  if (el && el instanceof HTMLElement) {
    el.setAttribute('aria-labelledby', `${props.id}-description`);
  }
});

onBeforeUnmount(() => {
  if (openTimeout) clearTimeout(openTimeout);
  if (closeTimeout) clearTimeout(closeTimeout);
});
</script>
<template>
  <div class="lx-info-wrapper">
    <LxPopper
      :id="`${id}-popper`"
      :placement="placement"
      :offset-skid="offsetSkid"
      :offset-distance="offsetDistance"
      :hover="hover"
      :arrowPointer="arrow"
      :arrow-padding="arrowPadding"
      :disabled="disabled"
      :open-delay="openDelay"
      :close-delay="closeDelay"
      :interactive="interactive"
      :content="content"
      :show="showPopper"
      :locked="locked"
    >
      <div
        ref="triggerWrapper"
        class="lx-info-wrapper-content"
        :tabindex="$slots.panel && focusable ? '0' : '-1'"
        @focusin="handleFocusIn"
        @focusout="handleMouseLeave"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @keydown.esc.prevent="handleClose"
      >
        <slot />
      </div>

      <template #content v-if="$slots.panel">
        <div
          class="lx-info-wrapper-panel"
          :id="`${id}-description`"
          role="tooltip"
          :aria-hidden="!showPopper"
        >
          <slot name="panel" />
        </div>
      </template>
    </LxPopper>
  </div>
</template>
