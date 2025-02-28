import { CustomError } from '../../types/error';
import API from '.';

const BASE_URL = import.meta.env.VITE_API_URL as string;

const getHeaders = () => {
  const token = API.getAccessToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `${token}` : '',
  };
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type APIResponse<T extends object> = {
  status: number;
  data?: T;
};

class ApiMethods {
  static apiRequest<T extends object>(
    method: Method,
    url: string,
    body?: object
  ): Promise<APIResponse<T>> {
    url = BASE_URL + url;

    return new Promise<APIResponse<T>>((resolve, reject) => {
      fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: getHeaders(),
      })
        .then(async (res) => {
          if (res.ok) {
            if (res.headers.get('Content-Type')?.includes('application/json')) {
              const data = (await res.json()) as T;
              resolve({
                status: res.status,
                data,
              });
            } else {
              const text = await res.text();
              reject(
                new CustomError(
                  'API request failed : API did not return Content-Type: application/json',
                  500,
                  text
                )
              );
            }
          } else {
            const text = await res.text();
            reject(new CustomError('API request failed', res.status, text));
          }
        })
        .catch((error) => {
          reject(
            new CustomError(
              'API request failed',
              500,
              (error as Error).message || ''
            )
          );
        });
    });
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
