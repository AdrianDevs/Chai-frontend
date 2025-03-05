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
      const response: AxiosResponse<T> = await axiosInstance(config);

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        throw new CustomError(
          'API request failed',
          axiosError.response.status,
          axiosError.response.data
        );
      } else if (axiosError.request) {
        throw new CustomError(
          'API request failed: No response received',
          500,
          axiosError.message
        );
      } else {
        throw new CustomError(
          'API request failed: Request setup failed',
          500,
          axiosError.message || 'Unknown error'
        );
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
