<script setup>
import { computed, watch, onMounted } from 'vue';

import LxValuePickerDefault from '@/components/valuePickers/Default.vue';
import LxValuePickerDropDown from '@/components/valuePickers/Dropdown.vue';
import LxValuePickerTileTag from '@/components/valuePickers/TileTag.vue';
import LxValuePickerRotator from '@/components/valuePickers/Rotator.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [Array, String, Number], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: null },
  variant: { type: String, default: 'default' }, // 'default' || 'dropdown' || 'tiles' || 'tags' || 'rotator' || 'default-custom' || 'dropdown-custom' || 'tiles-custom' || 'tags-custom'|| 'rotator-custom'
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
        emits('update:modelValue', [value]);
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

onMounted(() => {
  const updateModelValue = (value) => emits('update:modelValue', value);

  if (model.value) {
    if (!Array.isArray(model.value) && (props.alwaysAsArray || props.kind === 'multiple')) {
      updateModelValue([model.value]);
    }
  } else if (props.kind === 'multiple') {
    if (
      props.variant === 'default' ||
      props.variant === 'default-custom' ||
      props.variant === 'tiles' ||
      props.variant === 'tags' ||
      props.variant === 'tiles-custom' ||
      props.variant === 'tags-custom'
    ) {
      updateModelValue(null);
    } else {
      updateModelValue([]);
    }
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
      v-model="model"
      :items="items"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="texts"
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
    </LxValuePickerDefault>

    <LxValuePickerDropDown
      v-if="variant === 'dropdown' || variant === 'dropdown-custom'"
      v-model="model"
      :items="items"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="texts"
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
      v-model="model"
      :items="items"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :variant="variant"
      :kind="kind"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="texts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :always-as-array="alwaysAsArray"
      :has-search="hasSearch"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :search-attributes="searchAttributes"
      :hasSelectAll="hasSelectAll"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerTileTag>

    <LxValuePickerRotator
      v-if="variant === 'rotator' || variant === 'rotator-custom'"
      v-model="model"
      :items="items"
      :idAttribute="idAttribute"
      :nameAttribute="nameAttribute"
      :descriptionAttribute="descriptionAttribute"
      :groupId="groupId"
      :variant="variant"
      kind="single"
      :disabled="disabled"
      :invalid="invalid"
      :invalidation-message="invalidationMessage"
      :texts="texts"
      :placeholder="placeholder"
      :tooltip="tooltip"
      :always-as-array="alwaysAsArray"
      :has-search="hasSearch"
      :nullable="nullable"
      :readOnly="readOnly"
      :readOnlyRenderType="readOnlyRenderType"
      :search-attributes="searchAttributes"
    >
      <template v-slot:customItem="slotData" v-if="$slots.customItem">
        <slot name="customItem" v-bind="slotData" />
      </template>
    </LxValuePickerRotator>
  </div>
</template>
