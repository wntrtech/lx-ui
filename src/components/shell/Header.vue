<script setup>
import { computed, ref, watch } from 'vue';
import { useScroll } from '@vueuse/core';

import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxHeaderButtons from '@/components/shell/HeaderButtons.vue';
import LxModal from '@/components/Modal.vue';
import LxList from '@/components/list/List.vue';

const props = defineProps({
  mode: { type: String, default: 'default' },
  systemNameShort: { type: String, default: null },
  systemNameFull: { type: String, default: null },
  systemSubheader: { type: String, default: null },
  pageLabel: { type: String, default: null },
  userInfo: { type: Object, default: null }, // firstName, lastName, description, role, institution
  hasAvatar: { type: Boolean, default: false },
  kind: { type: String, default: 'default' }, // 'default', 'public'
  alternativeProfilesInfo: { type: Array, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  contextPersonsInfo: { type: Array, default: () => [] },
  selectedContextPerson: { type: Object, default: null },
  navItems: { type: Array, default: null },
  navBarSwitch: { type: Boolean, default: true },
  hideNavBar: { type: Boolean, default: false },
  showBackButton: { type: Boolean, default: false },
  backLabel: { type: String, required: false, default: null },
  backPath: { type: [Object, String], required: false, default: null },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  systemIcon: { type: String, default: null },

  hasThemePicker: { type: Boolean, default: false },
  availableThemes: { type: Array, default: () => ['auto', 'light', 'dark'] },
  theme: { type: String, default: 'auto' },
  hasAnimations: { type: Boolean, default: true },
  hasAlerts: { type: Boolean, default: false },
  alertsKind: { type: String, default: 'menu' },
  clickSafeAlerts: { type: Boolean, default: false },
  alerts: { type: Array, default: () => [] },
  alertCount: { type: Number, default: null },
  alertLevel: { type: String, default: null },
  hasHelp: { type: Boolean, default: false },
  environment: { type: Object, default: () => {} },
  headerNavDisable: { type: Boolean, default: false },
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

  hasMegaMenu: { type: Boolean, default: false },
  megaMenuItems: { type: Array, default: () => [] },
  megaMenuHasShowAll: { type: Boolean, default: false },
  megaMenuGroupDefinitions: { type: Array, default: null },
  selectedMegaMenuItem: { type: String, default: null },

  texts: {
    type: Object,
    required: false,
    default: () => ({
      defaultBack: 'Atpakaļ',
      logOut: 'Iziet',
      openAlerts: 'Atvērt sarakstu',
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
      showAllLabel: 'Vairāk',
      megaMenuTitle: 'Lietotnes',
    }),
  },
});

const { y } = useScroll(window);

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
  'update:selectedMegaMenuItem',
]);

const alternativeProfilesModal = ref();
const contextPersonModal = ref();

const navToggle = () => {
  emits('nav-toggle', !props.navBarSwitch);
};

const goHome = () => {
  emits('go-home', props.homePath);
};

const goBackLabel = computed(() => {
  if (props.breadcrumbs.length === 1) {
    return props.breadcrumbs[0]?.label;
  }
  return props.backLabel ? props.backLabel : props.texts.defaultBack;
});

const goBackPath = computed(() => {
  if (props.breadcrumbs.length === 1) {
    return props.breadcrumbs[0]?.to;
  }
  return props.backPath ? props.backPath : -1;
});

function goBack() {
  if (goBackPath.value) {
    emits('go-back', goBackPath.value);
    return;
  }
  emits('go-back', -1);
}

function logOut() {
  emits('log-out');
}

