<script setup lang="ts">
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxButton from '@/components/Button.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import { sanitizeUrl } from '@braintree/sanitize-url';
import useLx from '@/hooks/useLx';
import LxLoader from '@/components/Loader.vue';

const emits = defineEmits(['click', 'actionClick']);

const props = defineProps({
  id: { type: String, default: null },
  label: { type: String, required: true },
  description: { type: String, default: null },
  value: { type: Object, default: null },
  icon: { type: String, default: 'next' },
  iconSet: {
    type: String,
    default: () => useLx().getGlobals()?.iconSet,
  },
  href: { type: [String, Object], default: null },
  kind: { type: String, default: 'default' },
  category: { type: String, default: null },
  clickable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  searchString: { type: String, default: '' },
  tooltip: { type: String, default: '' },
  actionDefinitions: { type: Array, default: () => [] },
});

function performClick() {
  if (props.clickable && !props.disabled) {
    emits('click');
  }
}

function actionClicked(actionName, rowCode) {
  emits('actionClick', actionName, rowCode);
}
function secureURL(url) {
  if (url && typeof url === 'string') {
    return sanitizeUrl(url);
  }
  if (url instanceof Object) {
    return url;
  }
  return null;
}
</script>
<template>
  <div class="lx-list-item-wrapper" :id="id">
    <div
      v-if="!href"
      :tabindex="href || clickable ? 0 : -1"
      class="lx-list-item"
      @click="performClick()"
      v-on:keyup.enter="performClick()"
      v-on:keyup.space="performClick()"
      :title="clickable ? tooltip : ''"
      :class="[
        { 'lx-list-item-interactive': href || clickable },
        { 'lx-list-item-has-description': description },
        { 'lx-list-item-disabled': disabled },
        { 'lx-selected': selected },
        { 'lx-inactive': kind === 'inactive' },
        { 'lx-list-item-tile': kind === 'tile' },
        { 'lx-category-red': category === 'red' },
        { 'lx-category-blue': category === 'blue' },
        { 'lx-category-green': category === 'green' },
        { 'lx-category-purple': category === 'purple' },
        { 'lx-category-orange': category === 'orange' },
      ]"
    >
      <header>
        <template v-if="!$slots.customItem">
          <p class="lx-primary">
            <lx-searchable-text :value="label" :search-string="searchString" />
          </p>
          <p class="lx-secondary" v-if="description">
            <lx-searchable-text :value="description" :search-string="searchString" />
          </p>
        </template>
        <slot name="customItem" v-bind="value" v-if="value && $slots.customItem"></slot>
      </header>
      <lx-icon :value="icon" :iconSet="iconSet" v-if="href || clickable" />
    </div>

    <router-link
      v-if="href"
      class="lx-list-item"
      :to="secureURL(href)"
      :title="tooltip"
      :class="[
        { 'lx-list-item-interactive': href || clickable },
        { 'lx-list-item-has-description': description },
        { 'lx-list-item-disabled': disabled },
        { 'lx-selected': selected },
        { 'lx-inactive': kind === 'inactive' },
        { 'lx-list-item-tile': kind === 'tile' },
        { 'lx-category-red': category === 'red' },
        { 'lx-category-blue': category === 'blue' },
        { 'lx-category-green': category === 'green' },
        { 'lx-category-purple': category === 'purple' },
        { 'lx-category-orange': category === 'orange' },
      ]"
      :tabindex="href || clickable ? 0 : -1"
    >
      <header>
        <template v-if="!$slots.customItem">
          <p class="lx-primary">
            <lx-searchable-text :value="label" :search-string="searchString" />
          </p>
          <p class="lx-secondary" v-if="description">
            <lx-searchable-text :value="description" :search-string="searchString" />
          </p>
        </template>
        <slot name="customItem" v-bind="value" v-if="value && $slots.customItem"></slot>
      </header>
      <lx-icon :value="icon" :icon-set="iconSet" v-if="href || clickable" />
    </router-link>
    <div class="lx-list-item-loader" v-if="busy"><LxLoader :loading="true" size="s" /></div>
    <div
      class="lx-list-item-actions"
      v-if="actionDefinitions?.length && actionDefinitions?.length === 1"
    >
      <lx-button
        v-for="action in actionDefinitions"
        :key="action.id"
        kind="ghost"
        :tabindex="0"
        :icon="action.icon"
        :icon-set="action.iconSet"
        :title="action.name"
        :destructive="action.destructive"
        :disabled="
          action.disabled || action.enableByAttribute ? !value[action.enableByAttribute] : false
        "
        @click="actionClicked(action.id, id)"
      />
    </div>
    <div
      class="lx-list-item-actions"
      v-if="actionDefinitions?.length && actionDefinitions?.length > 1"
    >
      <lx-drop-down-menu>
        <div v-if="actionDefinitions.length > 1">
          <lx-button icon="overflow-menu" kind="ghost" />
        </div>
        <template v-slot:panel>
          <div class="lx-button-set">
            <lx-button
              v-for="action in actionDefinitions"
              :key="action.id"
              :icon="action.icon"
              :icon-set="action.iconSet"
              :label="action.name"
              :title="action.name"
              :tabindex="0"
              :destructive="action.destructive"
              :disabled="
                action.disabled || action.enableByAttribute
                  ? !value[action.enableByAttribute]
                  : false
              "
              @click="actionClicked(action.id, id)"
            />
          </div>
        </template>
      </lx-drop-down-menu>
    </div>
  </div>
</template>
