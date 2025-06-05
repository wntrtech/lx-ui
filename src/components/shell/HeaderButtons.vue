<script setup>
import { computed, watch, ref } from 'vue';

import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxMegaMenu from '@/components/shell/MegaMenu.vue';
import LxToggle from '@/components/Toggle.vue';
import LxAvatar from '@/components/Avatar.vue';
import LxEmptyState from '@/components/EmptyState.vue';

import { shortenUserName, safeString } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  mode: { type: String, default: 'default' },
  userInfo: { type: Object, default: null }, // firstName, lastName, description, role, institution
  hasAvatar: { type: Boolean, default: false },
  alternativeProfilesInfo: { type: Array, default: null },
  contextPersonsInfo: { type: Array, default: () => [] },
  selectedContextPerson: { type: Object, default: null },
  navItems: { type: Array, default: null },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  hasThemePicker: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: true },
  hasDeviceFonts: { type: Boolean, default: false },
  hasAlerts: { type: Boolean, default: false },
  alertsKind: { type: String, default: 'menu' },
  clickSafeAlerts: { type: Boolean, default: false },
  alerts: { type: Array, default: () => [] },
  alertCount: { type: Number, default: null },
  alertLevel: { type: String, default: null },
  hasHelp: { type: Boolean, default: false },
  headerNavDisable: { type: Boolean, default: false },
  hasNavBar: { type: Boolean, default: false },

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
  reduceMotionOff: 'Nē',
  reduceMotionOn: 'Jā',
  systemFontsOff: 'Nē',
  systemFontsOn: 'Jā',
  showAllLabel: 'Vairāk',
  megaMenuTitle: 'Lietotnes',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits([
  'log-out',
  'language-changed',
  'alert-item-click',
  'alerts-click',
  'help-click',
  'megaMenuShowAllClick',
  'openAlternativeProfilesModal',
  'openContextPersonModal',
  'update:selected-context-person',
  'update:selected-language',
  'update:theme',
  'update:hasAnimations',
  'update:hasDeviceFonts',
  'update:selectedMegaMenuItem',
]);

const themeIcon = ref('theme');
const themeMenu = ref();

function openAlternativeProfilesModal() {
  emits('openAlternativeProfilesModal');
}

function openContextPersonModal() {
  emits('openContextPersonModal');
}

watch(
  () => props.selectedLanguage,
  (newValue) => {
    emits('language-changed', newValue);
  }
);

const selectedContextPersonModel = computed({
  get() {
    return props.selectedContextPerson;
  },
  set(value) {
    emits('update:selected-context-person', value);
  },
});

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

const selectedMegaMenuItemModel = computed({
  get() {
    return props.selectedMegaMenuItem;
  },
  set(value) {
    emits('update:selectedMegaMenuItem', value);
  },
});

const helpLabel = computed(() => {
  if (props.mode === 'cover') {
    return displayTexts.value.helpTitle;
  }
  return '';
});

function logOut() {
  emits('log-out');
}

function languageChange(locale) {
  selectedLanguageModel.value = locale;
}

function alertItemClicked(alert) {
  if (alert.clickable) {
    setTimeout(() => {
      emits('alert-item-click', alert);
    }, 50);
  }
}

function alertsClicked() {
  emits('alerts-click');
}

