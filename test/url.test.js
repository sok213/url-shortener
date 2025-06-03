const assert = require('assert');
const request = require('supertest');
const Module = require('module');
const http = require('http');
const path = require('path');

describe('URL Shortener', function() {
  let server;
  const data = [];
  let idCounter = 0;

  function generateId() {
    idCounter++;
    const num = idCounter.toString().padStart(6, '0');
    return '0000000000000000' + num;
  }

  const mockMongo = {
    MongoClient: {
      connect: (uri, cb) => {
        const collection = () => ({
          find: query => ({
            count: cb => {
              const key = query.short_url ? 'short_url' : 'original_url';
              const val = query[key];
              const count = data.filter(d => d[key] === val).length;
              cb(null, count);
            },
            forEach: fn => {
              const key = query.short_url ? 'short_url' : 'original_url';
              const val = query[key];
              data.filter(d => d[key] === val).forEach(fn);
            }
          }),
          insert: doc => {
            const newDoc = Object.assign({}, doc, { _id: generateId() });
            data.push(newDoc);
          },
          update: (query, update) => {
            const key = Object.keys(query)[0];
            data.forEach(d => {
              if (d[key] === query[key]) Object.assign(d, update.$set);
            });
          }
        });
        cb(null, { collection, close: () => {} });
      }
    }
  };

  before(function() {
    // patch mongodb and http.createServer
    const originalLoad = Module._load;
    Module._load = function(request, parent, isMain) {
      if (request === 'mongodb') return mockMongo;
      return originalLoad.apply(this, arguments);
    };

    const origCreate = http.createServer;
    http.createServer = function() {
      server = origCreate.apply(this, arguments);
      return server;
    };

    // require server after patches
    require(path.join('..', 'dist', 'server.js'));

    // restore createServer
    http.createServer = origCreate;
    this.ModuleLoad = Module._load;
    this.origLoad = originalLoad;
    Module._load = originalLoad; // but we already restored
  });

  after(function() {
    if (server && server.close) server.close();
  });

  it('should create a new short URL', function(done) {
    request(server)
      .get('/example.com')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.ok(res.body.original_url);
        assert.ok(res.body.short_url);
        done();
      });
  });
});
