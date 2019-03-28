/*!
 * sciris-js v0.2.10
 * (c) 2019-present Sciris <info@sciris.org>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var axios = _interopDefault(require('axios'));
var saveAs = _interopDefault(require('file-saver'));
var mpld3 = _interopDefault(require('mpld3'));
var sha224 = _interopDefault(require('crypto-js/sha224'));
var epicSpinners = require('epic-spinners');
var VueProgressBar = _interopDefault(require('vue-progressbar'));
var VModal = _interopDefault(require('vue-js-modal'));
var vueClickaway = require('vue-clickaway');
var DialogDrag = _interopDefault(require('vue-dialog-drag'));

const EVENT_STATUS_START = 'status:start';
const EVENT_STATUS_UPDATE = 'status:update';
const EVENT_STATUS_SUCCEED = 'status:success';
const EVENT_STATUS_NOTIFY = 'status:notify';
const EVENT_STATUS_FAIL = 'status:fail';
const events = {
  EVENT_STATUS_START,
  EVENT_STATUS_UPDATE,
  EVENT_STATUS_SUCCEED,
  EVENT_STATUS_NOTIFY,
  EVENT_STATUS_FAIL
};
const EventBus = new Vue();
EventBus.$on(events.EVENT_STATUS_START, vm => {
  if (vm.$spinner) vm.$spinner.start();
});
EventBus.$on(events.EVENT_STATUS_UPDATE, (vm, progress) => {
  if (vm.$Progress) vm.$Progress.set(progress);
});
EventBus.$on(events.EVENT_STATUS_SUCCEED, (vm, notif) => {
  if (vm.$spinner) vm.$spinner.stop();
  if (vm.$Progress) vm.$Progress.finish();
  if (notif && notif.message && vm.$notifications) vm.$notifications.notify(notif);
});
EventBus.$on(events.EVENT_STATUS_NOTIFY, (vm, notif) => {
  if (notif && notif.message && vm.$notifications) vm.$notifications.notify(notif);
});
EventBus.$on(events.EVENT_STATUS_FAIL, (vm, notif) => {
  if (vm.$spinner) vm.$spinner.stop();
  if (vm.$Progress) vm.$Progress.fail();
  if (notif && notif.message && vm.$notifications) vm.$notifications.notify(notif);
});

/** @module status */
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
  if (!message) {
    message = 'Starting progress';
  }

  var delay = 100;
  var stepsize = 1.0;
  complete = 0.0; // Reset this

  console.log(message);
  setTimeout(function run() {
    // Run in a delay loop
    setFunc();

    if (complete < 99) {
      setTimeout(run, delay);
    }
  }, delay);

  function setFunc() {
    complete = complete + stepsize * (1 - complete / 100); // Increase asymptotically

    EventBus.$emit(events.EVENT_STATUS_UPDATE, vm, complete);
  }

  EventBus.$emit(events.EVENT_STATUS_START, vm);
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

  var notif = {};

  if (successMessage !== '') {
    // Success popup.
    notif = {
      message: successMessage,
      icon: 'ti-check',
      type: 'success',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 2000
    };
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
  console.log(failMessage);

  if (error) {
    // WARNING, must match sc_app.py
    var msgsplit = error.message.split('Exception details:');
    var usererr = msgsplit[0].replace(/\n/g, '<br>');
    console.log(error.message);
    console.log(usererr);
    var usermsg = '<b>' + failMessage + '</b>' + '<br><br>' + usererr;
  } else {
    var usermsg = '<b>' + failMessage + '</b>';
  }

  complete = 100;
  var notif = {}; // Put up a failure notification.

  if (failMessage !== '') {
    notif = {
      message: usermsg,
      icon: 'ti-face-sad',
      type: 'warning',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 0
    };
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

  var notif = {};

  if (notifyMessage !== '') {
    // Notification popup.
    notif = {
      message: notifyMessage,
      icon: 'ti-info',
      type: 'warning',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 2000
    };
  }

  EventBus.$emit(events.EVENT_STATUS_NOTIFY, vm, notif);
}

var status = {
  start,
  succeed,
  fail,
  notify
};

/** @module utils */

/**
 * Return a promise that resolves after a set amount of time in milliseconds.
 *
 * @function
 * @async
 * @param {number} time - the amount of time to sleep in  milliseconds
 * @returns {Promise}
 */
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
/**
 * Create a unique filename, if a name already exists then append it with "(x)"
 *
 * @function
 * @param {string} fileName - the name of the new file that you want to have a unique name 
 * @param {string[]} otherNames - the existing filenames that the new file should not be the same as 
 * @returns {string} The unique filename
 */


function getUniqueName(fileName, otherNames) {
  let tryName = fileName;
  let numAdded = 0;

  while (otherNames.indexOf(tryName) > -1) {
    numAdded = numAdded + 1;
    tryName = fileName + ' (' + numAdded + ')';
  }

  return tryName;
}

var utils = {
  sleep,
  getUniqueName
};

/** @module rpcs */

function consoleLogCommand(type, funcname, args, kwargs) {
  // Don't show any arguments if none are passed in.
  if (!args) {
    args = '';
  } // Don't show any kwargs if none are passed in.


  if (!kwargs) {
    kwargs = '';
  }

  console.log("RPC service call (" + type + "): " + funcname, args, kwargs);
}
/**
 * Attempt to convert a Blob passed in to a JSON. 
 *
 * @function
 * @async
 * @param {string} theBlob - username of the user 
 * @returns {Promise}
 */


async function readJsonFromBlob(theBlob) {
  // Create a FileReader; reader.result contains the contents of blob as text when this is called
  const reader = new FileReader(); // Create a callback for after the load attempt is finished

  reader.addEventListener("loadend", async function () {
    try {
      // Try the conversion.
      return await JSON.parse(reader.result);
    } catch (e) {
      // On failure to convert to JSON, reject the Promise.
      throw Error('Failed to convert blob to JSON');
    }
  }); // Start the load attempt, trying to read the blob in as text.

  reader.readAsText(theBlob);
}
/**
 * Call an RPC defined using scirisweb 
 *
 * @function
 * @async
 * @param {string} funcname - name of the RPC as registered in an scirisweb app 
 * @param {string[]} args - Python stlye args to be passed to the RPC 
 * @param {Object} kwargs - Python stlye kwargs to be passed to the RPC 
 * @returns {Promise}
 */


async function rpc(funcname, args, kwargs) {
  // Log the RPC call.
  consoleLogCommand("normal", funcname, args, kwargs); // Do the RPC processing, returning results as a Promise.
  // Send the POST request for the RPC call.

  try {
    const response = await axios.post('/api/rpcs', {
      funcname: funcname,
      args: args,
      kwargs: kwargs
    }); // If there is not error in the POST response.

    if (typeof response.data.error === 'undefined') {
      console.log('RPC succeeded'); // Signal success with the response.

      return response;
    }

    console.log('RPC error: ' + response.data.error);
    throw Error(response.data.error);
  } catch (error) {
    console.log('RPC error: ' + error); // If there was an actual response returned from the server...

    if (error.response) {
      // If we have exception information in the response 
      // (which indicates an exception on the server side)...
      if (typeof error.response.data.exception !== 'undefined') {
        // For now, reject with an error message matching the exception.
        throw Error(error.response.data.exception);
      }
    } else {
      // Reject with the error axios got.
      throw Error(error);
    }
  }
}
/**
 * Call an Download RPC defined using scirisweb via /api/download
 *
 * @function
 * @async
 * @param {string} funcname - name of the RPC as registered in an scirisweb app 
 * @param {string[]} args - Python stlye args to be passed to the RPC 
 * @param {Object} kwargs - Python stlye kwargs to be passed to the RPC 
 * @returns {Promise}
 */
// #NOTE Parham: Need to confirm how this works before refactoring


function download(funcname, args, kwargs) {
  consoleLogCommand("download", funcname, args, kwargs); // Log the download RPC call.

  return new Promise((resolve, reject) => {
    // Do the RPC processing, returning results as a Promise.
    axios.post('/api/rpcs', {
      // Send the POST request for the RPC call.
      funcname: funcname,
      args: args,
      kwargs: kwargs
    }, {
      responseType: 'blob'
    }).then(response => {
      readJsonFromBlob(response.data).then(responsedata => {
        if (typeof responsedata.error != 'undefined') {
          // If we have error information in the response (which indicates a logical error on the server side)...
          reject(Error(responsedata.error)); // For now, reject with an error message matching the error.
        }
      }).catch(error2 => {
        // An error here indicates we do in fact have a file to download.
        var blob = new Blob([response.data]); // Create a new blob object (containing the file data) from the response.data component.

        var filename = response.headers.filename; // Grab the file name from response.headers.

        saveAs(blob, filename); // Bring up the browser dialog allowing the user to save the file or cancel doing so.

        resolve(response); // Signal success with the response.
      });
    }).catch(error => {
      if (error.response) {
        // If there was an actual response returned from the server...
        readJsonFromBlob(error.response.data).then(responsedata => {
          if (typeof responsedata.exception !== 'undefined') {
            // If we have exception information in the response (which indicates an exception on the server side)...
            reject(Error(responsedata.exception)); // For now, reject with an error message matching the exception.
          }
        }).catch(error2 => {
          reject(error); // Reject with the error axios got.
        });
      } else {
        reject(error); // Otherwise (no response was delivered), reject with the error axios got.
      }
    });
  });
}
/**
 * Call the Upload RPC defined using scirisweb via /api/upload
 *
 * @function
 * @async
 * @param {string} funcname - name of the RPC as registered in an scirisweb app 
 * @param {string[]} args - Python stlye args to be passed to the RPC 
 * @param {Object} kwargs - Python stlye kwargs to be passed to the RPC 
 * @param {string} fileType - Type of file being uploaded 
 * @returns {Promise}
 */


function upload(funcname, args, kwargs, fileType) {
  consoleLogCommand("upload", funcname, args, kwargs); // Function for trapping the change event that has the user-selected file.

  const onFileChange = async e => {
    // Pull out the files (should only be 1) that were selected.
    var files = e.target.files || e.dataTransfer.files; // If no files were selected, reject the promise.

    if (!files.length) {
      throw Error('No file selected');
    } // Create a FormData object for holding the file.


    const formData = new FormData(); // Put the selected file in the formData object with 'uploadfile' key.

    formData.append('uploadfile', files[0]); // Add the RPC function name to the form data.

    formData.append('funcname', funcname); // Add args and kwargs to the form data.

    formData.append('args', JSON.stringify(args));
    formData.append('kwargs', JSON.stringify(kwargs));

    try {
      const response = await axios.post('/api/rpcs', formData);

      if (typeof response.data.error != 'undefined') {
        throw Error(response.data.error);
      }

      return response;
    } catch (error) {
      // If there was an actual response returned from the server...
      if (!error.response) {
        throw Error(error);
      } // If we have exception information in the response (which 
      // indicates an exception on the server side)...


      if (typeof error.response.data.exception != 'undefined') {
        // For now, reject with an error message matching the exception.
        throw Error(error.response.data.exception);
      }
    }
  }; // Create an invisible file input element and set its change callback 
  // to our onFileChange function.


  const inElem = document.createElement('input');
  inElem.setAttribute('type', 'file');
  inElem.setAttribute('accept', fileType);
  inElem.addEventListener('change', onFileChange); // Manually click the button to open the file dialog.

  inElem.click();
}

var rpcs = {
  rpc,
  download,
  upload
};

/** @module graphs */

function placeholders(vm, startVal) {
  let indices = [];

  if (!startVal) {
    startVal = 0;
  }

  for (let i = startVal; i <= 100; i++) {
    indices.push(i);
    vm.showGraphDivs.push(false);
    vm.showLegendDivs.push(false);
  }

  return indices;
}
/**
 * Remove the figures that have been plotted in a Vue component
 *
 * @function
 * @param {Object} vm - Vue component 
 */


function clearGraphs(vm) {
  for (let index = 0; index <= 100; index++) {
    let divlabel = 'fig' + index;

    if (typeof d3 === 'undefined') {
      console.log("please include d3 to use the clearGraphs function");
      return false;
    }

    mpld3.remove_figure(divlabel);
    vm.hasGraphs = false;
  }
}
/**
 * Use the mpld3 graph definitions to plot graphs in a Vue component 
 *
 * @function
 * @param {Object} vm - Vue component 
 * @param {Object} data - The mpld3 object that defines the graphs 
 * @param {string} routepath - The path that the  
 */


async function makeGraphs(vm, data, routepath) {
  if (typeof d3 === 'undefined') {
    console.log("please include d3 to use the makeGraphs function");
    return false;
  } // Don't render graphs if we've changed page


  if (routepath && routepath !== vm.$route.path) {
    console.log('Not rendering graphs since route changed: ' + routepath + ' vs. ' + vm.$route.path);
    return false;
  }

  let waitingtime = 0.5;
  var graphdata = data.graphs; // var legenddata = data.legends
  // Start indicating progress.

  status.start(vm);
  vm.hasGraphs = true;
  await utils.sleep(waitingtime * 1000);
  let n_plots = graphdata.length; // let n_legends = legenddata.length

  console.log('Rendering ' + n_plots + ' graphs'); // if (n_plots !== n_legends) {
  //   console.log('WARNING: different numbers of plots and legends: ' + n_plots + ' vs. ' + n_legends)
  // }

  for (var index = 0; index <= n_plots; index++) {
    console.log('Rendering plot ' + index);
    var figlabel = 'fig' + index;
    var figdiv = document.getElementById(figlabel);

    if (!figdiv) {
      console.log('WARNING: figdiv not found: ' + figlabel);
    } // Show figure containers


    if (index >= 1 && index < n_plots) {
      var figcontainerlabel = 'figcontainer' + index; // CK: Not sure if this is necessary? To ensure the div is clear first

      var figcontainerdiv = document.getElementById(figcontainerlabel);

      if (figcontainerdiv) {
        figcontainerdiv.style.display = 'flex';
      } else {
        console.log('WARNING: figcontainerdiv not found: ' + figcontainerlabel);
      } // var legendlabel = 'legend' + index
      // var legenddiv  = document.getElementById(legendlabel);
      // if (legenddiv) {
      //   while (legenddiv.firstChild) {
      //     legenddiv.removeChild(legenddiv.firstChild);
      //   }
      // } else {
      //   console.log('WARNING: legenddiv not found: ' + legendlabel)
      // }

    } // Draw figures


    try {
      mpld3.draw_figure(figlabel, graphdata[index], function (fig, element) {
        fig.setXTicks(6, function (d) {
          return d3.format('.0f')(d);
        }); // fig.setYTicks(null, function (d) { // Looks too weird with 500m for 0.5
        //   return d3.format('.2s')(d);
        // });
      }, true);
    } catch (error) {
      console.log('Could not plot graph: ' + error.message);
    } // Draw legends
    // if (index>=1 && index<n_plots) {
    //   try {
    //     mpld3.draw_figure(legendlabel, legenddata[index], function (fig, element) {
    //     });
    //   } catch (error) {
    //     console.log(error)
    //   }
    //
    // }


    vm.showGraphDivs[index] = true;
  } // CK: This should be a promise, otherwise this appears before the graphs do


  status.succeed(vm, 'Graphs created');
} //
// Graphs DOM functions
//

/**
 * Print the dimentions of the current window to the console 
 *
 * @function
 */


function showBrowserWindowSize() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let ow = window.outerWidth; //including toolbars and status bar etc.

  let oh = window.outerHeight;
  console.log('Browser window size:');
  console.log(w, h, ow, oh);
}
/**
 * Given an SVG HTML element in the DOM scale its size 
 *
 * @function
 * @svg {Object} svg - The HTML element of the SVG 
 * @frac {number} frac - The fraction which the SVG figure should be scaled by 
 */


