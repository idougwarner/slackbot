const { LocalStorage } = require('node-localstorage');

const localStorage = new LocalStorage('./db');

const setItem = (key, value) => {
  if (typeof value === 'object') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value);
  }
};

const getItem = (key) => {
  try {
    const value = localStorage.getItem(key);

    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  } catch (error) {
    return null;
  }
};

const deleteItem = (key) => {
  localStorage.removeItem(key);
};

module.exports = { setItem, getItem, deleteItem };
