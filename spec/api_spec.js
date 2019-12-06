const request = require('request');

describe('Users Controller ', () => {
  let server;

  beforeAll(() => {
    server = require('../server');
  });
  afterAll(() => {
    server.close();
  });

  describe("getAllUsers ", () => {
    let data = {};
    beforeAll((done) => {
      request.get('localhost:3000/api/v1/auth', (error, response, body) => {
        data.status = response.statusCode;
        data.body = body;
        done();
      });

      it('status 200', () => {
        expect(data.status).toBe(200);
      });
    });
  });
});
