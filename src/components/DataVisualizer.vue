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

const props = defineProps({
  id: { type: String, default: generateUUID() },
  kind: { type: String, default: 'bars-horizontal' }, // bars-horizontal || latvia
  items: { type: Array, default: () => [] },
  thresholds: { type: Array, default: () => [] },
  showValues: { type: String, default: 'default' }, // default || always || never
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  colorAttribute: { type: String, default: 'color' },
  valueAttribute: { type: String, default: 'value' },
  showLegend: { type: Boolean, default: false },
  targets: { type: Array, default: () => [] },
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

const maxValue = computed(
  () =>
    Math.max(...props.items.map((item) => item?.[props.valueAttribute])) +
    Math.max(...props.items.map((item) => item?.[props.valueAttribute])) * 0.05
);

function getBarWidth(item) {
  return `--bar-width: ${(item[props.valueAttribute] / maxValue.value) * 100}%`;
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
    return props.kind === 'bars-horizontal' ? `--bar-color: ${color}` : color;
  }
  if (item[props.colorAttribute])
    return props.kind === 'bars-horizontal'
      ? `--bar-color: var(--color-${item[props.colorAttribute]})`
      : `var(--color-${item[props.colorAttribute]})`;
  return props.kind === 'bars-horizontal' ? '--bar-color: var(--color-data)' : 'var(--color-data)';
}

function colorSvg() {
  const rootElement = document.getElementById('LV_Region');
  Object.entries(latvia)?.forEach(([key, value]) => {
    const safeKey = CSS.escape(key);
    const element = rootElement?.querySelector(`#${safeKey}`);
    if (element) {
      element.style.fill = 'inherit';
      const res = element.querySelector('title');
      res.textContent = value;
    }
  });
  props.items.forEach((item) => {
    const country = document.getElementById(item[props.idAttribute]);
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

function calculateWidths(obj) {
  const res = [];
  Object.entries(obj)?.forEach(([key, value]) => {
    const { width } = useElementSize(value);
    res[key] = width;
  });
  return res;
}

const modalRefs = ref({});
const elementWidths = computed(() => calculateWidths(modalRefs.value));

const textRefs = ref({});
const textElementWidths = computed(() => calculateWidths(textRefs.value));

function isTextOutside(index) {
  return (
    elementWidths.value?.[index]?.value > 0 &&
    textElementWidths.value?.[index]?.value > 0 &&
    // eslint-disable-next-line no-unsafe-optional-chaining
    textElementWidths.value?.[index]?.value + 8 >= elementWidths.value?.[index]?.value
  );
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
  if (element?.includes('_')) element = element?.split('_')[0];

  if (element) {
    emits('click', element);
  }
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

const barsOnly = ref();

const barsOnlyWidth = computed(() => useElementSize(barsOnly).width);

const targetsComputed = computed(() => {
  const objArray = [...props.targets]
    .sort((a, b) => a - b)
    .map((item) => ({ value: item, count: 1 }));

  const res = [];

  for (let i = 0, j = 0; i < objArray.length; i += 1) {
    const location = (objArray[i].value / maxValue.value) * barsOnlyWidth.value.value; // item location in px

    // if gap smaller than 48px(3rem), than marge
    if (res[j - 1]?.value && location - res[j - 1].value < 48) {
      res[j - 1].value = (res[j - 1].value + location) / 2; // value of items in px for comparison
      res[j - 1].count += 1; // count of items in this location
      res[j - 1].absoluteValue = (res[j - 1].absoluteValue + objArray[i].value) / 2; // absolute value of items in this location
      res[j - 1].list.push(objArray[i].value); // list of items in this location
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
</script>
<template>
  <div class="lx-data-visualizer" :id="id">
    <LxContentSwitcher :items="contentItems" v-model="contentModel" v-if="items?.length > 0" />
    <div
      class="lx-bars-horizontal"
      v-if="kind === 'bars-horizontal' && contentModel === 'default'"
      :class="[{ 'show-legend': showLegend }, { 'has-targets': targets?.length > 0 }]"
      :style="`--item-count: ${items?.length}`"
    >
      <div class="bar-wrapper">
        <div
          class="bar-name"
          :title="item?.[nameAttribute]"
          v-for="item in items"
          :key="item[idAttribute]"
        >
          {{ item?.[nameAttribute] }}
        </div>
      </div>
      <div class="bar-wrapper bars-only" ref="barsOnly">
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
          :ref="(el) => (modalRefs[index] = el)"
          @click="$emit('click', item?.[idAttribute])"
          @keydown.space="$emit('click', item?.[idAttribute])"
          v-for="(item, index) in items"
          :key="item[idAttribute]"
        >
          <p
            v-if="showValues === 'always'"
            :ref="(el) => (textRefs[index] = el)"
            :style="`--outside-padding: ${elementWidths?.[index]?.value}px`"
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
      v-else-if="kind === 'latvia' && contentModel === 'default'"
      class="lx-latvia-visualizer"
      :class="[{ 'show-legend': showLegend }]"
    >
      <imagePath @click="imageClick($event)" v-show="!loading" />
      <LxLoader :loading="true" v-if="loading" />
    </div>

    <LxDataGrid
      v-else-if="contentModel === 'table'"
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
        kind === 'bars-horizontal'
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
