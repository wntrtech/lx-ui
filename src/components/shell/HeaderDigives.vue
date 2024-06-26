<script setup>
import { computed, watch, ref, onMounted } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDown from '@/components/Dropdown.vue';
import LxValuePicker from '@/components/ValuePicker.vue';
import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';
import { useWindowSize } from '@vueuse/core';

const props = defineProps({
  systemNameShort: { type: String, default: null },
  systemNameFull: { type: String, default: null },
  systemSubheader: { type: String, default: null },
  systemNameFormatted: { type: String, default: null },
  pageLabel: { type: String, default: null },
  userInfo: { type: Object, default: null }, // firstName, lastName, description,  role
  alternativeProfilesInfo: { type: Array, default: null },
  contextPersonsInfo: { type: Array, default: null },
  kind: { type: String, default: 'default' }, // 'default', 'public'
  navItems: { type: Array, default: null },
  navBarSwitch: { type: Boolean, default: true },
  hideNavBar: { type: Boolean, default: false },
  showBackButton: { type: Boolean, default: false },
  backLabel: { type: String, required: false, default: null },
  backPath: { type: [Object, String], required: false, default: null },
  hasLanguagePicker: { type: Boolean, default: false },
  languages: { type: Array, default: () => [] },
  selectedLanguage: { type: Object, default: null },
  selectedContextPerson: { type: Object, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  systemIcon: { type: String, default: null },
  hasAlerts: { type: Boolean, default: false },
  alertsKind: { type: String, default: 'menu' },
  alerts: { type: Array, default: () => [] },
  alertCount: { type: Number, default: null },
  alertLevel: { type: String, default: null },
  hasHelp: { type: Boolean, default: false },
  environment: { type: Object, default: () => {} },
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
  texts: {
    type: Object,
    required: false,
    default: () => ({
      defaultBack: 'Atpakaļ',
      logOut: 'Iziet',
      openAlerts: 'Atvērt sarakstu',
      helpTitle: 'Palīdzība',
      alertsTitle: 'Paziņojumi',
      languagesTitle: 'Valodu izvēle',
      contextPersonTitle: 'Saistītā persona',
      userTitle: 'Lietotājs',
      contextPersonsLabel: 'Izvēlieties personu',
      alternativeProfilesLabel: 'Izvēlieties saistīto personu',
      menu: 'Izvēlne',
    }),
  },
});

const vCleanHtml = buildVueDompurifyHTMLDirective();
const windowSize = useWindowSize();

const navItemsUserMenu = computed(() =>
  props.navItems?.filter((item) => item.type === 'buttons' || item.type === 'helper')
);
const navItemsUserMenuRight = computed(() =>
  props.navItems?.filter((item) => item.type === 'buttons-right')
);
const navItemsUserMenuEves = computed(() =>
  props.navItems?.filter((item) => item.type === 'eveseliba')
);

const emits = defineEmits([
  'nav-toggle',
  'contextPersonChanged',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-alternative-profile',
  'log-out',
  'update:nav-bar-switch',
]);

function logOut() {
  emits('log-out');
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

const navToggle = () => {
  navBarSwitchModel.value = !navBarSwitchModel.value;
};

const selectedContextPersonModel = computed({
  get() {
    if (!props.selectedContextPerson && props.contextPersonsInfo) {
      return props.contextPersonsInfo[0];
    }

    return props.selectedContextPerson;
  },
  set(value) {
    const res = { id: value, name: value };
    emits('update:selected-context-person', res);
  },
});
const dropDownModel = ref(selectedContextPersonModel.value?.id);
watch(dropDownModel, (newValue) => {
  selectedContextPersonModel.value = newValue;
});
watch(
  () => props.selectedContextPerson,
  (newValue) => {
    if (newValue !== props.selectedContextPerson) emits('contextPersonChanged', newValue);
    if (dropDownModel.value !== newValue) dropDownModel.value = newValue?.name;
  }
);

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

const alternativeProfilesComputed = computed(() => {
  if (!props.alternativeProfilesInfo) return '';
  return props.alternativeProfilesInfo;
});

const contextPersonComputed = computed(() => {
  if (!props.contextPersonsInfo) return '';
  return props.contextPersonsInfo;
});

onMounted(() => {
  if (windowSize.width.value < 1200 && !props.navBarSwitch) {
    emits('update:nav-bar-switch', true);
  } else if (props.navBarSwitch && windowSize.width.value >= 1200) {
    emits('update:nav-bar-switch', false);
  }
});
</script>
<template>
  <div
    class="lx-header-digives"
    :class="[{ 'with-context-person': !contextPersonsInfo || contextPersonsInfo.length === 0 }]"
  >
    <div class="lx-upper-row main-section">
      <div class="header-display-logo">
        <LxIcon value="digives" icon-set="brand" variant="gradient-brand-vertical" />
      </div>
      <div class="header-system-title">
        <div
          class="header-system-name"
          v-if="systemNameFormatted"
          v-clean-html="systemNameFormatted"
        ></div>
        <div class="header-system-name" v-else>{{ systemNameFull }}</div>
        <div class="header-system-subheader">{{ systemSubheader }}</div>
      </div>
    </div>
    <div
      class="lx-upper-row profile-section"
      :class="[{ 'only-section': !contextPersonsInfo || contextPersonsInfo.length === 0 }]"
      v-if="userInfo"
    >
      <div class="header-profile-section">
        <span class="border-span">
          <div class="header-label">{{ texts.userTitle }}</div>
          <template v-if="!alternativeProfilesInfo">
            <div class="header-profile-name">
              {{ fullName }}
            </div>
            <div class="header-profile-role">
              {{ userInfo?.description }}
            </div>
          </template>
          <div class="header-profile-name" v-if="alternativeProfilesInfo">
            <LxDropDown
              :items="alternativeProfilesComputed"
              v-model="dropDownModelAlternatives"
              :placeholder="texts?.alternativeProfilesLabel"
            />
          </div>
        </span>
      </div>
    </div>
    <div v-else class="lx-upper-row"></div>
    <div
      class="lx-upper-row person-data-section"
      v-if="contextPersonsInfo && contextPersonsInfo.length > 0"
    >
      <div class="section-border-left">
        <div class="header-label">{{ props.texts.contextPersonTitle }}</div>
        <template v-if="contextPersonsInfo.length === 1">
          <div class="header-profile-name">
            {{ contextPersonsInfo[0]?.name }}
          </div>
          <div class="header-profile-role">
            {{ contextPersonsInfo[0]?.description }}
          </div>
        </template>
        <LxValuePicker
          variant="dropdown-custom"
          :items="contextPersonComputed"
          v-model="dropDownModel"
          v-if="contextPersonsInfo.length > 1"
          :placeholder="texts?.contextPersonsLabel"
        >
          <template #customItem="{ name, description }">
            <div>{{ name }}</div>
            <div class="lx-description">{{ description }}</div>
          </template>
        </LxValuePicker>
      </div>
    </div>
    <div class="lx-lower-row">
      <div class="defined-buttons">
        <div class="lower-button" v-if="!hideNavBar">
          <LxButton
            icon="menu"
            :label="texts?.menu"
            @click="navToggle"
            kind="ghost"
            iconVariant="gradient-brand"
          />
        </div>
        <div class="lower-button" v-for="items in navItemsUserMenu" :key="items.label">
          <LxButton
            :icon="items.icon"
            :label="items.label"
            @click="navToggle"
            kind="ghost"
            v-if="items.type === 'helper'"
          />
          <LxButton
            v-else
            :icon="items.icon"
            :label="items.label"
            :href="items.to"
            kind="ghost"
            iconVariant="gradient-brand"
          />
        </div>
      </div>
      <div class="default-buttons">
        <div
          class="lower-button e-veseliba-button"
          v-for="items in navItemsUserMenuEves"
          :key="items.label"
        >
          <LxButton :icon="items.icon" :label="items.label" kind="ghost" :href="items.to.name" />
        </div>
        <div
          class="lower-button lower-button-last"
          v-for="items in navItemsUserMenuRight"
          :key="items.label"
        >
          <LxButton
            :icon="items.icon"
            :label="items.label"
            kind="ghost"
            iconVariant="gradient-brand"
            @click="logOut"
          />
        </div>
      </div>
    </div>
  </div>
</template>
