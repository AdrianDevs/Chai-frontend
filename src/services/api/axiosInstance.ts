import axios from 'axios';
import { getHeaders } from './utils/headers';
import transformKeysToCamelCase from './utils/caseConverter';
import type { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL as string;

// interface CustomAxiosRequestConfig extends AxiosRequestConfig {
//   _retry?: boolean;
// }

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: getHeaders(),
});

// Request interceptor to add headers
axiosInstance.interceptors.request.use((config) => {
  // console.log('Axios request interceptor:', config);
  Object.assign(config.headers, getHeaders());
  return config;
});

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      const data = response.data as
        | Record<string, unknown>
        | Array<Record<string, unknown>>;
      response.data = transformKeysToCamelCase(data);
    }
    return response;
  },
  async (error) => {
    const axiosError = error as AxiosError;

    // console.log('Axios response interceptor error:', axiosError);

    // TODO: Handle token refresh

    // const originalRequest = axiosError.config as CustomAxiosRequestConfig;

    // If the error is due to an expired token (401 Unauthorized)
    // if (axiosError.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     const newToken = await refreshAccessToken(); // Refresh the token
    //     localStorage.setItem('accessToken', newToken);
    //     if (!originalRequest.headers) {
    //       originalRequest.headers = {};
    //     }
    //     originalRequest.headers.Authorization = `Bearer ${newToken}`;
    //     return axiosInstance(originalRequest); // Retry the original request
    //   } catch (refreshError) {
    //     const refreshAxiosError = refreshError as AxiosError;

    //     console.error('Failed to refresh token:', refreshAxiosError);
    //     // Redirect to login or handle logout
    //     window.location.href = '/login';
    //     return Promise.reject(refreshAxiosError);
    //   }
    // }

    return Promise.reject(axiosError);
  }
);

export default axiosInstance;
