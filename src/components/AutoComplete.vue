<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, inject } from 'vue';
import { onClickOutside, useDebounceFn } from '@vueuse/core';
import Popper from 'vue3-popper';

import { generateUUID, textSearch } from '@/utils/stringUtils';
import { logWarn } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';

import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxLoader from '@/components/Loader.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxFlagItemDisplay from '@/components/itemDisplay/FlagItemDisplay.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxModal from '@/components/Modal.vue';
import LxList from '@/components/list/List.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: [String, Object], default: null },
  items: { type: [Array, Function], default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  dictionary: { type: Object, default: null },
  groupId: { type: String, default: null },
  queryMinLength: { type: Number, default: 0 },
  queryMaxLength: { type: Number, default: null },
  queryDebounce: { type: [String, Number], default: 200 },
  placeholder: { type: String, default: null },
  tooltip: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  loading: { type: Boolean, default: false },
  hasDetails: { type: Boolean, default: false },
  selectingKind: { type: String, default: 'single' }, // 'single' or 'multiple'
  detailMode: { type: String, default: 'simple' }, // 'simple' or 'detailed'
  variant: { type: String, default: 'default' }, // default, country, state, custom
  // used for preloading items if items is a function and there is need to show items before user starts typing
  preloadedItems: { type: Array, default: null },
  labelId: { type: String, default: null },
  hasSelectAll: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      clear: 'Notīrīt izvēli',
      empty: 'Nav atrasti rezultāti, kas saturētu tekstu',
      tryEndingWith1: 'Lai sāktu meklēšanu, ievadiet vismaz {0} simbolu',
      try: 'Lai sāktu meklēšanu, ievadiet vismaz {0} simbolus',
      tooltipDisplayTextSingle: 'cits',
      tooltipDisplayTextMulti: 'citi',
      detailsSwitchAdvancedSearch: 'Izvērstā meklēšana',
      detailsSwitchSelectedItems: 'Izvēlētās vērtības',
      detailsButton: 'Skatīt detaļas',
      detailsModalLabel: 'Izvērstais skats',
      clearChosen: 'Notīrīt visas izvēlētās vērtības',
      selectAll: 'Izvēlēties visu',
      loadingState: 'Notiek ielāde',
    }),
  },
  searchAttributes: { type: Array, default: null }, // array of attributes for search
});

const emit = defineEmits(['update:modelValue', 'filter', 'openDetails']);

const menuOpen = ref(false);
const refContainer = ref();
const refAutocomplete = ref();

const refQuery = ref();
const refRoot = ref();
const refListbox = ref();
const query = ref();
const activeQuery = ref();
const loadingState = ref(false);
const allItems = ref([]);
const itemsModel = ref({});
const detailedModeModal = ref();
const detailsSwitchType = ref('advanced-search');
const panelWidth = ref();
const isInputFocused = ref(false);
const inputReadonly = ref(false);

const globalEnvironment = useLx().getGlobals()?.environment;

function formatFinalQuery(q) {
  return q?.trim();
}
const finalQuery = computed(() => {
  return formatFinalQuery(query.value);
});

const convertBooleanToString = (value) => (typeof value === 'boolean' ? value.toString() : value);

const model = computed({
  get: () => {
    if (props.modelValue !== undefined && props.modelValue !== null) {
      return convertBooleanToString(props.modelValue);
    }
    return null;
  },
  set: (value) => {
    emit('update:modelValue', value);
  },
});

const getIdAttributeString = (item) => {
  const attribute = item[props.idAttribute];

  if (attribute === undefined) {
    throw new Error(
      `Autocomplete: idAttribute (${props.idAttribute}) is not defined for item ${JSON.stringify(
        item
      )}`
    );
  }
  return attribute;
};

// store if latest results doesn't contain previously selected item
const selectedItemStored = ref(null);
const selectedItemsStored = ref([]);

const selectedItem = ref(null);
const selectedItems = ref([]);
const listRef = ref();

const findItemById = (id, items) => {
  return items?.find((item) => id === getIdAttributeString(item));
};

const mergeItems = (newItems, storedItems) => {
  const mergedItems = [...storedItems];
  newItems.forEach((item) => {
    if (
      !storedItems.some(
        (storedItem) => getIdAttributeString(storedItem) === getIdAttributeString(item)
      )
    ) {
      mergedItems.push(item);
    }
  });
  mergedItems.sort(
    (a, b) =>
      Object.keys(itemsModel.value).indexOf(getIdAttributeString(a)) -
      Object.keys(itemsModel.value).indexOf(getIdAttributeString(b))
  );
  return mergedItems;
};

function handleMultipleSelection(newModelValue){
  const selectedArray = newModelValue
    .map((id) => findItemById(id, allItems.value))
    .filter(Boolean);

  if (selectedArray.length > 0) { 
    selectedItemsStored.value = mergeItems(selectedArray, selectedItemsStored.value);
    selectedItem.value = null;
    selectedItems.value = mergeItems(selectedArray, selectedItemsStored.value);
  } else if (
    !menuOpen.value &&
    props.preloadedItems?.some((item) => newModelValue.includes(getIdAttributeString(item)))
  ) {
    // if items are not in allItems, but are in preloadedItems, take them from preloadedItems
    allItems.value = props.preloadedItems;
  }
}

