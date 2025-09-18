<script setup>
import { ref, computed, watch, nextTick, defineAsyncComponent } from 'vue';
import { useElementSize } from '@vueuse/core';
import { generateUUID } from '@/utils/stringUtils';
import { getTexts } from '@/utils/visualPickerUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxDataGrid from '@/components/DataGrid.vue';
import LxLoader from '@/components/Loader.vue';
import { formatDecimal } from '@/utils/formatUtils';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxListItem from '@/components/list/ListItem.vue';
import { logWarn } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  kind: { type: String, default: 'bars-horizontal' }, // bars-horizontal || bars-vertical || latvia
  items: { type: Array, default: () => [] },
  thresholds: { type: Array, default: () => [] },
  showValues: { type: String, default: 'default' }, // default || always || never
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  colorAttribute: { type: String, default: 'color' },
  valueAttribute: { type: String, default: 'value' },
  showLegend: { type: Boolean, default: false },
  targets: { type: Array, default: () => [] },
  maxValue: { type: Number, default: null },
  mode: { type: String, default: 'default' }, // default || compact
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  graph: 'Grafiks',
  table: 'Tabula',
  from: 'no',
  to: 'līdz',
  target: 'Mērķis',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['click']);

const latvia = getTexts('latvia');

const globalEnvironment = useLx().getGlobals()?.environment;

const maxValue = computed(() => {
  const flattenedItems = props.items.flatMap((item) =>
    Array.isArray(item?.[props.valueAttribute]) ? item?.[props.valueAttribute] : [item]
  );
  const maxItemValue = Math.max(...flattenedItems.map((item) => item?.[props.valueAttribute] || 0));
  const maxTargetValue = Math.max(...props.targets, 0);
  const maxCombinedValue = Math.max(maxItemValue, maxTargetValue);

  if (props.maxValue) {
    if (props.maxValue >= maxCombinedValue) {
      return props.maxValue + props.maxValue * 0.05;
    }
    logWarn('maxValue is smaller than the biggest value in items and targets', globalEnvironment);
  }

  return maxCombinedValue + maxCombinedValue * 0.05;
});

function getBarWidth(item) {
  const value = item[props.valueAttribute];

  if (Array.isArray(value)) {
    return '--bar-width: 100%;';
  }

  return `--bar-width: ${
    value !== undefined && !Number.isNaN(value) ? (value / maxValue.value) * 100 : 0
  }%;`;
}

function getBarHeight(item) {
  const value = item[props.valueAttribute];

  if (Array.isArray(value)) {
    return '--bar-height: 100%;';
  }

  return `--bar-height: ${
    value !== undefined && !Number.isNaN(value) ? (value / maxValue.value) * 100 : 0
  }%;`;
}

function getTargetPosition(item) {
  return `--target-position: ${(item / maxValue.value) * 100}%`;
}

function getSubItemCount(subItems) {
  return Array.isArray(subItems) ? `--sub-item-count: ${subItems.length}` : '';
}

function checkValue(item, cloneThreshold, grid) {
  if (!cloneThreshold) return null;

  const { excludes, min, max, color } = cloneThreshold;
  const value = item[props.valueAttribute];
  const getColor = () => (!grid ? `var(--color-${color})` : color);

  if (
    (!excludes && value >= min && value <= max) ||
    (excludes === 'max' && value >= min && value < max) ||
    (excludes === 'min' && value > min && value <= max) ||
    (excludes === 'both' && value > min && value < max)
  ) {
    return getColor();
  }

  return null;
}

