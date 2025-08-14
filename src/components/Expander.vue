<script setup lang="ts">
import { shallowRef, watch, computed, ref } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxBadge from '@/components/Badge.vue';
import useLx from '@/hooks/useLx';
import { lxDevUtils } from '@/utils';

const props = defineProps({
  ariaLabel: { type: String, default: null },
  modelValue: { type: Boolean, default: false },
  id: { type: String, default: () => generateUUID() },
  label: { type: String, default: null },
  description: { type: String, default: null },
  region: { type: Boolean, default: false },
  icon: { type: String, default: null },
  iconSet: { type: String, default: () => useLx().getGlobals()?.iconSet },
  tooltip: { type: String, default: null },
  kind: { type: String, default: 'row' }, // 'row' or 'column'
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  variant: { type: String, default: 'default' }, // 'default' or 'highlighted'
  renderMode: { type: String, default: 'default' }, // 'default' or 'dynamic'
  badge: { type: String, default: '' },
  badgeIcon: { type: String, default: null },
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important,
  badgeTitle: {
    type: String,
    default: null,
    validator: (v, p) => {
      // If badge or badgeIcon is non-empty, badgeTitle must be non-empty
      if ((p.badge || p.badgeIcon) && !v) {
        lxDevUtils.logWarn(
          `Warning: LxExpander "badgeTitle" is required when  "badgeIcon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },

  hasSelectButton: { type: Boolean, default: false },
  selectStatus: { type: String, default: 'none' }, // none, some, all
  customClass: { type: String, default: '' },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  selectWholeGroup: 'Izvēlēties visu',
  clearSelected: 'Attīrīt izvēles',
  badgeTypes: {
    default: 'informatīvs paziņojums',
    info: 'informatīvs paziņojums',
    warning: 'brīdinājums',
    good: 'sekmīgs paziņojums',
    important: 'svarīgs paziņojums',
  },
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue', 'selectAll']);

const isExpandedRaw = shallowRef(props.modelValue);

function toggleExpander() {
  if (!props.disabled) {
    if (isExpandedRaw.value !== null) {
      isExpandedRaw.value = !isExpandedRaw.value;
      emits('update:modelValue', isExpandedRaw.value);
    }
  }
}
watch(
  () => props.modelValue,
  (newValue) => {
    if (isExpandedRaw.value !== newValue) {
      isExpandedRaw.value = newValue;
    }
  }
);

const selectedIcon = computed(() => {
  if (props.invalid) {
    return 'invalid';
  }
  if (isExpandedRaw.value) {
    return 'chevron-up';
  }
  return 'chevron-down';
});

const ariaLabelWithBadge = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;

  if (!props.label) return null;

  if (!props.badge && !props.badgeIcon) return props.label;

  const badgeTypeText =
    displayTexts.value.badgeTypes[props.badgeType] || displayTexts.value.badgeTypes.default;

  if (props.badge && props.badge.trim() !== '') {
    if (props.badgeType === 'default') {
      return `${props.label} (${props.badge})`;
    }
    return `${props.label} (${badgeTypeText}, ${props.badge})`;
  }
  return `${props.label} (${badgeTypeText})`;
});

function selectExpander(event, id) {
  event.stopPropagation();
  emits('selectAll', id);
}
const expanderHeader = ref();

function focus() {
  expanderHeader.value.focus();
}

defineExpose({ focus });
</script>

<template>
  <div
    :id="id"
    class="lx-expander"
    :class="[
      { 'lx-expanded': isExpandedRaw },
      { 'lx-expander-row': kind === 'row' },
      { 'lx-expander-column': kind === 'column' },
      { 'lx-expander-highlighted': variant === 'highlighted' },
      { 'lx-region': region },
      { 'lx-invalid': invalid },
      customClass,
    ]"
    :data-disabled="disabled ? '' : null"
  >
    <header
      ref="expanderHeader"
      :class="[{ 'lx-head': !$slots.customHeader }, { 'lx-custom-header': $slots.customHeader }]"
      :for="id"
      :title="tooltip"
      tabindex="0"
      role="button"
      :aria-label="ariaLabelWithBadge"
      :aria-describedby="
        ((badge || badgeIcon) && badgeTitle) || description
          ? [
              (badge || badgeIcon) && badgeTitle ? `${id}-label` : null,
              description ? `${id}-desc` : null,
            ]
              .filter(Boolean)
              .join(' ')
          : null
      "
      :aria-expanded="isExpandedRaw"
      :aria-invalid="invalid"
      aria-controls="lx-body"
      @click="toggleExpander"
      @keydown.space.prevent="toggleExpander"
      @keydown.enter.prevent="toggleExpander"
    >
      <template v-if="$slots.customHeader">
        <slot name="customHeader" v-bind="props"> </slot>
      </template>

      <template v-else>
        <div class="lx-group">
          <template v-if="icon">
            <div class="lx-icon-wrapper">
              <LxIcon customClass="lx-modifier-icon" :value="icon" :icon-set="iconSet" />
              <div class="lx-indicator"></div>
            </div>
          </template>
          <div class="lx-header-data">
            <div :id="`${id}-label`" v-if="label" class="heading-4">
              {{ label }}
            </div>
            <legend :id="`${id}-desc`" v-if="description" class="lx-description">
              {{ description }}
            </legend>
          </div>
          <div class="lx-expander-additional-info" v-if="$slots.additionalInfo">
            <LxInfoWrapper :disabled="disabled">
              <LxIcon value="info" :icon-set="iconSet" customClass="lx-info-icon" />
              <template #panel>
                <slot name="additionalInfo"> </slot>
              </template>
            </LxInfoWrapper>
          </div>
        </div>

        <LxBadge
          :icon="badgeIcon"
          :icon-set="iconSet"
          :value="badge"
          :tooltip="badgeTitle"
          :class="[
            { 'lx-badge-empty': badge === ' ' },
            { 'lx-badge-info': badgeType === 'default' || badgeType === 'info' },
            { 'lx-badge-good': badgeType === 'good' },
            { 'lx-badge-warning': badgeType === 'warning' },
            { 'lx-badge-important': badgeType === 'important' },
          ]"
        />

        <div class="lx-chevron-icon">
          <lx-icon :value="selectedIcon" />
        </div>
        <LxButton
          v-if="hasSelectButton"
          kind="ghost"
          :icon="
            selectStatus === 'all'
              ? 'checkbox-filled'
              : selectStatus === 'some'
              ? 'checkbox-indeterminate'
              : 'checkbox'
          "
          variant="icon-only"
          :label="
            selectStatus === 'none' ? displayTexts.selectWholeGroup : displayTexts.clearSelected
          "
          @click="selectExpander($event, id)"
        />
      </template>
    </header>
    <transition name="expander-transition">
      <article
        v-if="renderMode === 'dynamic' ? isExpandedRaw : true"
        v-show="renderMode === 'default' ? isExpandedRaw : true"
        class="lx-body"
      >
        <div v-if="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
        <slot></slot>
      </article>
    </transition>
  </div>
</template>
