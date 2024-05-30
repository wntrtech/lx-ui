<script setup>
import { ref, computed, onMounted, watch } from 'vue';

import LxButton from '@/components/Button.vue';
import LxList from '@/components/list/List.vue';
import LxModal from '@/components/Modal.vue';

import * as fileUploaderUtils from '@/utils/fileUploaderUtils';
import { generateUUID } from '@/utils/stringUtils';

import FileUploaderDetails from '@/components/fileUploader/FileUploaderDetails.vue';
import FileUploaderItem from '@/components/fileUploader/FileUploaderItem.vue';

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
  readOnly: { type: Boolean, default: false },
  allowedFileExtensions: { type: Array, default: () => [] },
  maxFileSize: { type: Number, default: 30000000 },
  hasDownloadButton: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: true },
  maxSizeForMeta: { type: Number, default: 30000000 },
  texts: {
    type: Object,
    default: () => ({
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
    }),
  },
});

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
  if (props.dataType === 'meta') {
    const files = advancedFilesData.value.map((file) => ({
      id: file.id,
      name: file.name,
      meta: file.meta,
      content: new File([file.content], file.name, {
        type: file.meta.type,
        lastModified: file.meta.lastModified,
      }),
    }));

    emits('update:modelValue', files);
  }

  if (props.dataType === 'content') {
    const fileData = advancedFilesData.value.map((file) => ({
      id: file.id,
      name: file.name,
      meta: file.meta,
      content: file.content,
    }));

    emits('update:modelValue', fileData);
  }
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
function provideDefaultIcon(id) {
  const advancedFile = advancedFilesData.value.find((file) => file.id === id);
  if (!advancedFile) return 'file';

  switch (true) {
    case fileUploaderUtils.acceptedMimeImage(advancedFile.meta?.name):
      return 'image';
    case fileUploaderUtils.acceptedMimeArchive(advancedFile.meta?.name):
      return 'file-archive';
    default:
      return 'file';
  }
}

function provideAdditionalIcon(id) {
  const advancedFile = advancedFilesData.value.find((file) => file.id === id);
  if (!advancedFile) return '';

  switch (true) {
    case advancedFile.meta?.passwordProtected:
      return 'lock';

    default:
      return '';
  }
}

function provideAdditionalBadgeType(id) {
  const advancedFile = advancedFilesData.value.find((file) => file.id === id);
  if (!advancedFile) return '';

  switch (true) {
    case advancedFile.meta?.passwordProtected:
      return 'warning';

    default:
      return '';
  }
}

const triggerFileUpload = () => {
  if (props.disabled || props.loading) return;
  fileInput.value.click();
};

