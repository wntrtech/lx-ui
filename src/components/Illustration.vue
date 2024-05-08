<script setup lang="ts">
import { shallowRef, computed, watch, defineAsyncComponent } from 'vue';
import IconDefault from '@/components/icons/Default.vue';

const props = defineProps({
  value: { type: String, default: 'default' },
  class: { type: String, default: 'lx-illustration' },
  animation: { type: String, default: 'default' }, // 'default', 'spin'
});

const iconPath = shallowRef(null);

const icon = computed(() => {
  // Separate icon name by '-' if any
  const parts = props.value?.split('-');

  let ret = '';
  parts?.forEach((part) => {
    // Make first letter of each part uppercase and concat them to match icon file name
    ret += `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
  });

  return ret;
});

function loadIcon() {
  if (icon.value) {
    iconPath.value = defineAsyncComponent({
      loader: () => import(`@/components/pictograms/${icon.value}.vue`),
      errorComponent: IconDefault,
    });
  }
}

watch(
  icon,
  () => {
    loadIcon();
  },
  { immediate: true }
);
</script>

<template>
  <div :class="props.class">
    <Transition :name="`illustration-${animation}`">
      <icon-path />
    </Transition>
  </div>
</template>
