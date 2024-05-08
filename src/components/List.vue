<script setup lang="ts">
import { generateUUID, foldToAscii } from '@/utils/stringUtils';
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxExpander from '@/components/Expander.vue';
import LxIcon from '@/components/Icon.vue';
import LxListItem from '@/components/ListItem.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxLoader from '@/components/Loader.vue';
import { useDebounceFn } from '@vueuse/core';
import useLx from '@/hooks/useLx';
import { lxDevUtils } from '@/utils';
import LxToolbar from '@/components/Toolbar.vue';

import draggable from 'vuedraggable/src/vuedraggable';

const props = defineProps({
  id: { type: String, default: generateUUID() },
  items: { type: Array, default: null },
  hasSearch: { type: Boolean, default: false },
  groupDefinitions: { type: Array, default: null },
  icon: { type: String, default: 'open' },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  kind: { type: String, default: 'default' }, // default, draggable
  idAttribute: { type: String, default: 'id' },
  primaryAttribute: { type: String, default: 'name' },
  secondaryAttribute: { type: String, default: 'description' },
  hrefAttribute: { type: String, default: 'href' },
  groupAttribute: { type: String, default: 'group' },
  clickableAttribute: { type: String, default: 'clickable' },
  iconAttribute: { type: String, default: 'icon' },
  iconSetAttribute: { type: String, default: 'iconSet' },
  tooltipAttribute: { type: String, default: 'tooltip' },
  categoryAttribute: { type: String, default: 'category' },
  orderAttribute: { type: String, default: 'order' },
  actionDefinitions: { type: Array, default: null },
  emptyStateActionDefinitions: { type: Array, default: null },
  emptyStateIcon: { type: String, default: '' },
  listType: { type: String, default: '3' },
  searchString: { type: String, default: '' },
  searchSide: { type: String, default: 'client' }, // client or server
  showLoadMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  hideFilteredItems: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      clear: 'Notīrīt',
      placeholder: 'Ievadiet nosaukuma vai apraksta daļu, lai sameklētu ierakstus',
      notFoundSearch: 'Nav atrasts:',
      noItems: 'Nav ierakstu',
      noItemsDescription: '',
      loadMore: 'Ielādēt vēl',
      search: 'Meklēt',
    }),
  },
});

const emits = defineEmits([
  'actionClick',
  'update:searchString',
  'searched',
  'loadMore',
  'emptyStateActionClick',
  'update:items',
]);
function prepareCode(value) {
  return value?.toString();
}

const modelSearchString = computed({
  get() {
    return props.searchString;
  },
  set(value) {
    emits('update:searchString', value);
  },
});

const responsiveGroupDefinitions = ref(props.groupDefinitions);

watch(
  () => props.groupDefinitions,
  (newValue) => {
    responsiveGroupDefinitions.value = newValue;
  }
);

const query = ref(props.searchString);
const queryRaw = ref(props.searchString);
const debouncedSearchReq = useDebounceFn(async () => {
  if (props.searchSide === 'client') query.value = foldToAscii(queryRaw.value);
  nextTick(() => {
    modelSearchString.value = queryRaw.value;
  });
}, 200);

function serverSideSearch() {
  if (props.searchSide === 'server') emits('searched', foldToAscii(queryRaw.value));
}

const itemsArray = ref([]);

watch(modelSearchString, (newValue, oldValue) => {
  if (newValue !== oldValue) queryRaw.value = modelSearchString.value;
});

function validate() {
  let res = false;
  const mapUnique = new Map();
  props.items?.forEach((x) => {
    if (!mapUnique.has(x[props.idAttribute])) mapUnique.set(x[props.idAttribute], 1);
    else {
      res = true;
    }
  });
  if (res) return 'Item codes are not unique!!!';
  return 0;
}
function isFiltered(value) {
  if (query.value && !value) return false;
  if (query.value && value) {
    return foldToAscii(value).toLowerCase().includes(query.value.toLowerCase());
  }
  return true;
}

function actionClicked(actionName, rowCode) {
  emits('actionClick', actionName, rowCode);
}

const draggableIsDisabled = ref(false);

