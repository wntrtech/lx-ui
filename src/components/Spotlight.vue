<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import LxSpotlightPopper from '@/components/SpotlightPopper.vue';
import LxButton from '@/components/Button.vue';
import LxBadge from '@/components/Badge.vue';

import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: null,
  },
  hasShowMore: {
    type: Boolean,
    default: false,
  },
  hasItemCounter: {
    type: Boolean,
    default: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  shellMode: {
    type: String,
    default: 'default',
  },
  shellNavItems: {
    type: Array,
    default: () => [],
  },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const textsDefault = {
  close: 'Aizvērt',
  next: 'Tālāk',
  back: 'Atpakaļ',
  showMore: 'Uzzināt vairāk',
  of: 'no',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue', 'showMore', 'update:visible']);

const { width } = useWindowSize();

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const item = computed(
  () => props.items?.find((i) => i?.id === model.value || i?.elementId === model.value) || null
);

const target = ref();
const spotlight = ref();

const visible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emits('update:visible', value);
  },
});

const getNumberOfItem = computed(
  () => props.items.findIndex((x) => x?.id === model.value || x?.elementId === model.value) + 1
);

function isElementInViewport(elem, headerOffset = 50) {
  const rect = elem.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top >= headerOffset && rect.bottom <= windowHeight;
}

function getOffsetTop() {
  const header = document.querySelector('.lx-layout > header');
  const navbar = document.querySelector('.lx-layout > nav');

  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

  let res = 0;

  if (props.shellMode === 'default') {
    res = headerHeight;
  } else if (props.shellMode === 'public' || props.shellMode === 'latvijalv') {
    // adjust for smaller screen when no nav
    // adjust no nav items screen
    if (width.value > 900 && props.shellNavItems?.length > 0) res = headerHeight + navbarHeight;
    else {
      res = headerHeight;
    }
  }

  return res + 10;
}

const needsHighZ = ref(false);

function setSpotlightItem() {
  visible.value = true;

  let spotlightItem;

  // If modelValue is null, start from beginning
  spotlightItem = props.items?.find((x) => x?.id === model.value || x?.elementId === model.value);

  if ((model.value == null && props.items?.length > 0) || !spotlightItem) {
    const [firstItem] = props.items || [];
    spotlightItem = firstItem;
    model.value = spotlightItem?.id;
  }
  target.value = null;
  nextTick(() => {
    let elem;
    if (spotlightItem?.elementId) {
      elem = document.getElementById(spotlightItem.elementId);
    } else if (spotlightItem?.id) {
      if (
        (props.shellMode === 'public' || props.shellMode === 'latvijalv') &&
        props.shellNavItems?.length > 0 &&
        width.value > 900
      ) {
        elem = document.querySelector('.lx-layout > nav');
      } else {
        elem = document.querySelector('.lx-layout > header');
      }
    }

    if (!elem) return;

    // Check if elem is inside a <header> or <nav> of .lx-layout
    const insideHeader = !!elem.closest('.lx-layout > header');
    const insideNav = !!elem.closest('.lx-layout > nav');

    if (insideHeader || insideNav) needsHighZ.value = true;
    else needsHighZ.value = false;

    target.value = elem;

    // scroll only when specific element is highlighted
    if (spotlightItem?.elementId && !needsHighZ.value) {
      const headerOffset = getOffsetTop();
      // Only scroll if element is not visible
      if (!isElementInViewport(elem, headerOffset)) {
        const topPosition = elem.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: topPosition,
          behavior: 'smooth',
        });
      }
    }
  });
}

watch(
  () => model.value,
  (newValue) => {
    if (newValue) setSpotlightItem();
  }
);

function spotlightEnd() {
  visible.value = false;
}

function showMore() {
  emits('showMore');
}

const actions = computed(() => {
  const res = [];

  const nextButton = { id: 'next', kind: 'primary', name: displayTexts.value.next };
  const backButton = { id: 'back', kind: 'secondary', name: displayTexts.value.back };
  const closeButton = { id: 'close', kind: 'primary', name: displayTexts.value.close };

  if (props.items?.length === 1) {
    res.push(closeButton);
  } else if (
    props.items?.length > 1 &&
    getNumberOfItem.value !== 1 &&
    getNumberOfItem.value === props.items?.length
  ) {
    res.push(backButton);
    res.push(closeButton);
  } else if (props.items?.length > 1 && getNumberOfItem.value !== 1) {
    res.push(backButton);
    res.push(nextButton);
  } else if (props.items?.length > 1 && getNumberOfItem.value === 1) {
    res.push(nextButton);
  }
  return res;
});

function actionClick(action) {
  if (action === 'next') {
    model.value = props.items[Math.min(getNumberOfItem.value, props.items.length - 1)]?.id || null;
  } else if (action === 'back') {
    model.value = props.items[Math.max(0, getNumberOfItem.value - 2)]?.id || null;
  } else {
    visible.value = false;
    model.value = null;
  }
}

watch(
  () => props.items,
  (newValue) => {
    if (
      !newValue ||
      newValue?.length === 0 ||
      newValue.findIndex((x) => x?.id === model.value || x?.elementId === model.value) === -1
    ) {
      visible.value = false;
      target.value = null;
    }
  }
);

function getTopOffset() {
  let res = 56;
  if (
    (props.shellMode === 'public' || props.shellMode === 'latvijalv') &&
    props.shellNavItems?.length > 0 &&
    width.value > 900
  )
    res = 112;
  return res;
}

defineExpose({ setSpotlightItem, spotlightEnd });
</script>
<template>
  <LxSpotlightPopper
    v-if="target && props.items?.length > 0"
    :reference="target"
    :show="target ? visible : false"
    :arrowPointer="!!item?.elementId && width >= 500"
    :offsetDistance="width >= 500 ? '30' : '8'"
    :topPadding="needsHighZ ? 4 : getTopOffset()"
    :leftPadding="needsHighZ ? 4 : width > 800 ? 56 : 4"
  >
    <template #content>
      <div
        class="lx-spotlight lx-region"
        ref="spotlight"
        :class="[{ 'higher-z-index': needsHighZ }]"
        v-show="target && visible"
      >
        <div class="lx-spotlight-header">
          <div>
            <span>
              <LxBadge
                icon="information"
                :value="
                  hasItemCounter
                    ? `${getNumberOfItem} ${displayTexts.of} ${props.items?.length}`
                    : null
                "
                :tooltip="
                  hasItemCounter
                    ? `${getNumberOfItem} ${displayTexts.of} ${props.items?.length}`
                    : null
                "
              />
            </span>
            <LxButton
              icon="close"
              kind="ghost"
              :label="displayTexts.close"
              variant="icon-only"
              @click="visible = false"
            />
          </div>
        </div>
        <div class="lx-spotlight-main">
          <div class="lx-spotlight-label" :title="item?.name">{{ item?.name }}</div>
          <div class="lx-spotlight-description" v-if="item?.description" :title="item?.description">
            {{ item?.description }}
          </div>
          <div class="lx-spotlight-show-more" v-if="item?.showMore ?? hasShowMore">
            <button class="link-button" type="button" @click="showMore">
              {{ displayTexts.showMore }}
            </button>
          </div>
        </div>
        <div class="lx-spotlight-footer">
          <LxButton
            v-for="action in actions"
            :key="action.id"
            :kind="action.kind"
            :disabled="action.disabled"
            :label="action.name"
            @click="actionClick(action.id)"
          />
        </div>
      </div>
    </template>
  </LxSpotlightPopper>
</template>
