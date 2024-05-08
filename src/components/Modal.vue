<script setup lang="ts">
import { ref, nextTick } from 'vue';
import Button from '@/components/Button.vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: {
    type: String,
    default: () => generateUUID(),
  },
  label: { type: String },
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
function open() {
  if (props.kind === 'default') {
    if (props.escEnabled) {
      isOpen.value = true;
      nextTick(() => {
        modalRef.value?.focus();
      });
    } else {
      isOpen.value = true;
    }
  } else {
    isOpenModal.value = true;
    const dialogId = document.getElementById(props.id);
    dialogId.showModal();
  }
}
function close(source = null) {
  if (props.kind === 'default') {
    if (source === 'esc') {
      if (props.escEnabled) isOpen.value = false;
    } else isOpen.value = false;
  } else {
    nativeModal.value.close();
    isOpenModal.value = false;
  }
  emits('closed');
}
function handleKeyDown(event) {
  if (event.key === 'Escape') {
    if (props.escEnabled) {
      isOpenModal.value = false;
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
  <transition name="modal">
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
            <p class="lx-primary">{{ label }}</p>
            <Button icon="close" kind="ghost" @click="close()" v-if="!disableClosing"></Button>
          </header>
          <article class="lx-main">
            <slot></slot>
          </article>
          <footer
            class="lx-button-set"
            :class="[{ 'lx-two-buttons': buttonPrimaryVisible && buttonSecondaryVisible }]"
          >
            <Button
              v-if="buttonPrimaryVisible"
              :label="buttonPrimaryLabel"
              :loading="buttonPrimaryLoading"
              :busy="buttonPrimaryBusy"
              :destructive="buttonPrimaryIsDestructive"
              :disabled="buttonPrimaryDisabled"
              @click="clickPrimary()"
            ></Button>
            <Button
              v-if="buttonSecondaryVisible"
              kind="secondary"
              :label="buttonSecondaryLabel"
              :loading="buttonSecondaryLoading"
              :busy="buttonSecondaryBusy"
              @click="clickSecondary()"
            ></Button>
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
            <Button icon="close" kind="ghost" @click="close()" v-if="!disableClosing"></Button>
          </header>
          <article class="lx-main">
            <slot></slot>
          </article>
          <footer
            class="lx-button-set"
            :class="[{ 'lx-two-buttons': buttonPrimaryVisible && buttonSecondaryVisible }]"
          >
            <Button
              v-if="buttonPrimaryVisible"
              :label="buttonPrimaryLabel"
              :loading="buttonPrimaryLoading"
              :busy="buttonPrimaryBusy"
              :destructive="buttonPrimaryIsDestructive"
              :disabled="buttonPrimaryDisabled"
              @click="clickPrimary()"
            ></Button>
            <Button
              v-if="buttonSecondaryVisible"
              kind="secondary"
              :label="buttonSecondaryLabel"
              :loading="buttonSecondaryLoading"
              :busy="buttonSecondaryBusy"
              @click="clickSecondary()"
            ></Button>
          </footer>
        </dialog>
      </div>
    </div>
  </transition>
</template>
