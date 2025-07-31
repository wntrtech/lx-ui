<script setup>
import { computed, shallowRef, onMounted, watch, ref, nextTick } from 'vue';
import {
  useColorMode,
  usePreferredReducedMotion,
  usePreferredReducedTransparency,
  useMutationObserver,
  useMediaQuery,
} from '@vueuse/core';

import useLx from '@/hooks/useLx';

import LxMainHeader from '@/components/shell/Header.vue';
import LxMainHeaderDigives from '@/components/shell/HeaderDigives.vue';
import LxPageHeader from '@/components/shell/PageHeader.vue';
import LxNavBar from '@/components/shell/NavBar.vue';
import LxNavBarDigives from '@/components/shell/NavBarDigives.vue';
import { lxDevUtils } from '@/utils';
import LxMainHeaderDigivesLite from '@/components/shell/HeaderDigivesLite.vue';
import LxNavBarDigivesLite from '@/components/shell/NavBarDigivesLite.vue';

import Notification from '@/components/Notification.vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxLoader from '@/components/Loader.vue';
import LxModal from '@/components/Modal.vue';
import LxSkipLink from '@/components/SkipLink.vue';
import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';
import LxAlertWidget from '@/components/AlertWidget.vue';
import LxMainHeaderDigimaks from '@/components/shell/HeaderDigimaks.vue';
import LxRow from '@/components/forms/Row.vue';
import LxInfoBox from '@/components/InfoBox.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const themeModel = useColorMode({
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
  'megaMenuShowAllClick',
  'update:notifications',
  'update:selected-language',
  'update:selected-context-person',
  'update:selected-alternative-profile',
  'update:hasAnimations',
  'update:hasReducedTransparency',
  'update:hasDeviceFonts',
  'update:isTouchSensitive',
  'idleModalPrimary',
  'idleModalSecondary',
  'confirmModalClosed',
  'update:nav-bar-switch',
  'update:selectedMegaMenuItem',
  'navClick',
  'update:customButtonOpened',
  'update:customButtonBlink',
  'customButtonClick',
]);

