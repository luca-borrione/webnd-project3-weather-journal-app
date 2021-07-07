import { getWeatherData, getAllWeatherData, setWeatherData } from './weather-widget-controller.js';
import { getNavigatorLanguage, handleError } from './utils/index.js';
import { selectors } from './utils/selectors.js';

let $widget;

const $card = {};
const $modal = {};

const LOCALE = getNavigatorLanguage();

const storeElements = () => {
  $widget = document.querySelector(`.${selectors.widget}`);

  $card.changeLocationButton = document.querySelector(`.${selectors.card.changeLocationButton}`);
  $card.date = document.querySelector(`.${selectors.card.date}`);
  $card.description = document.querySelector(`.${selectors.card.description}`);
  $card.feelings = document.querySelector(`.${selectors.card.feelings}`);
  $card.feelsLike = document.querySelector(`.${selectors.card.feelsLike}`);
  $card.humidity = document.querySelector(`.${selectors.card.humidity}`);
  $card.location = document.querySelector(`.${selectors.card.location}`);
  $card.temperature = document.querySelector(`.${selectors.card.temperature}`);
  $card.weekday = document.querySelector(`.${selectors.card.weekday}`);
  $card.windSpeed = document.querySelector(`.${selectors.card.windSpeed}`);

  $modal.closeButton = document.querySelector(`.${selectors.modal.closeButton}`);
  $modal.feelingsField = document.getElementById(selectors.modal.feelingsField);
  $modal.container = document.querySelector(`.${selectors.modal.container}`);
  $modal.form = document.querySelector(`.${selectors.modal.form}`);
  $modal.zipField = document.getElementById(selectors.modal.zipField);
};

const updateWeatherCard = (weatherData) => {
  const date = new Date(weatherData.timestamp * 1000);
  const localeDate = date.toLocaleDateString(LOCALE, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const localeTime = date.toLocaleTimeString(LOCALE, {
    hour: '2-digit', hour12: true, minute: '2-digit', timeZone: 'UTC',
  });

  const localWeekday = date.toLocaleDateString(LOCALE, {
    weekday: 'long',
  });

  $card.weekday.innerHTML = localWeekday;
  $card.date.innerHTML = `${localeDate} - ${localeTime}`;
  $card.location.innerHTML = weatherData.location;
  $card.description.innerHTML = weatherData.description;
  $card.temperature.innerHTML = weatherData.temperature;
  $card.feelsLike.innerHTML = weatherData.feelsLike;
  $card.humidity.innerHTML = weatherData.humidity;
  $card.windSpeed.innerHTML = weatherData.windSpeed;
  $card.feelings.innerHTML = weatherData.feelings;
};

const updateView = (allWeatherData) => {
  const currentData = [...allWeatherData].pop();
  updateWeatherCard(currentData);
};

const toggleModal = () => {
  $modal.container.classList.add('visible');
  setTimeout(() => $widget.classList.toggle('show-modal'), 0);
};

const toggleModalClick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleModal();
};

const locationModalTransitionEnd = (event) => {
  if (event.propertyName === 'opacity') {
    if (!$widget.classList.contains('show-modal')) {
      $modal.container.classList.remove('visible');
    }
  }
};

const addFeelings = (weatherData) => ({
  ...weatherData,
  feelings: $modal.feelingsField.value,
});

const locationModalFormSubmit = (event) => {
  event.preventDefault();
  event.stopPropagation();
  return getWeatherData({ zip: $modal.zipField.value })
    .then(addFeelings)
    .then(setWeatherData)
    .then(getAllWeatherData)
    .then(updateView)
    .then(toggleModal)
    .catch(handleError);
};

const initEventListeners = () => {
  $card.changeLocationButton.addEventListener('touchend', toggleModalClick);
  $card.changeLocationButton.addEventListener('click', toggleModalClick);
  $modal.closeButton.addEventListener('touchend', toggleModalClick);
  $modal.closeButton.addEventListener('click', toggleModalClick);
  $modal.form.addEventListener('submit', locationModalFormSubmit);
  $modal.container.addEventListener('transitionend', locationModalTransitionEnd);
};

const init = () => {
  storeElements();
  initEventListeners();
};

document.addEventListener('DOMContentLoaded', init);
