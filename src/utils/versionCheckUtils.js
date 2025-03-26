import axios from 'axios';
import useLx from '@/hooks/useLx';
import { logError } from '@/utils/devUtils';

let notificationShown = false; // Prevent duplicate notifications

// Function to check the version and handle actions
async function checkVersion(notify, notifyText = undefined, basePath = '/') {
  try {
    // Remove trailing slashes if happens
    const normalizedBasePath = basePath.replace(/\/$/, '');

    const resp = await axios.get(
      `${window.location.origin}${normalizedBasePath}/version.json?anti-cache=${Date.now()}`
    );

    if (resp.data?.version) {
      const isVersionChanged = window.config.version !== resp.data.version;

      if (isVersionChanged) {
        if (
          sessionStorage.getItem('is_navigating') === 'true' &&
          sessionStorage.getItem('reload_handled') === 'false'
        ) {
          sessionStorage.setItem('version_update_notification', 'true');
          sessionStorage.setItem('reload_handled', 'true');

          // Perform a hard refresh
          window.location.reload();
        } else if (!notificationShown) {
          // Default notification text if no text where provided
          const defaultNotifyText = 'Ir pieejama jauna lietotnes versija, lūdzu pārlādējiet lapu!';
          // Show notification for manual refresh if idle or work in progress inside current route
          notify.pushWarning(notifyText || defaultNotifyText);
          notificationShown = true;
        }
      }
    }
  } catch (e) {
    logError(`Error checking version: ${e}`, useLx().getGlobals()?.environment);
  }
}

/**
 * Monitor version changes and handle navigation.
 * @important it works only if `lxVitePortalVersionPlugin` is defined in plugins inside `vite.config.mjs` !
 * @experimental This functionality is experimental and may change or be removed in future.
 *
 * @example
 * ```js
 * // In MainLayout.vue
 * // Start monitoring for version changes every 10 seconds
 * // Uses the default notification text and checks `version.json` in the base path `/`
 * lxVersionCheckUtils.isAppVersionChanged(notify, undefined, true, 10000);
 *
 * // In event.js track adn reset navigation state
 * export default (router) => {
 *   router.beforeEach(async (to, from, next) => {
 *     const authStore = useAuthStore();
 *     const appStore = useAppStore();
 *     await lxFlowUtils.beforeEach(to, from, next, appStore, authStore);
 *
 *     // Track navigation state for version checking
 *     lxNavigationStateUtils.trackNavigationState(to);
 *   });
 *   router.afterEach(async (to, from) => {
 *     const appStore = useAppStore();
 *     await lxFlowUtils.afterEach(to, from, appStore);
 *
 *     // Reset navigation tracking after route change
 *     lxNavigationStateUtils.resetNavigationTracking();
 *   });
 * };
 */
export async function isAppVersionChanged(
  notify,
  notifyText = undefined,
  useInterval = false,
  intervalTime = 1800000,
  basePath = '/'
) {
  if (useInterval) {
    setInterval(async () => {
      await checkVersion(notify, notifyText, basePath);
    }, intervalTime);
  } else {
    await checkVersion(notify, notifyText, basePath);
  }
}

// Restore saved route after a hard refresh
export function restoreRouteAndNotify(router, notify, notifyText) {
  const savedRoute = sessionStorage.getItem('intended_route');
  const versionUpdateFlag = sessionStorage.getItem('version_update_notification');
  const reloadHandled = sessionStorage.getItem('reload_handled');

  const { environment } = useLx().getGlobals();

  if (reloadHandled === 'true') {
    // Reset the flag after the first load
    sessionStorage.setItem('reload_handled', 'false'); // Allow future reloads
  }

  if (versionUpdateFlag && savedRoute) {
    // Default notification text if no text where provided
    const defaultNotifyText = 'Lapas pārlādē tika veikta, jo ir pieejama jauna lietotnes versija!';
    notify.pushWarning(notifyText || defaultNotifyText);
    sessionStorage.removeItem('version_update_notification');

    const parsedRoute = JSON.parse(savedRoute);

    // Check if the route exists in the app's route definitions
    if (router.hasRoute(parsedRoute.name)) {
      router.replace(parsedRoute).catch((error) => {
        logError(`Failed to navigate to saved route: ${error}`, environment);
      });
      sessionStorage.setItem('reload_handled', 'true');
    }

    // Clear the saved route after restoration
    sessionStorage.removeItem('intended_route');
  }
}
