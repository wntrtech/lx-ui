<script setup lang="ts">
import { computed } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxLoader from '@/components/Loader.vue';
import LxBadge from '@/components/Badge.vue';
import useLx from '@/hooks/useLx';
import { generateUUID } from '@/utils/stringUtils';
import { lxDevUtils } from '@/utils';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  label: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  kind: {
    type: String,
    default: 'default', // default || mini
  },
  to: {
    type: Object,
    default: null,
  },
  href: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  busy: {
    type: Boolean,
    default: false,
  },
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
          `Warning: LxTile "badgeTitle" is required when  "badgeIcon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },
});

const isDisabled = computed(() => {
  let ret = false;
  if (props.disabled || props.loading || props.busy) {
    ret = true;
  }
  return ret;
});

const tooltipComputed = computed(() => (props.title ? props.title : props.description));
</script>
<template>
  <div class="lx-tile-wrapper">
    <router-link
      :id="id"
      :to="to || href"
      class="lx-tile"
      :class="[{ 'lx-mini': kind === 'mini' }, { 'lx-disabled': isDisabled }]"
      :title="tooltipComputed"
      :aria-labelledby="label ? `${id}-label` : null"
      :aria-describedby="description ? `${id}-desc` : null"
    >
      <header>
        <p :id="`${id}-label`" class="lx-primary">{{ label }}</p>
        <p :id="`${id}-desc`" class="lx-description lx-secondary">{{ description }}</p>
      </header>
      <div class="lx-tile-icon-wrapper" v-if="!busy">
        <LxIcon
          :value="icon"
          :icon-set="iconSet"
          customClass="lx-icon lx-tile-icon"
          :title="label"
          :desc="description"
        />
        <div class="badge-wrapper">
          <LxBadge
            :icon="badgeIcon"
            :iconSet="iconSet"
            :value="badge"
            :tooltip="badgeTitle"
            :class="[
              { 'lx-badge-empty': badge === ' ' && !badgeIcon },
              { 'lx-badge-info': badgeType === 'default' || badgeType === 'info' },
              { 'lx-badge-good': badgeType === 'good' },
              { 'lx-badge-warning': badgeType === 'warning' },
              { 'lx-badge-important': badgeType === 'important' },
            ]"
          />
        </div>
      </div>
      <div class="lx-tile-item-loader" v-else>
        <LxLoader :loading="true" size="s" @click.stop />
        <div class="badge-wrapper">
          <LxBadge
            :icon="badgeIcon"
            :iconSet="iconSet"
            :value="badge"
            :tooltip="badgeTitle"
            :class="[
              { 'lx-badge-empty': badge === ' ' && !badgeIcon },
              { 'lx-badge-info': badgeType === 'default' || badgeType === 'info' },
              { 'lx-badge-good': badgeType === 'good' },
              { 'lx-badge-warning': badgeType === 'warning' },
              { 'lx-badge-important': badgeType === 'important' },
            ]"
          />
        </div>
      </div>

      <article class="lx-main"><slot /></article>
    </router-link>
  </div>
</template>
