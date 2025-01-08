<script setup>
import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxButton from '@/components/Button.vue';
import LxLoader from '@/components/Loader.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxToggle from '@/components/Toggle.vue';
import LxRichTextDisplay from '@/components/RichTextDisplay.vue';
import { generateUUID, isValidFileName } from '@/utils/stringUtils';
import LxEmptyState from '@/components/EmptyState.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import { MIME_TYPES } from '@/constants';

const props = defineProps({
  modelValue: { type: String, default: null },
  resolution: { type: Number, default: 3 },
  scrollable: { type: Boolean, default: false },
  width: { type: String, default: 'auto' }, // e.g. 'auto', '100%', '100px', 30rem', '50vw'... (any css value, recommended for images and .MD)
  height: { type: String, default: 'auto' }, // e.g. 'auto', '100%', '100px', '30rem', '50vw'... (any css value, recommended for images and .MD)
  fileName: { type: String, default: null },
  texts: {
    type: Object,
    default: () => ({
      zoomIn: 'Pietuvināt',
      zoomOut: 'Attālināt',
      expand: 'Izvērst',
      collapse: 'Samazināt',
      download: 'Lejupielādēt',
      fitToHeight: 'Pielāgot augstumam',
      fitToWidth: 'Pielāgot platumam',
      goToPage: 'Pāriet uz norādīto lapu',
      prevPage: 'Pāriet uz iepriekšējo lapu',
      nextPage: 'Pāriet uz nākamo lapu',
      firstPage: 'Pāriet uz pirmo lapu',
      lastPage: 'Pāriet uz pēdējo lapu',
      inputTooltip: 'Ievadīt lapaspusi',
      invalidFileUploadedLabel: 'Nav augšupielādēta datne apskatei',
      invalidFileUploadedDescription: 'Augšupielādējiet datni',
      grabToSrollFalse: 'Iespējot ritināšanu',
      grabToSrollTrue: 'Atspējot ritināšanu',
    }),
  },
  /** @description list of mime types that should load they library on component initialization, useful when you already know that you will use pdf viewer and want to load it as soon as possible */
  preloadLibs: { type: Array, default: () => [] },
});

const pdfjsLib = shallowRef(null);

async function loadPdfLib() {
  if (!pdfjsLib.value) {
    // @ts-ignore
    const pdfjs = await import('pdfjs-dist');
    // @ts-ignore
    const workerUrl = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default;
    pdfjsLib.value = pdfjs;
  }
  return pdfjsLib.value;
}

const imgCanvasRef = ref(null);
let observer = null;
const scale = ref(1.25);
const imgScale = ref(1.0);
const fontSizeScale = ref(1.0);

const binaryText = ref();
const pdf = shallowRef(null);
const canvas = ref(null);
const canvasArray = ref([]);
const currentPage = ref(1);
const inputPage = ref(currentPage.value);
const totalPages = ref(0);
const isFileUploaded = ref(false);
const showPdf = ref(false);
const isExpanded = shallowRef(false);
const isPageRendering = ref(false);
const allPagesRendered = ref(false);
const isZooming = ref(false);
const isNavigating = ref(false);
const showInput = ref(false);
const pageInputWrapper = ref(null);
const originalImageSize = ref(null);
const dragToScrollMode = ref(true);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const scrollLeft = ref(0);
const scrollTop = ref(0);
const fitType = ref(null);

const MAX_ZOOM = {
  pdf: 2.0,
  img: 5.0,
  font: 3.0,
};
const MIN_ZOOM = {
  pdf: 0.5,
  img: 0.1,
  font: 0.1,
};

const supportedFileType = computed(() => {
  if (props.modelValue) {
    const trimmedValue = props.modelValue?.split(',')[0]?.split(':')[1]?.split(';')[0];
    if (!trimmedValue) return null;
    switch (trimmedValue) {
      case MIME_TYPES.PDF:
        return 'PDF';
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      case 'image/bmp':
      case 'image/tiff':
      case 'image/heic':
      case 'image/heif':
      case 'image/webp':
      case 'image/jfif':
      case 'image/png_file':
      case 'image/exif':
      case 'image/iptc':
      case 'image/xmp':
      case 'image/icc':
      case 'image/mpf':
      case 'image/avif':
      case 'image/photoshop':
      case 'image/thumbnail':
        return 'Image';
      case 'image/svg+xml':
        return 'SVG';
      case MIME_TYPES.Binary:
        return 'Binary';
      default:
        return null;
    }
  }
  return '';
});

