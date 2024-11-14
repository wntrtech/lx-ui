<script setup>
import { ref, onMounted, watch, computed, onUnmounted, inject } from 'vue';
import LxButton from '@/components/Button.vue';
import { generateUUID } from '@/utils/stringUtils';
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
  texts: {
    type: Object,
    default: () => ({
      errorLabel: 'Notika kļūda',
      errorDescription: 'Nav piešķirta atļauja izmantot kameru',
      reloadPage: 'Pārlādēt lapu',
      changeCamera: 'Mainīt kameru',
      takePhoto: 'Uzņemt attēlu',
      deletePhoto: 'Mēģināt vēlreiz',
      toggleFlashlight: 'Zibspuldze',
    }),
  },
});

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

async function switchCamera(val) {
  await stopStream();

  await getCameraDevices();

  try {
    error.value = false;
    loading.value = true;

    let constraints = {};
    if (props.cameraSwitcherMode === 'list') {
      selectedCamera.value = val || camerasList.value?.[0];

      constraints = {
        video: selectedCamera.value?.deviceId ? { deviceId: selectedCamera.value.deviceId } : true,
      };
    } else if (props.cameraSwitcherMode === 'toggle') {
      if (!selectedCamera.value?.facingMode || selectedCamera.value?.facingMode === 'environment') {
        selectedCamera.value = { facingMode: 'user' };
      } else selectedCamera.value = { facingMode: 'environment' };

      constraints = {
        video: {
          facingMode: selectedCamera.value?.facingMode || 'environment',
        },
      };
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.value.srcObject = stream;
      localStorage.setItem(
        `${system}-${props.preferencesId}`,
        JSON.stringify({ camera: constraints?.video, flashlight: flashlight.value })
      );
    } catch (errorVal) {
      error.value = true;
    }

    if (camerasList.value?.length <= 1) await getCameraDevices();

    if (stream && (props.hasFlashlightToggle || props.imageSize === 'max')) {
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities();

      if (props.imageSize === 'max') {
        canvas.value.width = capabilities.width.max;
        canvas.value.height = capabilities.height.max;
      }

      if (props.hasFlashlightToggle) {
        if (capabilities.torch) {
          track.applyConstraints({ advanced: [{ torch: flashlight.value }] });
          cameraHasFlashlight.value = true;
        } else {
          cameraHasFlashlight.value = false;
        }
      }
    }
  } catch (errorVal) {
    error.value = true;
    lxDevUtils.logError('Error switching cameras', useLx().getGlobals()?.environment);
  } finally {
    loading.value = false;
  }
}

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

function actionClicked(actionId) {
  if (actionId === 'refresh') {
    localStorage.removeItem(`${system}-${props.preferencesId}`);
    window.location.reload();
  }
}

onMounted(async () => {
  if (camerasList.value?.length === 1 && camerasList.value[0].deviceId === '') {
    loading.value = false;
    error.value = true;
  } else {
    const settings = localStorage.getItem(`${system}-${props.preferencesId}`);
    const settingsObj = JSON.parse(settings);
    if (settings) {
      if (!settingsObj?.camera?.facingMode) {
        await switchCamera(settingsObj?.camera);
      } else {
        if (settingsObj?.camera?.facingMode === 'user')
          selectedCamera.value = { facingMode: 'environment' };
        else selectedCamera.value = { facingMode: 'user' };
        await switchCamera();
      }
      if (settingsObj?.flashlight) flashlight.value = true;
    } else {
      await switchCamera();
    }
  }
});

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onUnmounted(() => {
  stopStream();
});
</script>

<template>
  <div class="lx-camera" :aria-labelledby="labelledBy">
    <LxToolbar v-if="!modelValue">
      <template #rightArea>
        <LxToolbarGroup v-if="hasFlashlightToggle && cameraHasFlashlight && !loading && !error">
          <LxToggle v-model="flashlight" :tooltip="texts.toggleFlashlight" />
        </LxToolbarGroup>
        <LxToolbarGroup>
          <LxButton
            v-if="camerasList?.length > 1 && cameraSwitcherMode === 'toggle'"
            icon="camera-switch"
            kind="ghost"
            :title="texts.changeCamera"
            :disabled="error || loading"
            @click="switchCamera()"
          />
          <LxDropDownMenu v-if="camerasList?.length > 1 && cameraSwitcherMode === 'list'">
            <LxButton
              :title="texts.changeCamera"
              kind="ghost"
              icon="menu"
              :disabled="error || loading"
            />
            <template #panel>
              <LxButton
                v-for="camera in camerasList"
                :key="camera.deviceId"
                :label="camera.label || camera.deviceId"
                kind="ghost"
                :active="selectedCamera?.deviceId === camera?.deviceId"
                @click="switchCamera(camera)"
              />
            </template>
          </LxDropDownMenu>
        </LxToolbarGroup>
      </template>
    </LxToolbar>
    <LxLoader :loading="true" v-if="loading" />
    <div v-else-if="error" class="lx-camera-error">
      <LxEmptyState
        :label="texts.errorLabel"
        icon="invalid"
        :description="texts.errorDescription"
        :actionDefinitions="[{ id: 'refresh', name: texts.reloadPage, icon: 'refresh' }]"
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
      <LxButton @click="captureImage" icon="camera" :label="texts.takePhoto" v-if="!modelValue" />
      <LxButton
        icon="cancel"
        :label="texts.deletePhoto"
        @click="model = null"
        kind="tertiary"
        v-else
      />
    </div>
  </div>
</template>
