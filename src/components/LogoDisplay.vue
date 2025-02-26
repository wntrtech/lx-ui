<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getLogo, getAltText } from '@/utils/logoUtils';

const props = defineProps({
  value: { type: String, default: 'zzdats' },
  kind: { type: String, default: 'default' }, // 'default' - 16:9 format, 'square' - 1:1 format
  size: { type: String, default: 'auto' }, // 'auto', 's', 'm', 'l'
});

let observer;

const theme = ref('light');

const updateTheme = () => {
  theme.value = document.body.classList.contains('lx-theme-dark') ? 'dark' : 'light';
};

onMounted(() => {
  updateTheme();

  observer = new MutationObserver(updateTheme);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onUnmounted(() => {
  observer.disconnect();
});
</script>

<template>
  <template v-if="size === 'auto'">
    <picture>
      <img :src="getLogo(props.value, props.kind, 's', theme)" :alt="getAltText(props.value)" />
      <source
        :srcset="getLogo(props.value, props.kind, 'm', theme)"
        media="(min-resolution: 2dppx)"
      />
      <source
        :srcset="getLogo(props.value, props.kind, 'l', theme)"
        media="(min-resolution: 3dppx)"
      />
    </picture>
  </template>

  <template v-else-if="size === 's'">
    <img
      :src="getLogo(props.value, props.kind, props.size, theme)"
      :alt="getAltText(props.value)"
    />
  </template>

  <template v-else-if="size === 'm'">
    <img
      :src="getLogo(props.value, props.kind, props.size, theme)"
      :alt="getAltText(props.value)"
    />
  </template>

  <template v-else-if="size === 'l'">
    <img
      :src="getLogo(props.value, props.kind, props.size, theme)"
      :alt="getAltText(props.value)"
    />
  </template>
</template>