function handleSingleSelection(newModelValue){
  let selected = findItemById(newModelValue, allItems.value);

  if (selected) {
    selectedItem.value = selected;
    selectedItems.value = [];
  } else if (
    !menuOpen.value &&
    props.preloadedItems?.find((item) => newModelValue === getIdAttributeString(item))
  ) {
    // if item is not in allItems, but is in preloadedItems, take it from preloadedItems
    allItems.value = props.preloadedItems;
  }
}

watch([model, () => allItems.value], ([newModelValue]) => {
  if (newModelValue && (!Array.isArray(newModelValue) || newModelValue.length > 0)) {
    if (Array.isArray(newModelValue) && props.selectingKind === 'multiple') {
      handleMultipleSelection(newModelValue);
    } else {
      handleSingleSelection(newModelValue);
    }
  } else {
    // Reset everything if newModelValue is empty
    itemsModel.value = {};
    selectedItem.value = null;
    selectedItems.value = [];
  }
});

function attributesSearch(item) {
  for (let i = 0; i < props.searchAttributes.length; i += 1) {
    const attrName = props.searchAttributes[i] as string;
    const attrValue = item[attrName as keyof typeof item];
    if (textSearch(query.value, attrValue)) {
      return true;
    }
  }
  return false;
}

const filteredItems = computed(() => {
  if (Array.isArray(props.items) && query.value?.length > 0) {
    if (Array.isArray(props.searchAttributes) && props.searchAttributes?.length > 0) {
      return allItems.value.filter(attributesSearch);
    }

    return allItems.value.filter((item) => {
      const name = item[props.nameAttribute];
      return textSearch(query.value, name);
    });
  }
  return allItems.value;
});

const queryDebounceValue = computed(() =>
  typeof props.queryDebounce === 'string' ? Number(props.queryDebounce) : props.queryDebounce
);

const debouncedSearchReq = useDebounceFn(async (val) => {
  if (typeof props.items === 'function') {
    loadingState.value = true;
    activeQuery.value = val;
    const items = await props.items(val);
    allItems.value = items;
    loadingState.value = activeQuery.value !== val;
  }
}, queryDebounceValue);

watch(
  query,
  async (newValue, oldValue) => {
    // If props.items is not a function and queryMinLength is provided, warn developer
    if (typeof props.items !== 'function' && props.queryMinLength > 0) {
      logWarn(
        "To take effect, props 'queryMinLength' and 'queryDebounce' must be used with an async items function!",
        globalEnvironment
      );
      return;
    }

    // Proceed with search if props.items is a function
    if (typeof props.items === 'function') {
      const finalQuery = formatFinalQuery(newValue);
      if ((finalQuery?.length || 0) < props.queryMinLength) {
        const destroyResults = newValue?.length > oldValue?.length;
        if (destroyResults) {
          allItems.value = [];
        }
        return;
      }
      await debouncedSearchReq(finalQuery);
    }
  },
  { immediate: true }
);

function getName(returnPlaceholder = true) {
  let result;

  if (Array.isArray(model.value) && model.value.length > 0) {
    const multipleItems = selectedItems.value?.filter((obj) =>
      model.value.includes(getIdAttributeString(obj))
    );
    if (multipleItems) {
      result = multipleItems.map((item) => item[props.nameAttribute]).join(', ');
    }
  } else if (model.value) {
    if (selectedItem.value) {
      result = selectedItem.value[props.nameAttribute];
    }
  }
  return returnPlaceholder ? props.placeholder : result;
}

const hasValue = computed(() => {
  if (selectedItem.value && Object.keys(selectedItem.value).length > 0) return true;
  if (selectedItems.value && selectedItems.value.length > 0) return true;
  return false;
});

function getItemId(id) {
  return `${props.id}-item-${id}`
}

function getLabelId(id) {
  return `${id}-${props.id}-label`;
}

function initSearchInput() {
  query.value = null;
  if (refQuery.value) refQuery.value.focus();
}

function initInputFocus() {
  highlightedItemId.value = null;
  refQuery.value.focus();
}

function handleMenuAndInputKeydown(e) {
  const inputElement = document.activeElement;

  if (e.shiftKey) {
    if (e.key === 'ArrowUp') {
      handleShiftArrow(inputElement, 'up');
      return;
    }
    if (e.key === 'ArrowDown') {
      handleShiftArrow(inputElement, 'down');
      return;
    }
  }

  const isPrintableChar = e.key.length === 1 && e.key.match(/\S/);
  const isBackspaceKey = e.key === 'Backspace';
  const isDeleteKey = e.key === 'Delete';

  if (isPrintableChar || isBackspaceKey || isDeleteKey) {
    if (!menuOpen.value) {
      query.value = null;
      menuOpen.value = true;
    }
    if (model.value && props.selectingKind === 'single') clear();
    inputReadonly.value = false;
    highlightedItemId.value = null;
    initInputFocus();
  }
}

