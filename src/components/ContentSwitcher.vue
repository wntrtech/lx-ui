<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import LxIcon from '@/components/Icon.vue';
import useLx from '@/hooks/useLx';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: String, default: null },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  kind: { type: String, default: 'default' }, // default, icon-only, combo
  icon: { type: String, default: 'default' },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  tooltip: { type: String, default: null },
});

const emits = defineEmits(['update:modelValue', 'changed']);

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
  emits('changed', model.value);
}

function focusPreviousTab() {
  const index = props.items.findIndex((obj) => obj[props.idAttribute] === highlightedItemId.value);
  if (index > 0) {
    highlightedItemId.value = props.items[index - 1][props.idAttribute];
  } else {
    highlightedItemId.value = props.items[props.items.length - 1][props.idAttribute];
  }
  document.getElementById(highlightedItemId.value).focus();
}
function focusNextTab() {
  const index = props.items.findIndex((obj) => obj[props.idAttribute] === highlightedItemId.value);
  if (index < props.items.length - 1) {
    highlightedItemId.value = props.items[index + 1][props.idAttribute];
  } else {
    highlightedItemId.value = props.items[0][props.idAttribute];
  }
  document.getElementById(highlightedItemId.value).focus();
}

onMounted(() => {
  if (model.value) {
    highlightedItemId.value = model.value;
  } else {
    highlightedItemId.value = props.items[0][props.idAttribute];
  }
});
function checkIfHihlighted(id) {
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
    :class="[{ 'lx-icons-content-switcher': kind === 'combo' }]"
    v-else
  >
    <div
      :title="tooltip"
      class="lx-content-switcher-grid"
      :class="[{ 'lx-disabled': props.disabled }]"
      tabindex="-1"
      role="tablist"
      :style="`grid-template-columns: repeat(${props.items.length}, 1fr)`"
    >
      <div
        v-for="item in items"
        :key="item[props.idAttribute]"
        :id="item[props.idAttribute]"
        :disabled="disabled"
        :tabindex="checkIfHihlighted(item[props.idAttribute])"
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
        <LxIcon
          :value="item['icon'] ? item['icon'] : icon"
          :iconSet="item['iconSet'] ? item['iconSet'] : iconSet"
          v-if="kind === 'iconOnly' || kind === 'icon-only' || kind === 'combo'"
        />
        <p v-if="kind === 'default' || kind === 'combo'">{{ item[props.nameAttribute] }}</p>
      </div>
    </div>
  </div>
</template>
