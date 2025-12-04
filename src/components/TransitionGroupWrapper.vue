<script setup>
import { inject } from 'vue';

defineProps({
  name: { type: String, default: null },
  tag: { type: String, default: null },
});

defineOptions({ inheritAttrs: false });

const hasReducedAnimations = inject('hasAnimations', false);
</script>
<template>
  <template v-if="!hasReducedAnimations">
    <TransitionGroup :name :tag v-bind="$attrs">
      <slot></slot>
    </TransitionGroup>
  </template>
  <component v-else-if="tag" :is="tag" v-bind="$attrs">
    <slot></slot>
  </component>
  <slot v-else></slot>
</template>