function drawImage(providedScale) {
  const imgCanvas = imgCanvasRef.value;
  const ctx = imgCanvas.getContext('2d');
  if (supportedFileType.value === 'SVG') {
    // Handle SVG separately
    fetch(props.modelValue)
      .then((response) => response.text())
      .then((svgText) => {
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const svgImg = new Image();
        svgImg.src = url;

        svgImg.onload = () => {
          // Ensure the SVG has width and height attributes
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;
          const width = svgElement.getAttribute('width') || svgElement.viewBox.baseVal.width;
          const height = svgElement.getAttribute('height') || svgElement.viewBox.baseVal.height;

          originalImageSize.value = { width: parseFloat(width), height: parseFloat(height) };
          const newWidth = parseFloat(width) * providedScale;
          const newHeight = parseFloat(height) * providedScale;
          imgCanvas.width = newWidth;
          imgCanvas.height = newHeight;
          ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
          ctx.drawImage(svgImg, 0, 0, newWidth, newHeight);
          URL.revokeObjectURL(url); // Clean up the object URL
        };
      })
      .catch((error) => {
        lxDevUtils.logError(`Error loading SVG file, ${error}`, useLx().getGlobals()?.environment);
      });
  } else {
    // Handle other image types
    const img = new Image();
    img.src = props.modelValue;

    img.onload = () => {
      originalImageSize.value = { width: img.width, height: img.height };
      const newWidth = img.width * providedScale;
      const newHeight = img.height * providedScale;
      imgCanvas.width = newWidth;
      imgCanvas.height = newHeight;
      ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
    };
  }
}

function clearImgCanvas() {
  const imgCanvas = imgCanvasRef.value;
  const ctx = imgCanvas?.getContext('2d');
  ctx?.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
}

function startDragging(event) {
  if (!dragToScrollMode.value) return;
  isDragging.value = true;
  startX.value = event.pageX - imgCanvasRef.value.offsetLeft;
  startY.value = event.pageY - imgCanvasRef.value.offsetTop;
  scrollLeft.value = imgCanvasRef.value.parentElement.scrollLeft;
  scrollTop.value = imgCanvasRef.value.parentElement.scrollTop;
}

function drag(event) {
  if (!isDragging.value) return;
  event.preventDefault();
  const x = event.pageX - imgCanvasRef.value.offsetLeft;
  const y = event.pageY - imgCanvasRef.value.offsetTop;

  const walkX = (x - startX.value) * 1;
  const walkY = (y - startY.value) * 1;
  imgCanvasRef.value.parentElement.scrollLeft = scrollLeft.value - walkX;
  imgCanvasRef.value.parentElement.scrollTop = scrollTop.value - walkY;
}

function stopDragging() {
  isDragging.value = false;
}

async function renderPage(pageNum) {
  isPageRendering.value = true;

  try {
    // resolution is in the range [1;5], to avoid rendering issues
    let resolution = props.resolution >= 1 ? props.resolution : 1;
    resolution = Math.min(resolution, 5);

    const page = await pdf.value.getPage(pageNum);
    totalPages.value = pdf.value.numPages;
    const viewport = page.getViewport({ scale: scale.value });
    let canvasElement = null;

    if (props.scrollable) {
      await new Promise((resolve) => {
        nextTick(() => {
          canvasElement = canvasArray.value[pageNum - 1];
          resolve();
        });
      });
    } else {
      canvasElement = canvas.value;
    }

    const context = canvasElement.getContext('2d');

    canvasElement.width = viewport.width * resolution;
    canvasElement.height = viewport.height * resolution;
    canvasElement.style.width = `${viewport.width * 1.5}px`;
    canvasElement.style.height = `${viewport.height * 1.5}px`;

    const renderContext = {
      canvasContext: context,
      viewport,
      transform: [resolution, 0, 0, resolution, 0, 0],
    };

    await page.render(renderContext).promise;

    if (pageNum === pdf.value.numPages) {
      allPagesRendered.value = true;
      isPageRendering.value = false;
    }

    if (!props.scrollable) {
      isPageRendering.value = false;
    }
  } catch (error) {
    isPageRendering.value = false;
  }
  isPageRendering.value = false;
}

