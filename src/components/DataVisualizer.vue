<script setup>
import { ref, computed, watch, nextTick, defineAsyncComponent } from 'vue';
import { useElementSize } from '@vueuse/core';
import { generateUUID } from '@/utils/stringUtils';
import { getTexts } from '@/utils/visualPickerUtils';
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
  texts: {
    type: Object,
    default: () => ({
      graph: 'Grafiks',
      table: 'Tabula',
      from: 'no',
      to: 'līdz',
      target: 'Mērķis',
    }),
  },
});
const emits = defineEmits(['click']);

const latvia = getTexts('latvia');

const globalEnvironment = useLx().getGlobals()?.environment;

const maxValue = computed(() => {
  const maxItemValue = Math.max(...props.items.map((item) => item?.[props.valueAttribute]));
  const maxTargetValue = Math.max(...props.targets);
  const maxCombinedValue = Math.max(maxItemValue, maxTargetValue);

  if (props.maxValue) {
    if (props.maxValue >= maxCombinedValue) return props.maxValue + props.maxValue * 0.05;
    logWarn('maxValue is smaller than the biggest value in items and targets', globalEnvironment);
  }

  return maxCombinedValue + maxCombinedValue * 0.05;
});

function getBarWidth(item) {
  return `--bar-width: ${(item[props.valueAttribute] / maxValue.value) * 100}%`;
}

function getBarHeight(item) {
  return `--bar-height: ${(item[props.valueAttribute] / maxValue.value) * 100}%`;
}

function getTargetPosition(item) {
  return `--target-position: ${(item / maxValue.value) * 100}%`;
}

function checkValue(item, cloneThreshold, grid) {
  let res = null;
  if (!cloneThreshold?.excludes) {
    if (
      item[props.valueAttribute] >= cloneThreshold.min &&
      item[props.valueAttribute] <= cloneThreshold.max
    )
      res = !grid ? `var(--color-${cloneThreshold.color})` : cloneThreshold.color;
  } else if (cloneThreshold?.excludes === 'max') {
    if (
      item[props.valueAttribute] >= cloneThreshold.min &&
      item[props.valueAttribute] < cloneThreshold.max
    )
      res = !grid ? `var(--color-${cloneThreshold.color})` : cloneThreshold.color;
  } else if (cloneThreshold?.excludes === 'min') {
    if (
      item[props.valueAttribute] > cloneThreshold.min &&
      item[props.valueAttribute] <= cloneThreshold.max
    )
      res = !grid ? `var(--color-${cloneThreshold.color})` : cloneThreshold.color;
  } else if (cloneThreshold?.excludes === 'both') {
    if (
      item[props.valueAttribute] > cloneThreshold.min &&
      item[props.valueAttribute] < cloneThreshold.max
    )
      res = !grid ? `var(--color-${cloneThreshold.color})` : cloneThreshold.color;
  }
  return res;
}

function getBarColor(item, grid = false) {
  let color = null;
  props.thresholds?.forEach((threshold) => {
    const cloneThreshold = { ...threshold };
    if (!cloneThreshold.min) cloneThreshold.min = Number.MIN_SAFE_INTEGER;
    if (!cloneThreshold.max) cloneThreshold.max = Number.MAX_SAFE_INTEGER;
    const res = checkValue(item, cloneThreshold, grid);
    if (res) {
      color = res;
    }
  });

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

const horizontalElemDimensions = computed(() => calculateDimensions(horizontalModalRefs.value));
const verticalElemDimensions = computed(() => calculateDimensions(verticalModalRefs.value));
const horizontalTextElemDimensions = computed(() => calculateDimensions(horizontalTextRefs.value));
const verticalTextElemDimensions = computed(() => calculateDimensions(verticalTextRefs.value));

function isTextOutside(index) {
  if (
    props.kind === 'bars-horizontal' &&
    horizontalElemDimensions.value?.[index]?.width?.value > 0 &&
    horizontalTextElemDimensions.value?.[index]?.width?.value > 0 &&
    // eslint-disable-next-line no-unsafe-optional-chaining
    horizontalTextElemDimensions.value?.[index]?.width?.value + 12 >=
      horizontalElemDimensions.value?.[index]?.width?.value
  ) {
    return true;
  }

  if (
    props.kind === 'bars-vertical' &&
    verticalElemDimensions.value?.[index]?.height?.value > 0 &&
    verticalTextElemDimensions.value?.[index]?.width?.value > 0 &&
    // eslint-disable-next-line no-unsafe-optional-chaining
    verticalTextElemDimensions.value?.[index]?.width?.value + 12 >=
      verticalElemDimensions.value?.[index]?.height?.value
  ) {
    return true;
  }

  return false;
}

const columnDef = computed(() => {
  const res = [
    {
      id: 'name',
      name: 'Nosaukums',
      attributeName: 'name',
      title: 'Nosaukums',
      type: 'primary',
      kind: 'clickable',
      size: '*',
    },
    {
      id: 'value',
      name: 'Vērtība',
      attributeName: 'value',
      title: 'Vērtība',
      type: 'decimal',
      size: 's',
    },
    {
      id: 'icon',
      name: ' ',
      attributeName: 'icon',
      title: 'Icon',
      type: 'icon',
      size: 'xs',
    },
  ];
  if (props.showValues === 'never') {
    res.splice(1, 1);
  }
  return res;
});

const dataGridItems = computed(() =>
  props.items.map((item) => ({
    id: item[props.idAttribute],
    name: item[props.nameAttribute],
    value: item[props.valueAttribute],
    icon: {
      icon: 'status-default',
      category: getBarColor(item, true),
      label: item[props.valueAttribute]?.toString(),
    },
  }))
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
  { id: 'default', name: props.texts?.graph },
  { id: 'table', name: props.texts?.table },
]);

