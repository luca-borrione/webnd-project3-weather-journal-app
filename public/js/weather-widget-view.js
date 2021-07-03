import { getWeatherData, getAllWeatherData, setWeatherData } from './weather-widget-controller.js';
import { getNavigatorLanguage, handleError } from './utils/index.js';

let $changeLocationButton;
let $closeModalButton;
let $widget;
let $locationModal;
let $locationModalForm;
let $zipInput;

const $card = {};

const LOCALE = getNavigatorLanguage();

const storeElements = () => {
  $changeLocationButton = document.querySelector('.weather-card__change-location');
  $closeModalButton = document.querySelector('.close-modal');
  $widget = document.querySelector('.weather-widget');
  $locationModal = document.querySelector('.location-modal');
  $locationModalForm = document.querySelector('.location-modal__form');
  $zipInput = document.getElementById('zip');

  $card.weekday = document.querySelector('.weather-card__weekday');
  $card.date = document.querySelector('.weather-card__date');
  $card.location = document.querySelector('.weather-card__location');
  $card.description = document.querySelector('.weather-card__description');
  $card.temperature = document.querySelector('.weather-card__temperature');
  $card.feelsLike = document.querySelector('.weather-card__feels-like');
  $card.humidity = document.querySelector('.weather-card__humidity');
  $card.windSpeed = document.querySelector('.weather-card__wind-speed');
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
};

const updateView = (allWeatherData) => {
  const currentData = [...allWeatherData].pop();
  updateWeatherCard(currentData);
};

const toggleModal = () => {
  $locationModal.classList.add('visible');
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
      $locationModal.classList.remove('visible');
    }
  }
};

const locationModalFormSubmit = (event) => {
  event.preventDefault();
  event.stopPropagation();
  return getWeatherData({ zip: $zipInput.value })
    .then(setWeatherData)
    .then(getAllWeatherData)
    .then(updateView)
    .then(toggleModal)
    .catch(handleError);
};

const initEventListeners = () => {
  $changeLocationButton.addEventListener('touchend', toggleModalClick);
  $changeLocationButton.addEventListener('click', toggleModalClick);
  $closeModalButton.addEventListener('touchend', toggleModalClick);
  $closeModalButton.addEventListener('click', toggleModalClick);
  $locationModalForm.addEventListener('submit', locationModalFormSubmit);
  $locationModal.addEventListener('transitionend', locationModalTransitionEnd);
};

const init = () => {
  storeElements();
  initEventListeners();
};

document.addEventListener('DOMContentLoaded', init);
