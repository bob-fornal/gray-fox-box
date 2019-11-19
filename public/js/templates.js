const templates = {
  login: null,
  service: null,
  item: null,
  company: null,

  scheduledSingle: null,
  scheduledRecurring: null,

  wizardCompanyService: null,

  init: async () => {
    templates.login = await templates.get('login.html');
    templates.service = await templates.get('service.html');  
    templates.item = await templates.get('item.html');
    templates.company = await templates.get('company.html');

    templates.scheduledSingle = await templates.get('scheduled-single.html');
    templates.scheduledRecurring = await templates.get('scheduled-recurring.html');

    templates.wizardCompanyService = await templates.get('wizard-company-service.html');
  },
  get: async (file) => {
    const templateLocation = `/templates/${ file }`;
    const response = await fetch(templateLocation);
    const html = await response.text();
    return html;
  }  
};