function delayExecution(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function renderAllPages(pages) {
  if (!pdf.value) return;
  const renderPageWithDelay = async (pageNum) => {
    await renderPage(pageNum);
    await delayExecution(300);
  };

  const renderPromises = [];
  for (let i = 1; i <= pages; i += 1) {
    renderPromises.push(renderPageWithDelay(i));
  }
  await Promise.all(renderPromises);
}

const renderingInProgress = computed(
  () => isPageRendering.value || (props.scrollable && !allPagesRendered.value)
);

function resetPdfViewer() {
  pdf.value = null;
  isFileUploaded.value = false;
  isExpanded.value = false;
  scale.value = 1;
  imgScale.value = 1;
  currentPage.value = 1;
  totalPages.value = 0;
  showPdf.value = false;
  showInput.value = false;
  fitType.value = null;
  dragToScrollMode.value = true;
}

async function goToPage() {
  showInput.value = false;

  if (inputPage.value < 1 || inputPage.value > totalPages.value) {
    inputPage.value = currentPage.value;
  }

  if (inputPage.value !== currentPage.value) {
    currentPage.value = inputPage.value;
  }

  if (props.scrollable) {
    const canvasElement = canvasArray.value[currentPage.value - 1];
    if (canvasElement) {
      await nextTick();
      canvasElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    renderPage(currentPage.value);
  }
}

function nextPage() {
  if (isZooming.value || renderingInProgress.value) return;
  isNavigating.value = true;
  if (currentPage.value < totalPages.value) {
    inputPage.value += 1;
    goToPage();
  }
  isNavigating.value = false;
}

function prevPage() {
  if (isZooming.value || renderingInProgress.value) return;
  isNavigating.value = true;
  if (currentPage.value > 1) {
    inputPage.value -= 1;
    goToPage();
  }
  isNavigating.value = false;
}

function firstPage() {
  if (isZooming.value || renderingInProgress.value) return;
  isNavigating.value = true;
  inputPage.value = 1;
  goToPage();
  isNavigating.value = false;
}

function lastPage() {
  if (isZooming.value || renderingInProgress.value) return;
  isNavigating.value = true;
  inputPage.value = totalPages.value;
  goToPage();
  isNavigating.value = false;
}

function toggleExpand() {
  if (renderingInProgress.value) return;
  isExpanded.value = !isExpanded.value;
}

async function zoomIn() {
  if (isNavigating.value || renderingInProgress.value) return;
  isZooming.value = true;
  scale.value = Math.min(scale.value * 1.1, MAX_ZOOM.pdf);

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages);
  } else {
    await renderPage(currentPage.value);
  }
  isZooming.value = false;
}

async function zoomOut() {
  if (isNavigating.value || renderingInProgress.value) return;
  isZooming.value = true;
  scale.value = Math.max(scale.value * 0.9, MIN_ZOOM.pdf);

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages);
  } else {
    await renderPage(currentPage.value);
  }
  isZooming.value = false;
}

function debounce(func, delay) {
  let timer;
  return function debounced(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

const debouncedZoomIn = debounce(zoomIn, 150);
const debouncedZoomOut = debounce(zoomOut, 150);
function debounecZoom(action) {
  if (action === 'zoomIn') {
    debouncedZoomIn();
  } else if (action === 'zoomOut') {
    debouncedZoomOut();
  }
}
const debouncedPrevPage = debounce(prevPage, 150);
const debouncedNextPage = debounce(nextPage, 150);

function setupIntersectionObserver() {
  if (!props.scrollable) return;

  setTimeout(() => {
    const rootElement = document.querySelector('.lx-pdf-wrapper');
    if (!rootElement || !canvasArray.value.length) {
      return;
    }

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = canvasArray.value.indexOf(entry.target) + 1;
            currentPage.value = pageNumber;
            inputPage.value = currentPage.value;
          }
        });
      },
      {
        root: rootElement,
        threshold: 0.25,
      }
    );

    canvasArray.value.forEach((canvasElement) => {
      observer.observe(canvasElement);
    });
  }, 500);
}

function disconnectObserver() {
  if (observer) {
    observer.disconnect();
  }
}

async function loadPdfFromFile(pdfData) {
  await loadPdfLib();
  const loadingTask = pdfjsLib.value.getDocument({ data: atob(pdfData) });
  pdf.value = await loadingTask.promise;
  if (props.scrollable) {
    renderAllPages(pdf.value.numPages);
    setupIntersectionObserver();
  } else {
    renderPage(1);
  }
}

