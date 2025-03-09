import { redirect } from '@tanstack/react-router';
import { CustomError } from '../../types/error';
import axiosInstance from './axiosInstance';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

type APIResponse<T extends object> = {
  status: number;
  data?: T;
};

class ApiMethods {
  static async apiRequest<T extends object>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: object
  ): Promise<APIResponse<T>> {
    const config: AxiosRequestConfig = {
      method,
      url: url,
      data: body,
    };

    try {
      const response: AxiosResponse<T> = await axiosInstance({
        ...config,
        withCredentials: true,
      });

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        throw axiosError;
      } else if (axiosError.request) {
        throw axiosError;
      } else {
        if (
          typeof error === 'object' &&
          error !== null &&
          'isRedirect' in error
        ) {
          throw redirect({
            to: '/login',
            search: {
              refresh: true,
            },
            replace: true,
          }) as unknown as Error;
        } else {
          throw new CustomError(
            'API request failed: Request setup failed',
            500,
            axiosError.message || 'Unknown error'
          );
        }
      }
    }
  }

  static get<T extends object>(url: string) {
    return this.apiRequest<T>('GET', url);
  }

  static post<T extends object>(url: string, body: object) {
    return this.apiRequest<T>('POST', url, body);
  }

  static put(url: string, body: object) {
    return this.apiRequest('PUT', url, body);
  }

  static delete(url: string) {
    return this.apiRequest('DELETE', url);
  }
}

export default ApiMethods;
