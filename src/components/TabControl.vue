<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxDropDown from '@/components/Dropdown.vue';
import { useElementBounding, useElementSize } from '@vueuse/core';
import { getDisplayTexts } from '@/utils/generalUtils';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  value: { type: Array, default: () => [] },
  level: { type: Number, default: 1 },
  kind: { type: String, default: 'default' }, // 'default', 'icon-only', 'combo'
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  previous: 'Iepriekšējais solis',
  next: 'Nākamais solis',
  tabSelected: 'Tika izvēlēta cilne',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const activeItemCode = ref('');
const activeItem = ref(null);
const itemRefs = ref([]);
const highlightedTabId = ref(null);

const activeItemName = computed(() => {
  const selectedItem = props.value.find((item) => item.id === activeItemCode.value);
  return selectedItem?.name ?? '';
});

const announcementMessage = ref('');

function setActiveTab(itemCode) {
  activeItemCode.value = itemCode;
  highlightedTabId.value = itemCode;
  activeItem.value = itemRefs.value.find((o) => o.id === `${props.id}-tab-${itemCode}`);
  activeItem.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function isActiveTab(itemCode) {
  return itemCode === activeItemCode.value;
}

function setAnnouncementMessage() {
  if (announcementMessage.value) announcementMessage.value = '';
  nextTick(() => {
    announcementMessage.value = `${displayTexts.value.tabSelected} "${activeItemName.value}"`;
  });
}

function setNextTab() {
  const nextActiveTabId =
    props.value[props.value.findIndex((o) => o.id === activeItemCode.value) + 1]?.id;
  highlightedTabId.value = nextActiveTabId;
  setActiveTab(nextActiveTabId);
  setAnnouncementMessage();
}

function setPreviousTab() {
  const nextActiveTabId =
    props.value[props.value.findIndex((o) => o.id === activeItemCode.value) - 1]?.id;
  highlightedTabId.value = nextActiveTabId;
  setActiveTab(nextActiveTabId);
  setAnnouncementMessage();
}

function focusPreviousTab() {
  const index = props.value.findIndex((obj) => obj.id === highlightedTabId.value);
  if (index > 0) {
    highlightedTabId.value = props.value[index - 1].id;
  } else {
    highlightedTabId.value = props.value[props.value.length - 1].id;
  }
  document.getElementById(`${props.id}-tab-${highlightedTabId.value}`).focus();
}

function focusNextTab() {
  const index = props.value.findIndex((o) => o.id === highlightedTabId.value);
  if (index < props.value.length - 1) {
    highlightedTabId.value = props.value[index + 1].id;
  } else {
    highlightedTabId.value = props.value[0].id;
  }
  document.getElementById(`${props.id}-tab-${highlightedTabId.value}`).focus();
}

function calculateOffset(el) {
  const navRems = getComputedStyle(el).getPropertyValue('--nav-row-size').trim();
  const { fontSize } = getComputedStyle(el);
  return parseInt(navRems, 10) * parseFloat(fontSize);
}

const tabHeader = ref();
const tabControl = ref();
const bounding = useElementBounding(tabControl);
const headerSize = useElementSize(tabHeader);

const topOutOfBounds = computed(() => {
  const keyOpacity = '--tab-control-shadow-opacity';
  const keySize = '--tab-control-header-size';
  const limit = 100;
  const size = headerSize.height?.value;

  if (!tabControl.value || !tabHeader.value)
    return `${keyOpacity}: 0; ${keySize}: var(--row-size);`;

  const v = bounding.top ? bounding.top.value - calculateOffset(tabControl.value) : 0;
  if (v < 0 - limit) {
    return `${keyOpacity}: 1; ${keySize}: ${size}px;`;
  }
  if (v < 0) {
    return `${keyOpacity}: ${(0 - v) / limit}; ${keySize}: ${size}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${size}px;`;
});

onMounted(() => {
  if (props.value && props.value.length > 0) {
    setActiveTab(props.value[0].id);
  }

  if (activeItemCode.value) {
    highlightedTabId.value = activeItemCode.value;
  } else if (props.value && props.value.length > 0) {
    highlightedTabId.value = props.value[0].id;
  }
});

defineExpose({ setActiveTab, isActiveTab, setAnnouncementMessage });
</script>
<template>
  <div class="lx-tab-control" :style="`${topOutOfBounds}`" ref="tabControl">
    <header
      ref="tabHeader"
      class="lx-toolbar"
      :class="[
        { 'lx-sticky': level === 1 },
        { 'lx-sticky-2': level > 1 },
        { 'tab-control-default': kind === 'default' },
      ]"
    >
      <div class="lx-tab-container">
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
        <div
          :id="`${id}-tab-${t.id}`"
          v-for="t in props.value"
          :key="t.id"
          ref="itemRefs"
          class="lx-tab"
          :class="[{ 'lx-selected': isActiveTab(t.id) }, { 'lx-invalid': t.invalid }]"
          :title="t.invalid ? t.invalidationMessage : ''"
          :tabindex="isActiveTab(t.id) ? '0' : '-1'"
          role="tab"
          :aria-selected="isActiveTab(t.id)"
          @click="setActiveTab(t.id)"
          @keyup.enter="setActiveTab(t.id)"
          @keyup.space="setActiveTab(t.id)"
          @keydown.left.prevent="focusPreviousTab"
          @keydown.right.prevent="focusNextTab"
          @keydown.space.prevent
        >
          <p class="lx-primary" v-if="kind !== 'icon-only'">{{ t.name }}</p>
          <LxIcon :value="t.icon" customClass="item-icon" v-if="kind !== 'default' && !t.invalid" />
          <lx-icon
            value="invalid"
            customClass="invalid"
            v-show="!(kind !== 'default' && !t.invalid)"
          />
        </div>
      </div>
      <div class="lx-group">
        <LxButton
          icon="previous-page"
          kind="ghost"
          :label="displayTexts.previous"
          variant="icon-only"
          :disabled="isActiveTab(value[0].id)"
          @click="setPreviousTab"
        />
        <LxButton
          icon="next-page"
          kind="ghost"
          :label="displayTexts.next"
          variant="icon-only"
          :disabled="isActiveTab(value[value.length - 1].id)"
          @click="setNextTab"
        />
      </div>

      <div class="lx-dropdown-container">
        <LxDropDown
          :items="props.value"
          :modelValue="activeItemCode"
          @update:modelValue="setActiveTab"
        />
      </div>
    </header>

    <article class="lx-tab-body">
      <transition name="nav">
        <slot name="body" />
      </transition>
    </article>

    <div aria-live="polite" class="lx-invisible">
      {{ announcementMessage }}
    </div>
  </div>
</template>
