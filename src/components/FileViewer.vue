<script setup>
import { ref, computed, shallowRef, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useWindowSize, useMutationObserver } from '@vueuse/core';
import { getDisplayTexts } from '@/utils/generalUtils';
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
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: String, default: null },
  scrollable: { type: Boolean, default: false },
  width: { type: String, default: 'auto' }, // e.g. 'auto', '100%', '100px', 30rem', '50vw'... (any css value, recommended for images and .MD)
  height: { type: String, default: 'auto' }, // e.g. 'auto', '100%', '100px', '30rem', '50vw'... (any css value, recommended for images and .MD)
  fileName: { type: String, default: null },
  showPrintButton: { type: Boolean, default: false },
  showFullScreenButton: { type: Boolean, default: true },
  primaryDownloadButton: { type: Boolean, default: false },
  stickyHeader: { type: Boolean, default: true },
  zoomLevel: { type: Number, default: null }, //  50, 75, 100, 125, 150, 175, 200, 250, 300
  downloadType: { type: String, default: 'default' }, // "default" - component will start download, "emit" - component will emit download event
  texts: { type: Object, default: () => ({}) },
  /** @description list of mime types that should load they library on component initialization, useful when you already know that you will use pdf viewer and want to load it as soon as possible */
  preloadLibs: { type: Array, default: () => [] },
});

const textsDefault = {
  zoomIn: 'Pietuvināt',
  zoomOut: 'Attālināt',
  expand: 'Izvērst',
  collapse: 'Samazināt',
  download: 'Lejupielādēt',
  print: 'Printēt',
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
  grabToScrollFalse: 'Iespējot ritināšanu',
  grabToScrollTrue: 'Atspējot ritināšanu',
  overflowMenu: 'Atvērt papildu iespējas',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const imgCanvasRef = ref(null);
let observer = null;
let resizeObserver = null;
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
const scrollTopRef = ref(0);
const fitType = ref(null);

const binaryWrapper = ref(null);
const imageWrapper = ref(null);
const canvasWrapper = ref(null);
const pdfWrapper = ref(null);
const printInProgress = ref(false);
const isLoadingPdf = ref(false);
const resizeActive = ref(false);

const downloadInProgress = ref(false);

const inputRef = ref(null);

const windowSize = useWindowSize();

const MAX_ZOOM = {
  pdf: 3.0,
  img: 5.0,
  font: 3.0,
};
const MIN_ZOOM = {
  pdf: 0.5,
  img: 0.1,
  font: 0.1,
};

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 175, 200, 250, 300];

const pdfjsLib = shallowRef(null);
const loadingPdfjs = ref(false);

const emits = defineEmits(['download']);

async function loadPdfLib() {
  if (!pdfjsLib.value) {
    loadingPdfjs.value = true;
    // @ts-ignore
    const pdfjs = await import('pdfjs-dist');
    // @ts-ignore
    const workerUrl = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default;
    pdfjsLib.value = pdfjs;
  }
  loadingPdfjs.value = false;
  return pdfjsLib.value;
}

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
      case 'text/markdown':
        return 'Binary';
      default:
        return null;
    }
  }
  return '';
});

function debounce(func, delay) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function calculateThreshold(heightValue, isLandscape) {
  const numericValue = parseFloat(heightValue);
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  if (heightValue.endsWith('px')) {
    const heightInRem = numericValue / rootFontSize;
    return heightInRem >= 100 ? 0.8 : heightInRem / 100 - 0.25;
  }

  if (heightValue.endsWith('rem')) {
    return numericValue >= 100 ? 0.8 : numericValue / 100 - 0.25;
  }

  if (scale.value >= 2.5) return 0.25;
  if (scale.value <= 1) return 0.9;

  if (isLandscape && scale.value >= 2) return 0.6;
  if (isLandscape && scale.value >= 1.5) return 0.7;
  if (isLandscape) return 0.9;

  return 0.5;
}

