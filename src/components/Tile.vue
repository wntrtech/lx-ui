<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@/components/Icon.vue';
import useLx from '@/hooks/useLx';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  label: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  kind: {
    type: String,
    default: 'default',
  },
  href: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  busy: {
    type: Boolean,
    default: false,
  },
});

const isDisabled = computed(() => {
  let ret = false;
  if (props.disabled || props.loading || props.busy) {
    ret = true;
  }
  return ret;
});

const tooltipComputed = computed(() => (props.title ? props.title : props.description));
</script>
<template>
  <router-link
    :id="id"
    :to="href"
    class="lx-tile"
    :class="[{ 'lx-mini': kind === 'mini' }, { 'lx-disabled': isDisabled }]"
    :title="tooltipComputed"
    :aria-labelledby="label ? `${id}-label` : null"
    :aria-describedby="description ? `${id}-desc` : null"
  >
    <header>
      <Icon
        :value="icon"
        :icon-set="iconSet"
        customClass="lx-icon"
        :title="label"
        :desc="description"
      />
      <p :id="`${id}-label`" class="lx-primary">{{ label }}</p>
      <p :id="`${id}-desc`" class="lx-description">{{ description }}</p>
    </header>
    <article class="lx-main"><slot></slot></article>
  </router-link>
</template>
