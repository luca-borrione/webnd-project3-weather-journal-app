import { getData, postData, handleErrorAndReject } from './utils';
import { getWeatherData, setWeatherData, getAllWeatherData } from './weather-widget-controller';

jest.mock('./utils', () => ({
  getData: jest.fn(),
  getNavigatorLanguage: jest.fn().mockReturnValue('lang-COUNTRY'),
  handleErrorAndReject: jest.fn(),
  postData: jest.fn().mockResolvedValue({ success: true }),
}));

describe('weather-widget-controller', () => {
  describe('getWeatherData', () => {
    beforeAll(() => {
      getData.mockImplementation(() => Promise.resolve({
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
      }));
    });

    it('should correctly call getData', async () => {
      await getWeatherData({ zip: 90210 });
      expect(getData).toBeCalledTimes(1);
      expect(getData).toBeCalledWith('/api/search', { lang: 'lang', zip: 90210 });
    });

    it('should return the weather data correctly transformed', async () => {
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
      const expectedError = new Error('mock-expected-error');
      getData.mockImplementationOnce(() => Promise.reject(expectedError));
      await getWeatherData({ zip: 90210 });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });

    it('should thrown an handled error if the response from the getData contains success false', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockResolvedValue({
        success: false,
        message: 'mock-expected-error',
      });
      await getWeatherData({ zip: 90210 });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('setWeatherData', () => {
    it('should correctly call postData', async () => {
      await setWeatherData({ mock: 'data' });
      expect(postData).toHaveBeenCalledTimes(1);
      expect(postData).toHaveBeenCalledWith('/api/add', { mock: 'data' });
    });

    it('should return the response received from postData', async () => {
      const response = await setWeatherData({ mock: 'data' });
      expect(response).toStrictEqual({ success: true });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      postData.mockRejectedValueOnce(expectedError);
      await setWeatherData({ mock: 'data' });
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });

  describe('getAllWeatherData', () => {
    beforeAll(() => {
      getData.mockImplementation(() => Promise.resolve([
        { mock: 'entry1' },
        { mock: 'entry2' }
      ]));
    });

    it('should correctly call getData', async () => {
      await getAllWeatherData();
      expect(getData).toBeCalledTimes(1);
      expect(getData).toBeCalledWith('/api/all');
    });

    it('should return all the stored weather data', async () => {
      const response = await getAllWeatherData();
      expect(response).toStrictEqual([
        { mock: 'entry1' },
        { mock: 'entry2' }
      ]);
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('mock-expected-error');
      getData.mockImplementationOnce(() => Promise.reject(expectedError));
      await getAllWeatherData();
      expect(handleErrorAndReject).toBeCalledTimes(1);
      expect(handleErrorAndReject).toBeCalledWith(expectedError);
    });
  });
});
