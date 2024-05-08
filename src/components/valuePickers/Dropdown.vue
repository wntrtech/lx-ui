<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { generateUUID, textSearch } from '@/utils/stringUtils';
import LxIcon from '@/components/Icon.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxAutoComplete from '@/components/AutoComplete.vue';
import LxDropDown from '@/components/Dropdown.vue';
import { onClickOutside } from '@vueuse/core';
import Popper from 'vue3-popper';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [Array, String], default: () => [] },
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
  texts: {
    type: Object,
    default: () => ({
      clearQuery: 'Notīrīt meklēšanu',
      clearChosen: 'Notīrīt visas atlasītās vērtības',
      notSelected: 'Nav izvēlēts',
      searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
    }),
  },
});

const emits = defineEmits(['update:modelValue']);

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

const idValue = ref('');

const itemsModel = ref({});
const itemsDisplay = computed(() => JSON.parse(JSON.stringify(props.items)));

const notSelectedId = 'notSelected';

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
activate();

function deactivate() {
  if (props.kind === 'single' && !props.nullable) {
    if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
  }
}
watch(
  () => props.nullable,
  (newValue) => {
    if (newValue) activate();
    else if (!newValue) deactivate();
  }
);
function clear(e) {
  e?.stopPropagation();

  itemsDisplay.value.forEach((item) => {
    itemsModel.value[item[props.idAttribute].toString()] = false;
  });
  if (!Array.isArray(model.value)) {
    model.value = [];
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
    activate();
    // TODO need normal solution to avoid v-model = [[]] (v-model = null, variant = dropdown, kind = multiple, alwaysAsArray = true), maybe rework emits
    if (Array.isArray(value) && Array.isArray(value[0])) {
      clear();
    }
    
  }
);

const menuOpen = ref(false);
const container = ref();
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
    return selectedItems.value[0].name;
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
function selectSingle(id) {
  let prevId = null;
  if (model.value) {
    prevId = model.value[0]?.toString();
  }

  if (!Array.isArray(model.value)) {
    prevId = model.value;
  }

  if (prevId === id) {
    // Same radio button selected
    return;
  }
  if (!prevId) {
    // Model was empty
    if (props.nullable) {
      itemsModel.value[notSelectedId] = false;
    }
  } else {
    itemsModel.value[prevId] = false;
  }

  itemsModel.value[id] = true;

  if (id === notSelectedId) {
    model.value = [];
    itemsModel.value.notSelected = true;
  } else {
    model.value = [id];
  }
}

watch(
  () => props.kind,
  (newKind) => {
    if (newKind === 'multiple') {
      if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
      model.value = [];
      itemsModel.value = [];
    } else if (newKind === 'single') {
      if (props.nullable) {
        selectSingle(notSelectedId);
      }
    }
  }
);
function selectMultiple(id) {
  if (props.disabled) {
    return;
  }
  if (!model.value) {
    model.value = [];
  }
  const idModel = ref(itemsModel.value[id]);

  idModel.value = !idModel.value;

  if (idModel.value) {
    // Check if item already exists in model
    let index = model.value?.indexOf(id);
    if (!index) {
      index = -1;
    }
    if (index === -1) {
      // Add item to model
      model.value?.push(id);
      itemsModel.value[id] = true;
    } else {
      // Remove item from model
      model.value?.splice(index, 1);
    }

    // Sort model according to order of items
    model.value?.sort(
      (a, b) =>
        Object.keys(itemsModel.value)?.indexOf(a?.toString()) -
        Object.keys(itemsModel.value)?.indexOf(b?.toString())
    );
  } else {
    itemsModel.value[id] = false;
    // Remove item from model
    const index = model.value?.indexOf(id);

    if (index > -1 && Array.isArray(model.value)) {
      model.value?.splice(index, 1);
    }
  }
}
const query = ref();

const hiddenValues = ref([]);

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

const highlightedItemId = ref(null);
const panelWidth = ref();

function closeDropDownDefault() {
  menuOpen.value = false;
}

