describe('app', () => {
  const MOCK_ZIP = '12345';

  const mockFetchJson = jest.fn().mockResolvedValue({ john: 'cena' });

  let fetchSpy;
  let fetchInGlobal = true;

  beforeAll(() => {
    if (!('fetch' in global)) {
      fetchInGlobal = false;
      global.fetch = jest.fn();
    }
    require('./app'); // eslint-disable-line global-require
  });

  beforeEach(() => {
    mockFetchJson.mockClear();
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: mockFetchJson,
    });
    window.document.body.innerHTML = `
      <input type="text" id="zip" />
      <button id="generate" type="submit">Generate</button>
    `;
    document.getElementById('zip').value = MOCK_ZIP;
    window.document.dispatchEvent(new Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true,
    }));
  });

  afterAll(() => {
    if (!fetchInGlobal) {
      delete global.fetch;
    }
    // delete process.env.BASE_URL;
    // delete process.env.APP_ID;
  });

  describe('clicking on the "generate" button', () => {
    const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

    it('should fetch data from openweathermap and extract the json body content from the response', async () => {
      // $('#generate').click();
      document.getElementById('generate').click();
      await flushPromises();
      // expect(true).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      // expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}zip=${MOCK_ZIP}&appid=${APP_ID}`);
      expect(fetchSpy).toHaveBeenCalledWith(`/api/search?zip=${MOCK_ZIP}`);
      expect(mockFetchJson).toHaveBeenCalledTimes(1);
      // TODO: complete when data will be saved and retrieved on the server
    });
  });
});