const filteredItems = computed(() => {
  if (props.items) {
    return props.items.filter(
      (o) => isFiltered(o[props.primaryAttribute]) || isFiltered(o[props.secondaryAttribute])
    );
  }
  return [];
});

const filteredGroupedItems = computed(() => {
  if (props.items && props.groupDefinitions) {
    const ret = {};
    props.groupDefinitions?.forEach((group) => {
      ret[prepareCode(group.id)] = props.items.filter(
        (o) =>
          prepareCode(o[props.groupAttribute]) === prepareCode(group.id) &&
          (isFiltered(o[props.primaryAttribute]) || isFiltered(o[props.secondaryAttribute]))
      );
    });
    return ret;
  }
  return [];
});

function loadMore() {
  emits('loadMore');
}

function clear() {
  query.value = '';
  queryRaw.value = '';
  if (props.searchSide === 'server') serverSideSearch();
}

function fillItemsArray() {
  if (!props.groupDefinitions) return props.items;
  const array = props.groupDefinitions.reduce((acc, group) => {
    const groupItems = props.items
      .filter((item) => item.group?.toString() === group.id?.toString())
      .sort((a, b) => a[props.orderAttribute] - b[props.orderAttribute]);
    acc[group.id.toString()] = groupItems;
    return acc;
  }, {});

  // Need to ungrouped items in itemsArray
  const noGroupItems = props.items.filter((item) => !item.group);
  array.lx_list_nullable_group = noGroupItems;

  return array;
}
function convertItemsArray() {
  if (!props.groupDefinitions) return props.items;
  const array = Object.keys(itemsArray.value).reduce((acc, key) => {
    const items = itemsArray.value[key].map((item) => {
      const originalItem = props.items.find(
        (original) => original[props.idAttribute] === item[props.idAttribute]
      );
      if (originalItem && props.orderAttribute in originalItem) {
        return item;
      }

      const { [props.orderAttribute]: order, ...itemWithoutOrder } = item;
      return itemWithoutOrder;
    });

    return acc.concat(items);
  }, []);

  return array;
}
const ungroupedItemsArray = ref();

function setByOrders(array) {
  if (!props.groupDefinitions) return array;
  const ret = array.sort((a, b) => a[props.orderAttribute] - b[props.orderAttribute]);
  return ret;
}
onMounted(() => {
  const val = validate();
  if (val) {
    lxDevUtils.log(val, useLx().getGlobals()?.environment, 'error');
  }
  itemsArray.value = fillItemsArray();
  ungroupedItemsArray.value = setByOrders(filteredItems.value);
});
defineExpose({ validate });

function searchInItemsArray() {
  if (query.value !== '') {
    itemsArray.value = fillItemsArray();

    Object.keys(itemsArray.value).forEach((key) => {
      if (Array.isArray(itemsArray.value[key])) {
        itemsArray.value[key] = itemsArray.value[key].filter((item) =>
          filteredItems.value.some(
            (filteredItem) => JSON.stringify(filteredItem) === JSON.stringify(item)
          )
        );
      }
    });
    return;
  }
  itemsArray.value = fillItemsArray();
}

watch(
  queryRaw,
  async () => {
    await debouncedSearchReq();
    searchInItemsArray();
    ungroupedItemsArray.value = filteredItems.value;
    if (queryRaw.value === '') {
      draggableIsDisabled.value = false;
    } else {
      draggableIsDisabled.value = true;
    }
  },
  { immediate: true }
);

function emptyStateActionClicked(actionName) {
  emits('emptyStateActionClick', actionName);
}

const dragging = ref(false);

function setGroupedListOrders() {
  Object.keys(itemsArray.value).forEach((key) => {
    if (Array.isArray(itemsArray.value[key])) {
      itemsArray.value[key] = itemsArray.value[key].map((element, index) => {
        const newElement = {
          ...element,
          [props.orderAttribute]: index + 1,
        };

        if (key !== 'lx_list_nullable_group') {
          newElement[props.groupAttribute] =
            element[props.groupAttribute] === key ? element[props.groupAttribute] : key;
        } else {
          delete newElement[props.groupAttribute];
        }

        return newElement;
      });
    }
  });
}
function setListOrders() {
  ungroupedItemsArray.value = ungroupedItemsArray.value.map((element, index) => ({
    ...element,
    [props.orderAttribute]: index + 1,
  }));
}
function prepareUnGroupedItemsArray() {
  return ungroupedItemsArray.value.map((item) => {
    const originalItem = props.items.find(
      (propsItem) => propsItem[props.idAttribute] === item[props.idAttribute]
    );

    if (originalItem && !(props.orderAttribute in originalItem)) {
      const { [props.orderAttribute]: order, ...itemWithoutOrder } = item;
      return itemWithoutOrder;
    }

    return item;
  });
}

