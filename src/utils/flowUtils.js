import { hasScope, hasScopeAtLeast, hasAnyScopeWithNamespace } from '@/utils/permissionUtils';
import { trackNavigationState, resetNavigationTracking } from '@/utils/navigationState';
import { isAppVersionChanged } from '@/utils/versionCheckUtils';

const has = (needed, value) => {
  if (!needed) {
    return true;
  }
  if (!value) {
    return false;
  }
  let against = needed;
  if (!Array.isArray(against)) {
    against = [needed];
  }
  let values = value;
  if (!Array.isArray(values)) {
    values = [value];
  }
  return against.some((a) => values.some((v) => a === v));
};
const hasPermission = (needed, scope) => {
  if (!needed) {
    return true;
  }
  if (!scope) {
    return false;
  }
  let against = needed;
  if (!Array.isArray(against)) {
    against = [needed];
  }
  let scopes = scope;
  if (!Array.isArray(scopes)) {
    scopes = [scope];
  }
  return against.some((name) => {
    if (name[name.length - 1] === '*') {
      return hasAnyScopeWithNamespace(scopes, name.slice(0, -1));
    }
    if (name.includes(':')) {
      const [n, level] = name.split(':');
      return hasScopeAtLeast(scopes, n, level);
    }
    return hasScope(scopes, name);
  });
};
const validatorMsgRegex =
  /(Key: '(\S+)\.(\S+)'\s+)?Error:.*(for '(?<field>\S+)').*('(?<tag>\S+)' tag)/;
const errMsgRegex = /\[(?<code>.*)\]\s*(?<message>.*)/;
const validationMsg = {
  max: 'validation.max',
  min: 'validation.min',
  required: 'validation.required',
  numeric: 'validation.numeric',
};
const logError = () => {
  // TODO: log error
};
const extractValidatorMessage = (msg) => {
  let match = msg.match(validatorMsgRegex);
  if (match) {
    let { field } = match.groups;
    if (field) {
      field = field.substr(0, 1).toLowerCase() + field.substr(1);
    }
    const { tag } = match.groups;
    return { field, message: validationMsg[tag] || 'validation.unknown' };
  }
  match = msg.match(errMsgRegex);
  if (match) {
    const { code, message } = match.groups;
    return { code, message };
  }
  return null;
};
const getError = (error) => {
  const { response, code } = error;
  if (code === 'ECONNABORTED') {
    return { status: 499, data: null };
  }
  if (typeof response === 'undefined') {
    // @ts-ignore
    logError(error);
    return { status: 500, data: null };
  }
  const { request, ...errorObject } = response;
  if (errorObject.status === 422) {
    const { data } = errorObject;
    if (data) {
      const validatorMessage = extractValidatorMessage(data);
      if (validatorMessage && (validatorMessage.field || validatorMessage.code)) {
        return { status: 422, data: validatorMessage };
      }
    }
  }

  return {
    status: errorObject.status || 500,
    data: errorObject.data || null,
  };
};

function handleAnonymousRoute(to, from, next, successCallbackFn) {
  const allowAnonymous = to.matched.some((record) => record.meta.anonymous);
  if (allowAnonymous) {
    if (typeof successCallbackFn === 'function') {
      successCallbackFn(to, from, next);
    } else {
      next();
    }
    return true;
  }
  return false;
}

async function ensureSession(authStore, appStore, next) {
  // Checking if session is ok
  if (authStore.session.st === null) {
    try {
      await authStore.fetchSession();
    } catch (err) {
      const e = getError(err);
      if ([401, 403, 404].includes(e.status)) {
        authStore.$reset();
      } else {
        appStore.setError(e?.data);
        next();
        return false;
      }
    }
  }
  return true;
}

function checkAuthorizationAndScope(to, authStore) {
  // Not authorized when met the first unmatched state configuration (going bottom to top in view hierarchy)
  const reversedMatch = [...to.matched].reverse();

  // Authorized here doesn't mean "has session", it means "allowed to see this route based on session state"
  const isAuthorized = reversedMatch.every((record) =>
    has(record.meta.state, authStore.session.st)
  );

  const withScope = to.matched.filter((r) => r.meta.scope);
  const hasScopeInternal =
    withScope.length === 0 ||
    withScope.some((record) => hasPermission(record.meta.scope, authStore.session.scope));

  return { isAuthorized, hasScopeInternal };
}

function redirectTo(next, routeName, path) {
  next({
    params: { pathMatch: path.substring(1) },
    query: { returnPath: path },
    replace: true,
    name: routeName,
  });
}

/**
 * @param { import('vue-router').RouteLocationNormalized } to
 * @param { import('vue-router').RouteLocationNormalized } from
 * @param { import('vue-router').NavigationGuardNext} next
 * @param { any } appStore - Pinia LX store
 * @param { any } authStore - Pinia LX store
 * @param {(to: import('vue-router').RouteLocationNormalized, from: import('vue-router').RouteLocationNormalized, next: import('vue-router').NavigationGuardNext) => void } [successCallbackFn] - optional callback function to be called after authStore, returns true if navigation should continue
 */
export async function beforeEach(to, from, next, appStore, authStore, successCallbackFn = null) {
  appStore.$reset();
  appStore.startNavigating();

  // Track navigation state for version checking
  trackNavigationState(to);

  // Check for version change on route change if we're navigating from a known route
  if (from.name) {
    await isAppVersionChanged(undefined);
  }

  // Handle anonymous routes
  if (handleAnonymousRoute(to, from, next, successCallbackFn)) {
    return;
  }

  // Ensure session is valid
  if (!(await ensureSession(authStore, appStore, next))) {
    return;
  }

  // Check authorization and scope
  const { isAuthorized, hasScopeInternal } = checkAuthorizationAndScope(to, authStore);

  if (!isAuthorized) {
    redirectTo(next, 'notAuthorized', to.path);
    return;
  }

  // If authorized, but route requires scopes:
  if (isAuthorized && hasScopeInternal) {
    if (typeof successCallbackFn === 'function') {
      successCallbackFn(to, from, next);
      return;
    }
    next();
    return;
  }

  if (isAuthorized && !hasScopeInternal) {
    redirectTo(next, 'forbidden', to.path);
    return;
  }

  // Default error case
  redirectTo(next, 'error', to.path);
}

export async function afterEach(to, from, appStore, viewStore) {
  if (viewStore) viewStore.$reset();
  appStore.stopNavigating();

  // Reset navigation tracking after route change
  resetNavigationTracking();
}

// TODO: implement better solution to unfocus (blur) focused element (Current solution is potentially risky)
// Note: Now browsers save the last focused element, and using just blur() on it will not work
export function removeFocus() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const trap = document.createElement('div');
  trap.tabIndex = 0;
  trap.style.position = 'fixed';
  trap.style.width = '1px';
  trap.style.height = '1px';
  trap.style.opacity = '0';

  document.body.appendChild(trap);
  trap.focus();

  requestAnimationFrame(() => {
    document.body.removeChild(trap);
  });
}