const rootMargin = computed(() => {
  // Dynamically calculate the combined height of lx-header, navigation, and toolbar
  const header = document.querySelector('.lx-header');
  const headerDigives = document.querySelector('.lx-header-digives');
  const navigation = document.querySelector('.lx-nav-panel');
  const toolbar = document.querySelector('.lx-component-toolbar');
  const publicMode = document.querySelector('.lx-layout-public');

  const headerHeight = header ? header.offsetHeight : 0;
  const headerDigivesHeight = headerDigives ? headerDigives.offsetHeight : 0;
  const navigationHeight =
    navigation && publicMode && navigation.style.display !== 'none' ? navigation.offsetHeight : 0;
  const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;

  const elemHeigh = canvasArray.value[0].clientHeight || 0;

  const totalOffsetTopHeight = !isExpanded.value
    ? (headerDigivesHeight || headerHeight) + navigationHeight + toolbarHeight
    : 0;

  const viewportHeight = window.innerHeight;
  const correction = 50;

  const totalOffsetBottomHeight = Math.abs(
    viewportHeight - totalOffsetTopHeight - elemHeigh - correction
  );

  if (scale.value <= 1) {
    return `-${totalOffsetTopHeight}px 0px -${totalOffsetBottomHeight}px 0px`;
  }

  return '0px 0px 0px 0px';
});

function setupIntersectionObserver() {
  if (!props.scrollable) return;

  setTimeout(() => {
    const rootElement = document.querySelector('.lx-pdf-wrapper');
    const canvasElement = document.querySelector('.pdf-canvas');

    if (!rootElement || !canvasElement || !canvasArray.value.length) {
      return;
    }

    const isLandscape = canvasElement.clientHeight < canvasElement.clientWidth;

    if (observer) {
      observer.disconnect();
    }

    // Check if the container is scrollable
    const isScrollable = rootElement.scrollHeight > rootElement.clientHeight;

    const options = {
      root: isScrollable ? rootElement : null, // Use the container if scrollable, otherwise viewport
      threshold: calculateThreshold(props.height, isLandscape),
      rootMargin: rootMargin.value,
    };

    // If the container is scrollable, observe the container
    observer = new IntersectionObserver(
      (entries) => {
        if (isNavigating.value) return; // Block observer updates during navigation

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = canvasArray.value.indexOf(entry.target) + 1;
            currentPage.value = pageNumber;
            inputPage.value = pageNumber;
          }
        });
      },
      {
        ...options,
      }
    );

    canvasArray.value.forEach((canvasElementArg) => {
      observer.observe(canvasElementArg);
    });
  }, 500);
}

function disconnectObserver() {
  if (observer) {
    observer.disconnect();
  }
}

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
  scrollTopRef.value = imgCanvasRef.value.parentElement.scrollTop;
}

function drag(event) {
  if (!isDragging.value) return;
  event.preventDefault();
  const x = event.pageX - imgCanvasRef.value.offsetLeft;
  const y = event.pageY - imgCanvasRef.value.offsetTop;

  const walkX = (x - startX.value) * 1;
  const walkY = (y - startY.value) * 1;
  imgCanvasRef.value.parentElement.scrollLeft = scrollLeft.value - walkX;
  imgCanvasRef.value.parentElement.scrollTop = scrollTopRef.value - walkY;
}

function stopDragging() {
  isDragging.value = false;
}

const initializeFitScale = ref(false); // Track if initial scale calculation has been done

const windowWidth = computed(() => windowSize.width.value);

const devicePixelRatio = ref(window.devicePixelRatio || 1);

async function renderPage(pageNum) {
  isPageRendering.value = true;

  totalPages.value = 0;
  canvasArray.value = [];

  try {
    const page = await pdf.value.getPage(pageNum);
    totalPages.value = pdf.value.numPages;

    // Calculate and set scale only for the first render
    if (initializeFitScale.value) {
      const container = document.querySelector('.lx-pdf-wrapper');
      const viewport = page.getViewport({ scale: 1 }); // Base viewport to get page width

      if (container) {
        const containerWidth = container.clientWidth;
        const pageWidth = viewport.width;

        // Calculate initial scale to fit the container width
        scale.value = containerWidth / pageWidth;
      }
    }

    const upscaleFactor = windowWidth.value < 1024 ? devicePixelRatio.value : 1;
    const adjustedViewport = page.getViewport({ scale: scale.value * upscaleFactor });

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

    const scaledWidth = adjustedViewport.width;
    const scaledHeight = adjustedViewport.height;

    canvasElement.width = scaledWidth;
    canvasElement.height = scaledHeight;

    canvasElement.style.width = `${scaledWidth / upscaleFactor}px`;
    canvasElement.style.height = `${scaledHeight / upscaleFactor}px`;

    const renderContext = {
      canvasContext: context,
      viewport: adjustedViewport,
    };

    await page.render(renderContext).promise;

    if (pageNum === pdf.value.numPages) {
      allPagesRendered.value = true;
    }
  } catch (error) {
    isPageRendering.value = false;
    lxDevUtils.logError(`Page render failed, ${error}`, useLx().getGlobals()?.environment);
  } finally {
    isPageRendering.value = false;
  }
}

