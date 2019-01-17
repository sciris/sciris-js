/*!
 * sciris-js v0.2.2
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
const EVENT_STATUS_FAIL = 'status:fail';
const events = {
  EVENT_STATUS_START,
  EVENT_STATUS_UPDATE,
  EVENT_STATUS_SUCCEED,
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
EventBus.$on(events.EVENT_STATUS_FAIL, (vm, notif) => {
  if (vm.$spinner) vm.$spinner.stop();
  if (vm.$Progress) vm.$Progress.fail();
  if (notif && notif.message && vm.$notifications) vm.$notifications.notify(notif);
});

// progress-indicator-service.js -- functions for showing progress
var complete = 0.0; // Put this here so it's global

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

function fail(vm, failMessage, error) {
  console.log(failMessage);
  var error = error || {
    "message": "unknown message"
  };
  var msgsplit = error.message.split('Exception details:'); // WARNING, must match sc_app.py

  var usermsg = msgsplit[0].replace(/\n/g, '<br>');
  console.log(error.message);
  console.log(usermsg);
  complete = 100;
  var notif = {};

  if (failMessage !== '') {
    // Put up a failure notification.
    notif = {
      message: '<b>' + failMessage + '</b>' + '<br><br>' + usermsg,
      icon: 'ti-face-sad',
      type: 'warning',
      verticalAlign: 'top',
      horizontalAlign: 'right',
      timeout: 0
    };
  }

  EventBus.$emit(events.EVENT_STATUS_FAIL, vm, notif);
}

var status = {
  start,
  succeed,
  fail
};

/*
 * Small utilities that are shared across pages
 */
function sleep(time) {
  // Return a promise that resolves after _time_ milliseconds.
  return new Promise(resolve => setTimeout(resolve, time));
}

function getUniqueName(fileName, otherNames) {
  let tryName = fileName;
  let numAdded = 0;

  while (otherNames.indexOf(tryName) > -1) {
    numAdded = numAdded + 1;
    tryName = fileName + ' (' + numAdded + ')';
  }

  return tryName;
}

function validateYears(vm) {
  if (vm.startYear > vm.simEnd) {
    vm.startYear = vm.simEnd;
  } else if (vm.startYear < vm.simStart) {
    vm.startYear = vm.simStart;
  }

  if (vm.endYear > vm.simEnd) {
    vm.endYear = vm.simEnd;
  } else if (vm.endYear < vm.simStart) {
    vm.endYear = vm.simStart;
  }
}

function projectID(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return '';
  } else {
    let projectID = vm.$store.state.activeProject.project.id;
    return projectID;
  }
}

function hasData(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return false;
  } else {
    return vm.$store.state.activeProject.project.hasData;
  }
}

function hasPrograms(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return false;
  } else {
    return vm.$store.state.activeProject.project.hasPrograms;
  }
}

function simStart(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return '';
  } else {
    return vm.$store.state.activeProject.project.sim_start;
  }
}

function simEnd(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return '';
  } else {
    return vm.$store.state.activeProject.project.sim_end;
  }
}

function simYears(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return [];
  } else {
    var sim_start = vm.$store.state.activeProject.project.sim_start;
    var sim_end = vm.$store.state.activeProject.project.sim_end;
    var years = [];

    for (var i = sim_start; i <= sim_end; i++) {
      years.push(i);
    }

    console.log('Sim years: ' + years);
    return years;
  }
}

function dataStart(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return '';
  } else {
    return vm.$store.state.activeProject.project.data_start;
  }
}

function dataEnd(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return '';
  } else {
    console.log('dataEnd: ' + vm.$store.state.activeProject.project.data_end);
    return vm.$store.state.activeProject.project.data_end;
  }
}

function dataYears(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return [];
  } else {
    let data_start = vm.$store.state.activeProject.project.data_start;
    let data_end = vm.$store.state.activeProject.project.data_end;
    let years = [];

    for (let i = data_start; i <= data_end; i++) {
      years.push(i);
    }

    console.log('data years: ' + years);
    return years;
  }
} // projection years are used for scenario and optimization plot year dropdowns


