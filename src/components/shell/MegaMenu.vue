<script setup lang="ts">
import { computed } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  hasShowAll: { type: Boolean, default: false },
  groupDefinitions: { type: Array, default: null },
  selectedMegaMenuItem: { type: String, default: null },
  texts: {
    type: Object,
    required: false,
    default: () => ({
      showAllLabel: 'Vairāk',
      megaMenuTitle: 'Lietotnes',
    }),
  },
});

const emits = defineEmits(['megaMenuShowAllClick', 'update:selectedMegaMenuItem']);

const selectedMegaMenuItemModel = computed({
  get() {
    return props.selectedMegaMenuItem;
  },
  set(value) {
    emits('update:selectedMegaMenuItem', value);
  },
});

const primaryItems = computed(() => {
  const primary = props.items?.filter((o) => o.kind === 'primary') || [];

  return primary;
});

const groupedSecondaryItems = computed(() => {
  if (!props.groupDefinitions) {
    return props.items?.map((item) => ({ ...item, kind: 'primary' })) || [];
  }

  const groups = props.groupDefinitions.reduce((acc, group) => {
    acc[group.id] = { ...group, items: [] };
    return acc;
  }, {});

  props.items?.forEach((item) => {
    if (item.kind === 'secondary' && item.group && groups[item.group]) {
      groups[item.group].items.push(item);
    }
  });

  return Object.values(groups).filter((group) => group.items.length > 0);
});

function triggerShowAllClick() {
  emits('megaMenuShowAllClick');
}

function updateSelectedMegaMenuItem(id) {
  selectedMegaMenuItemModel.value = id;
}

const lxElement = document.querySelector('.lx');

function specialStyles(item) {
  if (!item?.brandColor) {
    return {};
  }

  const { className } = lxElement;

  if (className.includes('dark')) {
    return {
      fill: item.brandColorDark || item.brandColor,
    };
  }
  if (className.includes('light')) {
    return {
      fill: item.brandColor,
    };
  }
  if (className.includes('contrast')) {
    return null;
  }

  return {
    fill: item.brandColor,
  };
}

function getIcon(item) {
  return item.icon || 'zz-default';
}
</script>
<template>
  <LxDropDownMenu>
    <div class="lx-toolbar">
      <LxButton variant="icon-only" kind="ghost" icon="apps" :title="texts.megaMenuTitle" />
    </div>

    <template v-slot:panel>
      <div class="lx-mega-menu-container">
        <ul class="primary-menu">
          <li
            v-for="item in primaryItems"
            :key="item.id"
            class="primary-menu-tile"
            :title="item?.description"
            tabindex="0"
            :class="[
              { selected: selectedMegaMenuItemModel === item.id },
              {
                'default-icon': !item.id,
              },
            ]"
            @click="updateSelectedMegaMenuItem(item.id)"
            @keyup.enter.prevent="updateSelectedMegaMenuItem(item.id)"
          >
            <LxIcon
              :value="getIcon(item)"
              :iconSet="item.iconSet || 'brand'"
              :style="specialStyles(item)"
              :title="item?.description"
            />
            <p class="lx-data">{{ item?.name }}</p>
          </li>
          <li
            v-if="props.hasShowAll"
            class="primary-menu-tile"
            :title="texts.showAllLabel"
            @keyup.enter.prevent="triggerShowAllClick"
            @click="triggerShowAllClick"
            tabindex="0"
          >
            <LxIcon value="open" :title="texts.showAllLabel" />
            <p class="lx-data">{{ texts.showAllLabel }}</p>
          </li>
        </ul>

        <div class="secondary-menu" v-if="groupedSecondaryItems?.length > 0">
          <div v-for="group in groupedSecondaryItems" :key="group.id" class="secondary-menu-group">
            <label :title="group.name">{{ group.name }}</label>
            <ul>
              <li
                v-for="item in group.items"
                :key="item.id"
                class="secondary-menu-item"
                tabindex="0"
                :title="item?.description"
                :class="[
                  { selected: selectedMegaMenuItemModel === item.id },
                  {
                    'default-icon': !item.icon,
                  },
                ]"
                @click="updateSelectedMegaMenuItem(item.id)"
                @keyup.enter.prevent="updateSelectedMegaMenuItem(item.id)"
              >
                <LxIcon
                  :value="getIcon(item)"
                  :iconSet="item.iconSet || 'brand'"
                  :style="specialStyles(item)"
                  :title="item?.description"
                />
                <p class="lx-data">{{ item?.name }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </LxDropDownMenu>
</template>
