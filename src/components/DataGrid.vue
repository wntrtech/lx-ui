<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import {
  useWindowSize,
  useElementBounding,
  useElementSize,
  useMutationObserver,
  useDebounceFn,
} from '@vueuse/core';

import { formatDateTime, formatDate, formatFull } from '@/utils/dateUtils';
import { generateUUID, foldToAscii } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxButton from '@/components/Button.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxRadioButton from '@/components/RadioButton.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxRatings from '@/components/Ratings.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxFlag from '@/components/Flag.vue';
import LxFlagItemDisplay from '@/components/itemDisplay/FlagItemDisplay.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxAppendableList from '@/components/forms/AppendableList.vue';
import LxRow from '@/components/forms/Row.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import LxTextInput from '@/components/TextInput.vue';
import { logError } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';

const emits = defineEmits([
  'actionClick',
  'update:searchString',
  'selectPage',
  'sortingChanged',
  'selectionChanged',
  'itemsPerPageChanged',
  'selectionActionClicked',
  'toolbarActionClicked',
  'emptyStateActionClick',
  'searched',
]);

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
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
  scrollable: { type: [Boolean, String], default: 'auto' }, // 'auto', true, false
  stickyHeader: { type: Boolean, default: true },
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
  toolbarActionDefinitions: { type: Array, default: () => [] },
  emptyStateActionDefinitions: { type: Array, default: null },
  emptyStateIcon: { type: String, default: '' },
  clickableRole: { type: String, default: 'link' }, // 'link' or 'button'
  hasSearch: { type: Boolean, default: false },
  searchMode: { type: String, default: 'default' }, // default, compact
  searchString: { type: String, default: '' },
  searchSide: { type: String, default: 'server' }, // server, TODO add client search
  texts: { type: Object, default: () => ({}) },
});

const query = ref(props.searchString);
const queryRaw = ref(props.searchString);

const modelSearchString = computed({
  get() {
    return props.searchString;
  },
  set(value) {
    emits('update:searchString', value);
  },
});

watch(modelSearchString, (newValue, oldValue) => {
  if (newValue !== oldValue) queryRaw.value = modelSearchString.value;
});

const debouncedSearchReq = useDebounceFn(async () => {
  nextTick(() => {
    modelSearchString.value = queryRaw.value;
  });
}, 200);

watch(
  queryRaw,
  async () => {
    await debouncedSearchReq();
  },
  { immediate: true }
);

const textsDefault = {
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
  firstPage: 'Pirmā lapa',
  nextPage: 'Nākamā lapa',
  previousPage: 'Iepriekšējā lapa',
  clear: 'Attīrīt izvēles',
  clearSearch: 'Notīrīt meklēšanas ievadi',
  itemsPerPage: 'Ierakstu skaits vienā lapā:',
  itemsPerPageLabel: 'ieraksti lapā',
  selectAllRows: 'Izvēlēties visu',
  noItems: 'Nav neviena ieraksta, ko attēlot',
  noItemsDescription: '',
  iconsResponsiveRowLabel: 'Ikonas',
  moreActions: 'Papildu darbības',
  actions: 'Darbības',
  openSearch: 'Atvērt meklētāju',
  closeSearch: 'Aizvērt meklētāju',
  personDisplay: {
    name: 'Vārds, uzvārds',
    description: 'Apraksts',
    role: 'Loma',
    institution: 'Iestāde',
  },
  placeholder: 'Ievadiet nosaukuma vai apraksta daļu, lai sameklētu ierakstus',
  search: 'Meklēt',
  close: 'Aizvērt',
  skipHeader: 'Pāriet uz tabulas datiem',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const searchField = ref(false);
const queryInputDefault = ref();
const sortedColumns = ref({});
const queryInputCompact = ref();

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
      attributeDescription: definition.attributeDescription,
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
  return value ? displayTexts.value.valueYes : displayTexts.value.valueNo;
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
  const trimmedDisplayName = typeof displayName === 'string' ? displayName.trim() : displayName;
  const trimmedTitle = title?.trim();

  if (trimmedDisplayName && trimmedTitle) {
    return `${trimmedDisplayName}\r\n${trimmedTitle}`;
  }
  if (trimmedDisplayName) {
    return trimmedDisplayName;
  }
  if (trimmedTitle) {
    return trimmedTitle;
  }
  return '';
}

function getTextTooltip(col, row) {
  if (col.type === 'tooltip-text') {
    return row[col.attributeDescription] || row[col.attributeName];
  }

  if (col.type === 'bool' || col.type === 'boolean') {
    return formatBoolean(row[col.attributeName]);
  }

  return ['xs', 's', 'm'].includes(col.size) ? row[col.attributeName] : '';
}

function getAriaLabel(col, row) {
  if (col.kind === 'clickable') {
    return row[col.attributeDescription] || row[col.attributeName];
  }
  return '';
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
  return ret;
});

watch(selectedRows, (newVal) => {
  emits('selectionChanged', newVal);
});

function selectRow(id) {
  selectedRowsRaw.value = {};
  selectedRowsRaw.value[id] = true;
}

function cancelSelection() {
  selectedRowsRaw.value = {};

  nextTick(() => {
    if (selectedRows.value.length === 0) {
      document.getElementById(`${props.id}-toolbar-action-select-all`)?.focus();
    } else {
      document.getElementById(`${props.id}-select-all`)?.focus();
    }
  });
}

const processedToolbarActions = computed(() => {
  const {
    toolbarActionDefinitions,
    loading,
    busy,
    hasSearch,
    searchMode,
    hasSelecting,
    selectingKind,
  } = props;

  if (!toolbarActionDefinitions.length) return [];

  const withDefaults = (action, overrides = {}) => ({
    ...action,
    icon: action.icon ?? 'fallback-icon',
    area: action.area ?? 'right',
    kind: action.kind ?? 'ghost',
    variant: action.variant ?? 'icon-only',
    groupId: action.groupId ?? 'lx-default',
    disabled: loading || busy,
    ...overrides,
  });

  const withKindAndVariant = (action, overrides = {}) => ({
    ...action,
    kind: 'ghost',
    variant: 'icon-only',
    ...overrides,
  });

  const normalizedActions = toolbarActionDefinitions.map((action) => withDefaults(action));

  let rightmostAction = null;
  let demotedActions = [];

  const processGroup = (group) => {
    if (!group.length) return;

    const firstPrimary = group.find(
      (action) => action.area === 'right' && action.kind === 'primary'
    );
    const firstSecondary = group.find(
      (action) => action.area === 'right' && action.kind === 'secondary'
    );
    const firstAction = firstPrimary ?? firstSecondary;

    if (!firstAction) {
      demotedActions = group.map((action) => withKindAndVariant(action));
      return;
    }

    const restWithoutFirst = group.filter((action) => action.id !== firstAction.id);

    let defaults;
    if (firstAction?.area === 'right' && firstAction?.kind === 'secondary') {
      defaults = {
        kind: 'secondary',
        variant: 'default',
      };
    } else if (firstAction?.area !== 'left') {
      defaults = {
        kind: 'primary',
        variant: 'default',
      };
    } else {
      defaults = {
        kind: 'ghost',
        variant: 'icon-only',
      };
    }

    rightmostAction = withDefaults(firstAction, defaults);
    demotedActions = restWithoutFirst.map((action) => withKindAndVariant(action));
  };

  processGroup(normalizedActions);

  const result = [...demotedActions];
  if (rightmostAction) result.push(rightmostAction);

  if ((hasSearch && searchMode === 'compact') || (hasSearch && hasSelecting)) {
    result.push({
      id: 'search',
      name: searchField.value ? displayTexts.value.closeSearch : displayTexts.value.openSearch,
      icon: searchField.value ? 'close' : 'search',
      area: 'right',
      variant: 'icon-only',
      kind: 'ghost',
      groupId: 'lx-default',
      disabled: loading || busy,
      customClass: searchField.value ? 'toolbar-search-button is-expanded' : '',
    });
  }

  if (hasSelecting && selectingKind === 'multiple') {
    result.unshift({
      id: `select-all`,
      name: displayTexts.value.selectAllRows,
      icon: 'checkbox',
      area: 'left',
      variant: 'icon-only',
      kind: 'ghost',
      groupId: 'lx-select-all',
      disabled: loading || busy,
    });
  }

  return result;
});

