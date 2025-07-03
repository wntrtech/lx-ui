<script setup>
import { computed, onBeforeMount, watch, ref } from 'vue';

import LxFormBuilder from '@/components/forms/FormBuilder.vue';
import LxViewLayout from '@/components/ViewLayout.vue';
import LxStack from '@/components/Stack.vue';
import LxForm from '@/components/forms/Form.vue';
import LxSection from '@/components/forms/Section.vue';
import LxRow from '@/components/forms/Row.vue';
import LxFormBuilderItem from '@/components/forms/FormBuilderItem.vue';
import LxFilterBuilder from '@/components/FilterBuilder.vue';
import LxFormBuilderListItem from '@/components/forms/FormBuilderListItem.vue';

import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';

import { useVuelidate } from '@vuelidate/core';
import { required, helpers, minValue, maxValue, minLength, maxLength } from '@vuelidate/validators';

const props = defineProps({
  /**
   ** Unique identifier for the view builder component.
   * @type {String}
   * @default generateUUID() - Automatically generates a UUID if not provided.
   * @since 1.9.0-beta.9
   */
  id: { type: String, default: () => generateUUID() },
  /**
   * The values of the view input components.
   * @type {Object}
   * @default null
   * @since 1.9.0-beta.9
   */
  modelValue: { type: Object, default: null },
  /**
   * The schema object that defines the structure and configuration of the view.
   * @type {Object}
   * @default null
   * @since 1.9.0-beta.9
   */
  schema: { type: Object, default: null },
  /**
   * Determines if the view should be rendered in read-only mode.
   * @type {Boolean}
   * @default false
   * @since 1.9.0-beta.9
   */
  readOnly: { type: Boolean, default: false },
  /**
   * Determines invalidation messages and sets invalid state for the view components.
   * @type {Object}
   * @default null
   * @since 1.9.0
   */
  validations: { type: Object, default: null },
  /**
   * Determines whether the view will be built from modelValue or schema.
   * @type {String}
   * @default 'default'
   * @since 1.10.0-beta.1
   */
  mode: { type: String, default: 'default' }, // 'default', 'no-schema', 'mixed'
  /**
   * The object containing text translations for the view.
   * @type {Object}
   * @default {}
   * @since 1.9.0-beta.9
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

const emits = defineEmits(['update:modelValue', 'rowActionClick', 'emit']);

const model = computed({
  get() {
    if (!props.modelValue) return {};
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const isSchemaValid = computed(() => {
  try {
    JSON.parse(JSON.stringify(props.schema));
  } catch (e) {
    return false;
  }
  return true;
});

function addDefaultValues() {
  function setDefaults(target, schema) {
    Object.entries(schema?.properties || {}).forEach(([key, value]) => {
      if (value?.default !== undefined) {
        if (
          target[key] === undefined ||
          target[key] === null ||
          (Array.isArray(target[key]) && target[key]?.length === 0)
        ) {
          // eslint-disable-next-line no-param-reassign
          target[key] = value.default;
        }
      }
      if (
        (value?.properties && value?.lx?.displayType === 'stack') ||
        value?.lx?.displayType === 'form' ||
        value?.items?.properties
      ) {
        // eslint-disable-next-line no-param-reassign
        target[key] = target[key] || {};

        setDefaults(target[key], value);
      }
    });
  }

  const res = { ...props.modelValue };
  setDefaults(res, props.schema);

  model.value = res;
}

const viewKind = computed(() => {
  const properties = Object.values(props.schema?.properties || {});
  if (properties.find((v) => v?.lx?.displayType === 'form' && v?.type === 'object')) {
    return 'form';
  }
  if (properties.find((v) => v?.lx?.displayType === 'filters' && v?.type === 'object')) {
    return 'filters';
  }
  return 'default';
});

function rowActionClicked(action, value, schemaName, index) {
  emits('rowActionClick', action, value, schemaName, index);
}

function componentEmit(emitName, key, value = undefined, additionalParams = undefined) {
  emits('emit', emitName, key, value, additionalParams);
}

function replaceErrorMessage(message, value) {
  return message.replace('{0}', value);
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

const otherBuilderRefs = ref({});

function validateOtherBuilders() {
  Object.values(otherBuilderRefs.value)?.forEach((el) => {
    el.validateModel();
  });
}

/**
 * Validates the model based on the provided rules in schema prop.
 *
 * @return {Array} An array of validation errors, if any.
 */
function validateModel() {
  const res = [];
  validateOtherBuilders();
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

  return res;
}

function clearValidations() {
  vv.value.value.modelClone.$reset();
  Object.values(otherBuilderRefs.value)?.forEach((el) => {
    el.clearValidations();
  });
}

watch(
  () => props.schema,
  (newSchema, oldSchema) => {
    if (JSON.stringify(newSchema) !== JSON.stringify(oldSchema) && props.mode !== 'no-schema') {
      addDefaultValues();
    }
  }
);

onBeforeMount(async () => {
  if (props.mode !== 'no-schema') await addDefaultValues();
});

const schemaGenerator = computed(() => {
  const res = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      form: {
        type: 'object',
        lx: {
          displayType: 'form',
        },
        properties: {},
      },
    },
  };
  Object.entries(model.value)?.forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number')
      res.properties.form.properties[key] = { type: typeof value };
    else if (Array.isArray(value) && typeof value[0] === 'object') {
      res.properties.form.properties[key] = {
        type: 'array',
        items: { type: 'object', properties: {} },
      };
      Object.entries(value[0])?.forEach(([key1, value1]) => {
        if (key1 !== '_lx_appendableKey') {
          if (typeof value1 === 'string')
            res.properties.form.properties[key].items.properties[key1] = { type: 'string' };
          else if (typeof value1 === 'boolean')
            res.properties.form.properties[key].items.properties[key1] = { type: 'boolean' };
        }
      });
    } else {
      res.properties.form.properties[key] = { lx: { wrapper: 'placeholder' } };
    }
  });
  return res;
});

