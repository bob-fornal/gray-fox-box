const store = {
  storage: null,
  storedLogin: '~~LOGIN~~',
  scheduled: '~~SCHEDULED~~',

  init: (storage) => {
    store.storage = storage;
  },

  get: async (key) => {
    const retrieved = await store.storage.getItem(key);
    return (retrieved === null) ? null : JSON.parse(retrieved);
  },
  set: async (key, value) => {
    await store.storage.setItem(key, JSON.stringify(value));
  },

  remove: async (key) => {
    await store.storage.removeItem(key);
  },

  logout: async () => {
    await store.remove(store.storedLogin);
  },
  setLogin: async (username) => {
    return await store.set(store.storedLogin, username);
  },
  getLogin: async () => {
    return await store.get(store.storedLogin) || null;
  },

  getScheduled: async () => {
    return await store.get(store.scheduled) || {};
  },
  setScheduled: async (data) => {
    await store.set(store.scheduled, data);
  }
};