<script setup>
import { computed, ref, shallowRef, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import {
  LMap,
  LTileLayer,
  LMarker,
  LPolygon,
  LPolyline,
  LPopup,
  LIcon,
  LCircle,
} from '@vue-leaflet/vue-leaflet';
import { useStorage } from '@vueuse/core';
import LxButton from '@/components/Button.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxNumberSlider from '@/components/NumberSlider.vue';
import LxToggle from '@/components/Toggle.vue';
import LxEmptyState from '@/components/EmptyState.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';

import markerBlue from '@/assets/marker-blue.png';
import markerRed from '@/assets/marker-red.png';
import markerGreen from '@/assets/marker-green.png';
import markerYellow from '@/assets/marker-yellow.png';
import markerOrange from '@/assets/marker-orange.png';
import markerTeal from '@/assets/marker-teal.png';
import markerPurple from '@/assets/marker-purple.png';
import markerDefault from '@/assets/marker-default.png';
import markerShadow from '@/assets/marker-shadow.png';
import markerGrey from '@/assets/marker-grey.png';
import markerCurrent from '@/assets/marker-current.png';

const emits = defineEmits([
  'update:zoom',
  'update:center',
  'searched',
  'update:selected-base-layer',
  'update:selected-overlay-layers',
]);

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  baseLayerDefinitions: {
    type: Array,
    default: () => [
      {
        id: 'OSM',
        name: 'OpenStreetMap Standard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        opacity: 1,
      },
    ],
  }, // id, name, url, attribution, opacity
  selectedBaseLayer: { type: String, default: '' },
  overlayLayerDefinitions: { type: Array, default: () => [] },
  selectedOverlayLayers: { type: Array, default: () => [] },
  zoom: { type: Number, default: 2 },
  center: { type: Object, default: () => ({ lat: 0, lng: 0 }) },
  objectDefinitions: { type: Array, default: () => [] },
  showSearch: { type: Boolean, default: false },
  showToolbar: { type: Boolean, default: false },
  ignoreThemeChange: { type: Boolean, default: false },
  hasUserLocation: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({
      clear: 'Notīrīt',
      search: 'Meklēt',
      zoomIn: 'Pietuvināt',
      zoomOut: 'Attālināt',
      expand: 'Palielināt karti',
      collapse: 'Samazināt karti',
      moreOptions: 'Papildus izvēles',
      grayscaleOn: 'Iespējot pelēktoni',
      grayscaleOff: 'Atspējot pelēktoni',
      grayscale: 'Pelēktonis',
      baseLayers: 'Fona slāņi',
      overlayLayers: 'Virsslāņi',
      currentLocation: 'Pietuvināt atrašanās vietu',
    }),
  },
});

const zoom = computed({
  get() {
    return props.zoom;
  },
  set(value) {
    emits('update:zoom', value);
  },
});

const center = computed({
  get() {
    return props.center;
  },
  set(value) {
    emits('update:center', value);
  },
});

const markers = computed(() => props.objectDefinitions.filter((x) => x?.type === 'marker'));
const polygons = computed(() => props.objectDefinitions.filter((x) => x?.type === 'polygon'));
const lines = computed(() => props.objectDefinitions.filter((x) => x?.type === 'line'));

const colorStyleMap = {
  red: 'var(--color-red)',
  green: 'var(--color-green)',
  yellow: 'var(--color-yellow)',
  grey: 'rgb(217,217,217)',
  orange: 'var(--color-orange)',
  teal: 'var(--color-teal)',
  purple: 'var(--color-purple)',
  blue: 'var(--color-blue)',
};

function lineColor(color) {
  return colorStyleMap[color] || 'var(--color-data)';
}

const colorMap = {
  red: markerRed,
  green: markerGreen,
  yellow: markerYellow,
  grey: markerGrey,
  orange: markerOrange,
  teal: markerTeal,
  purple: markerPurple,
  blue: markerBlue,
};

function markerColor(color) {
  return colorMap[color] || markerDefault;
}

const searchValue = ref('');

function emitSearch() {
  emits('searched', searchValue.value);
}

function clearSearch() {
  searchValue.value = '';
  emitSearch();
}

function zoomIn() {
  zoom.value += 1;
}
function zoomOut() {
  zoom.value -= 1;
}
const grayscaleRef = useStorage('lx-map-gs', 0);
const isGrayscale = shallowRef(false);

function grayscaleToggle() {
  grayscaleRef.value = isGrayscale.value ? 100 : 0;
}

watch(grayscaleRef, (newValue) => {
  if (newValue > 0 && newValue < 100) isGrayscale.value = null;
  else if (newValue === 100) isGrayscale.value = true;
  else if (newValue === 0) isGrayscale.value = false;
});

