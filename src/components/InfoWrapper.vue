<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxPopper from '@/components/Popper.vue';
import { useDebounceFn } from '@vueuse/core';

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
  label: { type: String, default: null },
  description: { type: String, default: null },
});

const showPopper = ref(false);
const triggerRef = ref(null);
const popperRef = ref(null);
const resolvedPlacement = ref();

const ariaLabel = computed(() => {
  if (!props.label && !props.description) return null;
  return `${props.label ? `${props.label}${props.description ? '. ' : ''}` : ''}${
    props.description ? props.description : ''
  }`;
});

const spacerStyle = computed(() => {
  const correction = 1;
  const popperSpacerSize = Number(props.offsetDistance) + correction;
  if (Number(props.offsetDistance) > 0) {
    return `--info-popper-spacer-size: ${popperSpacerSize}px`;
  }
  return '';
});

const parseDelay = (v) => Number(v) || 0;

const oDelay = computed(() => parseDelay(props.openDelay));
const cDelay = computed(() => parseDelay(props.closeDelay));

const handleOpen = () => {
  showPopper.value = true;
};

const handleClose = () => {
  showPopper.value = false;
};

const debouncedOpen = useDebounceFn(async () => {
  handleOpen();
}, oDelay);

const debouncedClose = useDebounceFn(async () => {
  handleClose();
}, cDelay);

const handleMouseEnter = () => {
  if ((!props.hover || props.disabled) && !showPopper.value) return;
  debouncedOpen();
};

const handleMouseLeave = (event) => {
  if ((!props.hover || props.disabled) && showPopper.value) return;

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
    debouncedClose();
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

function togglePopperOnMobile() {
  if (window.matchMedia('(hover: none)').matches) {
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
    :disabled="disabled"
    :open-delay="openDelay"
    :close-delay="closeDelay"
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
      :aria-label="ariaLabel"
      :aria-describedby="`${id}-description`"
      :tabindex="$slots.panel && focusable && !disabled ? '0' : '-1'"
      @focusin="handleFocusIn"
      @focusout="handleMouseLeave"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="togglePopperOnMobile"
    >
      <slot />
    </div>

    <template #content v-if="$slots.panel">
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
        </div>
      </div>
    </template>
  </LxPopper>
</template>
