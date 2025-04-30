<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';

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
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => {} },
});

const textsDefault = {
  clearQuery: 'Notīrīt meklēšanu',
  clearChosen: 'Notīrīt visas atlasītās vērtības',
  notSelected: 'Nav izvēlēts',
  searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const notSelectedId = 'notSelected';
const currentIndex = ref(0);

const rotatorItemsArray = computed(() => {
  if (!props.nullable) {
    return props.items;
  }
  return [
    {
      [props.idAttribute]: notSelectedId,
      [props.nameAttribute]: displayTexts.value.notSelected,
    },
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
        [props.nameAttribute]: displayTexts.value.notSelected,
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
    return selectedItems.value[0]?.[props.nameAttribute];
  }
  if (model.value && model.value.length > 0) {
    text = selectedItems.value?.map((item) => item[props.nameAttribute])?.join(', ');
  } else if (returnPlaceholder) {
    text = props.placeholder;
  }

  return text;
}

function selectSingle(id) {
  if (!props.disabled) {
    if (id) {
      const selectedIndex = rotatorItemsArray.value?.findIndex(
        (item) => item[props.idAttribute] === id
      );
      currentIndex.value = selectedIndex % rotatorItemsArray.value.length;
    } else {
      currentIndex.value = (currentIndex.value + 1) % rotatorItemsArray.value.length;
    }
    model.value = [rotatorItemsArray.value[currentIndex.value][props.idAttribute]];
  }
}

const columnReadOnly = computed(() =>
  selectedItems.value?.map((item) => item[props.nameAttribute])
);

onMounted(() => {
  const initialIndex = rotatorItemsArray.value?.findIndex(
    (item) => item[props.idAttribute] === model.value
  );
  currentIndex.value = initialIndex >= 0 ? initialIndex : 0;
});

const keyedItemsArray = computed(() => {
  let items = rotatorItemsArray.value;

  while (items.length < 3) {
    items = items.concat(rotatorItemsArray.value);
  }

  // Add a unique key to each item (need for normal transition between items)
  return items.map((item) => ({
    ...item,
    key: generateUUID(),
  }));
});

const queueItems = computed(() => {
  const itemsLength = keyedItemsArray.value.length;

  const last = (currentIndex.value - 1 + itemsLength) % itemsLength;
  const current = currentIndex.value;
  const next = (currentIndex.value + 1) % itemsLength;

  const elements = [
    keyedItemsArray.value[last],
    keyedItemsArray.value[current],
    keyedItemsArray.value[next],
  ];

  return elements;
});

function getItemId(id) {
  return `${props.id}-item-${id}`;
}

// TODO: fix transition bug when there is 3 items, fix also transition bugs with nullable
// better refactor rotation logic for smarter solution
</script>

<template>
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
      v-if="rotatorItemsArray"
      class="lx-value-picker-tags lx-rotator"
      :class="[{ 'lx-invalid': invalid }]"
      :title="tooltip"
    >
      <LxDropDownMenu triggerClick="right">
        <div
          class="lx-rotator-dropdown-wrapper lx-input-wrapper"
          :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
          :aria-invalid="invalid"
          tabindex="0"
          :aria-labelledby="labelId"
          @click="selectSingle(null)"
          @keydown.space.prevent="selectSingle(null)"
        >
          <div class="pseudo-input" />

          <TransitionGroup
            name="rotator"
            tag="ul"
            class="lx-rotator-set lx-input-area"
            :class="[{ 'lx-rotator-set-custom': variant === 'rotator-custom' }]"
            tabindex="-1"
            role="button"
            aria-live="polite"
          >
            <li
              v-for="item in queueItems"
              :key="item.key"
              :id="getItemId(item[idAttribute])"
              class="lx-rotator-tag"
            >
              <p class="lx-input-text" v-if="variant === 'rotator'">{{ item[nameAttribute] }}</p>
              <template v-if="variant === 'rotator-custom'">
                <slot name="customItem" v-bind="item"></slot>
              </template>
            </li>
          </TransitionGroup>

          <div class="lx-input-icon-wrapper">
            <LxIcon customClass="lx-modifier-icon thumb" value="rotator" />
          </div>
        </div>

        <template #panel>
          <LxButton
            v-for="item in rotatorItemsArray"
            :key="item?.id"
            :label="item?.name"
            kind="ghost"
            :active="model === item?.id ? true : false"
            @click="selectSingle(item?.id)"
          />
        </template>
      </LxDropDownMenu>

      <div v-if="invalid" class="lx-invalidation-message" @contextmenu.stop>
        {{ invalidationMessage }}
      </div>
    </div>
  </template>
</template>
