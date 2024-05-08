<script setup>
import { computed, shallowRef, onMounted, watch, ref, nextTick } from 'vue';
import { useColorMode, usePreferredReducedMotion } from '@vueuse/core';

import useLx from '@/hooks/useLx';

import LxMainHeader from '@/components/shell/Header.vue';
import LxMainHeaderDigives from '@/components/shell/HeaderDigives.vue';
import LxPageHeader from '@/components/shell/PageHeader.vue';
import LxNavBar from '@/components/shell/NavBar.vue';
import LxNavBarDigives from '@/components/shell/NavBarDigives.vue';

import { lxDevUtils } from '@/utils';

import Notification from '@/components/Notification.vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxLoader from '@/components/Loader.vue';
import LxModal from '@/components/Modal.vue';
import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';
import LxAlertWidget from '@/components/AlertWidget.vue';

const themeMode = useColorMode({
  selector: '.lx',
  attribute: 'class',
  emitAuto: true,
  storageKey: `${useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'}-theme`,
  modes: {
    light: 'lx-theme-light',
    dark: 'lx-theme-dark',
    auto: 'lx-theme-auto',
    contrast: 'lx-theme-contrast',
    none: '',
  },
});

const { system } = themeMode;
const vCleanHtml = buildVueDompurifyHTMLDirective();

const emits = defineEmits([
  'goBack',
  'goHome',
  'logOut',
  'languageChanged',
  'alertItemClick',
  'alertsClick',
  'helpClick',
  'contextPersonChanged',
  'alternativeProfileChanged',
  'update:notifications',
  'update:selected-language',
  'update:selected-context-person',
  'update:selected-alternative-profile',
  'update:hasAnimations',
  'idleModalPrimary',
  'idleModalSecondary',
  'confirmModalClosed',
  'update:theme',
]);

const props = defineProps({
  mode: { type: String, default: 'default' },
  systemNameShort: { type: String, required: true },
  systemName: { type: String, required: true },
  systemSubheader: { type: String, default: null },
  systemNameFormatted: { type: String, default: null },
  navItems: { type: Array, default: null },
  navItemsSelected: { type: Object, default: null },
  hideNavBar: { type: Boolean, default: false },
  userInfo: { type: Object, default: null }, // firstName, lastName, description
  hasAvatar: { type: Boolean, default: false },
  alternativeProfilesInfo: { type: Array, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  contextPersonsInfo: { type: Array, default: null },
  selectedContextPerson: { type: Object, default: null },
  pageLabel: { type: String, default: null },
  pageDescription: { type: String, default: null },
  pageBackLabel: { type: String, default: null },
  pageIndexPath: {
    type: [Object, String],
    default: () => {
      'home';
    },
  },
  pageBackPath: { type: [Object, String], default: null },
  pageBackButtonVisible: { type: Boolean, default: true },
  pageHeaderVisible: { type: Boolean, default: true },
  pageBreadcrumbs: { type: Array, default: null },
  notifications: { type: Array, default: () => [] },

  hasThemePicker: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark', 'contrast'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: null },

  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },

  hasAlerts: { type: Boolean, default: false },
  alertsKind: { type: String, default: 'menu' },
  clickSafeAlerts: { type: Boolean, default: false },
  alerts: { type: Array, default: () => [] },
  alertCount: { type: Number, default: null },
  alertLevel: { type: String, default: null },

  hasHelp: { type: Boolean, default: false },

  systemIcon: { type: String, default: null },
  coverImage: { type: String, default: '/imgs/cover-full.jpg' },
  coverImageDark: { type: String, default: '/imgs/cover-full-dark.jpg' },
  coverLogo: { type: String, default: '/imgs/logo-mid.png' },
  hasCoverLogo: { type: Boolean, default: true },
  environment: { type: Object, default: () => {} },
  headerNavDisable: { type: Boolean, default: false },
  navigating: { type: Boolean, default: false },
  hideHeaderText: { type: Boolean, default: false },

  showIdleModal: { type: Boolean, default: false },
  secondsToLive: { type: Number, default: null },

  confirmDialogData: { type: Object, default: () => {} },
  confirmPrimaryButtonBusy: { type: Boolean, default: false },
  confirmSecondaryButtonBusy: { type: Boolean, default: false },
  confirmPrimaryButtonDestructive: { type: Boolean, default: false },
  confirmClosesOnPrimary: { type: Boolean, default: true },

  texts: {
    type: Object,
    default: () => ({
      defaultBack: 'Atpakaļ',
      logOut: 'Iziet',
      openAlerts: 'Atvērt sarakstu',
      helpTitle: 'Palīdzība',
      alertsTitle: 'Paziņojumi',
      languagesTitle: 'Valodu izvēle',
      contextPersonTitle: 'Saistīto personu dati',
      close: 'Aizvērt',
      contextPersonsLabel: 'Izvēlieties konteksta personu',
      alternativeProfilesLabel: 'Izvēlieties alternatīvu profilu',
      contextPersonsButtonLabel: 'Konteksta personas',
      alternativeProfilesButtonLabel: 'Alternatīvie profili',
      idleModalLabel: 'Tuvojas sesijas beigas',
      idleModalPrimaryLabel: 'Turpināt darbu',
      idleModalSecondaryLabel: 'Beigt darbu',
      descriptionMinutes: 'Līdz sesijas beigām ir palikušas {count} minūtes',
      descriptionMinutesSmall: 'un {count} sekundes',
      idleDescription: 'Līdz sesijas beigām ir palikušas {count} sekundes',
      themeTitle: 'Noformējuma izvēle',
      themeAuto: 'Automātiskais režīms',
      themeLight: 'Gaišais režīms',
      themeDark: 'Tumšais režīms',
      themeContrast: 'Kontrastainais režīms',
      animations: 'Samazināt kustības',
      confirmModalSecondaryDefaultLabel: 'Nē',
      confirmModalPrimaryDefaultLabel: 'Jā',
      previousAlertTitle: 'Iepriekšējais paziņojums',
      nextAlertTitle: 'Nākamais paziņojums',
    }),
  },
});

