<script setup>
import { computed, ref } from 'vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  actionDefinitions: { type: Array, default: () => [] },
  noBorders: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  texts: {
    type: Object,
    default: () => ({}),
  },
});

const textsDefault = { overflowMenu: 'Atvērt papildu iespējas' };
const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['actionClick']);

const leftActions = computed(() =>
  props.actionDefinitions?.filter((x) => x?.area === 'left' || !x?.area)
);

const leftActionsSmall = computed(() =>
  props.actionDefinitions?.filter((x) => (x?.area === 'left' || !x?.area) && !x?.nonResponsive)
);

const nonResponsiveLeftActions = computed(() =>
  props.actionDefinitions?.filter((x) => (x?.area === 'left' || !x?.area) && x?.nonResponsive)
);

const rightActions = computed(() => props.actionDefinitions?.filter((x) => x?.area === 'right'));
const rightActionsSmall = computed(() =>
  props.actionDefinitions?.filter((x) => x?.area === 'right' && !x?.nonResponsive)
);
const nonResponsiveRightActions = computed(() =>
  props.actionDefinitions?.filter((x) => x?.area === 'right' && x?.nonResponsive)
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
            <LxDropDownMenu
              v-if="action?.groupId === group.id && action.nestedGroupId"
              :disabled="action?.disabled || props.disabled || props.loading"
            >
              <LxButton
                v-if="action?.groupId === group.id && action.nestedGroupId"
                :id="`${id}-action-${action.id}`"
                :kind="action?.kind || 'ghost'"
                :tabindex="-1"
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
          <template v-if="nonResponsiveLeftActions?.length > 0">
            <LxButton
              v-for="item in nonResponsiveLeftActions"
              v-show="!item?.nestedGroupId"
              :key="item.id"
              :id="`${id}-action-${item.id}`"
              variant="icon-only"
              :kind="item?.kind || 'ghost'"
              :tabindex="0"
              :icon="item?.icon"
              :icon-set="item?.iconSet"
              :busy="item?.busy"
              :loading="item?.loading"
              :active="item?.active"
              :label="item?.name"
              :destructive="item?.destructive"
              :disabled="item?.disabled || props.disabled || props.loading"
              @click="actionClicked(item.id)"
            />
          </template>
          <LxDropDownMenu
            v-if="leftActionsSmall?.length > 1"
            :disabled="props.disabled || props.loading"
          >
            <LxButton
              kind="ghost"
              :tabindex="-1"
              icon="menu"
              :label="displayTexts.overflowMenu"
              variant="icon-only"
              :disabled="props.disabled || props.loading"
            />
            <template #panel>
              <template v-for="button in leftActionsSmall" :key="button.id">
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
            v-else-if="leftActionsSmall?.length === 1 && !leftActionsSmall?.[0]?.nestedGroupId"
            :id="`${id}-action-${leftActions?.[0].id}`"
            :kind="leftActions?.[0]?.kind || 'ghost'"
            :tabindex="0"
            :icon="leftActions?.[0]?.icon"
            :icon-set="leftActions?.[0]?.iconSet"
            :busy="leftActions?.[0].busy"
            :loading="leftActions?.[0].loading"
            :active="leftActions?.active"
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
            <LxDropDownMenu
              v-if="action?.groupId === group.id && action.nestedGroupId"
              :disabled="action?.disabled || props.disabled || props.loading"
            >
              <LxButton
                v-if="action?.groupId === group.id && action.nestedGroupId"
                :id="`${id}-action-${action.id}`"
                :kind="action?.kind || 'ghost'"
                :tabindex="-1"
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
        <LxToolbarGroup
          class="action-definitions-small"
          v-if="rightActionsSmall?.length > 0 || nonResponsiveRightActions?.length > 0"
        >
          <LxDropDownMenu
            v-if="rightActionsSmall?.length > 1"
            :disabled="props.disabled || props.loading"
          >
            <LxButton
              kind="ghost"
              :tabindex="-1"
              icon="menu"
              :label="displayTexts.overflowMenu"
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
          <template
            v-if="
              (rightActionsSmall?.length === 1 && !rightActions?.[0]?.nestedGroupId) ||
              nonResponsiveRightActions?.length > 0
            "
          >
            <LxButton
              v-for="item in nonResponsiveRightActions"
              v-show="!item?.nestedGroupId && item?.nonResponsive"
              :key="item.id"
              :id="`${id}-action-${item.id}`"
              variant="icon-only"
              :kind="item?.kind || 'ghost'"
              :tabindex="0"
              :icon="item?.icon"
              :icon-set="item?.iconSet"
              :busy="item?.busy"
              :loading="item?.loading"
              :active="item?.active"
              :label="item?.name"
              :destructive="item?.destructive"
              :disabled="item?.disabled || props.disabled || props.loading"
              :custom-class="item?.customClass"
              @click="actionClicked(item.id)"
            />
          </template>
          <LxButton
            v-if="rightActionsSmall?.length === 1 && !rightActionsSmall?.[0]?.nestedGroupId"
            :key="rightActionsSmall?.[0]?.id"
            :id="`${id}-action-${rightActionsSmall?.[0]?.id}`"
            variant="icon-only"
            :kind="rightActionsSmall?.[0]?.kind || 'ghost'"
            :tabindex="0"
            :icon="rightActionsSmall?.[0]?.icon"
            :icon-set="rightActionsSmall?.[0]?.iconSet"
            :busy="rightActionsSmall?.[0]?.busy"
            :loading="rightActionsSmall?.[0]?.loading"
            :active="rightActionsSmall?.[0]?.active"
            :label="rightActionsSmall?.[0]?.name"
            :destructive="rightActionsSmall?.[0]?.destructive"
            :disabled="rightActionsSmall?.[0]?.disabled || props.disabled || props.loading"
            :custom-class="rightActionsSmall?.[0]?.customClass"
            @click="actionClicked(rightActionsSmall?.[0]?.id)"
          />
        </LxToolbarGroup>
      </div>
    </div>
    <slot name="secondRow" />
  </div>
</template>