function delayExecution(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function renderAllPages(pages, batchSize = 5, delayBetweenBatches = 200) {
  if (!pdf.value) return;

  const renderPageWithDelay = async (pageNum) => {
    await renderPage(pageNum);
    await delayExecution(50);
  };

  const processBatch = async (start) => {
    if (start > pages) return;

    const batch = Array.from({ length: Math.min(batchSize, pages - start + 1) }, (_, index) =>
      renderPageWithDelay(start + index)
    );

    await Promise.all(batch);
    await delayExecution(delayBetweenBatches);

    // eslint-disable-next-line consistent-return
    return processBatch(start + batchSize);
  };

  await processBatch(1);
}

const renderingInProgress = computed(
  () =>
    (!printInProgress.value && !props.scrollable && isPageRendering.value) ||
    (!printInProgress.value &&
      props.scrollable &&
      !allPagesRendered.value &&
      showPdf.value &&
      !totalPages.value) ||
    printInProgress.value ||
    loadingPdfjs.value
);

function resetPdfViewer() {
  pdf.value = null;
  isFileUploaded.value = false;
  isExpanded.value = false;
  scale.value = 1;
  imgScale.value = 1;
  currentPage.value = 1;
  inputPage.value = 1;
  totalPages.value = 0;
  showPdf.value = false;
  showInput.value = false;
  fitType.value = null;
  dragToScrollMode.value = true;
  resizeActive.value = false;
}

function getHeaderOffset() {
  const getHeight = (selector) => document.querySelector(selector)?.offsetHeight || 0;

  const headerHeight = getHeight('.lx-header');
  const headerDigivesHeight = getHeight('.lx-header-digives');
  const navigationHeight =
    document.querySelector('.lx-nav-panel')?.style.display !== 'none'
      ? getHeight('.lx-nav-panel')
      : 0;
  const toolbarHeight = getHeight('.lx-component-toolbar');

  return (headerDigivesHeight || headerHeight) + navigationHeight + toolbarHeight;
}

function scrollToWindow(canvasElement) {
  const totalOffsetHeight = getHeaderOffset();
  const { top: canvasTop } = canvasElement.getBoundingClientRect();

  window.scrollTo({
    top: window.scrollY + canvasTop - totalOffsetHeight,
    behavior: 'smooth',
  });
}

function scrollToContainer(canvasElement) {
  const container = pdfWrapper.value;
  if (!container || container.scrollHeight <= container.clientHeight) {
    scrollToWindow(canvasElement);
    return;
  }

  const { top: containerTop, scrollTop } = container.getBoundingClientRect();
  const { top: canvasTop } = canvasElement.getBoundingClientRect();

  container.scrollTo({
    top: canvasTop - containerTop + scrollTop,
    behavior: 'smooth',
  });
}

async function goToPage() {
  showInput.value = false;

  // Ensure input page is within valid range
  inputPage.value = Math.min(Math.max(inputPage.value, 1), totalPages.value);

  // Update current page if necessary
  if (inputPage.value !== currentPage.value) {
    currentPage.value = inputPage.value;
  }

  const canvasElement = canvasArray.value[currentPage.value - 1];
  if (!canvasElement) {
    renderPage(currentPage.value);
    return;
  }

  if (!props.scrollable) {
    scrollToWindow(canvasElement);
    return;
  }

  await nextTick();
  scrollToContainer(canvasElement);
}

const debouncedSetupObserver = debounce(() => {
  isNavigating.value = false;
  setupIntersectionObserver();
}, 1000);

function nextPage() {
  if (isZooming.value || renderingInProgress.value) return;

  isNavigating.value = true;
  disconnectObserver();

  if (currentPage.value < totalPages.value) {
    inputPage.value += 1;
    goToPage();
    debouncedSetupObserver();
  }
}

function prevPage() {
  if (isZooming.value || renderingInProgress.value) return;

  isNavigating.value = true;
  disconnectObserver();

  if (currentPage.value > 1) {
    inputPage.value -= 1;
    goToPage();
    debouncedSetupObserver();
  }
}

function firstPage() {
  if (isZooming.value || renderingInProgress.value) return;
  isNavigating.value = true;
  inputPage.value = 1;
  goToPage();
  debouncedSetupObserver();
}

function lastPage() {
  if (isZooming.value || renderingInProgress.value) return;
  isNavigating.value = true;
  inputPage.value = totalPages.value;
  goToPage();
  debouncedSetupObserver();
}

async function toggleExpand() {
  if (renderingInProgress.value) return;
  isExpanded.value = !isExpanded.value;

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages, pdf.value.numPages);
    setupIntersectionObserver();
  }
}

