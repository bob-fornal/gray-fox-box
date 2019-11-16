const store = {
  storage: null,
  storedLogin: "~~LOGIN~~",

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

  getLogin: async () => {
    return await store.get(store.storedLogin) || null;
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

const data = {
  loginData: null,
  users: null,
  items: null,
  services: null,

  init: async () => {
    data.users = await data.get('users.json');
    data.items = await data.get('items.json');
    data.services = await data.get('services.json');
  },

  get: async (file) => {
    const fileLocation = `/data/${ file }`;
    const response = await fetch(fileLocation);
    const json = await response.json();
    return json;
  },

  validateUsername: (username) => {
    const lowerUsername = username.toLowerCase();

    let found = false;
    for(let name in data.users) {
      if (name.toLowerCase() === lowerUsername) {
        found = true;
        data.loginData = data.users[name];
        break;
      }
      console.log(name);
    }
    return found;
  },
  logout: () => {
    data.loginData = null;
  }
}

const application = {
  store: null,
  html: null,
  data: null,

  account: null,

  elements: {
    body: null,

    login: null,
    loginButton: null,
    username: null,
    password: null,

    view: null,

    init: () => {
      let elements = application.elements;
      elements.body = document.getElementById('body');

      elements.login = document.getElementById('login');
      elements.loginButton = document.getElementById('login-button');
      elements.username = document.getElementById('username');
      elements.password = document.getElementById('password');

      elements.view = document.getElementById('view');

    }
  },

  structure: null,

  init: async (store, html, data) => {
    application.store = store;
    application.html = html;
    application.data = data;

    application.elements.init();
    await application.templates.init();

    console.log({ data: application.data });
    const login = await application.store.getLogin();

    application.setupEventListeners();
    if (login === null) {
      application.initiateLogin();
    } else {
      application.loggedIn();
    }
  },

  setupEventListeners: () => {
    document.addEventListener('click', (event) => {
      const target = event.target;
      event.preventDefault();

      switch (true) {
        case target.matches('#login-button'):
          console.log('login clicked');
          if (!!application.handleLogin()) {
            application.loggedIn();
          }
          break;
        case target.matches('#logout-button'):
          console.log('logout clicked');
          application.initiateLogin();
      }
    });
  },

  initiateLogin: () => {
    console.log("not logged in");
    application.elements.login.classList.remove('hidden');
    application.elements.view.classList.add('hidden');
  },
  handleLogin: () => {
    const username = application.elements.username.value;
    const password = application.elements.password.value;
    console.log({ username, password });

    const valid = (username.length > 0 && password.length > 0 && !!application.data.validateUsername(username));
    return valid;
  },

  loggedIn: () => {
    console.log("logged in", data.loginData);
    application.elements.login.classList.add('hidden');
    application.elements.view.classList.remove('hidden');
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