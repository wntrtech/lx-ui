<script setup>
import { computed, watch, ref } from 'vue';

import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';
import { useWindowSize } from '@vueuse/core';

import LxButton from '@/components/Button.vue';
import LxRow from '@/components/forms/Row.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  systemNameShort: { type: String, default: null },
  systemName: { type: String, default: null },
  systemSubheader: { type: String, default: null },
  systemNameFormatted: { type: String, default: null },
  pageLabel: { type: String, default: null },
  userInfo: { type: Object, default: null }, // firstName, lastName, description, role, icon
  hasAvatar: { type: Boolean, default: false },
  alternativeProfilesInfo: { type: Array, default: null },
  contextPersonsInfo: { type: Array, default: null },
  kind: { type: String, default: 'default' }, // 'default', 'public'
  navItems: { type: Array, default: null },
  navBarSwitch: { type: Boolean, default: true },
  hideNavBar: { type: Boolean, default: false },
  headerNavDisable: { type: Boolean, default: false },
  headerNavReadOnly: { type: Boolean, default: false },
  showBackButton: { type: Boolean, default: false },
  backLabel: { type: String, required: false, default: null },
  backPath: { type: [Object, String], required: false, default: null },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  selectedContextPerson: { type: Object, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  systemIcon: { type: String, default: null },
  hasThemePicker: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark', 'contrast'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: true },
  hasReducedTransparency: { type: Boolean, default: false },
  hasDeviceFonts: { type: Boolean, default: false },
  isTouchSensitive: { type: Boolean, default: false },
  hasAlerts: { type: Boolean, default: false },
  alertsKind: { type: String, default: 'menu' },
  alerts: { type: Array, default: () => [] },
  clickSafeAlerts: { type: Boolean, default: false },
  alertCount: { type: Number, default: null },
  alertLevel: { type: String, default: null },
  hasHelp: { type: Boolean, default: false },
  environment: { type: Object, default: () => {} },
  hasCustomButton: { type: Boolean, default: false },
  customButtonIcon: { type: String, default: null },
  customButtonBadge: { type: String, default: null },
  customButtonBadgeType: { type: String, default: 'default' },
  customButtonBadgeIcon: { type: String, default: null },
  customButtonOpened: { type: Boolean, default: false },
  customButtonBlink: { type: Boolean, default: false },
  customButtonKind: { type: String, default: 'dropdown' }, // 'button' or 'dropdown'

  breadcrumbs: {
    type: Array,
    required: false,
    default: () => [], // { to: '{ name: 'aaa'}', label: 'Home' }],
  },
  homePath: {
    type: [Object, String],
    default: () => {
      'home';
    },
  },
  texts: { type: Object, default: () => {} },
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
  transparency: 'Samazināt caurspīdīgumu',
  fonts: 'Iekārtas fonti',
  touchMode: 'Skārienjūtīgs režīms',
  reduceMotionOff: 'Nē',
  reduceMotionOn: 'Jā',
  reduceTransparencyOff: 'Nē',
  reduceTransparencyOn: 'Jā',
  systemFontsOff: 'Nē',
  systemFontsOn: 'Jā',
  touchModeOff: 'Nē',
  touchModeOn: 'Jā',
  showAllLabel: 'Vairāk',
  megaMenuTitle: 'Lietotnes',
  contextPersonsInfoLabel: 'Pacients',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const vCleanHtml = buildVueDompurifyHTMLDirective();
const windowSize = useWindowSize();
const themeIcon = ref('theme-alternative');
const themeMenu = ref();

const navItemsUserMenu = computed(() =>
  props.navItems?.filter((item) => item.type === 'user-menu')
);

const emits = defineEmits([
  'nav-toggle',
  'contextPersonChanged',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-alternative-profile',
  'log-out',
  'update:nav-bar-switch',
  'navClick',
  'alerts-click',
  'alert-item-click',
  'update:theme',
  'update:hasAnimations',
  'update:hasReducedTransparency',
  'update:hasDeviceFonts',
  'update:isTouchSensitive',
  'update:selected-language',
  'go-home',
  'help-click',
  'language-changed',
  'update:customButtonOpened',
  'customButtonClick',
]);

function logOut() {
  emits('log-out');
}
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

const helpLabel = computed(() => displayTexts.value.helpTitle);

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

const touchModeModel = computed({
  get() {
    return props.isTouchSensitive;
  },
  set(value) {
    emits('update:isTouchSensitive', value);
  },
});

function themeChange(theme) {
  themeIcon.value = themeIcons[theme];
  setTimeout(() => {
    themeIcon.value = 'theme-alternative';
  }, 1000);
  themeModel.value = theme;
}

const fullName = computed(() => {
  if (props.userInfo && props.userInfo.firstName && props.userInfo.lastName) {
    return `${props.userInfo.firstName} ${props.userInfo.lastName}`.toUpperCase();
  }
  return '';
});

const navBarSwitchModel = computed({
  get() {
    return props.navBarSwitch;
  },
  set(value) {
    emits('update:nav-bar-switch', value);
  },
});

const goHome = () => {
  emits('go-home', props.homePath);
};

const navToggle = () => {
  if (navBarSwitchModel.value === null && windowSize.width.value < 1800)
    navBarSwitchModel.value = false;
  else navBarSwitchModel.value = !navBarSwitchModel.value;
};

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

const selectedContextPersonModel = computed({
  get() {
    return props.selectedContextPerson;
  },
  set(value) {
    emits('update:selected-context-person', value);
  },
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

function triggerThemeMenu(e) {
  themeMenu.value.preventClose(e);
}

function alertItemClicked(alert) {
  if (alert.clickable) {
    setTimeout(() => {
      emits('alert-item-click', alert);
    }, 50);
  }
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

function alertsClicked() {
  emits('alerts-click');
}
function helpClicked() {
  emits('help-click');
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

const alertsCount = computed(() => {
  if (!props.alertCount || props.alertCount === null) {
    return props.alerts?.length ? String(props.alerts.length) : '';
  }
  return String(props.alertCount);
});

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

const menuIcon = computed(() => {
  if (windowSize.width.value > 1000) {
    return 'menu';
  }

  if (navBarSwitchModel.value === null) {
    return 'menu';
  }
  if (navBarSwitchModel.value) {
    return 'menu';
  }
  return 'close';
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
    id: 'transparency',
    kind: 'toggle',
    name: displayTexts.value.transparency,
    texts: {
      valueYes: displayTexts.value.reduceTransparencyOn,
      valueNo: displayTexts.value.reduceTransparencyOff,
    },
    group: 'animations-touch',
    value: transparencyModel.value,
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
  } else if (id === 'transparency') {
    transparencyModel.value = value;
  } else {
    themeChange(id);
  }
}
</script>
<template>
  <div
    class="lx-header-digives-lite"
    :class="[{ 'with-context-person': !contextPersonsInfo || contextPersonsInfo.length === 0 }]"
  >
    <div class="lx-digives-header-row start-section">
      <div class="nav-menu-button" v-if="!hideNavBar">
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton
          id="lx_nav-toggle"
          :tabindex="4"
          :icon="menuIcon"
          :label="displayTexts.menu"
          variant="icon-only"
          kind="ghost"
          @click="navToggle"
        />
      </div>
      <div
        class="header-display-logo"
        tabindex="0"
        role="button"
        v-on:keyup.enter="goHome"
        v-on:keyup.space="goHome"
        @click="goHome"
      >
        <LxIcon
          value="digives"
          icon-set="brand"
          variant="gradient-brand-vertical"
          :title="systemNameShort"
          :desc="systemSubheader"
        />
      </div>
      <div class="header-system-title">
        <div
          class="header-system-name"
          v-if="systemNameFormatted"
          :title="systemNameFormatted"
          v-clean-html="systemNameFormatted"
        ></div>
        <div class="header-system-name" :title="systemNameShort" v-else>{{ systemNameShort }}</div>
        <div class="header-system-subheader" :title="systemSubheader">{{ systemSubheader }}</div>
      </div>
    </div>

    <div class="lx-digives-header-row end-section">
      <div class="shell-buttons help" v-if="hasHelp">
        <LxButton
          customClass="lx-header-button"
          kind="ghost"
          icon="help"
          :label="helpLabel || displayTexts.helpTitle"
          variant="icon-only"
          :disabled="headerNavDisable"
          :title="displayTexts.helpTitle"
          @click="helpClicked"
        />
      </div>
      <div class="shell-buttons custom-button" v-if="hasCustomButton">
        <div
          class="lx-shell-custom-button"
          :class="[{ 'lx-shell-custom-button-opened': customButton?.menuOpen }]"
        >
          <LxButton
            v-if="customButtonKind === 'button'"
            id="lx-shell-custom-button"
            kind="ghost"
            variant="icon-only"
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
              variant="icon-only"
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
        </div>
      </div>
      <div class="shell-buttons theme-menu" v-if="hasThemePicker">
        <LxDropDownMenu
          ref="themeMenu"
          :actionDefinitions="themeDisplayItems"
          @actionClick="themeDropdownClicked"
        >
          <div class="lx-toolbar">
            <LxButton
              customClass="lx-header-button"
              variant="icon-only"
              kind="ghost"
              :icon="themeIcon"
              :disabled="headerNavDisable"
              :label="displayTexts.themeTitle"
            />
          </div>
        </LxDropDownMenu>
      </div>
      <div class="shell-buttons language-menu" v-if="hasLanguagePicker">
        <LxDropDownMenu>
          <LxButton
            customClass="lx-header-button"
            variant="icon-only"
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
      </div>
      <div class="shell-buttons user-info">
        <div class="lx-alert-menu" v-if="hasAlerts">
          <LxDropDownMenu v-if="alertsKind === 'menu' || alertsKind === 'combo'">
            <LxButton
              customClass="lx-header-button"
              variant="icon-only"
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
        </div>
      </div>
      <div
        class="shell-buttons patient-info"
        :class="[{ 'without-context-person': !selectedContextPersonModel }]"
        v-if="userInfo"
      >
        <LxInfoWrapper :disabled="!selectedContextPersonModel">
          <LxIcon :value="selectedContextPersonModel ? 'patient-active' : 'patient-inactive'" />

          <template #panel>
            <LxRow :label="displayTexts.contextPersonsInfoLabel">
              <p class="lx-data">{{ selectedContextPersonModel?.name }}</p>
              <p class="lx-data">{{ selectedContextPersonModel?.description }}</p>
            </LxRow>
          </template>
        </LxInfoWrapper>
      </div>
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
                {{ fullName }}
              </p>
              <p class="lx-secondary" :title="userInfo?.description" v-if="userInfo?.description">
                {{ userInfo?.description }}
              </p>
              <p class="lx-secondary" :title="userInfo?.institution" v-if="userInfo?.institution">
                {{ userInfo.institution }}
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
      <div class="shell-buttons logout-button" v-if="userInfo">
        <LxButton
          kind="ghost"
          icon="logout"
          :label="displayTexts.logOut"
          variant="icon-only"
          :destructive="true"
          @click="logOut"
        />
      </div>
    </div>
  </div>
</template>
