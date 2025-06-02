<script setup lang="ts">
import { computed, useSlots, ref, watch, onMounted, nextTick, provide } from 'vue';
import {
  useElementVisibility,
  useElementBounding,
  useElementSize,
  useWindowSize,
} from '@vueuse/core';
import LxButton from '@/components/Button.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxSection from '@/components/forms/Section.vue';
import LxTabControl from '@/components/TabControl.vue';
import LxWizard from '@/components/Wizard.vue';
import LxIcon from '@/components/Icon.vue';
import { generateUUID } from '@/utils/stringUtils';
import LxSkipLink from '@/components/SkipLink.vue';
import { focusNextFocusableElement, getDisplayTexts } from '@/utils/generalUtils';

// Calculates the offset for the form header and footer
function calculateOffset(el, considerRow = true) {
  const navRems = getComputedStyle(el).getPropertyValue('--nav-row-size').trim();
  const headerRems = getComputedStyle(el).getPropertyValue('--row-size').trim();
  const { fontSize } = getComputedStyle(el);
  if (considerRow) {
    return (
      parseInt(navRems, 10) * parseFloat(fontSize) + parseInt(headerRems, 10) * parseFloat(fontSize)
    );
  }
  return parseInt(navRems, 10) * parseFloat(fontSize);
}

const slots = useSlots();
const emits = defineEmits(['buttonClick']);

/**
 * The Form component represents a form with various sections and rows.
 *
 * @property {String} id - The unique identifier for the form. Defaults to a generated UUID.
 * @property {Number} columnCount - The number of columns in the form. Defaults to 1.
 * @property {Boolean} showHeader - Determines whether to show the form header. Defaults to true.
 * @property {Boolean} stickyHeader - Determines whether the form header should be sticky. Defaults to true.
 * @property {Boolean} showFooter - Determines whether to show the form footer. Defaults to true.
 * @property {Boolean} stickyFooter - Determines whether the form footer should be sticky. Defaults to true.
 * @property {Boolean} showPreHeaderInfo - Determines whether to show the pre-header information slot. Defaults to true.
 * @property {Boolean} showPostHeaderInfo - Determines whether to show the post-header information slot. Defaults to true.
 * @property {Array} index - The array of sections in the form. Defaults to an empty array.
 * @property {String} indexType - The type of index for the form. Can be 'default', 'tabs', or 'expanders'. Defaults to 'default'.
 * @property {Array} actionDefinitions - The array of buttons for the form. Defaults to an empty array.
 * @property {String} requiredMode - The required mode for the form. Can be 'required', 'required-asterisk', or 'optional'. Defaults to 'optional'.
 * @property {String} kind - The kind of form. Can be 'default', 'compact', or 'stripped'. Defaults to 'default'.
 * @property {Object} texts - The object containing text translations for the form.
 *
 * @fires buttonClick - Emitted when a button in the form is clicked.
 *
 * @function highlightRow - Highlights a row in the form.
 * @function clearHighlights - Clears all highlights in the form.
 *
 * @example
 * <Form
 *   id="myForm"
 *   columnCount="2"
 *   showHeader="true"
 *   stickyHeader="true"
 *   showFooter="true"
 *   stickyFooter="true"
 *   showPreHeaderInfo="true"
 *   showPostHeaderInfo="true"
 *   :index="[{ id: 'section1', name: 'Section 1' }, { id: 'section2', name: 'Section 2' }]"
 *   indexType="default"
 *   :actionDefinitions="[{ actionName: 'save', name: 'Save', icon: 'save', kind: 'primary' }]"
 *   requiredMode="optional"
 *   kind="default"
 *   :texts="{ otherActions: 'Other Actions' }"
 *   @buttonClick="handleButtonClick"
 *   @highlightRow="handleHighlightRow"
 *   @clearHighlights="handleClearHighlights"
 * >
 *   <template #pre-header>
 *     <h2>Pre-Header Content</h2>
 *   </template>
 *   <template #pre-header-info>
 *     <p>Pre-Header Information Content</p>
 *   </template>
 *   <template #header>
 *     <h1>Form Header</h1>
 *   </template>
 *   <template #post-header>
 *     <h2>Post-Header Content</h2>
 *   </template>
 *   <template #post-header-info>
 *     <p>Post-Header Information Content</p>
 *   </template>
 * </Form>
 */