const toolbarActions = computed(() => {
  if (selectedRows.value.length > 0) {
    return [];
  }
  return processedToolbarActions.value;
});

const selectIcon = computed(() => {
  if (selectedRows.value.length === props.items.length && props.selectingKind === 'multiple') {
    return 'checkbox-filled';
  }
  if (props.selectingKind === 'multiple') {
    return 'checkbox-indeterminate';
  }
  return 'radiobutton-filled';
});

function compareOrder(a, b, ascending, getOrder) {
  const orderA = getOrder(a);
  const orderB = getOrder(b);

  if (orderA && !orderB) {
    return ascending ? -1 : 1;
  }
  if (!orderA && orderB) {
    return ascending ? 1 : -1;
  }
  if (orderA && orderB) {
    return orderA - orderB;
  }
  return 0;
}

function getLowercaseString(value) {
  return value?.trim().toLowerCase() || '';
}

function isValidString(value) {
  return value && value.trim() !== '';
}

function compareExistence(aExists, bExists, ascending) {
  if (aExists && !bExists) {
    return ascending ? -1 : 1;
  }
  if (!aExists && bExists) {
    return ascending ? 1 : -1;
  }
  return 0;
}

function isItemEmpty(item, value, label) {
  if (typeof item === 'string') {
    return isValidString(item);
  }
  if (typeof item === 'object') {
    return (
      (isValidString(value) && isValidString(label)) ||
      (isValidString(value) && !isValidString(label))
    );
  }
  return true;
}

function compareFlagNames(nameA, nameB, hasNameOnlyA, hasNameOnlyB, ascending) {
  if (hasNameOnlyA && !hasNameOnlyB) {
    return ascending ? -1 : 1;
  }
  if (!hasNameOnlyA && hasNameOnlyB) {
    return ascending ? 1 : -1;
  }
  return new Intl.Collator('lv').compare(nameA, nameB);
}

