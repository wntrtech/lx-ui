<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import LxExpander from '@/components/Expander.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxForm from '@/components/forms/Form.vue';
import { getDisplayTexts } from '@/utils/generalUtils';
import useLx from '@/hooks/useLx';
import { lxDevUtils } from '@/utils';

const emits = defineEmits([
  'filter',
  'resetFilters',
  'update:expanded',
  'fastFilterClick',
  'saveFilter',
  'editFilter',
]);

const props = defineProps({
  id: { type: String, default: null },
  label: { type: String, default: null },
  description: { type: String, default: null },
  usesFilters: { type: Boolean, default: false },
  filterButtonKind: { type: String, default: 'tertiary' },
  columnCount: { type: Number, default: 1 },
  expanded: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  fastFilters: { type: Array, default: () => [] },
  enableFilterEditing: { type: Boolean, default: false },
  fastIdAttribute: { type: String, default: 'id' },
  fastNameAttribute: { type: String, default: 'name' },
  badge: { type: String, default: '' },
  badgeIcon: { type: String, default: null },
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important},
  badgeTitle: {
    type: String,
    default: null,
    validator: (v, p) => {
      // If badge or badgeIcon is non-empty, badgeTitle must be non-empty
      if ((p.badge || p.badgeIcon) && !v) {
        lxDevUtils.logWarn(
          `Warning: LxFilters "badgeTitle" is required when "badge" or "badgeIcon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },
  kind: { type: String, default: 'default' }, // default, form
  shortlistColumnCount: { type: Number, default: 1 },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const defaultTexts = {
  filters: 'Filtri',
  search: 'Atlasīt',
  clear: 'Notīrīt',
  fastFiltersLabel: 'Ātrie filtri',
  filtersApplied: 'Filtri tiek piemēroti',
  saveFilter: 'Saglabāt',
  editFilter: 'Rediģēt',
  badgeTypes: {
    default: 'informatīvs paziņojums',
    info: 'informatīvs paziņojums',
    warning: 'brīdinājums',
    good: 'sekmīgs paziņojums',
    important: 'svarīgs paziņojums',
  },
};

const displayTexts = computed(() => getDisplayTexts(props.texts, defaultTexts));

const filterSearch = (e) => {
  emits('filter', e);
};
const filterReset = (e) => {
  emits('resetFilters', e);
};

function fastFilterClick(e) {
  if (e === 'saveFilter') {
    emits('saveFilter', e);
  } else if (e === 'editFilter') {
    emits('editFilter', e);
  } else {
    emits('fastFilterClick', e);
  }
}

const isExpanded = computed({
  get() {
    return props.expanded;
  },
  set(value) {
    emits('update:expanded', value);
  },
});

function toggleExpander(value = null) {
  if (value === null) {
    isExpanded.value = !isExpanded.value;
  } else {
    isExpanded.value = value;
  }
}

const filterBody = ref();
const filterSize = useElementSize(filterBody);

const labelText = computed(() => {
  const baseLabel = props.label ? props.label : displayTexts.value.filters;
  return baseLabel;
});

const ariaLabel = computed(() => {
  const baseLabel = labelText.value;
  let label = baseLabel;

  if (props.usesFilters) {
    label = `${baseLabel} (${displayTexts.value.filtersApplied})`;
  }

  if (props.badge || props.badgeIcon) {
    const badgeTypeText =
      displayTexts.value.badgeTypes[props.badgeType] || displayTexts.value.badgeTypes.default;

    if (props.badge && props.badge.trim() !== '') {
      if (props.badgeType === 'default') {
        label = `${label} (${props.badge})`;
      } else {
        label = `${label} (${badgeTypeText}, ${props.badge})`;
      }
    } else {
      label = `${label} (${badgeTypeText})`;
    }
  }

  return label;
});

const badgeTexts = computed(() => ({
  badgeTypes: displayTexts.value.badgeTypes || {},
}));

const expander = ref();
function focus() {
  expander.value.focus();
}

const fastFilterDisplay = computed(() => {
  const fastFilters = props.fastFilters.map((item) => ({
    id: item[props.fastIdAttribute],
    name: item[props.fastNameAttribute],
  }));

  if (props.enableFilterEditing) {
    const saveButton = {
      id: 'saveFilter',
      label: displayTexts.value.saveFilter,
      icon: 'save',
      group: 'savedFilters',
    };

    const editButton = {
      id: 'editFilter',
      label: displayTexts.value.editFilter,
      icon: 'edit',
      group: 'savedFilters',
    };

    return [saveButton, editButton, ...fastFilters];
  }
  return fastFilters;
});

defineExpose({ toggleExpander, focus });
</script>
<template>
  <div class="lx-filter-wrapper">
    <LxExpander
      ref="expander"
      :id="id"
      :label="labelText"
      :description="description"
      :variant="usesFilters ? 'highlighted' : ''"
      v-model="isExpanded"
      :disabled="disabled"
      :badge="badge"
      :badge-icon="badgeIcon"
      :badge-type="badgeType"
      :badge-title="badgeTitle"
      class="lx-filter"
      icon="filter"
      :class="[{ 'has-shortlist': $slots.shortlist }]"
      :ariaLabel="ariaLabel"
      :texts="badgeTexts"
    >
      <div
        ref="filterBody"
        class="lx-form lx-form-region"
        :class="[
          { 'lx-form-2': columnCount === 2 && kind === 'default' },
          { 'lx-form-3': columnCount === 3 && kind === 'default' },
        ]"
      >
        <LxForm v-if="kind === 'form'" :columnCount="columnCount" kind="stripped">
          <slot />
        </LxForm>

        <slot v-else-if="kind === 'default'" />

        <div class="lx-button-set">
          <LxButton
            id="filter-search-button"
            :kind="filterButtonKind"
            :label="displayTexts.search"
            icon="refresh"
            :disabled="disabled"
            @click="filterSearch"
          />
          <LxDropDownMenu
            v-if="(fastFilters && fastFilters.length > 1) || enableFilterEditing"
            :actionDefinitions="fastFilterDisplay"
            @actionClick="(id) => fastFilterClick(id)"
          >
            <LxButton
              id="fast-filter-menu"
              kind="tertiary"
              icon="flash"
              :label="displayTexts.fastFiltersLabel"
              :disabled="disabled"
              :tabindex="-1"
            />
          </LxDropDownMenu>
          <LxButton
            id="fast-filter-button"
            kind="tertiary"
            icon="flash"
            :disabled="disabled"
            v-if="fastFilters && fastFilters.length === 1 && !enableFilterEditing"
            :label="fastFilters[0][fastNameAttribute]"
            @click="fastFilterClick(fastFilters[0][fastIdAttribute])"
          />
          <LxButton
            id="filter-clear-button"
            kind="tertiary"
            :label="displayTexts.clear"
            icon="filters-reset"
            :disabled="disabled"
            @click="filterReset"
          />
        </div>
      </div>
    </LxExpander>
    <div class="shortlist-wrapper" v-if="$slots.shortlist && filterSize.height.value === 0">
      <LxForm
        kind="compact"
        :column-count="shortlistColumnCount"
        :show-footer="false"
        :show-header="false"
        @keydown.enter="filterSearch"
      >
        <slot name="shortlist" />
      </LxForm>
    </div>
  </div>
</template>