watch(
  () => props.resolution,
  () => {
    if (pdf.value) {
      if (renderingInProgress.value) return;
      if (props.scrollable) {
        renderAllPages(pdf.value.numPages);
      } else {
        renderPage(currentPage.value);
      }
    }
  }
);

watch(
  () => props.scrollable,
  () => {
    if (pdf.value) {
      if (props.scrollable) {
        currentPage.value = 1;
        inputPage.value = 1;
        renderAllPages(pdf.value.numPages);
        setupIntersectionObserver();
      } else {
        disconnectObserver();
        currentPage.value = 1;
        inputPage.value = 1;
        renderPage(1);
      }
    }
  }
);
function handleClick(event) {
  const wrapperElement = pageInputWrapper.value;
  const isClickInside = wrapperElement.contains(event.target);

  if (wrapperElement && !isClickInside) {
    showInput.value = false;
    goToPage();
  }
}

function addEventListeners() {
  nextTick(() => {
    document.addEventListener('mousedown', handleClick);
  });
}
function removeEventListeners() {
  document.removeEventListener('mousedown', handleClick);
}

watch(showInput, (newValue) => {
  if (newValue) {
    addEventListeners();
  } else {
    removeEventListeners();
  }
});

const isLoadingPdf = ref(false);
const base64PdfPrefix = `data:${MIME_TYPES.PDF};base64,`;
const base64BinaryPrefix = `data:${MIME_TYPES.Binary};base64,`;

async function loadPdfFromBase64(base64) {
  try {
    isLoadingPdf.value = true;
    const base64Data = base64.slice(base64PdfPrefix.length);
    await loadPdfFromFile(base64Data);
    isFileUploaded.value = true;
    showPdf.value = true;
  } catch (error) {
    lxDevUtils.logError(`Error loading PDF file, ${error}`, useLx().getGlobals().environment);
  } finally {
    isLoadingPdf.value = false;
  }
}

function decodeBase64(newValue) {
  try {
    const base64Data = newValue.slice(base64BinaryPrefix.length);
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(Array.from(binaryString).map((char) => char.charCodeAt(0)));
    const decoder = new TextDecoder();
    binaryText.value = decoder.decode(bytes);
    isFileUploaded.value = true;
  } catch (error) {
    lxDevUtils.logError(`Decode Base64 error, ${error}`, useLx().getGlobals()?.environment);
    binaryText.value = '';
  }
}

function prepareSVGImage(newValue) {
  fetch(newValue)
    .then((response) => response.text())
    .then((svgText) => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      const width = svgElement.getAttribute('width') || svgElement.viewBox.baseVal.width;
      const height = svgElement.getAttribute('height') || svgElement.viewBox.baseVal.height;
      originalImageSize.value = { width: parseFloat(width), height: parseFloat(height) };
    })
    .catch((error) => {
      lxDevUtils.logError(`Error loading SVG file, ${error}`, useLx().getGlobals()?.environment);
    });
}

watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue?.startsWith(base64PdfPrefix)) {
      await loadPdfFromBase64(newValue);
      return;
    }
    if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
      if (supportedFileType.value === 'SVG') {
        prepareSVGImage(newValue);
      } else {
        const img = new Image();
        img.src = newValue;
        img.onload = () => {
          originalImageSize.value = { width: img.width, height: img.height };
        };
      }
      drawImage(imgScale.value);
    }
    if (supportedFileType.value === 'Binary') {
      decodeBase64(newValue);
    }
    resetPdfViewer();
    clearImgCanvas();
  },
  { immediate: true }
);

const isNextBtnDisabled = computed(
  () =>
    currentPage.value === totalPages.value || (currentPage.value === 1 && renderingInProgress.value)
);
const isPrevBtnDisabled = computed(() => currentPage.value === 1);
const isZoomInDisabled = computed(() => {
  if (supportedFileType.value === 'PDF') {
    return scale.value >= MAX_ZOOM.pdf;
  }
  if (supportedFileType.value === 'Binary') {
    return fontSizeScale.value >= MAX_ZOOM.font;
  }
  if (fitType.value === 'fit-to-height' || fitType.value === 'fit-to-width') {
    return true;
  }
  return Math.round(imgScale.value * 100) / 100 >= MAX_ZOOM.img;
});
const isZoomOutDisabled = computed(() => {
  if (supportedFileType.value === 'PDF') {
    return scale.value <= MIN_ZOOM.pdf;
  }
  if (supportedFileType.value === 'Binary') {
    return fontSizeScale.value <= MIN_ZOOM.font;
  }
  if (fitType.value === 'fit-to-height' || fitType.value === 'fit-to-width') {
    return true;
  }
  return Math.round(imgScale.value * 100) / 100 <= MIN_ZOOM.img;
});

