jest.mock('node-fetch');

describe('api-routes-controller', () => {
  let controller;
  let entry1;
  let entry2;

  beforeEach(() => {
    process.env.APP_ID = 'MOCK-APP-ID';
    jest.resetModules();
    controller = require('./api-routes-controller'); // eslint-disable-line global-require

    entry1 = {
      entry: 1,
      id: 'mock-id-entry1',
    };

    entry2 = {
      entry: 2,
      id: 'mock-id-entry2',
    };
  });

  const postEntry = (entry) => {
    const mockRequest = { body: entry };
    const mockResponse = { json: jest.fn() };
    controller.postAdd(mockRequest, mockResponse);
    return mockResponse;
  };

  describe('getAll', () => {
    it('should retrieve an empty array if NO entries have been posted', () => {
      const mockRequest = {};
      const mockResponse = { send: jest.fn() };
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([]);
    });

    it('should retrieve all the stored entries if any have been posted', () => {
      const mockRequest = {};
      const mockResponse = { send: jest.fn() };

      postEntry(entry1);
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([entry1]);

      mockResponse.send.mockClear();

      postEntry(entry2);
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([entry1, entry2]);
    });
  });

  describe('postAdd', () => {
    it('should always respond with a success flag', () => {
      const mockResponse = postEntry(entry1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should store all the entries', () => {
      postEntry(entry1);
      postEntry(entry2);

      const mockRequest = {};
      const mockResponse = { send: jest.fn() };
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([entry1, entry2]);
    });

    it('should remove the previously stored entry if one with the same id is sent again', () => {
      postEntry(entry1);
      postEntry(entry2);
      postEntry(entry1);

      const mockRequest = {};
      const mockResponse = { send: jest.fn() };
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([entry2, entry1]);
    });
  });

  describe('getSearch', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockFetch;

    beforeEach(() => {
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      mockRequest = {
        query: {
          lang: 'mock-lang',
          zip: 'mock-zip',
        },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    const requiredParams = {
      appid: 'MOCK-APP-ID',
      lang: 'mock-lang',
      zip: 'mock-zip',
    };

    it('should call fetch with the expected protocol hostname and pathname', async () => {
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(parsedUrl.protocol).toBe('http:');
      expect(parsedUrl.hostname).toBe('api.openweathermap.org');
      expect(parsedUrl.pathname).toBe('/data/2.5/weather');
    });

    it('should call fetch sending the required params in the query', async () => {
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
      const queryParams = Object.fromEntries(new URLSearchParams(parsedUrl.search));
      expect(queryParams).toMatchObject(expect.objectContaining(requiredParams));
    });

    it('should call fetch sending undefined appid if not set in the env', async () => {
      delete process.env.APP_ID;
      jest.mock('dotenv', () => ({
        config: jest.fn().mockImplementationOnce(() => { }),
      }));
      jest.resetModules();
      controller = require('./api-routes-controller'); // eslint-disable-line global-require
      mockFetch = require('node-fetch'); // eslint-disable-line global-require
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const parsedUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(parsedUrl.searchParams.get('appid')).toBe('undefined');
    });

    it('should be unsuccessful and send the failure message when the remote api responds with a non-ok status', async () => {
      const MOCK_FETCH_STATUS = 401;
      mockFetch.mockReturnValueOnce({
        status: MOCK_FETCH_STATUS,
        json: jest.fn().mockReturnValueOnce({
          message: 'mock-failure-message',
        }),
      });
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-failure-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('mock-failure-message');
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        results: { data: 'mock-results-data' },
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => {
          throw new Error('mock-error-message');
        }),
      });
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'mock-error-message',
        success: false,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
  });
});
