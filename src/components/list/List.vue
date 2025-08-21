<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, inject } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import draggable from 'vuedraggable/src/vuedraggable';

import { generateUUID, foldToAscii } from '@/utils/stringUtils';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import { sanitizeUrl } from '@braintree/sanitize-url';

import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxExpander from '@/components/Expander.vue';
import LxIcon from '@/components/Icon.vue';
import LxListItem from '@/components/list/ListItem.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxLoader from '@/components/Loader.vue';
import LxRadioButton from '@/components/RadioButton.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxTreeList from '@/components/list/TreeList.vue';
import LxSkipLink from '@/components/SkipLink.vue';
import LxToolbar from '@/components/Toolbar.vue';
import { focusNextFocusableElement, getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  items: { type: Array, default: null },
  hasSearch: { type: Boolean, default: false },
  groupDefinitions: { type: Array, default: null },
  icon: { type: String, default: 'open' },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  kind: { type: String, default: 'default' }, // default, draggable, treelist
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
  childrenAttribute: { type: String, default: 'children' },
  hasChildrenAttribute: { type: String, default: 'hasChildren' },
  selectableAttribute: { type: String, default: 'selectable' },
  orderAttribute: { type: String, default: 'order' },
  actionDefinitions: { type: Array, default: null },
  toolbarActionDefinitions: { type: Array, default: () => [] },
  actionsLayout: { type: String, default: 'default' }, // default, vertical
  emptyStateActionDefinitions: { type: Array, default: null },
  emptyStateIcon: { type: String, default: '' },
  listType: { type: String, default: '3' },
  searchString: { type: String, default: '' },
  searchSide: { type: String, default: 'client' }, // client or server
  showLoadMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  hideFilteredItems: { type: Boolean, default: false },
  hasSelecting: { type: Boolean, default: false },
  selectingKind: { type: String, default: 'single' }, // single, multiple
  selectionActionDefinitions: { type: Array, default: () => [] },
  includeUnspecifiedGroups: { type: Boolean, default: false },
  itemsStates: { type: Object, default: () => {} },
  mode: { type: String, default: 'client' }, // client, server,
  searchMode: { type: String, default: 'default' }, // default, compact
  labelId: { type: String, default: null },
  hasSkipLink: { type: Boolean, default: false },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  clear: 'Notīrīt',
  placeholder: 'Ievadiet nosaukuma vai apraksta daļu, lai sameklētu ierakstus',
  notFoundSearch: 'Nav atrasts:',
  noItems: 'Nav ierakstu',
  noItemsDescription: '',
  loadMore: 'Ielādēt vēl',
  search: 'Meklēt',
  items: {
    singular: 'ieraksts',
    plural: 'ieraksti',
    endingWith234: 'ieraksti',
    endingWith1: 'ieraksts',
  },
  ofItems: {
    label: 'Ieraksti',
    singular: 'ieraksta',
    plural: 'ierakstiem',
    endingWith234: 'ierakstiem',
    endingWith1: 'ieraksta',
  },
  selected: {
    singular: 'Izvēlēts',
    plural: 'Izvēlēti',
    endingWith234: 'Izvēlēti',
    endingWith1: 'Izvēlēts',
  },
  of: 'no',
  clearSelected: 'Attīrīt izvēles',
  selectAllRows: 'Izvēlēties visu',
  selectWholeGroup: 'Izvēlēties visu grupu',
  loadingError: 'Notika ielādes kļūda',
  reload: 'Ielādēt atkārtoti',
  collapse: 'Sakļaut elementu',
  expand: 'Izvērst elementu',
  openSearch: 'Atvērt meklētāju',
  closeSearch: 'Aizvērt meklētāju',
  skipLinkLabel: 'Izlaist sarakstu',
  skipLinkTitle: 'Izlaist sarakstu',
  overflowMenu: 'Atvērt papildu iespējas',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits([
  'actionClick',
  'update:searchString',
  'searched',
  'loadMore',
  'emptyStateActionClick',
  'update:items',
  'selectionChanged',
  'selectionActionClick',
  'toolbarActionClick',
  'update:itemsStates',
  'loadChildren',
]);

const responsiveGroupDefinitions = ref(props.groupDefinitions);
const query = ref(props.searchString);
const queryRaw = ref(props.searchString);
const itemsArray = ref([]);
const ungroupedItemsArray = ref();
const selectedItemsRaw = ref({});
const draggableIsDisabledByQuery = ref(false);
const dragging = ref(false);
const statesNotDefined = ref({});
const queryInputCompact = ref();
const queryInputDefault = ref();
const searchField = ref(false);

const showInvisibleBlock = ref(false);
let invisibleBlockTimeout;

const modelSearchString = computed({
  get() {
    return props.searchString;
  },
  set(value) {
    emits('update:searchString', value);
  },
});

// Convert item id's to strings
const itemsWithStringIds = computed(() =>
  props.items?.map((item) => ({
    ...item,
    [props.idAttribute]: String(item[props.idAttribute]),
  }))
);

function prepareCode(value) {
  return value?.toString();
}

watch(
  () => props.groupDefinitions,
  (newValue) => {
    responsiveGroupDefinitions.value = newValue;
  }
);

const UNSPECIFIED_GROUP_CODE = 'lx_list_nullable_group';

const debouncedSearchReq = useDebounceFn(async () => {
  if (props.searchSide === 'client') query.value = foldToAscii(queryRaw.value);
  nextTick(() => {
    modelSearchString.value = queryRaw.value;
  });
}, 200);

function serverSideSearch() {
  if (props.searchSide === 'server') emits('searched', foldToAscii(queryRaw.value));
}

watch(modelSearchString, (newValue, oldValue) => {
  if (newValue !== oldValue) queryRaw.value = modelSearchString.value;
});

function validate() {
  let res = false;
  const mapUnique = new Map();
  itemsWithStringIds.value?.forEach((x) => {
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

const filteredItems = computed(() => {
  if (itemsWithStringIds.value) {
    return itemsWithStringIds.value.filter(
      (o) => isFiltered(o[props.primaryAttribute]) || isFiltered(o[props.secondaryAttribute])
    );
  }
  return [];
});

function findObjectById(array) {
  const res = [];
  const queue = [...array];
  while (queue.length > 0) {
    const obj = queue.shift();
    if (isFiltered(obj[props.primaryAttribute]) || isFiltered(obj[props.secondaryAttribute])) {
      res.push(obj);
    }
    if (obj?.[props.childrenAttribute]) {
      queue.unshift(...obj[props.childrenAttribute]);
    }
  }
  return res;
}

const filteredTreeItems = computed(() => {
  let res = [];
  if (itemsWithStringIds.value) {
    res = findObjectById(itemsWithStringIds.value);
  }
  return res;
});

function processTreeItems(items, addGroup = true) {
  const res = [];
  const queue = [...items];
  while (queue.length > 0) {
    const obj = queue.shift();
    const newObj = { ...obj };

    if (newObj[props.groupAttribute] == null && obj[props.groupAttribute]) {
      newObj[props.groupAttribute] = obj[props.groupAttribute];
    }

    res.push(newObj);
    if (newObj?.[props.childrenAttribute]) {
      if (
        addGroup &&
        props.groupDefinitions?.find(
          (group) => group.id?.toString() === newObj[props.groupAttribute]?.toString()
        )
      ) {
        newObj[props.childrenAttribute] = newObj[props.childrenAttribute].map((child) => {
          const newChild = { ...child };
          newChild[props.groupAttribute] = newObj[props.groupAttribute];
          return newChild;
        });
      }
      queue.unshift(...newObj[props.childrenAttribute]);
    }
  }
  return res;
}

const treeItemsWithGroups = computed(() => processTreeItems(itemsWithStringIds.value, true));
const treeItems = computed(() =>
  processTreeItems(itemsWithStringIds.value, queryRaw.value.length > 0)
);

const filteredGroupedItems = computed(() => {
  let listItems = itemsWithStringIds.value;

  if (props.kind === 'treelist') {
    listItems = treeItems.value;
  }

  if (listItems && props.groupDefinitions) {
    const ret = {};
    props.groupDefinitions?.forEach((group) => {
      ret[prepareCode(group.id)] = listItems?.filter(
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
  let listItems = itemsWithStringIds.value;
  if (!props.groupDefinitions) return listItems;

  if (props.kind === 'treelist' && queryRaw.value.length > 0) {
    listItems = treeItems.value;
  }

  const array = props.groupDefinitions.reduce((acc, group) => {
    const groupItems = listItems
      .filter((item) => item.group?.toString() === group.id?.toString())
      .sort((a, b) => a[props.orderAttribute] - b[props.orderAttribute]);
    acc[group.id.toString()] = groupItems;
    return acc;
  }, {});

  if (props.includeUnspecifiedGroups) {
    const nullGroupItems = listItems?.filter(
      (item) =>
        !props.groupDefinitions.find((group) => item.group?.toString() === group.id?.toString())
    );
    array[UNSPECIFIED_GROUP_CODE] = nullGroupItems;
  }

  return array;
}

function convertItemsArray() {
  if (!props.groupDefinitions) return itemsWithStringIds.value;

  const array = Object.keys(itemsArray.value).reduce((acc, key) => {
    const items = itemsArray.value[key].map((item) => {
      const originalItem = itemsWithStringIds.value.find(
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

function setByOrders(array) {
  if (!props.groupDefinitions) return array;
  const ret = array.sort((a, b) => a[props.orderAttribute] - b[props.orderAttribute]);
  return ret;
}

function triggerItemsArray() {
  itemsArray.value = fillItemsArray();
}

function searchInItemsArray() {
  if (query.value !== '') {
    itemsArray.value = fillItemsArray();

    let listItems = filteredItems.value;
    if (props.kind === 'treelist') {
      listItems = filteredTreeItems.value;
    }

    Object.keys(itemsArray.value).forEach((key) => {
      if (Array.isArray(itemsArray.value[key])) {
        itemsArray.value[key] = itemsArray.value[key].filter((item) =>
          listItems?.some((filteredItem) => JSON.stringify(filteredItem) === JSON.stringify(item))
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
      draggableIsDisabledByQuery.value = false;
    } else {
      draggableIsDisabledByQuery.value = true;
    }

    clearTimeout(invisibleBlockTimeout);
    showInvisibleBlock.value = false;
    invisibleBlockTimeout = setTimeout(() => {
      showInvisibleBlock.value = true;
    }, 1000);
  },
  { immediate: true }
);

watch(
  [filteredItems, filteredTreeItems],
  () => {
    if (
      queryRaw.value &&
      ((props.kind !== 'treelist' && filteredItems.value.length === 0) ||
        (props.kind === 'treelist' && filteredTreeItems.value.length === 0))
    ) {
      clearTimeout(invisibleBlockTimeout);
      showInvisibleBlock.value = false;
      invisibleBlockTimeout = setTimeout(() => {
        showInvisibleBlock.value = true;
      }, 1000);
    } else {
      showInvisibleBlock.value = false;
    }
  },
  { immediate: true }
);

function emptyStateActionClicked(actionName) {
  emits('emptyStateActionClick', actionName);
}

function setGroupedListOrders() {
  Object.keys(itemsArray.value).forEach((key) => {
    if (Array.isArray(itemsArray.value[key])) {
      itemsArray.value[key] = itemsArray.value[key].map((element, index) => {
        const newElement = {
          ...element,
          [props.orderAttribute]: index + 1,
        };

        if (key !== UNSPECIFIED_GROUP_CODE) {
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
    const originalItem = itemsWithStringIds.value.find(
      (propsItem) => propsItem[props.idAttribute] === item[props.idAttribute]
    );

    if (originalItem && !(props.orderAttribute in originalItem)) {
      const { [props.orderAttribute]: order, ...itemWithoutOrder } = item;
      return itemWithoutOrder;
    }

    return item;
  });
}

watch(
  () => props.includeUnspecifiedGroups,
  () => {
    triggerItemsArray();
  }
);

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
    document.getElementById(`handleId-${element[props.idAttribute]}`)?.focus();
  });
  onMoveItem();
}

async function moveUngroupedItem(element, direction) {
  if (props.loading || props.busy || draggableIsDisabledByQuery.value) {
    return;
  }
  const index = ungroupedItemsArray.value.findIndex(
    (obj) => obj[props.idAttribute] === element[props.idAttribute]
  );

  if (direction === 'forward' && index > 0) {
    // Move one position forward
    ungroupedItemsArray.value.splice(index, 1);
    ungroupedItemsArray.value.splice(index - 1, 0, element);
  } else if (direction === 'backward' && index < ungroupedItemsArray.value.length - 1) {
    // Move one position backward
    ungroupedItemsArray.value.splice(index, 1);
    ungroupedItemsArray.value.splice(index + 1, 0, element);
  } else if (direction === 'move-first' && index > 0) {
    // Move to the first position
    ungroupedItemsArray.value.splice(index, 1);
    ungroupedItemsArray.value.unshift(element);
  } else if (direction === 'move-last' && index < ungroupedItemsArray.value.length - 1) {
    // Move to the last position
    ungroupedItemsArray.value.splice(index, 1);
    ungroupedItemsArray.value.push(element);
  }

  focusHandle(element);
}
async function moveGroupedItem(element, direction) {
  if (props.loading || props.busy || draggableIsDisabledByQuery.value) {
    return;
  }
  // Adjust groupCode assignment to handle unspecified groups
  let groupCode;
  if (element[props.groupAttribute]) {
    groupCode = prepareCode(element[props.groupAttribute]);
  } else if (props.includeUnspecifiedGroups) {
    groupCode = UNSPECIFIED_GROUP_CODE;
  } else {
    groupCode = null;
    return;
  }

  const groupKeys = Object.keys(itemsArray.value);
  // Ensure the unspecified group exists in itemsArray.value if includeUnspecifiedGroups is true
  if (props.includeUnspecifiedGroups && !itemsArray.value[UNSPECIFIED_GROUP_CODE]) {
    itemsArray.value[UNSPECIFIED_GROUP_CODE] = [];
  }
  const groupIndex = groupKeys.indexOf(groupCode);
  const itemIndex = itemsArray.value[groupCode].findIndex(
    (obj) => obj[props.idAttribute] === element[props.idAttribute]
  );

  const isLastItemInLastGroup =
    groupIndex === groupKeys.length - 1 && itemIndex === itemsArray.value[groupCode].length - 1;
  const isFirstItemInFirstGroup = groupIndex === 0 && itemIndex === 0;

  // Loop items moving (from last to first from first to last)
  if (isLastItemInLastGroup && direction === 'backward') {
    itemsArray.value[groupCode].splice(itemIndex, 1);
    const newGroupCode = groupKeys[0];
    itemsArray.value[newGroupCode].push(element);
  }
  if (isFirstItemInFirstGroup && direction === 'forward') {
    itemsArray.value[groupCode].splice(itemIndex, 1);
    const newGroupCode = groupKeys[groupKeys.length - 1];
    itemsArray.value[newGroupCode].unshift(element);
  }

  if (
    (direction === 'forward' && itemIndex > 0) ||
    (direction === 'backward' && itemIndex < itemsArray.value[groupCode].length - 1)
  ) {
    // Move within the same group
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
    // Move to a different group
    itemsArray.value[groupCode].splice(itemIndex, 1);
    const newGroupCode = groupKeys[direction === 'forward' ? groupIndex - 1 : groupIndex + 1];
    itemsArray.value[newGroupCode].push(element);

    // Automatically expand the target group
    if (responsiveGroupDefinitions.value[groupKeys.indexOf(newGroupCode)]) {
      responsiveGroupDefinitions.value[groupKeys.indexOf(newGroupCode)].expanded = true;
    }
  } else if (direction === 'move-first') {
    // Move to the first position in the current or first group
    if (itemIndex !== 0) {
      itemsArray.value[groupCode].splice(itemIndex, 1);
      itemsArray.value[groupCode].unshift(element);
    }
  } else if (direction === 'move-last') {
    // Move to the last position in the current or last group
    if (itemIndex !== itemsArray.value[groupCode].length - 1) {
      itemsArray.value[groupCode].splice(itemIndex, 1);
      itemsArray.value[groupCode].push(element);
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

const filteredUngroupedItems = computed(() => {
  let listItems = filteredItems.value;
  if (props.kind === 'treelist') {
    listItems = filteredTreeItems.value;
  }
  return listItems?.filter((item) =>
    Object.values(filteredGroupedItems.value).every(
      (group) => !group?.some((groupedItem) => groupedItem.id === item.id)
    )
  );
});

const selectedItems = computed(() => {
  const ret = [];
  Object.keys(selectedItemsRaw.value).forEach((key) => {
    if (selectedItemsRaw.value[key]) {
      let isKeyValid;
      if (props.kind === 'treelist') {
        isKeyValid = treeItems?.value.some(
          (item) => item[props.idAttribute]?.toString() === key?.toString()
        );
      } else {
        isKeyValid = itemsWithStringIds?.value.some((item) => item[props.idAttribute] === key);
      }

      if (isKeyValid) {
        if (props.selectingKind === 'multiple' && key !== 'undefined') {
          ret.push(key);
        } else if (props.selectingKind === 'single') {
          ret[0] = key;
        }
      }
    }
  });
  emits('selectionChanged', ret);
  return ret;
});

function selectRow(id) {
  selectedItemsRaw.value = {};
  selectedItemsRaw.value[id] = true;
}

function arrayToObject(arr) {
  const ret = {};
  arr.forEach((o) => {
    ret[o] = true;
  });
  return ret;
}

const isSelectable = (item) => {
  const attribute = props.selectableAttribute;
  if (item?.[attribute] === false) return false;
  return item?.[attribute] !== false;
};

const selectableItems = computed(() => itemsWithStringIds.value?.filter(isSelectable));
const selectableTreeItems = computed(() =>
  treeItemsWithGroups.value?.filter((item) => isSelectable(item))
);

const hasSelectableItemsInGroup = computed(() => {
  const selectableItemsMap = {};
  let listItems = itemsWithStringIds.value;
  if (props.kind === 'treelist') {
    listItems = treeItemsWithGroups.value;
  }

  props.groupDefinitions?.forEach((group) => {
    const groupItems = listItems?.filter(
      (o) => prepareCode(o[props.groupAttribute]) === prepareCode(group.id)
    );
    selectableItemsMap[group.id] = groupItems?.some(isSelectable) || false;
  });

  return selectableItemsMap;
});

const selectIcon = computed(() => {
  const items = props.kind === 'treelist' ? selectableTreeItems?.value : selectableItems?.value;
  if (selectedItems.value.length === items.length && props.selectingKind === 'multiple') {
    return 'checkbox-filled';
  }
  if (props.selectingKind === 'multiple') {
    return 'checkbox-indeterminate';
  }
  return 'radiobutton-filled';
});

function selectRows(arr = null, shouldFocus = true) {
  function filterSelectable(items) {
    return items.filter(isSelectable);
  }

  if (arr === null) {
    if (props.kind !== 'treelist') {
      selectedItemsRaw.value = arrayToObject(
        filterSelectable(itemsWithStringIds.value)?.map((x) => x?.[props.idAttribute]?.toString())
      );
    } else {
      selectedItemsRaw.value = arrayToObject(
        filterSelectable(treeItems.value)?.map((x) => x?.[props.idAttribute]?.toString())
      );
    }
  } else {
    selectedItemsRaw.value = arrayToObject(
      filterSelectable(arr)?.map((x) => x?.[props.idAttribute]?.toString())
    );
  }
  if (shouldFocus) {
    nextTick(() => {
      document.getElementById(`${props.id}-cancel-select-all`)?.focus();
    });
  }
}
const isItemSelected = (itemId) => !!selectedItemsRaw.value[itemId];

function cancelSelection(shouldFocus = true) {
  selectedItemsRaw.value = {};
  nextTick(() => {
    if (selectedItems.value.length === 0) {
      document.getElementById(`${props.id}-toolbar-action-select-all`)?.focus();
    } else {
      document.getElementById(`${props.id}-select-all`)?.focus();
    }
  });
}

const selectedLabel = computed(() => {
  const selectableCount = itemsWithStringIds.value?.length?.toString();
  const selectableTreeListItems = treeItems.value?.length?.toString();
  const selectedCount = selectedItems.value?.length;
  const selectedCountDisplay = selectedCount?.toString();

  let label = displayTexts.value.items?.plural;
  let labelStart = displayTexts.value.selected?.plural;
  let ret = null;

  if (selectedCount === 1) {
    label = displayTexts.value.items?.singular;
    labelStart = displayTexts.value.selected?.singular;
  } else if (
    selectedCount > 20 &&
    (selectedCount % 10 === 2 || selectedCount % 10 === 3 || selectedCount % 10 === 4)
  ) {
    label = displayTexts.value.items?.endingWith234;
    labelStart = displayTexts.value.selected?.endingWith234;
  } else if (selectedCount > 11 && selectedCount % 10 === 1) {
    label = displayTexts.value.items?.endingWith1;
    labelStart = displayTexts.value.selected?.endingWith1;
  }

  if (props.kind !== 'treelist') {
    ret = `${labelStart} ${selectedCountDisplay} ${label} ${displayTexts.value.of} ${selectableCount}`;
  } else {
    ret = `${labelStart} ${selectedCountDisplay} ${label} ${displayTexts.value.of} ${selectableTreeListItems}`;
  }
  return ret;
});

function selectionActionClick(actinoId, selectedItemsIds) {
  emits('selectionActionClick', actinoId, selectedItemsIds);
}

const states = computed({
  get() {
    // Šis vajadzīgs, jo, ja nav definēts, tad nez kāpēc props.itemsStates ir null, nevis {}
    // kā norādīts defaultā, līdz ar to komponenti nav iespējams izmantot bez props.itemsState definēšanas
    if (!props.itemsStates) return statesNotDefined.value;
    return props.itemsStates;
  },
  set(value) {
    emits('update:itemsStates', value);
  },
});

function loadChildren(id) {
  emits('loadChildren', id);
}

const groupSelectionStatuses = computed(() => {
  const res = {};
  let listItems = itemsWithStringIds.value;
  if (props.kind === 'treelist') {
    listItems = treeItemsWithGroups.value;
  }
  props.groupDefinitions?.forEach((group) => {
    const groupItems = listItems?.filter(
      (o) => prepareCode(o[props.groupAttribute]) === prepareCode(group.id)
    );
    const groupItemsIds = groupItems?.map((o) => o[props.idAttribute]);
    const selectedGroupItems = groupItemsIds.filter((id) => selectedItemsRaw.value[id]);
    const selectableGroupItems = groupItems?.filter((o) => isSelectable(o));

    if (selectedGroupItems?.length === 0) {
      res[group.id] = 'none';
    } else if (selectedGroupItems?.length === selectableGroupItems?.length) {
      res[group.id] = 'all';
    } else {
      res[group.id] = 'some';
    }
  });
  return res;
});

function selectSection(group) {
  const groupItems =
    props.kind === 'treelist'
      ? treeItemsWithGroups.value?.filter(
          (o) => prepareCode(o[props.groupAttribute]) === prepareCode(group.id)
        )
      : itemsWithStringIds.value?.filter(
          (o) => prepareCode(o[props.groupAttribute]) === prepareCode(group.id)
        );
  const groupItemsIds = groupItems.map((o) => o[props.idAttribute]);

  function selectChildren(item, select = true) {
    selectedItemsRaw.value[item[props.idAttribute]] = select;
    if (item[props.childrenAttribute]) {
      item[props.childrenAttribute].forEach((child) => {
        if (
          !child[props.groupAttribute] ||
          prepareCode(child[props.groupAttribute]) === prepareCode(group.id)
        ) {
          selectChildren(child, select);
        }
      });
    }
  }
  if (groupSelectionStatuses.value?.[group.id] === 'none') {
    groupItemsIds.forEach((id) => {
      const item = groupItems.find((o) => o[props.idAttribute] === id);
      if (isSelectable(item)) {
        selectChildren(item, true);
      }
    });
  } else {
    groupItemsIds.forEach((id) => {
      const item = groupItems.find((o) => o[props.idAttribute] === id);
      selectChildren(item, false);
    });
  }
}

function getTabIndex(id) {
  const firstSelectable = itemsWithStringIds.value.find((item) => isSelectable(item));
  const isFirstSelectable = firstSelectable && firstSelectable[props.idAttribute] === id;
  const hasSelectedItem = Object.keys(selectedItemsRaw.value).length > 0;

  if (selectedItemsRaw.value[id] || (isFirstSelectable && !hasSelectedItem)) {
    return 0;
  }
  return -1;
}

function getGroupedTabIndex(id, groupId) {
  let groupItems = [];
  if (groupId) {
    groupItems = itemsWithStringIds.value.filter(
      (o) => prepareCode(o[props.groupAttribute]) === prepareCode(groupId)
    );
  } else {
    groupItems = itemsArray.value[UNSPECIFIED_GROUP_CODE];
  }
  const firstSelectable = groupItems.find((item) => isSelectable(item));
  const isFirstSelectable = firstSelectable && firstSelectable[props.idAttribute] === id;

  const hasSelectedItemInGroup = groupItems.some(
    (item) => selectedItemsRaw.value[item[props.idAttribute]]
  );

  if (selectedItemsRaw.value[id] || (isFirstSelectable && !hasSelectedItemInGroup)) {
    return 0;
  }
  return -1;
}

const autoSearchMode = computed(() => {
  if (props.searchMode === 'compact') {
    return 'compact';
  }
  if (props.searchMode === 'default' && !props.hasSelecting) {
    return 'default';
  }
  return 'compact';
});

function toggleSearch() {
  query.value = '';
  queryRaw.value = '';

  searchField.value = !searchField.value;
  nextTick(() => {
    if (searchField.value && autoSearchMode.value === 'default') {
      queryInputDefault.value.focus();
    } else if (searchField.value && autoSearchMode.value === 'compact') {
      queryInputCompact.value.focus();
    }
  });
}

defineExpose({ validate, cancelSelection, selectRows, toggleSearch });

const draggableButtons = ref([
  {
    id: 'move-first',
    icon: 'move-first',
    title: 'Pārvietot sākumā',
    disabled: false,
  },
  {
    id: 'move-up',
    icon: 'move-up',
    title: 'Pārvietot uz augšu',
    disabled: false,
  },
  {
    id: 'move-down',
    icon: 'move-down',
    title: 'Pārvietot uz leju',
    disabled: false,
  },
  {
    id: 'move-last',
    icon: 'move-last',
    title: 'Pārvietot beigās',
    disabled: false,
  },
]);

function moveDraggableItem(direction, element, groupType) {
  if (props.loading || props.busy || draggableIsDisabledByQuery.value) {
    return;
  }
  switch (direction) {
    case 'move-first':
      if (groupType === 'grouped') {
        moveGroupedItem(element, 'move-first');
      } else {
        moveUngroupedItem(element, 'move-first');
      }
      break;
    case 'move-up':
      if (groupType === 'grouped') {
        moveGroupedItem(element, 'forward');
      } else {
        moveUngroupedItem(element, 'forward');
      }
      break;
    case 'move-down':
      if (groupType === 'grouped') {
        moveGroupedItem(element, 'backward');
      } else {
        moveUngroupedItem(element, 'backward');
      }
      break;
    case 'move-last':
      if (groupType === 'grouped') {
        moveGroupedItem(element, 'move-last');
      } else {
        moveUngroupedItem(element, 'move-last');
      }
      break;
    default:
      break;
  }
}

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

watch(
  () => props.items,
  (newVal) => {
    triggerItemsArray();
    if (!props.groupDefinitions && props.kind === 'draggable') {
      ungroupedItemsArray.value = newVal;
    }
  },
  { deep: true }
);

watch(
  () => props.selectingKind,
  (newVal) => {
    if (newVal === 'single') {
      const selectedCount = Object.values(selectedItemsRaw.value).filter(
        (value) => value === true
      )?.length;
      if (selectedCount > 1) {
        const firstTrueKey = Object.keys(selectedItemsRaw.value).find(
          (key) => selectedItemsRaw.value[key] === true
        );
        selectedItemsRaw.value = { [firstTrueKey]: true };
      }
    }
  }
);

onMounted(() => {
  const val = validate();
  if (val) {
    lxDevUtils.log(val, useLx().getGlobals()?.environment, 'error');
  }
  itemsArray.value = fillItemsArray();
  ungroupedItemsArray.value = setByOrders(filteredItems.value);
});

function isExpandable(item) {
  if (props.mode === 'client')
    return item[props.childrenAttribute] && item?.[props.childrenAttribute].length > 0;
  return item[props.hasChildrenAttribute];
}

const areSomeExpandable = computed(() => treeItems?.value.some((item) => isExpandable(item)));

function sanitizeHref(href) {
  if (href && typeof href === 'string') {
    return sanitizeUrl(href);
  }
  if (href instanceof Object) {
    return href;
  }
  return null;
}

const listWrapper = ref(null);

function focusFirstFocusableElementAfter() {
  if (listWrapper.value) {
    focusNextFocusableElement(listWrapper.value);
  }
}

const processedToolbarActions = computed(() => {
  const {
    toolbarActionDefinitions,
    loading,
    busy,
    hasSearch,
    searchMode,
    hasSelecting,
    selectingKind,
  } = props;

  if (!toolbarActionDefinitions.length) return [];

  const withDefaults = (action, overrides = {}) => ({
    ...action,
    icon: action.icon ?? 'fallback-icon',
    area: action.area ?? 'right',
    kind: action.kind ?? 'ghost',
    variant: action.variant ?? 'icon-only',
    groupId: action.groupId ?? 'lx-default',
    disabled: loading || busy,
    ...overrides,
  });

  const withKindAndVariant = (action, overrides = {}) => ({
    ...action,
    kind: 'ghost',
    variant: 'icon-only',
    ...overrides,
  });

  const normalizedActions = toolbarActionDefinitions.map((action) => withDefaults(action));

  let rightmostAction = null;
  let demotedActions = [];

  const processGroup = (group) => {
    if (!group.length) return;

    const firstPrimary = group.find(
      (action) => action.area === 'right' && action.kind === 'primary'
    );
    const firstSecondary = group.find(
      (action) => action.area === 'right' && action.kind === 'secondary'
    );
    const firstAction = firstPrimary ?? firstSecondary;

    if (!firstAction) {
      demotedActions = group.map((action) => withKindAndVariant(action));
      return;
    }

    const restWithoutFirst = group.filter((action) => action.id !== firstAction.id);

    let defaults;
    if (firstAction?.area === 'right' && firstAction?.kind === 'secondary') {
      defaults = {
        kind: 'secondary',
        variant: 'default',
      };
    } else if (firstAction?.area !== 'left') {
      defaults = {
        kind: 'primary',
        variant: 'default',
      };
    } else {
      defaults = {
        kind: 'ghost',
        variant: 'icon-only',
      };
    }

    rightmostAction = withDefaults(firstAction, defaults);
    demotedActions = restWithoutFirst.map((action) => withKindAndVariant(action));
  };

  processGroup(normalizedActions);

  const result = [...demotedActions];
  if (rightmostAction) result.push(rightmostAction);

  if ((hasSearch && searchMode === 'compact') || (hasSearch && hasSelecting)) {
    result.push({
      id: 'search',
      name: searchField.value ? displayTexts.value.closeSearch : displayTexts.value.openSearch,
      icon: searchField.value ? 'close' : 'search',
      area: 'right',
      variant: 'icon-only',
      kind: 'ghost',
      groupId: 'lx-default',
      disabled: loading || busy,
      customClass: searchField.value ? 'toolbar-search-button is-expanded' : '',
      nonResponsive: true,
    });
  }

  if (hasSelecting && selectingKind === 'multiple') {
    result.push({
      id: `select-all`,
      name: displayTexts.value.selectAllRows,
      icon: 'checkbox',
      area: 'right',
      variant: 'icon-only',
      kind: 'ghost',
      groupId: 'lx-default',
      disabled: loading || busy,
      nonResponsive: true,
    });
  }

  return result;
});

function toolbarActionClicked(id) {
  if (id === 'search') {
    toggleSearch();
  } else if (id === 'select-all') {
    selectRows();
  }
  emits('toolbarActionClick', id);
}

const toolbarActions = computed(() => {
  if (selectedItems.value?.length > 0) {
    return [];
  }
  return processedToolbarActions.value;
});
</script>

<template>
  <div ref="listWrapper" class="lx-list-wrapper">
    <LxSkipLink
      v-if="props.hasSkipLink"
      :label="displayTexts.skipLinkLabel"
      :title="displayTexts.skipLinkTitle"
      :tabindex="0"
      @click="focusFirstFocusableElementAfter"
    />
    <div :class="[{ 'lx-selection-toolbar': hasSelecting && selectedItems?.length > 0 }]">
      <LxToolbar
        :id="`${props.id}-toolbar`"
        :actionDefinitions="toolbarActions"
        :disabled="busy"
        :loading="loading"
        :texts="displayTexts"
        @actionClick="toolbarActionClicked"
      >
        <template #leftArea>
          <slot
            v-if="(hasSelecting && selectedItems?.length === 0) || !hasSelecting"
            name="leftToolbar"
          />
          <template v-if="autoSearchMode === 'default' && !hasSelecting">
            <LxTextInput
              v-if="hasSearch"
              ref="queryInputDefault"
              v-model="queryRaw"
              :kind="searchSide === 'server' ? 'default' : 'search'"
              :disabled="loading || busy"
              :placeholder="displayTexts.placeholder"
              role="search"
              @keydown.enter="serverSideSearch()"
            />
            <LxButton
              v-if="searchSide === 'server' && hasSearch"
              icon="search"
              kind="ghost"
              :busy="busy"
              :disabled="loading"
              variant="icon-only"
              :label="displayTexts.search"
              @click="serverSideSearch()"
            />
            <LxButton
              v-if="query || queryRaw"
              icon="clear"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.clear"
              :disabled="loading || busy"
              @click="clear()"
            />
          </template>
          <p v-if="hasSelecting && selectedItems?.length > 0">
            {{ selectedLabel }}
          </p>
        </template>
        <template #rightArea>
          <slot
            v-if="(hasSelecting && selectedItems?.length === 0) || !hasSelecting"
            name="toolbar"
          />
          <template v-if="props.toolbarActionDefinitions?.length === 0">
            <template v-if="selectedItems?.length === 0">
              <div
                class="toolbar-search-button"
                :class="[{ 'is-expanded': searchField }]"
                v-if="autoSearchMode === 'compact' && hasSearch"
              >
                <LxButton
                  kind="ghost"
                  :icon="searchField ? 'close' : 'search'"
                  variant="icon-only"
                  :label="searchField ? displayTexts.closeSearch : displayTexts.openSearch"
                  :disabled="loading || busy"
                  @click="toggleSearch"
                />
              </div>
              <LxButton
                :id="`${id}-select-all`"
                icon="checkbox"
                kind="ghost"
                v-if="
                  selectableItems?.length !== 0 &&
                  hasSelecting &&
                  selectingKind === 'multiple' &&
                  kind !== 'draggable'
                "
                :disabled="loading || busy"
                variant="icon-only"
                :label="displayTexts.selectAllRows"
                @click="selectRows()"
              />
            </template>
          </template>
          <template v-if="selectedItems?.length > 0">
            <div class="selection-action-button-toolbar" v-if="hasSelecting">
              <div class="selection-action-buttons">
                <LxButton
                  v-for="selectAction in selectionActionDefinitions"
                  :key="selectAction.id"
                  :icon="selectAction.icon"
                  :label="selectAction.name"
                  :destructive="selectAction.destructive"
                  :disabled="selectAction.disabled || busy || loading"
                  kind="ghost"
                  @click="selectionActionClick(selectAction.id, selectedItems)"
                />
              </div>
              <div
                class="selection-action-buttons-small"
                v-if="selectionActionDefinitions?.length > 0"
              >
                <LxDropDownMenu
                  :actionDefinitions="selectionActionDefinitions"
                  @actionClick="(id) => selectionActionClick(id, selectedItems)"
                >
                  <LxButton
                    icon="menu"
                    kind="ghost"
                    :label="displayTexts.overflowMenu"
                    variant="icon-only"
                  />
                </LxDropDownMenu>
              </div>
            </div>
            <div
              class="toolbar-search-button"
              :class="[{ 'is-expanded': searchField }]"
              v-if="autoSearchMode === 'compact'"
            >
              <LxButton
                v-if="hasSearch"
                class="toolbar-search-button"
                :class="[{ 'is-expanded': searchField }]"
                kind="ghost"
                :icon="searchField ? 'close' : 'search'"
                :label="searchField ? displayTexts.closeSearch : displayTexts.openSearch"
                variant="icon-only"
                :disabled="loading || busy"
                @click="toggleSearch"
              />
            </div>
            <LxButton
              :id="`${id}-cancel-select-all`"
              v-if="hasSelecting && kind !== 'draggable'"
              :icon="selectIcon"
              variant="icon-only"
              :label="displayTexts.clearSelected"
              kind="ghost"
              :disabled="loading || busy"
              @click="cancelSelection()"
            />
          </template>
        </template>
        <template #secondRow>
          <div
            class="second-row"
            v-if="hasSearch && searchField && autoSearchMode === 'compact'"
            :class="[{ 'second-row-selecting': hasSelecting }]"
          >
            <LxTextInput
              v-if="hasSearch"
              ref="queryInputCompact"
              v-model="queryRaw"
              :kind="'default'"
              :disabled="loading || busy"
              :placeholder="displayTexts.placeholder"
              role="search"
              @keydown.enter="serverSideSearch()"
            />
            <div class="lx-group lx-slot-wrapper">
              <LxButton
                v-if="searchSide === 'server' && hasSearch"
                icon="search"
                kind="ghost"
                :busy="busy"
                :disabled="loading"
                variant="icon-only"
                :label="displayTexts.search"
                @click="serverSideSearch()"
              />
              <LxButton
                v-if="query || queryRaw"
                icon="clear"
                kind="ghost"
                :loading="loading"
                variant="icon-only"
                :label="displayTexts.clear"
                :disabled="loading || busy"
                @click="clear()"
              />
            </div>
          </div>
        </template>
      </LxToolbar>
    </div>
    <div v-if="groupDefinitions && filteredUngroupedItems && filteredUngroupedItems.length > 0">
      <ul
        :id="id"
        class="lx-list"
        :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
        :aria-labelledby="labelledBy"
        v-if="kind === 'default'"
      >
        <li
          v-for="item in itemsArray[prepareCode(UNSPECIFIED_GROUP_CODE)]"
          :key="item[idAttribute]"
          class="lx-list-item-container"
        >
          <LxListItem
            :id="item[idAttribute]"
            :parentId="props.id"
            :label="item[primaryAttribute]"
            :description="item[secondaryAttribute]"
            :value="item"
            :href="sanitizeHref(item[hrefAttribute])"
            :actionDefinitions="actionDefinitions"
            :actionsLayout="actionsLayout"
            :icon="item[iconAttribute] ? item[iconAttribute] : icon"
            :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
            :tooltip="item[tooltipAttribute]"
            :searchString="query"
            :clickable="item[clickableAttribute]"
            :category="item[categoryAttribute]"
            :disabled="loading || busy"
            :selected="isItemSelected(item[idAttribute])"
            :texts="displayTexts"
            @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
            @action-click="actionClicked"
          >
            <template #customItem="item" v-if="$slots.customItem">
              <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
            </template>
          </LxListItem>
          <div class="selecting-block" v-if="hasSelecting && selectableItems?.length !== 0">
            <template v-if="isSelectable(item)">
              <LxRadioButton
                v-if="selectingKind === 'single'"
                :id="`select-${id}-${item[idAttribute]}`"
                v-model="selectedItemsRaw[item[idAttribute]]"
                :value="item[idAttribute]"
                @click="selectRow(item[idAttribute])"
                :disabled="loading || busy"
                :label="item[primaryAttribute]"
                :group-id="`selection-${id}`"
                :tabindex="getGroupedTabIndex(item[idAttribute], null)"
              />
              <LxCheckbox
                v-else
                :id="`select-${id}-${item[idAttribute]}`"
                v-model="selectedItemsRaw[item[idAttribute]]"
                :value="item[idAttribute]"
                :disabled="loading || busy"
                :label="item[primaryAttribute]"
                :group-id="`selection-${id}`"
              />
            </template>
            <p v-else class="lx-checkbox-placeholder"></p>
          </div>
        </li>
      </ul>
      <div
        :id="id"
        class="lx-list"
        :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
        v-if="kind === 'draggable'"
      >
        <draggable
          v-if="kind === 'draggable'"
          :id="`draggable-list-${id}`"
          class="list-draggable-area"
          v-model="itemsArray[prepareCode(UNSPECIFIED_GROUP_CODE)]"
          handle=".lx-handle"
          drag-class="drag"
          v-bind="dragOptions"
          :item-key="idAttribute"
          group="list"
          tag="ul"
          @start="changeDragging"
          @end="changeDragging"
          @change="onMoveItem"
          :disabled="loading || busy || draggableIsDisabledByQuery"
          :aria-labelledby="labelledBy"
        >
          <template #item="{ element }">
            <TransitionGroup
              class="draggable-list-item-wrapper"
              type="transition"
              :name="!dragging ? 'flip-list' : null"
              tag="li"
            >
              <div class="lx-transition-layer" :key="element[idAttribute]">
                <div v-if="!element.placeholder" class="lx-draggable-group-list-item">
                  <div class="lx-list-item-container">
                    <LxDropDownMenu
                      triggerClick="right"
                      :disabled="loading || busy || draggableIsDisabledByQuery"
                    >
                      <div
                        class="lx-handle"
                        :id="`handleId-${element[props.idAttribute]}`"
                        tabindex="0"
                        :aria-label="displayTexts.draggableItem"
                        @keydown.up.prevent="moveGroupedItem(element, 'forward')"
                        @keydown.down.prevent="moveGroupedItem(element, 'backward')"
                        @keydown.right.prevent="moveGroupedItem(element, 'backward')"
                        @keydown.left.prevent="moveGroupedItem(element, 'forward')"
                        :class="[
                          {
                            'handle-disabled': draggableIsDisabledByQuery || loading || busy,
                          },
                        ]"
                      >
                        <LxIcon class="lx-icon" value="drag"></LxIcon>
                      </div>
                      <template #panel>
                        <div class="lx-button-set">
                          <LxButton
                            v-for="button in draggableButtons"
                            :key="button.id"
                            :icon="button.icon"
                            :label="button.title"
                            :disabled="button.disabled"
                            @click="moveDraggableItem(button.id, element, 'grouped')"
                          />
                        </div>
                      </template>
                    </LxDropDownMenu>
                    <LxListItem
                      :id="element[idAttribute]"
                      :parentId="props.id"
                      :label="element[primaryAttribute]"
                      :description="element[secondaryAttribute]"
                      :value="element"
                      :href="element[hrefAttribute]"
                      :actionDefinitions="actionDefinitions"
                      :actionsLayout="actionsLayout"
                      :icon="element[iconAttribute] ? element[iconAttribute] : icon"
                      :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
                      :tooltip="element[tooltipAttribute]"
                      :searchString="query"
                      :clickable="element[clickableAttribute]"
                      :category="element[categoryAttribute]"
                      :disabled="loading || busy"
                      :texts="displayTexts"
                      @click="
                        element[hrefAttribute] ? null : actionClicked('click', element[idAttribute])
                      "
                      @action-click="actionClicked"
                    >
                      <template #customItem="item" v-if="$slots.customItem">
                        <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                      </template>
                    </LxListItem>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </template>
        </draggable>
      </div>
    </div>
    <div v-if="groupDefinitions && kind === 'default'">
      <template v-for="group in groupDefinitions" :key="prepareCode(group.id)">
        <LxExpander
          v-if="
            (hideFilteredItems && filteredGroupedItems[prepareCode(group.id)].length > 0) ||
            !hideFilteredItems
          "
          v-model="group.expanded"
          :disabled="loading || busy"
          :badge="
            group?.badge ? group?.badge : `${filteredGroupedItems[prepareCode(group.id)].length}`
          "
          :badge-icon="group?.badgeIcon"
          :badge-type="group?.badgeType"
          :badge-title="group?.badgeTitle"
          :label="group.name"
          :id="group.id"
          :has-select-button="
            hasSelecting &&
            hasSelectableItemsInGroup[prepareCode(group.id)] &&
            selectingKind === 'multiple'
          "
          :select-status="groupSelectionStatuses?.[group.id]"
          :texts="{
            selectWholeGroup: displayTexts.selectWholeGroup,
            clearSelected: displayTexts.clearSelected,
          }"
          @select-all="selectSection(group)"
        >
          <template #customHeader v-if="$slots.customExpanderHeader">
            <slot name="customExpanderHeader" v-bind="{ item: group, expanded: group.expanded }" />
          </template>

          <ul
            :id="`${id}-${prepareCode(group.id)}`"
            class="lx-list"
            :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
            :aria-labelledby="labelledBy"
            v-if="
              filteredGroupedItems[prepareCode(group.id)] &&
              filteredGroupedItems[prepareCode(group.id)].length > 0
            "
          >
            <li
              v-for="item in filteredGroupedItems[prepareCode(group.id)]"
              :key="item[idAttribute]"
              class="lx-list-item-container"
            >
              <LxListItem
                :id="item[idAttribute]"
                :parentId="props.id"
                :label="item[primaryAttribute]"
                :description="item[secondaryAttribute]"
                :value="item"
                :href="sanitizeHref(item[hrefAttribute])"
                :actionDefinitions="actionDefinitions"
                :actionsLayout="actionsLayout"
                :icon="item[iconAttribute] ? item[iconAttribute] : icon"
                :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
                :tooltip="item[tooltipAttribute]"
                :searchString="query"
                :clickable="item[clickableAttribute]"
                :category="item[categoryAttribute]"
                :disabled="loading || busy"
                :selected="isItemSelected(item[idAttribute])"
                :texts="displayTexts"
                @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
                @action-click="actionClicked"
              >
                <template #customItem="item" v-if="$slots.customItem">
                  <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                </template>
              </LxListItem>
              <div class="selecting-block" v-if="hasSelecting && selectableItems?.length !== 0">
                <template v-if="isSelectable(item)">
                  <LxRadioButton
                    v-if="selectingKind === 'single'"
                    :id="`select-${id}-${item[idAttribute]}`"
                    v-model="selectedItemsRaw[item[idAttribute]]"
                    :value="item[idAttribute]"
                    @click="selectRow(item[idAttribute])"
                    :disabled="loading || busy"
                    :label="item[primaryAttribute]"
                    :group-id="`selection-${id}`"
                    :tabindex="getGroupedTabIndex(item[idAttribute], group.id)"
                  />
                  <LxCheckbox
                    v-else
                    :id="`select-${id}-${item[idAttribute]}`"
                    v-model="selectedItemsRaw[item[idAttribute]]"
                    :value="item[idAttribute]"
                    :disabled="loading || busy"
                    :label="item[primaryAttribute]"
                    :group-id="`selection-${id}`"
                  />
                </template>
                <p v-else class="lx-checkbox-placeholder"></p>
              </div>
            </li>
          </ul>
        </LxExpander>
      </template>
    </div>
    <div
      v-if="
        kind === 'treelist' &&
        itemsArray[prepareCode(UNSPECIFIED_GROUP_CODE)] &&
        filteredUngroupedItems &&
        filteredUngroupedItems.length > 0
      "
    >
      <LxTreeList
        v-if="queryRaw?.length === 0"
        :items="itemsArray[prepareCode(UNSPECIFIED_GROUP_CODE)]"
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
        :groupDefinitions="groupDefinitions"
        :icon="icon"
        :iconSet="iconSet"
        :hasSelecting="hasSelecting"
        :selectingKind="selectingKind"
        :query="searchString"
        :areSomeExpandable="areSomeExpandable"
        @action-click="actionClicked"
        v-model:selectedItems="selectedItemsRaw"
        v-model:itemsStates="states"
        :mode="mode"
        :texts="displayTexts"
        @loadChildren="loadChildren"
      >
        <template #customItem="items" v-if="$slots.customItem">
          <slot name="customItem" v-bind="items" />
        </template>
      </LxTreeList>
      <div class="tree-list-wrapper" v-else-if="queryRaw?.length > 0">
        <div class="tree-list-search" role="list">
          <div
            v-for="item in itemsArray[prepareCode(UNSPECIFIED_GROUP_CODE)]"
            :key="item[idAttribute]"
            class="tree-list-search-item lx-list-item-container"
            role="listitem"
          >
            <LxListItem
              :id="item[idAttribute]"
              :parentId="props.id"
              :label="item[primaryAttribute]"
              :description="item[secondaryAttribute]"
              :value="item"
              :href="sanitizeHref(item[hrefAttribute])"
              :actionDefinitions="actionDefinitions"
              :actionsLayout="actionsLayout"
              :icon="item[iconAttribute] ? item[iconAttribute] : icon"
              :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
              :tooltip="item[tooltipAttribute]"
              :searchString="query"
              :clickable="item[clickableAttribute]"
              :category="item[categoryAttribute]"
              :disabled="loading || busy"
              :selected="isItemSelected(item[idAttribute])"
              :texts="displayTexts"
              @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
              @action-click="actionClicked"
            >
              <template #customItem="item" v-if="$slots.customItem">
                <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
              </template>
            </LxListItem>
            <div class="selecting-block" v-if="hasSelecting && selectableTreeItems?.length !== 0">
              <template v-if="isSelectable(item)">
                <LxRadioButton
                  v-if="selectingKind === 'single'"
                  :id="`select-${id}-${item[idAttribute]}`"
                  v-model="selectedItemsRaw[item[idAttribute]]"
                  :value="item[idAttribute]"
                  @click="selectRow(item[idAttribute])"
                  :disabled="loading || busy"
                  :label="item[primaryAttribute]"
                  :group-id="`selection-${id}`"
                  :tabindex="getGroupedTabIndex(item[idAttribute], null)"
                />
                <LxCheckbox
                  v-else
                  :id="`select-${id}-${item[idAttribute]}`"
                  v-model="selectedItemsRaw[item[idAttribute]]"
                  :value="item[idAttribute]"
                  :disabled="loading || busy"
                  :label="item[primaryAttribute]"
                  :group-id="`selection-${id}`"
                />
              </template>
              <p v-else class="lx-checkbox-placeholder"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="kind === 'treelist' && groupDefinitions && queryRaw?.length === 0">
      <template v-for="group in groupDefinitions" :key="prepareCode(group.id)">
        <LxExpander
          v-if="
            (hideFilteredItems && filteredGroupedItems[prepareCode(group.id)].length > 0) ||
            !hideFilteredItems
          "
          v-model="group.expanded"
          :disabled="loading || busy"
          :badge="group?.badge"
          :badge-icon="group?.badgeIcon"
          :badge-type="group?.badgeType"
          :badge-title="group?.badgeTitle"
          :label="group.name"
          :id="group.id"
          :has-select-button="
            hasSelecting &&
            hasSelectableItemsInGroup[prepareCode(group.id)] &&
            selectingKind === 'multiple'
          "
          :select-status="groupSelectionStatuses?.[group.id]"
          :texts="{
            selectWholeGroup: displayTexts.selectWholeGroup,
            clearSelected: displayTexts.clearSelected,
          }"
          @select-all="selectSection(group)"
        >
          <LxTreeList
            :items="filteredGroupedItems[prepareCode(group.id)]"
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
            :groupDefinitions="groupDefinitions"
            :icon="icon"
            :iconSet="iconSet"
            :hasSelecting="hasSelecting"
            :selectingKind="selectingKind"
            :query="searchString"
            :areSomeExpandable="areSomeExpandable"
            @action-click="actionClicked"
            v-model:selectedItems="selectedItemsRaw"
            v-model:itemsStates="states"
            :mode="mode"
            :texts="displayTexts"
            @loadChildren="loadChildren"
          >
            <template #customItem="items" v-if="$slots.customItem">
              <slot name="customItem" v-bind="items" />
            </template>
          </LxTreeList>
        </LxExpander>
      </template>
    </div>
    <div v-if="kind === 'treelist' && groupDefinitions && queryRaw?.length > 0">
      <template v-for="group in groupDefinitions" :key="prepareCode(group.id)">
        <LxExpander
          v-if="
            (hideFilteredItems && filteredGroupedItems[prepareCode(group.id)].length > 0) ||
            !hideFilteredItems
          "
          v-model="group.expanded"
          :disabled="loading || busy"
          :badge="group?.badge"
          :badge-icon="group?.badgeIcon"
          :badge-type="group?.badgeType"
          :badge-title="group?.badgeTitle"
          :label="group.name"
          :id="group.id"
          :has-select-button="
            hasSelecting &&
            hasSelectableItemsInGroup[prepareCode(group.id)] &&
            selectingKind === 'multiple'
          "
          :select-status="groupSelectionStatuses?.[group.id]"
          :texts="{
            selectWholeGroup: displayTexts.selectWholeGroup,
            clearSelected: displayTexts.clearSelected,
          }"
          @select-all="selectSection(group)"
        >
          <div class="tree-list-wrapper">
            <div class="tree-list-search" role="list">
              <div
                v-for="item in filteredGroupedItems[prepareCode(group.id)]"
                :key="item[idAttribute]"
                class="tree-list-search-item lx-list-item-container"
                role="listitem"
              >
                <LxListItem
                  :id="item[idAttribute]"
                  :parentId="props.id"
                  :label="item[primaryAttribute]"
                  :description="item[secondaryAttribute]"
                  :value="item"
                  :href="sanitizeHref(item[hrefAttribute])"
                  :actionDefinitions="actionDefinitions"
                  :actionsLayout="actionsLayout"
                  :icon="item[iconAttribute] ? item[iconAttribute] : icon"
                  :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
                  :tooltip="item[tooltipAttribute]"
                  :searchString="query"
                  :clickable="item[clickableAttribute]"
                  :category="item[categoryAttribute]"
                  :disabled="loading || busy"
                  :selected="isItemSelected(item[idAttribute])"
                  :texts="displayTexts"
                  @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
                  @action-click="actionClicked"
                >
                  <template #customItem="item" v-if="$slots.customItem">
                    <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                  </template>
                </LxListItem>
                <div
                  class="selecting-block"
                  v-if="hasSelecting && selectableTreeItems?.length !== 0"
                >
                  <template v-if="isSelectable(item)">
                    <LxRadioButton
                      v-if="selectingKind === 'single'"
                      :id="`select-${id}-${item[idAttribute]}`"
                      v-model="selectedItemsRaw[item[idAttribute]]"
                      :value="item[idAttribute]"
                      @click="selectRow(item[idAttribute])"
                      :disabled="loading || busy"
                      :label="item[primaryAttribute]"
                      :group-id="`selection-${id}`"
                      :tabindex="getGroupedTabIndex(item[idAttribute], group.id)"
                    />
                    <LxCheckbox
                      v-else
                      :id="`select-${id}-${item[idAttribute]}`"
                      v-model="selectedItemsRaw[item[idAttribute]]"
                      :value="item[idAttribute]"
                      :disabled="loading || busy"
                      :label="item[primaryAttribute]"
                      :group-id="`selection-${id}`"
                    />
                  </template>
                  <p v-else class="lx-checkbox-placeholder"></p>
                </div>
              </div>
            </div>
          </div>
        </LxExpander>
      </template>
    </div>
    <template v-if="!groupDefinitions && filteredItems && filteredItems.length > 0">
      <ul
        v-if="kind === 'default'"
        :id="id"
        class="lx-list"
        :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
        :aria-labelledby="labelledBy"
      >
        <li v-for="item in filteredItems" :key="item[idAttribute]" class="lx-list-item-container">
          <LxListItem
            :id="item[idAttribute]"
            :parentId="props.id"
            :label="item[primaryAttribute]"
            :description="item[secondaryAttribute]"
            :value="item"
            :href="sanitizeHref(item[hrefAttribute])"
            :actionDefinitions="actionDefinitions"
            :actionsLayout="actionsLayout"
            :icon="item[iconAttribute] ? item[iconAttribute] : icon"
            :iconSet="item[iconSetAttribute] ? item[iconSetAttribute] : iconSet"
            :tooltip="item[tooltipAttribute]"
            :searchString="query"
            :clickable="item[clickableAttribute]"
            :category="item[categoryAttribute]"
            :disabled="loading || busy"
            :selected="isItemSelected(item[idAttribute])"
            :texts="displayTexts"
            @click="item[hrefAttribute] ? null : actionClicked('click', item[idAttribute])"
            @action-click="actionClicked"
          >
            <template #customItem="item" v-if="$slots.customItem">
              <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
            </template>
          </LxListItem>
          <div class="selecting-block" v-if="hasSelecting && selectableItems?.length !== 0">
            <template v-if="isSelectable(item)">
              <LxRadioButton
                v-if="selectingKind === 'single'"
                :id="`select-${id}-${item[idAttribute]}`"
                v-model="selectedItemsRaw[item[idAttribute]]"
                :value="item[idAttribute]"
                @click="selectRow(item[idAttribute])"
                :disabled="loading || busy"
                :label="item[primaryAttribute]"
                :group-id="`selection-${id}`"
                :tabindex="getTabIndex(item[idAttribute])"
              />
              <LxCheckbox
                v-else
                :id="`select-${id}-${item[idAttribute]}`"
                v-model="selectedItemsRaw[item[idAttribute]]"
                :value="item[idAttribute]"
                :disabled="loading || busy"
                :label="item[primaryAttribute]"
                :group-id="`selection-${id}`"
              />
            </template>
            <p v-else class="lx-checkbox-placeholder"></p>
          </div>
        </li>
      </ul>
      <div
        v-if="kind === 'draggable'"
        :id="id"
        class="lx-list"
        :class="[{ 'lx-list-3': listType === '3' }, { 'lx-list-2': listType === '2' }]"
      >
        <draggable
          :id="`draggable-list-${id}`"
          class="list-draggable-area"
          v-model="ungroupedItemsArray"
          handle=".lx-handle"
          tag="ul"
          drag-class="drag"
          v-bind="dragOptions"
          :item-key="idAttribute"
          group="list"
          @start="changeDragging"
          @end="changeDragging"
          @change="onMoveItem"
          :disabled="loading || busy || draggableIsDisabledByQuery"
          :aria-labelledby="labelledBy"
        >
          <template #item="{ element }">
            <TransitionGroup
              class="draggable-list-item-wrapper"
              type="transition"
              :name="!dragging ? 'flip-list' : null"
              tag="li"
            >
              <div class="lx-transition-layer" :key="element[idAttribute]">
                <div v-if="!element.placeholder" class="lx-draggable-group-list-item">
                  <div class="lx-list-item-container">
                    <LxDropDownMenu
                      triggerClick="right"
                      :disabled="loading || busy || draggableIsDisabledByQuery"
                    >
                      <div
                        class="lx-handle"
                        :id="`handleId-${element[props.idAttribute]}`"
                        tabindex="0"
                        :aria-label="displayTexts.draggableItem"
                        @keydown.up.prevent="moveUngroupedItem(element, 'forward')"
                        @keydown.down.prevent="moveUngroupedItem(element, 'backward')"
                        @keydown.right.prevent="moveUngroupedItem(element, 'backward')"
                        @keydown.left.prevent="moveUngroupedItem(element, 'forward')"
                        :class="[
                          {
                            'handle-disabled': draggableIsDisabledByQuery || loading || busy,
                          },
                        ]"
                      >
                        <LxIcon class="lx-icon" value="drag"></LxIcon>
                      </div>
                      <template #panel>
                        <div class="lx-button-set">
                          <LxButton
                            v-for="button in draggableButtons"
                            :key="button.id"
                            :icon="button.icon"
                            :label="button.title"
                            :disabled="button.disabled"
                            @click="moveDraggableItem(button.id, element, 'ungrouped')"
                          />
                        </div>
                      </template>
                    </LxDropDownMenu>

                    <LxListItem
                      :id="element[idAttribute]"
                      :parentId="props.id"
                      :label="element[primaryAttribute]"
                      :description="element[secondaryAttribute]"
                      :value="element"
                      :href="element[hrefAttribute]"
                      :actionDefinitions="actionDefinitions"
                      :actionsLayout="actionsLayout"
                      :icon="element[iconAttribute] ? element[iconAttribute] : icon"
                      :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
                      :tooltip="element[tooltipAttribute]"
                      :searchString="query"
                      :clickable="element[clickableAttribute]"
                      :category="element[categoryAttribute]"
                      :disabled="loading || busy"
                      :texts="displayTexts"
                      @click="
                        element[hrefAttribute] ? null : actionClicked('click', element[idAttribute])
                      "
                      @action-click="actionClicked"
                    >
                      <template #customItem="item" v-if="$slots.customItem">
                        <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                      </template>
                    </LxListItem>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </template>
        </draggable>
      </div>
    </template>
    <template v-for="group in responsiveGroupDefinitions" :key="prepareCode(group.id)">
      <LxExpander
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
        :badge-icon="group?.badgeIcon"
        :badge-type="group?.badgeType"
        :badge-title="group?.badgeTitle"
        :label="group.name"
      >
        <template #customHeader v-if="$slots.customExpanderHeader">
          <slot
            name="customExpanderHeader"
            v-bind="{ item: group, expanded: group.expanded }"
          ></slot>
        </template>

        <div
          :id="`${id}-${prepareCode(group.id)}`"
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
            tag="ul"
            @start="changeDragging"
            @end="changeDragging"
            @change="onMoveItem"
            :disabled="loading || busy || draggableIsDisabledByQuery"
            :aria-labelledby="labelledBy"
          >
            <template #item="{ element }">
              <TransitionGroup
                class="draggable-list-item-wrapper"
                type="transition"
                :name="!dragging ? 'flip-list' : null"
                tag="li"
              >
                <div class="lx-transition-layer" :key="element[idAttribute]">
                  <div v-if="!element.placeholder" class="lx-draggable-group-list-item">
                    <div class="lx-list-item-container">
                      <LxDropDownMenu
                        triggerClick="right"
                        :disabled="loading || busy || draggableIsDisabledByQuery"
                      >
                        <div
                          class="lx-handle"
                          :id="`handleId-${element[props.idAttribute]}`"
                          tabindex="0"
                          :aria-label="displayTexts.draggableItem"
                          @keydown.up.prevent="moveGroupedItem(element, 'forward')"
                          @keydown.down.prevent="moveGroupedItem(element, 'backward')"
                          @keydown.right.prevent="moveGroupedItem(element, 'backward')"
                          @keydown.left.prevent="moveGroupedItem(element, 'forward')"
                          :class="[
                            {
                              'handle-disabled': draggableIsDisabledByQuery || loading || busy,
                            },
                          ]"
                        >
                          <LxIcon class="lx-icon" value="drag"></LxIcon>
                        </div>
                        <template #panel>
                          <div class="lx-button-set">
                            <LxButton
                              v-for="button in draggableButtons"
                              :key="button.id"
                              :icon="button.icon"
                              :label="button.title"
                              :disabled="button.disabled"
                              @click="moveDraggableItem(button.id, element, 'grouped')"
                            />
                          </div>
                        </template>
                      </LxDropDownMenu>

                      <LxListItem
                        :id="element[idAttribute]"
                        :parentId="props.id"
                        :label="element[primaryAttribute]"
                        :description="element[secondaryAttribute]"
                        :value="element"
                        :href="element[hrefAttribute]"
                        :actionDefinitions="actionDefinitions"
                        :actionsLayout="actionsLayout"
                        :icon="element[iconAttribute] ? element[iconAttribute] : icon"
                        :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
                        :tooltip="element[tooltipAttribute]"
                        :searchString="query"
                        :clickable="element[clickableAttribute]"
                        :category="element[categoryAttribute]"
                        :disabled="loading || busy"
                        :selected="isItemSelected(element[idAttribute])"
                        :texts="displayTexts"
                        @click="
                          element[hrefAttribute]
                            ? null
                            : actionClicked('click', element[idAttribute])
                        "
                        @action-click="actionClicked"
                      >
                        <template #customItem="item" v-if="$slots.customItem">
                          <slot name="customItem" v-bind="item" v-if="$slots.customItem" />
                        </template>
                      </LxListItem>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </template>
          </draggable>
        </div>
      </LxExpander>
    </template>
    <div
      v-if="
        kind === 'treelist' &&
        (queryRaw?.length === 0 || searchSide === 'server') &&
        !groupDefinitions
      "
    >
      <LxTreeList
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
        @actionClick="actionClicked"
        v-model:selected-items="selectedItemsRaw"
        v-model:itemsStates="states"
        :mode="mode"
        :texts="displayTexts"
        @loadChildren="loadChildren"
      >
        <template #customItem="items" v-if="$slots.customItem">
          <slot name="customItem" v-bind="items" />
        </template>
      </LxTreeList>
    </div>
    <div
      v-else-if="
        kind === 'treelist' && queryRaw?.length > 0 && searchSide === 'client' && !groupDefinitions
      "
      class="tree-list-search"
      role="list"
    >
      <div
        v-for="element in filteredTreeItems"
        :key="element?.[idAttribute]"
        class="tree-list-search-item lx-list-item-container"
        role="listitem"
      >
        <LxListItem
          :id="element[idAttribute]"
          :parentId="props.id"
          :label="element[primaryAttribute]"
          :description="element[secondaryAttribute]"
          :value="element"
          :href="element[hrefAttribute]"
          :actionDefinitions="actionDefinitions"
          :actionsLayout="actionsLayout"
          :icon="element[iconAttribute] ? element[iconAttribute] : icon"
          :iconSet="element[iconSetAttribute] ? element[iconSetAttribute] : iconSet"
          :tooltip="element[tooltipAttribute]"
          :searchString="query"
          :clickable="element[clickableAttribute]"
          :category="element[categoryAttribute]"
          :disabled="loading || busy"
          :selected="isItemSelected(element[idAttribute])"
          :texts="displayTexts"
          @click="element[hrefAttribute] ? null : actionClicked('click', element[idAttribute])"
          @action-click="actionClicked"
        >
          <template #customItem="item" v-if="$slots.customItem">
            <slot name="customItem" v-bind="item" />
          </template>
        </LxListItem>
        <div class="selecting-block" v-if="hasSelecting && selectableTreeItems?.length !== 0">
          <template v-if="isSelectable(element)">
            <LxRadioButton
              v-if="selectingKind === 'single'"
              :id="`select-${id}-${element[idAttribute]}`"
              v-model="selectedItemsRaw[element[idAttribute]]"
              :value="element[idAttribute]"
              @click="selectRow(element[idAttribute])"
              :disabled="loading || busy"
              :label="element[primaryAttribute]"
              :group-id="`selection-${id}`"
              :tabindex="getTabIndex(element[idAttribute])"
            />
            <LxCheckbox
              v-else
              :id="`select-${id}-${element[idAttribute]}`"
              v-model="selectedItemsRaw[element[idAttribute]]"
              :value="element[idAttribute]"
              :disabled="loading || busy"
              :label="element[primaryAttribute]"
              :group-id="`selection-${id}`"
            />
          </template>
          <p v-else class="lx-checkbox-placeholder"></p>
        </div>
      </div>
    </div>
    <LxEmptyState
      v-if="items?.length === 0 && !(loading || busy) && !query"
      :label="displayTexts?.noItems"
      :description="displayTexts?.noItemsDescription"
      :icon="emptyStateIcon"
      :actionDefinitions="emptyStateActionDefinitions"
      @empty-state-action-click="emptyStateActionClicked"
    />
    <div
      class="lx-empty-state"
      v-if="
        query &&
        filteredItems &&
        ((props.kind !== 'treelist' && filteredItems.length === 0) ||
          (props.kind === 'treelist' && filteredTreeItems?.length === 0))
      "
    >
      <div aria-live="polite" role="status" class="lx-invisible" v-if="showInvisibleBlock">
        {{ displayTexts.notFoundSearch }} {{ JSON.stringify(query) }}
      </div>
      <p>{{ displayTexts.notFoundSearch }} {{ JSON.stringify(query) }}</p>
    </div>
    <div class="lx-load-more-button" v-if="showLoadMore">
      <LxButton
        :label="displayTexts.loadMore"
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
