<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, inject } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxFlag from '@/components/Flag.vue';
import { generateUUID } from '@/utils/stringUtils';
import { onClickOutside } from '@vueuse/core';
import Popper from 'vue3-popper';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: String, default: null },
  items: { type: Array, required: true },
  idAttribute: { type: String, default: 'id' },
  idAttributeArray: { type: [Array, String], default: 'id' },
  kind: { type: String, default: 'default' }, // default or native
  variant: { type: String, default: 'default' }, // default, country, state, custom
  placeholder: { type: String, default: null },
  nameAttribute: { type: String, default: 'name' },
  dictionary: { type: Object, default: null },
  tooltip: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  labelId: { type: String, default: null },
});

const emits = defineEmits(['update:modelValue', 'change']);

const container = ref();
const menuOpen = ref(false);
const allItems = ref(props.items);
const panelWidth = ref();
const highlightedItemId = ref(null);
const activeDropdown = ref(null);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const selectedIdValue = computed({
  get: () => {
    if (Array.isArray(props.idAttribute)) {
      return props.modelValue;
    }
    if (props.modelValue !== undefined && props.modelValue !== null) {
      const value =
        // @ts-ignore
        typeof props.modelValue === 'boolean' ? props.modelValue.toString() : props.modelValue;
      return value;
    }
    return null;
  },
  set: (value) => {
    if (Array.isArray(props.idAttribute) && value) {
      emits('update:modelValue', JSON.parse(value));
    } else {
      emits('update:modelValue', value);
    }
  },
});

const getIdAttributeString = (item) => {
  if (Array.isArray(props.idAttribute)) {
    return JSON.stringify(
      props.idAttribute.reduce((result, idKey) => {
        const resArr = { ...result };
        resArr[idKey] = item[idKey];
        if (resArr[idKey] === undefined) {
          throw new Error(
            `Dropdown: idAttribute (${props.idAttribute}) is not defined for item ${JSON.stringify(
              item
            )}`
          );
        }
        return resArr;
      }, {})
    );
  }
  const attribute = item[props.idAttribute];
  if (attribute === undefined) {
    throw new Error(
      `Dropdown: idAttribute (${props.idAttribute}) is not defined for item ${JSON.stringify(item)}`
    );
  }
  return attribute;
};

function focusOnDropDown() {
  if (menuOpen.value) {
    menuOpen.value = false;
    nextTick(() => {
      container.value.focus();
    });
  }
}

function closeDropDownDefault() {
  menuOpen.value = false;
}

function closeDropDownDefaultOnEsc() {
  menuOpen.value = false;
  nextTick(() => {
    container.value.focus();
  });
}

function getItemId(id) {
  return `${props.id}-item-${id}`;
}

function openDropDownDefault() {
  if (!menuOpen.value) {
    menuOpen.value = true;
    panelWidth.value = container.value?.offsetWidth;
    activeDropdown.value = container.value;
    nextTick(() => {
      const formElements = document.querySelectorAll(
        `#${props.id} div.lx-dropdown-default-content > div.lx-value-picker-item`
      );
      formElements[highlightedItemId.value - 1]?.focus();
    });
  } else if (menuOpen.value) {
    closeDropDownDefault();
  }
}

const isDisabled = computed(() => props.disabled);

function change(event) {
  if (isDisabled.value) {
    return;
  }
  emits('change', event);
}

const name = computed(() => {
  let result = null;
  if (Array.isArray(model.value)) {
    result = props.items?.find(
      (obj) => obj[props.idAttribute]?.toString() === model.value[0]?.toString()
    );
  } else {
    result = props.items?.find(
      (obj) => obj[props.idAttribute]?.toString() === model.value?.toString()
    );
  }

  if (result) {
    return result[props.nameAttribute];
  }
  return null;
});

const filteredItems = ref([]);

watch(
  () => props.items,
  () => {
    filteredItems.value = props.items;
  }
);

const refRoot = ref();
onClickOutside(refRoot, closeDropDownDefault);

function onEnter() {
  if (!menuOpen.value) {
    openDropDownDefault();
    return;
  }
  if (highlightedItemId.value) {
    try {
      selectedIdValue.value = highlightedItemId.value;
    } finally {
      closeDropDownDefault();
      container.value.focus();
    }
  }
  focusOnDropDown();
}

function onDown() {
  if (!menuOpen.value) {
    openDropDownDefault();
    return;
  }
  if (filteredItems.value.length > 0) {
    const index = filteredItems.value?.findIndex(
      (x) => getIdAttributeString(x) === highlightedItemId.value
    );
    if (index === -1) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[0]);
    } else if (index < filteredItems.value.length - 1) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[index + 1]);
    } else {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[0]);
    }
  }
}