function projectionYears(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return [];
  } else {
    let data_end = vm.$store.state.activeProject.project.data_end;
    let sim_end = vm.$store.state.activeProject.project.sim_end;
    let years = [];

    for (let i = data_end; i <= sim_end; i++) {
      years.push(i);
    }

    console.log('projection years: ' + years);
    return years;
  }
}

function activePops(vm) {
  if (vm.$store.state.activeProject.project === undefined) {
    return '';
  } else {
    let pop_pairs = vm.$store.state.activeProject.project.pops;
    let pop_list = ["All"];

    for (let i = 0; i < pop_pairs.length; ++i) {
      pop_list.push(pop_pairs[i][1]);
    }

    return pop_list;
  }
}

function updateSorting(vm, sortColumn) {
  console.log('updateSorting() called');

  if (vm.sortColumn === sortColumn) {
    // If the active sorting column is clicked...
    vm.sortReverse = !vm.sortReverse; // Reverse the sort.
  } else {
    // Otherwise.
    vm.sortColumn = sortColumn; // Select the new column for sorting.

    vm.sortReverse = false; // Set the sorting for non-reverse.
  }
}

var utils = {
  sleep,
  getUniqueName,
  validateYears,
  projectID,
  hasData,
  hasPrograms,
  simStart,
  simEnd,
  simYears,
  dataStart,
  dataEnd,
  dataYears,
  projectionYears,
  activePops,
  updateSorting
};

// rpc-service.js -- RPC functions for Vue to call

function consoleLogCommand(type, funcname, args, kwargs) {
  if (!args) {
    // Don't show any arguments if none are passed in.
    args = '';
  }

  if (!kwargs) {
    // Don't show any kwargs if none are passed in.
    kwargs = '';
  }

  console.log("RPC service call (" + type + "): " + funcname, args, kwargs);
} // readJsonFromBlob(theBlob) -- Attempt to convert a Blob passed in to a JSON. Passes back a Promise.


function readJsonFromBlob(theBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // Create a FileReader; reader.result contains the contents of blob as text when this is called

    reader.addEventListener("loadend", function () {
      // Create a callback for after the load attempt is finished
      try {
        // Call a resolve passing back a JSON version of this.
        var jsonresult = JSON.parse(reader.result); // Try the conversion.

        resolve(jsonresult); // (Assuming successful) make the Promise resolve with the JSON result.
      } catch (e) {
        reject(Error('Failed to convert blob to JSON')); // On failure to convert to JSON, reject the Promise.
      }
    });
    reader.readAsText(theBlob); // Start the load attempt, trying to read the blob in as text.
  });
}

