<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import LxRow from '@/components/forms/Row.vue';
import { generateUUID } from '@/utils/stringUtils';
import LxPlaceholder from '@/components/forms/Placeholder.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, minValue, maxValue, minLength, maxLength } from '@vuelidate/validators';
import { lxFormatUtils, lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';

import LxFormBuilderItem from '@/components/forms/FormBuilderItem.vue';
import LxStack from '@/components/Stack.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

/**
 * Component for building forms.
 *
 * @property {String} id - The unique identifier for the form builder component. If not provided, a UUID will be generated.
 * @property {Object} modelValue - The values of the forms input components.
 * @property {Object} schema - Determines rows layout.
 * @property {Boolean} readOnly - Determines whether the form is read-only.
 * @property {String} mode - Determines whether the form will be built from modelValue or schema. Can be 'default', 'no-schema' or 'mixed'.
 * @property {Object} texts - The object containing text translations for the form.
 *
 * @function validateModel - Validates the model against the schema.
 *
 * @example
 * <FormBuilder
 *   id="form-builder"
 *   v-model="formData"
 *   :schema="formSchema"
 *   :read-only="isReadOnly"
 *   mode="default"
 *   :texts="formTexts"
 * />
 */
const props = defineProps({
  /**
   * The unique identifier for the form builder component.
   * @type {String}
   * @default generateUUID()
   * @since 1.1.0
   */
  id: { type: String, default: () => generateUUID() },
  /**
   * The values of the forms input components.
   * @type {Object}
   * @default null
   * @since 1.1.0
   */
  modelValue: { type: Object, default: null },
  /**
   * Determines rows layout.
   * @type {Object}
   * @default null
   * @since 1.1.0
   */
  schema: { type: Object, default: null },
  /**
   * Determines whether the form is read-only.
   * @type {boolean}
   * @default false
   * @since 1.1.0
   */
  readOnly: { type: Boolean, default: false },
  /**
   * Determines whether the form will be built from modelValue or schema.
   *
   * @type {String}
   * @default 'default'
   * @since 1.1.3
   */
  mode: { type: String, default: 'default' }, // 'default' || 'no-schema' || 'mixed' || 'view-builder'
  /**
   * Determines invalidation messages for the form.
   *
   * @type {Object}
   * @default null
   * @since 1.9.0
   */
  validations: { type: Object, default: null },
  /**
   * The object containing text translations for the form.
   * @type {Object}
   * @default {}
   * @since 1.1.0
   */
  texts: { type: Object, default: () => {} },
});

const textsDefault = {
  required: 'Šis lauks ir obligāts',
  minimum: 'Vērtībai jābūt lielākai vai vienādai ar {0}',
  exclusiveMinimum: 'Vērtībai jābūt lielākai par {0}',
  maximum: `Vērtībai jābūt mazākai vai vienādai ar {0}`,
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
  deleteElement: 'Dzēst elementu',
  saveElement: 'Pievienot elementu sarakstam',
  addObject: 'Pievienot objektu',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue', 'rowActionClick', 'emit', 'filterBuilderFilter']);

const model = computed({
  get() {
    if (!props.modelValue) return {};
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

function isRequiredRow(rowIndex) {
  const find = props.schema?.required?.find((x) => x === rowIndex);
  if (!find) return false;
  return true;
}

const isSchemaValid = computed(() => {
  try {
    JSON.parse(JSON.stringify(props.schema));
  } catch (e) {
    return false;
  }
  return true;
});

function isNotDate(row) {
  return (
    row?.format !== 'date' &&
    row?.format !== 'time' &&
    row?.format !== 'date-time' &&
    row?.format !== 'year' &&
    row?.format !== 'month' &&
    row?.format !== 'month-year' &&
    row?.format !== 'quarters'
  );
}

function stringSelect(row) {
  if (
    (row?.type === 'string' &&
      row?.lx?.kind !== 'multiline' &&
      !row?.lx?.variant &&
      isNotDate(row) &&
      !row?.enum) ||
    (row?.type === 'number' && !row?.lx?.variant && isNotDate(row) && !row?.enum)
  )
    return 'textInputDefault';
  if (row?.type === 'string' && row?.lx?.kind === 'multiline') return 'textArea';
  if (row?.type === 'string' && !isNotDate(row)) return 'dateTimePicker';
  return '';
}

function arraySelect(row) {
  if (row?.type === 'array' && row?.lx?.displayType === 'list') return 'arrayList';
  if (row?.type === 'array' && row?.lx?.displayType === 'listModal') return 'arrayListModal';
  if (row?.type === 'array' && row?.lx?.displayType === 'table') return 'arrayTable';
  if (row?.type === 'array' && row?.lx?.displayType === 'tableModal') return 'arrayTableModal';
  if (Array.isArray(row?.lx?.items) || row?.enum) {
    return 'valuePicker';
  }
  if (row?.items?.properties && row?.type === 'array') return 'appendableList';
  if (row?.type === 'array' && row?.items?.type !== 'object' && row?.items)
    return 'smallAppendableList';
  return '';
}

function objectSelect(row, name) {
  if (row?.lx?.displayType === 'map' && row?.type === 'object') return 'map';
  if (
    row?.type === 'object' &&
    model.value?.[name] !== undefined &&
    model.value?.[name] !== null &&
    row?.lx?.displayType === 'modal'
  )
    return 'objectList';
  if (row?.type === 'object' && !model.value?.[name] && row?.lx?.displayType === 'modal')
    return 'objectButton';
  if (row?.type === 'object' && model.value?.[name] !== undefined && model.value?.[name] !== null)
    return 'dataBlock';
  return '';
}

function otherSelect(row) {
  if (row?.lx?.displayType === 'stack' && row?.type === 'object') return 'stack';
  if (
    row?.lx?.displayType === 'autoComplete' &&
    (row?.type === 'string' || row?.type === 'array' || row?.type === 'object')
  )
    return 'autoComplete';
  if (row?.lx?.displayType === 'button' && (row?.type === 'string' || row?.type === 'object'))
    return 'button';
  if (row?.lx?.displayType === 'camera' && row?.type === 'string') return 'camera';
  if (row?.lx?.displayType === 'fileViewer' && row?.type === 'string') return 'fileViewer';
  if (row?.lx?.displayType === 'flag' && (row?.type === 'string' || row?.type === 'object'))
    return 'flag';
  if (row?.lx?.displayType === 'icon' && (row?.type === 'string' || row?.type === 'object'))
    return 'icon';
  if (row?.lx?.displayType === 'illustration' && (row?.type === 'string' || row?.type === 'object'))
    return 'illustration';
  if (row?.lx?.displayType === 'link' && (row?.type === 'string' || row?.type === 'object'))
    return 'link';
  if (row?.lx?.displayType === 'contentSwitcher' && row?.type === 'string')
    return 'contentSwitcher';
  if (row?.lx?.displayType === 'markdown' && row?.type === 'string') return 'markdownTextArea';
  if (
    row?.lx?.displayType === 'personDisplay' &&
    (row?.type === 'string' || row?.type === 'object' || row?.type === 'array')
  )
    return 'personDisplay';
  if (row?.lx?.displayType === 'qr' && (row?.type === 'string' || row?.type === 'object'))
    return 'qr';
  if (row?.lx?.displayType === 'qrScanner' && row?.type === 'object') return 'qrScanner';
  if (
    row?.lx?.displayType === 'richTextDisplay' &&
    (row?.type === 'string' || row?.type === 'object')
  )
    return 'richTextDisplay';
  if (row?.lx?.displayType === 'stateDisplay' && (row?.type === 'string' || row?.type === 'object'))
    return 'stateDisplay';
  if (row?.lx?.displayType === 'steps' && row?.type === 'string') return 'steps';
  if (row?.lx?.displayType === 'visualPicker' && (row?.type === 'string' || row?.type === 'array'))
    return 'visualPicker';
  if (row?.lx?.displayType === 'dayInput' && (row?.type === 'integer' || row?.type === 'object'))
    return 'dayInput';
  if (row?.lx?.displayType === 'drawPad' && row?.type === 'string') return 'drawPad';
  if (row?.lx?.displayType === 'logoDisplay' && (row?.type === 'string' || row?.type === 'object'))
    return 'logoDisplay';
  if (row?.lx?.displayType === 'dropDownMenu' && (row?.type === 'string' || row?.type === 'object'))
    return 'dropDownMenu';
  if (row?.lx?.displayType === 'numberSlider' && row?.type === 'integer') return 'numberSlider';
  if (row?.lx?.displayType === 'ratings' && (row?.type === 'integer' || row?.type === 'decimal'))
    return 'ratings';
  if (row?.type === 'boolean' && row?.lx?.displayType === 'checkbox') return 'checkbox';
  if (
    row?.lx?.displayType === 'dataVisualizer' &&
    (row?.type === 'array' || row?.type === 'object')
  )
    return 'dataVisualizer';
  if (row?.lx?.displayType === 'file' && row?.type === 'array') return 'file';
  if (row?.lx?.displayType === 'text' && row?.type === 'string') return 'text';
  if (row?.lx?.displayType === 'dateTimeRange' && row?.type === 'object') return 'dateTimeRange';
  return null;
}

function componentSelect(row, name) {
  if (row?.lx?.wrapper === 'placeholder') return 'lxPlaceholder';
  const res = otherSelect(row);
  if (res) return res;

  if (stringSelect(row) === 'textInputDefault') return 'textInputDefault';
  if (stringSelect(row) === 'textArea') return 'textArea';
  if (stringSelect(row) === 'dateTimePicker') return 'dateTimePicker';

  if (row?.type === 'integer') return 'textInputInteger';

  if (row?.type === 'boolean') return 'toggle';

  if ((row?.type === 'string' && (row?.lx?.variant || row?.enum)) || row?.type === 'array') {
    if (arraySelect(row) !== '') return arraySelect(row);
  }
  if (objectSelect(row, name) !== '') return objectSelect(row, name);

  if (name)
    lxDevUtils.log(
      `Property '${name}' couldn't be rendered`,
      useLx().getGlobals()?.environment,
      'warn'
    );
  return 'lxPlaceholder';
}

// Used for adding default values defined in schema to the modelValue
function addDefaultValues() {
  const res = { ...props.modelValue };
  if (props.schema?.properties) {
    Object.entries(props.schema?.properties)?.forEach(([key, value]) => {
      if (value?.lx?.displayType === 'dateTimeRange') {
        if (res[key] === undefined || res[key] === null) {
          res[key] = {};
        }
      }
      if (value?.default !== undefined) {
        if (
          res[key] === undefined ||
          res[key] === null ||
          (Array.isArray(res[key]) && res[key]?.length === 0)
        ) {
          res[key] = value?.default;
        }
      }
      if (value?.properties && value?.lx?.displayType === 'stack') {
        res[key] = res[key] || {};
        Object.entries(value?.properties)?.forEach(([key1, value1]) => {
          if (value1?.lx?.displayType === 'dateTimeRange') {
            if (res[key][key1] === undefined || res[key][key1] === null) {
              res[key][key1] = {};
            }
          }
          if (value1?.default !== undefined) {
            if (
              res[key][key1] === undefined ||
              res[key][key1] === null ||
              (Array.isArray(res[key][key1]) && res[key][key1]?.length === 0)
            ) {
              res[key][key1] = value1?.default;
            }
          }
          if (value1?.properties && value1?.lx?.displayType === 'stack') {
            res[key][key1] = res[key][key1] || {};
          }
        });
      }
    });
  }
  model.value = res;
}
// Generates primitive schema based on the modelValue
const schemaGenerator = computed(() => {
  const res = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
  };
  Object.entries(model.value)?.forEach(([key, value]) => {
    if (typeof value === 'string') res.properties[key] = { type: 'string' };
    else if (typeof value === 'boolean') res.properties[key] = { type: 'boolean' };
    else if (typeof value === 'number') res.properties[key] = { type: 'number' };
    else if (Array.isArray(value) && typeof value[0] === 'object') {
      res.properties[key] = { type: 'array', items: { type: 'object', properties: {} } };
      Object.entries(value[0])?.forEach(([key1, value1]) => {
        if (key1 !== '_lx_appendableKey') {
          if (typeof value1 === 'string')
            res.properties[key].items.properties[key1] = { type: 'string' };
          else if (typeof value1 === 'boolean')
            res.properties[key].items.properties[key1] = { type: 'boolean' };
        }
      });
    } else {
      res.properties[key] = { lx: { wrapper: 'placeholder' } };
    }
  });
  return res;
});

const mixedSchema = computed(() => {
  const res = lxFormatUtils.objectClone(schemaGenerator.value);
  if (props.mode === 'mixed') {
    try {
      if (props.schema?.hasOwnProperty('required')) res.required = props.schema?.required;
      Object.entries(schemaGenerator.value?.properties)?.forEach(([key]) => {
        if (props.schema?.properties?.hasOwnProperty(key)) {
          res.properties[key] = props.schema?.properties[key];
        }
      });
      Object.entries(props.schema?.properties)?.forEach(([key, value]) => {
        if (!res?.properties?.hasOwnProperty(key)) {
          res.properties[key] = value;
        }
      });
      return res;
    } catch (err) {
      lxDevUtils.log(err, useLx().getGlobals()?.environment, 'warn');
    }
  }
  return res;
});

const displaySchema = computed(() => {
  try {
    if (props.mode === 'no-schema') return schemaGenerator.value;
    if (props.mode === 'mixed') return mixedSchema.value;
  } catch (err) {
    lxDevUtils.log(err, useLx().getGlobals()?.environment, 'warn');
  }
  return props.schema;
});

// Sorts the schema based on the order property for propper rendering sequence
const orderedObject = computed(() => {
  if (props.mode === 'no-schema') return schemaGenerator.value?.properties;
  if (displaySchema.value?.properties) {
    const inputObject = lxFormatUtils.objectClone(displaySchema.value?.properties);
    const arrayRepresentation = Object.entries(inputObject);
    const sortedArray = arrayRepresentation.sort((a, b) => {
      const orderA = a[1]?.lx?.order ? a[1].lx.order : 1000;
      const orderB = b[1]?.lx?.order ? b[1].lx.order : 1000;
      return orderA - orderB;
    });

    const sortedObject = Object.fromEntries(sortedArray);
    return sortedObject;
  }
  return {};
});

function componentEmit(emitName, key, value = undefined, additionalParams = undefined) {
  emits('emit', emitName, key, value, additionalParams);
}

function replaceErrorMessage(message, value) {
  return message.replace('{0}', value);
}

function rowActionClicked(action, value, schemaName, index) {
  emits('rowActionClick', action, value, schemaName, index);
}

function isNumber(type) {
  return type === 'number' || type === 'integer';
}

// Creates rule for 'modelValue' validation based on the provided schema
const buildRules = (schema) => {
  const req = schema?.required;
  const res = {};

  req?.forEach((property) => {
    res[property] = res[property] || {};
    res[property].required = helpers.withMessage(() => displayTexts.value.required, required);
  });

  if (schema?.properties) {
    Object.entries(schema.properties).forEach(([key, value]) => {
      // Recursively handle nested objects
      if (value?.type === 'object' && value?.properties) {
        res[key] = buildRules(value);
      } else {
        if (isNumber(value?.type)) {
          if (value?.minimum !== undefined) {
            res[key] = res[key] || {};
            res[key].minValue = helpers.withMessage(
              ({ $params }) => replaceErrorMessage(displayTexts.value.minimum, $params.min),
              minValue(value.minimum)
            );
          }
          if (value?.exclusiveMinimum !== undefined) {
            const exclusiveMinimum = (param) =>
              helpers.withParams(
                { type: 'exclusiveMinimum', value: param },
                (targetValue) => targetValue > param
              );
            res[key] = res[key] || {};
            res[key].exclusiveMinimum = helpers.withMessage(
              () =>
                replaceErrorMessage(displayTexts.value.exclusiveMinimum, value.exclusiveMinimum),
              exclusiveMinimum(value.exclusiveMinimum)
            );
          }
          if (value?.maximum !== undefined) {
            res[key] = res[key] || {};
            res[key].maxValue = helpers.withMessage(
              ({ $params }) => replaceErrorMessage(displayTexts.value.maximum, $params.max),
              maxValue(value.maximum)
            );
          }
          if (value?.exclusiveMaximum !== undefined) {
            const exclusiveMaximum = (param) =>
              helpers.withParams(
                { type: 'exclusiveMaximum', value: param },
                (targetValue) => targetValue < param
              );
            res[key] = res[key] || {};
            res[key].exclusiveMaximum = helpers.withMessage(
              () =>
                replaceErrorMessage(displayTexts.value.exclusiveMaximum, value.exclusiveMaximum),
              exclusiveMaximum(value.exclusiveMaximum)
            );
          }
          if (value?.multipleOf !== undefined) {
            const multipleOf = (param) =>
              helpers.withParams(
                { type: 'multipleOf', value: param },
                (targetValue) => targetValue % param === 0
              );
            res[key] = res[key] || {};
            res[key].multipleOf = helpers.withMessage(
              () => replaceErrorMessage(displayTexts.value.multipleOf, value.multipleOf),
              multipleOf(value.multipleOf)
            );
          }
        }
        if (value?.minLength !== undefined && value?.type === 'string') {
          res[key] = res[key] || {};
          res[key].minLength = helpers.withMessage(
            ({ $params }) => replaceErrorMessage(displayTexts.value.minLength, $params.min),
            minLength(value.minLength)
          );
        }
        if (value?.maxLength !== undefined && value?.type === 'string') {
          res[key] = res[key] || {};
          res[key].maxLength = helpers.withMessage(
            ({ $params }) => replaceErrorMessage(displayTexts.value.maxLength, $params.max),
            maxLength(value.maxLength)
          );
        }
        if (value?.pattern && value?.type === 'string') {
          const pattern = (param) =>
            helpers.withParams({ type: 'pattern', value: param }, (targetValue) =>
              new RegExp(param).test(targetValue)
            );
          res[key] = res[key] || {};
          res[key].pattern = helpers.withMessage(
            () => replaceErrorMessage(displayTexts.value.pattern, value.pattern),
            pattern(value.pattern)
          );
        }
        if (value?.minItems !== undefined && value?.type === 'array') {
          res[key] = res[key] || {};
          res[key].minItems = helpers.withMessage(
            ({ $params }) => replaceErrorMessage(displayTexts.value.minItems, $params.min),
            minLength(value.minItems)
          );
        }
        if (value?.maxItems !== undefined && value?.type === 'array') {
          res[key] = res[key] || {};
          res[key].maxItems = helpers.withMessage(
            ({ $params }) => replaceErrorMessage(displayTexts.value.maxItems, $params.max),
            maxLength(value.maxItems)
          );
        }
        if (value?.uniqueItems && value?.type === 'array') {
          const uniqueItems = (targetValue) => new Set(targetValue)?.size === targetValue?.length;
          res[key] = res[key] || {};
          res[key].uniqueItems = helpers.withMessage(
            () => displayTexts.value.uniqueItems,
            uniqueItems
          );
        }
      }
    });
  }

  if (schema?.minProperties !== undefined && schema?.type === 'object') {
    const minProperties = (param) =>
      helpers.withParams(
        { type: 'minProperties', value: param },
        (targetValue) => Object.keys(targetValue).length >= param
      );
    res.minProperties = helpers.withMessage(
      () => replaceErrorMessage(displayTexts.value.minProperties, schema.minProperties),
      minProperties(schema.minProperties)
    );
  }
  if (schema?.maxProperties !== undefined && schema?.type === 'object') {
    const maxProperties = (param) =>
      helpers.withParams(
        { type: 'maxProperties', value: param },
        (targetValue) => Object.keys(targetValue).length <= param
      );
    res.maxProperties = helpers.withMessage(
      () => replaceErrorMessage(displayTexts.value.maxProperties, schema.maxProperties),
      maxProperties(schema.maxProperties)
    );
  }

  return res;
};

const rules = computed(() => {
  if (!props.schema) return { modelClone: {} };
  return { modelClone: buildRules(props.schema) };
});

const vv = ref();

/**
 * Validates the model based on the provided rules in schema prop.
 *
 * @return {Array} An array of validation errors, if any.
 */
function validateModel() {
  const res = [];
  if (props.mode !== 'no-schema') {
    const modelClone = JSON.parse(JSON.stringify(model.value));
    vv.value = useVuelidate(rules, { modelClone }, { $autoDirty: true });
    vv.value.value.modelClone.$touch();

    const errorsArray = vv.value.value?.$errors;
    errorsArray?.forEach((x) => {
      const item = {};
      item.propertyPath = x.$propertyPath;
      item.validator = x.$validator;
      item.message = x.$message;
      item.value = x.$params;
      res.push(item);
    });
  }
  return res;
}

function clearValidations() {
  vv.value.value.modelClone.$reset();
}

watch(
  () => props.schema,
  () => {
    if (props.mode !== 'no-schema' && props.mode !== 'view-builder') addDefaultValues();
  }
);

onMounted(() => {
  if (props.mode !== 'no-schema' && props.mode !== 'view-builder') addDefaultValues();
});

defineExpose({ validateModel, clearValidations, componentSelect });
</script>

<template>
  <template v-if="isSchemaValid">
    <template v-for="(row, name) in orderedObject" :key="name">
      <LxPlaceholder v-if="componentSelect(row, name) === 'lxPlaceholder'" class="lx-placeholder" />
      <LxRow
        v-else-if="row?.lx?.displayType !== 'section'"
        :label="
          displaySchema?.properties[name]?.title ? displaySchema?.properties[name]?.title : name
        "
        :rowSpan="displaySchema?.properties[name]?.lx?.rowSpan"
        :columnSpan="displaySchema?.properties[name]?.lx?.columnSpan"
        :required="isRequiredRow(name)"
        :inputId="id + '-' + name"
        :actionDefinitions="displaySchema?.properties[name]?.lx?.rowActionDefinitions"
        @actionClick="(a, b, c) => rowActionClicked(b, c, name, undefined)"
      >
        <template #info v-if="row?.description">{{ row?.description }}</template>
        <LxStack
          v-if="componentSelect(row, name) === 'stack'"
          :id="id + '-' + name"
          :orientation="row?.lx?.orientation"
          :kind="row?.lx?.kind"
          :mode="row?.lx?.mode"
          :horizontalAlignment="row?.lx?.horizontalAlignment"
          :verticalAlignment="row?.lx?.verticalAlignment"
          :horizontalConfig="row?.lx?.horizontalConfig"
          :verticalConfig="row?.lx?.verticalConfig"
        >
          <template
            v-for="(item, itemName) in displaySchema?.properties[name]?.properties"
            :key="itemName"
          >
            <LxStack
              v-if="componentSelect(item, itemName) === 'stack'"
              :id="id + '-' + itemName"
              :orientation="item?.lx?.orientation"
              :kind="item?.lx?.kind"
              :mode="item?.lx?.mode"
              :horizontalAlignment="item?.lx?.horizontalAlignment"
              :verticalAlignment="item?.lx?.verticalAlignment"
              :horizontalConfig="item?.lx?.horizontalConfig"
              :verticalConfig="item?.lx?.verticalConfig"
            >
              <template
                v-for="(nestedItem, nestedItemName) in displaySchema?.properties[name]?.properties[
                  itemName
                ]?.properties"
                :key="nestedItemName"
              >
                <LxFormBuilderItem
                  v-if="model[name]"
                  :id="id + '-' + nestedItemName"
                  v-model="model[name][itemName]"
                  :readOnly="readOnly"
                  :row="nestedItem"
                  :name="nestedItemName"
                  :displaySchema="displaySchema?.properties[name]?.properties[itemName]"
                  :vv="vv"
                  :orderedObject="orderedObject?.[name]?.properties?.[itemName]?.properties"
                  :texts="displayTexts"
                  :parentName="`${name}.${itemName}`"
                  :validations="validations?.[name]?.[itemName]"
                  @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, c, d)"
                  @emit="(a, b, c, d) => componentEmit(a, b, c, d)"
                  @filterBuilderFilter="emits('filterBuilderFilter')"
                />
              </template>
            </LxStack>
            <LxFormBuilderItem
              v-else
              :id="id"
              v-model="model[name]"
              :readOnly="readOnly"
              :row="item"
              :name="itemName"
              :displaySchema="displaySchema?.properties[name]"
              :vv="vv"
              :orderedObject="orderedObject?.[name]?.properties"
              :parentName="name"
              :texts="displayTexts"
              :validations="validations?.[name]"
              @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, c, d)"
              @emit="(a, b, c, d) => componentEmit(a, b, c, d)"
              @filterBuilderFilter="emits('filterBuilderFilter')"
            />
          </template>
        </LxStack>
        <LxFormBuilderItem
          v-else
          :id="id"
          v-model="model"
          :readOnly="readOnly"
          :row="row"
          :name="name"
          :displaySchema="displaySchema"
          :schema="schema"
          :vv="vv"
          :orderedObject="orderedObject"
          :texts="displayTexts"
          :validations="validations"
          @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, c, d)"
          @emit="(a, b, c, d) => componentEmit(a, b, c, d)"
          @filterBuilderFilter="emits('filterBuilderFilter')"
        />
      </LxRow>
    </template>
  </template>
</template>