const selectedBaseLayer = computed({
  get() {
    if (!props.selectedBaseLayer) {
      return props.baseLayerDefinitions[0]?.id;
    }
    return props.selectedBaseLayer;
  },
  set(value) {
    emits('update:selected-base-layer', value);
  },
});

const selectedBaseObj = computed(() =>
  props.baseLayerDefinitions.find((x) => x?.id === selectedBaseLayer.value)
);

function selectBaseLayer(value) {
  const layer = props.baseLayerDefinitions.find((x) => x?.id === value);
  selectedBaseLayer.value = layer?.id;
}

const selectedOverlayLayer = computed({
  get() {
    if (!props.selectedOverlayLayers) {
      return [props.baseLayerDefinitions[0]?.id];
    }
    return props.selectedOverlayLayers;
  },
  set(value) {
    emits('update:selected-overlay-layers', value);
  },
});

const allOverlayObj = computed(() => {
  const res = [...props.overlayLayerDefinitions];
  res.forEach((x) => {
    x.show = false;
    selectedOverlayLayer.value.forEach((y) => {
      if (x?.id === y) {
        x.show = true;
      }
    });
  });
  return res;
});

const selectedOverlayObj = computed(() => {
  const res = [];
  allOverlayObj.value.forEach((x) => {
    if (x.show) {
      res.push(x);
    }
  });
  return res;
});

function updateSelectedOverlay() {
  const res = [];
  allOverlayObj.value.forEach((x) => {
    if (x.show) {
      res.push(x?.id);
    }
  });
  selectedOverlayLayer.value = res;
}
const showMap = ref(true);
const isExpanded = shallowRef(false);
function toggleExpand() {
  showMap.value = false;
  nextTick(() => {
    showMap.value = true;
  });
  isExpanded.value = !isExpanded.value;
}

const size = [32, 32];
const iconAnchor = [14, 30];
const shadowAnchor = [10, 32];
const popupAnchor = [2, -24];

const grayscaleStyle = computed(() => `--map-grayscale: ${grayscaleRef.value / 100};`);

const location = ref();
const locationAccuracy = ref();

function showPosition(position) {
  location.value = { lat: position?.coords?.latitude, lng: position?.coords?.longitude };
  locationAccuracy.value = position?.coords?.accuracy;
}

const watchPositionId = ref();
function getLocation() {
  if (navigator.geolocation) {
    watchPositionId.value = navigator.geolocation.watchPosition(showPosition);
  }
}

function centerLocation() {
  if (locationAccuracy.value > 5000) zoom.value = 11;
  else if (locationAccuracy.value > 1000) zoom.value = 13;
  else zoom.value = 16;

  setTimeout(() => {
    center.value = { lat: location.value?.lat, lng: location.value?.lng };
  }, 300);
}

watch(
  () => props.hasUserLocation,
  (newVal) => {
    if (newVal) getLocation();
    else navigator.geolocation.clearWatch(watchPositionId.value);
  }
);

const toolbarActions = computed(() => [
  { id: 'zoomIn', name: props.texts.zoomIn, icon: 'zoom-in', groupId: '1', area: 'right' },
  { id: 'zoomOut', name: props.texts.zoomOut, icon: 'zoom-Out', groupId: '1', area: 'right' },
  {
    id: 'fullscreen',
    name: isExpanded.value ? props.texts.collapse : props.texts.expand,
    icon: isExpanded.value ? 'collapse' : 'expand',
    groupId: '2',
    area: 'right',
  },
]);

function toolbarActionClick(action) {
  if (action === 'zoomIn') zoomIn();
  else if (action === 'zoomOut') zoomOut();
  else if (action === 'fullscreen') toggleExpand();
}

onMounted(() => {
  if (grayscaleRef.value > 0 && grayscaleRef.value < 100) isGrayscale.value = null;
  else isGrayscale.value = grayscaleRef.value === 100;
  if (props.hasUserLocation) getLocation();
});

