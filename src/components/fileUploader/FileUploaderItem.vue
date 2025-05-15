<script setup>
import { ref, computed } from 'vue';
import { useElementSize } from '@vueuse/core';
import * as fileUploaderUtils from '@/utils/fileUploaderUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxButton from '@/components/Button.vue';
import LxLoader from '@/components/Loader.vue';
import LxIcon from '@/components/Icon.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxBadge from '@/components/Badge.vue';

const props = defineProps({
  customItem: { type: Object, default: () => ({}) },
  mode: { type: String, default: 'default' }, // default, compact
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  hasDownloadButton: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: true },
  defaultIcon: { type: String, default: 'file' },
  additionalIconAndType: { type: Array, default: null },
  imagePreview: { type: String, default: null },
  isUploading: { type: Boolean, default: false },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  metaAdditionalInfoSizeTitle: 'Izmērs',
  metaAdditionalInfoExtensionTitle: 'Paplašinājums',
  metaAdditionalInfoResolutionTitle: 'Izšķirtspēja',
  metaAdditionalInfoFileCountTitle: 'Datņu skaits',
  metaAdditionalInfoFileCountLabelSingle: 'datne',
  metaAdditionalInfoFileCountLabelMulti: 'datnes',
  metaAdditionalInfoPageCountTitle: 'Lappušu skaits',
  metaAdditionalInfoSlideCountTitle: 'Slaidu skaits',
  metaAdditionalInfoPageCountLabelSingle: 'lappuse',
  metaAdditionalInfoPageCountLabelMulti: 'lappuses',
  metaAdditionalInfoSlideCountLabelSingle: 'slaids',
  metaAdditionalInfoSlideCountLabelMulti: 'slaidi',
  download: 'Lejupielādēt',
  clear: 'Noņemt',
  infoButton: 'Informācija',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['downloadFile', 'openModal', 'removeFile']);

function downloadFile(id) {
  if (!props.disabled && !props.loading && !props.busy) {
    emits('downloadFile', id);
  }
}
function openModal(id) {
  if (!props.disabled && !props.loading && !props.busy) {
    emits('openModal', id);
  }
}
function removeFile(id) {
  if (!props.disabled && !props.loading && !props.busy) {
    emits('removeFile', id);
  }
}
const wrapperContainer = ref();

const containerElementSize = useElementSize(wrapperContainer);
const infoButtonVariant = computed(() => {
  if (containerElementSize.width.value < 300) {
    return 'icon-only';
  }
  return 'default';
});

const reactiveContainerElementWidth = computed(() => containerElementSize.width.value);

