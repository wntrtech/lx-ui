<script setup>
import { computed, ref, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import LxButton from '@/components/Button.vue';
import LxToggle from '@/components/Toggle.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxIcon from '@/components/Icon.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  navItems: {
    type: Array,
    default: null,
  },
  navBarSwitch: {
    type: Boolean,
    default: true,
  },
  selectedNavItems: {
    type: Object,
    default: () => ({}),
  },
  hasThemePicker: { type: Boolean, default: false },
  hasAvatar: { type: Boolean, default: false },
  userInfo: { type: Object, default: null },
  alternativeProfilesInfo: { type: Array, default: null },
  contextPersonsInfo: { type: Array, default: null },
  selectedContextPerson: { type: Object, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  headerNavDisable: { type: Boolean, default: false },
  headerNavReadOnly: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark', 'contrast'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: true },
  hasDeviceFonts: { type: Boolean, default: false },
  isTouchSensitive: { type: Boolean, default: false },
  hasAlerts: { type: Boolean, default: false },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  alertsKind: { type: String, default: 'menu' },
  clickSafeAlerts: { type: Boolean, default: false },
  alerts: { type: Array, default: () => [] },
  alertCount: { type: Number, default: null },
  alertLevel: { type: String, default: null },
  hasHelp: { type: Boolean, default: false },
  texts: { type: Object, default: () => {} },

  hasCustomButton: { type: Boolean, default: false },
  customButtonIcon: { type: String, default: null },
  customButtonBadge: { type: String, default: null },
  customButtonBadgeType: { type: String, default: 'default' },
  customButtonBadgeIcon: { type: String, default: null },
  customButtonOpened: { type: Boolean, default: false },
  customButtonBlink: { type: Boolean, default: false },
  customButtonKind: { type: String, default: 'dropdown' }, // 'button' or 'dropdown'

  hasMegaMenu: { type: Boolean, default: false },
  megaMenuItems: { type: Array, default: () => [] },
  selectedMegaMenuItem: { type: String, default: null },
});