function handleTouchStart() {
  inputReadonly.value = false; // Allow touch input interaction
}

function openMenu() {
  if (!props.disabled && menuOpen.value === false) {
    if (!menuOpen.value) {
      panelWidth.value = refContainer.value?.offsetWidth;
    }
    menuOpen.value = true;
    nextTick(() => {
      initSearchInput();
    });
  }
}

const highlightedItemId = ref(null);

function closeOnClickOutside() {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
  query.value = null;
  highlightedItemId.value = null;
}

function closeMenu() {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
  highlightedItemId.value = null;
  setTimeout(() => {
    query.value = null;
  }, 100);
  nextTick(() => {
    refQuery.value.focus();
  });
}

onClickOutside(refRoot, closeOnClickOutside);

function clear() {
  itemsModel.value = {};

  if (!Array.isArray(model.value)) {
    model.value = null;
    selectedItem.value = null;
    selectedItemStored.value = null;
  } else {
    model.value = [];
    selectedItems.value = [];
  }

  if (!menuOpen.value) {
    openMenu();
  }
}

function selectSingle(item) {
  try {
    model.value = getIdAttributeString(item);
  } finally {
    closeMenu();
  }
}

function focusOnDropDown(e = { target: { id: null }, shiftKey: false, key: '' }) {
  if (e.shiftKey && e.key === 'Tab') {
    if (!menuOpen.value && e.target && e.target.id !== 'clearButton' && e.target.id !== 'detailsButton') {
      menuOpen.value = true;
      nextTick(() => {
        initSearchInput();
      });
    }
    return;
  }

  if (e.key === 'Tab') {
    if (menuOpen.value && e.target && e.target.id !== 'clearButton' && e.target.id !== 'detailsButton') {
      closeMenu();
      nextTick(() => {
        refQuery.value.focus();
      });
    } else if (!menuOpen.value && e.target && e.target.id !== 'clearButton' && e.target.id !== 'detailsButton') {
      nextTick(() => {
        openMenu();
      });
    }
  }
}

const handleFocusOut = (e) => {
  isInputFocused.value = false;
  if (!refListbox.value.contains(e.relatedTarget)) {
    menuOpen.value = false;
    setTimeout(() => {
      query.value = null;
    }, 100);
  }
};

const handleInputFocus = () => {
  isInputFocused.value = true;
};

const shouldShowPlaceholder = computed(() => {
  if (!hasValue.value && !query.value && !menuOpen.value) return true;
  return false;
});

const shouldShowInputPlaceholder = computed(() => {
  if (!query.value && menuOpen.value) return true;
  return false;
});

const shouldShowValuePlaceholder = computed(() => {
  if (hasValue.value && !menuOpen.value) return true;
  return false;
});

function onDown() {
  if (!menuOpen.value) {
    openMenu();
    return;
  }
  if (filteredItems.value.length > 0) {
    const index = filteredItems.value?.findIndex(
      (x) =>
        getIdAttributeString(x) ===
        (highlightedItemId.value || selectedItem.value?.[props.idAttribute])
    );
    if (index === -1) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[0]);
    } else if (index < filteredItems.value.length - 1) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[index + 1]);
    } else {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[0]);
    }
  }
}

function onUp() {
  if (!menuOpen.value) {
    openMenu();
    return;
  }
  if (filteredItems.value.length > 0) {
    const index = filteredItems.value.findIndex(
      (x) =>
        getIdAttributeString(x) ===
        (highlightedItemId.value || selectedItem.value?.[props.idAttribute])
    );
    if (index === -1 || index === 0) {
      highlightedItemId.value = getIdAttributeString(
        filteredItems.value[filteredItems.value.length - 1]
      );
    } else {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[index - 1]);
    }
  }
}


function sortModel() {
  model.value.sort((a, b) => {
    return Object.keys(itemsModel.value).indexOf(a.toString()) -
           Object.keys(itemsModel.value).indexOf(b.toString());
  });
}

function handleSelection(selectedValue) {
  const idModel = ref(itemsModel.value[selectedValue]);
  idModel.value = !idModel.value;

  if (!Array.isArray(model.value)) {
    model.value = [selectedValue];
    itemsModel.value[selectedValue] = true;
    return;
  }

  updateModel(selectedValue, idModel.value);
  sortModel();
}

function onEnter() {
  if (handleClearButton()) return;
  if (handleMenuOpening()) return;

  const selectedValue = getSelectedValue();
  if (!selectedValue) {
    focusOnDropDown();
    return;
  }

  if (props.selectingKind === 'multiple') {
    handleSelection(selectedValue);
  } else {
    model.value = selectedValue;
    closeMenu();
  }
}

function handleClearButton() {
  if (document.activeElement?.id === 'clearButton') {
    clear();
    closeMenu();
    openMenu();
    return true;
  }
  return false;
}

