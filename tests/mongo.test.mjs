import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(
    resolve(import.meta.dirname, '../src/libs/mongo/index.ts'),
    'utf8',
  ),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

class MongoServerSelectionError extends Error {}

function loadMongo({ connect, close, env = {} } = {}) {
  const clients = [];
  const logs = [];
  class MongoClient {
    constructor(uri, options) {
      this.options = options;
      this.closed = false;
      clients.push(this);
    }
    connect() {
      return connect ? connect(this, clients.length) : Promise.resolve(this);
    }
    async close() {
      this.closed = true;
      if (close) await close();
    }
    db(name) {
      return { name, client: this };
    }
  }
  const context = {
    exports: {},
    global: {},
    process: {
      env: { NODE_ENV: 'production', MONGODB_URI: 'mongodb://test', ...env },
    },
    console: { error: (...args) => logs.push(args) },
    require: (name) => {
      assert.equal(name, 'mongodb');
      return { MongoClient, MongoServerSelectionError };
    },
  };
  runInNewContext(source, context);
  return {
    ...context.exports,
    context,
    clients,
    logs,
    MongoServerSelectionError,
  };
}

test('import is lazy and concurrent requests reuse one production client', async () => {
  let finish;
  const mongo = loadMongo({
    connect: (client) =>
      new Promise((resolve) => (finish = () => resolve(client))),
  });
  assert.equal(mongo.clients.length, 0);
  const first = mongo.getMongoClient();
  const second = mongo.getMongoClient();
  assert.equal(first, second);
  assert.equal(mongo.clients.length, 1);
  finish();
  const client = await first;
  assert.equal(await mongo.getMongoClient(), client);
  assert.equal((await mongo.getDatabase()).name, 'camara');
  assert.equal(client.closed, false);
});

test('a failed connection is released and the next requests recover together', async () => {
  const failure = new Error('temporary outage');
  const mongo = loadMongo({
    connect: (client, attempt) =>
      attempt === 1 ? Promise.reject(failure) : Promise.resolve(client),
    close: () => Promise.reject(new Error('cleanup failure')),
  });
  const results = await Promise.allSettled([
    mongo.getDatabase(),
    mongo.getDatabase(),
  ]);
  for (const result of results) {
    assert.equal(result.status, 'rejected');
    assert.equal(result.reason, failure);
  }
  assert.equal(mongo.clients.length, 1);
  assert.equal(mongo.clients[0].closed, true);
  const [first, second] = await Promise.all([
    mongo.getDatabase(),
    mongo.getDatabase(),
  ]);
  assert.equal(mongo.clients.length, 2);
  assert.equal(first.client, second.client);
  assert.equal(first.client.closed, false);
});

test('server selection diagnostics omit error messages and credentials', async () => {
  const failure = new MongoServerSelectionError('secret connection string');
  failure.reason = {
    servers: new Map([
      [
        'test:27017',
        {
          address: 'test:27017',
          type: 'Unknown',
          error: { name: 'MongoNetworkError', cause: { code: 'ETIMEDOUT' } },
        },
      ],
    ]),
  };
  const failing = loadMongo({ connect: () => Promise.reject(failure) });
  await assert.rejects(failing.getDatabase(), (error) => error === failure);
  const logged = JSON.stringify(failing.logs);
  assert.match(logged, /ETIMEDOUT/);
  assert.doesNotMatch(logged, /secret connection string|mongodb:\/\//);
});

test('missing configuration fails only when queried and respects the database name', async () => {
  const missing = loadMongo({ env: { MONGODB_URI: undefined } });
  await assert.rejects(missing.getDatabase(), /MONGODB_URI/);
  assert.equal(missing.clients.length, 0);
  const configured = loadMongo({ env: { MONGODB_DB: 'custom' } });
  assert.equal((await configured.getDatabase()).name, 'custom');
});