const notificationModel = computed({
  get: () => props.notifications,
  set: (value) => emits('update:notifications', value),
});

const selectedLanguageModel = computed({
  get() {
    if (
      !props.selectedLanguage ||
      !props.languages.find((item) => item.id === props.selectedLanguage.id)
    ) {
      return props.languages[0];
    }
    return props.selectedLanguage;
  },
  set(value) {
    if (!props.selectedLanguage) {
      emits('language-changed', value);
    }
    if (props.languages.find((item) => item.id === value.id)) {
      emits('update:selected-language', value);
    } else {
      lxDevUtils.log(
        'Language does not exist in the language array',
        useLx().getGlobals()?.environment,
        'info'
      );
    }
  },
});

const themeModel = computed({
  get() {
    return props.theme;
  },
  set(value) {
    if (props.hasThemePicker) {
      themeMode.value = value;
      emits('update:theme', value);
    }
  },
});

const defaultAnimations = ref(true);

const animationsModel = computed({
  get() {
    if (props.hasAnimations === null) {
      return defaultAnimations.value;
    }

    return props.hasAnimations;
  },
  set(value) {
    if (props.hasThemePicker) {
      emits('update:hasAnimations', value);
    }
    defaultAnimations.value = value;
  },
});

const animationsStorageKey = ref(
  `${useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'}-animations`
);

function animationModeChange(newValue, providedStorageKey) {
  const element = document.querySelector('.lx');

  const storageKey = providedStorageKey || animationsStorageKey.value;

  if (newValue) {
    if (element) {
      element.classList.add('lx-no-animations');
    }
  } else if (element) {
    element.classList.remove('lx-no-animations');
  }

  localStorage.setItem(storageKey, JSON.stringify(newValue));
}

watch(
  () => animationsModel.value,
  (newValue) => {
    animationModeChange(newValue);
  }
);

