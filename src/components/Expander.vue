<script setup lang="ts">
import { shallowRef, watch, computed } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import useLx from '@/hooks/useLx';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  id: { type: String, default: null },
  label: { type: String, default: null },
  description: { type: String, default: null },
  region: { type: Boolean, default: false },
  icon: { type: String, default: null },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  tooltip: { type: String, default: null },
  kind: { type: String, default: 'row' }, // 'row' or 'column'
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  variant: { type: String, default: 'default' }, // 'default' or 'highlighted'
  badge: { type: String, default: '' },
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important},
  hasSelectButton: { type: Boolean, default: false },
  selectStatus: { type: String, default: 'none' }, // none, some, all
  texts: {
    type: Object,
    default: () => ({
      selectWholeGroup: 'Izvēlēties visu',
      clearSelected: 'Attīrīt izvēles',
    }),
  },
});

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

function selectExpander(event, id) {
  event.stopPropagation();
  emits('selectAll', id);
}
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
    ]"
    :data-disabled="disabled ? '' : null"
  >
    <header
      :class="[{ 'lx-head': !$slots.customHeader }, { 'lx-custom-header': $slots.customHeader }]"
      :for="id"
      :title="tooltip"
      @click="toggleExpander"
      @keyup.space.prevent="toggleExpander"
      @keyup.enter.prevent="toggleExpander"
      tabindex="0"
      role="button"
      :aria-expanded="isExpandedRaw"
      aria-controls="lx-body"
    >
      <template v-if="$slots.customHeader">
        <slot name="customHeader" v-bind="props"> </slot>
      </template>

      <template v-else>
        <div class="lx-group">
          <template v-if="icon">
            <lx-icon customClass="lx-modifier-icon" :value="icon" :icon-set="iconSet" />
            <div class="lx-indicator"></div>
          </template>
          <div class="lx-header-data">
            <h4 v-if="label">{{ label }}</h4>
            <p v-if="description" class="lx-description">{{ description }}</p>
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
        <p
          class="lx-badge"
          :class="[
            { 'lx-badge-empty': badge === ' ' },
            { 'lx-badge-info': badgeType === 'default' || badgeType === 'info' },
            { 'lx-badge-good': badgeType === 'good' },
            { 'lx-badge-warning': badgeType === 'warning' },
            { 'lx-badge-important': badgeType === 'important' },
          ]"
          v-if="badge"
        >
          {{ badge }}
        </p>

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
          :title="selectStatus === 'none' ? texts.selectWholeGroup : texts.clearSelected"
          @click="selectExpander($event, id)"
        />
      </template>
    </header>
    <transition name="expander-transition">
      <article v-show="isExpandedRaw" class="lx-body">
        <div v-if="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
        <slot></slot>
      </article>
    </transition>
  </div>
</template>
