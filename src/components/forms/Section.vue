<script setup>
import { provide, inject, computed, shallowRef, onMounted } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxExpander from '@/components/Expander.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
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
   * The object containing text translations for the section.
   * @type {Object}
   * @since 1.2.3
   */
  texts: {
    type: Object,
    default: () => ({
      required: '(obligāts)',
      optional: '(neobligāts)',
    }),
  },
});
const formMode = inject('formMode');
const sectionIndexType = inject('formIndexType');
const formIndex = inject('formIndex');
const requiredTexts = inject('requiredTexts');
const exactIndex = computed(() => {
  if (formIndex) return formIndex.value?.find((obj) => obj.id === props.id);
  return [];
});

const expandedValue = shallowRef(exactIndex.value?.expanded);

const requiredModeValue = computed(() => {
  if (props.requiredMode !== 'none') {
    return props.requiredMode;
  }
  return formMode;
});

const rowRequiredTexts = computed(() => {
  const res = {
    required: requiredTexts.required,
    optional: requiredTexts.optional,
  };
  if (props.texts.required !== '(obligāts)' && props.texts.required) {
    res.required = props.texts.required;
  }
  if (props.texts.optional !== '(neobligāts)' && props.texts.optional) {
    res.optional = props.texts.optional;
  }
  return res;
});

const globalEnvironment = useLx().getGlobals()?.environment;

function checkElements() {
  const elemList = document.querySelectorAll(
    `.lx-form-section#${CSS.escape(props.id)}>:not(.lx-row)`
  );
  if (elemList?.length > 1 || (elemList?.length === 1 && elemList[0].tagName !== 'HEADER')) {
    lxDevUtils.log(
      `LxSection '${props.id}' contains elements that are not LxRow.`,
      globalEnvironment,
      'warn'
    );
  }
}

onMounted(() => {
  checkElements();
});

provide('sectionMode', requiredModeValue.value);
provide('rowRequiredTexts', rowRequiredTexts.value);
provide('sectionColumnCount', props.columnCount);
</script>
<template>
  <LxExpander
    v-if="sectionIndexType === 'expanders' && id !== 'default'"
    :label="label"
    v-model="expandedValue"
    :invalid="exactIndex?.invalid"
    :invalidationMessage="exactIndex?.invalidationMessage"
  >
    <section
      :id="id"
      class="lx-form-section"
      :class="[
        { 'lx-form-section-1': columnCount === 1 },
        { 'lx-form-section-2': columnCount === 2 },
        { 'lx-form-section-3': columnCount === 3 },
        { 'lx-form-section-4': columnCount === 4 },
        { 'lx-form-section-8': columnCount === 8 },
      ]"
    >
      <header v-if="description">
        <p v-if="description" class="lx-description">{{ description }}</p>
      </header>
      <slot />
    </section>
  </LxExpander>
  <section
    v-else
    :id="id"
    class="lx-form-section"
    :class="[
      { 'lx-form-section-1': columnCount === 1 },
      { 'lx-form-section-2': columnCount === 2 },
      { 'lx-form-section-3': columnCount === 3 },
      { 'lx-form-section-4': columnCount === 4 },
      { 'lx-form-section-8': columnCount === 8 },
    ]"
  >
    <header v-if="label || description">
      <h3 v-if="label">{{ label }}</h3>
      <p v-if="description" class="lx-description">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>
