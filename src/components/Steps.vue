<script setup lang="ts">
import { computed, ref } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxLoader from '@/components/Loader.vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';

const props = defineProps({
  id: { type: String, default: null },
  modelValue: { type: String, default: null },
  items: { type: Array, required: true },
  kind: { type: String, default: 'default' }, // 'default', 'compact'
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: 'description' },
  stateAttribute: { type: String, default: 'state' },
  loading: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emits = defineEmits(['update:modelValue']);
const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const myElement = computed(
  () => props.items?.findIndex((element) => element.code === model.value) + 1
);

const isDisabledLoadingBusy = computed(() => {
  let ret = false;
  if (props.disabled || props.loading || props.busy) {
    ret = true;
  }
  return ret;
});

const fillingUp = computed(() => (myElement.value / props.items?.length) * 100);
const color = ref('--color-brand');
</script>

<template>
  <div class="lx-steps-container-wrapper" :class="{ 'lx-steps-compact': kind === 'compact' }">
    <div v-if="kind === 'default'" class="lx-steps-slider">
      <div
        class="lx-steps-filled-slider"
        :style="`width: ${fillingUp}%; background-color: var(${color})`"
      ></div>
      <div class="lx-steps-full-slider"></div>
    </div>

    <div class="lx-steps-data">
      <div class="lx-steps-data-block" v-for="item in items" :key="item[idAttribute]">
        <lx-icon
          v-show="(busy && item[stateAttribute] !== 'current') || !busy"
          customClass="lx-steps-icon"
          :style="{
            fill: isDisabledLoadingBusy
              ? 'var(--color-disabled-background)'
              : item[stateAttribute] === 'current' || item[stateAttribute] === 'complete'
              ? 'var(--color-brand)'
              : item[stateAttribute] === 'invalid'
              ? 'var(--color-bad)'
              : null,
          }"
          :value="
            (() => {
              switch (item[stateAttribute]) {
                case 'current':
                  return 'incomplete';
                case 'invalid':
                  return 'invalid';
                case 'complete':
                  return 'notification-success';
                default:
                  return 'unselected';
              }
            })()
          "
        />
        <div class="lx-steps-icon" v-if="busy && item[stateAttribute] === 'current'">
          <lx-loader :loading="true" size="s" />
        </div>

        <div>
          <div
            class="lx-steps-label"
            v-if="kind === 'default' || (kind === 'compact' && item[idAttribute] === model)"
          >
            <strong>{{ item?.[nameAttribute] }} </strong>
          </div>
          <div class="lx-steps-description" v-if="kind === 'default'">
            <p class="lx-description">{{ item?.[descriptionAttribute] }}</p>
          </div>
        </div>
      </div>

      <div
        class="lx-steps-data-block lx-steps-data-block-small"
        :class="{ 'lx-selected': item[idAttribute] === model }"
        v-for="item in items"
        :key="item[idAttribute]"
      >
        <LxInfoWrapper>
          <lx-icon
            v-show="(busy && item[stateAttribute] !== 'current') || !busy"
            customClass="lx-steps-icon"
            :style="{
              fill: isDisabledLoadingBusy
                ? 'var(--color-disabled-background)'
                : item[stateAttribute] === 'current' || item[stateAttribute] === 'complete'
                ? 'var(--color-brand)'
                : item[stateAttribute] === 'invalid'
                ? 'var(--color-bad)'
                : null,
            }"
            :value="
              (() => {
                switch (item[stateAttribute]) {
                  case 'current':
                    return 'incomplete';
                  case 'invalid':
                    return 'invalid';
                  case 'complete':
                    return 'notification-success';
                  default:
                    return 'unselected';
                }
              })()
            "
          />
          <div class="lx-steps-icon" v-if="busy && item[stateAttribute] === 'current'">
            <lx-loader :loading="true" size="s" />
          </div>

          <div>
            <div class="lx-steps-label">
              <strong>{{ item?.[nameAttribute] }} </strong>
            </div>
            <div class="lx-steps-description" v-if="kind === 'default'">
              <p class="lx-description">{{ item?.[descriptionAttribute] }}</p>
            </div>
          </div>
          <template #panel>
            <div v-for="item in items" :key="item[idAttribute]">
              <lx-icon
                v-show="(busy && item[stateAttribute] !== 'current') || !busy"
                customClass="lx-steps-icon"
                :value="
                  (() => {
                    switch (item[stateAttribute]) {
                      case 'current':
                        return 'incomplete';
                      case 'invalid':
                        return 'invalid';
                      case 'complete':
                        return 'notification-success';
                      default:
                        return 'unselected';
                    }
                  })()
                "
              />
              <div class="lx-steps-icon" v-if="busy && item[stateAttribute] === 'current'">
                <lx-loader :loading="true" size="s" />
              </div>

              <div>
                <div class="lx-steps-label">
                  <strong>{{ item?.[nameAttribute] }} </strong>
                </div>
                <div class="lx-steps-description">
                  <p class="lx-description">{{ item?.[descriptionAttribute] }}</p>
                </div>
              </div>
            </div>
          </template>
        </LxInfoWrapper>
      </div>
    </div>
  </div>
</template>
