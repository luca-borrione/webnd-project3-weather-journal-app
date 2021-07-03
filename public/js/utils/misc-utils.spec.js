import { getNavigatorLanguage } from './misc-utils';

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
      const locale = getNavigatorLanguage();
      expect(locale).toBe('first-LANG');
    });
  });

  describe('if navigator.languages is not defined', () => {
    beforeEach(() => {
      mockNavigator.languages.mockReturnValue();
    });

    describe('if navigator.userLanguage is defined', () => {
      it('should return navigator.userLanguage', () => {
        const locale = getNavigatorLanguage();
        expect(locale).toBe('userLanguage');
      });
    });

    describe('if navigator.userLanguage is not defined', () => {
      beforeEach(() => {
        mockNavigator.userLanguage.mockReturnValue();
      });

      describe('if navigator.language is defined', () => {
        it('should return navigator.language', () => {
          const locale = getNavigatorLanguage();
          expect(locale).toBe('language');
        });
      });

      describe('if navigator.language is not defined', () => {
        beforeEach(() => {
          mockNavigator.language.mockReturnValue();
        });

        describe('if navigator.browserLanguage is defined', () => {
          it('should return navigator.browserLanguage', () => {
            const locale = getNavigatorLanguage();
            expect(locale).toBe('browserLanguage');
          });
        });

        describe('if navigator.browserLanguage is not defined', () => {
          beforeEach(() => {
            mockNavigator.browserLanguage.mockReturnValue();
          });

          it('should return navigator.systemLanguage', () => {
            const locale = getNavigatorLanguage();
            expect(locale).toBe('systemLanguage');
          });
        });
      });
    });
  });
});
