<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { generateUUID, textSearch } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxLoader from '@/components/Loader.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxFlagItemDisplay from '@/components/itemDisplay/FlagItemDisplay.vue';
import { onClickOutside, useDebounceFn } from '@vueuse/core';
import Popper from 'vue3-popper';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: [String, Object], default: null },
  items: { type: [Array, Function], default: () => [] },
  idAttribute: { type: [Array, String], default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  dictionary: { type: Object, default: null },
  groupId: { type: String, default: null },
  queryMinLength: { type: Number, default: 0 },
  queryDebounce: { type: [String, Number], default: 200 },
  placeholder: { type: String, default: null },
  tooltip: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  loading: { type: Boolean, default: false },
  hasDetails: { type: Boolean, default: false },
  variant: { type: String, default: 'default' }, // default, country, state, custom
  // used for preloading items if items is a function and there is need to show items before user starts typing
  preloadedItems: { type: Array, default: null },
  texts: {
    type: Object,
    default: () => ({
      clear: 'Notīrīt izvēli',
      empty: 'Nav atrasti rezultāti, kas saturētu tekstu',
      tryEndingWith1: 'Lai sāktu meklēšanu, ievadiet vismaz {0} simbolu',
      try: 'Lai sāktu meklēšanu, ievadiet vismaz {0} simbolus',
    }),
  },
  searchAttributes: { type: Array, default: null }, // array of attributes for search
});

const menuOpen = ref(false);
const refContainer = ref();
const refAutocomplete = ref();

const refQuery = ref();
const refRoot = ref();
const query = ref();
const activeQuery = ref();
const emit = defineEmits(['update:modelValue', 'filter', 'openDetails']);
const loadingState = ref(false);
const allItems = ref([]);

const selectedIdValue = computed({
  get: () => {
    if (Array.isArray(props.idAttribute)) {
      return props.modelValue;
    }
    if (props.modelValue !== undefined && props.modelValue !== null) {
      const value =
        // @ts-ignore
        typeof props.modelValue === 'boolean' ? props.modelValue.toString() : props.modelValue;
      return value;
    }
    return null;
  },
  set: (value) => {
    if (Array.isArray(props.idAttribute) && value) {
      emit('update:modelValue', JSON.parse(value));
    } else {
      emit('update:modelValue', value);
    }
  },
});

const orderObject = (item) => {
  const orderedIdAttributes = [...props.idAttribute].sort();
  const isCurrentValEmpty = !orderedIdAttributes.some((idKey) => item[idKey]);
  if (isCurrentValEmpty) {
    return {};
  }
  return JSON.stringify(
    orderedIdAttributes.reduce((result, idKey) => {
      const resArr = { ...result };
      resArr[idKey] = item[idKey];
      if (!Object.prototype.hasOwnProperty.call(item, idKey)) {
        throw new Error(
          `Autocomplete: idAttribute (${
            props.idAttribute
          }) is not defined for item ${JSON.stringify(item)}`
        );
      }
      return resArr;
    }, {})
  );
};

