<script setup>
import { ref, onMounted, watch, computed, onUnmounted, inject } from 'vue';
import LxButton from '@/components/Button.vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxLoader from '@/components/Loader.vue';
import LxToggle from '@/components/Toggle.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: String, default: null },
  cameraSwitcherMode: { type: String, default: 'toggle' }, // toggle || list
  hasFlashlightToggle: { type: Boolean, default: false },
  imageSize: { type: String, default: 'default' }, // default || max
  preferencesId: { type: String, default: 'lx-camera-settings' },
  labelId: { type: String, default: null },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  errorLabel: 'Notika kļūda',
  errorDescription: 'Nav piešķirta atļauja izmantot kameru',
  reloadPage: 'Pārlādēt lapu',
  changeCamera: 'Mainīt kameru',
  takePhoto: 'Uzņemt attēlu',
  deletePhoto: 'Mēģināt vēlreiz',
  toggleFlashlight: 'Zibspuldze',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const system = useLx().getGlobals()?.systemId;

const emits = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const video = ref(null);
const canvas = ref(null);
const error = ref(false);
const loading = ref(true);

const flashlight = ref(false);
const cameraHasFlashlight = ref(false);

function captureImage() {
  const context = canvas.value.getContext('2d');
  if (props.imageSize === 'default') {
    canvas.value.width = video.value.videoWidth;
    canvas.value.height = video.value.videoHeight;
  }
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  model.value = canvas.value.toDataURL('image/jpeg');
}

const camerasList = ref([]);
const selectedCamera = ref({});
let stream = null;

async function getCameraDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const camerasListRaw = devices.filter((device) => device.kind === 'videoinput');
    camerasList.value = camerasListRaw;
  } catch (errorVal) {
    lxDevUtils.logError('Error getting camera devices', errorVal);
  }
}

async function stopStream() {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    stream = null;
  }
}

function initializeSwitching() {
  error.value = false;
  loading.value = true;
}

function getCameraConstraints(val) {
  if (props.cameraSwitcherMode === 'list') {
    selectedCamera.value = val || camerasList.value?.[0];
    return {
      video: selectedCamera.value?.deviceId ? { deviceId: selectedCamera.value.deviceId } : true,
    };
  }

  if (props.cameraSwitcherMode === 'toggle') {
    selectedCamera.value =
      !selectedCamera.value?.facingMode || selectedCamera.value?.facingMode === 'environment'
        ? { facingMode: 'user' }
        : { facingMode: 'environment' };

    return { video: { facingMode: selectedCamera.value?.facingMode || 'environment' } };
  }

  return { video: true };
}

function saveCameraSettings(constraints) {
  localStorage.setItem(
    `${system}-${props.preferencesId}`,
    JSON.stringify({ camera: constraints?.video, flashlight: flashlight.value })
  );
}

async function startCameraStream(constraints) {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.value.srcObject = stream;
    saveCameraSettings(constraints);
  } catch {
    error.value = true;
  }
}

function applyStreamSettings(track, capabilities) {
  if (props.imageSize === 'max') {
    canvas.value.width = capabilities.width.max;
    canvas.value.height = capabilities.height.max;
  }

  if (props.hasFlashlightToggle) {
    cameraHasFlashlight.value = capabilities.torch || false;
    if (cameraHasFlashlight.value) {
      track.applyConstraints({ advanced: [{ torch: flashlight.value }] });
    }
  }
}

async function updateCameraSettings() {
  if (camerasList.value?.length <= 1) await getCameraDevices();
  if (!stream || (!props.hasFlashlightToggle && props.imageSize !== 'max')) return;

  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();

  applyStreamSettings(track, capabilities);
}

function handleCameraError() {
  error.value = true;
  lxDevUtils.logError('Error switching cameras', useLx().getGlobals()?.environment);
}

const cameraListDisplay = computed(() =>
  camerasList.value.map((camera) => ({
    ...camera,
    id: camera.deviceId,
    name: camera.label || camera.deviceId,
    active: selectedCamera.value?.deviceId === camera.deviceId,
  }))
);

async function switchCamera(val) {
  await stopStream();
  await getCameraDevices();

  try {
    initializeSwitching();

    const constraints = getCameraConstraints(val);
    await startCameraStream(constraints);
    await updateCameraSettings();
  } catch (errorVal) {
    handleCameraError();
  } finally {
    loading.value = false;
  }
}

function changeCamera(actionId) {
  const camera = camerasList.value.find((x) => x?.deviceId === actionId);
  if (camera) {
    switchCamera(camera);
  }
}

function actionClicked(actionId) {
  if (actionId === 'refresh') {
    localStorage.removeItem(`${system}-${props.preferencesId}`);
    window.location.reload();
  }
}

