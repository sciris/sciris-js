import sciris from '../dist/sciris-js.js'
import nock from 'nock'

const host = /.*/;

const TARGET_ORIGIN = "http://localhost.com";

describe('Check RPCs', function () {

  before(function() {
    this.jsdom = require('jsdom-global')("<html><body></body></html>", {
            url: TARGET_ORIGIN,
            referrer: TARGET_ORIGIN,
            contentType: "text/html",
            userAgent: "node.js",
            includeNodeLocations: true
        }
    )
    const scope = nock(TARGET_ORIGIN)
      .post('/api/rpcs').reply(200)
  }); 

  after(function () {
    this.jsdom()
  });

  it('what happens', async () => {
    const response = await sciris.rpc("helloworld", [], {});
    console.log(response);
  });

});
