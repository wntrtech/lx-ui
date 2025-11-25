<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { textSearch } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import LxToolbar from '@/components/Toolbar.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [Array, String], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: null },
  variant: { type: String, default: 'tile' },
  kind: { type: String, default: 'single' }, // 'single' (with radio buttons; can select one item) or 'multiple' (with checkboxes; can select many items)
  nullable: { type: Boolean, default: false }, // Only if kind === 'single'. If true - adds default radio button 'Not selected'. If false - one item must be already selected.
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
  hasSelectAll: { type: Boolean, default: false },
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => {} },
});

const emits = defineEmits(['update:modelValue']);

const textsDefault = {
  clearQuery: 'Notīrīt meklēšanu',
  clearChosen: 'Notīrīt visas izvēlētās vērtības',
  notSelected: 'Nav izvēlēts',
  searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
  selectAll: 'Izvēlēties visu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

onMounted(() => {
  if (!model.value && props.kind === 'multiple') {
    model.value = [];
  }
  nextTick(() => updateDescriptionTabIndexes(props.items));
});

const itemsModel = ref({});
const itemsDisplay = computed(() => {
  const res = [...props.items];
  if (props.kind === 'single' && props.nullable)
    res.unshift({
      [props.idAttribute]: 'notSelected',
      [props.nameAttribute]: displayTexts.value.notSelected,
    });

  return res;
});

const notSelectedId = 'notSelected';

function activate() {
  // First set all items as not selected
  itemsDisplay.value?.forEach((item) => {
    itemsModel.value[item[props.idAttribute].toString()] = false;
  });

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
    return selectedItems.value[0]?.[props.nameAttribute];
  } else if (model.value && model.value.length > 0) {
    text = selectedItems.value?.map((item) => item[props.nameAttribute])?.join(', ');
  } else if (returnPlaceholder) {
    text = props.placeholder;
  }

  return text;
}

