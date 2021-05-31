const request = require('supertest');
const net = require('net');

function portUsed(port) {
  return new Promise((resolve) => {
    const netServer = net.createServer();

    netServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      }
    });

    netServer.once('listening', () => {
      netServer.close();
      resolve(false);
    });

    netServer.listen(port);
  });
}

describe('server', () => {
  const MOCK_POST_ROUTE = '/post-mock-route';

  let app;
  let server;
  let serverRouteHandlers;
  let expressStaticSpy;

  function closeServer() {
    if (server) {
      server.close();
    }
  }

  function requireServer() {
    closeServer();
    jest.resetModules();
    const express = require('express'); // eslint-disable-line global-require
    expressStaticSpy = jest.spyOn(express, 'static');
    const serverModule = require('./server'); // eslint-disable-line global-require
    app = serverModule.app;
    server = serverModule.server;
    serverRouteHandlers = serverModule.routeHandlers;
    app.post(MOCK_POST_ROUTE, (req, res) => res.send(req.body));
  }

  beforeEach(async () => {
    requireServer();
  });

  afterEach(() => {
    closeServer();
    delete process.env.PORT;
  });

  it('should implement CORS', async () => {
    const response = await request(app).get('/');
    expect(response.headers['access-control-allow-origin']).toEqual('*');
  });

  it('should parse json', async () => {
    const response = await request(app)
      .post(MOCK_POST_ROUTE)
      .send({ name: 'john' });

    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toStrictEqual({ name: 'john' });
  });

  it('should parse urlencoded strings with the querystring library', async () => {
    const response = await request(app)
      .post(MOCK_POST_ROUTE)
      .send('foo[bar][baz]=foobarbaz');

    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toStrictEqual({ 'foo[bar][baz]': 'foobarbaz' });
  });

  it('should use process.env.PORT if set', async () => {
    process.env.PORT = 3333;
    requireServer();
    const result = await portUsed(3333);
    expect(result).toBe(true);
  });

  it('should default to port 3000 if process.env.PORT if not set', async () => {
    delete process.env.PORT;
    requireServer();
    const result = await portUsed(3000);
    expect(result).toBe(true);
  });

  it('should initialise the main project folder', async () => {
    expect(expressStaticSpy).toHaveBeenCalledTimes(1);
    expect(expressStaticSpy).toHaveBeenCalledWith('website');
  });

  describe('Routes', () => {
    const mockRequest = () => ({});
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      res.send = jest.fn().mockReturnValue(res);
      return res;
    };

    it('GET an undefined route should return status 404', async () => {
      const response = await request(app).get('/undefined-mock-route');
      expect(response.status).toBe(404);
    });

    it('GET default route /: should render index.html', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/html; charset=UTF-8');
      const req = mockRequest();
      const res = mockResponse();
      await serverRouteHandlers['/'](req, res);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith('index.html');
    });
  });
});
