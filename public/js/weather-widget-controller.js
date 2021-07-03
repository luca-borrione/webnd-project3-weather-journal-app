import {
  getData,
  postData,
  getNavigatorLanguage,
  handleErrorAndReject
} from './utils/index.js';

const LANG = getNavigatorLanguage().split('-').shift();

const transformWeatherData = ({
  dt: epoch,
  main: { feels_like: feelsLike, humidity, temp },
  name,
  sys: { country, id },
  timezone,
  weather: [{ description, icon }],
  wind: { speed },
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

const parseWeatherDataResponse = (response) =>
  new Promise((resolve, reject) => {
    if (!response.success) {
      reject(new Error(response.message));
    }
    resolve(transformWeatherData(response.results));
  });

export const getWeatherData = ({ zip }) =>
  getData('/api/search', { lang: LANG, zip })
    .then(parseWeatherDataResponse)
    .catch(handleErrorAndReject);

export const setWeatherData = (data) =>
  postData('/api/add', data)
    .catch(handleErrorAndReject);

export const getAllWeatherData = () =>
  getData('/api/all')
    .catch(handleErrorAndReject);
