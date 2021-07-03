import { getData, postData, getNavigatorLanguage } from './utils.js';

const LOCALE = getNavigatorLanguage();

const transformWeatherData = ({
  dt: epoch,
  main: { feels_like: feelsLike, humidity, temp } = {},
  name,
  sys: { country, id } = {},
  timezone,
  weather: [{ description, icon } = {}] = [],
  wind: { speed } = {},
}) => ({
  country,
  description,
  feelsLike,
  humidity,
  icon,
  id,
  location: name,
  temperature: temp,
  timestamp: epoch + timezone,
  windSpeed: speed,
});

export const getWeatherData = async ({ zip }) => {
  try {
    const lang = LOCALE.split('-').shift();
    const response = await getData('/api/search', { lang, zip });
    if (!response.success) {
      throw new Error(response.message);
    }
    return transformWeatherData(response.results);
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return null;
  }
};

export const setWeatherData = async (data) => {
  try {
    await postData('/api/add', data);
    return true;
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return false;
  }
};

export const getAllWeatherData = async () => {
  try {
    return getData('/api/all');
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return null;
  }
};