function compareFlags(a, b, colCode, ascending) {
  const flagA = a[colCode];
  const flagB = b[colCode];

  const flagIdA = typeof flagA === 'string' ? flagA : flagA.id;
  const flagIdB = typeof flagB === 'string' ? flagB : flagB.id;

  const flagNameA = flagA.name;
  const flagNameB = flagB.name;

  const hasNameOnlyA = isValidString(flagNameA) && !isValidString(flagIdA);
  const hasNameOnlyB = isValidString(flagNameB) && !isValidString(flagIdA);

  const isFlagAEmpty = isItemEmpty(flagA, flagIdA, flagNameA);
  const isFlagBEmpty = isItemEmpty(flagB, flagIdB, flagNameB);

  const orderComparison = compareOrder(flagA, flagB, ascending, (i) => i.order);
  if (orderComparison !== 0) return orderComparison;

  // flags with names stay on top by default
  const nameComparison = compareExistence(flagNameA, flagNameB, ascending);
  if (nameComparison !== 0) return nameComparison;

  // icons that don't appear defined are at the bottom with icons that are ACTUALLY not defined
  const flagExistanceComparison = compareExistence(isFlagAEmpty, isFlagBEmpty, ascending);
  if (flagExistanceComparison !== 0) return flagExistanceComparison;

  // flags with only a name stay right below flags with names
  const nameOnlyComparison = compareFlagNames(
    flagNameA,
    flagNameB,
    hasNameOnlyA,
    hasNameOnlyB,
    ascending
  );
  if (nameOnlyComparison !== 0) return nameOnlyComparison;

  return new Intl.Collator('lv').compare(flagIdA, flagIdB);
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

function getFullName(person) {
  return isValidString(person.firstName) && isValidString(person.lastName)
    ? (getLowercaseString(person.firstName) + getLowercaseString(person.lastName)).replace(
        /\s/g,
        ''
      )
    : '';
}

function compareStructures(personA, personB, ascending) {
  if (Array.isArray(personA) && !Array.isArray(personB)) {
    return ascending ? -1 : 1;
  }
  if (!Array.isArray(personA) && Array.isArray(personB)) {
    return ascending ? 1 : -1;
  }
  return 0;
}

// compare persons, who are partially defined i.e. ones that don't have a full name, yet have a description,
// and persons, who have neither and appear undefined, but may have other attributes
function comparePartialExistance(nameA, descriptionA, nameB, descriptionB, ascending) {
  if (!nameA && descriptionA && !nameB && !descriptionB) {
    return ascending ? -1 : 1;
  }
  if (!nameA && !descriptionA && !nameB && descriptionB) {
    return ascending ? 1 : -1;
  }
  if (!nameA && !descriptionA && !nameB && !descriptionB) {
    return 0;
  }
  return 0;
}

function comparePersonsColumn(personA, personB, ascending) {
  const fullNameA = getFullName(personA);
  const fullNameB = getFullName(personB);

  const hasFullNameA = isValidString(fullNameA);
  const hasFullNameB = isValidString(fullNameB);

  const hasDescriptionA = isValidString(personA.description);
  const hasDescriptionB = isValidString(personB.description);

  // persons with full name are on top by default
  const fullNameComparison = compareExistence(hasFullNameA, hasFullNameB, ascending);
  if (fullNameComparison !== 0) return fullNameComparison;

  // person object arrays stay right below regular person objects
  const structureComparison = compareStructures(personA, personB, ascending);
  if (structureComparison !== 0) return structureComparison;

  // persons with descriptions, yet no name, stay above persons who don't appear defined
  const existanceComparison = comparePartialExistance(
    hasFullNameA,
    hasDescriptionA,
    hasFullNameB,
    hasDescriptionB,
    ascending
  );
  if (existanceComparison !== 0) return existanceComparison;

  const orderComparison = compareOrder(personA, personB, ascending, (p) => p.order);
  if (orderComparison !== 0) return orderComparison;

  if (hasFullNameA && hasFullNameB) {
    return new Intl.Collator('lv').compare(fullNameA, fullNameB);
  }
  return 0;
}

function sortPersonsArray(personsArray, ascending) {
  return personsArray.sort((a, b) => {
    const result = comparePersonsColumn(a, b, ascending);
    return ascending ? result : -result;
  });
}

function comparePersons(a, b, colCode, ascending) {
  const personA = a[colCode];
  const personB = b[colCode];

  if (Array.isArray(personA) && Array.isArray(personB)) {
    const sortedA = sortPersonsArray(personA, ascending);
    const sortedB = sortPersonsArray(personB, ascending);

    return comparePersonsColumn(sortedA[0], sortedB[0]);
  }
  return comparePersonsColumn(personA, personB, ascending);
}

function compareIconLabels(labelA, labelB, ascending) {
  if (labelA && !labelB) {
    return ascending ? -1 : 1;
  }
  if (!labelA && labelB) {
    return ascending ? 1 : -1;
  }
  if (labelA && labelB) {
    return new Intl.Collator('lv').compare(labelA.toLowerCase(), labelB.toLowerCase());
  }
  return 0;
}

function compareIcons(a, b, colCode, ascending) {
  const iconA = a[colCode];
  const iconB = b[colCode];

  const iconNameA = typeof iconA === 'string' ? iconA : iconA.icon;
  const iconNameB = typeof iconB === 'string' ? iconB : iconB.icon;

  const labelA = iconA.label;
  const labelB = iconB.label;

  const isIconAEmpty = isItemEmpty(iconA, iconNameA, labelA);
  const isIconBEmpty = isItemEmpty(iconB, iconNameB, labelB);

  const orderComparison = compareOrder(iconA, iconB, ascending, (i) => i.order);
  if (orderComparison !== 0) return orderComparison;

  // icons with labels show on top by default
  const labelComparison = compareIconLabels(labelA, labelB, ascending);
  if (labelComparison !== 0) return labelComparison;

  // icons that don't appear defined are at the bottom with icons that are ACTUALLY not defined
  const iconExistanceComparison = compareExistence(isIconAEmpty, isIconBEmpty, ascending);
  if (iconExistanceComparison !== 0) return iconExistanceComparison;

  const valueA = (typeof iconA === 'object' ? iconA.icon : iconA) || '';
  const valueB = (typeof iconB === 'object' ? iconB.icon : iconB) || '';
  return new Intl.Collator('lv').compare(valueA, valueB);
}
function compareBoolean(a, b, colCode) {
  const aBool = a[colCode];
  const bBool = b[colCode];

  if (aBool && !bBool) {
    return -1;
  }
  if (!aBool && bBool) {
    return 1;
  }
  return 0;
}

function defaultComparison(a, b, colCode) {
  if (props.sortingMode === 'default') {
    return new Intl.Collator('lv').compare(
      a[colCode]?.toString().toLowerCase(),
      b[colCode]?.toString().toLowerCase()
    );
  }
  if (props.sortingMode === 'strip') {
    return compareStrip(a, b, colCode);
  }
  return 0;
}

function compare(ascending) {
  return function (a, b) {
    let ret = 0;
    const colCode = Object.keys(sortedColumns.value)[0];
    const colDefinition = columnsComputed.value.find((item) => item.id === colCode);
    if (colDefinition.type !== 'bool' && colDefinition.type !== 'boolean') {
      if (!a[colCode] && props.sortingIgnoreEmpty) {
        return 1;
      }
      if (!b[colCode] && props.sortingIgnoreEmpty) {
        return -1;
      }
    }

    switch (colDefinition.type) {
      case 'person':
        ret = comparePersons(a, b, colCode, ascending);
        break;
      case 'icon':
        ret = compareIcons(a, b, colCode, ascending);
        break;
      case 'number':
      case 'decimal':
      case 'float':
        ret = compareNumber(a, b, colCode);
        break;
      case 'flag':
      case 'country':
        ret = compareFlags(a, b, colCode, ascending);
        break;
      case 'bool':
      case 'boolean':
        ret = compareBoolean(a, b, colCode);
        break;
      default:
        ret = defaultComparison(a, b, colCode);
        break;
    }

    return ascending ? ret : -ret;
  };
}

const rows = computed(() => {
  if (props.items) {
    let ret = JSON.parse(JSON.stringify([...props.items]));

    const colCode = Object.keys(sortedColumns.value)[0];
    if (sortedColumns.value[colCode] && props.sortingSide === 'client') {
      if (sortedColumns.value[colCode] === 'asc') {
        ret = ret.sort(compare(true));
      } else {
        ret = ret.sort(compare(false));
      }
    }
    if (ret.length !== new Set(ret.map((x) => x[props.idAttribute])).size) {
      logError(
        `DataGrid: Duplicate row IDs found in items. Please ensure that each item has a unique ID for the attribute "${props.idAttribute}".`,
        useLx().getGlobals()?.environment
      );
    }
    return ret;
  }
  return [];
});

const pagesTotal = computed(() => Math.ceil(props.itemsTotal / props.itemsPerPage));
const itemsLabel = computed(() => {
  const num = rows.value.length;
  let numDisplay = num.toString();
  let label = displayTexts.value.items.plural;
  if (props.hasPaging && pagesTotal.value) {
    const numStarting = props.pageCurrent * props.itemsPerPage + 1;
    let numEnding =
      Number(props.pageCurrent) * Number(props.itemsPerPage) + Number(props.itemsPerPage);
    if (numEnding > props.itemsTotal) numEnding = props.itemsTotal;
    numDisplay = `${numStarting}-${numEnding}`;

    return `${displayTexts.value.ofItems.label} ${numDisplay} ${displayTexts.value.of} ${props.itemsTotal}`;
  }
  if (num === 1) {
    label = displayTexts.value.items.singular;
  } else if (num > 20 && (num % 10 === 2 || num % 10 === 3 || num % 10 === 4)) {
    label = displayTexts.value.items.endingWith234;
  } else if (num > 11 && num % 10 === 1) {
    label = displayTexts.value.items.endingWith1;
  }
  return `${numDisplay} ${label}`;
});
const selectedLabel = computed(() => {
  const num = selectedRows.value.length;
  const numDisplay = num.toString();
  let label = displayTexts.value.items.plural;
  let labelStart = displayTexts.value.selected.plural;
  let ret = numDisplay;

  if (num === 1) {
    label = displayTexts.value.items.singular;
    labelStart = displayTexts.value.selected.singular;
  } else if (num > 20 && (num % 10 === 2 || num % 10 === 3 || num % 10 === 4)) {
    label = displayTexts.value.items.endingWith234;
    labelStart = displayTexts.value.selected.endingWith234;
  } else if (num > 11 && num % 10 === 1) {
    label = displayTexts.value.items.endingWith1;
    labelStart = displayTexts.value.selected.endingWith1;
  }
  ret = `${labelStart} ${numDisplay} ${label} ${displayTexts.value.of} ${props.itemsTotal}`;

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

function getAriaSorting(sortDirection) {
  if (sortDirection === 'asc') return 'ascending';
  if (sortDirection === 'desc') return 'descending';
  return 'none';
}

const autoSearchMode = computed(() => {
  if (props.searchMode === 'compact') {
    return 'compact';
  }
  if (props.searchMode === 'default' && !props.hasSelecting) {
    return 'default';
  }
  return 'compact';
});

function toggleSearch() {
  query.value = '';
  queryRaw.value = '';

  searchField.value = !searchField.value;
  nextTick(() => {
    if (searchField.value && autoSearchMode.value === 'default') {
      queryInputDefault.value.focus();
    } else if (searchField.value && autoSearchMode.value === 'compact') {
      queryInputCompact.value.focus();
    }
  });
}

function toolbarClick(action) {
  if (action === 'select-all') selectRows();
  else if (action === 'checkNone' || action === 'checkIndeterminate') cancelSelection();
  else if (action === 'search' || action === 'close') toggleSearch();
  else if (selectedRows.value.length === 0) {
    emits('toolbarActionClicked', action);
  } else selectionActionClicked(action, selectedRows.value);
}

const actionDefinitionsGroup = computed(() => props.actionDefinitions?.slice(1));

function emptyStateActionClicked(actionName) {
  emits('emptyStateActionClick', actionName);
}

const shouldShowIconRow = computed(() => {
  const iconColumns = columnsComputed.value?.filter((col) => col.type === 'icon');
  const extraIconColumns = iconColumns?.filter((col) => col.kind === 'extra');
  return (
    iconColumns.length > 0 &&
    (props.showAllColumns || extraIconColumns.length !== iconColumns.length)
  );
});

const gridColumnWidths = {
  xs: 'minmax(4rem, 1fr)',
  s: 'minmax(10rem, 2.5fr)',
  m: 'minmax(12rem, 3fr)',
  l: 'minmax(20rem, 5fr)',
  xl: 'minmax(30rem, 7.5fr)',
  '*': 'minmax(auto, 20fr)',
};

const gridTemplateColumns = ref('');
const skeletonGridTemplateColumns = ref('6rem 12rem auto');

function modifyColumn(templateColumns, condition, columnValue, prepend) {
  const index = templateColumns.indexOf(columnValue);
  if (condition && index === -1) {
    if (prepend) {
      templateColumns.unshift(columnValue);
    } else {
      templateColumns.push(columnValue);
    }
  } else if (!condition && index !== -1) {
    templateColumns.splice(index, 1);
  }
}

function updateGridTemplateColumns() {
  const templateColumns = columnsComputed.value
    .filter((col) => props.showAllColumns || col.kind !== 'extra')
    .map((col) => gridColumnWidths[col.size] || 'auto');

  const actionColumnWidth = props.actionDefinitions?.length > 1 ? '5rem' : '2.5rem';

  modifyColumn(templateColumns, hasActionButtons.value, actionColumnWidth, false);
  modifyColumn(templateColumns, props.hasSelecting, '3rem', true);

  gridTemplateColumns.value = templateColumns.join(' ');
}

const header = ref(null);
const container = ref(null);
const { width, height } = useWindowSize();

const autoScrollable = ref(false);

function syncHeaderScroll() {
  if (header.value && container.value) {
    header.value.scrollLeft = container.value.scrollLeft;
  }
}

function restrictScroll(e) {
  // TEMPORARY FIX: Prevent horizontal scrolling on the header (still scrolls but snaps back)
  e.preventDefault();
  syncHeaderScroll();
}

function syncColumnWidths() {
  if (!header.value || !container.value) return;

  if (props.loading) container.value.style.gridTemplateColumns = 'auto';
  autoScrollable.value = false;

  // without this if, totalWidth will be calculate assuming its possible to scroll and * size columns will be too wide
  if (props.scrollable === 'auto') {
    container.value.classList.remove('lx-scrollable');
  }

  const { children } = header.value;
  let totalWidth = 0;

  Array.from(children).forEach((child) => {
    totalWidth += child.offsetWidth;
  });

  if (totalWidth > container.value.offsetWidth && props.scrollable === 'auto') {
    autoScrollable.value = true;
    container.value.style.gridTemplateColumns = 'auto';
    container.value.classList.add('lx-scrollable');
  } else {
    autoScrollable.value = false;
  }

  const headerColumns = Array.from(header.value.children).filter((col) => col.offsetWidth > 0);

  const columnWidths = headerColumns.map((col) => `${col.offsetWidth}px`).join(' ');

  container.value.style.gridTemplateColumns = columnWidths;
}

function calculateOffset(el) {
  const rowRems = getComputedStyle(el).getPropertyValue('--row-size').trim();
  const { fontSize } = getComputedStyle(el);

  return parseInt(rowRems, 10) * parseFloat(fontSize);
}

const bounding = useElementBounding(container);
const headerSize = useElementSize(header);

const topOutOfBounds = computed(() => {
  const keyOpacity = '--grid-top-shadow-opacity';
  const keySize = '--grid-header-size';
  const limit = 100;
  const headerHeight = headerSize.height?.value || 0;

  if (!container.value || !header.value) {
    return `${keyOpacity}: 0; ${keySize}: ${headerHeight}px;`;
  }

  const v = bounding.top ? bounding.top.value - calculateOffset(container.value) : 0;

  if (v < 0 - limit) {
    return `${keyOpacity}: 1; ${keySize}: ${headerHeight}px;`;
  }
  if (v < 0) {
    return `${keyOpacity}: ${(0 - v) / limit}; ${keySize}: ${headerHeight}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${headerHeight}px;`;
});

function serverSideSearch() {
  if (props.searchSide === 'server') emits('searched', foldToAscii(queryRaw.value));
}

function clear() {
  query.value = '';
  queryRaw.value = '';
  if (props.searchSide === 'server') serverSideSearch();
}

watch(
  [
    columnsComputed,
    () => hasActionButtons.value,
    () => props.showAllColumns,
    () => props.hasSelecting,
  ],
  () => {
    updateGridTemplateColumns();
    nextTick(() => {
      syncColumnWidths();
    });
  },
  { immediate: true }
);

watch(
  [() => props.scrollable, () => props.loading],
  () => {
    nextTick(() => {
      syncColumnWidths();
    });
  },
  { immediate: true }
);

watch([width, height], () => {
  nextTick(() => {
    syncColumnWidths();
  });
});

const dataGridWrapperRef = ref(null);

useMutationObserver(
  dataGridWrapperRef,
  (mutations) => {
    const mutation = mutations[0];

    if (mutation && mutation.attributeName === 'style' && mutation.target.style.display === '') {
      syncColumnWidths();
    }
  },
  { attributes: true, childList: false }
);

watch(
  () => props.items,
  () => {
    if (props.hasSelecting) {
      Object.keys(selectedRowsRaw.value).forEach((key) => {
        if (!props.items.find((x) => x[props.idAttribute].toString() === key)) {
          delete selectedRowsRaw.value[key];
        }
      });
    }
  }
);

onMounted(() => {
  if (props.items && !props.idAttribute) {
    throw new Error('"idAttribute" prop is required on DataGrid Component');
  }
});

const focusableElementsCount = computed(() => {
  const mainElement = container.value;
  const focusableSelectors = [
    'a:not([disabled])',
    'button:not([disabled])',
    'input:not([disabled])',
    '[tabindex="0"]',
  ];
  if (mainElement) {
    return Array.from(mainElement.querySelectorAll(focusableSelectors.join(', '))).filter(
      (el) => el.offsetParent !== null
    ).length;
  }
  return 0;
});

function skipHeader() {
  const mainElement = container.value;

  const focusableSelectors = [
    'a:not([disabled])',
    'button:not([disabled])',
    'input:not([disabled])',
    '[tabindex="0"]',
  ];

  if (mainElement) {
    const focusableElements = Array.from(
      mainElement.querySelectorAll(focusableSelectors.join(', '))
    );
    const firstVisibleElement = focusableElements.find((element) => element.offsetParent !== null);

    if (firstVisibleElement) {
      firstVisibleElement.focus();
    }
  }
}

defineExpose({ cancelSelection, selectRows, sortBy });
</script>
<template>
  <div
    class="lx-data-grid-wrapper"
    :style="`${topOutOfBounds}`"
    :class="[{ 'lx-grid-sticky': stickyHeader }]"
    ref="dataGridWrapperRef"
  >
    <header v-if="showHeader">
      <div class="heading-2" :id="`${id}-label`">{{ label }}</div>
      <p :id="`${id}-description`" class="lx-description">{{ description }}</p>
    </header>
    <div :class="[{ 'lx-selection-toolbar': hasSelecting && selectedRows && selectedRows.length }]">
      <LxToolbar
        :id="`${props.id}-toolbar`"
        :actionDefinitions="toolbarActions"
        :disabled="props.busy"
        :loading="props.loading"
        :class="[{ 'lx-grid-toolbar': true }]"
        @actionClick="toolbarClick"
      >
        <template #leftArea>
          <slot
            name="leftToolbar"
            v-if="(hasSelecting && selectedRows?.length === 0) || !hasSelecting"
          />
          <LxButton
            v-if="
              toolbarActions.length === 0 &&
              selectedRows.length === 0 &&
              hasSelecting &&
              selectingKind === 'multiple'
            "
            :id="`${id}-select-all`"
            icon="checkbox"
            kind="ghost"
            :disabled="loading || busy"
            variant="icon-only"
            :label="displayTexts.selectAllRows"
            @click="selectRows()"
          />
          <LxButton
            :id="`${id}-cancel-select-all`"
            v-if="hasSelecting && selectedRows.length > 0"
            :icon="selectIcon"
            variant="icon-only"
            :label="displayTexts.clearSelected"
            kind="ghost"
            :disabled="loading || busy"
            @click="cancelSelection()"
          />
          <p v-if="hasSelecting && selectedRows && selectedRows.length !== 0">
            {{ selectedLabel }}
          </p>
          <div
            v-if="hasSearch && !hasSelecting && autoSearchMode === 'default'"
            class="lx-search-wrapper"
          >
            <LxTextInput
              v-if="hasSearch"
              ref="queryInputDefault"
              v-model="queryRaw"
              :kind="props.searchSide === 'server' ? 'default' : 'search'"
              :disabled="loading || busy"
              :placeholder="displayTexts.placeholder"
              role="search"
              @keydown.enter="serverSideSearch()"
            />
            <LxButton
              v-if="props.searchSide === 'server' && hasSearch"
              icon="search"
              kind="ghost"
              :busy="busy"
              :loading="loading"
              variant="icon-only"
              :label="displayTexts.search"
              @click="serverSideSearch()"
            />
            <LxButton
              v-if="query || queryRaw"
              icon="clear"
              kind="ghost"
              :busy="busy"
              :loading="loading"
              variant="icon-only"
              :label="displayTexts.clearSearch"
              :disabled="loading || busy"
              @click="clear()"
            />
          </div>
        </template>

        <template
          #rightArea
          v-if="(!hasSelecting && props.showToolbar) || (hasSelecting && selectedRows.length === 0)"
        >
          <div class="lx-slot-wrapper">
            <slot name="toolbar" />
          </div>
          <template v-if="props.toolbarActionDefinitions?.length === 0">
            <div
              v-if="hasSearch && (hasSelecting || autoSearchMode === 'compact')"
              class="toolbar-search-button"
              :class="[{ 'is-expanded': searchField }]"
            >
              <LxButton
                kind="ghost"
                variant="icon-only"
                :icon="searchField ? 'close' : 'search'"
                :label="searchField ? displayTexts.closeSearch : displayTexts.openSearch"
                :search-field="searchField"
                :disabled="loading || busy"
                @click="toggleSearch"
              />
            </div>
          </template>
        </template>

        <template #rightArea v-else-if="hasSelecting && selectedRows.length > 0">
          <div class="selection-action-button-toolbar">
            <div class="selection-action-buttons">
              <LxButton
                v-for="selectAction in selectionActionDefinitions"
                :key="selectAction.id"
                :icon="selectAction.icon"
                :label="selectAction.name"
                :destructive="selectAction.destructive"
                :disabled="selectAction.disabled || busy || loading"
                kind="ghost"
                @click="selectionActionClicked(selectAction.id, selectedRows)"
              />
            </div>
            <div
              class="selection-action-buttons-small"
              v-if="selectionActionDefinitions?.length > 0"
            >
              <LxDropDownMenu
                :actionDefinitions="selectionActionDefinitions"
                @actionClick="(id) => selectionActionClicked(id, selectedRows)"
              >
                <LxButton
                  icon="menu"
                  kind="ghost"
                  :label="displayTexts.overflowMenu"
                  variant="icon-only"
                  :disabled="loading || busy"
                />
              </LxDropDownMenu>
            </div>
          </div>
          <div
            v-if="hasSearch && (hasSelecting || autoSearchMode === 'compact')"
            class="toolbar-search-button"
            :class="[{ 'is-expanded': searchField }]"
          >
            <LxButton
              kind="ghost"
              variant="icon-only"
              :icon="searchField ? 'close' : 'search'"
              :label="searchField ? displayTexts.closeSearch : displayTexts.openSearch"
              :search-field="searchField"
              :disabled="loading || busy"
              @click="toggleSearch"
            />
          </div>
        </template>

        <template #secondRow>
          <div
            class="second-row"
            v-if="hasSearch && searchField && autoSearchMode === 'compact'"
            :class="[{ 'second-row-selecting': hasSelecting }]"
          >
            <LxTextInput
              v-if="hasSearch"
              ref="queryInputCompact"
              v-model="queryRaw"
              :kind="'default'"
              :disabled="loading || busy"
              :placeholder="displayTexts.placeholder"
              role="search"
              @keydown.enter="serverSideSearch()"
            />
            <div class="lx-group lx-slot-wrapper">
              <LxButton
                v-if="searchSide === 'server' && hasSearch"
                icon="search"
                kind="ghost"
                :busy="busy"
                :disabled="loading"
                variant="icon-only"
                :label="displayTexts.search"
                @click="serverSideSearch()"
              />
              <LxButton
                v-if="query || queryRaw"
                icon="clear"
                kind="ghost"
                :loading="loading"
                variant="icon-only"
                :label="displayTexts.clearSearch"
                :disabled="loading || busy"
                @click="clear()"
              />
            </div>
          </div>
        </template>
      </LxToolbar>
    </div>

    <div class="lx-grid-header-wrapper" aria-hidden="false">
      <div
        class="lx-skip-link-wrapper"
        v-if="columnsComputed.length > 0 && rows.length > 0 && focusableElementsCount > 0"
      >
        <LxButton :label="displayTexts.skipHeader" @click="skipHeader" />
      </div>
      <div
        ref="header"
        class="lx-grid-row"
        role="toolbar"
        :style="{ gridTemplateColumns: !loading ? gridTemplateColumns : '' }"
        @scroll="restrictScroll"
      >
        <div v-if="hasSelecting" class="lx-cell-header lx-cell-selector" role="columnheader"></div>
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
        <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus-->
        <div
          v-for="col in columnsComputed"
          :key="col.id"
          :title="formatTooltip(col.name, col.title)"
          class="lx-cell-header"
          :aria-sort="getAriaSorting(sortedColumns[col.id])"
          :aria-label="formatTooltip(col.name, col.title)"
          :tabindex="hasSorting ? '0' : '-1'"
          role="button"
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
          ]"
          @click="sortColumn(col.id)"
          @keyup.space.prevent="sortColumn(col.id)"
          @keyup.enter="sortColumn(col.id)"
        >
          <div>
            <p class="lx-primary" v-if="col.size !== 'xs'">{{ col.name }}</p>
            <LxIcon
              value="sort-down"
              v-if="sortedColumns[col.id] === 'desc'"
              :title="formatTooltip(col.name, col.title)"
            />
            <LxIcon
              value="sort-up"
              v-if="sortedColumns[col.id] === 'asc'"
              :title="formatTooltip(col.name, col.title)"
            />
            <LxIcon
              value="sort-default"
              v-if="!sortedColumns[col.id]"
              :title="formatTooltip(col.name, col.title)"
            />
          </div>
        </div>
        <div
          v-if="hasActionButtons"
          class="lx-cell-header lx-cell-action"
          role="columnheader"
          :title="displayTexts.actions"
        ></div>
      </div>
    </div>
    <article
      ref="container"
      :id="id"
      class="lx-data-grid"
      :class="[
        { 'lx-scrollable': scrollable === true || autoScrollable === true },
        { 'lx-data-grid-full': showAllColumns },
        { 'lx-loading': loading },
      ]"
      @scroll="syncHeaderScroll()"
    >
      <div
        class="lx-grid-table"
        v-show="!loading"
        role="table"
        :aria-labelledby="`${id}-label`"
        :aria-describedby="`${id}-description`"
      >
        <div class="lx-grid-header-hidden" role="row">
          <div v-if="hasSelecting" class="lx-cell-header" role="columnheader"></div>
          <div
            v-for="col in columnsComputed"
            :key="col.id"
            :aria-label="formatTooltip(col.name, col.title)"
            role="columnheader"
          >
            {{ col.name }}
          </div>
          <div v-if="hasActionButtons" role="columnheader"></div>
        </div>

        <div class="lx-grid-content">
          <TransitionGroup
            tag="div"
            name="data-grid"
            class="lx-grid-row"
            :class="[{ 'lx-selected': selectedRowsRaw[row[idAttribute]] && hasSelecting }]"
            :id="`row-${row[idAttribute]}`"
            v-for="row in rows"
            tabindex="0"
            role="row"
            :key="row[idAttribute]"
            @dblclick="defaultActionClicked(row[idAttribute], row)"
          >
            <div v-if="hasSelecting" class="lx-cell lx-cell-selector" role="cell">
              <LxCheckbox
                v-if="selectingKind === 'multiple'"
                :id="`select-${id}-${row[idAttribute]}`"
                v-model="selectedRowsRaw[row[idAttribute]]"
                :value="row[idAttribute]?.toString()"
                :disabled="isDisabled"
              />
              <LxRadioButton
                v-if="selectingKind === 'single'"
                :id="`select-${id}-${row[idAttribute]}`"
                v-model="selectedRowsRaw[row[idAttribute]]"
                :value="row[idAttribute]?.toString()"
                :disabled="isDisabled"
                @click="selectRow(row[idAttribute])"
              />
            </div>
            <!-- Since key events are assigned to the whole <div> (lx-grid-row) already -->
            <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
            <div
              v-for="col in columnsComputed"
              :key="col.id"
              class="lx-cell"
              role="cell"
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
              <span
                v-if="
                  col.type !== 'state' &&
                  col.type !== 'rating' &&
                  col.type !== 'array' &&
                  col.type !== 'flag' &&
                  col.type !== 'country' &&
                  col.type !== 'person' &&
                  col.type !== 'icon'
                "
                :aria-label="getAriaLabel(col, row)"
                :title="getTextTooltip(col, row)"
                :class="{
                  'lx-cell-tooltip':
                    col.type === 'tooltip-text' || ['xs', 's', 'm'].includes(col.size),
                  'lx-cell-clickable-button':
                    props.clickableRole === 'button' && col.kind === 'clickable',
                }"
                :role="col.kind === 'clickable' ? props.clickableRole : null"
                :tabindex="col.kind === 'clickable' ? 0 : null"
                @click="
                  defaultActionName && col.kind === 'clickable' && !isDisabled
                    ? defaultActionClicked(row[idAttribute], row)
                    : null
                "
                @keyup.space="
                  defaultActionName ? defaultActionClicked(row[idAttribute], row) : null
                "
                @keyup.enter="
                  defaultActionName ? defaultActionClicked(row[idAttribute], row) : null
                "
              >
                {{ formatValue(row[col.attributeName], col.type, col.options?.fractionDigits) }}
              </span>

              <LxStateDisplay
                v-if="col.type === 'state'"
                :value="row[col?.attributeName]"
                :dictionary="col?.dictionary ? col?.dictionary : col?.options"
              />
              <LxRatings
                v-if="col.type === 'rating'"
                :disabled="props.busy"
                mode="read"
                v-model="row[col.attributeName]"
              />
              <template v-if="col.type === 'icon'">
                <template
                  v-if="
                    isObject(row?.[col?.attributeName]) && !isValueEmpty(row?.[col?.attributeName])
                  "
                >
                  <div
                    class="lx-grid-icon-wrapper"
                    :class="{
                      'lx-icon-has-tooltip':
                        row?.[col?.attributeName]?.title || row?.[col?.attributeName]?.label,
                    }"
                    :title="row?.[col?.attributeName]?.title || row?.[col?.attributeName]?.label"
                  >
                    <template
                      v-if="
                        isValidString(row?.[col?.attributeName]?.icon) ||
                        isValidString(row?.[col?.attributeName]?.label)
                      "
                    >
                      <LxIcon
                        :value="
                          isValidString(row?.[col?.attributeName]?.icon)
                            ? row?.[col?.attributeName]?.icon
                            : 'default'
                        "
                        :icon-set="row?.[col?.attributeName]?.iconSet"
                        :title="
                          row?.[col?.attributeName]?.title || row?.[col?.attributeName]?.label
                        "
                        :customClass="`lx-grid-column-icon ${row?.[col?.attributeName]?.category}`"
                      />
                      <p
                        v-if="col.size !== 'xs' && isValidString(row?.[col?.attributeName]?.label)"
                        class="lx-grid-icon-text"
                      >
                        {{ row?.[col?.attributeName].label }}
                      </p>
                    </template>
                    <span class="empty-icon-value" v-else>—</span>
                  </div>
                </template>
                <template
                  v-else-if="
                    !isObject(row?.[col?.attributeName]) && !isValueEmpty(row?.[col?.attributeName])
                  "
                >
                  <div class="lx-grid-icon-wrapper">
                    <LxIcon :value="row?.[col?.attributeName]" customClass="lx-grid-column-icon" />
                  </div>
                </template>
                <span class="empty-icon-value" v-else>—</span>
              </template>

              <template v-if="col.type === 'flag' || col.type === 'country'">
                <div
                  class="flag-column"
                  v-if="
                    typeof row[col.attributeName] === 'string' &&
                    isValidString(row[col.attributeName])
                  "
                >
                  <LxFlag size="small" :value="row[col.attributeName]" />
                </div>
                <div class="flag-column" v-else-if="typeof row[col.attributeName] === 'object'">
                  <LxFlagItemDisplay
                    :value="row[col.attributeName]"
                    nameAttribute="name"
                    idAttribute="id"
                  />
                </div>
                <span class="empty-flag-value" v-else>—</span>
              </template>

              <LxPersonDisplay
                v-if="col.type === 'person'"
                :value="row[col.attributeName]"
                :texts="row[col.attributeName]?.texts || displayTexts.personDisplay"
                size="s"
              />
              <template v-if="col.type === 'array'">
                <LxInfoWrapper
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
                </LxInfoWrapper>
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
            </div>

            <div
              class="lx-cell-action"
              role="cell"
              :class="[{ 'show-cell-borders': scrollable === true || autoScrollable === true }]"
              v-if="hasActionButtons"
            >
              <div class="lx-toolbar" v-if="actionDefinitions.length <= 2" role="toolbar">
                <LxButton
                  v-for="action in actionDefinitions"
                  :id="`${id}-${row[idAttribute]}-action-${action.id}`"
                  :key="action.id"
                  kind="ghost"
                  tabindex="0"
                  :icon="action.icon"
                  variant="icon-only"
                  :label="action.name"
                  :destructive="action.destructive"
                  :busy="action.busy"
                  :disabled="
                    isDisabled || action.enableByAttribute ? !row[action.enableByAttribute] : false
                  "
                  @click="actionClicked(action.id, row[idAttribute], actionAdditionalParameter)"
                />
              </div>
              <div class="lx-toolbar" v-if="actionDefinitions.length > 2" role="toolbar">
                <LxButton
                  :id="`${id}-${row[idAttribute]}-action-${actionDefinitions?.[0]?.id}`"
                  kind="ghost"
                  tabindex="0"
                  :icon="actionDefinitions?.[0]?.icon"
                  variant="icon-only"
                  :label="actionDefinitions?.[0]?.name"
                  :destructive="actionDefinitions?.[0]?.destructive"
                  :busy="actionDefinitions?.[0]?.busy"
                  :disabled="
                    isDisabled || actionDefinitions?.[0]?.enableByAttribute
                      ? !row[actionDefinitions?.[0]?.enableByAttribute]
                      : false
                  "
                  @click="
                    actionClicked(
                      actionDefinitions?.[0]?.id,
                      row[idAttribute],
                      actionAdditionalParameter
                    )
                  "
                />

                <LxDropDownMenu placement="left-start">
                  <div class="lx-toolbar">
                    <LxButton
                      :id="`${id}-${row[idAttribute]}-action`"
                      icon="overflow-menu"
                      kind="ghost"
                      :disabled="isDisabled"
                      :label="displayTexts.moreActions"
                      variant="icon-only"
                    />
                  </div>

                  <template v-slot:panel>
                    <div class="lx-button-set">
                      <LxButton
                        v-for="action in actionDefinitionsGroup"
                        :id="`${id}-${row[idAttribute]}-action-${action.id}`"
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
                        @click="
                          actionClicked(action.id, row[idAttribute], actionAdditionalParameter)
                        "
                      />
                    </div>
                  </template>
                </LxDropDownMenu>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div
        class="lx-skeleton lx-grid-table"
        v-show="loading"
        :aria-labelledby="`${id}-label`"
        :aria-describedby="`${id}-description`"
        :style="{
          gridTemplateColumns: skeletonGridTemplateColumns,
        }"
      >
        <div class="lx-grid-row">
          <div class="lx-cell-header"><div class="lx-skeleton-placeholder"></div></div>
          <div class="lx-cell-header"><div class="lx-skeleton-placeholder"></div></div>
          <div class="lx-cell-header"><div class="lx-skeleton-placeholder"></div></div>
        </div>

        <div class="lx-grid-row" v-for="index in props.skeletonRowCount" :key="index">
          <div class="lx-cell lx-cell-s"><div class="lx-skeleton-placeholder"></div></div>
          <div class="lx-cell lx-cell-m"><div class="lx-skeleton-placeholder"></div></div>
          <div class="lx-cell lx-cell"><div class="lx-skeleton-placeholder"></div></div>
        </div>
      </div>
    </article>

    <LxEmptyState
      v-if="items?.length < 1 && !(loading || busy)"
      :label="displayTexts.noItems"
      :description="displayTexts.noItemsDescription"
      :icon="emptyStateIcon"
      :actionDefinitions="emptyStateActionDefinitions"
      @empty-state-action-click="emptyStateActionClicked"
    />

    <LxAppendableList
      :modelValue="rows"
      :expandable="true"
      :nameAttribute="primaryColumn()?.attributeName"
      kind="compact"
      :readOnly="true"
      :hasSelecting="hasSelecting"
      :selectingKind="selectingKind"
      :actionDefinitions="actionDefinitions"
      :force-uppercase="false"
      :columnCount="2"
      :defaultExpanded="false"
      :idAttribute="idAttribute"
      v-model:selectedValues="selectedRowsRaw"
      @selectionChanged="selectRows"
      @actionClick="(val, item) => actionClicked(val, item, actionAdditionalParameter)"
      :class="[{ 'lx-data-grid-full': showAllColumns }]"
    >
      <template #customItem="{ item }">
        <template v-if="$slots.customResponsiveItem">
          <slot name="customResponsiveItem" v-bind="{ item }" />
        </template>

        <template v-else>
          <LxRow
            :label="col.name"
            v-for="col in columnsComputed?.filter((col) => col.type !== 'icon')"
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
            <template v-if="col.type === 'array'">
              <LxInfoWrapper
                v-if="
                  item[col.attributeName] &&
                  item[col.attributeName].length >
                    (col.options?.displayItemsCount ? col.options?.displayItemsCount : 1)
                "
              >
                <div class="lx-indicator">
                  {{
                    formatValue(item[col.attributeName], col.type, col.options?.displayItemsCount)
                  }}
                </div>
                <template #panel>
                  <ul>
                    <li v-for="i in item[col.attributeName]" v-bind:key="i">
                      <div class="lx-row">
                        <p class="lx-data">{{ i }}</p>
                      </div>
                    </li>
                  </ul>
                </template>
              </LxInfoWrapper>
              <template
                v-else
                v-for="i in formatValue(
                  item[col.attributeName],
                  col.type,
                  col.options?.displayItemsCount
                )"
              >
                {{ `${i} ` }}</template
              >
            </template>
            <LxStateDisplay
              v-else-if="col.type === 'state'"
              :value="item[col?.attributeName]"
              :dictionary="col?.dictionary ? col?.dictionary : col?.options"
            />

            <LxRatings
              v-else-if="col.type === 'rating'"
              :disabled="props.busy"
              mode="read"
              v-model="item[col.attributeName]"
            />
            <template v-if="col.type === 'flag' || col.type === 'country'">
              <div
                class="flag-column"
                v-if="
                  typeof item[col.attributeName] === 'string' &&
                  item[col.attributeName].trim() !== ''
                "
              >
                <LxFlag size="small" :value="item[col.attributeName]" />
              </div>

              <div class="flag-column" v-else-if="typeof item[col.attributeName] === 'object'">
                <LxFlagItemDisplay
                  :value="item[col.attributeName]"
                  nameAttribute="name"
                  idAttribute="id"
                />
              </div>
              <span class="empty-flag-value" v-else>—</span>
            </template>

            <LxPersonDisplay
              v-else-if="col.type === 'person'"
              :value="item[col.attributeName]"
              :texts="item[col.attributeName]?.texts || displayTexts.personDisplay"
              size="s"
            />
          </LxRow>

          <LxRow
            v-if="shouldShowIconRow"
            class="lx-responsive-grid-icons-row"
            columnSpan="2"
            :label="displayTexts.iconsResponsiveRowLabel"
          >
            <div
              v-for="col in columnsComputed?.filter((col) => col.type === 'icon')"
              :key="col.id"
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
              <template
                v-if="
                  isObject(item?.[col?.attributeName]) && !isValueEmpty(item?.[col?.attributeName])
                "
              >
                <div
                  class="lx-grid-icon-wrapper"
                  :class="{
                    'lx-icon-has-tooltip':
                      item?.[col?.attributeName]?.title || item?.[col?.attributeName]?.label,
                  }"
                  :title="item?.[col?.attributeName]?.title || item?.[col?.attributeName]?.label"
                >
                  <LxIcon
                    :value="item?.[col?.attributeName]?.icon"
                    :icon-set="item?.[col?.attributeName]?.iconSet"
                    :title="item?.[col?.attributeName]?.title || item?.[col?.attributeName]?.label"
                    :customClass="`lx-grid-column-icon ${item?.[col?.attributeName]?.category}`"
                  />
                  <p v-if="col.size !== 'xs'" class="lx-grid-icon-text">
                    {{ item?.[col?.attributeName].label }}
                  </p>
                </div>
              </template>
              <template
                v-else-if="
                  !isObject(item?.[col?.attributeName]) && !isValueEmpty(item?.[col?.attributeName])
                "
              >
                <div class="lx-grid-icon-wrapper">
                  <LxIcon :value="item?.[col?.attributeName]" customClass="lx-grid-column-icon" />
                </div>
              </template>
              <span class="empty-icon-value" v-else>—</span>
            </div>
          </LxRow>
        </template>
      </template>
      <template #customHeader="{ item, expanded }" v-if="$slots.customResponsiveHeader">
        <slot name="customResponsiveHeader" v-bind="{ item, expanded }" />
      </template>
    </LxAppendableList>

    <footer class="lx-statusbar" v-if="showStatusbar">
      <div
        class="lx-group lx-group-paging count-selector"
        v-if="hasPaging && showItemsCountSelector && !loading"
      >
        {{ displayTexts.itemsPerPage }}
        <LxDropDownMenu>
          <div class="lx-chip">
            {{ itemsPerPage }}
            <LxIcon value="chevron-down" />
          </div>
          <template #panel>
            <div class="lx-button-set">
              <LxButton
                v-for="i in itemsCountSelector"
                :key="i"
                :label="`${i.toString()} ${displayTexts.itemsPerPageLabel}`"
                :disabled="itemsPerPage === i || isDisabled"
                @click="changeItemsPerPage(i)"
              />
            </div>
          </template>
        </LxDropDownMenu>
      </div>

      <div class="lx-group count-display" v-if="!loading">
        {{ itemsLabel }}
      </div>

      <div class="lx-group lx-group-paging" v-if="hasPaging && !loading">
        <LxButton
          :id="`${id}-action-first-page`"
          kind="ghost"
          icon="first-page"
          :label="displayTexts.firstPage"
          variant="icon-only"
          :disabled="pageCurrent < 1 || isDisabled"
          @click="selectFirstPage()"
        />
        <div class="lx-divider"></div>
        <LxButton
          :id="`${id}-action-previous-page`"
          kind="ghost"
          icon="previous-page"
          :label="displayTexts.previousPage"
          variant="icon-only"
          :disabled="pageCurrent < 1 || isDisabled"
          @click="selectPreviousPage"
        />
        <div class="lx-divider"></div>
        <LxButton
          :id="`${id}-action-next-page`"
          kind="ghost"
          icon="next-page"
          :label="displayTexts.nextPage"
          variant="icon-only"
          :disabled="Number(pageCurrent) + 1 >= Number(pagesTotal) || isDisabled"
          @click="selectNextPage"
        />
      </div>
    </footer>
  </div>
</template>
