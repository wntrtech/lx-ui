<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue';
import { generateUUID, textSearch } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxButton from '@/components/Button.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxAutoComplete from '@/components/AutoComplete.vue';
import LxDropDown from '@/components/Dropdown.vue';
import { onClickOutside } from '@vueuse/core';
import Popper from 'vue3-popper';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
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
  texts: {
    type: Object,
    default: () => ({
      clearQuery: 'Notīrīt meklēšanu',
      clearChosen: 'Notīrīt visas izvēlētās vērtības',
      notSelected: 'Nav izvēlēts',
      searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
      selectAll: 'Izvēlēties visu'
    }),
  },
});

const emits = defineEmits(['update:modelValue']);

const idValue = ref('');
const itemsModel = ref({});
const notSelectedId = 'notSelected';
const menuOpen = ref(false);
const container = ref();
const query = ref();
const hiddenValues = ref([]);
const highlightedItemId = ref(null);
const panelWidth = ref();
const refRoot = ref();
const activeDropdown = ref(null);

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

const itemsDisplay = computed(() => JSON.parse(JSON.stringify(props.items)));

function activate() {
  // First set all items as not selected
  itemsDisplay.value.forEach((item) => {
    itemsModel.value[item[props.idAttribute].toString()] = false;
  });

  if (
    props.kind === 'single' &&
    props.nullable &&
    !itemsDisplay.value.some(
      (item) =>
        item[props.idAttribute].toString() === notSelectedId ||
        item[props.nameAttribute].toString() === props.texts.notSelected
    )
  ) {
    itemsDisplay.value.unshift({
      [props.idAttribute]: notSelectedId,
      [props.nameAttribute]: props.texts.notSelected,
    });
    itemsModel.value[notSelectedId] = model.value?.length === 0 || !model.value;
  }

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
activate();

function deactivate() {
  if (props.kind === 'single' && !props.nullable) {
    if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
  }
}

watch(
  () => props.nullable,
  (newValue) => {
    if (props.kind !== "single") return
    if (newValue) activate();
    else if (!newValue) deactivate();
  }
);

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
    activate();
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
    return selectedItems.value[0]?.name;
  } else if (model.value && model.value.length > 0) {
    text = selectedItems.value?.map((item) => item[props.nameAttribute])?.join(', ');
  } else if (returnPlaceholder) {
    text = props.placeholder;
  }
  return text;
}

function getItemId(id) {
  return `${id}---${generateUUID()}`;
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
    activate();
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
  },
);

function selectMultiple(id) {
  if (props.disabled) return;
  
  if (!model.value) {
    model.value = [];
  }
  const idModel = ref(itemsModel.value[id]);

  idModel.value = !idModel.value;

  let res = model.value;
  if(Array.isArray(model.value)) res = [...model.value]
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
  if (Array.isArray(props.items) && query.value?.length > 0) {
    if (Array.isArray(props.searchAttributes) && props.searchAttributes?.length > 0) {
      return props.items.filter(attributesSearch);
    }
    return itemsDisplay.value.filter((item) => {
      const name = item[props.nameAttribute];
      return textSearch(query.value, name);
    });
  }
  return itemsDisplay.value;
});

function closeDropDownDefault() {
  menuOpen.value = false;
}

function openDropDownDefault() {
  if (!menuOpen.value) {
    menuOpen.value = true;
    panelWidth.value = container.value?.offsetWidth;
    activeDropdown.value = container.value;
    setTimeout(() => {
      const formElements = document.querySelectorAll(`#${idValue.value} input.lx-checkbox`);
      formElements[highlightedItemId.value - 1]?.focus()
      }, 150);
  } else if (menuOpen.value) {
    closeDropDownDefault();
  }
}

onClickOutside(refRoot, closeDropDownDefault);

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
    if (activeDropdown.value) {
      const highlightedItems = activeDropdown.value.querySelectorAll(
        '.lx-value-picker-item.lx-highlighted-item'
      );
      highlightedItems[0]?.focus();
    }
  });
}

