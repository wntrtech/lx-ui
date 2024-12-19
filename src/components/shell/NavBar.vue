<script setup>
import { computed, ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';
import { useWindowSize } from '@vueuse/core';

import LxButton from '@/components/Button.vue';
import LxHeaderButtons from '@/components/shell/HeaderButtons.vue';

const props = defineProps({
  navItems: {
    type: Array,
    default: null,
  },
  navBarHidden: {
    type: Boolean,
    default: true,
  },
  selectedNavItems: {
    type: Object,
    default: () => ({}),
  },
  hasThemePicker: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark', 'contrast'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: true },
  hasDeviceFonts: { type: Boolean, default: false },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  layoutMode: { type: String, default: 'default' },
  texts: {
    type: Object,
    required: false,
    default: () => ({
      defaultBack: 'Atpakaļ',
      languagesTitle: 'Valodu izvēle',
      close: 'Aizvērt',
      themeTitle: 'Noformējuma izvēle',
      themeAuto: 'Automātiskais režīms',
      themeLight: 'Gaišais režīms',
      themeDark: 'Tumšais režīms',
      themeContrast: 'Kontrastais režīms',
      animations: 'Samazināt kustības',
      fonts: 'Iekārtas fonti',
    }),
  },
});

const width = ref(useWindowSize().width);

const navItemsPrimary = computed(() =>
  props.navItems?.filter((item) => !item.type || item.type === 'primary')
);
const navItemsSecondary = computed(() =>
  props.navItems?.filter((item) => item.type === 'secondary')
);
const allNavItems = computed(() => {
  const res = [];
  if (navItemsPrimary.value) {
    res.push(...navItemsPrimary.value);
  }
  if (navItemsSecondary.value) {
    res.push(...navItemsSecondary.value);
  }
  return res;
});

const emits = defineEmits([
  'nav-toggle',
  'update:selected-language',
  'update:theme',
  'update:hasAnimations',
  'update:hasDeviceFonts',
  'navClick',
]);

function navToggle(ev) {
  if (!props.navBarHidden && ev.target.id !== 'nav-toggle') {
    emits('nav-toggle', true);
  }
}

const selectedLanguageModel = computed({
  get() {
    return props.selectedLanguage;
  },
  set(value) {
    emits('update:selected-language', value);
  },
});

const themeModel = computed({
  get() {
    return props.theme;
  },
  set(value) {
    if (props.hasThemePicker) {
      emits('update:theme', value);
    }
  },
});

const animationsModel = computed({
  get() {
    return props.hasAnimations;
  },
  set(value) {
    emits('update:hasAnimations', value);
  },
});

const deviceFontsModel = computed({
  get() {
    return props.hasDeviceFonts;
  },
  set(value) {
    emits('update:hasDeviceFonts', value);
  },
});

function navClick(id) {
  emits('navClick', id);
}
</script>
<template>
  <div class="lx-nav-panel" v-on-click-outside="navToggle">
    <ul class="lx-nav-group">
      <li
        v-for="(item, index) in props.layoutMode === 'public' && width >= 900
          ? allNavItems
          : navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton
          :label="item.label"
          :href="item.to"
          :icon="
            (((index === 0 && width >= 900) || width < 900) && props.layoutMode === 'public') ||
            props.layoutMode !== 'public'
              ? item.icon
              : ''
          "
          :variant="
            index === 0 && props.layoutMode === 'public' && width >= 900 ? 'icon-only' : 'default'
          "
          @click="navClick(item?.id)"
        />
      </li>

      <LxHeaderButtons
        v-if="width < 500"
        mode="cover"
        :has-nav-bar="true"
        :has-language-picker="hasLanguagePicker"
        :languages="languages"
        :has-theme-picker="hasThemePicker"
        :available-themes="availableThemes"
        v-model:selectedLanguage="selectedLanguageModel"
        v-model:theme="themeModel"
        v-model:hasAnimations="animationsModel"
        v-model:hasDeviceFonts="deviceFontsModel"
        :texts="texts"
      />
    </ul>

    <ul v-if="props.layoutMode !== 'public' || width < 900" class="lx-nav-group">
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton
          :label="item.label"
          :href="item.to"
          :icon="item.icon"
          @click="navClick(item?.id)"
        />
      </li>
    </ul>
  </div>
</template>
