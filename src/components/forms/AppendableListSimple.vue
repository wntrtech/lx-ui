<script setup>
import { computed, onMounted } from 'vue';
import LxButton from '@/components/Button.vue';
import LxForm from '@/components/forms/Form.vue';

const props = defineProps({
  modelValue: { type: Array, default: null },
  readOnly: { type: Boolean, default: false },
  addButtonLabel: { type: String, default: 'Pievienot ierakstu' },
  columnCount: { type: Number, default: 1 },
  kind: { type: String, default: 'default' }, // default || compact
  requiredMode: { type: String, default: 'optional' }, // required || required-asterisk || optional
  canAddItems: { type: Boolean, default: true },
  texts: {
    type: Object,
    default: () => ({
      removeItem: 'Dzēst ierakstu',
    }),
  },
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

function removeItem(index) {
  model.value.splice(index, 1);
}
function addItem() {
  let res = [];
  if (props.modelValue) {
    res = [...model.value];
    res.push('');
  } else res.push('');
  model.value = res;
}

onMounted(() => {
  model.value = props.modelValue;
});
</script>
<template>
  <div
    class="lx-appendable-list lx-appendable-list-simple"
    :class="[{ 'lx-appendable-list-compact': kind === 'compact' }]"
  >
    <div v-for="(item, index) in model" :key="index" class="lx-appendable-list-item">
      <LxForm kind="stripped" :columnCount="columnCount" :required-mode="props.requiredMode">
        <slot name="customItem" v-bind="{ item, index }" />
      </LxForm>

      <div class="appendable-list-remove-button-wrapper">
        <div class="appendable-list-remove">
          <LxButton
            v-if="!readOnly"
            icon="remove-item"
            variant="icon-only"
            :label="texts.removeItem"
            :destructive="true"
            kind="ghost"
            @click="removeItem(index)"
          />
        </div>
      </div>
    </div>
    <div>
      <LxButton
        v-if="!readOnly && canAddItems"
        kind="tertiary"
        :label="addButtonLabel"
        icon="add-item"
        @click="addItem"
      />
    </div>
  </div>
</template>
