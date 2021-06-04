describe('app', () => {
  const MOCK_CITY = 'mock-city';

  let fetchSpy;
  let fetchInGlobal = true;
  let projectData = [];

  beforeAll(() => {
    if (!('fetch' in global)) {
      fetchInGlobal = false;
      global.fetch = jest.fn();
    }

    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation((url, params) => {
      switch (true) {
        case url.includes('search'):
          return {
            json: jest.fn().mockResolvedValue({
              success: true,
              results: { name: 'mock-city' },
            }),
          };

        case url.includes('add'):
          projectData.push(params.body);
          return {
            json: jest.fn(),
          };

        case url.includes('all'):
          return {
            json: jest.fn().mockResolvedValue(projectData),
          };

        default:
          return console.log('unexpected url', url); // eslint-disable-line no-console
      }
    });
    require('./app'); // eslint-disable-line global-require
  });

  beforeEach(() => {
    fetchSpy.mockClear();
    projectData = [];
    window.document.body.innerHTML = `
      <input type="text" id="city" />
      <button id="generate" type="submit"></button>
    `;
    document.getElementById('city').value = MOCK_CITY;
    window.document.dispatchEvent(new Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    }));
  });

  afterAll(() => {
    if (!fetchInGlobal) {
      delete global.fetch;
    }
  });

  describe('clicking on the "generate" button', () => {
    const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

    it.only('should correctly fetch data from the server', async () => {
      document.getElementById('generate').click();
      await flushPromises();
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(fetchSpy).toHaveBeenNthCalledWith(1, `/api/search?city=${MOCK_CITY}`);
      expect(fetchSpy).toHaveBeenNthCalledWith(2, '/api/add', expect.objectContaining({
        body: expect.stringContaining('"city":"mock-city"'),
      }));
      expect(fetchSpy).toHaveBeenNthCalledWith(3, '/api/all');
    });
  });
});