async function setZoomLevel(zoomLevel) {
  // Ensure the zoomLevel exists in ZOOM_LEVELS
  if (!ZOOM_LEVELS.includes(zoomLevel)) {
    lxDevUtils.logError(
      `Invalid zoom level: ${zoomLevel}. Allowed levels: ${ZOOM_LEVELS.join(', ')}`,
      useLx().getGlobals()?.environment
    );
    return;
  }

  isZooming.value = true;
  isPageRendering.value = true;

  // Convert zoom level to scale
  scale.value = zoomLevel / 100;

  // Re-render based on the updated scale
  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages);
  } else {
    await renderPage(currentPage.value);
  }

  isZooming.value = false;
  isPageRendering.value = false;
}

// Helper function to find the closest index in ZOOM_LEVELS
function findClosestZoomIndex(percentage) {
  let closestIndex = 0;
  let closestDifference = Infinity;

  ZOOM_LEVELS.forEach((level, index) => {
    const difference = Math.abs(level - percentage);
    if (difference < closestDifference) {
      closestDifference = difference;
      closestIndex = index;
    }
  });

  return closestIndex;
}

async function zoomIn() {
  if (isNavigating.value || renderingInProgress.value) return;

  isZooming.value = true;
  isPageRendering.value = true;

  // Find the current zoom index based on scale.value
  let currentIndex = ZOOM_LEVELS.indexOf(Math.round(scale.value * 100));

  if (currentIndex === -1) {
    currentIndex = findClosestZoomIndex(Math.round(scale.value * 100));
  }

  if (currentIndex < ZOOM_LEVELS.length - 1) {
    scale.value = ZOOM_LEVELS[currentIndex + 1] / 100; // Convert percentage to scale
  }

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages, pdf.value.numPages);
    setupIntersectionObserver();
  } else {
    await renderPage(currentPage.value);
  }

  isZooming.value = false;
  isPageRendering.value = false;
}

async function zoomOut() {
  if (isNavigating.value || renderingInProgress.value) return;

  isZooming.value = true;
  isPageRendering.value = true;

  // Find the current zoom index based on scale.value
  let currentIndex = ZOOM_LEVELS.indexOf(Math.round(scale.value * 100));

  if (currentIndex === -1) {
    currentIndex = findClosestZoomIndex(Math.round(scale.value * 100));
  }

  if (currentIndex > 0) {
    scale.value = ZOOM_LEVELS[currentIndex - 1] / 100; // Convert percentage to scale
  }

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages, pdf.value.numPages);
    setupIntersectionObserver();
  } else {
    await renderPage(currentPage.value);
  }

  isZooming.value = false;
  isPageRendering.value = false;
}

const debouncedZoomIn = debounce(zoomIn, 200);
const debouncedZoomOut = debounce(zoomOut, 200);

