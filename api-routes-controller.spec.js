jest.mock('node-fetch');

const mockFetch = require('node-fetch');

process.env.BASE_URL = 'MOCK-BASE-URL';
process.env.APP_ID = 'MOCK-APP-ID';

const { getAll, getSearch } = require('./api-routes-controller');

describe('api-routes-controller', () => {
  const createMockRequest = () => ({});

  describe('getAll', () => {
    const createMockResponse = () => ({
      send: jest.fn(),
    });

    it('should send the content of all the stored searches so far', async () => {
      const mockRequest = createMockRequest();
      const mockResponse = createMockResponse();
      await getAll(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.send).toHaveBeenCalledWith([]);
    });
  });

  describe('getSearch', () => {
    let mockRequest;
    let mockResponse;

    const createMockResponse = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    });

    beforeEach(() => {
      mockFetch.mockClear();
      mockRequest = createMockRequest();
      mockRequest.query = { zip: 'mock-zip' };
      mockResponse = createMockResponse();
    });

    it('should be unsuccessful and send the failure message when the remote api responds with a non-ok status', async () => {
      const MOCK_FETCH_STATUS = 401;
      mockFetch.mockReturnValueOnce({
        status: MOCK_FETCH_STATUS,
        json: jest.fn().mockReturnValueOnce({
          message: 'mock-failure-message',
        }),
      });
      await getSearch(mockRequest, mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('MOCK-BASE-URL?appid=MOCK-APP-ID&zip=mock-zip');
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(MOCK_FETCH_STATUS);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mock-failure-message', success: false });
    });

    it('should be successful and send the results data when the remote api responds with an ok status', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockReturnValueOnce({ data: 'mock-results-data' }),
      });
      await getSearch(mockRequest, mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('MOCK-BASE-URL?appid=MOCK-APP-ID&zip=mock-zip');
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ results: { data: 'mock-results-data' }, success: true });
    });

    it('should be unsuccessful and send the error message when an error occurs', async () => {
      mockFetch.mockReturnValueOnce({
        status: 200,
        json: jest.fn().mockImplementationOnce(() => { throw new Error('mock-error-message'); }),
      });
      await getSearch(mockRequest, mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('MOCK-BASE-URL?appid=MOCK-APP-ID&zip=mock-zip');
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toBeCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'mock-error-message', success: false });
    });
  });
});
