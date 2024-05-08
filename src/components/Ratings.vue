<script setup lang="ts">
import { computed, ref } from 'vue';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxIcon from '@/components/Icon.vue';

const emits = defineEmits(['update:modelValue']);

const props = defineProps({
  mode: { type: String, default: 'edit' },
  modelValue: { type: Number, default: 0 },
  kind: { type: String, default: '5stars' },
  variant: { type: String, default: 'default' }, // 'default' or 'colorful'
  texts: {
    type: Object,
    default: () => ({
      label: 'Vērtējums',
      star1: 'Ļoti slikti',
      star2: 'Slikti',
      star3: 'Gandrīz labi',
      star4: 'Labi',
      star5: 'Izcili',
    }),
  },
});

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const valueDecomposition = computed(() => {
  if (props.kind === '5stars') {
    const res = [];
    const count = Math.floor(model.value);
    let notFilled = 5 - count;
    const decimal = model.value - count;
    for (let i = 0; i < count; i += 1) {
      res.push('star-filled');
    }
    if (props.mode === 'read') {
      if (decimal >= 0.5) {
        res.push('star-half');
        notFilled -= 1;
      }
    }
    for (let i = 0; i < notFilled; i += 1) {
      res.push('star');
    }
    return res;
  }
  return [];
});

const valueDescription = computed(() => {
  if (props.kind === '5stars') {
    if (model.value >= 5.0) return props.texts.star5;
    if (model.value >= 4.0) return props.texts.star4;
    if (model.value >= 3.0) return props.texts.star3;
    if (model.value >= 2.0) return props.texts.star2;
    if (model.value >= 1.0) return props.texts.star1;
  }
  return '';
});
const valueClass = computed(() => {
  if (props.kind === '5stars') {
    if (model.value >= 5.0) return 'lx-category-green';
    if (model.value >= 4.0) return 'lx-category-orange';
    if (model.value >= 3.0) return 'lx-category-orange';
    if (model.value >= 2.0) return 'lx-category-red';
    if (model.value >= 1.0) return 'lx-category-red';
  }
  return '';
});

function setValue(value) {
  if (props.mode === 'edit') {
    if (model.value !== value) {
      model.value = value;
    } else {
      model.value = null;
    }
  }
}

const hoveredValue = ref(null);
function hover(value) {
  if (props.mode === 'edit') {
    hoveredValue.value = value;
  }
}

function reset() {
  if (props.mode === 'edit') {
    hoveredValue.value = null;
  }
}
</script>
<template>
  <lx-info-wrapper>
    <div
      class="lx-ratings"
      :class="[
        { 'lx-read-only': mode === 'read' },
        { 'lx-select-1': hoveredValue === 1 },
        { 'lx-select-2': hoveredValue === 2 },
        { 'lx-select-3': hoveredValue === 3 },
        { 'lx-select-4': hoveredValue === 4 },
        { 'lx-select-5': hoveredValue === 5 },
        { 'lx-colorful': variant === 'colorful' },
      ]"
      v-if="!(mode === 'read' && !model)"
    >
      <div class="lx-star-1" :class="[{ 'lx-selected': valueDecomposition[0] !== 'star' }]">
        <lx-icon
          :value="valueDecomposition[0]"
          :customClass="valueClass"
          @click="setValue(1)"
          @mouseover="hover(1)"
          @mouseleave="reset()"
        />
      </div>
      <div class="lx-star-2" :class="[{ 'lx-selected': valueDecomposition[1] !== 'star' }]">
        <lx-icon
          :value="valueDecomposition[1]"
          :customClass="valueClass"
          @click="setValue(2)"
          @mouseover="hover(2)"
          @mouseleave="reset()"
        />
      </div>
      <div class="lx-star-3" :class="[{ 'lx-selected': valueDecomposition[2] !== 'star' }]">
        <lx-icon
          :value="valueDecomposition[2]"
          :customClass="valueClass"
          @click="setValue(3)"
          @mouseover="hover(3)"
          @mouseleave="reset()"
        />
      </div>
      <div class="lx-star-4" :class="[{ 'lx-selected': valueDecomposition[3] !== 'star' }]">
        <lx-icon
          :value="valueDecomposition[3]"
          :customClass="valueClass"
          @click="setValue(4)"
          @mouseover="hover(4)"
          @mouseleave="reset()"
        />
      </div>
      <div class="lx-star-5" :class="[{ 'lx-selected': valueDecomposition[4] !== 'star' }]">
        <lx-icon
          :value="valueDecomposition[4]"
          :customClass="valueClass"
          @click="setValue(5)"
          @mouseover="hover(5)"
          @mouseleave="reset()"
        />
      </div>
    </div>
    <div class="lx-ratings" v-else>
      <p class="lx-data">—</p>
    </div>
    <template #panel>
      <div class="lx-row">
        <label>{{ props.texts.label }}</label>
        <p v-if="model" class="lx-data">
          <strong>{{ model.toString() }}</strong
          ><span class="lx-secondary"> / 5:</span> {{ valueDescription }}
        </p>
        <p v-else class="lx-data">—</p>
      </div>
    </template>
  </lx-info-wrapper>
</template>