const selectedContextPersonModel = computed({
  get() {
    if (
      !props.contextPersonsInfo ||
      !props.selectedContextPerson ||
      !Object.keys(props.selectedContextPerson).length > 0
    ) {
      return null;
    }

    if (!props.contextPersonsInfo.find((item) => item.id === props.selectedContextPerson.id)) {
      return props.contextPersonsInfo[0];
    }
    return props.selectedContextPerson;
  },
  set(value) {
    if (!props.selectedContextPerson) {
      emits('context-person-changed', value);
    }
    if (!value || props.contextPersonsInfo.find((item) => item.id === value.id)) {
      emits('update:selected-context-person', value);
    } else {
      lxDevUtils.log('Context person does not exist', useLx().getGlobals()?.environment, 'info');
    }
  },
});
const selectedAlternativeProfileModel = computed({
  get() {
    if (!props.alternativeProfilesInfo) {
      return null;
    }
    if (
      !props.selectedAlternativeProfile ||
      !props.alternativeProfilesInfo.find((item) => item.id === props.selectedAlternativeProfile.id)
    ) {
      return props.alternativeProfilesInfo[0];
    }
    return props.selectedAlternativeProfile;
  },
  set(value) {
    if (!props.selectedAlternativeProfile) {
      emits('alternative-profile-changed', value);
    }
    if (props.alternativeProfilesInfo.find((item) => item.id === value.id)) {
      emits('update:selected-alternative-profile', value);
    } else {
      lxDevUtils.log(
        'Alternative Profiles does not exist',
        useLx().getGlobals()?.environment,
        'info'
      );
    }
  },
});
const pageTitle = computed(() => {
  if (props.pageLabel) {
    return props.pageLabel;
  }
  return document.title;
});

const idleModalRef = ref();
function openAlternativeProfilesModal() {
  idleModalRef.value.open();
}
const confirmModal = ref();
function openConfirmModal() {
  confirmModal.value.open();
}

watch(
  () => props.confirmDialogData?.$state.isOpen,
  (newValue) => {
    if (newValue === true) {
      openConfirmModal();
    } else {
      confirmModal.value.close();
    }
  }
);

watch(
  () => props.showIdleModal,
  (newValue) => {
    if (newValue === true) {
      openAlternativeProfilesModal();
    } else {
      idleModalRef.value.close();
    }
  }
);

const navBarSwitch = shallowRef(true);

function navToggle(value) {
  navBarSwitch.value = value;
}
function navToggleButton() {
  navBarSwitch.value = !navBarSwitch.value;
}
function goBack(route) {
  emits('goBack', route);
}
function goHome(route) {
  emits('goHome', route);
}
function logOut() {
  emits('logOut');
}
function languageChanged(locale) {
  emits('languageChanged', locale);
}
function contextPersonChanged(contextPerson) {
  emits('contextPersonChanged', contextPerson);
}
function alternativeProfileChanged(alternativeProfile) {
  emits('alternativeProfileChanged', alternativeProfile);
}
function alertItemClicked(alert) {
  emits('alertItemClick', alert);
}
function alertsClicked() {
  emits('alertsClick');
}
function helpClicked() {
  emits('helpClick');
}

function idleModalPrimaryClicked() {
  emits('idleModalPrimary');
}
function idleModalSecondaryClicked() {
  emits('idleModalSecondary');
}

function confirmModalClosed() {
  emits('confirmModalClosed');
}

const computedBackgrounds = computed(() => ({
  lightImage: props.coverImage,
  darkImage: props.coverImageDark,
}));

const shell = ref();

function defineVars() {
  if (shell.value) {
    shell.value.style.setProperty(
      '--lx-cover-image-light',
      props.coverImage ? `url(${props.coverImage})` : 'none'
    );
    shell.value.style.setProperty(
      '--lx-cover-image-dark',
      props.coverImageDark ? `url(${props.coverImageDark})` : 'none'
    );
    shell.value.style.setProperty('--lx-cover-image-contrast', 'none');
  }
}

watch(
  () => computedBackgrounds,
  () => {
    defineVars();
  }
);

