// progress-indicator-service.js -- functions for showing progress
//
// Last update: 8/12/18 (gchadder3)

// Note: To use these functions, you need to pass in the Vue instance, this. 
// Also, the caller needs to have imported the Spinner.vue PopupSpinner 
// component and instantiated it.

import EventBus from '../eventbus.js';
import { events } from '../eventbus.js';

var complete = 0.0; // Put this here so it's global

function start(vm, message) {
  if (!message) { message = 'Starting progress' }
  var delay = 100;
  var stepsize = 1.0;
  complete = 0.0; // Reset this
  console.log(message)
  setTimeout(function run() { // Run in a delay loop
    setFunc();
    if (complete<99) {
      setTimeout(run, delay);
    }
  }, delay);
  function setFunc() {
    complete = complete + stepsize*(1-complete/100); // Increase asymptotically
    EventBus.$emit(events.EVENT_STATUS_UPDATE, vm, complete)
  }
  EventBus.$emit(events.EVENT_STATUS_START, vm)
}

function succeed(vm, successMessage) {
  console.log(successMessage)
  complete = 100; // End the counter

  var notif = {}
  if (successMessage !== '') { // Success popup.
    notif = {
      message: successMessage,
      icon: 'ti-check',
      type: 'success',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 20000000
    }
  }  
  EventBus.$emit(events.EVENT_STATUS_SUCCEED, vm, notif);
}

function fail(vm, failMessage, error) {
  console.log(failMessage)
  var error = error || {
    "message": "unknown message"
  };
  var msgsplit = error.message.split('Exception details:') // WARNING, must match sc_app.py
  var usermsg = msgsplit[0].replace(/\n/g,'<br>')
  console.log(error.message)
  console.log(usermsg)
  complete = 100;

  var notif = {}
  if (failMessage !== '') {  // Put up a failure notification.
    notif = {
      message: '<b>' + failMessage + '</b>' + '<br><br>' + usermsg,
      icon: 'ti-face-sad',
      type: 'warning',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 0
    }
  }  
  EventBus.$emit(events.EVENT_STATUS_FAIL, vm, notif);
}

export default {
  start,
  succeed,
  fail,
}

export {
  events 
}
