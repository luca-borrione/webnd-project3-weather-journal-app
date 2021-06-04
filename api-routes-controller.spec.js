jest.mock('node-fetch');

process.env.BASE_URL = 'MOCK-BASE-URL';
process.env.APP_ID = 'MOCK-APP-ID';

describe('api-routes-controller', () => {
  let controller;

  beforeEach(() => {
    jest.resetModules();
    controller = require('./api-routes-controller'); // eslint-disable-line global-require
  });

  describe('getAll', () => {
    it('should retrieve an empty array if NO entries have been posted', () => {
      const mockRequest = {};
      const mockResponse = { send: jest.fn() };
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([]);
    });

    it('should retrieve all the stored entries if any have been posted', () => {
      let mockRequest = { body: { john: 'cena' } };
      let mockResponse = { json: jest.fn() };
      controller.postAdd(mockRequest, mockResponse);

      mockRequest = {};
      mockResponse = { send: jest.fn() };
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([{ john: 'cena' }]);
    });
  });

  describe('postAdd', () => {
    it('should store all the entries', () => {
      let mockRequest = { body: { john: 'cena' } };
      let mockResponse = { json: jest.fn() };
      controller.postAdd(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });

      mockRequest = { body: { john: 'done' } };
      mockResponse = { json: jest.fn() };
      controller.postAdd(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });

      mockRequest = {};
      mockResponse = { send: jest.fn() };
      controller.getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([{ john: 'cena' }, { john: 'done' }]);
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
        query: { city: 'mock-city' },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
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
      expect(mockFetch).toHaveBeenCalledWith('MOCK-BASE-URL?appid=MOCK-APP-ID&q=mock-city');
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mock-failure-message', success: false });
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
      expect(mockFetch).toHaveBeenCalledWith('MOCK-BASE-URL?appid=MOCK-APP-ID&q=mock-city');
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ results: { data: 'mock-results-data' }, success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => { throw new Error('mock-error-message'); }),
      });
      await controller.getSearch(mockRequest, mockResponse, mockNext);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('MOCK-BASE-URL?appid=MOCK-APP-ID&q=mock-city');
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mock-error-message', success: false });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('mock-error-message'));
    });
  });
});
