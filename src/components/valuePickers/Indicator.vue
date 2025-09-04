<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { textSearch } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

import useLx from '@/hooks/useLx';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxToolbar from '@/components/Toolbar.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: [Array, String], default: () => [] },
  items: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  iconAttribute: { type: String, default: 'icon' },
  iconSetAttribute: { type: String, default: 'iconSet' },
  categoryAttribute: { type: String, default: 'category' },
  descriptionAttribute: { type: String, default: 'description' },
  groupId: { type: String, default: null },
  variant: { type: String, default: 'indicator' },
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

const textsDefault = {
  clearQuery: 'Notīrīt meklēšanu',
  clearChosen: 'Notīrīt visas izvēlētās vērtības',
  notSelected: 'Nav izvēlēts',
  searchPlaceholder: 'Ievadiet nosaukuma daļu, lai sameklētu vērtības',
  selectAll: 'Izvēlēties visu'
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

onMounted(() => {
  if (!model.value && props.kind === 'multiple') {
    model.value = [];
  }
});

const itemsModel = ref({});
const itemsDisplay = computed( () => { 
    const res = [... props.items];
    if(props.kind === 'single' && props.nullable)  
      res.unshift({[props.idAttribute]: 'notSelected', [props.nameAttribute]: displayTexts.value.notSelected});
  
    return res
  }
);

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

function getIcon(item, iconAttribute){
  return item[iconAttribute] ? item[iconAttribute] : 'none';
}

function getIconSet(item, iconSetAttribute) {
  return item[iconSetAttribute] || (() => useLx().getGlobals()?.iconSet)();
}

function getItemId(id) {
  return `${props.id}-item-${id}`;
}

function getLabelId(id) {
  return `${id}-${props.id}-icon`;
}

function selectSingle(id) {
  if (props.disabled || props.readOnly) return;

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
  if (props.disabled || props.readOnly) {
    return;
  }

  const idModel = ref(itemsModel.value[id]);

  idModel.value = !idModel.value;

  const res = [...model.value]

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
      if(props.searchAttributes){
        if (
        !attributesSearch(val) &&
        query.value.length !== 0
      ) {
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
function isSelected(item) {
  return (
    itemsModel.value[item[props.idAttribute]] ||
    (!props.alwaysAsArray && item[props.idAttribute] === model.value) ||
    item[props.idAttribute] === checkNull(model.value)
  );
}

const indicatorTooltips = computed(() => {
  const tooltips = {};
  itemsDisplay.value.forEach(item => {
    tooltips[item[props.idAttribute]] = item[props.descriptionAttribute]
      ? `${item[props.nameAttribute]} : ${item[props.descriptionAttribute]}`
      : item[props.nameAttribute];
  });
  return tooltips;
});
</script>

<template>  
    <div
      class="lx-value-picker-indicators"
      :class="[{ 'lx-invalid': invalid }]"
      v-if="variant === 'indicator'"
      :id="id"
      :title="tooltip"
      :aria-invalid="invalid"
      :aria-labelledby="labelId"
    >
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
        :aria-disabled="disabled"
        :title="areSomeSelected ? displayTexts.clearChosen : displayTexts.selectAll"
        :label="areSomeSelected ? displayTexts.clearChosen : displayTexts.selectAll"
        :variant="hasSearch ? 'icon-only' : 'default'"
        @click="selectAll"
      />
      <LxTextInput
        v-if="hasSearch"
        :disabled="disabled"
        :aria-disabled="disabled"
        ref="queryInput"
        v-model="query"
        kind="search"
        :placeholder="displayTexts.searchPlaceholder"
        role="search"
      />
      <LxButton
        v-if="query && hasSearch"
        icon="clear"
        kind="ghost"
        variant="icon-only"
        :label="displayTexts.clearQuery"
        :disabled="disabled"
        :aria-disabled="disabled"
        @click="query = ''"
      />
    </LxToolbar>
      <ul class="lx-indicator-set" v-if="kind === 'single'">
        <li
          v-for="item in itemsDisplay"
          :key="item[idAttribute]"
          class="lx-indicator"
          :title="indicatorTooltips[item[idAttribute]]"
          :id="getItemId(item[idAttribute])"
          :group-id="groupId"
          :class="{
            'lx-indicators-selected': isSelected(item),
            'lx-value-hidden': isElementHidden(item),
            [`lx-indicator-${item[categoryAttribute]}`]: item[categoryAttribute] && isSelected(item),
          }"
          :disabled="disabled"
          :aria-disabled="disabled"
          :readOnly="readOnly"
          :tabindex="disabled ? '-1' : (readOnly ? '-1' : '0')"
          @click="disabled ? null : selectSingle(item[idAttribute])"
          role="radio"
          :aria-checked="
            itemsModel[item[idAttribute]] ||
              (!alwaysAsArray && item[idAttribute] === model) ||
              item[idAttribute] === checkNull(model)
          "
          :aria-labelledby="getLabelId(item[idAttribute])"
          @keydown.space.prevent="disabled ? null : selectSingle(item[idAttribute])"
        >
          <template v-if="variant === 'indicator'">
            <LxIcon
              :id="getLabelId(item[idAttribute])"
              :value="getIcon(item, iconAttribute)"
              :title="indicatorTooltips[item[idAttribute]]"
              :iconSet="getIconSet(item, iconSetAttribute)"
              class="lx-indicator-icon"
              />
          </template>
        </li>
      </ul>
      <ul class="lx-indicator-set" v-if="kind === 'multiple'">
        <li
          v-for="item in itemsDisplay"
          :key="item[idAttribute]"
          class="lx-indicator"
          :title="indicatorTooltips[item[idAttribute]]"
          :id="getItemId(item[idAttribute])"
          :group-id="groupId"
          :class="{
            'lx-indicators-selected': itemsModel[item[idAttribute]],
            'lx-value-hidden': isElementHidden(item),
            [`lx-indicator-${item[categoryAttribute]}`]: item[categoryAttribute] && itemsModel[item[idAttribute]],
          }"
          :disabled="disabled"
          :aria-disabled="disabled"
          :readOnly="readOnly"
          :tabindex="disabled ? '-1' : (readOnly ? '-1' : '0')"
          @click="selectMultiple(item[idAttribute])"
          role="checkbox"
          :aria-checked="itemsModel[item[idAttribute]]"
          :aria-labelledby="getLabelId(item[idAttribute])"
          @keydown.space.prevent="selectMultiple(item[idAttribute])"
        >
          <template v-if="variant === 'indicator'">
            <LxIcon
              :id="getLabelId(item[idAttribute])"
              :value="getIcon(item, iconAttribute)"
              :title="indicatorTooltips[item[idAttribute]]"
              :iconSet="getIconSet(item, iconSetAttribute)"
              class="lx-indicator-icon"/>
          </template>
        </li>
      </ul>
    </div>
    <div v-show="invalid" class="lx-invalidation-message">{{ invalidationMessage }}</div>
</template>