const toolbarActions = computed(() => {
  const buttons = [];

  buttons.push({
    id: 'download',
    name: props.texts.download,
    icon: 'download',
    groupId: '3',
    area: 'right',
  });

  if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
    buttons.push({
      id: 'fitToHeight',
      name: props.texts.fitToHeight,
      icon: 'fit-to-height',
      active: fitType.value === 'fit-to-height',
      groupId: '4',
      area: 'right',
    });
    buttons.push({
      id: 'fitToWidth',
      name: props.texts.fitToWidth,
      icon: 'fit-to-width',
      active: fitType.value === 'fit-to-width',
      groupId: '4',
      area: 'right',
    });
  }
  if (
    supportedFileType.value === 'PDF' ||
    supportedFileType.value === 'Image' ||
    supportedFileType.value === 'SVG' ||
    supportedFileType.value === 'Binary'
  ) {
    buttons.push({
      id: 'zoomIn',
      name: props.texts.zoomIn,
      icon: 'zoom-in',
      groupId: '1',
      area: 'right',
      disabled: isZoomInDisabled.value,
    });
    buttons.push({
      id: 'zoomOut',
      name: props.texts.zoomOut,
      icon: 'zoom-out',
      groupId: '1',
      area: 'right',
      disabled: isZoomOutDisabled.value,
    });
  }

  buttons.push({
    id: 'fullscreen',
    name: isExpanded.value ? props.texts.collapse : props.texts.expand,
    icon: isExpanded.value ? 'collapse' : 'expand',
    groupId: '2',
    area: 'right',
  });

  return buttons;
});

function changeImageSize(action) {
  if (action === 'zoomIn') {
    if (imgScale.value < MAX_ZOOM.img) {
      imgScale.value += 0.1;
    }
  } else if (action === 'zoomOut') {
    if (imgScale.value > MIN_ZOOM.img + 0.1) {
      imgScale.value -= 0.1;
    }
  }
  drawImage(imgScale.value);
}

function changeFitType(action) {
  if (action === 'fitToHeight') {
    fitType.value = fitType.value === 'fit-to-height' ? '' : 'fit-to-height';
  } else if (action === 'fitToWidth') {
    fitType.value = fitType.value === 'fit-to-width' ? '' : 'fit-to-width';
  }
}

function downloadFile() {
  const link = document.createElement('a');
  link.href = props.modelValue;
  link.download = isValidFileName(props.fileName) ? props.fileName : generateUUID();
  link.click();
}

function changeTextSize(action) {
  if (action === 'zoomIn') {
    fontSizeScale.value = Math.min(
      Math.round((fontSizeScale.value + 0.1) * 10) / 10,
      MAX_ZOOM.font
    );
  } else if (action === 'zoomOut') {
    fontSizeScale.value = Math.max(
      Math.round((fontSizeScale.value - 0.1) * 10) / 10,
      MIN_ZOOM.font
    );
  }
}

function toolbarActionClick(action) {
  switch (action) {
    case 'zoomOut':
    case 'zoomIn':
      if (supportedFileType.value === 'PDF') {
        debounecZoom(action);
      }
      if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
        changeImageSize(action);
      }
      if (supportedFileType.value === 'Binary') {
        changeTextSize(action);
      }
      break;
    case 'fullscreen':
      toggleExpand();
      break;
    case 'download':
      downloadFile();
      break;
    case 'fitToHeight':
    case 'fitToWidth':
      changeFitType(action);
      break;
    case 'grabToScroll':
      dragToScrollMode.value = !dragToScrollMode.value;
      break;
    default:
      break;
  }
}
onMounted(() => {
  if (props.preloadLibs?.includes(MIME_TYPES.PDF)) {
    loadPdfLib();
  }
});

const inlineSize = computed(() =>
  isExpanded.value ? {} : { width: props.width, height: props.height }
);
</script>

