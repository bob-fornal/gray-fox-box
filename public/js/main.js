const store = {
  storage: null,

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

  getStoredKey: async () => {
    return await store.get(store.storedKey) || [];
  },

  getStructure: async () => {
    return fetch('./testing.json').then(res => res.json());
  }
};

const html = {
  init: () => {},

  fragmentFromString: (stringHTML) => {
    let temp = document.createElement('template');
    temp.innerHTML = stringHTML;
    return temp.content;
  }
};

const application = {
  state: null,
  store: null,
  html: null,
  logging: null,

  elements: {
    body: null,

    init: () => {
      let elements = application.elements;
      elements.body = document.getElementById('body');
    }
  },

  structure: null,

  init: async (store, html) => {
    application.store = store;
    application.html = html;

    application.elements.init();
    await application.templates.init();
  },

  templates: {
    // categoryContent: null,
    // categoryElement: null,
    // checklist: null,
    // settingsState: null,

    init: async () => {
      // application.templates.checklist = await application.templates.get('checklist.html');
      // application.templates.categoryContent = await application.templates.get('category-content.html');
      // application.templates.categoryElement = await application.templates.get('category-element.html');
      // application.templates.settingsState = await application.templates.get('settings-state.html');  
    },
    get: async (file) => {
      const templateLocation = `/templates/${ file }`;
      const response = await fetch(templateLocation);
      const html = await response.text();
      return html;
    }  
  },

  buildChecklistElement: (list)  => {
    let template = application.templates.checklist;
    template = template.replace(/~~list.name~~/g, list.name);
    template = template.replace(/~~list.title~~/g, list.title);

    let wrapper = application.html.fragmentFromString(template);
    return wrapper;
  }

};