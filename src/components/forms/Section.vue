<script setup lang="ts">
import { provide, inject, computed, shallowRef, onMounted, ref } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxExpander from '@/components/Expander.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { getDisplayTexts } from '@/utils/generalUtils';
/**
 * Represents a section component that can be used inside form.
 *
 * @property {Number} columnCount - The number of columns in the section. Default is 1.
 * @property {String} label - The label of the section. Default is null.
 * @property {String} description - The description of the section. Default is null.
 * @property {String} id - The unique identifier of the section. Default is a generated UUID.
 * @property {String} requiredMode - The required mode of the section. Possible values are 'required', 'required-asterisk', 'optional'. Default is 'optional'.
 *
 * @example
 * <Section
 *   columnCount="2"
 *   label="Personal Information"
 *   description="Please provide your personal details."
 *   id="section1"
 *   requiredMode="required"
 * >
 *   <!-- Section content goes here -->
 * </Section>
 */
const props = defineProps({
  /**
   * The number of columns to display in the section.
   * @type {Number}
   * @default 1
   * @since 0.1.63
   */
  columnCount: {
    type: Number,
    default: 1,
  },
  /**
   * The label of the section.
   * @type {String}
   * @default null
   * @since 0.1.63
   */
  label: {
    type: String,
    default: null,
  },
  /**
   * The description of the section.
   * @type {String}
   * @default null
   * @since 0.1.63
   */
  description: {
    type: String,
    default: null,
  },
  /**
   * The unique identifier of the section.
   * @type {String}
   * @default generateUUID()
   * @since 0.1.63
   */
  id: {
    type: String,
    default: () => generateUUID(),
  },
  /**
   * The required mode of the section.
   * @type {String}
   * @default 'optional'
   * @since 0.3.11
   */
  requiredMode: { type: String, default: 'none' }, // none || required || required-asterisk || optional
  /**
   * The icon at start of section header.
   * @type {String}
   * @default null
   * @since 1.6.0-beta.5
   */
  icon: { type: String, default: null },
  /**
   * The icon set for icon at start of section header.
   * @type {String}
   * @default
   * @since 1.6.0-beta.5
   */
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  /**
   * The custom css class for expander.
   * @type {String}
   * @default 'default'
   * @since 1.6.0-beta.5
   */
  customClass: {
    type: String,
    default: '',
  },
  /**
   * The badge for header section.
   * @type {String}
   * @default
   * @since 1.6.0-beta.5
   */
  badge: { type: String, default: '' },
  /**
   * The badge icon for header section.
   * @type {String}
   * @default
   * @since 1.9.0-beta.8
   */
  badgeIcon: { type: String, default: null },
  /**
   * The badge type for header section.
   * @type {String}
   * @default
   * @since 1.9.0-beta.8
   */
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important,
  /**
   * The badge title for header section if badge is provided.
   * @type {String}
   * @default
   * @since 1.9.0-beta.8
   */
  badgeTitle: {
    type: String,
    default: null,
    validator: (v, p) => {
      // If badge or badgeIcon is non-empty, badgeTitle must be non-empty
      if ((p.badge || p.badgeIcon) && !v) {
        lxDevUtils.logWarn(
          `Warning: LxSection "badgeTitle" is required when "badge" or "badgeIcon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },
  /**
   * Defines the action definitions for the section.
   *
   * @type {Array}
   * @default []
   * @since 1.7.0-beta.8
   */
  actionDefinitions: {
    type: Array,
    default: () => [],
  },
  /**
   * The orientation of the sections rows
   * @type {String}
   * @default null
   * @since 1.7.0-beta.13
   */
  orientation: { type: String, default: null }, // vertical || horizontal
  /**
   * The rendering mode for expander.
   * @type {String}
   * @since 1.9.0
   */
  expanderRenderMode: { type: String, default: 'default' }, // 'default' or 'dynamic'
  /**
   * The object containing text translations for the section.
   * @type {Object}
   * @since 1.2.3
   */
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const textsDefault = {
  required: '(obligāts)',
  optional: '(neobligāts)',
  overflowMenu: 'Atvērt papildus iespējas',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['actionClick']);

const formMode = inject('formMode', ref('none'));
const sectionIndexType = inject('formIndexType', 'default');
const formIndex = inject('formIndex', null);
const requiredTexts = inject('requiredTexts', ref(textsDefault));
const formOrientation = inject('formOrientation', ref(null));

const exactIndex = computed(() => {
  if (formIndex) return formIndex.value?.find((obj) => obj.id === props.id);
  return [];
});

const expandedValue = shallowRef(exactIndex.value?.expanded);

const requiredModeValue = computed(() => {
  if (props.requiredMode !== 'none') {
    return props.requiredMode;
  }
  return formMode.value;
});

const rowRequiredTexts = computed(() => {
  const res = {
    required: requiredTexts.value.required,
    optional: requiredTexts.value.optional,
    overflowMenu: requiredTexts.value.overflowMenu,
  };
  if (displayTexts.value.required !== '(obligāts)' && displayTexts.value.required) {
    res.required = displayTexts.value.required;
  }
  if (displayTexts.value.optional !== '(neobligāts)' && displayTexts.value.optional) {
    res.optional = displayTexts.value.optional;
  }
  return res;
});

const sectionOrientation = computed(() => {
  if (props.orientation) {
    return props.orientation;
  }
  return formOrientation.value;
});

const globalEnvironment = useLx().getGlobals()?.environment;

function checkElements() {
  const elemList = document.querySelectorAll(
    `.lx-form-section#${props.id}>:not(.lx-row, .lx-placeholder)`
  );
  if (elemList?.length > 1 || (elemList?.length === 1 && elemList[0].tagName !== 'HEADER')) {
    lxDevUtils.log(
      `LxSection '${props.id}' contains elements that are not LxRow or LxPlaceholder.`,
      globalEnvironment,
      'warn'
    );
  }
}

const columnCountComputed = computed(() => {
  let res = props.columnCount;
  if (sectionOrientation.value === 'horizontal' && props.columnCount > 2) {
    lxDevUtils.log(
      `LxSection '${props.id}' with horizontal orientation should have less than 3 columns.`,
      globalEnvironment,
      'warn'
    );
    res = 2;
  }
  return res;
});

const ariaRole = computed(() =>
  props.label &&
  !props.id.endsWith('default') &&
  sectionIndexType !== 'tabs' &&
  sectionIndexType !== 'wizard'
    ? 'region'
    : 'group'
);

onMounted(() => {
  checkElements();
});

provide('sectionMode', requiredModeValue);
provide('rowRequiredTexts', rowRequiredTexts);
provide('sectionColumnCount', props.columnCount);
provide('sectionOrientation', sectionOrientation);
</script>
<template>
  <LxExpander
    v-if="sectionIndexType === 'expanders' && !id.endsWith('default')"
    :label="label"
    v-model="expandedValue"
    :invalid="exactIndex?.invalid"
    :invalidationMessage="exactIndex?.invalidationMessage"
    :icon="icon"
    :iconSet="iconSet"
    :badge="badge"
    :badge-icon="badgeIcon"
    :badge-type="badgeType"
    :badge-title="badgeTitle"
    :customClass="customClass"
    :render-mode="expanderRenderMode"
  >
    <section
      :id="id"
      class="lx-form-section"
      :class="[
        { 'lx-form-section-1': columnCountComputed === 1 },
        { 'lx-form-section-2': columnCountComputed === 2 },
        { 'lx-form-section-3': columnCountComputed === 3 },
        { 'lx-form-section-4': columnCountComputed === 4 },
        { 'lx-form-section-8': columnCountComputed === 8 },
      ]"
      :role="ariaRole"
      :aria-describedby="description ? `${id}-desc` : null"
    >
      <header v-if="description">
        <legend :id="`${id}-desc`" class="lx-description">
          {{ description }}
        </legend>
      </header>
      <slot />
    </section>
  </LxExpander>

  <section
    v-else
    :id="id"
    class="lx-form-section"
    :class="[
      { 'lx-form-section-1': columnCountComputed === 1 },
      { 'lx-form-section-2': columnCountComputed === 2 },
      { 'lx-form-section-3': columnCountComputed === 3 },
      { 'lx-form-section-4': columnCountComputed === 4 },
      { 'lx-form-section-8': columnCountComputed === 8 },
    ]"
    :role="ariaRole"
    :aria-labelledby="label ? `${id}-label` : null"
    :aria-describedby="description ? `${id}-desc` : null"
  >
    <header v-if="label || description || actionDefinitions?.length > 0">
      <div>
        <!-- eslint-disable-next-line vuejs-accessibility/role-has-required-aria-props -->
        <div :id="`${id}-label`" v-if="label" class="heading-3" role="heading">
          {{ label }}
        </div>
        <legend :id="`${id}-desc`" v-if="description" class="lx-description">
          {{ description }}
        </legend>
      </div>
      <div v-if="actionDefinitions?.length > 0">
        <LxButton
          v-if="actionDefinitions?.length === 1"
          :icon="actionDefinitions?.[0]?.icon"
          variant="icon-only"
          :label="actionDefinitions?.[0]?.title || actionDefinitions?.[0]?.name"
          :disabled="actionDefinitions?.[0]?.disabled"
          :destructive="actionDefinitions?.[0]?.destructive"
          kind="ghost"
          @click="emits('actionClick', actionDefinitions?.[0]?.id)"
        />
        <LxDropDownMenu
          v-else
          :actionDefinitions="actionDefinitions"
          @actionClick="(id) => emits('actionClick', id)"
        >
          <LxButton
            icon="overflow-menu"
            kind="ghost"
            :label="rowRequiredTexts.overflowMenu"
            variant="icon-only"
          />
        </LxDropDownMenu>
      </div>
    </header>
    <slot />
  </section>
</template>
