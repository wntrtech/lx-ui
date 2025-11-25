<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { textSearch, generateUUID } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxButton from '@/components/Button.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxAutoComplete from '@/components/AutoComplete.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxDropDown from '@/components/Dropdown.vue';
import { onClickOutside } from '@vueuse/core';
import LxPopper from '@/components/Popper.vue';
import { focusNextFocusableElement, getDisplayTexts } from '@/utils/generalUtils';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [Array, String, Number], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: null },
  kind: { type: String, default: 'single' }, // 'single' (with radio buttons; can select one item) or 'multiple' (with checkboxes; can select many items)
  nullable: { type: Boolean, default: false }, // Only if kind === 'single'. If true - adds default radio button 'Not selected'. If false - one item must be already selected.
  variant: { type: String, default: 'dropdown' },
  placeholder: { type: String, default: null },
  hasSearch: { type: Boolean, default: false },
  alwaysAsArray: { type: Boolean, default: false },
  tooltip: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  readOnlyRenderType: { type: String, default: 'row' }, // 'row' || 'column'
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  searchAttributes: { type: Array, default: null },
  hasSelectAll: { type: Boolean, default: false },
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const emits = defineEmits(['update:modelValue']);

const itemsModel = ref({});
const notSelectedId = 'notSelected';
const menuOpen = ref(false);
const container = ref();
const query = ref();
const hiddenValues = ref([]);
const highlightedItemId = ref(null);
const panelWidth = ref();
const refRoot = ref();

const panelRef = ref();

const { activate, deactivate } = useFocusTrap(panelRef, {
  allowOutsideClick: true,
  initialFocus: false,
});

