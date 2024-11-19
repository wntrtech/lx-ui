<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { generateUUID, textSearch } from '@/utils/stringUtils';
import useLx from '@/hooks/useLx';
import { lxDevUtils } from '@/utils';

import LxRadioButton from '@/components/RadioButton.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxSearchableText from '@/components/SearchableText.vue';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: [Array, String], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: () => generateUUID() },
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
  labelId: { type: String, default: null },
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
    if (props.kind !== 'single') return;
    if (newValue) activate();
    else if (!newValue) deactivate();
  }
);

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
    model.value = [id];
    itemsModel.value[id] = true;
  }
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
    const index = model.value.indexOf(id);
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
    props.items.forEach((item) => {
      selectMultiple(item[props.idAttribute]);
    });
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

</script>
<template>
  <div
    class="lx-value-picker-default-wrapper"
    :class="[{ 'lx-invalid': invalid }, { 'select-all': hasSelectAll && kind === 'multiple' }]"
    :aria-invalid="invalid"
    role="radiogroup"
    :title="tooltip"
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
        v-if="hasSearch"
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
        :id="`${idValue}-${index}`"
        v-for="(item, index) in itemsDisplay"
        v-if="!readOnly"
        :key="item[idAttribute]"
        class="lx-value-picker-default-item"
        :class="[
          { 'lx-value-hidden': isElementHidden(item) },
          { 'lx-value-picker-item-disabled': disabled },
        ]"
      >
        <lx-radio-button
          v-if="kind === 'single'"
          :id="getItemId(item[idAttribute])"
          :group-id="groupId"
          v-model="itemsModel[item[idAttribute]]"
          :disabled="disabled"
          :value="item[idAttribute].toString()"
          @click="selectSingle(item[idAttribute])"
          :tabindex="getTabIndex(item[idAttribute])"
          :label-id="`${getLabelId(item[idAttribute])}`"
        >
          <div class="lx-value-picker-default-item-container" :id="`${getLabelId(item[idAttribute])}`" v-if="variant === 'default'" >
            <div class="lx-value-picker-default-item-label" >
              <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
            </div>
            <div class="lx-value-picker-default-item-description">
              <LxSearchableText :value="item[descriptionAttribute]" :search-string="query" />
            </div>
          </div>
          <div
            class="lx-value-picker-default-item-container"
            :id="`${getLabelId(item[idAttribute])}`"
            v-else-if="variant === 'default-custom'"
          >
            <div>
              <slot name="customItem" v-bind="item"></slot>
            </div>
          </div>
        </lx-radio-button>
        <lx-checkbox
          v-if="kind === 'multiple'"
          :id="getItemId(item[idAttribute])"
          :group-id="groupId"
          v-model="itemsModel[item[idAttribute]]"
          :disabled="disabled"
          :value="item[idAttribute]?.toString()"
          :label-id="`${getLabelId(item[idAttribute])}`"
          @click="selectMultiple(item[idAttribute])"
          @keydown.space.prevent="selectMultiple(item[idAttribute])"
        >
          <div class="lx-value-picker-default-item-container" :id="`${getLabelId(item[idAttribute])}`" v-if="variant === 'default'" >
            <div class="lx-value-picker-default-item-label">
              <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
            </div>
            <div class="lx-value-picker-default-item-description">
              <LxSearchableText :value="item[descriptionAttribute]" :search-string="query" />
            </div>
          </div>
          <div
            class="lx-value-picker-default-item-container"
            :id="`${getLabelId(item[idAttribute])}`"
            v-else-if="variant === 'default-custom'"
          >
            <div>
              <slot name="customItem" v-bind="item"></slot>
            </div>
          </div>
        </lx-checkbox>
      </div>

      <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </template>
  </div>
</template>
