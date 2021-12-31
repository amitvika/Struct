export const isLoggedIn = (_) => localStorage.getItem('token') !== 'null';
export const isURLExisting = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache'
    });

    return response.status === 200;
  } catch (error) {
    // console.log(error);
    return false;
  }
};

export const saveToLocalStorage = (key, obj) => {
  localStorage.setItem(key, JSON.stringify(obj));
  return true;
};

export const getFromLocalStorage = (key) => {
  let obj = {};
  if (typeof localStorage[key] !== 'undefined') {
    obj = JSON.parse(localStorage[key]);
  }
  return obj;
};

export const deleteFromLocalStorage = (key) => localStorage.removeItem(key);
