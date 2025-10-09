<script setup>
import { computed, onMounted, ref, inject, nextTick } from 'vue';
import LxButton from '@/components/Button.vue';
import LxForm from '@/components/forms/Form.vue';
import LxDataBlock from '@/components/DataBlock.vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: Array, default: null },
  readOnly: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: null },
  iconAttribute: { type: String, default: null },
  hideRemoveAttribute: { type: String, default: null },
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
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const defaultTexts = {
  removeItem: 'Dzēst ierakstu',
  addItemButtonTooltip: 'Pievienot ierakstu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, defaultTexts));

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

function focusLastAddedElement() {
  nextTick(() => {
    const lastItem = model.value?.[model.value.length - 1];
    if (!lastItem || !lastItem._lx_appendableKey) return;
    const lastItemEl = document.querySelector(
      `.lx-appendable-list-item[id="${lastItem._lx_appendableKey}"]`
    );
    if (!lastItemEl) return;
    const focusable = lastItemEl.querySelector(
      'a:not([disabled]), button:not([disabled]), input:not([disabled]), [tabindex="0"]'
    );
    if (focusable) focusable.focus();
  });
}
function removeItem(id) {
  const index = model.value.findIndex((x) => x._lx_appendableKey === id);
  const res = [...model.value];
  res.splice(index, 1);
  model.value = res;

  nextTick(() => {
    const items = document.querySelectorAll(
      `.lx-appendable-list[id="${props.id}"] .lx-appendable-list-item`
    );
    if (!items.length) return;
    const nextIndex = Math.min(index, items.length - 1);
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    const focusable = nextItem.querySelector(
      'a:not([disabled]), button:not([disabled]), input:not([disabled]), [tabindex="0"]'
    );
    if (focusable) focusable.focus();
  });
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
  focusLastAddedElement();
}

const expanded = computed(() => {
  const object = [...model.value];
  const transformedStructure = object?.reduce((result, obj) => {
    const res = result;
    if (typeof obj?.[props.expandedAttribute] === 'boolean') {
      res[obj?.[props.idAttribute]] = obj[props.expandedAttribute];
    } else {
      res[obj?.[props.idAttribute]] = props.defaultExpanded;
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
        title: displayTexts.value.removeItem,
      },
      ...props.actionDefinitions,
    ];
  }
  if (!props.readOnly && props.actionDefinitions.length > 0) {
    return [
      {
        id: 'appendableListDelete',
        name: displayTexts.value.removeItem,
        icon: 'remove-item',
        destructive: true,
        title: displayTexts.value.removeItem,
      },
      ...props.actionDefinitions,
    ];
  }
  return props.actionDefinitions;
});

function actionClick(val, item, itemKey) {
  if (val === 'appendableListDelete') removeItem(itemKey);
  emits('actionClick', val, item, itemKey);
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

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  model.value = props.modelValue;
});

defineExpose({ clearModel });
</script>
<template>
  <div
    class="lx-appendable-list"
    :class="[{ 'lx-appendable-list-compact': kind === 'compact' }]"
    :aria-labelledby="labelledBy"
    :id="props.id"
    role="list"
  >
    <div
      v-for="(item, index) in model"
      :key="item._lx_appendableKey"
      class="lx-appendable-list-item"
      :id="item._lx_appendableKey"
      role="listitem"
    >
      <template v-if="expandable">
        <LxDataBlock
          v-model="expanded[item?.[idAttribute]]"
          v-model:selected="selectedValues[item?.[idAttribute]]"
          :id="item[idAttribute]"
          :name="item[nameAttribute]"
          :description="item[descriptionAttribute]"
          :icon="item[iconAttribute]"
          :expandable="true"
          :actionDefinitions="changeActions([...allActions], item)"
          :forceUppercase="forceUppercase"
          :hasSelecting="hasSelecting"
          :selectingKind="selectingKind"
          @actionClick="(val) => actionClick(val, item[idAttribute], item._lx_appendableKey)"
          @selectingClick="changeSelecting"
        >
          <LxForm
            kind="stripped"
            role="group"
            :columnCount="columnCount"
            :required-mode="props.requiredMode"
          >
            <slot name="customItem" v-bind="{ item }" />
          </LxForm>

          <template #customHeader v-if="$slots.customHeader">
            <slot
              name="customHeader"
              v-bind="{ item, expanded: expanded[item && item[idAttribute]] }"
            />
          </template>
        </LxDataBlock>
      </template>

      <template v-else>
        <LxForm
          kind="stripped"
          role="group"
          :columnCount="columnCount"
          :required-mode="props.requiredMode"
        >
          <slot name="customItem" v-bind="{ item, index }" />
        </LxForm>

        <div class="appendable-list-remove-button-wrapper">
          <div class="appendable-list-remove">
            <LxButton
              v-if="!readOnly && (!hideRemoveAttribute || !item[hideRemoveAttribute])"
              icon="remove-item"
              variant="icon-only"
              :label="displayTexts.removeItem"
              :destructive="true"
              kind="ghost"
              @click="
                () => actionClick('appendableListDelete', item[idAttribute], item._lx_appendableKey)
              "
            />
          </div>
        </div>
      </template>
    </div>

    <div>
      <LxButton
        v-if="!readOnly && canAddItems"
        :id="`${id}-action-add-item`"
        kind="tertiary"
        :label="addButtonLabel"
        :title="displayTexts.addItemButtonTooltip"
        icon="add-item"
        @click="addItem"
      />
    </div>
  </div>
</template>
