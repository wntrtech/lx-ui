<script setup>
import { computed, onMounted, ref, watch } from 'vue';

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
      firstPage: 'Pirmā lapa',
      nextPage: 'Nākamā lapa',
      previousPage: 'Iepriekšējā lapa',
      clear: 'Attīrīt izvēles',
      itemsPerPage: 'Ierakstu skaits vienā lapā:',
      itemsPerPageLabel: 'ieraksti lapā',
      selectAllRows: 'Izvēlēties visu',
      noItems: 'Nav neviena ieraksta, ko attēlot',
      noItemsDescription: '',
      iconsResponsiveRowLabel: 'Ikonas',
      moreActions: 'Papildu darbības',
      actions: 'Darbības',
      personDisplay: {
        name: 'Vārds, uzvārds',
        description: 'Apraksts',
        role: 'Loma',
        institution: 'Iestāde',
      },
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

function compareExistance(aExists, bExists, ascending) {
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
  const nameComparison = compareExistance(flagNameA, flagNameB, ascending);
  if (nameComparison !== 0) return nameComparison;

  // icons that don't appear defined are at the bottom with icons that are ACTUALLY not defined
  const flagExistanceComparison = compareExistance(isFlagAEmpty, isFlagBEmpty, ascending);
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
  const fullNameComparison = compareExistance(hasFullNameA, hasFullNameB, ascending);
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
  const iconExistanceComparison = compareExistance(isIconAEmpty, isIconBEmpty, ascending);
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

function getAriaSorting(sortDirection) {
  if (sortDirection === 'asc') return 'ascending';
  if (sortDirection === 'desc') return 'descending';
  return 'none';
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

const actionDefinitionsGroup = computed(() => props.actionDefinitions?.slice(1));

defineExpose({ cancelSelection, selectRows, sortBy });

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

watch(
  columnsComputed,
  () => {
    updateGridTemplateColumns();
  },
  { immediate: true }
);

watch(
  [() => props.showAllColumns, () => props.hasSelecting],
  () => {
    updateGridTemplateColumns();
  },
  { deep: true }
);
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
      role="presentation"
      :class="[
        { 'lx-scrollable': scrollable },
        { 'lx-data-grid-full': showAllColumns },
        { 'lx-loading': loading },
      ]"
      :style="{ gridTemplateColumns: !loading ? gridTemplateColumns : '' }"
    >
      <div
        class="lx-grid-table"
        v-show="!loading"
        role="table"
        :aria-labelledby="`${id}-label`"
        :aria-describedby="`${id}-description`"
      >
        <div class="lx-grid-row" role="row">
          <div
            v-if="hasSelecting"
            class="lx-cell-header lx-cell-selector"
            role="columnheader"
          ></div>
          <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
          <div
            v-for="col in columnsComputed"
            :key="col.id"
            :title="formatTooltip(col.name, col.title)"
            role="columnheader"
            class="lx-cell-header"
            :aria-sort="getAriaSorting(sortedColumns[col.id])"
            :aria-label="formatTooltip(col.name, col.title)"
            tabindex="0"
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
            @keyup.space.prevent="sortColumn(col.id)"
            @keyup.enter="sortColumn(col.id)"
          >
            <div>
              <p class="lx-primary" v-if="col.size !== 'xs'">{{ col.name }}</p>
              <lx-icon
                value="sort-down"
                v-if="sortedColumns[col.id] === 'desc'"
                :title="formatTooltip(col.name, col.title)"
              ></lx-icon>
              <lx-icon
                value="sort-up"
                v-if="sortedColumns[col.id] === 'asc'"
                :title="formatTooltip(col.name, col.title)"
              ></lx-icon>
              <lx-icon
                value="sort-default"
                v-if="!sortedColumns[col.id]"
                :title="formatTooltip(col.name, col.title)"
              ></lx-icon>
            </div>
          </div>
          <div
            v-if="hasActionButtons"
            class="lx-cell-header lx-cell-action"
            role="columnheader"
            :title="texts?.actions"
          ></div>
        </div>
        <div class="lx-grid-content">
          <transition-group
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
            @keyup.space="defaultActionName ? defaultActionClicked(row[idAttribute], row) : null"
            @keyup.enter="defaultActionName ? defaultActionClicked(row[idAttribute], row) : null"
          >
            <div v-if="hasSelecting" class="lx-cell lx-cell-selector" role="cell">
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
            </div>
            <!-- Since key events are assigned to the whole <div> (lx-grid-row) already -->
            <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
            <div
              v-for="col in columnsComputed"
              :key="col.id"
              class="lx-cell"
              role="cell"
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
                :texts="row[col.attributeName]?.texts || texts?.personDisplay"
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
            </div>
            <div
              class="lx-cell-action"
              role="cell"
              :class="[{ 'show-cell-borders': scrollable }]"
              v-if="hasActionButtons"
            >
              <div class="lx-toolbar" v-if="actionDefinitions.length <= 2" role="toolbar">
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
              <div class="lx-toolbar" v-if="actionDefinitions.length > 2" role="toolbar">
                <lx-button
                  kind="ghost"
                  tabindex="0"
                  :icon="actionDefinitions?.[0]?.icon"
                  :title="actionDefinitions?.[0]?.name"
                  :destructive="actionDefinitions?.[0]?.destructive"
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
                <lx-dropdown-menu placement="left-start">
                  <div class="lx-toolbar">
                    <lx-button
                      icon="overflow-menu"
                      kind="ghost"
                      :disabled="isDisabled"
                      :label="texts?.moreActions"
                      variant="icon-only"
                    />
                  </div>
                  <template v-slot:panel>
                    <div class="lx-button-set">
                      <lx-button
                        v-for="action in actionDefinitionsGroup"
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
                </lx-dropdown-menu>
              </div>
            </div>
          </transition-group>
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
              :texts="item[col.attributeName]?.texts || texts?.personDisplay"
              size="s"
            />
          </LxRow>
          <LxRow
            v-if="shouldShowIconRow"
            class="lx-responsive-grid-icons-row"
            columnSpan="2"
            :label="texts.iconsResponsiveRowLabel"
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
          :label="texts.firstPage"
          variant="icon-only"
          :disabled="pageCurrent < 1 || isDisabled"
          @click="selectFirstPage()"
        ></lx-button>
        <div class="lx-divider"></div>
        <lx-button
          kind="ghost"
          icon="previous-page"
          :label="texts.previousPage"
          variant="icon-only"
          :disabled="pageCurrent < 1 || isDisabled"
          @click="selectPreviousPage"
        ></lx-button>
        <div class="lx-divider"></div>
        <lx-button
          kind="ghost"
          icon="next-page"
          :label="texts.nextPage"
          variant="icon-only"
          :disabled="Number(pageCurrent) + 1 >= Number(pagesTotal) || isDisabled"
          @click="selectNextPage"
        ></lx-button>
      </div>
    </footer>
  </div>
</template>
