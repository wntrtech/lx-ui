<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { generateUUID, textSearch } from '@/utils/stringUtils';
import useLx from '@/hooks/useLx';
import { lxDevUtils } from '@/utils';

import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxIcon from '@/components/Icon.vue';

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
  variant: { type: String, default: 'default' },
  placeholder: { type: String, default: null },
  hasSearch: { type: Boolean, default: false },
  tooltip: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  readOnlyRenderType: { type: String, default: 'row' }, // 'row' || 'column'
  alwaysAsArray: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  searchAttributes: { type: Array, default: null },
  hasSelectAll: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      clearQuery: 'Notīrīt meklēšanu',
      clearChosen: 'Notīrīt visas izvēlētās vērtības',
      notSelected: 'Nav izvēlēts',
      searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
      selectAll: 'Izvēlēties visu',
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

const idValue = ref('');
const itemsModel = ref({});
const itemsDisplay = computed( () => { 
    const res = [... props.items];
    if(props.kind === 'single' && props.nullable)  
      res.unshift({[props.idAttribute]: 'notSelected', [props.nameAttribute]: props.texts.notSelected});
  
    return res
  }
);
const notSelectedId = 'notSelected';
let currentIndex = 0;

onMounted(() => {
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }
  if (!model.value && props.kind === 'multiple') {
    model.value = [];
  }
  if (
    props.items.length === 0 &&
    model.value !== null &&
    model.value !== undefined &&
    model.value.length > 0
  ) {
    lxDevUtils.log(
      'Error: No items available but v-model value is set.',
      useLx().getGlobals()?.environment,
      'error'
    );
  }
});