function triggerItemsArray() {
  itemsArray.value = fillItemsArray();
}
watch(props.items, () => {
  triggerItemsArray();
});

function onMoveItem() {
  if (props.groupDefinitions) {
    setGroupedListOrders();
    emits('update:items', convertItemsArray());
  } else {
    setListOrders();
    emits('update:items', prepareUnGroupedItemsArray());
  }
}

function changeDragging() {
  nextTick(() => {
    dragging.value = !dragging.value;
  });
}

function focusHandle(element) {
  nextTick(() => {
    document.getElementById(`handleId-${element[props.idAttribute]}`).focus();
  });
  onMoveItem();
}

async function moveUngroupedItem(element, direction) {
  const index = ungroupedItemsArray.value.findIndex(
    (obj) => obj[props.idAttribute] === element[props.idAttribute]
  );
  if (
    (direction === 'forward' && index > 0) ||
    (direction === 'backward' && index < ungroupedItemsArray.value.length - 1)
  ) {
    ungroupedItemsArray.value.splice(index, 1);
    ungroupedItemsArray.value.splice(direction === 'forward' ? index - 1 : index + 1, 0, element);
    focusHandle(element);
  }
}
async function moveGroupedItem(element, direction) {
  const groupCode = prepareCode(element[props.groupAttribute]);
  const groupKeys = Object.keys(itemsArray.value);
  const groupIndex = groupKeys.indexOf(groupCode);
  const itemIndex = itemsArray.value[groupCode].findIndex(
    (obj) => obj[props.idAttribute] === element[props.idAttribute]
  );

  if (
    (direction === 'forward' && itemIndex > 0) ||
    (direction === 'backward' && itemIndex < itemsArray.value[groupCode].length - 1)
  ) {
    itemsArray.value[groupCode].splice(itemIndex, 1);
    itemsArray.value[groupCode].splice(
      direction === 'forward' ? itemIndex - 1 : itemIndex + 1,
      0,
      element
    );
  } else if (
    (direction === 'forward' && groupIndex > 0) ||
    (direction === 'backward' && groupIndex < groupKeys.length - 1)
  ) {
    itemsArray.value[groupCode].splice(itemIndex, 1);
    const newGroupCode = groupKeys[direction === 'forward' ? groupIndex - 1 : groupIndex + 1];
    itemsArray.value[newGroupCode].push(element);

    if (responsiveGroupDefinitions.value[groupKeys.indexOf(newGroupCode)]) {
      responsiveGroupDefinitions.value[groupKeys.indexOf(newGroupCode)].expanded = true;
    }
  }

  focusHandle(element);
}
const dragOptions = computed(() => ({
  animation: 200,
  group: 'list',
  disabled: false,
  ghostClass: 'ghost',
}));

