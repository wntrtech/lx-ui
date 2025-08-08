<script setup>
import { computed, ref } from 'vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  actionDefinitions: { type: Array, default: () => [] },
  noBorders: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emits = defineEmits(['actionClick']);

const leftActions = computed(() =>
  props.actionDefinitions?.filter((x) => (x?.area === 'left' || !x?.area) && x?.id !== 'select-all')
);
const rightActions = computed(() => props.actionDefinitions?.filter((x) => x?.area === 'right'));
const rightActionsSmall = computed(() =>
  props.actionDefinitions?.filter(
    (x) => x?.area === 'right' && x?.id !== 'search' && x?.id !== 'select-all'
  )
);
const searchButton = computed(() => props.actionDefinitions?.find((x) => x?.id === 'search'));
const selectAllButton = computed(() =>
  props.actionDefinitions?.find((x) => x?.id === 'select-all')
);

const leftNestedGroups = computed(() => {
  const nestedGroups = new Set();
  leftActions.value.forEach((obj) => {
    if (obj.nestedGroupId !== undefined) {
      nestedGroups.add(obj.nestedGroupId);
    }
  });
  return nestedGroups;
});

const rightNestedGroups = computed(() => {
  const nestedGroups = new Set();
  rightActions.value.forEach((obj) => {
    if (obj.nestedGroupId !== undefined) {
      nestedGroups.add(obj.nestedGroupId);
    }
  });
  return nestedGroups;
});

const leftGroups = computed(() => {
  const uniqueGroups = new Set();
  leftActions.value.forEach((obj) => {
    if (obj.groupId !== undefined) {
      uniqueGroups.add(obj.groupId);
    }
  });
  const res = [];
  uniqueGroups.forEach((x) => {
    const obj = {};
    obj.id = x;
    res.push(obj);
  });
  return res;
});

const rightGroups = computed(() => {
  const uniqueGroups = new Set();
  rightActions.value.forEach((obj) => {
    if (obj.groupId !== undefined) {
      uniqueGroups.add(obj.groupId);
    }
  });
  const res = [];
  uniqueGroups.forEach((x) => {
    const obj = {};
    obj.id = x;
    res.push(obj);
  });
  return res;
});

function isNested(groupId, side) {
  const group = ref(leftNestedGroups.value);
  if (side === 'right') group.value = rightNestedGroups.value;
  let res = false;
  group.value?.forEach((x) => {
    if (x === groupId) res = true;
  });
  return res;
}

function actionClicked(id) {
  emits('actionClick', id);
}
</script>

