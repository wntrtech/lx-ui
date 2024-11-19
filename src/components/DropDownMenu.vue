<script setup>
import { ref } from 'vue';
import Popper from 'vue3-popper';

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
    <Popper
      :placement="props.placement"
      :hover="false"
      :interactive="true"
      :locked="false"
      :offset-skid="offsetSkid"
      offset-distance="0"
      :show="menuOpen"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
      <div
        v-if="props.triggerClick === 'right'"
        @contextmenu.prevent="openMenu"
        class="lx-dropdown-toggler"
      >
        <slot />
      </div>
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
      <div
        @click="props.triggerClick === 'left' ? openMenu() : null"
        v-else
        class="lx-dropdown-toggler"
      >
        <slot />
      </div>
      <template #content>
        <div v-if="$slots.clickSafePanel" class="lx-dropdown-panel" role="group">
          <slot name="clickSafePanel"> </slot>
        </div>
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
        <div v-if="$slots.panel" @click="closeMenu" class="lx-dropdown-panel" role="group">
          <slot name="panel"> </slot>
        </div>
      </template>
    </Popper>
  </div>
</template>
