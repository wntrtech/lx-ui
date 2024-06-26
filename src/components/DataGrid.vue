<script setup>
import { computed, onMounted, ref } from 'vue';

import { formatDateTime, formatDate, formatFull } from '@/utils/dateUtils';
import { generateUUID, foldToAscii } from '@/utils/stringUtils';
import LxButton from '@/components/Button.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxRadioButton from '@/components/RadioButton.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropdownMenu from '@/components/DropDownMenu.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxRating from '@/components/Ratings.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxFlag from '@/components/Flag.vue';
import LxFlagItemDisplay from '@/components/itemDisplay/FlagItemDisplay.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxAppendableList from '@/components/forms/AppendableList.vue';
import LxRow from '@/components/forms/Row.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxPersonDisplay from '@/components/PersonDisplay.vue';

const emits = defineEmits([
  'actionClick',
  'selectPage',
  'sortingChanged',
  'selectionChanged',
  'itemsPerPageChanged',
  'selectionActionClicked',
  'emptyStateActionClick',
]);

const props = defineProps({
  id: {
    type: String,
    default: generateUUID(),
  },
  label: { type: String, default: null },
  description: { type: String, default: null },
  columnDefinitions: {
    type: Array,
    default: () => [
      { attributeName: 'id', size: 's' },
      { attributeName: 'name', size: '*' },
    ],
  },
  idAttribute: { type: String, default: 'id' },
  actionDefinitions: { type: Array, default: () => [] },
  actionAdditionalParameter: { type: String, default: null },
  defaultActionName: { type: String, default: 'open' },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  skeletonRowCount: { type: Number, default: 10 },
  scrollable: { type: Boolean, default: false },
  showHeader: { type: Boolean, default: false },
  showToolbar: { type: Boolean, default: false },
  showStatusbar: { type: Boolean, default: true },
  showAllColumns: { type: Boolean, default: false },
  showItemsCountSelector: { type: Boolean, default: false },
  hasPaging: { type: Boolean, default: false },
  hasSorting: { type: Boolean, default: false },
  hasSelecting: { type: Boolean, default: false },
  selectingKind: { type: String, default: 'multiple' }, // 'multiple' (with checkboxes; can select many rows) or 'single' (with radio buttons; can select one row)
  sortingSide: { type: String, default: 'client' }, // 'client' (sorting is done on client side) or 'server' (sorting is done on server side)
  sortingIgnoreEmpty: { type: Boolean, default: true },
  pageCurrent: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 20 },
  itemsTotal: { type: Number, default: 0 },
  sortingMode: { type: String, default: 'strip' }, // 'default' or 'strip'
  selectionActionDefinitions: { type: Array, default: () => [] },
  emptyStateActionDefinitions: { type: Array, default: null },
  emptyStateIcon: { type: String, default: '' },
  texts: {
    type: Object,
    default: () => ({
      valueYes: 'Jā',
      valueNo: 'Nē',
      items: {
        singular: 'ieraksts',
        plural: 'ieraksti',
        endingWith234: 'ieraksti',
        endingWith1: 'ieraksts',
      },
      ofItems: {
        label: 'Ieraksti',
        singular: 'ieraksta',
        plural: 'ierakstiem',
        endingWith234: 'ierakstiem',
        endingWith1: 'ieraksta',
      },
      selected: {
        singular: 'Izvēlēts',
        plural: 'Izvēlēti',
        endingWith234: 'Izvēlēti',
        endingWith1: 'Izvēlēts',
      },
      of: 'no',
      nextPage: 'Nākamā lapa',
      previousPage: 'Iepriekšējā lapa',
      clear: 'Attīrīt izvēles',
      itemsPerPage: 'Ierakstu skaits vienā lapā:',
      itemsPerPageLabel: 'ieraksti lapā',
      selectAllRows: 'Izvēlēties visu',
      noItems: 'Nav neviena ieraksta, ko attēlot',
      noItemsDescription: '',
    }),
  },
});

const sortedColumns = ref({});

