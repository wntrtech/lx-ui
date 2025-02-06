<script setup lang="ts">
import { computed } from 'vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  routes: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  category: { type: String, default: '' },
  translator: { type: [Function, Object], default: null },
});

const visibleRoutes = computed(() =>
  props.routes.filter(
    (route) =>
      !route.meta?.hideFromIndex && (!props.category || props.category === route.meta?.category)
  )
);

function getRouteTitle(route) {
  const title = route.meta?.title;
  if (!title || (typeof title === 'string' && title.trim() === '')) {
    return '';
  }
  if (typeof title === 'function' && props.translator && typeof props.translator === 'object') {
    return title(props.translator);
  }
  if (props.translator && typeof props.translator === 'function') {
    return props.translator(title);
  }
  return title;
}
</script>
<template>
  <div class="lx-sitemap-wrapper">
    <p v-if="label" class="lx-sitemap-label">
      {{ label }}
    </p>
    <ul class="lx-sitemap" :id="id" :aria-label="label ? label : null">
      <li class="lx-sitemap-item" v-for="route in visibleRoutes" :key="route.path">
        <RouterLink class="lx-sitemap-link" :to="route.path">
          {{ getRouteTitle(route) }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
