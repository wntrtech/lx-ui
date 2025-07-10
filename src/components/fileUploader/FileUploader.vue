<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';

import * as fileUploaderUtils from '@/utils/fileUploaderUtils';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

import LxButton from '@/components/Button.vue';
import LxList from '@/components/list/List.vue';
import LxModal from '@/components/Modal.vue';
import FileUploaderDetails from '@/components/fileUploader/FileUploaderDetails.vue';
import FileUploaderItem from '@/components/fileUploader/FileUploaderItem.vue';
import LxCamera from '@/components/Camera.vue';
import LxIcon from '@/components/Icon.vue';
import LxLoader from '@/components/Loader.vue';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: Array, default: null },
  kind: { type: String, default: 'single' }, // multiple, single
  mode: { type: String, default: 'default' }, // default, compact
  draggable: { type: Boolean, default: false },
  dataType: { type: String, default: 'meta' }, // content, meta
  hasSearch: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  allowedFileExtensions: { type: Array, default: () => [] },
  maxFileSize: { type: Number, default: 30000000 },
  hasDownloadButton: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: true },
  maxSizeForMeta: { type: Number, default: 30000000 },
  hasCamera: { type: Boolean, default: false },
  cameraSwitcherMode: { type: String, default: 'toggle' }, // toggle || list
  hasFlashlightToggle: { type: Boolean, default: false },
  imageSize: { type: String, default: 'default' }, // default || max
  preferencesId: { type: String, default: 'lx-camera-settings' },
  labelId: { type: String, default: null },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const textsDefault = {
  clear: 'Notīrīt',
  buttonLabel: 'Izvēlēties datni',
  uploaderDescription: '',
  draggablePlaceholder: 'Ievelciet datnes, vai nospiediet šeit, lai augšupielādētu',
  placeholder: 'Ievadiet nosaukuma vai apraksta daļu, lai sameklētu ierakstus',
  notFoundSearch: 'Nav atrasts:',
  close: 'Aizvērt',
  noItems: 'Nav pievienota neviena datne',
  infoButton: 'Skatīt detaļas',
  download: 'Lejupielādēt',
  addPhoto: 'Pievienot attēlu',
  savePicture: 'Saglabāt',
  cancelAndClose: 'Atcelt',
  errorLabel: 'Notika kļūda',
  errorDescription: 'Nav piešķirta atļauja izmantot kameru',
  reloadPage: 'Pārlādēt lapu',
  changeCamera: 'Mainīt kameru',
  takePhoto: 'Uzņemt attēlu',
  deletePhoto: 'Mēģināt vēlreiz',
  useCamera: 'Izmantot kameru',
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
  metaAdditionalInfoSizeTitle: 'Izmērs',
  metaAdditionalInfoExtensionTitle: 'Paplašinājums',
  metaAdditionalInfoResolutionTitle: 'Izšķirtspēja',
  metaAdditionalInfoFileCountTitle: 'Datņu skaits',
  metaAdditionalInfoFileCountLabelSingle: 'datne',
  metaAdditionalInfoFileCountLabelMulti: 'datnes',
  metaAdditionalInfoProtectedArchive: 'Arhīvs aizargāts ar paroli',
  metaAdditionalInfoPageCountTitle: 'Lappušu skaits',
  metaAdditionalInfoSlideCountTitle: 'Slaidu skaits',
  metaAdditionalInfoPageCountLabelSingle: 'lappuse',
  metaAdditionalInfoPageCountLabelMulti: 'lappuses',
  metaAdditionalInfoSlideCountLabelSingle: 'slaids',
  metaAdditionalInfoSlideCountLabelMulti: 'slaidi',
  metaAdditionalInfoeSigned: 'Dokuments parakstīts ar drošu elektronisko parakstu',
  metaAdditionalInfoc2paSigned: 'Datne parakstīta ar c2pa elektronisko parakstu',
  metaAdditionalInfoAiCreated: 'Veidots izmantojot mākslīgo intelektu',
  metaMainTitle: 'Virsraksts',
  metaMainDescription: 'Apraksts',
  metaEDocContentLabel: 'Paraksti',
  metaEdocArchiveContentLabel: 'Saturs',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

// states:
// id - id of the file
// state - 'draft', 'loading', 'invalid'
// description - description of the file
// invalidDescription - description of invalidation

const emits = defineEmits(['update:modelValue', 'onError', 'downloadFile']);

function downloadFile(id) {
  if (props.hasDownloadButton && props.disabled === false && props.loading === false) {
    emits('downloadFile', id);
  }
}

const advancedFilesData = ref([]);
const storedBase64Strings = ref([]);
const fileInput = ref(null);
const infoModal = ref();
const cameraModal = ref();

function changeState(e) {
  advancedFilesData.value = advancedFilesData.value.map((file) => {
    const matchingObject = e.find((obj) => obj.id === file.id);
    if (matchingObject) {
      return { ...file, ...matchingObject };
    }
    return file;
  });
}

function getFiles() {
  if (!advancedFilesData.value) {
    return null;
  }
  return advancedFilesData.value;
}

defineExpose({ changeState, getFiles });

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

// errors: format, size
function onError(id, errorType) {
  emits('onError', id, errorType);
}

async function updateModel() {
  const fileData = advancedFilesData.value.map((file) => ({
    id: file.id,
    name: file.name,
    meta: file.meta,
    content: file.content,
  }));

  emits('update:modelValue', fileData);
}

function filladvancedFilesData() {
  advancedFilesData.value = model.value.map((file) => ({
    ...file,
    id: file.id,
    name: file.name,
    meta: file.meta,
    content: file.content,
  }));
}

watch(
  () => model.value,
  () => {
    filladvancedFilesData();
    if (model.value.length === 0) {
      storedBase64Strings.value = storedBase64Strings.value.filter((storedFile) =>
        advancedFilesData.value.some((file) => file.id === storedFile.id)
      );
    }
  }
);

function findImagePreview(id) {
  const advancedFile = advancedFilesData.value.find((file) => file.id === id);
  const storedBase64String = storedBase64Strings.value.find((file) => file.id === id);

  if (
    advancedFile &&
    fileUploaderUtils.acceptedMimeImage(advancedFile.meta?.name) &&
    storedBase64String &&
    storedBase64String.base64String.startsWith('data:image/')
  ) {
    return storedBase64String;
  }

  return null;
}

function provideAdditionalIconAndType(id) {
  const advancedFile = advancedFilesData.value.find((file) => file.id === id);
  if (!advancedFile) return [];

  const returnArr = [];

  if (advancedFile.meta?.eSigned) {
    returnArr.push({
      id,
      icon: 'sign',
      type: 'esign',
      title: displayTexts.value.metaAdditionalInfoeSigned,
    });
  }
  if (advancedFile.meta?.c2paSigned) {
    returnArr.push({
      id,
      icon: 'sign',
      type: 'c2pa-sign',
      title: displayTexts.value.metaAdditionalInfoc2paSigned,
    });
  }
  if (advancedFile.meta?.createdUsingAi) {
    returnArr.push({
      id,
      icon: 'ai',
      type: 'created-using-ai',
      title: displayTexts.value.metaAdditionalInfoAiCreated,
    });
  }
  if (advancedFile.meta?.passwordProtected) {
    returnArr.push({
      id,
      icon: 'lock',
      type: 'pass-protected',
      title: displayTexts.value.metaAdditionalInfoProtectedArchive,
    });
  }
  return returnArr;
}

const triggerFileUpload = () => {
  if (props.disabled || props.loading) return;
  fileInput.value.click();
};

const formatExtensions = computed(() =>
  props.allowedFileExtensions
    .map((ext) => {
      // Check if it's a MIME type
      if (ext.includes('/')) return ext.toLowerCase();

      // Otherwise treat it as file extension
      const match = ext.match(/(?:\.([^.]+))?$/);
      return match ? match[1].toLowerCase() : null;
    })
    .filter(Boolean)
);

const isUploading = ref(false);

function isInvalidFileExtension(file, fileId) {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (
    formatExtensions.value.length > 0 &&
    !fileUploaderUtils.checkExtension(fileExtension, formatExtensions.value)
  ) {
    onError(file.id ? file.id : fileId, 'format');
    return true;
  }
  return false;
}

function isExceedingFileSize(file, fileId) {
  if (props.maxFileSize && file.size > props.maxFileSize) {
    onError(file.id ? file.id : fileId, 'size');
    return true;
  }
  return false;
}

function createFileData(file, fileId) {
  return {
    id: fileId,
    name: file.name,
    content: file.content,
    meta: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    },
  };
}

