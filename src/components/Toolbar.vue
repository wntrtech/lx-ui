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
              :icon="action?.icon"
              :icon-set="action?.iconSet"
              :busy="action?.busy"
              :loading="action?.loading"
              :title="action?.name || action?.title || action?.tooltip"
              :active="action?.active"
              :destructive="action?.destructive"
              :disabled="action?.disabled || props.disabled || props.loading"
              :label="action?.name || action?.label"
              :variant="action?.variant ? action.variant : action?.label ? 'default' : 'icon-only'"
              :badge="action?.badge"
              :badgeType="action?.badgeType"
              :badgeIcon="action?.badgeIcon"
              :badgeTitle="action?.badgeTitle"
              @click="actionClicked(action.id)"
            />
            <LxDropDownMenu
              v-if="action?.groupId === group.id && action.nestedGroupId"
              :disabled="action?.disabled || props.disabled || props.loading"
            >
              <LxButton
                v-if="action?.groupId === group.id && action.nestedGroupId"
                :id="`${id}-action-${action.id}`"
                :label="action?.name || action?.label"
                :title="action?.title || action?.tooltip"
                :icon="action?.icon || 'menu'"
                :icon-set="action?.iconSet"
                :kind="action?.kind || 'ghost'"
                :tabindex="-1"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :disabled="action?.disabled || props.disabled || props.loading"
                :active="action?.active"
                :badge="action?.badge"
                :badgeType="action?.badgeType"
                :badgeIcon="action?.badgeIcon"
                :badgeTitle="action?.badgeTitle"
                variant="icon-only"
              />
              <template #panel>
                <template v-for="button in leftActions" :key="button.id">
                  <LxButton
                    v-if="action?.nestedGroupId === button.groupId"
                    :id="`${id}-action-${button.id}`"
                    :label="button?.name || button?.label"
                    :title="button?.title || button?.tooltip"
                    :icon="button?.icon"
                    :icon-set="button?.iconSet"
                    :kind="button?.kind || 'ghost'"
                    :loading="button?.loading"
                    :busy="button?.busy"
                    :destructive="button?.destructive"
                    :disabled="button?.disabled || props.disabled || props.loading"
                    :active="button?.active"
                    :badge="button?.badge"
                    :badgeType="button?.badgeType"
                    :badgeIcon="button?.badgeIcon"
                    :badgeTitle="button?.badgeTitle"
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
              :label="item?.name || item?.label"
              :title="item?.title || item?.tooltip"
              :icon="item?.icon"
              :icon-set="item?.iconSet"
              :kind="item?.kind || 'ghost'"
              :loading="item?.loading"
              :busy="item?.busy"
              :destructive="item?.destructive"
              :disabled="item?.disabled || props.disabled || props.loading"
              variant="icon-only"
              :active="item?.active"
              :badge="item?.badge"
              :badgeType="item?.badgeType"
              :badgeIcon="item?.badgeIcon"
              :badgeTitle="item?.badgeTitle"
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
                  :label="button?.name || button?.label"
                  :title="button?.title || button?.tooltip"
                  :icon="button?.icon"
                  :icon-set="button?.iconSet"
                  :kind="button?.kind || 'ghost'"
                  :loading="button?.loading"
                  :busy="button?.busy"
                  :destructive="button?.destructive"
                  :disabled="button?.disabled || props.disabled || props.loading"
                  :active="button?.active"
                  :badge="button?.badge"
                  :badgeType="button?.badgeType"
                  :badgeIcon="button?.badgeIcon"
                  :badgeTitle="button?.badgeTitle"
                  @click="actionClicked(button.id)"
                />
              </template>
            </template>
          </LxDropDownMenu>
          <LxButton
            v-else-if="leftActionsSmall?.length === 1 && !leftActionsSmall?.[0]?.nestedGroupId"
            :id="`${id}-action-${leftActions?.[0].id}`"
            :label="leftActions?.[0]?.name || leftActions?.[0]?.label"
            :title="leftActions?.[0]?.title || leftActions?.[0]?.tooltip"
            :icon="leftActions?.[0]?.icon"
            :icon-set="leftActions?.[0]?.iconSet"
            :kind="leftActions?.[0]?.kind || 'ghost'"
            :loading="leftActions?.[0].loading"
            :busy="leftActions?.[0].busy"
            :destructive="leftActions?.[0]?.destructive"
            :disabled="leftActions?.[0]?.disabled || props.disabled || props.loading"
            :active="leftActions?.[0]?.active"
            variant="icon-only"
            :badge="leftActions?.[0]?.badge"
            :badgeType="leftActions?.[0]?.badgeType"
            :badgeIcon="leftActions?.[0]?.badgeIcon"
            :badgeTitle="leftActions?.[0]?.badgeTitle"
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
              :label="action?.name || action?.label"
              :title="action?.title || action?.tooltip"
              :icon="action?.icon"
              :icon-set="action?.iconSet"
              :kind="action?.kind || 'ghost'"
              :loading="action?.loading"
              :busy="action?.busy"
              :destructive="action?.destructive"
              :disabled="action?.disabled || props.disabled || props.loading"
              :active="action?.active"
              :variant="action?.variant ? action.variant : action?.label ? 'default' : 'icon-only'"
              :custom-class="action?.customClass"
              :badge="action?.badge"
              :badgeType="action?.badgeType"
              :badgeIcon="action?.badgeIcon"
              :badgeTitle="action?.badgeTitle"
              @click="actionClicked(action.id)"
            />
            <LxDropDownMenu
              v-if="action?.groupId === group.id && action.nestedGroupId"
              :disabled="action?.disabled || props.disabled || props.loading"
            >
              <LxButton
                v-if="action?.groupId === group.id && action.nestedGroupId"
                :id="`${id}-action-${action.id}`"
                :label="action?.name || action?.label"
                :title="action?.title || action?.tooltip"
                :icon="action?.icon || 'menu'"
                :icon-set="action?.iconSet"
                :kind="action?.kind || 'ghost'"
                :tabindex="-1"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                :disabled="action?.disabled || props.disabled || props.loading"
                :active="action?.active"
                variant="icon-only"
                :badge="action?.badge"
                :badgeType="action?.badgeType"
                :badgeIcon="action?.badgeIcon"
                :badgeTitle="action?.badgeTitle"
              />
              <template #panel>
                <template v-for="button in rightActions" :key="button.id">
                  <LxButton
                    v-if="action?.nestedGroupId === button.groupId"
                    :id="`${id}-action-${button.id}`"
                    :label="button?.name || button?.label"
                    :title="button?.title || button?.tooltip"
                    :icon="button?.icon"
                    :icon-set="button?.iconSet"
                    :kind="button?.kind || 'ghost'"
                    :loading="button?.loading"
                    :busy="button?.busy"
                    :destructive="button?.destructive"
                    :disabled="button?.disabled || props.disabled || props.loading"
                    :active="action?.active"
                    :badge="action?.badge"
                    :badgeType="action?.badgeType"
                    :badgeIcon="button?.badgeIcon"
                    :badgeTitle="button?.badgeTitle"
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
                  :label="button?.name || button?.label"
                  :title="button?.title || button?.tooltip"
                  :icon="button?.icon"
                  :icon-set="button?.iconSet"
                  :kind="button?.kind || 'ghost'"
                  :loading="button?.loading"
                  :busy="button?.busy"
                  :destructive="button?.destructive"
                  :disabled="button?.disabled || props.disabled || props.loading"
                  :active="action?.active"
                  :badge="action?.badge"
                  :badgeType="action?.badgeType"
                  :badgeIcon="action?.badgeIcon"
                  :badgeTitle="action?.badgeTitle"
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
              :label="item?.name || item?.label"
              :title="item?.title || item?.tooltip"
              :icon="item?.icon"
              :icon-set="item?.iconSet"
              variant="icon-only"
              :kind="item?.kind || 'ghost'"
              :loading="item?.loading"
              :busy="item?.busy"
              :destructive="item?.destructive"
              :disabled="item?.disabled || props.disabled || props.loading"
              :active="item?.active"
              :badge="item?.badge"
              :badge-type="item?.badgeType"
              :badgeIcon="item?.badgeIcon"
              :badgeTitle="item?.badgeTitle"
              :custom-class="item?.customClass"
              @click="actionClicked(item.id)"
            />
          </template>
          <LxButton
            v-if="rightActionsSmall?.length === 1 && !rightActionsSmall?.[0]?.nestedGroupId"
            :key="rightActionsSmall?.[0]?.id"
            :id="`${id}-action-${rightActionsSmall?.[0]?.id}`"
            :label="rightActionsSmall?.[0]?.name || rightActionsSmall?.[0]?.label"
            :title="rightActionsSmall?.[0]?.title || rightActionsSmall?.[0]?.tooltip"
            :icon="rightActionsSmall?.[0]?.icon"
            :icon-set="rightActionsSmall?.[0]?.iconSet"
            variant="icon-only"
            :kind="rightActionsSmall?.[0]?.kind || 'ghost'"
            :loading="rightActionsSmall?.[0]?.loading"
            :busy="rightActionsSmall?.[0]?.busy"
            :destructive="rightActionsSmall?.[0]?.destructive"
            :disabled="rightActionsSmall?.[0]?.disabled || props.disabled || props.loading"
            :active="rightActionsSmall?.[0]?.active"
            :badge="rightActionsSmall?.[0]?.badge"
            :badge-type="rightActionsSmall?.[0]?.badgeType"
            :badgeIcon="rightActionsSmall?.[0]?.badgeIcon"
            :badgeTitle="rightActionsSmall?.[0]?.badgeTitle"
            :custom-class="rightActionsSmall?.[0]?.customClass"
            @click="actionClicked(rightActionsSmall?.[0]?.id)"
          />
        </LxToolbarGroup>
      </div>
    </div>
    <slot name="secondRow" />
  </div>
</template>