function helpClicked() {
  emits('help-click');
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

function themeChange(theme) {
  themeIcon.value = themeIcons[theme];
  setTimeout(() => {
    themeIcon.value = 'theme';
  }, 1000);
  emits('update:theme', theme);
}

const fullName = computed(() => {
  if (props.userInfo && props.userInfo.firstName && props.userInfo.lastName) {
    if (props.userInfo.firstName.length + props.userInfo.lastName.length > 20)
      return shortenUserName(props.userInfo.firstName, props.userInfo.lastName);
    return `${props.userInfo.firstName} ${props.userInfo.lastName}`;
  }
  return '';
});

const navItemsUserMenu = computed(() =>
  props.navItems?.filter((item) => item.type === 'user-menu')
);

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

const iconMap = {
  success: 'notification-success',
  warning: 'notification-warning',
  error: 'notification-error',
  info: 'notification-info',
};

function pickIcon(level) {
  return iconMap[level] || iconMap.info;
}

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

function triggerThemeMenu(e) {
  themeMenu.value.preventClose(e);
}

function triggerShowAllClick() {
  emits('megaMenuShowAllClick');
}

const dropDownMenu = ref(null);

function triggerUserMenu() {
  if (dropDownMenu.value) {
    dropDownMenu.value.openMenu();
  }
}
</script>

<template>
  <div class="lx-group" v-if="!hasNavBar">
    <div class="lx-help-button" v-if="hasHelp">
      <LxButton
        customClass="lx-header-button"
        kind="ghost"
        icon="help"
        :label="helpLabel || displayTexts.helpTitle"
        :variant="mode === 'cover' ? 'default' : 'icon-only'"
        :disabled="headerNavDisable"
        :title="displayTexts.helpTitle"
        @click="helpClicked"
      />
    </div>

    <div class="lx-theme-menu" v-if="hasThemePicker">
      <LxDropDownMenu ref="themeMenu">
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
        <template v-slot:panel>
          <div class="lx-button-set" role="group">
            <LxButton
              v-for="item in availableThemes"
              :key="item"
              :icon="themeIcons[item]"
              :label="themeNames[item]"
              :active="theme === item ? true : false"
              @click="themeChange(item)"
            />
          </div>
          <div class="lx-animations-controller">
            <p>{{ displayTexts.animations }}</p>
            <LxToggle
              v-model="animationsModel"
              :texts="{
                valueYes: displayTexts.reduceMotionOn,
                valueNo: displayTexts.reduceMotionOff,
              }"
              @click="triggerThemeMenu"
            ></LxToggle>
          </div>
          <div class="lx-fonts-controller">
            <p>{{ displayTexts.fonts }}</p>
            <LxToggle
              v-model="deviceFontsModel"
              :texts="{
                valueYes: displayTexts.systemFontsOn,
                valueNo: displayTexts.systemFontsOff,
              }"
              @click="triggerThemeMenu"
            ></LxToggle>
          </div>
        </template>
      </LxDropDownMenu>
    </div>

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

    <div class="lx-language-menu" v-if="hasLanguagePicker">
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

    <div class="lx-mega-menu" v-if="hasMegaMenu">
      <LxMegaMenu
        :items="megaMenuItems"
        :groupDefinitions="megaMenuGroupDefinitions"
        :hasShowAll="megaMenuHasShowAll"
        :texts="displayTexts"
        @mega-menu-show-all-click="triggerShowAllClick"
        v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
      />
    </div>

    <div class="lx-user-menu" v-if="userInfo">
      <LxDropDownMenu :disabled="headerNavDisable" ref="dropDownMenu">
        <div
          class="lx-user-button"
          tabindex="0"
          @keydown.space.prevent="triggerUserMenu"
          @keydown.enter.prevent="triggerUserMenu"
        >
          <div class="lx-avatar" v-if="!hasAvatar">
            <LxIcon
              :value="!selectedContextPersonModel ? 'user' : 'context-person'"
              customClass="lx-icon"
            />
          </div>

          <LxAvatar v-if="hasAvatar" :value="safeString(fullName)" />

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
        </div>

        <template #panel>
          <div class="lx-region user-menu-context">
            <LxAvatar size="xl" :value="safeString(fullName)" />
            <p class="lx-data">{{ fullName }}</p>
            <p class="lx-description" v-if="userInfo?.description">{{ userInfo?.description }}</p>
            <p class="lx-description" v-if="userInfo?.role">{{ userInfo?.role }}</p>
            <p class="lx-description" v-if="userInfo?.institution">{{ userInfo?.institution }}</p>
          </div>

          <LxButton
            v-if="alternativeProfilesInfo"
            kind="ghost"
            :label="displayTexts.alternativeProfilesButtonLabel"
            icon="switch"
            @click="openAlternativeProfilesModal"
          />

          <LxButton
            v-if="contextPersonsInfo"
            kind="ghost"
            :label="displayTexts.contextPersonsButtonLabel"
            icon="context-person"
            @click="openContextPersonModal"
          />

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
          <ul class="lx-group" role="group">
            <li>
              <LxButton
                kind="ghost"
                icon="logout"
                :label="displayTexts.logOut"
                :destructive="true"
                @click="logOut"
              />
            </li>
          </ul>
        </template>
      </LxDropDownMenu>
    </div>
  </div>

  <template v-if="hasNavBar">
    <ul class="header-items">
      <li v-if="hasLanguagePicker" class="lx-language-picker">
        <div class="lx-language-menu">
          <LxDropDownMenu>
            <div class="lx-toolbar">
              <LxButton
                customClass="lx-header-button"
                :label="displayTexts.languagesTitle"
                kind="ghost"
                icon="language"
              />
            </div>
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
      </li>
      <li v-if="hasThemePicker" class="lx-theme-picker">
        <div class="lx-theme-menu">
          <LxDropDownMenu>
            <div class="lx-toolbar">
              <LxButton
                customClass="lx-header-button"
                :label="displayTexts.themeTitle"
                kind="ghost"
                :icon="themeIcon"
              />
            </div>
            <template v-slot:panel>
              <div class="lx-button-set">
                <LxButton
                  v-for="item in availableThemes"
                  :key="item"
                  :icon="themeIcons[item]"
                  :label="themeNames[item]"
                  :active="theme === item ? true : false"
                  @click="themeChange(item)"
                />
              </div>
              <div class="lx-animations-controller">
                <p>{{ displayTexts.animations }}</p>
                <LxToggle
                  v-model="animationsModel"
                  :texts="{
                    valueYes: displayTexts.reduceMotionOn,
                    valueNo: displayTexts.reduceMotionOff,
                  }"
                  @click="triggerThemeMenu"
                />
              </div>
              <div class="lx-fonts-controller">
                <p>{{ displayTexts.fonts }}</p>
                <LxToggle
                  v-model="deviceFontsModel"
                  :texts="{
                    valueYes: displayTexts.systemFontsOn,
                    valueNo: displayTexts.systemFontsOff,
                  }"
                  @click="triggerThemeMenu"
                />
              </div>
            </template>
          </LxDropDownMenu>
        </div>
      </li>
    </ul>
  </template>
</template>
