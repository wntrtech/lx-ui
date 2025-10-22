<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFloating, flip, shift, arrow, offset, autoUpdate } from '@floating-ui/vue';

import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  offsetDistance: { type: String, default: '12' },
  offsetSkid: { type: String, default: '0' },
  disabled: { type: Boolean, default: false },
  arrowPointer: { type: Boolean, default: false },
  panelClass: { type: String, default: '' },
  arrowPadding: { type: String, default: '8' },
  show: { type: Boolean, default: null },
  topPadding: { type: Number, default: 56 },
  leftPadding: { type: Number, default: 56 },
  reference: { type: Object, default: null },
});

const floating = ref(null);
const floatingArrow = ref(null);

const basePlacement = ref('right');

const fallbackPlacements = ref(['right', 'left', 'bottom', 'top']);

const middleware = computed(() => [
  flip({
    mainAxis: true,
    crossAxis: true,
    padding: {
      top: props.topPadding,
      right: 16,
      bottom: 16,
      left: props.leftPadding,
    },
    // @ts-ignore
    fallbackPlacements: fallbackPlacements.value,
  }),
  shift({
    padding: {
      top: props.topPadding,
      right: 4,
      bottom: 4,
      left: props.leftPadding,
    },
  }),
  arrow({
    element: floatingArrow,
    padding: Number(props.arrowPadding),
  }),
  offset({
    mainAxis: Number(props.offsetDistance),
    crossAxis: Number(props.offsetSkid),
  }),
]);

const {
  floatingStyles,
  middlewareData,
  placement: plc,
} = useFloating(ref(props.reference), floating, {
  strategy: 'fixed',
  // @ts-ignore
  placement: basePlacement,
  middleware,
  whileElementsMounted: autoUpdate,
});
</script>

<template>
  <Teleport to="#poppers" v-if="show && !disabled">
    <div v-if="show && !disabled" ref="floating" :style="floatingStyles" class="popper">
      <slot v-if="$slots.content" name="content" />

      <div
        v-if="arrowPointer"
        ref="floatingArrow"
        class="popper-floating-arrow"
        :class="[
          {
            'arrow-top': plc.startsWith('top'),
            'arrow-bottom': plc.startsWith('bottom'),
            'arrow-left': plc.startsWith('left'),
            'arrow-right': plc.startsWith('right'),
          },
        ]"
        :style="{
          position: 'absolute',
          left: plc.startsWith('right')
            ? '-16px'
            : plc.startsWith('left')
            ? 'auto'
            : middlewareData.arrow?.x != null
            ? `${middlewareData.arrow.x - Number(props.offsetSkid)}px`
            : '',
          right: plc.startsWith('left') ? '-16px' : '',
          top: plc.startsWith('top')
            ? 'auto'
            : plc.startsWith('bottom')
            ? '-16px'
            : middlewareData.arrow?.y != null
            ? `${middlewareData.arrow.y}px`
            : '',
          bottom: plc.startsWith('top') ? '-16px' : '',
        }"
      />
    </div>
  </Teleport>
</template>
