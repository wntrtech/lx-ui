<script setup>
import { ref, onMounted, nextTick, computed, watch, inject } from 'vue';
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxLoader from '@/components/Loader.vue';
import LxToggle from '@/components/Toggle.vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  formats: { type: Array, default: () => ['qr_code'] },
  hasFileUploader: { type: Boolean, default: true },
  kind: { type: String, default: 'single' }, // single || multiple
  cameraSwitcherMode: { type: String, default: 'list' }, // list || toggle
  hasFlashlightToggle: { type: Boolean, default: false },
  showAlerts: { type: Boolean, default: true },
  labelId: { type: String, default: null },
  texts: {
    type: Object,
    default: () => ({
      notAllowedError: 'Nav piešķirta atļauja izmantot kameru',
      notFoundError: 'Neviena kamera nav atrasta',
      notReadableError: 'Kameru jau izmanto cita lietotne',
      error: 'Nesanāca nolasīt kodu',
      errorLabel: 'Kļūda',
      success: 'Kods veiksmīgi noskenēts',
      continueScanning: 'Turpināt skenēšanu',
      dragHere: 'Ievelciet datni šeit',
      changeCamera: 'Mainīt kameru',
      scanFile: 'Skenēt datni',
      reloadPage: 'Pārlādēt lapu',
      toggleFlashlight: 'Zibspuldze',
    }),
  },
});

const emits = defineEmits(['update', 'error']);

const accepted = ref(false);
const error = ref(false);
const errorMessage = ref();
const dragOver = ref(false);
const loading = ref(true);
const refreshError = ref(false);

function onError(err) {
  error.value = true;
  loading.value = false;
  refreshError.value = true;
  if (dragOver.value) dragOver.value = false;

  if (err?.name === 'NotAllowedError') {
    errorMessage.value = props.texts.notAllowedError;
  } else if (err?.name === 'NotFoundError') {
    errorMessage.value = props.texts.notFoundError;
  } else if (err?.name === 'NotReadableError') {
    errorMessage.value = props.texts.notReadableError;
  } else {
    errorMessage.value = props.texts.error;
  }
  emits('error', errorMessage.value);
}

const timer = ref();

function onDetect(detectedCodes) {
  const value = JSON.stringify(detectedCodes.map((code) => code.rawValue));
  emits('update', value);
  if (dragOver.value) dragOver.value = false;
  if (detectedCodes?.length === 0 && props.showAlerts) {
    error.value = true;
    errorMessage.value = props.texts.error;
  } else if (props.showAlerts) accepted.value = true;

  if (props.kind === 'multiple' && props.showAlerts) {
    if (timer.value) {
      clearTimeout(timer.value);
    }
    timer.value = setTimeout(() => {
      if (accepted.value) accepted.value = false;
      if (error.value) error.value = false;
    }, 3000);
  }
}

function openCapture() {
  document.getElementById(props.id).click();
}

const camerasList = ref([]);
const selectedCamera = ref({});

const getCameraDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const camerasListRaw = devices.filter((device) => device.kind === 'videoinput');
    camerasList.value = camerasListRaw;
  } catch (errorVal) {
    emits('error', errorVal);
  }
};

const showPreview = ref(false);

function switchCamera(val) {
  if (props.cameraSwitcherMode === 'list') {
    showPreview.value = false;
    selectedCamera.value = val;
    loading.value = true;
    nextTick(() => {
      showPreview.value = true;
    });
  } else if (props.cameraSwitcherMode === 'toggle') {
    showPreview.value = false;
    if (!selectedCamera.value?.facingMode || selectedCamera.value?.facingMode === 'user') {
      selectedCamera.value = { facingMode: 'environment' };
    } else selectedCamera.value = { facingMode: 'user' };
    loading.value = true;
    nextTick(() => {
      showPreview.value = true;
    });
  }
}

watch(
  () => props.cameraSwitcherMode,
  (newVal) => {
    if (newVal === 'toggle') {
      selectedCamera.value = { facingMode: 'environment' };
    } else if (newVal === 'list') {
      switchCamera(camerasList.value?.[0]);
    }
  }
);

function resetAccepted() {
  accepted.value = false;
}
function emptyStateAction(id) {
  if (id === 'reset') error.value = false;
  if (id === 'refresh') location.reload();
}

function dragEnter() {
  dragOver.value = true;
}

function dragLeave() {
  dragOver.value = false;
}

const torchNotSupported = ref(false);
const torch = ref(false);

function cameraOn(capabilities) {
  loading.value = false;
  if (!capabilities?.torch) torchNotSupported.value = true;
  else torchNotSupported.value = false;
}

const showScanner = computed(() => {
  if (props.kind === 'single') {
    return !accepted.value && !error.value && !loading.value;
  }
  return !loading.value && !refreshError.value;
});

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(async () => {
  await getCameraDevices();
  switchCamera(camerasList.value?.[0]);
});
</script>

