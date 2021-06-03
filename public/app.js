/* Function to POST data */

/* Function to GET Project Data */

// Async GET
const getData = async (url = '/', params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
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
  const weatherData = await getData('/api/search', { zip });
  console.log('>> weatherData', weatherData);
};

// Event listener to add function to existing HTML DOM element
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate').addEventListener('click', generateWeatherClick);
});