function zoom(action) {
  initializeFitScale.value = false;

  if (action === 'zoomIn') {
    debouncedZoomIn();
  } else if (action === 'zoomOut') {
    debouncedZoomOut();
  }
}

const debouncedNextPage = debounce(nextPage, 50);
const debouncedPrevPage = debounce(prevPage, 50);

const handleResize = async () => {
  if (!resizeActive.value || !initializeFitScale.value) return;

  if (props.scrollable) {
    await renderAllPages(pdf.value?.numPages, pdf.value?.numPages, 50);
    setupIntersectionObserver();
  } else {
    await renderPage(currentPage.value);
  }
};

const debouncedResize = debounce(handleResize, 50);

function setupResizeObserver() {
  setTimeout(() => {
    const rootElement = document.querySelector('.lx-pdf-wrapper');
    if (!rootElement) return;

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    // Initialize ResizeObserver
    resizeObserver = new ResizeObserver(() => {
      debouncedResize();
    });

    resizeObserver.observe(rootElement);

    // Activate resize observer after file is fully loaded & scaled
    setTimeout(() => {
      resizeActive.value = true; // Enable resize handling
    }, 1000);
  }, 500);
}

function disconnectResizeObserver() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
}

async function loadPdfFromFile(pdfData) {
  await loadPdfLib();
  const loadingTask = pdfjsLib.value.getDocument({ data: atob(pdfData) });
  pdf.value = await loadingTask.promise;

  setupResizeObserver();

  if (props.scrollable) {
    renderAllPages(pdf.value.numPages, pdf.value.numPages);
    setupIntersectionObserver();
  } else {
    renderPage(1);
  }
}

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

const base64PdfPrefix = `data:${MIME_TYPES.PDF};base64,`;

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
    const base64Data = newValue.slice(newValue.indexOf(';base64,') + ';base64,'.length);
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

const isNextBtnDisabled = computed(
  () => currentPage.value === totalPages.value || renderingInProgress.value
);
const isPrevBtnDisabled = computed(() => currentPage.value === 1 || renderingInProgress.value);
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

  if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
    buttons.push({
      id: 'fitToHeight',
      name: displayTexts.value.fitToHeight,
      icon: 'fit-to-height',
      active: fitType.value === 'fit-to-height',
      groupId: '4',
      area: 'right',
      loading: renderingInProgress.value,
    });
    buttons.push({
      id: 'fitToWidth',
      name: displayTexts.value.fitToWidth,
      icon: 'fit-to-width',
      active: fitType.value === 'fit-to-width',
      groupId: '4',
      area: 'right',
      loading: renderingInProgress.value,
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
      name: displayTexts.value.zoomIn,
      icon: 'zoom-in',
      groupId: '1',
      area: 'right',
      disabled: isZoomInDisabled.value,
      loading: renderingInProgress.value,
    });
    buttons.push({
      id: 'zoomOut',
      name: displayTexts.value.zoomOut,
      icon: 'zoom-out',
      groupId: '1',
      area: 'right',
      disabled: isZoomOutDisabled.value,
      loading: renderingInProgress.value,
    });
  }

  if (props.showPrintButton) {
    buttons.push({
      id: 'print',
      name: displayTexts.value.print,
      icon: 'print',
      groupId: '5',
      area: 'right',
      loading: renderingInProgress.value,
    });
  }

  if (!props.primaryDownloadButton) {
    buttons.push({
      id: 'download',
      name: displayTexts.value.download,
      icon: 'download',
      groupId: '3',
      area: 'right',
      loading: renderingInProgress.value,
      busy: downloadInProgress.value,
    });
  }

  if (props.showFullScreenButton) {
    buttons.push({
      id: 'fullscreen',
      name: isExpanded.value ? displayTexts.value.collapse : displayTexts.value.expand,
      icon: isExpanded.value ? 'collapse' : 'expand',
      groupId: '2',
      area: 'right',
      loading: renderingInProgress.value,
    });
  }

  if (props.primaryDownloadButton && windowWidth.value > 800) {
    buttons.push({
      id: 'download',
      name: displayTexts.value.download,
      icon: 'download',
      groupId: '3',
      area: 'right',
      kind: 'primary',
      label: displayTexts.value.download,
      loading: renderingInProgress.value,
      busy: downloadInProgress.value,
    });
  }

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

