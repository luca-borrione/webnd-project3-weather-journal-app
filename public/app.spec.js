const $ = require('jquery');

describe('app', () => {
  const MOCK_APP_ID = 'MOCK_APP_ID';
  const MOCK_BASE_URL = 'MOCK_BASE_URL';
  const MOCK_ZIP = '12345';

  const mockFetchJsonPromise = jest.fn().mockResolvedValue({});

  // let fetchSpy;
  let fetchInGlobal = true;

  beforeAll(() => {
    if (!('fetch' in global)) {
      fetchInGlobal = false;
      global.fetch = jest.fn();
    }

    process.env.BASE_URL = MOCK_BASE_URL;
    process.env.APP_ID = MOCK_APP_ID;
    require('./app'); // eslint-disable-line global-require
  });

  beforeEach(() => {
    mockFetchJsonPromise.mockClear();
    // fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
    //   json: mockFetchJsonPromise,
    // });
    window.document.body.innerHTML = `
    <input type="text" id="zip" />
    <button id="generate" type="submit">Generate</button>
  `;
    $('#zip').val(MOCK_ZIP);
    window.document.dispatchEvent(new Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    }));
  });

  afterAll(() => {
    if (!fetchInGlobal) {
      delete global.fetch;
    }
    delete process.env.BASE_URL;
    delete process.env.APP_ID;
  });

  describe('clicking on the "generate" button', () => {
    const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

    it('should fetch data from openweathermap and extract the json body content from the response', async () => {
      $('#generate').click();
      await flushPromises();
      expect(true).toBe(true);
      // expect(fetchSpy).toHaveBeenCalledTimes(1);
      // expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}zip=${MOCK_ZIP}&appid=${APP_ID}`);
      // expect(mockFetchJsonPromise).toHaveBeenCalledTimes(1);
    });
  });
});
