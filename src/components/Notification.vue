<script setup>
import { computed, watch } from 'vue';
import LxIcon from '@/components/Icon.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const deleteNotification = (uid) => {
  model.value = model.value.filter((n) => n.uid !== uid);
};

const displayNotification = (notification) => {
  if (notification && notification.autoCloseSeconds) {
    setTimeout(() => {
      deleteNotification(notification.uid);
    }, notification.autoCloseSeconds * 1000);
  }
};

function getIcon(type) {
  let ret;
  switch (type) {
    case 'warning':
      ret = 'notification-warning';
      break;
    case 'error':
      ret = 'notification-error';
      break;
    case 'success':
      ret = 'notification-success';
      break;
    case 'info':
    default:
      ret = 'notification-info';
      break;
  }
  return ret;
}

watch(
  () => model.value.length,
  () => {
    model.value.forEach((notification) => {
      displayNotification(notification);
    });
  },
  { immediate: true }
);
</script>

<template>
  <ul class="lx-notifications-list">
    <transition-group name="slide-left">
      <li
        role="alert"
        :id="`notification-${notification.uid}`"
        v-for="notification in model"
        :key="notification.uid"
        class="lx-notification"
        :class="[
          { 'lx-notification-info': notification.type === 'info' },
          { 'lx-notification-success': notification.type === 'success' },
          { 'lx-notification-warning': notification.type === 'warning' },
          { 'lx-notification-error': notification.type === 'error' },
        ]"
        @click="deleteNotification(notification.uid)"
        v-on:keyup.enter="deleteNotification(notification.uid)"
        v-on:keyup.space="deleteNotification(notification.uid)"
      >
        <div class="lx-main">
          <LxIcon :value="getIcon(notification.type)" />
          <div>
            <p class="lx-title">{{ notification.title }}</p>
            <p class="lx-subtitle" v-if="notification.subtitle">{{ notification.subtitle }}</p>
          </div>
        </div>
      </li>
    </transition-group>
  </ul>
</template>
