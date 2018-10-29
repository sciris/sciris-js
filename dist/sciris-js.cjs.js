/*!
 * sciris-js v0.1.0
 * (c) 2018-present Optima Consortium <info@ocds.co>
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var axios = _interopDefault(require('axios'));
var saveAs = _interopDefault(require('file-saver'));
var sha224 = _interopDefault(require('crypto-js/sha224'));
var VueProgressBar = _interopDefault(require('vue-progressbar'));
var VModal = _interopDefault(require('vue-js-modal'));
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
  vm.$spinner.start();
});
EventBus.$on(events.EVENT_STATUS_UPDATE, (vm, progress) => {
  vm.$Progress.set(progress);
});
EventBus.$on(events.EVENT_STATUS_SUCCEED, (vm, notif) => {
  vm.$spinner.stop();
  vm.$Progress.finish();
  if (notif) vm.$notifications.notify(notif);
});
EventBus.$on(events.EVENT_STATUS_FAIL, (vm, notif) => {
  vm.$spinner.stop();
  vm.$Progress.fail();
  if (notif) vm.$notifications.notify(notif);
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

    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }

    vm.hasGraphs = false;
  }
}

function makeGraphs(vm, data, routepath) {
  console.log('makeGraphs() called');

  if (routepath !== vm.$route.path) {
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
  minimize
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

function currentUser() {
  return store.state.currentUser;
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

function logOut(router) {
  // Do the actual logout RPC.
  logoutCall().then(response => {
    // Update the user info.
    getUserInfo(); // Clear out the active project.

    store.commit('newActiveProject', {}); // Navigate to the login page automatically.

    router.push('/login');
  });
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
  currentUser,
  checkLoggedIn,
  checkAdminLoggedIn,
  logOut
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.v-spinner .v-moon1 {\n  -webkit-animation: v-moonStretchDelay 0.6s 0s infinite linear;\n  animation: v-moonStretchDelay 0.6s 0s infinite linear;\n  -webkit-animation-fill-mode: forwards;\n  animation-fill-mode: forwards;\n  position: relative;\n}\n\n.v-spinner .v-moon2 {\n  -webkit-animation: v-moonStretchDelay 0.6s 0s infinite linear;\n  animation: v-moonStretchDelay 0.6s 0s infinite linear;\n  -webkit-animation-fill-mode: forwards;\n  animation-fill-mode: forwards;\n  opacity: 0.9;\n  position: absolute;\n}\n\n.v-spinner .v-moon3\n{\n  opacity: 0.1;\n}\n\n@-webkit-keyframes v-moonStretchDelay\n{\n  100%\n  {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes v-moonStretchDelay\n{\n  100%\n  {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n.vue-dialog div {\n  box-sizing: border-box;\n}\n.vue-dialog .dialog-flex {\n  width: 100%;\n  height: 100%;\n}\n.vue-dialog .dialog-content {\n  flex: 1 0 auto;\n  width: 100%;\n  padding: 15px;\n  font-size: 14px;\n}\n.vue-dialog .dialog-c-title {\n  font-weight: 600;\n  padding-bottom: 15px;\n}\n.vue-dialog .dialog-c-text {\n}\n.vue-dialog .vue-dialog-buttons {\n  display: flex;\n  flex: 0 1 auto;\n  width: 100%;\n  border-top: 1px solid #eee;\n}\n.vue-dialog .vue-dialog-buttons-none {\n  width: 100%;\n  padding-bottom: 15px;\n}\n.vue-dialog-button {\n  font-size: 12px !important;\n  background: transparent;\n  padding: 0;\n  margin: 0;\n  border: 0;\n  cursor: pointer;\n  box-sizing: border-box;\n  line-height: 40px;\n  height: 40px;\n  color: inherit;\n  font: inherit;\n  outline: none;\n}\n.vue-dialog-button:hover {\n  background: rgba(0, 0, 0, 0.01);\n}\n.vue-dialog-button:active {\n  background: rgba(0, 0, 0, 0.025);\n}\n.vue-dialog-button:not(:first-of-type) {\n  border-left: 1px solid #eee;\n}\n\n";
styleInject(css);

var PopupSpinner = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{staticStyle:{"opacity":"1.0"},attrs:{"name":"popup-spinner","height":_vm.modalHeight,"width":_vm.modalWidth,"click-to-close":false},on:{"before-open":_vm.beforeOpen,"before-close":_vm.beforeClose}},[_c('div',{style:(_vm.spinnerWrapStyle)},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.loading),expression:"loading"}],staticClass:"v-spinner"},[_c('div',{staticClass:"v-moon v-moon1",style:(_vm.spinnerStyle)},[_c('div',{staticClass:"v-moon v-moon2",style:([_vm.spinnerMoonStyle,_vm.animationStyle2])}),_vm._v(" "),_c('div',{staticClass:"v-moon v-moon3",style:([_vm.spinnerStyle,_vm.animationStyle3])})])])]),_vm._v(" "),(_vm.title !== '')?_c('div',{style:(_vm.titleStyle)},[_vm._v(" "+_vm._s(_vm.title)+" ")]):_vm._e(),_vm._v(" "),(_vm.hasCancelButton)?_c('div',{staticStyle:{"padding":"13px"}},[_c('button',{style:(_vm.cancelButtonStyle),on:{"click":_vm.cancel}},[_vm._v("Cancel")])]):_vm._e()])},staticRenderFns: [],_scopeId: 'data-v-3515e57d',
  name: 'PopupSpinner',
  
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
      spinnerStyle: {
        height: this.size,
        width: this.size,
        borderRadius: this.radius
      },
      spinnerWrapStyle: {
        padding: this.padding
      }, 
      titleStyle: {
        textAlign: 'center'
      },
      cancelButtonStyle: {
        padding: '2px'
      },          
      opened: false
    }
  },
  
  beforeMount() {
    // Create listener for start event.
    EventBus.$on('spinner:start', () => {
      this.show();
    });
    
    // Create listener for stop event.
    EventBus.$on('spinner:stop', () => {
      this.hide();
    });      
  },
  
  computed: {
    modalHeight() {
      // Start with the height of the spinner wrapper.
      let fullHeight = parseFloat(this.size) + 2 * parseFloat(this.padding);
      
      // If there is a title there, add space for the text.
      if (this.title !== '') {
        fullHeight = fullHeight + 20 + parseFloat(this.padding);        
      }
      
      // If there is a cancel button there, add space for it.
      if (this.hasCancelButton) {
        fullHeight = fullHeight + 20 + parseFloat(this.padding);
      }
      
      return fullHeight + 'px'
    },
    
    modalWidth() {
      return parseFloat(this.size) + 2 * parseFloat(this.padding) + 'px'
    },
    
    moonSize() {
      return parseFloat(this.size)/7
    },
    
    spinnerMoonStyle() {
      return {
        height: this.moonSize  + 'px',
        width: this.moonSize  + 'px',
        borderRadius: this.radius
      }
    },
    
    animationStyle2() {
      return {
        top: parseFloat(this.size)/2 - this.moonSize/2 + 'px',
        backgroundColor: this.color
      }
    },
    
    animationStyle3() {
      return {
        border: this.moonSize + 'px solid ' + this.color
      }
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

}

var css$1 = ".list-item {\n  display: inline-block;\n  margin-right: 10px; }\n\n.list-enter-active,\n.list-leave-active {\n  transition: all 1s; }\n\n.list-enter,\n.list-leave-to {\n  opacity: 0;\n  transform: translateY(-30px); }\n";
styleInject(css$1);

var css$2 = ".fade-enter-active,\n.fade-leave-active {\n  transition: opacity .3s; }\n\n.fade-enter,\n.fade-leave-to {\n  opacity: 0; }\n\n.alert {\n  border: 0;\n  border-radius: 0;\n  color: #FFFFFF;\n  padding: 20px 15px;\n  font-size: 14px;\n  z-index: 100;\n  display: inline-block;\n  position: fixed;\n  transition: all 0.5s ease-in-out; }\n  .container .alert {\n    border-radius: 4px; }\n  .alert.center {\n    left: 0px;\n    right: 0px;\n    margin: 0 auto; }\n  .alert.left {\n    left: 20px; }\n  .alert.right {\n    right: 20px; }\n  .container .alert {\n    border-radius: 0px; }\n  .navbar .alert {\n    border-radius: 0;\n    left: 0;\n    position: absolute;\n    right: 0;\n    top: 85px;\n    width: 100%;\n    z-index: 3; }\n  .navbar:not(.navbar-transparent) .alert {\n    top: 70px; }\n  .alert .alert-icon {\n    font-size: 30px;\n    margin-right: 5px; }\n  .alert .close ~ span {\n    display: inline-block;\n    max-width: 89%; }\n  .alert[data-notify=\"container\"] {\n    /*max-width: 400px;*/\n    padding: 10px 5px 5px 10px;\n    border-radius: 2px; }\n  .alert.alert-with-icon {\n    /*padding-left: 15px; // CK: actual left padding*/ }\n\n.alert-info {\n  background-color: #7CE4FE;\n  color: #3091B2; }\n\n.alert-success {\n  background-color: #008800;\n  color: #fff; }\n\n.alert-warning {\n  background-color: #e29722;\n  color: #fff; }\n\n.alert-danger {\n  background-color: #FF8F5E;\n  color: #B33C12; }\n\n#flex {\n  display: flex;\n  justify-content: space-between; }\n\n#flex div {\n  padding: 4px; }\n";
styleInject(css$2);

var Notification = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"alert open alert-with-icon",class:[_vm.verticalAlign, _vm.horizontalAlign, _vm.alertType],style:(_vm.customPosition),attrs:{"data-notify":"container","role":"alert","data-notify-position":"top-center"}},[_c('div',{attrs:{"id":"flex"}},[_c('div',{staticStyle:{"padding-top":"10px","padding-right":"10px"}},[_c('span',{staticClass:"alert-icon",class:_vm.icon,staticStyle:{"font-size":"25px"},attrs:{"data-notify":"message"}})]),_vm._v(" "),_c('div',{staticStyle:{"max-width":"400px","font-size":"15px","align-content":"center"}},[_c('div',{attrs:{"data-notify":"message"},domProps:{"innerHTML":_vm._s(_vm.message)}})]),_vm._v(" "),_c('div',{staticStyle:{"padding-left":"10px"}},[_c('button',{staticClass:"btn __trans",attrs:{"aria-hidden":"true","data-notify":"dismiss"},on:{"click":_vm.close}},[_vm._m(0)])])])])},staticRenderFns: [function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticStyle:{"font-size":"18px","color":"#fff","background-color":"transparent","background":"transparent"}},[_c('i',{staticClass:"ti-close"})])}],_scopeId: 'data-v-9084a0ca',
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
        default: 'center'
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
      },      
    },
    data () {
      return {}
    },
    computed: {
      hasIcon () {
        return this.icon && this.icon.length > 0
      },
      alertType () {
        return `alert-${this.type}`
      },
      customPosition () {
        let initialMargin = 20;
        let alertHeight = 60;
        let sameAlertsCount = this.$notifications.state.filter((alert) => {
          return alert.horizontalAlign === this.horizontalAlign && alert.verticalAlign === this.verticalAlign
        }).length;
        let pixels = (sameAlertsCount - 1) * alertHeight + initialMargin;
        let styles = {};
        if (this.verticalAlign === 'top') {
          styles.top = `${pixels}px`;
        } else {
          styles.bottom = `${pixels}px`;
        }
        return styles
      }
    },
    methods: {
      close () {
//        console.log('Trying to close: ', this.timestamp)
        this.$parent.$emit('on-close', this.timestamp);  
      }
    },
    mounted () {
      if (this.timeout) {
        setTimeout(this.close, this.timeout);
      }
    }
  }

