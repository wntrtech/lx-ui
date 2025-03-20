<script setup>
import { computed, watch, ref } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDown from '@/components/Dropdown.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
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
      contextPersonsLabel: 'Izvēlēties personu',
      contextPersonsOwnData: 'Skatīt manus datus',
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
  'navClick',
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
  if (navBarSwitchModel.value === null && windowSize.width.value < 1800)
    navBarSwitchModel.value = false;
  else navBarSwitchModel.value = !navBarSwitchModel.value;
};

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

const alternativeProfilesComputed = computed(() => {
  if (!props.alternativeProfilesInfo) return '';
  return props.alternativeProfilesInfo;
});

function changePerson(item) {
  if (!item) {
    emits('contextPersonChanged', null);
    return;
  }
  selectedContextPersonModel.value = {
    code: item?.code,
    name: item?.name,
    description: item?.description,
  };
}

function navClick(id) {
  emits('navClick', id);
}
const contextMenu = ref();
function triggerContextPersonMenu() {
  if (contextMenu.value.menuOpen) {
    contextMenu.value.closeMenu();
  } else {
    contextMenu.value.openMenu();
  }
}
</script>
<template>
  <div
    class="lx-header-digives"
    :class="[{ 'with-context-person': !contextPersonsInfo || contextPersonsInfo.length === 0 }]"
  >
    <div class="lx-upper-row main-section">
      <div class="header-display-logo">
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
            <div class="header-profile-role" :title="userInfo?.description">
              {{ userInfo?.description }}
            </div>
          </template>
          <div class="header-profile-name" v-if="alternativeProfilesInfo">
            <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
            <LxDropDown
              :tabindex="1"
              :items="alternativeProfilesComputed"
              v-model="dropDownModelAlternatives"
              :placeholder="texts?.alternativeProfilesLabel"
              :disabled="headerNavDisable"
            />
          </div>
        </span>
      </div>
    </div>
    <div v-else class="lx-upper-row"></div>
    <div
      class="lx-upper-row person-data-section"
      v-if="
        (contextPersonsInfo && contextPersonsInfo.length > 0) ||
        (selectedContextPerson && headerNavReadOnly)
      "
    >
      <div class="section-border-left">
        <div class="header-label">{{ props.texts.contextPersonTitle }}</div>
        <template v-if="headerNavReadOnly">
          <div class="header-profile-name">
            {{ selectedContextPerson?.name }}
          </div>
          <div class="header-profile-role" :title="selectedContextPerson?.description">
            {{ selectedContextPerson?.description }}
          </div>
        </template>
        <div
          class="custom-context-menu"
          v-if="!headerNavReadOnly"
          :class="[{ 'lx-disabled': headerNavDisable }]"
        >
          <LxDropDownMenu ref="contextMenu" :disabled="headerNavDisable">
            <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
            <div
              class="selected-person-display"
              role="combobox"
              :aria-expanded="contextMenu?.menuOpen"
              aria-controls="popper-id"
              :tabindex="2"
              @keydown.enter.prevent="triggerContextPersonMenu"
            >
              <div
                v-if="selectedContextPerson?.code !== userInfo?.code"
                :title="`${selectedContextPerson?.name}\r\n${selectedContextPerson?.description}`"
              >
                <p class="lx-primary">{{ selectedContextPerson?.name }}</p>
                <p class="lx-description">
                  {{ selectedContextPerson?.description }}
                </p>
              </div>
              <div v-else>
                <p class="placeholder">{{ texts?.contextPersonsLabel }}</p>
              </div>
              <LxIcon value="chevron-down" />
            </div>
            <template v-slot:panel>
              <div class="lx-button-set">
                <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
                <div
                  class="lx-button"
                  v-for="item in contextPersonsInfo"
                  :key="item.code"
                  :class="[{ 'lx-active': selectedContextPersonModel?.code === item?.code }]"
                  @click="changePerson(item)"
                  :tabindex="3"
                  @keydown.enter="changePerson(item)"
                >
                  <div class="person-custom-button" role="button">
                    <label>{{ item?.name }}</label>
                    <div class="lx-description">
                      {{ item?.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="lx-button-set addition-button">
                <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
                <LxButton
                  :label="texts?.contextPersonsOwnData"
                  :tabindex="3"
                  _active="selectedContextPersonModel === item.code"
                  @click="changePerson()"
                />
              </div>
            </template>
          </LxDropDownMenu>
        </div>
      </div>
    </div>
    <div class="lx-lower-row">
      <div class="defined-buttons">
        <div class="lower-button" v-if="!hideNavBar">
          <!-- eslint-disable-next-line vuejs-accessibility/tabindex-no-positive -->
          <LxButton
            id="lx_nav-toggle"
            :tabindex="4"
            icon="menu"
            :label="texts?.menu"
            kind="ghost"
            iconVariant="gradient-brand"
            @click="navToggle"
          />
        </div>
        <div class="lower-button" v-for="items in navItemsUserMenu" :key="items.label">
          <LxButton
            v-if="items.type === 'helper'"
            :icon="items.icon"
            :label="items.label"
            :iconSet="items?.iconSet"
            kind="ghost"
            @click="navToggle"
          />
          <LxButton
            v-else
            :icon="items.icon"
            :label="items.label"
            :href="items.to"
            :iconSet="items?.iconSet"
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
          <LxButton
            :icon="items.icon"
            :label="items.label"
            :iconSet="items?.iconSet"
            kind="ghost"
            @click="navClick(items?.id)"
          />
        </div>
        <div
          class="lower-button lower-button-last"
          v-for="items in navItemsUserMenuRight"
          :key="items.label"
        >
          <LxButton
            :icon="items.icon"
            :label="items.label"
            :iconSet="items?.iconSet"
            kind="ghost"
            iconVariant="gradient-brand"
            @click="logOut"
          />
        </div>
      </div>
    </div>
  </div>
</template>
