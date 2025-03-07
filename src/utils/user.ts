import type { User } from '../services/api/types';

function convertDateToLocaleString(date: Date) {
  return date.toLocaleString().replace(',', ' at');
}

function convertDateStringToLocaleString(dateString: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
    .format(new Date(dateString))
    .replace(',', ' at');
}

function getUserFromId(users: Array<User>, id: number) {
  return users.find((user) => user.id === id);
}

export {
  convertDateToLocaleString,
  convertDateStringToLocaleString,
  getUserFromId,
};
