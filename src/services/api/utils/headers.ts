import { getJwtToken } from './jwtToken';

export const getHeaders = (): Record<string, string> => {
  const token = getJwtToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `${token}` : '',
  };
};
