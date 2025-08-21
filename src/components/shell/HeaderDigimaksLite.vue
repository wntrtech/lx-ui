<script setup>
import { computed, ref, watch } from 'vue';

import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxModal from '@/components/Modal.vue';
import LxList from '@/components/list/List.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxMegaMenu from '@/components/shell/MegaMenu.vue';
import LxAvatar from '@/components/Avatar.vue';
import LxForm from '@/components/forms/Form.vue';
import LxRow from '@/components/forms/Row.vue';
import LxValuePicker from '@/components/ValuePicker.vue';
import LxToggle from '@/components/Toggle.vue';

import { shortenUserName } from '@/utils/stringUtils';
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
  hideHeaderText: { type: Boolean, default: false },
  pageLabel: {
    type: String,
    default: '',
  },
  selectedNavItems: {
    type: Object,
    default: () => ({}),
  },
  pageBackLabel: { type: String, default: null },
  pageIndexPath: {
    type: [Object, String],
    default: () => {
      'home';
    },
  },
  pageBackPath: { type: [Object, String], default: null },
  pageBackButtonVisible: { type: Boolean, default: true },
  breadcrumbs: { type: Array, default: () => [] },

  hasCustomButton: { type: Boolean, default: false },
  customButtonIcon: { type: String, default: null },
  customButtonBadge: { type: String, default: null },
  customButtonBadgeType: { type: String, default: 'default' },
  customButtonBadgeIcon: { type: String, default: null },
  customButtonOpened: { type: Boolean, default: false },
  customButtonBlink: { type: Boolean, default: false },
  customButtonKind: { type: String, default: 'dropdown' }, // 'button' or 'dropdown'

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
  fonts: 'Iekārtas fonti',
  touchMode: 'Skārienjūtīgs režīms',
  transparency: 'Samazināt caurspīdīgumu',
  reduceMotionOff: 'Nē',
  reduceMotionOn: 'Jā',
  systemFontsOff: 'Nē',
  systemFontsOn: 'Jā',
  touchModeOff: 'Nē',
  touchModeOn: 'Jā',
  showAllLabel: 'Vairāk',
  megaMenuTitle: 'Lietotnes',
  userTitle: 'Lietotājs',
  settings: 'Iestatījumi',
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
  'customButtonClick',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-language',
  'update:selected-alternative-profile',
  'update:theme',
  'update:hasAnimations',
  'update:hasDeviceFonts',
  'update:isTouchSensitive',
  'update:selectedMegaMenuItem',
  'update:hasReducedTransparency',
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

const transparencyModel = computed({
  get() {
    return props.hasReducedTransparency;
  },
  set(value) {
    emits('update:hasReducedTransparency', value);
  },
});

function openAlternativeProfilesModal() {
  alternativeProfilesModal.value.open();
}

function openContextPersonModal() {
  contextPersonModal.value.open();
}