const textsDefault = {
  logOut: 'Iziet',
  openAlerts: 'Atvērt sarakstu',
  noAlerts: 'Nav paziņojumu',
  helpTitle: 'Palīdzība',
  alertsTitle: 'Paziņojumi',
  languagesTitle: 'Valodu izvēle',
  contextPersonsButtonLabel: 'Konteksta personas',
  alternativeProfilesButtonLabel: 'Alternatīvie profili',
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
  showAllLabel: 'Vairāk',
  megaMenuTitle: 'Lietotnes',
  contextPersonsInfoLabel: 'Pacients',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits([
  'nav-toggle',
  'contextPersonChanged',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-alternative-profile',
  'log-out',
  'navClick',
  'update:theme',
  'update:hasAnimations',
  'update:hasDeviceFonts',
  'update:isTouchSensitive',
  'alerts-click',
  'alert-item-click',
  'update:selected-language',
  'language-changed',
  'help-click',
  'update:customButtonOpened',
  'customButtonClick',
  'update:selectedMegaMenuItem',
]);

const windowSize = useWindowSize();

const selectedMegaMenuItemModel = computed({
  get() {
    return props.selectedMegaMenuItem;
  },
  set(value) {
    emits('update:selectedMegaMenuItem', value);
  },
});
const navItemsPrimary = computed(() =>
  props.navItems.filter((item) => !item.type || item.type === 'primary')
);

const navItemsSecondary = computed(() =>
  props.navItems.filter((item) => item.type === 'secondary')
);

const navItemsUserMenu = computed(() =>
  props.navItems?.filter((item) => item.type === 'user-menu')
);

function helpClicked() {
  emits('help-click');
}

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

const touchModeModel = computed({
  get() {
    return props.isTouchSensitive;
  },
  set(value) {
    emits('update:isTouchSensitive', value);
  },
});

const themeMenu = ref();

function triggerThemeMenu(e) {
  themeMenu.value.preventClose(e);
}

const themeIcon = ref('theme');

const themeIcons = {
  auto: 'theme-auto',
  light: 'theme-light',
  dark: 'theme-dark',
  contrast: 'theme-contrast',
};

const themeNames = computed(() => ({
  auto: displayTexts.value.themeAuto,
  light: displayTexts.value.themeLight,
  dark: displayTexts.value.themeDark,
  contrast: displayTexts.value.themeContrast,
}));

function themeChange(theme) {
  themeIcon.value = themeIcons[theme];
  setTimeout(() => {
    themeIcon.value = 'theme';
  }, 1000);
  emits('update:theme', theme);
}

function alertsClicked() {
  emits('alerts-click');
}

function alertItemClicked(alert) {
  if (alert.clickable) {
    setTimeout(() => {
      emits('alert-item-click', alert);
    }, 50);
  }
}

const selectedLanguageModel = computed({
  get() {
    if (!props.selectedLanguage) {
      return props.languages[0];
    }
    return props.selectedLanguage;
  },
  set(value) {
    emits('update:selected-language', value);
  },
});

function languageChange(locale) {
  selectedLanguageModel.value = locale;
}

const iconMap = {
  success: 'notification-success',
  warning: 'notification-warning',
  error: 'notification-error',
  info: 'notification-info',
};

function pickIcon(level) {
  return iconMap[level] || iconMap.info;
}

const fullName = computed(() => {
  if (props.userInfo && props.userInfo.firstName && props.userInfo.lastName) {
    return `${props.userInfo.firstName} ${props.userInfo.lastName}`.toUpperCase();
  }
  return '';
});
const selectedAlternativeProfileModel = computed({
  get() {
    if (!props.selectedAlternativeProfile && props.alternativeProfilesInfo) {
      return props.alternativeProfilesInfo[0];
    }
    return props.selectedAlternativeProfile;
  },
  set(value) {
    const res = { id: value, name: value };
    emits('update:selected-alternative-profile', res);
  },
});

const dropDownModelAlternatives = ref(selectedAlternativeProfileModel.value?.id);
watch(dropDownModelAlternatives, (newValue) => {
  selectedAlternativeProfileModel.value = newValue;
});
watch(
  () => props.selectedAlternativeProfile,
  (newValue) => {
    if (newValue !== props.selectedAlternativeProfile) emits('alternativeProfileChanged', newValue);
    if (dropDownModelAlternatives.value !== newValue)
      dropDownModelAlternatives.value = newValue?.name;
  }
);

function logOut() {
  emits('log-out');
}

function navClick(id) {
  emits('navClick', id);
  emits('nav-toggle', true);
}

function toggleNavBar(event) {
  if (
    !props.navBarSwitch &&
    windowSize.width.value < 1800 &&
    windowSize.width.value > 1000 &&
    event?.target?.parentNode?.parentNode?.id !== 'lx_nav-toggle' &&
    event?.target?.parentNode?.id !== 'lx_nav-toggle' &&
    event?.target?.id !== 'lx_nav-toggle' &&
    event?.target?.className !== 'lx-button-label'
  )
    emits('nav-toggle', true);
}
const dropDownMenu = ref(null);
function triggerUserMenu() {
  if (dropDownMenu.value) {
    dropDownMenu.value.openMenu();
  }
}

const badgeLevelMap = {
  success: 'good',
  warning: 'warning',
  error: 'important',
  info: 'info',
};

function pickBadgeLevel(level) {
  return badgeLevelMap[level] || badgeLevelMap.info;
}

const alertLevelToBadgeType = computed(() => {
  if (!props.alertLevel) {
    const tmp = {};
    tmp.value = props.alerts?.find((alert) => alert?.level === 'error');
    if (tmp.value) {
      return 'important';
    }
    tmp.value = props.alerts?.find((alert) => alert?.level === 'warning');
    if (tmp.value) {
      return 'warning';
    }
    tmp.value = props.alerts?.find((alert) => alert?.level === 'success');
    if (tmp.value) {
      return 'good';
    }
    tmp.value = props.alerts?.find((alert) => alert?.level === 'info');
    if (tmp.value) {
      return 'info';
    }
  }
  return pickBadgeLevel(props.alertLevel);
});

const alertsCount = computed(() => {
  if (!props.alertCount || props.alertCount === null) {
    return props.alerts?.length ? String(props.alerts.length) : '';
  }
  return String(props.alertCount);
});

watch(
  () => props.selectedLanguage,
  (newValue) => {
    emits('language-changed', newValue);
  }
);

const customButton = ref();

const customButtonOpenedModal = computed({
  get() {
    return props.customButtonOpened;
  },
  set(value) {
    emits('update:customButtonOpened', value);
  },
});

watch(
  () => props.customButtonOpened,
  (newValue, oldValue) => {
    if (customButton.value && newValue !== oldValue) {
      customButton.value.menuOpen = newValue;
    }
  },
  { immediate: true }
);

watch(
  () => customButton.value?.menuOpen,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      customButtonOpenedModal.value = newValue;
    }
  }
);