async function processFileMeta(file, fileId) {
  if (!props.maxSizeForMeta || file.size <= props.maxSizeForMeta) {
    const fileMeta = await fileUploaderUtils.getMeta(file, displayTexts.value);
    const tempFileDataMeta = advancedFilesData.value.find((f) => f.id === fileId);
    if (tempFileDataMeta) {
      tempFileDataMeta.meta = fileMeta;
    }
  }
}

async function processFileContent(file, fileId) {
  const fileContent = await fileUploaderUtils.getContent(file);
  const tempFileDataContent = advancedFilesData.value.find((f) => f.id === fileId);
  if (tempFileDataContent) {
    if (props.dataType === 'content') {
      tempFileDataContent.content = fileContent.base64Content;
    } else {
      tempFileDataContent.content = fileContent.originalFile;
    }
    storedBase64Strings.value.push({
      id: fileId,
      base64String: fileContent.base64Content,
    });
  }
}

function handleFileProcessingError(file, fileId, error) {
  if (error.message === 'password-protected') {
    const tempFileDataMeta = advancedFilesData.value.find((f) => f.id === fileId);
    if (tempFileDataMeta) {
      tempFileDataMeta.meta.passwordProtected = true;
      tempFileDataMeta.meta.additionalInfo = displayTexts.value.metaAdditionalInfoProtectedArchive;
    }
  }
  onError(file.id ? file.id : fileId, error.message);
}

