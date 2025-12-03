<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, useSlots } from 'vue';
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
  content: { default: null },
  locked: { type: Boolean, default: false },
  focusable: { type: Boolean, default: true },
  label: { type: String, default: null },
  description: { type: String, default: null },
  customRole: { type: String, default: null },
});

const slots = useSlots();
const showPopper = ref(false);
const triggerRef = ref(null);
const popperRef = ref(null);
const resolvedPlacement = ref();

const ariaLabel = computed(() => {
  if (props.label && props.description) {
    return `${props.label}. ${props.description}`;
  }
  return props.label || props.description || null;
});

const spacerStyle = computed(() => {
  const correction = 1;
  const popperSpacerSize = Number(props.offsetDistance) + correction;
  if (Number(props.offsetDistance) > 0) {
    return `--info-popper-spacer-size: ${popperSpacerSize}px`;
  }
  return '';
});

const isPanelAvailable = computed(() => {
  const panelSlot = slots.panel?.();
  return (panelSlot && panelSlot.length > 0) || props.content;
});

const handleOpen = () => {
  if (!isPanelAvailable.value || props.disabled) return;
  showPopper.value = true;
};

const handleClose = () => {
  showPopper.value = false;
};

let openTimeout = null;
let closeTimeout = null;

const handleMouseEnter = () => {
  if (!props.hover || props.disabled || !isPanelAvailable.value) return;

  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  openTimeout = setTimeout(() => {
    showPopper.value = true;
    openTimeout = null;
  }, 100);
};

const handleMouseLeave = (event) => {
  if (!props.hover || props.disabled || !isPanelAvailable.value) return;

  if (openTimeout) {
    clearTimeout(openTimeout);
    openTimeout = null;
  }

  const { relatedTarget } = event;
  const triggerEl = triggerRef.value;
  const popperEl = popperRef.value;
  if (
    relatedTarget instanceof Element &&
    triggerEl instanceof HTMLElement &&
    popperEl instanceof HTMLElement &&
    !triggerEl.contains(relatedTarget) &&
    !popperEl.contains(relatedTarget)
  ) {
    closeTimeout = setTimeout(() => {
      showPopper.value = false;
      closeTimeout = null;
    }, 100);
  }
};

const handleFocusIn = () => {
  if (props.disabled || !isPanelAvailable.value) return;
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

function togglePopperOnMobile() {
  if (window.matchMedia('(hover: none)').matches && isPanelAvailable.value) {
    showPopper.value = !showPopper.value;
  }
}

onMounted(() => {
  const el = triggerRef.value?.firstElementChild;
  if (el && el instanceof HTMLElement) {
    el.setAttribute('aria-labelledby', `${props.id}-description`);
  }
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

defineExpose({ handleOpen, handleClose, showPopper });
</script>
<template>
  <LxPopper
    :id="`${id}-popper`"
    :placement="placement"
    :offset-skid="offsetSkid"
    :offset-distance="offsetDistance"
    :hover="hover"
    :arrowPointer="arrow"
    :arrow-padding="arrowPadding"
    :disabled="disabled || !isPanelAvailable"
    :content="content"
    :show="showPopper"
    :locked="locked"
    emitPlacement
    @update:placement="handlePlacementChange"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
    <div
      ref="triggerRef"
      class="lx-info-wrapper-content"
      :class="[{ 'lx-disabled': disabled || !isPanelAvailable }]"
      :aria-label="ariaLabel"
      :aria-describedby="`${id}-description`"
      :tabindex="$slots.panel && focusable && !disabled ? '0' : '-1'"
      :role="customRole"
      @focusin="handleFocusIn"
      @focusout="handleMouseLeave"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="togglePopperOnMobile"
    >
      <slot />
    </div>

    <template #content v-if="isPanelAvailable">
      <div
        ref="popperRef"
        class="lx-info-wrapper"
        @focusout="handleMouseLeave"
        @mouseleave="handleMouseLeave"
      >
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
          <p v-if="!$slots.panel && props.content" class="lx-data">{{ props.content }}</p>
        </div>
      </div>
    </template>
  </LxPopper>
</template>
