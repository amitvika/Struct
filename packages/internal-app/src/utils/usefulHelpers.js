export const isLoggedIn = (_) => localStorage.getItem('token') !== 'null';

export const NEW_ITEM = 'new-item';

export const saveToSessionStorage = (key, obj) => {
  window.sessionStorage.setItem(key, JSON.stringify(obj));
  return true;
};

export const getFromSessionStorage = (key) => {
  let obj = {};
  if (typeof window.sessionStorage[key] !== 'undefined') {
    obj = JSON.parse(sessionStorage[key]);
  }
  return obj;
};

export const deleteFromSessionStorage = (key) =>
  window.sessionStorage.removeItem(key);
