// Personal API Key for OpenWeatherMap API
/* eslint-disable no-undef */
// const BASE_URL = (process && process.env && process.env.BASE_URL) || (config && config.BASE_URL);
// const APP_ID = (process && process.env && process.env.APP_ID) || (config && config.APP_ID);
/* eslint-enable no-undef */

// console.log('>> APP_ID', APP_ID);

/* Function to GET Web API Data */
// const getWeatherData = async ({ zip }) => {
//   try {
//     const result = await fetch(`${BASE_URL}zip=${zip}&appid=${APP_ID}`);
//     const data = await result.json();
//     return data;
//   } catch (error) {
//     // ... gracefully handle error
//     console.log('error', error);
//     return null;
//   }
// };

/* Function to POST data */

/* Function to GET Project Data */

// Async GET
const getData = async (url = '/', params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    console.log('>> rl', `${url}?${queryParams}`);
    const response = await fetch(`${url}?${queryParams}`);
    const results = await response.json();
    return results;
  } catch (error) {
    // ... gracefully handle error
    console.log('error', error);
    return null;
  }
};

/* Function called by event listener */
const generateWeatherClick = async () => {
  const zip = document.getElementById('zip').value;
  // const weatherData = await getWeatherData({ zip });
  const weatherData = await getData('/api/search', { zip });
  console.log('>> weatherData', weatherData);
};

// Event listener to add function to existing HTML DOM element
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate').addEventListener('click', generateWeatherClick);
});
