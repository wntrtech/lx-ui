<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';
import LxListItem from '@/components/list/ListItem.vue';
import useLx from '@/hooks/useLx';
import LxRadioButton from '@/components/RadioButton.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxIcon from '@/components/Icon.vue';
// eslint-disable-next-line import/no-self-import
const LxTreeItem = defineAsyncComponent(() => import('@/components/list/TreeItem.vue'));

const props = defineProps({
  id: { type: String, default: generateUUID() },
  items: { type: Array, default: null },
  idAttribute: { type: String, default: 'id' },
  primaryAttribute: { type: String, default: 'name' },
  secondaryAttribute: { type: String, default: 'description' },
  childrenAttribute: { type: String, default: 'children' },
  hasChildrenAttribute: { type: String, default: 'hasChildren' },
  hrefAttribute: { type: String, default: 'href' },
  clickableAttribute: { type: String, default: 'clickable' },
  iconAttribute: { type: String, default: 'icon' },
  iconSetAttribute: { type: String, default: 'iconSet' },
  tooltipAttribute: { type: String, default: 'tooltip' },
  categoryAttribute: { type: String, default: 'category' },
  selectableAttribute: { type: String, default: 'selectable' },
  hasSearch: { type: Boolean, default: false },
  actionDefinitions: { type: Array, default: null },
  icon: { type: String, default: 'open' },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  hasSelecting: { type: Boolean, default: false },
  selectingKind: { type: String, default: 'single' }, // single, multiple
  selectedItems: { type: Object, default: () => {} },
  itemsStates: { type: Object, default: () => {} },
  mode: { type: String, default: 'client' }, // client, server
  texts: { type: Object, default: () => {} },
  parents: { type: Array, default: () => [] },
  children: { type: Object, default: () => {} },
});

const emits = defineEmits([
  'actionClick',
  'update:selectedItems',
  'update:itemsStates',
  'loadChildren',
  'update:selectedChildren',
]);

function actionClicked(actionName, rowCode) {
  emits('actionClick', actionName, rowCode);
}

const selected = computed({
  get() {
    return props.selectedItems;
  },
  set(value) {
    emits('update:selectedItems', value);
  },
});

const states = computed({
  get() {
    return props.itemsStates;
  },
  set(value) {
    emits('update:itemsStates', value);
  },
});

function selectRow(id) {
  selected.value = {};
  selected.value[id] = true;
}

function isExpanded(id) {
  return states.value?.[id]?.expanded;
}

function collapse(id, element) {
  states.value[id] = {
    ...states.value?.[id],
    expanded: !states.value?.[id]?.expanded,
  };
  if (
    props.mode === 'server' &&
    (!element?.[props.childrenAttribute] || element?.[props.childrenAttribute]?.length === 0) &&
    states.value?.[id]?.expanded
  ) {
    emits('loadChildren', id);
    states.value[id] = {
      ...states.value?.[id],
      busy: true,
    };
  }
}

function isExpandable(item) {
  if (props.mode === 'client')
    return item[props.childrenAttribute] && item?.[props.childrenAttribute].length > 0;
  return item[props.hasChildrenAttribute];
}

function hasChildren(item) {
  if (props.mode === 'client')
    return item[props.childrenAttribute] && isExpanded(item[props.idAttribute]);
  return item[props.hasChildrenAttribute] && isExpanded(item[props.idAttribute]);
}

function reloadItem(id) {
  emits('loadChildren', id);
  states.value[id] = {
    ...states.value?.[id],
    busy: true,
  };
}

function loadChildren(id) {
  emits('loadChildren', id);
}

function updateParents(item) {
  const p = [...props.parents];
  p.push(item?.[props.idAttribute]);
  return p;
}

function hasSelectedChildren(id) {
  let res = false;
  Object.keys(selected.value).forEach((key) => {
    if (selected.value[key] && props.children?.[id].includes(key)) res = true;
    return true;
  });
  return res;
}
const allNotExpandable = computed(() => props.items.every((item) => !isExpandable(item)));

