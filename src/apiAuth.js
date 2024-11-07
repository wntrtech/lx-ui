import axios, { AxiosError, HttpStatusCode } from 'axios';
import { lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';

function unauthorizedResp() {
  return Promise.reject(
    new AxiosError('no token', null, null, null, {
      status: HttpStatusCode.Unauthorized,
      data: null,
      statusText: null,
      headers: null,
      config: null,
    })
  );
}

/**
 * Clear the session storage and reload the page on unauthorized responses
 * @param {import('axios').AxiosError} error
 */
export async function unauthorizedInterceptor(error) {
  if (!error.response && error?.code === 'ERR_NETWORK') {
    return Promise.reject(error);
  }
  const { status } = error.response;

  if (status === HttpStatusCode.Unauthorized) {
    try {
      sessionStorage.clear();
    } catch (e) {
      lxDevUtils.logError(`${e.name}: ${e.message}`, useLx().getGlobals().environment);
    }
    window.location.reload();
  }

  return Promise.reject(error);
}

/**
 * Create an axios instance with the given authUrl and sessionKey
 * @param {string} authUrl - The URL to use for authentication
 * @param {string} sessionKey - The key to use for storing the session
 * @param {Object} [options] - Additional options to pass to axios.create
 * @param {boolean} [options.allowAnonymous] - Allow anonymous requests. Defaults to false.
 */
export default (authUrl, sessionKey, options = {}) => {
  const key = sessionStorage.getItem(sessionKey);
  const { allowAnonymous = false } = options;
  if (!key && !allowAnonymous) {
    return {
      get: unauthorizedResp,
      post: unauthorizedResp,
      put: unauthorizedResp,
      patch: unauthorizedResp,
      delete: unauthorizedResp,
    };
  }
  const http = axios.create({
    baseURL: authUrl,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
  });

  http.interceptors.response.use(null, unauthorizedInterceptor);

  return http;
};
