<script setup lang="ts">
import { computed, inject, ref, provide } from 'vue';
import { generateUUID } from '@/utils/stringUtils';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import LxToggle from '@/components/Toggle.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';

/**
 * Represents a row component used in forms.
 *
 * @property {String} id - The unique identifier for the row. If not provided, a UUID will be generated.
 * @property {String} label - The label for the row.
 * @property {String} description - The description for the row.
 * @property {Boolean} hideLabel - Determines whether to hide the label.
 * @property {Number|String} columnSpan - The number of columns the row should take up.
 * @property {Number|String} rowSpan - The number of rows the row should take up.
 * @property {String} orientation - The orientation of the row. Can be 'vertical' or 'horizontal'.
 * @property {Boolean} required - Determines whether the row is required.
 * @property {String} inputId - The ID of the input element associated with the row.
 *
 * @example
 * <Row
 *   id="my-row"
 *   label="Name"
 *   description="Enter your name"
 *   hideLabel="false"
 *   columnSpan="2"
 *   rowSpan="1"
 *   orientation="horizontal"
 *   required="true"
 *   inputId="name-input"
 * >
 *   <input type="text" id="name-input" />
 * </Row>
 */
const props = defineProps({
  /**
   * The unique identifier for the row.
   *
   * @type {String}
   * @default generateUUID()
   * @since 0.1.63
   */
  id: {
    type: String,
    default: () => generateUUID(),
  },
  /**
   * The label for the row.
   *
   * @type {String}
   * @default ''
   * @since 0.1.63
   */
  label: {
    type: String,
    default: '',
  },
  /**
   * Description of the component.
   *
   * @type {String}
   * @default ''
   * @since 0.1.63
   */
  description: {
    type: String,
    default: '',
  },
  /**
   * Determines whether the label should be hidden.
   * @type {boolean}
   * @default false
   * @since 0.1.63
   */
  hideLabel: {
    type: Boolean,
    default: false,
  },
  /**
   * The number of columns the row should take up.
   * @type {Number|String}
   * @default 1
   * @since 0.1.63
   */
  columnSpan: {
    type: [Number, String],
    default: 1,
  },
  /**
   * The number of rows that the component should take up.
   * @type {Number|String}
   * @default 1
   * @since 0.1.63
   */
  rowSpan: {
    type: [Number, String],
    default: 1,
  },
  /**
   * The orientation of the row.
   * @type {String}
   * @default null
   * @since 0.1.63
   */
  orientation: {
    type: String,
    default: null,
  },
  /**
   * Determines whether the row is required.
   * @type {Boolean}
   * @default null
   * @since 0.3.11
   */
  required: { type: Boolean, default: null },
  /**
   * The unique identifier for the input element.
   * @type {String}
   * @default null
   * @since 0.4.0
   */
  inputId: { type: String, default: null },
  /**
   * The action definitions for the row.
   * @type {Array}
   * @default []
   * @since 1.5.0
   */
  actionDefinitions: { type: Array, default: () => [] },
});

const emits = defineEmits(['actionClick']);

const tooltip = computed(() => {
  if (props.description) {
    return `${props.label}\n${props.description}`;
  }
  return props.label;
});

const sectionRequiredMode = inject('sectionMode', ref('none'));
const formRequiredMode = inject('formMode', ref('none'));
const requiredTexts = inject(
  'rowRequiredTexts',
  ref({ required: '(obligāts)', optional: '(neobligāts)' })
);
const sectionColumnCount = inject('sectionColumnCount', 1);
const formOrientation = inject('formOrientation', ref(null));
const sectionOrientation = inject('sectionOrientation', ref(null));

// Finds the required mode of the section the row is placed in
const rowRequiredMode = computed(() => {
  if (sectionRequiredMode.value === 'none' || !sectionRequiredMode.value)
    return formRequiredMode.value;
  return sectionRequiredMode.value;
});