var Notifications = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"notifications"},[_c('transition-group',{attrs:{"name":"list"},on:{"on-close":_vm.removeNotification}},_vm._l((_vm.notifications),function(notification,index){return _c('notification',{key:index,attrs:{"message":notification.message,"icon":notification.icon,"type":notification.type,"vertical-align":notification.verticalAlign,"horizontal-align":notification.horizontalAlign,"timeout":notification.timeout,"timestamp":notification.timestamp}})}))],1)},staticRenderFns: [],
    components: {
      Notification
    },
    data () {
      return {
        notifications: this.$notifications.state
      }
    },
    methods: {
      removeNotification (timestamp) {
//        console.log('Pre-removing notification: ', timestamp)
        this.$notifications.removeNotification(timestamp);
        
        // Hack to address "sticky" notifications: after a removal, clear all 
        // notifications after 2 seconds.
//        setTimeout(this.clearAllNotifications, 2000)
      },
      
      clearAllNotifications () {
        this.$notifications.clear();
      }
    }
  }

var css$3 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.dropdown {\n  cursor: pointer;\n}\n";
styleInject(css$3);

var Dropdown = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{directives:[{name:"click-outside",rawName:"v-click-outside",value:(_vm.closeDropDown),expression:"closeDropDown"}],staticClass:"dropdown",class:{open:_vm.isOpen},on:{"click":_vm.toggleDropDown}},[_c('a',{staticClass:"dropdown-toggle btn-rotate",attrs:{"data-toggle":"dropdown","href":"javascript:void(0)"}},[_vm._t("title",[_c('i',{class:_vm.icon}),_vm._v(" "),_c('p',{staticClass:"notification"},[_vm._v(_vm._s(_vm.title)+" "),_c('b',{staticClass:"caret"})])])],2),_vm._v(" "),_c('ul',{staticClass:"dropdown-menu"},[_vm._t("default")],2)])},staticRenderFns: [],
  props: {
    title: String,
    icon: String
  },
  data () {
    return {
      isOpen: false
    }
  },
  methods: {
    toggleDropDown () {
      this.isOpen = !this.isOpen;
    },
    closeDropDown () {
      this.isOpen = false;
    }
  }
}