function megaMenuItemClick(id) {
  emits('update:selectedMegaMenuItem', id);
}

const megaMenyPrimaryItems = computed(() =>
  props.megaMenuItems.filter((item) => item.kind === 'primary')
);

const isSelectedInNavItems = computed(() => {
  const navItemsNames = navItemsPrimary.value.map((item) => item.to?.name);
  return Object.keys(props.selectedNavItems).some((key) => navItemsNames.includes(key));
});

const themeDisplayItems = computed(() => {
  const res = [];
  const themes = props.availableThemes?.map((item) => ({
    id: item,
    icon: themeIcons[item],
    name: themeNames.value[item],
    group: 'theme',
    active: item === props.theme,
  }));
  if (themes && themes.length > 0) themes.forEach((x) => res.push(x));

  res.push({
    id: 'animations',
    kind: 'toggle',
    name: displayTexts.value.animations,
    texts: {
      valueYes: displayTexts.value.reduceMotionOn,
      valueNo: displayTexts.value.reduceMotionOff,
    },
    group: 'animations-touch',
    value: animationsModel.value,
    size: props.isTouchSensitive ? 'm' : 's',
  });
  res.push({
    id: 'touchMode',
    kind: 'toggle',
    name: displayTexts.value.touchMode,
    texts: {
      valueYes: displayTexts.value.touchModeOn,
      valueNo: displayTexts.value.touchModeOff,
    },
    group: 'animations-touch',
    value: touchModeModel.value,
    size: props.isTouchSensitive ? 'm' : 's',
  });
  res.push({
    id: 'fonts',
    kind: 'toggle',
    name: displayTexts.value.fonts,
    texts: {
      valueYes: displayTexts.value.systemFontsOn,
      valueNo: displayTexts.value.systemFontsOff,
    },
    group: 'fonts',
    value: deviceFontsModel.value,
    size: props.isTouchSensitive ? 'm' : 's',
  });
  return res;
});

