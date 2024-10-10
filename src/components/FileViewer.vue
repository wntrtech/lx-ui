<script setup>
import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxButton from '@/components/Button.vue';
import LxLoader from '@/components/Loader.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';
import { MIME_TYPES } from '@/constants';

const props = defineProps({
  modelValue: { type: String, default: null },
  resolution: { type: Number, default: 3 },
  scrollable: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      zoomIn: 'Pietuvināt',
      zoomOut: 'Attālināt',
      expand: 'Izvērst',
      collapse: 'Samazināt',
      goToPage: 'Pāriet uz norādīto lapu',
      prevPage: 'Pāriet uz iepriekšējo lapu',
      nextPage: 'Pāriet uz nākamo lapu',
      firstPage: 'Pāriet uz pirmo lapu',
      lastPage: 'Pāriet uz pēdējo lapu',
      inputTooltip: 'Ievadīt lapaspusi',
      invalidFileUploadedLabel: 'Nav augšupielādēta datne apskatei',
      invalidFileUploadedDescription: 'Augšupielādējiet datni',
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

let observer = null;
const scale = ref(1.25);
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

const MAX_ZOOM = 2.0;
const MIN_ZOOM = 0.5;

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
  currentPage.value = 1;
  totalPages.value = 0;
  showPdf.value = false;
  showInput.value = false;
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
  scale.value = Math.min(scale.value * 1.1, MAX_ZOOM);

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
  scale.value = Math.max(scale.value * 0.9, MIN_ZOOM);

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

async function loadPdfFromBase64(base64) {
  try {
    isLoadingPdf.value = true;
    const base64Data = base64.slice(base64PdfPrefix.length);
    await loadPdfFromFile(base64Data);
    isFileUploaded.value = true;
    showPdf.value = true;
  } catch (error) {
    lxDevUtils.logError('Error loading PDF file', useLx().getGlobals().environment);
  } finally {
    isLoadingPdf.value = false;
  }
}

watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue?.startsWith(base64PdfPrefix)) {
      await loadPdfFromBase64(newValue);
      return;
    }
    resetPdfViewer();
  },
  { immediate: true }
);

const isNextBtnDisabled = computed(
  () =>
    currentPage.value === totalPages.value || (currentPage.value === 1 && renderingInProgress.value)
);
const isPrevBtnDisabled = computed(() => currentPage.value === 1);
const isZoomInDisabled = computed(() => scale.value === MAX_ZOOM);
const isZoomOutDisabled = computed(() => scale.value === MIN_ZOOM);

const toolbarActions = computed(() => [
  {
    id: 'zoomIn',
    name: props.texts.zoomIn,
    icon: 'zoom-in',
    groupId: '1',
    area: 'right',
    disabled: isZoomInDisabled.value,
  },
  {
    id: 'zoomOut',
    name: props.texts.zoomOut,
    icon: 'zoom-out',
    groupId: '1',
    area: 'right',
    disabled: isZoomOutDisabled.value,
  },
  {
    id: 'fullscreen',
    name: isExpanded.value ? props.texts.collapse : props.texts.expand,
    icon: isExpanded.value ? 'collapse' : 'expand',
    groupId: '2',
    area: 'right',
  },
]);

function toolbarActionClick(action) {
  if (action === 'zoomIn') debouncedZoomIn();
  else if (action === 'zoomOut') debouncedZoomOut();
  else if (action === 'fullscreen') toggleExpand();
}

onMounted(() => {
  if (props.preloadLibs?.includes(MIME_TYPES.PDF)) {
    loadPdfLib();
  }
});
</script>

<template>
  <div class="lx-file-viewer" :class="[{ 'lx-file-viewer-fullscreen': isExpanded }]">
    <template v-if="isLoadingPdf">
      <div class="lx-pdf-wrapper" :class="[{ 'lx-pdf-wrapper-scrollable': props.scrollable }]">
        <div class="lx-pdf-canvas-wrapper">
          <LxLoader class="lx-file-viewer-loader" :loading="true" size="l" />
        </div>
      </div>
    </template>
    <template v-else-if="!showPdf">
      <LxEmptyState
        :label="texts.invalidFileUploadedLabel"
        :description="texts.invalidFileUploadedDescription"
      />
    </template>
    <template v-else>
      <LxToolbar
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
        </template>
      </LxToolbar>
      <div
        class="lx-pdf-wrapper"
        :class="[
          { 'lx-pdf-wrapper-scrollable': props.scrollable && !isExpanded },
          { 'lx-pdf-wrapper-fullscreen': isExpanded },
        ]"
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
    </template>
  </div>
</template>