function getBarColor(item, grid = false) {
  let color = null;

  if (!props.thresholds || props.thresholds.length === 0) {
    if (grid && item[props.colorAttribute]) {
      color = item[props.colorAttribute];
    }
  } else {
    props.thresholds.forEach((threshold) => {
      const cloneThreshold = { ...threshold };
      if (!cloneThreshold.min) cloneThreshold.min = Number.MIN_SAFE_INTEGER;
      if (!cloneThreshold.max) cloneThreshold.max = Number.MAX_SAFE_INTEGER;

      const res = checkValue(item, cloneThreshold, grid);

      if (res) {
        color = res;
      }
    });
  }

  if (color && grid) {
    return color;
  }

  if (color) {
    return props.kind === 'bars-horizontal' || props.kind === 'bars-vertical'
      ? `--bar-color: ${color}`
      : color;
  }

  if (item[props.colorAttribute])
    return props.kind === 'bars-horizontal' || props.kind === 'bars-vertical'
      ? `--bar-color: var(--color-${item[props.colorAttribute]})`
      : `var(--color-${item[props.colorAttribute]})`;

  return props.kind === 'bars-horizontal' || props.kind === 'bars-vertical'
    ? '--bar-color: var(--color-data)'
    : 'var(--color-data)';
}

function colorSvg() {
  const rootElement = document.getElementById('LV_Region');
  Object.entries(latvia)?.forEach(([key, value]) => {
    const element = rootElement?.querySelector(`#lx-${key}`);
    if (element) {
      element.style.fill = 'inherit';
      const res = element.querySelector('title');
      res.textContent = value;
    }
  });
  props.items.forEach((item) => {
    if (Array.isArray(item?.[props.valueAttribute])) return;

    const country = document.getElementById(`lx-${item[props.idAttribute]}`);
    const color = getBarColor(item);
    if (country) {
      if (color) country.style.fill = color;
      if (props.showValues !== 'never') {
        const res = country.querySelector('title');
        res.textContent = `${item[props.nameAttribute]} \n${item[props.valueAttribute]}`;
      }
    }
  });
}

function calculateDimensions(obj) {
  const res = {};
  Object.entries(obj)?.forEach(([key, value]) => {
    const { width, height } = useElementSize(value);
    res[key] = { width, height };
  });
  return res;
}

const horizontalModalRefs = ref({});
const verticalModalRefs = ref({});
const horizontalTextRefs = ref({});
const verticalTextRefs = ref({});

const horizontalSubModalRefs = ref({});
const verticalSubModalRefs = ref({});
const horizontalSubTextRefs = ref({});
const verticalSubTextRefs = ref({});

const horizontalElemDimensions = computed(() => calculateDimensions(horizontalModalRefs.value));
const verticalElemDimensions = computed(() => calculateDimensions(verticalModalRefs.value));
const horizontalTextElemDimensions = computed(() => calculateDimensions(horizontalTextRefs.value));
const verticalTextElemDimensions = computed(() => calculateDimensions(verticalTextRefs.value));

const horizontalSubElemDimensions = computed(() =>
  calculateDimensions(horizontalSubModalRefs.value)
);
const verticalSubElemDimensions = computed(() => calculateDimensions(verticalSubModalRefs.value));
const horizontalTextSubElemDimensions = computed(() =>
  calculateDimensions(horizontalSubTextRefs.value)
);
const verticalTextSubElemDimensions = computed(() =>
  calculateDimensions(verticalSubTextRefs.value)
);

function isTextOutside(index) {
  return (
    (props.kind === 'bars-horizontal' &&
      horizontalElemDimensions.value?.[index]?.width?.value > 0 &&
      horizontalTextElemDimensions.value?.[index]?.width?.value > 0 &&
      // eslint-disable-next-line no-unsafe-optional-chaining
      horizontalTextElemDimensions.value?.[index]?.width?.value + 12 >=
        horizontalElemDimensions.value?.[index]?.width?.value) ||
    (props.kind === 'bars-vertical' &&
      verticalElemDimensions.value?.[index]?.height?.value > 0 &&
      verticalTextElemDimensions.value?.[index]?.width?.value > 0 &&
      // eslint-disable-next-line no-unsafe-optional-chaining
      verticalTextElemDimensions.value?.[index]?.width?.value + 12 >=
        verticalElemDimensions.value?.[index]?.height?.value)
  );
}