const getIdAttributeString = (item) => {
  if (Array.isArray(props.idAttribute)) {
    return orderObject(item);
  }
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

const selectedItem = ref(null);

watch(
  () => [selectedIdValue.value, allItems.value],
  (watchVals) => {
    const selectedId = watchVals[0];
    // ToDo: add more checks - if item is already correctly selected (and just allItems changed) don't do anything
    if (selectedId) {
      let selected = null;
      if (Array.isArray(props.idAttribute)) {
        selected = allItems.value?.find(
          (item) => getIdAttributeString(selectedId) === getIdAttributeString(item)
        );
      } else {
        selected = allItems.value?.find((item) => selectedId === getIdAttributeString(item));
      }
      if (selected) {
        selectedItemStored.value = selected;
        selectedItem.value = selected;
      } else if (
        !menuOpen.value &&
        props.preloadedItems?.find((item) => selectedId === getIdAttributeString(item))
      ) {
        // if item is not in allItems, but is in preloadedItems, take it from preloadedItems
        allItems.value = props.preloadedItems;
      } else {
        selectedItem.value = selectedItemStored.value;
      }
    } else {
      selectedItem.value = null;
    }
  }
);

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

watch(
  () => [props.items, props.preloadedItems],
  (newValue, oldValue) => {
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

const debouncedSearchReq = useDebounceFn(async (val) => {
  if (typeof props.items === 'function') {
    loadingState.value = true;
    activeQuery.value = val;
    const items = await props.items(val);
    allItems.value = items;
    loadingState.value = activeQuery.value !== val;
  }
}, props.queryDebounce);

watch(
  query,
  async (newValue, oldValue) => {
    if ((newValue?.length || 0) < props.queryMinLength) {
      const destroyResults = newValue?.length > oldValue?.length;
      if (destroyResults) {
        allItems.value = [];
      }
      return;
    }
    if (typeof props.items === 'function') {
      await debouncedSearchReq(newValue);
    }
  },
  { immediate: true }
);

const idValue = ref('');
onMounted(() => {
  
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }
  idValue.value = idValue.value.replace(idValue.value.charAt(0), 'c');
});

function getName(returnPlaceholder = true) {
  if (Array.isArray(selectedIdValue.value)) {
    selectedItem.value = filteredItems?.value.find(
      (obj) => obj[props.idAttribute] === selectedIdValue.value[0]
    );
  }
  if (selectedItem.value) {
    return selectedItem.value[props.nameAttribute];
  }

  return returnPlaceholder ? props.placeholder : null;
}


const hasValue = computed(() => selectedItem.value && Object.keys(selectedItem.value).length > 0);

function getItemId(id) {
  return `${id}---${generateUUID()}`;
}

function initSearchInput() {
  query.value = null;
  if (refQuery.value) refQuery.value.focus();
}

const panelWidth = ref();
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

function closeMenu() {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
  highlightedItemId.value = null;
  if (refQuery.value) refQuery.value.focus();
}
onClickOutside(refRoot, closeMenu);

function clear(e) {
  e.stopPropagation();
  selectedIdValue.value = null;
}

function selectSingle(item) {
  try {
    selectedIdValue.value = getIdAttributeString(item);
  } finally {
    closeMenu();
  }
}

function onDown() {
  if (!menuOpen.value) {
    openMenu();
    return;
  }
  if (filteredItems.value.length > 0) {
    const index = filteredItems.value?.findIndex(
      (x) => getIdAttributeString(x) === highlightedItemId.value
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
    const index = filteredItems.value?.findIndex(
      (x) => getIdAttributeString(x) === highlightedItemId.value
    );
    if (index === -1) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[0]);
    } else if (index > 0) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[index - 1]);
    } else {
      highlightedItemId.value = getIdAttributeString(
        filteredItems.value[filteredItems.value.length - 1]
      );
    }
  }
}

function onEnter() {
  if (!menuOpen.value) {
    openMenu();
    return;
  }
  if (highlightedItemId.value) {
    try {
      selectedIdValue.value = highlightedItemId.value;
    } finally {
      closeMenu();
    }
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
    !hasValue.value &&
    props.hasDetails
  ) {
    emit('openDetails', props.id);
  }
}
function focusNextInputElement() {
  onDown();
  nextTick(() => {
    document.getElementsByClassName('lx-value-picker-item lx-highlighted-item')[0]?.focus();
  });
}
function focusPreviousInputElement() {
  onUp();
  nextTick(() => {
    document.getElementsByClassName('lx-value-picker-item lx-highlighted-item')[0]?.focus();
  });
}

function focusOnDropDown() {
  if (menuOpen.value) {
    closeMenu();
    nextTick(() => {
      refAutocomplete.value.focus();
    });
  }
}
</script>

