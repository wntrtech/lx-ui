<script setup lang="ts">
import { ref, nextTick, provide, computed, watch } from 'vue';
import LxButton from '@/components/Button.vue';
import { logWarn } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';
import { generateUUID } from '@/utils/stringUtils';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useElementSize, useScroll } from '@vueuse/core';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  label: { type: String, default: '' },
  size: { type: String, default: 'default' },
  buttonPrimaryVisible: { default: false, type: Boolean },
  buttonPrimaryLoading: { default: false, type: Boolean },
  buttonPrimaryBusy: { default: false, type: Boolean },
  buttonPrimaryLabel: { default: null, type: String },
  buttonPrimaryDisabled: { default: false, type: Boolean },
  buttonSecondaryVisible: { default: false, type: Boolean },
  buttonSecondaryLoading: { default: false, type: Boolean },
  buttonSecondaryBusy: { default: false, type: Boolean },
  buttonSecondaryLabel: { default: null, type: String },
  buttonSecondaryIsCancel: { default: true, type: Boolean },
  buttonPrimaryIsDestructive: { default: false, type: Boolean },
  disableClosing: { default: false, type: Boolean },
  kind: { default: 'default', type: String }, // default or native
  escEnabled: { default: true, type: Boolean },
  buttonCloseLabel: { default: 'Aizvērt', type: String },
  actionDefinitions: { type: Array, default: () => [] },
});

const emits = defineEmits(['closed', 'primaryAction', 'secondaryAction', 'actionClick']);

const nativeModal = ref();
const isOpen = ref(false);
const isOpenModal = ref(false);
const modalRef = ref();
const insideModal = ref(true);
const modalHeader = ref();
const modalContent = ref();
const modalFooter = ref();

const headerSize = useElementSize(modalHeader);
const footerSize = useElementSize(modalFooter);

const { y: scrollYPos } = useScroll(modalContent);

const { activate, deactivate } = useFocusTrap(modalRef, {
  allowOutsideClick: true,
  initialFocus: false,
});

function open() {
  if (isOpen.value) {
    return;
  }
  if (props.kind === 'default') {
    isOpen.value = true;

    nextTick(() => {
      activate();
      modalRef.value.focus();
    });
  } else {
    isOpenModal.value = true;

    nextTick(() => {
      const dialogId = document.getElementById(props.id);
      dialogId.showModal();
      modalRef.value = dialogId;
      nextTick(() => {
        activate();
        modalRef.value.focus();
      });
    });
  }
}

function close(source = null) {
  if (props.kind === 'default') {
    if (source === 'esc') {
      if (props.escEnabled) {
        isOpen.value = false;
        emits('closed');
      }
    } else {
      isOpen.value = false;
      emits('closed');
    }
  } else {
    nativeModal.value?.close();
    isOpenModal.value = false;
    emits('closed');
  }
  deactivate();
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    if (props.escEnabled) {
      isOpenModal.value = false;
      deactivate();
    } else {
      event.preventDefault();
    }
  }
}

function clickPrimary() {
  if (!props.buttonPrimaryDisabled) emits('primaryAction');
}

function clickSecondary() {
  if (props.buttonSecondaryIsCancel) {
    close();
    return;
  }
  emits('secondaryAction');
}

function actionClicked(action) {
  if (action?.kind === 'secondary' && props.buttonSecondaryIsCancel) {
    close();
    return;
  }
  emits('actionClick', action?.id);
}

const actionDefinitionsDisplay = computed(() => {
  const primary =
    props.actionDefinitions?.filter((action) => action?.kind === 'primary' || !action?.kind) || [];
  const secondary = props.actionDefinitions?.filter((action) => action?.kind === 'secondary') || [];

  const env = useLx().environment;
  if (primary.length > 1) {
    logWarn(
      'LxModal: Only one primary action is allowed. All other primary actions will be ignored.',
      env
    );
  }
  if (secondary.length > 1) {
    logWarn(
      'LxModal: Only one secondary action is allowed. All other secondary actions will be ignored.',
      env
    );
  }
  return [...primary.slice(0, 1), ...secondary.slice(0, 1)];
});