function isSubTextOutside(index) {
  return (
    (props.kind === 'bars-horizontal' &&
      horizontalSubElemDimensions.value?.[index]?.width?.value > 0 &&
      horizontalTextSubElemDimensions.value?.[index]?.width?.value > 0 &&
      // eslint-disable-next-line no-unsafe-optional-chaining
      horizontalTextSubElemDimensions.value?.[index]?.width?.value + 12 >=
        horizontalSubElemDimensions.value?.[index]?.width?.value) ||
    (props.kind === 'bars-vertical' &&
      verticalSubElemDimensions.value?.[index]?.height?.value > 0 &&
      verticalTextSubElemDimensions.value?.[index]?.width?.value > 0 &&
      // eslint-disable-next-line no-unsafe-optional-chaining
      verticalTextSubElemDimensions.value?.[index]?.width?.value + 12 >=
        verticalSubElemDimensions.value?.[index]?.height?.value)
  );
}

const hasSubBars = computed(() =>
  props.items.some((item) => Array.isArray(item?.[props.valueAttribute]))
);

const columnDef = computed(() => {
  const res = [];
  res.push({
    id: 'name',
    name: 'Nosaukums',
    attributeName: 'name',
    title: 'Nosaukums',
    type: 'primary',
    kind: 'clickable',
    size: '*',
  });

  if (hasSubBars.value) {
    res.push({
      id: 'group',
      name: 'Grupa',
      attributeName: 'group',
      title: 'Grupa',
      type: 'primary',
      size: '*',
    });
  }

  res.push({
    id: 'value',
    name: 'Vērtība',
    attributeName: 'value',
    title: 'Vērtība',
    type: 'decimal',
    size: 's',
  });

  res.push({
    id: 'icon',
    name: ' ',
    attributeName: 'icon',
    title: 'Icon',
    type: 'icon',
    size: 'xs',
  });

  if (props.showValues === 'never') {
    res.splice(1, 1);
  }
  return res;
});

const dataGridItems = computed(() =>
  props.items.flatMap((item) => {
    const itemWithSubBars = Array.isArray(item?.[props.valueAttribute]);

    // If kind is 'latvia', exclude items that have sub-bars
    if (props.kind === 'latvia' && itemWithSubBars) return [];

    if (itemWithSubBars) {
      const valueArray = item[props.valueAttribute];

      return valueArray.map((subItem) => ({
        id: subItem[props.idAttribute],
        name: subItem[props.nameAttribute],
        value: subItem[props.valueAttribute],
        group: item[props.nameAttribute],
        icon: {
          icon: 'status-default',
          category: getBarColor(subItem, true),
          label: subItem[props.valueAttribute]?.toString(),
        },
      }));
    }

    return {
      id: item[props.idAttribute],
      name: item[props.nameAttribute],
      value: item[props.valueAttribute],
      group: null,
      icon: {
        icon: 'status-default',
        category: getBarColor(item, true),
        label: item[props.valueAttribute]?.toString(),
      },
    };
  })
);

function gridClick(a, b) {
  emits('click', b);
}

function imageClick(event) {
  let element = event.target?.id;
  if (!element) element = event.target?.parentNode?.id;
  if (element?.includes('-')) element = element?.split('-')[1];
  if (element) emits('click', element);
}

const contentModel = ref('default');

const contentItems = computed(() => [
  { id: 'default', name: displayTexts.value?.graph },
  { id: 'table', name: displayTexts.value?.table },
]);

const imagePath = ref(null);

function loadImage() {
  return new Promise((resolve, reject) => {
    imagePath.value = defineAsyncComponent({
      loader: () =>
        // @ts-ignore
        import('@/components/visualPickerPictures/Latvia.vue')
          .then(async (component) => {
            resolve(component);
            return component;
          })
          .catch((error) => {
            reject(error);
          }),
    });
  });
}

watch(
  () => [props.items, props.thresholds, props.showValues],
  () => {
    if (props.kind === 'latvia') {
      nextTick(() => colorSvg());
    }
  },
  { deep: true, immediate: true }
);

const loading = ref(false);

async function getImage() {
  try {
    loading.value = true;
    await loadImage();
  } catch (e) {
    return;
  } finally {
    setTimeout(() => {
      loading.value = false;
      colorSvg();
    }, 50);
  }
}

