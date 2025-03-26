import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { AxiosError, HttpStatusCode } from 'axios';
import {
  hasScope,
  hasScopeRead,
  hasScopeWrite,
  hasScopeExport,
  hasScopeDelete,
} from '@/utils/permissionUtils';

/** @typedef {'authorized' | 'req_role' | 'req_agreement' | 'none'} SessionState */

/**
 * @param {{ (authUrl, publicUrl, clientId, scope, authSessionKey): {
 * keepAlive: () => Promise<any>;
 * login: () => Promise<any>;
 * logout: () => Promise<any>;
 * authorize: (authType: string, clientID: string) => Promise<any>;
 * setSessionKey: (key: string) => void;
 * removeSessionKey: () => void;
 * session: () => Promise<any>;
 * setRole: (role: string) => Promise<any>;
 *  hasPermission: (name: string) => boolean;
 * hasPermissionRead: (name: string) => boolean;
 * hasPermissionWrite: (name: string) => boolean;
 * hasPermissionExport: (name: string) => boolean;
 * hasPermissionDelete: (name: string) => boolean;
 * getSessionKey: (oneTimeToken: string) => Promise<string>;
 * roles: () => Promise<any>; } }} authService
 */
export default (
    authService,
    authUrl,
    publicUrl,
    clientId,
    scope,
    authSessionKey,
    useLocalStorage = false
  ) =>
  () => {
    const service = authService(authUrl, publicUrl, clientId, scope, authSessionKey);
    const storage = () => (useLocalStorage ? localStorage : sessionStorage);
    const initState = {
      active: false,
      family_name: null,
      given_name: null,
      code: null,
      org_id: null,
      org_name: null,
      sid: null,
      /** @type {SessionState} */
      st: null,
      scope: [],
      role: null,
      institution: null,
      secondsToLive: null,
      secondsToCountdown: null,
      isSessionExtendable: false,
      phone_number: null,
      email: null,
    };
    const returnPath = useStorage('returnPath', null, sessionStorage);
    const session = useStorage('lx-auth-session', { ...initState }, storage(), {
      deep: true,
      listenToStorageChanges: true,
    });
    const rolesState = ref({
      roles: [],
      initialized: false,
      loading: false,
    });

    const isAuthorized = computed(() => Boolean(session.value.st !== 'none' && session.value.st));

    /** Fill session from api response.
     * Do this for each value individually in order to trigger reactivity correctly
     * @param {typeof initState} resp
     */
    function fillSession(resp) {
      session.value.active = resp.active;
      session.value.family_name = resp.family_name;
      session.value.given_name = resp.given_name;
      session.value.code = resp.code;
      session.value.org_name = resp.org_name;
      session.value.sid = resp.sid;
      session.value.st = resp.st;
      session.value.scope = resp.scope;
      session.value.role = resp.role;
      session.value.institution = resp.institution;
      session.value.secondsToLive = resp.secondsToLive;
      session.value.secondsToCountdown = resp.secondsToCountdown;
      session.value.isSessionExtendable = resp.isSessionExtendable;
      session.value.org_id = resp.org_id;
      session.value.phone_number = resp.phone_number;
      session.value.email = resp.email;
    }

    async function setSessionKey(key) {
      sessionStorage.setItem(authSessionKey, key);
    }
    async function removeSessionKey() {
      sessionStorage.removeItem(authSessionKey);
    }

    async function getSessionKey() {
      return sessionStorage.getItem(authSessionKey);
    }

    async function clearReturnPath() {
      returnPath.value = null;
    }
    async function getReturnPath() {
      return returnPath.value;
    }

    function $reset() {
      session.value = { ...initState };
      removeSessionKey();
      clearReturnPath();
    }

    async function keepAlive() {
      try {
        const resp = await service.keepAlive();
        if (resp.status === 200) {
          fillSession(resp.data);
        }
      } catch (err) {
        // handle case when api call is aborted (e.g. user navigates to another page)
        if (AxiosError.ECONNABORTED === err?.code) {
          return;
        }
        if (err.response?.status === HttpStatusCode.Unauthorized) {
          $reset();
        }
        throw err;
      }
    }
    async function login(retPath = null, authType = null, clientID = null) {
      if (retPath) {
        returnPath.value = retPath;
      }
      return service.authorize(authType, clientID);
    }
    async function fetchSession() {
      try {
        if (!getSessionKey()) {
          return null;
        }
        const resp = await service.session();
        if (resp.status === 200) {
          fillSession(resp.data);
        }
      } catch (err) {
        // handle case when api call is aborted (e.g. user navigates to another page)
        if (AxiosError.ECONNABORTED === err?.code) {
          return null;
        }
        if (err.response?.status === HttpStatusCode.Unauthorized) {
          $reset();
        }
        throw err;
      }
      return session.value;
    }
    async function logout() {
      try {
        return await service.logout();
      } finally {
        [$reset, () => sessionStorage.clear(), () => storage().clear()].forEach((f) => {
          try {
            f();
          } catch {
            // try next function even if one fails
          }
        });
      }
    }

    async function loadRoles(force = false) {
      if (!force && (rolesState.value.initialized || rolesState.value.loading)) {
        return;
      }
      try {
        rolesState.value.loading = true;
        const resp = await service.roles();
        rolesState.value.roles = resp.data;
        rolesState.value.initialized = true;
      } catch (err) {
        return;
      } finally {
        rolesState.value.loading = false;
      }
    }

    async function setRole(role) {
      try {
        const result = await service.setRole(role);
        if (HttpStatusCode.Ok === result.status) {
          await fetchSession();
        }
      } catch (err) {
        if (err.response?.status === HttpStatusCode.NotModified) {
          await fetchSession();
        } else {
          throw err;
        }
      }
    }

    function hasPermission(name) {
      return hasScope(session.value?.scope, name);
    }
    function hasPermissionRead(name) {
      return hasScopeRead(session.value?.scope, name);
    }
    function hasPermissionWrite(name) {
      return hasScopeWrite(session.value?.scope, name);
    }
    function hasPermissionExport(name) {
      return hasScopeExport(session.value?.scope, name);
    }
    function hasPermissionDelete(name) {
      return hasScopeDelete(session.value?.scope, name);
    }

    function getSessionKeyFromOtt(oneTimeToken) {
      return service.getSessionKey(oneTimeToken);
    }

    // Returning reactive properties with unwrapped types in order to to support correct types definition in rollup declaration file
    return {
      /** @type {typeof initState} */
      // @ts-ignore
      session,
      /** @type {typeof Boolean} */
      // @ts-ignore
      showSessionEndCountdown: computed(
        () =>
          isAuthorized.value &&
          !session.value.isSessionExtendable &&
          session.value.secondsToLive &&
          session.value.secondsToLive < 60 * 5
      ),
      /** @type {typeof String} */
      // @ts-ignore
      fullName: computed(() => `${session.value.given_name} ${session.value.family_name}`),
      /** @type {typeof String} */
      // @ts-ignore
      roleName: computed(
        () => rolesState.value.roles.find((r) => r.code === session.value.role)?.name
      ),
      /** @type {typeof Boolean} */
      // @ts-ignore
      isAuthorized,
      fetchSession,
      keepAlive,
      login,
      logout,
      $reset,
      loadRoles,
      setRole,
      setSessionKey,
      removeSessionKey,
      getSessionKey: getSessionKeyFromOtt,
      hasPermission,
      hasPermissionRead,
      hasPermissionWrite,
      hasPermissionExport,
      hasPermissionDelete,
      clearReturnPath,
      getReturnPath,
      /** @type {import('vue').UnwrapRef<typeof rolesState>} */
      // @ts-ignore
      rolesState,
    };
  };