const NotificationStore = {
  state: [],

  // here the notifications will be added
  removeNotification(timestamp) {
    //    console.log('Removing notification: ', timestamp)
    const indexToDelete = this.state.findIndex(n => n.timestamp === timestamp);

    if (indexToDelete !== -1) {
      this.state.splice(indexToDelete, 1);
    }
  },

  notify(notification) {
    // Create a timestamp to serve as a unique ID for the notification.
    notification.timestamp = new Date();
    notification.timestamp.setMilliseconds(notification.timestamp.getMilliseconds() + this.state.length); //    console.log('Adding notification: ', notification.timestamp)    

    this.state.push(notification);
  },

  clear() {
    //    console.log('Removing all notifications: ', this.state.length)
    // This removes all of them in a way that the GUI keeps up.
    while (this.state.length > 0) {
      this.removeNotification(this.state[0].timestamp);
    } //    this.state = []  // This way destroys GUI state.

  }

};

function setupSpinner(Vue$$1) {
  // Create the global $spinner functions the user can call 
  // from inside any component.
  Vue$$1.use(VModal);
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
  if (!options.disableNotifications) {
    setupNotifications(Vue$$1);
    Vue$$1.component('Notifications', Notifications);
  }

  if (!options.disableSpinner && !this.spinnerInstalled) {
    this.spinnerInstalled = true;
    setupSpinner(Vue$$1);
    Vue$$1.component('PopupSpinner', PopupSpinner);
  }

  if (!options.disableProgress) {
    setupProgressBar(Vue$$1, options.progressBarOptions);
  }

  Vue$$1.component('Dropdown', Dropdown);
  Vue$$1.component('DialogDrag', DialogDrag);
} // Automatic installation if Vue has been added to the global scope.


if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({
    install
  });
}

var ScirisVue = {
  install
};

