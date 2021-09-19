const html = {
  init: () => {},

  fragmentFromString: (stringHTML) => {
    let temp = document.createElement('template');
    temp.innerHTML = stringHTML;
    return temp.content;
  }
};
  