var rpcs = {
  rpc(funcname, args, kwargs) {
    // rpc() -- normalRPC() /api/procedure calls in api.py.
    consoleLogCommand("normal", funcname, args, kwargs); // Log the RPC call.

    return new Promise((resolve, reject) => {
      // Do the RPC processing, returning results as a Promise.
      axios.post('/api/rpcs', {
        // Send the POST request for the RPC call.
        funcname: funcname,
        args: args,
        kwargs: kwargs
      }).then(response => {
        if (typeof response.data.error !== 'undefined') {
          // If there is an error in the POST response.
          console.log('RPC error: ' + response.data.error);
          reject(Error(response.data.error));
        } else {
          console.log('RPC succeeded');
          resolve(response); // Signal success with the response.
        }
      }).catch(error => {
        console.log('RPC error: ' + error);

        if (error.response) {
          // If there was an actual response returned from the server...
          if (typeof error.response.data.exception !== 'undefined') {
            // If we have exception information in the response (which indicates an exception on the server side)...
            reject(Error(error.response.data.exception)); // For now, reject with an error message matching the exception.
          }
        } else {
          reject(error); // Reject with the error axios got.
        }
      });
    });
  },

  download(funcname, args, kwargs) {
    // download() -- download() /api/download calls in api.py.
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
  },

  // upload() -- upload() /api/upload calls in api.py.
  upload(funcname, args, kwargs, fileType) {
    consoleLogCommand("upload", funcname, args, kwargs); // Log the upload RPC call.

    return new Promise((resolve, reject) => {
      // Do the RPC processing, returning results as a Promise.
      var onFileChange = e => {
        // Function for trapping the change event that has the user-selected file.
        var files = e.target.files || e.dataTransfer.files; // Pull out the files (should only be 1) that were selected.

        if (!files.length) // If no files were selected, reject the promise.
          reject(Error('No file selected'));
        const formData = new FormData(); // Create a FormData object for holding the file.

        formData.append('uploadfile', files[0]); // Put the selected file in the formData object with 'uploadfile' key.

        formData.append('funcname', funcname); // Add the RPC function name to the form data.

        formData.append('args', JSON.stringify(args)); // Add args and kwargs to the form data.

        formData.append('kwargs', JSON.stringify(kwargs));
        axios.post('/api/rpcs', formData) // Use a POST request to pass along file to the server.
        .then(response => {
          // If there is an error in the POST response.
          if (typeof response.data.error != 'undefined') {
            reject(Error(response.data.error));
          }

          resolve(response); // Signal success with the response.
        }).catch(error => {
          if (error.response) {
            // If there was an actual response returned from the server...
            if (typeof error.response.data.exception != 'undefined') {
              // If we have exception information in the response (which indicates an exception on the server side)...
              reject(Error(error.response.data.exception)); // For now, reject with an error message matching the exception.
            }
          }

          reject(error); // Reject with the error axios got.
        });
      }; // Create an invisible file input element and set its change callback to our onFileChange function.


      var inElem = document.createElement('input');
      inElem.setAttribute('type', 'file');
      inElem.setAttribute('accept', fileType);
      inElem.addEventListener('change', onFileChange);
      inElem.click(); // Manually click the button to open the file dialog.
    });
  }

};

/*
 * Graphing functions (shared between calibration, scenarios, and optimization)
 */

function getPlotOptions(vm, project_id) {
  return new Promise((resolve, reject) => {
    console.log('getPlotOptions() called');
    status.start(vm); // Start indicating progress.

    rpcs.rpc('get_supported_plots', [project_id, true]).then(response => {
      vm.plotOptions = response.data; // Get the parameter values

      status.succeed(vm, '');
      resolve(response);
    }).catch(error => {
      status.fail(vm, 'Could not get plot options', error);
      reject(error);
    });
  });
}

function togglePlotControls(vm) {
  vm.showPlotControls = !vm.showPlotControls;
}

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

function clearGraphs(vm) {
  for (let index = 0; index <= 100; index++) {
    let divlabel = 'fig' + index;
    let div = document.getElementById(divlabel); // CK: Not sure if this is necessary? To ensure the div is clear first

    while (div && div.firstChild) {
      div.removeChild(div.firstChild);
    }

    vm.hasGraphs = false;
  }
}

function makeGraphs(vm, data, routepath) {
  if (routepath && routepath !== vm.$route.path) {
    // Don't render graphs if we've changed page
    console.log('Not rendering graphs since route changed: ' + routepath + ' vs. ' + vm.$route.path);
  } else {
    // Proceed...
    let waitingtime = 0.5;
    var graphdata = data.graphs; // var legenddata = data.legends

    status.start(vm); // Start indicating progress.

    vm.hasGraphs = true;
    utils.sleep(waitingtime * 1000).then(response => {
      let n_plots = graphdata.length; // let n_legends = legenddata.length

      console.log('Rendering ' + n_plots + ' graphs'); // if (n_plots !== n_legends) {
      //   console.log('WARNING: different numbers of plots and legends: ' + n_plots + ' vs. ' + n_legends)
      // }

      for (var index = 0; index <= n_plots; index++) {
        console.log('Rendering plot ' + index);
        var figlabel = 'fig' + index;
        var figdiv = document.getElementById(figlabel); // CK: Not sure if this is necessary? To ensure the div is clear first

        if (figdiv) {
          while (figdiv.firstChild) {
            figdiv.removeChild(figdiv.firstChild);
          }
        } else {
          console.log('WARNING: figdiv not found: ' + figlabel);
        } // Show figure containers


        if (index >= 1 && index < n_plots) {
          var figcontainerlabel = 'figcontainer' + index;
          var figcontainerdiv = document.getElementById(figcontainerlabel); // CK: Not sure if this is necessary? To ensure the div is clear first

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
          });
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
      }

      status.succeed(vm, 'Graphs created'); // CK: This should be a promise, otherwise this appears before the graphs do
    });
  }
}