function handleMenuOpening() {
  if (!menuOpen.value) {
    openMenu();
    return true;
  }
  return false;
}

function getSelectedValue() {
  if (highlightedItemId.value) return highlightedItemId.value;
  if (filteredItems.value.length > 0 && query.value?.trim()) {
    return filteredItems.value[0][props.idAttribute];
  }
  return null;
}

function updateModel(selectedValue, isSelected) {
  const index = model.value.indexOf(selectedValue);
  if (isSelected && index === -1) {
    model.value = [...model.value, selectedValue];
    itemsModel.value[selectedValue] = true;
  } else if (!isSelected && index !== -1) {
    model.value = model.value.filter((id) => id !== selectedValue);
    itemsModel.value[selectedValue] = false;
  }
}

function isItemSelected(item) {
  return (
    selectedItem.value && getIdAttributeString(item) === getIdAttributeString(selectedItem.value)
  );
}

const icon = computed(() => {
  if (Array.isArray(props.items)) {
    return 'chevron-down';
  }
  if (props.hasDetails) {
    return 'search-details';
  }

  return 'search';
});

function openDetails() {
  if (
    !(loadingState.value || props.loading) &&
    !props.disabled &&
    !props.readOnly &&
    props.hasDetails
  ) {
    if (props.detailMode === 'simple') {
      emit('openDetails', props.id);
    } else if (props.detailMode === 'detailed') {
      detailedModeModal.value.open();
    }
  }
}

function focusNextInputElement(e) {
  if (e.shiftKey && e.key === 'ArrowDown') return;

  onDown();
  nextTick(() => {
    // @ts-ignore
    document.getElementsByClassName('lx-value-picker-item lx-highlighted-item')[0]?.focus();
  });
}

function focusPreviousInputElement(e) {
  if (e.shiftKey && e.key === 'ArrowUp') return;

  onUp();
  nextTick(() => {
    // @ts-ignore
    document.getElementsByClassName('lx-value-picker-item lx-highlighted-item')[0]?.focus();
  });
}

function handleShiftArrow(inputElement, direction) {
  if (inputElement && inputElement.setSelectionRange) {
    const textLength = inputElement.value.length;
    if (direction === 'down') {
      inputElement.setSelectionRange(textLength, textLength);
    } else if (direction === 'up') {
      inputElement.setSelectionRange(0, textLength);
    }
  }
}

function activate() {
  allItems.value.forEach((item) => {
    itemsModel.value[getIdAttributeString(item)?.toString()] = false;
  });

  if (model.value) {
    if (Array.isArray(model.value)) {
      model.value?.forEach((id) => {
        if (id) {
          itemsModel.value[id?.toString()] = true;
        }
      });
    } else {
      itemsModel.value[model.value?.toString()] = true;
    }
  }
}
activate();

function selectMultiple(item) {
  activate();
  const idModel = ref(itemsModel.value[getIdAttributeString(item)]);
  idModel.value = !idModel.value;
  let res = model.value;

  if (Array.isArray(model.value)) {
    if (idModel.value) {
      // Check if item already exists in model
      const index = model.value.indexOf(getIdAttributeString(item));
      if (index === -1) {
        // Add item to model
        res = [...model.value, getIdAttributeString(item)];
        itemsModel.value[getIdAttributeString(item)] = true;
      } else {
        // Remove item from model
        const updatedModel = model.value.filter((id) => id !== getIdAttributeString(item));
        res = [...updatedModel];
      }
    } else {
      itemsModel.value[getIdAttributeString(item)] = false;
      const index = model.value.indexOf(getIdAttributeString(item));
      if (index > -1) {
        // Remove item from model
        const updatedModel = model.value.filter((id) => id !== getIdAttributeString(item));
        res = [...updatedModel];
      }
    }
    // Sort model according to order of items
    res.sort(
      (a, b) =>
        Object.keys(itemsModel.value).indexOf(a.toString()) -
        Object.keys(itemsModel.value).indexOf(b.toString())
    );
    model.value = res;
  } else {
    // Initialize model.value as an array if it's not already
    model.value = [getIdAttributeString(item)];
    itemsModel.value[getIdAttributeString(item)] = true;
  }
}

const displayTooltipItems = computed(() => {
  if (!model.value) return [];

  const multipleItems = selectedItems.value?.filter((obj) =>
    model.value.includes(getIdAttributeString(obj))
  );
  if (!multipleItems) return [];

  const itemCount = multipleItems.length;
  if (itemCount === 0) return [];

  const displayedItems = multipleItems.slice(0, 10);
  const remainingCount = itemCount - 10;

  const itemCountSingle =
    remainingCount === 1 && props.texts.tooltipDisplayTextSingle
      ? `+ ${remainingCount} ${props.texts.tooltipDisplayTextSingle}`
      : '';
  const itemCountMulti =
    remainingCount > 1 && props.texts.tooltipDisplayTextMulti
      ? `+ ${remainingCount} ${props.texts.tooltipDisplayTextMulti}`
      : '';

  const displayText = [itemCountSingle, itemCountMulti].filter(Boolean).join(', ');

  if (remainingCount > 0) {
    displayedItems.push({
      id: generateUUID(),
      name: displayText,
    });
  }

  return displayedItems;
});

