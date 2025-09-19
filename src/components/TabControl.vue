<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxDropDown from '@/components/Dropdown.vue';
import { useElementBounding, useElementSize } from '@vueuse/core';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
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

const activeItemName = computed(() => {
  const selectedItem = props.value.find((item) => item.id === activeItemCode.value);
  return selectedItem?.name ?? '';
});

const announcementMessage = ref('');

function setActiveTab(itemCode) {
  activeItemCode.value = itemCode;
  activeItem.value = itemRefs.value.find((o) => o.id === `tab-${itemCode}`);
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
  setActiveTab(props.value[props.value.findIndex((o) => o.id === activeItemCode.value) + 1]?.id);
  setAnnouncementMessage();
}

function setPreviousTab() {
  setActiveTab(props.value[props.value.findIndex((o) => o.id === activeItemCode.value) - 1]?.id);
  setAnnouncementMessage();
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
          :id="`tab-${t.id}`"
          v-for="t in props.value"
          :key="t.id"
          ref="itemRefs"
          class="lx-tab"
          :class="[{ 'lx-selected': isActiveTab(t.id) }, { 'lx-invalid': t.invalid }]"
          :title="t.invalid ? t.invalidationMessage : ''"
          tabindex="0"
          role="tab"
          :aria-selected="isActiveTab(t.id)"
          @click="setActiveTab(t.id)"
          @keyup.enter="setActiveTab(t.id)"
          @keyup.space="setActiveTab(t.id)"
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
