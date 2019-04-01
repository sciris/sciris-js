import sciris from '../dist/sciris-js.js'
import nock from 'nock'
import assert from 'assert';

const host = /.*/;

const TARGET_ORIGIN = "http://localhost.com";

describe('#tasks', function () {

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

  it('getTaskResultWaiting succeeds correctly', async () => {
    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    await assert.doesNotReject(
      sciris.getTaskResultWaiting("task_1", 1, "tests", [], {})
    )
  });

  it('getTaskResultPolling succeeds correctly', async () => {

    // launch_task
    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    // check_task: queued 
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"task": {"status": "queued"}});

    // chec_task: completed
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"task": {"status": "completed"}});

    // get results
    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    // delete task
    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    await assert.doesNotReject(
      sciris.getTaskResultPolling("task_1", 1, "tests", [], {})
    )
  });

  it('getTaskResultPolling fails correctly', async () => {

    // launch_task
    nock(TARGET_ORIGIN)
      .post('/api/rpcs', )
      .once()
      .reply(200, {"success": ""});

    // check_task: queued 
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"task": {"status": "queued"}});

    // chec_task: completed
    nock(TARGET_ORIGIN)
      .post('/api/rpcs')
      .once()
      .reply(200, {"task": {"status": "error", "errorText": "failing"}});

    await assert.rejects(
      sciris.getTaskResultPolling("task_1", 1, "tests", [], {}),
      Error,
      "failing"
    )
  });

});