function getItemId(id) {
  return `${props.id}-item-${id}`;
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
  (newKind) => {
    activate();
    itemsModel.value = {};

    if (newKind === 'multiple') {
      model.value = [];
      if (itemsDisplay.value[0][props.idAttribute] === notSelectedId) itemsDisplay.value.shift();
    } else if (newKind === 'single') {
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

  const res = [...model.value];

  if (idModel.value) {
    // Check if item already exists in model
    const index = res?.indexOf(id);
    if (index === -1) {
      // Add item to model
      res?.push(id);
      itemsModel.value[id] = true;
    } else {
      // Remove item from model
      res?.splice(index, 1);
    }

    // Sort model according to order of items
    res?.sort(
      (a, b) =>
        Object.keys(itemsModel.value)?.indexOf(a?.toString()) -
        Object.keys(itemsModel.value)?.indexOf(b?.toString())
    );
  } else {
    itemsModel.value[id] = false;
    // Remove item from model
    const index = res?.indexOf(id);
    if (index > -1 && Array.isArray(res)) {
      res?.splice(index, 1);
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
      } else if (
          !textSearch(query.value, val[props.nameAttribute]) &&
          !textSearch(query.value, val[props.descriptionAttribute]) &&
          query.value.length !== 0
        ) {
          hiddenValues.value.push(val);
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

function checkNull(value) {
  if (!value) return 'notSelected';
  return value;
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
    const res = [];
    const states = {};
    props.items.forEach((item) => {
      res.push(item[props.idAttribute]);
      states[item[props.idAttribute]] = true;
    });
    model.value = res;
    itemsModel.value = states;
  }
}

function getDescriptionElement(itemId) {
  const parent = document.getElementById(getItemId(itemId));
  if (!parent) return null;
  return parent.querySelector(".lx-value-picker-description") as HTMLElement;
}

function shouldFocusDescription(itemId) {
  const description = getDescriptionElement(itemId);
  if (!description) return false;

  // For browser pixel differences (Firefox)
  const pixelTolerance = 1;

  return description.scrollHeight - description.clientHeight > pixelTolerance;
}

function updateDescriptionTabIndexes(items) {
  items.forEach((item) => {
    const description = getDescriptionElement(item[props.idAttribute]);
    if (description) {
      description.tabIndex = shouldFocusDescription(item[props.idAttribute]) ? 0 : -1;
    }
  });
}
</script>

<template>
  <div class="lx-value-picker-tile-tag-container" :id="id">
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
      <LxToolbar v-if="hasSearch || (hasSelectAll && kind === 'multiple')">
        <LxButton
          v-if="hasSelectAll && kind === 'multiple'"
          kind="ghost"
          :icon="
            areSomeSelected
              ? areAllSelected
                ? 'checkbox-filled'
                : 'checkbox-indeterminate'
              : 'checkbox'
          "
          :disabled="disabled"
          :title="areSomeSelected ? displayTexts.clearChosen : displayTexts.selectAll"
          :label="areSomeSelected ? displayTexts.clearChosen : displayTexts.selectAll"
          :variant="hasSearch ? 'icon-only' : 'default'"
          @click="selectAll"
        />
        <LxTextInput
          v-if="hasSearch"
          :disabled="disabled"
          ref="queryInput"
          v-model="query"
          kind="search"
          :placeholder="displayTexts.searchPlaceholder"
          role="search"
          :aria-labelledby="labelId"
        />
        <LxButton
          v-if="query && hasSearch"
          icon="clear"
          kind="ghost"
          variant="icon-only"
          :label="displayTexts.clearQuery"
          :disabled="disabled"
          @click="query = ''"
        />
      </LxToolbar>
      
      <div
        class="lx-value-picker-tile-wrapper"
        :class="[{ 'lx-invalid': invalid }, { 'lx-tile-custom': variant === 'tiles-custom' }]"
        v-if="variant === 'tiles' || variant === 'tiles-custom'"
        tabindex='-1'
        role="radiogroup"
        :aria-invalid="invalid"
        :title="tooltip"
        :aria-labelledby="labelId"
      >
        <div v-for="item in itemsDisplay" :key="item[idAttribute]">
          <div
            v-if="kind === 'single' && !isElementHidden(item)"
            class="lx-value-picker-tile"
            :class="{
              'lx-value-picker-tile-selected':
                itemsModel[item[idAttribute]] ||
                (!alwaysAsArray && item[idAttribute] === model) ||
                item[idAttribute] === checkNull(model),
            }"
            :id="getItemId(item[idAttribute])"
            :group-id="groupId"
            :tabindex="disabled ? '-1' : '0'"
            :disabled="disabled"
            @click="disabled ? null : selectSingle(item[idAttribute])"
            role="radio"
            :aria-checked="
              itemsModel[item[idAttribute]] ||
              (!alwaysAsArray && item[idAttribute] === model) ||
              item[idAttribute] === checkNull(model)
            "
            @keydown.space.prevent="disabled ? null : selectSingle(item[idAttribute])"
          >
            <template v-if="variant === 'tiles'">
              <div class="lx-value-picker-tile-header">
                <div class="lx-value-picker-tile-name">
                  <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
                </div>
                <div class="lx-value-picker-icon">
                  <LxIcon
                    v-if="
                      itemsModel[item[idAttribute]] ||
                      (!alwaysAsArray && item[idAttribute] === model) ||
                      item[idAttribute] === checkNull(model)
                    "
                    value="selected"
                  />
                  <LxIcon v-else value="unselected" />
                </div>
              </div>
              <div
                class="lx-value-picker-description"
                :tabindex="shouldFocusDescription(item[idAttribute]) ? '0' : '-1'"
              >
                <LxSearchableText :value="item[descriptionAttribute]" :search-string="query" />
              </div>
            </template>
            <div class="lx-value-picker-tile-header" v-else-if="variant === 'tiles-custom'">
              <slot name="customItem" v-bind="item" />
              <div class="lx-value-picker-icon">
                <LxIcon
                  v-if="
                    itemsModel[item[idAttribute]] ||
                    (!alwaysAsArray && item[idAttribute] === model) ||
                    item[idAttribute] === checkNull(model)
                  "
                  value="selected"
                />
                <LxIcon v-else value="unselected" />
              </div>
            </div>
          </div>

          <div
            v-if="kind === 'multiple' && !isElementHidden(item)"
            class="lx-value-picker-tile"
            :id="getItemId(item[idAttribute])"
            :group-id="groupId"
            :tabindex="disabled ? '-1' : '0'"
            :class="{
              'lx-value-picker-tile-selected': itemsModel[item[idAttribute]],
            }"
            :disabled="disabled"
            @click="selectMultiple(item[idAttribute])"
            role="checkbox"
            :aria-checked="itemsModel[item[idAttribute]]"
            @keydown.space.prevent="selectMultiple(item[idAttribute])"
          >
            <template v-if="variant === 'tiles'">
              <div class="lx-value-picker-tile-header">
                <div class="lx-value-picker-tile-name">
                  <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
                </div>
                <div class="lx-value-picker-icon">
                  <LxIcon v-if="itemsModel[item[idAttribute]]" value="selected" />
                  <LxIcon v-else value="unselected" />
                </div>
              </div>
              <div
                class="lx-value-picker-description"
                :tabindex="shouldFocusDescription(item[idAttribute]) ? '0' : '-1'"
              >
                <LxSearchableText :value="item[descriptionAttribute]" :search-string="query" />
              </div>
            </template>
            <template v-else-if="variant === 'tiles-custom'">
              <div class="lx-value-picker-tile-header">
                <slot name="customItem" v-bind="item" />
                <div class="lx-value-picker-icon">
                  <LxIcon v-if="itemsModel[item[idAttribute]]" value="selected" />
                  <LxIcon v-else value="unselected" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div
        class="lx-value-picker-tags"
        :class="[{ 'lx-invalid': invalid }]"
        v-if="variant === 'tags' || variant === 'tags-custom'"
        :aria-invalid="invalid"
        :title="tooltip"
      >
        <ul
          class="lx-tag-set"
          v-if="kind === 'single'"
          :class="[{ 'lx-tag-custom': variant === 'tags-custom' }]"
        >
          <li
            v-for="item in itemsDisplay"
            :key="item[idAttribute]"
            class="lx-tag"
            :title="item[descriptionAttribute]"
            :id="getItemId(item[idAttribute])"
            :group-id="groupId"
            :class="{
              'lx-tags-tile-selected':
                itemsModel[item[idAttribute]] ||
                (!alwaysAsArray && item[idAttribute] === model) ||
                item[idAttribute] === checkNull(model),
              'lx-value-hidden': isElementHidden(item),
            }"
            :disabled="disabled"
            :tabindex="disabled ? '-1' : '0'"
            @click="disabled ? null : selectSingle(item[idAttribute])"
            role="radio"
            :aria-checked="
              itemsModel[item[idAttribute]] ||
              (!alwaysAsArray && item[idAttribute] === model) ||
              item[idAttribute] === checkNull(model)
            "
            @keydown.space.prevent="disabled ? null : selectSingle(item[idAttribute])"
          >
            <template v-if="variant === 'tags'">
              <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
            </template>
            <template v-else-if="variant === 'tags-custom'">
              <slot name="customItem" v-bind="item" />
            </template>
          </li>
        </ul>
        <ul
          class="lx-tag-set"
          v-if="kind === 'multiple'"
          :class="[{ 'lx-tag-custom': variant === 'tags-custom' }]"
        >
          <li
            v-for="item in itemsDisplay"
            :key="item[idAttribute]"
            class="lx-tag"
            :title="item[descriptionAttribute]"
            :id="getItemId(item[idAttribute])"
            :group-id="groupId"
            :class="{
              'lx-tags-tile-selected': itemsModel[item[idAttribute]],
              'lx-value-hidden': isElementHidden(item),
            }"
            :disabled="disabled"
            :tabindex="disabled ? '-1' : '0'"
            @click="selectMultiple(item[idAttribute])"
            role="checkbox"
            :aria-checked="itemsModel[item[idAttribute]]"
            @keydown.space.prevent="selectMultiple(item[idAttribute])"
          >
            <template v-if="variant === 'tags'">
              <LxSearchableText :value="item[nameAttribute]" :search-string="query" />
            </template>
            <template v-else-if="variant === 'tags-custom'">
              <slot name="customItem" v-bind="item"></slot>
            </template>
          </li>
        </ul>
      </div>
      <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
    </template>
  </div>
</template>