const topOutOfBounds = computed(() => {
  const keyOpacity = '--modal-top-shadow-opacity';
  const keySize = '--modal-header-size';
  const limit = 100;
  const size = headerSize.height?.value;

  if (!modalContent.value || !modalHeader.value)
    return `${keyOpacity}: 0; ${keySize}: var(--row-size);`;

  const scrollTop = scrollYPos.value || 0;

  if (scrollTop > limit) {
    return `${keyOpacity}: 1; ${keySize}: ${size}px;`;
  }
  if (scrollTop > 0) {
    return `${keyOpacity}: ${scrollTop / limit}; ${keySize}: ${size}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${size}px;`;
});

const bottomOutOfBounds = computed(() => {
  const keyOpacity = '--modal-bottom-shadow-opacity';
  const keySize = '--modal-footer-size';
  const limit = 100;
  const size = footerSize.height?.value;

  if (!modalContent.value || !modalFooter.value)
    return `${keyOpacity}: 0; ${keySize}: var(--row-size);`;

  const maxScrollDistance = modalContent.value.scrollHeight - modalContent.value.clientHeight;
  const scrollTop = scrollYPos.value || 0;
  const v = maxScrollDistance - scrollTop;

  if (v > limit) {
    return `${keyOpacity}: 1; ${keySize}: ${size}px;`;
  }
  if (v > 0) {
    return `${keyOpacity}: ${v / limit}; ${keySize}: ${size}px;`;
  }
  return `${keyOpacity}: 0; ${keySize}: ${size}px;`;
});

watch([isOpen, isOpenModal], ([newIsOpen, newIsOpenModal]) => {
  if (newIsOpen || newIsOpenModal) {
    nextTick(() => {
      if (modalContent.value) {
        scrollYPos.value = 0;
      }
    });
  }
});

provide('insideModal', insideModal);

defineExpose({ open, close });
</script>
<template>
  <teleport
    to="#modals"
    v-if="(kind === 'default' && isOpen) || (kind === 'native' && isOpenModal)"
  >
    <div>
      <div
        class="lx-curtain"
        :class="[{ 'lx-visible': isOpen }]"
        v-if="isOpen && kind === 'default'"
        ref="modalRef"
        tabindex="-1"
        @keydown.esc="close('esc')"
      >
        <div
          class="lx-modal"
          :class="[
            { 'lx-modal-s': size === 's' || size === 'default' },
            { 'lx-modal-m': size === 'm' },
            { 'lx-modal-l': size === 'l' },
            { 'lx-modal-xl': size === 'xl' },
          ]"
          :style="`${topOutOfBounds}; ${bottomOutOfBounds}`"
        >
          <header ref="modalHeader">
            <p class="lx-primary" :title="label">{{ label }}</p>
            <LxButton
              v-if="!disableClosing"
              icon="close"
              kind="ghost"
              :label="buttonCloseLabel"
              variant="icon-only"
              @click="close()"
            />
          </header>
          <article class="lx-main" ref="modalContent">
            <slot />
          </article>
          <footer
            ref="modalFooter"
            class="lx-button-set"
            :class="[
              {
                'lx-two-buttons':
                  (actionDefinitionsDisplay?.length === 0 &&
                    buttonPrimaryVisible &&
                    buttonSecondaryVisible) ||
                  actionDefinitionsDisplay?.length === 2,
              },
            ]"
          >
            <template v-if="actionDefinitionsDisplay?.length > 0">
              <LxButton
                v-for="action in actionDefinitionsDisplay"
                :key="action?.id"
                :id="`${id}-action-${action?.id}`"
                :kind="action?.kind"
                :label="action?.name || action?.label"
                :title="action?.title"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :disabled="action?.disabled"
                @click="actionClicked(action)"
              />
            </template>
            <template v-else>
              <LxButton
                v-if="buttonPrimaryVisible"
                :id="`${id}-action-primary`"
                :label="buttonPrimaryLabel"
                :loading="buttonPrimaryLoading"
                :busy="buttonPrimaryBusy"
                :destructive="buttonPrimaryIsDestructive"
                :disabled="buttonPrimaryDisabled"
                @click="clickPrimary()"
              />
              <LxButton
                v-if="buttonSecondaryVisible"
                :id="`${id}-action-secondary`"
                kind="secondary"
                :label="buttonSecondaryLabel"
                :loading="buttonSecondaryLoading"
                :busy="buttonSecondaryBusy"
                @click="clickSecondary()"
              />
            </template>
          </footer>
        </div>
      </div>
      <div v-if="kind === 'native'" :class="[{ 'lx-visible': isOpenModal }]">
        <dialog
          ref="nativeModal"
          :id="id"
          class="lx-modal"
          @close="close"
          @keydown="handleKeyDown"
          :class="[
            { 'lx-modal-s': size === 's' || size === 'default' },
            { 'lx-modal-m': size === 'm' },
            { 'lx-modal-l': size === 'l' },
            { 'lx-modal-xl': size === 'xl' },
          ]"
          tabindex="-1"
          :style="`${topOutOfBounds}; ${bottomOutOfBounds}`"
        >
          <header ref="modalHeader">
            <p class="lx-primary">{{ label }}</p>

            <LxButton
              v-if="!disableClosing"
              icon="close"
              kind="ghost"
              :label="buttonCloseLabel"
              variant="icon-only"
              @click="close()"
            />
          </header>
          <article class="lx-main" ref="modalContent">
            <slot />
          </article>
          <footer
            ref="modalFooter"
            class="lx-button-set"
            :class="[
              {
                'lx-two-buttons':
                  (actionDefinitionsDisplay?.length === 0 &&
                    buttonPrimaryVisible &&
                    buttonSecondaryVisible) ||
                  actionDefinitionsDisplay?.length === 2,
              },
            ]"
          >
            <template v-if="actionDefinitionsDisplay?.length > 0">
              <LxButton
                v-for="action in actionDefinitionsDisplay"
                :key="action?.id"
                :id="`${id}-action-${action?.id}`"
                :kind="action?.kind"
                :label="action?.name || action?.label"
                :title="action?.title"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :disabled="action?.disabled"
                @click="actionClicked(action)"
              />
            </template>
            <template v-else>
              <LxButton
                v-if="buttonPrimaryVisible"
                :id="`${id}-action-primary`"
                :label="buttonPrimaryLabel"
                :loading="buttonPrimaryLoading"
                :busy="buttonPrimaryBusy"
                :destructive="buttonPrimaryIsDestructive"
                :disabled="buttonPrimaryDisabled"
                @click="clickPrimary()"
              />
              <LxButton
                v-if="buttonSecondaryVisible"
                :id="`${id}-action-secondary`"
                kind="secondary"
                :label="buttonSecondaryLabel"
                :loading="buttonSecondaryLoading"
                :busy="buttonSecondaryBusy"
                @click="clickSecondary()"
              />
            </template>
          </footer>
        </dialog>
      </div>
    </div>
  </teleport>
</template>
