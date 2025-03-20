<script setup>
import { computed } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  label: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: 's',
  },
  height: {
    type: String,
    default: 's',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: false,
  },
  href: {
    type: Object,
    default: null,
  },
  actions: { type: Array, default: () => [] },
  kind: {
    type: String,
    default: 'default', // default, fancy
  },
  coverImage: {
    type: String,
    default: '',
  },
  texts: {
    type: Object,
    default: () => ({
      overflowMenu: 'Atvērt papildus iespējas',
    }),
  },
});
const emits = defineEmits(['actionClick']);

const size = computed(() => `lx-widget-${props.width}-${props.height}`);

function actionClicked(actionName) {
  emits('actionClick', actionName);
}
</script>
<template>
  <div
    class="lx-widget"
    :class="[size, { 'fancy-background': kind === 'fancy' }]"
    :style="{ backgroundImage: kind === 'fancy' ? 'url(' + coverImage + ')' : 'none' }"
    v-if="!href"
  >
    <header v-if="showHeader">
      <p>{{ label }}</p>
      <div class="lx-widget-toolbar-button" v-if="actions && actions?.length === 1">
        <LxButton
          v-for="action in actions"
          :key="action.actionName"
          kind="ghost"
          tabindex="0"
          :icon="action.icon"
          variant="icon-only"
          :label="action.label"
          :destructive="action.isDestructive"
          @click="actionClicked(action.actionName)"
        />
      </div>
      <LxDropDownMenu v-if="actions && actions?.length > 1">
        <div class="lx-widget-toolbar-button">
          <LxButton
            icon="overflow-menu"
            kind="ghost"
            :label="texts.overflowMenu"
            variant="icon-only"
          />
        </div>
        <template v-slot:panel>
          <div class="lx-button-set">
            <LxButton
              v-for="action in actions"
              :key="action.actionName"
              :icon="action.icon"
              :label="action.label"
              tabindex="0"
              :destructive="action.isDestructive"
              @click="actionClicked(action.actionName)"
            />
          </div>
        </template>
      </LxDropDownMenu>
    </header>
    <article class="lx-main">
      <slot />
    </article>
    <footer v-if="showFooter" />
  </div>
  <router-link
    :id="id"
    :to="href"
    class="lx-widget lx-widget-router"
    :class="size"
    v-else
    :style="{ backgroundImage: kind === 'fancy' ? 'url(' + coverImage + ')' : 'none' }"
  >
    <header v-if="showHeader">{{ label }}</header>
    <article class="lx-main">
      <slot />
    </article>
    <footer v-if="showFooter" />
  </router-link>
</template>
