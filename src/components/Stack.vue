<script setup lang="ts">
import { computed } from 'vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  /**
   * A unique identifier for the component instance.
   * @type {String}
   * @default generateUUID()
   * @since 1.8.0-beta.16
   */
  id: { type: String, default: () => generateUUID() },
  /**
   * The orientation of the stack.
   * @type {String}
   * @default 'vertical'
   * @since 1.8.0-beta.16
   */
  orientation: { type: String, default: 'vertical' }, // vertical || horizontal || overlay
  /**
   * The kind of stack.
   * @type {String}
   * @default 'default'
   * @since 1.8.0-beta.16
   */
  kind: { type: String, default: 'default' }, // default || compact
  /**
   * The mode of the stack.
   * @type {String}
   * @default 'default'
   * @since 1.8.0-beta.16
   */
  mode: { type: String, default: 'default' }, // default || grid
  /**
   * The horizontal alignment of the stack.
   * @type {String}
   * @default 'leading'
   * @since 1.8.0-beta.16
   */
  horizontalAlignment: { type: String, default: 'leading' }, // leading || trailing || center || stretch

  /**
   * The vertical alignment of the stack.
   * @type {String}
   * @default 'leading'
   * @since 1.8.0-beta.16
   */
  verticalAlignment: { type: String, default: 'leading' }, // leading || trailing || center || stretch
  /**
   * Grid vertical configuration. Works only when mode is set to 'grid'.
   * @type {Array}
   * @default []
   * @since 1.8.0
   */
  verticalConfig: { type: Array, default: () => [] },
  /**
   * Grid horizontal configuration. Works only when mode is set to 'grid'.
   * @type {Array}
   * @default []
   * @since 1.8.0
   */
  horizontalConfig: { type: Array, default: () => [] },
});

function formatConfig(prop) {
  let res = '';
  if (prop.length > 0) {
    prop.forEach((x) => {
      if (Number.isInteger(x)) {
        res += `${x}fr `;
      } else if (x === 'auto') {
        res += 'auto ';
      } else if (typeof x === 'string') {
        if (x === '*') {
          res += '1fr ';
        } else {
          const number = x?.split('*')?.[0];
          res += `${number}fr `;
        }
      }
    });
  }
  return res;
}

const verticalConfigAlignment = computed(() => {
  const res = props.mode === 'grid' ? formatConfig(props.verticalConfig) : '';
  return res.length > 0 ? `--stack-template-rows: ${res}` : null;
});

const horizontalConfigAlignment = computed(() => {
  const res = props.mode === 'grid' ? formatConfig(props.horizontalConfig) : '';
  return res.length > 0 ? `--stack-template-columns: ${res}` : null;
});
</script>
<template>
  <div
    :id="id"
    class="lx-stack"
    :style="`${verticalConfigAlignment}; ${horizontalConfigAlignment}`"
    :class="[
      { ['lx-stack-orientation-' + orientation]: orientation },
      { ['lx-stack-kind-' + kind]: kind },
      { ['lx-stack-mode-' + mode]: mode },
      { ['lx-stack-horizontal-alignment-' + horizontalAlignment]: horizontalAlignment },
      { ['lx-stack-vertical-alignment-' + verticalAlignment]: verticalAlignment },
      { 'lx-stack-has-vertical-config': verticalConfig?.length > 1 },
      { 'lx-stack-has-horizontal-config': horizontalConfig?.length > 1 },
    ]"
  >
    <slot />
  </div>
</template>
