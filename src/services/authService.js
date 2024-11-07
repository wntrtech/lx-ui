import apiAuth from '@/apiAuth';

export default (authUrl, publicUrl, clientId, scope, authSessionKey) => ({
  authorize(authType = null, authClientId = null) {
    let url = `${authUrl}authorize?scope=${scope}&redirect_uri=${publicUrl}auth-done`;
    if (authType) {
      url += `&auth_type=${authType}`;
    }
    if (authClientId) {
      url += `&client_id=${authClientId}`;
    } else {
      url += `&client_id=${clientId}`;
    }
    window.location.href = url;
  },

  session() {
    return apiAuth(authUrl, authSessionKey).get('/api/1.0/session');
  },

  keepAlive() {
    return apiAuth(authUrl, authSessionKey).get('/api/1.0/session/keep-alive');
  },

  roles() {
    return apiAuth(authUrl, authSessionKey).get('/api/1.0/session/roles');
  },

  setRole(roleCode) {
    return apiAuth(authUrl, authSessionKey).patch('/api/1.0/session', { role: roleCode });
  },

  status() {
    return apiAuth(authUrl, authSessionKey).get('/api/1.0/session');
  },

  logout() {
    return apiAuth(authUrl, authSessionKey).delete('/api/1.0/session');
  },

  getSessionKey(oneTimeToken) {
    return apiAuth(authUrl, null, { allowAnonymous: true }).get(`/session/id?ott=${oneTimeToken}`);
  },
});