const rowOrientation = computed(() => {
  if (props.orientation) return props.orientation;
  if (sectionOrientation.value) return sectionOrientation.value;
  return formOrientation.value;
});

const actionDropDown = ref();

function toggleClick(event) {
  actionDropDown.value?.preventClose(event);
}

function actionClicked(id, actionId, value) {
  emits('actionClick', id, actionId, value);
}

const validatedColumnSpan = computed(() => {
  let res = Number(props.columnSpan);
  if (sectionColumnCount && Number(props.columnSpan) > sectionColumnCount) {
    lxDevUtils.log(
      `LxRow ${props.id} column span is greater than the section column count.`,
      useLx().getGlobals()?.environment,
      'warn'
    );
    res = sectionColumnCount;
  }
  return res;
});

const idComputed = computed(() => props.id);
provide('rowId', idComputed);
</script>
<template>
  <div
    class="lx-row"
    :id="id"
    :class="[
      { 'lx-row-column-2': validatedColumnSpan === 2 },
      { 'lx-row-column-3': validatedColumnSpan === 3 },
      { 'lx-row-column-4': validatedColumnSpan === 4 },
      { 'lx-row-column-6': validatedColumnSpan === 6 },
      { 'lx-row-column-8': validatedColumnSpan === 8 },
      { 'lx-row-row-2': Number(rowSpan) === 2 },
      { 'lx-row-row-3': Number(rowSpan) === 3 },
      { 'lx-row-row-4': Number(rowSpan) === 4 },
      { 'lx-row-row-6': Number(rowSpan) === 6 },
      { 'lx-row-row-8': Number(rowSpan) === 8 },
      { 'lx-row-horizontal': rowOrientation === 'horizontal' },
    ]"
  >
    <div
      class="lx-row-header"
      v-if="(rowOrientation === 'horizontal' && !$slots.info) || (!hideLabel && !$slots.info)"
    >
      <label :title="!$slots.info ? tooltip : ''" :for="inputId" v-if="!hideLabel">
        {{ label ? label : '&nbsp;' }}
        <span class="lx-required" v-if="rowRequiredMode === 'required' && required && !hideLabel">
          {{ requiredTexts.required }}
        </span>
        <span
          class="lx-required-asterisk"
          v-if="rowRequiredMode === 'required-asterisk' && required && !hideLabel"
        >
          *
        </span>
        <span
          class="lx-optional"
          v-if="rowRequiredMode === 'optional' && required === false && !hideLabel"
        >
          {{ requiredTexts.optional }}
        </span>
      </label>

      <div v-if="!hideLabel">
        <template v-if="actionDefinitions?.length === 1">
          <LxToggle
            v-if="actionDefinitions?.[0]?.kind === 'toggle'"
            size="s"
            :modelValue="actionDefinitions?.[0]?.value || false"
            :tooltip="actionDefinitions?.[0].name"
            @update:modelValue="
              (newValue) => {
                actionClicked(id, actionDefinitions?.[0].id, newValue);
              }
            "
          />
          <LxButton
            v-else
            kind="ghost"
            :title="actionDefinitions?.[0]?.name"
            :icon="actionDefinitions?.[0]?.icon"
            :disabled="actionDefinitions?.[0]?.disabled"
            :loading="actionDefinitions?.[0]?.loading"
            :busy="actionDefinitions?.[0]?.busy"
            :destructive="actionDefinitions?.[0]?.destructive"
            @click="actionClicked(id, actionDefinitions?.[0].id)"
          />
        </template>

        <LxDropDownMenu ref="actionDropDown" v-else-if="actionDefinitions?.length > 1">
          <LxButton icon="overflow-menu" kind="ghost" />
          <template #panel>
            <div class="lx-action-controller" v-for="action in actionDefinitions" :key="action.id">
              <div class="lx-action-toggle" v-if="action?.kind === 'toggle'">
                <p v-if="action?.kind === 'toggle'">{{ action?.name }}</p>
                <LxToggle
                  :modelValue="action.value || false"
                  :tooltip="action.name"
                  @update:modelValue="
                    (newValue) => {
                      actionClicked(id, action.id, newValue);
                    }
                  "
                  @click="toggleClick($event)"
                >
                </LxToggle>
              </div>

              <LxButton
                v-else
                kind="ghost"
                :title="action?.name"
                :label="action?.name"
                :icon="action?.icon"
                :disabled="action?.disabled"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                @click="actionClicked(id, action.id)"
              />
            </div>
          </template>
        </LxDropDownMenu>
      </div>
    </div>

    <div
      class="lx-row-header"
      v-if="(rowOrientation === 'horizontal' && $slots.info) || (!hideLabel && $slots.info)"
    >
      <LxInfoWrapper class="lx-info-slot-wrapper" v-if="!hideLabel">
        <label :title="!$slots.info ? tooltip : ''" :for="inputId">
          {{ label ? label : '&nbsp;' }}
          <span class="lx-required" v-if="rowRequiredMode === 'required' && required && !hideLabel">
            {{ requiredTexts.required }}
          </span>
          <span
            class="lx-required-asterisk"
            v-if="rowRequiredMode === 'required-asterisk' && required && !hideLabel"
          >
            *
          </span>
          <span
            class="lx-optional"
            v-if="rowRequiredMode === 'optional' && required === false && !hideLabel"
          >
            {{ requiredTexts.optional }}
          </span>
          <LxIcon value="info" v-if="$slots.info" />
        </label>
        <template #panel>
          <slot name="info" />
        </template>
      </LxInfoWrapper>

      <div v-if="!hideLabel">
        <template v-if="actionDefinitions?.length === 1">
          <LxToggle
            v-if="actionDefinitions?.[0]?.kind === 'toggle'"
            size="s"
            :modelValue="actionDefinitions[0].value || false"
            :tooltip="actionDefinitions?.[0].name"
            @update:modelValue="
              (newValue) => {
                actionClicked(id, actionDefinitions?.[0].id, newValue);
              }
            "
          />
          <LxButton
            v-else
            kind="ghost"
            :title="actionDefinitions?.[0]?.name"
            :icon="actionDefinitions?.[0]?.icon"
            :disabled="actionDefinitions?.[0]?.disabled"
            :loading="actionDefinitions?.[0]?.loading"
            :busy="actionDefinitions?.[0]?.busy"
            :destructive="actionDefinitions?.[0]?.destructive"
            @click="actionClicked(id, actionDefinitions?.[0].id)"
          />
        </template>

        <LxDropDownMenu ref="actionDropDown" v-else-if="actionDefinitions?.length > 1">
          <LxButton icon="overflow-menu" kind="ghost" />
          <template #panel>
            <div class="lx-action-controller" v-for="action in actionDefinitions" :key="action.id">
              <div class="lx-action-toggle" v-if="action?.kind === 'toggle'">
                <p v-if="action?.kind === 'toggle'">{{ action?.name }}</p>
                <LxToggle
                  v-if="action?.kind === 'toggle'"
                  :modelValue="action.value || false"
                  :tooltip="action.name"
                  @update:modelValue="
                    (newValue) => {
                      actionClicked(id, action.id, newValue);
                    }
                  "
                  @click="toggleClick($event)"
                >
                </LxToggle>
              </div>
              <LxButton
                v-else
                kind="ghost"
                :title="action?.name"
                :label="action?.name"
                :icon="action?.icon"
                :disabled="action?.disabled"
                :loading="action?.loading"
                :busy="action?.busy"
                :destructive="action?.destructive"
                @click="actionClicked(id, action.id)"
              />
            </div>
          </template>
        </LxDropDownMenu>
      </div>
    </div>
    <div
      :class="[
        { 'lx-vertical': !rowOrientation || rowOrientation === 'vertical' },
        { 'lx-horizontal': rowOrientation === 'horizontal' },
      ]"
    >
      <slot />
    </div>
  </div>
</template>
