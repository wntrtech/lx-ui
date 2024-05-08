export default {
  state: () => ({
    error: null,
    showError: false,
    isNavigating: false,
  }),
  actions: {
    setError(err) {
      this.error = err;
      this.showError = true;
    },
    startNavigating() {
      this.isNavigating = true;
    },
    stopNavigating() {
      this.isNavigating = false;
    },
  },
};
