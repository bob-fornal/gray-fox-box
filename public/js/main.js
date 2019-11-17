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
  services: null,
  companiesUnsorted: null,
  companies: null,

  init: async () => {
    data.users = await data.get('users.json');
    data.items = await data.get('items.json');
    data.services = (await data.get('services.json')).list;
    data.companiesUnsorted = await data.get('companies.json');
    data.companies = data.companiesUnsorted.list.sort(function(a, b) {
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
};

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
    
    servicesList: null,
    itemsList: null,
    companiesList: null,

    wizard: null,
    wizardContent: null,

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

      elements.servicesList = document.getElementById('services-list');
      elements.itemsList = document.getElementById('items-list');
      elements.companiesList = document.getElementById('companies-list');

      elements.wizard = document.getElementById('wizard');
      elements.wizardContent = document.getElementById('wizard-content');
    }
  },

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
      application.displayServices();
      application.displayItems();
      application.displayCompanies();
    }

    application.templates.init();
  },

  displayServices: async () => {
    application.elements.servicesList.innerHTML = '';

    const services = data.services;
    for (let i = 0, i_len = services.length; i < i_len; i++) {
      const service = services[i];
      let template = application.templates.service;
      template = template.replace('~~SERVICE~~', service.type);
      template = template.replace('~~SERVICE_ID~~', service.type);
      template = template.replace('~~OPTIONS~~', application.getOptions(service.id, service.type, service.schedule));
      template = template.replace('~~SCHEDULED~~', await application.getScheduled(service.id));

      const html = application.html.fragmentFromString(template);
      application.elements.servicesList.append(html);
    }
  },
  getOptions: (id, type, schedule) => {
    // schedule = single, start-stop, frequency
    let html = `<option value="">--${ type }--</option>`;
    const template = '<option value="~~VALUE~~">~~DESCRIPTION~~</option>';

    const companies = data.companies;
    for (let i = 0, i_len = companies.length; i < i_len; i++) {
      const company = companies[i];
      for (let j = 0, j_len = company.services.length; j < j_len; j++) {
        if (company.services[j].id === id) {
          let option = template;
          option = option.replace('~~VALUE~~', `${ company.id }-${ id }`);
          if (schedule === 'frequency') {
            option = option.replace('~~DESCRIPTION~~', `${ company.name } ($${ application.toDecimal(company.services[j].costperweek) } per week)`);
          } else {
            option = option.replace('~~DESCRIPTION~~', `${ company.name } ($${ application.toDecimal(company.services[j].costtotal) } total)`);
          }
          html += option;
        }
      }
    }

    return html;
  },
  toDecimal: (number) => {
    return parseFloat(Math.round(number * 100) / 100).toFixed(2);
  },
  getScheduled: async (id) => {
    const scheduled = await application.store.getScheduled();
    const current = scheduled[id] || null;

    let template = null;
    if (current === null) {
      template = '';
    } else if (current.schedule === 'single') {
      template = application.templates.scheduledSingle;
      template = template.replace('~~DATE_TIME~~', `01 Dec 2019 1:00 pm`);
      template = template.replace('~~COMPANY~~', current.name);
      template = template.replace('~~SERVICE_ID~~', id);
    } else {
      template = application.templates.scheduledRecurring;
      if (current.schedule === 'start-stop') {
        template = template.replace('~~TIMEFRAME~~', 'to occur');
      } else {
        template = template.replace('~~TIMEFRAME~~', 'weekly');
      }
      template = template.replace('~~COMPANY~~', current.name);
      template = template.replace('~~START~~', '01 Oct 2019');
      template = template.replace('~~STOP~~', '31 Dec 2019');
      template = template.replace('~~SERVICE_ID~~', id);
    }

    return template;
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
          template = template.replace('~~SERVICE~~', application.getCompanyImage(category.list[j].service));
        } else {
          template = template.replace('~~SERVICE~~', '');
        }

        const html = application.html.fragmentFromString(template);
        application.elements.itemsList.append(html);
      }
    }
  },
  displayCompanies: () => {
    application.elements.companiesList.innerHTML = '';

    const companies = data.companies;
    for (let i = 0, len = companies.length; i < len; i++) {
      const company = companies[i];

      let template = application.templates.company;
      template = template.replace('~~TITLE~~', company.name);
      template = template.replace('~~URL~~', company.url);
      template = template.replace('~~IMAGE~~', application.getCompanyImage(company.id, 'company'));

      const html = application.html.fragmentFromString(template);
      application.elements.companiesList.append(html);
    }
  },

  getCompanyImage: (id, type = 'service') => {
    const companies = data.companies;
    let company = null;
    for (let i = 0, len = companies.length; i < len; i++) {
      if (companies[i].id === id) {
        company = companies[i];
        break;
      }
    }
    return `<img class="${ type }-image" src="/images/${ company.icon }" />`;
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
        case target.matches('#welcome'):
          console.log('logout clicked');
          application.store.logout();
          application.initiateLogin();
          break;
        case target.matches('#wizard-cancel'):
          application.elements.wizard.classList.add('hidden');
          application.cancelWizard();
          break;
        case target.matches('#wizard-schedule'):
          application.elements.wizard.classList.add('hidden');
          application.saveWizardChanges();
          break;
        case target.matches('#remove-scheduled'):
          const id = parseInt(target.getAttribute('data-service-id'), 10);
          application.removeScheduled(id);
          break;
      }
    });

    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!target.matches('.service')) {
        return;
      }
      event.preventDefault();

      application.showWizard(target.selectedOptions[0].value);
    });
  },

  forCancel: null,
  cancelWizard: () => {
    const elementId = `${ application.forCancel.service.type }-select`;
    const element = document.getElementById(elementId);
    element.selectedIndex = 0;
  },
  saveWizardChanges: async () => {
    let scheduled = await application.store.getScheduled();
    const selected = application.forCancel;

    scheduled[selected.service.id] = {
      id: selected.company.id,
      name: selected.company.name,
      schedule: selected.service.schedule,
    };
    if (selected.service.schedule === 'frequency') {
      scheduled[selected.service.id].costperweek = selected.companyService.costperweek;
    } else {
      scheduled[selected.service.id].costtotal = selected.companyService.costtotal;
    }

    await application.store.setScheduled(scheduled);
    application.displayServices();
  },
  showWizard: (companyService) => {
    if (companyService === '') {
      return;
    }

    application.elements.wizardContent.innerHTML = '';
    const cs = companyService.split('-');
    const companyId = parseInt(cs[0], 10);
    const serviceId = parseInt(cs[1], 10);
    console.log(companyId, serviceId);

    const companies = data.companies;
    const services = data.services;
    let selected = {};

    for (let company of companies) {
      if (company.id === companyId) {
        selected.company = company;
        break;
      }
    }
    for (let service of services) {
      if (service.id === serviceId) {
        selected.service = service;
        break;
      }
    }
    for (let companyService of selected.company.services) {
      if (companyService.id === serviceId) {
        selected.companyService = companyService;
        break;
      }
    }

    application.forCancel = selected;

    let template = application.templates.wizardCompanyService;
    template = template.replace('~~SERVICE~~', selected.service.type);
    template = template.replace('~~COMPANY~~', selected.company.name);
    if (selected.service.schedule === 'frequency') {
      template = template.replace('~~COST~~', `$${ application.toDecimal(selected.companyService.costperweek) } per week`);
    } else {
      template = template.replace('~~COST~~', `$${ application.toDecimal(selected.companyService.costtotal) } total`);
    }
    if (selected.service.schedule === 'single') {
      template = template.replace('~~SINGLE_HIDDEN~~', '');
      template = template.replace('~~FREQUENCY_HIDDEN~~', 'hidden');
    } else {
      template = template.replace('~~SINGLE_HIDDEN~~', 'hidden');
      template = template.replace('~~FREQUENCY_HIDDEN~~', '');
    }

    const html = application.html.fragmentFromString(template);
    application.elements.wizardContent.append(html);
    console.log(selected);
    application.elements.wizard.classList.remove('hidden');
  },
  removeScheduled: async (id) => {
    let scheduled = await application.store.getScheduled();
    delete scheduled[id];
    await application.store.setScheduled(scheduled);
    application.displayServices();
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
    service: null,
    item: null,
    company: null,

    scheduledSingle: null,
    scheduledRecurring: null,

    wizardCompanyService: null,

    init: async () => {
      application.templates.service = await application.templates.get('service.html');  
      application.templates.item = await application.templates.get('item.html');
      application.templates.company = await application.templates.get('company.html');

      application.templates.scheduledSingle = await application.templates.get('scheduled-single.html');
      application.templates.scheduledRecurring = await application.templates.get('scheduled-recurring.html');

      application.templates.wizardCompanyService = await application.templates.get('wizard-company-service.html');
    },
    get: async (file) => {
      const templateLocation = `/templates/${ file }`;
      const response = await fetch(templateLocation);
      const html = await response.text();
      return html;
    }  
  }

};