function reloadGraphs(vm, project_id, cache_id, showNoCacheError, iscalibration, plotbudget) {
  console.log('reloadGraphs() called');
  utils.validateYears(vm); // Make sure the start end years are in the right range.

  status.start(vm);
  rpcs.rpc('plot_results', [project_id, cache_id, vm.plotOptions], {
    tool: vm.$globaltool,
    'cascade': null,
    plotyear: vm.endYear,
    pops: vm.activePop,
    calibration: iscalibration,
    plotbudget: plotbudget
  }).then(response => {
    vm.table = response.data.table;
    vm.makeGraphs(response.data);
    status.succeed(vm, 'Data loaded, graphs now rendering...');
  }).catch(error => {
    if (showNoCacheError) {
      status.fail(vm, 'Could not make graphs', error);
    } else {
      status.succeed(vm, ''); // Silently stop progress bar and spinner.
    }
  });
} //
// Graphs DOM functions
//


function showBrowserWindowSize() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let ow = window.outerWidth; //including toolbars and status bar etc.

  let oh = window.outerHeight;
  console.log('Browser window size:');
  console.log(w, h, ow, oh);
}

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


function addListener(vm) {
  document.addEventListener('mousemove', function (e) {
    onMouseUpdate(e, vm);
  }, false);
}

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
  getPlotOptions,
  togglePlotControls,
  makeGraphs,
  reloadGraphs,
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

// task-service.js -- task queuing functions for Vue to call
// sec.), and a remote task function name and its args, try to launch 
// the task, then wait for the waiting time, then try to get the 
// result.

function getTaskResultWaiting(task_id, waitingtime, func_name, args, kwargs) {
  if (!args) {
    // Set the arguments to an empty list if none are passed in.
    args = [];
  }

  return new Promise((resolve, reject) => {
    rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]) // Launch the task.
    .then(response => {
      utils.sleep(waitingtime * 1000) // Sleep waitingtime seconds.
      .then(response2 => {
        rpcs.rpc('get_task_result', [task_id]) // Get the result of the task.
        .then(response3 => {
          rpcs.rpc('delete_task', [task_id]); // Clean up the task_id task.

          resolve(response3); // Signal success with the result response.
        }).catch(error => {
          // While we might want to clean up the task as below, the Celery
          // worker is likely to "resurrect" the task if it actually is
          // running the task to completion.
          // Clean up the task_id task.
          // rpcCall('delete_task', [task_id])
          reject(error); // Reject with the error the task result get attempt gave.
        });
      });
    }).catch(error => {
      reject(error); // Reject with the error the launch gave.
    });
  });
} // getTaskResultPolling() -- given a task_id string, a timeout time (in 
// sec.), a polling interval (also in sec.), and a remote task function name
//  and its args, try to launch the task, then start the polling if this is 
// successful, returning the ultimate results of the polling process. 


