<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeMount,
  defineAsyncComponent,
  nextTick,
  inject,
} from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxFlag from '@/components/Flag.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxButton from '@/components/Button.vue';
import LxList from '@/components/list/List.vue';
import LxLoader from '@/components/Loader.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import { useElementSize } from '@vueuse/core';
import { kebabToCamel, getTexts } from '@/utils/visualPickerUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  kind: { type: String, default: 'europe' }, // europe, skeleton, spine, arms, left-hand, right-hand, latvia
  modelValue: { type: [Array, String], default: () => [] },
  readOnly: { type: Boolean, default: false },
  mode: { type: String, default: 'default' }, // default, compact
  selectingKind: { type: String, default: 'multiple' }, // single, multiple
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = ref({
  visualView: 'Vizuālais skats',
  listView: 'Saraksta skats',
  removeCountry: 'Noņemt valsti',
  errorLabel: 'Neizdevās ielādēt attēlu',
});
const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault.value));

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const imagePath = ref(null);

const kindValue = computed(() => {
  // Separate picture name by '-' if any
  const parts = props.kind?.split('-');

  let ret = '';
  parts?.forEach((part) => {
    // Make first letter of each part uppercase and concat them to match picture file name
    ret += `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
  });

  return ret;
});

const loading = ref(false);
const errorState = ref(false);

function loadImage() {
  return new Promise((resolve, reject) => {
    if (props.kind) {
      imagePath.value = defineAsyncComponent({
        loader: () =>
          import(`@/components/visualPickerPictures/${kindValue.value}.vue`)
            .then((component) => {
              resolve(component);
              return component;
            })
            .catch((error) => {
              reject(error);
            }),
      });
    } else {
      reject(new Error('Kind prop is not defined'));
    }
  });
}

const { environment } = useLx().getGlobals();

const items = computed(() => {
  const res = [];
  const textValue = kebabToCamel(props.kind);
  if (displayTexts.value?.[textValue]) {
    Object.entries(displayTexts.value?.[textValue])?.forEach(([key, value]) => {
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
      const elem = document.getElementById(props.id);
      const pathElementSide = elem.querySelector(`#lx-${bone?.id}-side`);
      const pathElementFront = elem.querySelector(`#lx-${bone?.id}-front`);
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
      const elem = document.getElementById(props.id);
      const pathElement = elem.querySelector(`#lx-${bone?.id}`);
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
      if (typeof newValue === 'string' || newValue === null) {
        const res = items.value?.find((item) => item?.id === newValue);
        if (res && res?.id) listRef.value?.selectRows([res]);
        if (res === undefined) listRef.value?.cancelSelection();
      } else {
        const res = newValue.map((x) => items.value?.find((item) => item?.id === x));
        listRef.value?.selectRows(res);
      }
    }
  }
);

function mapClick(event) {
  if (props.readOnly) return;

  let countryId = event.target?.id;
  if (countryId.length !== 5) countryId = event.target.parentNode?.id;
  if (countryId?.includes('-')) countryId = countryId?.split('-')[1];

  if (!countryId) return;

  if (props.selectingKind === 'multiple') {
    const res = [...model.value];

    const index = res.findIndex((selectedItem) => selectedItem === countryId);
    if (index !== -1) res.splice(index, 1);
    else res.push(countryId);

    model.value = res;
  } else {
    model.value = model.value === countryId ? null : countryId;
  }
}

function spineClick(bone) {
  if (props.selectingKind === 'multiple') {
    const boneId = bone?.split('-')[0];

    const res = [...model.value];
    const index = res.findIndex((selectedItem) => selectedItem === boneId);
    if (boneId !== 'skeleton') {
      if (index !== -1) res.splice(index, 1);
      else res.push(boneId);

      model.value = res;
    }
  } else if (bone !== 'skeleton') {
    if (model.value === bone) model.value = null;
    else model.value = bone;
  }
}

function nonSpineClick(boneId) {
  if (props.selectingKind === 'multiple') {
    const res = [...model.value];
    const index = res.findIndex((selectedItem) => selectedItem === boneId);
    if (boneId !== 'skeleton' && boneId !== 'LV') {
      if (index !== -1) res.splice(index, 1);
      else res.push(boneId);

      model.value = res;
    }
  } else if (boneId !== 'skeleton' && boneId !== 'LV') {
    if (model.value === boneId) model.value = null;
    else model.value = boneId;
  }
}

function skeletonClick(event) {
  if (props.readOnly) return;

  let boneId = event.target?.id;
  if (!boneId) boneId = event.target?.parentNode?.id;
  if (boneId?.includes('-')) boneId = boneId?.split('-')[1];

  if (!boneId) return;

  if (props.kind === 'spine') {
    spineClick(boneId);
  } else if (props.kind !== 'spine') {
    nonSpineClick(boneId);
  }
}

function imageClick(event) {
  if (props.kind === 'europe') mapClick(event);
  else skeletonClick(event);
}

watch(
  () => props.kind,
  async (newValue) => {
    if (listRef.value) {
      await listRef.value.cancelSelection();
    }

    errorState.value = false;
    loading.value = true;
    try {
      await loadImage();
      await nextTick();
      if (!displayTexts.value[kebabToCamel(newValue)]) {
        textsDefault.value[kebabToCamel(newValue)] = getTexts(newValue);
      }
    } catch (error) {
      lxDevUtils.log(`Failed to load component: ${error}`, environment, 'error');
      errorState.value = true;
    } finally {
      loading.value = false;
      nextTick(() => {
        if (!errorState.value) {
          let tempModel;
          if (props.selectingKind === 'single') {
            if (model.value?.length === 0) {
              tempModel = null;
            } else tempModel = model.value;
            model.value = null;
          } else {
            tempModel = [...model.value];
            model.value = [];
          }
          nextTick(() => {
            model.value = tempModel;
          });
        }
      });
    }
  },
  { immediate: true }
);

const selectedItems = computed(() => {
  let res = null;
  if (typeof model.value === 'string') res = [items.value.find((x) => x?.id === model.value)];
  else res = model.value?.map((item) => items.value.find((x) => x?.id === item));
  return res;
});

function removeItem(id) {
  const res = [...model.value];
  const index = res.findIndex((selectedItem) => selectedItem === id);
  if (index !== -1) res.splice(index, 1);
  model.value = res;
}

function selectionChanged(selectedValue) {
  const elem = document.getElementById(props.id);
  if (elem) {
    const elements = Array.from(elem.querySelectorAll('.selected-visual'));
    elements.forEach((element) => {
      element.classList.remove('selected-visual');
    });
    selectedValue?.forEach((element) => {
      if (props.kind === 'spine') {
        elem.querySelector(`#lx-${element}-side`)?.classList.add('selected-visual');
        elem.querySelector(`#lx-${element}-front`)?.classList.add('selected-visual');
      } else elem.querySelector(`#lx-${element}`)?.classList.add('selected-visual');
    });
    if (JSON.stringify(model.value) !== JSON.stringify(selectedValue)) {
      if (props.selectingKind === 'single') {
        [model.value] = selectedValue;
      } else model.value = selectedValue;
    }
  }
}

const contentSwitcherItems = computed(() => [
  { id: 'visual', name: displayTexts.value.visualView, icon: 'image' },
  { id: 'list', name: displayTexts.value.listView, icon: 'list-bulleted' },
]);

const contentSwitcherModel = ref('visual');

const onMountedModel = ref();

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

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

defineExpose({ addTitles });
</script>
<template>
  <div
    class="lx-visual-picker-wrapper"
    :class="{ 'read-only': readOnly }"
    ref="image"
    :id="id"
    :aria-labelledby="labelledBy"
  >
    <LxContentSwitcher
      :items="contentSwitcherItems"
      v-model="contentSwitcherModel"
      kind="combo"
      :disabled="loading || errorState"
      v-if="isImageVisible && mode === 'default'"
    />
    <div
      class="lx-visual-view-content"
      v-show="contentSwitcherModel === 'visual' && isImageVisible"
    >
      <LxLoader :loading="loading" class="lx-visual-picker-loader" v-if="loading" />
      <LxEmptyState :label="displayTexts.errorLabel" icon="invalid" v-if="errorState" />
      <div class="visual-select" :class="[{ 'europe-map': kind === 'europe' }]">
        <div class="visual-select-picture">
          <imagePath @click="imageClick($event)" />
        </div>

        <div
          class="lx-tag-set"
          v-show="contentSwitcherModel === 'visual'"
          v-if="selectedItems && mode === 'default'"
        >
          <div v-for="item in selectedItems" :key="item?.id" class="lx-tag">
            <div class="tag-text">
              <LxFlag :value="item?.id" size="small" v-if="kind === 'europe'" />
              {{ item?.name }}
            </div>
            <LxButton
              v-if="!readOnly"
              icon="close"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.removeCountry"
              @click="removeItem(item?.id)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="lx-list-view-content" v-show="contentSwitcherModel === 'list' || !isImageVisible">
      <LxLoader :loading="loading" class="lx-visual-picker-loader" v-if="loading" />
      <div class="visual-select" v-show="!loading && !errorState">
        <LxList
          ref="listRef"
          :items="!readOnly ? items : selectedItems"
          :hasSelecting="!readOnly"
          :selectingKind="selectingKind"
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
  </div>
</template>
