/*!
 * sciris-js v0.1.13
 * (c) 2019-present Optima Consortium <info@ocds.co>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var axios = _interopDefault(require('axios'));
var saveAs = _interopDefault(require('file-saver'));
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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var mpld3 = createCommonjsModule(function (module) {
!function (t) {
  function s(t) {
    var s = {};

    for (var i in t) s[i] = t[i];

    return s;
  }

  function i(t, s) {
    t = "undefined" != typeof t ? t : 10, s = "undefined" != typeof s ? s : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = s.charAt(Math.round(Math.random() * (s.length - 11))), e = 1; t > e; e++) i += s.charAt(Math.round(Math.random() * (s.length - 1)));

    return i;
  }

  function e(s, i) {
    var e = t.interpolate([s[0].valueOf(), s[1].valueOf()], [i[0].valueOf(), i[1].valueOf()]);
    return function (t) {
      var s = e(t);
      return [new Date(s[0]), new Date(s[1])];
    };
  }

  function o(t) {
    return "undefined" == typeof t;
  }

  function r(t) {
    return null == t || o(t);
  }

  function n(t, s) {
    return t.length > 0 ? t[s % t.length] : null;
  }

  function a(t) {
    function s(t, s) {
      var n = function (t) {
        return "function" == typeof t ? t : function () {
          return t;
        };
      },
          a = n(i),
          p = n(e),
          h = [],
          l = [],
          c = 0,
          u = -1,
          d = 0,
          f = !1;

      if (!s) {
        s = ["M"];

        for (var y = 1; y < t.length; y++) s.push("L");
      }

      for (; ++u < s.length;) {
        for (d = c + r[s[u]], h = []; d > c;) o.call(this, t[c], c) ? (h.push(a.call(this, t[c], c), p.call(this, t[c], c)), c++) : (h = null, c = d);

        h ? f && h.length > 0 ? (l.push("M", h[0], h[1]), f = !1) : (l.push(s[u]), l = l.concat(h)) : f = !0;
      }

      return c != t.length && console.warn("Warning: not all vertices used in Path"), l.join(" ");
    }

    var i = function (t, s) {
      return t[0];
    },
        e = function (t, s) {
      return t[1];
    },
        o = function (t, s) {
      return !0;
    },
        r = {
      M: 1,
      m: 1,
      L: 1,
      l: 1,
      Q: 2,
      q: 2,
      T: 1,
      t: 1,
      S: 2,
      s: 2,
      C: 3,
      c: 3,
      Z: 0,
      z: 0
    };

    return s.x = function (t) {
      return arguments.length ? (i = t, s) : i;
    }, s.y = function (t) {
      return arguments.length ? (e = t, s) : e;
    }, s.defined = function (t) {
      return arguments.length ? (o = t, s) : o;
    }, s.call = s, s;
  }

  function p(t) {
    function s(t) {
      return i.forEach(function (s) {
        t = s(t);
      }), t;
    }

    var i = Array.prototype.slice.call(arguments, 0),
        e = i.length;
    return s.domain = function (t) {
      return arguments.length ? (i[0].domain(t), s) : i[0].domain();
    }, s.range = function (t) {
      return arguments.length ? (i[e - 1].range(t), s) : i[e - 1].range();
    }, s.step = function (t) {
      return i[t];
    }, s;
  }

  function h(t, s) {
    if (M.call(this, t, s), this.cssclass = "mpld3-" + this.props.xy + "grid", "x" == this.props.xy) this.transform = "translate(0," + this.ax.height + ")", this.position = "bottom", this.scale = this.ax.xdom, this.tickSize = -this.ax.height;else {
      if ("y" != this.props.xy) throw "unrecognized grid xy specifier: should be 'x' or 'y'";
      this.transform = "translate(0,0)", this.position = "left", this.scale = this.ax.ydom, this.tickSize = -this.ax.width;
    }
  }

  function l(t, s) {
    M.call(this, t, s);
    var i = {
      bottom: [0, this.ax.height],
      top: [0, 0],
      left: [0, 0],
      right: [this.ax.width, 0]
    },
        e = {
      bottom: "x",
      top: "x",
      left: "y",
      right: "y"
    };
    this.transform = "translate(" + i[this.props.position] + ")", this.props.xy = e[this.props.position], this.cssclass = "mpld3-" + this.props.xy + "axis", this.scale = this.ax[this.props.xy + "dom"], this.tickNr = null, this.tickFormat = null;
  }

  function c(t, s) {
    if (this.trans = t, "undefined" == typeof s) {
      if (this.ax = null, this.fig = null, "display" !== this.trans) throw "ax must be defined if transform != 'display'";
    } else this.ax = s, this.fig = s.fig;

    if (this.zoomable = "data" === this.trans, this.x = this["x_" + this.trans], this.y = this["y_" + this.trans], "undefined" == typeof this.x || "undefined" == typeof this.y) throw "unrecognized coordinate code: " + this.trans;
  }

  function u(t, s) {
    M.call(this, t, s), this.data = t.fig.get_data(this.props.data), this.pathcodes = this.props.pathcodes, this.pathcoords = new c(this.props.coordinates, this.ax), this.offsetcoords = new c(this.props.offsetcoordinates, this.ax), this.datafunc = a();
  }

  function d(t, s) {
    M.call(this, t, s), (null == this.props.facecolors || 0 == this.props.facecolors.length) && (this.props.facecolors = ["none"]), (null == this.props.edgecolors || 0 == this.props.edgecolors.length) && (this.props.edgecolors = ["none"]);
    var i = this.ax.fig.get_data(this.props.offsets);
    (null === i || 0 === i.length) && (i = [null]);
    var e = Math.max(this.props.paths.length, i.length);
    if (i.length === e) this.offsets = i;else {
      this.offsets = [];

      for (var o = 0; e > o; o++) this.offsets.push(n(i, o));
    }
    this.pathcoords = new c(this.props.pathcoordinates, this.ax), this.offsetcoords = new c(this.props.offsetcoordinates, this.ax);
  }

  function f(s, i) {
    M.call(this, s, i);
    var e = this.props;

    switch (e.facecolor = "none", e.edgecolor = e.color, delete e.color, e.edgewidth = e.linewidth, delete e.linewidth, drawstyle = e.drawstyle, delete e.drawstyle, this.defaultProps = u.prototype.defaultProps, u.call(this, s, e), drawstyle) {
      case "steps":
      case "steps-pre":
        this.datafunc = t.line().curve(t.curveStepBefore);
        break;

      case "steps-post":
        this.datafunc = t.line().curve(t.curveStepAfter);
        break;

      case "steps-mid":
        this.datafunc = t.line().curve(t.curveStep);
        break;

      default:
        this.datafunc = t.line().curve(t.curveLinear);
    }
  }

  function y(s, i) {
    M.call(this, s, i), null !== this.props.markerpath ? this.marker = 0 == this.props.markerpath[0].length ? null : F.path().call(this.props.markerpath[0], this.props.markerpath[1]) : this.marker = null === this.props.markername ? null : t.svg.symbol(this.props.markername).size(Math.pow(this.props.markersize, 2))();
    var e = {
      paths: [this.props.markerpath],
      offsets: s.fig.get_data(this.props.data),
      xindex: this.props.xindex,
      yindex: this.props.yindex,
      offsetcoordinates: this.props.coordinates,
      edgecolors: [this.props.edgecolor],
      edgewidths: [this.props.edgewidth],
      facecolors: [this.props.facecolor],
      alphas: [this.props.alpha],
      zorder: this.props.zorder,
      id: this.props.id
    };
    this.requiredProps = d.prototype.requiredProps, this.defaultProps = d.prototype.defaultProps, d.call(this, s, e);
  }

  function g(t, s) {
    M.call(this, t, s), this.coords = new c(this.props.coordinates, this.ax);
  }

  function m(t, s) {
    M.call(this, t, s), this.text = this.props.text, this.position = this.props.position, this.coords = new c(this.props.coordinates, this.ax);
  }

  function x(s, i) {
    function e(t) {
      return new Date(t[0], t[1], t[2], t[3], t[4], t[5]);
    }

    function o(t, s) {
      return "date" !== t ? s : [e(s[0]), e(s[1])];
    }

    function r(s, i, e) {
      var o = "date" === s ? t.scaleTime() : "log" === s ? t.scaleLog() : t.scaleLinear();
      return o.domain(i).range(e);
    }

    M.call(this, s, i), this.axnum = this.fig.axes.length, this.axid = this.fig.figid + "_ax" + (this.axnum + 1), this.clipid = this.axid + "_clip", this.props.xdomain = this.props.xdomain || this.props.xlim, this.props.ydomain = this.props.ydomain || this.props.ylim, this.sharex = [], this.sharey = [], this.elements = [], this.axisList = [];
    var n = this.props.bbox;
    this.position = [n[0] * this.fig.width, (1 - n[1] - n[3]) * this.fig.height], this.width = n[2] * this.fig.width, this.height = n[3] * this.fig.height, this.isZoomEnabled = null, this.zoom = null, this.lastTransform = t.zoomIdentity, this.isBoxzoomEnabled = null, this.isLinkedBrushEnabled = null, this.isCurrentLinkedBrushTarget = !1, this.brushG = null, this.props.xdomain = o(this.props.xscale, this.props.xdomain), this.props.ydomain = o(this.props.yscale, this.props.ydomain), this.x = this.xdom = r(this.props.xscale, this.props.xdomain, [0, this.width]), this.y = this.ydom = r(this.props.yscale, this.props.ydomain, [this.height, 0]), "date" === this.props.xscale && (this.x = F.multiscale(t.scaleLinear().domain(this.props.xlim).range(this.props.xdomain.map(Number)), this.xdom)), "date" === this.props.yscale && (this.y = F.multiscale(t.scaleLinear().domain(this.props.ylim).range(this.props.ydomain.map(Number)), this.ydom));

    for (var a = this.props.axes, p = 0; p < a.length; p++) {
      var h = new F.Axis(this, a[p]);
      this.axisList.push(h), this.elements.push(h), (this.props.gridOn || h.props.grid.gridOn) && this.elements.push(h.getGrid());
    }

    for (var l = this.props.paths, p = 0; p < l.length; p++) this.elements.push(new F.Path(this, l[p]));

    for (var c = this.props.lines, p = 0; p < c.length; p++) this.elements.push(new F.Line(this, c[p]));

    for (var u = this.props.markers, p = 0; p < u.length; p++) this.elements.push(new F.Markers(this, u[p]));

    for (var d = this.props.texts, p = 0; p < d.length; p++) this.elements.push(new F.Text(this, d[p]));

    for (var f = this.props.collections, p = 0; p < f.length; p++) this.elements.push(new F.PathCollection(this, f[p]));

    for (var y = this.props.images, p = 0; p < y.length; p++) this.elements.push(new F.Image(this, y[p]));

    this.elements.sort(function (t, s) {
      return t.props.zorder - s.props.zorder;
    });
  }

  function b(t, s) {
    M.call(this, t, s), this.buttons = [], this.props.buttons.forEach(this.addButton.bind(this));
  }

  function v(t, s) {
    M.call(this, t), this.toolbar = t, this.fig = this.toolbar.fig, this.cssclass = "mpld3-" + s + "button", this.active = !1;
  }

  function A(t, s) {
    M.call(this, t, s);
  }

  function k(t, s) {
    A.call(this, t, s);
    var i = F.ButtonFactory({
      buttonID: "reset",
      sticky: !1,
      onActivate: function () {
        this.toolbar.fig.reset();
      },
      icon: function () {
        return F.icons.reset;
      }
    });
    this.fig.buttons.push(i);
  }

  function w(t, s) {
    A.call(this, t, s), null === this.props.enabled && (this.props.enabled = !this.props.button);
    var i = this.props.enabled;

    if (this.props.button) {
      var e = F.ButtonFactory({
        buttonID: "zoom",
        sticky: !0,
        actions: ["scroll", "drag"],
        onActivate: this.activate.bind(this),
        onDeactivate: this.deactivate.bind(this),
        onDraw: function () {
          this.setState(i);
        },
        icon: function () {
          return F.icons.move;
        }
      });
      this.fig.buttons.push(e);
    }
  }

  function B(t, s) {
    A.call(this, t, s), null === this.props.enabled && (this.props.enabled = !this.props.button);
    var i = this.props.enabled;

    if (this.props.button) {
      var e = F.ButtonFactory({
        buttonID: "boxzoom",
        sticky: !0,
        actions: ["drag"],
        onActivate: this.activate.bind(this),
        onDeactivate: this.deactivate.bind(this),
        onDraw: function () {
          this.setState(i);
        },
        icon: function () {
          return F.icons.zoom;
        }
      });
      this.fig.buttons.push(e);
    }

    this.extentClass = "boxzoombrush";
  }

  function z(t, s) {
    A.call(this, t, s);
  }

  function E(t, s) {
    F.Plugin.call(this, t, s), null === this.props.enabled && (this.props.enabled = !this.props.button);
    var i = this.props.enabled;

    if (this.props.button) {
      var e = F.ButtonFactory({
        buttonID: "linkedbrush",
        sticky: !0,
        actions: ["drag"],
        onActivate: this.activate.bind(this),
        onDeactivate: this.deactivate.bind(this),
        onDraw: function () {
          this.setState(i);
        },
        icon: function () {
          return F.icons.brush;
        }
      });
      this.fig.buttons.push(e);
    }

    this.pathCollectionsByAxes = [], this.objectsByAxes = [], this.allObjects = [], this.extentClass = "linkedbrush", this.dataKey = "offsets", this.objectClass = null;
  }

  function P(t, s) {
    F.Plugin.call(this, t, s);
  }

  function O(s, i) {
    M.call(this, null, i), this.figid = s, this.width = this.props.width, this.height = this.props.height, this.data = this.props.data, this.buttons = [], this.root = t.select("#" + s).append("div").style("position", "relative"), this.axes = [];

    for (var e = 0; e < this.props.axes.length; e++) this.axes.push(new x(this, this.props.axes[e]));

    this.plugins = [], this.pluginsByType = {}, this.props.plugins.forEach(function (t) {
      this.addPlugin(t);
    }.bind(this)), this.toolbar = new F.Toolbar(this, {
      buttons: this.buttons
    });
  }

  function M(t, s) {
    this.parent = r(t) ? null : t, this.props = r(s) ? {} : this.processProps(s), this.fig = t instanceof O ? t : t && "fig" in t ? t.fig : null, this.ax = t instanceof x ? t : t && "ax" in t ? t.ax : null;
  }

  var F = {
    _mpld3IsLoaded: !0,
    figures: [],
    plugin_map: {}
  };
  F.version = "0.4.1", F.register_plugin = function (t, s) {
    F.plugin_map[t] = s;
  }, F.draw_figure = function (t, s, i) {
    var e = document.getElementById(t);
    if (null === e) throw t + " is not a valid id";
    var o = new F.Figure(t, s);
    return i && i(o, e), F.figures.push(o), o.draw(), o;
  }, F.cloneObj = s, F.boundsToTransform = function (t, s) {
    var i = t.width,
        e = t.height,
        o = s[1][0] - s[0][0],
        r = s[1][1] - s[0][1],
        n = (s[0][0] + s[1][0]) / 2,
        a = (s[0][1] + s[1][1]) / 2,
        p = Math.max(1, Math.min(8, .9 / Math.max(o / i, r / e))),
        h = [i / 2 - p * n, e / 2 - p * a];
    return {
      translate: h,
      scale: p
    };
  }, F.getTransformation = function (t) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "g");
    s.setAttributeNS(null, "transform", t);
    var i,
        e,
        o,
        r = s.transform.baseVal.consolidate().matrix,
        n = r.a,
        a = r.b,
        p = r.c,
        h = r.d,
        l = r.e,
        c = r.f;
    (i = Math.sqrt(n * n + a * a)) && (n /= i, a /= i), (o = n * p + a * h) && (p -= n * o, h -= a * o), (e = Math.sqrt(p * p + h * h)) && (p /= e, h /= e, o /= e), a * p > n * h && (n = -n, a = -a, o = -o, i = -i);
    var u = {
      translateX: l,
      translateY: c,
      rotate: 180 * Math.atan2(a, n) / Math.PI,
      skewX: 180 * Math.atan(o) / Math.PI,
      scaleX: i,
      scaleY: e
    },
        d = "translate(" + u.translateX + "," + u.translateY + ")rotate(" + u.rotate + ")skewX(" + u.skewX + ")scale(" + u.scaleX + "," + u.scaleY + ")";
    return d;
  }, F.merge_objects = function (t) {
    for (var s, i = {}, e = 0; e < arguments.length; e++) {
      s = arguments[e];

      for (var o in s) i[o] = s[o];
    }

    return i;
  }, F.generate_id = function (t, s) {
    return console.warn("mpld3.generate_id is deprecated. Use mpld3.generateId instead."), i(t, s);
  }, F.generateId = i, F.get_element = function (t, s) {
    var i, e, o;
    i = "undefined" == typeof s ? F.figures : "undefined" == typeof s.length ? [s] : s;

    for (var r = 0; r < i.length; r++) {
      if (s = i[r], s.props.id === t) return s;

      for (var n = 0; n < s.axes.length; n++) {
        if (e = s.axes[n], e.props.id === t) return e;

        for (var a = 0; a < e.elements.length; a++) if (o = e.elements[a], o.props.id === t) return o;
      }
    }

    return null;
  }, F.insert_css = function (t, s) {
    var i = document.head || document.getElementsByTagName("head")[0],
        e = document.createElement("style"),
        o = t + " {";

    for (var r in s) o += r + ":" + s[r] + "; ";

    o += "}", e.type = "text/css", e.styleSheet ? e.styleSheet.cssText = o : e.appendChild(document.createTextNode(o)), i.appendChild(e);
  }, F.process_props = function (t, s, i, e) {
    function o(t) {
      M.call(this, null, t);
    }

    console.warn("mpld3.process_props is deprecated. Plot elements should derive from mpld3.PlotElement"), o.prototype = Object.create(M.prototype), o.prototype.constructor = o, o.prototype.requiredProps = e, o.prototype.defaultProps = i;
    var r = new o(s);
    return r.props;
  }, F.interpolateDates = e, F.path = function () {
    return a();
  }, F.multiscale = p, F.icons = {
    reset: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI\nWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gIcACMoD/OzIwAAAJhJREFUOMtjYKAx4KDUgNsMDAx7\nyNV8i4GB4T8U76VEM8mGYNNMtCH4NBM0hBjNMIwSsMzQ0MamcDkDA8NmQi6xggpUoikwQbIkHk2u\nE0rLI7vCBknBSyxeRDZAE6qHgQkq+ZeBgYERSfFPAoHNDNUDN4BswIRmKgxwEasP2dlsDAwMYlA/\n/mVgYHiBpkkGKscIDaPfVMmuAGnOTaGsXF0MAAAAAElFTkSuQmCC\n",
    move: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI\nWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gIcACQMfLHBNQAAANZJREFUOMud07FKA0EQBuAviaKB\nlFr7COJrpAyYRlKn8hECEkFEn8ROCCm0sBMRYgh5EgVFtEhsRjiO27vkBoZd/vn5d3b+XcrjFI9q\nxgXWkc8pUjOB93GMd3zgB9d1unjDSxmhWSHQqOJki+MtOuv/b3ZifUqctIrMxwhHuG1gim4Ma5kR\nWuEkXFgU4B0MW1Ho4TeyjX3s4TDq3zn8ALvZ7q5wX9DqLOHCDA95cFBAnOO1AL/ZdNopgY3fQcqF\nyriMe37hM9w521ZkkvlMo7o/8g7nZYQ/QDctp1nTCf0AAAAASUVORK5CYII=\n",
    zoom: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI\nWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gMPDiIRPL/2oQAAANBJREFUOMvF0b9KgzEcheHHVnCT\nKoI4uXbtLXgB3oJDJxevw1VwkoJ/NjepQ2/BrZRCx0ILFURQKV2kyOeSQpAmn7WDB0Lg955zEhLy\n2scdXlBggits+4WOQqjAJ3qYR7NGLrwXGU9+sGbEtlIF18FwmuBngZ+nCt6CIacC3Rx8LSl4xzgF\nn0tusBn4UyVhuA/7ZYIv5g+pE3ail25hN/qdmzCfpsJVjKKCZesDBwtzrAqGOMQj6vhCDRsY4ALH\nmOVObltR/xeG/jph6OD2r+Fv5lZBWEhMx58AAAAASUVORK5CYII=\n",
    brush: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI\nWXMAAEQkAABEJAFAZ8RUAAAAB3RJTUUH3gMCEiQKB9YaAgAAAWtJREFUOMuN0r1qVVEQhuFn700k\nnfEvBq0iNiIiOKXgH4KCaBeIhWARK/EibLwFCwVLjyAWaQzRGG9grC3URkHUBKKgRuWohWvL5pjj\nyTSLxcz7rZlZHyMiItqzFxGTEVF18/UoODNFxDIO4x12dkXqTcBPsCUzD+AK3ndFqhHwEsYz82gn\nN4dbmMRK9R/4KY7jAvbiWmYeHBT5Z4QCP8J1rGAeN3GvU3Mbl/Gq3qCDcxjLzOV+v78fq/iFIxFx\nPyJ2lNJpfBy2g59YzMyzEbEVLzGBJjOriLiBq5gaJrCIU3hcRCbwAtuwjm/Yg/V6I9NgDA1OR8RC\nZq6Vcd7iUwtn5h8fdMBdETGPE+Xe4ExELDRNs4bX2NfCUHe+7UExyfkCP8MhzOA7PuAkvrbwXyNF\nxF3MDqxiqlhXC7SPdaOKiN14g0u4g3H0MvOiTUSNY3iemb0ywmfMdfYyUmAJ2yPiBx6Wr/oy2Oqw\n+A1SupBzAOuE/AAAAABJRU5ErkJggg==\n"
  }, F.Grid = h, h.prototype = Object.create(M.prototype), h.prototype.constructor = h, h.prototype.requiredProps = ["xy"], h.prototype.defaultProps = {
    color: "gray",
    dasharray: "2,2",
    alpha: "0.5",
    nticks: 10,
    gridOn: !0,
    tickvalues: null,
    zorder: 0
  }, h.prototype.draw = function () {
    var s = {
      left: "axisLeft",
      right: "axisRight",
      top: "axisTop",
      bottom: "axisBottom"
    }[this.position];
    this.grid = t[s](this.scale).ticks(this.props.nticks).tickValues(this.props.tickvalues).tickSize(this.tickSize, 0, 0).tickFormat(""), this.elem = this.ax.axes.append("g").attr("class", this.cssclass).attr("transform", this.transform).call(this.grid), F.insert_css("div#" + this.ax.fig.figid + " ." + this.cssclass + " .tick", {
      stroke: this.props.color,
      "stroke-dasharray": this.props.dasharray,
      "stroke-opacity": this.props.alpha
    }), F.insert_css("div#" + this.ax.fig.figid + " ." + this.cssclass + " path", {
      "stroke-width": 0
    }), F.insert_css("div#" + this.ax.fig.figid + " ." + this.cssclass + " .domain", {
      "pointer-events": "none"
    });
  }, h.prototype.zoomed = function (t) {
    t ? "x" == this.props.xy ? this.elem.call(this.grid.scale(t.rescaleX(this.scale))) : this.elem.call(this.grid.scale(t.rescaleY(this.scale))) : this.elem.call(this.grid);
  }, F.Axis = l, l.prototype = Object.create(M.prototype), l.prototype.constructor = l, l.prototype.requiredProps = ["position"], l.prototype.defaultProps = {
    nticks: 10,
    tickvalues: null,
    tickformat: null,
    fontsize: "11px",
    fontcolor: "black",
    axiscolor: "black",
    scale: "linear",
    grid: {},
    zorder: 0,
    visible: !0
  }, l.prototype.getGrid = function () {
    var t = {
      nticks: this.props.nticks,
      zorder: this.props.zorder,
      tickvalues: this.props.tickvalues,
      xy: this.props.xy
    };
    if (this.props.grid) for (var s in this.props.grid) t[s] = this.props.grid[s];
    return new h(this.ax, t);
  }, l.prototype.draw = function () {
    function s(s, i, e) {
      e = e || 1.2, s.each(function () {
        for (var s, o = t.select(this), r = o.node().getBBox(), n = r.height, a = o.text().split(/\s+/).reverse(), p = [], h = 0, l = o.attr("y"), c = n, u = o.text(null).append("tspan").attr("x", 0).attr("y", l).attr("dy", c); s = a.pop();) p.push(s), u.text(p.join(" ")), u.node().getComputedTextLength() > i && (p.pop(), u.text(p.join(" ")), p = [s], u = o.append("tspan").attr("x", 0).attr("y", l).attr("dy", ++h * (n * e) + c).text(s));
      });
    }

    var i = 80,
        e = "x" === this.props.xy ? this.parent.props.xscale : this.parent.props.yscale;

    if ("date" === e && this.props.tickvalues) {
      var o = "x" === this.props.xy ? this.parent.x.domain() : this.parent.y.domain(),
          r = "x" === this.props.xy ? this.parent.xdom.domain() : this.parent.ydom.domain(),
          n = t.scaleLinear().domain(o).range(r);
      this.props.tickvalues = this.props.tickvalues.map(function (t) {
        return new Date(n(t));
      });
    }

    var a = {
      left: "axisLeft",
      right: "axisRight",
      top: "axisTop",
      bottom: "axisBottom"
    }[this.props.position];
    this.axis = t[a](this.scale), this.props.tickformat && this.props.tickvalues ? this.axis = this.axis.tickValues(this.props.tickvalues).tickFormat(function (t, s) {
      return this.props.tickformat[s];
    }.bind(this)) : (this.tickNr && (this.axis = this.axis.ticks(this.tickNr)), this.tickFormat && (this.axis = this.axis.tickFormat(this.tickFormat))), this.filter_ticks(this.axis.tickValues, this.axis.scale().domain()), this.elem = this.ax.baseaxes.append("g").attr("transform", this.transform).attr("class", this.cssclass).call(this.axis), "x" == this.props.xy && this.elem.selectAll("text").call(s, i), F.insert_css("div#" + this.ax.fig.figid + " ." + this.cssclass + " line,  ." + this.cssclass + " path", {
      "shape-rendering": "crispEdges",
      stroke: this.props.axiscolor,
      fill: "none"
    }), F.insert_css("div#" + this.ax.fig.figid + " ." + this.cssclass + " text", {
      "font-family": "sans-serif",
      "font-size": this.props.fontsize + "px",
      fill: this.props.fontcolor,
      stroke: "none"
    });
  }, l.prototype.zoomed = function (t) {
    t ? "x" == this.props.xy ? this.elem.call(this.axis.scale(t.rescaleX(this.scale))) : this.elem.call(this.axis.scale(t.rescaleY(this.scale))) : this.elem.call(this.axis);
  }, l.prototype.setTicks = function (t, s) {
    this.tickNr = t, this.tickFormat = s;
  }, l.prototype.filter_ticks = function (t, s) {
    null != this.props.tickvalues && t(this.props.tickvalues.filter(function (t) {
      return t >= s[0] && t <= s[1];
    }));
  }, F.Coordinates = c, c.prototype.xy = function (t, s, i) {
    return s = "undefined" == typeof s ? 0 : s, i = "undefined" == typeof i ? 1 : i, [this.x(t[s]), this.y(t[i])];
  }, c.prototype.x_data = function (t) {
    return this.ax.x(t);
  }, c.prototype.y_data = function (t) {
    return this.ax.y(t);
  }, c.prototype.x_display = function (t) {
    return t;
  }, c.prototype.y_display = function (t) {
    return t;
  }, c.prototype.x_axes = function (t) {
    return t * this.ax.width;
  }, c.prototype.y_axes = function (t) {
    return this.ax.height * (1 - t);
  }, c.prototype.x_figure = function (t) {
    return t * this.fig.width - this.ax.position[0];
  }, c.prototype.y_figure = function (t) {
    return (1 - t) * this.fig.height - this.ax.position[1];
  }, F.Path = u, u.prototype = Object.create(M.prototype), u.prototype.constructor = u, u.prototype.requiredProps = ["data"], u.prototype.defaultProps = {
    xindex: 0,
    yindex: 1,
    coordinates: "data",
    facecolor: "green",
    edgecolor: "black",
    edgewidth: 1,
    dasharray: "none",
    pathcodes: null,
    offset: null,
    offsetcoordinates: "data",
    alpha: 1,
    zorder: 1
  }, u.prototype.finiteFilter = function (t, s) {
    return isFinite(this.pathcoords.x(t[this.props.xindex])) && isFinite(this.pathcoords.y(t[this.props.yindex]));
  }, u.prototype.draw = function () {
    if (this.datafunc.defined(this.finiteFilter.bind(this)).x(function (t) {
      return this.pathcoords.x(t[this.props.xindex]);
    }.bind(this)).y(function (t) {
      return this.pathcoords.y(t[this.props.yindex]);
    }.bind(this)), this.pathcoords.zoomable ? this.path = this.ax.paths.append("svg:path") : this.path = this.ax.staticPaths.append("svg:path"), this.path = this.path.attr("d", this.datafunc(this.data, this.pathcodes)).attr("class", "mpld3-path").style("stroke", this.props.edgecolor).style("stroke-width", this.props.edgewidth).style("stroke-dasharray", this.props.dasharray).style("stroke-opacity", this.props.alpha).style("fill", this.props.facecolor).style("fill-opacity", this.props.alpha).attr("vector-effect", "non-scaling-stroke"), null !== this.props.offset) {
      var t = this.offsetcoords.xy(this.props.offset);
      this.path.attr("transform", "translate(" + t + ")");
    }
  }, u.prototype.elements = function (t) {
    return this.path;
  }, F.PathCollection = d, d.prototype = Object.create(M.prototype), d.prototype.constructor = d, d.prototype.requiredProps = ["paths", "offsets"], d.prototype.defaultProps = {
    xindex: 0,
    yindex: 1,
    pathtransforms: [],
    pathcoordinates: "display",
    offsetcoordinates: "data",
    offsetorder: "before",
    edgecolors: ["#000000"],
    edgewidths: [1],
    facecolors: ["#0000FF"],
    alphas: [1],
    zorder: 2
  }, d.prototype.transformFunc = function (t, s) {
    var i = this.props.pathtransforms,
        e = 0 == i.length ? "" : F.getTransformation("matrix(" + n(i, s) + ")").toString(),
        o = null === t || "undefined" == typeof t ? "translate(0, 0)" : "translate(" + this.offsetcoords.xy(t, this.props.xindex, this.props.yindex) + ")";
    return "after" === this.props.offsetorder ? e + o : o + e;
  }, d.prototype.pathFunc = function (t, s) {
    return a().x(function (t) {
      return this.pathcoords.x(t[0]);
    }.bind(this)).y(function (t) {
      return this.pathcoords.y(t[1]);
    }.bind(this)).apply(this, n(this.props.paths, s));
  }, d.prototype.styleFunc = function (t, s) {
    var i = {
      stroke: n(this.props.edgecolors, s),
      "stroke-width": n(this.props.edgewidths, s),
      "stroke-opacity": n(this.props.alphas, s),
      fill: n(this.props.facecolors, s),
      "fill-opacity": n(this.props.alphas, s)
    },
        e = "";

    for (var o in i) e += o + ":" + i[o] + ";";

    return e;
  }, d.prototype.allFinite = function (t) {
    return t instanceof Array ? t.length == t.filter(isFinite).length : !0;
  }, d.prototype.draw = function () {
    this.offsetcoords.zoomable || this.pathcoords.zoomable ? this.group = this.ax.paths.append("svg:g") : this.group = this.ax.staticPaths.append("svg:g"), this.pathsobj = this.group.selectAll("paths").data(this.offsets.filter(this.allFinite)).enter().append("svg:path").attr("d", this.pathFunc.bind(this)).attr("class", "mpld3-path").attr("transform", this.transformFunc.bind(this)).attr("style", this.styleFunc.bind(this)).attr("vector-effect", "non-scaling-stroke");
  }, d.prototype.elements = function (t) {
    return this.group.selectAll("path");
  }, F.Line = f, f.prototype = Object.create(u.prototype), f.prototype.constructor = f, f.prototype.requiredProps = ["data"], f.prototype.defaultProps = {
    xindex: 0,
    yindex: 1,
    coordinates: "data",
    color: "salmon",
    linewidth: 2,
    dasharray: "none",
    alpha: 1,
    zorder: 2,
    drawstyle: "none"
  }, F.Markers = y, y.prototype = Object.create(d.prototype), y.prototype.constructor = y, y.prototype.requiredProps = ["data"], y.prototype.defaultProps = {
    xindex: 0,
    yindex: 1,
    coordinates: "data",
    facecolor: "salmon",
    edgecolor: "black",
    edgewidth: 1,
    alpha: 1,
    markersize: 6,
    markername: "circle",
    markerpath: null,
    zorder: 3
  }, y.prototype.pathFunc = function (t, s) {
    return this.marker;
  }, F.Image = g, g.prototype = Object.create(M.prototype), g.prototype.constructor = g, g.prototype.requiredProps = ["data", "extent"], g.prototype.defaultProps = {
    alpha: 1,
    coordinates: "data",
    zorder: 1
  }, g.prototype.draw = function () {
    this.image = this.ax.paths.append("svg:image"), this.image = this.image.attr("class", "mpld3-image").attr("xlink:href", "data:image/png;base64," + this.props.data).style("opacity", this.props.alpha).attr("preserveAspectRatio", "none"), this.updateDimensions();
  }, g.prototype.elements = function (s) {
    return t.select(this.image);
  }, g.prototype.updateDimensions = function () {
    var t = this.props.extent;
    this.image.attr("x", this.coords.x(t[0])).attr("y", this.coords.y(t[3])).attr("width", this.coords.x(t[1]) - this.coords.x(t[0])).attr("height", this.coords.y(t[2]) - this.coords.y(t[3]));
  }, F.Text = m, m.prototype = Object.create(M.prototype), m.prototype.constructor = m, m.prototype.requiredProps = ["text", "position"], m.prototype.defaultProps = {
    coordinates: "data",
    h_anchor: "start",
    v_baseline: "auto",
    rotation: 0,
    fontsize: 11,
    color: "black",
    alpha: 1,
    zorder: 3
  }, m.prototype.draw = function () {
    "data" == this.props.coordinates ? this.coords.zoomable ? this.obj = this.ax.paths.append("text") : this.obj = this.ax.staticPaths.append("text") : this.obj = this.ax.baseaxes.append("text"), this.obj.attr("class", "mpld3-text").text(this.text).style("text-anchor", this.props.h_anchor).style("dominant-baseline", this.props.v_baseline).style("font-size", this.props.fontsize).style("fill", this.props.color).style("opacity", this.props.alpha), this.applyTransform();
  }, m.prototype.elements = function (s) {
    return t.select(this.obj);
  }, m.prototype.applyTransform = function () {
    var t = this.coords.xy(this.position);
    this.obj.attr("x", t[0]).attr("y", t[1]), this.props.rotation && this.obj.attr("transform", "rotate(" + this.props.rotation + "," + t + ")");
  }, F.Axes = x, x.prototype = Object.create(M.prototype), x.prototype.constructor = x, x.prototype.requiredProps = ["xlim", "ylim"], x.prototype.defaultProps = {
    bbox: [.1, .1, .8, .8],
    axesbg: "#FFFFFF",
    axesbgalpha: 1,
    gridOn: !1,
    xdomain: null,
    ydomain: null,
    xscale: "linear",
    yscale: "linear",
    zoomable: !0,
    axes: [{
      position: "left"
    }, {
      position: "bottom"
    }],
    lines: [],
    paths: [],
    markers: [],
    texts: [],
    collections: [],
    sharex: [],
    sharey: [],
    images: []
  }, x.prototype.draw = function () {
    for (var s = 0; s < this.props.sharex.length; s++) this.sharex.push(F.get_element(this.props.sharex[s]));

    for (var s = 0; s < this.props.sharey.length; s++) this.sharey.push(F.get_element(this.props.sharey[s]));

    this.baseaxes = this.fig.canvas.append("g").attr("transform", "translate(" + this.position[0] + "," + this.position[1] + ")").attr("width", this.width).attr("height", this.height).attr("class", "mpld3-baseaxes"), this.axes = this.baseaxes.append("g").attr("class", "mpld3-axes").style("pointer-events", "visiblefill"), this.clip = this.axes.append("svg:clipPath").attr("id", this.clipid).append("svg:rect").attr("x", 0).attr("y", 0).attr("width", this.width).attr("height", this.height), this.axesbg = this.axes.append("svg:rect").attr("width", this.width).attr("height", this.height).attr("class", "mpld3-axesbg").style("fill", this.props.axesbg).style("fill-opacity", this.props.axesbgalpha), this.pathsContainer = this.axes.append("g").attr("clip-path", "url(#" + this.clipid + ")").attr("x", 0).attr("y", 0).attr("width", this.width).attr("height", this.height).attr("class", "mpld3-paths-container"), this.paths = this.pathsContainer.append("g").attr("class", "mpld3-paths"), this.staticPaths = this.axes.append("g").attr("class", "mpld3-staticpaths"), this.brush = t.brush().extent([[0, 0], [this.fig.width, this.fig.height]]).on("start", this.brushStart.bind(this)).on("brush", this.brushMove.bind(this)).on("end", this.brushEnd.bind(this)).on("start.nokey", function () {
      t.select(window).on("keydown.brush keyup.brush", null);
    });

    for (var s = 0; s < this.elements.length; s++) this.elements[s].draw();
  }, x.prototype.bindZoom = function () {
    this.zoom || (this.zoom = t.zoom(), this.zoom.on("zoom", this.zoomed.bind(this)), this.axes.call(this.zoom));
  }, x.prototype.unbindZoom = function () {
    this.zoom && (this.zoom.on("zoom", null), this.axes.on(".zoom", null), this.zoom = null);
  }, x.prototype.bindBrush = function () {
    this.brushG || (this.brushG = this.axes.append("g").attr("class", "mpld3-brush").call(this.brush));
  }, x.prototype.unbindBrush = function () {
    this.brushG && (this.brushG.remove(), this.brushG.on(".brush", null), this.brushG = null);
  }, x.prototype.reset = function () {
    this.zoom ? this.doZoom(!1, t.zoomIdentity, 750) : (this.bindZoom(), this.doZoom(!1, t.zoomIdentity, 750, function () {
      this.isSomeTypeOfZoomEnabled || this.unbindZoom();
    }.bind(this)));
  }, x.prototype.enableOrDisableBrushing = function () {
    this.isBoxzoomEnabled || this.isLinkedBrushEnabled ? this.bindBrush() : this.unbindBrush();
  }, x.prototype.isSomeTypeOfZoomEnabled = function () {
    return this.isZoomEnabled || this.isBoxzoomEnabled;
  }, x.prototype.enableOrDisableZooming = function () {
    this.isSomeTypeOfZoomEnabled() ? this.bindZoom() : this.unbindZoom();
  }, x.prototype.enableLinkedBrush = function () {
    this.isLinkedBrushEnabled = !0, this.enableOrDisableBrushing();
  }, x.prototype.disableLinkedBrush = function () {
    this.isLinkedBrushEnabled = !1, this.enableOrDisableBrushing();
  }, x.prototype.enableBoxzoom = function () {
    this.isBoxzoomEnabled = !0, this.enableOrDisableBrushing(), this.enableOrDisableZooming();
  }, x.prototype.disableBoxzoom = function () {
    this.isBoxzoomEnabled = !1, this.enableOrDisableBrushing(), this.enableOrDisableZooming();
  }, x.prototype.enableZoom = function () {
    this.isZoomEnabled = !0, this.enableOrDisableZooming(), this.axes.style("cursor", "move");
  }, x.prototype.disableZoom = function () {
    this.isZoomEnabled = !1, this.enableOrDisableZooming(), this.axes.style("cursor", null);
  }, x.prototype.doZoom = function (t, s, i, e) {
    if (this.props.zoomable && this.zoom) {
      if (i) {
        var o = this.axes.transition().duration(i).call(this.zoom.transform, s);
        e && o.on("end", e);
      } else this.axes.call(this.zoom.transform, s);

      t ? (this.lastTransform = s, this.sharex.forEach(function (t) {
        t.doZoom(!1, s, i);
      }), this.sharey.forEach(function (t) {
        t.doZoom(!1, s, i);
      })) : this.lastTransform = s;
    }
  }, x.prototype.zoomed = function () {
    var s = t.event.sourceEvent && "zoom" != t.event.sourceEvent.type;
    if (s) this.doZoom(!0, t.event.transform, !1);else {
      var i = t.event.transform;
      this.paths.attr("transform", i), this.elements.forEach(function (t) {
        t.zoomed && t.zoomed(i);
      }.bind(this));
    }
  }, x.prototype.resetBrush = function () {
    this.brushG.call(this.brush.move, null);
  }, x.prototype.doBoxzoom = function (s) {
    if (s && this.brushG) {
      var i = s.map(this.lastTransform.invert, this.lastTransform),
          e = i[1][0] - i[0][0],
          o = i[1][1] - i[0][1],
          r = (i[0][0] + i[1][0]) / 2,
          n = (i[0][1] + i[1][1]) / 2,
          a = e > o ? this.width / e : this.height / o,
          p = this.width / 2 - a * r,
          h = this.height / 2 - a * n,
          l = t.zoomIdentity.translate(p, h).scale(a);
      this.doZoom(!0, l, 750), this.resetBrush();
    }
  }, x.prototype.brushStart = function () {
    this.isLinkedBrushEnabled && (this.isCurrentLinkedBrushTarget = "MouseEvent" == t.event.sourceEvent.constructor.name, this.isCurrentLinkedBrushTarget && this.fig.resetBrushForOtherAxes(this.axid));
  }, x.prototype.brushMove = function () {
    var s = t.event.selection;
    this.isLinkedBrushEnabled && this.fig.updateLinkedBrush(s);
  }, x.prototype.brushEnd = function () {
    var s = t.event.selection;
    this.isBoxzoomEnabled && this.doBoxzoom(s), this.isLinkedBrushEnabled && (s || this.fig.endLinkedBrush(), this.isCurrentLinkedBrushTarget = !1);
  }, x.prototype.setTicks = function (t, s, i) {
    this.axisList.forEach(function (e) {
      e.props.xy == t && e.setTicks(s, i);
    });
  }, F.Toolbar = b, b.prototype = Object.create(M.prototype), b.prototype.constructor = b, b.prototype.defaultProps = {
    buttons: ["reset", "move"]
  }, b.prototype.addButton = function (t) {
    this.buttons.push(new t(this));
  }, b.prototype.draw = function () {
    function s() {
      this.buttonsobj.transition(750).attr("y", 0);
    }

    function i() {
      this.buttonsobj.transition(750).delay(250).attr("y", 16);
    }

    F.insert_css("div#" + this.fig.figid + " .mpld3-toolbar image", {
      cursor: "pointer",
      opacity: .2,
      display: "inline-block",
      margin: "0px"
    }), F.insert_css("div#" + this.fig.figid + " .mpld3-toolbar image.active", {
      opacity: .4
    }), F.insert_css("div#" + this.fig.figid + " .mpld3-toolbar image.pressed", {
      opacity: .6
    }), this.fig.canvas.on("mouseenter", s.bind(this)).on("mouseleave", i.bind(this)).on("touchenter", s.bind(this)).on("touchstart", s.bind(this)), this.toolbar = this.fig.canvas.append("svg:svg").attr("width", 16 * this.buttons.length).attr("height", 16).attr("x", 2).attr("y", this.fig.height - 16 - 2).attr("class", "mpld3-toolbar"), this.buttonsobj = this.toolbar.append("svg:g").selectAll("buttons").data(this.buttons).enter().append("svg:image").attr("class", function (t) {
      return t.cssclass;
    }).attr("xlink:href", function (t) {
      return t.icon();
    }).attr("width", 16).attr("height", 16).attr("x", function (t, s) {
      return 16 * s;
    }).attr("y", 16).on("click", function (t) {
      t.click();
    }).on("mouseenter", function () {
      t.select(this).classed("active", !0);
    }).on("mouseleave", function () {
      t.select(this).classed("active", !1);
    });

    for (var e = 0; e < this.buttons.length; e++) this.buttons[e].onDraw();
  }, b.prototype.deactivate_all = function () {
    this.buttons.forEach(function (t) {
      t.deactivate();
    });
  }, b.prototype.deactivate_by_action = function (t) {
    function s(s) {
      return -1 !== t.indexOf(s);
    }

    t.length > 0 && this.buttons.forEach(function (t) {
      t.actions.filter(s).length > 0 && t.deactivate();
    });
  }, F.Button = v, v.prototype = Object.create(M.prototype), v.prototype.constructor = v, v.prototype.setState = function (t) {
    t ? this.activate() : this.deactivate();
  }, v.prototype.click = function () {
    this.active ? this.deactivate() : this.activate();
  }, v.prototype.activate = function () {
    this.toolbar.deactivate_by_action(this.actions), this.onActivate(), this.active = !0, this.toolbar.toolbar.select("." + this.cssclass).classed("pressed", !0), this.sticky || this.deactivate();
  }, v.prototype.deactivate = function () {
    this.onDeactivate(), this.active = !1, this.toolbar.toolbar.select("." + this.cssclass).classed("pressed", !1);
  }, v.prototype.sticky = !1, v.prototype.actions = [], v.prototype.icon = function () {
    return "";
  }, v.prototype.onActivate = function () {}, v.prototype.onDeactivate = function () {}, v.prototype.onDraw = function () {}, F.ButtonFactory = function (t) {
    function s(t) {
      v.call(this, t, this.buttonID);
    }

    if ("string" != typeof t.buttonID) throw "ButtonFactory: buttonID must be present and be a string";
    s.prototype = Object.create(v.prototype), s.prototype.constructor = s;

    for (var i in t) s.prototype[i] = t[i];

    return s;
  }, F.Plugin = A, A.prototype = Object.create(M.prototype), A.prototype.constructor = A, A.prototype.requiredProps = [], A.prototype.defaultProps = {}, A.prototype.draw = function () {}, F.ResetPlugin = k, F.register_plugin("reset", k), k.prototype = Object.create(A.prototype), k.prototype.constructor = k, k.prototype.requiredProps = [], k.prototype.defaultProps = {}, F.ZoomPlugin = w, F.register_plugin("zoom", w), w.prototype = Object.create(A.prototype), w.prototype.constructor = w, w.prototype.requiredProps = [], w.prototype.defaultProps = {
    button: !0,
    enabled: null
  }, w.prototype.activate = function () {
    this.fig.enableZoom();
  }, w.prototype.deactivate = function () {
    this.fig.disableZoom();
  }, w.prototype.draw = function () {
    this.props.enabled ? this.activate() : this.deactivate();
  }, F.BoxZoomPlugin = B, F.register_plugin("boxzoom", B), B.prototype = Object.create(A.prototype), B.prototype.constructor = B, B.prototype.requiredProps = [], B.prototype.defaultProps = {
    button: !0,
    enabled: null
  }, B.prototype.activate = function () {
    this.fig.enableBoxzoom();
  }, B.prototype.deactivate = function () {
    this.fig.disableBoxzoom();
  }, B.prototype.draw = function () {
    this.props.enabled ? this.activate() : this.deactivate();
  }, F.TooltipPlugin = z, F.register_plugin("tooltip", z), z.prototype = Object.create(A.prototype), z.prototype.constructor = z, z.prototype.requiredProps = ["id"], z.prototype.defaultProps = {
    labels: null,
    hoffset: 0,
    voffset: 10,
    location: "mouse"
  }, z.prototype.draw = function () {
    function s(t, s) {
      this.tooltip.style("visibility", "visible").text(null === r ? "(" + t + ")" : n(r, s));
    }

    function i(s, i) {
      if ("mouse" === a) {
        var e = t.mouse(this.fig.canvas.node());
        this.x = e[0] + this.props.hoffset, this.y = e[1] - this.props.voffset;
      }

      this.tooltip.attr("x", this.x).attr("y", this.y);
    }

    function e(t, s) {
      this.tooltip.style("visibility", "hidden");
    }

    var o = F.get_element(this.props.id, this.fig),
        r = this.props.labels,
        a = this.props.location;
    this.tooltip = this.fig.canvas.append("text").attr("class", "mpld3-tooltip-text").attr("x", 0).attr("y", 0).text("").style("visibility", "hidden"), "bottom left" == a || "top left" == a ? (this.x = o.ax.position[0] + 5 + this.props.hoffset, this.tooltip.style("text-anchor", "beginning")) : "bottom right" == a || "top right" == a ? (this.x = o.ax.position[0] + o.ax.width - 5 + this.props.hoffset, this.tooltip.style("text-anchor", "end")) : this.tooltip.style("text-anchor", "middle"), "bottom left" == a || "bottom right" == a ? this.y = o.ax.position[1] + o.ax.height - 5 + this.props.voffset : ("top left" == a || "top right" == a) && (this.y = o.ax.position[1] + 5 + this.props.voffset), o.elements().on("mouseover", s.bind(this)).on("mousemove", i.bind(this)).on("mouseout", e.bind(this));
  }, F.LinkedBrushPlugin = E, F.register_plugin("linkedbrush", E), E.prototype = Object.create(F.Plugin.prototype), E.prototype.constructor = E, E.prototype.requiredProps = ["id"], E.prototype.defaultProps = {
    button: !0,
    enabled: null
  }, E.prototype.activate = function () {
    this.fig.enableLinkedBrush();
  }, E.prototype.deactivate = function () {
    this.fig.disableLinkedBrush();
  }, E.prototype.isPathInSelection = function (t, s, i, e) {
    var o = e[0][0] < t[s] && e[1][0] > t[s] && e[0][1] < t[i] && e[1][1] > t[i];
    return o;
  }, E.prototype.invertSelection = function (t, s) {
    var i = [s.x.invert(t[0][0]), s.x.invert(t[1][0])],
        e = [s.y.invert(t[1][1]), s.y.invert(t[0][1])];
    return [[Math.min.apply(Math, i), Math.min.apply(Math, e)], [Math.max.apply(Math, i), Math.max.apply(Math, e)]];
  }, E.prototype.update = function (t) {
    t && this.pathCollectionsByAxes.forEach(function (s, i) {
      var e = s[0],
          o = this.objectsByAxes[i],
          r = this.invertSelection(t, this.fig.axes[i]),
          n = e.props.xindex,
          a = e.props.yindex;
      o.selectAll("path").classed("mpld3-hidden", function (t, s) {
        return !this.isPathInSelection(t, n, a, r);
      }.bind(this));
    }.bind(this));
  }, E.prototype.end = function () {
    this.allObjects.selectAll("path").classed("mpld3-hidden", !1);
  }, E.prototype.draw = function () {
    F.insert_css("#" + this.fig.figid + " path.mpld3-hidden", {
      stroke: "#ccc !important",
      fill: "#ccc !important"
    });
    var t = F.get_element(this.props.id);
    if (!t) throw new Error("[LinkedBrush] Could not find path collection");
    if (!("offsets" in t.props)) throw new Error("[LinkedBrush] Figure is not a scatter plot.");
    this.objectClass = "mpld3-brushtarget-" + t.props[this.dataKey], this.pathCollectionsByAxes = this.fig.axes.map(function (s) {
      return s.elements.map(function (s) {
        return s.props[this.dataKey] == t.props[this.dataKey] ? (s.group.classed(this.objectClass, !0), s) : void 0;
      }.bind(this)).filter(function (t) {
        return t;
      });
    }.bind(this)), this.objectsByAxes = this.fig.axes.map(function (t) {
      return t.axes.selectAll("." + this.objectClass);
    }.bind(this)), this.allObjects = this.fig.canvas.selectAll("." + this.objectClass);
  }, F.register_plugin("mouseposition", P), P.prototype = Object.create(F.Plugin.prototype), P.prototype.constructor = P, P.prototype.requiredProps = [], P.prototype.defaultProps = {
    fontsize: 12,
    fmt: ".3g"
  }, P.prototype.draw = function () {
    for (var s = this.fig, i = t.format(this.props.fmt), e = s.canvas.append("text").attr("class", "mpld3-coordinates").style("text-anchor", "end").style("font-size", this.props.fontsize).attr("x", this.fig.width - 5).attr("y", this.fig.height - 5), o = 0; o < this.fig.axes.length; o++) {
      var r = function () {
        var r = s.axes[o];
        return function () {
          var s = t.mouse(this),
              o = r.x.invert(s[0]),
              n = r.y.invert(s[1]);
          e.text("(" + i(o) + ", " + i(n) + ")");
        };
      }();

      s.axes[o].baseaxes.on("mousemove", r).on("mouseout", function () {
        e.text("");
      });
    }
  }, F.Figure = O, O.prototype = Object.create(M.prototype), O.prototype.constructor = O, O.prototype.requiredProps = ["width", "height"], O.prototype.defaultProps = {
    data: {},
    axes: [],
    plugins: [{
      type: "reset"
    }, {
      type: "zoom"
    }, {
      type: "boxzoom"
    }]
  }, O.prototype.addPlugin = function (t) {
    if (!t.type) return console.warn("unspecified plugin type. Skipping this");
    var i;
    if (!(t.type in F.plugin_map)) return console.warn("Skipping unrecognized plugin: " + i);
    i = F.plugin_map[t.type], (t.clear_toolbar || t.buttons) && console.warn("DEPRECATION WARNING: You are using pluginInfo.clear_toolbar or pluginInfo, which have been deprecated. Please see the build-in plugins for the new method to add buttons, otherwise contact the mpld3 maintainers.");
    var e = s(t);
    delete e.type;
    var o = new i(this, e);
    this.plugins.push(o), this.pluginsByType[t.type] = o;
  }, O.prototype.draw = function () {
    F.insert_css("div#" + this.figid, {
      "font-family": "Helvetica, sans-serif"
    }), this.canvas = this.root.append("svg:svg").attr("class", "mpld3-figure").attr("width", this.width).attr("height", this.height);

    for (var t = 0; t < this.axes.length; t++) this.axes[t].draw();

    this.disableZoom();

    for (var t = 0; t < this.plugins.length; t++) this.plugins[t].draw();

    this.toolbar.draw();
  }, O.prototype.resetBrushForOtherAxes = function (t) {
    this.axes.forEach(function (s) {
      s.axid != t && s.resetBrush();
    });
  }, O.prototype.updateLinkedBrush = function (t) {
    this.pluginsByType.linkedbrush && this.pluginsByType.linkedbrush.update(t);
  }, O.prototype.endLinkedBrush = function () {
    this.pluginsByType.linkedbrush && this.pluginsByType.linkedbrush.end();
  }, O.prototype.reset = function (t) {
    this.axes.forEach(function (t) {
      t.reset();
    });
  }, O.prototype.enableLinkedBrush = function () {
    this.axes.forEach(function (t) {
      t.enableLinkedBrush();
    });
  }, O.prototype.disableLinkedBrush = function () {
    this.axes.forEach(function (t) {
      t.disableLinkedBrush();
    });
  }, O.prototype.enableBoxzoom = function () {
    this.axes.forEach(function (t) {
      t.enableBoxzoom();
    });
  }, O.prototype.disableBoxzoom = function () {
    this.axes.forEach(function (t) {
      t.disableBoxzoom();
    });
  }, O.prototype.enableZoom = function () {
    this.axes.forEach(function (t) {
      t.enableZoom();
    });
  }, O.prototype.disableZoom = function () {
    this.axes.forEach(function (t) {
      t.disableZoom();
    });
  }, O.prototype.toggleZoom = function () {
    this.isZoomEnabled ? this.disableZoom() : this.enableZoom();
  }, O.prototype.setTicks = function (t, s, i) {
    this.axes.forEach(function (e) {
      e.setTicks(t, s, i);
    });
  }, O.prototype.setXTicks = function (t, s) {
    this.setTicks("x", t, s);
  }, O.prototype.setYTicks = function (t, s) {
    this.setTicks("y", t, s);
  }, O.prototype.get_data = function (t) {
    return null === t || "undefined" == typeof t ? null : "string" == typeof t ? this.data[t] : t;
  }, F.PlotElement = M, M.prototype.requiredProps = [], M.prototype.defaultProps = {}, M.prototype.processProps = function (t) {
    t = s(t);
    var i = {},
        e = this.name();
    this.requiredProps.forEach(function (s) {
      if (!(s in t)) throw "property '" + s + "' must be specified for " + e;
      i[s] = t[s], delete t[s];
    });

    for (var o in this.defaultProps) o in t ? (i[o] = t[o], delete t[o]) : i[o] = this.defaultProps[o];

    "id" in t ? (i.id = t.id, delete t.id) : "id" in i || (i.id = F.generateId());

    for (var o in t) console.warn("Unrecognized property '" + o + "' for object " + this.name() + " (value = " + t[o] + ").");

    return i;
  }, M.prototype.name = function () {
    var t = /function (.{1,})\(/,
        s = t.exec(this.constructor.toString());
    return s && s.length > 1 ? s[1] : "";
  }, module.exports ? module.exports = F : this.mpld3 = F, console.log("Loaded mpld3 version " + F.version);
}(d3);
});

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
    inject("data-v-1badb2fa_0", { source: ".loader-box[data-v-1badb2fa]{display:flex;justify-content:center}.overlay-box[data-v-1badb2fa]{display:flex;flex-direction:column;height:100%;justify-content:space-evenly}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-1badb2fa";
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
    inject("data-v-33f161c6_0", { source: "@import url(https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css);", map: undefined, media: undefined })
,inject("data-v-33f161c6_1", { source: ".fade-enter-active[data-v-33f161c6],.fade-leave-active[data-v-33f161c6]{transition:opacity .3s}.fade-enter[data-v-33f161c6],.fade-leave-to[data-v-33f161c6]{opacity:0}.close-button[data-v-33f161c6],.close-button[data-v-33f161c6]:hover{background:0 0;line-height:0;padding:5px 5px;margin-left:10px;border-radius:3px}.close-button[data-v-33f161c6]:hover{background:#ffffff63;color:#737373}.alert[data-v-33f161c6]{border:0;border-radius:0;color:#fff;padding:20px 15px;font-size:14px;z-index:100;display:inline-block;position:fixed;transition:all .5s ease-in-out}.container .alert[data-v-33f161c6]{border-radius:4px}.alert.center[data-v-33f161c6]{left:0;right:0;margin:0 auto}.alert.left[data-v-33f161c6]{left:20px}.alert.right[data-v-33f161c6]{right:20px}.container .alert[data-v-33f161c6]{border-radius:0}.alert .alert-icon[data-v-33f161c6]{font-size:30px;margin-right:5px}.alert .close~span[data-v-33f161c6]{display:inline-block;max-width:89%}.alert[data-notify=container][data-v-33f161c6]{padding:0;border-radius:2px}.alert span[data-notify=icon][data-v-33f161c6]{font-size:30px;display:block;left:15px;position:absolute;top:50%;margin-top:-20px}.alert-info[data-v-33f161c6]{background-color:#7ce4fe;color:#3091b2}.alert-success[data-v-33f161c6]{background-color:#080;color:#fff}.alert-warning[data-v-33f161c6]{background-color:#e29722;color:#fff}.alert-danger[data-v-33f161c6]{background-color:#ff8f5e;color:#b33c12}.message-box[data-v-33f161c6]{font-size:15px;align-content:center;max-width:400px;min-width:150px;padding-left:10px;flex-grow:1}.message-box .message[data-v-33f161c6]{line-height:1.5em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%}.notification-box[data-v-33f161c6]{display:flex;justify-content:flex-start;padding:10px 15px}.notification-box>div[data-v-33f161c6]{align-self:center}.btn__trans[data-v-33f161c6]{font-size:18px;color:#fff;background-color:transparent;background-repeat:no-repeat;border:none;cursor:pointer;overflow:hidden;background-image:none;outline:0}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-33f161c6";
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
    inject("data-v-301ae192_0", { source: ".list-item{display:inline-block;margin-right:10px}.list-enter-active,.list-leave-active{transition:all 1s}.list-enter,.list-leave-to{opacity:0;transform:translateY(-30px)}", map: undefined, media: undefined });

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
    inject("data-v-964d9d2c_0", { source: ".dropdown-toggle{cursor:pointer;display:flex;justify-content:space-evenly;text-transform:initial}.dropdown-toggle:after{position:absolute;right:10px;top:50%;margin-top:-2px}.dropdown-menu{margin-top:20px}", map: undefined, media: undefined });

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