const props = defineProps({
  mode: { type: String, default: 'default' }, // public, cover, digives, digives-lite, digimaks, latvijalv
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
  hasAnimations: { type: Boolean, default: null },
  hasReducedTransparency: { type: Boolean, default: null },
  hasDeviceFonts: { type: Boolean, default: null },
  isTouchSensitive: { type: Boolean, default: null },

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
  headerNavReadOnly: { type: Boolean, default: false },
  navigating: { type: Boolean, default: false },
  hideHeaderText: { type: Boolean, default: false },

  showIdleModal: { type: Boolean, default: false },
  secondsToLive: { type: Number, default: null },

  confirmDialogData: { type: Object, default: () => {} },
  confirmPrimaryButtonBusy: { type: Boolean, default: false },
  confirmSecondaryButtonBusy: { type: Boolean, default: false },
  confirmPrimaryButtonDestructive: { type: Boolean, default: false },
  confirmClosesOnPrimary: { type: Boolean, default: true },
  confirmClosesOnSecondary: { type: Boolean, default: true },

  navBarSwitch: { type: Boolean, default: true },

  hasMegaMenu: { type: Boolean, default: false },
  megaMenuItems: { type: Array, default: () => [] },
  megaMenuHasShowAll: { type: Boolean, default: false },
  megaMenuGroupDefinitions: { type: Array, default: null },
  selectedMegaMenuItem: { type: String, default: null },

  hasSkipLink: { type: Boolean, default: true },

  hasCustomButton: { type: Boolean, default: false },
  customButtonIcon: { type: String, default: null },
  customButtonBadge: { type: String, default: null },
  customButtonBadgeType: { type: String, default: 'default' },
  customButtonBadgeIcon: { type: String, default: null },
  customButtonOpened: { type: Boolean, default: false },
  customButtonBlink: { type: Boolean, default: false },
  customButtonKind: { type: String, default: 'dropdown' }, // 'button' or 'dropdown'

  routeName: { type: String, default: null },
  overrideDefaultStyles: { type: Boolean, default: true },
  texts: { type: Object, default: () => {} },
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
  contextPersonTitle: 'Saistīto personu dati',
  close: 'Aizvērt',
  contextPersonsLabel: 'Izvēlēties personu',
  contextPersonsInfoLabel: 'Pacients',
  contextPersonsInfoTitle: 'Konteksta persona',
  contextPersonsOwnData: 'Skatīt manus datus',
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
  confirmModalSecondaryDefaultLabel: 'Nē',
  confirmModalPrimaryDefaultLabel: 'Jā',
  previousAlertTitle: 'Iepriekšējais paziņojums',
  nextAlertTitle: 'Nākamais paziņojums',
  userTitle: 'Lietotājs',
  menu: 'Izvēlne',
  showAllLabel: 'Vairāk',
  megaMenuTitle: 'Lietotnes',
  successSvgTitle: 'Veiksmīgs paziņojums',
  warningSvgTitle: 'Brīdinājums',
  errorSvgTitle: 'Kļūda',
  infoSvgTitle: 'Informācija',
  svgTitle: 'Paziņojums',
  skipLinkLabel: 'Pāriet uz lapas saturu',
  skipLinkTitle: 'Pāriet uz lapas saturu',
  customButton: 'Pielāgojamā poga',
  overflowNavItems: 'Atvērt papildu izvēlni',
  scrollUp: 'Atgriezties uz augšu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

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
      emits('languageChanged', value);
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

const lxElement = document.querySelector('.lx');
const fontToggle = ref(false);

const deviceFontsStorageKey = ref(
  `${useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'}-device-fonts`
);

function applyDeviceFonts(isEnabled) {
  if (lxElement) {
    if (isEnabled) {
      lxElement.style.setProperty('--font-family', 'initial');
      lxElement.style.setProperty('--font-family-mono', 'initial');
    } else {
      lxElement.style.removeProperty('--font-family');
      lxElement.style.removeProperty('--font-family-mono');
    }
  }
}

const deviceFontsModel = computed({
  get() {
    if (props.hasDeviceFonts !== null) {
      return props.hasDeviceFonts;
    }
    return fontToggle.value;
  },
  set(value) {
    emits('update:hasDeviceFonts', value);
    localStorage.setItem(deviceFontsStorageKey.value, JSON.stringify(value));
    fontToggle.value = value;
    applyDeviceFonts(value);
  },
});

watch(
  () => deviceFontsModel.value,
  (newValue) => {
    applyDeviceFonts(newValue);
  }
);

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

const transparencyStorageKey = ref(
  `${useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'}-transparency`
);

const transparencyToggle = ref(false);

const transparencyModel = computed({
  get() {
    if (props.hasReducedTransparency === null) {
      return transparencyToggle.value;
    }
    return props.hasReducedTransparency;
  },
  set(value) {
    if (props.hasThemePicker) {
      emits('update:hasReducedTransparency', value);
    }
    localStorage.setItem(transparencyStorageKey.value, JSON.stringify(value));
    transparencyToggle.value = value;
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

const isTouchMode = useMediaQuery('(pointer: coarse), (pointer: none)');

function transparencyModeChange(newValue, providedStorageKey) {
  const element = document.querySelector('.lx');

  const storageKey = providedStorageKey || transparencyStorageKey.value;

  if (newValue) {
    if (element) {
      element.classList.add('lx-no-transparency');
    }
  } else if (element) {
    element.classList.remove('lx-no-transparency');
  }

  localStorage.setItem(storageKey, JSON.stringify(newValue));
}

watch(
  () => transparencyModel.value,
  (newValue) => {
    transparencyModeChange(newValue);
  }
);

const touchModeToggle = ref(false);

const touchModeStorageKey = ref(
  `${useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'}-touch-mode`
);

const touchModeModel = computed({
  get() {
    if (props.isTouchSensitive !== touchModeToggle.value) {
      return touchModeToggle.value;
    }
    return props.isTouchSensitive;
  },
  set(value) {
    if (props.hasThemePicker) {
      emits('update:isTouchSensitive', value);
    }
    touchModeToggle.value = value;
  },
});

function touchModeChange(value) {
  if (lxElement) {
    lxElement.style.setProperty(
      '--row-size-dynamic',
      value ? getComputedStyle(lxElement).getPropertyValue('--row-size') : '2rem'
    );
    lxElement.classList.toggle('lx-touch-mode', value);
  }

  localStorage.setItem(touchModeStorageKey.value, JSON.stringify(value));
  touchModeToggle.value = value;
}

watch(
  () => props.isTouchSensitive,
  (value) => {
    if (value !== null && value !== touchModeToggle.value) {
      touchModeToggle.value = value;
    }
  }
);

watch(
  () => touchModeToggle.value,
  (value) => {
    touchModeChange(value);
  }
);

watch(
  () => isTouchMode.value,
  (value) => {
    touchModeChange(value);
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
      emits('alternativeProfileChanged', value);
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

function triggerShowAllClick() {
  emits('megaMenuShowAllClick');
}

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

const navBarSwitchModel = computed({
  get() {
    return props.navBarSwitch;
  },
  set(value) {
    emits('update:nav-bar-switch', value);
  },
});

const navBarSwitchBasic = shallowRef(true);

function navToggle(value) {
  if (props.mode === 'digives-lite' && window.innerWidth < 1000) {
    navBarSwitchModel.value = value;
    return;
  }
  if (props.mode === 'digives' || props.mode === 'digimaks') {
    navBarSwitchModel.value = value;
  } else {
    navBarSwitchBasic.value = value;
  }
}
function navToggleButton() {
  if (props.mode === 'digives') {
    if (navBarSwitchModel.value === null) navBarSwitchModel.value = false;
    else navBarSwitchModel.value = !navBarSwitchModel.value;
  } else navBarSwitchBasic.value = !navBarSwitchBasic.value;
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
  if (alert.clickable) emits('alertItemClick', alert);
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

const modals = ref(null);
const header = ref(null);
const main = ref(null);
const nav = ref(null);
const footer = ref(null);

onMounted(() => {
  if (!props.hasThemePicker) {
    themeModel.value = 'none';
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

  const transparencyKey = ref(
    `${useLx().getGlobals()?.systemId ? useLx().getGlobals()?.systemId : 'lx'}-transparency`
  );

  if (JSON.parse(localStorage.getItem(transparencyKey.value)) === null) {
    if (usePreferredReducedTransparency().value === 'no-preference') {
      transparencyToggle.value = false;
    } else {
      transparencyToggle.value = true;
    }
  } else if (props.hasReducedTransparency === null) {
    transparencyModel.value = JSON.parse(localStorage.getItem(transparencyKey.value));
  }
  transparencyModeChange(transparencyModel.value, transparencyKey);

  const storedValue = localStorage.getItem(deviceFontsStorageKey.value);
  fontToggle.value = storedValue ? JSON.parse(storedValue) : false;

  applyDeviceFonts(deviceFontsModel.value);

  if (props.isTouchSensitive === null) {
    const stored = localStorage.getItem(touchModeStorageKey.value);
    if (stored !== null) {
      touchModeToggle.value = JSON.parse(stored);
    } else {
      touchModeToggle.value = isTouchMode.value;
    }
  } else {
    touchModeToggle.value = props.isTouchSensitive;
  }
  touchModeChange(touchModeToggle.value);

  defineVars();

  useMutationObserver(
    modals,
    () => {
      if (modals.value) {
        const hasModalChildren = modals.value.hasChildNodes();
        [header.value, main.value, nav.value, footer.value].forEach((element) => {
          if (element) {
            element.setAttribute('aria-hidden', hasModalChildren ? 'true' : 'false');
          }
        });
      }
    },
    { childList: true }
  );
});

function navClick(id = null) {
  emits('navClick', id);
}

const selectedMegaMenuItemModel = computed({
  get() {
    return props.selectedMegaMenuItem;
  },
  set(value) {
    emits('update:selectedMegaMenuItem', value);
  },
});

const iconMapLatvijalv = {
  success: 'check',
  warning: 'notification-warning',
  error: 'notification-warning',
  info: 'notification-info',
};

const iconMapDigives = {
  success: 'notification-success',
  warning: 'notification-warning',
  error: 'notification-error',
  info: 'notification-info',
};

function pickIcon(level, layoutMode) {
  if (layoutMode === 'latvijalv') {
    return iconMapLatvijalv[level] || iconMapLatvijalv.info;
  }
  return iconMapDigives[level] || iconMapDigives.info;
}

function pickSvgTitle(level) {
  return displayTexts.value[`${level}SvgTitle`] || displayTexts.value.svgTitle;
}

const closedAlertsKey = ref(`${useLx().getGlobals()?.systemId || 'lx'}-closed-alerts`);

const closedAlerts = ref(JSON.parse(sessionStorage.getItem(closedAlertsKey.value) || '[]'));

function closeAlert(alert) {
  if (alert && alert.id) {
    if (!closedAlerts.value.includes(alert.id)) {
      closedAlerts.value.push(alert.id);
      sessionStorage.setItem(closedAlertsKey.value, JSON.stringify(closedAlerts.value));
    }
  }
}

const visibleAlerts = computed(() =>
  props.alerts.filter((alert) => alert && !closedAlerts.value.includes(alert.id))
);

function lvAlertItemClicked(event, alert) {
  if (event.target && event.target.closest('.lx-button')) {
    closeAlert(alert);
    return;
  }
  if (alert && alert.clickable) {
    emits('alertItemClick', alert);
  }
}

function focusFirstMainFocusableElement() {
  const mainElement = main.value;

  const focusableSelectors = [
    'a:not([disabled])',
    'button:not([disabled])',
    'input:not([disabled])',
    '[tabindex="0"]',
  ];

  if (mainElement) {
    const focusableElements = Array.from(
      mainElement.querySelectorAll(focusableSelectors.join(', '))
    );
    const firstVisibleElement = focusableElements.find((element) => element.offsetParent !== null);

    if (firstVisibleElement) {
      firstVisibleElement.focus();
    }
  }
}

const customButtonOpenedModal = computed({
  get() {
    return props.customButtonOpened;
  },
  set(value) {
    emits('update:customButtonOpened', value);
  },
});

let blinkTimeout = null;

function removeBlink() {
  const button = document.getElementById('lx-shell-custom-button');
  if (!button) return;

  if (blinkTimeout) {
    clearTimeout(blinkTimeout);
    blinkTimeout = null;
  }
  button.classList.remove('custom-button-blink');
  button.classList.remove('custom-button-after-blink');
}

function blink() {
  const button = document.getElementById('lx-shell-custom-button');
  if (!button) return;
  removeBlink();

  button.classList.add('custom-button-blink');

  blinkTimeout = setTimeout(() => {
    button.classList.remove('custom-button-blink');
    button.classList.add('custom-button-after-blink');
    blinkTimeout = null;
  }, 5000);
}

watch(
  () => props.customButtonBlink,
  (newValue) => {
    if (newValue) {
      blink();
    } else {
      removeBlink();
    }
  }
);
</script>
<template>
  <transition name="shell-switch">
    <div
      ref="shell"
      v-if="mode === 'cover'"
      class="lx-layout lx-layout-cover"
      :class="{ 'lx-override': overrideDefaultStyles }"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <header ref="header">
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
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :hasCustomButton="hasCustomButton"
          :customButtonIcon="customButtonIcon"
          :customButtonBadge="customButtonBadge"
          :customButtonBadgeType="customButtonBadgeType"
          :customButtonBadgeIcon="customButtonBadgeIcon"
          :customButtonKind="customButtonKind"
          v-model:customButtonOpened="customButtonOpenedModal"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
          @language-changed="languageChanged"
          @help-click="helpClicked"
          @log-out="logOut"
          @nav-toggle="navToggle"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          @customButtonClick="emits('customButtonClick')"
          :texts="displayTexts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon
            v-if="systemIcon"
            :value="systemIcon"
            icon-set="brand"
            :title="`${systemName} logo`"
            :desc="`${systemName}: ${systemSubheader}`"
          />
          <template #customButtonPanel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template #customButtonSafePanel v-if="$slots.customButtonSafePanel">
            <slot name="customButtonSafePanel" />
          </template>
        </LxMainHeader>
      </header>
      <main ref="main" class="lx-main">
        <div class="lx-cover">
          <slot name="backdrop" />
          <div class="lx-content">
            <div class="lx-logo">
              <template v-if="hasCoverLogo">
                <img v-if="coverLogo" :src="coverLogo" alt="Logo" />
                <slot v-else name="logo" />
              </template>
              <template v-else>
                <LxIcon
                  :value="systemIcon"
                  icon-set="brand"
                  :title="`${systemName} logo`"
                  :desc="`${systemName}: ${systemSubheader}`"
                />
              </template>
            </div>
            <div>
              <div
                class="heading-1"
                v-if="systemNameFormatted"
                v-clean-html="systemNameFormatted"
              />
              <div class="heading-1" v-else>{{ systemName }}</div>
              <p class="lx-description">{{ systemSubheader }}</p>
            </div>
            <div class="cover-main-area">
              <slot name="coverArea" />
              <LxAlertWidget
                v-if="alerts?.length > 0"
                :alerts="alerts"
                :nextAlertTitle="displayTexts.nextAlertTitle"
                :previousAlertTitle="displayTexts.previousAlertTitle"
              />
            </div>
          </div>
        </div>
        <div class="lx-loader-screen" v-if="navigating">
          <div class="spinner">
            <LxLoader :loading="true" />
          </div>
        </div>
      </main>
      <footer ref="footer">
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
      <div ref="modals" id="modals"></div>
    </div>
    <div
      v-if="mode === 'public'"
      class="lx-layout lx-layout-public"
      :class="[
        { 'lx-collapsed': navBarSwitchBasic },
        { 'lx-hide-nav-bar': hideNavBar },
        { 'no-nav-items': !navItems || navItems?.length === 0 },
        { 'lx-override': overrideDefaultStyles },
      ]"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <header ref="header">
        <LxMainHeader
          :mode="mode"
          :userInfo="userInfo"
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitchBasic"
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
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :hasCustomButton="hasCustomButton"
          :customButtonIcon="customButtonIcon"
          :customButtonBadge="customButtonBadge"
          :customButtonBadgeType="customButtonBadgeType"
          :customButtonBadgeIcon="customButtonBadgeIcon"
          :customButtonKind="customButtonKind"
          v-model:customButtonOpened="customButtonOpenedModal"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
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
          @customButtonClick="emits('customButtonClick')"
          :texts="displayTexts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon v-if="systemIcon" :value="systemIcon" icon-set="brand" />
          <template #customButtonPanel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template #customButtonSafePanel v-if="$slots.customButtonSafePanel">
            <slot name="customButtonSafePanel" />
          </template>
        </LxMainHeader>
      </header>
      <nav ref="nav" aria-label="navigation panel" v-if="!hideNavBar">
        <LxNavBar
          layoutMode="public"
          :nav-items="navItems"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          v-model:theme="themeModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
          :selectedNavItems="navItemsSelected"
          :texts="displayTexts"
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          @nav-toggle="navToggle"
          @navClick="navClick"
        />
      </nav>
      <main ref="main" class="lx-main">
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
      <footer ref="footer">
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
      <div ref="modals" id="modals"></div>
    </div>
    <div
      v-if="mode === 'latvijalv'"
      class="lx-layout lx-layout-latvijalv"
      :class="[
        { 'lx-collapsed': navBarSwitchBasic },
        { 'lx-hide-nav-bar': hideNavBar },
        { 'no-nav-items': !navItems || navItems?.length === 0 },
        { 'lx-override': overrideDefaultStyles },
      ]"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <header ref="header">
        <LxMainHeader
          :mode="mode"
          :userInfo="userInfo"
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitchBasic"
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
          kind="latvijalv"
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :hasCustomButton="hasCustomButton"
          :customButtonIcon="customButtonIcon"
          :customButtonBadge="customButtonBadge"
          :customButtonBadgeType="customButtonBadgeType"
          :customButtonBadgeIcon="customButtonBadgeIcon"
          :customButtonKind="customButtonKind"
          v-model:customButtonOpened="customButtonOpenedModal"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
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
          @customButtonClick="emits('customButtonClick')"
          :texts="displayTexts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon v-if="systemIcon" :value="systemIcon" icon-set="brand" />
          <template #customButtonPanel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template #customButtonSafePanel v-if="$slots.customButtonSafePanel">
            <slot name="customButtonSafePanel" />
          </template>
        </LxMainHeader>
      </header>
      <nav ref="nav" aria-label="navigation panel" v-if="!hideNavBar">
        <LxNavBar
          layoutMode="latvijalv"
          :nav-items="navItems"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          v-model:theme="themeModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
          :selectedNavItems="navItemsSelected"
          :texts="displayTexts"
          @nav-toggle="navToggle"
          @navClick="navClick"
        />
      </nav>
      <ul class="lx-latvijalv-alert-list" v-if="alerts?.length > 0 && !hasAlerts">
        <li
          v-for="alert in visibleAlerts"
          :key="alert.id"
          class="lx-latvijalv-alert"
          :class="[
            { 'lx-alert-success': alert?.level === 'success' },
            { 'lx-alert-info': alert?.level === 'info' },
            { 'lx-alert-warning': alert?.level === 'warning' },
            { 'lx-alert-error': alert?.level === 'error' },
            { 'lx-alert-clickable': alert?.clickable },
          ]"
          :role="alert?.level === 'error' || alert?.level === 'warning' ? 'alert' : 'status'"
          aria-live="polite"
          @click="lvAlertItemClicked($event, alert)"
          @keydown.space.prevent="lvAlertItemClicked($event, alert)"
          @keydown.enter.prevent="lvAlertItemClicked($event, alert)"
          :aria-label="alert?.name"
          :aria-labelledby="alert?.name ? `${alert.id}-label` : null"
          :aria-describedby="alert?.description ? `${alert.id}-desc` : null"
          :tabindex="alert?.clickable ? '0' : '-1'"
        >
          <div class="lx-latvijalv-alert-content-wrapper">
            <div class="lx-latvijalv-alert-icon">
              <LxIcon
                :value="pickIcon(alert.level, 'latvijalv')"
                :meaningful="true"
                :title="pickSvgTitle(alert.level)"
                :icon-set="alert.iconSet || 'cds'"
              />
            </div>
            <div class="lx-latvijalv-alert-text">
              <p class="lx-primary">{{ alert?.name }}</p>
              <p class="lx-secondary" v-if="alert?.description">{{ alert?.description }}</p>
            </div>
            <LxButton
              icon="close"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.close"
              @click="closeAlert(alert)"
            />
          </div>
        </li>
      </ul>

      <main ref="main" class="lx-main">
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
      <footer ref="footer">
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
      <div ref="modals" id="modals"></div>
    </div>
    <div
      v-else-if="mode === 'digives'"
      class="lx-layout lx-layout-default lx-layout-digives"
      :class="[
        { 'lx-collapsed': navBarSwitchModel },
        { 'lx-hide-nav-bar': hideNavBar },
        { 'lx-collapsed-null': navBarSwitchModel === null },
        { 'lx-override': overrideDefaultStyles },
      ]"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <header ref="header">
        <LxMainHeaderDigives
          :userInfo="userInfo"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :nav-items="navItems"
          v-model:nav-bar-switch="navBarSwitchModel"
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
          :headerNavReadOnly="headerNavReadOnly"
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
          @navClick="navClick"
          :texts="displayTexts"
        />
      </header>
      <div class="small-nav-bar-button">
        <LxButton
          :icon="navBarSwitchModel === null ? 'menu' : navBarSwitchModel ? 'menu' : 'close'"
          variant="icon-only"
          kind="ghost"
          :label="
            navBarSwitchModel === null
              ? displayTexts.openNavbar
              : navBarSwitchModel
              ? displayTexts.openNavbar
              : displayTexts.close
          "
          @click="navToggleButton()"
        />
      </div>
      <nav ref="nav" aria-label="navigation panel">
        <LxNavBarDigives
          v-model:nav-bar-switch="navBarSwitchModel"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          :nav-items="navItems"
          :selectedNavItems="navItemsSelected"
          :userInfo="userInfo"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :texts="displayTexts"
          :headerNavDisable="headerNavDisable"
          :headerNavReadOnly="headerNavReadOnly"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          @log-out="logOut"
          @navClick="navClick"
          @nav-toggle="navToggle"
        />
      </nav>

      <main ref="main" class="lx-main">
        <ul class="lx-digives-alert-list" v-if="alerts?.length > 0">
          <li
            v-for="alert in alerts"
            :key="alert.id"
            class="lx-digives-alert"
            :role="alert?.level === 'error' || alert?.level === 'warning' ? 'alert' : 'status'"
            @click="alert?.clickable && alertItemClicked(alert)"
            @keydown.space.prevent="alert?.clickable && alertItemClicked(alert)"
            @keydown.enter.prevent="alert?.clickable && alertItemClicked(alert)"
          >
            <LxInfoBox
              :variant="alert?.level"
              :label="alert?.name"
              :description="alert?.description"
              :id="alert?.id"
              :kind="alert?.clickable ? 'clickable' : 'default'"
              @actionClick="() => alertItemClicked(alert)"
              :actionDefinitions="
                alert?.clickable
                  ? [
                      {
                        id: 'open',
                        icon: 'open',
                        title: displayTexts?.open,
                        destructive: false,
                      },
                    ]
                  : []
              "
            />
          </li>
        </ul>
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
      <footer ref="footer">
        <div>
          <slot name="footer" />
        </div>
      </footer>
      <div ref="modals" id="modals"></div>
    </div>
    <div
      v-else-if="mode === 'digives-lite'"
      class="lx-layout lx-layout-default lx-layout-digives-lite"
      :class="[
        { 'lx-collapsed': navBarSwitchModel },
        { 'lx-hide-nav-bar': hideNavBar },
        { 'lx-collapsed-null': navBarSwitchModel === null },
        { 'lx-override': overrideDefaultStyles },
      ]"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <header ref="header">
        <LxMainHeaderDigivesLite
          :userInfo="userInfo"
          :hasAvatar="hasAvatar"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :nav-items="navItems"
          v-model:nav-bar-switch="navBarSwitchModel"
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
          :hasThemePicker="hasThemePicker"
          :availableThemes="availableThemes"
          :has-alerts="hasAlerts"
          :alerts-kind="alertsKind"
          :alerts="alerts"
          :alert-count="alertCount"
          :alert-level="alertLevel"
          :has-help="hasHelp"
          :environment="environment"
          :headerNavDisable="headerNavDisable"
          :headerNavReadOnly="headerNavReadOnly"
          :hasCustomButton="hasCustomButton"
          :customButtonIcon="customButtonIcon"
          :customButtonBadge="customButtonBadge"
          :customButtonBadgeType="customButtonBadgeType"
          :customButtonBadgeIcon="customButtonBadgeIcon"
          :customButtonKind="customButtonKind"
          v-model:customButtonOpened="customButtonOpenedModal"
          v-model:theme="themeModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
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
          @navClick="navClick"
          @customButtonClick="emits('customButtonClick')"
          :texts="displayTexts"
        >
          <template #customButtonPanel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template #customButtonSafePanel v-if="$slots.customButtonSafePanel">
            <slot name="customButtonSafePanel" />
          </template>
        </LxMainHeaderDigivesLite>
      </header>
      <div class="small-nav-bar-button" v-if="userInfo">
        <div
          class="shell-buttons patient-info"
          :class="[{ 'without-context-person': !selectedContextPersonModel }]"
        >
          <LxInfoWrapper v-if="selectedContextPersonModel">
            <LxIcon value="patient-active" />
            <template #panel>
              <LxRow :label="displayTexts.contextPersonsInfoLabel">
                <p class="lx-data">{{ selectedContextPersonModel?.name }}</p>
                <p class="lx-data">{{ selectedContextPersonModel?.description }}</p>
              </LxRow>
            </template>
          </LxInfoWrapper>
          <LxIcon
            v-else
            class="patient-inactive-icon"
            value="patient-inactive"
            :title="displayTexts.contextPersonsInfoTitle"
          />
        </div>
      </div>
      <nav ref="nav" aria-label="navigation panel">
        <LxNavBarDigivesLite
          v-model:nav-bar-switch="navBarSwitchModel"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          :nav-items="navItems"
          :selectedNavItems="navItemsSelected"
          :userInfo="userInfo"
          :hasAvatar="hasAvatar"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :texts="displayTexts"
          :headerNavDisable="headerNavDisable"
          :headerNavReadOnly="headerNavReadOnly"
          :hasThemePicker="hasThemePicker"
          :availableThemes="availableThemes"
          :has-alerts="hasAlerts"
          :alerts-kind="alertsKind"
          :alerts="alerts"
          :alert-count="alertCount"
          :alert-level="alertLevel"
          :has-help="hasHelp"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :hasCustomButton="hasCustomButton"
          :customButtonIcon="customButtonIcon"
          :customButtonBadge="customButtonBadge"
          :customButtonBadgeType="customButtonBadgeType"
          :customButtonBadgeIcon="customButtonBadgeIcon"
          :customButtonKind="customButtonKind"
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          v-model:customButtonOpened="customButtonOpenedModal"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
          @customButtonClick="emits('customButtonClick')"
          @language-changed="languageChanged"
          @context-person-changed="contextPersonChanged"
          @alternative-profile-changed="alternativeProfileChanged"
          @alert-item-click="alertItemClicked"
          @alerts-click="alertsClicked"
          @help-click="helpClicked"
          @log-out="logOut"
          @navClick="navClick"
          @nav-toggle="navToggle"
        >
          <template #customButtonPanel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template #customButtonSafePanel v-if="$slots.customButtonSafePanel">
            <slot name="customButtonSafePanel" />
          </template>
        </LxNavBarDigivesLite>
      </nav>

      <main ref="main" class="lx-main">
        <ul
          class="lx-digives-lite-alert-list"
          v-if="alerts?.length > 0 && props.routeName === 'dashboard'"
        >
          <li
            v-for="alert in alerts"
            :key="alert.id"
            class="lx-digives-lite-alert"
            :role="alert?.level === 'error' || alert?.level === 'warning' ? 'alert' : 'status'"
          >
            <LxInfoBox
              :variant="alert?.level"
              :label="alert?.name"
              :description="alert?.description"
              :id="alert?.id"
              :kind="alert?.clickable ? 'button' : 'default'"
              :actionDefinitions="
                alert?.clickable
                  ? [
                      {
                        id: 'close',
                        icon: 'close',
                        title: displayTexts?.close,
                        destructive: false,
                      },
                    ]
                  : []
              "
              @actionClick="() => alertItemClicked(alert)"
            />
          </li>
        </ul>
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
      <footer ref="footer">
        <div>
          <slot name="footer" />
        </div>
      </footer>
      <div ref="modals" id="modals"></div>
    </div>
    <div
      v-else-if="mode === 'digimaks'"
      class="lx-layout lx-layout-digimaks"
      :class="{ 'lx-override': overrideDefaultStyles }"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <main class="lx-main" ref="main">
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
      <footer ref="footer">
        <div>
          <slot name="footer" />
        </div>
      </footer>
      <header ref="header">
        <LxMainHeaderDigimaks
          :userInfo="userInfo"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          :nav-items="navItems"
          v-model:nav-bar-switch="navBarSwitchModel"
          :hide-nav-bar="hideNavBar"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :has-alerts="hasAlerts"
          :alerts-kind="alertsKind"
          :alerts="alerts"
          :alert-level="alertLevel"
          :has-help="hasHelp"
          :headerNavDisable="headerNavDisable"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          :selectedNavItems="navItemsSelected"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          @mega-menu-show-all-click="triggerShowAllClick"
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
          :texts="displayTexts"
        />
      </header>
      <div ref="modals" id="modals" />
    </div>
    <div
      v-else
      class="lx-layout lx-layout-default"
      :class="[{ 'lx-collapsed': navBarSwitchBasic }, { 'lx-override': overrideDefaultStyles }]"
    >
      <LxSkipLink
        v-if="props.hasSkipLink"
        :label="displayTexts.skipLinkLabel"
        :title="displayTexts.skipLinkTitle"
        @click="focusFirstMainFocusableElement"
      />
      <header ref="header">
        <LxMainHeader
          :mode="mode"
          :alternative-profiles-info="alternativeProfilesInfo"
          :context-persons-info="contextPersonsInfo"
          v-model:selectedContextPerson="selectedContextPersonModel"
          v-model:selectedAlternativeProfile="selectedAlternativeProfileModel"
          :userInfo="userInfo"
          :has-avatar="hasAvatar"
          :nav-items="navItems"
          :nav-bar-switch="navBarSwitchBasic"
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
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          :hasCustomButton="hasCustomButton"
          :customButtonIcon="customButtonIcon"
          :customButtonBadge="customButtonBadge"
          :customButtonBadgeType="customButtonBadgeType"
          :customButtonBadgeIcon="customButtonBadgeIcon"
          :customButtonKind="customButtonKind"
          v-model:customButtonOpened="customButtonOpenedModal"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:theme="themeModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
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
          @customButtonClick="emits('customButtonClick')"
          :texts="displayTexts"
        >
          <template v-if="!systemIcon" #logo>
            <slot name="logoSmall" />
          </template>
          <LxIcon v-if="systemIcon" :value="systemIcon" icon-set="brand" />
          <template #customButtonPanel v-if="$slots.customButtonPanel">
            <slot name="customButtonPanel" />
          </template>
          <template #customButtonSafePanel v-if="$slots.customButtonSafePanel">
            <slot name="customButtonSafePanel" />
          </template>
        </LxMainHeader>
      </header>
      <nav ref="nav" aria-label="navigation panel" v-if="!hideNavBar">
        <LxNavBar
          v-model:theme="themeModel"
          v-model:selectedLanguage="selectedLanguageModel"
          v-model:hasAnimations="animationsModel"
          v-model:hasReducedTransparency="transparencyModel"
          v-model:hasDeviceFonts="deviceFontsModel"
          v-model:isTouchSensitive="touchModeModel"
          :nav-items="navItems"
          :has-theme-picker="hasThemePicker"
          :available-themes="availableThemes"
          :has-language-picker="hasLanguagePicker"
          :languages="languages"
          :selectedNavItems="navItemsSelected"
          :texts="displayTexts"
          :hasMegaMenu="hasMegaMenu"
          :megaMenuItems="megaMenuItems"
          @mega-menu-show-all-click="triggerShowAllClick"
          v-model:selectedMegaMenuItem="selectedMegaMenuItemModel"
          :megaMenuHasShowAll="megaMenuHasShowAll"
          :megaMenuGroupDefinitions="megaMenuGroupDefinitions"
          @nav-toggle="navToggle"
          @navClick="navClick"
        />
      </nav>

      <main ref="main" class="lx-main">
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
      <footer ref="footer">
        <div></div>
        <div>
          <slot name="footer" />
        </div>
        <div></div>
      </footer>
      <div ref="modals" id="modals"></div>
    </div>
  </transition>
  <LxModal
    ref="idleModalRef"
    :label="displayTexts.idleModalLabel"
    :button-primary-label="displayTexts.idleModalPrimaryLabel"
    :button-primary-visible="true"
    :button-secondary-label="displayTexts.idleModalSecondaryLabel"
    :button-secondary-visible="true"
    :button-secondary-is-cancel="false"
    :disable-closing="true"
    @primary-action="idleModalPrimaryClicked()"
    @secondary-action="idleModalSecondaryClicked()"
  >
    <p v-if="secondsToLive > 60">
      {{
        displayTexts.descriptionMinutes?.replace('{count}', Math.floor(props.secondsToLive / 60))
      }}
      {{
        secondsToLive % 60 > 0
          ? displayTexts.descriptionMinutesSmall?.replace('{count}', props.secondsToLive % 60)
          : null
      }}
    </p>
    <p v-else>
      {{ displayTexts.idleDescription?.replace('{count}', props.secondsToLive) }}
    </p>
  </LxModal>
  <LxModal
    ref="confirmModal"
    :label="confirmDialogData?.$state.confirmDialogState.title"
    :button-primary-visible="true"
    :button-primary-label="
      confirmDialogData?.$state.confirmDialogState.primaryLabel ||
      displayTexts.confirmModalPrimaryDefaultLabel
    "
    :button-primary-busy="
      confirmDialogData?.$state.confirmDialogState.primaryBusy !== null
        ? confirmDialogData?.$state.confirmDialogState.primaryBusy
        : confirmPrimaryButtonBusy
    "
    :button-secondary-visible="true"
    :button-secondary-label="
      confirmDialogData?.$state.confirmDialogState.secondaryLabel ||
      displayTexts.confirmModalSecondaryDefaultLabel
    "
    :button-secondary-busy="
      confirmDialogData?.$state.confirmDialogState.secondaryBusy !== null
        ? confirmDialogData?.$state.confirmDialogState.secondaryBusy
        : confirmSecondaryButtonBusy
    "
    :button-secondary-is-cancel="false"
    :buttonPrimaryIsDestructive="confirmPrimaryButtonDestructive"
    :disableClosing="true"
    :escEnabled="confirmDialogData?.$state.confirmDialogState.escEnabled"
    @primary-action="
      confirmClosesOnPrimary
        ? confirmDialogData?.confirm(confirmDialogData?.$state.confirmDialogState.primaryCallback)
        : confirmDialogData?.$state.confirmDialogState.primaryCallback()
    "
    @secondary-action="
      confirmClosesOnSecondary
        ? confirmDialogData?.confirm(confirmDialogData?.$state.confirmDialogState.secondaryCallback)
        : confirmDialogData?.$state.confirmDialogState.secondaryCallback()
    "
    @closed="confirmModalClosed"
  >
    <p>{{ confirmDialogData?.$state.confirmDialogState.message }}</p>
  </LxModal>
  <Notification v-model="notificationModel" />
</template>
