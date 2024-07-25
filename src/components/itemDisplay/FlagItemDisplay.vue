<script setup lang="ts">
import LxFlag from '@/components/Flag.vue';
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Object,
    default: null,
  },
  idAttribute: {
    type: [Array, String],
    default: 'id',
  },
  nameAttribute: {
    type: String,
    default: 'name',
  },
});

const idAttribute = computed(() => {
  if (Array.isArray(props.idAttribute)) {
    throw new Error('idAttributeName cannot be an array');
  }
  return props.idAttribute;
});

function attributeExists(value, attribute) {
  return value[attribute] && value[attribute].trim() !== '';
}
</script>
<template>
  <div class="lx-item-display">
    <template v-if="attributeExists(value, idAttribute) || attributeExists(value, nameAttribute)">
      <LxFlag v-if="attributeExists(value, idAttribute)" :value="value[idAttribute]" size="small" />
      <p class="lx-data" v-if="attributeExists(value, nameAttribute)">
        {{ value[nameAttribute] }}
      </p>
    </template>
    <span class="empty-flag-value" v-else>—</span>
  </div>
</template>
