<script setup lang="ts">
import { computed } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { getDisplayTexts } from '@/utils/generalUtils';
import LxButton from '@/components/Button.vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: generateUUID() },
  label: { type: String, default: null },
  description: { type: String, default: null },
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      typeof value === 'string' &&
      ['info', 'default', 'warning', 'error', 'success'].includes(value),
  },
  kind: {
    type: String,
    default: 'default',
    validator: (value) =>
      typeof value === 'string' && ['default', 'clickable', 'button'].includes(value),
  },
  actionDefinitions: { type: Array, default: () => [] },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  overflowMenu: 'Atvērt papildu iespējas',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const iconName = computed(() => {
  switch (props.variant) {
    case 'error':
      return 'notification-error';
    case 'warning':
      return 'notification-warning';
    case 'success':
      return 'notification-success';
    case 'info':
    case 'default':
    default:
      return 'notification-info';
  }
});

const containerClasses = computed(() => {
  let baseClasses = '';
  switch (props.variant) {
    case 'error':
      baseClasses = 'lx-info-box-button lx-alert-error';
      break;
    case 'warning':
      baseClasses = 'lx-info-box-button lx-alert-warning';
      break;
    case 'info':
      baseClasses = 'lx-info-box-button lx-alert-info';
      break;
    case 'success':
      baseClasses = 'lx-info-box-button lx-alert-success';
      break;
    case 'default':
    default:
      baseClasses = 'lx-info-box-button lx-alert-info';
      break;
  }

  return props.kind === 'clickable' ? `${baseClasses} lx-alert-clickable` : baseClasses;
});

const emits = defineEmits(['actionClick']);

function actionClicked(actionName, selectedItemId = 'default') {
  emits('actionClick', actionName, selectedItemId);
}

function handleClick(event) {
  if (props.kind === 'clickable') {
    event.preventDefault();
    emits('actionClick', 'click', props.id);
  }
}
</script>

<template>
  <div
    :class="containerClasses"
    :role="kind === 'clickable' ? 'button' : undefined"
    :tabindex="kind === 'clickable' ? '0' : '-1'"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <div class="lx-info-box-icon">
      <LxIcon :value="iconName" />
    </div>
    <div class="lx-alert-data">
      <div class="lx-alert-header">
        <p class="lx-data">
          {{ label }}
        </p>
      </div>
      <div class="lx-alert-description" v-if="description">
        <p class="lx-description">
          {{ description }}
        </p>
      </div>
    </div>
    <div class="lx-info-box-spacer" />
    <div
      class="additional-buttons lx-info-box-action-icon"
      :class="{
        'lx-info-box-additional-buttons-hidden': kind === 'default' || kind === 'clickable',
      }"
      v-if="actionDefinitions?.length > 0 && props.kind === 'button'"
    >
      <template v-if="actionDefinitions.length === 1">
        <LxButton
          :key="actionDefinitions[0].id"
          kind="ghost"
          variant="icon-only"
          tabindex="0"
          :icon="actionDefinitions[0].icon"
          :label="actionDefinitions[0].title || actionDefinitions[0].name"
          :destructive="actionDefinitions[0].destructive"
          @click="actionClicked(actionDefinitions[0].id, props.id)"
        />
      </template>
      <LxDropDownMenu
        :actionDefinitions="actionDefinitions"
        @actionClick="(id) => actionClicked(id, props.id)"
      >
        <div class="lx-toolbar" v-if="actionDefinitions.length >= 2">
          <LxButton
            icon="overflow-menu"
            kind="ghost"
            :label="displayTexts.overflowMenu"
            variant="icon-only"
            tabindex="-1"
          />
        </div>
      </LxDropDownMenu>
    </div>
  </div>
</template>
