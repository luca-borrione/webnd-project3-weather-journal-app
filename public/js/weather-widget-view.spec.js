import { getWeatherData, getAllWeatherData, setWeatherData } from './weather-widget-controller';
import './weather-widget-view';
import { selectors } from './utils/selectors';

jest.mock('./weather-widget-controller', () => ({
  getWeatherData: jest.fn().mockResolvedValue({ mock: 'wheather-data' }),
  setWeatherData: jest.fn().mockResolvedValue(),
  getAllWeatherData: jest.fn().mockResolvedValue([
    {
      country: 'US',
      description: 'overcast clouds',
      feelings: 'quite sad',
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
      feelings: 'very happy',
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

describe('weather-widget-view', () => {
  let $widget;
  const $modal = {};
  const $card = {};

  const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

  const showModal = async () => {
    $card.changeLocationButton.click();
    await flushPromises();
    jest.runAllTimers();
  };

  const hideModal = async () => {
    $modal.closeButton.click();
    await flushPromises();
    jest.runAllTimers();
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    window.document.body.innerHTML = `
      <div class="${selectors.widget}">
        <div class="${selectors.modal.container}">
          <button class="${selectors.modal.closeButton}"></button>
          <form class="${selectors.modal.form}">
            <input type="number" id="${selectors.modal.zipField}" />
            <textarea type="number" id="${selectors.modal.feelingsField}"></textarea>
          </form>
        </div>
        <button class="${selectors.card.changeLocationButton}"></button>
        <div class="${selectors.card.date}"></div>
        <div class="${selectors.card.description}"></div>
        <div class="${selectors.card.feelings}"></div>
        <div class="${selectors.card.feelsLike}"></div>
        <div class="${selectors.card.humidity}"></div>
        <div class="${selectors.card.location}"></div>
        <div class="${selectors.card.temperature}"></div>
        <div class="${selectors.card.weekday}"></div>
        <div class="${selectors.card.windSpeed}"></div>
      </div>
    `;

    window.document.dispatchEvent(new Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    }));

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
    $modal.container = document.querySelector(`.${selectors.modal.container}`);
    $modal.feelingsField = document.getElementById(selectors.modal.feelingsField);
    $modal.form = document.querySelector(`.${selectors.modal.form}`);
    $modal.zipField = document.getElementById(selectors.modal.zipField);
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
        expect($modal.container.classList.contains('visible')).toBe(false);
        await showModal();
        expect($modal.container.classList.contains('visible')).toBe(true);
        triggerTransitionEnd($modal.container, { propertyName: 'opacity' });
        expect($modal.container.classList.contains('visible')).toBe(true);
      });

      it('should remove the visibility from the location modal at the end of the opacity transition when closing the modal', async () => {
        await showModal();
        expect($modal.container.classList.contains('visible')).toBe(true);
        await hideModal();
        expect($modal.container.classList.contains('visible')).toBe(true);
        triggerTransitionEnd($modal.container, { propertyName: 'opacity' });
        expect($modal.container.classList.contains('visible')).toBe(false);
      });

      it('should not remove the visibility from the location modal at the end of transition other than opacity when closing the modal', async () => {
        await showModal();
        expect($modal.container.classList.contains('visible')).toBe(true);
        await hideModal();
        expect($modal.container.classList.contains('visible')).toBe(true);
        triggerTransitionEnd($modal.container, { propertyName: 'not-opacity' });
        expect($modal.container.classList.contains('visible')).toBe(true);
      });
    });
  });

  describe('submitting a new location', () => {
    it('should get the weather data for the desired zipcode', async () => {
      $modal.zipField.value = 90210;
      $modal.form.submit();
      await flushPromises();
      expect(getWeatherData).toBeCalledTimes(1);
      expect(getWeatherData).toBeCalledWith({ zip: '90210' });
    });

    it('should save the weather data on the backend', async () => {
      $modal.feelingsField.value = 'mock-feelings';
      $modal.form.submit();
      await flushPromises();
      expect(setWeatherData).toBeCalledTimes(1);
      expect(setWeatherData).toBeCalledWith({
        mock: 'wheather-data',
        feelings: 'mock-feelings',
      });
    });

    it('should retrieve all the saved weather data from the backend', async () => {
      $modal.form.submit();
      await flushPromises();
      expect(getAllWeatherData).toBeCalledTimes(1);
      expect(getAllWeatherData).toBeCalledWith(undefined);
    });

    it('should update the weather card with the last data', async () => {
      $modal.form.submit();
      await flushPromises();
      expect($card.weekday.innerHTML).toBe('Thursday');
      expect($card.date.innerHTML).toBe('July 1, 2021 - 04:08 PM');
      expect($card.location.innerHTML).toBe('Beverly Hills');
      expect($card.description.innerHTML).toBe('clear sky');
      expect($card.temperature.innerHTML).toBe('301.29');
      expect($card.feelsLike.innerHTML).toBe('302.25');
      expect($card.humidity.innerHTML).toBe('55');
      expect($card.windSpeed.innerHTML).toBe('0.89');
      expect($card.feelings.innerHTML).toBe('very happy');
    });

    it('should hide the location modal', async () => {
      await showModal();
      expect($widget.classList.contains('show-modal')).toBe(true);
      $modal.form.submit();
      await flushPromises();
      jest.runAllTimers();
      expect($widget.classList.contains('show-modal')).toBe(false);
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      setWeatherData.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      $modal.form.submit();
      await flushPromises();
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });
  });
});