function getTaskResultPolling(task_id, timeout, pollinterval, func_name, args, kwargs) {
  if (!args) {
    // Set the arguments to an empty list if none are passed in.
    args = [];
  }

  return new Promise((resolve, reject) => {
    rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]) // Launch the task.
    .then(response => {
      pollStep(task_id, timeout, pollinterval, 0) // Do the whole sequence of polling steps, starting with the first (recursive) call.
      .then(response2 => {
        resolve(response2); // Resolve with the final polling result.
      }).catch(error => {
        reject(error); // Reject with the error the polling gave.
      });
    }).catch(error => {
      reject(error); // Reject with the error the launch gave.
    });
  });
} // pollStep() -- A polling step for getTaskResultPolling().  Uses the task_id, 
// a timeout value (in sec.) a poll interval (in sec.) and the time elapsed 
// since the start of the entire polling process.  If timeout is zero or 
// negative, no timeout check is applied.  Otherwise, an error will be 
// returned if the polling has gone on beyond the timeout period.  Otherwise, 
// this function does a sleep() and then a check_task().  If the task is 
// completed, it will get the result.  Otherwise, it will recursively spawn 
// another pollStep().


function pollStep(task_id, timeout, pollinterval, elapsedtime) {
  return new Promise((resolve, reject) => {
    if (elapsedtime > timeout && timeout > 0) {
      // Check to see if the elapsed time is longer than the timeout (and we have a timeout we actually want to check against) and if so, fail.
      reject(Error('Task polling timed out'));
    } else {
      // Otherwise, we've not run out of time yet, so do a polling step.
      utils.sleep(pollinterval * 1000) // Sleep timeout seconds.
      .then(response => {
        rpcs.rpc('check_task', [task_id]) // Check the status of the task.
        .then(response2 => {
          if (response2.data.task.status == 'completed') {
            // If the task is completed...
            rpcs.rpc('get_task_result', [task_id]) // Get the result of the task.
            .then(response3 => {
              rpcs.rpc('delete_task', [task_id]); // Clean up the task_id task.

              resolve(response3); // Signal success with the response.
            }).catch(error => {
              reject(error); // Reject with the error the task result get attempt gave.
            });
          } else if (response2.data.task.status == 'error') {
            // Otherwise, if the task ended in an error...
            reject(Error(response2.data.task.errorText)); // Reject with an error for the exception.
          } else {
            // Otherwise, do another poll step, passing in an incremented elapsed time.
            pollStep(task_id, timeout, pollinterval, elapsedtime + pollinterval).then(response3 => {
              resolve(response3); // Resolve with the result of the next polling step (which may include subsequent (recursive) steps.
            });
          }
        });
      });
    }
  });
}

var tasks = {
  getTaskResultWaiting,
  getTaskResultPolling
};

// loginCall() -- Call rpc() for performing a login.

function loginCall(username, password) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  var hashPassword = sha224(password).toString(); // Make the actual RPC call.

  return rpcs.rpc('user_login', [username, hashPassword]);
} // logoutCall() -- Call rpc() for performing a logout.


function logoutCall() {
  // Make the actual RPC call.
  return rpcs.rpc('user_logout');
} // getCurrentUserInfo() -- Call rpc() for reading the currently
// logged in user.


function getCurrentUserInfo() {
  // Make the actual RPC call.
  return rpcs.rpc('get_current_user_info');
} // registerUser() -- Call rpc() for registering a new user.


function registerUser(username, password, displayname, email) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  var hashPassword = sha224(password).toString(); // Make the actual RPC call.

  return rpcs.rpc('user_register', [username, hashPassword, displayname, email]);
} // changeUserInfo() -- Call rpc() for changing a user's info.


function changeUserInfo(username, password, displayname, email) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  var hashPassword = sha224(password).toString(); // Make the actual RPC call.

  return rpcs.rpc('user_change_info', [username, hashPassword, displayname, email]);
} // changeUserPassword() -- Call rpc() for changing a user's password.


function changeUserPassword(oldpassword, newpassword) {
  // Get a hex version of the hashed passwords using the SHA224 algorithm.
  var hashOldPassword = sha224(oldpassword).toString();
  var hashNewPassword = sha224(newpassword).toString(); // Make the actual RPC call.

  return rpcs.rpc('user_change_password', [hashOldPassword, hashNewPassword]);
} // adminGetUserInfo() -- Call rpc() for getting user information at the admin level.


function adminGetUserInfo(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_get_user_info', [username]);
} // deleteUser() -- Call rpc() for deleting a user.


function deleteUser(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_delete_user', [username]);
} // activateUserAccount() -- Call rpc() for activating a user account.


