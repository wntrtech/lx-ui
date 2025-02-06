<script setup lang="ts">
import LxLoader from '@/components/Loader.vue';
import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';
import { ref, watch } from 'vue';
import { marked } from 'marked';

const markdownLoading = ref(false);
const props = defineProps({
  value: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  id: { type: String, default: '' },
});

let headingCounter = 0;

const renderer = new marked.Renderer();
renderer.heading = ({ text, depth }) => {
  headingCounter += 1;
  return `<h${depth} id="markdown-section-${props.id}-${headingCounter}">${text}</h${depth}>`;
};

const markdown = ref('');

watch(
  () => props.value,
  async (newMarkdown) => {
    markdownLoading.value = true;

    headingCounter = 0;
    markdown.value = await marked(newMarkdown, { renderer });

    markdownLoading.value = false;
  },
  { immediate: true }
);

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
  <article
    v-if="!markdownLoading && !props.loading"
    v-clean-html="markdown"
    class="lx-article lx-rich-text-wrapper"
  />
  <article v-else class="lx-article lx-rich-text-loader">
    <LxLoader :loading="markdownLoading || props.loading" />
  </article>
</template>
