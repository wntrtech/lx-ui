<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getLogo, getAltText } from '@/utils/logoUtils';

const props = defineProps({
  value: { type: String, default: 'zzdats' },
  kind: { type: String, default: 'default' }, // 'default' - 16:9 format, 'square' - 1:1 format
  size: { type: String, default: 'auto' }, // 'auto', 's', 'm', 'l'
  theme: { type: String, default: 'auto' }, // 'auto', 'light', 'dark'
});

let observer;

const systemTheme = ref('light');

const updateTheme = () => {
  if (props.theme === 'auto') {
    systemTheme.value = document.body.classList.contains('lx-theme-dark') ? 'dark' : 'light';
  } else {
    systemTheme.value = props.theme;
  }
  return systemTheme.value;
};

onMounted(() => {
  updateTheme();
  if (props.theme === 'auto') {
    observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <template v-if="size === 'auto'">
    <picture>
      <img
        :src="getLogo(props.value, props.kind, 's', systemTheme)"
        :alt="getAltText(props.value)"
      />
      <source
        :srcset="getLogo(props.value, props.kind, 'm', systemTheme)"
        media="(min-resolution: 2dppx)"
      />
      <source
        :srcset="getLogo(props.value, props.kind, 'l', systemTheme)"
        media="(min-resolution: 3dppx)"
      />
    </picture>
  </template>

  <template v-else-if="size === 's'">
    <img
      :src="getLogo(props.value, props.kind, props.size, systemTheme)"
      :alt="getAltText(props.value)"
    />
  </template>

  <template v-else-if="size === 'm'">
    <img
      :src="getLogo(props.value, props.kind, props.size, systemTheme)"
      :alt="getAltText(props.value)"
    />
  </template>

  <template v-else-if="size === 'l'">
    <img
      :src="getLogo(props.value, props.kind, props.size, systemTheme)"
      :alt="getAltText(props.value)"
    />
  </template>
</template>
