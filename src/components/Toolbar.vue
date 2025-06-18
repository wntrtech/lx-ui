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
  props.actionDefinitions?.filter((x) => x?.area === 'left' || !x?.area)
);
const rightActions = computed(() => props.actionDefinitions?.filter((x) => x?.area === 'right'));

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
  <div class="lx-component-toolbar" :class="{ 'lx-toolbar-no-borders': noBorders }" role="toolbar">
    <div class="left-area">
      <LxToolbarGroup v-for="group in leftGroups" :key="group.id" class="action-definitions-group">
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

      <LxToolbarGroup v-for="group in rightGroups" :key="group.id" class="action-definitions-group">
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
      <LxToolbarGroup class="action-definitions-small" v-if="rightActions?.length > 0">
        <LxDropDownMenu v-if="rightActions?.length > 1">
          <LxButton
            kind="ghost"
            :tabindex="0"
            icon="menu"
            label="Papildus darbības"
            variant="icon-only"
          />
          <template #panel>
            <template v-for="button in rightActions" :key="button.id">
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
          v-else-if="rightActions?.length === 1 && !rightActions?.[0]?.nestedGroupId"
          :id="`${id}-action-${ightActions?.[0].id}`"
          :kind="rightActions?.[0]?.kind || 'ghost'"
          :tabindex="0"
          :icon="rightActions?.[0]?.icon"
          :icon-set="rightActions?.[0]?.iconSet"
          :busy="rightActions?.[0]?.busy"
          :loading="rightActions?.[0]?.loading"
          variant="icon-only"
          :label="rightActions?.[0]?.name"
          :active="action?.active"
          :destructive="rightActions?.[0]?.destructive"
          :disabled="rightActions?.[0]?.disabled || props.disabled || props.loading"
          @click="actionClicked(rightActions?.[0].id)"
        />
      </LxToolbarGroup>
    </div>
  </div>
</template>
