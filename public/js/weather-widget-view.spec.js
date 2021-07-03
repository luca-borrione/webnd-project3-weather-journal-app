import { getWeatherData, getAllWeatherData, setWeatherData } from './weather-widget-controller';
import './weather-widget-view';

jest.mock('./weather-widget-controller', () => ({
  getWeatherData: jest.fn().mockResolvedValue('mock-wheather-data'),
  setWeatherData: jest.fn().mockResolvedValue(),
  getAllWeatherData: jest.fn().mockResolvedValue([
    {
      country: 'US',
      description: 'overcast clouds',
      feelsLike: 298.66,
      humidity: 92,
      icon: '04d',
      id: 47703,
      location: 'Little Rock',
      temperature: 297.74,
      timestamp: 1625165387,
      windSpeed: 4.92,
    },
    {
      country: 'US',
      description: 'clear sky',
      feelsLike: 302.25,
      humidity: 55,
      icon: '01d',
      id: 2002107,
      location: 'Beverly Hills',
      temperature: 301.29,
      timestamp: 1625155696,
      windSpeed: 0.89,
    }
  ]),
}));

const selectors = {
  card: {
    date: 'weather-card__date',
    description: 'weather-card__description',
    feelsLike: 'weather-card__feels-like',
    humidity: 'weather-card__humidity',
    location: 'weather-card__location',
    temperature: 'weather-card__temperature',
    weekday: 'weather-card__weekday',
    windSpeed: 'weather-card__wind-speed',
  },
  changeLocationButton: 'weather-card__change-location',
  closeModalButton: 'close-modal',
  locationModal: 'location-modal',
  locationModalForm: 'location-modal__form',
  zip: 'zip',
  widget: 'weather-widget',
};