const horizontalBarsOnly = ref();
const verticalBarsOnly = ref();

const barsOnlyWidth = computed(() => useElementSize(horizontalBarsOnly).width);
const barsOnlyHeight = computed(() => useElementSize(verticalBarsOnly).height);

const targetsComputed = computed(() => {
  const objArray = [...props.targets]
    .sort((a, b) => a - b)
    .map((item) => ({ value: item, count: 1 }));

  const res = [];

  for (let i = 0, j = 0; i < objArray.length; i += 1) {
    let location;
    if (props.kind === 'bars-horizontal') {
      // item location in px
      location = (objArray[i].value / maxValue.value) * barsOnlyWidth.value.value;
    }
    if (props.kind === 'bars-vertical') {
      // item location in px
      location = (objArray[i].value / maxValue.value) * barsOnlyHeight.value.value;
    }

    // if gap smaller than 48px(3rem), than marge
    if (res[j - 1]?.value && location - res[j - 1].value < 48) {
      // value of items in px for comparison
      res[j - 1].value = (res[j - 1].value + location) / 2;
      // count of items in this location
      res[j - 1].count += 1;
      // absolute value of items in this location
      res[j - 1].absoluteValue = (res[j - 1].absoluteValue + objArray[i].value) / 2;
      // list of items in this location
      res[j - 1].list.push(objArray[i].value);
    } else {
      res.push({
        value: location,
        count: 1,
        locationRaw: (objArray[i].value / maxValue.value) * 100, // item location in %
        absoluteValue: objArray[i].value,
        list: [objArray[i].value],
      });
      j += 1;
    }
  }
  return res;
});

const targetsList = computed(() => {
  const res = [];
  props.targets.forEach((item) => {
    res.push({ id: item, name: item, description: displayTexts.value?.target });
  });
  return res;
});

const isRegularBar = (index) => !Array.isArray(props.items[index]?.[props.valueAttribute]);

const hasSubBarBefore = (index) => {
  if (!isRegularBar(index)) return false;
  return index > 0 && Array.isArray(props.items[index - 1]?.[props.valueAttribute]);
};

const hasSubBarAfter = (index) => {
  if (!isRegularBar(index)) return false;
  return (
    index < props.items.length - 1 && Array.isArray(props.items[index + 1]?.[props.valueAttribute])
  );
};

