<script setup lang="ts">
import { generateUUID } from '@/utils/stringUtils';

defineProps({
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
  horizontalAlignment: { type: String, default: 'leading' }, // leading || trailing || center

  /**
   * The vertical alignment of the stack.
   * @type {String}
   * @default 'leading'
   * @since 1.8.0-beta.16
   */
  verticalAlignment: { type: String, default: 'leading' }, // leading || trailing || center
});
</script>
<template>
  <div
    :id="id"
    class="lx-stack"
    :class="[
      { ['lx-stack-orientation-' + orientation]: orientation },
      { ['lx-stack-kind-' + kind]: kind },
      { ['lx-stack-mode-' + mode]: mode },
      { ['lx-stack-horizontal-alignment-' + horizontalAlignment]: horizontalAlignment },
      { ['lx-stack-vertical-alignment-' + verticalAlignment]: verticalAlignment },
    ]"
  >
    <slot />
  </div>
</template>