<template>
  <div
    class="lx-file-viewer"
    :class="[
      { 'lx-file-viewer-fullscreen': isExpanded },
      { image: supportedFileType === 'Image' || supportedFileType === 'SVG' },
    ]"
    :style="inlineSize"
  >
    <LxEmptyState
      v-if="!supportedFileType"
      :label="texts.invalidFileUploadedLabel"
      :description="texts.invalidFileUploadedDescription"
    />
    <LxToolbar
      v-if="supportedFileType"
      :action-definitions="toolbarActions"
      @action-click="toolbarActionClick"
      class="lx-file-viewer-toolbar"
    >
      <template #rightArea>
        <LxToolbarGroup v-if="pdf">
          <LxButton
            icon="first-page"
            @click="firstPage"
            kind="ghost"
            :title="props.texts.firstPage"
            :disabled="isPrevBtnDisabled"
          />
          <LxButton
            icon="previous-page"
            @click="debouncedPrevPage"
            kind="ghost"
            :title="props.texts.prevPage"
            :disabled="isPrevBtnDisabled"
          />
          <div class="pdf-page-input" ref="pageInputWrapper">
            <div
              class="placeholder"
              v-if="!showInput || renderingInProgress"
              @click="showInput = true"
              @keydown.enter="showInput = true"
              tabindex="0"
              :title="props.texts.inputTooltip"
            >
              {{ currentPage }} / {{ totalPages }}
            </div>
            <LxTextInput
              v-if="showInput && !renderingInProgress"
              mask="integer"
              v-model.number="inputPage"
              @keydown.enter="goToPage"
            />
          </div>
          <LxButton
            icon="arrow-right"
            @click="goToPage"
            kind="ghost"
            :title="props.texts.goToPage"
            :disabled="!showInput || renderingInProgress"
          />
          <LxButton
            icon="next-page"
            @click="debouncedNextPage"
            kind="ghost"
            :title="props.texts.nextPage"
            :disabled="isNextBtnDisabled"
          />
          <LxButton
            icon="last-page"
            @click="lastPage"
            kind="ghost"
            :title="props.texts.lastPage"
            :disabled="isNextBtnDisabled"
          />
        </LxToolbarGroup>
        <LxToolbarGroup v-if="supportedFileType === 'Image' || supportedFileType === 'SVG'">
          <LxToggle
            v-model="dragToScrollMode"
            :texts="{
              valueYes: props.texts.grabToSrollTrue,
              valueNo: props.texts.grabToSrollFalse,
            }"
          />
        </LxToolbarGroup>
      </template>
    </LxToolbar>
    <div
      v-if="supportedFileType === 'Binary'"
      class="lx-binary-wrapper"
      :class="[{ 'lx-binary-wrapper-fullscreen': isExpanded }, fitType]"
      :style="`--font-size-binary-wrapper-default: calc(${fontSizeScale} * 1rem);
      --font-size-binary-wrapper-h1: calc(${fontSizeScale} * 2.5rem);
      --font-size-binary-wrapper-h2: calc(${fontSizeScale} * 1.75rem);
      --font-size-binary-wrapper-h3: calc(${fontSizeScale} * 1.5rem);
      --font-size-binary-wrapper-h4: calc(${fontSizeScale} * 1.25rem);`"
    >
      <LxRichTextDisplay :value="binaryText"></LxRichTextDisplay>
    </div>
    <!-- eslint-disable-next-line vuejs-accessibility/mouse-events-have-key-events -->
    <div
      v-show="supportedFileType === 'Image' || supportedFileType === 'SVG'"
      class="lx-img-wrapper"
      :class="[
        { 'lx-img-wrapper-fullscreen': isExpanded },
        fitType,
        {
          'drag-to-scroll': dragToScrollMode,
        },
        { 'lx-img-wrapper-regular': !isExpanded },
      ]"
      @mousedown="startDragging"
      @mousemove="drag"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
    >
      <canvas ref="imgCanvasRef"></canvas>
    </div>
    <div
      v-if="showPdf"
      class="lx-pdf-wrapper"
      :class="[
        { 'lx-pdf-wrapper-scrollable': props.scrollable && !isExpanded },
        { 'lx-pdf-wrapper-fullscreen': isExpanded },
      ]"
      :style="
        props.height === 'auto' || props.height === '100%'
          ? {}
          : { height: `calc(${props.height} - var(--row-size))` }
      "
    >
      <div class="lx-pdf-canvas-wrapper">
        <canvas v-if="!scrollable" class="pdf-canvas" ref="canvas" />
        <canvas
          v-else
          v-for="pageNum in totalPages"
          :key="pageNum"
          ref="canvasArray"
          class="pdf-canvas"
        />
        <LxLoader class="lx-file-viewer-loader" :loading="renderingInProgress" size="l" />
      </div>
    </div>
  </div>
</template>
