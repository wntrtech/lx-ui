<script setup lang="ts">
import LxIcon from '@/components/Icon.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxButton from '@/components/Button.vue';
import LxSearchableText from '@/components/SearchableText.vue';
import { sanitizeUrl } from '@braintree/sanitize-url';
import useLx from '@/hooks/useLx';
import LxLoader from '@/components/Loader.vue';
import { ref } from 'vue';
import { generateUUID } from '@/utils/stringUtils';

const emits = defineEmits(['click', 'actionClick']);

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  parentId: { type: String, default: null },
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
  clickable: { type: [Boolean, String], default: false },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  searchString: { type: String, default: '' },
  tooltip: { type: String, default: '' },
  actionDefinitions: { type: Array, default: () => [] },
  actionsLayout: { type: String, default: 'default' }, // default, vertical
});

function performClick() {
  if (props.clickable && !props.disabled) {
    emits('click');
  }
}

const dropDownMenu = ref();

function actionClicked(actionName, rowCode, event = null, href = false, close = false) {
  event?.stopPropagation();
  if (href) event?.preventDefault();
  emits('actionClick', actionName, rowCode);
  if (close) dropDownMenu.value.closeMenu();
}

function openDropDownMenu(event, href = false) {
  if (href) event.preventDefault();
  else {
    event.stopPropagation();
    dropDownMenu.value.openMenu();
  }
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

function getItemId(id, parentId) {
  return `${parentId}-item-${id}`;
}
</script>
<template>
  <div class="lx-list-item-wrapper" :id="id">
    <div
      v-if="!href"
      :tabindex="href || clickable ? 0 : -1"
      class="lx-list-item"
      :id="getItemId(id, parentId)"
      @click="performClick()"
      :role="clickable ? 'button' : null"
      :aria-labelledby="label && clickable ? `${id}-label` : null"
      :aria-describedby="description && clickable ? `${id}-desc` : null"
      :aria-invalid="invalid"
      v-on:keyup.enter="performClick()"
      v-on:keyup.space="performClick()"
      :title="clickable ? tooltip : ''"
      :class="[
        { 'lx-list-item-interactive': href || clickable },
        { 'lx-list-item-has-description': description },
        { 'lx-list-item-disabled': disabled || busy || loading },
        { 'lx-selected': selected },
        { 'lx-inactive': kind === 'inactive' },
        { 'lx-list-item-tile': kind === 'tile' },
        { 'lx-list-item-active': active },
        { 'lx-category-red': category === 'red' },
        { 'lx-category-blue': category === 'blue' },
        { 'lx-category-teal': category === 'teal' },
        { 'lx-category-green': category === 'green' },
        { 'lx-category-purple': category === 'purple' },
        { 'lx-category-orange': category === 'orange' },
        { 'lx-category-yellow': category === 'yellow' },
        { 'lx-category-bad': category === 'bad' },
        { 'lx-category-new': category === 'new' },
        { 'lx-category-good': category === 'good' },
        { 'lx-category-draft': category === 'draft' },
        { 'lx-category-error': category === 'error' },
        { 'lx-category-edited': category === 'edited' },
        { 'lx-category-signed': category === 'signed' },
        { 'lx-category-ongoing': category === 'ongoing' },
        { 'lx-category-waiting': category === 'waiting' },
        { 'lx-category-deleted': category === 'deleted' },
        { 'lx-category-disabled': category === 'disabled' },
        { 'lx-category-inactive': category === 'inactive' },
        { 'lx-category-finished': category === 'finished' },
        { 'lx-category-incomplete': category === 'incomplete' },
        { 'lx-invalid': invalid },
        {
          'lx-list-item-compact-actions':
            actionDefinitions?.length > 0 && actionsLayout === 'vertical',
        },
      ]"
    >
      <div class="lx-category-displayer" />
      <header>
        <template v-if="!$slots.customItem">
          <p :id="`${id}-label`" class="lx-primary">
            <LxSearchableText :value="label" :search-string="searchString" />
          </p>
          <p :id="`${id}-desc`" class="lx-secondary" v-if="description">
            <LxSearchableText :value="description" :search-string="searchString" />
          </p>
        </template>
        <slot name="customItem" v-bind="value" v-if="value && $slots.customItem"></slot>
      </header>
      <div class="lx-invalidation-icon-wrapper" v-if="invalid">
        <LxIcon value="invalid" customClass="lx-invalidation-icon" />
      </div>
      <div class="compact-actions">
        <div class="lx-list-icon-wrapper" v-if="clickable">
          <lx-icon :value="icon" :iconSet="iconSet" customClass="lx-list-icon" :title="tooltip" />
        </div>
        <div
          class="lx-list-item-actions"
          v-if="
            actionDefinitions?.length &&
            actionDefinitions?.length === 1 &&
            actionsLayout === 'vertical'
          "
        >
          <lx-button
            v-for="action in actionDefinitions"
            :id="`${id}-action-${action.id}`"
            :key="action.id"
            kind="ghost"
            :tabindex="0"
            :icon="action.icon"
            :icon-set="action.iconSet"
            :title="action.name"
            :destructive="action.destructive"
            :disabled="
              action.disabled != null
                ? action.disabled
                : action.enableByAttribute
                ? !value[action.enableByAttribute]
                : loading || busy || disabled
            "
            @click="actionClicked(action.id, id, $event)"
          />
        </div>
        <div
          class="lx-list-item-actions"
          v-if="
            actionDefinitions?.length &&
            actionDefinitions?.length > 1 &&
            actionsLayout === 'vertical'
          "
        >
          <lx-drop-down-menu ref="dropDownMenu" :disabled="loading || busy || disabled">
            <div v-if="actionDefinitions.length > 1">
              <lx-button
                :id="`${id}-action-open-menu`"
                icon="overflow-menu"
                kind="ghost"
                :disabled="loading || busy || disabled"
                @click="openDropDownMenu($event, clickable ? false : true)"
              />
            </div>
            <template v-slot:panel>
              <div class="lx-button-set">
                <lx-button
                  v-for="action in actionDefinitions"
                  :id="`${id}-action-${action.id}`"
                  :key="action.id"
                  :icon="action.icon"
                  :icon-set="action.iconSet"
                  :label="action.name"
                  :title="action.name"
                  :tabindex="0"
                  :destructive="action.destructive"
                  :disabled="
                    action.disabled != null
                      ? action.disabled
                      : action.enableByAttribute
                      ? !value[action.enableByAttribute]
                      : false
                  "
                  @click="actionClicked(action.id, id, $event, false, true)"
                />
              </div>
            </template>
          </lx-drop-down-menu>
        </div>
      </div>
    </div>
    <router-link
      v-if="href"
      class="lx-list-item"
      :role="clickable ? 'button' : null"
      :aria-labelledby="label && clickable ? `${id}-label` : null"
      :aria-describedby="description && clickable ? `${id}-desc` : null"
      :aria-invalid="invalid"
      :to="secureURL(href)"
      :title="tooltip"
      :class="[
        { 'lx-list-item-interactive': href || clickable },
        { 'lx-list-item-has-description': description },
        { 'lx-list-item-disabled': disabled },
        { 'lx-selected': selected },
        { 'lx-inactive': kind === 'inactive' },
        { 'lx-list-item-tile': kind === 'tile' },
        { 'lx-list-item-active': active },
        { 'lx-category-red': category === 'red' },
        { 'lx-category-blue': category === 'blue' },
        { 'lx-category-teal': category === 'teal' },
        { 'lx-category-green': category === 'green' },
        { 'lx-category-purple': category === 'purple' },
        { 'lx-category-orange': category === 'orange' },
        { 'lx-category-yellow': category === 'yellow' },
        { 'lx-category-bad': category === 'bad' },
        { 'lx-category-new': category === 'new' },
        { 'lx-category-good': category === 'good' },
        { 'lx-category-draft': category === 'draft' },
        { 'lx-category-error': category === 'error' },
        { 'lx-category-edited': category === 'edited' },
        { 'lx-category-signed': category === 'signed' },
        { 'lx-category-ongoing': category === 'ongoing' },
        { 'lx-category-waiting': category === 'waiting' },
        { 'lx-category-deleted': category === 'deleted' },
        { 'lx-category-disabled': category === 'disabled' },
        { 'lx-category-inactive': category === 'inactive' },
        { 'lx-category-finished': category === 'finished' },
        { 'lx-category-incomplete': category === 'incomplete' },
        { 'lx-invalid': invalid },
        {
          'lx-list-item-compact-actions':
            actionDefinitions?.length > 0 && actionsLayout === 'vertical',
        },
      ]"
      :tabindex="href || clickable ? 0 : -1"
    >
      <div class="lx-category-displayer" />
      <header>
        <template v-if="!$slots.customItem">
          <p class="lx-primary">
            <LxSearchableText :id="`${id}-label`" :value="label" :search-string="searchString" />
          </p>
          <p class="lx-secondary" v-if="description">
            <LxSearchableText
              :id="`${id}-desc`"
              :value="description"
              :search-string="searchString"
            />
          </p>
        </template>
        <slot name="customItem" v-bind="value" v-if="value && $slots.customItem"></slot>
      </header>
      <div class="lx-invalidation-icon-wrapper" v-if="invalid">
        <LxIcon value="invalid" customClass="lx-invalidation-icon" />
      </div>
      <div class="compact-actions">
        <div class="lx-list-icon-wrapper" v-if="href">
          <lx-icon :value="icon" :icon-set="iconSet" customClass="lx-list-icon" :title="tooltip" />
        </div>
        <div
          class="lx-list-item-actions"
          v-if="
            actionDefinitions?.length &&
            actionDefinitions?.length === 1 &&
            actionsLayout === 'vertical'
          "
        >
          <lx-button
            v-for="action in actionDefinitions"
            :id="`${id}-action-${action.id}`"
            :key="action.id"
            kind="ghost"
            :tabindex="0"
            :icon="action.icon"
            :icon-set="action.iconSet"
            :title="action.name"
            :destructive="action.destructive"
            :disabled="
              action.disabled != null
                ? action.disabled
                : action.enableByAttribute
                ? !value[action.enableByAttribute]
                : loading || busy || disabled
            "
            @click="actionClicked(action.id, id, $event, true)"
          />
        </div>
        <div
          class="lx-list-item-actions"
          v-if="
            actionDefinitions?.length &&
            actionDefinitions?.length > 1 &&
            actionsLayout === 'vertical'
          "
        >
          <lx-drop-down-menu ref="dropDownMenu" :disabled="loading || busy || disabled">
            <div v-if="actionDefinitions.length > 1">
              <lx-button
                :id="`${id}-action-open-menu`"
                icon="overflow-menu"
                kind="ghost"
                :disabled="loading || busy || disabled"
                @click="openDropDownMenu($event, true)"
              />
            </div>
            <template v-slot:panel>
              <div class="lx-button-set">
                <lx-button
                  v-for="action in actionDefinitions"
                  :id="`${id}-action-${action.id}`"
                  :key="action.id"
                  :icon="action.icon"
                  :icon-set="action.iconSet"
                  :label="action.name"
                  :title="action.name"
                  :tabindex="0"
                  :destructive="action.destructive"
                  :disabled="
                    action.disabled != null
                      ? action.disabled
                      : action.enableByAttribute
                      ? !value[action.enableByAttribute]
                      : false
                  "
                  @click="actionClicked(action.id, id, $event, true, true)"
                />
              </div>
            </template>
          </lx-drop-down-menu>
        </div>
      </div>
    </router-link>
    <div class="lx-list-item-loader" v-if="busy || loading">
      <LxLoader :loading="true" size="s" @click.stop />
    </div>
    <div
      class="lx-list-item-actions"
      v-if="
        actionDefinitions?.length && actionDefinitions?.length === 1 && actionsLayout !== 'vertical'
      "
    >
      <lx-button
        v-for="action in actionDefinitions"
        :id="`${id}-action-${action.id}`"
        :key="action.id"
        kind="ghost"
        :tabindex="0"
        :icon="action.icon"
        :icon-set="action.iconSet"
        :title="action.name"
        :destructive="action.destructive"
        :disabled="
          action.disabled != null
            ? action.disabled
            : action.enableByAttribute
            ? !value[action.enableByAttribute]
            : loading || busy || disabled
        "
        @click="actionClicked(action.id, id, $event)"
      />
    </div>
    <div
      class="lx-list-item-actions"
      v-if="
        actionDefinitions?.length && actionDefinitions?.length > 1 && actionsLayout !== 'vertical'
      "
    >
      <lx-drop-down-menu :disabled="loading || busy || disabled">
        <div v-if="actionDefinitions.length > 1">
          <lx-button icon="overflow-menu" kind="ghost" :disabled="loading || busy || disabled" />
        </div>
        <template v-slot:panel>
          <div class="lx-button-set">
            <lx-button
              v-for="action in actionDefinitions"
              :id="`${id}-action-${action.id}`"
              :key="action.id"
              :icon="action.icon"
              :icon-set="action.iconSet"
              :label="action.name"
              :title="action.name"
              :tabindex="0"
              :destructive="action.destructive"
              :disabled="
                action.disabled != null
                  ? action.disabled
                  : action.enableByAttribute
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
