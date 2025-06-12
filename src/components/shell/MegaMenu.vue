<script setup lang="ts">
import { computed } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { generateUUID } from '@/utils/stringUtils';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  items: { type: Array, default: () => [] },
  hasShowAll: { type: Boolean, default: false },
  groupDefinitions: { type: Array, default: null },
  selectedMegaMenuItem: { type: String, default: null },
  buttonVariant: { type: String, default: 'icon-only' },
  texts: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const textsDefault = {
  showAllLabel: 'Vairāk',
  megaMenuTitle: 'Lietotnes',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

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
    return [];
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
  return item.icon || 'none';
}

function getIconSet(item) {
  if (!item.icon) {
    return 'cds';
  }
  return item.iconSet || 'brand';
}
</script>
<template>
  <LxDropDownMenu>
    <div class="lx-toolbar">
      <LxButton
        customClass="lx-header-button"
        :variant="buttonVariant"
        kind="ghost"
        icon="apps"
        :label="displayTexts.megaMenuTitle"
      />
    </div>

    <template v-slot:panel>
      <div class="lx-mega-menu-container" :id="id">
        <ul class="primary-menu" role="group">
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
              :iconSet="getIconSet(item)"
              :style="specialStyles(item)"
              :title="item?.description"
            />
            <p class="lx-data">{{ item?.name }}</p>
          </li>
          <li
            v-if="props.hasShowAll"
            class="primary-menu-tile"
            :title="displayTexts.showAllLabel"
            @keyup.enter.prevent="triggerShowAllClick"
            @click="triggerShowAllClick"
            tabindex="0"
          >
            <LxIcon value="open" :title="displayTexts.showAllLabel" />
            <p class="lx-data">{{ displayTexts.showAllLabel }}</p>
          </li>
        </ul>

        <div class="secondary-menu" v-if="groupedSecondaryItems?.length > 0">
          <div
            v-for="group in groupedSecondaryItems"
            :key="group.id"
            class="secondary-menu-group"
            role="group"
            :aria-labelledby="`mm-${id}-${group.id}`"
          >
            <label :id="`mm-${id}-${group.id}`" :title="group.name">{{ group.name }}</label>
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
                  :iconSet="getIconSet(item)"
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
