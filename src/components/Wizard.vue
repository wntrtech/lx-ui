<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import LxSteps from '@/components/Steps.vue';
import { useElementBounding, useElementSize } from '@vueuse/core';

const props = defineProps({
  modelValue: { type: String, default: null },
  items: { type: Array, default: () => [] },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

function calculateOffset(el) {
  const navRems = getComputedStyle(el).getPropertyValue('--nav-row-size').trim();
  const { fontSize } = getComputedStyle(el);
  return parseInt(navRems, 10) * parseFloat(fontSize);
}

const wizardHeader = ref();
const wizard = ref();
const bounding = useElementBounding(wizard);
const headerSize = useElementSize(wizardHeader);

const topOutOfBounds = computed(() => {
  const keyOpacity = '--wizard-shadow-opacity';
  const keySize = '--wizard-header-size';
  const limit = 100;
  const size = headerSize.height?.value;

  if (!wizard.value || !wizardHeader.value) return `${keyOpacity}: 0; ${keySize}: var(--row-size);`;

  const v = bounding.top ? bounding.top.value - calculateOffset(wizard.value) : 0;
  if (v < 0 - limit) {
    return `${keyOpacity}: 1; ${keySize}: ${size}px;`;
  }
  if (v < 0) {
    return `${keyOpacity}: ${(0 - v) / limit}; ${keySize}: ${size}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${size}px;`;
});

const modifiedItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    state: item.invalid ? 'invalid' : item.state,
  }))
);

watch(
  () => props.modelValue,
  () => {
    model.value = props.modelValue;
  }
);
</script>
<template>
  <div class="lx-wizard" :style="`${topOutOfBounds}`" ref="wizard">
    <header ref="wizardHeader" class="lx-toolbar lx-sticky">
      <div class="lx-wizard-container">
        <LxSteps v-model="model" :items="modifiedItems" kind="compact"></LxSteps>
      </div>
    </header>

    <article class="lx-wizard-body">
      <transition name="nav">
        <slot name="body" />
      </transition>
    </article>
  </div>
</template>