function isValueEmpty(value) {
  return value === null || value === undefined || value === '';
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const isDisabled = computed(() => props.loading || props.busy);

const columnsComputed = computed(() => {
  const ret = [];
  props.columnDefinitions?.forEach((definition) => {
    ret.push({
      id: definition.id ? definition.id : definition.attributeName,
      attributeName: definition.attributeName,
      name: definition.name ? definition.name : definition.attributeName,
      title: definition.title,
      dictionary: definition.dictionary,
      type: definition.type ? definition.type : 'default',
      kind: definition.kind ? definition.kind : 'default',
      size: definition.size ? definition.size : '*',
      options: definition.options ? definition.options : null,
    });
  });
  return ret;
});

const selectedRowsRaw = ref({});

function formatBoolean(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return value ? props.texts.valueYes : props.texts.valueNo;
}

function formatValue(value, type, options = null) {
  let optionsValue = options;
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  switch (type) {
    case 'bool':
    case 'boolean':
      return formatBoolean(value);
    case 'number':
      return new Intl.NumberFormat('lv-LV', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'float':
    case 'decimal':
      if (!options) {
        optionsValue = 2;
      }
      return new Intl.NumberFormat('lv-LV', {
        minimumFractionDigits: optionsValue,
        maximumFractionDigits: optionsValue,
      }).format(value);

    case 'dateTimeFull':
      return formatFull(value);
    case 'dateTime':
      return formatDateTime(value);

    case 'date':
      return formatDate(value);
    case 'array':
      if (!options) {
        optionsValue = 1;
      }
      if (value && value.length > optionsValue) {
        return value.length;
      }
      if (value && value.length <= optionsValue) {
        return value;
      }
      return '—';

    case 'default':
    default:
      return value.toString();
  }
}
function formatTooltip(displayName, title) {
  let ret = '';
  if (title) {
    ret = `${displayName}\r\n${title}`;
  } else {
    ret = `${displayName}`;
  }
  return ret;
}

function actionClicked(actionName, rowCode, additionalParam) {
  if (!props.loading && !props.busy) {
    emits('actionClick', actionName, rowCode, additionalParam);
  }
}
function selectionActionClicked(actionName, selectedRowCodes) {
  if (!props.loading && !props.busy) {
    emits('selectionActionClicked', actionName, selectedRowCodes);
  }
}
function selectPageClicked(pageNum) {
  if (!props.loading && !props.busy) {
    emits('selectPage', pageNum);
  }
}

function checkEnableByAttributeName(row) {
  let temp = props.actionDefinitions.find((item) => item.id === props.defaultActionName);
  if (temp && temp.enableByAttribute) {
    temp = temp.enableByAttribute;
    return row[temp];
  }
  return true;
}

function defaultActionClicked(rowCode, row) {
  if (checkEnableByAttributeName(row) && props.defaultActionName && !props.loading && !props.busy) {
    actionClicked(props.defaultActionName, rowCode, props.actionAdditionalParameter);
  }
}

function selectNextPage() {
  selectPageClicked(Number(props.pageCurrent) + 1);
}
function selectPreviousPage() {
  selectPageClicked(Number(props.pageCurrent) - 1);
}
function selectFirstPage() {
  selectPageClicked(0);
}

function setSorting(columnCode, direction) {
  sortedColumns.value[columnCode] = direction;
  emits('sortingChanged', { columnCode, direction });
}

function sortColumn(columnCode) {
  if (!isDisabled.value) {
    const prevSorting = sortedColumns.value[columnCode];

    sortedColumns.value = {};
    if (props.hasSorting) {
      if (prevSorting === 'asc') setSorting(columnCode, 'desc');
      else if (prevSorting === 'desc') setSorting(columnCode, null);
      else setSorting(columnCode, 'asc');
    }
  }
}

const selectedRows = computed(() => {
  const ret = [];
  Object.keys(selectedRowsRaw.value).forEach((key) => {
    if (selectedRowsRaw.value[key]) {
      if (props.selectingKind === 'multiple') {
        ret.push(key);
      } else if (props.selectingKind === 'single') {
        ret[0] = key;
      }
    }
  });
  emits('selectionChanged', ret);
  return ret;
});

function selectRow(id) {
  selectedRowsRaw.value = {};
  selectedRowsRaw.value[id] = true;
}

function cancelSelection() {
  selectedRowsRaw.value = {};
}

function compareFlags(a, b, colCode) {
  let preparedA = '';
  let preparedB = '';

  if (typeof a[colCode] === 'object' && props.sortingMode === 'default') {
    preparedA = a[colCode].name?.toLowerCase();
  } else if (typeof a[colCode] === 'object' && props.sortingMode === 'strip') {
    preparedA = foldToAscii(a[colCode].name?.toLowerCase());
  } else {
    preparedA = foldToAscii(a[colCode]?.toString().toLowerCase());
  }

  if (typeof b[colCode] === 'object' && props.sortingMode === 'default') {
    preparedB = b[colCode].name?.toLowerCase();
  } else if (typeof b[colCode] === 'object' && props.sortingMode === 'strip') {
    preparedB = foldToAscii(b[colCode].name?.toLowerCase());
  } else {
    preparedB = foldToAscii(b[colCode]?.toString().toLowerCase());
  }

  if (props.sortingMode === 'default') {
    return Intl.Collator('lv').compare(preparedA, preparedB);
  }

  return +(preparedA > preparedB) || -(preparedA < preparedB);
}

function compareNumber(a, b, colCode) {
  const preparedA = a[colCode] || 0;
  const preparedB = b[colCode] || 0;
  return preparedA - preparedB;
}
function compareStrip(a, b, colCode) {
  const preparedA = foldToAscii(a[colCode]?.toString().toLowerCase()) || '';
  const preparedB = foldToAscii(b[colCode]?.toString().toLowerCase()) || '';
  return +(preparedA > preparedB) || -(preparedA < preparedB);
}

function compare(ascending) {
  return function (a, b) {
    let ret = 0;
    const colCode = Object.keys(sortedColumns.value)[0];
    const colDefinition = columnsComputed.value.find((item) => item.id === colCode);
    if (!a[colCode] && props.sortingIgnoreEmpty) {
      return 1;
    }
    if (!b[colCode] && props.sortingIgnoreEmpty) {
      return -1;
    }
    if (
      colDefinition &&
      (colDefinition.type === 'number' ||
        colDefinition.type === 'decimal' ||
        colDefinition.type === 'float')
    ) {
      ret = compareNumber(a, b, colCode);
    } else if (props.sortingMode === 'default') {
      ret = new Intl.Collator('lv').compare(
        a[colCode]?.toString().toLowerCase(),
        b[colCode]?.toString().toLowerCase()
      );
    } else if (props.sortingMode === 'strip') {
      ret = compareStrip(a, b, colCode);
    }
    if (colDefinition && (colDefinition.type === 'flag' || colDefinition.type === 'country')) {
      ret = compareFlags(a, b, colCode);
    }
    if (!ascending) {
      ret = -ret;
    }
    return ret;
  };
}

const rows = computed(() => {
  if (props.items) {
    let ret = [...props.items];
    const colCode = Object.keys(sortedColumns.value)[0];
    if (sortedColumns.value[colCode] && props.sortingSide === 'client') {
      if (sortedColumns.value[colCode] === 'asc') {
        ret = ret.sort(compare(true));
      } else {
        ret = ret.sort(compare(false));
      }
    }
    return ret;
  }
  return [];
});

const pagesTotal = computed(() => Math.ceil(props.itemsTotal / props.itemsPerPage));
const itemsLabel = computed(() => {
  const num = rows.value.length;
  let numDisplay = num.toString();
  let label = props.texts.items.plural;
  if (props.hasPaging && pagesTotal.value) {
    const numStarting = props.pageCurrent * props.itemsPerPage + 1;
    let numEnding =
      Number(props.pageCurrent) * Number(props.itemsPerPage) + Number(props.itemsPerPage);
    if (numEnding > props.itemsTotal) numEnding = props.itemsTotal;
    numDisplay = `${numStarting}-${numEnding}`;

    return `${props.texts.ofItems.label} ${numDisplay} ${props.texts.of} ${props.itemsTotal}`;
  }
  if (num === 1) {
    label = props.texts.items.singular;
  } else if (num > 20 && (num % 10 === 2 || num % 10 === 3 || num % 10 === 4)) {
    label = props.texts.items.endingWith234;
  } else if (num > 11 && num % 10 === 1) {
    label = props.texts.items.endingWith1;
  }
  return `${numDisplay} ${label}`;
});
const selectedLabel = computed(() => {
  const num = selectedRows.value.length;
  const numDisplay = num.toString();
  let label = props.texts.items.plural;
  let labelStart = props.texts.selected.plural;
  let ret = numDisplay;

  if (num === 1) {
    label = props.texts.items.singular;
    labelStart = props.texts.selected.singular;
  } else if (num > 20 && (num % 10 === 2 || num % 10 === 3 || num % 10 === 4)) {
    label = props.texts.items.endingWith234;
    labelStart = props.texts.selected.endingWith234;
  } else if (num > 11 && num % 10 === 1) {
    label = props.texts.items.endingWith1;
    labelStart = props.texts.selected.endingWith1;
  }
  ret = `${labelStart} ${numDisplay} ${label} ${props.texts.of} ${props.itemsTotal}`;

  return ret;
});

const hasActionButtons = computed(() => {
  let ret = false;
  if (props.actionDefinitions && props.actionDefinitions.length > 0) {
    ret = true;
  }
  return ret;
});
const itemsCountSelector = computed(() => [10, 20, 30, 40, 50]);

function changeItemsPerPage(value) {
  emits('itemsPerPageChanged', value);
}

onMounted(() => {
  if (props.items && !props.idAttribute) {
    throw new Error('"idAttribute" prop is required on DataGrid Component');
  }
});

function arrayToObject(arr) {
  const ret = {};
  arr.forEach((o) => {
    ret[o] = true;
  });
  return ret;
}
function selectRows(arr = null) {
  if (arr === null) {
    selectedRowsRaw.value = arrayToObject(props.items?.map((x) => x[props.idAttribute].toString()));
  } else {
    selectedRowsRaw.value = arrayToObject(arr.map((x) => x[props.idAttribute].toString()));
  }
}
function sortBy(columnCode, direction = 'asc') {
  if (!isDisabled.value) {
    sortedColumns.value = {};
    if (props.hasSorting) {
      if (direction === 'asc') setSorting(columnCode, 'asc');
      else if (direction === 'desc') setSorting(columnCode, 'desc');
      else setSorting(columnCode, null);
    }
  }
}
const isSelectedAll = computed(() => {
  let res = false;
  const num = Number(rows.value.length);
  if (rows.value.length > props.itemsPerPage) {
    if (selectedRows.value.length === Number(props.itemsPerPage)) res = true;
  } else if (selectedRows.value.length === num) res = true;
  return res;
});

function primaryColumn() {
  let clickableObject = null;
  let primaryObject = null;

  columnsComputed.value.forEach((obj) => {
    if (obj.kind === 'clickable' && !clickableObject) {
      clickableObject = obj;
    } else if (obj.kind === 'primary' && !primaryObject) {
      primaryObject = obj;
    }
  });

  return clickableObject || primaryObject || columnsComputed.value[0];
}

const toolbarActions = computed(() => {
  const res = ref([]);
  if (
    ((!props.hasSelecting && props.showToolbar) ||
      (props.hasSelecting && selectedRows.value?.length === 0)) &&
    props.hasSelecting &&
    props.selectingKind === 'multiple'
  ) {
    res.value = [
      { id: 'checkAll', name: props.texts.selectAllRows, icon: 'checkbox', groupId: '1' },
    ];
  } else if (props.hasSelecting && selectedRows.value && selectedRows.value?.length !== 0) {
    if (props.hasSelecting && selectedRows.value?.length && isSelectedAll.value) {
      res.value = [
        { id: 'checkNone', name: props.texts.clear, icon: 'checkbox-filled', groupId: '1' },
      ];
    } else {
      res.value = [
        {
          id: 'checkIndeterminate',
          name: props.texts.clear,
          icon:
            props.selectingKind === 'multiple' ? 'checkbox-indeterminate' : 'radiobutton-filled',
          groupId: '1',
        },
      ];
    }
    const selectActions = [...props.selectionActionDefinitions];
    selectActions.forEach((obj) => {
      const clonedObj = { ...obj };
      clonedObj.area = 'right';
      clonedObj.groupId = '2';
      clonedObj.label = obj?.name;
      res.value.push(clonedObj);
    });
  }
  return res.value;
});

function toolbarClick(action) {
  if (action === 'checkAll') selectRows();
  else if (action === 'checkNone' || action === 'checkIndeterminate') cancelSelection();
  else selectionActionClicked(action, selectedRows.value);
}

defineExpose({ cancelSelection, selectRows, sortBy });

function emptyStateActionClicked(actionName) {
  emits('emptyStateActionClick', actionName);
}
</script>
<template>
  <div class="lx-data-grid-wrapper">
    <header v-if="showHeader">
      <h2 :id="`${id}-label`">{{ label }}</h2>
      <p :id="`${id}-description`" class="lx-description">{{ description }}</p>
    </header>
    <LxToolbar
      :actionDefinitions="toolbarActions"
      :disabled="props.busy"
      :loading="props.loading"
      @action-click="toolbarClick"
      :class="[
        { 'lx-selection-toolbar': hasSelecting && selectedRows && selectedRows.length },
        { 'lx-grid-toolbar': true },
      ]"
    >
      <template #leftArea v-if="hasSelecting && selectedRows && selectedRows.length !== 0">
        <p>{{ selectedLabel }}</p>
      </template>
      <template
        #rightArea
        v-if="(!hasSelecting && props.showToolbar) || (hasSelecting && selectedRows.length === 0)"
      >
        <div class="lx-slot-wrapper">
          <slot name="toolbar" />
        </div>
      </template>
    </LxToolbar>

    <article
      :id="id"
      class="lx-data-grid"
      :class="[{ 'lx-scrollable': scrollable }, { 'lx-data-grid-full': showAllColumns }]"
    >
      <table
        v-show="!loading"
        :aria-labelledby="`${id}-label`"
        :aria-describedby="`${id}-description`"
      >
        <thead class="lx-grid-row">
          <th v-if="hasSelecting" class="lx-cell-header lx-cell-selector"></th>
          <th
            v-for="col in columnsComputed"
            :key="col.id"
            :title="formatTooltip(col.name, col.title)"
            class="lx-cell-header"
            :class="[
              {
                'lx-cell-number':
                  col.type === 'number' || col.type === 'decimal' || col.type === 'float',
              },
              {
                'lx-cell-sortable': hasSorting,
              },
              {
                'lx-cell-sorted': sortedColumns[col.id],
              },
              {
                'lx-cell-extra': col.kind === 'extra',
              },
            ]"
            @click="sortColumn(col.id)"
          >
            <div>
              <p class="lx-primary">{{ col.name }}</p>
              <lx-icon value="sort-down" v-if="sortedColumns[col.id] === 'desc'"></lx-icon>
              <lx-icon value="sort-up" v-if="sortedColumns[col.id] === 'asc'"></lx-icon>
              <lx-icon value="sort-default" v-if="!sortedColumns[col.id]"></lx-icon>
            </div>
          </th>
          <th v-if="hasActionButtons" class="lx-cell-header lx-cell-action"></th>
        </thead>
        <tbody>
          <transition-group
            tag="tr"
            name="data-grid"
            class="lx-grid-row"
            :class="[{ 'lx-selected': selectedRowsRaw[row[idAttribute]] && hasSelecting }]"
            :id="`row-${row[idAttribute]}`"
            v-for="row in rows"
            tabindex="0"
            :key="row[idAttribute]"
            @dblclick="defaultActionClicked(row[idAttribute], row)"
            @keyup.space="defaultActionName ? defaultActionClicked(row[idAttribute], row) : null"
            @keyup.enter="defaultActionName ? defaultActionClicked(row[idAttribute], row) : null"
          >
            <td v-if="hasSelecting" class="lx-cell lx-cell-selector">
              <lx-checkbox
                v-if="selectingKind === 'multiple'"
                :id="`select-${id}-${row[idAttribute]}`"
                v-model="selectedRowsRaw[row[idAttribute]]"
                :value="row[idAttribute]?.toString()"
                :disabled="isDisabled"
              />
              <lx-radio-button
                v-if="selectingKind === 'single'"
                :id="`select-${id}-${row[idAttribute]}`"
                v-model="selectedRowsRaw[row[idAttribute]]"
                :value="row[idAttribute]?.toString()"
                :disabled="isDisabled"
                @click="selectRow(row[idAttribute])"
              />
            </td>
            <!-- Since key events are assigned to the whole <tr> already -->
            <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
            <td
              v-for="col in columnsComputed"
              :key="col.id"
              class="lx-cell"
              @click="
                defaultActionName && col.kind === 'clickable' && !isDisabled
                  ? defaultActionClicked(row[idAttribute], row)
                  : null
              "
              :class="[
                {
                  'lx-cell-number':
                    col.type === 'number' || col.type === 'decimal' || col.type === 'float',
                },
                {
                  'lx-cell-number-left': col.options?.justify === 'left',
                },
                {
                  'lx-cell-xs': col.size === 'xs',
                },
                {
                  'lx-cell-s': col.size === 's',
                },
                {
                  'lx-cell-m': col.size === 'm',
                },
                {
                  'lx-cell-l': col.size === 'l',
                },
                {
                  'lx-cell-xl': col.size === 'xl',
                },
                {
                  'lx-cell-stretch': col.size === '*',
                },
                {
                  'lx-cell-clickable': col.kind === 'clickable',
                },
                {
                  'lx-cell-primary': col.kind === 'primary',
                },
                {
                  'lx-cell-secondary': col.kind === 'secondary',
                },
                {
                  'lx-cell-extra': col.kind === 'extra',
                },
                {
                  'lx-cell-link-disabled':
                    (col.kind === 'clickable' && !checkEnableByAttributeName(row)) || isDisabled,
                },
              ]"
            >
              <template
                v-if="
                  col.type !== 'state' &&
                  col.type !== 'rating' &&
                  col.type !== 'array' &&
                  col.type !== 'flag' &&
                  col.type !== 'country' &&
                  col.type !== 'person' &&
                  col.type !== 'icon'
                "
              >
                {{ formatValue(row[col.attributeName], col.type, col.options?.fractionDigits) }}
              </template>

              <lx-state-display
                v-if="col.type === 'state'"
                :value="row[col?.attributeName]"
                :dictionary="col?.dictionary ? col?.dictionary : col?.options"
              />
              <lx-rating
                v-if="col.type === 'rating'"
                :disabled="props.busy"
                mode="read"
                v-model="row[col.attributeName]"
              />
              <template v-if="col.type === 'icon'">
                <LxIcon
                  v-if="
                    isObject(row?.[col?.attributeName]) && !isValueEmpty(row?.[col?.attributeName])
                  "
                  :value="row?.[col?.attributeName]?.icon"
                  :icon-set="row?.[col?.attributeName]?.iconSet"
                  :title="row?.[col?.attributeName]?.label"
                  :customClass="`lx-grid-column-icon ${row?.[col?.attributeName]?.category}`"
                ></LxIcon>
                <LxIcon
                  v-else-if="
                    !isObject(row?.[col?.attributeName]) && !isValueEmpty(row?.[col?.attributeName])
                  "
                  :value="row?.[col?.attributeName]"
                  customClass="lx-grid-column-icon"
                ></LxIcon>
                <span v-else>—</span>
              </template>

              <LxFlag
                v-if="
                  (col.type === 'flag' || col.type === 'country') &&
                  typeof row[col.attributeName] === 'string'
                "
                size="small"
                :value="row[col.attributeName]"
              />
              <div
                class="flag-column"
                v-if="
                  (col.type === 'flag' || col.type === 'country') &&
                  typeof row[col.attributeName] === 'object'
                "
              >
                <LxFlagItemDisplay
                  :value="row[col.attributeName]"
                  nameAttribute="name"
                  idAttribute="id"
                />
              </div>
              <LxPersonDisplay
                v-if="col.type === 'person'"
                :value="row[col.attributeName]"
                size="s"
              />
              <template v-if="col.type === 'array'">
                <lx-info-wrapper
                  v-if="
                    row[col.attributeName] &&
                    row[col.attributeName].length >
                      (col.options?.displayItemsCount ? col.options?.displayItemsCount : 1)
                  "
                >
                  <div class="lx-indicator">
                    {{
                      formatValue(row[col.attributeName], col.type, col.options?.displayItemsCount)
                    }}
                  </div>
                  <template #panel>
                    <ul>
                      <li v-for="i in row[col.attributeName]" v-bind:key="i">
                        <div class="lx-row">
                          <p class="lx-data">{{ i }}</p>
                        </div>
                      </li>
                    </ul>
                  </template>
                </lx-info-wrapper>
                <template
                  v-else
                  v-for="i in formatValue(
                    row[col.attributeName],
                    col.type,
                    col.options?.displayItemsCount
                  )"
                >
                  {{ `${i} ` }}</template
                >
              </template>
            </td>
            <td
              class="lx-cell-action"
              :class="[{ 'show-cell-borders': scrollable }]"
              v-if="hasActionButtons"
            >
              <div class="lx-toolbar" v-if="actionDefinitions.length <= 2">
                <lx-button
                  v-for="action in actionDefinitions"
                  :key="action.id"
                  kind="ghost"
                  tabindex="0"
                  :icon="action.icon"
                  :title="action.name"
                  :destructive="action.destructive"
                  :disabled="
                    isDisabled || action.enableByAttribute ? !row[action.enableByAttribute] : false
                  "
                  @click="actionClicked(action.id, row[idAttribute], actionAdditionalParameter)"
                />
              </div>
              <lx-dropdown-menu placement="left-start">
                <div class="lx-toolbar" v-if="actionDefinitions.length > 2">
                  <lx-button icon="overflow-menu" kind="ghost" :disabled="isDisabled" />
                </div>
                <template v-slot:panel>
                  <div class="lx-button-set">
                    <lx-button
                      v-for="action in actionDefinitions"
                      :key="action.id"
                      :icon="action.icon"
                      :label="action.name"
                      :title="action.name"
                      tabindex="0"
                      :destructive="action.destructive"
                      :disabled="
                        isDisabled || action.enableByAttribute
                          ? !row[action.enableByAttribute]
                          : false
                      "
                      @click="actionClicked(action.id, row[idAttribute], actionAdditionalParameter)"
                    />
                  </div>
                </template>
              </lx-dropdown-menu>
            </td>
          </transition-group>
        </tbody>
      </table>

      <table
        class="lx-skeleton"
        v-show="loading"
        :aria-labelledby="`${id}-label`"
        :aria-describedby="`${id}-description`"
      >
        <thead class="lx-grid-row">
          <th class="lx-cell-header"><div class="lx-skeleton-placeholder"></div></th>
          <th class="lx-cell-header"><div class="lx-skeleton-placeholder"></div></th>
          <th class="lx-cell-header"><div class="lx-skeleton-placeholder"></div></th>
        </thead>
        <tr class="lx-grid-row" v-for="index in props.skeletonRowCount" :key="index">
          <td class="lx-cell lx-cell-s"><div class="lx-skeleton-placeholder"></div></td>
          <td class="lx-cell lx-cell-m"><div class="lx-skeleton-placeholder"></div></td>
          <td class="lx-cell lx-cell"><div class="lx-skeleton-placeholder"></div></td>
        </tr>
      </table>
    </article>
    <LxEmptyState
      v-if="items?.length < 1 && !(loading || busy)"
      :label="texts?.noItems"
      :description="texts?.noItemsDescription"
      :icon="emptyStateIcon"
      :actionDefinitions="emptyStateActionDefinitions"
      @empty-state-action-click="emptyStateActionClicked"
    />
    <LxAppendableList
      v-model="rows"
      :expandable="true"
      :nameAttribute="primaryColumn()?.attributeName"
      kind="compact"
      :readOnly="true"
      :hasSelecting="hasSelecting"
      :selectingKind="selectingKind"
      :actionDefinitions="actionDefinitions"
      :columnCount="2"
      :defaultExpanded="false"
      :idAttribute="idAttribute"
      v-model:selectedValues="selectedRowsRaw"
      @selectionChanged="selectRows"
      @actionClick="(val, item) => actionClicked(val, item, actionAdditionalParameter)"
      :class="[{ 'lx-data-grid-full': showAllColumns }]"
    >
      <template #customItem="{ item }">
        <LxRow
          :label="col.name"
          v-for="col in columnsComputed"
          :key="col.id"
          columnSpan="2"
          :class="[
            {
              'lx-cell-clickable': col.kind === 'clickable',
            },
            {
              'lx-cell-primary': col.kind === 'primary',
            },
            {
              'lx-cell-secondary': col.kind === 'secondary',
            },
            {
              'lx-cell-extra': col.kind === 'extra',
            },
            {
              'lx-cell-link-disabled':
                col.kind === 'clickable' && !checkEnableByAttributeName(item),
            },
          ]"
        >
          <div
            v-if="
              col.type !== 'state' &&
              col.type !== 'rating' &&
              col.type !== 'array' &&
              col.type !== 'flag' &&
              col.type !== 'country' &&
              col.type !== 'person' &&
              col.type !== 'icon'
            "
            :tabindex="col.kind === 'clickable' ? 0 : -1"
            @click="
              defaultActionName && col.kind === 'clickable'
                ? defaultActionClicked(item[idAttribute], item)
                : null
            "
            @keydown.enter="
              defaultActionName && col.kind === 'clickable'
                ? defaultActionClicked(item[idAttribute], item)
                : null
            "
          >
            {{ formatValue(item[col.attributeName], col.type, col.options?.fractionDigits) }}
          </div>

          <lx-state-display
            v-else-if="col.type === 'state'"
            :value="item[col?.attributeName]"
            :dictionary="col?.dictionary ? col?.dictionary : col?.options"
          />
          <LxRating
            v-else-if="col.type === 'rating'"
            :disabled="props.busy"
            mode="read"
            v-model="item[col.attributeName]"
          />
          <template v-else-if="col.type === 'icon'">
            <LxIcon
              v-if="
                isObject(item?.[col?.attributeName]) && !isValueEmpty(item?.[col?.attributeName])
              "
              :value="item?.[col?.attributeName]?.icon"
              :icon-set="item?.[col?.attributeName]?.iconSet"
              :title="item?.[col?.attributeName]?.label"
              :customClass="`lx-grid-column-icon ${item?.[col?.attributeName]?.category}`"
            ></LxIcon>
            <LxIcon
              v-else-if="
                !isObject(item?.[col?.attributeName]) && !isValueEmpty(item?.[col?.attributeName])
              "
              :value="item?.[col?.attributeName]"
              customClass="lx-grid-column-icon"
            ></LxIcon>
            <span v-else>—</span>
          </template>
          <LxFlag
            v-else-if="
              (col.type === 'flag' || col.type === 'country') &&
              typeof item[col.attributeName] === 'string'
            "
            size="small"
            :value="item[col.attributeName]"
          />
          <div
            class="flag-column"
            v-else-if="
              (col.type === 'flag' || col.type === 'country') &&
              typeof item[col.attributeName] === 'object'
            "
          >
            <LxFlagItemDisplay
              :value="item[col.attributeName]"
              nameAttribute="name"
              idAttribute="id"
            />
          </div>
          <LxPersonDisplay
            v-else-if="col.type === 'person'"
            :value="item[col.attributeName]"
            size="s"
          />
        </LxRow>
      </template>
    </LxAppendableList>
    <footer class="lx-statusbar" v-if="showStatusbar">
      <div
        class="lx-group lx-group-paging count-selector"
        v-if="hasPaging && showItemsCountSelector && !loading"
      >
        {{ texts.itemsPerPage }}
        <lx-dropdown-menu>
          <div class="lx-chip">
            {{ itemsPerPage }}
            <lx-icon value="chevron-down" />
          </div>
          <template #panel>
            <div class="lx-button-set">
              <lx-button
                v-for="i in itemsCountSelector"
                :key="i"
                :label="`${i.toString()} ${texts.itemsPerPageLabel}`"
                :title="`${i.toString()} ${texts.itemsPerPageLabel}`"
                :disabled="itemsPerPage === i || isDisabled"
                @click="changeItemsPerPage(i)"
              />
            </div>
          </template>
        </lx-dropdown-menu>
      </div>
      <div class="lx-group count-display" v-if="!loading">
        {{ itemsLabel }}
      </div>
      <div class="lx-group lx-group-paging" v-if="hasPaging && !loading">
        <lx-button
          kind="ghost"
          icon="first-page"
          :disabled="pageCurrent < 1 || isDisabled"
          @click="selectFirstPage()"
        ></lx-button>
        <div class="lx-divider"></div>
        <lx-button
          kind="ghost"
          icon="previous-page"
          :disabled="pageCurrent < 1 || isDisabled"
          @click="selectPreviousPage"
        ></lx-button>
        <div class="lx-divider"></div>
        <lx-button
          kind="ghost"
          icon="next-page"
          :disabled="Number(pageCurrent) + 1 >= Number(pagesTotal) || isDisabled"
          @click="selectNextPage"
        ></lx-button>
      </div>
    </footer>
  </div>
</template>
