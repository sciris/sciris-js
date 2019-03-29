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
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"success": ""})

    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"error": ""})
  }); 

  after(function () {
    this.jsdom()
  });

  it('what happens', async () => {
    const response_1 = await sciris.rpc("helloworld", ["sup"], {});
    console.log(response_1.data);
    const response_2 = await sciris.rpc("helloworld", ["sup"], {});
  });

});