function scaleElem(svg, frac) {
  // It might ultimately be better to redraw the graph, but this works
  let width = svg.getAttribute("width");
  let height = svg.getAttribute("height");
  let viewBox = svg.getAttribute("viewBox");

  if (!viewBox) {
    svg.setAttribute("viewBox", '0 0 ' + width + ' ' + height);
  } // if this causes the image to look weird, you may want to look at "preserveAspectRatio" attribute


  svg.setAttribute("width", width * frac);
  svg.setAttribute("height", height * frac);
}
/**
 * Scale all the figures inside a Vue component instance 
 *
 * @function
 * @param {Object} vm - Vue component 
 * @frac {number} frac - The fraction which the SVG figures should be scaled by 
 */


function scaleFigs(vm, frac) {
  vm.figscale = vm.figscale * frac;

  if (frac === 1.0) {
    frac = 1.0 / vm.figscale;
    vm.figscale = 1.0;
  }

  let graphs = window.top.document.querySelectorAll('svg.mpld3-figure');

  for (let g = 0; g < graphs.length; g++) {
    scaleElem(graphs[g], frac);
  }
} //
// Legend functions
// 

/**
 * Add a native mouseover listener to a Vue component instance. 
 * It will update the variables `.mousex` and `.mousey` inside the instance
 *
 * @function
 * @param {Object} vm - Vue component 
 */