async function processFiles(files) {
  const promises = files.map(async (file) => {
    const fileId = generateUUID();
    if (isInvalidFileExtension(file, fileId)) return;
    if (isExceedingFileSize(file, fileId)) return;

    const fileData = createFileData(file, fileId);
    advancedFilesData.value.push(fileData);

    try {
      await processFileMeta(file, fileId);
      await processFileContent(file, fileId);
    } catch (error) {
      handleFileProcessingError(file, fileId, error);
    }
  });

  return Promise.all(promises);
}

const isDragging = ref(false);

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

async function uploadFiles(event) {
  const files = Array.from(event.target.files);
  isUploading.value = true;
  await processFiles(files);
  await updateModel();
  isUploading.value = false;
  // eslint-disable-next-line no-param-reassign
  event.target.value = null;
}

async function handleDrop(event) {
  if (props.disabled || props.loading || props.busy) {
    return;
  }
  event.preventDefault();
  if (props.draggable) {
    let files = Array.from(event.dataTransfer.files);

    if (props.kind === 'single') {
      files = [files[0]];
    }
    isUploading.value = true;
    await processFiles(files);
    await updateModel();
    isUploading.value = false;
  }
  isDragging.value = false;
}

onMounted(() => {
  if (props.modelValue) {
    filladvancedFilesData();
  }
});

function removeFile(id) {
  advancedFilesData.value.splice(
    advancedFilesData.value.findIndex((file) => file.id === id),
    1
  );
  storedBase64Strings.value = storedBase64Strings.value.filter((file) => file.id !== id);
  updateModel();
  fileInput.value.value = null;
}
const openedItem = ref({});
function openModal(id) {
  openedItem.value = advancedFilesData.value.find((file) => file.id === id);
  infoModal.value.open();
}

const cameraPhoto = ref();

