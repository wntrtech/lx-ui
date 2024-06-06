<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxFlag from '@/components/Flag.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxButton from '@/components/Button.vue';
import EuropeMap from '@/components/visualPickerPictures/EuropeMap.vue';
import LxList from '@/components/list/List.vue';
import { useElementSize } from '@vueuse/core';

const props = defineProps({
  id: { type: String, default: generateUUID() },
  kind: { type: String, default: 'europe' }, // europe
  modelValue: { type: Array, default: () => [] },
  readOnly: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      visualView: 'Vizuālais skats',
      listView: 'Saraksta skats',
      removeCountry: 'Noņemt valsti',
      countryList: {
        AL: 'Albānija',
        AD: 'Andora',
        GB: 'Apvienotā Karaliste',
        AT: 'Austrija',
        BY: 'Baltkrievija',
        BE: 'Beļģija',
        BA: 'Bosnija un Hercegovina',
        BG: 'Bulgārija',
        CZ: 'Čehija',
        DK: 'Dānija',
        FR: 'Francija',
        GR: 'Grieķija',
        HR: 'Horvātija',
        EE: 'Igaunija',
        IE: 'Īrija',
        IS: 'Islande',
        IT: 'Itālija',
        CY: 'Kipra',
        LV: 'Latvija',
        LT: 'Lietuva',
        LI: 'Lihtenšteina',
        LU: 'Luksemburga',
        MT: 'Malta',
        ME: 'Melnkalne',
        MD: 'Moldova',
        MC: 'Monako',
        NL: 'Nīderlande',
        NO: 'Norvēģija',
        PL: 'Polija',
        PT: 'Portugāle',
        RO: 'Rumānija',
        SM: 'Sanmarīno',
        RS: 'Serbija',
        SK: 'Slovākija',
        SI: 'Slovēnija',
        FI: 'Somija',
        ES: 'Spānija',
        CH: 'Šveice',
        TR: 'Turcija',
        UA: 'Ukraina',
        HU: 'Ungārija',
        VA: 'Vatikāns',
        DE: 'Vācija',
        MK: 'Ziemeļmaķedonija',
        SE: 'Zviedrija',
      },
    }),
  },
});

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const europeanCountries = computed(() => {
  const res = [];
  if (props.texts?.countryList) {
    Object.entries(props.texts?.countryList)?.forEach(([key, value]) => {
      const obj = { id: key, name: value };
      res.push(obj);
    });
  }
  return res;
});

const europeList = ref();

function addTitles() {
  europeanCountries.value.forEach((country) => {
    const pathElement = document.getElementById(country?.id);
    if (pathElement) {
      const titleElement = pathElement.querySelector('title');
      if (titleElement) {
        titleElement.textContent = country?.name;
      } else {
        const newTitleElement = document.createElement('title');
        newTitleElement.textContent = country?.name;
        pathElement.appendChild(newTitleElement);
      }
    }
  });
}

watch(
  () => model.value,
  (newValue, oldValue) => {
    if (JSON?.stringify(newValue) !== JSON?.stringify(oldValue)) {
      const res = newValue.map((x) => europeanCountries.value.find((item) => item?.id === x));
      europeList.value?.selectRows(res);
    }
  }
);

function mapClick(event) {
  if (!props.readOnly) {
    let countryId = event.target?.id;
    if (countryId.length !== 2) {
      countryId = event.target.parentNode?.id;
    }
    if (countryId) {
      const res = [...model.value];

      const index = res.findIndex((selectedItem) => selectedItem === countryId);
      if (index !== -1) res.splice(index, 1);
      else res.push(countryId);

      model.value = res;
    }
  }
}

const selectedItems = computed(() =>
  model.value?.map((item) => europeanCountries.value.find((x) => x?.id === item))
);

function removeItem(id) {
  const res = [...model.value];
  const index = res.findIndex((selectedItem) => selectedItem === id);
  if (index !== -1) res.splice(index, 1);
  model.value = res;
}

function selectionChanged(selectedValue) {
  const elements = Array.from(document.getElementsByClassName('selected-country'));
  elements.forEach((element) => {
    element.classList.remove('selected-country');
  });

  selectedValue?.forEach((element) => {
    document.getElementById(element).classList.add('selected-country');
  });

  model.value = selectedValue;
}

const contentSwitcherItems = computed(() => [
  { id: 'visual', name: props.texts?.visualView, icon: 'image' },
  { id: 'list', name: props.texts?.listView, icon: 'list-bulleted' },
]);

const contentSwitcherModel = ref('visual');

const onMountedModel = ref([]);

onMounted(() => {
  model.value = onMountedModel.value;
  addTitles();
});

onBeforeMount(() => {
  onMountedModel.value = props.modelValue;
});

const image = ref();
const imageSize = useElementSize(image);
const isImageVisible = computed(() => imageSize?.width.value > 500 && imageSize.height.value > 500);

defineExpose({ addTitles });
</script>
<template>
  <div class="lx-visual-picker-wrapper" :class="{ 'read-only': readOnly }" ref="image">
    <LxContentSwitcher
      :items="contentSwitcherItems"
      v-model="contentSwitcherModel"
      kind="combo"
      v-if="isImageVisible"
    />
    <div v-if="kind === 'europe'" class="europe-map" v-show="isImageVisible">
      <EuropeMap @click="mapClick($event)" v-show="contentSwitcherModel === 'visual'" />
      <div class="lx-tag-set" v-show="contentSwitcherModel === 'visual'" v-if="selectedItems">
        <div v-for="item in selectedItems" :key="item?.id" class="lx-tag">
          <div class="tag-text">
            <LxFlag :value="item?.id" size="small" />
            {{ item?.name }}
          </div>
          <LxButton
            v-if="!readOnly"
            icon="close"
            kind="ghost"
            @click="removeItem(item?.id)"
            :title="texts.removeCountry"
          />
        </div>
      </div>
      <LxList
        ref="europeList"
        :items="europeanCountries"
        :hasSelecting="!readOnly"
        selectingKind="multiple"
        listType="1"
        v-show="contentSwitcherModel === 'list'"
        :has-search="true"
        @selectionChanged="selectionChanged"
      >
        <template #customItem="{ id, name }">
          <div class="list-country-item"><LxFlag :value="id" />{{ name }}</div>
        </template>
      </LxList>
    </div>
    <div v-if="kind === 'europe' && !isImageVisible" class="europe-map">
      <LxList
        ref="europeList"
        :items="europeanCountries"
        :hasSelecting="!readOnly"
        selectingKind="multiple"
        listType="1"
        :has-search="true"
        @selectionChanged="selectionChanged"
      >
        <template #customItem="{ id, name }">
          <div class="list-country-item"><LxFlag :value="id" />{{ name }}</div>
        </template>
      </LxList>
    </div>
  </div>
</template>
