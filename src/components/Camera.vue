<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import LxButton from '@/components/Button.vue';
import { generateUUID } from '@/utils/stringUtils';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxLoader from '@/components/Loader.vue';
import { lxDevUtils } from '@/utils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: String, default: null },
  cameraSwitcherMode: { type: String, default: 'toggle' }, // toggle || list
  texts: {
    type: Object,
    default: () => ({
      errorLabel: 'Notika kļūda',
      errorDescription: 'Nav piešķirta atļauja izmantot kameru',
      reloadPage: 'Pārlādēt lapu',
      changeCamera: 'Mainīt kameru',
      takePhoto: 'Uzņemt attēlu',
      deletePhoto: 'Mēģināt vēlreiz',
    }),
  },
});

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

function captureImage() {
  const context = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
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

  try {
    error.value = false;
    loading.value = true;

    let constraints = {};
    if (props.cameraSwitcherMode === 'list') {
      selectedCamera.value = val;

      constraints = {
        video: selectedCamera.value?.deviceId ? { deviceId: selectedCamera.value.deviceId } : true,
      };
    } else if (props.cameraSwitcherMode === 'toggle') {
      //
      if (!selectedCamera.value?.facingMode || selectedCamera.value?.facingMode === 'environment') {
        selectedCamera.value = { facingMode: 'user' };
      } else selectedCamera.value = { facingMode: 'environment' };

      constraints = {
        video: { facingMode: selectedCamera.value?.facingMode || 'environment' },
      };
    }

    let flag = 0;
    while (flag < 10) {
      try {
        // eslint-disable-next-line no-await-in-loop
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.value.srcObject = stream;
        break;
      } catch (errorVal) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      } finally {
        flag += 1;
      }
    }
    if (flag >= 9) error.value = true;
  } catch (errorVal) {
    error.value = true;
    lxDevUtils.logError('Error switching cameras', errorVal);
  } finally {
    loading.value = false;
  }
}

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
    window.location.reload();
  }
}

onMounted(async () => {
  // used to cause camera access request
  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (errorVal) {
    error.value = true;
  }
  await getCameraDevices();
  if (camerasList.value?.length === 1 && camerasList.value[0].deviceId === '') {
    loading.value = false;
    error.value = true;
  } else await switchCamera(camerasList.value?.[0]);
});

onUnmounted(() => {
  stopStream();
});
</script>

<template>
  <div class="lx-camera">
    <LxToolbar v-if="!modelValue">
      <template #rightArea>
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
              :label="camera.label ? camera.label : camera.deviceId"
              kind="ghost"
              :active="selectedCamera?.deviceId === camera?.deviceId"
              @click="switchCamera(camera)"
            />
          </template>
        </LxDropDownMenu>
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