const mixedSchema = computed(() => {
  const res = structuredClone(props.schema);
  if (props.mode === 'mixed') {
    try {
      Object.entries(schemaGenerator.value?.properties?.form?.properties)?.forEach(
        ([key, value]) => {
          if (!Object.prototype.hasOwnProperty.call(res?.properties, key)) {
            res.properties[key] = value;
          }
        }
      );
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

defineExpose({ validateModel, clearValidations });
</script>
<template>
  <LxViewLayout v-if="isSchemaValid" :kind="viewKind">
    <template #filters>
      <template v-for="(row, name) in displaySchema?.properties" :key="name">
        <LxFilterBuilder
          v-if="row?.lx?.displayType === 'filters' && row?.type === 'object'"
          :ref="(el) => (otherBuilderRefs[id + '-' + name] = el)"
          v-model="model[name]"
          :schema="row"
          :id="id + '-' + name"
          :readOnly="readOnly"
          :defaultValues="row?.lx?.defaultValues"
          :useDefaults="row?.lx?.useDefaults"
          :label="row?.title"
          :description="row?.description"
          :usesFilter="row?.lx?.usesFilter"
          :filterButtonKind="row?.lx?.filterButtonKind"
          :columnCount="row?.lx?.columnCount"
          :expanded="row?.lx?.expanded"
          :disabled="row?.lx?.disabled"
          :fastFilters="row?.lx?.fastFilters"
          :fastIdAttribute="row?.lx?.fastIdAttribute"
          :fastNameAttribute="row?.lx?.fastNameAttribute"
          :badge="row?.lx?.badge"
          :badgeType="row?.lx?.badgeType"
          :texts="row?.lx?.texts"
          @filter="() => componentEmit('filter', name)"
          @resetFilter="() => componentEmit('resetFilter', name)"
          @fastFilterClick="(a) => componentEmit('fastFilterClick', name, a)"
          @update:expanded="(a) => componentEmit('update:expanded', name, a)"
          @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, c, d)"
        />
      </template>
    </template>
    <template #default v-if="mode !== 'no-schema'">
      <template v-for="(row, name) in displaySchema?.properties" :key="name">
        <LxForm
          v-if="row?.lx?.displayType === 'form' && row?.type === 'object'"
          :id="id + '-' + name"
          :columnCount="row?.lx?.columnCount"
          :showHeader="row?.lx?.showHeader"
          :stickyHeader="row?.lx?.stickyHeader"
          :showFooter="row?.lx?.showFooter"
          :stickyFooter="row?.lx?.stickyFooter"
          :showPreHeaderInfo="row?.lx?.showPreHeaderInfo"
          :showPostHeaderInfo="row?.lx?.showPostHeaderInfo"
          :index="row?.lx?.index"
          :indexType="row?.lx?.indexType"
          :actionDefinitions="row?.lx?.actionDefinitions"
          :requiredMode="row?.lx?.requiredMode"
          :kind="row?.lx?.kind"
          :orientation="row?.lx?.orientation"
          :hasSkipLink="row?.lx?.hasSkipLink"
          :texts="row?.lx?.texts"
          @buttonClick="(a) => componentEmit('buttonClick', name, a)"
        >
          <template #header>{{ row?.title }}</template>
          <template #pre-header v-if="row?.lx?.preHeader">
            <template v-for="(item, itemName) in row?.lx?.preHeader?.properties" :key="itemName">
              <LxStack
                v-if="item?.lx?.displayType === 'stack'"
                :id="id + '-' + name + '-' + itemName"
                :orientation="item?.lx?.orientation"
                :kind="item?.lx?.kind"
                :mode="item?.lx?.mode"
                :horizontal-alignment="item?.lx?.horizontalAlignment"
                :vertical-alignment="item?.lx?.verticalAlignment"
                :horizontal-config="item?.lx?.horizontalConfig"
                :vertical-config="item?.lx?.verticalConfig"
              >
                <template
                  v-for="(nestedItem, nestedItemName) in item?.properties"
                  :key="nestedItemName"
                >
                  <LxStack
                    v-if="nestedItem?.lx?.displayType === 'stack'"
                    :id="id + '-' + name + '-' + itemName + '-' + nestedItemName"
                    :orientation="nestedItem?.lx?.orientation"
                    :kind="nestedItem?.lx?.kind"
                    :mode="nestedItem?.lx?.mode"
                    :horizontal-alignment="nestedItem?.lx?.horizontalAlignment"
                    :vertical-alignment="nestedItem?.lx?.verticalAlignment"
                    :horizontal-config="nestedItem?.lx?.horizontalConfig"
                    :vertical-config="nestedItem?.lx?.verticalConfig"
                  >
                    <template
                      v-for="(innerNestedItem, innerNestedItemName) in nestedItem?.properties"
                      :key="innerNestedItemName"
                    >
                      <LxFormBuilderListItem
                        :itemValue="innerNestedItem"
                        :itemName="innerNestedItemName"
                      />
                    </template>
                  </LxStack>
                  <LxFormBuilderListItem
                    v-else
                    :itemValue="nestedItem"
                    :itemName="nestedItemName"
                  />
                </template>
              </LxStack>
              <LxFormBuilderListItem :itemValue="item" :itemName="itemName" v-else />
            </template>
          </template>
          <template #pre-header-info v-if="row?.lx?.preHeaderInfo">
            <LxRow
              v-for="(item, itemName) in row?.lx?.preHeaderInfo?.properties"
              :label="item?.title"
              :hideLabel="item?.lx?.hideLabel || !item?.title"
              :key="itemName"
            >
              <LxFormBuilderListItem :itemValue="item" :itemName="itemName" />
            </LxRow>
          </template>
          <template #post-header-info v-if="row?.lx?.postHeaderInfo">
            <LxRow
              v-for="(item, itemName) in row?.lx?.postHeaderInfo?.properties"
              :label="item?.title"
              :hideLabel="item?.lx?.hideLabel || !item?.title"
              :key="itemName"
            >
              <LxFormBuilderListItem :itemValue="item" :itemName="itemName" />
            </LxRow>
          </template>
          <template #post-header v-if="row?.lx?.postHeader">
            <template v-for="(item, itemName) in row?.lx?.postHeader?.properties" :key="itemName">
              <LxStack
                v-if="item?.lx?.displayType === 'stack'"
                :id="id + '-' + name + '-' + itemName"
                :orientation="item?.lx?.orientation"
                :kind="item?.lx?.kind"
                :mode="item?.lx?.mode"
                :horizontal-alignment="item?.lx?.horizontalAlignment"
                :vertical-alignment="item?.lx?.verticalAlignment"
                :horizontal-config="item?.lx?.horizontalConfig"
                :vertical-config="item?.lx?.verticalConfig"
              >
                <template
                  v-for="(nestedItem, nestedItemName) in item?.properties"
                  :key="nestedItemName"
                >
                  <LxStack
                    v-if="nestedItem?.lx?.displayType === 'stack'"
                    :id="id + '-' + name + '-' + itemName + '-' + nestedItemName"
                    :orientation="nestedItem?.lx?.orientation"
                    :kind="nestedItem?.lx?.kind"
                    :mode="nestedItem?.lx?.mode"
                    :horizontal-alignment="nestedItem?.lx?.horizontalAlignment"
                    :vertical-alignment="nestedItem?.lx?.verticalAlignment"
                    :horizontal-config="nestedItem?.lx?.horizontalConfig"
                    :vertical-config="nestedItem?.lx?.verticalConfig"
                  >
                    <template
                      v-for="(innerNestedItem, innerNestedItemName) in nestedItem?.properties"
                      :key="innerNestedItemName"
                    >
                      <LxFormBuilderListItem
                        :itemValue="innerNestedItem"
                        :itemName="innerNestedItemName"
                      />
                    </template>
                  </LxStack>
                  <LxFormBuilderListItem
                    v-else
                    :itemValue="nestedItem"
                    :itemName="nestedItemName"
                  />
                </template>
              </LxStack>
              <LxFormBuilderListItem :itemValue="item" :itemName="itemName" v-else />
            </template>
          </template>
          <template #sections>
            <template
              v-for="(item, itemName) in schema?.properties?.[name]?.properties"
              :key="itemName"
            >
              <LxSection
                v-if="item?.lx?.displayType === 'section' && item?.type === 'object'"
                :id="id + '-' + name + '-' + itemName"
                :label="item?.title"
                :description="item?.description"
                :columnCount="item?.lx?.columnCount"
                :requiredMode="item?.lx?.requiredMode"
                :icon="item?.lx?.icon"
                :iconSet="item?.lx?.iconSet"
                :customClass="item?.lx?.customClass"
                :badge="item?.lx?.badge"
                :actionDefinitions="item?.lx?.actionDefinitions"
                :orientation="item?.lx?.orientation"
                :texts="item?.lx?.texts"
                @actionClick="(a) => componentEmit('actionClick', `${name}.${itemName}`, a)"
              >
                <LxFormBuilder
                  v-if="model?.[name]"
                  :ref="(el) => (otherBuilderRefs[id + '-' + name + '-' + itemName] = el)"
                  v-model="model[name][itemName]"
                  :schema="item"
                  :readOnly="readOnly"
                  :texts="displayTexts"
                  :validations="validations?.[name]?.[itemName]"
                  mode="view-builder"
                  @rowActionClick="
                    (a, b, c, d) => rowActionClicked(a, b, `${name}.${itemName}.${c}`, d)
                  "
                  @emit="(a, b, c, d) => componentEmit(a, `${name}.${itemName}.${b}`, c, d)"
                />
              </LxSection>
            </template>
          </template>

          <LxFormBuilder
            v-if="model"
            :ref="(el) => (otherBuilderRefs[id + '-' + name] = el)"
            v-model="model[name]"
            :schema="row"
            :readOnly="readOnly"
            :texts="displayTexts"
            :validations="validations?.[name]"
            mode="view-builder"
            @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, `${name}.${c}`, d)"
            @emit="(a, b, c, d) => componentEmit(a, `${name}.${b}`, c, d)"
          />
        </LxForm>
        <LxStack
          v-else-if="row?.lx?.displayType === 'stack'"
          :id="id + '-' + name"
          :orientation="row?.lx?.orientation"
          :kind="row?.lx?.kind"
          :mode="row?.lx?.mode"
          :horizontal-alignment="row?.lx?.horizontalAlignment"
          :vertical-alignment="row?.lx?.verticalAlignment"
          :horizontal-config="row?.lx?.horizontalConfig"
          :vertical-config="row?.lx?.verticalConfig"
        >
          <template
            v-for="(item, itemName) in schema?.properties?.[name]?.properties"
            :key="itemName"
          >
            <LxStack
              v-if="item?.lx?.displayType === 'stack'"
              :id="id + '-' + name + '-' + itemName"
              :orientation="item?.lx?.orientation"
              :kind="item?.lx?.kind"
              :mode="item?.lx?.mode"
              :horizontal-alignment="item?.lx?.horizontalAlignment"
              :vertical-alignment="item?.lx?.verticalAlignment"
              :horizontal-config="item?.lx?.horizontalConfig"
              :vertical-config="item?.lx?.verticalConfig"
            >
              <template
                v-for="(item2, itemName2) in schema?.properties?.[name]?.properties?.[itemName]
                  ?.properties"
                :key="itemName2"
              >
                <LxFormBuilderItem
                  v-if="model?.[name]"
                  v-model="model[name][itemName]"
                  :schema="schema?.properties?.[name]?.properties?.[itemName]"
                  :displaySchema="displaySchema?.properties?.[name]?.properties?.[itemName]"
                  :row="item2"
                  :name="itemName2"
                  :readOnly="readOnly"
                  :parentName="`${name}.${itemName}`"
                  :vv="vv"
                  :texts="displayTexts"
                  :validations="validations?.[name]?.[itemName]"
                  @rowActionClick="
                    (a, b, c, d) => rowActionClicked(a, b, `${name}.${itemName}.${c}`, d)
                  "
                  @emit="(a, b, c, d) => componentEmit(a, `${name}.${itemName}.${b}`, c, d)"
                />
              </template>
            </LxStack>
            <LxFormBuilderItem
              v-else-if="item?.lx?.displayType !== 'stack' && model"
              v-model="model[name]"
              :schema="schema?.properties?.[name]"
              :displaySchema="displaySchema?.properties?.[name]"
              :row="item"
              :name="itemName"
              :readOnly="readOnly"
              :parentName="`${name}`"
              :vv="vv"
              :texts="displayTexts"
              :validations="validations?.[name]"
              @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, `${name}.${c}`, d)"
              @emit="(a, b, c, d) => componentEmit(a, `${name}.${b}`, c, d)"
            />
          </template>
        </LxStack>

        <LxFormBuilderItem
          v-else-if="row?.lx?.displayType !== 'filters'"
          v-model="model"
          :schema="schema"
          :displaySchema="displaySchema"
          :row="row"
          :name="name"
          :readOnly="readOnly"
          :texts="displayTexts"
          :vv="vv"
          :validations="validations"
          @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, c, d)"
          @emit="(a, b, c, d) => componentEmit(a, b, c, d)"
        />
      </template>
    </template>
    <template #default v-else>
      <LxForm>
        <LxFormBuilder
          v-model="model"
          :schema="displaySchema?.properties?.form"
          :readOnly="readOnly"
          :texts="displayTexts"
          :validations="validations"
          mode="view-builder"
          @rowActionClick="(a, b, c, d) => rowActionClicked(a, b, c, d)"
          @emit="(a, b, c, d) => componentEmit(a, b, c, d)"
        />
      </LxForm>
    </template>
  </LxViewLayout>
</template>
