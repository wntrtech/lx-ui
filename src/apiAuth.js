import axios from 'axios';

export default (authUrl, sessionKey) => {
  const key = sessionStorage.getItem(sessionKey);
  const http = axios.create({
    baseURL: authUrl,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
  });

  http.interceptors.response.use(
    (response) => {
      window.data.lastReqTime = new Date();
      return response;
    },
    (error) => Promise.reject(error)
  );

  return http;
};
