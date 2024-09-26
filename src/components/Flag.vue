<script setup lang="ts">
import CountryFlag from 'vue-country-flag-next';

defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'normal',
  },
  title: {
    type: String,
    default: '',
  },
});
</script>
<template>
  <div class="lx-flag">
    <country-flag :country="value" :size="size" :title="title" />
  </div>
</template>
