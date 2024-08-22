<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { logError } from '@/utils/devUtils';
import LxButton from '@/components/Button.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';

const props = defineProps({
  modelValue: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: '500' },
  height: { type: String, default: '400' },
  instrument: { type: String, default: 'brush' }, // "brush"
  color: { type: String, default: 'black' }, // "black", "red", "orange", "yellow", "green", "teal", "blue", "purple", "gray"
  showInstruments: { type: Boolean, default: false },
  showColorPicker: { type: Boolean, default: false },
  showClearAll: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      paintbrush: 'Ota',
      color: 'Krāsas izvēle',
      clear: 'Notīrīt visu',
    }),
  },
});

const emits = defineEmits(['update:modelValue', 'update:instrument', 'update:color']);

const colorsList = ref([
  { id: 1, label: 'black', value: '#000', variable: '--color-data' },
  { id: 2, label: 'red', value: 'rgb(218, 30, 40)', variable: '--color-red' },
  { id: 3, label: 'orange', value: 'rgb(255, 131, 43)', variable: '--color-orange' },
  { id: 4, label: 'yellow', value: '#f1c21b', variable: '--color-yellow' },
  { id: 5, label: 'green', value: 'rgb(25, 128, 56)', variable: '--color-green' },
  { id: 6, label: 'teal', value: '#00b8d9', variable: '--color-teal' },
  { id: 7, label: 'blue', value: '#2684ff', variable: '--color-blue' },
  { id: 8, label: 'purple', value: '#6554c0', variable: '--color-purple' },
  { id: 9, label: 'label', value: '#6c6c6c', variable: '--color-label' },
]);

const canvas = ref(null);
const canvasWidth = ref(Math.max(parseInt(props.width, 10), 200));
const canvasHeight = ref(Math.max(parseInt(props.height, 10), 200));
const context = ref(null);
const drawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);
const selectedInstrument = ref(props.instrument);

const strokeWidth = ref(3);
const strokeLineJoint = ref('round');
const paths = ref([]);
const currentPath = ref([]);
const textsRef = ref({
  paintbrush: props.texts.paintbrush,
  color: props.texts.color,
  clear: props.texts.clear,
});

const getColorOrVariableByLabel = (label, returnType = 'color') => {
  const colorObj = colorsList.value.find((color) => color.label === label);
  if (returnType === 'color') {
    return colorObj.value;
  }
  return colorObj.variable;
};

const selectedColorLabel = ref(props.color);
const selectedColor = ref(getColorOrVariableByLabel(selectedColorLabel.value));
const selectedColorVariable = ref(getColorOrVariableByLabel(selectedColorLabel.value, 'variable'));
const backgroundColor = ref('#eee');

const generateSVG = () => {
  if (!canvas.value) return '';

  const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth.value}" height="${canvasHeight.value}">`;
  const svgPaths = paths.value
    .map(
      ({ path, color, variable }) =>
        `<path data-semantic-color="${variable}" fill="none" stroke="${color}" d="${path}" stroke-width="${strokeWidth.value}" stroke-linejoin="${strokeLineJoint.value}"/>`
    )
    .join('');
  const svgFooter = '</svg>';

  return `${svgHeader}<g>${svgPaths}</g>${svgFooter}`;
};

const emitSVG = () => {
  const svgString = generateSVG();
  emits('update:modelValue', svgString);
};

const throttledEmitSVG = useThrottleFn(() => {
  emitSVG();
}, 500);

const startDrawing = (event) => {
  // Left mouse button only
  if (
    (event.pointerType === 'mouse' && event.button !== 0) ||
    props.disabled ||
    selectedInstrument.value !== 'brush'
  )
    return;

  drawing.value = true;
  const { clientX, clientY } = event;
  lastX.value = Math.round(clientX - canvas.value.getBoundingClientRect().left);
  lastY.value = Math.round(clientY - canvas.value.getBoundingClientRect().top);

  currentPath.value = [];
  currentPath.value.push(`M ${lastX.value} ${lastY.value}`);
};

const draw = (event) => {
  if (!drawing.value || !context.value || props.disabled) return;

  const { clientX, clientY } = event;
  const x = Math.round(clientX - canvas.value.getBoundingClientRect().left);
  const y = Math.round(clientY - canvas.value.getBoundingClientRect().top);

  // Avoid adding the same coordinate twice in a row
  if (x !== lastX.value || y !== lastY.value) {
    context.value.beginPath();
    context.value.moveTo(lastX.value, lastY.value);
    context.value.lineTo(x, y);
    context.value.strokeStyle =
      selectedInstrument.value === 'eraser' ? backgroundColor.value : selectedColor.value;
    context.value.lineWidth = selectedInstrument.value === 'eraser' ? 20 : strokeWidth.value;
    context.value.lineJoin = 'round';
    context.value.stroke();

    if (selectedInstrument.value === 'eraser') {
      // TODO: Add eraser logic
    } else {
      currentPath.value.push(`L ${x} ${y}`);
    }

    lastX.value = x;
    lastY.value = y;
  }
};

