describe('utils', () => {
  let fetchSpy;
  let fetchInGlobal = true;
  let utils;

  beforeAll(() => {
    if (!('fetch' in global)) {
      fetchInGlobal = false;
      global.fetch = jest.fn();
    }

    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => ({
      json: jest.fn().mockResolvedValue({ mock: 'response' }),
    }));

    utils = require('./utils'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (!fetchInGlobal) {
      delete global.fetch;
    }
  });

  describe('postData', () => {
    it('should correctly trigger a POST fetch call', async () => {
      await utils.postData('mock-url', { mock: 'data' });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('mock-url', {
        body: '{"mock":"data"}',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    });

    it('should return any response retrieved from the fetch call in a json format', async () => {
      const response = await utils.postData('mock-url', { mock: 'data' });
      expect(response).toStrictEqual({ mock: 'response' });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('expected error');
      fetchSpy.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      await utils.postData('mock-url', { mock: 'data' });
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should return null in case of error', async () => {
      const expectedError = new Error('expected error');
      fetchSpy.mockRejectedValueOnce(expectedError);
      jest.spyOn(console, 'error').mockImplementation();
      const response = await utils.postData('mock-url', { mock: 'data' });
      expect(response).toBeNull();
    });
  });

  describe('getData', () => {
    it('should trigger a GET fetch call adding the query params if present', async () => {
      const queryParams = { mock: 'param', john: 'cena' };
      await utils.getData('mock-url', queryParams);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('mock-url?mock=param&john=cena');
    });

    it('should trigger a GET fetch call with only the base url if no query params are passed', async () => {
      await utils.getData('mock-url');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('mock-url');
    });

    it('should return any response retrieved from the fetch call in a json format', async () => {
      const response = await utils.getData('mock-url');
      expect(response).toStrictEqual({ mock: 'response' });
    });

    it('should handle an error nicely', async () => {
      const expectedError = new Error('expected error');
      fetchSpy.mockRejectedValueOnce(expectedError);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      await utils.getData('mock-url');
      expect(errorSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledWith(expectedError);
    });

    it('should return null in case of error', async () => {
      const expectedError = new Error('expected error');
      fetchSpy.mockRejectedValueOnce(expectedError);
      jest.spyOn(console, 'error').mockImplementation();
      const response = await utils.getData('mock-url');
      expect(response).toBeNull();
    });
  });

  describe('getNavigatorLanguage', () => {
    const mockNavigator = {};

    const defineNavigatorProperty = (key, value = key) => {
      // eslint-disable-next-line no-proto
      if (!Object.keys(navigator.__proto__).includes(key)) {
        Object.defineProperty(navigator, key, {
          configurable: true,
          get() { return value; },
        });
      }
    };

    beforeAll(() => {
      defineNavigatorProperty('languages');
      defineNavigatorProperty('userLanguage');
      defineNavigatorProperty('language');
      defineNavigatorProperty('browserLanguage');
      defineNavigatorProperty('systemLanguage');
      mockNavigator.languages = jest.spyOn(navigator, 'languages', 'get').mockReturnValue(['first-LANG']);
      mockNavigator.userLanguage = jest.spyOn(navigator, 'userLanguage', 'get').mockReturnValue('userLanguage');
      mockNavigator.language = jest.spyOn(navigator, 'language', 'get').mockReturnValue('language');
      mockNavigator.browserLanguage = jest.spyOn(navigator, 'browserLanguage', 'get').mockReturnValue('browserLanguage');
      mockNavigator.systemLanguage = jest.spyOn(navigator, 'systemLanguage', 'get').mockReturnValue('systemLanguage');
    });

    afterAll(() => {
      jest.restoreAllMocks();
      delete navigator.languages;
      delete navigator.userLanguage;
      delete navigator.language;
      delete navigator.browserLanguage;
      delete navigator.systemLanguage;
    });

    describe('if navigator.languages is defined', () => {
      it('should return the first item in the navigator.languages', () => {
        const locale = utils.getNavigatorLanguage();
        expect(locale).toBe('first-LANG');
      });
    });

    describe('if navigator.languages is not defined', () => {
      beforeEach(() => {
        mockNavigator.languages.mockReturnValue();
      });

      describe('if navigator.userLanguage is defined', () => {
        it('should return navigator.userLanguage', () => {
          const locale = utils.getNavigatorLanguage();
          expect(locale).toBe('userLanguage');
        });
      });

      describe('if navigator.userLanguage is not defined', () => {
        beforeEach(() => {
          mockNavigator.userLanguage.mockReturnValue();
        });

        describe('if navigator.language is defined', () => {
          it('should return navigator.language', () => {
            const locale = utils.getNavigatorLanguage();
            expect(locale).toBe('language');
          });
        });

        describe('if navigator.language is not defined', () => {
          beforeEach(() => {
            mockNavigator.language.mockReturnValue();
          });

          describe('if navigator.browserLanguage is defined', () => {
            it('should return navigator.browserLanguage', () => {
              const locale = utils.getNavigatorLanguage();
              expect(locale).toBe('browserLanguage');
            });
          });

          describe('if navigator.browserLanguage is not defined', () => {
            beforeEach(() => {
              mockNavigator.browserLanguage.mockReturnValue();
            });

            it('should return navigator.systemLanguage', () => {
              const locale = utils.getNavigatorLanguage();
              expect(locale).toBe('systemLanguage');
            });
          });
        });
      });
    });
  });
});