function openDropDownDefault() {
  if (!menuOpen.value) {
    menuOpen.value = true;
    panelWidth.value = container.value?.offsetWidth;
    
    setTimeout(() => {
      const formElements = document.querySelectorAll(`#${idValue.value} input.lx-checkbox`);
      formElements[highlightedItemId.value - 1]?.focus()
      }, 150);
  }
}
const refRoot = ref();
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
    document.getElementsByClassName('lx-value-picker-item lx-highlighted-item')[0]?.focus();
  });

}

function focusPreviousInputElement() {
  onUp();
  nextTick(() => {
    document.getElementsByClassName('lx-value-picker-item lx-highlighted-item')[0]?.focus();
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
  <span v-if="readOnly">
    <p v-if="readOnlyRenderType === 'row'" class="lx-data">
      {{ getName(false) }} 
    </p>
    <ul v-if="readOnlyRenderType === 'column'" class="lx-column-read-only-data">
        <li v-for="(item, index) in columnReadOnly" :key="index">{{ item }}</li>
    </ul>
    <span v-if="model === null || model === undefined || model?.length < 1" >—</span>
  </span>
  <template v-else>
    <LxAutoComplete
      v-if="kind === 'single' && hasSearch"
      v-model="model"
      :items="itemsDisplay"
      :id-attribute="idAttribute"
      :name-attribute="nameAttribute"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :readOnly="readOnly"
      :disabled="disabled"
      :variant="variantAutoComplete"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="texts"
      :search-attributes="searchAttributes"
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
    >
      <template v-slot:customItem="slotData">
        <slot name="customItemDropdown" v-bind="slotData" />
      </template>
    </LxDropDown>

    <div class="lx-value-picker-dropdown-wrapper" v-if="kind === 'multiple'" ref="refRoot">
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
        :aria-expanded="menuOpen"
        aria-controls="popper-id"
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
            class="lx-dropdown-default-panel"
            @click="openDropDownDefault"
            :class="[
              { 'lx-invalid': invalid && !hasSearch },
              { 'lx-disabled': invalid },
              { 'without-border': hasSearch },
            ]"
            :title="tooltip"
            tabindex="-1"
          >
            <slot>
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
                class="lx-dropdown-default-data dropdown-multiple"
                :class="[{ emptyModel: model?.length === 0 }]"
                :title="tooltip"
              >
                <lx-text-input
                  v-if="hasSearch"
                  ref="queryInput"
                  :disabled="disabled"
                  :invalid="invalid"
                  v-model="query"
                  kind="search"
                  role='search'
                  :placeholder="model ? getName() : texts.searchPlaceholder"
                />
                <lx-button
                  v-if="query"
                  :disabled="disabled"
                  icon="clear"
                  kind="ghost"
                  variant="icon-only"
                  :title="texts.clearQuery"
                  @click="query = ''"
                />
                <div
                  v-if="!hasSearch"
                  class="lx-value-picker-placeholder"
                  :class="[{ emptyModel: model?.length === 0 }]"
                >
                  {{ getName() }}
                </div>
              </div>
              <LxIcon
                v-show="invalid"
                customClass="lx-modifier-icon lx-invalidation-icon"
                value="invalid"
              />
            </slot>
          </div>
          <template #content>
            <div class="lx-dropdown-default-content" :style="{ width: panelWidth + 'px' }">
              <slot name="panel" @click="closeDropDownDefault()">
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
                  >
                    <lx-checkbox
                      v-if="kind === 'multiple'"
                      :id="getItemId(item[idAttribute])"
                      :group-id="groupId"
                      v-model="itemsModel[item[idAttribute]]"
                      :disabled="disabled"
                      :value="item[idAttribute]?.toString()"
                      @click="selectMultiple(item[idAttribute])"
                    />
                    <label :for="item.id">
                    <LxSearchableText
                      :value="item[nameAttribute]"
                      :search-string="query"
                      v-if="variant === 'dropdown'"
                    /></label>
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