watch(
  () => props.mode,
  (newValue) => {
    nextTick(() => {
      if (newValue === 'cover') defineVars();
    });
  }
);

onMounted(() => {
  if (!props.hasThemePicker) {
    themeMode.value = 'none';
  } else if (themeMode.value === 'none') {
    themeMode.value = 'auto';
  } else {
    themeModel.value = themeMode.value;
  }

  const storageKey = `${
    useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'
  }-animations`;

  if (JSON.parse(localStorage.getItem(storageKey)) === null) {
    if (usePreferredReducedMotion().value === 'no-preference') {
      defaultAnimations.value = false;
    } else {
      defaultAnimations.value = true;
    }
  } else if (props.hasAnimations === null) {
    animationsModel.value = JSON.parse(localStorage.getItem(storageKey));
  }
  animationModeChange(animationsModel.value, storageKey);

  defineVars();
});
</script>
<template>
  <transition name="shell-switch">
    <div ref="shell" v-if="mode === 'cover'" class="lx-layout lx-layout-cover">
      <header>
        <LxMainHeader
          :mode="mode"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :nav-items="navItems"
          :userInfo="userInfo"
          :hideNavBar="true"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :has-help="hasHelp"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :environment="environment"
          :headerNavDisable="headerNavDisable"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          @language-changed="languageChanged"
          @help-click="helpClicked"
          @log-out="logOut"
          @nav-toggle="navToggle"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          :texts="texts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon v-if="systemIcon" :value="systemIcon" icon-set="brand" />
        </LxMainHeader>
      </header>
      <main class="lx-main">
        <div class="lx-cover">
          <slot name="backdrop" />
          <div class="lx-content">
            <div class="lx-logo">
              <template v-if="hasCoverLogo">
                <img v-if="coverLogo" :src="coverLogo" alt="Logo" />
                <slot v-else name="logo" />
              </template>
              <template v-else>
                <LxIcon :value="systemIcon" icon-set="brand" />
              </template>
            </div>
            <div>
              <h1 v-if="systemNameFormatted" v-clean-html="systemNameFormatted" />
              <h1 v-else>{{ systemName }}</h1>
              <p class="lx-description">{{ systemSubheader }}</p>
            </div>
            <div class="cover-main-area">
              <slot name="coverArea" />
              <LxAlertWidget
                v-if="alerts?.length > 0"
                :alerts="alerts"
                :nextAlertTitle="texts.nextAlertTitle"
                :previousAlertTitle="texts.previousAlertTitle"
              ></LxAlertWidget>
            </div>
          </div>
        </div>
        <div class="lx-loader-screen" v-if="navigating">
          <div class="spinner">
            <LxLoader :loading="true" />
          </div>
        </div>
      </main>
      <footer>
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
    </div>
    <div v-if="mode === 'public'" class="lx-layout lx-layout-public">
      <header>
        <LxMainHeader
          :mode="mode"
          :userInfo="userInfo"
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitch"
          :hideNavBar="hideNavBar"
          :systemNameShort="systemNameShort"
          :systemSubheader="systemSubheader"
          :page-label="pageTitle"
          :home-path="pageIndexPath"
          :backLabel="pageBackLabel"
          :backPath="pageBackPath"
          :show-back-button="pageBackButtonVisible"
          :breadcrumbs="pageBreadcrumbs"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :system-icon="systemIcon"
          :has-alerts="hasAlerts"
          :alerts-kind="alertsKind"
          :clickSafeAlerts="clickSafeAlerts"
          :alerts="alerts"
          :alert-count="alertCount"
          :alert-level="alertLevel"
          :has-help="hasHelp"
          :environment="environment"
          :headerNavDisable="headerNavDisable"
          :has-avatar="hasAvatar"
          kind="public"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          @language-changed="languageChanged"
          @alert-item-click="alertItemClicked"
          @alerts-click="alertsClicked"
          @help-click="helpClicked"
          @go-home="goHome"
          @go-back="goBack"
          @log-out="logOut"
          @nav-toggle="navToggle"
          :texts="texts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon v-if="systemIcon" :value="systemIcon" icon-set="brand" />
        </LxMainHeader>
      </header>
      <main class="lx-main">
        <LxPageHeader
          v-if="pageHeaderVisible"
          :label="pageTitle"
          :description="pageDescription"
          :backLabel="pageBackLabel"
          :backPath="pageBackPath"
          :show-back-button="pageBackButtonVisible"
          :breadcrumbs="pageBreadcrumbs"
          :hide-header-text="hideHeaderText"
          @go-back="goBack"
        />
        <transition name="nav">
          <slot />
        </transition>
        <div class="lx-loader-screen" v-if="navigating">
          <div class="spinner">
            <LxLoader :loading="true" />
          </div>
        </div>
      </main>
      <footer>
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
    </div>
    <div
      v-else-if="mode === 'digives'"
      class="lx-layout lx-layout-default lx-layout-digives"
      :class="[{ 'lx-collapsed': navBarSwitch }, { 'lx-hide-nav-bar': hideNavBar }]"
    >
      <header>
        <LxMainHeaderDigives
          :userInfo="userInfo"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitch"
          :hide-nav-bar="hideNavBar"
          :systemNameShort="systemNameShort"
          :systemSubheader="systemSubheader"
          :system-name-formatted="systemNameFormatted"
          :page-label="pageTitle"
          :home-path="pageIndexPath"
          :backLabel="pageBackLabel"
          :backPath="pageBackPath"
          :show-back-button="pageBackButtonVisible"
          :breadcrumbs="pageBreadcrumbs"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :system-icon="systemIcon"
          :has-alerts="hasAlerts"
          :alerts-kind="alertsKind"
          :alerts="alerts"
          :alert-count="alertCount"
          :alert-level="alertLevel"
          :has-help="hasHelp"
          :environment="environment"
          kind="public"
          :headerNavDisable="headerNavDisable"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          @language-changed="languageChanged"
          @alert-item-click="alertItemClicked"
          @alerts-click="alertsClicked"
          @help-click="helpClicked"
          @go-home="goHome"
          @go-back="goBack"
          @log-out="logOut"
          @nav-toggle="navToggle"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          :texts="texts"
        />
      </header>
      <div class="small-nav-bar-button">
        <LxButton
          :icon="navBarSwitch ? 'menu' : 'close'"
          variant="icon-only"
          kind="ghost"
          @click="navToggleButton()"
        />
      </div>
      <nav aria-label="navigation panel">
        <LxNavBarDigives
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitch"
          @nav-toggle="navToggle"
          :selectedNavItems="navItemsSelected"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          :userInfo="userInfo"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
        />
      </nav>

      <main class="lx-main">
        <LxPageHeader
          v-if="pageHeaderVisible"
          :label="pageTitle"
          :description="pageDescription"
          :backLabel="pageBackLabel"
          :backPath="pageBackPath"
          :show-back-button="pageBackButtonVisible"
          :breadcrumbs="pageBreadcrumbs"
          :hide-header-text="hideHeaderText"
          @go-back="goBack"
        />
        <transition name="nav">
          <slot />
        </transition>
      </main>
      <footer>
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
    </div>
    <div v-else class="lx-layout lx-layout-default" :class="[{ 'lx-collapsed': navBarSwitch }]">
      <header>
        <LxMainHeader
          :mode="mode"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          :userInfo="userInfo"
          :has-avatar="hasAvatar"
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitch"
          :hideNavBar="hideNavBar"
          :systemNameShort="systemNameShort"
          :page-label="pageTitle"
          :home-path="pageIndexPath"
          :backLabel="pageBackLabel"
          :backPath="pageBackPath"
          :show-back-button="pageBackButtonVisible"
          :breadcrumbs="pageBreadcrumbs"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :system-icon="systemIcon"
          :has-alerts="hasAlerts"
          :alerts-kind="alertsKind"
          :clickSafeAlerts="clickSafeAlerts"
          :alerts="alerts"
          :alert-count="alertCount"
          :alert-level="alertLevel"
          :has-help="hasHelp"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :environment="environment"
          :headerNavDisable="headerNavDisable"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          @language-changed="languageChanged"
          @alert-item-click="alertItemClicked"
          @alerts-click="alertsClicked"
          @help-click="helpClicked"
          @go-home="goHome"
          @go-back="goBack"
          @log-out="logOut"
          @nav-toggle="navToggle"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          :texts="texts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon v-if="systemIcon" :value="systemIcon" icon-set="brand" />
        </LxMainHeader>
      </header>
      <nav aria-label="navigation panel" v-if="!hideNavBar">
        <LxNavBar
          :nav-items="navItems"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          v-model:theme="themeModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:hasAnimations="animationsModel"
          @nav-toggle="navToggle"
          :selectedNavItems="navItemsSelected"
        />
      </nav>

      <main class="lx-main">
        <LxPageHeader
          v-if="pageHeaderVisible"
          :label="pageTitle"
          :description="pageDescription"
          :backLabel="pageBackLabel"
          :backPath="pageBackPath"
          :show-back-button="pageBackButtonVisible"
          :breadcrumbs="pageBreadcrumbs"
          :hide-header-text="hideHeaderText"
          @go-back="goBack"
        />
        <transition name="nav">
          <slot />
        </transition>
        <div class="lx-loader-screen" v-if="navigating">
          <div class="spinner">
            <LxLoader :loading="true" />
          </div>
        </div>
      </main>
      <footer>
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
    </div>
  </transition>
  <LxModal
    ref="idleModalRef"
    :label="texts.idleModalLabel"
    :button-primary-label="texts.idleModalPrimaryLabel"
    :button-primary-visible="true"
    :button-secondary-label="texts.idleModalSecondaryLabel"
    :button-secondary-visible="true"
    :button-secondary-is-cancel="false"
    :disable-closing="true"
    @primary-action="idleModalPrimaryClicked()"
    @secondary-action="idleModalSecondaryClicked()"
  >
    <p v-if="secondsToLive > 60">
      {{ props.texts.descriptionMinutes?.replace('{count}', Math.floor(props.secondsToLive / 60)) }}
      {{
        secondsToLive % 60 > 0
          ? props.texts.descriptionMinutesSmall?.replace('{count}', props.secondsToLive % 60)
          : null
      }}
    </p>
    <p v-else>
      {{ props.texts.idleDescription?.replace('{count}', props.secondsToLive) }}
    </p>
  </LxModal>
  <LxModal
    ref="confirmModal"
    :label="confirmDialogData?.$state.confirmDialogState.title"
    :button-primary-visible="true"
    :button-primary-label="
      confirmDialogData?.$state.confirmDialogState.primaryLabel
        ? confirmDialogData.$state.confirmDialogState.primaryLabel
        : texts.confirmModalPrimaryDefaultLabel
    "
    :button-primary-busy="confirmPrimaryButtonBusy"
    :button-secondary-visible="true"
    :button-secondary-label="
      confirmDialogData?.$state.confirmDialogState.secondaryLabel
        ? confirmDialogData.$state.confirmDialogState.secondaryLabel
        : texts.confirmModalSecondaryDefaultLabel
    "
    :button-secondary-busy="confirmSecondaryButtonBusy"
    :button-secondary-is-cancel="false"
    :buttonPrimaryIsDestructive="confirmPrimaryButtonDestructive"
    :disableClosing="true"
    @primary-action="
      confirmClosesOnPrimary
        ? confirmDialogData?.confirm(confirmDialogData?.$state.confirmDialogState.primaryCallback)
        : confirmDialogData?.$state.confirmDialogState.primaryCallback()
    "
    @secondary-action="confirmDialogData?.$state.confirmDialogState.secondaryCallback"
    @closed="confirmModalClosed"
  >
    <p>{{ confirmDialogData?.$state.confirmDialogState.message }}</p>
  </LxModal>
  <Notification v-model="notificationModel" />
</template>