const additionalInfoTitle = computed(() => {
  if (props.customItem.meta?.type?.startsWith('image/')) {
    return displayTexts.value.metaAdditionalInfoResolutionTitle;
  }
  if (props.customItem.meta?.type?.endsWith('/zip')) {
    return displayTexts.value.metaAdditionalInfoFileCountTitle;
  }
  if (props.customItem.meta?.type?.endsWith('.document')) {
    return displayTexts.value.metaAdditionalInfoPageCountTitle;
  }
  if (props.customItem.meta?.type?.endsWith('.presentation')) {
    return displayTexts.value.metaAdditionalInfoSlideCountTitle;
  }
  return '';
});
</script>
<template>
  <div
    v-if="props.mode === 'default'"
    class="lx-file-wrapper"
    :class="{ 'lx-invalid': props.customItem.state === 'invalid', 'lx-disabled': props.disabled }"
    ref="wrapperContainer"
  >
    <div class="lx-file-main-part">
      <div
        class="lx-list-item"
        :class="{
          'lx-list-item-interactive':
            props.hasDownloadButton && !props.disabled && !props.loading && !props.busy,
        }"
        :title="props.hasDownloadButton ? displayTexts.download : ''"
        @keyup.space="downloadFile(props.customItem.id)"
        @keyup.enter="downloadFile(props.customItem.id)"
        @click="downloadFile(props.customItem.id)"
      >
        <div class="lx-file-name-main-data-wrapper">
          <div class="lx-file-name-wrapper">
            <p class="lx-file-name">{{ props.customItem.name }}</p>
          </div>
        </div>

        <div class="lx-download-icon" v-if="props.hasDownloadButton">
          <LxIcon v-if="props.hasDownloadButton" value="download"></LxIcon>
        </div>
      </div>
      <div class="lx-file-indicators" v-if="props.customItem.state">
        <LxLoader v-if="props.customItem.state === 'loading'" :loading="true" size="s"></LxLoader>
        <LxIcon
          v-if="props.customItem.state === 'invalid'"
          customClass="lx-invalidation-icon"
          value="invalid"
        />
        <div v-if="props.customItem.state === 'draft'" class="lx-draft-indicator"></div>
      </div>
      <div class="lx-upload-buttons">
        <LxButton
          v-if="!props.readOnly"
          kind="ghost"
          variant="icon-only"
          icon="remove"
          :label="displayTexts.clear"
          :destructive="true"
          :disabled="props.disabled"
          :loading="props.loading"
          :busy="props.busy"
          @click="removeFile(props.customItem.id)"
        />
      </div>
    </div>
    <div class="lx-file-additional-part" v-if="props.mode === 'default'">
      <div
        class="lx-file-state-info"
        v-if="props.customItem.invalidDescription || props.customItem.description"
      >
        <div class="lx-invalidation-message" v-if="props.customItem.invalidDescription">
          {{ props.customItem.invalidDescription }}
        </div>
        <p v-if="props.customItem.description" class="lx-secondary">
          {{ props.customItem.description }}
        </p>
      </div>

      <div
        class="lx-uploaded-file-preview-wrapper"
        :class="{ 'small-preview': reactiveContainerElementWidth < 280 }"
      >
        <div class="lx-file-preview-wrapper">
          <div class="lx-skeleton-file-preview" v-if="isUploading && !props.imagePreview"></div>
          <div class="lx-file-preview" v-else>
            <LxIcon v-if="!props.imagePreview" customClass="lx-icon" :value="props.defaultIcon" />

            <template v-if="props.additionalIconAndType && props.additionalIconAndType.length > 0">
              <LxBadge
                v-for="(item, index) in additionalIconAndType"
                :key="item.id"
                :icon="item.icon"
                :tooltip="item.title"
                :class="[
                  { 'lx-second-badge': index === 1 },
                  { 'lx-third-badge': index === 2 },
                  { 'lx-pass-protected-badge': item.type === 'pass-protected' },
                  { 'lx-esign-badge': item.type === 'esign' },
                  { 'lx-c2pa-sign-badge': item.type === 'c2pa-sign' },
                  { 'lx-created-using-ai-badge': item.type === 'created-using-ai' },
                ]"
              />
            </template>

            <img v-if="props.imagePreview" :src="props.imagePreview" alt="Image Preview" />
            <div
              class="lx-file-info-button"
              :class="{ 'lx-icon-only-button': infoButtonVariant === 'icon-only' }"
              v-if="props.showMeta && reactiveContainerElementWidth < 280"
            >
              <LxButton
                kind="ghost"
                :label="displayTexts.infoButton"
                :disabled="props.disabled"
                :loading="props.loading"
                :busy="props.busy"
                icon="info"
                :variant="infoButtonVariant"
                @click="openModal(props.customItem.id)"
              />
            </div>
          </div>
        </div>
        <div class="lx-file-addition-data-wrapper">
          <div class="lx-file-meta" v-if="props.customItem.meta">
            <p class="lx-data" :title="displayTexts.metaAdditionalInfoSizeTitle">
              {{ fileUploaderUtils.convertBytesToFormattedString(props.customItem.meta?.size) }}
            </p>
            <p class="lx-data" :title="displayTexts.metaAdditionalInfoExtensionTitle">
              {{ fileUploaderUtils.getFileExtension(props.customItem.name) }}
            </p>
            <p
              class="lx-data meta-description"
              :title="
                additionalInfoTitle ||
                fileUploaderUtils.getExtraParameter(props.customItem.meta, displayTexts)
              "
              v-if="fileUploaderUtils.getExtraParameter(props.customItem.meta, displayTexts)"
            >
              {{ fileUploaderUtils.getExtraParameter(props.customItem.meta, displayTexts) }}
            </p>
          </div>
          <div v-else></div>
          <div
            class="lx-file-info-button"
            :class="{ 'lx-icon-only-button': infoButtonVariant === 'icon-only' }"
          >
            <LxButton
              v-if="props.showMeta"
              kind="ghost"
              :label="displayTexts.infoButton"
              :disabled="props.disabled"
              :loading="props.loading"
              :busy="props.busy"
              icon="info"
              :variant="infoButtonVariant"
              @click="openModal(props.customItem.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="props.mode === 'compact'" class="compact-wrapper">
    <LxInfoWrapper :disabled="!props.imagePreview">
      <div
        class="lx-file-wrapper"
        :class="{
          'lx-invalid': props.customItem.state === 'invalid',
          'lx-disabled': props.disabled,
        }"
        ref="wrapperContainer"
      >
        <div class="lx-file-main-part">
          <div class="lx-skeleton-file-preview" v-if="isUploading && !props.imagePreview"></div>
          <div
            v-else
            class="lx-list-item"
            :class="{
              'lx-list-item-interactive':
                props.hasDownloadButton && !props.disabled && !props.loading && !props.busy,
            }"
            :title="props.hasDownloadButton ? displayTexts.download : ''"
            @keyup.space="downloadFile(props.customItem.id)"
            @keyup.enter="downloadFile(props.customItem.id)"
            @click="downloadFile(props.customItem.id)"
          >
            <div class="lx-file-name-main-data-wrapper">
              <div class="lx-file-name-wrapper">
                <p class="lx-file-name">{{ props.customItem.name }}</p>

                <template
                  v-if="props.additionalIconAndType && props.additionalIconAndType.length > 0"
                >
                  <LxBadge
                    v-for="(item, index) in additionalIconAndType"
                    :key="item.id"
                    :icon="item.icon"
                    :tooltip="item.title"
                    class="lx-compact-badge"
                    :class="[
                      { 'lx-second-badge': index === 1 },
                      { 'lx-third-badge': index === 2 },
                      { 'lx-pass-protected-badge': item.type === 'pass-protected' },
                      { 'lx-esign-badge': item.type === 'esign' },
                      { 'lx-c2pa-sign-badge': item.type === 'c2pa-sign' },
                      { 'lx-created-using-ai-badge': item.type === 'created-using-ai' },
                    ]"
                  />
                </template>
              </div>

              <p class="lx-file-main-additional-info lx-secondary">
                {{
                  [
                    fileUploaderUtils.convertBytesToFormattedString(props.customItem.meta?.size),
                    fileUploaderUtils.getFileExtension(props.customItem.meta.name),
                    fileUploaderUtils.getExtraParameter(props.customItem.meta, displayTexts),
                  ]
                    .filter(Boolean)
                    .join('; ')
                }}
              </p>
            </div>

            <div class="lx-download-icon" v-if="props.hasDownloadButton">
              <LxIcon v-if="props.hasDownloadButton" value="download"></LxIcon>
            </div>
          </div>

          <div class="lx-file-indicators" v-if="props.customItem.state">
            <LxLoader
              v-if="props.customItem.state === 'loading' || props.customItem.state === 'busy'"
              :loading="true"
              size="s"
            ></LxLoader>
            <LxIcon
              v-if="props.customItem.state === 'invalid'"
              customClass="lx-invalidation-icon"
              value="invalid"
            />
            <div v-if="props.customItem.state === 'draft'" class="lx-draft-indicator"></div>
          </div>
          <div class="lx-upload-buttons">
            <LxButton
              v-if="props.showMeta && !props.readOnly && props.mode === 'compact'"
              kind="ghost"
              variant="icon-only"
              :disabled="props.disabled"
              :loading="props.loading"
              :busy="props.busy"
              icon="info"
              :title="displayTexts.infoButton"
              @click="openModal(props.customItem.id)"
            ></LxButton>
            <LxButton
              v-if="!props.readOnly"
              kind="ghost"
              variant="icon-only"
              icon="remove"
              :title="displayTexts.clear"
              @click="removeFile(props.customItem.id)"
              :destructive="true"
              :disabled="props.disabled"
              :loading="props.loading"
              :busy="props.busy"
            ></LxButton>
          </div>
        </div>
      </div>
      <template #panel>
        <div class="lx-file-preview">
          <div class="lx-skeleton-file-preview" v-if="isUploading && !props.imagePreview"></div>
          <img v-else :src="props.imagePreview" alt="Image Preview" />
        </div>
      </template>
    </LxInfoWrapper>
  </div>
</template>
