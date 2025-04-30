<script setup>
import { computed, ref } from 'vue';
import LxRow from '@/components/forms/Row.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxTextArea from '@/components/TextArea.vue';
import LxToggle from '@/components/Toggle.vue';
import LxValuePicker from '@/components/ValuePicker.vue';
import LxDateTimePicker from '@/components/datePicker/DateTimePicker.vue';
import LxPlaceholder from '@/components/forms/Placeholder.vue';
import LxAppendableList from '@/components/forms/AppendableList.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import LxDataBlock from '@/components/DataBlock.vue';
import LxForm from '@/components/forms/Form.vue';
import LxAppendableListSimple from '@/components/forms/AppendableListSimple.vue';
import LxList from '@/components/list/List.vue';
import LxModal from '@/components/Modal.vue';
import LxButton from '@/components/Button.vue';
import LxListItem from '@/components/list/ListItem.vue';
import LxDataGrid from '@/components/DataGrid.vue';
import LxCamera from '@/components/Camera.vue';
import LxCheckbox from '@/components/Checkbox.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxDataVisualizer from '@/components/DataVisualizer.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxFileUploader from '@/components/fileUploader/FileUploader.vue';
import LxFileViewer from '@/components/FileViewer.vue';
import LxFlag from '@/components/Flag.vue';
import LxIcon from '@/components/Icon.vue';
import LxIllustration from '@/components/Illustration.vue';
import LxLink from '@/components/Link.vue';
import LxMap from '@/components/Map.vue';
import LxMarkdownTextArea from '@/components/MarkdownTextArea.vue';
import LxNumberSlider from '@/components/NumberSlider.vue';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import LxQr from '@/components/Qr.vue';
import LxQrScanner from '@/components/QrScanner.vue';
import LxRatings from '@/components/Ratings.vue';
import LxRichTextDisplay from '@/components/RichTextDisplay.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxSteps from '@/components/Steps.vue';
import LxVisualPicker from '@/components/VisualPicker.vue';
import LxDayInput from '@/components/DayInput.vue';
import LxDrawPad from '@/components/DrawPad.vue';
import LxLogoDisplay from '@/components/LogoDisplay.vue';
import LxAutoComplete from '@/components/AutoComplete.vue';

const props = defineProps({
  id: { type: String, default: null },
  displaySchema: { type: Object, default: null },
  schema: { type: Object, default: null },
  modelValue: { type: Object, default: null },
  row: { type: Object, default: null },
  name: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  vv: { type: Object, default: null },
  invalidationMessage: { type: String, default: null },
  orderedObject: { type: Object, default: () => {} },
  texts: { type: Object, default: () => {} },
});

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

const modalRefs = ref({});
const arrayModelValue = ref({});

function examplesValue(row) {
  if (row?.lx?.placeholder) return row?.lx?.placeholder;
  if (Array.isArray(row?.examples)) return row?.examples[0];
  return row?.examples;
}

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

function rowActionClicked(action, value, schemaName, index) {
  emits('rowActionClick', action, value, schemaName, index);
}

function componentEmit(emitName, key, value = undefined, additionalParams = undefined) {
  emits('emit', emitName, key, value, additionalParams);
}

function enumToObject(value) {
  const res = [];
  value?.enum?.forEach((x) => {
    const obj = { id: x, name: x };
    res.push(obj);
  });
  return res;
}

function deleteObject(name) {
  delete model.value[name];
}

function initializeObject(name) {
  const res = {};
  // Object.entries(props.schema?.properties[name])?.forEach(([key]) => {
  Object.entries(props.displaySchema?.properties[name])?.forEach(([key]) => {
    res[key] = '';
  });
  model.value[name] = res;
}

function openObjectModal(name, rawName) {
  if (!model.value[rawName]) {
    initializeObject(rawName);
  }
  modalRefs.value[name].open();
}

