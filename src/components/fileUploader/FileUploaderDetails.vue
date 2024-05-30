<script setup>
import { computed, ref } from 'vue';

import LxForm from '@/components/forms/Form.vue';
import LxRow from '@/components/forms/Row.vue';
import LxMap from '@/components/Map.vue';
import LxSection from '@/components/forms/Section.vue';
import LxFormBuilder from '@/components/forms/FormBuilder.vue';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import LxList from '@/components/list/List.vue';

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
  texts: {
    type: Object,
    default: () => ({
      clear: 'Notīrīt',
      buttonLabel: 'Izvēlēties datni',
      uploaderDescription: '',
      draggablePlaceholder: 'Ievelciet datnes, vai nospiediet šeit, lai augšupielādētu',
      placeholder: 'Ievadiet nosaukuma vai apraksta daļu, lai sameklētu ierakstus',
      close: 'Aizvērt',
      noItems: 'Nav pievienota neviena datne',
      infoButton: 'Skatīt detaļas',
      download: 'Lejupielādēt',
      metaPreviewLabel: 'Priekšskatījums',
      metaMainLabel: 'Galvenie dati',
      metaMainAuthor: 'Autors',
      metaMainFormat: 'Formāts',
      metaMainImageDimensions: 'Attēla dimensijas',
      metaMainLastModified: 'Pēdējās izmaiņas',
      metaMainDateCreated: 'Izveides datums',
      metaMainDataSize: 'Datnes izmērs',
      metaAdditionalLabel: 'Visi dati',
      metaLocationLabel: 'Atrašanās vietas dati',
      metaLocationLatitude: 'Platuma grādi',
      metaLocationLongitude: 'Garuma grādi',
      metaLocationAltitude: 'Augstums',
      metaImageLabel: 'Attēla dati',
      metaImageWidth: 'Attēla platums',
      metaImageHeight: 'Attēla augstums',
      metaImageHorizontalResolution: 'Horizontālā izšķirtspēja',
      metaImageVerticalResolution: 'Vertikālā izšķirtspēja',
      metaImageCopyright: 'Autortiesības',
      metaCameraBrand: 'Kameras ražotājs',
      metaCameraModel: 'Kameras modelis',
      metaFocusLength: 'Fokusa attālums',
      metaFStop: 'F-stop',
      metaExposure: 'Exposure',
      metaISO: 'ISO',
      metaExposureBias: 'Exposure bias',
      metaFlash: 'Zibspuldzes iestatījums',
      metaColorSpace: 'Color space',
      metaDateTime: 'Datums un laiks',
      metaArchiveContentLabel: 'Arhīva saturs',
    }),
  },
});

const mainDataWithoutAuthor = computed(() => {
  if (!props.value.mainData) {
    return {};
  }
  const { author, ...rest } = props.value.mainData;
  return rest;
});

const mapData = ref({
  center: {
    lat: props.value?.locationData?.lat?.value || null,
    lng: props.value?.locationData?.long?.value || null,
  },
  zoom: 17,
});

const objDefinitions = ref([
  {
    id: 'position',
    type: 'marker',
    location: {
      lat: props.value?.locationData?.lat?.value || null,
      lng: props.value?.locationData?.long?.value || null,
    },
    draggable: false,
  },
]);

const additionalData = ref(props.value?.additionalData || null);
</script>
<template>
  <LxForm
    :show-header="false"
    :show-footer="false"
    :column-count="3"
    kind="compact"
    indexType="expanders"
    :index="[
      { id: 'metaPreview', expanded: true },
      { id: 'metaArchiveContent', expanded: true },
      { id: 'metaMain', expanded: true },
      { id: 'metaLocation', expanded: true },
      { id: 'metaImage', expanded: true },
      { id: 'metaAdditional', expanded: false },
    ]"
  >
    <template #sections>
      <LxSection
        id="metaPreview"
        :label="props.texts?.metaPreviewLabel"
        :column-count="3"
        v-if="props.value?.preview"
      >
        <LxRow columnSpan="3" :hideLabel="true">
          <div class="lx-modal-image-preview">
            <img :src="props.value.preview" alt="Image Preview" />
          </div>
        </LxRow>
      </LxSection>

      <LxSection id="metaMain" :label="props.texts?.metaMainLabel" :column-count="3">
        <LxRow :label="props.texts?.metaMainAuthor">
          <LxPersonDisplay
            v-if="props.value.mainData?.author?.value"
            :value="props.value.mainData.author.value"
          />
          <p v-else class="lx-data">—</p>
        </LxRow>
        <LxRow v-for="(item, key) in mainDataWithoutAuthor" :key="key" :label="item.label">
          <p class="lx-data">{{ item.value }}</p>
        </LxRow>
      </LxSection>

      <LxSection
        id="metaLocation"
        :label="props.texts?.metaLocationLabel"
        :column-count="3"
        v-if="props.value?.locationData"
      >
        <LxRow :label="props.texts?.metaLocationLatitude">
          <p class="lx-data">
            {{ props.value.locationData.lat.value.toFixed(5).replace('.', ',') }}
          </p>
        </LxRow>
        <LxRow :label="props.texts?.metaLocationLongitude">
          <p class="lx-data">
            {{ props.value.locationData.long.value.toFixed(5).replace('.', ',') }}
          </p>
        </LxRow>
        <LxRow :label="props.texts?.metaLocationAltitude">
          <p v-if="props.value.locationData?.altitude" class="lx-data">
            {{ props.value.locationData?.altitude.value }} &nbsp;
            <span v-if="props.value.locationData?.altitude.ref">
              ({{ props.value.locationData?.altitude.ref }})
            </span>
          </p>
          <p v-else class="lx-data">—</p>
        </LxRow>
        <LxRow columnSpan="3" :hideLabel="true">
          <LxMap
            v-model:center="mapData.center"
            v-model:zoom="mapData.zoom"
            :objectDefinitions="objDefinitions"
          />
        </LxRow>
      </LxSection>

      <LxSection
        id="metaImage"
        :label="props.texts?.metaImageLabel"
        :column-count="3"
        v-if="props.value?.imageData"
      >
        <LxRow v-for="(row, index) in value.imageData" :key="index" :label="row.label">
          <p class="lx-data">{{ row.value }}</p>
        </LxRow>
      </LxSection>

      <LxSection
        id="metaAdditional"
        :label="props.texts?.metaAdditionalLabel"
        :column-count="3"
        v-if="props.value?.additionalData"
      >
        <LxFormBuilder v-model="additionalData" mode="mixed" :readOnly="true"></LxFormBuilder>
      </LxSection>

      <LxSection
        id="metaArchiveContent"
        :label="props.texts?.metaArchiveContentLabel"
        :column-count="2"
        v-if="props.value?.archiveContentData && props.value?.archiveContentData?.length !== 0"
      >
        <LxRow>
          <LxList kind="treelist" list-type="1" :items="props.value?.archiveContentData" />
        </LxRow>
      </LxSection>
    </template>
  </LxForm>
</template>
