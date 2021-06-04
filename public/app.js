/* Function to POST data */
const postData = async (url = '', data = {}) => {
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

/* Function to GET Project Data */

// Async GET
const getData = async (url = '/', params) => {
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

const transformWeatherData = ({
  main: { temp } = {},
  name,
  sys: { country } = {},
  weather: [{ description, icon } = {}] = [],
}) => ({
  city: name,
  country,
  description,
  icon,
  temp,
});

/* Function called by event listener */
const generateWeather = () => {
  const city = document.getElementById('city').value;
  getData('/api/search', { city })
    .then(({ success, results: weatherData, message }) => {
      if (!success) {
        throw new Error(message);
      }
      return postData('/api/add', transformWeatherData(weatherData));
    })
    .then(() => getData('/api/all'))
    .then((allEntries) => {
      console.log('>> allEntries', allEntries);
    })
    .catch((error) => {
      console.log('>> error cacthed', error);
    });
};

// Event listener to add function to existing HTML DOM element
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate').addEventListener('click', generateWeather);
});
