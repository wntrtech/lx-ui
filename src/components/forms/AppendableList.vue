<script setup>
import { computed, onMounted } from 'vue';
import LxButton from '@/components/Button.vue';
import LxForm from '@/components/forms/Form.vue';
import LxDataBlock from '@/components/DataBlock.vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: Array, default: null },
  readOnly: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  addButtonLabel: { type: String, default: 'Pievienot ierakstu' },
  columnCount: { type: Number, default: 1 },
  kind: { type: String, default: 'default' }, // default || compact
  requiredMode: { type: String, default: 'optional' }, // required || required-asterisk || optional //
  canAddItems: { type: Boolean, default: true },
  actionDefinitions: { type: Array, default: () => [] }, //
  forceUppercase: { type: Boolean, default: true },
  hasSelecting: { type: Boolean, default: false },
  selectingKind: { type: String, default: 'single' }, // 'single' or 'multiple'
  defaultExpanded: { type: Boolean, default: true }, //
  expandedAttribute: { type: String, default: 'extended' },
  selectedValues: { type: Object, default: () => {} },
  texts: {
    type: Object,
    default: () => ({
      removeItem: 'Dzēst ierakstu',
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'actionClick', 'update:selectedValues']);

// Adds a unique key to each object in the model
function addKey(object) {
  const res = object?.map((obj) => {
    if (!('_lx_appendableKey' in obj)) return { ...obj, _lx_appendableKey: generateUUID() };
    return { ...obj };
  });
  return res;
}

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    const res = addKey(value);
    emits('update:modelValue', res);
  },
});

function removeItem(id) {
  const index = model.value.findIndex((x) => x._lx_appendableKey === id);
  model.value.splice(index, 1);
}
function addItem() {
  let res = [{}];
  if (props.modelValue) {
    const object = { ...model.value[0] };
    Object.keys(object)?.forEach((k) => (object[k] = null));
    res = [...model.value];
    delete object._lx_appendableKey;
    res.push(object);
  }
  model.value = res;
}
const expanded = computed(() => {
  const object = [...model.value];
  const transformedStructure = object?.reduce((result, obj) => {
    const res = result;
    if (obj[props.expandedAttribute] && typeof obj[props.expandedAttribute] === 'boolean')
      res[obj?.id] = obj[props.expandedAttribute];
    else {
      res[obj?.id] = props.defaultExpanded;
    }
    return res;
  }, {});
  return transformedStructure;
});

// Takes out all the _lx_appendableKey properties from the model
function clearModel() {
  const res = [];
  model.value?.forEach((obj) => {
    const modifiedObj = { ...obj };
    delete modifiedObj._lx_appendableKey;
    res.push(modifiedObj);
  });
  return res;
}

function changeActions(actionDefinitions, item) {
  return actionDefinitions.map((x) => {
    const updatedAction = { ...x };

    if (x.enableByAttribute) {
      const value = item[x.enableByAttribute];
      if (!value) {
        updatedAction.disabled = true;
      }
    }
    return updatedAction;
  });
}

const allActions = computed(() => {
  if (!props.readOnly && props.actionDefinitions.length === 0) {
    return [
      {
        id: 'appendableListDelete',
        icon: 'remove-item',
        destructive: true,
        title: props.texts.removeItem,
      },
      ...props.actionDefinitions,
    ];
  }
  if (!props.readOnly && props.actionDefinitions.length > 0) {
    return [
      {
        id: 'appendableListDelete',
        name: props.texts.removeItem,
        icon: 'remove-item',
        destructive: true,
        title: props.texts.removeItem,
      },
      ...props.actionDefinitions,
    ];
  }
  return props.actionDefinitions;
});

function actionClick(val, deleteKey, item) {
  if (val === 'appendableListDelete') removeItem(deleteKey);
  else emits('actionClick', val, item);
}

const selectedValues = computed({
  get() {
    if (!props.selectedValues) return {};
    return props.selectedValues;
  },
  set(value) {
    emits('update:selectedValues', value);
  },
});

function deselectAll() {
  Object.keys(selectedValues.value).forEach((key) => {
    selectedValues.value[key] = false;
  });
}

function changeSelecting(value) {
  if (props.selectingKind === 'single') {
    deselectAll();
    selectedValues.value = { [value]: true };
  }
}

onMounted(() => {
  model.value = props.modelValue;
});
defineExpose({ clearModel });
</script>
<template>
  <div class="lx-appendable-list" :class="[{ 'lx-appendable-list-compact': kind === 'compact' }]">
    <div
      v-for="(item, index) in model"
      :key="item._lx_appendableKey"
      class="lx-appendable-list-item"
    >
      <template v-if="expandable">
        <LxDataBlock
          :id="item[idAttribute]"
          :name="item[nameAttribute]"
          :expandable="true"
          v-model="expanded[item?.[idAttribute]]"
          :actionDefinitions="changeActions(allActions, item)"
          :forceUppercase="forceUppercase"
          :hasSelecting="hasSelecting"
          :selectingKind="selectingKind"
          @actionClick="(val) => actionClick(val, item._lx_appendableKey, item[idAttribute])"
          @selectingClick="changeSelecting"
          v-model:selected="selectedValues[item?.[idAttribute]]"
        >
          <LxForm kind="stripped" :columnCount="columnCount" :required-mode="props.requiredMode">
            <slot name="customItem" v-bind="{ item }" />
          </LxForm>
        </LxDataBlock>
      </template>

      <template v-else>
        <LxForm kind="stripped" :columnCount="columnCount" :required-mode="props.requiredMode">
          <slot name="customItem" v-bind="{ item, index }" />
        </LxForm>

        <div class="appendable-list-remove-button-wrapper">
          <div class="appendable-list-remove">
            <LxButton
              v-if="!readOnly"
              icon="remove-item"
              :title="texts.removeItem"
              :destructive="true"
              kind="ghost"
              @click="removeItem(item._lx_appendableKey)"
            />
          </div>
        </div>
      </template>
    </div>

    <div>
      <LxButton
        kind="tertiary"
        :label="addButtonLabel"
        icon="add-item"
        @click="addItem"
        v-if="!readOnly && canAddItems"
      />
    </div>
  </div>
</template>