function onUp() {
  if (!menuOpen.value) {
    openDropDownDefault();
    return;
  }
  if (filteredItems.value.length > 0) {
    const index = filteredItems.value?.findIndex(
      (x) => getIdAttributeString(x) === highlightedItemId.value
    );
    if (index === -1) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[0]);
    } else if (index > 0) {
      highlightedItemId.value = getIdAttributeString(filteredItems.value[index - 1]);
    } else {
      highlightedItemId.value = getIdAttributeString(
        filteredItems.value[filteredItems.value.length - 1]
      );
    }
  }
}

function focusNextInputElement() {
  onDown();
  nextTick(() => {
    if (activeDropdown.value) {
      const highlightedItems = activeDropdown.value.querySelectorAll(
        '.lx-value-picker-item.lx-highlighted-item'
      );
      highlightedItems[0]?.focus();
    }
  });
}

function focusPreviousInputElement() {
  onUp();
  nextTick(() => {
    if (activeDropdown.value) {
      const highlightedItems = activeDropdown.value.querySelectorAll(
        '.lx-value-picker-item.lx-highlighted-item'
      );
      highlightedItems[0]?.focus();
    }
  });
}
function selectSingle(item) {
  try {
    selectedIdValue.value = getIdAttributeString(item);
  } finally {
    closeDropDownDefault();
  }
}
const selectedItemStored = ref(null);
const selectedItem = ref(null);

function isPlaceholderVisible() {
  return (
    (props.modelValue === '' ||
      !props.modelValue ||
      props.modelValue.length === 0 ||
      !props.items.some(
        (item) => item[props.idAttribute]?.toString() === props.modelValue?.toString()
      )) &&
    props.variant !== 'state'
  );
}

watch(
  () => [selectedIdValue.value, allItems.value],
  (watchVals) => {
    if (props.kind === 'default') {
      const selectedId = watchVals[0];
      if (selectedId) {
        let selected = null;
        if (Array.isArray(props.idAttribute)) {
          selected = allItems?.value?.find(
            (item) => JSON.stringify(selectedId) === getIdAttributeString(item)
          );
        } else {
          selected = allItems?.value?.find((item) => selectedId === getIdAttributeString(item));
        }
        if (selected) {
          selectedItemStored.value = selected;
          selectedItem.value = selected;
        }
      } else {
        selectedItem.value = null;
      }
    }
  }
);

function isItemSelected(item) {
  return (
    selectedItem.value && getIdAttributeString(item) === getIdAttributeString(selectedItem.value)
  );
}

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  filteredItems.value = props.items;

  if (model.value) {
    const selectedId = model.value;
    selectedItem.value = allItems?.value?.find((item) => selectedId === getIdAttributeString(item));
  }
});
</script>

