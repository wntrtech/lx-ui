<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { generateUUID, textSearch } from '@/utils/stringUtils';

import LxRadioButton from '@/components/RadioButton.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxSearchableText from '@/components/SearchableText.vue';

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

watch(
  () => {
    const value = model.value;
    const length = value?.length;
    return { value, length };
  },
  ({ value, length }) => {
    activate();

    if (Array.isArray(value) && value.length === 0) {
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
function selectSingle(id) {
  if (props.disabled) {
    return;
  }
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
  (newValue) => {
    activate();
    model.value = [];
    itemsModel.value = [];

    if (newValue === 'multiple') {
      if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
    } else if (newValue === 'single') {
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

  const idModel = ref(itemsModel.value[id]);

  idModel.value = !idModel.value;

  if (idModel.value) {
    // Check if item already exists in model
    const index = model.value.indexOf(id);
    if (index === -1) {
      // Add item to model
      model.value.push(id);
      itemsModel.value[id] = true;
    } else {
      // Remove item from model
      model.value.splice(index, 1);
    }

    // Sort model according to order of items
    model.value.sort(
      (a, b) =>
        Object.keys(itemsModel.value).indexOf(a?.toString()) -
        Object.keys(itemsModel.value).indexOf(b?.toString())
    );
  } else {
    itemsModel.value[id] = false;
    // Remove item from model
    const index = model.value.indexOf(id);
    if (index > -1 && Array.isArray(model.value)) {
      model.value.splice(index, 1);
    }
  }
}
const query = ref();
function defineSelector(item) {
  if (props.kind === 'single') {
    selectSingle(item);
  } else if (props.kind === 'multiple') {
    selectMultiple(item);
  }
}

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
      if(props.searchAttributes){
        if (
        !attributesSearch(val) &&
        query.value.length !== 0
      ) {
        hiddenValues.value.push(val);
      }
      }else{
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
</script>

<template>
  <div class="lx-value-picker-default-wrapper" :class="[{'lx-invalid': invalid}]" role="radiogroup"  :title="tooltip">
    <span v-if="readOnly">
      <p v-if="readOnlyRenderType === 'row'" class="lx-data">
        {{ getName(false) }} 
      </p>
      <ul v-if="readOnlyRenderType === 'column'" class="lx-column-read-only-data">
        <li v-for="(item, index) in columnReadOnly" :key="index">{{ item }}</li>
      </ul>
      <span v-if="model === null || model === undefined || model?.length < 1" >—</span>
    </span>
      
    <template v-else >
      <div
        class="lx-toolbar lx-search-toolbar lx-list-toolbar lx-value-picker-search"
        v-if="hasSearch && !readOnly"
      >
        <lx-text-input
          :disabled="disabled"
          ref="queryInput"
          v-model="query"
          kind="search"
          role='search'
          :placeholder="texts.searchPlaceholder"
        />
        <lx-button
          v-if="query"
          icon="clear"
          kind="ghost"
          variant="icon-only"
          :disabled="disabled"
          :title="texts.clearQuery"
          @click="query = ''"
        />
      </div>

      <div
        :id="idValue"
        v-for="item in itemsDisplay"
        v-if="!readOnly"
        :key="item[idAttribute]"
        class="lx-value-picker-default-item"
        :class="[
          { 'lx-value-hidden': isElementHidden(item) },
          { 'lx-value-picker-item-disabled': disabled },
        ]"
        @click="defineSelector(item[idAttribute])"
      >
        <lx-radio-button
          v-if="kind === 'single'"
          :id="getItemId(item[idAttribute])"
          :group-id="groupId"
          v-model="itemsModel[item[idAttribute]]"
          :disabled="disabled"
          :value="item[idAttribute].toString()"
          @click="selectSingle(item[idAttribute])"
          >
          <div class="lx-value-picker-default-item-container" v-if="variant === 'default'">
            <div class="lx-value-picker-default-item-label">
              <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
            </div>
            <div class="lx-value-picker-default-item-description">
              <LxSearchableText :value="item[descriptionAttribute]" :search-string="query" />
            </div>
          </div>
          <div
            class="lx-value-picker-default-item-container"
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
          @click="selectMultiple(item[idAttribute])"
          @keydown.space="selectMultiple(item[idAttribute])"
        >
        <div class="lx-value-picker-default-item-container" v-if="variant === 'default'">
          <div class="lx-value-picker-default-item-label">
            <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
          </div>
          <div class="lx-value-picker-default-item-description">
            <LxSearchableText :value="item[descriptionAttribute]" :search-string="query" />
          </div>
        </div>
        <div
          class="lx-value-picker-default-item-container"
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
