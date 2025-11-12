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
     * @param {string|null} [kind=null] - The kind of confirmation dialog. Defaults to null.
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
      closeCallback = null,
      kind = null
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
        kind,
      };
      this.isOpen = true;
    },
    /**
     * Creates a dismissible confirmation dialog:
     * @param {string} title
     * @param {string} message
     * @param {Function} primaryCallback - may be async
     * @param {string|null} [kind=null] - The kind of confirmation dialog. Defaults to null.
     */
    pushSimple(title, message, primaryCallback, kind = null) {
      this.push(
        title,
        message,
        null,
        null,
        primaryCallback,
        () => this.confirm(),
        true,
        null,
        null,
        null,
        kind
      );
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
     * @param {string|null} [kind=null] - The kind of confirmation dialog. Defaults to null.
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
      closeCallback = null,
      kind = null
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
        kind,
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
     * @param {string|null} [kind=null] - The kind of confirmation dialog. Defaults to null.
     */
    pushSimpleForce(title, message, primaryCallback, kind = null) {
      this.forcePush(
        title,
        message,
        null,
        null,
        primaryCallback,
        () => this.confirm(),
        true,
        null,
        null,
        null,
        kind
      );
    },
    async confirm(callback) {
      if (callback) {
        await callback();
      }
      this.isOpen = false;
    },
  },
};