<template>
  <div class="lx-field-wrapper" ref="refRoot">
    <p v-if="readOnly" class="lx-data" :aria-labelledby="labelledBy">
      <template v-if="name">{{ name }}</template>
      <span v-else>—</span>
    </p>

    <template v-if="props.kind === 'native' && !readOnly">
      <div
        class="lx-dropdown-wrapper lx-input-wrapper"
        :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
        :data-invalid="invalid ? '' : null"
        :data-disabled="isDisabled ? '' : null"
      >
        <div class="pseudo-input" />
        <select
          v-model="model"
          :id="id"
          :aria-invalid="invalid"
          class="lx-dropdown lx-input-area"
          :class="[
            { 'lx-invalid': invalid },
            {
              'lx-placeholder':
                modelValue === '' || modelValue === undefined || modelValue === null,
            },
          ]"
          :title="tooltip"
          :disabled="isDisabled"
          :aria-labelledby="labelledBy"
          @change="change($event)"
        >
          <option disabled value="" v-show="false" class="placeholder-select">
            {{ placeholder }}
          </option>
          <option disabled :value="null" v-show="false" class="placeholder-select">
            {{ placeholder }}
          </option>
          <option disabled :value="undefined" v-show="false" class="placeholder-select">
            {{ placeholder }}
          </option>
          <option v-for="item in items" :key="item[idAttribute]" :value="item[idAttribute]">
            {{ item[nameAttribute] }}
          </option>
        </select>
        <div v-if="invalid" class="lx-invalidation-icon-wrapper">
          <LxIcon customClass="lx-invalidation-icon" value="invalid" />
        </div>
        <div class="lx-input-icon-wrapper">
          <LxIcon customClass="lx-modifier-icon" value="chevron-down" />
        </div>
      </div>
      <div v-if="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </template>

    <template v-if="props.kind === 'default' && !readOnly">
      <div
        :id="id"
        class="lx-dropdown-default"
        ref="container"
        :disabled="disabled"
        @keydown.esc.prevent="closeDropDownDefaultOnEsc"
        @keydown.enter.prevent="onEnter"
        @keydown.space.prevent="onEnter"
        @keydown.down.prevent="focusNextInputElement"
        @keydown.up.prevent="focusPreviousInputElement"
        @keydown.tab="focusOnDropDown"
        tabindex="0"
        role="combobox"
        :aria-expanded="menuOpen"
        aria-controls="popper-id"
        :aria-labelledby="labelledBy"
      >
        <Popper
          id="popper-id"
          placement="bottom"
          offset-distance="0,9"
          :hover="false"
          :arrow="false"
          :disabled="props.disabled"
          :show="menuOpen"
          open-delay="0"
          close-delay="0"
          role="listbox"
        >
          <!--eslint-disable-next-line vuejs-accessibility/click-events-have-key-events-->
          <div class="lx-dropdown-input-wrapper" @click="openDropDownDefault">
            <div
              class="lx-dropdown-default-panel lx-input-wrapper"
              :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
              :title="tooltip"
              :aria-invalid="invalid"
            >
              <slot>
                <div class="pseudo-input" />
                <div
                  class="lx-dropdown-default-data lx-input-area"
                  :title="tooltip"
                  v-if="variant === 'state'"
                >
                  <LxStateDisplay
                    :value="selectedItem?.id ? selectedItem?.id : props.placeholder"
                    :dictionary="[
                      {
                        value: selectedItem?.id ? selectedItem?.id : props.placeholder,
                        displayName: selectedItem?.name ? selectedItem?.name : props.placeholder,
                        displayType: props.dictionary?.displayType,
                        displayShape: props.dictionary?.displayShape,
                      },
                    ]"
                  />
                </div>
                <div
                  class="lx-dropdown-default-data lx-dropdown-flag lx-input-area"
                  :title="tooltip"
                  v-else-if="variant === 'country'"
                >
                  <LxFlag
                    :value="selectedItem?.country ? selectedItem?.country : 'lv'"
                    size="small"
                  />
                  <span class="lx-input-text"> {{ name }} </span>
                </div>
                <div class="lx-dropdown-default-data lx-input-area" :title="tooltip" v-else>
                  <p class="lx-input-text">{{ name }}</p>
                </div>
                <div v-if="isPlaceholderVisible()" class="lx-placeholder lx-input-area">
                  <p class="lx-input-text">{{ placeholder }}</p>
                </div>
                <div v-if="invalid" class="lx-invalidation-icon-wrapper">
                  <LxIcon customClass="lx-invalidation-icon" value="invalid" />
                </div>
                <div class="lx-input-icon-wrapper">
                  <LxIcon customClass="lx-modifier-icon" value="chevron-down" />
                </div>
              </slot>
            </div>
            <div v-if="invalid" class="lx-invalidation-message" @click.stop @mousedown.prevent>
              {{ invalidationMessage }}
            </div>
          </div>
          <template #content>
            <div
              tabindex="-1"
              class="lx-dropdown-default-content"
              :style="{ width: panelWidth + 'px' }"
            >
              <slot name="panel" @click="closeDropDownDefault()">
                <template v-if="filteredItems?.length">
                  <template v-for="item in filteredItems" :key="item[idAttribute]">
                    <div
                      :id="getItemId(getIdAttributeString(item))"
                      role="option"
                      tabindex="-1"
                      :aria-selected="isItemSelected(item)"
                      @click="selectSingle(item)"
                      class="lx-value-picker-item"
                      :class="[
                        {
                          'lx-selected': isItemSelected(item),
                          'lx-highlighted-item':
                            highlightedItemId && highlightedItemId === getIdAttributeString(item),
                        },
                      ]"
                    >
                      <LxStateDisplay
                        v-if="variant === 'state'"
                        :value="item[idAttribute]"
                        :dictionary="[
                          {
                            value: item[idAttribute],
                            displayName: item[nameAttribute],
                            displayType: props.dictionary?.displayType,
                            displayShape: props.dictionary?.displayShape,
                          },
                        ]"
                      />
                      <template v-else-if="variant === 'country'">
                        <LxFlag :value="item?.country ? item?.country : 'lv'" size="small" />
                        {{ item[nameAttribute] }}
                      </template>
                      <template v-else-if="variant === 'custom'">
                        <slot name="customItem" v-bind="item"></slot>
                      </template>

                      <template v-else> {{ item[nameAttribute] }}</template>
                    </div>
                  </template>
                </template>
              </slot>
            </div>
          </template>
        </Popper>
      </div>
    </template>
  </div>
</template>
