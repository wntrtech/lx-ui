<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
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
  content: { default: null },
  locked: { type: Boolean, default: false },
  focusable: { type: Boolean, default: true },
});

const showPopper = ref(false);
const triggerRef = ref(null);
const popperRef = ref(null);
const resolvedPlacement = ref();

let openTimeout = null;
let closeTimeout = null;

const spacerStyle = computed(() => {
  const correction = 1;
  const popperSpacerSize = Number(props.offsetDistance) + correction;
  if (Number(props.offsetDistance) > 0) {
    return `--info-popper-spacer-size: ${popperSpacerSize}px`;
  }
  return '';
});

const parseDelay = (v) => Number(v) || 0;

const handleOpen = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  const delay = parseDelay(props.openDelay);
  openTimeout = setTimeout(() => {
    showPopper.value = true;
  }, delay);
};

const handleClose = () => {
  if (openTimeout) {
    clearTimeout(openTimeout);
    openTimeout = null;
  }

  const delay = parseDelay(props.closeDelay);
  closeTimeout = setTimeout(() => {
    showPopper.value = false;
  }, delay);
};

const handleMouseEnter = () => {
  if (!props.hover || props.disabled) return;
  handleOpen();
};

const handleMouseLeave = (event) => {
  if (!props.hover || props.disabled) return;

  const { relatedTarget } = event;
  const triggerEl = triggerRef.value;
  const popperEl = popperRef.value;

  if (
    relatedTarget &&
    triggerEl instanceof HTMLElement &&
    popperEl instanceof HTMLElement &&
    !triggerEl.contains(relatedTarget) &&
    !popperEl.contains(relatedTarget)
  ) {
    handleClose();
  }
};

const handleFocusIn = () => {
  if (props.disabled) return;
  showPopper.value = true;
};

const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape' && showPopper.value) {
    handleClose();
  }
};

function handlePlacementChange(newPlacement) {
  resolvedPlacement.value = newPlacement;
}

onMounted(() => {
  const el = triggerRef.value?.firstElementChild;
  if (el && el instanceof HTMLElement) {
    el.setAttribute('aria-labelledby', `${props.id}-description`);
  }
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  if (openTimeout) clearTimeout(openTimeout);
  if (closeTimeout) clearTimeout(closeTimeout);
  window.removeEventListener('keydown', handleGlobalKeydown);
});

defineExpose({ handleOpen, handleClose, showPopper });
</script>
<template>
  <div class="lx-info-wrapper" ref="popperRef">
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
      :content="content"
      :show="showPopper"
      :locked="locked"
      emitPlacement
      @focusout="handleMouseLeave"
      @mouseleave="handleMouseLeave"
      @update:placement="handlePlacementChange"
    >
      <div
        ref="triggerRef"
        class="lx-info-wrapper-content"
        :tabindex="$slots.panel && focusable && !disabled ? '0' : '-1'"
        @focusin="handleFocusIn"
        @focusout="handleMouseLeave"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <slot />
      </div>

      <template #content v-if="$slots.panel">
        <div
          :id="`${id}-description`"
          class="lx-info-wrapper-panel"
          :class="[
            {
              'info-popper-top':
                resolvedPlacement === 'top' ||
                resolvedPlacement === 'top-start' ||
                resolvedPlacement === 'top-end',
            },
            {
              'info-popper-bottom':
                resolvedPlacement === 'bottom' ||
                resolvedPlacement === 'bottom-start' ||
                resolvedPlacement === 'bottom-end',
            },
            {
              'info-popper-right':
                resolvedPlacement === 'right' ||
                resolvedPlacement === 'right-start' ||
                resolvedPlacement === 'right-end',
            },
            {
              'info-popper-left':
                resolvedPlacement === 'left' ||
                resolvedPlacement === 'left-start' ||
                resolvedPlacement === 'left-end',
            },
          ]"
          role="tooltip"
          :aria-hidden="!showPopper"
          :style="`${spacerStyle}`"
          @click.prevent="handleClose"
        >
          <slot name="panel" />
        </div>
      </template>
    </LxPopper>
  </div>
</template>
