<script setup lang="ts">
import { foldToAscii } from '@/utils/stringUtils';
import { computed } from 'vue';

const props = defineProps({
  value: { type: String, default: null },
  searchString: { type: String, default: null },
});

const res = computed(() => {
  if (props.searchString) {
    const formattedVal = foldToAscii(props.value)?.toLowerCase();
    const formattedSearch = foldToAscii(props.searchString)?.toLowerCase();
    const foundIndex = formattedVal?.indexOf(formattedSearch);
    if (foundIndex >= 0) {
      const len = props.searchString.length;
      return {
        prefix: props.value?.substring(0, foundIndex),
        found: props.value?.substring(foundIndex, foundIndex + len),
        postfix: props.value?.substring(foundIndex + len),
      };
    }
  }
  return {
    prefix: props.value,
    found: null,
    postfix: null,
  };
});
</script>
<template>
  {{ res.prefix }}<span class="lx-highlight" v-if="res.found">{{ res.found }}</span
  >{{ res.postfix }}
</template>
