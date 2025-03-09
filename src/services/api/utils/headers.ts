import { getStoredUser } from './localStorage';

export const getHeaders = (isTokenRefresh: boolean): Record<string, string> => {
  const token = getStoredUser()?.jwt;
  const refreshToken = getStoredUser()?.refreshToken;

  if (isTokenRefresh) {
    return {
      'Content-Type': 'application/json',
      'x-refresh-token': refreshToken ?? '',
      credentials: 'include',
    };
  }

  return {
    'Content-Type': 'application/json',
    Authorization: token ?? '',
    credentials: 'include',
  };
};