const isSelectable = (item) => {
  const attribute = props.selectableAttribute;
  if (item[attribute] === false) return false;
  return item[attribute] !== false;
};
</script>
<template>
  <div class="tree-item" v-for="item in items" :key="item[idAttribute]">
    <div
      class="tree-item-body"
      :class="[
        {
          'not-expandable':
            !isExpandable(item) && (parents.length === 0 ? !allNotExpandable : true),
        },
        { 'selected-children': hasSelectedChildren(item[idAttribute]) },
      ]"
    >
      <LxButton
        v-if="isExpandable(item)"
        kind="ghost"
        :icon="isExpanded(item?.[idAttribute]) ? 'chevron-up' : 'chevron-down'"
        :title="isExpanded(item?.[idAttribute]) ? texts?.collapse : texts?.expand"
        @click="collapse(item?.[idAttribute], item)"
      />
      <LxListItem
        :id="item[idAttribute]"
        :label="item[primaryAttribute]"
        :description="item[secondaryAttribute]"
        :href="item[hrefAttribute]"
        :actionDefinitions="actionDefinitions"
        :icon="item[iconAttribute] ? item[iconAttribute] : icon"
        :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
        :tooltip="item[tooltipAttribute]"
        :category="item[categoryAttribute]"
        :disabled="states?.[item[idAttribute]]?.disabled"
        :busy="states?.[item[idAttribute]]?.busy"
        :value="item"
        @action-click="actionClicked"
      >
        <template #customItem="item" v-if="$slots.customItem">
          <slot name="customItem" v-bind="item" />
        </template>
      </LxListItem>
      <div class="selecting-block" v-if="hasSelecting">
        <template v-if="isSelectable(item)">
          <LxRadioButton
            v-if="selectingKind === 'single'"
            :id="`select-${id}-${item[idAttribute]}`"
            v-model="selected[item[idAttribute]]"
            :value="item[idAttribute]"
            @click="selectRow(item[idAttribute])"
          />
          <LxCheckbox
            v-else
            :id="`select-${id}-${item[idAttribute]}`"
            v-model="selected[item[idAttribute]]"
            :value="item[idAttribute]"
          />
        </template>
        <p v-else class="lx-checkbox-placeholder"></p>
      </div>
    </div>
    <div class="tree-item-invalid" v-if="states?.[item[idAttribute]]?.invalid">
      <div class="invalid-text">
        <LxIcon value="invalid" />
        {{ texts?.loadingError }}
      </div>
      <LxButton
        kind="ghost"
        icon="refresh"
        :title="texts?.reload"
        @click="reloadItem(item[idAttribute])"
      />
    </div>
    <LxTreeItem
      v-if="hasChildren(item)"
      :items="item[childrenAttribute]"
      :idAttribute="idAttribute"
      :primaryAttribute="primaryAttribute"
      :secondaryAttribute="secondaryAttribute"
      :childrenAttribute="childrenAttribute"
      :hasChildrenAttribute="hasChildrenAttribute"
      :hrefAttribute="hrefAttribute"
      :clickableAttribute="clickableAttribute"
      :iconAttribute="iconAttribute"
      :iconSetAttribute="iconSetAttribute"
      :tooltipAttribute="tooltipAttribute"
      :categoryAttribute="categoryAttribute"
      :selectable-attribute="selectableAttribute"
      :action-definitions="actionDefinitions"
      :icon="icon"
      :iconSet="iconSet"
      :hasSelecting="hasSelecting"
      :selectingKind="selectingKind"
      v-model:selected-items="selected"
      v-model:items-states="states"
      :mode="mode"
      :texts="texts"
      @loadChildren="loadChildren"
      :parents="updateParents(item)"
      :children="children"
    >
      <template #customItem="customItem" v-if="$slots.customItem">
        <slot name="customItem" v-bind="customItem" />
      </template>
    </LxTreeItem>
  </div>
</template>
