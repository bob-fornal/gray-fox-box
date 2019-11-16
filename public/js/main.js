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

  logout: async () => {
    await store.remove(store.storedLogin);
  },
  setLogin: async (username) => {
    return await store.set(store.storedLogin, username);
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
  loginName: null,
  users: null,
  items: null,
  servicesUnsorted: null,
  services: null,

  init: async () => {
    data.users = await data.get('users.json');
    data.items = await data.get('items.json');
    data.servicesUnsorted = await data.get('services.json');
    data.services = data.servicesUnsorted.list.sort(function(a, b) {
      return a.rating - b.rating;
    });
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
        data.loginName = name;
        break;
      }
      console.log(name);
    }
    return found;
  },
  logout: () => {
    data.loginData = null;
    data.loginName = null;
  },

  getFirstname: () => {
    const firstname = data.loginName.split(' ')[0];
    return firstname;
  },
  getLogin: (username) => {
    const lowerUsername = username.toLowerCase();

    for(let name in data.users) {
      if (name.toLowerCase() === lowerUsername) {
        data.loginData = data.users[name];
        data.loginName = name;
        break;
      }
      console.log(name);
    }
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
    welcome: null,
    userImage: null,
    itemsList: null,
    servicesList: null,

    init: () => {
      let elements = application.elements;
      elements.body = document.getElementById('body');

      elements.login = document.getElementById('login');
      elements.loginButton = document.getElementById('login-button');
      elements.username = document.getElementById('username');
      elements.password = document.getElementById('password');

      elements.view = document.getElementById('view');
      elements.welcome = document.getElementById('welcome');
      elements.userImage = document.getElementById('user-image');
      elements.itemsList = document.getElementById('items-list');
      elements.servicesList = document.getElementById('services-list');
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
    application.setupEventListeners();

    const login = await application.store.getLogin();
    if (login === null) {
      application.initiateLogin();
    } else {
      application.loggedIn(login);
      application.displayItems();
      application.displayServices();
    }

    application.templates.init();
  },

  displayItems: () => {
    application.elements.itemsList.innerHTML = '';

    const categories = data.items.categories;
    for (let i = 0, i_len = categories.length; i < i_len; i++) {
      const category = data.items[categories[i]];
      console.log(category);
      for (let j = 0, j_len = category.list.length; j < j_len; j++) {
        let template = application.templates.item;
        if (j === 0) {
          template = template.replace('~~CATEGORY~~', `${ category.type }:`);
        } else {
          template = template.replace('~~CATEGORY~~', '');          
        }
        template = template.replace('~~TITLE~~', category.list[j].title);
        template = template.replace('~~CHECKED~~', '');
        if (category.list[j].service !== -1) {
          template = template.replace('~~SERVICE~~', application.getServiceImage(category.list[j].service));
        } else {
          template = template.replace('~~SERVICE~~', '');
        }
        console.log(template);

        const html = application.html.fragmentFromString(template);
        application.elements.itemsList.append(html);
      }
    }
  },
  displayServices: () => {
    application.elements.servicesList.innerHTML = '';

    const services = data.services;
    for (let i = 0, len = services.length; i < len; i++) {
      const service = services[i];
      console.log(service);

      let template = application.templates.service;
      template = template.replace('~~TITLE~~', service.name);
      template = template.replace('~~URL~~', service.url);
      template = template.replace('~~IMAGE~~', application.getServiceImage(service.id));
      console.log(template);

      const html = application.html.fragmentFromString(template);
      application.elements.servicesList.append(html);
    }
  },
  getServiceImage: (id) => {
    const services = data.services;
    let service = null;
    for (let i = 0, len = services.length; i < len; i++) {
      if (services[i].id === id) {
        service = services[i];
        break;
      }
    }
    return `<img class="service-image" src="/images/${ service.icon }" />`;
  },

  setupEventListeners: () => {
    document.addEventListener('click', (event) => {
      const target = event.target;
      event.preventDefault();
      console.log(event.target);

      switch (true) {
        case target.matches('#login-button'):
          console.log('login clicked');
          if (!!application.handleLogin()) {
            application.loggedIn();
          }
          break;
        case target.matches('#welcome'):
          console.log('logout clicked');
          application.store.logout();
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

  loggedIn: (username = null) => {
    if (username === null) {
      application.store.setLogin(data.loginName);
    } else {
      application.data.getLogin(username);
    }

    console.log("logged in", data.loginData);
    application.elements.login.classList.add('hidden');
    application.elements.view.classList.remove('hidden');

    if ("image" in data.loginData) {
      application.elements.userImage.src = `/images/accounts/${ data.loginData.image }`;
    }
    application.elements.welcome.innerText = `Welcome ${ data.getFirstname() }!`
  },

  templates: {
    item: null,
    service: null,

    init: async () => {
      application.templates.item = await application.templates.get('item.html');
      application.templates.service = await application.templates.get('service.html');  
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