<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts, focusNextFocusableElement } from '@/utils/generalUtils';
import { logError } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';
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
  kind: { type: String, default: 'single' }, // 'single' || 'multiple'
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

const notSelectedId = 'notSelected';

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

const model = computed({
  get() {
    return props.modelValue ?? rotatorItemsArray.value[0]?.[props.idAttribute];
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const currentIndex = ref(0);
const itemsModel = ref({});
const highlightedItemId = ref(null);
const dropdownMenuRef = ref(null);

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
    const currentItemId = rotatorItemsArray.value[currentIndex.value][props.idAttribute];
    model.value = [currentItemId];
    highlightedItemId.value = currentItemId;
    if (dropdownMenuRef.value && dropdownMenuRef.value.menuOpen) {
      dropdownMenuRef.value.closeMenu();
    }
  }
}

const columnReadOnly = computed(() =>
  selectedItems.value?.map((item) => item[props.nameAttribute])
);

onMounted(() => {
  let selectedId;
  if (Array.isArray(model.value) && model.value.length > 0) {
    [selectedId] = model.value;
  } else {
    selectedId = model.value;
  }

  const initialIndex = rotatorItemsArray.value?.findIndex(
    (item) => item[props.idAttribute] === selectedId
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

function isActive(item) {
  const id = item[props.idAttribute];

  if (props.kind === 'multiple') {
    if (!Array.isArray(model.value)) {
      return model.value === id;
    }
    return model.value.includes(id);
  }

  return model.value === id;
}

const getIdAttributeString = (item) => {
  const attribute = item[props.idAttribute];

  if (attribute === undefined || attribute === null) {
    logError(
      `Rotator: idAttribute (${props.idAttribute}) is not defined for item ${JSON.stringify(item)}`,
      useLx().getGlobals().environment
    );
  }

  return attribute;
};

function onDown() {
  const wasMenuOpen = dropdownMenuRef.value?.menuOpen;

  if (!wasMenuOpen && rotatorItemsArray.value.length > 0) {
    dropdownMenuRef.value.openMenu();
    if (!highlightedItemId.value) {
      highlightedItemId.value = getIdAttributeString(rotatorItemsArray.value[0]);
    }
  } else {
    const currentBaseId =
      highlightedItemId.value || getIdAttributeString(rotatorItemsArray.value[0]);
    const index = rotatorItemsArray.value.findIndex(
      (x) => getIdAttributeString(x) === currentBaseId
    );
    highlightedItemId.value =
      index === -1 || index >= rotatorItemsArray.value.length - 1
        ? getIdAttributeString(rotatorItemsArray.value[0])
        : getIdAttributeString(rotatorItemsArray.value[index + 1]);
  }

  nextTick(() => {
    document.getElementById(`${highlightedItemId.value}-item-button`)?.focus();
  });
}

function onUp() {
  const wasMenuOpen = dropdownMenuRef.value?.menuOpen;

  if (!wasMenuOpen && rotatorItemsArray.value.length > 0) {
    dropdownMenuRef.value.openMenu();
    if (!highlightedItemId.value) {
      highlightedItemId.value = getIdAttributeString(
        rotatorItemsArray.value[rotatorItemsArray.value.length - 1]
      );
    }
  } else {
    const currentBaseId =
      highlightedItemId.value ||
      getIdAttributeString(rotatorItemsArray.value[rotatorItemsArray.value.length - 1]);
    const index = rotatorItemsArray.value.findIndex(
      (x) => getIdAttributeString(x) === currentBaseId
    );

    highlightedItemId.value =
      index === -1 || index === 0
        ? getIdAttributeString(rotatorItemsArray.value[rotatorItemsArray.value.length - 1])
        : getIdAttributeString(rotatorItemsArray.value[index - 1]);
  }

  nextTick(() => {
    document.getElementById(`${highlightedItemId.value}-item-button`)?.focus();
  });
}

const rotatorInputRef = ref(null);

function skipTab() {
  if (dropdownMenuRef.value?.menuOpen) {
    dropdownMenuRef.value.closeMenu('tab');
    focusNextFocusableElement(rotatorInputRef.value);
  }
}

// TODO: fix transition bugs with nullable
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
      <LxDropDownMenu
        ref="dropdownMenuRef"
        triggerClick="right"
        :disabled="disabled"
        :tabindex="-1"
      >
        <div
          ref="rotatorInputRef"
          class="lx-rotator-dropdown-wrapper lx-input-wrapper"
          :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
          :aria-invalid="invalid"
          :tabindex="disabled ? -1 : 0"
          :aria-labelledby="labelId"
          :aria-disabled="disabled"
          @click="!disabled && selectSingle(null)"
          @contextmenu.prevent="disabled"
          @keyup.space.stop="selectSingle(null)"
          @keyup.enter.stop="selectSingle(null)"
          @keyup.down.prevent="onDown"
          @keyup.up.prevent="onUp"
          @keydown.down.prevent
          @keydown.up.prevent
          @keydown.tab="skipTab"
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
              <template v-if="variant === 'rotator'"> {{ item[nameAttribute] }}</template>
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
          <div
            @keydown.prevent
            @keyup.down.prevent="onDown"
            @keyup.up.prevent="onUp"
            @keydown.tab="skipTab"
          >
            <LxButton
              v-for="item in rotatorItemsArray"
              :id="`${item?.id}-item-button`"
              :key="item?.id"
              :label="item?.name"
              kind="ghost"
              :active="isActive(item)"
              @click="selectSingle(item?.id)"
            />
          </div>
        </template>
      </LxDropDownMenu>

      <div v-if="invalid" class="lx-invalidation-message" @contextmenu.stop>
        {{ invalidationMessage }}
      </div>
    </div>
  </template>
</template>