describe('weather-widget-view', () => {
  let $changeLocationButton;
  let $closeModalButton;
  let $locationModal;
  let $locationModalForm;
  let $widget;
  let $zipInput;
  const $card = {};

  const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

  const showModal = async () => {
    $changeLocationButton.click();
    await flushPromises();
    jest.runAllTimers();
  };

  const hideModal = async () => {
    $closeModalButton.click();
    await flushPromises();
    jest.runAllTimers();
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    window.document.body.innerHTML = `
      <div class="${selectors.widget}">
        <div class="${selectors.locationModal}">
          <button class="${selectors.closeModalButton}"></button>
          <form class="${selectors.locationModalForm}">
            <input type="number" id="${selectors.zip}" />
          </form>
        </div>
        <button class="${selectors.changeLocationButton}"></button>
        <div class="${selectors.card.weekday}"></div>
        <div class="${selectors.card.date}"></div>
        <div class="${selectors.card.location}"></div>
        <div class="${selectors.card.description}"></div>
        <div class="${selectors.card.temperature}"></div>
        <div class="${selectors.card.feelsLike}"></div>
        <div class="${selectors.card.humidity}"></div>
        <div class="${selectors.card.windSpeed}"></div>
      </div>
    `;

    window.document.dispatchEvent(new Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    }));

    $changeLocationButton = document.querySelector(`.${selectors.changeLocationButton}`);
    $closeModalButton = document.querySelector(`.${selectors.closeModalButton}`);
    $locationModal = document.querySelector(`.${selectors.locationModal}`);
    $locationModalForm = document.querySelector(`.${selectors.locationModalForm}`);
    $widget = document.querySelector(`.${selectors.widget}`);
    $zipInput = document.getElementById(selectors.zip);

    $card.weekday = document.querySelector(`.${selectors.card.weekday}`);
    $card.date = document.querySelector(`.${selectors.card.date}`);
    $card.location = document.querySelector(`.${selectors.card.location}`);
    $card.description = document.querySelector(`.${selectors.card.description}`);
    $card.temperature = document.querySelector(`.${selectors.card.temperature}`);
    $card.feelsLike = document.querySelector(`.${selectors.card.feelsLike}`);
    $card.humidity = document.querySelector(`.${selectors.card.humidity}`);
    $card.windSpeed = document.querySelector(`.${selectors.card.windSpeed}`);
  });

  afterEach(() => {
    jest.runAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('location modal', () => {
    it('should show the location modal when clicking on the change location button', async () => {
      expect($widget.classList.contains('show-modal')).toBe(false);
      await showModal();
      expect($widget.classList.contains('show-modal')).toBe(true);
    });

    it('should hide the location modal when clicking on the close modal button', async () => {
      await showModal();
      expect($widget.classList.contains('show-modal')).toBe(true);
      await hideModal();
      expect($widget.classList.contains('show-modal')).toBe(false);
    });

    describe('transition end', () => {
      const triggerTransitionEnd = (element, overrides = {}) => {
        const event = document.createEvent('Event');
        event.initEvent('transitionend', true, true);
        element.dispatchEvent(Object.assign(event, overrides));
      };

      it('should keep the location modal visible at the end of the opacity transition when opening the modal', async () => {
        expect($locationModal.classList.contains('visible')).toBe(false);
        await showModal();
        expect($locationModal.classList.contains('visible')).toBe(true);
        triggerTransitionEnd($locationModal, { propertyName: 'opacity' });
        expect($locationModal.classList.contains('visible')).toBe(true);
      });

      it('should remove the visibility from the location modal at the end of the opacity transition when closing the modal', async () => {
        await showModal();
        expect($locationModal.classList.contains('visible')).toBe(true);
        await hideModal();
        expect($locationModal.classList.contains('visible')).toBe(true);
        triggerTransitionEnd($locationModal, { propertyName: 'opacity' });
        expect($locationModal.classList.contains('visible')).toBe(false);
      });

      it('should not remove the visibility from the location modal at the end of transition other than opacity when closing the modal', async () => {
        await showModal();
        expect($locationModal.classList.contains('visible')).toBe(true);
        await hideModal();
        expect($locationModal.classList.contains('visible')).toBe(true);
        triggerTransitionEnd($locationModal, { propertyName: 'not-opacity' });
        expect($locationModal.classList.contains('visible')).toBe(true);
      });
    });
  });

  describe('submitting a new location', () => {
    it('should get the weather data for the desired zipcode', async () => {
      $zipInput.value = 90210;
      $locationModalForm.submit();
      await flushPromises();
      expect(getWeatherData).toBeCalledTimes(1);
      expect(getWeatherData).toBeCalledWith({ zip: '90210' });
    });

    it('should save the weather data on the backend', async () => {
      $locationModalForm.submit();
      await flushPromises();
      expect(setWeatherData).toBeCalledTimes(1);
      expect(setWeatherData).toBeCalledWith('mock-wheather-data');
    });

    it('should retrieve all the saved weather data from the backend', async () => {
      $locationModalForm.submit();
      await flushPromises();
      expect(getAllWeatherData).toBeCalledTimes(1);
      expect(getAllWeatherData).toBeCalledWith(undefined);
    });

    it('should update the weather card with the last data', async () => {
      $locationModalForm.submit();
      await flushPromises();
      expect($card.weekday.innerHTML).toBe('Thursday');
      expect($card.date.innerHTML).toBe('July 1, 2021 - 04:08 PM');
      expect($card.location.innerHTML).toBe('Beverly Hills');
      expect($card.description.innerHTML).toBe('clear sky');
      expect($card.temperature.innerHTML).toBe('301.29');
      expect($card.feelsLike.innerHTML).toBe('302.25');
      expect($card.humidity.innerHTML).toBe('55');
      expect($card.windSpeed.innerHTML).toBe('0.89');
    });

    it('should hide the location modal', async () => {
      await showModal();
      expect($widget.classList.contains('show-modal')).toBe(true);
      $locationModalForm.submit();
      await flushPromises();
      jest.runAllTimers();
      expect($widget.classList.contains('show-modal')).toBe(false);
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      setWeatherData.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $locationModalForm.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });
  });
});
