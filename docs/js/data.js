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
    }
  }
};