const filteredUngroupedItems = filteredItems.value.filter((item) =>
  Object.values(filteredGroupedItems.value).every(
    (group) => !group.some((groupedItem) => groupedItem.id === item.id)
  )
);
</script>
<template>
  <div class="lx-list-wrapper">
    <LxToolbar class="lx-search-toolbar lx-list-toolbar" :no-borders="true">
      <template #leftArea>
        <lx-text-input
          v-if="hasSearch"
          ref="queryInput"
          v-model="queryRaw"
          :kind="searchSide === 'server' ? 'default' : 'search'"
          :disabled="loading || busy"
          :placeholder="props.texts.placeholder"
          role="search"
          @keydown.enter="serverSideSearch()"
        />
        <div class="lx-group lx-slot-wrapper">
          <lx-button
            v-if="searchSide === 'server' && hasSearch"
            icon="search"
            kind="ghost"
            :busy="busy"
            :disabled="loading"
            :title="texts.search"
            @click="serverSideSearch()"
          />
          <lx-button
            v-if="query || queryRaw"
            icon="clear"
            kind="ghost"
            variant="icon-only"
            :title="texts.clear"
            :disabled="loading || busy"
            @click="clear()"
          />
        </div>
      </template>
      <template #rightArea> <slot name="toolbar" /> </template>
    </LxToolbar>
    <div v-if="groupDefinitions">
      <ul
        :id="id"
        class="lx-list"
        :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
        v-if="filteredUngroupedItems && filteredUngroupedItems.length > 0"
      >
        <template v-if="kind === 'default'">
          <li
            v-for="item in itemsArray[prepareCode('lx_list_nullable_group')]"
            :key="item[idAttribute]"
          >
            <LxListItem
              :id="item[idAttribute]"
              :label="item[primaryAttribute]"
              :description="item[secondaryAttribute]"
              :value="item"
              :href="item[hrefAttribute]"
              :actionDefinitions="actionDefinitions"
              :icon="item[iconAttribute] ? item[iconAttribute] : icon"
              :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
              :tooltip="item[tooltipAttribute]"
              :searchString="query"
              :clickable="item[clickableAttribute]"
              :category="item[categoryAttribute]"
              :disabled="loading || busy"
              @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
              @action-click="actionClicked"
            >
              <template #customItem="item" v-if="$slots.customItem">
                <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
              </template>
            </LxListItem>
          </li>
        </template>
        <template v-if="kind === 'draggable'">
          <draggable
            v-if="kind === 'draggable'"
            :id="`draggable-list-${id}`"
            class="list-draggable-area"
            v-model="itemsArray[prepareCode('lx_list_nullable_group')]"
            handle=".lx-handle"
            drag-class="drag"
            v-bind="dragOptions"
            :item-key="idAttribute"
            group="list"
            @start="changeDragging"
            @end="changeDragging"
            @change="onMoveItem"
            :disabled="loading || busy || draggableIsDisabled"
          >
            <template #item="{ element }">
              <TransitionGroup
                class="draggable-list-item-wrapper"
                type="transition"
                :name="!dragging ? 'flip-list' : null"
                tag="div"
              >
                <li v-if="!element.placeholder" class="lx-draggable-group-list-item">
                  <div
                    class="lx-handle"
                    :id="`handleId-${element[props.idAttribute]}`"
                    tabindex="0"
                    @keydown.up.prevent="moveUngroupedItem(element, 'forward')"
                    @keydown.down.prevent="moveUngroupedItem(element, 'backward')"
                    @keydown.right.prevent="moveUngroupedItem(element, 'backward')"
                    @keydown.left.prevent="moveUngroupedItem(element, 'forward')"
                    :class="[
                      {
                        'handle-disabled': draggableIsDisabled || loading || busy,
                      },
                    ]"
                  >
                    <LxIcon class="lx-icon" value="drag"></LxIcon>
                  </div>
                  <lx-list-item
                    :id="element[idAttribute]"
                    :label="element[primaryAttribute]"
                    :description="element[secondaryAttribute]"
                    :value="element"
                    :href="element[hrefAttribute]"
                    :actionDefinitions="actionDefinitions"
                    :icon="element[iconAttribute] ? element[iconAttribute] : icon"
                    :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
                    :tooltip="element[tooltipAttribute]"
                    :searchString="query"
                    :clickable="element[clickableAttribute]"
                    :category="element[categoryAttribute]"
                    :disabled="loading || busy"
                    @click="
                      element[hrefAttribute] ? null : actionClicked('click', element[idAttribute])
                    "
                    @action-click="actionClicked"
                  >
                    <template #customItem="item" v-if="$slots.customItem">
                      <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                    </template>
                  </lx-list-item>
                </li>
              </TransitionGroup>
            </template>
          </draggable>
        </template>
      </ul>
    </div>
    <div v-if="groupDefinitions && kind === 'default'">
      <template v-for="group in groupDefinitions" :key="prepareCode(group.id)">
        <lx-expander
          v-if="
            (hideFilteredItems && filteredGroupedItems[prepareCode(group.id)].length > 0) ||
            !hideFilteredItems
          "
          v-model="group.expanded"
          :disabled="loading || busy"
          :badge="
            group?.badge ? group?.badge : `${filteredGroupedItems[prepareCode(group.id)].length}`
          "
          :badge-type="group?.badgeType"
          :label="group.name"
        >
          <ul
            :id="id"
            class="lx-list"
            :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
            v-if="
              filteredGroupedItems[prepareCode(group.id)] &&
              filteredGroupedItems[prepareCode(group.id)].length > 0
            "
          >
            <li
              v-for="item in filteredGroupedItems[prepareCode(group.id)]"
              :key="item[idAttribute]"
            >
              <lx-list-item
                :id="item[idAttribute]"
                :label="item[primaryAttribute]"
                :description="item[secondaryAttribute]"
                :value="item"
                :href="item[hrefAttribute]"
                :actionDefinitions="actionDefinitions"
                :icon="item[iconAttribute] ? item[iconAttribute] : icon"
                :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
                :tooltip="item[tooltipAttribute]"
                :searchString="query"
                :clickable="item[clickableAttribute]"
                :category="item[categoryAttribute]"
                :disabled="loading || busy"
                @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
                @action-click="actionClicked"
              >
                <template #customItem="item" v-if="$slots.customItem">
                  <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                </template>
              </lx-list-item>
            </li>
          </ul>
        </lx-expander>
      </template>
    </div>
    <ul
      :id="id"
      class="lx-list"
      :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
      v-if="!groupDefinitions && filteredItems && filteredItems.length > 0"
    >
      <template v-if="kind === 'default'">
        <li v-for="item in filteredItems" :key="item[idAttribute]">
          <LxListItem
            :id="item[idAttribute]"
            :label="item[primaryAttribute]"
            :description="item[secondaryAttribute]"
            :value="item"
            :href="item[hrefAttribute]"
            :actionDefinitions="actionDefinitions"
            :icon="item[iconAttribute] ? item[iconAttribute] : icon"
            :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
            :tooltip="item[tooltipAttribute]"
            :searchString="query"
            :clickable="item[clickableAttribute]"
            :category="item[categoryAttribute]"
            :disabled="loading || busy"
            @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
            @action-click="actionClicked"
          >
            <template #customItem="item" v-if="$slots.customItem">
              <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
            </template>
          </LxListItem>
        </li>
      </template>
      <draggable
        v-if="kind === 'draggable'"
        :id="`draggable-list-${id}`"
        class="list-draggable-area"
        v-model="ungroupedItemsArray"
        handle=".lx-handle"
        drag-class="drag"
        v-bind="dragOptions"
        :item-key="idAttribute"
        group="list"
        @start="changeDragging"
        @end="changeDragging"
        @change="onMoveItem"
        :disabled="loading || busy || draggableIsDisabled"
      >
        <template #item="{ element }">
          <TransitionGroup
            class="draggable-list-item-wrapper"
            type="transition"
            :name="!dragging ? 'flip-list' : null"
            tag="div"
          >
            <li v-if="!element.placeholder" class="lx-draggable-group-list-item">
              <div
                class="lx-handle"
                :id="`handleId-${element[props.idAttribute]}`"
                tabindex="0"
                @keydown.up.prevent="moveUngroupedItem(element, 'forward')"
                @keydown.down.prevent="moveUngroupedItem(element, 'backward')"
                @keydown.right.prevent="moveUngroupedItem(element, 'backward')"
                @keydown.left.prevent="moveUngroupedItem(element, 'forward')"
                :class="[
                  {
                    'handle-disabled': draggableIsDisabled || loading || busy,
                  },
                ]"
              >
                <LxIcon class="lx-icon" value="drag"></LxIcon>
              </div>
              <lx-list-item
                :id="element[idAttribute]"
                :label="element[primaryAttribute]"
                :description="element[secondaryAttribute]"
                :value="element"
                :href="element[hrefAttribute]"
                :actionDefinitions="actionDefinitions"
                :icon="element[iconAttribute] ? element[iconAttribute] : icon"
                :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
                :tooltip="element[tooltipAttribute]"
                :searchString="query"
                :clickable="element[clickableAttribute]"
                :category="element[categoryAttribute]"
                :disabled="loading || busy"
                @click="
                  element[hrefAttribute] ? null : actionClicked('click', element[idAttribute])
                "
                @action-click="actionClicked"
              >
                <template #customItem="item" v-if="$slots.customItem">
                  <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                </template>
              </lx-list-item>
            </li>
          </TransitionGroup>
        </template>
      </draggable>
    </ul>

    <template v-for="group in responsiveGroupDefinitions" :key="prepareCode(group.id)">
      <lx-expander
        v-if="
          kind === 'draggable' &&
          ((hideFilteredItems && filteredGroupedItems[prepareCode(group.id)].length > 0) ||
            !hideFilteredItems)
        "
        v-model="group.expanded"
        :disabled="loading || busy"
        :badge="
          group?.badge ? group?.badge : `${filteredGroupedItems[prepareCode(group.id)]?.length}`
        "
        :badge-type="group?.badgeType"
        :label="group.name"
      >
        <ul
          :id="id"
          class="lx-list"
          :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
        >
          <draggable
            class="list-draggable-area"
            :id="`draggable-list-${id}`"
            v-model="itemsArray[prepareCode(group.id)]"
            handle=".lx-handle"
            drag-class="drag"
            v-bind="dragOptions"
            :item-key="idAttribute"
            group="list"
            @start="changeDragging"
            @end="changeDragging"
            @change="onMoveItem"
            :disabled="loading || busy || draggableIsDisabled"
          >
            <template #item="{ element }">
              <TransitionGroup
                class="draggable-list-item-wrapper"
                type="transition"
                :name="!dragging ? 'flip-list' : null"
                tag="div"
              >
                <li v-if="!element.placeholder" class="lx-draggable-group-list-item">
                  <div
                    class="lx-handle"
                    :id="`handleId-${element[props.idAttribute]}`"
                    tabindex="0"
                    @keydown.up.prevent="moveGroupedItem(element, 'forward')"
                    @keydown.down.prevent="moveGroupedItem(element, 'backward')"
                    @keydown.right.prevent="moveGroupedItem(element, 'backward')"
                    @keydown.left.prevent="moveGroupedItem(element, 'forward')"
                    :class="[
                      {
                        'handle-disabled': draggableIsDisabled || loading || busy,
                      },
                    ]"
                  >
                    <LxIcon class="lx-icon" value="drag"></LxIcon>
                  </div>
                  <lx-list-item
                    :id="element[idAttribute]"
                    :label="element[primaryAttribute]"
                    :description="element[secondaryAttribute]"
                    :value="element"
                    :href="element[hrefAttribute]"
                    :actionDefinitions="actionDefinitions"
                    :icon="element[iconAttribute] ? element[iconAttribute] : icon"
                    :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
                    :tooltip="element[tooltipAttribute]"
                    :searchString="query"
                    :clickable="element[clickableAttribute]"
                    :category="element[categoryAttribute]"
                    :disabled="loading || busy"
                    @click="
                      element[hrefAttribute] ? null : actionClicked('click', element[idAttribute])
                    "
                    @action-click="actionClicked"
                  >
                    <template #customItem="item" v-if="$slots.customItem">
                      <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                    </template>
                  </lx-list-item>
                </li>
              </TransitionGroup>
            </template>
          </draggable>
        </ul>
      </lx-expander>
    </template>
    <LxEmptyState
      v-if="items?.length === 0 && !(loading || busy)"
      :label="texts?.noItems"
      :description="texts?.noItemsDescription"
      :icon="emptyStateIcon"
      :actionDefinitions="emptyStateActionDefinitions"
      @empty-state-action-click="emptyStateActionClicked"
    />
    <div class="lx-empty-state" v-if="query && filteredItems && filteredItems.length === 0">
      <p>{{ texts.notFoundSearch }} {{ JSON.stringify(query) }}</p>
    </div>
    <div class="lx-load-more-button" v-if="showLoadMore">
      <LxButton
        :label="props.texts.loadMore"
        icon="add-item"
        kind="tertiary"
        :busy="loading"
        :loading="loading"
        :disabled="busy || items?.length === 0"
        @click="loadMore()"
      />
    </div>
    <div class="lx-list-loader" v-if="!showLoadMore && loading">
      <LxLoader :loading="loading" size="s" />
    </div>
  </div>
</template>
