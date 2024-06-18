<script setup>
import { computed, ref, watch } from 'vue';

import LxButton from '@/components/Button.vue';
import LxDropDown from '@/components/Dropdown.vue';
import LxValuePicker from '@/components/ValuePicker.vue';

const props = defineProps({
  navItems: {
    type: Array,
    default: null,
  },
  navBarHidden: {
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

const emits = defineEmits([
  'nav-toggle',
  'contextPersonChanged',
  'update:selected-context-person',
  'alternativeProfileChanged',
  'update:selected-alternative-profile',
]);

const fullName = computed(() => {
  if (props.userInfo && props.userInfo.firstName && props.userInfo.lastName) {
    return `${props.userInfo.firstName} ${props.userInfo.lastName}`.toUpperCase();
  }
  return '';
});

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
  if (!props?.alternativeProfilesInfo) return '';
  return props?.alternativeProfilesInfo;
});
const contextPersonComputed = computed(() => {
  if (!props.contextPersonsInfo) return null;
  return props.contextPersonsInfo;
});
</script>
<template>
  <div class="lx-nav-panel" :class="{ shown: !navBarHidden }">
    <ul class="lx-nav-group">
      <li
        v-for="item in navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" />
      </li>
    </ul>
    <ul class="lx-nav-group">
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" />
      </li>
    </ul>
  </div>
  <div class="lx-nav-panel lx-responsive">
    <ul class="lx-nav-group">
      <div v-if="alternativeProfilesInfo" class="nav-bar-user-info nav-bar-profile">
        <p>{{ texts?.userTitle }}</p>
        <li>
          <LxDropDown :items="alternativeProfilesComputed" v-model="dropDownModelAlternatives" />
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
      <div v-if="contextPersonsInfo && contextPersonsInfo.length > 0" class="nav-bar-user-info">
        <p>{{ texts?.contextPersonTitle }}</p>
        <template v-if="contextPersonsInfo.length === 1">
          <li>
            <div class="header-profile-name">
              {{ contextPersonsInfo[0]?.name }}
            </div>
            <div class="header-profile-role">
              {{ contextPersonsInfo[0]?.description }}
            </div>
          </li>
          <li></li
        ></template>

        <li v-if="contextPersonsInfo.length > 1">
          <LxValuePicker
            variant="dropdown-custom"
            :items="contextPersonComputed"
            v-model="dropDownModel"
            :placeholder="texts?.contextPersonsLabel"
          >
            <template #customItem="{ name, description }">
              <div>{{ name }}</div>
              <div class="lx-description">{{ description }}</div>
            </template>
          </LxValuePicker>
        </li>
      </div>
      <li
        v-for="item in navItemsPrimary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" />
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
          icon-variant="gradient-brand-vertical"
        />
      </li>
      <li
        v-for="item in navItemsSecondary"
        :key="item.label"
        :class="[{ 'lx-selected': selectedNavItems[item.to?.name] }]"
      >
        <LxButton :label="item.label" :href="item.to" />
      </li>
      <div class="e-veseliba-button">
        <li><LxButton label="E-veselība" icon="exit" /></li>
      </div>
      <li><LxButton label="Iziet" icon="deny" icon-variant="gradient-brand-vertical" /></li>
    </ul>
  </div>
</template>
