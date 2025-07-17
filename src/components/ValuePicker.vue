<script setup>
import { computed, watch, onMounted, ref, inject } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

import LxValuePickerDefault from '@/components/valuePickers/Default.vue';
import LxValuePickerDropDown from '@/components/valuePickers/Dropdown.vue';
import LxValuePickerTileTag from '@/components/valuePickers/TileTag.vue';
import LxValuePickerRotator from '@/components/valuePickers/Rotator.vue';
import LxValuePickerIndicator from '@/components/valuePickers/Indicator.vue';
import LxValuePickerHorizontal from '@/components/valuePickers/Horizontal.vue';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: [Array, String, Number], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  iconAttribute: { type: String, default: 'icon' },
  iconSetAttribute: { type: String, default: 'iconSet' },
  categoryAttribute: { type: String, default: 'category' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: () => generateUUID() },
  variant: { type: String, default: 'default' }, // 'default' || 'dropdown' || 'tiles' || 'tags' || 'rotator' || 'default-custom' || 'dropdown-custom' || 'tiles-custom' || 'tags-custom'|| 'rotator-custom' || 'indicator' || 'horizontal' || 'horizontal-custom'
  kind: { type: String, default: 'single' }, // 'single' (with radio buttons; can select one item) or 'multiple' (with checkboxes; can select many items)
  nullable: { type: Boolean, default: false }, // Only if kind === 'single'. If true - adds default radio button 'Not selected'. If false - one item must be already selected.
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
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  clearQuery: 'Notīrīt meklēšanu',
  clearChosen: 'Notīrīt visas izvēlētās vērtības',
  notSelected: 'Nav izvēlēts',
  searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
  selectAll: 'Izvēlēties visu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue']);

const stringifiedItems = computed(() =>
  props.items?.map((item) => {
    const id = item[props.idAttribute];
    if (typeof id === 'number') {
      return {
        ...item,
        [props.idAttribute]: String(id),
      };
    }
    return item;
  })
);

const model = computed({
  get() {
    if (typeof props.modelValue === 'number') {
      return String(props.modelValue);
    }
    return props.modelValue;
  },
  set(value) {
    if (
      !props.alwaysAsArray &&
      !(props.variant === 'dropdown' || props.variant === 'dropdown-custom')
    ) {
      emits('update:modelValue', props.kind === 'single' && value ? value[0] : value);
    } else if (
      props.alwaysAsArray &&
      (props.variant === 'dropdown' || props.variant === 'dropdown-custom')
    ) {
      if (value) {
        emits('update:modelValue', props.kind === 'single' ? [value] : value);
      } else {
        emits('update:modelValue', null);
      }
    } else {
      emits('update:modelValue', value);
    }
  },
});

watch(
  () => model.value,
  (newValue) => {
    if (newValue && (newValue === 'notSelected' || newValue[0] === 'notSelected')) {
      if (props.alwaysAsArray) {
        emits('update:modelValue', []);
      } else {
        emits('update:modelValue', null);
      }
    }
  }
);

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  const updateModelValue = (value) => emits('update:modelValue', value);

  // Handle existing value
  if (model.value) {
    const shouldBeArray = props.alwaysAsArray || props.kind === 'multiple';
    if (!Array.isArray(model.value) && shouldBeArray) {
      updateModelValue([model.value]);
    }
    return;
  }

  // Handle missing value
  if (props.kind === 'multiple') {
    updateModelValue([]);
  } else if (props.kind === 'single') {
    updateModelValue(null);
  }
});
</script>

<template>
  <div class="lx-field-wrapper" ref="refRoot">
    <LxValuePickerDefault
      v-if="variant === 'default' || variant === 'default-custom'"
      :role="kind === 'single' ? 'radiogroup' : 'group'"
      :id="id"
      v-model="model"
      :items="stringifiedItems"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :has-search="hasSearch"
      :always-as-array="alwaysAsArray"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :variant="variant"
      :search-attributes="searchAttributes"
      :hasSelectAll="hasSelectAll"
      :labelId="labelledBy"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerDefault>

    <LxValuePickerDropDown
      v-if="variant === 'dropdown' || variant === 'dropdown-custom'"
      :id="id"
      v-model="model"
      :items="stringifiedItems"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :has-search="hasSearch"
      :always-as-array="alwaysAsArray"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :variant="variant"
      :search-attributes="searchAttributes"
      :hasSelectAll="hasSelectAll"
      :labelId="labelledBy"
    >
      <template v-slot:customItemDropdown="slotData">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerDropDown>

    <LxValuePickerTileTag
      v-if="
        variant === 'tiles' ||
        variant === 'tags' ||
        variant === 'tiles-custom' ||
        variant === 'tags-custom'
      "
      :id="id"
      v-model="model"
      :items="stringifiedItems"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :variant="variant"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :always-as-array="alwaysAsArray"
      :has-search="hasSearch"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :search-attributes="searchAttributes"
      :hasSelectAll="hasSelectAll"
      :labelId="labelledBy"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerTileTag>

    <LxValuePickerRotator
      v-if="variant === 'rotator' || variant === 'rotator-custom'"
      :id="id"
      v-model="model"
      :items="stringifiedItems"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :variant="variant"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :always-as-array="alwaysAsArray"
      :has-search="hasSearch"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :search-attributes="searchAttributes"
      :labelId="labelledBy"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerRotator>

    <LxValuePickerIndicator
      v-if="variant === 'indicator'"
      :id="id"
      v-model="model"
      :items="stringifiedItems"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :iconAttribute="iconAttribute"
      :iconSetAttribute="iconSetAttribute"
      :categoryAttribute="categoryAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :variant="variant"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :always-as-array="alwaysAsArray"
      :has-search="hasSearch"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :search-attributes="searchAttributes"
      :hasSelectAll="hasSelectAll"
      :labelId="labelledBy"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerIndicator>

    <LxValuePickerHorizontal
      v-if="variant === 'horizontal' || variant === 'horizontal-custom'"
      :id="id"
      v-model="model"
      :items="stringifiedItems"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="displayTexts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :has-search="hasSearch"
      :always-as-array="alwaysAsArray"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :variant="variant"
      :search-attributes="searchAttributes"
      :hasSelectAll="hasSelectAll"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerHorizontal>
  </div>
</template>
