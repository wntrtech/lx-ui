export default {
  state: () => ({
    isOpen: false,
    confirmDialogState: {},
  }),
  actions: {
    push(title, message, primaryLabel, secondaryLabel, primaryCallback, secondaryCallback) {
      this.confirmDialogState = {
        title,
        message,
        primaryLabel,
        secondaryLabel,
        primaryCallback,
        secondaryCallback,
      };
      this.isOpen = true;
    },
    pushSimple(title, message, primaryCallback) {
      this.push(title, message, null, null, primaryCallback, () => this.confirm());
    },
    async confirm(callback) {
      if (callback) {
        await callback();
      }
      this.isOpen = false;
    },
  },
};