function setDownloadInProgress(value) {
  downloadInProgress.value = value;
}
defineExpose({ setDownloadInProgress });

function downloadFile() {
  if (props.downloadType === 'emit') {
    emits('download', { fileName: props.fileName });
    return;
  }
  downloadInProgress.value = true;

  fetch(props.modelValue)
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = isValidFileName(props.fileName) ? props.fileName : generateUUID();

      link.click();
      URL.revokeObjectURL(url);
    });
  setTimeout(() => {
    downloadInProgress.value = false;
  }, 2000);
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

function addPrintStyles(iframe, sizeX, sizeY) {
  const style = iframe.contentWindow.document.createElement('style');
  style.textContent = `
    @page { margin: 0; size: ${sizeX}pt ${sizeY}pt; }
    body { margin: 0; }
    canvas { page-break-after: always; page-break-before: avoid; page-break-inside: avoid; }
  `;
  iframe.contentWindow.document.head.appendChild(style);
}

function createPrintIframe(container) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.width = '0';
    iframe.height = '0';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.onload = () => resolve(iframe);
    container.appendChild(iframe);
  });
}

function releaseChildCanvases(el) {
  /* eslint-disable no-param-reassign */
  el.querySelectorAll('canvas').forEach((cnv) => {
    cnv.width = 1;
    cnv.height = 1;
    cnv.getContext('2d')?.clearRect(0, 0, 1, 1);
  });
}

/**
 *
 * @param {number} dpi - Print resolution.
 * @param {boolean} allPages - Flag to print all pages.
 */
async function print(printType, dpi = 300, allPages = true) {
  printInProgress.value = true;

  const printUnits = dpi / 72;
  const styleUnits = 96 / 72;
  let container;
  let iframe;
  let title;

  try {
    container = document.createElement('div');
    container.style.display = 'none';
    window.document.body.appendChild(container);
    iframe = await createPrintIframe(container);

    switch (printType) {
      case 'binary': // Handle Binary Printing
        {
          const A4_WIDTH = 794; // A4 width in pixels (96 DPI)
          const A4_HEIGHT = 1123; // A4 height in pixels (96 DPI)

          const element = binaryWrapper.value.querySelector('article');

          // Clone the element for printing
          const clonedElement = element.cloneNode(true);
          iframe.contentWindow.document.body.appendChild(clonedElement);

          addPrintStyles(iframe, A4_WIDTH, A4_HEIGHT);
        }
        break;
      case 'img': // Handle Image Printing
        {
          const cnv = document.createElement('canvas');
          const ctx = cnv.getContext('2d');

          const imgCanvas = imgCanvasRef.value;

          const img = new Image();
          img.src = imgCanvas.toDataURL('image/png');

          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Set canvas dimensions
              cnv.width = imgCanvas.offsetWidth * printUnits;
              cnv.height = imgCanvas.offsetHeight * printUnits;

              // Draw image on the canvas
              ctx.drawImage(img, 0, 0, cnv.width, cnv.height);

              // Add canvas to iframe for printing
              const canvasClone = cnv.cloneNode();
              iframe.contentWindow.document.body.appendChild(canvasClone);
              canvasClone.getContext('2d').drawImage(cnv, 0, 0);

              resolve();
            };
            img.onerror = reject;
          });

          const sizeX = (imgCanvas.offsetWidth * printUnits) / styleUnits;
          const sizeY = (imgCanvas.offsetHeight * printUnits) / styleUnits;

          addPrintStyles(iframe, sizeX, sizeY);
        }
        break;
      case 'pdf': // Handle PDF Printing
        {
          const pageNums =
            currentPage.value && !allPages
              ? [currentPage.value]
              : [...Array(pdf.value.numPages + 1).keys()].slice(1);

          await Promise.all(
            pageNums.map(async (pageNum, i) => {
              const page = await pdf.value.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1 });

              if (i === 0) {
                const sizeX = (viewport.width * printUnits) / styleUnits;
                const sizeY = (viewport.height * printUnits) / styleUnits;
                addPrintStyles(iframe, sizeX, sizeY);
              }

              const cnv = document.createElement('canvas');
              cnv.width = viewport.width * printUnits;
              cnv.height = viewport.height * printUnits;
              container.appendChild(cnv);
              const canvasClone = cnv.cloneNode();
              iframe.contentWindow.document.body.appendChild(canvasClone);

              await page.render({
                canvasContext: cnv.getContext('2d'),
                intent: 'print',
                transform: [printUnits, 0, 0, printUnits, 0, 0],
                viewport,
              }).promise;

              canvasClone.getContext('2d').drawImage(cnv, 0, 0);
            })
          );
        }
        break;

      default:
        break;
    }

    if (isValidFileName(props.fileName)) {
      title = window.document.title;
      window.document.title = props.fileName;
    } else {
      title = window.document.title;
      window.document.title = generateUUID();
    }

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  } catch (error) {
    lxDevUtils.logError(`Printing failed, ${error}`, useLx().getGlobals()?.environment);
  } finally {
    if (title) {
      window.document.title = title;
    }

    releaseChildCanvases(container);
    container.parentNode?.removeChild(container);

    printInProgress.value = false;
  }
}

