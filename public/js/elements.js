const elements = {
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
    elements.body = document.getElementById('body');

    elements.login = document.getElementById('login');

    elements.view = document.getElementById('view');
    elements.welcome = document.getElementById('welcome');
    elements.userImage = document.getElementById('user-image');

    elements.servicesList = document.getElementById('services-list');
    elements.itemsList = document.getElementById('items-list');
    elements.companiesList = document.getElementById('companies-list');

    elements.wizard = document.getElementById('wizard');
    elements.wizardContent = document.getElementById('wizard-content');
  }
};
