<script setup>
import { ref } from 'vue';
import LxPopper from '@/components/Popper.vue';

const props = defineProps({
  placement: { type: String, default: 'bottom' },
  customClass: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  triggerClick: { type: String, default: 'left' },
  offsetSkid: { type: String, default: null },
});

const menuOpen = ref(false);

function closeMenu() {
  if (menuOpen.value) {
    menuOpen.value = false;
  }
}
function openMenu() {
  if (!props.disabled && !menuOpen.value) {
    menuOpen.value = true;
  } else if (menuOpen.value) closeMenu();
}

function preventClose(event) {
  event.stopPropagation();
}

defineExpose({ closeMenu, openMenu, preventClose, menuOpen });
</script>

<template>
  <div
    v-click-away="closeMenu"
    class="lx-context-container"
    :class="[{ 'lx-selected': menuOpen }, customClass]"
  >
    <LxPopper
      :placement="placement"
      :offset-skid="offsetSkid"
      :disabled="disabled"
      offset-distance="0"
      :show="menuOpen"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
      <div
        v-if="props.triggerClick === 'right'"
        class="lx-dropdown-toggler"
        @contextmenu.prevent="openMenu"
      >
        <slot />
      </div>
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
      <div
        v-else
        class="lx-dropdown-toggler"
        @click="props.triggerClick === 'left' ? openMenu() : null"
      >
        <slot />
      </div>

      <template #content>
        <div v-if="$slots.clickSafePanel" class="lx-dropdown-panel" role="group">
          <slot name="clickSafePanel" />
        </div>
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
        <div v-if="$slots.panel" class="lx-dropdown-panel" role="group" @click="closeMenu">
          <slot name="panel" />
        </div>
      </template>
    </LxPopper>
  </div>
</template>