const displaySelectedItems = computed(() => {
  if (!model.value) return [];
  const multipleItems = selectedItems?.value.filter((obj) =>
    model.value.includes(getIdAttributeString(obj))
  );
  if (!multipleItems) return [];
  listRef.value?.selectRows(multipleItems);
  return multipleItems;
});

const shouldShowIcon = computed(() => {
  if (props.selectingKind === 'single') {
    return !hasValue.value && !props.hasDetails && !(loadingState.value || props.loading);
  }
  if (props.selectingKind === 'multiple') {
    if (props.detailMode === 'simple' || props.detailMode === 'detailed') {
      return (
        !props.hasDetails &&
        (!hasValue.value || hasValue.value) &&
        !(loadingState.value || props.loading)
      );
    }
  }
  return false;
});

const shouldShowDetailsBtn = computed(() => {
  return (
    ((props.selectingKind === 'single' && !hasValue.value) ||
      (props.selectingKind === 'multiple' &&
        ((props.detailMode === 'simple' && (!hasValue.value || hasValue.value)) ||
          (props.detailMode === 'detailed' && (!hasValue.value || hasValue.value))))) &&
    props.hasDetails &&
    !(loadingState.value || props.loading)
  );
});

const detailsSwitchTypes = computed(() => [
  {
    id: 'advanced-search',
    name: props.texts.detailsSwitchAdvancedSearch || '',
    icon: 'search',
  },
  {
    id: 'selected-items',
    name: `${props.texts.detailsSwitchSelectedItems || ''} (${
      displaySelectedItems.value?.length || 0
    })`,
    icon: 'list-bulleted',
  },
]);

let selectionTimeout = null;

function selectionChanged(selectedValue) {
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }

  selectionTimeout = setTimeout(() => {
    if (selectedValue && JSON.stringify(selectedValue) !== JSON.stringify(model.value)) {
      // Update selectedItems.value with new values
      const updatedItems = selectedItems.value?.filter((obj) =>
        selectedValue.includes(obj[props.idAttribute])
      );
      selectedItems.value = updatedItems;

      // Update model.value with new values
      model.value = [...selectedValue];

      // Update itemsModel to reflect the new selection state
      Object.keys(itemsModel.value).forEach((key) => {
        itemsModel.value[key] = selectedValue.includes(key);
      });
    }
  }, 150);
}

const displayReadOnlyPlaceholder = computed(() => {
  if (
    (props.selectingKind === 'single' &&
      (selectedItem.value === null || selectedItem.value === undefined)) ||
    (props.selectingKind === 'multiple' &&
      (selectedItems.value === null ||
        selectedItems.value === undefined ||
        selectedItems.value?.length === 0))
  ) {
    return true;
  }
  return false;
});

const showListOptions = computed(() => {
  return displaySelectedItems.value.length > 0;
});

watch(
  () => [props.items, props.preloadedItems],
  (newValue, oldValue) => {
    activate();
    const [items, preloadedItems] = newValue;
    const [oldItems, oldPreloadedItems] = oldValue || [[], null];

    const shouldSetItems =
      Array.isArray(items) && JSON.stringify(items) !== JSON.stringify(oldItems);
    if (shouldSetItems) {
      allItems.value = JSON.parse(JSON.stringify(items));
      return;
    }

    const shouldSetPreloadedItems =
      Array.isArray(preloadedItems) &&
      JSON.stringify(preloadedItems) !== JSON.stringify(oldPreloadedItems);
    if (shouldSetPreloadedItems) {
      allItems.value = preloadedItems;
    }
  },
  { immediate: true }
);

watch(
  () => props.selectingKind,
  (newValue) => {
    activate();
    selectedItem.value = null;
    selectedItems.value = null;
    itemsModel.value = {};

    if (newValue === 'multiple') {
      model.value = [];
    } else if (newValue === 'single') {
      model.value = null;
    }
  }
);

watch([hasValue, query, menuOpen], ([newHasValue, newQuery, newMenuOpen]) => {
  if (!newHasValue && !newMenuOpen || newHasValue && !newMenuOpen) {
    inputReadonly.value = true;
  } else {
    inputReadonly.value = false;
  }
});

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);


const areSomeSelected = computed(() => {
  let res = false;
  if(typeof props.items === 'function') return null;
  props.items.forEach((item) => {
    if (Array.isArray(model.value) && model.value?.includes(item[props.idAttribute])) res = true;
    return true;
  });
  return res;
});

const areAllSelected = computed(() => {
  let res = props.items?.length > 0;
  if(typeof props.items === 'function') return null;
  props.items.forEach((item) => {
    if (Array.isArray(model.value)) {
      if (!model.value.includes(item[props.idAttribute])) {
        res = false;
      }
    }
  });
  return res;
});