function focusPreviousInputElement() {
  onUp();
  nextTick(() => {
    if (activeDropdown.value) {
      const highlightedItems = activeDropdown.value.querySelectorAll(
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

function focusOnDropDown() {
  if (menuOpen.value) {
    closeDropDownDefault();
    setTimeout(() => {
      container.value.focus();
    }, 5);
  }
}

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
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }
  idValue.value = idValue.value.replace(idValue.value.charAt(0), 'b');
  if (!model.value && props.kind === 'multiple') {
    model.value = [];
  }
});

const columnReadOnly = computed(() => {
  return selectedItems.value?.map((item) => item[props.nameAttribute]);
});
</script>

<template>
  <template v-if="readOnly">
    <p v-if="readOnlyRenderType === 'row'" class="lx-data">
      {{ getName(false) }} 
      <template v-if="model === null || model === undefined || model?.length < 1" >—</template>
    </p>
    <ul v-if="readOnlyRenderType === 'column'" class="lx-column-read-only-data">
        <li v-for="(item, index) in columnReadOnly" :key="index">{{ item }}</li>
    </ul>
  </template>
  
  <template v-else>
    <LxAutoComplete
      v-if="hasSearch"
      v-model="model"
      :selectingKind="kind"
      :items="itemsDisplay"
      :id-attribute="idAttribute"
      :name-attribute="nameAttribute"
      :placeholder="texts?.searchPlaceholder"
      :tooltip="tooltip"
      :readOnly="readOnly"
      :disabled="disabled"
      :variant="variantAutoComplete"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="texts"
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
      id="dropdown-component"
      v-model="model"
      :items="itemsDisplay"
      :id-attribute="idAttribute"
      :name-attribute="nameAttribute"
      :tooltip="tooltip"
      :read-only="readOnly"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      kind="default"
      :placeholder="placeholder"
      :variant="variantDropdown"
      :labelId="labelId"
    >
      <template v-slot:customItem="slotData">
        <slot name="customItemDropdown" v-bind="slotData" />
      </template>
    </LxDropDown>
    
    <div class="lx-value-picker-dropdown-wrapper" v-if="kind === 'multiple' && !hasSearch" ref="refRoot">
      <div
        class="lx-dropdown-default"
        :id="idValue"
        ref="container"
        :disabled="disabled"
        @keydown.esc.prevent="closeDropDownDefault"
        @keydown.enter.prevent="onEnter"
        @keydown.space.prevent="onEnter"
        @keydown.down.prevent="focusNextInputElement"
        @keydown.up.prevent="focusPreviousInputElement"
        @keydown.tab="focusOnDropDown"
        tabindex="0"
        role="combobox"
        :aria-invalid="invalid"
        :aria-expanded="menuOpen"
        aria-controls="popper-id"
        :aria-labelledby="labelId"
      >
        <Popper
          id="popper-id"
          placement="bottom"
          offset-distance="0,9"
          :hover="false"
          :arrow="false"
          :disabled="props.disabled"
          :show="menuOpen"
          open-delay="0"
          close-delay="0"
        >
          <div
            class="lx-dropdown-default-panel lx-input-wrapper"
            @click="openDropDownDefault"
            :class="[
              { 'lx-invalid': invalid && !hasSearch },
              { 'lx-disabled': disabled },
            ]"
            :title="tooltip"
            tabindex="-1"
          >
            <slot>
              <div class="pseudo-input" />
              <div v-if="model?.length > 0" class="lx-tag">
                <div class="lx-tag-label">{{ model?.length }}</div>
                <div class="lx-tag-button">
                  <lx-button
                    id="clearButton"
                    :title="texts.clearChosen"
                    :disabled="disabled"
                    kind="secondary"
                    variant="icon-only"
                    icon="remove"
                    @click="clear"
                  />
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
                <LxIcon
                  customClass="lx-invalidation-icon"
                  value="invalid"
                />
              </div>
              <div class="lx-input-icon-wrapper">
                <LxIcon customClass="lx-modifier-icon" value="chevron-down" />
              </div>
            </slot>
          </div>

          <template #content>
            <div class="lx-dropdown-default-content" :style="{ width: panelWidth + 'px' }">
              <slot name="panel" @click="closeDropDownDefault()">
                <div v-if="hasSelectAll" class="lx-value-picker-item select-all" tabindex="-1" role="option" @click="selectAll" :title="areSomeSelected ? texts.clearChosen : texts.selectAll ">
                  <LxIcon :value="areSomeSelected ? areAllSelected ? 'checkbox-filled' : 'checkbox-indeterminate' : 'checkbox'" />
                  <span>{{ areSomeSelected ? texts.clearChosen : texts.selectAll }}</span> 
                </div>
                <template v-for="item in filteredItems" :key="item[idAttribute]">
                  <div
                    @click="selectMultiple(item[idAttribute])"
                    :title="item[nameAttribute]"
                    class="lx-value-picker-item"
                    tabindex="-1"
                    role="option"
                    :class="[
                        {
                          'lx-highlighted-item':
                            highlightedItemId && highlightedItemId === getIdAttributeString(item),
                        },
                      ]"
                    :id="getItemId(item[idAttribute])"
                  >
                    <LxCheckbox
                      v-if="kind === 'multiple'"
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
              </slot>
            </div>
          </template>
        </Popper>
      </div>
      <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </div>
  </template>
</template>
