<script setup>
import { computed, ref, watch, provide } from 'vue';
import { useWindowSize, onClickOutside } from '@vueuse/core';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxInfoBox from '@/components/InfoBox.vue';
import LxIcon from '@/components/Icon.vue';
import LxBadge from '@/components/Badge.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxRow from '@/components/forms/Row.vue';
import {
  getDisplayTexts,
  sessionEndsInText,
  secondsToMinutesAndSeconds,
} from '@/utils/generalUtils';

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
  hasReducedTransparency: { type: Boolean, default: false },
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

  hasSpotlight: { type: Boolean, default: false },
  spotlightHasBadge: { type: Boolean, default: false },

  secondsToLive: { type: Number, default: null },
  showIdleBadge: { type: Boolean, default: false },

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
  contextPersonsInfoTitle: 'Konteksta persona',
  badgeTypes: {
    default: 'informatīvs paziņojums',
    info: 'informatīvs paziņojums',
    warning: 'brīdinājums',
    good: 'sekmīgs paziņojums',
    important: 'svarīgs paziņojums',
  },
  idleBadge: {
    minutesSingular: 'minūtes',
    minutes11: 'minūtes',
    minutesPluralEndsWith1: 'minūtes',
    minutesPlural: 'minūtēm',
    secondsSingular: 'sekundes',
    seconds11: 'sekundēm',
    secondsPluralEndsWith1: 'sekundes',
    secondsPlural: 'sekundēm',
    sessionEndingIn: 'Sesija beigsies pēc',
    and: 'un',
    timeCountdown: 'Laika atskaite',
  },
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
  'update:hasReducedTransparency',
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
  'toggleSpotlight',
]);

const windowSize = useWindowSize();

const insideNavBar = ref(true);

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

const themeMenu = ref();

const themeIcon = ref('theme-alternative');

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
    themeIcon.value = 'theme-alternative';
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
    windowSize.width.value >= 1000 &&
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
const labelText = computed(() => displayTexts.value.alertsTitle);

const ariaLabel = computed(() => {
  const baseLabel = labelText.value;
  let label = baseLabel;

  if (alertsCount.value) {
    const badgeTypeText =
      displayTexts.value.badgeTypes[alertLevelToBadgeType.value] ||
      displayTexts.value.badgeTypes.default;

    if (alertsCount.value && alertsCount.value.trim() !== '') {
      if (alertLevelToBadgeType.value === 'default') {
        label = `${label} (${alertsCount.value})`;
      } else {
        label = `${label} (${badgeTypeText}: ${alertsCount.value})`;
      }
    } else {
      label = `${label} (${badgeTypeText})`;
    }
  }

  return label;
});
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

