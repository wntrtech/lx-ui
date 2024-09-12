<script setup>
import { computed, ref, watch } from 'vue';

import LxButton from '@/components/Button.vue';
import LxDropDown from '@/components/Dropdown.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxIcon from '@/components/Icon.vue';
import { useWindowSize } from '@vueuse/core';

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
  userInfo: { type: Object, default: null },
  alternativeProfilesInfo: { type: Array, default: null },
  contextPersonsInfo: { type: Array, default: null },
  selectedContextPerson: { type: Object, default: null },
  selectedAlternativeProfile: { type: Object, default: null },
  headerNavDisable: { type: Boolean, default: false },
  headerNavReadOnly: { type: Boolean, default: false },
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
    }),
  },
});

const navItemsPrimary = computed(() =>
  props.navItems.filter((item) => !item.type || item.type === 'primary')
);
const navItemsSecondary = computed(() =>
  props.navItems.filter((item) => item.type === 'secondary')
);
const navItemsButtons = computed(() => props.navItems.filter((item) => item.type === 'buttons'));

const navItemsUserMenuRight = computed(() =>
  props.navItems?.filter((item) => item.type === 'buttons-right')
);
const navItemsUserMenuEves = computed(() =>
  props.navItems?.filter((item) => item.type === 'eveseliba')
);

const windowSize = useWindowSize();

const emits = defineEmits([
  'nav-toggle',
  'contextPersonChanged',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-alternative-profile',
  'log-out',
  'navClick',
]);

const fullName = computed(() => {
  if (props.userInfo && props.userInfo.firstName && props.userInfo.lastName) {
    return `${props.userInfo.firstName} ${props.userInfo.lastName}`.toUpperCase();
  }
  return '';
});

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

const alternativeProfilesComputed = computed(() => {
  if (!props?.alternativeProfilesInfo) return '';
  return props?.alternativeProfilesInfo;
});

function logOut() {
  emits('log-out');
}

function navClick(id) {
  emits('navClick', id);
}

function toggleNavBar(event) {
  if (
    !props.navBarSwitch &&
    windowSize.width.value < 1800 &&
    windowSize.width.value > 800 &&
    event?.target?.parentNode?.id !== 'lx_nav-toggle' &&
    event?.target?.id !== 'lx_nav-toggle'
  )
    emits('nav-toggle', true);
}
</script>
<template>
  <div class="lx-nav-panel" :class="{ shown: !navBarSwitch }" v-click-away="toggleNavBar">
    <ul class="lx-nav-group">
      <li
        v-for="item in navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" @click="navClick(item?.id)" />
      </li>
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
  </div>
  <div class="lx-nav-panel lx-responsive">
    <ul class="lx-nav-group">
      <div v-if="alternativeProfilesInfo" class="nav-bar-user-info nav-bar-profile">
        <p>{{ texts?.userTitle }}</p>
        <li>
          <LxDropDown
            :items="alternativeProfilesComputed"
            v-model="dropDownModelAlternatives"
            :disabled="headerNavDisable"
          />
        </li>
        <div class="color-border"></div>
      </div>
      <div
        v-else-if="!alternativeProfilesInfo && userInfo"
        class="nav-bar-user-info nav-bar-profile"
      >
        <p>{{ texts?.userTitle }}</p>
        <li>
          <p>{{ fullName }}</p>
          <p>{{ userInfo?.description }}</p>
        </li>
        <div class="color-border"></div>
      </div>
      <div
        v-if="
          (contextPersonsInfo && contextPersonsInfo.length > 0) ||
          (selectedContextPerson && headerNavReadOnly)
        "
        class="nav-bar-user-info"
      >
        <p>{{ texts?.contextPersonTitle }}</p>
        <template v-if="headerNavReadOnly">
          <li>
            <div class="header-profile-name">
              {{ selectedContextPerson?.name }}
            </div>
            <div class="header-profile-role" :title="selectedContextPerson?.description">
              {{ selectedContextPerson?.description }}
            </div>
          </li>
          <li></li>
        </template>

        <li
          v-if="!headerNavReadOnly"
          class="custom-context-menu"
          :class="[{ 'lx-disabled': headerNavDisable }]"
        >
          <LxDropDownMenu ref="contextMenu" :disabled="headerNavDisable">
            <div class="selected-person-display">
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
                <div
                  class="lx-button"
                  v-for="item in contextPersonsInfo"
                  :key="item"
                  :class="[{ 'lx-active': selectedContextPersonModel?.code === item?.code }]"
                  @click="changePerson(item)"
                  @keydown.enter="changePerson(item)"
                >
                  <div class="person-custom-button">
                    <label>{{ item?.name }}</label>
                    <div class="lx-description">
                      {{ item?.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="lx-button-set addition-button">
                <LxButton
                  :label="texts?.contextPersonsOwnData"
                  _active="selectedContextPersonModel === item.code"
                  @click="changePerson()"
                />
              </div>
            </template>
          </LxDropDownMenu>
        </li>
      </div>
      <li
        v-for="item in navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" @click="navClick(item?.id)" />
      </li>
    </ul>
    <ul class="lx-nav-group">
      <li
        v-for="item in navItemsButtons"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton
          :label="item.label"
          :href="item.to"
          :icon="item.icon"
          @click="navClick(item?.id)"
          icon-variant="gradient-brand-vertical"
        />
      </li>
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" @click="navClick(item?.id)" />
      </li>
      <div class="default-buttons">
        <div
          class="lower-button e-veseliba-button"
          v-for="items in navItemsUserMenuEves"
          :key="items.label"
        >
          <LxButton
            :icon="items.icon"
            :label="items.label"
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
            kind="ghost"
            iconVariant="gradient-brand"
            @click="logOut"
          />
        </div>
      </div>
    </ul>
  </div>
</template>
