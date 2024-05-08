import { generateUUID } from '@/utils/stringUtils';

const AUTO_CLOSE_SECONDS = 7;

function getUid() {
  return generateUUID();
}

export default {
  state: () => ({
    notifications: [],
  }),
  actions: {
    push(type, title, subtitle, autoCloseSeconds) {
      this.notifications.push({
        uid: getUid(),
        type,
        title,
        subtitle,
        autoCloseSeconds,
      });
    },
    pushSuccess(title, subtitle = null, autoCloseSeconds = AUTO_CLOSE_SECONDS) {
      this.push('success', title, subtitle, autoCloseSeconds);
    },
    pushError(title, subtitle = null, autoCloseSeconds = AUTO_CLOSE_SECONDS) {
      this.push('error', title, subtitle, autoCloseSeconds);
    },
    pushWarning(title, subtitle = null, autoCloseSeconds = AUTO_CLOSE_SECONDS) {
      this.push('warning', title, subtitle, autoCloseSeconds);
    },
    pushInfo(title, subtitle = null, autoCloseSeconds = AUTO_CLOSE_SECONDS) {
      this.push('info', title, subtitle, autoCloseSeconds);
    },
  },
};