function addListener(vm) {
  document.addEventListener('mousemove', function (e) {
    onMouseUpdate(e, vm);
  }, false);
}
/**
 * Pass the position of the mouse to a Vue component instance 
 *
 * @function
 * @private
 * @param {Object} e - Event object 
 * @param {Object} vm - Vue component 
 */


function onMouseUpdate(e, vm) {
  vm.mousex = e.pageX;
  vm.mousey = e.pageY; // console.log(vm.mousex, vm.mousey)
}

function createDialogs(vm) {
  let vals = placeholders(vm);

  for (let val in vals) {
    newDialog(vm, val, 'Dialog ' + val, 'Placeholder content ' + val);
  }
} // Create a new dialog


function newDialog(vm, id, name, content) {
  let options = {
    left: 123 + Number(id),
    top: 123
  };
  let style = {
    options: options
  };
  let properties = {
    id,
    name,
    content,
    style,
    options
  };
  return vm.openDialogs.push(properties);
}

function findDialog(vm, id, dialogs) {
  console.log('looking');
  let index = dialogs.findIndex(val => {
    return String(val.id) === String(id); // Force type conversion
  });
  return index > -1 ? index : null;
} // "Show" the dialog


function maximize(vm, id) {
  let index = Number(id);
  let DDlabel = 'DD' + id; // DD for dialog-drag

  let DDdiv = document.getElementById(DDlabel);

  if (DDdiv) {
    DDdiv.style.left = String(vm.mousex - 80) + 'px';
    DDdiv.style.top = String(vm.mousey - 300) + 'px';
  } else {
    console.log('WARNING: DDdiv not found: ' + DDlabel);
  }

  if (index !== null) {
    vm.openDialogs[index].options.left = vm.mousex - 80; // Before opening, move it to where the mouse currently is

    vm.openDialogs[index].options.top = vm.mousey - 300;
  }

  vm.showLegendDivs[index] = true; // Not really used, but here for completeness

  let containerlabel = 'legendcontainer' + id;
  let containerdiv = document.getElementById(containerlabel);

  if (containerdiv) {
    containerdiv.style.display = 'inline-block'; // Ensure they're invisible
  } else {
    console.log('WARNING: containerdiv not found: ' + containerlabel);
  }
} // "Hide" the dialog


