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
</script>
<template>
  <div class="lx-item-display" v-if="value">
    <LxFlag :value="value[idAttribute]" size="small" />
    <p div="lx-data">
      {{ value[nameAttribute] }}
    </p>
  </div>
</template>
