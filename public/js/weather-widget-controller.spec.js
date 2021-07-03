import { getData, postData } from './utils';
import { getWeatherData, setWeatherData } from './weather-widget-controller';

jest.mock('./utils', () => ({
  getData: jest.fn().mockResolvedValue({
    success: true,
    results: {
      weather: [{
        description: 'scattered clouds',
        icon: '03d',
      }],
      main: {
        temp: 302.36,
        feels_like: 303.49,
        humidity: 53,
      },
      wind: { speed: 0.89 },
      dt: 1625262582,
      sys: {
        id: 2002107,
        country: 'US',
      },
      timezone: -25200,
      name: 'Beverly Hills',
    },
  }),
  getNavigatorLanguage: jest.fn().mockReturnValue('lang-COUNTRY'),
  postData: jest.fn().mockResolvedValue(),
}));

describe('weather-widget-controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWeatherData', () => {
    it('should correctly call getData', async () => {
      await getWeatherData({ zip: 90210 });
      expect(getData).toBeCalledTimes(1);
      expect(getData).toBeCalledWith('/api/search', { lang: 'lang', zip: 90210 });
    });

    it('should received weather data correctly transformed', async () => {
      const response = await getWeatherData({ zip: 90210 });
      expect(response).toStrictEqual({
        country: 'US',
        description: 'scattered clouds',
        feelsLike: 303.49,
        humidity: 53,
        icon: '03d',
        id: 2002107,
        location: 'Beverly Hills',
        temperature: 302.36,
        timestamp: 1625237382,
        windSpeed: 0.89,
      });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('expected error');
      getData.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      await getWeatherData({ zip: 90210 });
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should thrown an handled error if the response from the getData contains success false', async () => {
      const expectedError = new Error('expected error');
      getData.mockResolvedValue({
        success: false,
        message: 'expected error',
      });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      await getWeatherData({ zip: 90210 });
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should return null in case of error', async () => {
      const expectedError = new Error('expected error');
      getData.mockRejectedValueOnce(expectedError);
      jest.spyOn(console, 'error').mockImplementation();
      const response = await getWeatherData({ zip: 90210 });
      expect(response).toBeNull();
    });
  });

  describe('setWeatherData', () => {
    it('should correctly call postData', async () => {
      await setWeatherData({ mock: 'data' });
      expect(postData).toHaveBeenCalledTimes(1);
      expect(postData).toHaveBeenCalledWith('/api/add', { mock: 'data' });
    });

    it('should return true in case of success', async () => {
      const response = await setWeatherData({ mock: 'data' });
      expect(response).toBe(true);
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('expected error');
      postData.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      await setWeatherData({ mock: 'data' });
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should return false in case of error', async () => {
      const expectedError = new Error('expected error');
      postData.mockRejectedValueOnce(expectedError);
      jest.spyOn(console, 'error').mockImplementation();
      const response = await setWeatherData({ mock: 'data' });
      expect(response).toBe(false);
    });
  });
});