<template>
  <div
    class="lx-qr-scanner-wrapper"
    :class="{ 'drag-over': dragOver }"
    :aria-labelledby="labelledBy"
  >
    <div
      class="lx-toolbar lx-qr-scanner-toolbar"
      v-if="camerasList?.length > 1 || hasFileUploader || hasFlashlightToggle"
    >
      <LxToggle
        v-model="torch"
        v-if="!torchNotSupported && hasFlashlightToggle"
        :tooltip="texts.toggleFlashlight"
      />
      <LxButton
        :title="texts.scanFile"
        kind="ghost"
        icon="documents"
        :disabled="refreshError || accepted || error"
        @click="openCapture"
        v-if="hasFileUploader"
      />
      <LxButton
        v-if="camerasList?.length > 1 && cameraSwitcherMode === 'toggle'"
        icon="camera-switch"
        kind="ghost"
        :title="texts.changeCamera"
        @click="switchCamera()"
      />
      <LxDropDownMenu v-if="camerasList?.length > 1 && cameraSwitcherMode === 'list'">
        <lx-button :title="texts.changeCamera" kind="ghost" icon="menu" />
        <template #panel>
          <LxButton
            v-for="camera in camerasList"
            :key="camera.deviceId"
            :label="camera.label ? camera.label : camera.deviceId"
            kind="ghost"
            :active="selectedCamera?.deviceId === camera?.deviceId"
            @click="switchCamera(camera)"
          />
        </template>
      </LxDropDownMenu>
    </div>
    <div class="lx-qr-scanner">
      <Transition name="fade">
        <qrcode-stream
          @detect="onDetect"
          @error="onError"
          :torch="torch && !torchNotSupported"
          :formats="formats"
          v-show="showScanner"
          :constraints="selectedCamera"
          :paused="kind === 'single' ? error || accepted : false"
          @camera-on="cameraOn"
          v-if="showPreview"
        >
          <div class="lx-qr-center" v-show="showScanner">
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 24 24"
              style="enable-background: new 0 0 24 24"
              xml:space="preserve"
            >
              <g>
                <polygon points="1,1 6,1 6,0.7 0.6,0.7 0.6,6 1,6 	"></polygon>
                <polygon points="17.9,0.7 17.9,1 23,1 23,6 23.3,6 23.3,0.7 	"></polygon>
                <polygon points="22.9,23 17.9,23 17.9,23.4 23.3,23.4 23.3,18 22.9,18 	"></polygon>
                <polygon points="1,18 0.6,18 0.6,23.4 6,23.4 6,23 1,23 	"></polygon>
              </g>
            </svg>
          </div>
        </qrcode-stream>
      </Transition>
      <Transition name="fade">
        <div v-if="loading" class="lx-qr-loader">
          <LxLoader :loading="true" />
        </div>
      </Transition>
      <div
        v-show="accepted || error"
        class="lx-qr-placeholder"
        v-if="kind === 'single' || (kind === 'multiple' && refreshError)"
      >
        <Transition name="fade">
          <div class="lx-qr-success" v-if="accepted">
            <div class="lx-qr-success-core">
              <LxIcon value="accept" />
              <p>{{ texts.success }}</p>
              <LxButton :label="texts.continueScanning" @click="resetAccepted()" />
            </div>
          </div>
        </Transition>
        <Transition name="fade">
          <div class="lx-qr-error" v-show="error">
            <div class="lx-qr-error-core">
              <LxEmptyState
                :label="texts.errorLabel"
                :description="errorMessage"
                icon="invalid"
                :action-definitions="
                  !refreshError
                    ? [{ id: 'reset', name: texts.continueScanning }]
                    : [{ id: 'refresh', name: texts.reloadPage, icon: 'refresh' }]
                "
                @emptyStateActionClick="emptyStateAction"
              />
            </div>
          </div>
        </Transition>
      </div>
      <Transition name="fade">
        <div v-show="accepted || error" v-if="kind === 'multiple'">
          <div class="lx-qr-notification">
            <Transition name="fade">
              <div class="lx-qr-success" v-if="accepted">
                <LxIcon value="notification-success" />
                <p>{{ texts.success }}</p>
              </div>
            </Transition>
            <Transition name="fade">
              <div class="lx-qr-error" v-if="error && !refreshError">
                <LxIcon value="invalid" />
                <p>{{ texts.errorLabel }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
    <Transition name="fade">
      <qrcode-drop-zone
        @detect="onDetect"
        @error="onError"
        :formats="formats"
        class="lx-qr-drag-wrapper"
        v-if="hasFileUploader"
        v-show="(!accepted && !error) || kind === 'multiple'"
      >
        <div class="lx-qr-drag-zone" @dragenter="dragEnter" @dragleave="dragLeave">
          <p>{{ texts.dragHere }}</p>
        </div>
      </qrcode-drop-zone>
    </Transition>
    <qrcode-capture
      v-if="hasFileUploader"
      :id="id"
      @detect="onDetect"
      @error="onError"
      :formats="formats"
      :multiple="false"
      capture="user"
      hidden
    />
  </div>
</template>
