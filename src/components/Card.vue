<script setup lang="ts">
import { computed, ref, watch, shallowRef } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => generateUUID(),
  },
  kind: {
    type: String,
    default: 'default', // default, clickable, button
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  texts: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const textsDefault = {
  flipCard: 'Apgriezt kartīti',
  flipCardBack: 'Apgriezt kartīti atpakaļ',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const BASE_PERSPECTIVE = 3000;
const MAX_ROTATE = 5;

const cardRef = ref(null);
const cardWrapperRef = ref(null);
const isAnimating = ref(false);
const hoverTilt = ref(null);

const cardPerspective = '--card-perspective';
const cardRotateX = '--card-rotate-x';
const cardRotateY = '--card-rotate-y';

const isFlipped = shallowRef(props.modelValue);

function applyTilt(rotateX = 0, rotateY = 0) {
  hoverTilt.value = `${cardPerspective}: ${BASE_PERSPECTIVE}px; ${cardRotateX}: ${rotateX}deg; ${cardRotateY}: ${rotateY}deg`;
}

function onMouseMove(e) {
  if (!cardRef.value || !cardWrapperRef.value || isAnimating.value) return;

  const input = e.type === 'touchmove' ? e.touches?.[0] : e;
  if (!input) return;

  const { clientX, clientY } = input;

  const rect = cardRef.value.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const offsetX = clientX - rect.left - centerX;
  const offsetY = clientY - rect.top - centerY;

  const percentX = offsetX / centerX;
  const percentY = offsetY / centerY;

  const rotateX = -percentY * MAX_ROTATE;
  const rotateY = percentX * MAX_ROTATE + (isFlipped.value ? -180 : 0);
  applyTilt(rotateX, rotateY);
}

function onMouseLeave() {
  if (isAnimating.value) return;
  applyTilt(0, isFlipped.value ? -180 : 0);
}

function flipCard(triggerKind) {
  if (isAnimating.value || triggerKind !== props.kind) return;

  if (isFlipped.value !== null) {
    isFlipped.value = !isFlipped.value;
    emit('update:modelValue', isFlipped.value);
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (isFlipped.value !== newValue) {
      isFlipped.value = newValue;
    }
  },
  { immediate: true }
);

watch(
  isFlipped,
  (newFlipped, oldFlipped) => {
    if (isAnimating.value) return;

    applyTilt(0, oldFlipped ? -180 : 0);
    isAnimating.value = true;

    setTimeout(() => {
      applyTilt(0, newFlipped ? -180 : 0);
      setTimeout(() => {
        isAnimating.value = false;
      }, 750);
    }, 50);
  },
  { immediate: true }
);
</script>
<template>
  <div
    :id="id"
    ref="cardWrapperRef"
    class="lx-card-wrapper"
    :class="[
      { 'lx-card-clickable': kind === 'clickable' },
      { 'lx-card-has-button': kind === 'button' },
      { 'lx-card-interactive': interactive },
      { 'lx-card-flipped': isFlipped },
    ]"
    v-bind="
      interactive
        ? {
            onMousemove: onMouseMove,
            onMouseleave: onMouseLeave,
            onTouchmove: onMouseMove,
            onTouchend: onMouseLeave,
          }
        : {}
    "
  >
    <div
      class="lx-card"
      ref="cardRef"
      :style="`${hoverTilt}`"
      :tabindex="kind === 'clickable' ? 0 : null"
      @click="flipCard('clickable')"
      @keyup.enter.stop.prevent="flipCard('clickable')"
      @keydown.space.prevent="flipCard('clickable')"
    >
      <div :id="`${id}-card-front`" class="lx-card-face lx-card-front">
        <slot></slot>
        <LxButton
          v-if="kind === 'button'"
          kind="ghost"
          variant="icon-only"
          :label="displayTexts.flipCard"
          :tabindex="!isFlipped ? 0 : -1"
          icon="switch"
          @click="flipCard('button')"
        />
      </div>
      <div :id="`${id}-card-back`" class="lx-card-face lx-card-back">
        <slot name="reverse"></slot>
        <LxButton
          v-if="kind === 'button'"
          kind="ghost"
          variant="icon-only"
          :label="displayTexts.flipCardBack"
          :tabindex="isFlipped ? 0 : -1"
          icon="switch"
          @click="flipCard('button')"
        />
      </div>
    </div>
  </div>
</template>
