<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import LxFilters from '@/components/Filters.vue';
import LxFormBuilder from '@/components/forms/FormBuilder.vue';
import { focusNextFocusableElement, getDisplayTexts } from '@/utils/generalUtils';
import { formatValue } from '@/utils/formatUtils';
import { formatDateTime, formatDate } from '@/utils/dateUtils';
import useLx from '@/hooks/useLx';
import { lxDevUtils } from '@/utils';

const props = defineProps({
  /**
   * The prop is used to bind a value to the component. It supports two-way data binding in Vue components.
   * @type {Object}
   * @default null
   * @since 1.9.0-beta.3
   */
  modelValue: { type: Object, default: null },
  /**
   * Defines the input fields for the filter.
   * @type {Object}
   * @default null
   * @since 1.9.0-beta.3
   */
  schema: { type: Object, default: null },
  /**
   * Indicates whether the component is in read-only mode.
   * @type {Boolean}
   * @default false
   * @since 1.9.0-beta.3
   */
  readOnly: { type: Boolean, default: false },
  /**
   * Determines whether the form will be built from modelValue or schema.
   * @type {String}
   * @default 'default'
   * @since 1.9.0-beta.3
   */
  mode: { type: String, default: 'default' }, // 'default' || 'no-schema' || 'mixed'
  /**
   * The default values for the filter component.
   * @type {Object}
   * @default null
   * @since 1.9.0-beta.3
   */
  defaultValues: { type: Object, default: null },
  /**
   * Indicates whether to use initial modelValue props values as default values.
   * @type {Boolean}
   * @default true
   * @since 1.9.0-beta.3
   */
  useDefaults: { type: Boolean, default: true },
  /**
   * The label for the filter component.
   * @type {String}
   * @default null
   * @since 1.9.0-beta.3
   */
  label: { type: String, default: null },
  /**
   * The description for the filter component.
   * @type {String}
   * @default null
   * @since 1.9.0-beta.3
   */
  description: { type: String, default: null },
  /**
   * Indicates whether the filter values differ from default values.
   * @type {Boolean}
   * @default undefined
   * @since 1.9.0-beta.3
   */
  usesFilters: { type: Boolean, default: undefined },
  /**
   * The kind of the filter buttons.
   * @type {String}
   * @default 'tertiary'
   * @since 1.9.0-beta.3
   */
  filterButtonKind: {
    type: String,
    default: 'tertiary',
  },
  /**
   * The number of columns for the filter component.
   * @type {Number}
   * @default 3
   * @since 1.9.0-beta.3
   */
  columnCount: { type: Number, default: 3 },
  /**
   * Indicates whether the filter component is expanded.
   * @type {Boolean}
   * @default undefined
   * @since 1.9.0-beta.3
   */
  expanded: { type: Boolean, default: undefined },
  /**
   * Indicates whether the filter component is disabled.
   * @type {Boolean}
   * @default false
   * @since 1.9.0-beta.3
   */
  disabled: { type: Boolean, default: false },
  /**
   * The list of fast filters.
   * @type {Array}
   * @default []
   * @since 1.9.0-beta.3
   */
  fastFilters: { type: Array, default: () => [] },
  /**
   * The attribute used to identify fast filters.
   * @type {String}
   * @default 'id'
   * @since 1.9.0-beta.3
   */
  fastIdAttribute: { type: String, default: 'id' },
  /**
   * The attribute used to name fast filters.
   * @type {String}
   * @default 'name'
   * @since 1.9.0-beta.3
   */
  fastNameAttribute: { type: String, default: 'name' },
  /**
   * Badge text to be displayed on the filter component.
   * @type {String}
   * @default ''
   * @since 1.9.0-beta.3
   */
  badge: { type: String, default: '' },
  /**
   * Badge icon to be displayed on the filter component inside badge.
   * @type {String}
   * @default ''
   * @since 1.9.0-beta.8
   */
  badgeIcon: { type: String, default: null },
  /**
   * The type of the badge.
   * @type {String}
   * @default 'default'
   * @since 1.9.0-beta.3
   */
  badgeType: { type: String, default: 'default' }, // default, good, info, warning, important
  /**
   * Badge title to be displayed on the filter badge when badge is provided.
   * @type {String}
   * @default ''
   * @since 1.9.0-beta.8
   */
  badgeTitle: {
    type: String,
    default: null,
    validator: (v, p) => {
      // If badge or badgeIcon is non-empty, badgeTitle must be non-empty
      if ((p.badge || p.badgeIcon) && !v) {
        lxDevUtils.logWarn(
          `Warning: LxFilterBuilder "badgeTitle" is required when "badge" or "badgeIcon" is provided!`,
          useLx().getGlobals()?.environment
        );
        return false;
      }
      return true;
    },
  },
  /**
   * The object containing text translations.
   * @type {Object}
   * @since 1.9.0-beta.3
   */
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits([
  'update:modelValue',
  'filter',
  'resetFilters',
  'fastFilterClick',
  'update:expanded',
  'rowActionClick',
]);

const defaultTexts = {
  filters: 'Filtri',
  search: 'Atlasīt',
  clear: 'Notīrīt',
  fastFiltersLabel: 'Ātrie filtri',
  required: 'Šis lauks ir obligāts',
  minimum: 'Vērtībai jābūt lielākai vai vienādai ar {0}',
  exclusiveMinimum: 'Vērtībai jābūt lielākai par {0}',
  maximum: 'Vērtībai jābūt mazākai vai vienādai ar {0}',
  exclusiveMaximum: 'Vērtībai jābūt mazākai par {0}',
  multipleOf: 'Vērtībai jādalās ar skaitli {0}',
  minLength: 'Vērtības garumam jābūt lielākam par {0}',
  maxLength: 'Vērtības garumam jābūt mazākam par {0}',
  pattern: 'Vērtība neatbilst regulārajai izteiksmei {0}',
  minItems: 'Jāizvēlas vismaz {0} vērtības',
  maxItems: 'Jāizvēlas ne vairāk kā {0} vērtības',
  uniqueItems: 'Izvēlētās vērtības nav unikālas',
  minProperties: 'Objektam jābūt vismaz {0} atribūtiem',
  maxProperties: 'Objektam jābut ne vairāk kā {0} atribūtiem',
  addElement: 'Pievienot elementu',
  saveElement: 'Pievienot elementu sarakstam',
  addObject: 'Pievienot objektu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, defaultTexts));

const model = computed({
  get() {
    if (!props.modelValue) return {};
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const formBuilder = ref();
const internalExpanded = ref(false);

const isExpanded = computed({
  get() {
    return props.expanded !== undefined ? props.expanded : internalExpanded.value;
  },
  set(value) {
    if (props.expanded !== undefined) emits('update:expanded', value);
    else internalExpanded.value = value;
  },
});

const filterElement = ref();

function filter() {
  isExpanded.value = false;

  focusNextFocusableElement(filterElement.value?.$el);
  emits('filter');
}

const initialModelValues = ref({});

const defaultValues = computed(() => {
  if (props.schema?.properties) {
    const res = Object.keys(props.schema?.properties).reduce((acc, key) => {
      acc[key] =
        props.defaultValues?.[key] ||
        (props.useDefaults ? initialModelValues.value?.[key] : undefined);
      return acc;
    }, {});
    return res;
  }
  return {};
});

function arraysEqual(arr1, arr2) {
  if (Array.isArray(arr1) && Array.isArray(arr2)) {
    if (arr1?.length !== arr2?.length) return false;
    for (let i = 0; i < arr1?.length; i = +1) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  return false;
}

function formatDateDescription(format, description, modelValueKey) {
  if (format === 'dateTime' || format === 'date-time')
    return `${description || ''}${formatDateTime(modelValueKey)}`;
  if (format === 'date') return `${description || ''}${formatDate(modelValueKey)}`;
  return `${description || ''}${modelValueKey}`;
}

function formatValuePicker(value, key) {
  if (value?.type === 'string') {
    // if enum then there is no nameAttribute to map to
    if (value?.enum) {
      return `${value?.lx?.filterDescription || ''}${model.value[key]}`;
    }
    if (value?.lx?.items) {
      return `${value?.lx?.filterDescription || ''}${
        value?.lx?.items?.find((x) => x?.[value?.lx?.idAttribute || 'id'] === model.value[key])?.[
          value?.lx?.nameAttribute || 'name'
        ]
      }`;
    }
  } else if (model.value?.[key]?.length > 0) {
    if (
      !arraysEqual(model.value?.[key], defaultValues.value?.[key]) &&
      model.value?.[key]?.length > 0
    ) {
      const desc =
        value?.lx?.filterDescription || (value?.title ? `${value?.title}: ` : `${key}: `);
      return `${desc}${model.value?.[key]?.length}`;
    }
  }
  return null;
}

function formatNoSchemaDescription(value, key) {
  if (value && value !== model.value?.[key]) {
    if (typeof model.value?.[key] === 'string') {
      return `${model.value?.[key]}`;
    }
    if (typeof model.value?.[key] === 'boolean') {
      return `${key}: ${formatValue(model.value[key], 'bool')}`;
    }
    if (Array.isArray(model.value?.[key])) {
      if (model.value?.[key]?.length > 0) return `${key}: ${model.value?.[key]?.length}`;
    }
    return `${model.value?.[key]}`;
  }
  return null;
}

function formatDescription(value, key) {
  switch (formBuilder.value?.componentSelect(value, key)) {
    case 'textInputDefault':
    case 'textInputInteger':
    case 'textArea':
      return `${value?.lx?.filterDescription || ''}${model.value[key]}`;

    case 'dateTimePicker':
      return formatDateDescription(value?.format, value?.lx?.filterDescription, model.value[key]);

    case 'toggle':
      return `${
        value?.lx?.filterDescription || (value?.title ? `${value?.title}: ` : `${key}: `)
      }${formatValue(model.value[key], 'bool')}`;

    case 'valuePicker':
      if (formatValuePicker(value, key)) {
        return formatValuePicker(value, key);
      }
      return null;
    case 'select':
    case 'arrayListModal':
    case 'arrayTable':
    case 'arrayTableModal':
    case 'appendableList':
    case 'smallAppendableList':
      if (
        !arraysEqual(model.value?.[key], defaultValues.value?.[key]) &&
        model.value?.[key]?.length > 0
      )
        return `${
          value?.lx?.filterDescription || (value?.title ? `${value?.title}: ` : `${key}: `)
        }${model.value?.[key]?.length}`;
      return null;

    case 'objectList':
    case 'objectButton':
    case 'dataBlock':
      if (value?.lx?.filterDescription) {
        return value.lx.filterDescription;
      }
      if (value?.title) {
        return value.title;
      }
      return key;

    default:
      return null;
  }
}

const filterDescription = computed(() => {
  if ((props.defaultValues && Object.keys(props.defaultValues)?.length > 0) || props.useDefaults) {
    if (props.schema?.properties && props.mode !== 'no-schema') {
      const res = Object.entries(props.schema?.properties).reduce((acc, [key, value]) => {
        if (
          model.value?.[key] !== null &&
          model.value?.[key] !== undefined &&
          model.value?.[key] !== '' &&
          model.value?.[key] !== defaultValues.value?.[key]
        ) {
          const formattedDesc = formatDescription(value, key);
          if (formattedDesc) acc.push(formattedDesc);
        }
        return acc;
      }, []);
      return res.join(', ');
    }
    if (props.mode === 'no-schema') {
      return Object.entries(initialModelValues.value)
        .reduce((acc, [key, value]) => {
          if (formatNoSchemaDescription(value, key))
            acc.push(formatNoSchemaDescription(value, key));

          return acc;
        }, [])
        ?.join(', ');
    }
  }

  return '';
});

onMounted(() => {
  initialModelValues.value = { ...props.modelValue };
});
</script>
<template>
  <LxFilters
    ref="filterElement"
    v-model:expanded="isExpanded"
    kind="form"
    :label="label"
    :description="description || (isExpanded ? '' : filterDescription)"
    :usesFilters="
      usesFilters === undefined ? !isExpanded && filterDescription?.length > 0 : usesFilters
    "
    :filterButtonKind="filterButtonKind"
    :disabled="disabled"
    :fastFilters="fastFilters"
    :fastIdAttribute="fastIdAttribute"
    :fastNameAttribute="fastNameAttribute"
    :badge="badge"
    :badge-icon="badgeIcon"
    :badge-type="badgeType"
    :badge-title="badgeTitle"
    :columnCount="columnCount || 3"
    :texts="displayTexts"
    @filter="filter"
    @resetFilters="() => emits('resetFilters')"
    @fast-filter-click="(e) => emits('fastFilterClick', e)"
  >
    <LxFormBuilder
      ref="formBuilder"
      :schema="schema"
      v-model="model"
      :readOnly="readOnly"
      :mode="mode"
      :texts="displayTexts"
      @rowActionClick="
        (action, value, schemaName, index) =>
          emits('rowActionClick', action, value, schemaName, index)
      "
    />
  </LxFilters>
</template>
