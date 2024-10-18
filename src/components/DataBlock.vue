<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxLoader from '@/components/Loader.vue';
import useLx from '@/hooks/useLx';
import LxCheckbox from '@/components/Checkbox.vue';
import LxRadioButton from '@/components/RadioButton.vue';

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
});

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
    ]"
  >
    <div class="lx-data-block">
      <header
        class="lx-data-block-header"
        :for="id"
        @click="toggleExpander"
        @keyup.space="toggleExpander"
        tabindex="0"
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
            <lx-icon v-if="icon && !busy" :value="icon" customClass="lx-icon" :iconSet="iconSet" />
            <div class="lx-loader-container" v-show="busy">
              <lx-loader :loading="true" size="s" />
            </div>
          </div>
          <div v-if="props.icon === null && !hasSelecting"></div>
          <div class="lx-content">
            <p
              :class="[{ 'lx-primary-uppercase': forceUppercase }]"
              class="lx-primary lx-title"
              :title="name"
            >
              {{ name }}
            </p>
            <p class="lx-secondary" :title="description" v-show="description">{{ description }}</p>
          </div>
          <div class="lx-indications" v-if="expandable">
            <lx-icon v-show="expandable" :value="expanded ? 'chevron-up' : 'chevron-down'" />
          </div>
          <div v-if="!expandable"></div>
        </template>
      </header>
      <div class="additional-buttons" v-if="Number(actionDefinitionsLength) !== 0">
        <template v-if="actionDefinitions.length === 1">
          <LxButton
            v-for="action in actionDefinitions"
            :key="action.id"
            kind="ghost"
            variant="default"
            tabindex="0"
            :icon="action.icon"
            :title="action.title ? action.title : action.name"
            :destructive="action.destructive"
            :disabled="isDisabled || action.disabled"
            @click="actionClicked(action.id, props.id)"
          />
        </template>
        <LxDropDownMenu>
          <div class="lx-toolbar" v-if="actionDefinitions.length >= 2">
            <LxButton icon="overflow-menu" kind="ghost" :disabled="isDisabled" />
          </div>
          <template #panel>
            <div class="lx-button-set">
              <LxButton
                v-for="action in actionDefinitions"
                :key="action.id"
                :icon="action.icon"
                :label="action.name"
                :title="action.name"
                tabindex="0"
                :destructive="action.destructive"
                :disabled="isDisabled || action.disabled"
                @click="actionClicked(action.id, props.id)"
              />
            </div>
          </template>
          <template v-slot:toolbar></template>
        </LxDropDownMenu>
      </div>
      <div v-if="Number(actionDefinitionsLength) === 0"></div>
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
