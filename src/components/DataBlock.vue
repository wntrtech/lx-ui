<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxLoader from '@/components/Loader.vue';
import useLx from '@/hooks/useLx';
import LxCheckbox from '@/components/Checkbox.vue';
import LxRadioButton from '@/components/RadioButton.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: 'default' },
  modelValue: { type: Boolean, default: false },
  size: { type: String, default: 'm' }, // 'm' medium or 'l' large
  icon: { type: String, default: null },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  name: { type: String, default: null },
  description: { type: String, default: null },
  forceUppercase: { type: Boolean, default: true },
  expandable: { type: Boolean, default: false },
  actionDefinitions: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  hasSelecting: { type: Boolean, default: false },
  selectingKind: { type: String, default: 'single' }, // 'single' or 'multiple'
  selected: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  overflowMenu: 'Atvērt papildu iespējas',
  expand: 'Atvērt',
  collapse: 'Aizvērt',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits([
  'actionClick',
  'update:modelValue',
  'selectingClick',
  'update:selected',
]);
function actionClicked(actionName, selectedItemId = 'default') {
  emits('actionClick', actionName, selectedItemId);
}

const isDisabled = computed(() => {
  let res = false;
  if (props.disabled || props.busy || props.loading) {
    res = true;
  }
  return res;
});
const expanded = shallowRef(props.modelValue);

// Provides a way to toggle the expanded state of the component
function toggleExpander() {
  if (!props.disabled) {
    if (expanded.value !== null && props.expandable) {
      expanded.value = !expanded.value;
      emits('update:modelValue', expanded.value);
    }
  }
}
watch(
  () => props.modelValue,
  (newValue) => {
    if (expanded.value !== newValue && props.expandable && !props.disabled) {
      expanded.value = newValue;
    }
  }
);
watch(
  () => props.expandable,
  (newValue) => {
    if (!newValue) {
      expanded.value = false;
      emits('update:modelValue', expanded.value);
    } else if (newValue && props.modelValue) {
      expanded.value = true;
    }
  }
);
const actionDefinitionsLength = computed(() => Object.keys(props.actionDefinitions).length);

const selected = computed({
  get() {
    return props.selected;
  },
  set(value) {
    emits('update:selected', value);
  },
});

const expandIcon = computed(() => {
  if (props.invalid && !props.busy) {
    return 'invalid';
  }
  if (expanded.value) {
    return 'chevron-up';
  }
  return 'chevron-down';
});

const expandIconTitle = computed(() => {
  if (props.invalid && !props.busy) {
    return props.invalidationMessage;
  }
  if (expanded.value) {
    return displayTexts.value.collapse;
  }
  return displayTexts.value.expand;
});
</script>
<template>
  <div
    class="lx-data-block-wrapper"
    :class="[
      { 'lx-data-block-wrapper-m': size === 'm' },
      { 'lx-data-block-wrapper-l': size === 'l' },
      { 'lx-data-block-expander': expandable },
      { 'lx-data-block-expanded': expanded },
      { 'lx-data-block-disabled': disabled || busy || loading },
      { 'lx-data-block-custom-header': $slots.customHeader },
      { 'lx-data-block-invalid': invalid },
      { 'lx-data-block-busy': busy },
    ]"
  >
    <div class="lx-data-block">
      <header
        class="lx-data-block-header"
        :for="id"
        :tabindex="expandable && !disabled ? 0 : -1"
        :aria-invalid="invalid"
        :aria-describedby="`data-block-${id}-desc`"
        @click="toggleExpander"
        @keydown.space.prevent="toggleExpander"
      >
        <slot name="customHeader" v-if="$slots.customHeader" />
        <template v-else>
          <div class="lx-icons" v-if="hasSelecting" @click.stop>
            <LxRadioButton
              v-model="selected"
              @click="emits('selectingClick', id)"
              v-if="props.hasSelecting && props.selectingKind === 'single'"
            />
            <LxCheckbox
              v-model="selected"
              @click="emits('selectingClick', id)"
              v-if="props.hasSelecting && props.selectingKind === 'multiple'"
            />
          </div>
          <div class="lx-icons" v-if="props.icon !== null && !hasSelecting">
            <LxIcon v-if="icon && !busy" :value="icon" customClass="lx-icon" :iconSet="iconSet" />
            <div class="lx-loader-container" v-show="busy">
              <LxLoader :loading="true" size="s" />
            </div>
          </div>
          <div v-if="props.icon === null && !hasSelecting" />
          <div class="lx-content">
            <div
              :class="[{ 'lx-primary-uppercase': forceUppercase }]"
              class="lx-primary lx-title"
              :title="name"
            >
              {{ name }}
            </div>
            <div
              class="lx-secondary"
              :id="`data-block-${id}-desc`"
              :title="description"
              v-show="description"
            >
              {{ description }}
            </div>
          </div>
          <div class="lx-indications" v-if="expandable">
            <LxIcon
              v-show="expandable"
              :value="expandIcon"
              :title="expandIconTitle"
              :meaningful="invalid"
            />
          </div>
          <div v-if="!expandable" />
        </template>
      </header>
      <div class="additional-buttons" v-if="Number(actionDefinitionsLength) !== 0">
        <template v-if="actionDefinitions.length === 1">
          <LxButton
            v-for="action in actionDefinitions"
            :key="action.id"
            kind="ghost"
            variant="icon-only"
            tabindex="0"
            :icon="action.icon"
            :label="action.title || action.name"
            :destructive="action.destructive"
            :disabled="isDisabled || action.disabled"
            @click="actionClicked(action.id, props.id)"
          />
        </template>
        <LxDropDownMenu
          :actionDefinitions="actionDefinitions"
          @actionClick="(id) => actionClicked(id, props.id)"
        >
          <div class="lx-toolbar" v-if="actionDefinitions.length >= 2">
            <LxButton
              icon="overflow-menu"
              kind="ghost"
              :disabled="isDisabled"
              :label="displayTexts.overflowMenu"
              variant="icon-only"
              tabindex="-1"
            />
          </div>
          <template v-slot:toolbar />
        </LxDropDownMenu>
      </div>
      <div v-if="Number(actionDefinitionsLength) === 0" />
    </div>
    <article class="lx-data-block-content">
      <transition name="expander-transition">
        <div class="lx-main" v-show="expanded">
          <slot />

          <footer v-show="$slots.toolbar" class="lx-button-set">
            <slot name="toolbar" />
          </footer>
        </div>
      </transition>
    </article>
  </div>
</template>