function appendableListRequiredRow(requiredValue, row) {
  const find = requiredValue?.find((x) => x === row);
  if (!find) return null;
  return true;
}
function deleteArrayObject(action, value, name, actionDefinitions = undefined) {
  if (actionDefinitions && actionDefinitions?.length > 0) {
    componentEmit(action, name);
  } else if (action === 'remove') {
    if (props.displaySchema?.properties[name]?.lx?.idAttribute) {
      const index = model.value[name].findIndex(
        (x) => x[props.displaySchema?.properties[name]?.lx?.idAttribute] === value
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

function saveNewElement(name) {
  if (!model.value[name]) model.value[name] = [];
  model.value[name].push(arrayModelValue.value[`${props.id}-${name}`]);
  modalRefs.value[`${props.id}-${name}`].close();
}

function listModalAction(action, value, name, actionDefinitions = undefined) {
  if (actionDefinitions && actionDefinitions?.length > 0) {
    componentEmit(action, name);
  }
  if (action === 'click') {
    let obj = {};
    if (props.displaySchema?.properties[name]?.lx?.idAttribute) {
      obj = model.value[name].find(
        (x) => x[props.displaySchema?.properties[name]?.lx?.idAttribute] === value
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

const newObject = ref(false);

function addArrayObject(name) {
  newObject.value = true;
  const temp = ref({});
  const res = `${props.id}-${name}`;
  arrayModelValue.value[res] = temp;
  modalRefs.value[res].open();
}

function dataGridActions(action, id, additionalParameter, name, actionDefinitions = undefined) {
  if (actionDefinitions && actionDefinitions?.length > 0) {
    componentEmit(action, name);
  } else {
    if (action === 'open') {
      listModalAction('click', id, name);
    }
    if (action === 'remove') {
      deleteArrayObject(action, id, name);
    }
  }
}
</script>
<template>
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
    :invalidation-message="invalidationMessage"
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
    :invalidation-message="invalidationMessage"
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
    :invalidation-message="invalidationMessage"
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
    :invalidation-message="invalidationMessage"
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
    :invalidation-message="invalidationMessage"
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
    :invalidation-message="invalidationMessage"
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
      componentSelect(row, name) === 'objectButton' || componentSelect(row, name) === 'objectList'
    "
  >
    <LxListItem
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
      :label="texts?.addObject"
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
    :actionDefinitions="
      displaySchema?.properties[name]?.lx?.actionDefinitions || [
        { id: 'remove', title: texts?.deleteElement, icon: 'remove-item', destructive: true },
      ]
    "
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
    @actionClick="
      (val, item) =>
        deleteArrayObject(val, item, name, displaySchema?.properties[name]?.lx?.actionDefinitions)
    "
  />
  <div v-else-if="componentSelect(row, name) === 'arrayListModal'">
    <LxList
      :items="model[name]"
      :actionDefinitions="
        displaySchema?.properties[name]?.lx?.actionDefinitions || [
          { id: 'remove', title: texts?.deleteElement, icon: 'remove-item', destructive: true },
        ]
      "
      :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
      :primaryAttribute="displaySchema?.properties[name]?.lx?.primaryAttribute"
      :secondaryAttribute="displaySchema?.properties[name]?.lx?.secondaryAttribute"
      :hrefAttribute="displaySchema?.properties[name]?.lx?.hrefAttribute"
      :groupAttribute="displaySchema?.properties[name]?.lx?.groupAttribute"
      :clickableAttribute="displaySchema?.properties[name]?.lx?.primaryAttribute || 'name'"
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
      @action-click="
        (val, item) =>
          listModalAction(val, item, name, displaySchema?.properties[name]?.lx?.actionDefinitions)
      "
    >
      <template #toolbar>
        <LxButton
          v-if="!displaySchema?.properties[name]?.lx?.hideAddButton"
          icon="add-item"
          :label="texts?.addElement"
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
                      v-if="
                        componentSelect(appendableItem, appendableItemName) === 'textInputDefault'
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
    :columnDefinitions="getColumnDefinitions(displaySchema?.properties[name]?.items?.properties)"
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
      :columnDefinitions="getColumnDefinitions(displaySchema?.properties[name]?.items?.properties)"
      :scrollable="
        displaySchema?.properties[name]?.items?.properties
          ? Object?.keys(displaySchema?.properties[name]?.items?.properties)?.length > 4
          : null
      "
      :loading="displaySchema?.properties[name]?.lx?.loading"
      :busy="displaySchema?.properties[name]?.lx?.busy"
      :skeletonRowCount="displaySchema?.properties[name]?.lx?.skeletonRowCount"
      :showHeader="displaySchema?.properties[name]?.lx?.showHeader"
      :showToolbar="displaySchema?.properties[name]?.lx?.showToolbar || true"
      :showStatusBar="displaySchema?.properties[name]?.lx?.showStatusBar"
      :showAllColumns="displaySchema?.properties[name]?.lx?.showAllColumns"
      :hasSorting="displaySchema?.properties[name]?.lx?.hasSorting"
      :sortingIgnoreEmpty="displaySchema?.properties[name]?.lx?.sortingIgnoreEmpty"
      :itemsPerPage="displaySchema?.properties[name]?.lx?.itemsPerPage"
      :totalItems="displaySchema?.properties[name]?.lx?.totalItems"
      :sortingMode="displaySchema?.properties[name]?.lx?.sortingMode"
      :actionDefinitions="
        displaySchema?.properties[name]?.lx?.actionDefinitions || [
          { id: 'open', name: texts?.addElement, icon: 'open' },
          { id: 'remove', name: texts?.deleteElement, icon: 'remove-item', destructive: true },
        ]
      "
      :defaultActionName="displaySchema?.properties[name]?.lx?.defaultActionName || 'open'"
      :texts="displaySchema?.properties[name]?.lx?.texts"
      @actionClick="
        (val, item, additional) =>
          dataGridActions(
            val,
            item,
            additional,
            name,
            displaySchema?.properties[name]?.lx?.actionDefinitions
          )
      "
    >
      <template #toolbar>
        <LxButton
          v-if="!displaySchema?.properties[name]?.lx?.hideAddButton"
          icon="add-item"
          :label="texts?.addElement"
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
                      v-if="
                        componentSelect(appendableItem, appendableItemName) === 'textInputDefault'
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
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'dateTimePicker'"
            :id="name + '-' + appendableItemName + '-' + index"
            :kind="appendableItem?.format === 'date-time' ? 'dateTime' : appendableItem?.format"
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
            v-else-if="componentSelect(appendableItem, appendableItemName) === 'textInputInteger'"
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
    <template #customItem="{ index }">
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

  <LxAutoComplete
    v-else-if="componentSelect(row, name) === 'autoComplete'"
    :id="id + '-' + name"
    :items="displaySchema?.properties[name]?.lx?.items"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :dictionary="displaySchema?.properties[name]?.lx?.dictionary"
    :groupId="displaySchema?.properties[name]?.lx?.groupId"
    :queryMinLength="displaySchema?.properties[name]?.lx?.queryMinLength"
    :queryMaxLength="displaySchema?.properties[name]?.lx?.queryMaxLength"
    :queryDebounce="displaySchema?.properties[name]?.lx?.queryDebounce"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :invalid="vv?.value?.modelClone?.[name]?.$error"
    :invalidation-message="invalidationMessage"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :hasDetails="displaySchema?.properties[name]?.lx?.hasDetails"
    :selectingKind="displaySchema?.properties[name]?.type === 'array' ? 'multiple' : 'single'"
    :detailMode="displaySchema?.properties[name]?.lx?.detailMode"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :preloadedItems="displaySchema?.properties[name]?.lx?.preloadedItems"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :hasSelectAll="displaySchema?.properties[name]?.lx?.hasSelectAll"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    :searchAttributes="displaySchema?.properties[name]?.lx?.searchAttributes"
    v-model="model[name]"
    @openDetails="(a) => componentEmit('openDetails', name, a)"
  />
  <LxButton
    v-else-if="componentSelect(row, name) === 'button'"
    :id="id + '-' + name"
    :label="model[name]?.label || model[name] || displaySchema?.properties[name]?.lx?.label"
    :title="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.title
        : displaySchema?.properties[name]?.lx?.title
    "
    :busyTooltip="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.busyTooltip
        : displaySchema?.properties[name]?.lx?.busyTooltip
    "
    :icon="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.icon
        : displaySchema?.properties[name]?.lx?.icon
    "
    :iconSet="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.iconSet
        : displaySchema?.properties[name]?.lx?.iconSet
    "
    :iconVariant="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.iconVariant
        : displaySchema?.properties[name]?.lx?.iconVariant
    "
    :kind="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.kind
        : displaySchema?.properties[name]?.lx?.kind
    "
    :variant="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.variant
        : displaySchema?.properties[name]?.lx?.variant
    "
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :destructive="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.destructive
        : displaySchema?.properties[name]?.lx?.destructive
    "
    :href="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.href
        : displaySchema?.properties[name]?.lx?.href
    "
    :disabled="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.disabled
        : displaySchema?.properties[name]?.lx?.disabled
    "
    :loading="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.loading
        : displaySchema?.properties[name]?.lx?.loading
    "
    :busy="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.busy
        : displaySchema?.properties[name]?.lx?.busy
    "
    :badge="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.badge
        : displaySchema?.properties[name]?.lx?.badge
    "
    :badgeType="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.badgeType
        : displaySchema?.properties[name]?.lx?.badgeType
    "
    :active="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.active
        : displaySchema?.properties[name]?.lx?.active
    "
    :tabindex="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.tabindex
        : displaySchema?.properties[name]?.lx?.tabindex
    "
    :customClass="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.customClass
        : displaySchema?.properties[name]?.lx?.customClass
    "
    :openInNewTab="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.openInNewTab
        : displaySchema?.properties[name]?.lx?.openInNewTab
    "
    @click="(_, b) => componentEmit('click', name, b)"
  />
  <LxCamera
    v-else-if="componentSelect(row, name) === 'camera'"
    :id="id + '-' + name"
    :cameraSwitcherMode="displaySchema?.properties[name]?.lx?.cameraSwitcherMode"
    :hasFlashlightToggle="displaySchema?.properties[name]?.lx?.hasFlashlightToggle"
    :imageSize="displaySchema?.properties[name]?.lx?.imageSize"
    :preferencesId="displaySchema?.properties[name]?.lx?.preferencesId"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
  />
  <LxCheckbox
    v-else-if="componentSelect(row, name) === 'checkbox'"
    :id="id + '-' + name"
    :groupId="displaySchema?.properties[name]?.lx?.groupId"
    :label="displaySchema?.properties[name]?.lx?.label"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :value="displaySchema?.properties[name]?.lx?.value"
    :tabindex="displaySchema?.properties[name]?.lx?.tabindex"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    v-model="model[name]"
    @click="() => componentEmit('click', name)"
  />
  <LxContentSwitcher
    v-else-if="componentSelect(row, name) === 'contentSwitcher'"
    :id="id + '-' + name"
    :items="displaySchema?.properties[name]?.lx?.items"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :icon="displaySchema?.properties[name]?.lx?.icon"
    :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    v-model="model[name]"
  />
  <LxDataVisualizer
    v-else-if="componentSelect(row, name) === 'dataVisualizer'"
    :id="id + '-' + name"
    :kind="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.kind
        : displaySchema?.properties[name]?.lx?.kind
    "
    :items="model?.[name]?.items || model?.[name] || displaySchema?.properties[name]?.lx?.items"
    :thresholds="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.thresholds
        : displaySchema?.properties[name]?.lx?.thresholds
    "
    :showValues="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.showValues
        : displaySchema?.properties[name]?.lx?.showValues
    "
    :idAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.idAttribute
        : displaySchema?.properties[name]?.lx?.idAttribute
    "
    :nameAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.nameAttribute
        : displaySchema?.properties[name]?.lx?.nameAttribute
    "
    :colorAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.colorAttribute
        : displaySchema?.properties[name]?.lx?.colorAttribute
    "
    :valueAttribute="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.valueAttribute
        : displaySchema?.properties[name]?.lx?.valueAttribute
    "
    :showLegend="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.showLegend
        : displaySchema?.properties[name]?.lx?.showLegend
    "
    :targets="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.targets
        : displaySchema?.properties[name]?.lx?.targets
    "
    :maxValue="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.maxValue
        : displaySchema?.properties[name]?.lx?.maxValue
    "
    :mode="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.mode
        : displaySchema?.properties[name]?.lx?.mode
    "
    :texts="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.texts
        : displaySchema?.properties[name]?.lx?.texts
    "
    @click="(a) => componentEmit('click', name, a)"
  />
  <LxDropDownMenu v-else-if="componentSelect(row, name) === 'dropDownMenu'">
    <LxButton
      :id="id + '-' + name"
      :label="model[name]?.label || model[name] || displaySchema?.properties[name]?.lx?.label"
      :title="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.title
          : displaySchema?.properties[name]?.lx?.title
      "
      :busyTooltip="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.busyTooltip
          : displaySchema?.properties[name]?.lx?.busyTooltip
      "
      :icon="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.icon
          : displaySchema?.properties[name]?.lx?.icon
      "
      :iconSet="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.iconSet
          : displaySchema?.properties[name]?.lx?.iconSet
      "
      :iconVariant="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.iconVariant
          : displaySchema?.properties[name]?.lx?.iconVariant
      "
      :kind="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.kind
          : displaySchema?.properties[name]?.lx?.kind
      "
      :variant="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.variant
          : displaySchema?.properties[name]?.lx?.variant
      "
      :size="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.size
          : displaySchema?.properties[name]?.lx?.size
      "
      :destructive="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.destructive
          : displaySchema?.properties[name]?.lx?.destructive
      "
      :href="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.href
          : displaySchema?.properties[name]?.lx?.href
      "
      :disabled="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.disabled
          : displaySchema?.properties[name]?.lx?.disabled
      "
      :loading="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.loading
          : displaySchema?.properties[name]?.lx?.loading
      "
      :busy="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.busy
          : displaySchema?.properties[name]?.lx?.busy
      "
      :badge="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.badge
          : displaySchema?.properties[name]?.lx?.badge
      "
      :badgeType="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.badgeType
          : displaySchema?.properties[name]?.lx?.badgeType
      "
      :active="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.active
          : displaySchema?.properties[name]?.lx?.active
      "
      :tabindex="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.tabindex
          : displaySchema?.properties[name]?.lx?.tabindex
      "
      :customClass="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.customClass
          : displaySchema?.properties[name]?.lx?.customClass
      "
      :openInNewTab="
        displaySchema?.properties[name]?.type === 'object'
          ? model[name]?.openInNewTab
          : displaySchema?.properties[name]?.lx?.openInNewTab
      "
    />
    <template #panel>
      <LxButton
        v-for="(item, index) in displaySchema?.properties[name]?.lx?.items"
        :key="index"
        :label="item?.label"
        :title="item?.title"
        :busyTooltip="item?.busyTooltip"
        :icon="item?.icon"
        :iconSet="item?.iconSet"
        :iconVariant="item?.iconVariant"
        :kind="item?.kind"
        :variant="item?.variant"
        :size="item?.size"
        :destructive="item?.destructive"
        :href="item?.href"
        :disabled="item?.disabled"
        :loading="item?.loading"
        :busy="item?.busy"
        :badge="item?.badge"
        :badgeType="item?.badgeType"
        :active="item?.active"
        :tabindex="item?.tabindex"
        :customClass="item?.customClass"
        :openInNewTab="item?.openInNewTab"
        @click="() => componentEmit('click', name, item?.id || item?.label)"
      />
    </template>
  </LxDropDownMenu>

  <LxFileUploader
    v-else-if="componentSelect(row, name) === 'file'"
    :id="id + '-' + name"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :mode="displaySchema?.properties[name]?.lx?.mode"
    :draggable="displaySchema?.properties[name]?.lx?.draggable"
    :dataType="displaySchema?.properties[name]?.lx?.dataType"
    :hasSearch="displaySchema?.properties[name]?.lx?.hasSearch"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :allowedFileExtensions="displaySchema?.properties[name]?.lx?.allowedFileExtensions"
    :maxFileSize="displaySchema?.properties[name]?.lx?.maxFileSize"
    :hasDownloadButton="displaySchema?.properties[name]?.lx?.hasDownloadButton"
    :showMeta="displaySchema?.properties[name]?.lx?.showMeta"
    :maxSizeForMeta="displaySchema?.properties[name]?.lx?.maxSizeForMeta"
    :hasCamera="displaySchema?.properties[name]?.lx?.hasCamera"
    :cameraSwitcherMode="displaySchema?.properties[name]?.lx?.cameraSwitcherMode"
    :hasFlashlightToggle="displaySchema?.properties[name]?.lx?.hasFlashlightToggle"
    :imageSize="displaySchema?.properties[name]?.lx?.imageSize"
    :preferencesId="displaySchema?.properties[name]?.lx?.preferencesId"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    @onError="(a, b) => componentEmit('onError', name, a, b)"
    @downloadFile="(a) => componentEmit('downloadFile', name, a)"
  />
  <LxFileViewer
    v-else-if="componentSelect(row, name) === 'fileViewer'"
    :id="id + '-' + name"
    :scrollable="displaySchema?.properties[name]?.lx?.scrollable"
    :width="displaySchema?.properties[name]?.lx?.width"
    :height="displaySchema?.properties[name]?.lx?.height"
    :fileName="displaySchema?.properties[name]?.lx?.fileName"
    :showPrintButton="displaySchema?.properties[name]?.lx?.showPrintButton"
    :showFullScreenButton="displaySchema?.properties[name]?.lx?.showFullScreenButton"
    :primaryDownloadButton="displaySchema?.properties[name]?.lx?.primaryDownloadButton"
    :stickyHeader="displaySchema?.properties[name]?.lx?.stickyHeader"
    :zoomLevel="displaySchema?.properties[name]?.lx?.zoomLevel"
    :downloadType="displaySchema?.properties[name]?.lx?.downloadType"
    :preloadLibs="displaySchema?.properties[name]?.lx?.preloadLibs"
    v-model="model[name]"
    @download="(a) => componentEmit('download', name, a)"
  />
  <LxFlag
    v-else-if="componentSelect(row, name) === 'flag'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :title="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.title
        : displaySchema?.properties[name]?.lx?.title
    "
  />
  <LxIcon
    v-else-if="componentSelect(row, name) === 'icon'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :iconSet="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.iconSet
        : displaySchema?.properties[name]?.lx?.iconSet
    "
    :variant="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.variant
        : displaySchema?.properties[name]?.lx?.variant
    "
    :customClass="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.customClass
        : displaySchema?.properties[name]?.lx?.customClass
    "
    :animation="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.animation
        : displaySchema?.properties[name]?.lx?.animation
    "
    :meaningful="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.meaningful
        : displaySchema?.properties[name]?.lx?.meaningful
    "
    :title="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.title
        : displaySchema?.properties[name]?.lx?.title
    "
    :desc="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.desc
        : displaySchema?.properties[name]?.lx?.desc
    "
    :texts="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.texts
        : displaySchema?.properties[name]?.lx?.texts
    "
  />
  <LxIllustration
    v-else-if="componentSelect(row, name) === 'illustration'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :class="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.class
        : displaySchema?.properties[name]?.lx?.class
    "
    :animation="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.animation
        : displaySchema?.properties[name]?.lx?.animation
    "
  />
  <LxLink
    v-else-if="componentSelect(row, name) === 'link'"
    :href="model?.[name]?.href || model?.[name] || displaySchema?.properties[name]?.lx?.href"
  />

  <LxMap
    v-else-if="componentSelect(row, name) === 'map'"
    :id="id + '-' + name"
    :baseLayerDefinitions="model[name].baseLayerDefinitions"
    v-model:selectedBaseLayer="model[name].selectedBaseLayer"
    :overlayLayerDefinitions="model[name].overlayLayerDefinitions"
    v-model:selectedOverlayLayers="model[name].selectedOverlayLayers"
    v-model:zoom="model[name].zoom"
    v-model:center="model[name].center"
    :objectDefinitions="model[name].objectDefinitions"
    :showSearch="model[name].showSearch"
    :showToolbar="model[name].showToolbar"
    :ignoreThemeChange="model[name].ignoreThemeChange"
    :hasUserLocation="model[name].hasUserLocation"
    :texts="model[name].texts"
    @searched="(a) => componentEmit('searched', name, a)"
  />
  <LxMarkdownTextArea
    v-else-if="componentSelect(row, name) === 'markdownTextArea'"
    :id="id + '-' + name"
    :placeholder="examplesValue(displaySchema?.properties[name])"
    :rows="displaySchema?.properties[name]?.lx?.rows"
    :maxlength="displaySchema?.properties[name]?.maxLength"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :showColorPicker="displaySchema?.properties[name]?.lx?.showColorPicker"
    :invalid="vv?.value?.modelClone?.[name]?.$error"
    :invalidation-message="invalidationMessage"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :showLinkEditor="displaySchema?.properties[name]?.lx?.showLinkEditor"
    :tooltip="displaySchema?.properties[name]?.lx?.tooltip"
    :showPlaceholderPicker="displaySchema?.properties[name]?.lx?.showPlaceholderPicker"
    :showImagePicker="displaySchema?.properties[name]?.lx?.showImagePicker"
    :showUnderlineToggle="displaySchema?.properties[name]?.lx?.showUnderlineToggle"
    :showHeadingPicker="displaySchema?.properties[name]?.lx?.showHeadingPicker"
    :imageMaxSize="displaySchema?.properties[name]?.lx?.imageMaxSize"
    :dictionary="displaySchema?.properties[name]?.lx?.dictionary"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
    @notification="(a) => componentEmit('notification', name, a)"
    @preparedImage="
      (a, b, c, d) => componentEmit('preparedImage', name, { base64: a, id: b, alt: c, title: d })
    "
  />
  <LxNumberSlider
    v-else-if="componentSelect(row, name) === 'numberSlider'"
    :id="id + '-' + name"
    :min="displaySchema?.properties[name]?.lx?.min"
    :max="displaySchema?.properties[name]?.lx?.max"
    :step="displaySchema?.properties[name]?.lx?.step"
    :stepMultiplier="displaySchema?.properties[name]?.lx?.stepMultiplier"
    :hasInput="displaySchema?.properties[name]?.lx?.hasInput"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    v-model="model[name]"
  />
  <LxPersonDisplay
    v-else-if="componentSelect(row, name) === 'personDisplay'"
    :value="model?.[name]"
    :name="displaySchema?.properties[name]?.lx?.name"
    :size="displaySchema?.properties[name]?.lx?.size"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :description="displaySchema?.properties[name]?.lx?.description"
    :role="displaySchema?.properties[name]?.lx?.role"
    :institution="displaySchema?.properties[name]?.lx?.institution"
    :icon="displaySchema?.properties[name]?.lx?.icon"
    :iconSet="displaySchema?.properties[name]?.lx?.iconSet"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :firstNameAttribute="displaySchema?.properties[name]?.lx?.firstNameAttribute"
    :lastNameAttribute="displaySchema?.properties[name]?.lx?.lastNameAttribute"
    :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :roleAttribute="displaySchema?.properties[name]?.lx?.roleAttribute"
    :institutionAttribute="displaySchema?.properties[name]?.lx?.institutionAttribute"
    :iconAttribute="displaySchema?.properties[name]?.lx?.iconAttribute"
    :iconSetAttribute="displaySchema?.properties[name]?.lx?.iconSetAttribute"
    :maxLength="displaySchema?.properties[name]?.lx?.maxLength"
    :texts="displaySchema?.properties[name]?.lx?.texts"
  />
  <LxQr
    v-else-if="componentSelect(row, name) === 'qr'"
    :id="id + '-' + name"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
    :ignoreTheme="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.ignoreTheme
        : displaySchema?.properties[name]?.lx?.ignoreTheme
    "
  />
  <LxQrScanner
    v-else-if="componentSelect(row, name) === 'qrScanner'"
    :id="id + '-' + name"
    :formats="model?.[name]?.formats || displaySchema?.properties[name]?.lx?.formats"
    :hasFileUploader="
      model?.[name]?.hasFileUploader || displaySchema?.properties[name]?.lx?.hasFileUploader
    "
    :kind="model?.[name]?.kind || displaySchema?.properties[name]?.lx?.kind"
    :cameraSwitcherMode="
      model?.[name]?.cameraSwitcherMode || displaySchema?.properties[name]?.lx?.cameraSwitcherMode
    "
    :hasFlashlightToggle="
      model?.[name]?.hasFlashlightToggle || displaySchema?.properties[name]?.lx?.hasFlashlightToggle
    "
    :showAlerts="model?.[name]?.showAlerts || displaySchema?.properties[name]?.lx?.showAlerts"
    :labelId="model?.[name]?.labelId || displaySchema?.properties[name]?.lx?.labelId"
    :texts="model?.[name]?.texts || displaySchema?.properties[name]?.lx?.texts"
    @value="(a) => componentEmit('value', name, a)"
    @error="(a) => componentEmit('error', name, a)"
  />
  <LxRatings
    v-else-if="componentSelect(row, name) === 'ratings'"
    :mode="displaySchema?.properties[name]?.lx?.mode"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :variant="displaySchema?.properties[name]?.lx?.variant"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
  />
  <LxRichTextDisplay
    v-else-if="componentSelect(row, name) === 'richTextDisplay'"
    :id="id + '-' + name"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :loading="
      displaySchema?.properties[name]?.type === 'object'
        ? model?.[name]?.loading
        : displaySchema?.properties[name]?.lx?.loading
    "
  />
  <LxStateDisplay
    v-else-if="componentSelect(row, name) === 'stateDisplay'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :dictionary="
      displaySchema?.properties[name]?.type === 'object'
        ? model?.[name]?.dictionary
        : displaySchema?.properties[name]?.lx?.dictionary
    "
  />
  <LxSteps
    v-else-if="componentSelect(row, name) === 'steps'"
    :id="id + '-' + name"
    :items="displaySchema?.properties[name]?.lx?.items"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :idAttribute="displaySchema?.properties[name]?.lx?.idAttribute"
    :nameAttribute="displaySchema?.properties[name]?.lx?.nameAttribute"
    :descriptionAttribute="displaySchema?.properties[name]?.lx?.descriptionAttribute"
    :stateAttribute="displaySchema?.properties[name]?.lx?.stateAttribute"
    :loading="displaySchema?.properties[name]?.lx?.loading"
    :busy="displaySchema?.properties[name]?.lx?.busy"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    v-model="model[name]"
  />
  <LxVisualPicker
    v-else-if="componentSelect(row, name) === 'visualPicker'"
    :id="id + '-' + name"
    :kind="displaySchema?.properties[name]?.lx?.type === 'string' ? 'single' : 'multiple'"
    :mode="displaySchema?.properties[name]?.lx?.mode"
    :selectingKind="displaySchema?.properties[name]?.lx?.selectingKind"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
  />

  <LxDayInput
    v-else-if="componentSelect(row, name) === 'dayInput'"
    :id="id + '-' + name"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :readOnly="isReadOnly(displaySchema?.properties[name])"
    :kind="displaySchema?.properties[name]?.lx?.kind"
    :invalid="vv?.value?.modelClone?.[name]?.$error"
    :invalidationMessage="invalidationMessage"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
  />
  <LxDrawPad
    v-else-if="componentSelect(row, name) === 'drawPad'"
    :disabled="displaySchema?.properties[name]?.lx?.disabled"
    :width="displaySchema?.properties[name]?.lx?.width"
    :height="displaySchema?.properties[name]?.lx?.height"
    :instrument="displaySchema?.properties[name]?.lx?.instrument"
    :color="displaySchema?.properties[name]?.lx?.color"
    :showInstruments="displaySchema?.properties[name]?.lx?.showInstruments"
    :showColorPicker="displaySchema?.properties[name]?.lx?.showColorPicker"
    :showClearAll="displaySchema?.properties[name]?.lx?.showClearAll"
    :labelId="displaySchema?.properties[name]?.lx?.labelId"
    :texts="displaySchema?.properties[name]?.lx?.texts"
    v-model="model[name]"
  />
  <LxLogoDisplay
    v-else-if="componentSelect(row, name) === 'logoDisplay'"
    :value="model?.[name]?.value || model?.[name] || displaySchema?.properties[name]?.lx?.value"
    :kind="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.kind
        : displaySchema?.properties[name]?.lx?.kind
    "
    :size="
      displaySchema?.properties[name]?.type === 'object'
        ? model[name]?.size
        : displaySchema?.properties[name]?.lx?.size
    "
  />
  <p class="lx-data" v-else-if="componentSelect(row, name) === 'text'">
    {{ model[name] }}
  </p>
</template>
