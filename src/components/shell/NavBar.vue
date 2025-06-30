<script setup>
import { computed, ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';
import { useWindowSize } from '@vueuse/core';

import LxButton from '@/components/Button.vue';
import LxHeaderButtons from '@/components/shell/HeaderButtons.vue';
import LxMegaMenu from '@/components/shell/MegaMenu.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

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
  isTouchSensitive: { type: Boolean, default: false },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  layoutMode: { type: String, default: 'default' },

  hasMegaMenu: { type: Boolean, default: false },
  megaMenuItems: { type: Array, default: () => [] },
  megaMenuHasShowAll: { type: Boolean, default: false },
  megaMenuGroupDefinitions: { type: Array, default: null },
  selectedMegaMenuItem: { type: String, default: null },

  texts: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const textsDefault = {
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
  touchMode: 'Skārienjūtīgs režīms',
  reduceMotionOff: 'Nē',
  reduceMotionOn: 'Jā',
  systemFontsOff: 'Nē',
  systemFontsOn: 'Jā',
  touchModeOff: 'Nē',
  touchModeOn: 'Jā',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

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
  'update:isTouchSensitive',
  'navClick',
  'update:selectedMegaMenuItem',
  'megaMenuShowAllClick',
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

const selectedMegaMenuItemModel = computed({
  get() {
    return props.selectedMegaMenuItem;
  },
  set(value) {
    emits('update:selectedMegaMenuItem', value);
  },
});

const touchModeModel = computed({
  get() {
    return props.isTouchSensitive;
  },
  set(value) {
    emits('update:isTouchSensitive', value);
  },
});

const getTabIndex = computed(() => {
  if ((props.layoutMode !== 'default' && props.layoutMode !== 'digives') || width.value > 1900)
    return 0;
  return 2;
});

function navClick(id) {
  emits('navClick', id);
  emits('nav-toggle', true);
}

function triggerShowAllClick() {
  emits('megaMenuShowAllClick');
}
</script>
<template>
  <div class="lx-nav-panel" v-on-click-outside="navToggle" :tabindex="-1">
    <ul class="lx-nav-group">
      <li
        v-for="(item, index) in (props.layoutMode === 'public' ||
          props.layoutMode === 'latvijalv') &&
        width >= 900
          ? allNavItems
          : navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton
          :label="item.label"
          :href="item.to"
          :icon="
            (((index === 0 && width >= 900) || width < 900) &&
              (props.layoutMode === 'public' || props.layoutMode === 'latvijalv')) ||
            (props.layoutMode !== 'public' && props.layoutMode !== 'latvijalv')
              ? item.icon
              : ''
          "
          :iconSet="item?.iconSet"
          :variant="
            index === 0 &&
            (props.layoutMode === 'public' || props.layoutMode === 'latvijalv') &&
            width >= 900
              ? 'icon-only'
              : 'default'
          "
          :tabindex="getTabIndex"
          @click="navClick(item?.id)"
        />
      </li>

      <LxHeaderButtons
        v-if="width <= 500"
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
        v-model:isTouchSensitive="touchModeModel"
        :texts="displayTexts"
      />
    </ul>

    <ul
      v-if="(props.layoutMode !== 'public' && props.layoutMode !== 'latvijalv') || width < 900"
      class="lx-nav-group"
    >
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton
          :label="item.label"
          :href="item.to"
          :icon="item.icon"
          :iconSet="item?.iconSet"
          :tabindex="getTabIndex"
          @click="navClick(item?.id)"
        />
      </li>
      <li v-if="props.hasMegaMenu && width <= 500" class="lx-mega-menu-nav-item lx-mega-menu">
        <LxMegaMenu
          :items="megaMenuItems"
          :groupDefinitions="megaMenuGroupDefinitions"
          :hasShowAll="megaMenuHasShowAll"
          :texts="displayTexts"
          buttonVariant="default"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          @mega-menu-show-all-click="triggerShowAllClick"
        />
      </li>
    </ul>
  </div>
</template>
