<script setup lang="ts">
import { computed, ref } from 'vue';
import LxButton from '@/components/Button.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxListItem from '@/components/list/ListItem.vue';
import { useWindowSize, useElementSize } from '@vueuse/core';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  mode: { type: String, default: 'edit' }, // 'read' or 'edit'
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: null },
  categoryAttribute: { type: String, default: 'category' },
  invalidAttribute: { type: String, default: 'invalid' },
  texts: {
    type: Object,
    default: () => ({
      add: 'Pievienot ierakstu',
      noData: 'Nav datu',
      noDataDescription: 'Izvēlieties ierakstu, lai apskatītu datus',
      back: 'Atgriezties atpakaļ',
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'newItemAdded', 'selectionChanged']);

const windowSize = useWindowSize();

const windowWidth = computed(() => windowSize.width.value);

const activeItemCode = ref('');

const model = computed({
  get() {
    return props.modelValue?.map((item) => {
      const newItem = { ...item };
      if (item?.[props.idAttribute] === activeItemCode.value) {
        newItem.active = true;
      }
      return newItem;
    });
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

function selectItem(id) {
  activeItemCode.value = id;
  emits('selectionChanged', id);
}

function addItem() {
  emits('newItemAdded');
}

const nav = ref();
const detail = ref();

const isNavBigger = computed(() => {
  if (nav.value && detail.value) {
    return useElementSize(nav).height.value > useElementSize(detail).height.value;
  }
  return false;
});

defineExpose({ selectItem });
</script>
<template>
  <div class="lx-master-detail" :class="[{ 'nav-border': isNavBigger }]">
    <Transition :name="windowWidth < 1200 ? 'master-detail-slide-right' : ''">
      <nav class="lx-master" v-if="windowWidth >= 1200 || !activeItemCode" ref="nav">
        <LxButton
          v-if="mode === 'edit'"
          customClass="lx-master-detail-button"
          icon="add-item"
          kind="tertiary"
          :label="texts?.add"
          @click="addItem"
        />
        <ul class="lx-master-detail-list">
          <li v-for="item in model" :key="item?.[idAttribute]">
            <LxListItem
              :id="item?.[idAttribute]"
              :label="item?.[nameAttribute]"
              :description="item?.[descriptionAttribute]"
              :category="item[categoryAttribute]"
              :invalid="item?.[invalidAttribute]"
              :tooltip="item?.[nameAttribute]"
              :selected="activeItemCode === item?.[idAttribute]"
              icon="next"
              :clickable="true"
              :active="activeItemCode === item?.[idAttribute]"
              @click="selectItem(item?.[idAttribute])"
            />
          </li>
        </ul>
      </nav>
    </Transition>

    <LxButton
      icon="back"
      @click="activeItemCode = null"
      v-if="windowWidth < 1200 && activeItemCode"
      :title="texts.back"
      kind="ghost"
    />
    <Transition :name="windowWidth < 1200 ? 'master-detail-slide-left' : ''">
      <div class="lx-detail" v-if="windowWidth >= 1200 || activeItemCode" ref="detail">
        <LxEmptyState
          v-if="!activeItemCode"
          :label="texts?.noData"
          :description="texts?.noDataDescription"
        />
        <slot v-else />
      </div>
    </Transition>
  </div>
</template>