function languageChanged(locale) {
  emits('language-changed', locale);
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

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

const envMap = {
  local: 'loc',
  development: 'dev',
  staging: 'test',
  production: 'prod',
};

const envLabel = computed(() => ({
  id: props.environment?.environment,
  name: envMap[props.environment?.environment?.toLowerCase()],
}));

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
</script>
<template>
  <div class="lx-header">
    <div class="lx-group">
      <LxButton
        v-if="!hideNavBar && kind !== 'public'"
        id="nav-toggle"
        :icon="navBarSwitch ? 'menu' : 'close'"
        :title="navBarSwitch ? texts.openNavbar : texts.close"
        kind="ghost"
        @click="navToggle"
      />
      <div
        class="lx-main-button"
        :class="[{ 'lx-nav-bar-hidden': !hideNavBar }]"
        tabindex="0"
        v-on:keyup.enter="goHome"
        v-on:keyup.space="goHome"
        @click="goHome"
      >
        <div v-if="!systemIcon" class="lx-logo">
          <slot name="logo"></slot>
        </div>
        <LxIcon
          customClass="lx-logo"
          v-if="systemIcon"
          :value="systemIcon"
          icon-set="brand"
          :title="systemNameShort"
          :desc="systemSubheader"
        />
        <div class="lx-project-name">
          <p class="lx-primary">{{ systemNameShort }}</p>
          <p class="lx-description">{{ systemSubheader }}</p>
        </div>
        <div
          class="lx-badge"
          v-if="envLabel.id !== 'production'"
          :title="envLabel.id"
          :class="[
            { 'lx-badge-loc': envLabel.id === 'local' },
            { 'lx-badge-dev': envLabel.id === 'development' },
            { 'lx-badge-test': envLabel.id === 'staging' },
            { 'lx-badge-prod': envLabel.id === 'production' },
          ]"
        >
          {{ envLabel.name }}
        </div>
      </div>
    </div>
    <div id="extra-menu" class="lx-group" v-if="kind === 'default'">
      <div class="lx-additional-nav-menu" :class="[{ 'lx-active': y > 140 }]">
        <LxButton
          icon="back"
          kind="ghost"
          v-if="showBackButton"
          :title="goBackLabel"
          :disabled="y <= 140"
          @click="goBack"
        />
        <div v-else></div>
        <div
          class="lx-additional-page-header"
          :tabindex="y <= 140 ? -1 : 0"
          v-on:keyup.enter="scrollUp"
          v-on:keyup.space="scrollUp"
          @click="scrollUp"
        >
          {{ pageLabel }}
        </div>
      </div>
    </div>
    <div v-else></div>

    <div class="lx-group lx-right-group" v-if="kind === 'public'">
      <LxHeaderButtons
        :mode="mode"
        :userInfo="userInfo"
        :nav-items="navItems"
        :has-language-picker="hasLanguagePicker"
        :languages="languages"
        :has-theme-picker="hasThemePicker"
        :available-themes="availableThemes"
        :has-alerts="hasAlerts"
        :alerts-kind="alertsKind"
        :clickSafeAlerts="clickSafeAlerts"
        :alerts="alerts"
        :alert-count="alertCount"
        :alert-level="alertLevel"
        :has-help="hasHelp"
        :headerNavDisable="headerNavDisable"
        :has-avatar="hasAvatar"
        :alternative-profiles-info="alternativeProfilesInfo"
        :context-persons-info="contextPersonsInfo"
        :hasMegaMenu="hasMegaMenu"
        :megaMenuItems="megaMenuItems"
        :megaMenuHasShowAll="megaMenuHasShowAll"
        :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
        v-model:selectedLanguage="selectedLanguageModel"
        v-model:theme="themeModel"
        v-model:hasAnimations="animationsModel"
        v-model:selectedContextPerson="selectedContextPersonModel"
        v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
        @mega-menu-show-all-click="triggerShowAllClick"
        @open-alternative-profiles-modal="openAlternativeProfilesModal"
        @open-context-person-modal="openContextPersonModal"
        @language-changed="languageChanged"
        @alert-item-click="alertItemClicked"
        @alerts-click="alertsClicked"
        @help-click="helpClicked"
        @log-out="logOut"
        :texts="texts"
      />
      <LxButton
        v-if="!hideNavBar"
        id="nav-toggle"
        :icon="navBarSwitch ? 'menu' : 'close'"
        :title="navBarSwitch ? texts.openNavbar : texts.close"
        kind="ghost"
        @click="navToggle"
      />
    </div>
    <LxHeaderButtons
      v-else
      :mode="mode"
      :userInfo="userInfo"
      :nav-items="navItems"
      :has-language-picker="hasLanguagePicker"
      :languages="languages"
      :has-theme-picker="hasThemePicker"
      :available-themes="availableThemes"
      :has-alerts="hasAlerts"
      :alerts-kind="alertsKind"
      :clickSafeAlerts="clickSafeAlerts"
      :alerts="alerts"
      :alert-count="alertCount"
      :alert-level="alertLevel"
      :has-help="hasHelp"
      :headerNavDisable="headerNavDisable"
      :has-avatar="hasAvatar"
      :alternative-profiles-info="alternativeProfilesInfo"
      :context-persons-info="contextPersonsInfo"
      :hasMegaMenu="hasMegaMenu"
      :megaMenuItems="megaMenuItems"
      :megaMenuHasShowAll="megaMenuHasShowAll"
      :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
      v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
      @mega-menu-show-all-click="triggerShowAllClick"
      v-model:selectedLanguage="selectedLanguageModel"
      v-model:theme="themeModel"
      v-model:hasAnimations="animationsModel"
      v-model:selectedContextPerson="selectedContextPersonModel"
      @open-alternative-profiles-modal="openAlternativeProfilesModal"
      @open-context-person-modal="openContextPersonModal"
      @language-changed="languageChanged"
      @alert-item-click="alertItemClicked"
      @alerts-click="alertsClicked"
      @help-click="helpClicked"
      @log-out="logOut"
      :texts="texts"
    />
  </div>

  <LxModal
    ref="alternativeProfilesModal"
    :label="texts.alternativeProfilesLabel"
    size="m"
    :button-secondary-visible="true"
    :button-primary-visible="false"
    :button-secondary-label="texts.close"
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
    :label="texts.contextPersonsLabel"
    size="m"
    :button-secondary-visible="true"
    :button-primary-visible="false"
    :button-secondary-label="texts.close"
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
