export default {
  state: () => ({
    isOpen: false,
    confirmDialogState: {},
  }),
  actions: {
    /**
     * Used for pushing dismissible confirmation dialog.
     *
     *
     * @param {string} title
     * @param {string} message
     * @param {string} primaryLabel
     * @param {string} [secondaryLabel]
     * @param {Function} [primaryCallback]
     * @param {Function} [secondaryCallback]
     * @param {boolean} [escEnabled=true] - Defaults to true.
     * @param {boolean|null} [primaryBusy=null] - Primary button busy: `true` = busy, `false` = not busy, `null` = use fallback `confirmPrimaryButtonBusy`. Defaults to null.
     * @param {boolean|null} [secondaryBusy=null] - Secondary button busy: `true` = busy, `false` = not busy, `null` = use fallback `confirmSecondaryButtonBusy`. Defaults to null.
     * @param {Function|null} [closeCallback=null] - Callback invoked when the modal closes (close icon, backdrop, Esc); if null, nothing runs. May be async. Defaults to null.
     */
    push(
      title,
      message,
      primaryLabel,
      secondaryLabel,
      primaryCallback,
      secondaryCallback,
      escEnabled = true,
      primaryBusy = null,
      secondaryBusy = null,
      closeCallback = null
    ) {
      this.confirmDialogState = {
        title,
        message,
        primaryLabel,
        secondaryLabel,
        primaryCallback,
        secondaryCallback,
        escEnabled,
        primaryBusy,
        secondaryBusy,
        closeCallback,
      };
      this.isOpen = true;
    },
    /**
     * Creates a dismissible confirmation dialog:
     * @param {string} title
     * @param {string} message
     * @param {Function} primaryCallback - may be async
     */
    pushSimple(title, message, primaryCallback) {
      this.push(title, message, null, null, primaryCallback, () => this.confirm());
    },
    /**
     * forcePush - For backward compatibility / edge-cases only.
     * Creates a non-dismissible confirmation dialog:
     * - disableClosing = true (no close icon)
     * @deprecated Consider using standard `push()` method for new implementations unless non-dismissible behavior is specifically required.
     * @param {string} title
     * @param {string} message
     * @param {string} primaryLabel
     * @param {string} [secondaryLabel]
     * @param {Function} [primaryCallback]
     * @param {Function} [secondaryCallback]
     * @param {boolean} [escEnabled=true] - Defaults to true.
     * @param {boolean|null} [primaryBusy=null] - Primary button busy: `true` = busy, `false` = not busy, `null` = use fallback `confirmPrimaryButtonBusy`. Defaults to null.
     * @param {boolean|null} [secondaryBusy=null] - Secondary button busy: `true` = busy, `false` = not busy, `null` = use fallback `confirmSecondaryButtonBusy`. Defaults to null.
     * @param {Function|null} [closeCallback=null] - Callback invoked when the modal closes (close icon, backdrop, Esc); if null, nothing runs. May be async. Defaults to null.
     */
    forcePush(
      title,
      message,
      primaryLabel,
      secondaryLabel,
      primaryCallback,
      secondaryCallback,
      escEnabled = true,
      primaryBusy = null,
      secondaryBusy = null,
      closeCallback = null
    ) {
      this.confirmDialogState = {
        title,
        message,
        primaryLabel,
        secondaryLabel,
        primaryCallback,
        secondaryCallback,
        escEnabled,
        primaryBusy,
        secondaryBusy,
        closeCallback,
        disableClosing: true,
      };
      this.isOpen = true;
    },
    /**
     * pushSimpleForce - For backward compatibility / edge-cases only.
     * Creates a non-dismissible confirmation dialog:
     * - disableClosing = true (no close icon)
     *
     * @deprecated Consider using standard `push()` method for new implementations unless non-dismissible behavior is specifically required.
     *
     * @param {string} title
     * @param {string} message
     * @param {Function} primaryCallback - may be async
     */
    pushSimpleForce(title, message, primaryCallback) {
      this.forcePush(title, message, null, null, primaryCallback, () => this.confirm());
    },
    async confirm(callback) {
      if (callback) {
        await callback();
      }
      this.isOpen = false;
    },
  },
};