const imagePath = ref(null);

function loadImage() {
  return new Promise((resolve, reject) => {
    imagePath.value = defineAsyncComponent({
      loader: () =>
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
    res.push({ id: item, name: item, description: props.texts?.target });
  });
  return res;
});

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
        <data
          :id="`${id}-${item[idAttribute]}`"
          class="bar-name"
          :title="item?.[nameAttribute]"
          v-for="item in items"
          :key="item[idAttribute]"
          :value="item?.[valueAttribute]"
        >
          {{ item?.[nameAttribute] }}
        </data>
      </div>

      <div class="bar-wrapper bars-only" ref="horizontalBarsOnly">
        <div
          class="bar"
          :class="[
            {
              'text-outside': isTextOutside(index),
            },
          ]"
          :style="`${getBarWidth(item)}; ${getBarColor(item)}`"
          :title="
            showValues === 'never'
              ? `${item?.[nameAttribute]}`
              : `${item?.[nameAttribute]} \n${formatDecimal(item?.[valueAttribute])}`
          "
          :ref="(el) => (horizontalModalRefs[index] = el)"
          @click="$emit('click', item?.[idAttribute])"
          @keydown.space="$emit('click', item?.[idAttribute])"
          v-for="(item, index) in items"
          :key="item[idAttribute]"
          :aria-labelledby="`${id}-${item[idAttribute]}`"
        >
          <p
            v-if="showValues === 'always'"
            :ref="(el) => (horizontalTextRefs[index] = el)"
            :style="`--outside-padding: ${horizontalElemDimensions?.[index]?.width?.value}px`"
          >
            {{ item?.[valueAttribute] }}
          </p>
        </div>

        <div
          class="lx-target-wrapper"
          v-for="target in targetsComputed"
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
                <div>
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
            class="bar"
            :class="[
              {
                'text-outside': isTextOutside(index),
              },
            ]"
            :style="`${getBarHeight(item)}; ${getBarColor(item)}`"
            :title="
              showValues === 'never'
                ? `${item?.[nameAttribute]}`
                : `${item?.[nameAttribute]} \n${formatDecimal(item?.[valueAttribute])}`
            "
            :ref="(el) => (verticalModalRefs[index] = el)"
            @click="$emit('click', item?.[idAttribute])"
            @keydown.space="$emit('click', item?.[idAttribute])"
            v-for="(item, index) in items"
            :key="item[idAttribute]"
            :aria-labelledby="`${id}-${item[idAttribute]}`"
          >
            <p
              v-if="showValues === 'always'"
              :ref="(el) => (verticalTextRefs[index] = el)"
              :style="`--outside-padding: ${verticalElemDimensions?.[index]?.height?.value}px`"
            >
              {{ item?.[valueAttribute] }}
            </p>
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
                  <div>
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
          <data
            :id="`${id}-${item[idAttribute]}`"
            class="bar-name"
            :title="item?.[nameAttribute]"
            v-for="item in items"
            :key="item[idAttribute]"
            :value="item?.[valueAttribute]"
          >
            {{ item?.[nameAttribute] }}
          </data>
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
            {{ `${texts?.from || 'no'} ${formatDecimal(item?.min)}` }}
          </p>
          <p v-else-if="!item?.min">
            {{ `${texts?.to || 'līdz'} ${formatDecimal(item?.max)}` }}
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
