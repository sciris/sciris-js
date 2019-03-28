/** @module status */

// progress-indicator-service.js -- functions for showing progress
//
// Last update: 8/12/18 (gchadder3)

// Note: To use these functions, you need to pass in the Vue instance, this. 
// Also, the caller needs to have imported the Spinner.vue PopupSpinner 
// component and instantiated it.

import EventBus from '../eventbus.js';
import { events } from '../eventbus.js';

var complete = 0.0; // Put this here so it's global

/**
 * Trigger the UI attributes associated with start of an action, this includes
 * a Spinner and a thin progess bar on the top of the window. A message will 
 * also be printed in side the console.
 *
 * @function
 * @param {string} vm - Vue instance that is mounted
 * @param {string} message - The message to show inside the console
 */
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

/**
 * Turn off all of the UI elements associated with services.start and trigger a 
 * successful notification pop up on the right side of the window. A message 
 * will also be printed in side the console.
 *
 * @function
 * @param {string} vm - Vue instance that is mounted
 * @param {string} successMessage - The message to show inside the console and notification popup
 */
function succeed(vm, successMessage) {
  console.log(successMessage);
  complete = 100; // End the counter

  var notif = {}
  if (successMessage !== '') { // Success popup.
    notif = {
      message: successMessage,
      icon: 'ti-check',
      type: 'success',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 2000
    }
  }  
  EventBus.$emit(events.EVENT_STATUS_SUCCEED, vm, notif);
}

/**
 * Turn off all of the UI elements associated with services.start and trigger a 
 * failed notification pop up on the right side of the window. A message 
 * will also be printed in side the console.
 *
 * @function
 * @param {string} vm - Vue instance that is mounted
 * @param {string} failMessage - The message to show inside the console and notification popup
 * @param {string} error - The message to show inside the console and notification popup
 */
function fail(vm, failMessage, error) {
  console.log(failMessage)
  if (error) {
    // WARNING, must match sc_app.py
    var msgsplit = error.message.split('Exception details:'); 
    var usererr = msgsplit[0].replace(/\n/g,'<br>');
    console.log(error.message);
    console.log(usererr);
    var usermsg = '<b>' + failMessage + '</b>' + '<br><br>' + usererr;
  } else {
    var usermsg = '<b>' + failMessage + '</b>';
  }
  complete = 100;
  var notif = {};

  // Put up a failure notification.
  if (failMessage !== '') {  
    notif = {
      message: usermsg,
      icon: 'ti-face-sad',
      type: 'warning',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 0
    }
  }  
  EventBus.$emit(events.EVENT_STATUS_FAIL, vm, notif);
}

/**
 * Show a neutral notification pop up on the right side of the window. 
 * A message will also be printed in side the console.
 *
 * @function
 * @param {string} vm - Vue instance that is mounted
 * @param {string} notifyMessage - The message to show inside the console and notification popup
 */
function notify(vm, notifyMessage) {
  console.log(notifyMessage);
  complete = 100; // End the counter

  var notif = {}
  if (notifyMessage !== '') { // Notification popup.
    notif = {
      message: notifyMessage,
      icon: 'ti-info',
      type: 'warning',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 2000
    }
  }  
  EventBus.$emit(events.EVENT_STATUS_NOTIFY, vm, notif);
}

export default {
  start,
  succeed,
  fail,
  notify,
}
