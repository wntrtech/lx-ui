<script setup>
import { computed, ref, watch } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxModal from '@/components/Modal.vue';
import LxList from '@/components/list/List.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxInfoBox from '@/components/InfoBox.vue';
import LxMegaMenu from '@/components/shell/MegaMenu.vue';
import { shortenUserName } from '@/utils/stringUtils';
import LxAvatar from '@/components/Avatar.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  mode: { type: String, default: 'default' },
  userInfo: { type: Object, default: null }, // firstName, lastName, description, role, institution
  alternativeProfilesInfo: { type: Array, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  contextPersonsInfo: { type: Array, default: () => [] },
  selectedContextPerson: { type: Object, default: null },
  navItems: { type: Array, default: null },
  navBarSwitch: { type: Boolean, default: true },
  hideNavBar: { type: Boolean, default: false },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  hasThemePicker: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark', 'contrast'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: true },
  hasReducedTransparency: { type: Boolean, default: false },
  hasDeviceFonts: { type: Boolean, default: false },
  isTouchSensitive: { type: Boolean, default: true },
  hasAlerts: { type: Boolean, default: false },
  alertsKind: { type: String, default: 'menu' },
  clickSafeAlerts: { type: Boolean, default: false },
  alerts: { type: Array, default: () => [] },
  alertLevel: { type: String, default: null },
  hasHelp: { type: Boolean, default: false },
  headerNavDisable: { type: Boolean, default: false },
  hasMegaMenu: { type: Boolean, default: false },
  megaMenuItems: { type: Array, default: () => [] },
  megaMenuHasShowAll: { type: Boolean, default: false },
  megaMenuGroupDefinitions: { type: Array, default: null },
  selectedMegaMenuItem: { type: String, default: null },
  selectedNavItems: {
    type: Object,
    default: () => ({}),
  },
  texts: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const textsDefault = {
  defaultBack: 'Atpakaļ',
  logOut: 'Iziet',
  openAlerts: 'Atvērt sarakstu',
  noAlerts: 'Nav paziņojumu',
  openNavbar: 'Atvērt izvēlni',
  helpTitle: 'Palīdzība',
  alertsTitle: 'Paziņojumi',
  languagesTitle: 'Valodu izvēle',
  close: 'Aizvērt',
  contextPersonsLabel: 'Izvēlieties konteksta personu',
  alternativeProfilesLabel: 'Izvēlieties alternatīvu profilu',
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
  userTitle: 'Lietotājs',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits([
  'nav-toggle',
  'go-home',
  'log-out',
  'go-back',
  'language-changed',
  'alert-item-click',
  'alerts-click',
  'help-click',
  'megaMenuShowAllClick',
  'contextPersonChanged',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-language',
  'update:selected-alternative-profile',
  'update:theme',
  'update:hasAnimations',
  'update:hasReducedTransparency',
  'update:hasDeviceFonts',
  'update:isTouchSensitive',
  'update:selectedMegaMenuItem',
]);

const alternativeProfilesModal = ref();
const contextPersonModal = ref();

const navToggle = () => {
  emits('nav-toggle', !props.navBarSwitch);
};

function logOut() {
  emits('log-out');
}

function helpClicked() {
  emits('help-click');
}

function alertsClicked() {
  emits('alerts-click');
}

function alertItemClicked(alert) {
  emits('alert-item-click', alert);
}

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

const selectedLanguageModel = computed({
  get() {
    return props.selectedLanguage;
  },
  set(value) {
    emits('update:selected-language', value);
  },
});

function openAlternativeProfilesModal() {
  alternativeProfilesModal.value.open();
}

function openContextPersonModal() {
  contextPersonModal.value.open();
}

function languageChange(id) {
  const language = props.languages.find((lang) => lang?.id === id);
  emits('language-changed', language);
  selectedLanguageModel.value = language;
}

const selectedContextPersonModel = computed({
  get() {
    return props.selectedContextPerson;
  },
  set(value) {
    const res = {
      id: value,
      name: value,
    };
    emits('update:selected-context-person', res);
  },
});

const contextPersonComputed = computed(() => {
  if (props.contextPersonsInfo) {
    const defaultUser = {
      id: 'defaultUser',
      clickable: true,
      category: '',
      firstName: props.userInfo?.firstName,
      lastName: props.userInfo?.lastName,
      description: props.userInfo?.description,
      institution: props.userInfo?.institution,
      icon: 'user',
    };
    const temp = [
      defaultUser,
      ...props.contextPersonsInfo.map((item) => ({
        ...item,
        clickable: true,
        category: item?.id === selectedContextPersonModel.value?.id ? 'blue' : '',
        icon: item?.id === selectedContextPersonModel.value?.id ? 'selected' : '',
      })),
    ];
    return temp;
  }
  return [];
});

const selectedAlternativeProfileModel = computed({
  get() {
    if (!props.selectedAlternativeProfile && props.alternativeProfilesInfo) {
      return props.alternativeProfilesInfo[0];
    }
    return props.selectedAlternativeProfile;
  },
  set(value) {
    const res = {
      id: value,
      name: value,
    };

    emits('update:selected-alternative-profile', res);
  },
});

watch(selectedContextPersonModel, (newValue) => {
  emits('contextPersonChanged', newValue);
});

watch(selectedAlternativeProfileModel, (newValue) => {
  emits('alternativeProfileChanged', newValue);
});

function triggerShowAllClick() {
  emits('megaMenuShowAllClick');
}
const tempSelectedAlternativeProfileModel = ref(selectedAlternativeProfileModel.value);
const tempSelectedContextPersonModel = ref(selectedContextPersonModel.value);

function switchAlternativeProfile(_, rowId) {
  tempSelectedAlternativeProfileModel.value = props.alternativeProfilesInfo?.find(
    (item) => item.id === rowId
  );
  emits('update:selected-alternative-profile', tempSelectedAlternativeProfileModel.value);
  alternativeProfilesModal.value.close();
}
function switchContextPerson(_, rowId) {
  tempSelectedContextPersonModel.value = props.contextPersonsInfo?.find(
    (item) => item?.id?.toString() === rowId
  );
  emits('update:selected-context-person', tempSelectedContextPersonModel.value);
  contextPersonModal.value.close();
}

const alternativeProfilesComputed = computed(() => {
  if (!props.alternativeProfilesInfo) return '';
  return props.alternativeProfilesInfo.map((item) => ({
    ...item,
    clickable: true,
  }));
});

const selectedMegaMenuItemModel = computed({
  get() {
    return props.selectedMegaMenuItem;
  },
  set(value) {
    emits('update:selectedMegaMenuItem', value);
  },
});

const themeIcon = ref('theme');
const themeMenu = ref();

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
  themeModel.value = theme;
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

const fullName = computed(() => {
  if (props.userInfo && props.userInfo.firstName && props.userInfo.lastName) {
    if (props.userInfo.firstName.length + props.userInfo.lastName.length > 20)
      return shortenUserName(props.userInfo.firstName, props.userInfo.lastName);
    return `${props.userInfo.firstName} ${props.userInfo.lastName}`;
  }
  return '';
});

const contextPersonFullName = computed(() => {
  if (
    props.selectedContextPerson &&
    props.selectedContextPerson.firstName &&
    props.selectedContextPerson.lastName
  ) {
    if (
      props.selectedContextPerson.firstName.length + props.selectedContextPerson.lastName.length >
      20
    ) {
      return shortenUserName(
        props.selectedContextPerson.firstName,
        props.selectedContextPerson.lastName
      );
    }

    return `${props.selectedContextPerson.firstName} ${props.selectedContextPerson.value.lastName}`;
  }

  return '';
});

const navItemsPrimary = computed(() =>
  props.navItems?.filter((item) => !item.type || item.type === 'primary')
);

const navItemsSecondary = computed(() =>
  props.navItems?.filter((item) => item.type === 'secondary')
);

const navItemsUserMenu = computed(() =>
  props.navItems?.filter((item) => item.type === 'user-menu')
);

const userInfoMenu = ref(false);

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
  } else if (id === 'transparency') {
    transparencyModel.value = value;
  } else {
    themeChange(id);
  }
}

