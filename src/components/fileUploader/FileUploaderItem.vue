<script setup>
import { ref, computed } from 'vue';

import LxButton from '@/components/Button.vue';
import LxLoader from '@/components/Loader.vue';
import LxIcon from '@/components/Icon.vue';

import LxInfoWrapper from '@/components/InfoWrapper.vue';

import { useElementSize } from '@vueuse/core';

import * as fileUploaderUtils from '@/utils/fileUploaderUtils';

const props = defineProps({
  customItem: { type: Object, default: () => ({}) },
  mode: { type: String, default: 'default' }, // default, compact
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  hasDownloadButton: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: true },
  defaultIcon: { type: String, default: 'file' },
  imagePreview: { type: String, default: null },
  isUploading: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({}),
  },
});
const emits = defineEmits(['downloadFile', 'openModal', 'removeFile']);

function downloadFile(id) {
  if (!props.disabled && !props.loading) {
    emits('downloadFile', id);
  }
}
function openModal(id) {
  if (!props.disabled && !props.loading) {
    emits('openModal', id);
  }
}
function removeFile(id) {
  if (!props.disabled && !props.loading) {
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
          'lx-list-item-interactive': props.hasDownloadButton && !props.disabled && !props.loading,
        }"
        :title="props.hasDownloadButton ? props.texts?.download : ''"
        @keyup.space="downloadFile(props.customItem.id)"
        @keyup.enter="downloadFile(props.customItem.id)"
        @click="downloadFile(props.customItem.id)"
      >
        <div class="lx-file-name-main-data-wrapper">
          <p class="lx-file-name">{{ props.customItem.name }}</p>
          <p v-if="props.mode === 'compact'" class="lx-file-main-additional-info lx-secondary">
            {{
              [
                fileUploaderUtils.convertBytesToFormattedString(props.customItem.meta?.size),
                fileUploaderUtils.getFileExtension(props.customItem.name),
                fileUploaderUtils.getExtraParameter(props.customItem.meta),
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
          v-if="props.showMeta && !props.readOnly && props.mode === 'compact'"
          kind="ghost"
          variant="icon-only"
          :disabled="props.disabled"
          :loading="props.loading"
          icon="info"
          :title="props.texts.infoButton"
          @click="openModal(props.customItem.id)"
        ></LxButton>
        <LxButton
          v-if="!props.readOnly"
          kind="ghost"
          variant="icon-only"
          icon="remove"
          :title="props.texts.clear"
          @click="removeFile(props.customItem.id)"
          :destructive="true"
          :disabled="props.disabled"
          :loading="props.loading"
        ></LxButton>
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
            <LxIcon
              v-if="!props.imagePreview"
              customClass="lx-icon"
              :value="props.defaultIcon"
            ></LxIcon>
            <img v-else :src="props.imagePreview" alt="Image Preview" />
            <div
              class="lx-file-info-button"
              :class="{ 'lx-icon-only-button': infoButtonVariant === 'icon-only' }"
              v-if="props.showMeta && reactiveContainerElementWidth < 280"
            >
              <LxButton
                kind="ghost"
                :label="props.texts.infoButton"
                :disabled="props.disabled"
                :loading="props.loading"
                icon="info"
                :variant="infoButtonVariant"
                :title="props.texts.infoButton"
                @click="openModal(props.customItem.id)"
              ></LxButton>
            </div>
          </div>
        </div>
        <div class="lx-file-addition-data-wrapper">
          <div class="lx-file-meta" v-if="props.customItem.meta">
            <p class="lx-data" title="Size">
              {{ fileUploaderUtils.convertBytesToFormattedString(props.customItem.meta?.size) }}
            </p>
            <p class="lx-data" title="Extension">
              {{ fileUploaderUtils.getFileExtension(props.customItem.name) }}
            </p>
            <p
              class="lx-data"
              title="Resolution"
              v-if="fileUploaderUtils.getExtraParameter(props.customItem.meta)"
            >
              {{ fileUploaderUtils.getExtraParameter(props.customItem.meta) }}
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
              :label="props.texts.infoButton"
              :disabled="props.disabled"
              :loading="props.loading"
              icon="info"
              :variant="infoButtonVariant"
              :title="props.texts.infoButton"
              @click="openModal(props.customItem.id)"
            ></LxButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="props.mode === 'compact'">
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
          <div
            class="lx-list-item"
            :class="{
              'lx-list-item-interactive':
                props.hasDownloadButton && !props.disabled && !props.loading,
            }"
            :title="props.hasDownloadButton ? props.texts?.download : ''"
            @keyup.space="downloadFile(props.customItem.id)"
            @keyup.enter="downloadFile(props.customItem.id)"
            @click="downloadFile(props.customItem.id)"
          >
            <div class="lx-file-name-main-data-wrapper">
              <p class="lx-file-name">{{ props.customItem.name }}</p>
              <p class="lx-file-main-additional-info lx-secondary">
                {{
                  [
                    fileUploaderUtils.convertBytesToFormattedString(props.customItem.meta?.size),
                    fileUploaderUtils.getFileExtension(props.customItem.meta.name),
                    fileUploaderUtils.getExtraParameter(props.customItem.meta),
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
              v-if="props.customItem.state === 'loading'"
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
              icon="info"
              :title="props.texts.infoButton"
              @click="openModal(props.customItem.id)"
            ></LxButton>
            <LxButton
              v-if="!props.readOnly"
              kind="ghost"
              variant="icon-only"
              icon="remove"
              :title="props.texts.clear"
              @click="removeFile(props.customItem.id)"
              :destructive="true"
              :disabled="props.disabled"
              :loading="props.loading"
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
