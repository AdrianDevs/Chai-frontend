import type { AuthUser } from '../../../types/auth';

const userKey = 'chai.auth.user';
let user: AuthUser | null = null;

export function getStoredUser() {
  if (!user) {
    console.log('getStoredUser - using local storage');
    const _user = localStorage.getItem(userKey);
    user = _user ? (JSON.parse(_user) as AuthUser) : null;
  }
  return user;
}

export function setStoredUser(_user: AuthUser | null) {
  user = _user;
  if (_user) {
    localStorage.setItem(userKey, JSON.stringify(_user));
  } else {
    localStorage.removeItem(userKey);
  }
}

export function clearStoredUser() {
  user = null;
  localStorage.removeItem(userKey);
}

export function updateStoredUser(_user: Partial<AuthUser>) {
  if (!user) return;
  user = { ...user, ..._user } as AuthUser;
  console.log('updateStoredUser', user);
  localStorage.setItem(userKey, JSON.stringify(user));
}