const languagePickerModel = computed({
  get() {
    return props.selectedLanguage?.id;
  },
  set(value) {
    const language = props.languages.find((lang) => lang?.id === value);
    emits('language-changed', language);
    emits('update:selected-language', value);
  },
});

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
  if (!props.alternativeProfilesInfo) return [];
  return props.alternativeProfilesInfo?.map((item) => ({
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

const navItemsPrimary = computed(() =>
  props.navItems?.filter((item) => !item.type || item.type === 'primary')
);

const navItemsSecondary = computed(() =>
  props.navItems?.filter((item) => item.type === 'secondary')
);

const themeItems = computed(() =>
  props.availableThemes?.map((item) => ({
    id: item,
    icon: themeIcons?.[item],
    name: themeNames.value?.[item],
  }))
);

const goBackPath = computed(() => {
  if (props.breadcrumbs.length === 1) {
    return props.breadcrumbs[0]?.to;
  }
  return props.pageBackPath || -1;
});

function goBack() {
  if (goBackPath.value) {
    emits('go-back', goBackPath.value);
    return;
  }
  emits('go-back', -1);
}

const settings = ref(false);

const customButton = ref();
</script>
<template>
  <div
    class="lx-header"
    :class="[
      { 'lx-nav-panel-expanded': !navBarSwitch },
      { 'lx-has-back-button': pageBackButtonVisible },
    ]"
  >
    <div class="lx-group lx-group-header">
      <div class="lx-left-group">
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
        <p v-if="hideHeaderText && pageLabel">{{ pageLabel }}</p>
      </div>
      <LxButton
        v-if="pageBackButtonVisible"
        customClass="lx-nav-back"
        icon="close"
        :label="pageBackLabel || displayTexts.defaultBack"
        variant="icon-only"
        kind="ghost"
        @click="goBack()"
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
                      v-for="item in alerts"
                      :key="item?.id"
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
                      v-for="item in alerts"
                      :key="item?.id"
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
                  <LxEmptyState v-else :label="displayTexts.noAlerts" />
                </template>
              </LxDropDownMenu>
            </div>
            <div class="lx-mega-menu" v-if="hasMegaMenu">
              <LxMegaMenu
                :show-label="false"
                :items="megaMenuItems"
                :groupDefinitions="megaMenuGroupDefinitions"
                :hasShowAll="megaMenuHasShowAll"
                :texts="displayTexts"
                v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
                @mega-menu-show-all-click="triggerShowAllClick"
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
            <li>
              <LxButton icon="settings" :label="displayTexts.settings" @click="settings = true" />
            </li>
          </ul>
        </div>
        <transition name="slide">
          <div class="lx-settings-menu" v-if="settings">
            <div class="lx-settings-header">
              <p>{{ displayTexts.settings }}</p>
              <LxButton
                icon="close"
                :label="displayTexts.close"
                variant="icon-only"
                kind="ghost"
                customClass="lx-nav-back"
                @click="settings = false"
              />
            </div>

            <div class="lx-user-menu-display" v-if="userInfo">
              <LxAvatar />
              <div>
                <div class="lx-primary">{{ fullName }}</div>
                <div class="lx-secondary">{{ userInfo?.description }}</div>
              </div>
            </div>
            <LxForm kind="stripped">
              <LxRow :label="displayTexts.languagesTitle">
                <LxValuePicker variant="tags" :items="languages" v-model="languagePickerModel" />
              </LxRow>
              <LxRow :label="displayTexts.themeTitle">
                <LxValuePicker variant="tags" :items="themeItems" v-model="themeModel" />
              </LxRow>
              <LxRow :label="displayTexts.animations">
                <LxToggle v-model="animationsModel" />
              </LxRow>
              <LxRow :label="displayTexts.touchMode"> <LxToggle v-model="touchModeModel" /> </LxRow>
              <LxRow :label="displayTexts.transparency">
                <LxToggle v-model="transparencyModel" />
              </LxRow>
              <LxRow :label="displayTexts.fonts"> <LxToggle v-model="deviceFontsModel" /> </LxRow>
            </LxForm>
            <div
              v-if="hasCustomButton"
              class="lx-shell-custom-button"
              :class="[{ 'lx-shell-custom-button-opened': customButton?.menuOpen }]"
            >
              <LxButton
                v-if="customButtonKind === 'button'"
                id="lx-shell-custom-button"
                kind="tertiary"
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
                  kind="tertiary"
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

            <div class="settings-button">
              <LxButton
                v-if="alternativeProfilesInfo"
                kind="tertiary"
                :label="displayTexts.alternativeProfilesButtonLabel"
                icon="switch"
                @click="openAlternativeProfilesModal"
              />
            </div>

            <div class="settings-button">
              <LxButton
                v-if="contextPersonsInfo"
                kind="tertiary"
                :label="displayTexts.contextPersonsButtonLabel"
                icon="context-person"
                @click="openContextPersonModal"
              />
            </div>

            <LxButton
              v-if="userInfo"
              kind="tertiary"
              icon="logout"
              :label="displayTexts.logOut"
              :destructive="true"
              @click="logOut"
            />
          </div>
        </transition>
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