function isSingleInvalidCamera() {
  return camerasList.value?.length === 1 && camerasList.value[0].deviceId === '';
}

function setCameraError() {
  loading.value = false;
  error.value = true;
}

function getStoredCameraSettings() {
  const settings = localStorage.getItem(`${system}-${props.preferencesId}`);
  return settings ? JSON.parse(settings) : null;
}

function determineCameraMode(settingsObj) {
  selectedCamera.value =
    settingsObj?.camera?.facingMode === 'user'
      ? { facingMode: 'environment' }
      : { facingMode: 'user' };
}

async function initializeCameraSettings(settingsObj) {
  if (!settingsObj?.camera?.facingMode) {
    await switchCamera(settingsObj?.camera);
  } else {
    determineCameraMode(settingsObj);
    await switchCamera();
  }

  if (settingsObj?.flashlight) {
    flashlight.value = true;
  }
}

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

watch(
  () => flashlight.value,
  (newValue) => {
    if (stream && cameraHasFlashlight.value) {
      const [track] = stream.getVideoTracks();
      track.applyConstraints({ advanced: [{ torch: newValue }] });

      const settings = localStorage.getItem(`${system}-${props.preferencesId}`);
      const settingsObj = JSON.parse(settings);
      settingsObj.flashlight = newValue;

      localStorage.setItem(`${system}-${props.preferencesId}`, JSON.stringify(settingsObj));
    }
  }
);

watch(
  () => props.imageSize,
  (newValue) => {
    if (stream && newValue === 'max') {
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities();
      canvas.value.width = capabilities.width.max;
      canvas.value.height = capabilities.height.max;
    }
  }
);

watch(
  () => props.cameraSwitcherMode,
  (newVal) => {
    if (newVal === 'toggle') {
      selectedCamera.value = { facingMode: 'user' };
    } else if (newVal === 'list') {
      switchCamera(camerasList.value?.[0]);
    }
  }
);

onMounted(async () => {
  if (isSingleInvalidCamera()) {
    setCameraError();
    return;
  }

  const settings = getStoredCameraSettings();
  if (settings) {
    await initializeCameraSettings(settings);
  } else {
    await switchCamera();
  }
});

onUnmounted(() => {
  stopStream();
});
</script>

<template>
  <div class="lx-camera" :aria-labelledby="labelledBy">
    <LxToolbar v-if="!modelValue">
      <template #rightArea>
        <LxToolbarGroup v-if="hasFlashlightToggle && cameraHasFlashlight && !loading && !error">
          <LxToggle v-model="flashlight" :tooltip="displayTexts.toggleFlashlight" />
        </LxToolbarGroup>
        <LxToolbarGroup>
          <LxButton
            v-if="camerasList?.length > 1 && cameraSwitcherMode === 'toggle'"
            icon="camera-switch"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.changeCamera"
            :disabled="error || loading"
            @click="switchCamera()"
          />
          <LxDropDownMenu
            v-if="camerasList?.length > 1 && cameraSwitcherMode === 'list'"
            :actionDefinitions="cameraListDisplay"
            @actionClick="(id) => changeCamera(id)"
          >
            <LxButton
              :label="displayTexts.changeCamera"
              variant="icon-only"
              kind="ghost"
              icon="menu"
              tabindex="-1"
              :disabled="error || loading"
            />
          </LxDropDownMenu>
        </LxToolbarGroup>
      </template>
    </LxToolbar>
    <LxLoader :loading="true" v-if="loading" />
    <div v-else-if="error" class="lx-camera-error">
      <LxEmptyState
        :label="displayTexts.errorLabel"
        icon="invalid"
        :description="displayTexts.errorDescription"
        :actionDefinitions="[{ id: 'refresh', name: displayTexts.reloadPage, icon: 'refresh' }]"
        @emptyStateActionClick="actionClicked"
      />
    </div>
    <div class="lx-camera-frame" v-show="!error && !loading">
      <!-- eslint-disable-next-line vuejs-accessibility/media-has-caption -->
      <video ref="video" autoplay playsinline muted v-show="!modelValue" />
      <canvas ref="canvas" style="display: none" />
      <img :src="modelValue" alt=" " v-if="modelValue" />
    </div>
    <div class="lx-camera-buttons" v-if="!error && !loading">
      <LxButton
        @click="captureImage"
        icon="camera"
        :label="displayTexts.takePhoto"
        v-if="!modelValue"
      />
      <LxButton
        icon="cancel"
        :label="displayTexts.deletePhoto"
        @click="model = null"
        kind="tertiary"
        v-else
      />
    </div>
  </div>
</template>
