<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import useLx from '@/hooks/useLx';
import LxListItem from '@/components/list/ListItem.vue';
import LxButton from '@/components/Button.vue';
import LxRadioButton from '@/components/RadioButton.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxIcon from '@/components/Icon.vue';
import LxTreeItem from '@/components/list/TreeItem.vue';

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
  areSomeExpandable: { type: Boolean, default: null },
  query: { type: String, default: '' },
  actionDefinitions: { type: Array, default: null },
  actionsLayout: { type: String, default: 'default' }, // default, vertical
  groupDefinitions: { type: Array, default: null },
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
});

const emits = defineEmits([
  'actionClick',
  'update:selectedItems',
  'update:itemsStates',
  'loadChildren',
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

function loadChildren(id) {
  emits('loadChildren', id);
}

const smallItems = ref(props.items);

watch(
  () => props.items,
  (newValue, oldValue) => {
    if (
      (Array.isArray(oldValue) &&
        oldValue?.length === 0 &&
        Array.isArray(newValue) &&
        newValue?.length > 0) ||
      props.groupDefinitions
    )
      smallItems.value = props.items;
  },
  { immediate: true }
);

function selectRow(id) {
  selected.value = { [id]: true };
}

const level = ref(0);
const parent = ref(null);
const parentArray = ref([props.items]);

function goTo(id, element) {
  parent.value = smallItems.value.find((x) => id === x[props.idAttribute]);
  parentArray.value.push(parent.value);
  smallItems.value = smallItems.value.find((x) => id === x[props.idAttribute])[
    props.childrenAttribute
  ];
  level.value += 1;
  if (
    props.mode === 'server' &&
    (!element?.[props.childrenAttribute] || element?.[props.childrenAttribute]?.length === 0)
  ) {
    loadChildren(id);
    states.value[id] = {
      ...states.value?.[id],
      busy: true,
    };
  }
}

function goBack() {
  if (level.value > 1) {
    smallItems.value = parentArray.value[parentArray.value.length - 2][props.childrenAttribute];
    parentArray.value.pop();
    parent.value = parentArray.value[parentArray.value.length - 1];
  } else {
    smallItems.value = props.items;
    parentArray.value = [props.items];
    parent.value = null;
  }

  level.value -= 1;
}

function isExpandable(item) {
  if (props.mode === 'client')
    return item[props.childrenAttribute] && item?.[props.childrenAttribute].length > 0;
  return item[props.hasChildrenAttribute];
}

function reloadItem(id) {
  emits('loadChildren', id);
  states.value[id] = {
    ...states.value?.[id],
    busy: true,
  };
}

const childMap = computed(() => {
  const map = {};

  function walkTree(node, parentStack) {
    if (!map[node[props.idAttribute]]) {
      map[node[props.idAttribute]] = [];
    }
    parentStack.push(node[props.idAttribute]);

    if (node?.[props.childrenAttribute] && node[props.childrenAttribute].length > 0) {
      node[props.childrenAttribute].forEach((child) => {
        parentStack.forEach((parentId) => {
          if (!map[parentId].includes(child[props.idAttribute])) {
            map[parentId].push(child[props.idAttribute]?.toString());
          }
        });
        walkTree(child, parentStack);
      });
    }

    parentStack.pop();
  }

  props.items.forEach((rootNode) => {
    walkTree(rootNode, []);
  });
  return map;
});

const areSomeExpandable = computed(() => props.items?.some((item) => isExpandable(item)));

const isSelectable = (item) => {
  const attribute = props.selectableAttribute;
  if (item[attribute] === false) return false;
  return item[attribute] !== false;
};

const isItemSelected = computed(() => (itemId) => !!selected.value[itemId]);
</script>
<template>
  <div class="tree-list-wrapper">
    <div class="tree-list" role="list">
      <LxTreeItem
        :items="items"
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
        :actionsLayout="actionsLayout"
        :icon="icon"
        :iconSet="iconSet"
        :hasSelecting="hasSelecting"
        :selectingKind="selectingKind"
        @action-click="actionClicked"
        v-model:selectedItems="selected"
        v-model:itemsStates="states"
        :mode="mode"
        :texts="texts"
        @loadChildren="loadChildren"
        :children="childMap"
        :query="query"
        :areSomeExpandable="props.areSomeExpandable || areSomeExpandable"
      >
        <template #customItem="items" v-if="$slots.customItem">
          <slot name="customItem" v-bind="items" />
        </template>
      </LxTreeItem>
    </div>
    <div class="tree-list tree-list-small" role="list">
      <div v-if="level > 0" class="tree-item-small tree-item-small-parent" role="listitem">
        <LxButton
          v-if="isExpandable(parent)"
          kind="ghost"
          icon="collapse-left"
          :title="texts?.collapse"
          @click="goBack()"
        />
        <div class="lx-list-item-container">
          <LxListItem
            :id="parent[idAttribute]"
            :label="parent[primaryAttribute]"
            :description="parent[secondaryAttribute]"
            :href="parent[hrefAttribute]"
            :clickable="parent[clickableAttribute]"
            :actionDefinitions="actionDefinitions"
            :actionsLayout="actionsLayout"
            :icon="parent[iconAttribute] ? parent[iconAttribute] : icon"
            :iconSet="parent[iconSetAttribute] ? parent[iconSetAttribute] : iconSet"
            :tooltip="parent[tooltipAttribute]"
            :category="parent[categoryAttribute]"
            :disabled="states?.[parent[idAttribute]]?.disabled"
            :busy="states?.[parent[idAttribute]]?.busy"
            :value="parent"
            :selected="isItemSelected(parent[idAttribute])"
            :search-string="query"
            @action-click="actionClicked"
            @click="parent[hrefAttribute] ? null : actionClicked('click', parent[idAttribute])"
          >
            <template #customItem="item" v-if="$slots.customItem">
              <slot name="customItem" v-bind="item" />
            </template>
          </LxListItem>
          <div class="selecting-block" v-if="hasSelecting">
            <template v-if="isSelectable(parent)">
              <LxRadioButton
                v-if="selectingKind === 'single'"
                :id="`select-${id}-${parent[idAttribute]}`"
                v-model="selected[parent[idAttribute]]"
                :value="parent[idAttribute]"
                @click="selectRow(parent[idAttribute])"
              />
              <LxCheckbox
                v-else
                :id="`select-${id}-${parent[idAttribute]}`"
                v-model="selected[parent[idAttribute]]"
                :value="parent[idAttribute]"
              />
            </template>
            <p v-else class="lx-checkbox-placeholder"></p>
          </div>
        </div>
      </div>
      <div class="tree-item-invalid" v-if="states?.[parent?.[idAttribute]]?.invalid">
        <div class="invalid-text">
          <LxIcon value="invalid" />
          {{ texts?.loadingError }}
        </div>
        <LxButton
          kind="ghost"
          icon="refresh"
          :title="texts?.reload"
          @click="reloadItem(parent[idAttribute])"
        />
      </div>
      <div
        v-for="item in smallItems"
        :key="item[idAttribute]"
        class="tree-item-small"
        :class="{
          'not-expandable':
            !isExpandable(item) &&
            (level === 0 ? props.areSomeExpandable || areSomeExpandable : true),
        }"
        role="listitem"
      >
        <LxButton
          v-if="isExpandable(item)"
          kind="ghost"
          icon="collapse-right"
          :title="texts?.expand"
          @click="goTo(item[idAttribute], item)"
        />
        <div class="lx-list-item-container">
          <LxListItem
            :id="item[idAttribute]"
            :label="item[primaryAttribute]"
            :description="item[secondaryAttribute]"
            :href="item[hrefAttribute]"
            :clickable="item[clickableAttribute]"
            :actionDefinitions="actionDefinitions"
            :actionsLayout="actionsLayout"
            :icon="item[iconAttribute] ? item[iconAttribute] : icon"
            :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
            :tooltip="item[tooltipAttribute]"
            :category="item[categoryAttribute]"
            :disabled="states?.[item[idAttribute]]?.disabled"
            :busy="states?.[item[idAttribute]]?.busy"
            :value="item"
            :selected="isItemSelected(item[idAttribute])"
            @action-click="actionClicked"
            @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
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
      </div>
    </div>
  </div>
</template>
