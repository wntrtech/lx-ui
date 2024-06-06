<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [Array, String], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: null },
  variant: { type: String, default: 'tile' },
  kind: { type: String, default: 'single' }, // Only single is supported
  nullable: { type: Boolean, default: false },
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

const idValue = ref('');
const notSelectedId = 'notSelected';
const currentIndex = ref(0);

const rotatorItemsArray = computed(() => {
  if (!props.nullable) {
    return props.items;
  }
  return [
    { [props.idAttribute]: notSelectedId, [props.nameAttribute]: props.texts.notSelected },
    ...props.items,
  ];
});

const itemsModel = ref({});

function activate() {
  rotatorItemsArray.value?.forEach((item) => {
    itemsModel.value[item[props.idAttribute].toString()] = false;
  });

  if (props.nullable) {
    itemsModel.value[notSelectedId] = !model.value || model.value.length === 0;
  }

  if (Array.isArray(model.value)) {
    model.value?.forEach((id) => {
      if (id) {
        itemsModel.value[id.toString()] = true;
      }
    });
  } else if (model.value) {
    itemsModel.value[model.value.toString()] = true;
  }
}
activate();

function deactivate() {
  if (props.kind === 'single' && !props.nullable) {
    if (rotatorItemsArray.value[0][props.idAttribute] === notSelectedId)
      rotatorItemsArray.value.shift();
  }
}

watch(
  () => props.nullable,
  (newValue) => {
    if (newValue) activate();
    else if (!newValue) deactivate();
  }
);

function recalculateIndex() {
  if (
    (model.value === null && props.nullable) ||
    (Array.isArray(model.value) && model.value.length === 0 && props.nullable)
  ) {
    currentIndex.value = 0;
    return;
  }

  let selectedId;
  if (!props.alwaysAsArray && !Array.isArray(model.value)) {
    selectedId = model.value;
  } else if (model.value && model.value.length > 0) {
    [selectedId] = model.value;
  }

  if (selectedId !== undefined) {
    const selectedIndex = rotatorItemsArray.value?.findIndex(
      (item) => item[props.idAttribute] === selectedId
    );
    currentIndex.value = selectedIndex >= 0 ? selectedIndex : 0;
  }
}

watch(
  () => {
    const { value } = model;
    const length = value?.length;
    return { value, length };
  },
  ({ value, length }) => {
    activate();
    if (Array.isArray(value) && length === 0) {
      itemsModel.value.notSelected = true;
    }
    recalculateIndex();
  }
);

const selectedItems = computed(() => {
  const ret = [];
  if (!model.value || model.value.length === 0) {
    if (props.nullable) {
      ret.push({
        [props.idAttribute]: notSelectedId,
        [props.nameAttribute]: props.texts.notSelected,
      });
    }
    return ret;
  }

  const temp = Array.isArray(model.value) ? model.value : [model.value];
  temp.forEach((id) => {
    const selectedItem = rotatorItemsArray.value.find((item) => item[props.idAttribute] === id);
    if (selectedItem) {
      ret.push(selectedItem);
    }
  });
  return ret;
});

function getName(returnPlaceholder = true) {
  let text = '';
  if (model.value && !Array.isArray(model.value)) {
    return selectedItems.value[0].name;
  }
  if (model.value && model.value.length > 0) {
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
  const selectedIndex = rotatorItemsArray.value?.findIndex(
    (item) => item[props.idAttribute] === id
  );
  currentIndex.value = (selectedIndex + 1) % rotatorItemsArray.value.length;
  model.value = [rotatorItemsArray.value[currentIndex.value][props.idAttribute]];
}

const columnReadOnly = computed(() =>
  selectedItems.value?.map((item) => item[props.nameAttribute])
);

onMounted(() => {
  if (props.id) {
    idValue.value = props.id;
  } else {
    idValue.value = generateUUID();
  }
  const initialIndex = rotatorItemsArray.value?.findIndex(
    (item) => item[props.idAttribute] === model.value
  );
  currentIndex.value = initialIndex >= 0 ? initialIndex : 0;
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
    <span v-if="model === null || model === undefined || model?.length < 1">—</span>
  </span>
  <template v-else>
    <div
      v-if="rotatorItemsArray && rotatorItemsArray.length > 1"
      class="lx-value-picker-tags"
      :class="[{ 'lx-invalid': invalid }]"
      :title="tooltip"
    >
      <ul class="lx-tag-set" :class="[{ 'lx-rotator-custom': variant === 'rotator-custom' }]">
        <li
          v-for="item in [rotatorItemsArray[currentIndex]]"
          :key="item[idAttribute]"
          v-on:focus="onFocus"
          class="lx-tag lx-tags-tile-selected"
          :title="item[descriptionAttribute]"
          :id="getItemId(item[idAttribute])"
          :group-id="groupId"
          :disabled="disabled"
          tabindex="0"
          @click="disabled ? null : selectSingle(item[idAttribute])"
          role="radio"
          :aria-checked="item[idAttribute] === (model?.[0] || '')"
          @keydown.space.prevent="disabled ? null : selectSingle(item[idAttribute])"
        >
          <template v-if="variant === 'rotator'">
            <div class="lx-data">{{ item[nameAttribute] }}</div>
          </template>
          <template v-else-if="variant === 'rotator-custom'">
            <slot name="customItem" v-bind="item"></slot>
          </template>
        </li>
      </ul>
    </div>
    <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
  </template>
</template>
