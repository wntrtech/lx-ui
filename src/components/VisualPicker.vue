<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxFlag from '@/components/Flag.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxButton from '@/components/Button.vue';
import EuropeMap from '@/components/visualPickerPictures/EuropeMap.vue';
import Spine from '@/components/visualPickerPictures/Spine.vue';
import Arms from '@/components/visualPickerPictures/Arms.vue';
import LeftHand from '@/components/visualPickerPictures/LeftHand.vue';
import RightHand from '@/components/visualPickerPictures/RightHand.vue';
import Skeleton from '@/components/visualPickerPictures/Skeleton.vue';
import Latvia from '@/components/visualPickerPictures/Latvia.vue';
import LxList from '@/components/list/List.vue';
import { useElementSize } from '@vueuse/core';

const props = defineProps({
  id: { type: String, default: generateUUID() },
  kind: { type: String, default: 'europe' }, // europe, skeleton, spine, arms, left-hand, right-hand, latvia
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
      spine: {
        '278915007': 'Coccyx',
        '699698002': 'Sacrum',
        '49668003': 'Fifth lumbar vertebra',
        '11994002': 'Fourth lumbar vertebra',
        '36470004': 'Third lumbar vertebra',
        '14293000': 'Second lumbar vertebra',
        '66794005': 'First lumbar vertebra',
        '23215003': 'Twelfth thoracic vertebra',
        '12989004': 'Eleventh thoracic vertebra',
        '7610001': 'Tenth thoracic vertebra',
        '82687006': 'Ninth thoracic vertebra',
        '11068009': 'Eighth thoracic vertebra',
        '62487009': 'Seventh thoracic vertebra',
        '45296009': 'Sixth thoracic vertebra',
        '56401006': 'Fifth thoracic vertebra',
        '73071006': 'Fourth thoracic vertebra',
        '1626008': 'Third thoracic vertebra',
        '53733008': 'Second thoracic vertebra',
        '64864005': 'First thoracic vertebra',
        '87391001': 'Seventh cervical vertebra',
        '36054005': 'Sixth cervical vertebra',
        '36978003': 'Fifth cervical vertebra',
        '5329002': 'Fourth cervical vertebra',
        '113205007': 'Third cervical vertebra',
        '39976000': 'Second cervical vertebra',
        '14806007': 'First cervical vertebra',
      },
      arms: {
        '734355008': 'Bone structure of right hand',
        '734354007': 'Bone structure of left hand',
        '719464007': 'Bone structure of left radius',
        '719465008': 'Bone structure of right radius',
        '719462006': 'Bone structure of left ulna',
        '719463001': 'Bone structure of right ulna',
        '719460003': 'Bone structure of left humerus',
        '719461004': 'Bone structure of right humerus',
        '719627005': 'Bone structure of left scapula',
        '719628000': 'Bone structure of right scapula',
        '720617006': 'Bone structure of left clavicle',
        '720616002': 'Bone structure of right clavicle',
      },
      leftHand: {
        '737403003': 'left lunate bone',
        '764825000': 'Left triquetum',
        '724196009': 'left scaphoid',
        '764702007': 'pisiform bone of left hand',
        '764746004': 'hamate of left wrist',
        '764658006': 'capitate bone of left wrist',
        '787049004': 'left trapezoid bone',
        '764661007': 'trapezium of left wrist',
        '762010000': 'fifth metacarpal bone of left hand',
        '762027008': 'fourth metacarpal bone of left hand',
        '762041004': 'third metacarpal bone of left hand',
        '762033004': 'second metacarpal bone of left hand',
        '762016006': 'first metacarpal bone of left hand',
        '762840002': 'proximal phalanx of little finger of left hand',
        '762842005': 'proximal phalanx of ring finger of left hand',
        '762854005': 'proximal phalanx of middle finger of left hand',
        '762860005': 'proximal phalanx of index finger of left hand',
        '762868003': 'proximal phalanx of left thumb',
        '762838007': 'middle phalanx of little finger of left hand',
        '762844006': 'middle phalanx of ring finger of left hand',
        '762856007': 'middle phalanx of middle finger of left hand',
        '762862002': 'middle phalanx of index finger of left hand',
        '762836006': 'distal phalanx of little finger of left hand',
        '762846008': 'distal phalanx of ring finger of left hand',
        '762858008': 'distal phalanx of middle finger of left hand',
        '762864001': 'distal phalanx of index finger of left hand',
        '762866004': 'distal phalanx of left thumb',
      },
      rightHand: {
        '737404009': 'right lunate bone',
        '764824001': 'Right triquetum',
        '724197000': 'Right scaphoid',
        '764706005': 'pisiform bone of right hand',
        '764747008': 'hamate of right wrist',
        '764659003': 'capitate bone of right wrist',
        '787048007': 'right trapezoid bone',
        '764662000': 'trapezium of right wrist',
        '762011001': 'fifth metacarpal bone of right hand',
        '762028003': 'fourth metacarpal bone of right hand',
        '762042006': 'third metacarpal bone of right hand',
        '762035006': 'second metacarpal bone of right hand',
        '762017002': 'first metacarpal bone of right hand',
        '762841003': 'proximal phalanx of little finger of right hand',
        '762843000': 'proximal phalanx of ring finger of right hand',
        '762855006': 'proximal phalanx of middle finger of right hand',
        '762861009': 'proximal phalanx of index finger of right hand',
        '762869006': 'proximal phalanx of right thumb',
        '762839004': 'middle phalanx of little finger of right hand',
        '762845007': 'middle phalanx of ring finger of right hand',
        '762857003': 'middle phalanx of middle finger of right hand',
        '762863007': 'middle phalanx of index finger of right hand',
        '762837002': 'distal phalanx of little finger of right hand',
        '762847004': 'distal phalanx of ring finger of right hand',
        '762859000': 'distal phalanx of middle finger of right hand',
        '762865000': 'distal phalanx of index finger of right hand',
        '762867008': 'distal phalanx of right thumb',
      },
      skeleton: {
        '764406006': 'Bone structure of left lower limb',
        '764405005': 'Bone structure of right lower limb',
        '719309000': 'Bone structure of left upper limb',
        '719459008': 'Bone structure of right upper limb',
        '421060004': 'Vertebral column',
        '60413009': 'Rib cage',
        '272679001': 'Bone structure of head',
      },
      latvia: {
        '0001000': 'Rīga',
        '0002000': 'Daugavpils',
        '0003000': 'Jelgava',
        '0004000': 'Jūrmala',
        '0005000': 'Liepāja',
        '0006000': 'Rēzekne',
        '0007000': 'Ventspils',
        '0020000': 'Aizkraukles novads',
        '0021000': 'Alūksnes novads',
        '0022000': 'Augšdaugavas novads',
        '0023000': 'Ādažu novads',
        '0024000': 'Balvu novads',
        '0025000': 'Bauskas novads',
        '0026000': 'Cēsu novads',
        '0027000': 'Dienvidkurzemes novads',
        '0028000': 'Dobeles novads',
        '0029000': 'Gulbenes novads',
        '0030000': 'Jelgavas novads',
        '0031000': 'Jēkabpils novads',
        '0032000': 'Krāslavas novads',
        '0033000': 'Kuldīgas novads',
        '0034000': 'Ķekavas novads',
        '0035000': 'Limbažu novads',
        '0036000': 'Līvānu novads',
        '0037000': 'Ludzas novads',
        '0038000': 'Madonas novads',
        '0039000': 'Mārupes novads',
        '0040000': 'Ogres novads',
        '0041000': 'Olaines novads',
        '0042000': 'Preiļu novads',
        '0043000': 'Rēzeknes novads',
        '0044000': 'Ropažu novads',
        '0045000': 'Salaspils novads',
        '0046000': 'Saldus novads',
        '0047000': 'Saulkrastu novads',
        '0048000': 'Siguldas novads',
        '0049000': 'Smiltenes novads',
        '0051000': 'Talsu novads',
        '0052000': 'Tukuma novads',
        '0053000': 'Valkas novads',
        '0054000': 'Valmieras novads',
        '0055000': 'Varakļānu novads',
        '0056000': 'Ventspils novads',
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

const items = computed(() => {
  const res = [];
  let textValue = 'countryList';
  switch (props.kind) {
    case 'arms':
      textValue = 'arms';
      break;
    case 'left-hand':
      textValue = 'leftHand';
      break;
    case 'right-hand':
      textValue = 'rightHand';
      break;
    case 'spine':
      textValue = 'spine';
      break;
    case 'skeleton':
      textValue = 'skeleton';
      break;
    case 'latvia':
      textValue = 'latvia';
      break;
    default:
      textValue = 'countryList';
      break;
  }
  if (props.texts?.[textValue]) {
    Object.entries(props.texts?.[textValue])?.forEach(([key, value]) => {
      const obj = { id: key, name: value };
      res.push(obj);
    });
  }

  return res;
});

const listRef = ref();

function addTitles() {
  if (props.kind === 'spine') {
    items.value.forEach((bone) => {
      const pathElementSide = document.getElementById(`${bone?.id}_lx_side`);
      const pathElementFront = document.getElementById(`${bone?.id}_lx_front`);
      if (pathElementSide && pathElementFront) {
        const titleElementSide = pathElementSide.querySelector('title');
        const titleElementFront = pathElementFront.querySelector('title');
        if (titleElementSide && titleElementFront) {
          titleElementSide.textContent = bone?.name;
          titleElementFront.textContent = bone?.name;
        } else {
          const newTitleElement = document.createElement('title');
          const newTitleElementSecond = document.createElement('title');
          newTitleElement.textContent = bone?.name;
          newTitleElementSecond.textContent = bone?.name;
          pathElementSide.appendChild(newTitleElementSecond);
          pathElementFront.appendChild(newTitleElement);
        }
      }
    });
  } else {
    items.value.forEach((bone) => {
      const pathElement = document.getElementById(bone?.id);
      if (pathElement) {
        const titleElement = pathElement.querySelector('title');
        if (titleElement) {
          titleElement.textContent = bone?.name;
        } else {
          const newTitleElement = document.createElement('title');
          newTitleElement.textContent = bone?.name;
          pathElement.appendChild(newTitleElement);
        }
      }
    });
  }
}

watch(
  () => model.value,
  (newValue, oldValue) => {
    if (JSON?.stringify(newValue) !== JSON?.stringify(oldValue)) {
      const res = newValue.map((x) => items.value?.find((item) => item?.id === x));
      listRef.value?.selectRows(res);
    }
  }
);

function mapClick(event) {
  if (!props.readOnly) {
    let countryId = event.target?.id;
    if (countryId.length !== 2) {
      countryId = event.target.parentNode?.id;
    }
    if (countryId?.includes('_')) countryId = countryId?.split('_')[0];
    if (countryId) {
      const res = [...model.value];

      const index = res.findIndex((selectedItem) => selectedItem === countryId);
      if (index !== -1) res.splice(index, 1);
      else res.push(countryId);

      model.value = res;
    }
  }
}

function spineClick(event) {
  if (!props.readOnly) {
    let boneId = event.target?.id;
    if (!boneId) boneId = event.target?.parentNode?.id;
    if (boneId?.includes('_')) boneId = boneId?.split('_')[0];

    if (boneId && props.kind === 'spine') {
      boneId = boneId?.split('_')[0];
      const res = [...model.value];
      const index = res.findIndex((selectedItem) => selectedItem === boneId);
      if (boneId !== 'skeleton') {
        if (index !== -1) res.splice(index, 1);
        else res.push(boneId);

        model.value = res;
      }
    } else if (boneId && props.kind !== 'spine') {
      const res = [...model.value];
      const index = res.findIndex((selectedItem) => selectedItem === boneId);
      if (boneId !== 'skeleton' && boneId !== 'LV') {
        if (index !== -1) res.splice(index, 1);
        else res.push(boneId);

        model.value = res;
      }
    }
  }
}

watch(
  () => props.kind,
  () => {
    listRef.value?.cancelSelection();
  }
);

const selectedItems = computed(() =>
  model.value?.map((item) => items.value.find((x) => x?.id === item))
);

function removeItem(id) {
  const res = [...model.value];
  const index = res.findIndex((selectedItem) => selectedItem === id);
  if (index !== -1) res.splice(index, 1);
  model.value = res;
}

function selectionChanged(selectedValue) {
  const elements = Array.from(document.getElementsByClassName('selected-visual'));
  elements.forEach((element) => {
    element.classList.remove('selected-visual');
  });
  selectedValue?.forEach((element) => {
    if (props.kind === 'spine') {
      document.getElementById(`${element}_lx_side`)?.classList.add('selected-visual');
      document.getElementById(`${element}_lx_front`)?.classList.add('selected-visual');
    } else document.getElementById(element)?.classList.add('selected-visual');
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
const isImageVisible = computed(() => imageSize?.width.value > 500);

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
    <div
      class="visual-select"
      v-show="contentSwitcherModel === 'visual' && isImageVisible"
      :class="[{ 'europe-map': kind === 'europe' }]"
    >
      <div class="visual-select-picture">
        <EuropeMap @click="mapClick($event)" v-if="kind === 'europe'" />
        <Spine @click="spineClick($event)" v-if="kind === 'spine'" />
        <Arms @click="spineClick($event)" v-if="kind === 'arms'" />
        <LeftHand @click="spineClick($event)" v-if="kind === 'left-hand'" />
        <RightHand @click="spineClick($event)" v-if="kind === 'right-hand'" />
        <Skeleton @click="spineClick($event)" v-if="kind === 'skeleton'" />
        <Latvia @click="spineClick($event)" v-if="kind === 'latvia'" />
      </div>

      <div class="lx-tag-set" v-show="contentSwitcherModel === 'visual'" v-if="selectedItems">
        <div v-for="item in selectedItems" :key="item?.id" class="lx-tag">
          <div class="tag-text">
            <LxFlag :value="item?.id" size="small" v-if="kind === 'europe'" />
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
    </div>
    <div class="visual-select" v-show="contentSwitcherModel === 'list' || !isImageVisible">
      <LxList
        ref="listRef"
        :items="items"
        :hasSelecting="!readOnly"
        selectingKind="multiple"
        listType="1"
        :has-search="true"
        @selectionChanged="selectionChanged"
      >
        <template #customItem="{ id, name }" v-if="kind === 'europe'">
          <div class="list-country-item"><LxFlag :value="id" />{{ name }}</div>
        </template>
      </LxList>
    </div>
  </div>
</template>
