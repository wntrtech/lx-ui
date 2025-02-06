<script setup lang="ts">
import { ref, nextTick } from 'vue';
import LxButton from '@/components/Button.vue';
import { generateUUID } from '@/utils/stringUtils';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

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
});

const emits = defineEmits(['closed', 'primaryAction', 'secondaryAction']);

const nativeModal = ref();
const isOpen = ref(false);
const isOpenModal = ref(false);
const modalRef = ref();
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
        >
          <header>
            <p class="lx-primary" :title="label">{{ label }}</p>
            <LxButton icon="close" kind="ghost" @click="close()" v-if="!disableClosing" />
          </header>
          <article class="lx-main">
            <slot></slot>
          </article>
          <footer
            class="lx-button-set"
            :class="[{ 'lx-two-buttons': buttonPrimaryVisible && buttonSecondaryVisible }]"
          >
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
          </footer>
        </div>
      </div>
      <div :class="[{ 'lx-visible': isOpenModal }]" v-if="kind === 'native'">
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
        >
          <header>
            <p class="lx-primary">{{ label }}</p>
            <LxButton icon="close" kind="ghost" @click="close()" v-if="!disableClosing" />
          </header>
          <article class="lx-main">
            <slot></slot>
          </article>
          <footer
            class="lx-button-set"
            :class="[{ 'lx-two-buttons': buttonPrimaryVisible && buttonSecondaryVisible }]"
          >
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
          </footer>
        </dialog>
      </div>
    </div>
  </teleport>
</template>
