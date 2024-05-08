<script setup lang="ts">
import { computed, ref } from 'vue';
import LxButton from '@/components/Button.vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: null },
  description: { type: String, default: null },
  newLabel: { type: String, default: '' },
  placeHolder: { type: String, default: '' },
  mode: { type: String, default: 'edit' }, // 'read' or 'edit'
  level: { type: Number, default: 1 },
  dragAndDrop: { type: Boolean, default: false },
  invalidItems: { type: Array, default: () => [] },
  idAttribute: { type: String, default: 'id' },
  nameAttribute: { type: String, default: 'name' },
  descriptionAttribute: { type: String, default: null },
  texts: { type: Object, default: () => ({ add: 'Pievienot' }) },
});

const emits = defineEmits(['update:modelValue', 'newItemAdded', 'selectionChanged']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const activeItemCode = ref('');

const dragActive = ref(false);
const dragTarget = ref();

function dragStart(e) {
  dragActive.value = true;
  dragTarget.value = e.target;
}

function dragEnd(e) {
  e.preventDefault();
  const elements = dragTarget.value.parentElement?.children;
  for (let i = 0; i < elements.length; i++) {
    const id = elements[i].id.substring(4);
    // eslint-disable-next-line eqeqeq // Code/id can be guid or number, need type agnostic comparison here.
    model.value.find((o) => id == (o.code || o.id)).order = i;
  }
  model.value = model.value.filter(() => true); // Forcing an update on the model.
  dragTarget.value = null;
  dragActive.value = false;
}

function isBefore(el1, el2) {
  let cur;
  if (el2.parentNode === el1.parentNode) {
    for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
      if (cur === el2) return true;
    }
  }
  return false;
}

function dragOver(e) {
  e.preventDefault();
  if (isBefore(dragTarget.value, e.target)) {
    e.target.parentNode.insertBefore(dragTarget.value, e.target);
  } else {
    e.target.parentNode.insertBefore(dragTarget.value, e.target.nextSibling);
  }
}

function selectItem(code) {
  activeItemCode.value = code;
  emits('selectionChanged', code);
}

function addItem() {
  emits('newItemAdded');
}

function isItemValid(item) {
  let ret = true;

  props.invalidItems?.forEach((i) => {
    if (i?.toString() === item[props.idAttribute]?.toString()) {
      ret = false;
    }
  });

  return ret;
}
const navbar = ref(false);
function nav() {
  navbar.value = !navbar.value;
}
function navClose() {
  if (navbar.value) navbar.value = !navbar.value;
}

defineExpose({ selectItem });
</script>
<template>
  <div class="lx-master-detail" :class="[{ 'lx-collapsed': !navbar }]">
    <nav
      class="lx-master"
      :class="[
        { 'lx-sticky': level === 1 },
        { 'lx-sticky-2': level === 2 },
        { 'lx-sticky-3': level === 3 },
      ]"
      v-click-away="navClose"
    >
      <div class="label-item menu-btn">
        <LxButton variant="icon-only" icon="menu" @click="nav" kind="ghost" />
      </div>
      <ul @dragover.prevent @dragenter.prevent>
        <li v-if="label && !navbar" class="label-item-vertical">
          <span class="lx-invalid lx-primary">{{ label }}</span>
        </li>
        <li v-if="label" class="label-item">
          <span class="lx-invalid lx-primary">{{ label }}</span>
          <span class="lx-invalid lx-secondary">{{ description }}</span>
        </li>
        <li
          v-for="item in model"
          v-bind:key="item[idAttribute]"
          :id="`item${item[idAttribute]}`"
          @click="selectItem(item[idAttribute])"
          @keydown="selectItem(item[idAttribute])"
          :draggable="mode === 'edit' && props.dragAndDrop"
          @dragstart="dragStart"
          @dragend="dragEnd"
          @dragover="dragOver"
          :class="{
            'lx-selected': activeItemCode === item[idAttribute],
            'lx-invalid': !isItemValid(item),
          }"
          :title="item[nameAttribute] || placeHolder"
        >
          <div class="master-detail-item">
            <span>{{ item[nameAttribute] || placeHolder }}</span>
            <lx-icon v-show="isItemValid(item)" value="next" />
            <lx-icon
              v-show="!isItemValid(item)"
              customClass="lx-invalidation-icon"
              value="invalid"
            />
          </div>
          <p class="lx-secondary">{{ item[descriptionAttribute] }}</p>
        </li>
      </ul>
      <lx-button
        icon="add-item"
        kind="tertiary"
        v-if="mode === 'edit' || mode === 'admin'"
        :label="newLabel || texts.add"
        @click="addItem"
      />
    </nav>
    <div class="lx-detail">
      <slot />
    </div>
  </div>
</template>