const formatExtensions = computed(() =>
  props.allowedFileExtensions
    .map((ext) => {
      // Check if its a MIME type
      if (ext.includes('/')) return ext;

      // Otherwise treat it as file extension
      const match = ext.match(/(?:\.([^.]+))?$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
);

const isUploading = ref(false);

async function processFiles(files) {
  const promises = files.map(async (file) => {
    const fileId = generateUUID();
    const fileExtension = file.name.split('.').pop();

    if (
      formatExtensions.value.length > 0 &&
      !fileUploaderUtils.checkExtension(fileExtension, formatExtensions.value)
    ) {
      onError(file.id ? file.id : fileId, 'format');
      return;
    }
    if (props.maxFileSize && file.size > props.maxFileSize) {
      onError(file.id ? file.id : fileId, 'size');
      return;
    }

    const fileData = {
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

    advancedFilesData.value.push(fileData);

    try {
      if (!props.maxSizeForMeta || file.size <= props.maxSizeForMeta) {
        const fileMeta = await fileUploaderUtils.getMeta(file);

        const tempFileDataMeta = advancedFilesData.value.find((f) => f.id === fileId);

        if (tempFileDataMeta) {
          tempFileDataMeta.meta = fileMeta;
        }
      }

      const fileContent = await fileUploaderUtils.getContent(file);

      const tempFileDataContent = advancedFilesData.value.find((f) => f.id === fileId);
      if (tempFileDataContent) {
        if (props.dataType === 'content') {
          tempFileDataContent.content = fileContent.base64Content;
        } else {
          tempFileDataContent.content = fileContent.newFile;
        }
        storedBase64Strings.value.push({
          id: fileId,
          base64String: fileContent.base64Content,
        });
      }
    } catch (error) {
      if (error.message === 'password-protected') {
        const tempFileDataMeta = advancedFilesData.value.find((f) => f.id === fileId);
        if (tempFileDataMeta) {
          tempFileDataMeta.meta.passwordProtected = true;
          tempFileDataMeta.meta.additionalInfo = props.texts.metaAdditionalInfoProtectedArchive;
        }
      }
      onError(file.id ? file.id : fileId, error.message);
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
  if (props.disabled || props.loading) {
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
  updateModel();
  fileInput.value.value = null;
}
const openedItem = ref({});
function openModal(id) {
  openedItem.value = advancedFilesData.value.find((file) => file.id === id);
  infoModal.value.open();
}
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
  >
    <template v-if="props.kind === 'single' && !props.readOnly">
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="props.id"
        class="lx-visually-hidden"
        type="file"
        ref="fileInput"
        :accept="allowedFileExtensions.join(',')"
        @change="uploadFiles"
      />
      <LxButton
        v-if="!props.draggable && advancedFilesData.length < 1"
        :label="props.texts.buttonLabel"
        kind="tertiary"
        icon="upload"
        :disabled="props.disabled"
        :loading="props.loading"
        @click="triggerFileUpload"
      ></LxButton>
      <div
        v-if="props.draggable && advancedFilesData.length < 1"
        class="lx-draggable-upload-wrapper"
        :class="[{ 'lx-dragging': isDragging }, { 'lx-disabled': props.disabled || props.loading }]"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @keyup.space="triggerFileUpload"
        @keyup.enter="triggerFileUpload"
        @click="triggerFileUpload"
      >
        <p>{{ props.texts.draggablePlaceholder }}</p>
      </div>
    </template>
    <template v-if="props.kind === 'multiple' && !props.readOnly">
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        :id="props.id"
        class="lx-visually-hidden"
        type="file"
        ref="fileInput"
        :accept="allowedFileExtensions.join(',')"
        @change="uploadFiles"
        multiple
      />
      <LxButton
        v-if="!props.draggable"
        :label="props.texts.buttonLabel"
        kind="tertiary"
        icon="upload"
        @click="triggerFileUpload"
        :disabled="props.disabled"
        :loading="props.loading"
      ></LxButton>
      <div
        v-if="props.draggable"
        class="lx-draggable-upload-wrapper"
        :class="[{ 'lx-dragging': isDragging }, { 'lx-disabled': props.disabled || props.loading }]"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @keyup.space="triggerFileUpload"
        @keyup.enter="triggerFileUpload"
        @click="triggerFileUpload"
      >
        <p>{{ props.texts.draggablePlaceholder }}</p>
      </div>
    </template>
    <LxList
      v-if="!(advancedFilesData.length === 0 && props.kind === 'single')"
      id="FilesList"
      :items="advancedFilesData"
      :has-search="props.hasSearch && props.kind === 'multiple'"
      listType="1"
      :texts="props.texts"
    >
      <template #customItem="{ id, name, meta, state, description, invalidDescription }">
        <FileUploaderItem
          :customItem="{ id, name, meta, state, description, invalidDescription }"
          :mode="props.mode"
          :hasDownloadButton="props.hasDownloadButton"
          :disabled="props.disabled"
          :loading="props.loading"
          :showMeta="props.showMeta"
          :read-only="props.readOnly"
          :texts="props.texts"
          :isUploading="isUploading"
          :defaultIcon="provideDefaultIcon(id)"
          :additionalBagdeIcon="provideAdditionalIcon(id)"
          :additionalBagdeType="provideAdditionalBadgeType(id)"
          :imagePreview="findImagePreview(id)?.base64String"
          @downloadFile="downloadFile"
          @removeFile="removeFile"
          @openModal="openModal"
        />
      </template>
    </LxList>
  </div>
  <div v-if="props.mode === 'default' && props.texts.uploaderDescription" class="lx-description">
    {{ props.texts.uploaderDescription }}
  </div>
  <LxModal
    ref="infoModal"
    :label="openedItem?.name"
    size="m"
    :button-secondary-label="props.texts.close"
    :button-secondary-visible="true"
    @primary-action="infoModal.close()"
  >
    <FileUploaderDetails
      :texts="props.texts"
      :value="
        fileUploaderUtils.getDetails(
          openedItem,
          storedBase64Strings.find((file) => file.id === openedItem.id)?.base64String || null,
          props.texts
        )
      "
    ></FileUploaderDetails>
  </LxModal>
</template>
