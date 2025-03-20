<script setup lang="ts">
import { ref, watch } from 'vue';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';

const props = defineProps({
  alerts: {
    type: Array,
    default: () => [],
  },
  nextAlertTitle: {
    type: String,
    default: 'Nākamais paziņojums',
  },
  previousAlertTitle: {
    type: String,
    default: 'Iepriekšējais paziņojums',
  },
});

const message = ref();

watch(
  () => props.alerts?.length,
  () => {
    [message.value] = props.alerts;
  },
  { immediate: true }
);

function changeCurrentAlert(direction) {
  const index = props.alerts.findIndex((alert) => alert.id === message.value.id);
  if (direction === 'next') {
    if (index === props.alerts.length - 1) {
      [message.value] = props.alerts;
    } else {
      [message.value] = props.alerts.slice(index + 1, index + 2);
    }
  }
  if (direction === 'previous') {
    if (index === 0) {
      [message.value] = props.alerts.slice(-1);
    } else {
      [message.value] = props.alerts.slice(index - 1, index);
    }
  }
}

const iconMap = {
  success: 'notification-success',
  warning: 'notification-warning',
  error: 'notification-error',
  info: 'notification-info',
};
const widgetMap = {
  success: 'success-widget',
  warning: 'warning-widget',
  error: 'error-widget',
  info: 'info-widget',
};

function pickIcon(level) {
  return iconMap[level] || iconMap.info;
}
function pickwidget(level) {
  return widgetMap[level] || widgetMap.info;
}
</script>

<template>
  <div class="lx-cover-alert" :class="pickwidget(message.level)">
    <div class="lx-cover-alert-content">
      <div class="lx-cover-alert-left-group">
        <LxIcon
          v-if="message?.level"
          customClass="lx-cover-alert-icon"
          :value="pickIcon(message.level)"
        />
        <div class="lx-alert-texts">
          <p class="lx-data">{{ message.name }}</p>
          <p class="lx-description">{{ message.description }}</p>
        </div>
      </div>
      <div class="lx-cover-alert-right-group" v-if="alerts.length > 1">
        <LxButton
          :label="previousAlertTitle"
          @click="changeCurrentAlert('previous')"
          variant="icon-only"
          icon="chevron-up"
          kind="ghost"
        />
        <LxButton
          :label="nextAlertTitle"
          @click="changeCurrentAlert('next')"
          variant="icon-only"
          icon="chevron-down"
          kind="ghost"
        />
      </div>
    </div>
  </div>
</template>
