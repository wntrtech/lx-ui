<script setup lang="ts">
import CountryFlag from 'vue-country-flag-next';
import { formatCountryCode } from '@/utils/formatUtils';
import useLx from '@/hooks/useLx';

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
  locale: {
    type: String,
    default: () => useLx().getGlobals()?.locale?.locale || 'lv',
  },
  meaningful: {
    type: Boolean,
    default: true,
  },
});
</script>
<template>
  <div
    class="lx-flag"
    :aria-label="title || formatCountryCode(value, locale)"
    role="img"
    :aria-hidden="!meaningful"
  >
    <country-flag
      :country="value"
      :size="size"
      :title="title || formatCountryCode(value, locale)"
    />
  </div>
</template>
