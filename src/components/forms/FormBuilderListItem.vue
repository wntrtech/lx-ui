<script setup>
import LxFlag from '@/components/Flag.vue';
import LxStateDisplay from '@/components/StateDisplay.vue';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import LxIcon from '@/components/Icon.vue';

import { formatValue } from '@/utils/formatUtils';

defineProps({
  item: { type: Object, default: () => ({}) },
  itemValue: { type: Object, default: () => ({}) },
  itemName: { type: String, default: '' },
  useStyles: { type: Boolean, default: false },
});

function getElementStyles(item) {
  let res = '';
  if (item?.lx?.stackRow) {
    res += `grid-row: ${item?.lx?.stackRow};`;
  }
  if (item?.lx?.stackColumn) {
    res += `grid-column: ${item?.lx?.stackColumn};`;
  }
  return res;
}

function getType(itemValue) {
  if (itemValue?.type === 'boolean') {
    return 'bool';
  }
  if (itemValue?.type === 'array') {
    return 'array';
  }
  if (itemValue?.type === 'string' && itemValue?.format === 'date') {
    return 'date';
  }
  if (
    itemValue?.type === 'string' &&
    (itemValue?.format === 'dateTime' || itemValue?.format === 'date-time')
  ) {
    return 'dateTime';
  }
  return 'default';
}

function listDisplayText(itemValue, item, itemName) {
  return formatValue(
    item?.[itemName] || itemValue?.lx?.value,
    getType(itemValue),
    itemValue?.lx?.texts
      ? { yes: itemValue?.lx?.texts?.valueYes, no: itemValue?.lx?.texts?.valueNo }
      : undefined
  );
}
</script>
<template>
  <p
    class="lx-primary"
    v-if="itemValue?.lx?.displayType === 'primaryText'"
    :style="useStyles ? getElementStyles(itemValue) : null"
  >
    {{ listDisplayText(itemValue, item, itemName) }}
  </p>
  <p
    class="lx-secondary"
    v-else-if="itemValue?.lx?.displayType === 'secondaryText'"
    :style="useStyles ? getElementStyles(itemValue) : null"
  >
    {{ listDisplayText(itemValue, item, itemName) }}
  </p>

  <LxFlag
    v-else-if="itemValue?.lx?.displayType === 'flag'"
    :value="item?.[itemName]?.value || item?.[itemName] || itemValue?.lx?.value"
    :size="item?.[itemName]?.size || itemValue?.lx?.size"
    :title="item?.[itemName]?.title || itemValue?.lx?.title"
    :style="useStyles ? getElementStyles(itemValue) : null"
  />

  <LxStateDisplay
    v-else-if="itemValue?.lx?.displayType === 'stateDisplay'"
    :value="item?.[itemName]?.value || item?.[itemName] || itemValue?.lx?.value"
    :dictionary="item?.[itemName]?.dictionary || itemValue?.lx?.dictionary"
    :style="useStyles ? getElementStyles(itemValue) : null"
  />

  <LxPersonDisplay
    v-else-if="itemValue?.lx?.displayType === 'personDisplay'"
    :value="item?.[itemName]?.value || item?.[itemName] || itemValue?.lx?.value"
    :name="item?.[itemName]?.name || itemValue?.lx?.name"
    :size="item?.[itemName]?.size || itemValue?.lx?.size"
    :variant="item?.[itemName]?.variant || itemValue?.lx?.variant"
    :description="item?.[itemName]?.description || itemValue?.lx?.description"
    :role="item?.[itemName]?.role || itemValue?.lx?.role"
    :institution="item?.[itemName]?.institution || itemValue?.lx?.institution"
    :icon="item?.[itemName]?.icon || itemValue?.lx?.icon"
    :iconSet="item?.[itemName]?.iconSet || itemValue?.lx?.iconSet"
    :idAttribute="item?.[itemName]?.idAttribute || itemValue?.lx?.idAttribute"
    :nameAttribute="item?.[itemName]?.nameAttribute || itemValue?.lx?.nameAttribute"
    :firstNameAttribute="item?.[itemName]?.firstNameAttribute || itemValue?.lx?.firstNameAttribute"
    :lastNameAttribute="item?.[itemName]?.lastNameAttribute || itemValue?.lx?.lastNameAttribute"
    :descriptionAttribute="
      item?.[itemName]?.descriptionAttribute || itemValue?.lx?.descriptionAttribute
    "
    :roleAttribute="item?.[itemName]?.roleAttribute || itemValue?.lx?.roleAttribute"
    :institutionAttribute="
      item?.[itemName]?.institutionAttribute || itemValue?.lx?.institutionAttribute
    "
    :iconAttribute="item?.[itemName]?.iconAttribute || itemValue?.lx?.iconAttribute"
    :iconSetAttribute="item?.[itemName]?.iconSetAttribute || itemValue?.lx?.iconSetAttribute"
    :maxLength="item?.[itemName]?.maxLength || itemValue?.lx?.maxLength"
    :texts="item?.[itemName]?.texts || itemValue?.lx?.texts"
    :style="useStyles ? getElementStyles(itemValue) : null"
  />

  <LxIcon
    v-else-if="itemValue?.lx?.displayType === 'icon'"
    :value="item?.[itemName]?.value || item?.[itemName] || itemValue?.lx?.value"
    :iconSet="item?.[itemName]?.iconSet || itemValue?.lx?.iconSet"
    :variant="item?.[itemName]?.variant || itemValue?.lx?.variant"
    :customClass="item?.[itemName]?.customClass || itemValue?.lx?.customClass"
    :animation="item?.[itemName]?.animation || itemValue?.lx?.animation"
    :meaningful="item?.[itemName]?.meaningful || itemValue?.lx?.meaningful"
    :title="item?.[itemName]?.title || itemValue?.lx?.title"
    :desc="item?.[itemName]?.desc || itemValue?.lx?.desc"
    :texts="item?.[itemName]?.texts || itemValue?.lx?.texts"
    :style="useStyles ? getElementStyles(itemValue) : null"
  />
  <p v-else :style="useStyles ? getElementStyles(itemValue) : null">
    {{ listDisplayText(itemValue, item, itemName) }}
  </p>
</template>