function minimize(vm, id) {
  let index = Number(id);
  vm.showLegendDivs[index] = false;
  let containerlabel = 'legendcontainer' + id;
  let containerdiv = document.getElementById(containerlabel);

  if (containerdiv) {
    containerdiv.style.display = 'none'; // Ensure they're invisible
  } else {
    console.log('WARNING: containerdiv not found: ' + containerlabel);
  }
}

var graphs = {
  placeholders,
  clearGraphs,
  makeGraphs,
  scaleFigs,
  showBrowserWindowSize,
  addListener,
  onMouseUpdate,
  createDialogs,
  newDialog,
  findDialog,
  maximize,
  minimize,
  mpld3
};

/** @module task */
/**
 * getTaskResultWaiting() -- given a task_id string, a waiting time (in 
 * sec.), and a remote task function name and its args, try to launch 
 * the task, then wait for the waiting time, then try to get the 
 * result.
 *
 * @function
 * @async
 * @param {number} task_id - id of the task to keep track of
 * @param {number} waitingtime - time to wait before checking the status of the task 
 * @param {string} func_name - name of the remote task function 
 * @param {string[]} args - Python style args to pass to the function 
 * @param {Object} kwargs - Python style kwatgs to pass to the function
 * @returns {Promise}
 */

async function getTaskResultWaiting(task_id, waitingtime, func_name, args, kwargs) {
  if (!args) {
    // Set the arguments to an empty list if none are passed in.
    args = [];
  }

  try {
    const task = await rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]);
    await utils.sleep(waitingtime * 1000);
    const result = await rpcs.rpc('get_task_result', [task_id]); // Clean up the task_id task.

    await rpcs.rpc('delete_task', [task_id]);
  } catch (error) {
    // While we might want to clean up the task as below, the Celery
    // worker is likely to "resurrect" the task if it actually is
    // running the task to completion.
    // Clean up the task_id task.
    // rpcCall('delete_task', [task_id])
    throw Error(error);
  }

  return result;
}
/**
 * Given a task_id string, a timeout time (in 
 * sec.), a polling interval (also in sec.), and a remote task function name
 * and its args, try to launch the task, then start the polling if this is 
 * successful, returning the ultimate results of the polling process. 
 *
 * @function
 * @async
 * @param {number} task_id - id of the task to keep track of
 * @param {number} timeout - maximum execution time  
 * @param {number} pollinterval - how long to wait before initiating another poll
 * @param {string} func_name - name of the remote task function 
 * @param {string[]} args - Python style args to pass to the function 
 * @param {Object} kwargs - Python style kwatgs to pass to the function
 * @returns {Promise}
 */


async function getTaskResultPolling(task_id, timeout, pollinterval, func_name, args, kwargs) {
  if (!args) {
    // Set the arguments to an empty list if none are passed in.
    args = [];
  }

  await rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]); // Do the whole sequence of polling steps, starting with the first (recursive) call.

  return await pollStep(task_id, timeout, pollinterval, 0);
}
/**
 * A polling step for getTaskResultPolling().  Uses the task_id, 
 * a timeout value (in sec.) a poll interval (in sec.) and the time elapsed 
 * since the start of the entire polling process.  If timeout is zero or 
 * negative, no timeout check is applied.  Otherwise, an error will be 
 * returned if the polling has gone on beyond the timeout period.  Otherwise, 
 * this function does a sleep() and then a check_task().  If the task is 
 * completed, it will get the result.  Otherwise, it will recursively spawn 
 * another pollStep().
 *
 * @function
 * @async
 * @private
 * @param {string} task_id - id of the task to keep track of
 * @param {string} timeout - maximum execution time  
 * @param {string} pollinterval - how long to wait before initiating another poll
 * @param {string} elapsedtime - the current execution time
 * @returns {Promise}
 */


async function pollStep(task_id, timeout, pollinterval, elapsedtime) {
  // Check to see if the elapsed time is longer than the timeout 
  // (and we have a timeout we actually want to check against) and if so, fail.
  if (elapsedtime > timeout && timeout > 0) {
    throw Error('Task polling timed out');
  } // Sleep timeout seconds.


  await utils.sleep(pollinterval * 1000); // Check the status of the task.

  const task = await rpcs.rpc('check_task', [task_id]); // There was an issue with executing the taks

  if (task.data.task.status == 'error') {
    throw Error(task.data.task.errorText);
  } // If the task is completed...


  if (task.data.task.status == 'completed') {
    const result = await rpcs.rpc('get_task_result', [task_id]); // Clean up the task_id task.

    await rpcs.rpc('delete_task', [task_id]);
    return result;
  } // Task is still pending processing, do another poll step, passing in an 
  // incremented elapsed time.


  return await pollStep(task_id, timeout, pollinterval, elapsedtime + pollinterval);
}

var tasks = {
  getTaskResultWaiting,
  getTaskResultPolling
};

/** @module user */
/**
 * Using the correct combination of a user's username and email perform a login 
 * The password is hashed using sha244 and sent to the API
 *
 * @function
 * @async
 * @param {string} username - username of the user 
 * @param {string} passowrd - password of the user 
 * @returns {Promise}
 */

function loginCall(username, password) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  const hashPassword = sha224(password).toString();
  const args = [username, hashPassword];
  return rpcs.rpc('user_login', args);
}
/**
 * Call rpc() for performing a logout. 
 * The use session is ended.
 *
 * @function
 * @async
 * @returns {Promise}
 */


function logoutCall() {
  return rpcs.rpc('user_logout');
}
/**
 * Call rpc() for reading the currently logged in user.
 *
 * @function
 * @async
 * @returns {Promise}
 */


function getCurrentUserInfo() {
  return rpcs.rpc('get_current_user_info');
}
/**
 * Call rpc() for registering a new user.
 *
 * @function
 * @async
 * @param {string} username
 * @param {string} passowrd
 * @param {string} displayname - The verbose name of the user 
 * @param {string} email 
 * @returns {Promise}
 */


function registerUser(username, password, displayname, email) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  const hashPassword = sha224(password).toString();
  const args = [username, hashPassword, displayname, email];
  return rpcs.rpc('user_register', args);
}
/**
 * Change a user's displayname and/or email. It does not require the user to be logged in.
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @param {string} passowrd - The password the current password of the user
 * @param {string} displayname - The new value to be set for the display name 
 * @param {string} email - The new value to be set for the email
 * @returns {Promise}
 */


function changeUserInfo(username, password, displayname, email) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  const hashPassword = sha224(password).toString();
  const args = [username, hashPassword, displayname, email];
  return rpcs.rpc('user_change_info', args);
}
/**
 * Change the password of the currently logged in user
 *
 * @function
 * @async
 * @param {string} oldpassword - The current password of the user
 * @param {string} newpassword - The password to use for the user from now on 
 * @returns {Promise}
 */


