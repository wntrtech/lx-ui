<script setup>
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';

const emits = defineEmits(['emptyStateActionClick']);

defineProps({
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  actionDefinitions: { type: Array, default: null },
  texts: {
    type: Object,
    default: () => ({
      overflowMenu: 'Atvērt papildus iespējas',
    }),
  },
});

function actionClicked(actionName) {
  emits('emptyStateActionClick', actionName);
}
</script>

<template>
  <div class="lx-empty-state-wrapper">
    <div class="lx-empty-state-data">
      <LxIcon v-show="icon" :value="icon" />
      <p class="lx-primary">{{ label }}</p>
      <p v-if="description" class="lx-secondary">{{ description }}</p>
      <div
        class="lx-empty-state-buttons"
        v-if="actionDefinitions?.length && actionDefinitions?.length <= 3"
      >
        <LxButton
          v-for="action in actionDefinitions"
          :key="action?.id"
          kind="tertiary"
          :tabindex="0"
          :icon="action?.icon"
          :label="action?.name"
          :destructive="action?.destructive"
          :disabled="action?.disabled"
          :loading="action?.loading"
          :busy="action?.busy"
          @click="actionClicked(action?.id)"
        />
      </div>
      <div
        class="lx-list-item-actions"
        v-if="actionDefinitions?.length && actionDefinitions?.length > 3"
      >
        <LxDropDownMenu>
          <LxButton
            icon="overflow-menu"
            kind="tertiary"
            :label="texts.overflowMenu"
            variant="icon-only"
          />
          <template v-slot:panel>
            <div class="lx-button-set">
              <LxButton
                v-for="action in actionDefinitions"
                :key="action?.id"
                :icon="action?.icon"
                :label="action?.name"
                :tabindex="0"
                :destructive="action?.destructive"
                :disabled="action?.disabled"
                :loading="action.loading"
                :busy="action?.busy"
                @click="actionClicked(action?.id)"
              />
            </div>
          </template>
        </LxDropDownMenu>
      </div>
    </div>
    <div aria-live="polite" role="status" class="lx-invisible">
      {{ label }}
    </div>
  </div>
</template>
