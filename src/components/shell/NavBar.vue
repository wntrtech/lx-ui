<script setup>
import { computed, ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';
import { useWindowSize, useScroll } from '@vueuse/core';

import LxButton from '@/components/Button.vue';
import LxHeaderButtons from '@/components/shell/HeaderButtons.vue';
import LxMegaMenu from '@/components/shell/MegaMenu.vue';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxDropDownMenu from '@/components/DropDownMenu.vue';

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
  hasReducedTransparency: { type: Boolean, default: false },
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
  overflowNavItems: 'Atvērt papildu izvēlni',
  scrollUp: 'Atgriezties uz augšu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const width = ref(useWindowSize().width);
const { y } = useScroll(window);

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
  if (res?.length > 7 && props.layoutMode === 'public') return res?.slice(0, 6);
  return res;
});

// Public shell navItem logic:

// 1300 / 256 (default shell nav item width) ≈ 5
// If 5 + 1 (first item is icon-only) navItems, then show all of them
// If 6 + 1 (first item is icon-only) navItems, then show all of them
// If 7 or more navItems, then show only 5 + 1 and overflow menu

const overflowNavItems = computed(() => {
  if (props.layoutMode === 'public') {
    let res = [];
    if (navItemsPrimary.value) {
      res.push(...navItemsPrimary.value);
    }
    if (navItemsSecondary.value) {
      res.push(...navItemsSecondary.value);
    }
    res = res?.slice(6);
    return res?.map((item) => ({
      id: item?.id,
      name: item?.label,
      href: item?.to,
      active: props.selectedNavItems[item?.to?.name],
    }));
  }
  return [];
});

const emits = defineEmits([
  'nav-toggle',
  'update:selected-language',
  'update:theme',
  'update:hasAnimations',
  'update:hasReducedTransparency',
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

const transparencyModel = computed({
  get() {
    return props.hasReducedTransparency;
  },
  set(value) {
    emits('update:hasReducedTransparency', value);
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

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
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

      <li
        v-if="props.layoutMode === 'public' && overflowNavItems?.length > 1 && width >= 900"
        class="lx-nav-item-overflow"
        :class="[
          { 'lx-selected': overflowNavItems?.some((item) => selectedNavItems[item?.href?.name]) },
        ]"
      >
        <LxDropDownMenu :actionDefinitions="overflowNavItems" @action-click="(id) => navClick(id)">
          <LxButton
            icon="overflow-menu"
            :label="displayTexts?.overflowNavItems"
            variant="icon-only"
          />
        </LxDropDownMenu>
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
        v-model:hasReducedTransparency="transparencyModel"
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
  <LxButton
    v-if="layoutMode === 'public' && y > 120 && width > 900"
    icon="scroll-up"
    kind="ghost"
    customClass="scroll-up-button"
    variant="icon-only"
    :label="displayTexts.scrollUp"
    @click="scrollUp()"
  />
</template>
