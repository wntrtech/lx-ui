<script setup>
import { ref, computed, nextTick, provide } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIllustration from '@/components/Illustration.vue';
import { generateUUID } from '@/utils/stringUtils';
import { logWarn } from '@/utils/devUtils';
import useLx from '@/hooks/useLx';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  label: { type: String, default: null },
  description: { type: String, default: null },
  kind: { type: String, default: 'default' }, // default, question, info, warning, error, success, custom
  pictogram: { type: String, default: null },
  actionDefinitions: { type: Array, default: () => [] },
  escEnabled: { type: Boolean, default: true },
  disableClosing: { type: Boolean, default: false },
  buttonSecondaryIsCancel: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const defaultTexts = {
  close: 'Aizvērt',
};

const displayTexts = computed(() => ({ ...defaultTexts, ...props.texts }));

const emits = defineEmits(['closed', 'actionClick']);

const isOpen = ref(false);
const modalRef = ref();
const insideModal = ref(true);
const modalHeader = ref();
const modalContent = ref();
const modalFooter = ref();

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

const actionDefinitionsDisplay = computed(() => {
  let primary = props.actionDefinitions?.filter((action) => action?.kind === 'primary') || [];
  if (primary.length === 0) {
    primary = props.actionDefinitions?.filter((action) => !action?.kind) || [];
  }
  const secondary = props.actionDefinitions?.filter((action) => action?.kind === 'secondary') || [];

  const env = useLx().getGlobals()?.environment;
  if (primary.length > 1) {
    logWarn(
      'LxDialog: Only one primary action is allowed. All other primary actions will be ignored.',
      env
    );
  }
  if (secondary.length > 1) {
    logWarn(
      'LxDialog: Only one secondary action is allowed. All other secondary actions will be ignored.',
      env
    );
  }
  return [...primary.slice(0, 1), ...secondary.slice(0, 1)];
});

const illustrationMap = {
  default: 'question',
  question: 'question',
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const colorMap = {
  default: 'var(--color-data)',
  question: 'var(--color-data)',
  info: 'var(--color-data)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  success: 'var(--color-good)',
  custom: 'var(--color-data)',
};

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
        <div class="lx-modal lx-dialog lx-modal-s">
          <header ref="modalHeader">
            <div class="illustration-wrapper">
              <LxIllustration
                :value="kind !== 'custom' ? illustrationMap[kind] : pictogram"
                :style="`--illustration-color: ${colorMap[kind]}`"
              />
            </div>
            <LxButton
              v-if="!disableClosing"
              icon="close"
              kind="ghost"
              :label="displayTexts?.close"
              variant="icon-only"
              @click="close()"
            />
          </header>
          <article class="lx-main" ref="modalContent">
            <p v-if="label" class="heading-3">{{ label }}</p>
            <p v-if="description">{{ description }}</p>
          </article>
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
                :label="action?.name || action?.label"
                :title="action?.title || action?.tooltip"
                :kind="action?.kind"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :disabled="action?.disabled"
                :active="action?.active"
                @click="actionClicked(action)"
              />
            </template>
          </footer>
        </div>
      </div>
    </div>
  </teleport>
</template>
