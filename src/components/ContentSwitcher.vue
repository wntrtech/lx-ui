<script setup lang="ts">
import { computed, ref, onMounted, inject } from 'vue';
import LxIcon from '@/components/Icon.vue';
import useLx from '@/hooks/useLx';
import { useWindowSize } from '@vueuse/core';
import { lxDevUtils, lxStringUtils } from '@/utils';

const props = defineProps({
  id: { type: String, default: () => lxStringUtils.generateUUID() },
  modelValue: { type: String, default: null },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  kind: { type: String, default: 'default' }, // default, icon-only, combo
  icon: { type: String, default: null },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  tooltip: { type: String, default: null },
  labelId: { type: String, default: null },
});

const emits = defineEmits(['update:modelValue']);

const globalEnvironment = useLx().getGlobals()?.environment;
const windowSize = useWindowSize();
const isWideScreen = computed(() => windowSize.width.value > 800);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (!props.disabled) emits('update:modelValue', value);
  },
});

const highlightedItemId = ref(null);
function getName() {
  const result = props.items?.find((obj) => obj[props.idAttribute] === model.value);
  if (result) {
    return result[props.nameAttribute];
  }
  return null;
}

function selectTab() {
  model.value = highlightedItemId.value;
}

function focusPreviousTab() {
  const index = props.items.findIndex((obj) => obj[props.idAttribute] === highlightedItemId.value);
  if (index > 0) {
    highlightedItemId.value = props.items[index - 1][props.idAttribute];
  } else {
    highlightedItemId.value = props.items[props.items.length - 1][props.idAttribute];
  }
  document.getElementById(`${props.id}-${highlightedItemId.value}`).focus();
}
function focusNextTab() {
  const index = props.items.findIndex((obj) => obj[props.idAttribute] === highlightedItemId.value);
  if (index < props.items.length - 1) {
    highlightedItemId.value = props.items[index + 1][props.idAttribute];
  } else {
    highlightedItemId.value = props.items[0][props.idAttribute];
  }
  document.getElementById(`${props.id}-${highlightedItemId.value}`).focus();
}

const showIconsMode = computed(
  () =>
    props.kind === 'iconOnly' ||
    props.kind === 'icon-only' ||
    props.kind === 'combo' ||
    (props.kind === 'default' && !isWideScreen.value)
);

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  if (model.value) {
    highlightedItemId.value = model.value;
  } else {
    highlightedItemId.value = props.items[0][props.idAttribute];
  }
  if (props.items.length > 4) {
    lxDevUtils.logWarn('There are more than 4 items', globalEnvironment);
  }
});

function checkIfHighlighted(id) {
  if (highlightedItemId.value === id) {
    return 0;
  }
  return -1;
}
</script>
<template>
  <div class="lx-field-wrapper" v-if="readOnly">
    <p class="lx-data">{{ getName() }}</p>
  </div>
  <div
    class="lx-content-switcher"
    :class="[{ 'lx-icons-content-switcher': kind === 'combo' && isWideScreen }]"
    v-else
  >
    <div
      class="lx-content-switcher-grid"
      :class="[{ 'lx-disabled': props.disabled }]"
      tabindex="-1"
      role="tablist"
      :style="`grid-template-columns: repeat(${props.items.length}, 1fr)`"
      :aria-labelledby="labelledBy"
    >
      <div
        v-for="(item, index) in items"
        :key="item[props.idAttribute]"
        :id="`${id}-${item[props.idAttribute]}`"
        :disabled="disabled"
        :tabindex="disabled ? '-1' : checkIfHighlighted(item[props.idAttribute])"
        :title="props.tooltip ? `${props.tooltip}: ${item.name}` : item.name"
        role="tab"
        class="lx-content-switcher-item"
        :class="[
          { 'lx-selected': modelValue === item[props.idAttribute] },
          {
            'lx-highlighted-item':
              highlightedItemId && highlightedItemId === item[props.idAttribute],
          },
          { 'lx-disabled': props.disabled },
        ]"
        :aria-selected="modelValue === item[props.idAttribute]"
        @keydown.enter.prevent="selectTab"
        @keydown.space.prevent="selectTab"
        @keydown.right.prevent="focusNextTab"
        @keydown.left.prevent="focusPreviousTab"
        @click="model = item[props.idAttribute]"
      >
        <!--Fade-in strādā, fade-out vajag noņemt-->
        <Transition :name="`icon-default`">
          <div class="index-icon" v-if="showIconsMode && !item['icon'] && icon === null">
            {{ index + 1 }}
          </div>
        </Transition>

        <LxIcon
          :value="item['icon'] || icon"
          :iconSet="item['iconSet'] ? item['iconSet'] : iconSet"
          :title="item[props.nameAttribute]"
          v-if="(showIconsMode && item['icon']) || (icon && showIconsMode)"
        />
        <div v-if="(kind === 'default' || kind === 'combo') && isWideScreen">
          {{ item[props.nameAttribute] }}
        </div>
      </div>
    </div>
  </div>
</template>
