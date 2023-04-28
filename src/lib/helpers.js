// parse a JSON configuration object from the DOM
export const parseJSONScript = (document, id) => {
  const script = document.getElementById(id);
  try {
    return JSON.parse(script.innerHTML);
  } catch { return null; }
};

// render a HTML template after the given target element, with optional context interpolation
export const renderHtmlTemplate = (config, targetElement, templateName, context = {}, renderMethod = 'after') => {
  const interpolatedTemplate = Object.entries(context).reduce((output, value) => {
    const [k, v] = value;
    return output.replace(new RegExp(`{{ ${k} }}`, 'g'), v);
  }, config.templates[templateName]);

  const templateDocument = new DOMParser().parseFromString(interpolatedTemplate, 'text/html');
  const templateElement = templateDocument.querySelector('body > *');

  targetElement[renderMethod](templateElement);

  return templateElement;
};