function selectAll() {
  if (areAllSelected.value || areSomeSelected.value) {
    model.value = [];
  } else {
    if(typeof props.items === 'function') return null;
    const res = [];
    const itemModelClone = {...itemsModel.value}
    allItems.value.forEach(async (item) => {
      res.push(getIdAttributeString(item));
      itemModelClone[getIdAttributeString(item)] = true;
    });
    model.value = res;
    itemsModel.value = itemModelClone;
  }
}

onMounted(() => {
  activate();
});
</script>

<template>
  <div class="lx-field-wrapper" ref="refRoot" >
    <p v-if="readOnly" class="lx-data" :aria-labelledby="labelledBy">
      <template v-if="variant === 'default'">
        <span v-if="displayReadOnlyPlaceholder">—</span>
        <template v-else>
          <p class="lx-input-text"> {{ getName(false) }} </p>
        </template>
      </template>

      <template v-if="variant === 'country'">
        <span v-if="displayReadOnlyPlaceholder">—</span>
        <template v-else>
          <LxFlagItemDisplay
            v-if="selectingKind === 'single'"
            :value="selectedItem"
            :id-attribute="idAttribute"
            :name-attribute="nameAttribute"
          />
          <template v-else>
            <p class="lx-input-text"> {{ getName(false) }} </p>
          </template>
        </template>
      </template>

      <template v-if="variant === 'state'">
        <span v-if="displayReadOnlyPlaceholder">—</span>
        <template v-else>
          <LxStateDisplay
            v-if="selectingKind === 'single'"
            :value="selectedItem?.[idAttribute]"
            :dictionary="[
              {
                value: selectedItem?.[idAttribute],
                displayName: selectedItem?.[nameAttribute],
                displayType: props.dictionary?.displayType,
                displayShape: props.dictionary?.displayShape,
              },
            ]"
          />
          <template v-else>
            <p class="lx-input-text"> {{ getName(false) }} </p>
          </template>
        </template>
      </template>
    </p>

    <template v-else>
      <LxInfoWrapper
        placement="auto"
        :disabled="
          selectingKind === 'single' ||
          (selectingKind === 'multiple' && (!model || !model?.length || menuOpen))
        "
      >
        <div
          class="lx-autocomplete-default"
          ref="refContainer"
          :class="[
            { 'lx-opened': menuOpen },
            { 'lx-invalid': invalid },
            { 'lx-disabled': disabled },
          ]"
          :data-invalid="invalid ? '' : null"
          :data-disabled="disabled ? '' : null"
          role="combobox"
          :aria-expanded="menuOpen"
          aria-controls="popper-id"
          :aria-labelledby="labelledBy"
          tabindex="-1"
        >
          <Popper
            id="popper-id"
            placement="bottom"
            offset-distance="0"
            :hover="false"
            :arrow="false"
            :disabled="disabled"
            :show="menuOpen"
            open-delay="0"
            close-delay="0"
          >
            <slot>
              <div class="lx-autocomplete-input-icon-container">
                <div
                  ref="refAutocomplete"
                  class="lx-autocomplete"
                  :title="tooltip"
                  tabindex="-1"
                  @click="openMenu"
                  @keydown.esc.prevent="closeMenu"
                  @keydown.enter.prevent="onEnter"
                  @keydown.down.prevent="focusNextInputElement"
                  @keydown.up.prevent="focusPreviousInputElement"
                  @keydown.f3.prevent="openDetails"
                  @keyup.tab.prevent="focusOnDropDown"
                >
                  <div
                    class="lx-autocomplete-default-panel"
                    :class="[{ multiselect: selectingKind === 'multiple' }]"
                    :title="tooltip"
                  >
                    <div
                      class="lx-autocomplete-default-data"
                      :class="[
                        { emptyModel: model?.length === 0 || !model || selectingKind === 'single' },
                      ]"
                    >
                      <div
                        class="lx-text-input-wrapper lx-input-wrapper"
                        role="search"
                        :class="[
                          { 'lx-disabled': disabled },
                          { 'lx-invalid': invalid },
                        ]"
                        :data-invalid="invalid ? '' : null"
                      >
                        <div v-if="selectingKind === 'multiple' && model?.length > 0" class="lx-tag">
                          <div class="lx-tag-label">{{ model?.length }}</div>
                          <div class="lx-tag-button">
                            <LxButton
                              id="clearButton"
                              :label="texts.clear"
                              :disabled="disabled"
                              kind="secondary"
                              variant="icon-only"
                              icon="remove"
                              @click.stop="clear"
                            />
                          </div>
                        </div>
                        <input
                          ref="refQuery"
                          :placeholder="shouldShowInputPlaceholder ? getName() : null"
                          :id="id"
                          v-model="query"
                          class="lx-text-input lx-value-picker-placeholder lx-input-area"
                         :aria-labelledby="labelledBy"
                          :aria-label="getName(false)"
                          :aria-invalid="invalid"
                          :aria-busy="loadingState || loading"
                          :maxlength="queryMaxLength || null"
                          tabindex="0"
                          :readonly="inputReadonly"
                          @focusout="handleFocusOut"
                          @focus="handleInputFocus"
                          @keydown="handleMenuAndInputKeydown"
                          @touchstart="handleTouchStart"
                        />
                        <div class="lx-invisible" aria-live="polite" v-if="loadingState || loading">{{ props.texts.loadingState }}</div>
                        <template v-if="shouldShowValuePlaceholder">
                          <div
                            class="lx-value lx-input-area"
                            :title="selectingKind === 'single' ? getName(false) : ''"
                          >
                            <template v-if="variant === 'country' && selectingKind === 'single'">
                              <LxFlagItemDisplay
                                :value="selectedItem"
                                :id-attribute="idAttribute"
                                :name-attribute="nameAttribute"
                              />
                            </template>
                            <template v-if="variant === 'state' && selectingKind === 'single'">
                              <LxStateDisplay
                                :value="selectedItem?.[idAttribute]"
                                :dictionary="[
                                  {
                                    value: selectedItem?.[idAttribute],
                                    displayName: selectedItem[nameAttribute],
                                    displayType: props.dictionary?.displayType,
                                    displayShape: props.dictionary?.displayShape,
                                  },
                                ]"
                              />
                            </template>
                            <template
                              v-if="
                                variant === 'default' ||
                                variant === 'custom' ||
                                (variant === 'country' && selectingKind === 'multiple') ||
                                (variant === 'state' && selectingKind === 'multiple')
                              "
                            >
                              <p class="lx-input-text"> {{ getName(false) }} </p>
                            </template>
                          </div>
                        </template>
                        <template v-if="shouldShowPlaceholder">
                          <div class="lx-placeholder lx-input-area">
                            <p class="lx-input-text"> {{ getName() }} </p>
                          </div>
                        </template>
                        <div v-if="invalid && !(loadingState || loading)" class="lx-invalidation-icon-wrapper">
                          <LxIcon
                            customClass="lx-invalidation-icon"
                            value="invalid"
                          />
                        </div>
                        <div v-if="shouldShowIcon" class="lx-input-icon-wrapper">
                          <LxIcon customClass="lx-modifier-icon" :value="icon" />
                        </div>
                        <LxButton
                          v-if="
                            selectingKind === 'single' &&
                            !invalid &&
                            hasValue &&
                            !(loadingState || loading)
                          "
                          id="clearButton"
                          :disabled="disabled"
                          icon="close"
                          kind="ghost"
                          variant="icon-only"
                          :label="texts.clear"
                          @click="clear"
                        />
                        <LxButton
                          v-if="
                            selectingKind === 'single' &&
                            invalid &&
                            hasValue &&
                            !(loadingState || loading)
                          "
                          id="clearButton"
                          :disabled="disabled"
                          icon="close"
                          kind="ghost"
                          variant="icon-only"
                          :label="texts.clear"
                          @click="clear"
                        />
                        <LxButton
                          v-if="shouldShowDetailsBtn"
                          id="detailsButton"
                          :disabled="disabled"
                          icon="search-details"
                          kind="ghost"
                          variant="icon-only"
                          :label="texts.detailsButton"
                          @click="openDetails"
                          @keydown.enter="openDetails"
                          @keydown.tab="focusOnDropDown"
                          @keydown.f3.prevent="openDetails"
                        />
                        <div class="lx-autocomplete-loader" v-if="loadingState || loading" :title="props.texts.loadingState">
                          <LxLoader loading size="s" />
                        </div>
                      </div>
                      <div v-if="invalid" class="lx-invalidation-message" @click.stop>{{ invalidationMessage }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </slot>

            <template #content>
              <div
                ref="refListbox"
                class="lx-dropdown-default-content"
                :style="{ width: panelWidth + 'px' }"
                tabindex="-1"
              >
                <slot name="panel" @click="closeMenu()">
                  <transition name="appear-down">
                    <div
                      v-show="menuOpen && !loading"
                      class="lx-dropdown-panel"
                      tabindex="-1"
                      role="listbox"
                      @keydown.esc.prevent="closeMenu"
                      @keydown.enter="onEnter"
                      @keydown.up.prevent="focusPreviousInputElement"
                      @keydown.down.prevent="focusNextInputElement"
                      @keydown.f3.prevent="openDetails"
                      @keydown.tab="closeMenu"
                      @keydown.backspace="initInputFocus"
                      @keydown="handleMenuAndInputKeydown"
                    >
                      <template v-if="filteredItems?.length">
                        <div v-if="hasSelectAll && typeof props.items !== 'function' && selectingKind==='multiple'" 
                          class="lx-value-picker-item select-all"
                          tabindex="-1"
                          role="option"
                          @click="selectAll"
                          :title="areSomeSelected ? texts.clearChosen : texts.selectAll "
                        >
                          <LxIcon :value="areSomeSelected ? areAllSelected ? 'checkbox-filled' : 'checkbox-indeterminate' : 'checkbox'" />
                          <span>{{ areSomeSelected ? texts.clearChosen : texts.selectAll }}</span>
                        </div>
                        <template v-for="item in filteredItems" :key="item[idAttribute]">
                          <div
                            @click.prevent="
                              props.selectingKind === 'single'
                                ? selectSingle(item)
                                : selectMultiple(item)
                            "
                            @keydown.tab="closeMenu"
                            tabindex="-1"
                            role="option"
                            :aria-selected="isItemSelected(item)"
                            class="lx-value-picker-item"
                            :class="[
                              {
                                'lx-selected': isItemSelected(item) && selectingKind === 'single',
                                'lx-highlighted-item':
                                  highlightedItemId &&
                                  highlightedItemId === getIdAttributeString(item),
                                'autocomplete-multiple': selectingKind === 'multiple',
                                'autocomplete-default-item': variant === 'default',
                              },
                            ]"
                            :id="getItemId(getIdAttributeString(item))"
                            :group-id="groupId"
                            :label="item[nameAttribute]"
                            :disabled="loading"
                            :title="item[nameAttribute]"
                          >
                            <LxCheckbox
                              v-if="selectingKind === 'multiple'"
                              :id="getItemId(item[idAttribute])"
                              :group-id="groupId"
                              v-model="itemsModel[item[idAttribute]]"
                              :disabled="disabled"
                              :value="item[idAttribute]"
                              tabindex="-1"
                              :labelId="getLabelId(item[idAttribute])"
                              @click="selectMultiple(item)"
                            />
                            <label :for="item[idAttribute]" :id="getLabelId(item[idAttribute])">
                              <template v-if="variant === 'country'">
                                <LxFlagItemDisplay
                                  :value="item"
                                  :id-attribute="idAttribute"
                                  :name-attribute="nameAttribute"
                                />
                              </template>

                              <template v-if="variant === 'state'">
                                <LxStateDisplay
                                  :value="item[idAttribute]"
                                  :dictionary="[
                                    {
                                      value: item[idAttribute],
                                      displayName: item[nameAttribute],
                                      displayType: props.dictionary?.displayType,
                                      displayShape: props.dictionary?.displayShape,
                                    },
                                  ]"
                                />
                              </template>

                              <template v-if="variant === 'default'">
                                <LxSearchableText
                                  :value="item[nameAttribute]"
                                  :search-string="query"
                                />
                              </template>

                              <template v-if="variant === 'custom'">
                                <slot name="customItem" v-bind="item"></slot>
                              </template>
                            </label>
                          </div>
                        </template>
                      </template>
                      <template
                        v-if="
                          finalQuery &&
                          finalQuery.length >= props.queryMinLength &&
                          !filteredItems?.length &&
                          !loadingState
                        "
                      >
                        <div class="lx-empty">
                          <LxIcon value="info" />
                          <p>
                            {{ props.texts.empty }} "<span class="lx-highlighted-item">{{
                              query.toLowerCase()
                            }}</span
                            >"
                          </p>
                        </div>
                      </template>
                      <template
                        v-if="
                          queryMinLength !== 0 &&
                          (!finalQuery || finalQuery.length < queryMinLength) &&
                          (!filteredItems || filteredItems?.length === 0)
                        "
                      >
                        <div class="lx-empty">
                          <LxIcon value="info" />
                          <p>
                            {{
                              props.queryMinLength % 10 === 1 && props.queryMinLength !== 11
                                ? props.texts.tryEndingWith1?.replace('{0}', props.queryMinLength)
                                : props.texts.try?.replace('{0}', props.queryMinLength)
                            }}
                          </p>
                        </div>
                      </template>
                    </div>
                  </transition>
                </slot>
              </div>
            </template>
          </Popper>
        </div>

        <template #panel v-if="props.selectingKind === 'multiple' && displayTooltipItems?.length > 0">
          <ul class="lx-list">
            <li v-for="item in displayTooltipItems" :key="item[idAttribute]">
              <div class="lx-row">
                <p class="lx-data">{{ item[nameAttribute] }}</p>
              </div>
            </li>
          </ul>
        </template>
      </LxInfoWrapper>

      <LxModal ref="detailedModeModal" :label="texts.detailsModalLabel" size="m">
        <template v-if="$slots.details && selectingKind === 'multiple'">
          <LxContentSwitcher :items="detailsSwitchTypes" v-model="detailsSwitchType" kind="combo" />
        </template>

        <template
          v-if="
            $slots.details && detailMode === 'detailed' && detailsSwitchType === 'advanced-search'
          "
        >
          <slot name="details"></slot>
        </template>

        <template
          v-if="
            (!$slots.details && selectingKind === 'multiple') ||
            ($slots.details && detailsSwitchType === 'selected-items')
          "
        >
          <LxList
            ref="listRef"
            :items="displaySelectedItems"
            :idAttribute="props.idAttribute"
            :primaryAttribute="props.nameAttribute"
            :hasSelecting="showListOptions"
            :has-search="showListOptions"
            selectingKind="multiple"
            list-type="1"
            @selectionChanged="selectionChanged"
          />
        </template>
      </LxModal>
    </template>
  </div>
</template>
