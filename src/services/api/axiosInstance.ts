import axios from 'axios';
import { redirect } from '@tanstack/react-router';
import { getHeaders } from './utils/headers';
import transformKeysToCamelCase from './utils/caseConverter';
import {
  clearStoredUser,
  getStoredUser,
  updateStoredUser,
} from './utils/localStorage';
import API from './index';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL as string;

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: getHeaders(false),
});

// Request interceptor to add headers
axiosInstance.interceptors.request.use((config) => {
  const isTokenRefresh = config.url === '/auth/refresh-token';

  Object.assign(config.headers, getHeaders(isTokenRefresh));
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

    const originalRequest = axiosError.config as CustomAxiosRequestConfig;

    // If the error is due to an expired token (401 Unauthorized)
    if (
      axiosError.response?.status === 401 &&
      originalRequest._retry !== true &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;
      try {
        const userID = getStoredUser()?.id;
        if (!userID) {
          console.error('No user ID found in stored user');
          return Promise.reject(axiosError);
        }

        const newToken = await API.refreshAccessToken(userID); // Refresh the token

        if (!newToken.data?.token) {
          console.error('No new token received from refresh token API');
          return Promise.reject(axiosError);
        }

        updateStoredUser({
          jwt: newToken.data.token,
          refreshToken: newToken.data.refreshToken,
          refreshTokenExpires: newToken.data.refreshTokenExpires,
        });

        Object.assign(originalRequest.headers, {
          Authorization: newToken.data.token,
        });

        return axiosInstance(originalRequest); // Retry the original request
      } catch (refreshError) {
        const refreshAxiosError = refreshError as AxiosError;

        console.error('Failed to refresh token:', refreshAxiosError);
        clearStoredUser();
        redirect({ to: '/login', throw: true });
      }
    }

    console.error('axiosError at end of interceptor', axiosError);
    return Promise.reject(axiosError);
  }
);

export default axiosInstance;
