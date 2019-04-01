import sciris from '../dist/sciris-js.js'
import nock from 'nock'
import assert from 'assert';

const host = /.*/;

const TARGET_ORIGIN = "http://localhost.com";

describe('#rpcs', function () {

  before(function() {
    this.jsdom = require('jsdom-global')("<html><body></body></html>", {
            url: TARGET_ORIGIN,
            referrer: TARGET_ORIGIN,
            contentType: "text/html",
            userAgent: "node.js",
            includeNodeLocations: true
        }
    )

  }); 

  after(function () {
    this.jsdom()
  });

  it('.readJsonFromBlob parses correctly', async () => {
    var blob = new Blob([JSON.stringify({hello: "world"}, null, 2)], {type : 'application/json'});
    const result = await sciris.rpcs.readJsonFromBlob(blob);
    assert.equal(result.hello, "world");
  });

  it('.rpc responds correctly', async () => {
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"success": ""})
    await assert.doesNotReject(
      sciris.rpc("helloworld", ["sup"], {})
    )
  });

  it('.rpc rejects correctly', async () => {
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"error": ""})
    await assert.rejects(
      sciris.rpc("helloworld", ["sup"], {}),
      Error
    )
  });

  it('.upload responds correctly', async () => {
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"success": ""});

    await assert.doesNotReject(
      sciris.upload("helloworld", ["sup"], {}, "jpeg")
    )
  });

  it('.download responds correctly', async () => {
    // needs manual testing
  });

});
