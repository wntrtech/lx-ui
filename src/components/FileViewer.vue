<script setup>
import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
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
  showPrintButton: { type: Boolean, default: false },
  showFullScreenButton: { type: Boolean, default: true },
  primaryDownloadButton: { type: Boolean, default: false },
  stickyHeader: { type: Boolean, default: true },
  texts: {
    type: Object,
    default: () => ({
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
      grabToSrollFalse: 'Iespējot ritināšanu',
      grabToSrollTrue: 'Atspējot ritināšanu',
    }),
  },
  /** @description list of mime types that should load they library on component initialization, useful when you already know that you will use pdf viewer and want to load it as soon as possible */
  preloadLibs: { type: Array, default: () => [] },
});

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

const binaryWrapper = ref(null);
const imageWrapper = ref(null);
const canvasWrapper = ref(null);
const pdfWrapper = ref(null);
const printInProgress = ref(false);
const isLoadingPdf = ref(false);

const windowSize = useWindowSize();

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

const pdfjsLib = shallowRef(null);
const loadingPdfjs = ref(false);

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

async function renderPage(pageNum, renderForPrint = false) {
  isPageRendering.value = true;

  try {
    // resolution is in the range [1;5], to avoid rendering issues
    let resolution = props.resolution >= 1 ? props.resolution : 1;
    resolution = Math.min(resolution, 5);

    const page = await pdf.value.getPage(pageNum);
    totalPages.value = pdf.value.numPages;
    const viewport = page.getViewport({ scale: scale.value });
    let canvasElement = null;

    if (renderForPrint || props.scrollable) {
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
  } finally {
    isPageRendering.value = false;
  }
}

function delayExecution(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function renderAllPages(
  pages,
  batchSize = 3,
  delayBetweenBatches = 200,
  renderForPrint = false
) {
  if (!pdf.value) return;

  const renderPageWithDelay = async (pageNum) => {
    await renderPage(pageNum, renderForPrint);
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
    (!printInProgress.value && props.scrollable && !allPagesRendered.value && showPdf.value) ||
    printInProgress.value ||
    loadingPdfjs.value
);

const windowWidth = computed(() => windowSize.width.value);

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

  // Ensure input page is within valid range
  if (inputPage.value < 1 || inputPage.value > totalPages.value) {
    inputPage.value = currentPage.value;
  }

  // Only change the current page if inputPage is different
  if (inputPage.value !== currentPage.value) {
    currentPage.value = inputPage.value;
  }

  const canvasElement = canvasArray.value[currentPage.value - 1];
  const container = pdfWrapper.value;

  if (canvasElement && props.scrollable) {
    await nextTick();

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

    // Total combined offset height
    const totalOffsetHeight =
      (headerDigivesHeight || headerHeight) + navigationHeight + toolbarHeight;

    // If the container is scrollable, scroll it to the correct canvas
    if (container && container.scrollHeight > container.clientHeight) {
      const containerRect = container.getBoundingClientRect();
      const canvasRect = canvasElement.getBoundingClientRect();

      // Calculate the scroll position relative to the container
      const scrollTopOffset = canvasRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: scrollTopOffset,
        behavior: 'smooth',
      });
    } else {
      // If container is not scrollable, scroll the window instead
      const canvasRect = canvasElement.getBoundingClientRect();

      // Calculate the scroll position relative to the window
      const scrollTopOffset = window.scrollY + canvasRect.top - totalOffsetHeight;

      window.scrollTo({
        top: scrollTopOffset,
        behavior: 'smooth',
      });
    }
  } else {
    // If canvas element doesn't exist for the current page, fall back to rendering
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
  isPageRendering.value = true;

  scale.value = Math.min(scale.value * 1.1, MAX_ZOOM.pdf);

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages);
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

  scale.value = Math.max(scale.value * 0.9, MIN_ZOOM.pdf);

  if (props.scrollable) {
    await renderAllPages(pdf.value.numPages);
  } else {
    await renderPage(currentPage.value);
  }
  isZooming.value = false;
  isPageRendering.value = false;
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

const debouncedZoomIn = debounce(zoomIn, 50);
const debouncedZoomOut = debounce(zoomOut, 50);

function zoom(action) {
  if (action === 'zoomIn') {
    debouncedZoomIn();
  } else if (action === 'zoomOut') {
    debouncedZoomOut();
  }
}

const debouncedPrevPage = debounce(prevPage, 50);
const debouncedNextPage = debounce(nextPage, 50);

function calculateThreshold(heightValue) {
  const numericValue = parseFloat(heightValue);
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  if (heightValue.endsWith('px')) {
    const heightInRem = numericValue / rootFontSize;
    return heightInRem >= 100 ? 1.0 : heightInRem / 100;
  }

  if (heightValue.endsWith('rem')) {
    return numericValue >= 100 ? 1.0 : numericValue / 100;
  }

  return 0.5;
}

const threshold = computed(() => calculateThreshold(props.height));

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

    // Check if the container is scrollable
    const isScrollable = rootElement.scrollHeight > rootElement.clientHeight;

    const options = {
      root: isScrollable ? rootElement : null, // Use the container if scrollable, otherwise viewport
      threshold: threshold.value,
    };

    // If the container is scrollable, observe the container
    observer = new IntersectionObserver(
      (entries) => {
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
    renderAllPages(pdf.value.numPages, pdf.value.numPages);
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
        renderAllPages(pdf.value.numPages, pdf.value.numPages);
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
        renderAllPages(pdf.value.numPages, pdf.value.numPages);
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

  if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
    buttons.push({
      id: 'fitToHeight',
      name: props.texts.fitToHeight,
      icon: 'fit-to-height',
      active: fitType.value === 'fit-to-height',
      groupId: '4',
      area: 'right',
      loading: renderingInProgress.value,
    });
    buttons.push({
      id: 'fitToWidth',
      name: props.texts.fitToWidth,
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
      name: props.texts.zoomIn,
      icon: 'zoom-in',
      groupId: '1',
      area: 'right',
      disabled: isZoomInDisabled.value,
      loading: renderingInProgress.value,
    });
    buttons.push({
      id: 'zoomOut',
      name: props.texts.zoomOut,
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
      name: props.texts.print,
      icon: 'print',
      groupId: '5',
      area: 'right',
      loading: renderingInProgress.value,
    });
  }

  if (!props.primaryDownloadButton) {
    buttons.push({
      id: 'download',
      name: props.texts.download,
      icon: 'download',
      groupId: '3',
      area: 'right',
      loading: renderingInProgress.value,
    });
  }

  if (props.showFullScreenButton) {
    buttons.push({
      id: 'fullscreen',
      name: isExpanded.value ? props.texts.collapse : props.texts.expand,
      icon: isExpanded.value ? 'collapse' : 'expand',
      groupId: '2',
      area: 'right',
      loading: renderingInProgress.value,
    });
  }

  if (props.primaryDownloadButton && windowWidth.value > 800) {
    buttons.push({
      id: 'download',
      name: props.texts.download,
      icon: 'download',
      groupId: '3',
      area: 'right',
      kind: 'primary',
      label: props.texts.download,
      loading: renderingInProgress.value,
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

async function printDocument(wrapper) {
  if (!wrapper) return;

  printInProgress.value = true;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print Document</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        canvas {
          display: block;
          margin: 0 auto;
          page-break-inside: avoid;
          page-break-after: auto;
        }
      </style>
    </head>
    <body></body>
    </html>
  `);
  iframeDoc.close();

  await new Promise((resolve) => {
    iframe.onload = resolve;
  });

  if (supportedFileType.value === 'PDF' && !props.scrollable) {
    await renderAllPages(pdf.value.numPages, pdf.value.numPages, 200, true);
  }

  // Adjust for device DPI
  const dpi = window.devicePixelRatio * 96;
  const A4_PORTRAIT = { width: 8.27 * dpi, height: 11.69 * dpi };
  const A4_LANDSCAPE = { width: 11.69 * dpi, height: 8.27 * dpi };

  const canvases = wrapper.querySelectorAll('canvas');

  canvases.forEach((originalCanvas) => {
    const isLandscape = originalCanvas.width > originalCanvas.height;
    const targetSize = isLandscape ? A4_LANDSCAPE : A4_PORTRAIT;

    const clonedCanvas = originalCanvas.cloneNode(false);
    const context = clonedCanvas.getContext('2d');

    // Retain original resolution by copying the original canvas's dimensions
    clonedCanvas.width = originalCanvas.width;
    clonedCanvas.height = originalCanvas.height;

    // Copy the content from the original canvas
    context.drawImage(originalCanvas, 0, 0);

    // Adjust the display size (style) for A4 without affecting resolution
    clonedCanvas.style.width = `${targetSize.width}px`;
    clonedCanvas.style.height = `${targetSize.height}px`;

    // Append the cloned canvas to the iframe's document
    iframeDoc.body.appendChild(clonedCanvas);
  });

  iframe.contentWindow.print();
  document.body.removeChild(iframe);
  printInProgress.value = false;
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
        printDocument(canvasWrapper.value);
      }
      if (supportedFileType.value === 'Image' || supportedFileType.value === 'SVG') {
        printDocument(imageWrapper.value);
      }
      if (supportedFileType.value === 'Binary') {
        printDocument(binaryWrapper.value);
      }
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

const showToolbarPrimaryDownloadButton = computed(
  () => props.primaryDownloadButton && windowWidth.value <= 800
);

function isValidHeight(value) {
  // Matches only valid CSS length values (e.g., 10px, 5em, 1.5rem, 50vw)
  const validHeightRegex = /^[0-9]+(\.[0-9]+)?(px|em|rem|vw|vh)$/;
  return validHeightRegex.test(value);
}

const inputRef = ref(null);

function handlePlaceholderClick() {
  showInput.value = true;

  nextTick(() => {
    inputRef.value?.focus();
  });
}
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
              tabindex="0"
              :title="props.texts.inputTooltip"
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
              icon="arrow-right"
              @click="goToPage"
              kind="ghost"
              :title="props.texts.goToPage"
              :disabled="!showInput || renderingInProgress"
            />
          </div>

          <div class="pdf-page-indicator">
            <div class="placeholder" :title="props.texts.inputTooltip">
              {{ currentPage }} / {{ totalPages }}
            </div>
          </div>

          <LxButton
            icon="next-page"
            kind="ghost"
            :title="props.texts.nextPage"
            :disabled="isNextBtnDisabled"
            @click="debouncedNextPage"
          />

          <LxButton
            icon="last-page"
            kind="ghost"
            :title="props.texts.lastPage"
            :disabled="isNextBtnDisabled"
            @click="lastPage"
          />

          <LxButton
            v-if="showToolbarPrimaryDownloadButton"
            icon="download"
            kind="primary"
            :label="windowWidth >= 540 ? props.texts.download : ''"
            :title="props.texts.download"
            :disabled="renderingInProgress"
            @click="downloadFile()"
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

      <div
        ref="canvasWrapper"
        class="lx-pdf-canvas-wrapper"
        :class="[{ 'hidden-pdf-canvas': !scrollable }]"
      >
        <canvas
          v-for="pageNum in totalPages"
          :key="pageNum"
          ref="canvasArray"
          class="pdf-canvas"
          :class="[{ 'hidden-pdf-canvas': !scrollable }]"
        />
      </div>
    </div>

    <LxLoader class="lx-file-viewer-loader" :loading="renderingInProgress" size="l" />
  </div>
</template>