function activateUserAccount(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_activate_account', [username]);
} // deactivateUserAccount() -- Call rpc() for deactivating a user account.


function deactivateUserAccount(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_deactivate_account', [username]);
} // grantUserAdminRights() -- Call rpc() for granting a user admin rights.


function grantUserAdminRights(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_grant_admin', [username]);
} // revokeUserAdminRights() -- Call rpc() for revoking user admin rights.


function revokeUserAdminRights(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_revoke_admin', [username]);
} // resetUserPassword() -- Call rpc() for resetting a user's password.


function resetUserPassword(username) {
  // Make the actual RPC call.
  return rpcs.rpc('admin_reset_password', [username]);
} // Higher level user functions that call the lower level ones above


function getUserInfo(store) {
  // Do the actual RPC call.
  getCurrentUserInfo().then(response => {
    // Set the username to what the server indicates.
    store.commit('newUser', response.data.user);
  }).catch(error => {
    // Set the username to {}.  An error probably means the
    // user is not logged in.
    store.commit('newUser', {});
  });
}

function checkLoggedIn() {
  if (this.currentUser.displayname === undefined) return false;else return true;
}

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

/*
 * Heftier functions that are shared across pages
 */

function updateSets(vm) {
  return new Promise((resolve, reject) => {
    console.log('updateSets() called');
    rpcs.rpc('get_parset_info', [vm.projectID]) // Get the current user's parsets from the server.
    .then(response => {
      vm.parsetOptions = response.data; // Set the scenarios to what we received.

      if (vm.parsetOptions.indexOf(vm.activeParset) === -1) {
        console.log('Parameter set ' + vm.activeParset + ' no longer found');
        vm.activeParset = vm.parsetOptions[0]; // If the active parset no longer exists in the array, reset it
      } else {
        console.log('Parameter set ' + vm.activeParset + ' still found');
      }

      vm.newParsetName = vm.activeParset; // WARNING, KLUDGY

      console.log('Parset options: ' + vm.parsetOptions);
      console.log('Active parset: ' + vm.activeParset);
      rpcs.rpc('get_progset_info', [vm.projectID]) // Get the current user's progsets from the server.
      .then(response => {
        vm.progsetOptions = response.data; // Set the scenarios to what we received.

        if (vm.progsetOptions.indexOf(vm.activeProgset) === -1) {
          console.log('Program set ' + vm.activeProgset + ' no longer found');
          vm.activeProgset = vm.progsetOptions[0]; // If the active parset no longer exists in the array, reset it
        } else {
          console.log('Program set ' + vm.activeProgset + ' still found');
        }

        vm.newProgsetName = vm.activeProgset; // WARNING, KLUDGY

        console.log('Progset options: ' + vm.progsetOptions);
        console.log('Active progset: ' + vm.activeProgset);
        resolve(response);
      }).catch(error => {
        status.fail(this, 'Could not get progset info', error);
        reject(error);
      });
    }).catch(error => {
      status.fail(this, 'Could not get parset info', error);
      reject(error);
    });
  }).catch(error => {
    status.fail(this, 'Could not get parset info', error);
    reject(error);
  });
}

function exportGraphs(vm) {
  return new Promise((resolve, reject) => {
    console.log('exportGraphs() called');
    rpcs.download('download_graphs', [vm.$store.state.currentUser.username]).then(response => {
      resolve(response);
    }).catch(error => {
      status.fail(vm, 'Could not download graphs', error);
      reject(error);
    });
  });
}

function exportResults(vm, serverDatastoreId) {
  return new Promise((resolve, reject) => {
    console.log('exportResults()');
    rpcs.download('export_results', [serverDatastoreId, vm.$store.state.currentUser.username]).then(response => {
      resolve(response);
    }).catch(error => {
      status.fail(vm, 'Could not export results', error);
      reject(error);
    });
  });
}

