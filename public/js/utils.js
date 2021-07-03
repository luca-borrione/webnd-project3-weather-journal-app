/* eslint-disable no-unused-vars */

export const postData = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return null;
  }
};

export const getData = async (url, params) => {
  try {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const response = await fetch(`${url}${queryParams}`);
    return response.json();
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return null;
  }
};

export const getNavigatorLanguage = () =>
  (navigator.languages || [])[0]
  || navigator.userLanguage
  || navigator.language
  || navigator.browserLanguage
  || navigator.systemLanguage;

/* eslint-enable no-unused-vars */
