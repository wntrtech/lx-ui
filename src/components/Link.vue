<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  href: { type: [String, Object], default: null },
});

const isHrefString = computed(() => typeof props.href === 'string');
</script>

<template>
  <div class="lx-link-wrapper">
    <template v-if="href">
      <template v-if="isHrefString">
        <a :href="href" rel="noopener noreferrer"> <slot /></a>
      </template>
      <template v-else>
        <RouterLink :to="href"> <slot /></RouterLink>
      </template>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>
