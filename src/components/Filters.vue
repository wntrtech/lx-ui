<script setup lang="ts">
import { defineProps, computed } from 'vue';
import LxExpander from '@/components/Expander.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxForm from '@/components/forms/Form.vue';

const emits = defineEmits(['filter', 'resetFilters', 'update:expanded', 'fastFilterClick']);

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
  fastIdAttribute: { type: String, default: 'id' },
  fastNameAttribute: { type: String, default: 'name' },
  badge: { type: String, default: '' },
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important},
  kind: { type: String, default: 'default' }, // default, form
  texts: {
    type: Object,
    default: () => ({
      filters: 'Filtri',
      search: 'Atlasīt',
      clear: 'Notīrīt',
      fastFiltersLabel: 'Ātrie filtri',
    }),
  },
});

const filterSearch = (e) => {
  emits('filter', e);
};
const filterReset = (e) => {
  emits('resetFilters', e);
};

function fastFilterClick(e) {
  emits('fastFilterClick', e);
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

const labelText = computed(() => (props.label ? props.label : props.texts.filters));

defineExpose({ toggleExpander });
</script>
<template>
  <lx-expander
    :id="id"
    :label="labelText"
    :description="description"
    :variant="usesFilters ? 'highlighted' : ''"
    v-model="isExpanded"
    :disabled="disabled"
    :badge="badge"
    :badge-type="badgeType"
    class="lx-filter"
    icon="filter"
  >
    <div
      class="lx-form lx-form-region"
      :class="[
        { 'lx-form-2': columnCount === 2 && kind === 'default' },
        { 'lx-form-3': columnCount === 3 && kind === 'default' },
      ]"
    >
      <LxForm v-if="kind === 'form'" :columnCount="columnCount" kind="stripped"> <slot /> </LxForm>

      <slot v-else-if="kind === 'default'" />

      <div class="lx-button-set">
        <lx-button
          id="filter-search-button"
          :kind="filterButtonKind"
          :label="texts.search"
          icon="refresh"
          :disabled="disabled"
          @click="filterSearch"
        />
        <LxDropDownMenu v-if="fastFilters && fastFilters.length > 1">
          <LxButton
            id="fast-filter-menu"
            kind="tertiary"
            icon="flash"
            :label="texts.fastFiltersLabel"
            :disabled="disabled"
          />
          <template v-slot:panel>
            <div class="lx-button-set">
              <LxButton
                v-for="item in fastFilters"
                :key="item[fastIdAttribute]"
                :label="item[fastNameAttribute]"
                @click="fastFilterClick(item[fastIdAttribute])"
              />
            </div>
          </template>
        </LxDropDownMenu>
        <LxButton
          id="fast-filter-button"
          kind="tertiary"
          icon="flash"
          :disabled="disabled"
          v-if="fastFilters && fastFilters.length === 1"
          :label="fastFilters[0][fastNameAttribute]"
          @click="fastFilterClick(fastFilters[0][fastIdAttribute])"
        />
        <lx-button
          id="filter-clear-button"
          kind="tertiary"
          :label="texts.clear"
          icon="filters-reset"
          :disabled="disabled"
          @click="filterReset"
        />
      </div>
    </div>
  </lx-expander>
</template>