function activate() {
  // First set all items as not selected
  itemsDisplay.value.forEach((item) => {
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

  if (model.value && model.value.length > 0) {
    currentIndex = itemsDisplay.value.findIndex((item) => item[props.idAttribute] === model.value);
  } else {
    currentIndex = 0;
  }
}
activate();



watch(
  () => {
    const value = model.value;
    const length = value?.length;
    return { value, length };
  },
  ({ value, length }) => {
    activate();

    if (Array.isArray(value) && length === 0) {
      itemsModel.value.notSelected = true;
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
    return selectedItems.value[0].name;
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
    model.value = [id];
    itemsModel.value[id] = true;
  }
  currentIndex = itemsDisplay.value.findIndex((item) => item[props.idAttribute] === id);
}

watch(
  () => props.kind,
  (newValue) => {
    activate();
    itemsModel.value = {};

    if (newValue === 'multiple') {
      model.value = [];
      if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
    } else if (newValue === 'single') {
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

  const idModel = ref(itemsModel.value[id]);
  idModel.value = !idModel.value;
  const res = [...model.value]

  if (idModel.value) {
    // Check if item already exists in model
    const index = res.indexOf(id);
    if (index === -1) {
      // Add item to model
      res.push(id);
      itemsModel.value[id] = true;
    } else {
      // Remove item from model
      res.splice(index, 1);
    }

    // Sort model according to order of items
    res.sort(
      (a, b) =>
        Object.keys(itemsModel.value).indexOf(a?.toString()) -
        Object.keys(itemsModel.value).indexOf(b?.toString())
    );
  } else {
    itemsModel.value[id] = false;
    // Remove item from model
    const index = res.indexOf(id);
    if (index > -1 && Array.isArray(res)) {
      res.splice(index, 1);
    }
  }
  model.value = res;
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
      if (props.searchAttributes) {
        if (!attributesSearch(val) && query.value.length !== 0) {
          hiddenValues.value.push(val);
        }
      } else {
        if (
          !textSearch(query.value, val[props.nameAttribute]) &&
          !textSearch(query.value, val[props.descriptionAttribute]) &&
          query.value.length !== 0
        ) {
          hiddenValues.value.push(val);
        }
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

function isElementHidden(item) {
  if (query.value?.length > 0) {
    return hiddenValues.value.some(
      (obj) =>
        obj[props.idAttribute] === item[props.idAttribute] &&
        obj[props.nameAttribute] === item[props.nameAttribute]
    );
  }
  return false;
}

const columnReadOnly = computed(() => {
  return selectedItems.value?.map((item) => item[props.nameAttribute]);
});

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

function getTabIndex(id) {
  const isFirstItem = itemsDisplay.value.length > 0 && itemsDisplay.value[0][props.idAttribute] === id;
  const isValidModel = itemsDisplay.value.find(item => item[props.idAttribute] === model.value);
  if (model.value === id || (isFirstItem && !(isValidModel))) {
    return 0;
  }
  return -1;
}

function isAnyItemSelected() {
  return itemsDisplay.value.some(
    (item) => item[props.idAttribute] !== notSelectedId && item[props.idAttribute] === model.value
  );
}

function onPrev() {
  const itemsCount = itemsDisplay.value.length;
  if (itemsCount > 0) {
    currentIndex = (currentIndex - 1 + itemsCount) % itemsCount;
    const prevItem = itemsDisplay.value[currentIndex];
    selectSingle(prevItem[props.idAttribute]);
  }
}

function onNext() {
  const itemsCount = itemsDisplay.value.length;
  if (itemsCount > 0) {
    if (!isAnyItemSelected()) {
      currentIndex = 1;
    } else {
      currentIndex = (currentIndex + 1) % itemsCount;
    }
    const nextItem = itemsDisplay.value[currentIndex];
    selectSingle(nextItem[props.idAttribute]);
  }
}

function handleFocus() {
  nextTick(() => {
    const container = document.getElementById(idValue.value);
    const selectedItem = container?.querySelector('.lx-value-picker-horizontal-icon-wrapper.lx-selected');

    setTimeout(() => {
      selectedItem?.scrollIntoView({
        behavior: 'smooth', 
        block: 'nearest',  
        inline: 'center'
      });
    }, 5);

    // @ts-ignore
    selectedItem?.focus();
  });
}

function focusPrevious() {
  onPrev();
  handleFocus();
}

function focusNext() {
  onNext();
  handleFocus();
}

</script>
<template>
  <div class="lx-value-picker-horizontal-container" :id="idValue">
    <div
      v-if="hasSearch && !readOnly"
      class="lx-toolbar lx-search-toolbar lx-list-toolbar lx-value-picker-search"
    >
      <LxButton
        kind="ghost"
        :icon="
          areSomeSelected
            ? areAllSelected
              ? 'checkbox-filled'
              : 'checkbox-indeterminate'
            : 'checkbox'
        "
        v-if="hasSelectAll && kind === 'multiple'"
        :disabled="disabled"
        @click="selectAll"
        :title="areSomeSelected ? texts.clearChosen : texts.selectAll"
        :label="hasSearch ? '' : areSomeSelected ? texts.clearChosen : texts.selectAll"
      />
      <lx-text-input
        v-if="hasSearch"
        :disabled="disabled"
        ref="queryInput"
        v-model="query"
        kind="search"
        role="search"
        :placeholder="texts.searchPlaceholder"
      />
      <lx-button
        v-if="query && hasSearch"
        icon="clear"
        kind="ghost"
        variant="icon-only"
        :disabled="disabled"
        :title="texts.clearQuery"
        @click="query = ''"
      />
    </div>
    <div
      class="lx-value-picker-horizontal-wrapper"
      :class="[{ 'lx-invalid': invalid }, { 'select-all': hasSelectAll && kind === 'multiple' }]"
      :role="props.kind === 'single' ? 'radiogroup' : 'group'"
    >
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
        <div
          :id="idValue"
          v-for="item in itemsDisplay"
          v-if="!readOnly"
          :key="item[idAttribute]"
          class="lx-value-picker-horizontal-item"
          :class="[
            { 'lx-value-hidden': isElementHidden(item) },
            { 'lx-value-picker-item-disabled': disabled },
          ]"
        >
          <div v-if="kind === 'single'" 
            class="lx-label-wrapper" 
            :group-id="groupId" 
          >
            <div v-if="variant === 'horizontal'"
              class="lx-value-picker-horizontal-item-container"
              @click="selectSingle(item[idAttribute])"
              :title="item[descriptionAttribute] || tooltip"
            >
              <div class="lx-value-picker-horizontal-item-label">
                <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
              </div>
            </div>
            <div v-else-if="variant === 'horizontal-custom'"
              class="lx-value-picker-horizontal-item-container"
              :title="item[descriptionAttribute] || tooltip"
            >
              <div class="lx-slot-wrapper" @click="selectSingle(item[idAttribute])">
                <slot name="customItem" v-bind="item"></slot>
              </div>
            </div>
            <div class="lx-value-picker-horizontal-icon-wrapper" 
              :class="{ 'lx-selected': itemsModel[item[idAttribute]] || (item[idAttribute] === notSelectedId && model === null)}"
              @keydown.right.prevent="focusNext()"
              @keydown.down.prevent="focusNext()"
              @keydown.left.prevent="focusPrevious()"
              @keydown.up.prevent="focusPrevious()"
              @click="selectSingle(item[idAttribute])"
              :tabindex="getTabIndex(item[idAttribute])">
              <LxIcon
                :id="getItemId(item[idAttribute])"
                :value="itemsModel[item[idAttribute]] || (item[idAttribute] === notSelectedId && model === null) ? 'selected' : 'unselected'"
                :disabled="disabled"
                v-model="itemsModel[item[idAttribute]]"
              />
            </div>
          </div>
          <div v-if="kind === 'multiple'"
            class="lx-label-wrapper" 
            :group-id="groupId" 
          >
            <div class="lx-value-picker-horizontal-item-container" v-if="variant === 'horizontal'" @click="selectMultiple(item[idAttribute])">
              <div class="lx-value-picker-horizontal-item-label">
                <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
              </div>
            </div>
            <div
              class="lx-value-picker-horizontal-item-container"
              v-else-if="variant === 'horizontal-custom'"
              :title="item[descriptionAttribute] || tooltip"
            >
              <div class="lx-slot-wrapper" @click="selectMultiple(item[idAttribute])">
                <slot name="customItem" v-bind="item"></slot>
              </div>
            </div>
            <div class="lx-value-picker-horizontal-icon-wrapper" 
              :class="{ 'lx-selected': itemsModel[item[idAttribute]] }"
              @click="selectMultiple(item[idAttribute])"
              @keydown.space.prevent="selectMultiple(item[idAttribute])"
              :tabindex="0"
            >
              <LxIcon
                :id="getItemId(item[idAttribute])"
                :value="itemsModel[item[idAttribute]] ? 'selected' : 'unselected'"
                :disabled="disabled"
                v-model="itemsModel[item[idAttribute]]"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <div v-show="invalid && !readOnly" class="lx-invalidation-message">{{ invalidationMessage }}</div>
</template>
