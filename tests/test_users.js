import sciris from '../dist/sciris-js.js'
import nock from 'nock'
import assert from 'assert';

const host = /.*/;

const TARGET_ORIGIN = "http://localhost.com";

describe('#users', function () {

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

  it('loginCall succeeds correctly', async () => {
    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    await assert.doesNotReject(
      sciris.loginCall("username", "password")
    );

  });

});
