<script setup>
import { computed, ref } from 'vue';

import * as fileUploaderUtils from '@/utils/fileUploaderUtils';
import { safeString } from '@/utils/stringUtils';

import LxForm from '@/components/forms/Form.vue';
import LxRow from '@/components/forms/Row.vue';
import LxMap from '@/components/Map.vue';
import LxSection from '@/components/forms/Section.vue';
import LxFormBuilder from '@/components/forms/FormBuilder.vue';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import LxList from '@/components/list/List.vue';
import LxIcon from '@/components/Icon.vue';
import LxAvatar from '@/components/Avatar.vue';
import LxFlag from '@/components/Flag.vue';

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
      metaEdocArchiveContentLabel: 'Saturs',
      metaEDocContentLabel: 'Paraksti',
    }),
  },
});

const mainDataWithoutAuthorAndIcon = computed(() => {
  if (!props.value.mainData) return {};
  const { author, additionalIconAndType, ...rest } = props.value.mainData;
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

const normalizedAuthors = computed(() => {
  const authorValue = props.value.mainData?.author?.value;
  if (!authorValue) return null;
  return Array.isArray(authorValue) ? authorValue : [authorValue];
});

const archiveContentSectionlabel = computed(() => {
  if (props.value?.edocContentData && props.value?.edocContentData.length > 0) {
    return props.texts?.metaEdocArchiveContentLabel;
  }
  return props.texts?.metaArchiveContentLabel;
});

const customEsignSectionClass = computed(() => {
  if (props.value?.edocContentData && props.value?.edocContentData?.length !== 0) {
    if (
      props.value?.edocContentData[0].eSignType === 'e-sign' ||
      props.value?.edocContentData[0].eSignType === 'e-seal'
    ) {
      return 'edocBadgeIcon';
    }
    if (props.value?.edocContentData[0].eSignType === 'c2pa') {
      return 'c2paBadgeIcon';
    }
  }
  return '';
});

const nomalizedIconAndType = computed(() => {
  const iconsArr = props.value.mainData?.additionalIconAndType?.filter(
    (item) => item.type !== 'c2pa-sign'
  );
  if (!iconsArr) return null;
  return iconsArr;
});
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
      { id: 'metaLocation', expanded: false },
      { id: 'metaImage', expanded: false },
      { id: 'metaAdditional', expanded: false },
      { id: 'metaEDocContent', expanded: true },
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
          <template v-if="normalizedAuthors">
            <LxPersonDisplay v-for="item in normalizedAuthors" :key="item" :value="item" />
          </template>
          <p v-else class="lx-data">—</p>
        </LxRow>
        <LxRow v-for="(item, key) in mainDataWithoutAuthorAndIcon" :key="key" :label="item.label">
          <p class="lx-data">{{ item.value }}</p>
        </LxRow>

        <template v-if="nomalizedIconAndType">
          <LxRow class="lx-main-data-icon-row" v-for="item in nomalizedIconAndType" :key="item.id">
            <p
              class="lx-badge lx-main-data-badge"
              :class="[
                { 'lx-pass-protected-badge': item.type === 'pass-protected' },
                { 'lx-esign-badge': item.type === 'esign' },
                { 'lx-c2pa-sign-badge': item.type === 'c2pa-sign' },
                { 'lx-created-using-ai-badge': item.type === 'created-using-ai' },
              ]"
            >
              <LxIcon customClass="lx-icon" :value="item.icon" />
            </p>
            <p class="lx-data">{{ item.title }}</p>
          </LxRow>
        </template>
      </LxSection>

      <LxSection
        v-if="props.value?.edocContentData && props.value?.edocContentData?.length !== 0"
        id="metaEDocContent"
        class="lx-edoc-signs-list-section"
        icon="sign"
        :customClass="customEsignSectionClass"
        :label="props.texts?.metaEDocContentLabel"
        :badge="props.value?.edocContentData.length"
      >
        <LxRow :column-span="1">
          <LxList list-type="1" :items="props.value?.edocContentData">
            <template
              #customItem="{
                nameAndSurname,
                organizationName,
                personalCodeOrIdentifier,
                eSignDate,
                eSignIssuer,
                country,
              }"
            >
              <div v-if="nameAndSurname" class="lx-avatar-wrapper">
                <LxAvatar :value="safeString(nameAndSurname)" size="m" />
              </div>

              <div v-else class="lx-default-icon-wrapper">
                <LxIcon :value="organizationName ? 'seal' : 'user'" />
              </div>

              <div class="lx-edoc-description-wrapper">
                <p class="lx-primary">
                  {{ nameAndSurname || organizationName || '—' }}
                  <span v-if="personalCodeOrIdentifier" class="lx-edoc-description-code">
                    {{ `(${personalCodeOrIdentifier})` }}
                  </span>
                </p>
                <p class="lx-secondary">
                  {{ eSignDate ? `${eSignDate}; ` : ''
                  }}{{ eSignIssuer ? `${eSignIssuer}; ` : '' }}
                  <LxFlag size="small" :value="country.code" />{{ country.name }}
                </p>
              </div>
            </template>
          </LxList>
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
        :label="archiveContentSectionlabel"
        :column-count="2"
        v-if="props.value?.archiveContentData && props.value?.archiveContentData?.length !== 0"
      >
        <LxRow :column-span="2">
          <LxList
            class="lx-archive-content"
            kind="treelist"
            list-type="1"
            :items="props.value?.archiveContentData"
          >
            <template #customItem="{ name, description, children }">
              <div class="lx-archive-content-icon">
                <LxIcon
                  :class="[{ 'lx-folder-icon': children }]"
                  :value="!children ? fileUploaderUtils.provideDefaultIcon(name) : 'folder'"
                />
              </div>
              <div class="lx-archive-content-text">
                <p
                  class="lx-primary"
                  :class="{
                    'lx-folder-name': children,
                  }"
                >
                  {{ name }}
                </p>
                <p v-if="description" class="lx-secondary">{{ description }}</p>
              </div>
            </template>
          </LxList>
        </LxRow>
      </LxSection>
    </template>
  </LxForm>
</template>