function changeUserPassword(oldpassword, newpassword) {
  // Get a hex version of the hashed passwords using the SHA224 algorithm.
  const hashOldPassword = sha224(oldpassword).toString();
  const hashNewPassword = sha224(newpassword).toString();
  const args = [hashOldPassword, hashNewPassword];
  return rpcs.rpc('user_change_password', args);
}
/**
 * Allow a logged in user who is an admin to retreive information about a user 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function adminGetUserInfo(username) {
  const args = [username];
  return rpcs.rpc('admin_get_user_info', args);
}
/**
 * Allow a logged in user who is an admin to delete a user 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function deleteUser(username) {
  const args = [username];
  return rpcs.rpc('admin_delete_user', args);
}
/**
 * Allow a logged in user who is an admin to activate a user's account 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function activateUserAccount(username) {
  const args = [username];
  return rpcs.rpc('admin_activate_account', args);
}
/**
 * Allow a logged in user who is an admin to deactivate a user's account 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function deactivateUserAccount(username) {
  const args = [username];
  return rpcs.rpc('admin_deactivate_account', args);
}
/**
 * Allow a logged in user who is an admin to make another user an 
 * admin by granting admin privilages to them 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function grantUserAdminRights(username) {
  const args = [username];
  return rpcs.rpc('admin_grant_admin', args);
}
/**
 * Allow a logged in user who is an admin to remove another admin by
 * revoking their admin privilages
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function revokeUserAdminRights(username) {
  const args = [username];
  return rpcs.rpc('admin_revoke_admin', args);
}
/**
 * Allow a logged in user who is an admin to set a user's 
 * password to 'sciris' 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */


function resetUserPassword(username) {
  const args = [username];
  return rpcs.rpc('admin_reset_password', args);
} // Higher level user functions that call the lower level ones above

/**
 * Fetch the currently logged in user from the server and commit it to
 * a Vuex store instance
 *
 * @function
 * @param {string} store - The username of the user 
 */


async function getUserInfo(store) {
  try {
    // Set the username to what the server indicates.
    const response = await getCurrentUserInfo();
    store.commit('newUser', response.data.user);
  } catch (error) {
    // An error probably means the user is not logged in.
    // Set the username to {}.  
    store.commit('newUser', {});
  }
}
/**
 * Check if there is a user currently logged in
 *
 * @function
 * @returns {bool}
 */


function checkLoggedIn() {
  if (this.currentUser.displayname === undefined) return false;else return true;
}
/**
 * Check if the currently logged in user is an admin
 *
 * @function
 * @returns {bool}
 */


function checkAdminLoggedIn() {
  console.log(this);

  if (this.checkLoggedIn()) {
    return this.currentUser.admin;
  }
}

var user = {
  loginCall,
  logoutCall,
  getCurrentUserInfo,
  registerUser,
  changeUserInfo,
  changeUserPassword,
  adminGetUserInfo,
  deleteUser,
  activateUserAccount,
  deactivateUserAccount,
  grantUserAdminRights,
  revokeUserAdminRights,
  resetUserPassword,
  getUserInfo,
  checkLoggedIn,
  checkAdminLoggedIn
};