const languagesDisplayItems = computed(() =>
  props.languages?.map((item) => ({
    id: item?.id,
    name: item?.name,
    active: selectedLanguageModel.value?.id === item?.id,
  }))
);
</script>
<template>
  <div class="lx-header" :class="[{ 'lx-nav-panel-expanded': !navBarSwitch }]">
    <div class="lx-group">
      <LxButton
        v-if="!hideNavBar"
        customClass="nav-toggle"
        :icon="navBarSwitch ? 'menu' : 'close'"
        :label="navBarSwitch ? displayTexts.openNavbar : displayTexts.close"
        kind="ghost"
        :badge="hasAlerts && alerts && navBarSwitch ? alerts?.length?.toString() : ''"
        :badgeType="alertLevelToBadgeType"
        variant="icon-only"
        @click="navToggle"
      />
    </div>

    <nav aria-label="navigation panel">
      <div class="lx-nav-panel">
        <div class="lx-nav-header">
          <LxButton
            customClass="nav-toggle"
            :icon="navBarSwitch ? 'menu' : 'close'"
            :label="navBarSwitch ? displayTexts.openNavbar : displayTexts.close"
            kind="ghost"
            :badge="hasAlerts && alerts && navBarSwitch ? alerts?.length?.toString() : ''"
            :badgeType="alertLevelToBadgeType"
            variant="icon-only"
            @click="navToggle"
          />

          <div>
            <div v-if="hasHelp">
              <LxButton
                icon="help"
                :label="displayTexts.helpTitle"
                kind="ghost"
                variant="icon-only"
                @click="helpClicked"
              />
            </div>

            <div v-if="hasAlerts">
              <LxDropDownMenu
                v-if="alertsKind === 'menu' || alertsKind === 'combo'"
                customClass="lx-alert-menu"
              >
                <LxButton
                  customClass="lx-header-button"
                  icon="notifications"
                  :label="displayTexts.alertsTitle"
                  :badge="alerts ? alerts?.length?.toString() : ''"
                  :disabled="headerNavDisable"
                  :badgeType="alertLevelToBadgeType"
                  kind="ghost"
                  variant="icon-only"
                  tabindex="-1"
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
            </div>
            <div class="lx-mega-menu" v-if="hasMegaMenu">
              <LxMegaMenu
                :items="megaMenuItems"
                :groupDefinitions="megaMenuGroupDefinitions"
                :hasShowAll="megaMenuHasShowAll"
                :texts="displayTexts"
                @mega-menu-show-all-click="triggerShowAllClick"
                :show-label="false"
                v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
              />
            </div>
          </div>
        </div>
        <div class="lx-nav-panel-group">
          <ul class="lx-nav-group">
            <li
              v-for="item in navItemsPrimary"
              :key="item?.id"
              :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
              @click="navToggle"
              @keydown.enter="navToggle"
            >
              <LxButton :icon="item?.icon" :label="item?.label" :href="item?.to" />
            </li>
          </ul>
          <ul class="lx-nav-group">
            <li
              v-for="item in navItemsSecondary"
              :key="item?.id"
              :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
              @click="navToggle"
              @keydown.enter="navToggle"
            >
              <LxButton :icon="item?.icon" :label="item?.label" :href="item?.to" />
            </li>
            <li
              @click="() => (userInfoMenu = !userInfoMenu)"
              @keydown.space="() => (userInfoMenu = !userInfoMenu)"
              class="lx-user-button"
            >
              <div>
                <LxIcon value="user" />
                <div class="lx-user-info">
                  <p class="lx-primary">
                    <span v-if="!selectedContextPersonModel">{{ fullName }}</span>
                    <span v-else>{{ contextPersonFullName }}</span>
                  </p>
                  <p
                    class="lx-secondary"
                    :title="
                      selectedContextPersonModel
                        ? selectedContextPersonModel?.description
                        : userInfo?.description
                    "
                  >
                    <span v-if="!selectedContextPersonModel">{{ userInfo?.description }}</span>
                    <span v-else>{{ selectedContextPersonModel?.description }}</span>
                  </p>
                </div>
                <LxIcon value="collapse-right" />
              </div>
            </li>
          </ul>
        </div>
        <div class="lx-user-menu" :class="[{ 'lx-user-menu-expanded': userInfoMenu }]">
          <ul>
            <li class="lx-user-menu-item">
              <LxButton
                kind="ghost"
                :label="displayTexts.userTitle"
                icon="collapse-left"
                @click="() => (userInfoMenu = !userInfoMenu)"
              />
            </li>
          </ul>
          <div class="lx-user-menu-display" v-if="userInfo">
            <LxAvatar />
            <div>
              <p class="lx-primary">{{ fullName }}</p>
              <p class="lx-secondary">{{ userInfo?.description }}</p>
            </div>
          </div>
          <ul v-if="alternativeProfilesInfo || contextPersonsInfo">
            <li class="lx-user-menu-item">
              <LxButton
                v-if="alternativeProfilesInfo"
                kind="ghost"
                :label="displayTexts.alternativeProfilesButtonLabel"
                icon="switch"
                @click="openAlternativeProfilesModal"
              />
            </li>
            <li class="lx-user-menu-item">
              <LxButton
                v-if="contextPersonsInfo"
                kind="ghost"
                :label="displayTexts.contextPersonsButtonLabel"
                icon="context-person"
                @click="openContextPersonModal"
              />
            </li>
          </ul>
          <ul>
            <li v-for="item in navItemsUserMenu" :key="item.label" class="lx-user-menu-item">
              <LxButton
                kind="ghost"
                :label="item.label"
                :href="item.to"
                :icon="item.icon"
                :disabled="headerNavDisable"
              />
            </li>
          </ul>
          <ul v-if="hasLanguagePicker || hasThemePicker">
            <li v-if="hasLanguagePicker" class="lx-user-menu-item language-picker">
              <LxDropDownMenu
                :actionDefinitions="languagesDisplayItems"
                @actionClick="languageChange"
              >
                <LxButton
                  customClass="lx-header-button"
                  :label="displayTexts.languagesTitle"
                  kind="ghost"
                  icon="language"
                  tabindex="-1"
                />
              </LxDropDownMenu>
            </li>
            <li v-if="hasThemePicker" class="lx-user-menu-item theme-picker">
              <LxDropDownMenu
                ref="themeMenu"
                :actionDefinitions="themeDisplayItems"
                @actionClick="themeDropdownClicked"
              >
                <LxButton
                  customClass="lx-header-button"
                  :label="displayTexts.themeTitle"
                  kind="ghost"
                  :icon="themeIcon"
                  tabindex="-1"
                />
              </LxDropDownMenu>
            </li>
          </ul>
          <ul v-if="userInfo">
            <li class="lx-user-menu-item logout-button">
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
      </div>
    </nav>

    <div class="lx-group lx-right-group"></div>
  </div>

  <LxModal
    ref="alternativeProfilesModal"
    :label="displayTexts.alternativeProfilesLabel"
    size="m"
    :button-secondary-visible="true"
    :button-primary-visible="false"
    :button-secondary-label="displayTexts.close"
    :button-secondary-is-cancel="true"
  >
    <LxList
      id="listAlternativeProfiles"
      :items="alternativeProfilesComputed"
      :has-search="false"
      idAttribute="id"
      clickableAttribute="clickable"
      primaryAttribute="firstName"
      secondaryAttribute="lastName"
      categoryAttribute="category"
      icon="switch"
      listType="1"
      @action-click="switchAlternativeProfile"
    >
      <template #customItem="{ firstName, lastName, description, institution }">
        <div class="lx-region">
          <p class="lx-data">{{ firstName }} {{ lastName }}</p>
          <p class="lx-description">{{ description }}</p>
          <p class="lx-description">{{ institution }}</p>
        </div>
      </template>
    </LxList>
  </LxModal>

  <LxModal
    ref="contextPersonModal"
    :label="displayTexts.contextPersonsLabel"
    size="m"
    :button-secondary-visible="true"
    :button-primary-visible="false"
    :button-secondary-label="displayTexts.close"
    :button-secondary-is-cancel="true"
  >
    <LxList
      id="listContextPersons"
      :items="contextPersonComputed"
      :has-search="false"
      idAttribute="id"
      clickableAttribute="clickable"
      primaryAttribute="firstName"
      secondaryAttribute="lastName"
      icon="context-person"
      listType="1"
      @action-click="switchContextPerson"
    >
      <template #customItem="{ firstName, lastName, description, institution }">
        <div class="lx-region">
          <p class="lx-data">{{ firstName }} {{ lastName }}</p>
          <p class="lx-description">{{ description }}</p>
          <p class="lx-description">{{ institution }}</p>
        </div>
      </template>
    </LxList>
  </LxModal>
</template>