watch(
  () => props.kind,
  async (newValue) => {
    if (newValue === 'latvia') {
      getImage();
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => props.mode,
  async (newValue) => {
    if (newValue === 'compact' && contentModel.value === 'table') {
      contentModel.value = 'default';
    }
  }
);
</script>
<template>
  <div class="lx-data-visualizer" :id="id">
    <LxContentSwitcher
      :items="contentItems"
      v-model="contentModel"
      v-if="mode === 'default' && items?.length > 0"
    />
    <div
      class="lx-bars-horizontal"
      v-if="kind === 'bars-horizontal' && contentModel === 'default'"
      :class="[{ 'show-legend': showLegend }, { 'has-targets': targets?.length > 0 }]"
      :style="`--item-count: ${items?.length}`"
    >
      <div class="bar-wrapper">
        <template v-for="(item, index) in items" :key="item[idAttribute]">
          <!-- If item has sub-items, render each subItem as its own <data> tag -->
          <div class="lx-bar-group" v-if="Array.isArray(item?.[valueAttribute])">
            <p
              v-if="Array.isArray(item?.[valueAttribute])"
              class="lx-bar-group-label"
              :title="item?.[nameAttribute]"
            >
              {{ item?.[nameAttribute] }}
            </p>

            <data
              v-for="subItem in item[valueAttribute]"
              :key="subItem[idAttribute]"
              :id="`${id}-${subItem[idAttribute]}`"
              class="bar-name sub-bar"
              :title="subItem?.[nameAttribute]"
              :value="subItem?.[valueAttribute]"
            >
              {{ subItem?.[nameAttribute] }}
            </data>
          </div>

          <!-- If item does not have sub-items, render normally -->
          <data
            v-else
            :id="`${id}-${item[idAttribute]}`"
            class="bar-name"
            :class="[
              {
                'sub-bar-before': hasSubBarBefore(index),
                'sub-bar-after': hasSubBarAfter(index),
              },
            ]"
            :title="item?.[nameAttribute]"
            :value="item?.[valueAttribute]"
          >
            {{ item?.[nameAttribute] }}
          </data>
        </template>
      </div>

      <div class="bar-wrapper bars-only" ref="horizontalBarsOnly">
        <div
          v-for="(item, index) in items"
          :key="item[idAttribute]"
          :ref="(el) => (horizontalModalRefs[index] = el)"
          class="bar"
          :class="[
            {
              'text-outside': isTextOutside(index),
              'with-sub-bars': Array.isArray(item?.[valueAttribute]),
              'sub-bar-before': hasSubBarBefore(index),
              'sub-bar-after': hasSubBarAfter(index),
            },
          ]"
          :style="`${getBarWidth(item)}; ${getBarColor(item)}; ${getSubItemCount(
            item?.[valueAttribute]
          )}`"
          :title="
            Array.isArray(item?.[valueAttribute])
              ? null
              : showValues === 'never'
              ? `${item?.[nameAttribute]}`
              : `${item?.[nameAttribute]} \n${formatDecimal(item?.[valueAttribute] ?? 0)}`
          "
          :aria-labelledby="`${id}-${item[idAttribute]}`"
          @click="
            !Array.isArray(item?.[valueAttribute]) ? $emit('click', item?.[idAttribute]) : null
          "
          @keydown.space="
            !Array.isArray(item?.[valueAttribute]) ? $emit('click', item?.[idAttribute]) : null
          "
        >
          <!-- Check if item value is an array -->
          <template v-if="Array.isArray(item?.[valueAttribute])">
            <div class="sub-bar-wrapper bars-only">
              <div
                v-for="(subItem, subIndex) in item?.[valueAttribute]"
                :key="subItem[idAttribute]"
                :ref="(el) => (horizontalSubModalRefs[`${index}-${subIndex}`] = el)"
                class="sub-bar"
                :class="[
                  {
                    'text-outside': isSubTextOutside(`${index}-${subIndex}`),
                  },
                ]"
                :style="`${getBarWidth(subItem)}; ${getBarColor(subItem)}`"
                :title="
                  showValues === 'never'
                    ? `${subItem?.[nameAttribute]}`
                    : `${subItem?.[nameAttribute]} \n${formatDecimal(
                        subItem?.[valueAttribute] ?? 0
                      )}`
                "
                :aria-labelledby="`${id}-${subItem[idAttribute]}`"
                @click="$emit('click', subItem?.[idAttribute])"
                @keydown.space="$emit('click', subItem?.[idAttribute])"
              >
                <p
                  v-if="showValues === 'always'"
                  :ref="(el) => (horizontalSubTextRefs[`${index}-${subIndex}`] = el)"
                  :style="`--outside-padding: ${
                    horizontalSubElemDimensions?.[`${index}-${subIndex}`]?.width?.value
                  }px`"
                >
                  {{ subItem?.[valueAttribute] }}
                </p>
              </div>
            </div>
          </template>

          <!-- If it's a regular value, render it normally -->
          <template v-else>
            <p
              v-if="showValues === 'always'"
              :ref="(el) => (horizontalTextRefs[index] = el)"
              :style="`--outside-padding: ${horizontalElemDimensions?.[index]?.width?.value}px`"
            >
              {{ item?.[valueAttribute] }}
            </p>
          </template>
        </div>

        <div
          v-for="target in targetsComputed"
          class="lx-target-wrapper"
          :key="target?.value"
          :style="`${getTargetPosition(target.absoluteValue)}`"
          :class="[{ 'lx-target-wrapper-multiple': target.list?.length > 1 }]"
        >
          <div class="lx-target-header" v-if="showValues !== 'never' || target.list?.length > 1">
            <div class="target-value" v-if="target.list?.length == 1" :title="target.absoluteValue">
              {{ target.absoluteValue }}
            </div>

            <div class="target-value-multiple" v-else>
              <LxInfoWrapper offsetDistance="8">
                <div class="target-value-multiple-inner">
                  {{ target.count }}
                </div>

                <template #panel>
                  <div>
                    <div v-for="item in target.list" :key="item">
                      {{ item }}
                    </div>
                  </div>
                </template>
              </LxInfoWrapper>
            </div>
          </div>

          <div class="lx-target" />
        </div>
      </div>
    </div>

    <div
      v-else-if="kind === 'bars-vertical' && contentModel === 'default'"
      class="lx-bars-vertical-container"
      :class="[{ 'show-legend': showLegend }]"
    >
      <div
        class="lx-bars-vertical"
        :class="[{ 'show-legend': showLegend }, { 'has-targets': targets?.length > 0 }]"
        :style="`--item-count: ${items?.length}`"
      >
        <div class="bar-wrapper bars-only" ref="verticalBarsOnly">
          <div
            v-for="(item, index) in items"
            :key="item[idAttribute]"
            :ref="(el) => (verticalModalRefs[index] = el)"
            class="bar"
            :class="[
              {
                'text-outside': isTextOutside(index),
                'with-sub-bars': Array.isArray(item?.[valueAttribute]),
                'sub-bar-before': hasSubBarBefore(index),
                'sub-bar-after': hasSubBarAfter(index),
              },
            ]"
            :style="`${getBarHeight(item)}; ${getBarColor(item)}; ${getSubItemCount(
              item?.[valueAttribute]
            )}`"
            :title="
              Array.isArray(item?.[valueAttribute])
                ? null
                : showValues === 'never'
                ? `${item?.[nameAttribute]}`
                : `${item?.[nameAttribute]} \n${formatDecimal(item?.[valueAttribute] ?? 0)}`
            "
            :aria-labelledby="`${id}-${item[idAttribute]}`"
            @click="
              !Array.isArray(item?.[valueAttribute]) ? $emit('click', item?.[idAttribute]) : null
            "
            @keydown.space="
              !Array.isArray(item?.[valueAttribute]) ? $emit('click', item?.[idAttribute]) : null
            "
          >
            <!-- Check if item value is an array -->
            <template v-if="Array.isArray(item?.[valueAttribute])">
              <div class="sub-bar-wrapper bars-only">
                <div
                  v-for="(subItem, subIndex) in item?.[valueAttribute]"
                  :key="subItem[idAttribute]"
                  :ref="(el) => (verticalSubModalRefs[`${index}-${subIndex}`] = el)"
                  class="sub-bar"
                  :class="[
                    {
                      'text-outside': isSubTextOutside(`${index}-${subIndex}`),
                    },
                  ]"
                  :style="`${getBarHeight(subItem)}; ${getBarColor(subItem)}`"
                  :title="
                    showValues === 'never'
                      ? `${subItem?.[nameAttribute]}`
                      : `${subItem?.[nameAttribute]} \n${formatDecimal(
                          subItem?.[valueAttribute] ?? 0
                        )}`
                  "
                  :aria-labelledby="`${id}-${subItem[idAttribute]}`"
                  @click="$emit('click', subItem?.[idAttribute])"
                  @keydown.space="$emit('click', subItem?.[idAttribute])"
                >
                  <p
                    v-if="showValues === 'always'"
                    :ref="(el) => (verticalSubTextRefs[`${index}-${subIndex}`] = el)"
                    :style="`--outside-padding: ${
                      verticalSubElemDimensions?.[`${index}-${subIndex}`]?.height?.value
                    }px`"
                  >
                    {{ subItem?.[valueAttribute] }}
                  </p>
                </div>
              </div>
            </template>

            <!-- If it's a regular value, render it normally -->
            <template v-else>
              <p
                v-if="showValues === 'always'"
                :ref="(el) => (verticalTextRefs[index] = el)"
                :style="`--outside-padding: ${verticalElemDimensions?.[index]?.height?.value}px`"
              >
                {{ item?.[valueAttribute] }}
              </p>
            </template>
          </div>

          <div
            class="lx-target-wrapper"
            v-for="target in targetsComputed"
            :key="target?.value"
            :style="`${getTargetPosition(target.absoluteValue)}`"
            :class="[{ 'lx-target-wrapper-multiple': target.list?.length > 1 }]"
          >
            <div class="lx-target-header" v-if="showValues !== 'never' || target.list?.length > 1">
              <div
                class="target-value"
                v-if="target.list?.length == 1"
                :title="target.absoluteValue"
              >
                {{ target.absoluteValue }}
              </div>

              <div class="target-value-multiple" v-else>
                <LxInfoWrapper offsetDistance="8">
                  <div class="target-value-multiple-inner">
                    {{ target.count }}
                  </div>

                  <template #panel>
                    <div>
                      <div v-for="item in target.list" :key="item">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </LxInfoWrapper>
              </div>
            </div>

            <div class="lx-target" />
          </div>
        </div>

        <div class="bar-wrapper legends">
          <template v-for="(item, index) in items" :key="item[idAttribute]">
            <!-- If item has sub-items, render each subItem as its own <data> tag -->
            <div class="lx-bar-group" v-if="Array.isArray(item?.[valueAttribute])">
              <p
                v-if="Array.isArray(item?.[valueAttribute])"
                class="lx-bar-group-label"
                :title="item?.[nameAttribute]"
              >
                {{ item?.[nameAttribute] }}
              </p>

              <data
                v-for="subItem in item[valueAttribute]"
                :key="subItem[idAttribute]"
                :id="`${id}-${subItem[idAttribute]}`"
                class="bar-name sub-bar"
                :title="subItem?.[nameAttribute]"
                :value="subItem?.[valueAttribute]"
              >
                {{ subItem?.[nameAttribute] }}
              </data>
            </div>

            <!-- If item does not have sub-items, render normally -->
            <data
              v-else
              :id="`${id}-${item[idAttribute]}`"
              class="bar-name"
              :class="[
                {
                  'sub-bar-before': hasSubBarBefore(index),
                  'sub-bar-after': hasSubBarAfter(index),
                },
              ]"
              :title="item?.[nameAttribute]"
              :value="item?.[valueAttribute]"
            >
              {{ item?.[nameAttribute] }}
            </data>
          </template>
        </div>
      </div>
    </div>

    <div
      v-else-if="kind === 'latvia' && contentModel === 'default'"
      class="lx-latvia-visualizer"
      :class="[{ 'show-legend': showLegend }]"
    >
      <imagePath @click="imageClick($event)" v-show="!loading" />
      <LxLoader :loading="true" v-if="loading" />
    </div>

    <LxDataGrid
      v-else-if="mode === 'default' && contentModel === 'table'"
      :column-definitions="columnDef"
      :items="dataGridItems"
      :has-sorting="true"
      @action-click="gridClick"
    />

    <div class="lx-legend" v-if="showLegend && contentModel === 'default'">
      <div v-for="item in thresholds" :key="item?.color">
        <div class="legend-item" :style="`--legend-color: var(--color-${item?.color})`">
          <div class="legend-indicator" />
          <p v-if="item?.min && item?.max">
            {{ `${formatDecimal(item?.min)} - ${formatDecimal(item?.max)}` }}
          </p>
          <p v-else-if="!item?.max">
            {{ `${displayTexts.from || 'no'} ${formatDecimal(item?.min)}` }}
          </p>
          <p v-else-if="!item?.min">
            {{ `${displayTexts.to || 'līdz'} ${formatDecimal(item?.max)}` }}
          </p>
        </div>
      </div>
    </div>
    <div
      class="targets-list"
      v-if="
        contentModel === 'table' &&
        targets?.length > 0 &&
        showValues !== 'never' &&
        (kind === 'bars-horizontal' || kind === 'bars-vertical')
      "
    >
      <LxListItem
        v-for="item in targetsList"
        :key="item"
        :label="item.name"
        :description="item.description"
      />
    </div>
  </div>
</template>