const props = defineProps({
  /**
   * The unique identifier for the form.
   * @type {String}
   * @default generateUUID()
   * @since 0.1.63
   */
  id: {
    type: String,
    default: () => generateUUID(),
  },
  /**
   * The number of columns to display in the form.
   * @type {Number}
   * @default 1
   * @since 0.1.63
   */
  columnCount: {
    type: Number,
    default: 1,
  },
  /**
   * Determines whether to show the header of the form.
   * @type {Boolean}
   * @default true
   * @since 0.1.63
   */
  showHeader: {
    type: Boolean,
    default: true,
  },
  /**
   * Determines whether the header should be sticky or not.
   * @type {Boolean}
   * @default true
   * @since 0.1.63
   */
  stickyHeader: {
    type: Boolean,
    default: true,
  },
  /**
   * Determines whether to show the footer of the form.
   * @type {Boolean}
   * @default true
   * @since 0.1.63
   */
  showFooter: {
    type: Boolean,
    default: true,
  },
  /**
   * Determines whether the footer should be sticky or not.
   * @type {Boolean}
   * @default true
   * @since 0.1.63
   */
  stickyFooter: {
    type: Boolean,
    default: true,
  },
  /**
   * Determines whether to show pre-header information slot.
   * @type {Boolean}
   * @default true
   * @since 0.1.63
   */
  showPreHeaderInfo: {
    type: Boolean,
    default: true,
  },
  /**
   * Determines whether to show post-header information slot.
   * @type {Boolean}
   * @default true
   * @since 0.1.63
   */
  showPostHeaderInfo: {
    type: Boolean,
    default: true,
  },
  /**
   * The array of sections in the form.
   * @type {Array}
   * @default []
   * @since 0.1.63
   */
  index: {
    type: Array,
    default: () => [],
  },
  /**
   * The type of index for the form.
   * @type {String}
   * @default 'default'
   * @since 0.3.0
   */
  indexType: {
    type: String,
    default: 'default', // 'default' or 'tabs' or 'expanders' or 'wizard'
  },
  /**
   * An array of buttons for the form.
   * @type {Array}
   * @default []
   * @since 0.1.63
   */
  actionDefinitions: {
    type: Array,
    default: () => [], // { actionName: '', name: '', icon: '', kind: 'primary'/'secondary'/'tertiary'/'additional' }
  },
  /**
   * The required mode for the form.
   * @type {String}
   * @default 'optional'
   * @since 0.3.11
   */
  requiredMode: { type: String, default: 'none' }, // none || required || required-asterisk || optional
  /**
   * Determines spacings between, before, after rows and sections in form.
   * @type {String}
   * @default 'default'
   * @since 0.3.11
   */
  kind: { type: String, default: 'default' }, // default || compact || stripped
  /**
   * The orientation of the forms rows
   * @type {String}
   * @default null
   * @since 1.7.0-beta.13
   */
  orientation: { type: String, default: null }, // vertical || horizontal
  /**
   * Show skip link to skip form
   * @type {Boolean}
   * @default false
   * @since 1.8.0-beta.10
   */
  hasSkipLink: { type: Boolean, default: false },
  /**
   * The object containing text translations for the form.
   * @type {Object}
   * @since 0.3.5
   */
  texts: { type: Object, default: () => {} },
});

const textsDefault = {
  otherActions: 'Citas darbības',
  required: '(obligāts)',
  optional: '(neobligāts)',
  skipLinkLabel: 'Izlaist formu',
  skipLinkTitle: 'Izlaist formu',
  previous: 'Iepriekšējais',
  next: 'Nākamais',
  overflowMenu: 'Atvērt papildus iespējas',
  additionalActions: 'Papildus darbības',
};

// Merge texts prop with defaults
const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

function normalizeId(id) {
  if (id === 'default') {
    return `${props.id}-default`;
  }
  return id;
}