function toolbarActionClick(action) {
  switch (action) {
    case 'zoomOut':
    case 'zoomIn':
      if (supportedFileType.value === 'PDF') {
        zoom(action);
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
    case 'print':
      if (supportedFileType.value === 'PDF') {
        print('pdf');
      }
      if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
        print('img');
      }
      if (supportedFileType.value === 'Binary') {
        print('binary');
      }
      break;
    default:
      break;
  }
}

const inlineSize = computed(() =>
  isExpanded.value ? {} : { width: props.width, height: props.height }
);

const showToolbarPrimaryDownloadButton = computed(
  () => props.primaryDownloadButton && windowWidth.value <= 800
);

function isValidHeight(value) {
  // Matches only valid CSS length values (e.g., 10px, 5em, 1.5rem, 50vw)
  const validHeightRegex = /^\d+(\.\d+)?(px|em|rem|vw|vh)$/;
  return validHeightRegex.test(value);
}

function handlePlaceholderClick() {
  showInput.value = true;

  nextTick(() => {
    inputRef.value?.focus();
  });
}

watch(
  () => props.scrollable,
  () => {
    if (pdf.value) {
      if (props.scrollable) {
        currentPage.value = 1;
        inputPage.value = 1;
        renderAllPages(pdf.value.numPages, pdf.value.numPages);
        setupIntersectionObserver();
        setupResizeObserver();
      } else {
        disconnectObserver();
        setupResizeObserver();
        currentPage.value = 1;
        inputPage.value = 1;
        renderPage(1);
      }
    }
  }
);

watch(showInput, (newValue) => {
  if (newValue) {
    addEventListeners();
  } else {
    removeEventListeners();
  }
});

const fileViewerWrapperRef = ref(null);

useMutationObserver(
  fileViewerWrapperRef,
  (mutations) => {
    const mutation = mutations[0];

    if (mutation && mutation.attributeName === 'style' && mutation.target.style.display === '') {
      if (props.scrollable) {
        renderAllPages(pdf.value?.numPages, pdf.value?.numPages);
        setupIntersectionObserver();
      } else {
        renderPage(1);
      }
    }
  },
  { attributes: true, childList: false }
);

watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue?.startsWith(base64PdfPrefix)) {
      if (!props.zoomLevel) {
        initializeFitScale.value = true;
      }

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

watch(
  () => props.zoomLevel,
  async (newZoomLevel) => {
    if (newZoomLevel) {
      await setZoomLevel(newZoomLevel);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.preloadLibs?.includes(MIME_TYPES.PDF)) {
    loadPdfLib();
  }
  if (!props.zoomLevel) {
    initializeFitScale.value = true;
  }
});

onUnmounted(() => {
  disconnectObserver();
  disconnectResizeObserver();
});
</script>

<template>
  <div
    class="lx-file-viewer"
    :class="[
      { 'lx-file-viewer-fullscreen': isExpanded },
      { image: supportedFileType === 'Image' || supportedFileType === 'SVG' },
      { 'lx-file-viewer-sticky': stickyHeader && !isExpanded },
    ]"
    :style="inlineSize"
    ref="fileViewerWrapperRef"
  >
    <LxEmptyState
      v-if="!supportedFileType"
      :label="displayTexts.invalidFileUploadedLabel"
      :description="displayTexts.invalidFileUploadedDescription"
    />

    <LxToolbar
      v-if="supportedFileType"
      :action-definitions="toolbarActions"
      class="lx-file-viewer-toolbar"
      :texts="displayTexts"
      @action-click="toolbarActionClick"
    >
      <template #rightArea>
        <LxToolbarGroup v-if="pdf">
          <LxButton
            :id="`${id}-action-first-page`"
            icon="first-page"
            @click="firstPage"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.firstPage"
            :disabled="isPrevBtnDisabled"
          />

          <LxButton
            :id="`${id}-action-previous-page`"
            icon="previous-page"
            @click="debouncedPrevPage"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.prevPage"
            :disabled="isPrevBtnDisabled"
          />

          <div class="pdf-page-input" ref="pageInputWrapper">
            <div
              class="placeholder"
              v-if="!showInput || renderingInProgress"
              tabindex="0"
              variant="icon-only"
              :label="displayTexts.inputTooltip"
              @click="handlePlaceholderClick"
              @keydown.enter="handlePlaceholderClick"
            >
              {{ currentPage }} / {{ totalPages }}
            </div>

            <LxTextInput
              v-if="showInput && !renderingInProgress"
              ref="inputRef"
              mask="integer"
              v-model.number="inputPage"
              @keydown.enter="goToPage"
            />

            <LxButton
              :id="`${id}-action-selected-page`"
              icon="arrow-right"
              @click="goToPage"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.goToPage"
              :disabled="!showInput || renderingInProgress"
            />
          </div>

          <div class="pdf-page-indicator">
            <div class="placeholder" :title="displayTexts.inputTooltip">
              {{ currentPage }} / {{ totalPages }}
            </div>
          </div>

          <LxButton
            :id="`${id}-action-next-page`"
            icon="next-page"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.nextPage"
            :disabled="isNextBtnDisabled"
            @click="debouncedNextPage"
          />

          <LxButton
            :id="`${id}-action-last-page`"
            icon="last-page"
            kind="ghost"
            variant="icon-only"
            :label="displayTexts.lastPage"
            :disabled="isNextBtnDisabled"
            @click="lastPage"
          />

          <LxButton
            v-if="showToolbarPrimaryDownloadButton"
            :id="`${id}-action-download`"
            icon="download"
            kind="primary"
            :label="displayTexts.download"
            :variant="windowWidth >= 540 ? 'default' : 'icon-only'"
            :disabled="renderingInProgress"
            @click="downloadFile()"
          />
        </LxToolbarGroup>

        <LxToolbarGroup v-if="supportedFileType === 'Image' || supportedFileType === 'SVG'">
          <LxToggle
            v-model="dragToScrollMode"
            :texts="{
              valueYes: displayTexts.grabToScrollTrue,
              valueNo: displayTexts.grabToScrollFalse,
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
      ref="binaryWrapper"
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
      ref="imageWrapper"
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
      ref="pdfWrapper"
      :class="[
        { 'lx-pdf-wrapper-scrollable': scrollable && !isExpanded },
        { 'lx-pdf-wrapper-fullscreen': isExpanded },
      ]"
      :style="
        isExpanded || height === 'auto' || height === '100%' || !height || !isValidHeight(height)
          ? {}
          : { height: `calc(${height} - var(--row-size))` }
      "
    >
      <div v-if="!scrollable" class="lx-pdf-canvas-wrapper">
        <canvas class="pdf-canvas" ref="canvas" />
      </div>

      <div v-else ref="canvasWrapper" class="lx-pdf-canvas-wrapper">
        <canvas v-for="pageNum in totalPages" :key="pageNum" ref="canvasArray" class="pdf-canvas" />
      </div>
    </div>

    <LxLoader class="lx-file-viewer-loader" :loading="renderingInProgress" size="l" />
  </div>
</template>