<template>
  <div
    class="lx-component-toolbar"
    :class="[
      { 'lx-toolbar-no-borders': noBorders },
      { 'lx-disabled': props.disabled || props.loading },
    ]"
    role="toolbar"
  >
    <div class="first-row">
      <div class="left-area">
        <template v-if="selectAllButton && selectAllButton?.area === 'left'">
          <LxButton
            :id="`${id}-action-select-all`"
            customClass="lx-hide-button"
            :kind="selectAllButton?.kind || 'ghost'"
            :tabindex="0"
            icon="checkbox"
            variant="icon-only"
            :label="selectAllButton?.name"
            :disabled="selectAllButton?.disabled || props.disabled || props.loading"
            @click="actionClicked(selectAllButton?.id)"
          />
        </template>
        <LxToolbarGroup
          v-for="group in leftGroups"
          :key="group.id"
          class="action-definitions-group"
        >
          <template v-for="action in leftActions" :key="action.id">
            <LxButton
              v-if="
                action?.groupId === group.id &&
                !action.nestedGroupId &&
                !isNested(action.groupId, 'left')
              "
              :id="`${id}-action-${action.id}`"
              :kind="action?.kind || 'ghost'"
              :tabindex="0"
              :icon="action?.icon"
              :icon-set="action?.iconSet"
              :busy="action?.busy"
              :loading="action?.loading"
              :title="action?.name"
              :active="action?.active"
              :destructive="action?.destructive"
              :disabled="action?.disabled || props.disabled || props.loading"
              :label="action?.label || action?.name"
              :variant="action?.variant ? action.variant : action?.label ? 'default' : 'icon-only'"
              @click="actionClicked(action.id)"
            />
            <LxDropDownMenu v-if="action?.groupId === group.id && action.nestedGroupId">
              <LxButton
                v-if="action?.groupId === group.id && action.nestedGroupId"
                :id="`${id}-action-${action.id}`"
                :kind="action?.kind || 'ghost'"
                :tabindex="0"
                :icon="action?.icon || 'menu'"
                :icon-set="action?.iconSet"
                :busy="action?.busy"
                :loading="action?.loading"
                :active="action?.active"
                :label="action?.name"
                variant="icon-only"
                :destructive="action?.destructive"
                :disabled="action?.disabled || props.disabled || props.loading"
              />
              <template #panel>
                <template v-for="button in leftActions" :key="button.id">
                  <LxButton
                    v-if="action?.nestedGroupId === button.groupId"
                    :id="`${id}-action-${button.id}`"
                    :kind="button?.kind || 'ghost'"
                    :tabindex="0"
                    :icon="button?.icon"
                    :icon-set="button?.iconSet"
                    :busy="button?.busy"
                    :loading="button?.loading"
                    :active="action?.active"
                    :label="button?.name"
                    :destructive="button?.destructive"
                    :disabled="button?.disabled || props.disabled || props.loading"
                    @click="actionClicked(button.id)"
                  />
                </template>
              </template>
            </LxDropDownMenu>
          </template>
        </LxToolbarGroup>
        <LxToolbarGroup class="action-definitions-small" v-if="leftActions?.length > 0">
          <template v-if="selectAllButton && selectAllButton?.area === 'left'">
            <LxButton
              :id="`${id}-action-select-all`"
              :kind="selectAllButton?.kind || 'ghost'"
              :tabindex="0"
              icon="checkbox"
              variant="icon-only"
              :label="selectAllButton?.name"
              :disabled="selectAllButton?.disabled || props.disabled || props.loading"
              @click="actionClicked(selectAllButton?.id)"
            />
          </template>
          <LxDropDownMenu v-if="leftActions?.length > 1">
            <LxButton
              kind="ghost"
              :tabindex="0"
              icon="menu"
              label="Papildus darbības"
              variant="icon-only"
            />
            <template #panel>
              <template v-for="button in leftActions" :key="button.id">
                <LxButton
                  v-if="!button?.nestedGroupId"
                  :id="`${id}-action-${button.id}`"
                  :kind="button?.kind || 'ghost'"
                  :tabindex="0"
                  :icon="button?.icon"
                  :icon-set="button?.iconSet"
                  :busy="button?.busy"
                  :loading="button?.loading"
                  :active="action?.active"
                  :label="button?.name"
                  :destructive="button?.destructive"
                  :disabled="button?.disabled || props.disabled || props.loading"
                  @click="actionClicked(button.id)"
                />
              </template>
            </template>
          </LxDropDownMenu>
          <LxButton
            v-else-if="leftActions?.length === 1 && !leftActions?.[0]?.nestedGroupId"
            :id="`${id}-action-${leftActions?.[0].id}`"
            :kind="leftActions?.[0]?.kind || 'ghost'"
            :tabindex="0"
            :icon="leftActions?.[0]?.icon"
            :icon-set="leftActions?.[0]?.iconSet"
            :busy="leftActions?.[0].busy"
            :loading="leftActions?.[0].loading"
            :active="action?.active"
            variant="icon-only"
            :label="leftActions?.[0]?.name"
            :destructive="leftActions?.[0]?.destructive"
            :disabled="leftActions?.[0]?.disabled || props.disabled || props.loading"
            @click="actionClicked(leftActions?.[0].id)"
          />
        </LxToolbarGroup>

        <LxToolbarGroup v-if="$slots.leftArea">
          <slot name="leftArea" />
        </LxToolbarGroup>
        <LxToolbarGroup v-if="$slots.default"><slot /></LxToolbarGroup>
      </div>

      <div class="right-area">
        <LxToolbarGroup v-if="$slots.rightArea">
          <slot name="rightArea" />
        </LxToolbarGroup>

        <LxToolbarGroup
          v-for="group in rightGroups"
          :key="group.id"
          class="action-definitions-group"
        >
          <template v-for="action in rightActions" :key="action.id">
            <LxButton
              v-if="
                action?.groupId === group.id &&
                !action.nestedGroupId &&
                !isNested(action.groupId, 'right')
              "
              :id="`${id}-action-${action.id}`"
              :kind="action?.kind || 'ghost'"
              :tabindex="0"
              :icon="action?.icon"
              :icon-set="action?.iconSet"
              :busy="action?.busy"
              :loading="action?.loading"
              :active="action?.active"
              :title="action?.name"
              :destructive="action?.destructive"
              :disabled="action?.disabled || props.disabled || props.loading"
              :label="action?.label || action?.name"
              :variant="action?.variant ? action.variant : action?.label ? 'default' : 'icon-only'"
              :custom-class="action?.customClass"
              @click="actionClicked(action.id)"
            />
            <LxDropDownMenu v-if="action?.groupId === group.id && action.nestedGroupId">
              <LxButton
                v-if="action?.groupId === group.id && action.nestedGroupId"
                :id="`${id}-action-${action.id}`"
                :kind="action?.kind || 'ghost'"
                :tabindex="0"
                :icon="action?.icon || 'menu'"
                :icon-set="action?.iconSet"
                :busy="action?.busy"
                :loading="action?.loading"
                :active="action?.active"
                variant="icon-only"
                :label="action?.name"
                :destructive="action?.destructive"
                :disabled="action?.disabled || props.disabled || props.loading"
              />
              <template #panel>
                <template v-for="button in rightActions" :key="button.id">
                  <LxButton
                    v-if="action?.nestedGroupId === button.groupId"
                    :id="`${id}-action-${button.id}`"
                    :kind="button?.kind || 'ghost'"
                    :tabindex="0"
                    :icon="button?.icon"
                    :icon-set="button?.iconSet"
                    :busy="button?.busy"
                    :loading="button?.loading"
                    :active="action?.active"
                    :label="button?.name"
                    :destructive="button?.destructive"
                    :disabled="button?.disabled || props.disabled || props.loading"
                    @click="actionClicked(button.id)"
                  />
                </template>
              </template>
            </LxDropDownMenu>
          </template>
        </LxToolbarGroup>
        <LxToolbarGroup class="action-definitions-small" v-if="rightActionsSmall?.length > 0">
          <LxDropDownMenu v-if="rightActionsSmall?.length > 1">
            <LxButton
              kind="ghost"
              :tabindex="0"
              icon="menu"
              label="Papildus darbības"
              variant="icon-only"
              :disabled="props.disabled || props.loading"
            />
            <template #panel>
              <template v-for="button in rightActionsSmall" :key="button.id">
                <LxButton
                  v-if="!button?.nestedGroupId"
                  :id="`${id}-action-${button.id}`"
                  :kind="button?.kind || 'ghost'"
                  :tabindex="0"
                  :icon="button?.icon"
                  :icon-set="button?.iconSet"
                  :busy="button?.busy"
                  :loading="button?.loading"
                  :active="action?.active"
                  :label="button?.name"
                  :destructive="button?.destructive"
                  :disabled="button?.disabled || props.disabled || props.loading"
                  @click="actionClicked(button.id)"
                />
              </template>
            </template>
          </LxDropDownMenu>
          <LxButton
            v-if="searchButton"
            :id="`${id}-action-${searchButton.id}`"
            kind="ghost"
            variant="icon-only"
            :tabindex="0"
            :icon="searchButton?.icon"
            :icon-set="searchButton?.iconSet"
            :busy="searchButton?.busy"
            :loading="searchButton?.loading"
            :active="action?.active"
            :label="searchButton?.name"
            :destructive="searchButton?.destructive"
            :disabled="searchButton?.disabled || props.disabled || props.loading"
            :customClass="searchButton?.customClass ?? ''"
            @click="actionClicked(searchButton.id)"
          />
          <LxButton
            v-if="selectAllButton && selectAllButton?.area === 'right'"
            :id="`${id}-action-${selectAllButton.id}`"
            kind="ghost"
            variant="icon-only"
            :tabindex="0"
            :icon="selectAllButton?.icon"
            :icon-set="selectAllButton?.iconSet"
            :busy="selectAllButton?.busy"
            :loading="selectAllButton?.loading"
            :active="action?.active"
            :label="selectAllButton?.name"
            :destructive="selectAllButton?.destructive"
            :disabled="selectAllButton?.disabled || props.disabled || props.loading"
            @click="actionClicked(selectAllButton.id)"
          />
          <LxButton
            v-else-if="rightActionsSmall?.length === 1 && !rightActions?.[0]?.nestedGroupId"
            :id="`${id}-action-${rightActionsSmall?.[0].id}`"
            :kind="rightActionsSmall?.[0]?.kind || 'ghost'"
            :tabindex="0"
            :icon="rightActionsSmall?.[0]?.icon"
            :icon-set="rightActionsSmall?.[0]?.iconSet"
            :busy="rightActionsSmall?.[0]?.busy"
            :loading="rightActionsSmall?.[0]?.loading"
            variant="icon-only"
            :label="rightActionsSmall?.[0]?.name"
            :active="action?.active"
            :destructive="rightActionsSmall?.[0]?.destructive"
            :disabled="rightActionsSmall?.[0]?.disabled || props.disabled || props.loading"
            @click="actionClicked(rightActionsSmall?.[0].id)"
          />
        </LxToolbarGroup>
      </div>
    </div>
    <slot name="secondRow" />
  </div>
</template>