const base64ToBlob = (base64) => {
  const byteString = atob(base64?.split(',')[1]);
  const mimeString = base64?.split(',')[0]?.split(':')[1]?.split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

async function saveImageAsFile() {
  const blob = base64ToBlob(cameraPhoto.value);
  const id = generateUUID();
  const file = new File([blob], `${id}.jpeg`, { type: blob.type });

  await processFiles([file]);
  await updateModel();
}

async function savePhoto() {
  cameraModal.value.close();
  await saveImageAsFile();
  cameraPhoto.value = null;
}

function cancelPhoto() {
  cameraPhoto.value = null;
  cameraModal.value.close();
}
const showCameraButton = computed(() => {
  const lowerCaseExtensions = props.allowedFileExtensions?.map((ext) => ext.toLowerCase()) || [];
  return (
    props.hasCamera &&
    (lowerCaseExtensions.includes('image/*') ||
      lowerCaseExtensions.includes('.jpeg') ||
      lowerCaseExtensions.length === 0)
  );
});

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);
</script>
<template>
  <div
    class="lx-file-upload-wrapper"
    :class="[
      { single: props.kind === 'single' },
      { multiple: props.kind === 'multiple' },
      { default: props.mode === 'default' },
      { compact: props.mode === 'compact' },
      { 'lx-disabled': props.disabled },
    ]"
    :aria-labelledBy="labelledBy"
    role="group"
  >
    <template v-if="props.kind === 'single' && !props.readOnly">
      <input
        :id="props.id"
        class="lx-visually-hidden"
        type="file"
        ref="fileInput"
        :accept="allowedFileExtensions.map((ext) => ext.toLowerCase()).join(',')"
        @change="uploadFiles"
        tabindex="-1"
        aria-hidden="true"
        role="presentation"
      />
      <div class="lx-draggable-wrapper" v-if="!props.draggable && advancedFilesData.length < 1">
        <LxButton
          :id="`${id}-action-file-upload`"
          :label="displayTexts.buttonLabel"
          kind="tertiary"
          icon="upload"
          :disabled="props.disabled"
          :loading="props.loading"
          :busy="props.busy"
          @click="triggerFileUpload"
        />
        <LxButton
          v-if="showCameraButton"
          customClass="camera-button"
          icon="camera"
          kind="tertiary"
          variant="icon-only"
          :label="displayTexts.useCamera"
          :disabled="disabled || loading || busy"
          @click="cameraModal.open()"
        />
      </div>
      <div class="lx-draggable-wrapper" v-if="props.draggable && advancedFilesData.length < 1">
        <div
          :id="`${id}-action-file-upload`"
          class="lx-draggable-upload-wrapper"
          :class="[
            { 'lx-dragging': isDragging },
            { 'lx-disabled': props.disabled || props.loading || props.busy },
          ]"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @keyup.space="triggerFileUpload"
          @keyup.enter="triggerFileUpload"
          @click="triggerFileUpload"
          role="button"
          tabindex="0"
          :aria-label="displayTexts.draggablePlaceholder"
        >
          <p>{{ displayTexts.draggablePlaceholder }}</p>
          <LxLoader :loading="true" size="s" v-if="busy" />
          <LxIcon value="upload" v-else />
        </div>
        <LxButton
          v-if="showCameraButton"
          customClass="camera-button"
          icon="camera"
          kind="tertiary"
          variant="icon-only"
          :label="displayTexts.useCamera"
          :disabled="disabled || loading || busy"
          @click="cameraModal.open()"
        />
      </div>
    </template>
    <template v-if="props.kind === 'multiple' && !props.readOnly">
      <input
        :id="props.id"
        class="lx-visually-hidden"
        type="file"
        ref="fileInput"
        :accept="allowedFileExtensions.map((ext) => ext.toLowerCase()).join(',')"
        @change="uploadFiles"
        multiple
        tabindex="-1"
        aria-hidden="true"
        role="presentation"
      />
      <div class="lx-draggable-wrapper" v-if="!props.draggable">
        <LxButton
          :id="`${id}-action-file-upload`"
          :label="displayTexts.buttonLabel"
          kind="tertiary"
          icon="upload"
          @click="triggerFileUpload"
          :disabled="props.disabled"
          :loading="props.loading"
          :busy="props.busy"
        />
        <LxButton
          v-if="showCameraButton"
          customClass="camera-button"
          icon="camera"
          kind="tertiary"
          variant="icon-only"
          :label="displayTexts.useCamera"
          :disabled="disabled || loading || busy"
          @click="cameraModal.open()"
        />
      </div>
      <div class="lx-draggable-wrapper" v-else>
        <div
          :id="`${id}-action-file-upload`"
          class="lx-draggable-upload-wrapper"
          :class="[
            { 'lx-dragging': isDragging },
            { 'lx-disabled': props.disabled || props.loading || props.busy },
          ]"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @keyup.space="triggerFileUpload"
          @keyup.enter="triggerFileUpload"
          @click="triggerFileUpload"
          role="button"
          tabindex="0"
          :aria-label="displayTexts.draggablePlaceholder"
        >
          <p>{{ displayTexts.draggablePlaceholder }}</p>
          <LxLoader :loading="true" size="s" v-if="busy" />
          <LxIcon value="upload" v-else />
        </div>
        <LxButton
          v-if="showCameraButton"
          customClass="camera-button"
          icon="camera"
          kind="tertiary"
          variant="icon-only"
          :label="displayTexts.useCamera"
          :disabled="disabled || loading || busy"
          @click="cameraModal.open()"
        />
      </div>
    </template>
    <div class="lx-uploaded-file-list-wrapper">
      <LxList
        v-if="readOnly || !(advancedFilesData.length === 0 && props.kind === 'single')"
        id="FilesList"
        :items="advancedFilesData"
        :has-search="props.hasSearch && props.kind === 'multiple'"
        listType="1"
        :texts="displayTexts"
      >
        <template #customItem="{ id, name, meta, state, description, invalidDescription }">
          <FileUploaderItem
            :customItem="{ id, name, meta, state, description, invalidDescription }"
            :mode="props.mode"
            :hasDownloadButton="props.hasDownloadButton"
            :disabled="props.disabled"
            :loading="props.loading"
            :busy="props.busy"
            :showMeta="props.showMeta"
            :read-only="props.readOnly"
            :texts="displayTexts"
            :isUploading="isUploading"
            :defaultIcon="
              fileUploaderUtils.provideDefaultIcon(advancedFilesData.find((file) => file.id === id))
            "
            :additionalIconAndType="provideAdditionalIconAndType(id)"
            :imagePreview="findImagePreview(id)?.base64String"
            @downloadFile="downloadFile"
            @removeFile="removeFile"
            @openModal="openModal"
          />
        </template>
      </LxList>
    </div>
  </div>

  <div v-if="props.mode === 'default' && displayTexts.uploaderDescription" class="lx-description">
    {{ displayTexts.uploaderDescription }}
  </div>

  <LxModal
    ref="infoModal"
    :label="openedItem?.name"
    size="m"
    :button-secondary-label="displayTexts.close"
    :button-secondary-visible="true"
    @primary-action="infoModal.close()"
  >
    <FileUploaderDetails
      :texts="displayTexts"
      :value="
        fileUploaderUtils.getDetails(
          openedItem,
          storedBase64Strings.find((file) => file.id === openedItem.id)?.base64String || null,
          displayTexts,
          provideAdditionalIconAndType(openedItem.id)
        )
      "
    />
  </LxModal>
  <LxModal
    ref="cameraModal"
    :label="displayTexts.addPhoto"
    :button-secondary-label="displayTexts.cancelAndClose"
    :button-secondary-visible="true"
    :button-primary-visible="true"
    :button-primary-disabled="!cameraPhoto"
    :button-primary-label="displayTexts.savePicture"
    :buttonSecondaryIsCancel="false"
    @primary-action="savePhoto"
    @secondary-action="cancelPhoto"
  >
    <LxCamera
      v-model="cameraPhoto"
      :cameraSwitcherMode="cameraSwitcherMode"
      :hasFlashlightToggle="hasFlashlightToggle"
      :imageSize="imageSize"
      :preferencesId="preferencesId"
      :texts="displayTexts"
    />
  </LxModal>
</template>
