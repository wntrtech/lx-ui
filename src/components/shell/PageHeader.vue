<script setup>
import LxButton from '@/components/Button.vue';
import { computed } from 'vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const emits = defineEmits(['goBack']);

const props = defineProps({
  label: {
    type: String,
    required: true,
    default: null,
  },
  description: {
    type: String,
    required: false,
    default: null,
  },
  showBackButton: {
    type: Boolean,
    required: false,
    default: false,
  },
  backLabel: {
    type: String,
    required: false,
    default: null,
  },
  backPath: {
    type: [Object, String],
    required: false,
    default: null,
  },
  breadcrumbs: {
    type: Array,
    required: false,
    default: () => [], // { to: '{ name: 'home'}', label: 'Home' }],
  },
  hideHeaderText: { type: Boolean, default: false },
  texts: { type: Object, default: () => {} },
});

const defaultTexts = {
  defaultBack: 'Atpakaļ',
  defaultBackTooltip: 'Atgriezties uz',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, defaultTexts));

const goBackLabel = computed(() => {
  if (props.breadcrumbs.length === 1) {
    return props.breadcrumbs[0]?.label;
  }
  return props.backLabel ? props.backLabel : displayTexts.value.defaultBack;
});
const goBackTitle = computed(() => {
  if (props.breadcrumbs.length === 1) {
    return `${displayTexts.value.defaultBackTooltip} "${props.breadcrumbs[0]?.label}"`;
  }
  return props.backLabel ? props.backLabel : displayTexts.value.defaultBack;
});

const goBackPath = computed(() => {
  if (props.breadcrumbs.length === 1) {
    return props.breadcrumbs[0]?.to;
  }
  return props.backPath ? props.backPath : -1;
});

function goBack() {
  if (goBackPath.value) {
    emits('goBack', goBackPath.value);
    return;
  }
  emits('goBack', -1);
}
</script>
<template>
  <header class="lx-header lx-page-header">
    <div class="lx-toolbar">
      <div class="lx-group lx-back-button-group">
        <transition name="fade">
          <div v-if="showBackButton">
            <LxButton
              icon="back"
              kind="ghost"
              :variant="breadcrumbs.length > 1 ? 'icon-only' : 'default'"
              :label="goBackLabel"
              :title="goBackTitle"
              @click="goBack"
            />
          </div>
        </transition>
      </div>
      <div class="lx-group">
        <ul class="lx-breadcrumbs" v-if="breadcrumbs.length > 1 && showBackButton">
          <li class="lx-breadcrumb" v-for="breadcrumb in breadcrumbs" :key="breadcrumb">
            <router-link :to="breadcrumb.to">{{ breadcrumb.label }}</router-link>
          </li>
        </ul>
      </div>

      <div class="lx-group">
        <!-- TODO: additionalActions -->
      </div>
    </div>
    <h1 v-if="!hideHeaderText">{{ label }}</h1>
    <p class="lx-description" v-if="!hideHeaderText">{{ description }}</p>
  </header>
</template>