<template>
  <div class="lx-field-wrapper" ref="refRoot">

    <p v-if="readOnly" class="lx-data">
      <template v-if="variant === 'country'">
        <span v-if="selectedItem === null || selectedItem === undefined">—</span>
        <LxFlagItemDisplay
        v-else
          :value="selectedItem"
          :id-attribute="idAttribute"
          :name-attribute="nameAttribute"
        />
      </template>
      <template v-if="variant === 'state'">
        <span v-if="selectedItem === null || selectedItem === undefined">—</span>
        <LxStateDisplay
        v-else
          :value="selectedItem?.id"
          :dictionary="[
            {
              value: selectedItem?.id,
              displayName: selectedItem?.name,
              displayType: props.dictionary?.displayType,
              displayShape: props.dictionary?.displayShape,
            },
          ]"
        />
      </template>
      <template v-if="variant === 'default'">{{ getName(false) }} <span v-if="selectedItem === null || selectedItem === undefined">—</span></template>
    </p>
    <template v-else>
      <div
        ref="refContainer"
        :id="idValue"
        class="lx-autocomplete-default"
        :class="[{ 'lx-opened': menuOpen }, { 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
        :data-invalid="invalid ? '' : null"
        :data-disabled="disabled ? '' : null"
        role="combobox"
        tabindex="-1"
      >
        <Popper
          placement="bottom"
          offset-distance="0,9"
          :hover="false"
          :arrow="false"
          :disabled="props.disabled"
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
                @click="openMenu"
                @keydown.esc.prevent="closeMenu"
                @keydown.enter.prevent="onEnter"
                @keydown.down.prevent="focusNextInputElement"
                @keydown.up.prevent="focusPreviousInputElement"
                @keydown.tab="focusOnDropDown"
                @keydown.f3.prevent="openDetails"
                tabindex="0"
              >
                <div class="lx-autocomplete-default-panel" @click="openMenu" :title="tooltip">
                  <div v-show="!menuOpen && hasValue" class="lx-value" :title="getName()">
                    <template v-if="variant === 'country'">
                      <LxFlagItemDisplay
                        :value="selectedItem"
                        :id-attribute="idAttribute"
                        :name-attribute="nameAttribute"
                      />
                    </template>
                    <template v-if="variant === 'state'">
                      <LxStateDisplay
                        :value="selectedItem?.id"
                        :dictionary="[
                          {
                            value: selectedItem?.id,
                            displayName: selectedItem?.name,
                            displayType: props.dictionary?.displayType,
                            displayShape: props.dictionary?.displayShape,
                          },
                        ]"
                      />
                    </template>
                    <template v-if="variant === 'default' || variant === 'custom'">
                      {{ getName() }}
                    </template>
                  </div>
                  <div v-show="!menuOpen && !hasValue" class="lx-placeholder">{{ getName() }}</div>
                  <div
                    v-show="menuOpen"
                    class="lx-text-input-wrapper"
                    :data-invalid="invalid ? '' : null"
                  >
                    <input
                      ref="refQuery"
                      :placeholder="getName()"
                      v-model="query"
                      class="lx-text-input lx-value-picker-placeholder"
                      role="search"
                      tabindex="-1"
                    />
                  </div>
                </div>
              </div>
              <div class="lx-icons">
                <LxIcon
                  v-show="invalid && !(loadingState || loading)"
                  customClass="lx-modifier-icon lx-invalidation-icon"
                  value="invalid"
                />
                <div v-show="!invalid && !hasValue && !hasDetails && !(loadingState || loading)">
                  <LxIcon customClass="lx-modifier-icon" :value="icon" />
                </div>
                <div v-show="!invalid && hasValue && !(loadingState || loading)">
                  <LxButton :disabled="disabled" icon="close" kind="ghost" @click="clear" title="Clear" />
                </div>
                <div
                  class="lx-invalid-true"
                  v-show="invalid && hasValue && !(loadingState || loading)"
                  
                > 
                  <LxButton :disabled="disabled" icon="close" kind="ghost" @click="clear" title="Clear" />
                </div>
                <div
                  class="lx-primary"
                  v-if="hasDetails && !hasValue && !(loadingState || loading)"
                >
                  <LxButton
                    :disabled="disabled"
                    icon="search-details"
                    kind="ghost"
                    @click="openDetails"
                  />
                </div>
                <div class="lx-autocomplete-loader" v-show="loadingState || loading">
                  <LxLoader loading size="s" />
                </div>
              </div>
            </div>
          </slot>

          <template #content>
            <div class="lx-dropdown-default-content" :style="{ width: panelWidth + 'px' }">
              <slot name="panel" @click="closeMenu()">
                <transition name="appear-down">
                  <div
                    v-show="menuOpen && !loading"
                    :class="`lx-dropdown-panel`"
                    tabindex="-1"
                    role="listbox"
                    @keydown.esc.prevent="closeMenu"
                    @keydown.enter.prevent="onEnter"
                    @keydown.space.prevent="onEnter"
                    @keydown.up.prevent="focusPreviousInputElement"
                    @keydown.down.prevent="focusNextInputElement"
                    @keydown.tab="focusOnDropDown"
                  >
                    <template v-if="filteredItems?.length">
                      <template v-for="item in filteredItems" :key="item[idAttribute]">
                        <div
                          @click="selectSingle(item)"
                          class="lx-value-picker-item"
                          :class="[
                            {
                              'lx-selected': isItemSelected(item),
                              'lx-highlighted-item':
                                highlightedItemId &&
                                highlightedItemId === getIdAttributeString(item),
                            },
                          ]"
                          tabindex="0"
                          role="option"
                        >
                          <div
                            :id="getItemId(getIdAttributeString(item))"
                            :group-id="groupId"
                            :label="item[nameAttribute]"
                            :disabled="loading"
                          >
                            <template v-if="variant === 'country'">
                              <LxFlagItemDisplay
                                :value="item"
                                :id-attribute="idAttribute"
                                :name-attribute="nameAttribute"
                              />
                            </template>
                            <template v-if="variant === 'state'">
                              <LxStateDisplay
                                :value="item.id"
                                :dictionary="[
                                  {
                                    value: item.id,
                                    displayName: item.name,
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
                          </div>
                        </div>
                      </template>
                    </template>
                    <template
                      v-if="
                        query &&
                        query.length >= props.queryMinLength &&
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
                        (!query || query.length < queryMinLength) &&
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

      <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </template>
  </div>
</template>
