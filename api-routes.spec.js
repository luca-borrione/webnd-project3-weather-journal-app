describe('api-routes', () => {
  let routeSpy;
  let routeGetSpy;
  let routePostSpy;

  function prepareRouteSpies(path) {
    const express = require('express'); // eslint-disable-line global-require

    routeGetSpy = jest.fn();
    routePostSpy = jest.fn();
    routeSpy = jest.fn().mockImplementation((routePath) => {
      if (routePath === path) {
        return {
          get: routeGetSpy,
          post: routePostSpy,
        };
      }
      return {
        get: jest.fn(),
        post: jest.fn(),
      };
    });
    jest.spyOn(express, 'Router').mockReturnValueOnce({
      route: routeSpy,
    });
    require('./api-routes'); // eslint-disable-line global-require
  }

  beforeEach(() => {
    jest.resetModules();
  });

  it('should match the routes stored in the snapshot', () => {
    prepareRouteSpies();
    expect(routeSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "/add",
        ],
        Array [
          "/all",
        ],
        Array [
          "/search",
        ],
      ]
    `);
  });

  it('should correctly set the route for /add', () => {
    const route = '/add';
    prepareRouteSpies(route);
    const routeIndex = routeSpy.mock.calls.findIndex((mockCall) => mockCall[0] === route);
    expect(routeIndex).toBeGreaterThanOrEqual(0);
    const callback = routePostSpy.mock.calls[0][0];
    expect(callback.name).toBe('postAdd');
  });

  it('should correctly set the route for /all', () => {
    const route = '/all';
    prepareRouteSpies(route);
    const routeIndex = routeSpy.mock.calls.findIndex((mockCall) => mockCall[0] === route);
    expect(routeIndex).toBeGreaterThanOrEqual(0);
    const callback = routeGetSpy.mock.calls[0][0];
    expect(callback.name).toBe('getAll');
  });

  it('should correctly set the route for /search', () => {
    const route = '/search';
    prepareRouteSpies(route);
    const routeIndex = routeSpy.mock.calls.findIndex((mockCall) => mockCall[0] === route);
    expect(routeIndex).toBeGreaterThanOrEqual(0);
    const callback = routeGetSpy.mock.calls[0][0];
    expect(callback.name).toBe('getSearch');
  });
});