function updateDatasets(vm) {
  return new Promise((resolve, reject) => {
    console.log('updateDatasets() called');
    rpcs.rpc('get_dataset_keys', [vm.projectID]) // Get the current user's datasets from the server.
    .then(response => {
      vm.datasetOptions = response.data; // Set the scenarios to what we received.

      if (vm.datasetOptions.indexOf(vm.activeDataset) === -1) {
        console.log('Dataset ' + vm.activeDataset + ' no longer found');
        vm.activeDataset = vm.datasetOptions[0]; // If the active dataset no longer exists in the array, reset it
      } else {
        console.log('Dataset ' + vm.activeDataset + ' still found');
      }

      vm.newDatsetName = vm.activeDataset; // WARNING, KLUDGY

      console.log('Datset options: ' + vm.datasetOptions);
      console.log('Active dataset: ' + vm.activeDataset);
    }).catch(error => {
      status.fail(this, 'Could not get dataset info', error);
      reject(error);
    });
  });
}

var shared = {
  updateSets,
  updateDatasets,
  exportGraphs,
  exportResults
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

function normalizeComponent(compiledTemplate, injectStyle, defaultExport, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, isShadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof isShadowMode === 'function') {
        createInjectorSSR = createInjector;
        createInjector = isShadowMode;
        isShadowMode = false;
    }
    // Vue.extend constructor export interop
    const options = typeof defaultExport === 'function' ? defaultExport.options : defaultExport;
    // render functions
    if (compiledTemplate && compiledTemplate.render) {
        options.render = compiledTemplate.render;
        options.staticRenderFns = compiledTemplate.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (injectStyle) {
                injectStyle.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (injectStyle) {
        hook = isShadowMode
            ? function () {
                injectStyle.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
            }
            : function (context) {
                injectStyle.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return defaultExport;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
const HEAD = document.head || document.getElementsByTagName('head')[0];
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;
// For security concerns, we use only base name in production mode. See https://github.com/vuejs/rollup-plugin-vue/issues/258
script.__file = "PopupSpinner.vue";

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
  

  
  var PopupSpinner = normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    createInjector,
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
// For security concerns, we use only base name in production mode. See https://github.com/vuejs/rollup-plugin-vue/issues/258
script$1.__file = "Notification.vue";

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
  

  
  var Notification = normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    createInjector,
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
// For security concerns, we use only base name in production mode. See https://github.com/vuejs/rollup-plugin-vue/issues/258
script$2.__file = "Notifications.vue";

/* template */
var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"notifications"},[_c('transition-group',{attrs:{"name":"list"},on:{"on-close":_vm.removeNotification}},_vm._l((_vm.notifications),function(notification,index){return _c('notification',{attrs:{"message":notification.message,"icon":notification.icon,"type":notification.type,"vertical-align":notification.verticalAlign,"horizontal-align":notification.horizontalAlign,"timeout":notification.timeout,"timestamp":notification.timestamp}})}),1)],1)};
var __vue_staticRenderFns__$2 = [];

  /* style */
  const __vue_inject_styles__$2 = function (inject) {
    if (!inject) return
    inject("data-v-321d3bee_0", { source: ".list-item{display:inline-block;margin-right:10px}.list-enter-active,.list-leave-active{transition:all 1s}.list-enter,.list-leave-to{opacity:0;transform:translateY(-30px)}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$2 = undefined;
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject SSR */
  

  
  var Notifications = normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    createInjector,
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
// For security concerns, we use only base name in production mode. See https://github.com/vuejs/rollup-plugin-vue/issues/258
script$3.__file = "Dropdown.vue";

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
  

  
  var Dropdown = normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    createInjector,
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

const rpc = rpcs.rpc;
const download = rpcs.download;
const upload = rpcs.upload;
const succeed$1 = status.succeed;
const fail$1 = status.fail;
const start$1 = status.start;
const updateSets$1 = shared.updateSets;
const updateDatasets$1 = shared.updateDatasets;
const exportGraphs$1 = shared.exportGraphs;
const exportResults$1 = shared.exportResults;
const placeholders$1 = graphs.placeholders;
const clearGraphs$1 = graphs.clearGraphs;
const getPlotOptions$1 = graphs.getPlotOptions;
const togglePlotControls$1 = graphs.togglePlotControls;
const makeGraphs$1 = graphs.makeGraphs;
const reloadGraphs$1 = graphs.reloadGraphs;
const scaleFigs$1 = graphs.scaleFigs;
const showBrowserWindowSize$1 = graphs.showBrowserWindowSize;
const addListener$1 = graphs.addListener;
const onMouseUpdate$1 = graphs.onMouseUpdate;
const createDialogs$1 = graphs.createDialogs;
const newDialog$1 = graphs.newDialog;
const findDialog$1 = graphs.findDialog;
const maximize$1 = graphs.maximize;
const minimize$1 = graphs.minimize;
const mpld3$1 = graphs.mpld3;
const draw_figure = mpld3$1.draw_figure;
const getTaskResultWaiting$1 = tasks.getTaskResultWaiting;
const getTaskResultPolling$1 = tasks.getTaskResultPolling;
const loginCall$1 = user.loginCall;
const logoutCall$1 = user.logoutCall;
const getCurrentUserInfo$1 = user.getCurrentUserInfo;
const registerUser$1 = user.registerUser;
const changeUserInfo$1 = user.changeUserInfo;
const changeUserPassword$1 = user.changeUserPassword;
const adminGetUserInfo$1 = user.adminGetUserInfo;
const deleteUser$1 = user.deleteUser;
const activateUserAccount$1 = user.activateUserAccount;
const deactivateUserAccount$1 = user.deactivateUserAccount;
const grantUserAdminRights$1 = user.grantUserAdminRights;
const revokeUserAdminRights$1 = user.revokeUserAdminRights;
const resetUserPassword$1 = user.resetUserPassword;
const getUserInfo$1 = user.getUserInfo;
const currentUser = user.currentUser;
const checkLoggedIn$1 = user.checkLoggedIn;
const checkAdminLoggedIn$1 = user.checkAdminLoggedIn;
const logOut = user.logOut;
const sleep$1 = utils.sleep;
const getUniqueName$1 = utils.getUniqueName;
const validateYears$1 = utils.validateYears;
const projectID$1 = utils.projectID;
const hasData$1 = utils.hasData;
const hasPrograms$1 = utils.hasPrograms;
const simStart$1 = utils.simStart;
const simEnd$1 = utils.simEnd;
const simYears$1 = utils.simYears;
const dataStart$1 = utils.dataStart;
const dataEnd$1 = utils.dataEnd;
const dataYears$1 = utils.dataYears;
const projectionYears$1 = utils.projectionYears;
const activePops$1 = utils.activePops;
const updateSorting$1 = utils.updateSorting;
const sciris = {
  // rpc-service.js
  rpc,
  download,
  upload,
  // shared.js
  updateSets: updateSets$1,
  updateDatasets: updateDatasets$1,
  exportGraphs: exportGraphs$1,
  exportResults: exportResults$1,
  // graphs.js
  placeholders: placeholders$1,
  clearGraphs: clearGraphs$1,
  getPlotOptions: getPlotOptions$1,
  togglePlotControls: togglePlotControls$1,
  makeGraphs: makeGraphs$1,
  reloadGraphs: reloadGraphs$1,
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
  logOut,
  // utils.js
  sleep: sleep$1,
  getUniqueName: getUniqueName$1,
  validateYears: validateYears$1,
  projectID: projectID$1,
  hasData: hasData$1,
  hasPrograms: hasPrograms$1,
  simStart: simStart$1,
  simEnd: simEnd$1,
  simYears: simYears$1,
  dataStart: dataStart$1,
  dataEnd: dataEnd$1,
  dataYears: dataYears$1,
  projectionYears: projectionYears$1,
  activePops: activePops$1,
  updateSorting: updateSorting$1,
  rpcs,
  graphs,
  status,
  shared,
  user,
  tasks,
  utils,
  ScirisVue,
  EventBus
};

exports.default = sciris;
exports.sciris = sciris;
