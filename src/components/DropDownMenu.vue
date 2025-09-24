<script setup>
import { ref, computed, nextTick, inject } from 'vue';
import LxPopper from '@/components/Popper.vue';
import LxButton from '@/components/Button.vue';
import LxToggle from '@/components/Toggle.vue';
import { logWarn } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';
import { onClickOutside } from '@vueuse/core';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

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
const panelRef = ref();
const dropDownWrapper = ref();

const isTouchSensitive = inject('isTouchMode', false);

const { activate, deactivate } = useFocusTrap(panelRef, {
  allowOutsideClick: true,
  initialFocus: false,
});

function closeMenu(source = 'keyboard') {
  if (menuOpen.value) {
    menuOpen.value = false;
  }

  deactivate({
    returnFocus: (source && source === 'keyboard') || false,
  });
}

function openMenu(source = 'keyboard') {
  if (!props.disabled && !menuOpen.value) {
    menuOpen.value = true;

    nextTick(() => {
      activate();
      panelRef.value?.focus();
    });
  } else if (menuOpen.value) {
    closeMenu(source);
  }
}

function preventClose(event) {
  event.stopPropagation();
}

const groupedItems = computed(() => {
  const res = props.actionDefinitions.reduce((acc, action) => {
    if (action?.kind === 'main') return acc; // skip 'main' items
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

const mainButton = computed(() => {
  const mainButtons = props.actionDefinitions?.filter((x) => x?.kind === 'main');
  if (mainButtons.length > 1) {
    logWarn(
      'LxDropDownMenu: More than one action with kind "main" defined. Only the first one will be used.',
      useLx()?.environment
    );
  }
  return mainButtons?.[0] || null;
});

function handleClick() {
  if (props.triggerClick === 'left') {
    openMenu('click');
  }
}

function actionClicked(id, value = undefined) {
  emits('actionClick', id, value);
}

function onClickOutsideHandler() {
  closeMenu('click');
}

onClickOutside(dropDownWrapper, onClickOutsideHandler, {
  ignore: ['#poppers'],
});

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
        :tabindex="disabled ? -1 : 0"
        @keyup.enter="openMenu('keyboard')"
        @keyup.space="openMenu('keyboard')"
        @keydown.esc="closeMenu('keyboard')"
        @keydown.space.prevent
        @contextmenu.prevent="openMenu"
      >
        <LxButton
          v-if="!$slots.default && mainButton"
          :id="mainButton?.id"
          :label="mainButton?.name || mainButton?.label"
          :title="mainButton?.title"
          :icon="mainButton?.icon"
          :iconSet="mainButton?.iconSet"
          :disabled="mainButton?.disabled"
          :loading="mainButton?.loading"
          :busy="mainButton?.busy"
          :destructive="mainButton?.destructive"
          :badge="mainButton?.badge"
          :badgeType="mainButton?.badgeType"
          :active="mainButton?.active"
          kind="ghost"
          variant="icon-only"
          tabindex="-1"
        />
        <slot v-else />
      </div>
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
      <div
        v-else
        class="lx-dropdown-toggler"
        :tabindex="disabled ? -1 : 0"
        @keyup.enter="openMenu('keyboard')"
        @keyup.space="openMenu('keyboard')"
        @keydown.esc="closeMenu('keyboard')"
        @keydown.space.prevent
        @click="handleClick"
      >
        <LxButton
          v-if="!$slots.default && mainButton"
          :id="mainButton?.id"
          :label="mainButton?.name || mainButton?.label"
          :title="mainButton?.title"
          :icon="mainButton?.icon"
          :iconSet="mainButton?.iconSet"
          :disabled="mainButton?.disabled"
          :loading="mainButton?.loading"
          :busy="mainButton?.busy"
          :destructive="mainButton?.destructive"
          :badge="mainButton?.badge"
          :badgeType="mainButton?.badgeType"
          :active="mainButton?.active"
          kind="ghost"
          variant="icon-only"
          tabindex="-1"
        />
        <slot v-else />
      </div>

      <template #content>
        <div ref="panelRef" class="lx-dropdown-panel-wrapper" @keydown.esc="closeMenu('keyboard')">
          <div v-if="$slots.clickSafePanel" class="lx-dropdown-panel" role="group">
            <div
              v-for="(group, groupName) in groupedItems"
              :key="groupName"
              class="lx-button-set lx-dropdown-menu-group"
            >
              <div v-for="action in group" :key="action?.id">
                <div v-if="action?.kind === 'toggle'" class="lx-dropdown-menu-toggle-wrapper">
                  <label
                    class="lx-dropdown-toggle-label"
                    :id="`${action.id}-label`"
                    :for="action?.id"
                  >
                    {{ action?.name || action?.label }}
                  </label>
                  <LxToggle
                    :id="action?.id"
                    :labelId="`${action.id}-label`"
                    :disabled="action?.disabled"
                    v-model="action.value"
                    :texts="action?.texts"
                    :tooltip="action?.title"
                    :size="isTouchSensitive ? 'm' : 's'"
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
                  :iconSet="action?.iconSet"
                  :disabled="action?.disabled"
                  :loading="action?.loading"
                  :busy="action?.busy"
                  :destructive="action?.destructive"
                  :badge="action?.badge"
                  :badge-type="action?.badgeType"
                  :active="action?.active"
                  :href="action?.href"
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
                  <label
                    class="lx-dropdown-toggle-label"
                    :id="`${action.id}-label`"
                    :for="action?.id"
                  >
                    {{ action?.name || action?.label }}
                  </label>
                  <LxToggle
                    :id="action?.id"
                    :labelId="`${action.id}-label`"
                    :disabled="action?.disabled"
                    v-model="action.value"
                    :texts="action?.texts"
                    :tooltip="action?.title"
                    :size="isTouchSensitive ? 'm' : 's'"
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
                  :iconSet="action?.iconSet"
                  :disabled="action?.disabled"
                  :loading="action?.loading"
                  :busy="action?.busy"
                  :destructive="action?.destructive"
                  :badge="action?.badge"
                  :badge-type="action?.badgeType"
                  :active="action?.active"
                  :href="action?.href"
                  @click="actionClicked(action?.id)"
                />
              </div>
            </div>

            <slot name="panel" />
          </div>
        </div>
      </template>
    </LxPopper>
  </div>
</template>
