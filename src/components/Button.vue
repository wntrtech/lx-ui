<script setup lang="ts">
import { computed, useSlots } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxLoader from '@/components/Loader.vue';
import LxBadge from '@/components/Badge.vue';
import useLx from '@/hooks/useLx';
import { generateUUID } from '@/utils/stringUtils';
import { lxDevUtils } from '@/utils';

const emits = defineEmits(['click']);

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  label: { type: String, default: '', required: true },
  title: { type: String, default: '' },
  busyTooltip: { type: String, default: '' },
  icon: { type: String, default: '' },
  iconSet: { type: String, default: () => useLx().getGlobals()?.iconSet },
  iconVariant: { type: String, default: 'default' },
  kind: { type: String, default: 'default' },
  variant: { type: String, default: 'default' }, // default, icon-only
  destructive: { type: Boolean, default: false },
  href: { type: Object, default: () => {} },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },

  badge: { type: String, default: '' },
  badgeIcon: { type: String, default: null },
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important
  badgeTitle: {
    type: String,
    default: null,
    validator: (v, p) => {
      // If badge or badgeIcon is non-empty, badgeTitle must be non-empty
      if ((p.badge || p.badgeIcon) && !v) {
        lxDevUtils.logWarn(
          `Warning: LxButton "badgeTitle" is required when "badge" or "badgeIcon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },

  active: { type: Boolean, default: false },
  tabindex: { type: [Number, String], default: 0 },
  customClass: { type: String, default: '' },
  openInNewTab: { type: Boolean, default: false },
});

const slots = useSlots();

const isDisabled = computed(() => {
  let ret = false;
  if (props.disabled || props.loading || props.busy) {
    ret = true;
  }
  return ret;
});

const showIcon = computed(() => {
  let ret = false;
  if (props.icon) {
    ret = true;
  }
  return ret;
});

const click = (e) => {
  if (props.openInNewTab) emits('click', e, true);
  else emits('click', e);
};

const isIconOnly = computed(() =>
  Boolean(props.variant === 'icon-only' || (!props.label && !slots.default && props.icon))
);

const isTextOnly = computed(() => Boolean((props.label || slots.default) && !props.icon));

const accessibleTitle = computed(() => {
  let tooltip = props.title ? props.title : props.label;
  if (props.busy) {
    tooltip = props.busyTooltip ? props.busyTooltip : tooltip;
  }
  return props.badge ? `${tooltip} (${props.badge})` : tooltip;
});
</script>
<template>
  <button
    v-if="!href"
    :id="id"
    type="button"
    class="lx-button"
    :class="[
      { 'lx-button-secondary': kind === 'secondary' },
      { 'lx-button-tertiary': kind === 'tertiary' },
      { 'lx-button-ghost': kind === 'ghost' },
      { 'lx-button-main': kind === 'main' },
      { 'lx-busy': busy },
      { 'lx-button-icon-only': isIconOnly },
      { 'lx-button-text-only': isTextOnly },
      { 'lx-destructive': destructive },
      { 'lx-active': active },
      { 'lx-disabled': isDisabled },
      customClass,
    ]"
    :title="accessibleTitle"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-pressed="active ? active : null"
    :aria-label="label ? label : null"
    :aria-busy="busy"
    :tabindex="tabindex"
    @click="click"
    @keydown.enter.stop.prevent="() => null"
    @keyup.enter.stop.prevent="click"
  >
    <div class="lx-button-content-wrapper">
      <template v-if="showIcon">
        <LxIcon
          v-show="!busy"
          :value="icon"
          :icon-set="iconSet"
          :variant="iconVariant"
          :title="accessibleTitle"
          :meaningful="isIconOnly"
          class="lx-button-icon"
        />
        <div class="lx-loader-container" v-if="busy">
          <LxLoader :loading="true" size="s" />
        </div>
      </template>
      <div v-if="!showIcon"></div>
      <div
        class="lx-button-content"
        v-if="variant !== 'icon-only' && (label?.trim() !== '' || $slots.default)"
      >
        <span class="lx-button-label" v-if="label">{{ label }}</span>
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
    </div>
  </button>

  <router-link
    :id="id"
    v-if="href"
    :to="isDisabled ? {} : href"
    class="lx-button"
    :class="[
      { 'lx-button-secondary': kind === 'secondary' },
      { 'lx-button-tertiary': kind === 'tertiary' },
      { 'lx-button-ghost': kind === 'ghost' },
      { 'lx-button-main': kind === 'main' },
      { 'lx-button-icon-only': isIconOnly },
      { 'lx-button-text-only': isTextOnly },
      { 'lx-destructive': destructive },
      { 'lx-active': active },
      { 'lx-disabled': isDisabled },
      customClass,
    ]"
    @click="click"
    :title="accessibleTitle"
    :tabindex="tabindex"
    :aria-busy="busy"
    :target="openInNewTab ? '_blank' : null"
  >
    <div class="lx-button-content-wrapper">
      <template v-if="showIcon">
        <LxIcon
          v-show="!busy"
          :value="icon"
          :icon-set="iconSet"
          :variant="iconVariant"
          :title="accessibleTitle"
          :meaningful="isIconOnly"
          class="lx-button-icon"
        />
        <div class="lx-loader-container" v-if="busy">
          <LxLoader :loading="true" size="s" />
        </div>
      </template>
      <div
        class="lx-button-content"
        v-if="variant !== 'icon-only' && (label?.trim() !== '' || $slots.default)"
      >
        <span class="lx-button-label" v-if="label">{{ label }}</span>
      </div>

      <LxBadge
        :icon="badgeIcon"
        :icon-set="iconSet"
        :value="badge"
        :class="[
          { 'lx-badge-empty': badge === ' ' },
          { 'lx-badge-info': badgeType === 'default' || badgeType === 'info' },
          { 'lx-badge-good': badgeType === 'good' },
          { 'lx-badge-warning': badgeType === 'warning' },
          { 'lx-badge-important': badgeType === 'important' },
        ]"
      />
    </div>
  </router-link>
  <div class="lx-invisible" aria-live="polite" v-if="props.busy">{{ props.busyTooltip }}</div>
</template>