const stopDrawing = () => {
  if (!drawing.value || !context.value || props.disabled) return;
  drawing.value = false;

  if (currentPath.value.length > 0) {
    paths.value.push({
      path: currentPath.value.join(' '),
      color: selectedColor.value,
      variable: selectedColorVariable.value,
    });
    currentPath.value = [];
  }
  throttledEmitSVG();
};

const updateColor = (color, label, variable) => {
  selectedColor.value = color;
  selectedColorVariable.value = variable;

  if (selectedInstrument.value === 'brush') {
    context.value.strokeStyle = color;
  }
  emits('update:color', {
    colorLabel: label,
    colorValue: color,
    colorVariable: variable,
  });
};

const updatedInstrument = (instrument) => {
  selectedInstrument.value = instrument;

  if (instrument === 'eraser') {
    context.value.strokeStyle = backgroundColor.value;
  } else {
    context.value.strokeStyle = selectedColor.value;
  }
  emits('update:instrument', instrument);
};

const clearCanvas = () => {
  context.value.clearRect(0, 0, canvas.value?.width || 0, canvas.value?.height || 0);
  paths.value = [];
  emits('update:modelValue', null);
};

watch(
  [() => props.modelValue, () => props.width, () => props.height],
  ([newSVGData, newWidth, newHeight]) => {
    canvasWidth.value = Math.max(parseInt(newWidth, 10), 200);
    canvasHeight.value = Math.max(parseInt(newHeight, 10), 200);

    if (newSVGData) {
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(newSVGData)}`;
      img.onload = () => {
        context.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
        context.value.drawImage(img, 0, 0, canvasWidth.value, canvasHeight.value);

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(newSVGData, 'image/svg+xml');

        paths.value = Array.from(svgDoc.querySelectorAll('path')).map((pathElement) => {
          const strokeColor = pathElement.getAttribute('stroke') || colorsList.value[0].value;
          const colorDataAttribute =
            pathElement.getAttribute('data-semantic-color') || colorsList.value[0].variable;

          return {
            path: pathElement.getAttribute('d') || '',
            color: strokeColor,
            variable: colorDataAttribute,
          };
        });
        emitSVG();
      };

      img.onerror = (error) => {
        logError(error);
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.texts,
  (newTexts) => {
    textsRef.value = {
      paintbrush: newTexts.paintbrush,
      color: newTexts.color,
      clear: newTexts.clear,
    };
  },
  { deep: true }
);

watch(
  () => props.instrument,
  (newInstrument) => {
    selectedInstrument.value = newInstrument;
  }
);
watch(
  () => props.color,
  (newColorLabel) => {
    selectedColor.value = getColorOrVariableByLabel(newColorLabel);
    selectedColorLabel.value = newColorLabel;
    selectedColorVariable.value = getColorOrVariableByLabel(newColorLabel, 'variable');
  }
);

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
  }
});
</script>

<template>
  <div class="lx-field-wrapper">
    <div class="lx-drawpad-wrapper">
      <LxToolbar>
        <template #leftArea>
          <LxToolbarGroup v-if="showInstruments" class="left-group">
            <LxButton
              icon="brush"
              kind="ghost"
              variant="icon-only"
              :title="textsRef.paintbrush"
              :disabled="disabled"
              :active="selectedInstrument === 'brush'"
              @click="updatedInstrument('brush')"
            />
          </LxToolbarGroup>

          <LxDropDownMenu v-if="showColorPicker">
            <LxButton
              icon="color"
              kind="ghost"
              variant="icon-only"
              :title="textsRef.color"
              :disabled="props.disabled"
            />
            <template #panel>
              <ul class="lx-color-list">
                <li
                  v-for="color in colorsList"
                  :key="color.id"
                  class="lx-color-item"
                  :class="[
                    {
                      'lx-selected': selectedColorVariable === color.variable,
                    },
                    color.label,
                  ]"
                  @click="updateColor(color.value, color.label, color.variable)"
                  @keydown.enter.prevent="updateColor(color.value, color.label, color.variable)"
                >
                  <div></div>
                </li>
              </ul>
            </template>
          </LxDropDownMenu>
        </template>

        <template #rightArea>
          <LxButton
            v-if="showClearAll"
            icon="reset"
            kind="ghost"
            variant="icon-only"
            :title="textsRef.clear"
            :disabled="disabled"
            @click="clearCanvas"
          />
        </template>
      </LxToolbar>

      <canvas
        ref="canvas"
        class="lx-canvas-element"
        :class="{ 'is-disabled': disabled }"
        :width="canvasWidth"
        :height="canvasHeight"
        @pointerdown.prevent="startDrawing"
        @pointermove.prevent="draw"
        @pointerup.prevent="stopDrawing"
        @pointerleave.prevent="stopDrawing"
        @pointercancel.prevent="stopDrawing"
        @contextmenu.prevent
      >
      </canvas>
    </div>
  </div>
</template>
