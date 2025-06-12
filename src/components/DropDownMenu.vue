<script setup>
import { ref, computed } from 'vue';
import LxPopper from '@/components/Popper.vue';
import LxButton from '@/components/Button.vue';
import LxToggle from '@/components/Toggle.vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  placement: { type: String, default: 'bottom' },
  customClass: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  triggerClick: { type: String, default: 'left' },
  offsetSkid: { type: String, default: null },
  actionDefinitions: { type: Array, default: () => [] },
});

const emits = defineEmits(['actionClick']);

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

const groupedItems = computed(() => {
  const res = props.actionDefinitions.reduce((acc, action) => {
    if (!action?.group) {
      if (!acc.lx_group) {
        acc.lx_group = [];
      }
      acc.lx_group.push(action);
    } else {
      if (!acc[action?.group]) acc[action?.group] = [];
      acc[action?.group].push(action);
    }

    if (action?.kind === 'toggle' && action?.value === undefined) {
      /* eslint-disable no-param-reassign */
      action.value = false;
    }

    return acc;
  }, {});

  return res;
});

const dropDownWrapper = ref();

onClickOutside(dropDownWrapper, closeMenu);

function actionClicked(id, value = undefined) {
  emits('actionClick', id, value);
}

defineExpose({ closeMenu, openMenu, preventClose, menuOpen });
</script>

<template>
  <div
    ref="dropDownWrapper"
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
          <div
            v-for="(group, groupName) in groupedItems"
            :key="groupName"
            class="lx-button-set lx-dropdown-menu-group"
          >
            <div v-for="action in group" :key="action?.id">
              <div v-if="action?.kind === 'toggle'" class="lx-dropdown-menu-toggle-wrapper">
                <p>{{ action?.name || action?.label }}</p>
                <LxToggle
                  :id="action?.id"
                  :disabled="action?.disabled"
                  v-model="action.value"
                  :texts="action?.texts"
                  :tooltip="action?.title"
                  :size="action?.size"
                  @update:modelValue="
                    (newValue) => {
                      actionClicked(action?.id, newValue);
                    }
                  "
                  @click="preventClose"
                />
              </div>
              <LxButton
                v-else
                :id="action?.id"
                :label="action?.name || action?.label"
                :title="action?.title"
                kind="ghost"
                :icon="action?.icon"
                :disabled="action?.disabled"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :badge="action?.badge"
                :badge-type="action?.badgeType"
                :active="action?.active"
                @click="actionClicked(action?.id)"
              />
            </div>
          </div>
          <slot name="clickSafePanel" />
        </div>
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
        <div
          v-if="$slots.panel || (actionDefinitions?.length > 0 && !$slots.clickSafePanel)"
          class="lx-dropdown-panel"
          role="group"
          @click="closeMenu"
        >
          <div
            v-for="(group, groupName) in groupedItems"
            :key="groupName"
            class="lx-button-set lx-dropdown-menu-group"
            :class="[
              { 'lx-dropdown-menu-no-panel': !$slots.panel && actionDefinitions?.length > 0 },
            ]"
          >
            <div v-for="action in group" :key="action?.id">
              <div v-if="action?.kind === 'toggle'" class="lx-dropdown-menu-toggle-wrapper">
                <p>{{ action?.name || action?.label }}</p>
                <LxToggle
                  :id="action?.id"
                  :disabled="action?.disabled"
                  v-model="action.value"
                  :texts="action?.texts"
                  :tooltip="action?.title"
                  :size="action?.size"
                  @update:modelValue="
                    (newValue) => {
                      actionClicked(action?.id, newValue);
                    }
                  "
                  @click="preventClose"
                />
              </div>
              <LxButton
                v-else
                :id="action?.id"
                :label="action?.name || action?.label"
                :title="action?.title"
                kind="ghost"
                :icon="action?.icon"
                :disabled="action?.disabled"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :badge="action?.badge"
                :badge-type="action?.badgeType"
                :active="action?.active"
                @click="actionClicked(action?.id)"
              />
            </div>
          </div>
          <slot name="panel" />
        </div>
      </template>
    </LxPopper>
  </div>
</template>
