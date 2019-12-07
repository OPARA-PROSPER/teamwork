/* eslint-disable no-undef */
require('dotenv').config();
const request = require('request');
// const express = require('express');

describe('Api', () => {
  const url = 'https://29f0584e.ngrok.io/api/v1/auth';
  // let server;

  // beforeAll((done) => {
    // server = express();
    // server.listen(4000, () => 'server is listening');
    // done();
  // });

  describe('client request to get all users', () => {
    it('without an admin token should return status code of 400', (done) => {
      request.get(url, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('with an admin token should return a status code of 200', (done) => {
      request({ url, headers: { Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsIm5hbWUiOiJvYmltbWEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NzU2OTU1ODAsImV4cCI6MTU3NTc4MTk4MH0.wHhN1JgsD1fyfsQQfYDhWy7psOGA9Rn4-buocXfioIE' } }, (error, response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('with an admin token should return a status of success', (done) => {
      request(
        { url, headers: { Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsIm5hbWUiOiJvYmltbWEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NzU2OTU1ODAsImV4cCI6MTU3NTc4MTk4MH0.wHhN1JgsD1fyfsQQfYDhWy7psOGA9Rn4-buocXfioIE' } },
        (error, response, body) => {
          expect(JSON.parse(body).status).toBe('success');
          done();
        },
      );
    });
  });
});