// Scrolls to the element with the specified ID
function scrollTo(id) {
  const sectionId = normalizeId(id);
  const elementForm = document.getElementById(props.id);
  const element = elementForm?.querySelector(`#${sectionId}`);
  const topPosition =
    element && element.getBoundingClientRect()
      ? element.getBoundingClientRect().top + window.scrollY
      : 0;

  const offset = calculateOffset(element);

  const targetPosition = topPosition - offset;

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

const form = ref();
const formHeader = ref();
const formFooter = ref();

const bounding = useElementBounding(form);
const windowSize = useWindowSize();
const headerSize = useElementSize(formHeader);
const footerSize = useElementSize(formFooter);

/**
 * Computed property that calculates the CSS properties for the top out of bounds effect.
 * @returns {string} The CSS properties for the top out of bounds effect.
 * @since 1.2.2
 */
const topOutOfBounds = computed(() => {
  const keyOpacity = '--form-top-shadow-opacity';
  const keySize = '--form-header-size';
  const limit = 100;
  const size = headerSize.height?.value;

  if (!form.value || !formHeader.value) return `${keyOpacity}: 0; ${keySize}: var(--row-size);`;

  const v = bounding.top ? bounding.top.value - calculateOffset(form.value, false) : 0;

  if (v < 0 - limit) {
    return `${keyOpacity}: 1; ${keySize}: ${size}px;`;
  }
  if (v < 0) {
    return `${keyOpacity}: ${(0 - v) / limit}; ${keySize}: ${size}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${size}px;`;
});
/**
 * Computes the CSS properties for the bottom shadow and footer size of the form component.
 * @returns {string} The computed CSS properties as a string.
 * @since 1.2.2
 */
const bottomOutOfBounds = computed(() => {
  const keyOpacity = '--form-bottom-shadow-opacity';
  const keySize = '--form-footer-size';
  const limit = 100;
  const size = footerSize.height?.value;

  if (!form.value || !formFooter.value) return `${keyOpacity}: 0; ${keySize}: var(--row-size);`;

  const v =
    bounding.bottom && windowSize.height ? bounding.bottom.value - windowSize.height.value : 0;

  if (v > limit) {
    return `${keyOpacity}: 1; ${keySize}: ${size}px;`;
  }
  if (v > 0) {
    return `${keyOpacity}: ${v / limit}; ${keySize}: ${size}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${size}px;`;
});

const indexTypeRef = computed(() => props.indexType);
const indexRef = computed(() => props.index);
const textsComp = computed(() => ({
  required: displayTexts.value.required,
  optional: displayTexts.value.optional,
  overflowMenu: displayTexts.value.overflowMenu,
}));
const requiredMode = computed(() => props.requiredMode);
const formOrientation = computed(() => props.orientation);

// eslint-disable-next-line vue/no-setup-props-destructure
provide('requiredTexts', textsComp);
provide('formMode', requiredMode);
provide('formIndexType', indexTypeRef);
provide('formIndex', indexRef);
provide('formOrientation', formOrientation);

const wizardModel = ref(null);
const itemsCopy = ref([...props.index]);

const currentStepIndex = computed(() => itemsCopy.value.findIndex((item) => item.isCurrentStep));
const currentStepId = computed(() => props.index?.[currentStepIndex.value]?.id || null);

const actionDefinitionsWizardSteps = computed(() => [
  {
    id: '_lx_prev_step',
    icon: 'back',
    name: displayTexts.value.previous,
    kind: 'primary',
    disabled: currentStepIndex.value === 0,
  },
  {
    id: '_lx_next_step',
    icon: 'next',
    name: displayTexts.value.next,
    kind: 'primary',
    disabled: currentStepIndex.value === props.index.length - 1,
  },
]);

function nextStep() {
  const currentIndex = currentStepIndex.value;
  if (currentIndex < props.index.length - 1) {
    if (itemsCopy.value[currentIndex].state !== 'invalid') {
      itemsCopy.value[currentIndex].state = 'complete';
    }
    itemsCopy.value[currentIndex].isCurrentStep = false;

    itemsCopy.value[currentIndex + 1].isCurrentStep = true;

    if (itemsCopy.value[currentIndex + 1].state !== 'invalid') {
      itemsCopy.value[currentIndex + 1].state = 'current';
    }
  }
}

function prevStep() {
  const currentIndex = currentStepIndex.value;
  if (currentIndex > 0) {
    itemsCopy.value[currentIndex].isCurrentStep = false;

    if (itemsCopy.value[currentIndex].state === 'current') {
      itemsCopy.value[currentIndex].state = undefined;
    }

    itemsCopy.value[currentIndex - 1].isCurrentStep = true;

    if (itemsCopy.value[currentIndex - 1].state === 'complete') {
      itemsCopy.value[currentIndex - 1].state = 'current';
    }
  }
}

const primaryButtons = computed(() => {
  if (indexTypeRef.value === 'wizard') {
    return actionDefinitionsWizardSteps.value;
  }
  const ret = props.actionDefinitions?.filter((x) => x.kind === 'primary');
  if (ret?.length > 2) {
    return ret.slice(0, 2);
  }
  return ret;
});

const secondaryButtons = computed(() => {
  if (indexTypeRef.value === 'wizard') {
    return props.actionDefinitions
      ?.map((x) => (x.kind === 'primary' ? { ...x, kind: 'secondary' } : x))
      .filter((x) => x.kind === 'secondary');
  }
  return props.actionDefinitions?.filter((x) => x.kind === 'secondary');
});

const tertiaryButtons = computed(() =>
  props.actionDefinitions?.filter((x) => x.kind === 'tertiary')
);

const additionalButtons = computed(() =>
  props.actionDefinitions?.filter((x) => x.kind === 'additional')
);

const hasPreHeaderInfoSlot = computed(
  () => props.showPreHeaderInfo && slots['pre-header-info'] !== undefined
);

const hasPostHeaderInfoSlot = computed(
  () => props.showPostHeaderInfo && slots['post-header-info'] !== undefined
);
// TODO: computed for all button tooltips

const sectionLocations = ref({});

const visibilities = ref({});

const clickHandler = (actionName) => {
  if (props.indexType === 'wizard') {
    if (actionName === '_lx_next_step') nextStep();
    else if (actionName === '_lx_prev_step') prevStep();
  }
  emits('buttonClick', actionName);
};

const tabControl = ref();
const wizard = ref();

const selectedSection = computed(() => {
  const ret = [];
  Object.keys(visibilities.value).forEach((key) => {
    if (visibilities.value[key]) {
      ret.push(key);
    }
  });
  return ret;
});

function findIfSectionSelected(id) {
  const sectionId = normalizeId(id);
  const res = selectedSection.value?.find((x) => x === sectionId);
  return res !== undefined;
}

const selectedTabValue = computed(() => {
  let res = normalizeId(props.index[0]?.id);
  props.index?.forEach((o) => {
    if (
      (tabControl.value?.isActiveTab(o.id) && props.indexType === 'tabs') ||
      (wizardModel.value === o.id && props.indexType === 'wizard')
    ) {
      res = normalizeId(o.id);
    }
  });
  return res;
});

// Hides all sections in the form. Necessary for indexType 'tabs' & 'wizard'
function hideAll() {
  const idValue = document.getElementById(props.id);
  let allElements = null;
  if (props.indexType === 'tabs') {
    allElements = idValue.querySelectorAll(`.lx-tab-body > div.lx-main > .lx-form-section`);
  } else if (props.indexType === 'wizard') {
    allElements = idValue.querySelectorAll(`.lx-wizard-body > div.lx-main > .lx-form-section`);
  }
  for (let i = 0; i < allElements.length; i += 1) {
    allElements[i].style.display = 'none';
  }

  const selectedForm = document.getElementById(props.id);

  const selectedElement = selectedForm?.querySelector(`#${selectedTabValue.value}`);
  if (selectedElement) {
    selectedElement.style.display = 'grid';
  }
}

const notPrimaryButtonCount = computed(() => {
  const secondary = secondaryButtons.value?.length ? secondaryButtons.value?.length : 0;
  const tertiary = tertiaryButtons.value?.length ? tertiaryButtons.value?.length : 0;
  return secondary + tertiary;
});

/**
 * Highlights a row in the form.
 * @param {string} rowId - The ID of the row element to highlight.
 * @param {string} kind - The kind of highlight to apply (default is 'default').
 * @param {number} duration - The duration of the highlight animation in milliseconds (default is 500).
 * @since 1.1.0
 */
function highlightRow(rowId, kind = 'default', duration = 500) {
  const element = document.getElementById(rowId);
  if (kind === 'default') {
    element.classList.add('lx-highlight');
    setTimeout(() => {
      element.classList.remove('lx-highlight');
    }, duration);
  }
}

/**
 * Removes  the lx-highlight class from all rows in the form.
 * @since 1.1.0
 */
function clearHighlights() {
  const element = document.getElementsByClassName('lx-highlight');
  while (element[0]) {
    element[0].classList.remove('lx-highlight');
  }
}

const indexHasIcons = computed(() =>
  props.index.some((obj) => Object.prototype.hasOwnProperty.call(obj, 'icon'))
);

function setInitialWizardStates(currentStep) {
  let currentItem = currentStep;

  // If there's no current step, set the first item as the current one & give it 'current' state...
  // ('invalid' state is never overriden)
  if (!currentItem && itemsCopy.value[0]) {
    const [firstItem] = itemsCopy.value;
    firstItem.isCurrentStep = true;
    currentItem = firstItem;
    if (firstItem.state !== 'invalid') {
      firstItem.state = 'current';
    }
  }
  // ...otherwise give current step 'current' state
  else if (currentItem && currentItem.state !== 'invalid') {
    currentItem.state = 'current';
  }

  for (let i = 0; i < itemsCopy.value.length; i += 1) {
    // All valid step states before current step are set to 'complete'
    if (i < itemsCopy.value.indexOf(currentItem) && itemsCopy.value[i].state !== 'invalid') {
      itemsCopy.value[i].state = 'complete';
    } else if (
      (itemsCopy.value[i].state === 'current' && itemsCopy.value[i] !== currentItem) || // If item has 'current' state, but it's not the current step OR...
      (itemsCopy.value[i].state === 'complete' && i > itemsCopy.value.indexOf(currentItem)) // ...if item has state 'complete', but it comes after the current step...
    ) {
      itemsCopy.value[i].state = undefined; // ...reset the item's state
      itemsCopy.value[i].isCurrentStep = undefined;
    }
  }
}

const defaultSectionId = computed(() => `${props.id}-default`);

function focusFirstFocusableElementAfter() {
  if (form.value) {
    focusNextFocusableElement(form.value);
  }
}

watch(
  () => props.index,
  (value) => {
    nextTick(() => {
      const elementForm = document.getElementById(props.id);
      props.index?.forEach((o) => {
        const sectionId = normalizeId(o.id);
        const el = elementForm?.querySelector(`#${sectionId}`);
        const visible = useElementVisibility(el);
        visibilities.value[sectionId] = visible;
      });
    });
    itemsCopy.value = value;
  }
);

watch(
  () => currentStepId.value,
  (value) => {
    wizardModel.value = value;
  },
  { immediate: true }
);

watch(
  () => props.indexType,
  (newValue) => {
    if (newValue === 'default' || newValue === 'expanders') {
      const allElements = document
        .getElementById(props.id)
        .getElementsByClassName('lx-form-section');
      for (let i = 0; i < allElements.length; i += 1) {
        allElements[i].style.display = 'grid';
      }
      nextTick(() => {
        const elementForm = document.getElementById(props.id);
        props.index?.forEach((o) => {
          const sectionId = normalizeId(o.id);
          const el = elementForm?.querySelector(`#${sectionId}`);
          const visible = useElementVisibility(el);
          visibilities.value[sectionId] = visible;
        });
      });
    } else {
      nextTick(() => {
        hideAll();
      });
    }
  }
);

onMounted(() => {
  const elementForm = document.getElementById(props.id);
  props.index?.forEach((o) => {
    const sectionId = normalizeId(o.id);
    const el = elementForm?.querySelector(`#${sectionId}`);
    const visible = useElementVisibility(el);
    visibilities.value[sectionId] = visible;
  });

  const currentStep = itemsCopy.value.find((item) => item.isCurrentStep === true);
  setInitialWizardStates(currentStep);

  if (currentStepId.value) {
    wizardModel.value = currentStepId.value;
  }
  if (props.indexType === 'tabs' || props.indexType === 'wizard') hideAll();
});

defineExpose({ highlightRow, clearHighlights });
</script>
<template>
  <article
    :id="id"
    class="lx-form-grid"
    role="form"
    :class="[{ 'lx-form-grid-stripped': kind === 'stripped' }]"
    ref="form"
    :aria-labelledby="showHeader && kind !== 'stripped' ? `${id}-header` : null"
    :style="`${topOutOfBounds}; ${bottomOutOfBounds}`"
  >
    <LxSkipLink
      v-if="props.hasSkipLink"
      :label="displayTexts.skipLinkLabel"
      :title="displayTexts.skipLinkTitle"
      :tabindex="0"
      @click="focusFirstFocusableElementAfter"
    />

    <aside
      v-if="props.indexType === 'default' && index?.length > 0"
      class="lx-index"
      aria-label="navigation block"
    >
      <ul>
        <li
          v-for="i in index"
          :key="i.id"
          ref="indexItems"
          :class="[{ 'lx-selected': findIfSectionSelected(i.id) }]"
          tabindex="0"
          v-on:keyup.enter="scrollTo(i.id)"
          v-on:keyup.space="scrollTo(i.id)"
          @click="scrollTo(i.id)"
        >
          <div
            class="index-text"
            :class="{ 'lx-invalid': i?.invalid }"
            :title="i.invalid ? i.invalidationMessage : ''"
          >
            {{ sectionLocations[normalizeId(i.id)] }}
            <p>{{ i.name }}</p>
            <LxIcon value="invalid" v-if="i?.invalid" />
          </div>
        </li>
      </ul>
    </aside>

    <aside
      v-if="props.indexType === 'default' && index?.length > 0"
      class="lx-index lx-index-small"
      aria-label="navigation block"
    >
      <ul>
        <li
          v-for="(i, index) in index"
          :key="i.id"
          ref="indexItems"
          :class="[{ 'lx-selected': findIfSectionSelected(i.id) }]"
          tabindex="0"
          v-on:keyup.enter="scrollTo(i.id)"
          v-on:keyup.space="scrollTo(i.id)"
          @click="scrollTo(i.id)"
        >
          <div
            class="index-text"
            :class="{ 'lx-invalid': i?.invalid }"
            :title="i.invalid ? i.invalidationMessage : ''"
          >
            <div class="inner-text">
              {{ sectionLocations[normalizeId(i.id)] }}

              {{ index + 1 }}
              <span class="index-hide-collapsed">&nbsp;{{ i.name }} </span>
            </div>
            <LxIcon value="invalid" v-if="i?.invalid" />
          </div>
        </li>
      </ul>
    </aside>

    <header
      ref="formHeader"
      :class="[
        { 'lx-sticky': stickyHeader },
        { 'lx-simple': slots['pre-header'] === undefined },
        { 'lx-form-with-tabs': props.indexType === 'tabs' },
        { 'lx-form-with-steps': props.indexType === 'wizard' },
        { 'lx-form-with-aside': props.indexType === 'default' && index?.length > 0 },
      ]"
      v-if="showHeader && kind !== 'stripped'"
    >
      <div class="lx-group pre-header-group">
        <LxInfoWrapper v-if="hasPreHeaderInfoSlot" placement="bottom-start">
          <div class="lx-toolbar-chip">
            <slot name="pre-header" />
          </div>
          <template #panel>
            <slot name="pre-header-info" />
          </template>
        </LxInfoWrapper>

        <div class="lx-toolbar-chip" v-else>
          <slot name="pre-header" />
        </div>
      </div>

      <div class="lx-group lx-primary">
        <div class="lx-toolbar-chip" :id="`${id}-header`">
          <slot name="header" />
        </div>
      </div>

      <div class="lx-group post-header-group">
        <LxInfoWrapper v-if="hasPostHeaderInfoSlot" placement="bottom-end">
          <div class="lx-toolbar-chip">
            <slot name="post-header" />
          </div>
          <template #panel>
            <slot name="post-header-info" />
          </template>
        </LxInfoWrapper>

        <div class="lx-toolbar-chip" v-else>
          <slot name="post-header" />
        </div>
      </div>

      <div class="responsive-overflow-header">
        <div class="overflow-icon-container">
          <LxInfoWrapper v-if="slots['pre-header'] || slots['post-header']">
            <LxIcon value="info" />
            <template #panel>
              <slot name="pre-header" /> <br v-if="slots['pre-header']" />
              <slot name="pre-header-info" /><br v-if="slots['pre-header-info']" />
              <slot name="post-header" /><br v-if="slots['post-header']" />
              <slot name="post-header-info" />
            </template>
          </LxInfoWrapper>
        </div>
      </div>

      <div
        class="lx-group"
        :class="[{ 'lx-single-header-button': props.indexType === 'default' }]"
        v-if="additionalButtons?.length === 1"
      >
        <LxButton
          v-for="button in additionalButtons"
          :id="`${id}-action-${button.id}`"
          :key="button.id"
          :label="button.name"
          :destructive="button.destructive"
          :icon="button.icon"
          :title="button.title || button.tooltip"
          :loading="button.loading"
          :busy="button.busy"
          :active="button.active"
          :disabled="button.disabled"
          :badge="button.badge"
          :badge-type="button.badgeType"
          :badge-title="button.badgeTitle"
          kind="ghost"
          variant="icon-only"
          @click="clickHandler(button.id)"
        />
      </div>

      <div
        class="lx-group"
        :class="[
          {
            'lx-multiple-header-button':
              props.indexType === 'default' && additionalButtons?.length === 1,
          },
        ]"
        v-if="
          additionalButtons?.length > 1 ||
          (additionalButtons?.length === 1 && props.indexType === 'default' && index?.length > 0)
        "
      >
        <LxDropDownMenu>
          <LxButton
            icon="overflow-menu"
            kind="ghost"
            variant="icon-only"
            custom-class="additional-button-icon"
            :label="displayTexts?.otherActions"
          />

          <LxButton
            :icon="index?.length > 0 && props.indexType === 'default' ? 'menu' : 'overflow-menu'"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.overflowMenu"
            custom-class="additional-button-icon-menu"
          />
          <template #panel>
            <p
              class="lx-description additional-buttons-label"
              v-if="index?.length > 0 && props.indexType === 'default'"
            >
              {{ displayTexts.additionalActions }}
            </p>
            <LxButton
              v-for="button in additionalButtons"
              :id="`${id}-action-${button.id}`"
              :key="button.id"
              :label="button.name"
              :disabled="button.disabled"
              :destructive="button.destructive"
              :icon="button.icon"
              :title="button.title || button.tooltip"
              :loading="button.loading"
              :busy="button.busy"
              :active="button.active"
              :badge="button.badge"
              :badge-type="button.badgeType"
              :badge-title="button.badgeTitle"
              kind="ghost"
              @click="clickHandler(button.id)"
            />
            <div
              class="responsive-default-index-button"
              v-if="props.indexType === 'default' && index?.length > 0"
            >
              <hr />
              <p class="lx-description additional-buttons-label">Satura rādītājs</p>
              <div
                class="additional-index-button"
                v-for="i in index"
                :key="i.id"
                ref="indexItems"
                :class="[
                  { 'lx-selected': findIfSectionSelected(i.id) },
                  { 'lx-invalid': i?.invalid },
                ]"
                v-on:keyup.enter="scrollTo(i.id)"
                v-on:keyup.space="scrollTo(i.id)"
                @click="scrollTo(i.id)"
                :title="i.invalid ? i.invalidationMessage : ''"
              >
                <p>{{ i.name }}</p>
                <LxIcon value="invalid" v-if="i.invalid" />
              </div>
            </div>
          </template>
        </LxDropDownMenu>
      </div>

      <div
        class="responsive-default-index-button"
        v-if="additionalButtons?.length === 0 && props.indexType === 'default' && index?.length > 0"
      >
        <LxDropDownMenu>
          <LxButton
            icon="menu"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.overflowMenu"
          />
          <template #panel>
            <div
              class="additional-index-button"
              v-for="i in index"
              :id="`${id}-action-${i.id}`"
              :key="i.id"
              ref="indexItems"
              :class="[
                { 'lx-selected': findIfSectionSelected(i.id) },
                { 'lx-invalid': i?.invalid },
              ]"
              v-on:keyup.enter="scrollTo(i.id)"
              v-on:keyup.space="scrollTo(i.id)"
              @click="scrollTo(i.id)"
              :title="i.invalid ? i.invalidationMessage : ''"
            >
              <p>{{ i.name }}</p>
              <LxIcon value="invalid" v-if="i.invalid" />
            </div>
          </template>
        </LxDropDownMenu>
      </div>
    </header>

    <LxTabControl
      v-if="props.indexType === 'tabs' && index?.length > 0"
      ref="tabControl"
      :value="props.index"
      :kind="indexHasIcons ? 'combo' : 'default'"
      :texts="displayTexts"
      @click="hideAll"
      @keydown.enter="hideAll"
    >
      <template #body>
        <div
          class="lx-main"
          :class="[{ 'lx-compact-sections': kind === 'compact' || kind === 'stripped' }]"
        >
          <LxSection :id="defaultSectionId" :column-count="columnCount">
            <slot />
          </LxSection>
          <slot name="sections" />
        </div>
      </template>
    </LxTabControl>

    <LxWizard
      ref="wizard"
      v-model="wizardModel"
      :items="props.index"
      @update:modelValue="hideAll"
      v-else-if="props.indexType === 'wizard' && index?.length > 0"
    >
      <template #body>
        <div
          class="lx-main"
          :class="[{ 'lx-compact-sections': kind === 'compact' || kind === 'stripped' }]"
        >
          <LxSection :id="defaultSectionId" :column-count="columnCount">
            <slot />
          </LxSection>
          <slot name="sections" />
        </div>
      </template>
    </LxWizard>

    <div
      class="lx-main"
      v-else
      :class="[{ 'lx-compact-sections': kind === 'compact' || kind === 'stripped' }]"
    >
      <LxSection :id="defaultSectionId" :column-count="columnCount">
        <slot />
      </LxSection>
      <slot name="sections" />
    </div>

    <footer
      :class="[
        { 'lx-sticky': stickyFooter },
        { 'crowded-primary-buttons': primaryButtons?.length > 1 },
        { 'crowded-not-primary-buttons': notPrimaryButtonCount > 2 },
      ]"
      v-if="showFooter && kind !== 'stripped'"
      ref="formFooter"
    >
      <div class="lx-group lx-buttons">
        <LxButton
          v-for="button in primaryButtons"
          :id="`${id}-action-${button.id}`"
          :key="button.id"
          :label="button.name"
          :disabled="button.disabled"
          :destructive="button.destructive"
          :icon="button.icon"
          :title="button.title || button.tooltip"
          :loading="button.loading"
          :busy="button.busy"
          :active="button.active"
          :badge="button.badge"
          :badge-type="button.badgeType"
          :badge-title="button.badgeTitle"
          kind="primary"
          @click="clickHandler(button.id)"
        />
        <LxDropDownMenu custom-class="responsive-overflow" v-if="notPrimaryButtonCount > 1">
          <LxButton kind="secondary" icon="overflow-menu" :label="displayTexts?.otherActions" />
          <template #panel>
            <LxButton
              v-for="button in secondaryButtons"
              :id="`${id}-action-${button.id}`"
              :key="button.id"
              :label="button.name"
              :disabled="button.disabled"
              :destructive="button.destructive"
              :icon="button.icon"
              :title="button.title || button.tooltip"
              :loading="button.loading"
              :busy="button.busy"
              :active="button.active"
              :badge="button.badge"
              :badge-type="button.badgeType"
              :badge-title="button.badgeTitle"
              kind="ghost"
              @click="clickHandler(button.id)"
            />
            <LxButton
              v-for="button in tertiaryButtons"
              :id="`${id}-action-${button.id}`"
              :key="button.id"
              :label="button.name"
              :disabled="button.disabled"
              :destructive="button.destructive"
              :icon="button.icon"
              :title="button.title || button.tooltip"
              :loading="button.loading"
              :busy="button.busy"
              :active="button.active"
              :badge="button.badge"
              :badge-type="button.badgeType"
              :badge-title="button.badgeTitle"
              kind="ghost"
              @click="clickHandler(button.id)"
            />
          </template>
        </LxDropDownMenu>
        <LxButton
          v-for="button in secondaryButtons"
          :id="`${id}-action-${button.id}`"
          :key="button.id"
          :label="button.name"
          :disabled="button.disabled"
          :destructive="button.destructive"
          :icon="button.icon"
          :title="button.title || button.tooltip"
          :loading="button.loading"
          :busy="button.busy"
          :active="button.active"
          :badge="button.badge"
          :badge-type="button.badgeType"
          :badge-title="button.badgeTitle"
          kind="secondary"
          :custom-class="
            notPrimaryButtonCount === 1 ? 'only-responsive-button' : 'responsive-button'
          "
          @click="clickHandler(button.id)"
        />
      </div>
      <div :class="$slots.footer ? 'lx-group lx-footer-slot' : 'lx-group'">
        <slot name="footer" />
      </div>
      <div class="lx-group lx-responsive-l">
        <LxButton
          v-for="button in tertiaryButtons"
          :id="`${id}-action-${button.id}`"
          :key="button.id"
          :label="button.name"
          :disabled="button.disabled"
          :destructive="button.destructive"
          :icon="button.icon"
          :custom-class="
            notPrimaryButtonCount === 1 ? 'only-responsive-button' : 'responsive-button'
          "
          :title="button.title || button.tooltip"
          :loading="button.loading"
          :busy="button.busy"
          :active="button.active"
          :badge="button.badge"
          :badge-type="button.badgeType"
          :badge-title="button.badgeTitle"
          kind="tertiary"
          @click="clickHandler(button.id)"
        />
      </div>
    </footer>
  </article>
</template>
