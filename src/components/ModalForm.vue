<script setup lang="ts">
import { ref, nextTick, provide, computed, watch } from 'vue';
import LxForm from '@/components/forms/Form.vue';
import LxButton from '@/components/Button.vue';
import { logWarn } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';
import { generateUUID } from '@/utils/stringUtils';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useElementSize, useScroll } from '@vueuse/core';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  label: { type: String, default: '' },
  size: { type: String, default: 'default' }, // default, s, m, l, xl
  disableClosing: { default: false, type: Boolean },
  escEnabled: { default: true, type: Boolean },
  buttonSecondaryIsCancel: { default: true, type: Boolean },
  actionDefinitions: { type: Array, default: () => [] },
  columnCount: { type: Number, default: 1 },
  showPreHeaderInfo: { type: Boolean, default: true },
  showPostHeaderInfo: { type: Boolean, default: true },
  index: { type: Array, default: () => [] },
  indexType: { type: String, default: null }, // expanders
  requiredMode: { type: String, default: 'indicator' }, // none || required || required-asterisk || optional
  kind: { type: String, default: 'default' }, // default || compact
  orientation: { type: String, default: null }, // vertical || horizontal
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  otherActions: 'Citas darbības',
  required: '(obligāts)',
  optional: '(neobligāts)',
  overflowMenu: 'Atvērt papildu iespējas',
  additionalActions: 'Papildu darbības',
  close: 'Aizvērt',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['closed', 'actionClick']);

const isOpen = ref(false);
const modalRef = ref();
const insideModal = ref(true);
const modalContent = ref();
const modalFooter = ref();

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

  isOpen.value = true;

  nextTick(() => {
    activate();
    modalRef.value.focus();
  });
}

function close(source = null) {
  if (source === 'esc') {
    if (props.escEnabled) {
      isOpen.value = false;
      emits('closed');
    }
  } else {
    isOpen.value = false;
    emits('closed');
  }

  deactivate();
}

function actionClicked(action) {
  if (action?.kind === 'secondary' && props.buttonSecondaryIsCancel) {
    close();
    return;
  }
  emits('actionClick', action?.id);
}

function buttonClicked(action) {
  emits('actionClick', action);
}

const actionDefinitionsDisplay = computed(() => {
  if (!props.actionDefinitions || !props.actionDefinitions.length) return [];

  const primary =
    props.actionDefinitions?.filter((action) => action?.kind === 'primary' || !action?.kind) || [];
  const secondary = props.actionDefinitions?.filter((action) => action?.kind === 'secondary') || [];

  const env = useLx().environment;
  if (primary.length > 1) {
    logWarn(
      'LxModalForm: Only one primary action is allowed. All other primary actions will be ignored.',
      env
    );
  }
  if (secondary.length > 1) {
    logWarn(
      'LxModalForm: Only one secondary action is allowed. All other secondary actions will be ignored.',
      env
    );
  }
  return [...primary.slice(0, 1), ...secondary.slice(0, 1)];
});

const additionalButtons = computed(() =>
  props.actionDefinitions?.filter((action) => action?.kind === 'additional')
);

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

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
    nextTick(() => {
      if (modalContent.value) {
        scrollYPos.value = 0;
      }
    });
  }
});

const formKind = computed(() =>
  // Do not allow 'stripped' kind in ModalForm, because it removes header which is needed for modal
  props.kind === 'compact' || props.kind === 'stripped' ? 'compact' : 'default'
);

provide('insideModal', insideModal);
defineExpose({ open, close });
</script>
<template>
  <teleport to="#modals" v-if="isOpen">
    <div>
      <div
        class="lx-curtain"
        :class="[{ 'lx-visible': isOpen }]"
        v-if="isOpen"
        ref="modalRef"
        tabindex="-1"
        @keydown.esc="close('esc')"
      >
        <div
          class="lx-modal lx-modal-form"
          :class="[
            { 'lx-modal-s': size === 's' || size === 'default' },
            { 'lx-modal-m': size === 'm' },
            { 'lx-modal-l': size === 'l' },
            { 'lx-modal-xl': size === 'xl' },
          ]"
          :style="`${bottomOutOfBounds}`"
        >
          <div class="lx-main" ref="modalContent">
            <LxForm
              :showFooter="false"
              :actionDefinitions="additionalButtons"
              :columnCount="columnCount"
              :showPreHeaderInfo="showPreHeaderInfo"
              :showPostHeaderInfo="showPostHeaderInfo"
              :requiredMode="requiredMode"
              :orientation="orientation"
              :index="indexType === 'expanders' ? index : []"
              :indexType="indexType === 'expanders' ? 'expanders' : 'default'"
              :texts="displayTexts"
              :kind="formKind"
              @buttonClick="buttonClicked"
            >
              <template #pre-header>
                <slot name="pre-header" />
              </template>

              <template #pre-header-info>
                <slot name="pre-header-info" />
              </template>

              <template #header>
                <slot name="header" v-if="$slots.header" />
                <span v-else>{{ label }}</span>
              </template>

              <template #post-header>
                <slot name="post-header" />
              </template>

              <template #post-header-info>
                <slot name="post-header-info" />
              </template>

              <template #header-additional v-if="!disableClosing">
                <LxButton
                  kind="ghost"
                  icon="close"
                  variant="icon-only"
                  :label="displayTexts.close"
                  :destructive="true"
                  @click="close"
                />
              </template>

              <slot />

              <template #sections>
                <slot name="sections" />
              </template>
            </LxForm>
          </div>
          <footer
            ref="modalFooter"
            class="lx-button-set"
            :class="[
              {
                'lx-two-buttons': actionDefinitionsDisplay?.length === 2,
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
          </footer>
        </div>
      </div>
    </div>
  </teleport>
</template>
