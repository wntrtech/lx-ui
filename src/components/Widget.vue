<script setup>
import { computed } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

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
  actionDefinitions: { type: Array, default: () => [] },
  kind: {
    type: String,
    default: 'default', // default, fancy
  },
  coverImage: {
    type: String,
    default: '',
  },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = { overflowMenu: 'Atvērt papildu iespējas' };
const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['actionClick']);

const size = computed(() => `lx-widget-${props.width}-${props.height}`);

function actionClicked(id) {
  emits('actionClick', id);
}
</script>
<template>
  <div
    :id="id"
    class="lx-widget"
    :class="[size, { 'fancy-background': kind === 'fancy' }]"
    :style="{ backgroundImage: kind === 'fancy' ? 'url(' + coverImage + ')' : 'none' }"
    v-if="!href"
  >
    <header v-if="showHeader">
      <p>{{ label }}</p>
      <div
        class="lx-widget-toolbar-button"
        v-if="actionDefinitions && actionDefinitions?.length === 1"
      >
        <LxButton
          kind="ghost"
          :label="actionDefinitions?.[0]?.name || actionDefinitions?.[0]?.label"
          :title="actionDefinitions?.[0]?.title || actionDefinitions?.[0]?.tooltip"
          :icon="actionDefinitions?.[0]?.icon"
          :icon-set="actionDefinitions?.[0]?.iconSet"
          :loading="actionDefinitions?.[0]?.loading"
          :busy="actionDefinitions?.[0]?.busy"
          :destructive="actionDefinitions?.[0]?.destructive"
          :disabled="actionDefinitions?.[0]?.disabled"
          :active="actionDefinitions?.[0]?.active"
          variant="icon-only"
          :badge="actionDefinitions?.[0]?.badge"
          :badge-type="actionDefinitions?.[0]?.badgeType"
          :badgeIcon="actionDefinitions?.[0]?.badgeIcon"
          :badgeTitle="actionDefinitions?.[0]?.badgeTitle"
          @click="actionClicked(actionDefinitions?.[0]?.id)"
        />
      </div>
      <LxDropDownMenu
        v-if="actionDefinitions && actionDefinitions?.length > 1"
        :actionDefinitions="actionDefinitions"
        @actionClick="(id) => actionClicked(id)"
      >
        <div class="lx-widget-toolbar-button">
          <LxButton
            icon="overflow-menu"
            kind="ghost"
            :label="displayTexts.overflowMenu"
            variant="icon-only"
            tabindex="-1"
          />
        </div>
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
