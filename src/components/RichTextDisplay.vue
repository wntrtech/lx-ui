<script setup lang="ts">
import LxLoader from '@/components/Loader.vue';
import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  value: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});
const markdown = computed(() => marked(props.value));

const vCleanHtml = buildVueDompurifyHTMLDirective({
  hooks: {
    afterSanitizeAttributes: (node) => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
      }
    },
  },
});
</script>

<template>
  <article v-if="!props.loading" v-clean-html="markdown" class="lx-article lx-rich-text-wrapper" />
  <article v-else class="lx-article lx-rich-text-loader">
    <LxLoader :loading="loading" />
  </article>
</template>
