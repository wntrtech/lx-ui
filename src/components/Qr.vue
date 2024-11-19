<script setup>
import { computed } from 'vue';
import { QrcodeSvg } from 'qrcode.vue';
import { generateUUID } from '@/utils/stringUtils';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  value: { type: String, default: '' },
  size: { type: String, default: 's' }, // s, m, l, xl
});

const map = {
  s: 'L',
  m: 'M',
  l: 'Q',
  xl: 'H',
};

const sizeComp = computed(() => map?.[props.size] || 'L');
</script>

<template>
  <div class="lx-qr-wrapper" :id="id">
    <QrcodeSvg :value="value" :level="sizeComp" />
  </div>
</template>