const textsDefault = {
  clearQuery: 'Notīrīt meklēšanu',
  clearChosen: 'Notīrīt visas izvēlētās vērtības',
  notSelected: 'Nav izvēlēts',
  searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
  selectAll: 'Izvēlēties visu',
  noItemsMessage: 'Nav pieejamu vērtību',
  tooltipDisplayTextSingle: 'cits',
  tooltipDisplayTextMulti: 'citi'
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const noItemsMessage = computed(() => displayTexts.value.noItemsMessage);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const getIdAttributeString = (item) => {
  if (Array.isArray(props.idAttribute)) {
    return JSON.stringify(
      props.idAttribute.reduce((result, idKey) => {
        const resArr = { ...result };
        resArr[idKey] = item[idKey];
        if (resArr[idKey] === undefined) {
          throw new Error(
            `Dropdown: idAttribute (${props.idAttribute}) is not defined for item ${JSON.stringify(
              item
            )}`
          );
        }
        return resArr;
      }, {})
    );
  }
  const attribute = item[props.idAttribute];
  if (attribute === undefined) {
    throw new Error(
      `Dropdown: idAttribute (${props.idAttribute}) is not defined for item ${JSON.stringify(item)}`
    );
  }
  return attribute;
};

const itemsDisplay = computed(() => {
  const res = [...props.items];
  if (props.kind === 'single' && props.nullable)
    res.unshift({
      [props.idAttribute]: 'notSelected',
      [props.nameAttribute]: displayTexts.value.notSelected,
    });

  return res;
});

function activateItems() {
  // First set all items as not selected
  itemsDisplay.value?.forEach((item) => {
    itemsModel.value[item[props.idAttribute].toString()] = false;
  });

  // Then set items from model as selected
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
activateItems();

function clear(e = { stopPropagation: () => {} }) {
  e?.stopPropagation();

  itemsDisplay.value.forEach((item) => {
    itemsModel.value[item[props.idAttribute].toString()] = false;
  });

  if (!Array.isArray(model.value)) {
    model.value = null;
  } else {
    model.value?.splice(0, model.value?.length);
  }
}

watch(
  () => {
    const value = model.value;
    const length = value?.length;
    return { value, length };
  },
  ({ value, length }) => {
    if (!value) return;
    activateItems();
    // TODO need normal solution to avoid v-model = [[]] (v-model = null, variant = dropdown, kind = multiple, alwaysAsArray = true), maybe rework emits
    if (Array.isArray(value) && Array.isArray(value[0])) {
      clear();
    }
  }
);

const selectedItems = computed(() => {
  const ret = [];
  let temp = model.value;
  if (!Array.isArray(model.value)) {
    temp = [temp];
  }
  temp.forEach((id) => {
    itemsDisplay.value.forEach((item) => {
      if (id === item[props.idAttribute]) {
        ret.push(item);
      }
    });
  });
  return ret;
});

function getName(returnPlaceholder = true) {
  let text = '';
  if (model.value && !Array.isArray(model.value)) {
    return selectedItems.value[0]?.[props.nameAttribute];
  } else if (model.value && model.value.length > 0) {
    text = selectedItems.value?.map((item) => item[props.nameAttribute])?.join(', ');
  } else if (returnPlaceholder) {
    text = props.placeholder;
  }
  return text;
}

function getItemId(id) {
  return `${props.id}-item-${id}`;
}

function getLabelId(id) {
  return `${id}-${props.id}-label`;
}

function selectSingle(id) {
  if (props.disabled) return;

  // Deselect previously selected item
  if (model.value && !Array.isArray(model.value) && model.value !== notSelectedId) {
    itemsModel.value[model.value.toString()] = false;
  } else if (Array.isArray(model.value) && model.value.length > 0) {
    itemsModel.value[model.value[0].toString()] = false;
  }

  // Select the new item
  if (id === notSelectedId) {
    model.value = null;
    itemsModel.value.notSelected = true;
  } else {
    model.value = id;
    itemsModel.value[id] = true;
  }
}

watch(
  () => props.kind,
  (newKind) => {
    activateItems();
    itemsModel.value = {};

    if (newKind === 'multiple') {
      model.value = [];
      if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
    } else if (newKind === 'single') {
      if (props.nullable) {
        selectSingle(notSelectedId);
      } else {
        selectSingle(itemsDisplay.value[0][props.idAttribute]);
      }
    }
  }
);

function selectMultiple(id) {
  if (props.disabled) return;

  if (!model.value) {
    model.value = [];
  }
  const idModel = ref(itemsModel.value[id]);

  idModel.value = !idModel.value;

  let res = null;
  if (Array.isArray(model.value)) res = [...model.value];
  else return 0;

  if (idModel.value) {
    // Check if item already exists in model
    let index = res?.indexOf(id);
    if (!index) {
      index = -1;
    }
    if (index === -1) {
      // Add item to model
      res?.push(id);
      itemsModel.value[id] = true;
    } else {
      // Remove item from model
      res?.splice(index, 1);
    }

    // Sort model according to order of items
    res?.sort(
      (a, b) =>
        Object.keys(itemsModel.value)?.indexOf(a?.toString()) -
        Object.keys(itemsModel.value)?.indexOf(b?.toString())
    );
  } else {
    itemsModel.value[id] = false;
    // Remove item from model
    const index = res?.indexOf(id);

    if (index > -1 && Array.isArray(res)) {
      res?.splice(index, 1);
    }
  }
  model.value = res;
}

function attributesSearch(item) {
  let found = false;
  props.searchAttributes?.forEach((attrName) => {
    const attrValue = item[attrName as keyof typeof item];
    if (textSearch(query.value, attrValue)) {
      found = true;
    }
  });
  return found;
}

watch(
  () => query.value,
  () => {
    hiddenValues.value = [];
    itemsDisplay.value?.forEach((val) => {
      if (!textSearch(query.value, val.name) && query.value.length !== 0) {
        hiddenValues.value.push(val);
      }
    });
  }
);

watch(
  () => props.hasSearch,
  () => {
    query.value = '';
  }
);

const filteredItems = computed(() => {
  let items = itemsDisplay.value;

  if (Array.isArray(props.items) && query.value?.length > 0) {
    if (Array.isArray(props.searchAttributes) && props.searchAttributes?.length > 0) {
      items = itemsDisplay.value.filter(attributesSearch);
    } else {
      items = itemsDisplay.value.filter((item) => {
        const name = item[props.nameAttribute];
        return textSearch(query.value, name);
      });
    }
  }

  if (props.hasSelectAll && props.kind === 'multiple') {
    return [{ id: 'select-all', name: 'Select all', value: false }, ...items];
  }

  return items;
});


const isItemsEmpty = computed(() => {
  if (!Array.isArray(filteredItems.value)) return true;
  if (props.hasSelectAll && props.kind === 'multiple') {
    return filteredItems.value.length <= 1;
  }
  return filteredItems.value.length === 0;
});

function closeDropDownDefault() {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
  deactivate();
}

function closeDropDownDefaultOnEsc() {
  menuOpen.value = false;

  nextTick(() => {
    container.value.focus();
  });
}

function openDropDownDefault() {
  if (!menuOpen.value) {
    panelWidth.value = container.value?.offsetWidth;
    menuOpen.value = true;

    nextTick(() => {
      activate();
      const formElements = document.querySelectorAll(
        `#${props.id} div.lx-dropdown-default-content > div.lx-value-picker-item`
      );
      formElements[highlightedItemId.value - 1]?.focus();
    });
  } else if (menuOpen.value) {
    closeDropDownDefault();
  }
}

function closeOnClickOutside() {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
  deactivate({
    returnFocus: false,
  });
}

onClickOutside(refRoot, closeOnClickOutside, {
  ignore: ['#poppers'],
});

function onEnter() {
  if (document.activeElement?.id === 'clearButton') {
    clear();
    return;
  }
  if (!menuOpen.value) {
    openDropDownDefault();
    return;
  }
  if (highlightedItemId.value) {
    selectMultiple(highlightedItemId.value);
  }
}

function onDown() {
  if (!menuOpen.value) {
    openDropDownDefault();
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

function focusNextInputElement() {
  onDown();
  nextTick(() => {
    if (panelRef.value) {
      const highlightedItems = panelRef.value.querySelectorAll(
        '.lx-value-picker-item.lx-highlighted-item'
      );
      highlightedItems[0]?.focus();
    }
  });
}

function focusPreviousInputElement() {
  onUp();
  nextTick(() => {
    if (panelRef.value) {
      const highlightedItems = panelRef.value.querySelectorAll(
        '.lx-value-picker-item.lx-highlighted-item'
      );
      highlightedItems[0]?.focus();
    }
  });
}

function onUp() {
  if (!menuOpen.value) {
    openDropDownDefault();
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

const variantDropdown = computed(() => {
  let res = 'dropdown';
  if (props.variant === 'dropdown-custom') res = 'custom';
  return res;
});

const variantAutoComplete = computed(() => {
  let res = 'default';
  if (props.variant === 'dropdown-custom') res = 'custom';
  return res;
});

const handleKeydown = (e) => {
  if (e.key === 'Tab' && menuOpen.value) {
    const tabPressed = e.shiftKey ? 'backward' : 'forward';

    deactivate({
      returnFocus: false,
    });

    menuOpen.value = false;

    focusNextFocusableElement(container.value, tabPressed === 'forward');
  }
};

const areSomeSelected = computed(() => {
  let res = false;
  props.items.forEach((item) => {
    if (Array.isArray(model.value) && model.value?.includes(item[props.idAttribute])) res = true;
    return true;
  });
  return res;
});

const areAllSelected = computed(() => {
  let res = props.items?.length > 0;
  props.items.forEach((item) => {
    if (Array.isArray(model.value)) {
      if (!model.value.includes(item[props.idAttribute])) {
        res = false;
      }
    }
  });
  return res;
});

function isItemSelected(item) {
  if (props.kind === 'multiple' && Array.isArray(model.value)) {
    return model.value.includes(getIdAttributeString(item));
  }
  return false;
}

function selectAll() {
  if (areAllSelected.value) {
    model.value = [];
  } else if (areSomeSelected.value) {
    model.value = [];
  } else {
    const res = [];
    const states = {};
    props.items.forEach((item) => {
      res.push(item[props.idAttribute]);
      states[item[props.idAttribute]] = true;
    });
    model.value = res;
    itemsModel.value = states;
  }
}

onMounted(() => {
  if (!model.value && props.kind === 'multiple') {
    model.value = [];
  }
});

const columnReadOnly = computed(() => {
  return selectedItems.value?.map((item) => item[props.nameAttribute]);
});

const firstFocusableIndex = computed(() =>
  props.hasSelectAll && props.kind === 'multiple' ? 1 : 0
);

const displayTooltipItems = computed(() => {
  if (!model.value) return [];

  const multipleItems = selectedItems.value?.filter((obj) =>
    model.value?.includes(getIdAttributeString(obj))
  );
  if (!multipleItems) return [];

  const itemCount = multipleItems.length;
  if (itemCount === 0) return [];

  const displayedItems = multipleItems.slice(0, 10);
  const remainingCount = itemCount - 10;

  const itemCountSingle =
    remainingCount === 1 && displayTexts.value.tooltipDisplayTextSingle
      ? `+ ${remainingCount} ${displayTexts.value.tooltipDisplayTextSingle}`
      : '';
  const itemCountMulti =
    remainingCount > 1 && displayTexts.value.tooltipDisplayTextMulti
      ? `+ ${remainingCount} ${displayTexts.value.tooltipDisplayTextMulti}`
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

function countDigits(number) {
  return number.toString().length;
}
</script>

<template>
  <template v-if="readOnly">
    <p v-if="readOnlyRenderType === 'row'" class="lx-data">
      {{ getName(false) }}
      <template v-if="model === null || model === undefined || model?.length < 1">—</template>
    </p>
    <ul v-if="readOnlyRenderType === 'column'" class="lx-column-read-only-data">
      <li v-for="(item, index) in columnReadOnly" :key="index">{{ item }}</li>
    </ul>
  </template>

  <template v-else>
    <LxAutoComplete
      v-if="hasSearch"
      :id="id"
      v-model="model"
      :selectingKind="kind"
      :items="itemsDisplay"
      :id-attribute="idAttribute"
      :name-attribute="nameAttribute"
      :placeholder="displayTexts.searchPlaceholder"
      :tooltip="tooltip"
      :readOnly="readOnly"
      :disabled="disabled"
      :variant="variantAutoComplete"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :search-attributes="searchAttributes"
      :labelId="labelId"
      :hasSelectAll="hasSelectAll"
    >
      <template v-slot:customItem="slotData">
        <slot name="customItemDropdown" v-bind="slotData" />
      </template>
    </LxAutoComplete>

    <LxDropDown
      v-if="kind === 'single' && !hasSearch"
      :id="id"
      v-model="model"
      :items="itemsDisplay"
      :id-attribute="idAttribute"
      :name-attribute="nameAttribute"
      :tooltip="tooltip"
      :read-only="readOnly"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      kind="default"
      :placeholder="placeholder"
      :variant="variantDropdown"
      :labelId="labelId"
    >
      <template v-slot:customItem="slotData">
        <slot name="customItemDropdown" v-bind="slotData" />
      </template>
    </LxDropDown>

    <div
      v-if="kind === 'multiple' && !hasSearch"
      class="lx-value-picker-dropdown-wrapper lx-dropdown-multiple"
      ref="refRoot"
    >
      <div
        :id="id"
        class="lx-dropdown-default"
        ref="container"
        :disabled="disabled"
        :aria-disabled="disabled"
        :tabindex="disabled ? '-1' : '0'"
        role="combobox"
        :aria-expanded="menuOpen"
        aria-controls="popper-id"
        :aria-invalid="invalid"
        :aria-labelledby="labelId"
        @keydown.esc.prevent="closeDropDownDefaultOnEsc"
        @keydown.enter.prevent="onEnter"
        @keydown.space.prevent="onEnter"
        @keydown.down.prevent="focusNextInputElement"
        @keydown.up.prevent="focusPreviousInputElement"
        @keydown="handleKeydown"
      >
        <LxPopper
          :id="`${id}-popper`"
          offset-distance="0"
          :disabled="disabled"
          :show="menuOpen"
          role="listbox"
        >
          <div
            class="lx-dropdown-default-panel lx-input-wrapper"
            :class="[{ 'lx-invalid': invalid && !hasSearch }, { 'lx-disabled': disabled }]"
            :title="tooltip"
            tabindex="-1"
            @click="openDropDownDefault"
          >
            <slot>
              <div class="pseudo-input" />
              <div v-if="model?.length > 0" class="lx-tag" :class="[{ ['chars-' + countDigits(model?.length) ] : model?.length > 0 }]">
                <div class="lx-tag-label">{{ model?.length }}</div>
                <div class="lx-tag-button">
                  <LxInfoWrapper
                    ref="infoWrapperRef"
                    :disabled="disabled"
                    :focusable="false"
                  >
                    <LxButton
                      id="clearButton"
                      :label="displayTexts.clearChosen"
                      :disabled="disabled"
                      kind="secondary"
                      variant="icon-only"
                      icon="remove"
                      @click="clear"
                    />
                    <template
                      #panel
                      v-if="
                        displayTooltipItems?.length > 0
                      "
                    >
                      <ul class="lx-list">
                        <li v-for="item in displayTooltipItems" :key="item[idAttribute]">
                          <div class="lx-row">
                            <p class="lx-data">{{ item[nameAttribute] }}</p>
                          </div>
                        </li>
                      </ul>
                    </template>
                  </LxInfoWrapper>
                </div>
              </div>

              <div
                class="lx-dropdown-default-data dropdown-multiple lx-input-area"
                :class="[{ emptyModel: model?.length === 0 }]"
                :title="tooltip"
              >
                <div
                  class="lx-value-picker-placeholder"
                  :class="[{ emptyModel: model?.length === 0 }]"
                >
                  {{ getName() }}
                </div>
              </div>
              <div v-if="invalid" class="lx-invalidation-icon-wrapper">
                <LxIcon customClass="lx-invalidation-icon" value="invalid" />
              </div>
              <div class="lx-input-icon-wrapper">
                <LxIcon customClass="lx-modifier-icon" value="chevron-down" />
              </div>
            </slot>
          </div>

          <template #content>
            <div
              ref="panelRef"
              tabindex="-1"
              class="lx-dropdown-default-content"
              :style="{ width: panelWidth + 'px' }"
              @keydown.esc.prevent="closeDropDownDefaultOnEsc"
              @keydown.enter.prevent="onEnter"
              @keydown.space.prevent="onEnter"
              @keydown.down.prevent="focusNextInputElement"
              @keydown.up.prevent="focusPreviousInputElement"
              @keydown="handleKeydown"
            >
              <slot name="panel" @click="closeDropDownDefault()">
                <div class="lx-dropdown-panel" tabindex="-1" role="listbox">
                  <template v-if="isItemsEmpty">
                      <div class="lx-empty">
                        <LxIcon value="info" />
                        <div class="lx-invisible" aria-hidden="true" tabindex="0"></div>
                      <p>{{ noItemsMessage }}</p>
                    </div>
                  </template>  
                  <template v-for="(item, index) in filteredItems" :key="item[idAttribute]">
                    <!-- Inject "Select All" just before the first item -->
                    <div
                      v-if="
                        index === 0 &&
                        hasSelectAll &&
                        kind === 'multiple' &&
                        !isItemsEmpty
                      "
                      id="select-all"
                      class="lx-value-picker-item select-all"
                      :class="{ 'lx-highlighted-item': highlightedItemId === 'select-all' }"
                      :tabindex="
                        highlightedItemId === 'select-all' ? '0' : !highlightedItemId ? '0' : '-1'
                      "
                      role="button"
                      :title="areSomeSelected ? displayTexts.clearChosen : displayTexts.selectAll"
                      @keydown.enter.prevent="selectAll"
                      @keydown.space.prevent="selectAll"
                      @click="selectAll"
                    >
                      <LxIcon
                        :value="
                          areSomeSelected
                            ? areAllSelected
                              ? 'checkbox-filled'
                              : 'checkbox-indeterminate'
                            : 'checkbox'
                        "
                      />
                      <span>
                        {{ areSomeSelected ? displayTexts.clearChosen : displayTexts.selectAll }}
                      </span>
                    </div>

                    <!-- Normal item rendering -->
                    <div
                      v-if="getIdAttributeString(item) !== 'select-all'"
                      :title="item[nameAttribute]"
                      class="lx-value-picker-item"
                      :tabindex="
                        highlightedItemId && highlightedItemId === getIdAttributeString(item)
                          ? '0'
                          : !highlightedItemId
                          ? index === firstFocusableIndex
                            ? '0'
                            : '-1'
                          : '-1'
                      "
                      role="option"
                      :aria-selected="isItemSelected(item)"
                      :class="[
                        {
                          'lx-highlighted-item':
                            highlightedItemId && highlightedItemId === getIdAttributeString(item),
                        },
                        {
                          'lx-selected': isItemSelected(item),
                        },
                        {
                          'dropdown-multiple': kind === 'multiple',
                        },
                      ]"
                      :id="getItemId(item[idAttribute])"
                      @click="selectMultiple(item[idAttribute])"
                    >
                      <LxCheckbox
                        v-if="kind === 'multiple'"
                        tabindex="-1"
                        :id="getItemId(item[idAttribute])"
                        :group-id="groupId"
                        v-model="itemsModel[item[idAttribute]]"
                        :disabled="disabled"
                        :value="item[idAttribute]?.toString()"
                        :labelId="getLabelId(item[idAttribute])"
                        @click="selectMultiple(item[idAttribute])"
                      />

                      <label :for="item.id">
                        <LxSearchableText
                          :value="item[nameAttribute]"
                          :search-string="query"
                          v-if="variant === 'dropdown'"
                        />
                      </label>

                      <div v-if="variant === 'dropdown-custom'">
                        <slot name="customItemDropdown" v-bind="item"></slot>
                      </div>
                    </div>
                  </template>
                </div>
              </slot>
            </div>
          </template>
        </LxPopper>
      </div>
      <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </div>
  </template>
</template>
