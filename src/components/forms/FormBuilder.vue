<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import LxRow from '@/components/forms/Row.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxTextArea from '@/components/TextArea.vue';
import LxToggle from '@/components/Toggle.vue';
import LxValuePicker from '@/components/ValuePicker.vue';
import { generateUUID } from '@/utils/stringUtils';
import LxDateTimePicker from '@/components/datePicker/DateTimePicker.vue';
import LxPlaceholder from '@/components/forms/Placeholder.vue';
import LxAppendableList from '@/components/forms/AppendableList.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, minValue, maxValue, minLength, maxLength } from '@vuelidate/validators';
import { lxFormatUtils, lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import LxDataBlock from '@/components/DataBlock.vue';
import LxForm from '@/components/forms/Form.vue';
import LxAppendableListSimple from '@/components/forms/AppendableListSimple.vue';
import LxList from '@/components/list/List.vue';
import LxModal from '@/components/Modal.vue';
import LxButton from '@/components/Button.vue';
import LxListItem from '@/components/list/ListItem.vue';
import LxDataGrid from '@/components/DataGrid.vue';

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
  mode: { type: String, default: 'default' }, // 'default' || 'no-schema' || 'mixed'
  /**
   * The object containing text translations for the form.
   * @type {Object}
   * @since 1.1.0
   */
  texts: {
    type: Object,
    default: () => ({
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
      saveElement: 'Pievienot elementu sarakstam',
      addObject: 'Pievienot objektu',
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'rowActionClick']);

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

function appendableListRequiredRow(required, row) {
  const find = required?.find((x) => x === row);
  if (!find) return null;
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

function isReadOnly(row) {
  if (row?.readOnly === null || row?.readOnly === undefined) return props.readOnly;
  return row?.readOnly;
}
function stringNumberMask(mask, type) {
  if (!mask && type === 'number') return 'decimal';
  if (!mask && type === 'string') return 'default';
  return mask;
}
function isNotDate(row) {
  return row?.format !== 'date' && row?.format !== 'time' && row?.format !== 'date-time';
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

function componentSelect(row, name) {
  if (row?.lx?.wrapper === 'placeholder') return 'lxPlaceholder';
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

function examplesValue(row) {
  if (row?.lx?.placeholder) return row?.lx?.placeholder;
  if (Array.isArray(row?.examples)) return row?.examples[0];
  return row?.examples;
}

// Used for adding default values defined in schema to the modelValue
function addDefaultValues() {
  const res = { ...props.modelValue };
  if (props.schema?.properties) {
    Object.entries(props.schema?.properties)?.forEach(([key, value]) => {
      if (value?.default !== undefined) {
        if (
          res[key] === undefined ||
          res[key] === null ||
          (Array.isArray(res[key]) && res[key]?.length === 0)
        ) {
          res[key] = value?.default;
        }
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
      Object.entries(schemaGenerator.value?.properties)?.forEach(([key, value]) => {
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

function enumToObject(value) {
  const res = [];
  value?.enum?.forEach((x) => {
    const obj = { id: x, name: x };
    res.push(obj);
  });
  return res;
}

function initializeObject(name) {
  const res = {};
  Object.entries(props.schema?.properties[name])?.forEach(([key]) => {
    res[key] = '';
  });
  model.value[name] = res;
}

const modalRefs = ref({});

function openObjectModal(name, rawName) {
  if (!model.value[rawName]) {
    initializeObject(rawName);
  }
  modalRefs.value[name].open();
}

function deleteObject(name) {
  delete model.value[name];
}

function deleteArrayObject(action, value, name) {
  if (action === 'remove') {
    if (displaySchema.value?.properties[name]?.lx?.idAttribute) {
      const index = model.value[name].findIndex(
        (x) => x[displaySchema.value?.properties[name]?.lx?.idAttribute] === value
      );
      if (index !== -1) {
        model.value[name].splice(index, 1);
      }
    } else {
      const index = model.value[name].findIndex((x) => x?.id === value);
      if (index !== -1) {
        model.value[name].splice(index, 1);
      }
    }
  }
}

const arrayModelValue = ref({});

function listModalAction(action, value, name) {
  if (action === 'click') {
    let obj = {};
    if (displaySchema.value?.properties[name]?.lx?.idAttribute) {
      obj = model.value[name].find(
        (x) => x[displaySchema.value?.properties[name]?.lx?.idAttribute] === value
      );
    } else {
      obj = model.value[name].find((x) => x.id === value);
    }
    const res = `${props.id}-${name}`;
    arrayModelValue.value[res] = obj;
    modalRefs.value[res].open();
  } else if (action === 'remove') {
    deleteArrayObject(action, value, name);
  }
}

function getColumnDefinitions(def) {
  const res = [];
  if (def) {
    Object.entries(def)?.forEach(([key, value]) => {
      const obj = {};
      obj.id = key;
      obj.attributeName = key;
      obj.name = value?.title;
      obj.size = value?.size;
      obj.kind = value?.kind;
      if (value.type === 'string') obj.type = 'default';
      else if (value.type === 'integer') obj.type = 'number';
      else if (value.type === 'number') obj.type = 'decimal';
      else if (value.type === 'boolean') obj.type = 'bool';
      if (obj.type) res.push(obj);
    });
  }
  return res;
}

function dataGridActions(action, id, additionalParameter, name) {
  if (action === 'open') {
    listModalAction('click', id, name);
  }
  if (action === 'remove') {
    deleteArrayObject(action, id, name);
  }
}
const newObject = ref(false);

function addArrayObject(name) {
  newObject.value = true;
  const temp = ref({});
  const res = `${props.id}-${name}`;
  arrayModelValue.value[res] = temp;
  modalRefs.value[res].open();
}

function saveNewElement(name) {
  if (!model.value[name]) model.value[name] = [];
  model.value[name].push(arrayModelValue.value[`${props.id}-${name}`]);
  modalRefs.value[`${props.id}-${name}`].close();
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
const rules = computed(() => {
  const req = props.schema?.required;
  const res = { modelClone: {} };

  req?.forEach((property) => {
    res.modelClone[property] = {};
    res.modelClone[property].required = helpers.withMessage(() => props.texts?.required, required);
  });
  if (props.schema?.properties) {
    Object.entries(props.schema?.properties)?.forEach(([key, value]) => {
      if (isNumber(value?.type)) {
        if (value?.minimum) {
          res.modelClone[key] = res.modelClone[key] || {};
          res.modelClone[key].minValue = helpers.withMessage(
            ({ $params }) => replaceErrorMessage(props.texts?.minimum, $params.min),
            minValue(value?.minimum)
          );
        }
        if (value?.exclusiveMinimum) {
          const exclusiveMinimum = (param) =>
            helpers.withParams(
              { type: 'exclusiveMinimum', value: param },
              (targetValue) => targetValue > param
            );

          res.modelClone[key] = res.modelClone[key] || {};
          res.modelClone[key].exclusiveMinimum = helpers.withMessage(
            () => replaceErrorMessage(props.texts?.exclusiveMinimum, value?.exclusiveMinimum),
            exclusiveMinimum(value?.exclusiveMinimum)
          );
        }
        if (value?.maximum) {
          res.modelClone[key] = res.modelClone[key] || {};
          res.modelClone[key].maxValue = helpers.withMessage(
            ({ $params }) => replaceErrorMessage(props.texts?.maximum, $params.max),
            maxValue(value?.maximum)
          );
        }
        if (value?.exclusiveMaximum) {
          const exclusiveMaximum = (param) =>
            helpers.withParams(
              { type: 'exclusiveMaximum', value: param },
              (targetValue) => targetValue < param
            );
          res.modelClone[key] = res.modelClone[key] || {};
          res.modelClone[key].exclusiveMaximum = helpers.withMessage(
            () => replaceErrorMessage(props.texts?.exclusiveMaximum, value?.exclusiveMaximum),
            exclusiveMaximum(value?.exclusiveMaximum)
          );
        }
        if (value?.multipleOf) {
          const multipleOf = (param) =>
            helpers.withParams(
              { type: 'multipleOf', value: param },
              (targetValue) => targetValue % param === 0
            );
          res.modelClone[key] = res.modelClone[key] || {};
          res.modelClone[key].multipleOf = helpers.withMessage(
            () => replaceErrorMessage(props.texts?.multipleOf, value?.multipleOf),
            multipleOf(value?.multipleOf)
          );
        }
      }
      if (value?.minLength && value?.type === 'string') {
        res.modelClone[key] = res.modelClone[key] || {};
        res.modelClone[key].minLength = helpers.withMessage(
          ({ $params }) => replaceErrorMessage(props.texts?.minLength, $params.min),
          minLength(value?.minLength)
        );
      }
      if (value?.maxLength && value?.type === 'string') {
        res.modelClone[key] = res.modelClone[key] || {};
        res.modelClone[key].maxLength = helpers.withMessage(
          ({ $params }) => replaceErrorMessage(props.texts?.maxLength, $params.max),
          maxLength(value?.maxLength)
        );
      }
      if (value?.pattern && value?.type === 'string') {
        const pattern = (param) =>
          helpers.withParams({ type: 'pattern', value: param }, (targetValue) =>
            new RegExp(param).test(targetValue)
          );
        res.modelClone[key] = res.modelClone[key] || {};
        res.modelClone[key].pattern = helpers.withMessage(
          () => replaceErrorMessage(props.texts?.pattern, value?.pattern),
          pattern(value?.pattern)
        );
      }
      if (value?.minItems && value?.type === 'array') {
        res.modelClone[key] = res.modelClone[key] || {};
        res.modelClone[key].minItems = helpers.withMessage(
          ({ $params }) => replaceErrorMessage(props.texts?.minItems, $params.min),
          minLength(value?.minItems)
        );
      }
      if (value?.maxItems && value?.type === 'array') {
        res.modelClone[key] = res.modelClone[key] || {};
        res.modelClone[key].maxItems = helpers.withMessage(
          ({ $params }) => replaceErrorMessage(props.texts?.maxItems, $params.max),
          maxLength(value?.maxItems)
        );
      }
      if (value?.uniqueItems && value?.type === 'array') {
        const uniqueItems = (targetValue) => new Set(targetValue)?.size === targetValue?.length;
        res.modelClone[key] = res.modelClone[key] || {};
        res.modelClone[key].uniqueItems = helpers.withMessage(
          () => props.texts?.uniqueItems,
          uniqueItems
        );
      }
    });
    if (props.schema?.minProperties && props.schema?.type === 'object') {
      const minProperties = (param) =>
        helpers.withParams(
          { type: 'minProperties', value: param },
          (targetValue) => Object.keys(targetValue).length >= param
        );
      res.modelClone.minProperties = helpers.withMessage(
        () => replaceErrorMessage(props.texts?.minProperties, props.schema?.minProperties),
        minProperties(props.schema?.minProperties)
      );
    }
    if (props.schema?.maxProperties && props.schema?.type === 'object') {
      const maxProperties = (param) =>
        helpers.withParams(
          { type: 'maxProperties', value: param },
          (targetValue) => Object.keys(targetValue).length <= param
        );
      res.modelClone.maxProperties = helpers.withMessage(
        () => replaceErrorMessage(props.texts?.maxProperties, props.schema?.maxProperties),
        maxProperties(props.schema?.maxProperties)
      );
    }
  }
  return res;
});

const vv = ref();
function returnErrorMessage(name) {
  return vv.value?.value?.modelClone?.[name]?.$errors?.[0]?.$message;
}
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
  (newValue) => {
    if (props.mode !== 'no-schema') addDefaultValues();
  }
);

onMounted(() => {
  if (props.mode !== 'no-schema') addDefaultValues();
});
defineExpose({ validateModel, clearValidations, componentSelect });
</script>

<template>
  <template v-if="isSchemaValid">
    <template v-for="(row, name) in orderedObject" :key="name">
      <LxPlaceholder v-if="componentSelect(row, name) === 'lxPlaceholder'" class="lx-placeholder" />
      <LxRow
        v-else
        :label="
          displaySchema?.properties[name]?.title ? displaySchema?.properties[name]?.title : name
        "
        :rowSpan="displaySchema?.properties[name]?.lx?.rowSpan"
        :columnSpan="displaySchema?.properties[name]?.lx?.columnSpan"
        :required="isRequiredRow(name)"
        :inputId="id + '-' + name"
        :action-definitions="displaySchema?.properties[name]?.lx?.actionDefinitions"
        @action-click="(a, b, c) => rowActionClicked(b, c, name, undefined)"
      >
        <template #info v-if="row?.description">{{ row?.description }}</template>
        <LxTextInput
          v-if="componentSelect(row, name) === 'textInputDefault'"
          :id="id + '-' + name"
          :mask="
            stringNumberMask(
              displaySchema?.properties[name]?.lx?.mask,
              displaySchema?.properties[name]?.type
            )
          "
          :maxlength="displaySchema?.properties[name]?.maxLength"
          :kind="displaySchema?.properties[name]?.lx?.kind"
          :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
          :scale="displaySchema?.properties[name]?.lx?.scale"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :uppercase="displaySchema?.properties[name]?.lx?.uppercase"
          :convert-to-string="displaySchema?.properties[name]?.lx?.convertToString"
          :placeholder="examplesValue(displaySchema?.properties[name])"
          :signed="displaySchema?.properties[name]?.lx?.signed"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :invalid="vv?.value?.modelClone?.[name]?.$error"
          :invalidation-message="returnErrorMessage(name)"
          :custom-mask-value="displaySchema?.properties[name]?.lx?.customMaskValue"
          v-model="model[name]"
        />
        <LxTextArea
          v-else-if="componentSelect(row, name) === 'textArea'"
          :id="id + '-' + name"
          :maxlength="displaySchema?.properties[name]?.maxLength"
          :placeholder="examplesValue(displaySchema?.properties[name])"
          :rows="displaySchema?.properties[name]?.lx?.rows"
          :dynamic-height="displaySchema?.properties[name]?.lx?.dynamicHeight"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :invalid="vv?.value?.modelClone?.[name]?.$error"
          :invalidation-message="returnErrorMessage(name)"
          v-model="model[name]"
        />
        <LxDateTimePicker
          v-else-if="componentSelect(row, name) === 'dateTimePicker'"
          :id="id + '-' + name"
          :kind="
            displaySchema?.properties[name]?.format === 'date-time'
              ? 'dateTime'
              : displaySchema?.properties[name]?.format
          "
          :placeholder="examplesValue(displaySchema?.properties[name])"
          :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
          :min-date="displaySchema?.properties[name]?.lx?.minDate"
          :max-date="displaySchema?.properties[name]?.lx?.maxDate"
          :required="displaySchema?.properties[name]?.lx?.required"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :time-adjust="displaySchema?.properties[name]?.lx?.timeAdjust"
          :clear-if-not-exact="displaySchema?.properties[name]?.lx?.clearIfNotExact"
          :texts="displaySchema?.properties[name]?.lx?.texts"
          :locale="displaySchema?.properties[name]?.lx?.locale"
          :special-dates="displaySchema?.properties[name]?.lx?.specialDates"
          :dictionary="displaySchema?.properties[name]?.lx?.dictionary"
          :variant="displaySchema?.properties[name]?.lx?.variant"
          :readOnly="isReadOnly(row)"
          :invalid="vv?.value?.modelClone?.[name]?.$error"
          :invalidation-message="returnErrorMessage(name)"
          v-model="model[name]"
        />
        <LxTextInput
          v-else-if="componentSelect(row, name) === 'textInputInteger'"
          :id="id + '-' + name"
          mask="integer"
          :maxlength="displaySchema?.properties[name]?.maxLength"
          :kind="displaySchema?.properties[name]?.lx?.kind"
          :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
          :scale="displaySchema?.properties[name]?.lx?.scale"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :uppercase="displaySchema?.properties[name]?.lx?.uppercase"
          :convert-to-string="displaySchema?.properties[name]?.lx?.convertToString"
          :placeholder="examplesValue(displaySchema?.properties[name])"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :invalid="vv?.value?.modelClone?.[name]?.$error"
          :invalidation-message="returnErrorMessage(name)"
          v-model="model[name]"
        />
        <LxToggle
          v-else-if="componentSelect(row, name) === 'toggle'"
          :id="id + '-' + name"
          :size="displaySchema?.properties[name]?.lx?.size"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :invalid="vv?.value?.modelClone?.[name]?.$error"
          :invalidation-message="returnErrorMessage(name)"
          v-model="model[name]"
        >
          <template #on>
            <span v-if="row?.lx?.labelOn">{{ row?.lx?.labelOn }}</span>
            <span v-else>Jā</span>
          </template>
          <template #off>
            <span v-if="row?.lx?.labelOff">{{ row?.lx?.labelOff }}</span>
            <span v-else>Nē</span>
          </template>
          <template #indeterminate>
            <span v-if="row?.lx?.labelIndeterminate">{{ row?.lx?.labelIndeterminate }}</span>
            <span v-else-if="isReadOnly(displaySchema?.properties[name])">
              <p class="lx-data">—</p>
            </span>
            <span v-else>—</span>
          </template>
        </LxToggle>
        <LxValuePicker
          v-else-if="componentSelect(row, name) === 'valuePicker'"
          :id="id + '-' + name"
          :kind="displaySchema?.properties[name]?.type === 'array' ? 'multiple' : 'single'"
          :items="
            displaySchema?.properties[name]?.lx?.items
              ? displaySchema?.properties[name]?.lx?.items
              : enumToObject(displaySchema?.properties[name])
          "
          :id-attribute="displaySchema?.properties[name]?.lx?.idAttribute"
          :name-attribute="displaySchema?.properties[name]?.lx?.nameAttribute"
          :icon-attribute="displaySchema?.properties[name]?.lx?.iconAttribute"
          :icon-set-attribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
          :category-attribute="displaySchema?.properties[name]?.lx?.categoryAttribute"
          :description-attribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
          :variant="displaySchema?.properties[name]?.lx?.variant"
          :has-search="displaySchema?.properties[name]?.lx?.hasSearch"
          :always-as-array="displaySchema?.properties[name]?.lx?.alwaysAsArray"
          :nullable="displaySchema?.properties[name]?.lx?.nullable"
          :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
          :texts="displaySchema?.properties[name]?.lx?.texts"
          :placeholder="examplesValue(displaySchema?.properties[name])"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :search-attributes="displaySchema?.properties[name]?.lx?.searchAttributes"
          :has-select-all="displaySchema?.properties[name]?.lx?.hasSelectAll"
          :read-only-render-type="displaySchema?.properties[name]?.lx?.readOnlyRenderType"
          :invalid="vv?.value?.modelClone?.[name]?.$error"
          :invalidation-message="returnErrorMessage(name)"
          v-model="model[name]"
        />
        <LxDataBlock
          v-else-if="componentSelect(row, name) === 'dataBlock'"
          :expandable="true"
          :size="displaySchema?.properties[name]?.lx?.size"
          :icon="displaySchema?.properties[name]?.lx?.icon"
          :icon-set="displaySchema?.properties[name]?.lx?.iconSet"
          :name="
            model?.[name]?.[displaySchema?.properties?.[name]?.lx?.nameAttribute]
              ? model?.[name]?.[displaySchema?.properties?.[name]?.lx?.nameAttribute]
              : model?.[name]?.name
          "
          :description="
            model?.[name]?.[displaySchema?.properties?.[name]?.lx?.descriptionAttribute]
              ? model?.[name]?.[displaySchema?.properties?.[name]?.lx?.descriptionAttribute]
              : model?.[name]?.description
          "
          :force-uppercase="displaySchema?.properties[name]?.lx?.forceUppercase"
          :disabled="displaySchema?.properties[name]?.lx?.disabled"
          :loading="displaySchema?.properties[name]?.lx?.loading"
          :busy="displaySchema?.properties[name]?.lx?.busy"
          class="form-builder-data-block"
        >
          <LxForm
            :showHeader="false"
            :showFooter="false"
            :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
            kind="stripped"
          >
            <template
              v-for="(item, itemName) in displaySchema?.properties[name]?.items?.properties"
              :key="itemName"
            >
              <LxPlaceholder v-if="componentSelect(item, itemName) === 'lxPlaceholder'" />
              <LxRow
                v-else
                :label="item?.title ? item?.title : itemName"
                :rowSpan="item?.lx?.rowSpan"
                :columnSpan="item?.lx?.columnSpan"
                :action-definitions="item?.lx?.actionDefinitions"
                @action-click="(a, b, c) => rowActionClicked(b, c, itemName, undefined)"
              >
                <LxTextInput
                  v-if="componentSelect(item, itemName) === 'textInputDefault'"
                  :mask="stringNumberMask(item?.lx?.mask, item?.type)"
                  :maxlength="item?.maxLength"
                  :kind="item?.lx?.kind"
                  :tooltip="item?.lx?.tooltip"
                  :scale="item?.lx?.scale"
                  :disabled="item?.lx?.disabled"
                  :uppercase="item?.lx?.uppercase"
                  :convert-to-string="item?.lx?.convertToString"
                  :placeholder="examplesValue(item)"
                  :signed="item?.lx?.signed"
                  :readOnly="isReadOnly(item)"
                  :custom-mask-value="item?.lx?.customMaskValue"
                  v-model="model[name][itemName]"
                />
                <LxTextArea
                  v-if="componentSelect(item, itemName) === 'textArea'"
                  :maxlength="item?.maxLength"
                  :placeholder="examplesValue(item)"
                  :rows="item?.lx?.rows"
                  :dynamic-height="item?.lx?.dynamicHeight"
                  :disabled="item?.lx?.disabled"
                  :tooltip="item?.lx?.tooltip"
                  :readOnly="isReadOnly(item)"
                />
                <LxTextInput
                  v-else-if="componentSelect(item, itemName) === 'textInputInteger'"
                  mask="integer"
                  :maxlength="item?.maxLength"
                  :kind="item?.lx?.kind"
                  :tooltip="item?.lx?.tooltip"
                  :scale="item?.lx?.scale"
                  :disabled="item?.lx?.disabled"
                  :uppercase="item?.lx?.uppercase"
                  :convert-to-string="item?.lx?.convertToString"
                  :placeholder="examplesValue(item)"
                  :signed="item?.lx?.signed"
                  :readOnly="isReadOnly(item)"
                  v-model="model[name][itemName]"
                />
                <LxToggle
                  v-else-if="componentSelect(item, itemName) === 'toggle'"
                  :size="item?.lx?.size"
                  :disabled="item?.lx?.disabled"
                  :tooltip="item?.lx?.tooltip"
                  :readOnly="isReadOnly(item)"
                  v-model="model[name][itemName]"
                />
                <LxDateTimePicker
                  v-else-if="componentSelect(item, itemName) === 'dateTimePicker'"
                  :kind="item?.format === 'date-time' ? 'dateTime' : item?.format"
                  :placeholder="examplesValue(item)"
                  :tooltip="item?.lx?.tooltip"
                  :min-date="item?.lx?.minDate"
                  :max-date="item?.lx?.maxDate"
                  :required="item?.lx?.required"
                  :disabled="item?.lx?.disabled"
                  :time-adjust="item?.lx?.timeAdjust"
                  :clear-if-not-exact="item?.lx?.clearIfNotExact"
                  :locale="item?.lx?.locale"
                  :special-dates="item?.lx?.specialDates"
                  :dictionary="item?.lx?.dictionary"
                  :variant="item?.lx?.variant"
                  :texts="item?.lx?.texts"
                  :readOnly="isReadOnly(item)"
                  v-model="model[name][itemName]"
                />
                <LxValuePicker
                  v-else-if="componentSelect(item, itemName) === 'valuePicker'"
                  :kind="item?.type === 'array' ? 'multiple' : 'single'"
                  :items="item?.lx?.items"
                  :id-attribute="item?.lx?.idAttribute"
                  :name-attribute="item?.lx?.nameAttribute"
                  :icon-attribute="item?.lx?.iconAttribute"
                  :icon-set-attribute="item?.lx?.iconSetAttribute"
                  :category-attribute="item?.lx?.categoryAttribute"
                  :description-attribute="item?.lx?.descriptionAttribute"
                  :variant="item?.lx?.variant"
                  :has-search="item?.lx?.hasSearch"
                  :always-as-array="item?.lx?.alwaysAsArray"
                  :nullable="item?.lx?.nullable"
                  :tooltip="item?.lx?.tooltip"
                  :texts="item?.lx?.texts"
                  :placeholder="examplesValue(item)"
                  :disabled="item?.lx?.disabled"
                  :search-attributes="item?.lx?.searchAttributes"
                  :has-select-all="item?.lx?.hasSelectAll"
                  :read-only-render-type="item?.lx?.readOnlyRenderType"
                  :readOnly="isReadOnly(item)"
                  v-model="model[name][itemName]"
                />
              </LxRow>
            </template>
          </LxForm>
        </LxDataBlock>
        <div
          v-else-if="
            componentSelect(row, name) === 'objectButton' ||
            componentSelect(row, name) === 'objectList'
          "
        >
          <lx-list-item
            v-if="componentSelect(row, name) === 'objectList'"
            :value="model[name]"
            :label="
              model[name][displaySchema?.properties[name].lx.primaryAttribute]
                ? model[name][displaySchema?.properties[name].lx.primaryAttribute]
                : model[name].name
            "
            :description="
              model[name][displaySchema?.properties[name].lx.secondaryAttribute]
                ? model[name][displaySchema?.properties[name].lx.secondaryAttribute]
                : model[name].description
            "
            icon="edit"
            :clickable="true"
            :actionDefinitions="[
              { id: 'remove', name: 'remove', icon: 'remove-item', destructive: true },
            ]"
            @action-click="deleteObject(name)"
            @click="openObjectModal(id + '-' + name, name)"
          />

          <LxButton
            v-if="componentSelect(row, name) === 'objectButton'"
            :label="texts.addObject"
            icon="add-item"
            @click="openObjectModal(id + '-' + name, name)"
            kind="ghost"
          />
          <LxModal :id="id + '-' + name" :ref="(el) => (modalRefs[id + '-' + name] = el)">
            <LxForm
              :showHeader="false"
              :showFooter="false"
              :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
              kind="stripped"
            >
              <template
                v-for="(item, itemName) in displaySchema?.properties[name]?.properties"
                :key="itemName"
              >
                <LxPlaceholder v-if="componentSelect(item, itemName) === 'lxPlaceholder'" />
                <LxRow
                  v-else
                  :label="item?.title ? item?.title : itemName"
                  :rowSpan="item?.lx?.rowSpan"
                  :columnSpan="item?.lx?.columnSpan"
                  :action-definitions="item?.lx?.actionDefinitions"
                  @action-click="(a, b, c) => rowActionClicked(b, c, itemName, undefined)"
                >
                  <LxTextInput
                    v-if="componentSelect(item, itemName) === 'textInputDefault'"
                    :mask="stringNumberMask(item?.lx?.mask, item?.type)"
                    :maxlength="item?.maxLength"
                    :kind="item?.lx?.kind"
                    :tooltip="item?.lx?.tooltip"
                    :scale="item?.lx?.scale"
                    :disabled="item?.lx?.disabled"
                    :uppercase="item?.lx?.uppercase"
                    :convert-to-string="item?.lx?.convertToString"
                    :placeholder="examplesValue(item)"
                    :signed="item?.lx?.signed"
                    :readOnly="isReadOnly(item)"
                    :custom-mask-value="item?.lx?.customMaskValue"
                    v-model="model[name][itemName]"
                  />
                  <LxTextArea
                    v-if="componentSelect(item, itemName) === 'textArea'"
                    :maxlength="item?.maxLength"
                    :placeholder="examplesValue(item)"
                    :rows="item?.lx?.rows"
                    :dynamic-height="item?.lx?.dynamicHeight"
                    :disabled="item?.lx?.disabled"
                    :tooltip="item?.lx?.tooltip"
                    :readOnly="isReadOnly(item)"
                    v-model="model[name][itemName]"
                  />
                  <LxTextInput
                    v-else-if="componentSelect(item, itemName) === 'textInputInteger'"
                    mask="integer"
                    :maxlength="item?.maxLength"
                    :kind="item?.lx?.kind"
                    :tooltip="item?.lx?.tooltip"
                    :scale="item?.lx?.scale"
                    :disabled="item?.lx?.disabled"
                    :uppercase="item?.lx?.uppercase"
                    :convert-to-string="item?.lx?.convertToString"
                    :placeholder="examplesValue(item)"
                    :signed="item?.lx?.signed"
                    :readOnly="isReadOnly(item)"
                    v-model="model[name][itemName]"
                  />
                  <LxToggle
                    v-else-if="componentSelect(item, itemName) === 'toggle'"
                    :size="item?.lx?.size"
                    :disabled="item?.lx?.disabled"
                    :tooltip="item?.lx?.tooltip"
                    :readOnly="isReadOnly(item)"
                    v-model="model[name][itemName]"
                  />
                  <LxDateTimePicker
                    v-else-if="componentSelect(item, itemName) === 'dateTimePicker'"
                    :kind="item?.format === 'date-time' ? 'dateTime' : item?.format"
                    :placeholder="examplesValue(item)"
                    :tooltip="item?.lx?.tooltip"
                    :min-date="item?.lx?.minDate"
                    :max-date="item?.lx?.maxDate"
                    :required="item?.lx?.required"
                    :disabled="item?.lx?.disabled"
                    :time-adjust="item?.lx?.timeAdjust"
                    :clear-if-not-exact="item?.lx?.clearIfNotExact"
                    :locale="item?.lx?.locale"
                    :special-dates="item?.lx?.specialDates"
                    :dictionary="item?.lx?.dictionary"
                    :variant="item?.lx?.variant"
                    :texts="item?.lx?.texts"
                    :readOnly="isReadOnly(item)"
                    v-model="model[name][itemName]"
                  />
                  <LxValuePicker
                    v-else-if="componentSelect(item, itemName) === 'valuePicker'"
                    :kind="item?.type === 'array' ? 'multiple' : 'single'"
                    :items="item?.lx?.items"
                    :id-attribute="item?.lx?.idAttribute"
                    :name-attribute="item?.lx?.nameAttribute"
                    :icon-attribute="item?.lx?.iconAttribute"
                    :icon-set-attribute="item?.lx?.iconSetAttribute"
                    :category-attribute="item?.lx?.categoryAttribute"
                    :description-attribute="item?.lx?.descriptionAttribute"
                    :variant="item?.lx?.variant"
                    :has-search="item?.lx?.hasSearch"
                    :always-as-array="item?.lx?.alwaysAsArray"
                    :nullable="item?.lx?.nullable"
                    :tooltip="item?.lx?.tooltip"
                    :texts="item?.lx?.texts"
                    :placeholder="examplesValue(item)"
                    :disabled="item?.lx?.disabled"
                    :readOnly="isReadOnly(item)"
                    :search-attributes="item?.lx?.searchAttributes"
                    :has-select-all="item?.lx?.hasSelectAll"
                    :read-only-render-type="item?.lx?.readOnlyRenderType"
                    v-model="model[name][itemName]"
                  />
                </LxRow>
              </template>
            </LxForm>
          </LxModal>
        </div>
        <LxList
          v-else-if="componentSelect(row, name) === 'arrayList'"
          :items="model[name]"
          :actionDefinitions="[
            { id: 'remove', title: 'Dzēst elementu', icon: 'remove-item', destructive: true },
          ]"
          :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
          :primaryAttribute="displaySchema?.properties[name]?.lx?.primaryAttribute"
          :secondaryAttribute="displaySchema?.properties[name]?.lx?.secondaryAttribute"
          :hrefAttribute="displaySchema?.properties[name]?.lx?.hrefAttribute"
          :groupAttribute="displaySchema?.properties[name]?.lx?.groupAttribute"
          :clickableAttribute="displaySchema?.properties[name]?.lx?.clickableAttribute"
          :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
          :iconSetAttribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
          :tooltipAttribute="displaySchema?.properties[name]?.lx?.tooltipAttribute"
          :categoryAttribute="displaySchema?.properties[name]?.lx?.categoryAttribute"
          :orderAttribute="displaySchema?.properties[name]?.lx?.orderAttribute"
          :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
          :groupDefinitions="displaySchema?.properties[name]?.lx?.groupDefinitions"
          :icon="displaySchema?.properties[name]?.lx?.icon"
          :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
          :kind="displaySchema?.properties[name]?.lx?.kind"
          :emptyStateIcon="displaySchema?.properties[name]?.lx?.emptyStateIcon"
          :listType="displaySchema?.properties[name]?.lx?.listType || '1'"
          :searchString="displaySchema?.properties[name]?.lx?.searchString"
          :searchSide="displaySchema?.properties[name]?.lx?.searchSide"
          :loading="displaySchema?.properties[name]?.lx?.loading"
          :busy="displaySchema?.properties[name]?.lx?.busy"
          :hideFilteredItems="displaySchema?.properties[name]?.lx?.hideFilteredItems"
          :includeUnspecifiedGroups="displaySchema?.properties[name]?.lx?.includeUnspecifiedGroups"
          :texts="displaySchema?.properties[name]?.lx?.texts"
          @actionClick="(val, item) => deleteArrayObject(val, item, name)"
        />
        <div v-else-if="componentSelect(row, name) === 'arrayListModal'">
          <LxList
            :items="model[name]"
            :actionDefinitions="[
              { id: 'remove', title: 'Dzēst elementu', icon: 'remove-item', destructive: true },
            ]"
            :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
            :primaryAttribute="displaySchema?.properties[name]?.lx?.primaryAttribute"
            :secondaryAttribute="displaySchema?.properties[name]?.lx?.secondaryAttribute"
            :hrefAttribute="displaySchema?.properties[name]?.lx?.hrefAttribute"
            :groupAttribute="displaySchema?.properties[name]?.lx?.groupAttribute"
            :clickableAttribute="
              displaySchema?.properties[name]?.lx?.primaryAttribute
                ? displaySchema?.properties[name]?.lx?.primaryAttribute
                : 'name'
            "
            :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
            :iconSetAttribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
            :tooltipAttribute="displaySchema?.properties[name]?.lx?.tooltipAttribute"
            :categoryAttribute="displaySchema?.properties[name]?.lx?.categoryAttribute"
            :orderAttribute="displaySchema?.properties[name]?.lx?.orderAttribute"
            :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
            :groupDefinitions="displaySchema?.properties[name]?.lx?.groupDefinitions"
            :icon="displaySchema?.properties[name]?.lx?.icon"
            :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
            :kind="displaySchema?.properties[name]?.lx?.kind"
            :emptyStateIcon="displaySchema?.properties[name]?.lx?.emptyStateIcon"
            :listType="displaySchema?.properties[name]?.lx?.listType || '1'"
            :searchString="displaySchema?.properties[name]?.lx?.searchString"
            :searchSide="displaySchema?.properties[name]?.lx?.searchSide"
            :loading="displaySchema?.properties[name]?.lx?.loading"
            :busy="displaySchema?.properties[name]?.lx?.busy"
            :hideFilteredItems="displaySchema?.properties[name]?.lx?.hideFilteredItems"
            :includeUnspecifiedGroup="displaySchema?.properties[name]?.lx?.includeUnspecifiedGroup"
            :texts="displaySchema?.properties[name]?.lx?.texts"
            @action-click="(val, item) => listModalAction(val, item, name)"
          >
            <template #toolbar>
              <LxButton
                icon="add-item"
                :label="texts.addElement"
                kind="ghost"
                @click="addArrayObject(name)"
              />
            </template>
          </LxList>
          <LxModal
            :ref="(el) => (modalRefs[id + '-' + name] = el)"
            :buttonPrimaryLabel="texts.saveElement"
            :buttonPrimaryVisible="newObject"
            @primary-action="saveNewElement(name)"
            @closed="newObject = false"
          >
            <LxForm
              :showHeader="false"
              :showFooter="false"
              :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
              kind="stripped"
            >
              <template
                v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
                :key="itemName"
              >
                <LxPlaceholder v-if="componentSelect(itemValue, itemName) === 'lxPlaceholder'" />
                <LxRow
                  v-else
                  :label="itemValue?.title ? itemValue?.title : itemName"
                  :rowSpan="itemValue?.lx?.rowSpan"
                  :columnSpan="itemValue?.lx?.columnSpan"
                  :action-definitions="itemValue?.lx?.actionDefinitions"
                  @action-click="(a, b, c) => rowActionClicked(b, c, itemName, undefined)"
                >
                  <LxTextInput
                    v-if="componentSelect(itemValue, itemName) === 'textInputDefault'"
                    :mask="stringNumberMask(itemValue?.lx?.mask, itemValue?.type)"
                    :maxlength="itemValue?.maxLength"
                    :kind="itemValue?.lx?.kind"
                    :tooltip="itemValue?.lx?.tooltip"
                    :scale="itemValue?.lx?.scale"
                    :disabled="itemValue?.lx?.disabled"
                    :uppercase="itemValue?.lx?.uppercase"
                    :convert-to-string="itemValue?.lx?.convertToString"
                    :placeholder="examplesValue(itemValue)"
                    :signed="itemValue?.lx?.signed"
                    :readOnly="isReadOnly(itemValue)"
                    :custom-mask-value="itemValue?.lx?.customMaskValue"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxTextArea
                    v-if="componentSelect(itemValue, itemName) === 'textArea'"
                    :maxlength="itemValue?.maxLength"
                    :placeholder="examplesValue(itemValue)"
                    :rows="itemValue?.lx?.rows"
                    :dynamic-height="itemValue?.lx?.dynamicHeight"
                    :disabled="itemValue?.lx?.disabled"
                    :tooltip="itemValue?.lx?.tooltip"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxTextInput
                    v-else-if="componentSelect(itemValue, itemName) === 'textInputInteger'"
                    mask="integer"
                    :maxlength="itemValue?.maxLength"
                    :kind="itemValue?.lx?.kind"
                    :tooltip="itemValue?.lx?.tooltip"
                    :scale="itemValue?.lx?.scale"
                    :disabled="itemValue?.lx?.disabled"
                    :uppercase="itemValue?.lx?.uppercase"
                    :convert-to-string="itemValue?.lx?.convertToString"
                    :placeholder="examplesValue(itemValue)"
                    :signed="itemValue?.lx?.signed"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxToggle
                    v-else-if="componentSelect(itemValue, itemName) === 'toggle'"
                    :size="itemValue?.lx?.size"
                    :disabled="itemValue?.lx?.disabled"
                    :tooltip="itemValue?.lx?.tooltip"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxDateTimePicker
                    v-else-if="componentSelect(itemValue, itemName) === 'dateTimePicker'"
                    :kind="itemValue?.format === 'date-time' ? 'dateTime' : itemValue?.format"
                    :placeholder="examplesValue(itemValue)"
                    :tooltip="itemValue?.lx?.tooltip"
                    :min-date="itemValue?.lx?.minDate"
                    :max-date="itemValue?.lx?.maxDate"
                    :required="itemValue?.lx?.required"
                    :disabled="itemValue?.lx?.disabled"
                    :time-adjust="itemValue?.lx?.timeAdjust"
                    :clear-if-not-exact="itemValue?.lx?.clearIfNotExact"
                    :locale="itemValue?.lx?.locale"
                    :special-dates="itemValue?.lx?.specialDates"
                    :dictionary="itemValue?.lx?.dictionary"
                    :variant="itemValue?.lx?.variant"
                    :texts="itemValue?.lx?.texts"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxValuePicker
                    v-else-if="componentSelect(itemValue, itemName) === 'valuePicker'"
                    :kind="itemValue?.type === 'array' ? 'multiple' : 'single'"
                    :items="itemValue?.lx?.items"
                    :id-attribute="itemValue?.lx?.idAttribute"
                    :name-attribute="itemValue?.lx?.nameAttribute"
                    :icon-attribute="itemValue?.lx?.iconAttribute"
                    :icon-set-attribute="itemValue?.lx?.iconSetAttribute"
                    :category-attribute="itemValue?.lx?.categoryAttribute"
                    :description-attribute="itemValue?.lx?.descriptionAttribute"
                    :variant="itemValue?.lx?.variant"
                    :has-search="itemValue?.lx?.hasSearch"
                    :always-as-array="itemValue?.lx?.alwaysAsArray"
                    :nullable="itemValue?.lx?.nullable"
                    :tooltip="itemValue?.lx?.tooltip"
                    :texts="itemValue?.lx?.texts"
                    :placeholder="examplesValue(itemValue)"
                    :disabled="itemValue?.lx?.disabled"
                    :readOnly="isReadOnly(itemValue)"
                    :has-select-all="itemValue?.lx?.hasSelectAll"
                    :search-attributes="itemValue?.lx?.searchAttributes"
                    :read-only-render-type="itemValue?.lx?.readOnlyRenderType"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxAppendableList
                    v-else-if="componentSelect(itemValue, itemName) === 'appendableList'"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  >
                    <template #customItem="{ item, index }">
                      <template
                        v-for="(appendableItem, appendableItemName) in itemValue?.items?.properties"
                        :key="appendableItemName"
                      >
                        <LxPlaceholder
                          v-if="
                            componentSelect(appendableItem, appendableItemName) === 'lxPlaceholder'
                          "
                          class="lx-placeholder"
                        />
                        <LxRow
                          v-else
                          :label="
                            appendableItem?.title ? appendableItem?.title : appendableItemName
                          "
                          :rowSpan="appendableItem?.lx?.rowSpan"
                          :columnSpan="appendableItem?.lx?.columnSpan"
                          :required="
                            appendableListRequiredRow(row?.items?.required, appendableItemName)
                          "
                          :inputId="name + '-' + appendableItemName + '-' + index"
                          :action-definitions="appendableItem?.lx?.actionDefinitions"
                          @action-click="
                            (a, b, c) => rowActionClicked(b, c, appendableItemName, index)
                          "
                        >
                          <LxTextInput
                            v-if="
                              componentSelect(appendableItem, appendableItemName) ===
                              'textInputDefault'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :mask="stringNumberMask(appendableItem?.lx?.mask, appendableItem?.type)"
                            :maxlength="appendableItem?.maxLength"
                            :kind="appendableItem?.lx?.kind"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :scale="appendableItem?.lx?.scale"
                            :disabled="appendableItem?.lx?.disabled"
                            :uppercase="appendableItem?.lx?.uppercase"
                            :convert-to-string="appendableItem?.lx?.convertToString"
                            :placeholder="examplesValue(appendableItem)"
                            :signed="appendableItem?.lx?.signed"
                            :readOnly="isReadOnly(appendableItem)"
                            :custom-mask-value="appendableItem?.lx?.customMaskValue"
                            v-model="item[appendableItemName]"
                          />
                          <LxTextArea
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) === 'textArea'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :maxlength="appendableItem?.maxLength"
                            :placeholder="examplesValue(appendableItem)"
                            :rows="appendableItem?.lx?.rows"
                            :dynamic-height="appendableItem?.lx?.dynamicHeight"
                            :disabled="appendableItem?.lx?.disabled"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          />
                          <LxDateTimePicker
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) ===
                              'dateTimePicker'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :kind="
                              appendableItem?.format === 'date-time'
                                ? 'dateTime'
                                : appendableItem?.format
                            "
                            :placeholder="examplesValue(appendableItem)"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :min-date="appendableItem?.lx?.minDate"
                            :max-date="appendableItem?.lx?.maxDate"
                            :required="appendableItem?.lx?.required"
                            :disabled="appendableItem?.lx?.disabled"
                            :time-adjust="appendableItem?.lx?.timeAdjust"
                            :clear-if-not-exact="appendableItem?.lx?.clearIfNotExact"
                            :locale="appendableItem?.lx?.locale"
                            :special-dates="appendableItem?.lx?.specialDates"
                            :dictionary="appendableItem?.lx?.dictionary"
                            :variant="appendableItem?.lx?.variant"
                            :texts="appendableItem?.lx?.texts"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          />
                          <LxTextInput
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) ===
                              'textInputInteger'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            mask="integer"
                            :maxlength="appendableItem?.maxLength"
                            :kind="appendableItem?.lx?.kind"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :scale="appendableItem?.lx?.scale"
                            :disabled="appendableItem?.lx?.disabled"
                            :uppercase="appendableItem?.lx?.uppercase"
                            :convert-to-string="appendableItem?.lx?.convertToString"
                            :placeholder="examplesValue(appendableItem)"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          />
                          <LxToggle
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) === 'toggle'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :size="appendableItem?.lx?.size"
                            :disabled="appendableItem?.lx?.disabled"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          >
                            <span v-if="appendableItem?.lx?.label">{{
                              appendableItem?.lx?.label
                            }}</span>
                          </LxToggle>
                          <LxValuePicker
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) === 'valuePicker'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :kind="appendableItem?.type === 'array' ? 'multiple' : 'single'"
                            :items="appendableItem?.lx?.items"
                            :id-attribute="appendableItem?.lx?.idAttribute"
                            :name-attribute="appendableItem?.lx?.nameAttribute"
                            :icon-attribute="appendableItem?.lx?.iconAttribute"
                            :icon-set-attribute="appendableItem?.lx?.iconSetAttribute"
                            :category-attribute="appendableItem?.lx?.categoryAttribute"
                            :description-attribute="appendableItem?.lx?.descriptionAttribute"
                            :variant="appendableItem?.lx?.variant"
                            :has-search="appendableItem?.lx?.hasSearch"
                            :always-as-array="appendableItem?.lx?.alwaysAsArray"
                            :nullable="appendableItem?.lx?.nullable"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :texts="appendableItem?.lx?.texts"
                            :placeholder="examplesValue(appendableItem)"
                            :disabled="appendableItem?.lx?.disabled"
                            :readOnly="isReadOnly(appendableItem)"
                            :has-select-all="appendableItem?.lx?.hasSelectAll"
                            :search-attributes="appendableItem?.lx?.searchAttributes"
                            :read-only-render-type="appendableItem?.lx?.readOnlyRenderType"
                            v-model="item[appendableItemName]"
                          />
                        </LxRow>
                      </template>
                    </template>
                  </LxAppendableList>
                </LxRow>
              </template>
            </LxForm>
          </LxModal>
        </div>
        <LxDataGrid
          v-else-if="componentSelect(row, name) === 'arrayTable'"
          :items="model[name]"
          :label="displaySchema?.properties[name]?.lx?.label"
          :description="displaySchema?.properties[name]?.lx?.description"
          :columnDefinitions="
            getColumnDefinitions(displaySchema?.properties[name]?.items?.properties)
          "
          :scrollable="
            displaySchema?.properties[name]?.items?.properties
              ? Object?.keys(displaySchema?.properties[name]?.items?.properties)?.length > 4
              : null
          "
          :loading="displaySchema?.properties[name]?.lx?.loading"
          :busy="displaySchema?.properties[name]?.lx?.busy"
          :skeletonRowCount="displaySchema?.properties[name]?.lx?.skeletonRowCount"
          :showHeader="displaySchema?.properties[name]?.lx?.showHeader"
          :showStatusBar="displaySchema?.properties[name]?.lx?.showStatusBar"
          :showAllColumns="displaySchema?.properties[name]?.lx?.showAllColumns"
          :hasSorting="displaySchema?.properties[name]?.lx?.hasSorting"
          :sortingIgnoreEmpty="displaySchema?.properties[name]?.lx?.sortingIgnoreEmpty"
          :itemsPerPage="displaySchema?.properties[name]?.lx?.itemsPerPage"
          :totalItems="displaySchema?.properties[name]?.lx?.totalItems"
          :sortingMode="displaySchema?.properties[name]?.lx?.sortingMode"
          :texts="displaySchema?.properties[name]?.lx?.texts"
        />
        <div v-else-if="componentSelect(row, name) === 'arrayTableModal'">
          <LxDataGrid
            :items="model[name]"
            :label="displaySchema?.properties[name]?.lx?.label"
            :description="displaySchema?.properties[name]?.lx?.description"
            :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
            :columnDefinitions="
              getColumnDefinitions(displaySchema?.properties[name]?.items?.properties)
            "
            :scrollable="
              displaySchema?.properties[name]?.items?.properties
                ? Object?.keys(displaySchema?.properties[name]?.items?.properties)?.length > 4
                : null
            "
            :loading="displaySchema?.properties[name]?.lx?.loading"
            :busy="displaySchema?.properties[name]?.lx?.busy"
            :skeletonRowCount="displaySchema?.properties[name]?.lx?.skeletonRowCount"
            :showHeader="displaySchema?.properties[name]?.lx?.showHeader"
            :showToolbar="true"
            :showStatusBar="displaySchema?.properties[name]?.lx?.showStatusBar"
            :showAllColumns="displaySchema?.properties[name]?.lx?.showAllColumns"
            :hasSorting="displaySchema?.properties[name]?.lx?.hasSorting"
            :sortingIgnoreEmpty="displaySchema?.properties[name]?.lx?.sortingIgnoreEmpty"
            :itemsPerPage="displaySchema?.properties[name]?.lx?.itemsPerPage"
            :totalItems="displaySchema?.properties[name]?.lx?.totalItems"
            :sortingMode="displaySchema?.properties[name]?.lx?.sortingMode"
            :actionDefinitions="[
              { id: 'open', name: 'Atvērt elementu', icon: 'open' },
              { id: 'remove', name: 'Dzēst elementu', icon: 'remove-item', destructive: true },
            ]"
            defaultActionName="open"
            :texts="displaySchema?.properties[name]?.lx?.texts"
            @actionClick="(val, item, additional) => dataGridActions(val, item, additional, name)"
          >
            <template #toolbar>
              <LxButton
                icon="add-item"
                :label="texts.addElement"
                kind="ghost"
                @click="addArrayObject(name)"
              />
            </template>
          </LxDataGrid>
          <LxModal
            :ref="(el) => (modalRefs[id + '-' + name] = el)"
            :buttonPrimaryLabel="texts.saveElement"
            :buttonPrimaryVisible="newObject"
            @primary-action="saveNewElement(name)"
            @closed="newObject = false"
          >
            <LxForm
              :showHeader="false"
              :showFooter="false"
              :column-count="displaySchema?.properties[name]?.lx?.formColumnCount"
              kind="stripped"
            >
              <template
                v-for="(itemValue, itemName) in displaySchema?.properties[name]?.items?.properties"
                :key="itemName"
              >
                <LxPlaceholder v-if="componentSelect(itemValue, itemName) === 'lxPlaceholder'" />
                <LxRow
                  v-else
                  :label="itemValue?.title ? itemValue?.title : itemName"
                  :rowSpan="itemValue?.lx?.rowSpan"
                  :columnSpan="itemValue?.lx?.columnSpan"
                  :action-definitions="itemValue?.lx?.actionDefinitions"
                  @action-click="(a, b, c) => rowActionClicked(b, c, itemName, undefined)"
                >
                  <LxTextInput
                    v-if="componentSelect(itemValue, itemName) === 'textInputDefault'"
                    :mask="stringNumberMask(itemValue?.lx?.mask, itemValue?.type)"
                    :maxlength="itemValue?.maxLength"
                    :kind="itemValue?.lx?.kind"
                    :tooltip="itemValue?.lx?.tooltip"
                    :scale="itemValue?.lx?.scale"
                    :disabled="itemValue?.lx?.disabled"
                    :uppercase="itemValue?.lx?.uppercase"
                    :convert-to-string="itemValue?.lx?.convertToString"
                    :placeholder="examplesValue(itemValue)"
                    :signed="itemValue?.lx?.signed"
                    :readOnly="isReadOnly(itemValue)"
                    :custom-mask-value="itemValue?.lx?.customMaskValue"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxTextArea
                    v-if="componentSelect(itemValue, itemName) === 'textArea'"
                    :maxlength="itemValue?.maxLength"
                    :placeholder="examplesValue(itemValue)"
                    :rows="itemValue?.lx?.rows"
                    :dynamic-height="itemValue?.lx?.dynamicHeight"
                    :disabled="itemValue?.lx?.disabled"
                    :tooltip="itemValue?.lx?.tooltip"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxTextInput
                    v-else-if="componentSelect(itemValue, itemName) === 'textInputInteger'"
                    mask="integer"
                    :maxlength="itemValue?.maxLength"
                    :kind="itemValue?.lx?.kind"
                    :tooltip="itemValue?.lx?.tooltip"
                    :scale="itemValue?.lx?.scale"
                    :disabled="itemValue?.lx?.disabled"
                    :uppercase="itemValue?.lx?.uppercase"
                    :convert-to-string="itemValue?.lx?.convertToString"
                    :placeholder="examplesValue(itemValue)"
                    :signed="itemValue?.lx?.signed"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxToggle
                    v-else-if="componentSelect(itemValue, itemName) === 'toggle'"
                    :size="itemValue?.lx?.size"
                    :disabled="itemValue?.lx?.disabled"
                    :tooltip="itemValue?.lx?.tooltip"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxDateTimePicker
                    v-else-if="componentSelect(itemValue, itemName) === 'dateTimePicker'"
                    :kind="itemValue?.format === 'date-time' ? 'dateTime' : itemValue?.format"
                    :placeholder="examplesValue(itemValue)"
                    :tooltip="itemValue?.lx?.tooltip"
                    :min-date="itemValue?.lx?.minDate"
                    :max-date="itemValue?.lx?.maxDate"
                    :required="itemValue?.lx?.required"
                    :disabled="itemValue?.lx?.disabled"
                    :time-adjust="itemValue?.lx?.timeAdjust"
                    :clear-if-not-exact="itemValue?.lx?.clearIfNotExact"
                    :locale="itemValue?.lx?.locale"
                    :special-dates="itemValue?.lx?.specialDates"
                    :dictionary="itemValue?.lx?.dictionary"
                    :variant="itemValue?.lx?.variant"
                    :texts="itemValue?.lx?.texts"
                    :readOnly="isReadOnly(itemValue)"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxValuePicker
                    v-else-if="componentSelect(itemValue, itemName) === 'valuePicker'"
                    :kind="itemValue?.type === 'array' ? 'multiple' : 'single'"
                    :items="itemValue?.lx?.items"
                    :id-attribute="itemValue?.lx?.idAttribute"
                    :name-attribute="itemValue?.lx?.nameAttribute"
                    :icon-attribute="itemValue?.lx?.iconAttribute"
                    :icon-set-attribute="itemValue?.lx?.iconSetAttribute"
                    :category-attribute="itemValue?.lx?.categoryAttribute"
                    :description-attribute="itemValue?.lx?.descriptionAttribute"
                    :variant="itemValue?.lx?.variant"
                    :has-search="itemValue?.lx?.hasSearch"
                    :always-as-array="itemValue?.lx?.alwaysAsArray"
                    :nullable="itemValue?.lx?.nullable"
                    :tooltip="itemValue?.lx?.tooltip"
                    :texts="itemValue?.lx?.texts"
                    :placeholder="examplesValue(itemValue)"
                    :disabled="itemValue?.lx?.disabled"
                    :readOnly="isReadOnly(itemValue)"
                    :has-select-all="itemValue?.lx?.hasSelectAll"
                    :search-attributes="itemValue?.lx?.searchAttributes"
                    :read-only-render-type="itemValue?.lx?.readOnlyRenderType"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  />
                  <LxAppendableList
                    v-else-if="componentSelect(itemValue, itemName) === 'appendableList'"
                    v-model="arrayModelValue[id + '-' + name][itemName]"
                  >
                    <template #customItem="{ item, index }">
                      <template
                        v-for="(appendableItem, appendableItemName) in itemValue?.items?.properties"
                        :key="appendableItemName"
                      >
                        <LxPlaceholder
                          v-if="
                            componentSelect(appendableItem, appendableItemName) === 'lxPlaceholder'
                          "
                          class="lx-placeholder"
                        />
                        <LxRow
                          v-else
                          :label="
                            appendableItem?.title ? appendableItem?.title : appendableItemName
                          "
                          :rowSpan="appendableItem?.lx?.rowSpan"
                          :columnSpan="appendableItem?.lx?.columnSpan"
                          :required="
                            appendableListRequiredRow(row?.items?.required, appendableItemName)
                          "
                          :inputId="name + '-' + appendableItemName + '-' + index"
                          :action-definitions="appendableItem?.lx?.actionDefinitions"
                          @action-click="
                            (a, b, c) => rowActionClicked(b, c, appendableItemName, index)
                          "
                        >
                          <LxTextInput
                            v-if="
                              componentSelect(appendableItem, appendableItemName) ===
                              'textInputDefault'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :mask="stringNumberMask(appendableItem?.lx?.mask, appendableItem?.type)"
                            :maxlength="appendableItem?.maxLength"
                            :kind="appendableItem?.lx?.kind"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :scale="appendableItem?.lx?.scale"
                            :disabled="appendableItem?.lx?.disabled"
                            :uppercase="appendableItem?.lx?.uppercase"
                            :convert-to-string="appendableItem?.lx?.convertToString"
                            :placeholder="examplesValue(appendableItem)"
                            :signed="appendableItem?.lx?.signed"
                            :readOnly="isReadOnly(appendableItem)"
                            :custom-mask-value="appendableItem?.lx?.customMaskValue"
                            v-model="item[appendableItemName]"
                          />
                          <LxTextArea
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) === 'textArea'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :maxlength="appendableItem?.maxLength"
                            :placeholder="examplesValue(appendableItem)"
                            :rows="appendableItem?.lx?.rows"
                            :dynamic-height="appendableItem?.lx?.dynamicHeight"
                            :disabled="appendableItem?.lx?.disabled"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          />
                          <LxDateTimePicker
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) ===
                              'dateTimePicker'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :kind="
                              appendableItem?.format === 'date-time'
                                ? 'dateTime'
                                : appendableItem?.format
                            "
                            :placeholder="examplesValue(appendableItem)"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :min-date="appendableItem?.lx?.minDate"
                            :max-date="appendableItem?.lx?.maxDate"
                            :required="appendableItem?.lx?.required"
                            :disabled="appendableItem?.lx?.disabled"
                            :time-adjust="appendableItem?.lx?.timeAdjust"
                            :clear-if-not-exact="appendableItem?.lx?.clearIfNotExact"
                            :locale="appendableItem?.lx?.locale"
                            :special-dates="appendableItem?.lx?.specialDates"
                            :dictionary="appendableItem?.lx?.dictionary"
                            :variant="appendableItem?.lx?.variant"
                            :texts="appendableItem?.lx?.texts"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          />
                          <LxTextInput
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) ===
                              'textInputInteger'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            mask="integer"
                            :maxlength="appendableItem?.maxLength"
                            :kind="appendableItem?.lx?.kind"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :scale="appendableItem?.lx?.scale"
                            :disabled="appendableItem?.lx?.disabled"
                            :uppercase="appendableItem?.lx?.uppercase"
                            :convert-to-string="appendableItem?.lx?.convertToString"
                            :placeholder="examplesValue(appendableItem)"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          />
                          <LxToggle
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) === 'toggle'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :size="appendableItem?.lx?.size"
                            :disabled="appendableItem?.lx?.disabled"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :readOnly="isReadOnly(appendableItem)"
                            v-model="item[appendableItemName]"
                          >
                            <span v-if="appendableItem?.lx?.label">
                              {{ appendableItem?.lx?.label }}
                            </span>
                          </LxToggle>
                          <LxValuePicker
                            v-else-if="
                              componentSelect(appendableItem, appendableItemName) === 'valuePicker'
                            "
                            :id="name + '-' + appendableItemName + '-' + index"
                            :kind="appendableItem?.type === 'array' ? 'multiple' : 'single'"
                            :items="appendableItem?.lx?.items"
                            :id-attribute="appendableItem?.lx?.idAttribute"
                            :name-attribute="appendableItem?.lx?.nameAttribute"
                            :icon-attribute="appendableItem?.lx?.iconAttribute"
                            :icon-set-attribute="appendableItem?.lx?.iconSetAttribute"
                            :category-attribute="appendableItem?.lx?.categoryAttribute"
                            :description-attribute="appendableItem?.lx?.descriptionAttribute"
                            :variant="appendableItem?.lx?.variant"
                            :has-search="appendableItem?.lx?.hasSearch"
                            :always-as-array="appendableItem?.lx?.alwaysAsArray"
                            :nullable="appendableItem?.lx?.nullable"
                            :tooltip="appendableItem?.lx?.tooltip"
                            :texts="appendableItem?.lx?.texts"
                            :placeholder="examplesValue(appendableItem)"
                            :disabled="appendableItem?.lx?.disabled"
                            :readOnly="isReadOnly(appendableItem)"
                            :has-select-all="appendableItem?.lx?.hasSelectAll"
                            :search-attributes="appendableItem?.lx?.searchAttributes"
                            :read-only-render-type="appendableItem?.lx?.readOnlyRenderType"
                            v-model="item[appendableItemName]"
                          />
                        </LxRow>
                      </template>
                    </template>
                  </LxAppendableList>
                </LxRow>
              </template>
            </LxForm>
          </LxModal>
        </div>
        <LxAppendableList
          v-else-if="componentSelect(row, name) === 'appendableList'"
          v-model="model[name]"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :expandable="displaySchema?.properties[name]?.lx?.expandable"
          :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
          :addButtonLabel="displaySchema?.properties[name]?.lx?.addButtonLabel"
          :columnCount="displaySchema?.properties[name]?.lx?.columnCount"
          :kind="displaySchema?.properties[name]?.lx?.kind"
          :requiredMode="displaySchema?.properties[name]?.lx?.requiredMode"
          :canAddItems="displaySchema?.properties[name]?.lx?.canAddItems"
          :force-uppercase="displaySchema?.properties[name]?.lx?.forceUppercase"
          :defaultExpanded="displaySchema?.properties[name]?.lx?.defaultExpanded"
          :expandedAttribute="displaySchema?.properties[name]?.lx?.expandedAttribute"
        >
          <template #customItem="{ item, index }">
            <template
              v-for="(appendableItem, appendableItemName) in orderedObject[name]?.items?.properties"
              :key="appendableItemName"
            >
              <LxPlaceholder
                v-if="componentSelect(appendableItem, appendableItemName) === 'lxPlaceholder'"
                class="lx-placeholder"
              />
              <LxRow
                v-else
                :label="appendableItem?.title ? appendableItem?.title : appendableItemName"
                :rowSpan="appendableItem?.lx?.rowSpan"
                :columnSpan="appendableItem?.lx?.columnSpan"
                :required="appendableListRequiredRow(row?.items?.required, appendableItemName)"
                :inputId="name + '-' + appendableItemName + '-' + index"
                :action-definitions="appendableItem?.lx?.actionDefinitions"
                @action-click="(a, b, c) => rowActionClicked(b, c, appendableItemName, index)"
              >
                <LxTextInput
                  v-if="componentSelect(appendableItem, appendableItemName) === 'textInputDefault'"
                  :id="name + '-' + appendableItemName + '-' + index"
                  :mask="stringNumberMask(appendableItem?.lx?.mask, appendableItem?.type)"
                  :maxlength="appendableItem?.maxLength"
                  :kind="appendableItem?.lx?.kind"
                  :tooltip="appendableItem?.lx?.tooltip"
                  :scale="appendableItem?.lx?.scale"
                  :disabled="appendableItem?.lx?.disabled"
                  :uppercase="appendableItem?.lx?.uppercase"
                  :convert-to-string="appendableItem?.lx?.convertToString"
                  :placeholder="examplesValue(appendableItem)"
                  :signed="appendableItem?.lx?.signed"
                  :readOnly="isReadOnly(appendableItem)"
                  :custom-mask-value="appendableItem?.lx?.customMaskValue"
                  v-model="item[appendableItemName]"
                />
                <LxTextArea
                  v-else-if="componentSelect(appendableItem, appendableItemName) === 'textArea'"
                  :id="name + '-' + appendableItemName + '-' + index"
                  :maxlength="appendableItem?.maxLength"
                  :placeholder="examplesValue(appendableItem)"
                  :rows="appendableItem?.lx?.rows"
                  :dynamic-height="appendableItem?.lx?.dynamicHeight"
                  :disabled="appendableItem?.lx?.disabled"
                  :tooltip="appendableItem?.lx?.tooltip"
                  :readOnly="isReadOnly(appendableItem)"
                  v-model="item[appendableItemName]"
                />
                <LxDateTimePicker
                  v-else-if="
                    componentSelect(appendableItem, appendableItemName) === 'dateTimePicker'
                  "
                  :id="name + '-' + appendableItemName + '-' + index"
                  :kind="
                    appendableItem?.format === 'date-time' ? 'dateTime' : appendableItem?.format
                  "
                  :placeholder="examplesValue(appendableItem)"
                  :tooltip="appendableItem?.lx?.tooltip"
                  :min-date="appendableItem?.lx?.minDate"
                  :max-date="appendableItem?.lx?.maxDate"
                  :required="appendableItem?.lx?.required"
                  :disabled="appendableItem?.lx?.disabled"
                  :time-adjust="appendableItem?.lx?.timeAdjust"
                  :clear-if-not-exact="appendableItem?.lx?.clearIfNotExact"
                  :locale="appendableItem?.lx?.locale"
                  :special-dates="appendableItem?.lx?.specialDates"
                  :dictionary="appendableItem?.lx?.dictionary"
                  :variant="appendableItem?.lx?.variant"
                  :texts="appendableItem?.lx?.texts"
                  :readOnly="isReadOnly(appendableItem)"
                  v-model="item[appendableItemName]"
                />
                <LxTextInput
                  v-else-if="
                    componentSelect(appendableItem, appendableItemName) === 'textInputInteger'
                  "
                  :id="name + '-' + appendableItemName + '-' + index"
                  mask="integer"
                  :maxlength="appendableItem?.maxLength"
                  :kind="appendableItem?.lx?.kind"
                  :tooltip="appendableItem?.lx?.tooltip"
                  :scale="appendableItem?.lx?.scale"
                  :disabled="appendableItem?.lx?.disabled"
                  :uppercase="appendableItem?.lx?.uppercase"
                  :convert-to-string="appendableItem?.lx?.convertToString"
                  :placeholder="examplesValue(appendableItem)"
                  :readOnly="isReadOnly(appendableItem)"
                  v-model="item[appendableItemName]"
                />
                <LxToggle
                  v-else-if="componentSelect(appendableItem, appendableItemName) === 'toggle'"
                  :id="name + '-' + appendableItemName + '-' + index"
                  :size="appendableItem?.lx?.size"
                  :disabled="appendableItem?.lx?.disabled"
                  :tooltip="appendableItem?.lx?.tooltip"
                  :readOnly="isReadOnly(appendableItem)"
                  v-model="item[appendableItemName]"
                >
                  <span v-if="appendableItem?.lx?.label">{{ appendableItem?.lx?.label }}</span>
                </LxToggle>
                <LxValuePicker
                  v-else-if="componentSelect(appendableItem, appendableItemName) === 'valuePicker'"
                  :id="name + '-' + appendableItemName + '-' + index"
                  :kind="appendableItem?.type === 'array' ? 'multiple' : 'single'"
                  :items="appendableItem?.lx?.items"
                  :id-attribute="appendableItem?.lx?.idAttribute"
                  :name-attribute="appendableItem?.lx?.nameAttribute"
                  :icon-attribute="appendableItem?.lx?.iconAttribute"
                  :icon-set-attribute="appendableItem?.lx?.iconSetAttribute"
                  :category-attribute="appendableItem?.lx?.categoryAttribute"
                  :description-attribute="appendableItem?.lx?.descriptionAttribute"
                  :variant="appendableItem?.lx?.variant"
                  :has-search="appendableItem?.lx?.hasSearch"
                  :always-as-array="appendableItem?.lx?.alwaysAsArray"
                  :nullable="appendableItem?.lx?.nullable"
                  :tooltip="appendableItem?.lx?.tooltip"
                  :texts="appendableItem?.lx?.texts"
                  :placeholder="examplesValue(appendableItem)"
                  :disabled="appendableItem?.lx?.disabled"
                  :readOnly="isReadOnly(appendableItem)"
                  :has-select-all="appendableItem?.lx?.hasSelectAll"
                  :search-attributes="appendableItem?.lx?.searchAttributes"
                  :read-only-render-type="appendableItem?.lx?.readOnlyRenderType"
                  v-model="item[appendableItemName]"
                />
              </LxRow>
            </template>
          </template>
        </LxAppendableList>
        <LxAppendableListSimple
          v-else-if="componentSelect(row, name) === 'smallAppendableList'"
          v-model="model[name]"
          :readOnly="isReadOnly(displaySchema?.properties[name])"
          :addButtonLabel="displaySchema?.properties[name]?.lx?.addButtonLabel"
          :columnCount="displaySchema?.properties[name]?.lx?.columnCount"
          :kind="
            displaySchema?.properties[name]?.lx?.kind
              ? displaySchema?.properties[name]?.lx?.kind
              : 'compact'
          "
          :requiredMode="displaySchema?.properties[name]?.lx?.requiredMode"
          :canAddItems="displaySchema?.properties[name]?.lx?.canAddItems"
        >
          <template #customItem="{ item, index }">
            <LxPlaceholder
              v-if="componentSelect(row?.items, name) === 'lxPlaceholder'"
              class="lx-placeholder"
            />
            <LxRow
              v-else
              :hideLabel="true"
              :rowSpan="row?.items?.lx?.rowSpan"
              :columnSpan="row?.items?.lx?.columnSpan"
              :action-definitions="row?.items?.lx?.actionDefinitions"
              @action-click="(a, b, c) => rowActionClicked(b, c, name, index)"
            >
              <LxTextInput
                v-if="componentSelect(row?.items, name) === 'textInputDefault'"
                :mask="stringNumberMask(row?.items?.lx?.mask, row?.items?.type)"
                :maxlength="row?.items?.maxLength"
                :kind="row?.items?.lx?.kind"
                :tooltip="row?.items?.lx?.tooltip"
                :scale="row?.items?.lx?.scale"
                :disabled="row?.items?.lx?.disabled"
                :uppercase="row?.items?.lx?.uppercase"
                :convert-to-string="row?.items?.lx?.convertToString"
                :placeholder="examplesValue(row?.items)"
                :signed="row?.items?.lx?.signed"
                :readOnly="isReadOnly(row?.items)"
                :custom-mask-value="row?.items?.lx?.customMaskValue"
                v-model="model[name][index]"
              />
              <LxTextInput
                v-else-if="componentSelect(row?.items, name) === 'textInputInteger'"
                mask="integer"
                :maxlength="row?.items?.maxLength"
                :kind="row?.items?.lx?.kind"
                :tooltip="row?.items?.lx?.tooltip"
                :scale="row?.items?.lx?.scale"
                :disabled="row?.items?.lx?.disabled"
                :uppercase="row?.items?.lx?.uppercase"
                :convert-to-string="row?.items?.lx?.convertToString"
                :placeholder="examplesValue(row?.items)"
                :signed="row?.items?.lx?.signed"
                :readOnly="isReadOnly(row?.items)"
                v-model="model[name][index]"
              />
              <LxToggle
                v-else-if="componentSelect(row?.items, name) === 'toggle'"
                :size="row?.items?.lx?.size"
                :disabled="row?.items?.lx?.disabled"
                :tooltip="row?.items?.lx?.tooltip"
                :readOnly="isReadOnly(row?.items)"
                v-model="model[name][index]"
              >
                <template #on>
                  <span v-if="row?.items?.lx?.labelOn">{{ row?.items?.lx?.labelOn }}</span>
                  <span v-else>Jā</span>
                </template>
                <template #off>
                  <span v-if="row?.items?.lx?.labelOff">{{ row?.items?.lx?.labelOff }}</span>
                  <span v-else>Nē</span>
                </template>
                <template #indeterminate>
                  <span v-if="row?.items?.lx?.labelIndeterminate"
                    >{{ row?.items?.lx?.labelIndeterminate }}
                  </span>
                  <span v-else-if="isReadOnly(row?.items)">
                    <p class="lx-data">—</p>
                  </span>
                  <span v-else>—</span>
                </template>
              </LxToggle>
              <LxDateTimePicker
                v-else-if="componentSelect(row?.items, name) === 'dateTimePicker'"
                :kind="row?.items?.format === 'date-time' ? 'dateTime' : row?.items?.format"
                :tooltip="row?.items?.lx?.tooltip"
                :placeholder="examplesValue(row?.items)"
                :min-date="row?.items?.lx?.minDate"
                :max-date="row?.items?.lx?.maxDate"
                :required="row?.items?.lx?.required"
                :disabled="row?.items?.lx?.disabled"
                :time-adjust="row?.items?.lx?.timeAdjust"
                :clear-if-not-exact="row?.items?.lx?.clearIfNotExact"
                :locale="row?.items?.lx?.locale"
                :special-dates="row?.items?.lx?.specialDates"
                :dictionary="row?.items?.lx?.dictionary"
                :variant="row?.items?.lx?.variant"
                :texts="row?.items?.lx?.texts"
                :readOnly="isReadOnly(row?.items)"
                v-model="model[name][index]"
              />
            </LxRow>
          </template>
        </LxAppendableListSimple>
      </LxRow>
    </template>
  </template>
</template>
