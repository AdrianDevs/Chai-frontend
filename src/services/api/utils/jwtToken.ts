let jwtToken: string | null = null;

const key = 'chai.auth.jwt';

export const getJwtToken = (): string | null => {
  if (!jwtToken) {
    jwtToken = localStorage.getItem(key); // Fetch from local storage only once
  }
  return jwtToken;
};

export const setJwtToken = (token: string) => {
  jwtToken = token; // Update the in-memory copy
  localStorage.setItem(key, token); // Update local storage
};

export const clearJwtToken = () => {
  jwtToken = null; // Remove the in-memory copy
  localStorage.removeItem(key); // Remove from local storage
};