onUnmounted(() => {
  navigator.geolocation.clearWatch(watchPositionId.value);
});
</script>
<template>
  <div
    class="lx-map"
    :style="grayscaleStyle"
    :class="[{ 'lx-map-fullscreen': isExpanded }, { 'theme-change': !ignoreThemeChange }]"
  >
    <LxToolbar
      :action-definitions="toolbarActions"
      @action-click="toolbarActionClick"
      v-if="showToolbar"
      class="lx-map-toolbar"
    >
      <template #leftArea v-if="showSearch">
        <div class="lx-map-search">
          <LxTextInput v-model="searchValue" @keydown.enter="emitSearch()" />
          <LxButton
            icon="search"
            kind="ghost"
            variant="icon-only"
            :label="texts.search"
            @click="emitSearch()"
          />
          <LxButton
            v-if="searchValue"
            icon="clear"
            kind="ghost"
            variant="icon-only"
            :label="texts.clear"
            @click="clearSearch()"
          />
        </div>
      </template>
      <template #rightArea>
        <slot name="toolbar" />
        <LxToolbarGroup>
          <div class="lx-map-grayscale">
            <LxToggle
              v-model="isGrayscale"
              :tooltip="isGrayscale ? texts?.grayscaleOff : texts?.grayscaleOn"
              @update:model-value="grayscaleToggle()"
            />
            <LxButton
              v-if="hasUserLocation"
              icon="location-current"
              kind="ghost"
              variant="icon-only"
              :label="texts.currentLocation"
              @click="centerLocation"
            />
            <LxDropDownMenu>
              <LxButton
                icon="overflow-menu"
                kind="ghost"
                :label="texts.moreOptions"
                variant="icon-only"
              />
              <template #clickSafePanel>
                <p class="lx-menu-label">{{ texts.grayscale }}:</p>
                <LxNumberSlider v-model="grayscaleRef" :min="0" :max="100" :step="1" />
                <div v-if="baseLayerDefinitions?.length > 1">
                  <hr />
                  <p class="lx-menu-label">{{ texts.baseLayers }}:</p>
                  <LxButton
                    v-for="layer in baseLayerDefinitions"
                    :key="layer?.id"
                    :label="layer?.name"
                    kind="ghost"
                    :active="selectedBaseLayer === layer?.id ? true : false"
                    @click="selectBaseLayer(layer?.id)"
                  />
                </div>
                <div v-if="overlayLayerDefinitions?.length > 0">
                  <hr />
                  <p class="lx-menu-label">{{ texts.overlayLayers }}:</p>
                  <div class="overlay-layer" v-for="layer in allOverlayObj" :key="layer.id">
                    <LxToggle v-model="layer.show" @update:model-value="updateSelectedOverlay()" />
                    <p>{{ layer?.name }}</p>
                  </div>
                </div>
              </template>
            </LxDropDownMenu>
          </div>
        </LxToolbarGroup>
      </template>
    </LxToolbar>
    <LMap
      v-model:zoom="zoom"
      v-model:center="center"
      class="map-component"
      :options="{ zoomControl: false }"
      v-if="showMap && baseLayerDefinitions?.length > 0"
    >
      <LTileLayer
        :id="selectedBaseObj?.id"
        :url="selectedBaseObj?.url"
        layer-type="base"
        :visible="selectedBaseObj?.visible"
        :name="selectedBaseObj?.name"
        :opacity="selectedBaseObj?.opacity"
        :attribution="selectedBaseObj?.attribution"
      />
      <LTileLayer
        v-for="layer in selectedOverlayObj"
        :key="layer?.id"
        :id="layer?.id"
        :url="layer?.url"
        layer-type="overlay"
        :visible="layer?.visible"
        :name="layer?.name"
        :opacity="layer?.opacity"
        :attribution="layer?.attribution"
      />
      <LMarker v-model:lat-lng="location" v-if="hasUserLocation && location">
        <LIcon :iconUrl="markerCurrent" :iconSize="size" />
      </LMarker>
      <LCircle
        :lat-lng="location"
        :radius="locationAccuracy"
        v-if="hasUserLocation && location"
        :options="{ stroke: false }"
      />
      <LMarker
        v-for="marker in markers"
        :key="marker?.id"
        v-model:lat-lng="marker.location"
        :draggable="marker?.draggable"
        :attribution="marker?.attribution"
      >
        <LPopup v-if="marker?.value">
          {{ marker?.value }}
        </LPopup>
        <LIcon
          :iconUrl="markerColor(marker?.color)"
          :shadowUrl="markerShadow"
          :icon-anchor="iconAnchor"
          :shadow-anchor="shadowAnchor"
          :iconSize="size"
          :shadow-size="size"
          :popupAnchor="popupAnchor"
        />
      </LMarker>
      <LPolygon
        v-for="polygon in polygons"
        :key="polygon?.id"
        :lat-lngs="polygon.location"
        :color="lineColor(polygon?.color)"
      >
        <LPopup v-if="polygon?.value">{{ polygon?.value }}</LPopup>
      </LPolygon>
      <LPolyline
        v-for="line in lines"
        :key="line?.id"
        :lat-lngs="line?.location"
        :color="lineColor(line?.color)"
      >
        <LPopup v-if="line?.value">{{ line?.value }}</LPopup>
      </LPolyline>
    </LMap>
    <LxEmptyState
      v-else-if="baseLayerDefinitions?.length === 0"
      label="Kļūda kartes attēlošanā"
      description="Nav definēts neviens kartes pamata slānis"
      icon="invalid"
    />
  </div>
</template>