//
var script = {
  name: 'PopupSpinner',
  components: {
    FulfillingBouncingCircleSpinner: epicSpinners.FulfillingBouncingCircleSpinner
  },
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    hasCancelButton: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#0000ff'
    },
    size: {
      type: String,
      default: '50px'
    },
    margin: {
      type: String,
      default: '2px'
    },
    padding: {
      type: String,
      default: '15px'
    },
    radius: {
      type: String,
      default: '100%'
    }
  },

  data() {
    return {
      titleStyle: {
        textAlign: 'center'
      },
      cancelButtonStyle: {
        padding: '2px'
      },
      opened: false
    };
  },

  beforeMount() {
    // Create listener for start event.
    EventBus.$on('spinner:start', () => {
      this.show();
    }); // Create listener for stop event.

    EventBus.$on('spinner:stop', () => {
      this.hide();
    });
  },

  computed: {
    spinnerSize() {
      return parseFloat(this.size) - 25;
    },

    modalHeight() {
      // Start with the height of the spinner wrapper.
      let fullHeight = parseFloat(this.size) + 2 * parseFloat(this.padding); // If there is a title there, add space for the text.

      if (this.title !== '') {
        fullHeight = fullHeight + 20 + parseFloat(this.padding);
      } // If there is a cancel button there, add space for it.


      if (this.hasCancelButton) {
        fullHeight = fullHeight + 20 + parseFloat(this.padding);
      }

      return fullHeight + 'px';
    },

    modalWidth() {
      return parseFloat(this.size) + 2 * parseFloat(this.padding) + 'px';
    }

  },
  methods: {
    beforeOpen() {
      window.addEventListener('keyup', this.onKey);
      this.opened = true;
    },

    beforeClose() {
      window.removeEventListener('keyup', this.onKey);
      this.opened = false;
    },

    onKey(event) {
      if (event.keyCode == 27) {
        console.log('Exited spinner through Esc key');
        this.cancel();
      }
    },

    cancel() {
      this.$emit('spinner-cancel');
      this.hide();
    },

    show() {
      this.$modal.show('popup-spinner'); // Bring up the spinner modal.
    },

    hide() {
      this.$modal.hide('popup-spinner'); // Dispel the spinner modal.
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{staticStyle:{"opacity":"1.0"},attrs:{"name":"popup-spinner","height":_vm.modalHeight,"width":_vm.modalWidth,"click-to-close":false},on:{"before-open":_vm.beforeOpen,"before-close":_vm.beforeClose}},[_c('div',{staticClass:"overlay-box"},[_c('div',{staticClass:"loader-box"},[_c('fulfilling-bouncing-circle-spinner',{attrs:{"color":_vm.color,"size":_vm.spinnerSize,"animation-duration":2000}})],1),_vm._v(" "),(_vm.title !== '')?_c('div',{style:(_vm.titleStyle)},[_vm._v("\n      "+_vm._s(_vm.title)+"\n    ")]):_vm._e(),_vm._v(" "),(_vm.hasCancelButton)?_c('div',{staticStyle:{"padding":"13px"}},[_c('button',{style:(_vm.cancelButtonStyle),on:{"click":_vm.cancel}},[_vm._v("Cancel")])]):_vm._e()])])};
var __vue_staticRenderFns__ = [];

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-3bb427d4_0", { source: ".loader-box[data-v-3bb427d4]{display:flex;justify-content:center}.overlay-box[data-v-3bb427d4]{display:flex;flex-direction:column;height:100%;justify-content:space-evenly}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-3bb427d4";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var PopupSpinner = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$1 = {
  name: 'notification',
  props: {
    message: String,
    icon: {
      type: String,
      default: 'ti-info-alt'
    },
    verticalAlign: {
      type: String,
      default: 'top'
    },
    horizontalAlign: {
      type: String,
      default: 'right'
    },
    type: {
      type: String,
      default: 'info'
    },
    timeout: {
      type: Number,
      default: 2000
    },
    timestamp: {
      type: Date,
      default: () => new Date()
    }
  },

  data() {
    return {};
  },

  computed: {
    hasIcon() {
      return this.icon && this.icon.length > 0;
    },

    alertType() {
      return `alert-${this.type}`;
    },

    customPosition() {
      let initialMargin = 20;
      let alertHeight = 60;
      let sameAlertsCount = this.$notifications.state.filter(alert => {
        return alert.horizontalAlign === this.horizontalAlign && alert.verticalAlign === this.verticalAlign;
      }).length;
      let pixels = (sameAlertsCount - 1) * alertHeight + initialMargin;
      let styles = {};

      if (this.verticalAlign === 'top') {
        styles.top = `${pixels}px`;
      } else {
        styles.bottom = `${pixels}px`;
      }

      return styles;
    }

  },
  methods: {
    close() {
      this.$parent.$emit('on-close', this.timestamp);
    }

  },

  mounted() {
    if (this.timeout) {
      setTimeout(this.close, this.timeout);
    }
  }

};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"alert open alert-with-icon",class:[_vm.verticalAlign, _vm.horizontalAlign, _vm.alertType],style:(_vm.customPosition),attrs:{"role":"alert","data-notify":"container","data-notify-position":"top-center"}},[_c('div',{staticClass:"notification-box"},[_c('div',[_c('span',{staticClass:"alert-icon",class:_vm.icon,attrs:{"data-notify":"message"}})]),_vm._v(" "),_c('div',{staticClass:"message-box"},[_c('div',{staticClass:"message",attrs:{"data-notify":"message"},domProps:{"innerHTML":_vm._s(_vm.message)}})]),_vm._v(" "),_c('div',[_c('button',{staticClass:"btn__trans close-button",attrs:{"aria-hidden":"true","data-notify":"dismiss"},on:{"click":_vm.close}},[_c('i',{staticClass:"ti-close"})])])])])};
var __vue_staticRenderFns__$1 = [];

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-61be677e_0", { source: "@import url(https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css);", map: undefined, media: undefined })
,inject("data-v-61be677e_1", { source: ".fade-enter-active[data-v-61be677e],.fade-leave-active[data-v-61be677e]{transition:opacity .3s}.fade-enter[data-v-61be677e],.fade-leave-to[data-v-61be677e]{opacity:0}.close-button[data-v-61be677e],.close-button[data-v-61be677e]:hover{background:0 0;line-height:0;padding:5px 5px;margin-left:10px;border-radius:3px}.close-button[data-v-61be677e]:hover{background:#ffffff63;color:#737373}.alert[data-v-61be677e]{border:0;border-radius:0;color:#fff;padding:20px 15px;font-size:14px;z-index:100;display:inline-block;position:fixed;transition:all .5s ease-in-out}.container .alert[data-v-61be677e]{border-radius:4px}.alert.center[data-v-61be677e]{left:0;right:0;margin:0 auto}.alert.left[data-v-61be677e]{left:20px}.alert.right[data-v-61be677e]{right:20px}.container .alert[data-v-61be677e]{border-radius:0}.alert .alert-icon[data-v-61be677e]{font-size:30px;margin-right:5px}.alert .close~span[data-v-61be677e]{display:inline-block;max-width:89%}.alert[data-notify=container][data-v-61be677e]{padding:0;border-radius:2px}.alert span[data-notify=icon][data-v-61be677e]{font-size:30px;display:block;left:15px;position:absolute;top:50%;margin-top:-20px}.alert-info[data-v-61be677e]{background-color:#7ce4fe;color:#3091b2}.alert-success[data-v-61be677e]{background-color:#080;color:#fff}.alert-warning[data-v-61be677e]{background-color:#e29722;color:#fff}.alert-danger[data-v-61be677e]{background-color:#ff8f5e;color:#b33c12}.message-box[data-v-61be677e]{font-size:15px;align-content:center;max-width:400px;min-width:150px;padding-left:10px;flex-grow:1}.message-box .message[data-v-61be677e]{line-height:1.5em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%}.notification-box[data-v-61be677e]{display:flex;justify-content:flex-start;padding:10px 15px}.notification-box>div[data-v-61be677e]{align-self:center}.btn__trans[data-v-61be677e]{font-size:18px;color:#fff;background-color:transparent;background-repeat:no-repeat;border:none;cursor:pointer;overflow:hidden;background-image:none;outline:0}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-61be677e";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  

  
  var Notification = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    browser,
    undefined
  );

//
var script$2 = {
  components: {
    Notification
  },

  data() {
    return {
      notifications: this.$notifications.state
    };
  },

  methods: {
    removeNotification(timestamp) {
      this.$notifications.removeNotification(timestamp);
    },

    clearAllNotifications() {
      this.$notifications.clear();
    }

  }
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"notifications"},[_c('transition-group',{attrs:{"name":"list"},on:{"on-close":_vm.removeNotification}},_vm._l((_vm.notifications),function(notification,index){return _c('notification',{key:index+0,attrs:{"message":notification.message,"icon":notification.icon,"type":notification.type,"vertical-align":notification.verticalAlign,"horizontal-align":notification.horizontalAlign,"timeout":notification.timeout,"timestamp":notification.timestamp}})}),1)],1)};
var __vue_staticRenderFns__$2 = [];

  /* style */
  const __vue_inject_styles__$2 = function (inject) {
    if (!inject) return
    inject("data-v-2a7eddb0_0", { source: ".list-item{display:inline-block;margin-right:10px}.list-enter-active,.list-leave-active{transition:all 1s}.list-enter,.list-leave-to{opacity:0;transform:translateY(-30px)}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$2 = undefined;
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject SSR */
  

  
  var Notifications = normalizeComponent_1(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    browser,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$3 = {
  props: {
    title: String,
    icon: String,
    width: {
      type: String,
      default: "170px"
    }
  },

  data() {
    return {
      isOpen: false
    };
  },

  computed: {
    style() {
      return 'width: ' + this.width;
    }

  },
  methods: {
    toggleDropDown() {
      this.isOpen = !this.isOpen;
    },

    closeDropDown() {
      this.isOpen = false;
    }

  }
};

/* script */
const __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{directives:[{name:"click-outside",rawName:"v-click-outside",value:(_vm.closeDropDown),expression:"closeDropDown"}],staticClass:"dropdown",class:{open:_vm.isOpen}},[_c('a',{staticClass:"dropdown-toggle btn-rotate",style:(_vm.style),attrs:{"href":"javascript:void(0)","data-toggle":"dropdown"},on:{"click":_vm.toggleDropDown}},[_vm._t("title",[_c('i',{class:_vm.icon}),_vm._v(" "),_c('div',{staticClass:"dropdown-title"},[_vm._v(_vm._s(_vm.title)+"\n        "),_c('b',{staticClass:"caret"})])])],2),_vm._v(" "),_c('ul',{staticClass:"dropdown-menu"},[_vm._t("default")],2)])};
var __vue_staticRenderFns__$3 = [];

  /* style */
  const __vue_inject_styles__$3 = function (inject) {
    if (!inject) return
    inject("data-v-73a696f8_0", { source: ".dropdown-toggle{cursor:pointer;display:flex;justify-content:space-evenly;text-transform:initial}.dropdown-toggle:after{position:absolute;right:10px;top:50%;margin-top:-2px}.dropdown-menu{margin-top:20px}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$3 = undefined;
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
  /* style inject SSR */
  

  
  var Dropdown = normalizeComponent_1(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    browser,
    undefined
  );

const NotificationStore = {
  state: [],

  // here the notifications will be added
  removeNotification(timestamp) {
    const indexToDelete = this.state.findIndex(n => n.timestamp === timestamp);

    if (indexToDelete !== -1) {
      this.state.splice(indexToDelete, 1);
    }
  },

  notify(notification) {
    // Create a timestamp to serve as a unique ID for the notification.
    notification.timestamp = new Date();
    notification.timestamp.setMilliseconds(notification.timestamp.getMilliseconds() + this.state.length);
    this.state.push(notification);
  },

  clear() {
    // This removes all of them in a way that the GUI keeps up.
    while (this.state.length > 0) {
      this.removeNotification(this.state[0].timestamp);
    }
  }

};

function setupSpinner(Vue$$1) {
  // Create the global $spinner functions the user can call 
  // from inside any component.
  Vue$$1.prototype.$spinner = {
    start() {
      // Send a start event to the bus.
      EventBus.$emit('spinner:start');
    },

    stop() {
      // Send a stop event to the bus.
      EventBus.$emit('spinner:stop');
    }

  };
}

function setupNotifications(Vue$$1) {
  Object.defineProperty(Vue$$1.prototype, '$notifications', {
    get() {
      return NotificationStore;
    }

  });
}

function setupProgressBar(Vue$$1, options) {
  Vue$$1.use(VueProgressBar, options);
}

function install(Vue$$1, options = {}) {
  Vue$$1.use(VModal);

  if (!options.notifications || !options.notifications.disabled) {
    setupNotifications(Vue$$1);
    Vue$$1.component('Notifications', Notifications);
  }

  if ((!options.spinner || !options.spinner.disabled) && !this.spinnerInstalled) {
    this.spinnerInstalled = true;
    setupSpinner(Vue$$1);
    Vue$$1.component('PopupSpinner', PopupSpinner);
  }

  if (!options.progressbar || !options.progressbar.disabled) {
    var progressbarOptions = options.progressbar ? options.progressbar.options : {};
    setupProgressBar(Vue$$1, progressbarOptions);
  }

  Vue$$1.component('Dropdown', Dropdown);
  Vue$$1.component('DialogDrag', DialogDrag);
  Vue$$1.directive('click-outside', vueClickaway.directive);
} // Automatic installation if Vue has been added to the global scope.


if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({
    install
  });
}

var ScirisVue = {
  install
};

/**
 * @function
 * @async
 * @see {@link module:rpcs~rpc|rpcs.rpc} 
 */

const rpc$1 = rpcs.rpc;
/**
 * @function
 * @async
 * @see {@link module:rpcs~download|rpcs.download} 
 */

const download$1 = rpcs.download;
/**
 * @function
 * @async
 * @see {@link module:rpcs~upload|rpcs.upload} 
 */

const upload$1 = rpcs.upload;
/**
 * @function
 * @async
 * @see {@link module:status~succeed|status.succeed} 
 */

const succeed$1 = status.succeed;
/**
 * @function
 * @async
 * @see {@link module:status~fail|status.fail} 
 */

const fail$1 = status.fail;
/**
 * @function
 * @async
 * @see {@link module:status~start|status.start} 
 */

const start$1 = status.start;
/**
 * @function
 * @async
 * @see {@link module:status~notify|status.notify} 
 */

const notify$1 = status.notify;
/**
 * @function
 * @async
 * @see {@link module:graphs~placeholders|graphs.placeholders} 
 */

const placeholders$1 = graphs.placeholders;
/**
 * @function
 * @async
 * @see {@link module:graphs~clearGraphs|graphs.clearGraphs} 
 */

const clearGraphs$1 = graphs.clearGraphs;
/**
 * @function
 * @async
 * @see {@link module:graphs~makeGraphs|graphs.makeGraphs} 
 */

const makeGraphs$1 = graphs.makeGraphs;
/**
 * @function
 * @async
 * @see {@link module:graphs~scaleFigs|graphs.scaleFigs} 
 */

const scaleFigs$1 = graphs.scaleFigs;
/**
 * @function
 * @async
 * @see {@link module:graphs~showBrowserWindowSize|graphs.showBrowserWindowSize} 
 */

const showBrowserWindowSize$1 = graphs.showBrowserWindowSize;
/**
 * @function
 * @async
 * @see {@link module:graphs~addListener|graphs.addListener} 
 */

const addListener$1 = graphs.addListener;
/**
 * @function
 * @async
 * @see {@link module:graphs~onMouseUpdate|graphs.onMouseUpdate} 
 */

const onMouseUpdate$1 = graphs.onMouseUpdate;
/**
 * @function
 * @async
 * @see {@link module:graphs~createDialogs|graphs.createDialogs} 
 */

const createDialogs$1 = graphs.createDialogs;
/**
 * @function
 * @async
 * @see {@link module:graphs~newDialog|graphs.newDialog} 
 */

const newDialog$1 = graphs.newDialog;
/**
 * @function
 * @async
 * @see {@link module:graphs~findDialog|graphs.findDialog} 
 */

const findDialog$1 = graphs.findDialog;
/**
 * @function
 * @async
 * @see {@link module:graphs~maximize|graphs.maximize} 
 */

const maximize$1 = graphs.maximize;
/**
 * @function
 * @async
 * @see {@link module:graphs~minimize|graphs.minimize} 
 */

const minimize$1 = graphs.minimize;
/**
 * Access to the mpld3 instance, only if d3 is included in the global scope
 *
 * @function
 * @async
 * @see {@link module:graphs~mpld3|graphs.mpld3} 
 */

const mpld3$1 = graphs.mpld3;
let draw_figure = null;

if (mpld3$1 !== null) {
  draw_figure = mpld3$1.draw_figure;
}
/**
 * @function
 * @async
 * @see {@link module:tasks~getTaskResultWaiting|tasks.getTaskResultWaiting} 
 */


const getTaskResultWaiting$1 = tasks.getTaskResultWaiting;
/**
 * @function
 * @async
 * @see {@link module:tasks~getTaskResultPolling|tasks.getTaskResultPolling} 
 */

const getTaskResultPolling$1 = tasks.getTaskResultPolling;
/**
 * @function
 * @async
 * @see {@link module:user~loginCall|user.loginCall} 
 */

const loginCall$1 = user.loginCall;
/**
 * @function
 * @async
 * @see {@link module:user~logoutCall|user.logoutCall}
 */

const logoutCall$1 = user.logoutCall;
/**
 * @function
 * @async
 * @see {@link module:user~getCurrentUserInfo|user.getCurrentUserInfo} 
 */

const getCurrentUserInfo$1 = user.getCurrentUserInfo;
/**
 * @function
 * @async
 * @see {@link module:user~registerUser|user.registerUser} 
 */

const registerUser$1 = user.registerUser;
/**
 * @function
 * @async
 * @see {@link module:user~changeUserInfo|user.changeUserInfo} 
 */

const changeUserInfo$1 = user.changeUserInfo;
/**
 * @function
 * @async
 * @see {@link module:user~changeUserPassword|user.changeUserPassword} 
 */

const changeUserPassword$1 = user.changeUserPassword;
/**
 * @function
 * @async
 * @see {@link module:user~adminGetUserInfo|user.adminGetUserInfo} 
 */

const adminGetUserInfo$1 = user.adminGetUserInfo;
/**
 * @function
 * @async
 * @see {@link module:user~deleteUser|user.deleteUser} 
 */

const deleteUser$1 = user.deleteUser;
/**
 * @function
 * @async
 * @see {@link module:user~activateUserAccount|user.activateUserAccount} 
 */

const activateUserAccount$1 = user.activateUserAccount;
/**
 * @function
 * @async
 * @see {@link module:user~deactivateUserAccount|user.deactivateUserAccount} 
 */

const deactivateUserAccount$1 = user.deactivateUserAccount;
/**
 * @function
 * @async
 * @see {@link module:user~grantUserAdminRights|user.grantUserAdminRights} 
 */

const grantUserAdminRights$1 = user.grantUserAdminRights;
/**
 * @function
 * @async
 * @see {@link module:user~revokeUserAdminRights|user.revokeUserAdminRights} 
 */

const revokeUserAdminRights$1 = user.revokeUserAdminRights;
/**
 * @function
 * @async
 * @see {@link module:user~resetUserPassword|user.resetUserPassword} 
 */

const resetUserPassword$1 = user.resetUserPassword;
/**
 * @function
 * @async
 * @see {@link module:user~getUserInfo|user.getUserInfo} 
 */

const getUserInfo$1 = user.getUserInfo;
/**
 * @function
 * @async
 * @see {@link module:user~currentUser|user.currentUser} 
 */

const currentUser = user.currentUser;
/**
 * @function
 * @async
 * @see {@link module:user~checkLoggedIn|user.checkLoggedIn} 
 */

const checkLoggedIn$1 = user.checkLoggedIn;
/**
 * @function
 * @async
 * @see {@link module:user~checkAdminLoggedIn|user.checkAdminLoggedIn} 
 */

const checkAdminLoggedIn$1 = user.checkAdminLoggedIn;
/**
 * @function
 * @async
 * @see {@link module:utils~sleep|utils.sleep} 
 */

const sleep$1 = utils.sleep;
/**
 * @function
 * @async
 * @see {@link module:utils~getUniqueName|utils.getUniqueName} 
 */

const getUniqueName$1 = utils.getUniqueName;
const sciris = {
  // rpc-service.js
  rpc: rpc$1,
  download: download$1,
  upload: upload$1,
  // graphs.js
  placeholders: placeholders$1,
  clearGraphs: clearGraphs$1,
  makeGraphs: makeGraphs$1,
  scaleFigs: scaleFigs$1,
  showBrowserWindowSize: showBrowserWindowSize$1,
  addListener: addListener$1,
  onMouseUpdate: onMouseUpdate$1,
  createDialogs: createDialogs$1,
  newDialog: newDialog$1,
  findDialog: findDialog$1,
  maximize: maximize$1,
  minimize: minimize$1,
  mpld3: mpld3$1,
  draw_figure,
  // status-service.js
  succeed: succeed$1,
  fail: fail$1,
  start: start$1,
  notify: notify$1,
  // task-service.js
  getTaskResultWaiting: getTaskResultWaiting$1,
  getTaskResultPolling: getTaskResultPolling$1,
  // user-service.js
  loginCall: loginCall$1,
  logoutCall: logoutCall$1,
  getCurrentUserInfo: getCurrentUserInfo$1,
  registerUser: registerUser$1,
  changeUserInfo: changeUserInfo$1,
  changeUserPassword: changeUserPassword$1,
  adminGetUserInfo: adminGetUserInfo$1,
  deleteUser: deleteUser$1,
  activateUserAccount: activateUserAccount$1,
  deactivateUserAccount: deactivateUserAccount$1,
  grantUserAdminRights: grantUserAdminRights$1,
  revokeUserAdminRights: revokeUserAdminRights$1,
  resetUserPassword: resetUserPassword$1,
  getUserInfo: getUserInfo$1,
  currentUser,
  checkLoggedIn: checkLoggedIn$1,
  checkAdminLoggedIn: checkAdminLoggedIn$1,
  // utils.js
  sleep: sleep$1,
  getUniqueName: getUniqueName$1,
  rpcs,
  graphs,
  status,
  user,
  tasks,
  utils,
  ScirisVue,
  EventBus
};

exports.default = sciris;
exports.sciris = sciris;