var css$4 = "@font-face {\n\tfont-family: 'themify';\n\tsrc:url('fonts/themify.eot?-fvbane');\n\tsrc:url('fonts/themify.eot?#iefix-fvbane') format('embedded-opentype'),\n\t\turl('fonts/themify.woff?-fvbane') format('woff'),\n\t\turl('fonts/themify.ttf?-fvbane') format('truetype'),\n\t\turl('fonts/themify.svg?-fvbane#themify') format('svg');\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n[class^=\"ti-\"], [class*=\" ti-\"] {\n\tfont-family: 'themify';\n\tspeak: none;\n\tfont-style: normal;\n\tfont-weight: normal;\n\tfont-variant: normal;\n\ttext-transform: none;\n\tline-height: 1;\n\n\t/* Better Font Rendering =========== */\n\t-webkit-font-smoothing: antialiased;\n\t-moz-osx-font-smoothing: grayscale;\n}\n\n.ti-wand:before {\n\tcontent: \"\\e600\";\n}\n.ti-volume:before {\n\tcontent: \"\\e601\";\n}\n.ti-user:before {\n\tcontent: \"\\e602\";\n}\n.ti-unlock:before {\n\tcontent: \"\\e603\";\n}\n.ti-unlink:before {\n\tcontent: \"\\e604\";\n}\n.ti-trash:before {\n\tcontent: \"\\e605\";\n}\n.ti-thought:before {\n\tcontent: \"\\e606\";\n}\n.ti-target:before {\n\tcontent: \"\\e607\";\n}\n.ti-tag:before {\n\tcontent: \"\\e608\";\n}\n.ti-tablet:before {\n\tcontent: \"\\e609\";\n}\n.ti-star:before {\n\tcontent: \"\\e60a\";\n}\n.ti-spray:before {\n\tcontent: \"\\e60b\";\n}\n.ti-signal:before {\n\tcontent: \"\\e60c\";\n}\n.ti-shopping-cart:before {\n\tcontent: \"\\e60d\";\n}\n.ti-shopping-cart-full:before {\n\tcontent: \"\\e60e\";\n}\n.ti-settings:before {\n\tcontent: \"\\e60f\";\n}\n.ti-search:before {\n\tcontent: \"\\e610\";\n}\n.ti-zoom-in:before {\n\tcontent: \"\\e611\";\n}\n.ti-zoom-out:before {\n\tcontent: \"\\e612\";\n}\n.ti-cut:before {\n\tcontent: \"\\e613\";\n}\n.ti-ruler:before {\n\tcontent: \"\\e614\";\n}\n.ti-ruler-pencil:before {\n\tcontent: \"\\e615\";\n}\n.ti-ruler-alt:before {\n\tcontent: \"\\e616\";\n}\n.ti-bookmark:before {\n\tcontent: \"\\e617\";\n}\n.ti-bookmark-alt:before {\n\tcontent: \"\\e618\";\n}\n.ti-reload:before {\n\tcontent: \"\\e619\";\n}\n.ti-plus:before {\n\tcontent: \"\\e61a\";\n}\n.ti-pin:before {\n\tcontent: \"\\e61b\";\n}\n.ti-pencil:before {\n\tcontent: \"\\e61c\";\n}\n.ti-pencil-alt:before {\n\tcontent: \"\\e61d\";\n}\n.ti-paint-roller:before {\n\tcontent: \"\\e61e\";\n}\n.ti-paint-bucket:before {\n\tcontent: \"\\e61f\";\n}\n.ti-na:before {\n\tcontent: \"\\e620\";\n}\n.ti-mobile:before {\n\tcontent: \"\\e621\";\n}\n.ti-minus:before {\n\tcontent: \"\\e622\";\n}\n.ti-medall:before {\n\tcontent: \"\\e623\";\n}\n.ti-medall-alt:before {\n\tcontent: \"\\e624\";\n}\n.ti-marker:before {\n\tcontent: \"\\e625\";\n}\n.ti-marker-alt:before {\n\tcontent: \"\\e626\";\n}\n.ti-arrow-up:before {\n\tcontent: \"\\e627\";\n}\n.ti-arrow-right:before {\n\tcontent: \"\\e628\";\n}\n.ti-arrow-left:before {\n\tcontent: \"\\e629\";\n}\n.ti-arrow-down:before {\n\tcontent: \"\\e62a\";\n}\n.ti-lock:before {\n\tcontent: \"\\e62b\";\n}\n.ti-location-arrow:before {\n\tcontent: \"\\e62c\";\n}\n.ti-link:before {\n\tcontent: \"\\e62d\";\n}\n.ti-layout:before {\n\tcontent: \"\\e62e\";\n}\n.ti-layers:before {\n\tcontent: \"\\e62f\";\n}\n.ti-layers-alt:before {\n\tcontent: \"\\e630\";\n}\n.ti-key:before {\n\tcontent: \"\\e631\";\n}\n.ti-import:before {\n\tcontent: \"\\e632\";\n}\n.ti-image:before {\n\tcontent: \"\\e633\";\n}\n.ti-heart:before {\n\tcontent: \"\\e634\";\n}\n.ti-heart-broken:before {\n\tcontent: \"\\e635\";\n}\n.ti-hand-stop:before {\n\tcontent: \"\\e636\";\n}\n.ti-hand-open:before {\n\tcontent: \"\\e637\";\n}\n.ti-hand-drag:before {\n\tcontent: \"\\e638\";\n}\n.ti-folder:before {\n\tcontent: \"\\e639\";\n}\n.ti-flag:before {\n\tcontent: \"\\e63a\";\n}\n.ti-flag-alt:before {\n\tcontent: \"\\e63b\";\n}\n.ti-flag-alt-2:before {\n\tcontent: \"\\e63c\";\n}\n.ti-eye:before {\n\tcontent: \"\\e63d\";\n}\n.ti-export:before {\n\tcontent: \"\\e63e\";\n}\n.ti-exchange-vertical:before {\n\tcontent: \"\\e63f\";\n}\n.ti-desktop:before {\n\tcontent: \"\\e640\";\n}\n.ti-cup:before {\n\tcontent: \"\\e641\";\n}\n.ti-crown:before {\n\tcontent: \"\\e642\";\n}\n.ti-comments:before {\n\tcontent: \"\\e643\";\n}\n.ti-comment:before {\n\tcontent: \"\\e644\";\n}\n.ti-comment-alt:before {\n\tcontent: \"\\e645\";\n}\n.ti-close:before {\n\tcontent: \"\\e646\";\n}\n.ti-clip:before {\n\tcontent: \"\\e647\";\n}\n.ti-angle-up:before {\n\tcontent: \"\\e648\";\n}\n.ti-angle-right:before {\n\tcontent: \"\\e649\";\n}\n.ti-angle-left:before {\n\tcontent: \"\\e64a\";\n}\n.ti-angle-down:before {\n\tcontent: \"\\e64b\";\n}\n.ti-check:before {\n\tcontent: \"\\e64c\";\n}\n.ti-check-box:before {\n\tcontent: \"\\e64d\";\n}\n.ti-camera:before {\n\tcontent: \"\\e64e\";\n}\n.ti-announcement:before {\n\tcontent: \"\\e64f\";\n}\n.ti-brush:before {\n\tcontent: \"\\e650\";\n}\n.ti-briefcase:before {\n\tcontent: \"\\e651\";\n}\n.ti-bolt:before {\n\tcontent: \"\\e652\";\n}\n.ti-bolt-alt:before {\n\tcontent: \"\\e653\";\n}\n.ti-blackboard:before {\n\tcontent: \"\\e654\";\n}\n.ti-bag:before {\n\tcontent: \"\\e655\";\n}\n.ti-move:before {\n\tcontent: \"\\e656\";\n}\n.ti-arrows-vertical:before {\n\tcontent: \"\\e657\";\n}\n.ti-arrows-horizontal:before {\n\tcontent: \"\\e658\";\n}\n.ti-fullscreen:before {\n\tcontent: \"\\e659\";\n}\n.ti-arrow-top-right:before {\n\tcontent: \"\\e65a\";\n}\n.ti-arrow-top-left:before {\n\tcontent: \"\\e65b\";\n}\n.ti-arrow-circle-up:before {\n\tcontent: \"\\e65c\";\n}\n.ti-arrow-circle-right:before {\n\tcontent: \"\\e65d\";\n}\n.ti-arrow-circle-left:before {\n\tcontent: \"\\e65e\";\n}\n.ti-arrow-circle-down:before {\n\tcontent: \"\\e65f\";\n}\n.ti-angle-double-up:before {\n\tcontent: \"\\e660\";\n}\n.ti-angle-double-right:before {\n\tcontent: \"\\e661\";\n}\n.ti-angle-double-left:before {\n\tcontent: \"\\e662\";\n}\n.ti-angle-double-down:before {\n\tcontent: \"\\e663\";\n}\n.ti-zip:before {\n\tcontent: \"\\e664\";\n}\n.ti-world:before {\n\tcontent: \"\\e665\";\n}\n.ti-wheelchair:before {\n\tcontent: \"\\e666\";\n}\n.ti-view-list:before {\n\tcontent: \"\\e667\";\n}\n.ti-view-list-alt:before {\n\tcontent: \"\\e668\";\n}\n.ti-view-grid:before {\n\tcontent: \"\\e669\";\n}\n.ti-uppercase:before {\n\tcontent: \"\\e66a\";\n}\n.ti-upload:before {\n\tcontent: \"\\e66b\";\n}\n.ti-underline:before {\n\tcontent: \"\\e66c\";\n}\n.ti-truck:before {\n\tcontent: \"\\e66d\";\n}\n.ti-timer:before {\n\tcontent: \"\\e66e\";\n}\n.ti-ticket:before {\n\tcontent: \"\\e66f\";\n}\n.ti-thumb-up:before {\n\tcontent: \"\\e670\";\n}\n.ti-thumb-down:before {\n\tcontent: \"\\e671\";\n}\n.ti-text:before {\n\tcontent: \"\\e672\";\n}\n.ti-stats-up:before {\n\tcontent: \"\\e673\";\n}\n.ti-stats-down:before {\n\tcontent: \"\\e674\";\n}\n.ti-split-v:before {\n\tcontent: \"\\e675\";\n}\n.ti-split-h:before {\n\tcontent: \"\\e676\";\n}\n.ti-smallcap:before {\n\tcontent: \"\\e677\";\n}\n.ti-shine:before {\n\tcontent: \"\\e678\";\n}\n.ti-shift-right:before {\n\tcontent: \"\\e679\";\n}\n.ti-shift-left:before {\n\tcontent: \"\\e67a\";\n}\n.ti-shield:before {\n\tcontent: \"\\e67b\";\n}\n.ti-notepad:before {\n\tcontent: \"\\e67c\";\n}\n.ti-server:before {\n\tcontent: \"\\e67d\";\n}\n.ti-quote-right:before {\n\tcontent: \"\\e67e\";\n}\n.ti-quote-left:before {\n\tcontent: \"\\e67f\";\n}\n.ti-pulse:before {\n\tcontent: \"\\e680\";\n}\n.ti-printer:before {\n\tcontent: \"\\e681\";\n}\n.ti-power-off:before {\n\tcontent: \"\\e682\";\n}\n.ti-plug:before {\n\tcontent: \"\\e683\";\n}\n.ti-pie-chart:before {\n\tcontent: \"\\e684\";\n}\n.ti-paragraph:before {\n\tcontent: \"\\e685\";\n}\n.ti-panel:before {\n\tcontent: \"\\e686\";\n}\n.ti-package:before {\n\tcontent: \"\\e687\";\n}\n.ti-music:before {\n\tcontent: \"\\e688\";\n}\n.ti-music-alt:before {\n\tcontent: \"\\e689\";\n}\n.ti-mouse:before {\n\tcontent: \"\\e68a\";\n}\n.ti-mouse-alt:before {\n\tcontent: \"\\e68b\";\n}\n.ti-money:before {\n\tcontent: \"\\e68c\";\n}\n.ti-microphone:before {\n\tcontent: \"\\e68d\";\n}\n.ti-menu:before {\n\tcontent: \"\\e68e\";\n}\n.ti-menu-alt:before {\n\tcontent: \"\\e68f\";\n}\n.ti-map:before {\n\tcontent: \"\\e690\";\n}\n.ti-map-alt:before {\n\tcontent: \"\\e691\";\n}\n.ti-loop:before {\n\tcontent: \"\\e692\";\n}\n.ti-location-pin:before {\n\tcontent: \"\\e693\";\n}\n.ti-list:before {\n\tcontent: \"\\e694\";\n}\n.ti-light-bulb:before {\n\tcontent: \"\\e695\";\n}\n.ti-Italic:before {\n\tcontent: \"\\e696\";\n}\n.ti-info:before {\n\tcontent: \"\\e697\";\n}\n.ti-infinite:before {\n\tcontent: \"\\e698\";\n}\n.ti-id-badge:before {\n\tcontent: \"\\e699\";\n}\n.ti-hummer:before {\n\tcontent: \"\\e69a\";\n}\n.ti-home:before {\n\tcontent: \"\\e69b\";\n}\n.ti-help:before {\n\tcontent: \"\\e69c\";\n}\n.ti-headphone:before {\n\tcontent: \"\\e69d\";\n}\n.ti-harddrives:before {\n\tcontent: \"\\e69e\";\n}\n.ti-harddrive:before {\n\tcontent: \"\\e69f\";\n}\n.ti-gift:before {\n\tcontent: \"\\e6a0\";\n}\n.ti-game:before {\n\tcontent: \"\\e6a1\";\n}\n.ti-filter:before {\n\tcontent: \"\\e6a2\";\n}\n.ti-files:before {\n\tcontent: \"\\e6a3\";\n}\n.ti-file:before {\n\tcontent: \"\\e6a4\";\n}\n.ti-eraser:before {\n\tcontent: \"\\e6a5\";\n}\n.ti-envelope:before {\n\tcontent: \"\\e6a6\";\n}\n.ti-download:before {\n\tcontent: \"\\e6a7\";\n}\n.ti-direction:before {\n\tcontent: \"\\e6a8\";\n}\n.ti-direction-alt:before {\n\tcontent: \"\\e6a9\";\n}\n.ti-dashboard:before {\n\tcontent: \"\\e6aa\";\n}\n.ti-control-stop:before {\n\tcontent: \"\\e6ab\";\n}\n.ti-control-shuffle:before {\n\tcontent: \"\\e6ac\";\n}\n.ti-control-play:before {\n\tcontent: \"\\e6ad\";\n}\n.ti-control-pause:before {\n\tcontent: \"\\e6ae\";\n}\n.ti-control-forward:before {\n\tcontent: \"\\e6af\";\n}\n.ti-control-backward:before {\n\tcontent: \"\\e6b0\";\n}\n.ti-cloud:before {\n\tcontent: \"\\e6b1\";\n}\n.ti-cloud-up:before {\n\tcontent: \"\\e6b2\";\n}\n.ti-cloud-down:before {\n\tcontent: \"\\e6b3\";\n}\n.ti-clipboard:before {\n\tcontent: \"\\e6b4\";\n}\n.ti-car:before {\n\tcontent: \"\\e6b5\";\n}\n.ti-calendar:before {\n\tcontent: \"\\e6b6\";\n}\n.ti-book:before {\n\tcontent: \"\\e6b7\";\n}\n.ti-bell:before {\n\tcontent: \"\\e6b8\";\n}\n.ti-basketball:before {\n\tcontent: \"\\e6b9\";\n}\n.ti-bar-chart:before {\n\tcontent: \"\\e6ba\";\n}\n.ti-bar-chart-alt:before {\n\tcontent: \"\\e6bb\";\n}\n.ti-back-right:before {\n\tcontent: \"\\e6bc\";\n}\n.ti-back-left:before {\n\tcontent: \"\\e6bd\";\n}\n.ti-arrows-corner:before {\n\tcontent: \"\\e6be\";\n}\n.ti-archive:before {\n\tcontent: \"\\e6bf\";\n}\n.ti-anchor:before {\n\tcontent: \"\\e6c0\";\n}\n.ti-align-right:before {\n\tcontent: \"\\e6c1\";\n}\n.ti-align-left:before {\n\tcontent: \"\\e6c2\";\n}\n.ti-align-justify:before {\n\tcontent: \"\\e6c3\";\n}\n.ti-align-center:before {\n\tcontent: \"\\e6c4\";\n}\n.ti-alert:before {\n\tcontent: \"\\e6c5\";\n}\n.ti-alarm-clock:before {\n\tcontent: \"\\e6c6\";\n}\n.ti-agenda:before {\n\tcontent: \"\\e6c7\";\n}\n.ti-write:before {\n\tcontent: \"\\e6c8\";\n}\n.ti-window:before {\n\tcontent: \"\\e6c9\";\n}\n.ti-widgetized:before {\n\tcontent: \"\\e6ca\";\n}\n.ti-widget:before {\n\tcontent: \"\\e6cb\";\n}\n.ti-widget-alt:before {\n\tcontent: \"\\e6cc\";\n}\n.ti-wallet:before {\n\tcontent: \"\\e6cd\";\n}\n.ti-video-clapper:before {\n\tcontent: \"\\e6ce\";\n}\n.ti-video-camera:before {\n\tcontent: \"\\e6cf\";\n}\n.ti-vector:before {\n\tcontent: \"\\e6d0\";\n}\n.ti-themify-logo:before {\n\tcontent: \"\\e6d1\";\n}\n.ti-themify-favicon:before {\n\tcontent: \"\\e6d2\";\n}\n.ti-themify-favicon-alt:before {\n\tcontent: \"\\e6d3\";\n}\n.ti-support:before {\n\tcontent: \"\\e6d4\";\n}\n.ti-stamp:before {\n\tcontent: \"\\e6d5\";\n}\n.ti-split-v-alt:before {\n\tcontent: \"\\e6d6\";\n}\n.ti-slice:before {\n\tcontent: \"\\e6d7\";\n}\n.ti-shortcode:before {\n\tcontent: \"\\e6d8\";\n}\n.ti-shift-right-alt:before {\n\tcontent: \"\\e6d9\";\n}\n.ti-shift-left-alt:before {\n\tcontent: \"\\e6da\";\n}\n.ti-ruler-alt-2:before {\n\tcontent: \"\\e6db\";\n}\n.ti-receipt:before {\n\tcontent: \"\\e6dc\";\n}\n.ti-pin2:before {\n\tcontent: \"\\e6dd\";\n}\n.ti-pin-alt:before {\n\tcontent: \"\\e6de\";\n}\n.ti-pencil-alt2:before {\n\tcontent: \"\\e6df\";\n}\n.ti-palette:before {\n\tcontent: \"\\e6e0\";\n}\n.ti-more:before {\n\tcontent: \"\\e6e1\";\n}\n.ti-more-alt:before {\n\tcontent: \"\\e6e2\";\n}\n.ti-microphone-alt:before {\n\tcontent: \"\\e6e3\";\n}\n.ti-magnet:before {\n\tcontent: \"\\e6e4\";\n}\n.ti-line-double:before {\n\tcontent: \"\\e6e5\";\n}\n.ti-line-dotted:before {\n\tcontent: \"\\e6e6\";\n}\n.ti-line-dashed:before {\n\tcontent: \"\\e6e7\";\n}\n.ti-layout-width-full:before {\n\tcontent: \"\\e6e8\";\n}\n.ti-layout-width-default:before {\n\tcontent: \"\\e6e9\";\n}\n.ti-layout-width-default-alt:before {\n\tcontent: \"\\e6ea\";\n}\n.ti-layout-tab:before {\n\tcontent: \"\\e6eb\";\n}\n.ti-layout-tab-window:before {\n\tcontent: \"\\e6ec\";\n}\n.ti-layout-tab-v:before {\n\tcontent: \"\\e6ed\";\n}\n.ti-layout-tab-min:before {\n\tcontent: \"\\e6ee\";\n}\n.ti-layout-slider:before {\n\tcontent: \"\\e6ef\";\n}\n.ti-layout-slider-alt:before {\n\tcontent: \"\\e6f0\";\n}\n.ti-layout-sidebar-right:before {\n\tcontent: \"\\e6f1\";\n}\n.ti-layout-sidebar-none:before {\n\tcontent: \"\\e6f2\";\n}\n.ti-layout-sidebar-left:before {\n\tcontent: \"\\e6f3\";\n}\n.ti-layout-placeholder:before {\n\tcontent: \"\\e6f4\";\n}\n.ti-layout-menu:before {\n\tcontent: \"\\e6f5\";\n}\n.ti-layout-menu-v:before {\n\tcontent: \"\\e6f6\";\n}\n.ti-layout-menu-separated:before {\n\tcontent: \"\\e6f7\";\n}\n.ti-layout-menu-full:before {\n\tcontent: \"\\e6f8\";\n}\n.ti-layout-media-right-alt:before {\n\tcontent: \"\\e6f9\";\n}\n.ti-layout-media-right:before {\n\tcontent: \"\\e6fa\";\n}\n.ti-layout-media-overlay:before {\n\tcontent: \"\\e6fb\";\n}\n.ti-layout-media-overlay-alt:before {\n\tcontent: \"\\e6fc\";\n}\n.ti-layout-media-overlay-alt-2:before {\n\tcontent: \"\\e6fd\";\n}\n.ti-layout-media-left-alt:before {\n\tcontent: \"\\e6fe\";\n}\n.ti-layout-media-left:before {\n\tcontent: \"\\e6ff\";\n}\n.ti-layout-media-center-alt:before {\n\tcontent: \"\\e700\";\n}\n.ti-layout-media-center:before {\n\tcontent: \"\\e701\";\n}\n.ti-layout-list-thumb:before {\n\tcontent: \"\\e702\";\n}\n.ti-layout-list-thumb-alt:before {\n\tcontent: \"\\e703\";\n}\n.ti-layout-list-post:before {\n\tcontent: \"\\e704\";\n}\n.ti-layout-list-large-image:before {\n\tcontent: \"\\e705\";\n}\n.ti-layout-line-solid:before {\n\tcontent: \"\\e706\";\n}\n.ti-layout-grid4:before {\n\tcontent: \"\\e707\";\n}\n.ti-layout-grid3:before {\n\tcontent: \"\\e708\";\n}\n.ti-layout-grid2:before {\n\tcontent: \"\\e709\";\n}\n.ti-layout-grid2-thumb:before {\n\tcontent: \"\\e70a\";\n}\n.ti-layout-cta-right:before {\n\tcontent: \"\\e70b\";\n}\n.ti-layout-cta-left:before {\n\tcontent: \"\\e70c\";\n}\n.ti-layout-cta-center:before {\n\tcontent: \"\\e70d\";\n}\n.ti-layout-cta-btn-right:before {\n\tcontent: \"\\e70e\";\n}\n.ti-layout-cta-btn-left:before {\n\tcontent: \"\\e70f\";\n}\n.ti-layout-column4:before {\n\tcontent: \"\\e710\";\n}\n.ti-layout-column3:before {\n\tcontent: \"\\e711\";\n}\n.ti-layout-column2:before {\n\tcontent: \"\\e712\";\n}\n.ti-layout-accordion-separated:before {\n\tcontent: \"\\e713\";\n}\n.ti-layout-accordion-merged:before {\n\tcontent: \"\\e714\";\n}\n.ti-layout-accordion-list:before {\n\tcontent: \"\\e715\";\n}\n.ti-ink-pen:before {\n\tcontent: \"\\e716\";\n}\n.ti-info-alt:before {\n\tcontent: \"\\e717\";\n}\n.ti-help-alt:before {\n\tcontent: \"\\e718\";\n}\n.ti-headphone-alt:before {\n\tcontent: \"\\e719\";\n}\n.ti-hand-point-up:before {\n\tcontent: \"\\e71a\";\n}\n.ti-hand-point-right:before {\n\tcontent: \"\\e71b\";\n}\n.ti-hand-point-left:before {\n\tcontent: \"\\e71c\";\n}\n.ti-hand-point-down:before {\n\tcontent: \"\\e71d\";\n}\n.ti-gallery:before {\n\tcontent: \"\\e71e\";\n}\n.ti-face-smile:before {\n\tcontent: \"\\e71f\";\n}\n.ti-face-sad:before {\n\tcontent: \"\\e720\";\n}\n.ti-credit-card:before {\n\tcontent: \"\\e721\";\n}\n.ti-control-skip-forward:before {\n\tcontent: \"\\e722\";\n}\n.ti-control-skip-backward:before {\n\tcontent: \"\\e723\";\n}\n.ti-control-record:before {\n\tcontent: \"\\e724\";\n}\n.ti-control-eject:before {\n\tcontent: \"\\e725\";\n}\n.ti-comments-smiley:before {\n\tcontent: \"\\e726\";\n}\n.ti-brush-alt:before {\n\tcontent: \"\\e727\";\n}\n.ti-youtube:before {\n\tcontent: \"\\e728\";\n}\n.ti-vimeo:before {\n\tcontent: \"\\e729\";\n}\n.ti-twitter:before {\n\tcontent: \"\\e72a\";\n}\n.ti-time:before {\n\tcontent: \"\\e72b\";\n}\n.ti-tumblr:before {\n\tcontent: \"\\e72c\";\n}\n.ti-skype:before {\n\tcontent: \"\\e72d\";\n}\n.ti-share:before {\n\tcontent: \"\\e72e\";\n}\n.ti-share-alt:before {\n\tcontent: \"\\e72f\";\n}\n.ti-rocket:before {\n\tcontent: \"\\e730\";\n}\n.ti-pinterest:before {\n\tcontent: \"\\e731\";\n}\n.ti-new-window:before {\n\tcontent: \"\\e732\";\n}\n.ti-microsoft:before {\n\tcontent: \"\\e733\";\n}\n.ti-list-ol:before {\n\tcontent: \"\\e734\";\n}\n.ti-linkedin:before {\n\tcontent: \"\\e735\";\n}\n.ti-layout-sidebar-2:before {\n\tcontent: \"\\e736\";\n}\n.ti-layout-grid4-alt:before {\n\tcontent: \"\\e737\";\n}\n.ti-layout-grid3-alt:before {\n\tcontent: \"\\e738\";\n}\n.ti-layout-grid2-alt:before {\n\tcontent: \"\\e739\";\n}\n.ti-layout-column4-alt:before {\n\tcontent: \"\\e73a\";\n}\n.ti-layout-column3-alt:before {\n\tcontent: \"\\e73b\";\n}\n.ti-layout-column2-alt:before {\n\tcontent: \"\\e73c\";\n}\n.ti-instagram:before {\n\tcontent: \"\\e73d\";\n}\n.ti-google:before {\n\tcontent: \"\\e73e\";\n}\n.ti-github:before {\n\tcontent: \"\\e73f\";\n}\n.ti-flickr:before {\n\tcontent: \"\\e740\";\n}\n.ti-facebook:before {\n\tcontent: \"\\e741\";\n}\n.ti-dropbox:before {\n\tcontent: \"\\e742\";\n}\n.ti-dribbble:before {\n\tcontent: \"\\e743\";\n}\n.ti-apple:before {\n\tcontent: \"\\e744\";\n}\n.ti-android:before {\n\tcontent: \"\\e745\";\n}\n.ti-save:before {\n\tcontent: \"\\e746\";\n}\n.ti-save-alt:before {\n\tcontent: \"\\e747\";\n}\n.ti-yahoo:before {\n\tcontent: \"\\e748\";\n}\n.ti-wordpress:before {\n\tcontent: \"\\e749\";\n}\n.ti-vimeo-alt:before {\n\tcontent: \"\\e74a\";\n}\n.ti-twitter-alt:before {\n\tcontent: \"\\e74b\";\n}\n.ti-tumblr-alt:before {\n\tcontent: \"\\e74c\";\n}\n.ti-trello:before {\n\tcontent: \"\\e74d\";\n}\n.ti-stack-overflow:before {\n\tcontent: \"\\e74e\";\n}\n.ti-soundcloud:before {\n\tcontent: \"\\e74f\";\n}\n.ti-sharethis:before {\n\tcontent: \"\\e750\";\n}\n.ti-sharethis-alt:before {\n\tcontent: \"\\e751\";\n}\n.ti-reddit:before {\n\tcontent: \"\\e752\";\n}\n.ti-pinterest-alt:before {\n\tcontent: \"\\e753\";\n}\n.ti-microsoft-alt:before {\n\tcontent: \"\\e754\";\n}\n.ti-linux:before {\n\tcontent: \"\\e755\";\n}\n.ti-jsfiddle:before {\n\tcontent: \"\\e756\";\n}\n.ti-joomla:before {\n\tcontent: \"\\e757\";\n}\n.ti-html5:before {\n\tcontent: \"\\e758\";\n}\n.ti-flickr-alt:before {\n\tcontent: \"\\e759\";\n}\n.ti-email:before {\n\tcontent: \"\\e75a\";\n}\n.ti-drupal:before {\n\tcontent: \"\\e75b\";\n}\n.ti-dropbox-alt:before {\n\tcontent: \"\\e75c\";\n}\n.ti-css3:before {\n\tcontent: \"\\e75d\";\n}\n.ti-rss:before {\n\tcontent: \"\\e75e\";\n}\n.ti-rss-alt:before {\n\tcontent: \"\\e75f\";\n}\n";
styleInject(css$4);

const sciris = {
  graphs,
  rpc: rpcs,
  status,
  user,
  tasks,
  utils,
  ScirisVue,
  EventBus
};

exports.default = sciris;