function themeDropdownClicked(id, value) {
  if (id === 'animations') {
    animationsModel.value = value;
  } else if (id === 'touchMode') {
    touchModeModel.value = value;
  } else if (id === 'fonts') {
    deviceFontsModel.value = value;
  } else {
    themeChange(id);
  }
}
</script>
<template>
  <div
    class="lx-nav-panel digives-lite-nav-panel"
    :class="{ shown: !navBarSwitch }"
    v-click-away="toggleNavBar"
    tabindex="-1"
  >
    <ul class="lx-nav-group" v-if="windowSize.width.value > 1000 && hasMegaMenu">
      <li
        v-for="item in megaMenyPrimaryItems"
        :key="item.id"
        class="lx-mega-menu-item"
        :class="[
          {
            'lx-selected': !isSelectedInNavItems && selectedMegaMenuItemModel === item.id,
          },
        ]"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton :label="item.name" :tabindex="5" @click="megaMenuItemClick(item?.id)" />
        <ul class="nested-nav" v-if="selectedMegaMenuItemModel === item.id">
          <li
            v-for="item in navItemsPrimary"
            :key="item.label"
            :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
          >
            <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
            <LxButton
              :label="item.label"
              :href="item.to"
              :tabindex="5"
              @click="navClick(item?.id)"
            />
          </li>
        </ul>
      </li>
    </ul>
    <ul class="lx-nav-group" v-if="windowSize.width.value > 1000 && !hasMegaMenu">
      <li
        v-for="item in navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton :label="item.label" :href="item.to" :tabindex="5" @click="navClick(item?.id)" />
      </li>
    </ul>
    <ul class="lx-nav-group" v-if="windowSize.width.value > 1000">
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton :label="item.label" :href="item.to" :tabindex="5" @click="navClick(item?.id)" />
      </li>
    </ul>
  </div>
  <div class="lx-nav-panel lx-responsive digives-lite-nav-panel">
    <ul class="lx-nav-group">
      <div class="lx-user-menu" :class="[{ opened: dropDownMenu?.menuOpen }]" v-if="userInfo">
        <LxDropDownMenu :disabled="headerNavDisable" ref="dropDownMenu">
          <div
            class="lx-user-button"
            tabindex="0"
            @keydown.space.prevent="triggerUserMenu"
            @keydown.enter.prevent="triggerUserMenu"
          >
            <div class="lx-avatar" v-if="!hasAvatar">
              <LxIcon value="doctor" customClass="lx-icon" />
            </div>

            <div class="lx-user-info">
              <p class="lx-primary" :title="fullName">
                <span>{{ fullName }}</span>
              </p>
              <p class="lx-secondary" :title="userInfo?.description">
                <span>{{ userInfo?.description }}</span>
              </p>
              <p class="lx-secondary" :title="userInfo?.institution">
                <span>{{ userInfo.institution }}</span>
              </p>
            </div>
            <div class="lx-chevron">
              <LxIcon :value="dropDownMenu?.menuOpen ? 'chevron-up' : 'chevron-down'" />
            </div>
          </div>

          <template #panel>
            <div class="lx-region user-menu-context">
              <div class="lx-avatar-display lx-avatar-display-xl">
                <LxIcon value="doctor" />
              </div>
              <p class="lx-data">{{ fullName }}</p>
              <p class="lx-description" v-if="userInfo?.description">{{ userInfo?.description }}</p>
              <p class="lx-description" v-if="userInfo?.role">{{ userInfo?.role }}</p>
              <p class="lx-description" v-if="userInfo?.institution">{{ userInfo?.institution }}</p>
            </div>
            <ul class="lx-group" role="group">
              <li v-for="item in navItemsUserMenu" :key="item.label">
                <LxButton
                  kind="ghost"
                  :label="item.label"
                  :href="item.to"
                  :icon="item.icon"
                  :disabled="headerNavDisable"
                />
              </li>
            </ul>
          </template>
        </LxDropDownMenu>
      </div>
      <template v-if="props.hasMegaMenu">
        <li
          v-for="item in megaMenyPrimaryItems"
          :key="item.id"
          class="lx-mega-menu-item"
          :class="[
            {
              'lx-selected': !isSelectedInNavItems && selectedMegaMenuItemModel === item.id,
            },
          ]"
        >
          <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
          <LxButton :label="item.name" :tabindex="5" @click="megaMenuItemClick(item?.id)" />
          <ul class="nested-nav" v-if="selectedMegaMenuItemModel === item.id">
            <li
              v-for="item in navItemsPrimary"
              :key="item.label"
              :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
            >
              <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
              <LxButton
                :label="item.label"
                :href="item.to"
                :tabindex="5"
                @click="navClick(item?.id)"
              />
            </li>
          </ul>
        </li>
      </template>
      <template v-if="!props.hasMegaMenu">
        <li
          v-for="item in navItemsPrimary"
          :key="item.label"
          :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
        >
          <LxButton :label="item.label" :href="item.to" @click="navClick(item?.id)" />
        </li>
      </template>
    </ul>
    <ul class="lx-nav-group">
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" @click="navClick(item?.id)" />
      </li>
    </ul>
    <ul class="lx-nav-group">
      <li>
        <LxButton
          v-if="props.hasHelp"
          customClass="lx-header-button"
          kind="ghost"
          icon="help"
          :label="displayTexts.helpTitle"
          :disabled="headerNavDisable"
          :title="displayTexts.helpTitle"
          @click="helpClicked"
        />
      </li>
      <li
        v-if="hasCustomButton"
        class="lx-shell-custom-button"
        :class="[{ 'lx-shell-custom-button-opened': customButton?.menuOpen }]"
      >
        <LxButton
          v-if="customButtonKind === 'button'"
          id="lx-shell-custom-button"
          kind="ghost"
          :label="displayTexts.customButton"
          :icon="customButtonIcon"
          :badge="customButtonBadge"
          :badgeType="customButtonBadgeType"
          :badgeIcon="customButtonBadgeIcon"
          customClass="lx-header-button"
          @click="emits('customButtonClick')"
        />
        <LxDropDownMenu ref="customButton" v-else>
          <LxButton
            id="lx-shell-custom-button"
            kind="ghost"
            :label="displayTexts.customButton"
            :icon="customButtonIcon"
            :badge="customButtonBadge"
            :badgeType="customButtonBadgeType"
            :badgeIcon="customButtonBadgeIcon"
            customClass="lx-header-button"
          />
          <template #panel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template
            #clickSafePanel
            v-if="$slots.customButtonSafePanel && !$slots.customButtonPanel"
          >
            <slot name="customButtonSafePanel" />
          </template>
        </LxDropDownMenu>
      </li>
      <li v-if="hasLanguagePicker">
        <LxDropDownMenu>
          <LxButton
            customClass="lx-header-button"
            kind="ghost"
            icon="language"
            :label="displayTexts.languagesTitle"
          />

          <template v-slot:panel>
            <div class="lx-button-set">
              <LxButton
                v-for="item in languages"
                kind="ghost"
                :key="item?.languages"
                :active="selectedLanguageModel.id === item.id ? true : false"
                :label="item?.name"
                @click="languageChange(item)"
              />
            </div>
          </template>
        </LxDropDownMenu>
      </li>
      <li v-if="hasThemePicker" class="lx-theme-picker">
        <div class="lx-theme-menu">
          <LxDropDownMenu
            ref="themeMenu"
            :actionDefinitions="themeDisplayItems"
            @actionClick="themeDropdownClicked"
          >
            <div class="lx-toolbar">
              <LxButton
                customClass="lx-header-button"
                :label="displayTexts.themeTitle"
                kind="ghost"
                :icon="themeIcon"
              />
            </div>
          </LxDropDownMenu>
        </div>
      </li>
      <li class="lx-alert-menu" v-if="hasAlerts">
        <LxDropDownMenu v-if="alertsKind === 'menu' || alertsKind === 'combo'">
          <LxButton
            customClass="lx-header-button"
            kind="ghost"
            icon="notifications"
            :label="displayTexts.alertsTitle"
            :badge="alertsCount"
            :badge-type="alertLevelToBadgeType"
            :badge-title="displayTexts.alertsTitle"
            :disabled="headerNavDisable"
          />

          <template v-if="clickSafeAlerts" v-slot:clickSafePanel>
            <div class="lx-button-set" role="toolbar">
              <LxButton
                v-if="alertsKind === 'combo'"
                kind="ghost"
                :label="displayTexts.openAlerts"
                :disabled="headerNavDisable"
                icon="open"
                @click="alertsClicked"
              />
            </div>
            <ol role="group" aria-live="polite" v-if="alerts?.length > 0">
              <li
                :aria-labelledby="`alert-${item?.id}-name`"
                :aria-describedby="`alert-${item?.id}-desc`"
                class="lx-alert-button"
                :tabindex="item?.clickable ? 0 : null"
                :role="item?.clickable ? 'button' : null"
                :class="[
                  { 'lx-alert-success': item?.level === 'success' },
                  { 'lx-alert-info': item?.level === 'info' },
                  { 'lx-alert-warning': item?.level === 'warning' },
                  { 'lx-alert-error': item?.level === 'error' },
                  { 'lx-alert-clickable': item?.clickable },
                ]"
                v-for="item in alerts"
                :key="item?.id"
                @click="alertItemClicked(item)"
                @keyup.enter="alertItemClicked(item)"
                @keyup.space="alertItemClicked(item)"
              >
                <div class="lx-icon">
                  <LxIcon :value="pickIcon(item.level)" />
                </div>
                <div class="lx-alert-data">
                  <div class="lx-alert-header">
                    <p class="lx-data" :id="`alert-${item?.id}-name`">{{ item?.name }}</p>
                  </div>
                  <div class="lx-alert-description">
                    <p class="lx-description" :id="`alert-${item?.id}-desc`">
                      {{ item?.description }}
                    </p>
                  </div>
                </div>
              </li>
            </ol>
            <LxEmptyState v-else :label="displayTexts.noAlerts"></LxEmptyState>
          </template>

          <template v-else v-slot:panel>
            <div class="lx-button-set" role="toolbar">
              <LxButton
                v-if="alertsKind === 'combo'"
                kind="ghost"
                :label="displayTexts.openAlerts"
                :disabled="headerNavDisable"
                icon="open"
                @click="alertsClicked"
              />
            </div>
            <ol role="group" aria-live="polite" v-if="alerts?.length > 0">
              <li
                :aria-labelledby="`alert-${item?.id}-name`"
                :aria-describedby="`alert-${item?.id}-desc`"
                class="lx-alert-button"
                :tabindex="item?.clickable ? 0 : null"
                :role="item?.clickable ? 'button' : null"
                :class="[
                  { 'lx-alert-success': item?.level === 'success' },
                  { 'lx-alert-info': item?.level === 'info' },
                  { 'lx-alert-warning': item?.level === 'warning' },
                  { 'lx-alert-error': item?.level === 'error' },
                  { 'lx-alert-clickable': item?.clickable },
                ]"
                v-for="item in alerts"
                :key="item?.id"
                @click="alertItemClicked(item)"
                @keyup.enter="alertItemClicked(item)"
                @keyup.space="alertItemClicked(item)"
              >
                <div class="lx-icon">
                  <LxIcon :value="pickIcon(item.level)" />
                </div>
                <div class="lx-alert-data">
                  <div class="lx-alert-header">
                    <p class="lx-data" :id="`alert-${item?.id}-name`">{{ item?.name }}</p>
                  </div>
                  <div class="lx-alert-description">
                    <p class="lx-description" :id="`alert-${item?.id}-desc`">
                      {{ item?.description }}
                    </p>
                  </div>
                </div>
              </li>
            </ol>
            <LxEmptyState v-else :label="displayTexts.noAlerts"></LxEmptyState>
          </template>
        </LxDropDownMenu>

        <LxButton
          v-if="alertsKind === 'button'"
          customClass="lx-header-button"
          variant="icon-only"
          kind="ghost"
          icon="notifications"
          :disabled="headerNavDisable"
          :label="displayTexts.alertsTitle"
          :badge="alertsCount"
          :badgeType="alertLevelToBadgeType"
          :badge-title="displayTexts.alertsTitle"
          @click="alertsClicked"
        />
      </li>
      <li>
        <LxButton
          v-if="userInfo"
          kind="ghost"
          icon="logout"
          :label="displayTexts.logOut"
          :destructive="true"
          @click="logOut"
        />
      </li>
    </ul>
  </div>
</template>