const megaMenuAllowedItems = computed(() =>
  props.megaMenuItems
    .filter((item) => item.kind === 'primary' || item.kind === 'special')
    .sort((a, b) => {
      if (a.kind === 'special' && b.kind !== 'special') {
        return 1;
      }
      if (b.kind === 'special' && a.kind !== 'special') {
        return -1;
      }
      return 0;
    })
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
const navPanel = ref();

const isResponsiveView = computed(() => windowSize.width.value <= 1000);

function toggleSpotlight() {
  emits('nav-toggle', true);
  emits('toggleSpotlight');
}

const timeoutIn = computed(() => {
  const { minutes, seconds } = secondsToMinutesAndSeconds(props.secondsToLive);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const sessionTimeoutLabel = computed(() =>
  sessionEndsInText(props.secondsToLive, displayTexts.value?.idleBadge)
);

const hasSessionTimeoutBadge = computed(
  () => props.showIdleBadge && props.secondsToLive && props.secondsToLive < 3600
);

const userInfoWrapper = ref();

watch(
  () => dropDownMenu.value?.menuOpen,
  (newValue) => {
    if (newValue) userInfoWrapper.value?.handleClose();
  }
);

provide('insideNavBar', insideNavBar);
onClickOutside(navPanel, toggleNavBar);
</script>
<template>
  <div
    ref="navPanel"
    class="lx-nav-panel digives-lite-nav-panel"
    :class="{ shown: !navBarSwitch }"
    tabindex="-1"
  >
    <ul class="lx-nav-group" v-if="windowSize.width.value >= 1000 && hasMegaMenu">
      <li
        v-for="item in megaMenuAllowedItems.filter((i) => i.kind === 'primary')"
        :key="item.id"
        class="lx-mega-menu-item"
        :class="[
          {
            'lx-selected': !isSelectedInNavItems && selectedMegaMenuItemModel === item.id,
          },
        ]"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton
          :label="item.name"
          :title="item?.description"
          :tabindex="5"
          @click="megaMenuItemClick(item?.id)"
        />
        <ul class="nested-nav" v-if="selectedMegaMenuItemModel === item.id">
          <li
            v-for="item in navItemsPrimary"
            :key="item.label"
            :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
          >
            <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
            <LxButton
              :label="item.label"
              :title="item?.description"
              :href="item.to"
              :tabindex="5"
              @click="navClick(item?.id)"
            />
          </li>
        </ul>
      </li>
      <div
        class="nav-item-separator"
        v-if="megaMenuAllowedItems.filter((i) => i.kind === 'special').length > 0"
      ></div>
      <li
        v-for="item in megaMenuAllowedItems.filter((i) => i.kind === 'special')"
        :key="item.id"
        class="lx-mega-menu-item lx-special"
        :class="[
          {
            'lx-selected': !isSelectedInNavItems && selectedMegaMenuItemModel === item.id,
          },
        ]"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton
          :label="item.name"
          :title="item?.description"
          :icon="item?.icon"
          :tabindex="5"
          @click="megaMenuItemClick(item?.id)"
        />
        <ul class="nested-nav" v-if="selectedMegaMenuItemModel === item.id">
          <li
            v-for="item in navItemsPrimary"
            :key="item.label"
            :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
          >
            <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
            <LxButton
              :label="item.label"
              :title="item?.description"
              :href="item.to"
              :tabindex="5"
              @click="navClick(item?.id)"
            />
          </li>
        </ul>
      </li>
    </ul>
    <ul class="lx-nav-group" v-if="windowSize.width.value >= 1000 && !hasMegaMenu">
      <li
        v-for="item in navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
        <LxButton :label="item.label" :href="item.to" :tabindex="5" @click="navClick(item?.id)" />
      </li>
    </ul>
    <ul class="lx-nav-group" v-if="windowSize.width.value >= 1000">
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
  <div class="lx-nav-panel lx-responsive digives-lite-nav-panel" v-if="isResponsiveView">
    <ul class="lx-nav-group">
      <div class="lx-user-menu" :class="[{ opened: dropDownMenu?.menuOpen }]" v-if="userInfo">
        <LxDropDownMenu :disabled="headerNavDisable" ref="dropDownMenu">
          <LxInfoWrapper ref="userInfoWrapper" :disabled="dropDownMenu?.menuOpen">
            <div
              class="lx-user-button"
              tabindex="-1"
              @keydown.space.prevent="triggerUserMenu"
              @keydown.enter.prevent="triggerUserMenu"
            >
              <div class="lx-avatar" v-if="!hasAvatar">
                <LxIcon value="doctor" customClass="lx-icon" />
              </div>

              <div class="lx-user-info">
                <div class="lx-primary">
                  <span>{{ fullName }}</span>
                </div>
                <div class="lx-secondary">
                  <span>{{ userInfo?.description }}</span>
                </div>
                <div class="lx-secondary">
                  <span>{{ userInfo.institution }}</span>
                </div>
              </div>
              <div class="lx-chevron">
                <LxIcon :value="dropDownMenu?.menuOpen ? 'chevron-up' : 'chevron-down'" />
              </div>
              <LxBadge
                v-if="hasSessionTimeoutBadge"
                :value="timeoutIn"
                :tooltip="sessionTimeoutLabel"
                class="lx-timeout-badge"
              />
            </div>
            <template #panel v-if="!dropDownMenu?.menuOpen">
              <LxRow :label="displayTexts.userMenuTitle">
                <span>{{ fullName }}</span>
                <span v-if="userInfo?.description">{{ userInfo?.description }}</span>

                <span v-if="userInfo?.role">{{ userInfo?.role }}</span>
                <span v-if="userInfo?.institution">
                  {{ userInfo?.institution }}
                </span>
              </LxRow>
              <LxRow :label="displayTexts.idleBadge.timeCountdown" v-if="hasSessionTimeoutBadge">
                <span>{{ sessionTimeoutLabel }}</span>
              </LxRow>
            </template>
          </LxInfoWrapper>

          <template #panel>
            <div class="user-menu-panel">
              <div
                class="lx-region user-menu-context"
                :class="[{ 'has-timeout': hasSessionTimeoutBadge }]"
              >
                <div class="lx-avatar-display lx-avatar-display-xl">
                  <LxIcon value="doctor" />
                </div>
                <div class="lx-data">{{ fullName }}</div>
                <div class="lx-description" v-if="userInfo?.description">
                  {{ userInfo?.description }}
                </div>
                <div class="lx-description" v-if="userInfo?.role">{{ userInfo?.role }}</div>
                <div class="lx-description" v-if="userInfo?.institution">
                  {{ userInfo?.institution }}
                </div>
              </div>

              <div class="session-timeout-wrapper" v-if="hasSessionTimeoutBadge">
                <LxInfoBox variant="warning" :label="sessionTimeoutLabel" />
              </div>
              <ul class="lx-group" role="group">
                <li v-for="item in navItemsUserMenu" :key="item.label">
                  <LxButton
                    kind="ghost"
                    :label="item.label"
                    :href="item.to"
                    :icon="item.icon"
                    :disabled="headerNavDisable"
                    @click="emits('navClick', item?.id)"
                  />
                </li>
              </ul>
            </div>
          </template>
        </LxDropDownMenu>
      </div>
      <template v-if="props.hasMegaMenu">
        <li
          v-for="item in megaMenuAllowedItems.filter((i) => i.kind === 'primary')"
          :key="item.id"
          class="lx-mega-menu-item"
          :class="[
            {
              'lx-selected': !isSelectedInNavItems && selectedMegaMenuItemModel === item.id,
            },
          ]"
        >
          <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
          <LxButton
            :label="item.name"
            :title="item?.description"
            :tabindex="5"
            @click="megaMenuItemClick(item?.id)"
          />
          <ul class="nested-nav" v-if="selectedMegaMenuItemModel === item.id">
            <li
              v-for="item in navItemsPrimary"
              :key="item.label"
              :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
            >
              <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
              <LxButton
                :label="item.label"
                :title="item?.description"
                :href="item.to"
                :tabindex="5"
                @click="navClick(item?.id)"
              />
            </li>
          </ul>
        </li>
        <div
          class="nav-item-separator"
          v-if="megaMenuAllowedItems.filter((i) => i.kind === 'special').length > 0"
        ></div>
        <li
          v-for="item in megaMenuAllowedItems.filter((i) => i.kind === 'special')"
          :key="item.id"
          class="lx-mega-menu-item lx-special"
          :class="[
            {
              'lx-selected': !isSelectedInNavItems && selectedMegaMenuItemModel === item.id,
            },
          ]"
        >
          <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
          <LxButton
            :label="item.name"
            :title="item?.description"
            :icon="item.icon"
            :tabindex="5"
            @click="megaMenuItemClick(item?.id)"
          />
          <ul class="nested-nav" v-if="selectedMegaMenuItemModel === item.id">
            <li
              v-for="item in navItemsPrimary"
              :key="item.label"
              :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
            >
              <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
              <LxButton
                :label="item.label"
                :title="item?.description"
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
      <li v-if="hasSpotlight">
        <LxButton
          customClass="lx-header-button"
          kind="ghost"
          icon="information"
          :label="displayTexts.spotlight.label"
          :disabled="headerNavDisable"
          :badge="spotlightHasBadge ? ' ' : null"
          @click="toggleSpotlight"
        />
      </li>
      <li class="lx-help-button" v-if="props.hasHelp">
        <LxButton
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
            tabindex="-1"
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
      <li v-if="hasLanguagePicker" class="lx-language-menu">
        <LxDropDownMenu>
          <LxButton
            customClass="lx-header-button"
            kind="ghost"
            icon="language"
            tabindex="-1"
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
                tabindex="-1"
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
            tabindex="-1"
            :label="displayTexts.alertsTitle"
            :badge="alertsCount"
            :badge-type="alertLevelToBadgeType"
            :badge-title="displayTexts.alertsTitle"
            :ariaLabel="ariaLabel"
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
            <ol
              class="lx-alert-menu-list"
              role="group"
              aria-live="polite"
              v-if="alerts?.length > 0"
            >
              <li
                :aria-labelledby="`alert-${item?.id}-name`"
                :aria-describedby="`alert-${item?.id}-desc`"
                v-for="item in alerts"
                :key="item?.id"
                @click="alertItemClicked(item)"
                @keyup.enter.prevent="alertItemClicked(item)"
                @keyup.space.prevent="alertItemClicked(item)"
              >
                <LxInfoBox
                  :variant="item?.level"
                  :label="item?.name"
                  :description="item?.description"
                  :id="item?.id"
                  :kind="item?.clickable ? 'clickable' : 'default'"
                />
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
            <ol
              class="lx-alert-menu-list"
              role="group"
              aria-live="polite"
              v-if="alerts?.length > 0"
            >
              <li
                :aria-labelledby="`alert-${item?.id}-name`"
                :aria-describedby="`alert-${item?.id}-desc`"
                v-for="item in alerts"
                :key="item?.id"
                @click="alertItemClicked(item)"
                @keyup.enter.prevent="alertItemClicked(item)"
                @keyup.space.prevent="alertItemClicked(item)"
              >
                <LxInfoBox
                  :variant="item?.level"
                  :label="item?.name"
                  :description="item?.description"
                  :id="item?.id"
                  :kind="item?.clickable ? 'clickable' : 'default'"
                />
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
          :ariaLabel="ariaLabel"
          @click="alertsClicked"
        />
      </li>
      <li class="lx-logout-button" v-if="userInfo">
        <LxButton
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
