/*!
 * sciris-vue v0.1.0
 * (c) 2018-present Optima Consortium <info@ocds.co>
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['sciris-vue'] = {})));
}(this, (function (exports) { 'use strict';

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

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  var isBuffer_1 = function (obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
  };

  function isBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
  }

  /*global toString:true*/

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  var utils$1 = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer_1,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils$1.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }
    error.request = request;
    error.response = response;
    return error;
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    // Note: status is not exposed by XDomainRequest
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils$1.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils$1.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils$1.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils$1.forEach(val, function parseValue(v) {
          if (utils$1.isDate(v)) {
            v = v.toISOString();
          } else if (utils$1.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils$1.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils$1.trim(line.substr(0, i)).toLowerCase();
      val = utils$1.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils$1.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
      function resolveURL(url) {
        var href = url;

        if (msie) {
          // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                    urlParsingNode.pathname :
                    '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils$1.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
      };
    })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
  );

  // btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function E() {
    this.message = 'String contains an invalid character';
  }
  E.prototype = new Error;
  E.prototype.code = 5;
  E.prototype.name = 'InvalidCharacterError';

  function btoa(input) {
    var str = String(input);
    var output = '';
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars;
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new E();
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  var btoa_1 = btoa;

  var cookies = (
    utils$1.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils$1.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils$1.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils$1.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

    // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
  );

  var btoa$1 = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || btoa_1;

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;

      if (utils$1.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();
      var loadEvent = 'onreadystatechange';
      var xDomain = false;

      // For IE 8/9 CORS support
      // Only supports POST and GET calls and doesn't returns the response headers.
      // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
      if ("development" !== 'test' &&
          typeof window !== 'undefined' &&
          window.XDomainRequest && !('withCredentials' in request) &&
          !isURLSameOrigin(config.url)) {
        request = new window.XDomainRequest();
        loadEvent = 'onload';
        xDomain = true;
        request.onprogress = function handleProgress() {};
        request.ontimeout = function handleTimeout() {};
      }

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password || '';
        requestHeaders.Authorization = 'Basic ' + btoa$1(username + ':' + password);
      }

      request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      // Listen for ready state
      request[loadEvent] = function handleLoad() {
        if (!request || (request.readyState !== 4 && !xDomain)) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }

        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
          status: request.status === 1223 ? 204 : request.status,
          statusText: request.status === 1223 ? 'No Content' : request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(resolve, reject, response);

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils$1.isStandardBrowserEnv()) {
        var cookies$$1 = cookies;

        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
            cookies$$1.read(config.xsrfCookieName) :
            undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$1.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (config.withCredentials) {
        request.withCredentials = true;
      }

      // Add responseType to request if needed
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken) {
        // Handle cancellation
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }

          request.abort();
          reject(cancel);
          // Clean up request
          request = null;
        });
      }

      if (requestData === undefined) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils$1.isUndefined(headers) && utils$1.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  var defaults = {
    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Content-Type');
      if (utils$1.isFormData(data) ||
        utils$1.isArrayBuffer(data) ||
        utils$1.isBuffer(data) ||
        utils$1.isStream(data) ||
        utils$1.isFile(data) ||
        utils$1.isBlob(data)
      ) {
        return data;
      }
      if (utils$1.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$1.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils$1.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) { /* Ignore */ }
      }
      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };

  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };

  utils$1.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils$1.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils$1.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Support baseURL config
    if (config.baseURL && !isAbsoluteURL(config.url)) {
      config.url = combineURLs(config.baseURL, config.url);
    }

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData(
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils$1.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers || {}
    );

    utils$1.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = utils$1.merge({
        url: arguments[0]
      }, arguments[1]);
    }

    config = utils$1.merge(defaults_1, {method: 'get'}, this.defaults, config);
    config.method = config.method.toLowerCase();

    // Hook up interceptors middleware
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);

    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(utils$1.merge(config || {}, {
        method: method,
        url: url
      }));
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, data, config) {
      return this.request(utils$1.merge(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils$1.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils$1.extend(instance, context);

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Factory for creating new instances
  axios.create = function create(instanceConfig) {
    return createInstance(utils$1.merge(defaults_1, instanceConfig));
  };

  // Expose Cancel & CancelToken
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var default_1 = axios;
  axios_1.default = default_1;

  var axios$1 = axios_1;

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var FileSaver_min = createCommonjsModule(function (module, exports) {
  (function(a,b){if("function"==typeof undefined&&undefined.amd)undefined([],b);else b();})(commonjsGlobal,function(){function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Depricated: Expected third argument to be a object"), b={autoBom:!b}), b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b), e.responseType="blob", e.onload=function(){a(e.response,c,d);}, e.onerror=function(){console.error("could not download file");}, e.send();}function d(a){var b=new XMLHttpRequest;return b.open("HEAD",a,!1), b.send(), 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null), a.dispatchEvent(b);}}var f=function(){try{return Function("return this")()||(eval)("this")}catch(a){return"object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:this}}(),a=f.saveAs||"object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download", j.download=g, j.rel="noopener", "string"==typeof b?(j.href=b, j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b), setTimeout(function(){i.revokeObjectURL(j.href);},4E4), setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download", "string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f, i.target="_blank", setTimeout(function(){e(i);});}}:function(a,b,d,e){if(e=e||open("","_blank"), e&&(e.document.title=e.document.body.innerText="downloading..."), "string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"), e?e.location.href=a:location=a, e=null;}, j.readAsDataURL(a);}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l, e=null, setTimeout(function(){k.revokeObjectURL(l);},4E4);}};f.saveAs=a.saveAs=a, "undefined"!='object'&&(module.exports=a);});


  });

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
        axios$1.post('/api/rpcs', {
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
        axios$1.post('/api/rpcs', {
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

            FileSaver_min(blob, filename); // Bring up the browser dialog allowing the user to save the file or cancel doing so.

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
          axios$1.post('/api/rpcs', formData) // Use a POST request to pass along file to the server.
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

  // progress-indicator-service.js -- functions for showing progress
  //
  // Last update: 8/12/18 (gchadder3)
  // Note: To use these functions, you need to pass in the Vue instance, this. 
  // Also, the caller needs to have imported the Spinner.vue PopupSpinner 
  // component and instantiated it.
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

      vm.$Progress.set(complete);
    }

    vm.$spinner.start(); // Bring up a spinner.
  }

  function succeed(vm, successMessage) {
    console.log(successMessage);
    complete = 100; // End the counter

    vm.$spinner.stop(); // Dispel the spinner.

    vm.$Progress.finish(); // Finish the loading bar -- redundant?

    if (successMessage !== '') {
      // Success popup.
      vm.$notifications.notify({
        message: successMessage,
        icon: 'ti-check',
        type: 'success',
        verticalAlign: 'top',
        horizontalAlign: 'right',
        timeout: 2000
      });
    }
  }

  function fail(vm, failMessage, error) {
    console.log(failMessage);
    var msgsplit = error.message.split('Exception details:'); // WARNING, must match sc_app.py

    var usermsg = msgsplit[0].replace(/\n/g, '<br>');
    console.log(error.message);
    console.log(usermsg);
    complete = 100;
    vm.$spinner.stop(); // Dispel the spinner.

    vm.$Progress.fail(); // Fail the loading bar.

    if (failMessage !== '') {
      // Put up a failure notification.
      vm.$notifications.notify({
        message: '<b>' + failMessage + '</b>' + '<br><br>' + usermsg,
        icon: 'ti-face-sad',
        type: 'warning',
        verticalAlign: 'top',
        horizontalAlign: 'right',
        timeout: 0
      });
    }
  }

  var status = {
    start,
    succeed,
    fail
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

  var taskService = {
    getTaskResultWaiting,
    getTaskResultPolling
  };

  var core = createCommonjsModule(function (module, exports) {
  (function (root, factory) {
  	{
  		// CommonJS
  		module.exports = exports = factory();
  	}
  }(commonjsGlobal, function () {

  	/**
  	 * CryptoJS core components.
  	 */
  	var CryptoJS = CryptoJS || (function (Math, undefined) {
  	    /*
  	     * Local polyfil of Object.create
  	     */
  	    var create = Object.create || (function () {
  	        function F() {}
  	        return function (obj) {
  	            var subtype;

  	            F.prototype = obj;

  	            subtype = new F();

  	            F.prototype = null;

  	            return subtype;
  	        };
  	    }());

  	    /**
  	     * CryptoJS namespace.
  	     */
  	    var C = {};

  	    /**
  	     * Library namespace.
  	     */
  	    var C_lib = C.lib = {};

  	    /**
  	     * Base object for prototypal inheritance.
  	     */
  	    var Base = C_lib.Base = (function () {


  	        return {
  	            /**
  	             * Creates a new object that inherits from this object.
  	             *
  	             * @param {Object} overrides Properties to copy into the new object.
  	             *
  	             * @return {Object} The new object.
  	             *
  	             * @static
  	             *
  	             * @example
  	             *
  	             *     var MyType = CryptoJS.lib.Base.extend({
  	             *         field: 'value',
  	             *
  	             *         method: function () {
  	             *         }
  	             *     });
  	             */
  	            extend: function (overrides) {
  	                // Spawn
  	                var subtype = create(this);

  	                // Augment
  	                if (overrides) {
  	                    subtype.mixIn(overrides);
  	                }

  	                // Create default initializer
  	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
  	                    subtype.init = function () {
  	                        subtype.$super.init.apply(this, arguments);
  	                    };
  	                }

  	                // Initializer's prototype is the subtype object
  	                subtype.init.prototype = subtype;

  	                // Reference supertype
  	                subtype.$super = this;

  	                return subtype;
  	            },

  	            /**
  	             * Extends this object and runs the init method.
  	             * Arguments to create() will be passed to init().
  	             *
  	             * @return {Object} The new object.
  	             *
  	             * @static
  	             *
  	             * @example
  	             *
  	             *     var instance = MyType.create();
  	             */
  	            create: function () {
  	                var instance = this.extend();
  	                instance.init.apply(instance, arguments);

  	                return instance;
  	            },

  	            /**
  	             * Initializes a newly created object.
  	             * Override this method to add some logic when your objects are created.
  	             *
  	             * @example
  	             *
  	             *     var MyType = CryptoJS.lib.Base.extend({
  	             *         init: function () {
  	             *             // ...
  	             *         }
  	             *     });
  	             */
  	            init: function () {
  	            },

  	            /**
  	             * Copies properties into this object.
  	             *
  	             * @param {Object} properties The properties to mix in.
  	             *
  	             * @example
  	             *
  	             *     MyType.mixIn({
  	             *         field: 'value'
  	             *     });
  	             */
  	            mixIn: function (properties) {
  	                for (var propertyName in properties) {
  	                    if (properties.hasOwnProperty(propertyName)) {
  	                        this[propertyName] = properties[propertyName];
  	                    }
  	                }

  	                // IE won't copy toString using the loop above
  	                if (properties.hasOwnProperty('toString')) {
  	                    this.toString = properties.toString;
  	                }
  	            },

  	            /**
  	             * Creates a copy of this object.
  	             *
  	             * @return {Object} The clone.
  	             *
  	             * @example
  	             *
  	             *     var clone = instance.clone();
  	             */
  	            clone: function () {
  	                return this.init.prototype.extend(this);
  	            }
  	        };
  	    }());

  	    /**
  	     * An array of 32-bit words.
  	     *
  	     * @property {Array} words The array of 32-bit words.
  	     * @property {number} sigBytes The number of significant bytes in this word array.
  	     */
  	    var WordArray = C_lib.WordArray = Base.extend({
  	        /**
  	         * Initializes a newly created word array.
  	         *
  	         * @param {Array} words (Optional) An array of 32-bit words.
  	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.lib.WordArray.create();
  	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
  	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
  	         */
  	        init: function (words, sigBytes) {
  	            words = this.words = words || [];

  	            if (sigBytes != undefined) {
  	                this.sigBytes = sigBytes;
  	            } else {
  	                this.sigBytes = words.length * 4;
  	            }
  	        },

  	        /**
  	         * Converts this word array to a string.
  	         *
  	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
  	         *
  	         * @return {string} The stringified word array.
  	         *
  	         * @example
  	         *
  	         *     var string = wordArray + '';
  	         *     var string = wordArray.toString();
  	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
  	         */
  	        toString: function (encoder) {
  	            return (encoder || Hex).stringify(this);
  	        },

  	        /**
  	         * Concatenates a word array to this word array.
  	         *
  	         * @param {WordArray} wordArray The word array to append.
  	         *
  	         * @return {WordArray} This word array.
  	         *
  	         * @example
  	         *
  	         *     wordArray1.concat(wordArray2);
  	         */
  	        concat: function (wordArray) {
  	            // Shortcuts
  	            var thisWords = this.words;
  	            var thatWords = wordArray.words;
  	            var thisSigBytes = this.sigBytes;
  	            var thatSigBytes = wordArray.sigBytes;

  	            // Clamp excess bits
  	            this.clamp();

  	            // Concat
  	            if (thisSigBytes % 4) {
  	                // Copy one byte at a time
  	                for (var i = 0; i < thatSigBytes; i++) {
  	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
  	                }
  	            } else {
  	                // Copy one word at a time
  	                for (var i = 0; i < thatSigBytes; i += 4) {
  	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
  	                }
  	            }
  	            this.sigBytes += thatSigBytes;

  	            // Chainable
  	            return this;
  	        },

  	        /**
  	         * Removes insignificant bits.
  	         *
  	         * @example
  	         *
  	         *     wordArray.clamp();
  	         */
  	        clamp: function () {
  	            // Shortcuts
  	            var words = this.words;
  	            var sigBytes = this.sigBytes;

  	            // Clamp
  	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
  	            words.length = Math.ceil(sigBytes / 4);
  	        },

  	        /**
  	         * Creates a copy of this word array.
  	         *
  	         * @return {WordArray} The clone.
  	         *
  	         * @example
  	         *
  	         *     var clone = wordArray.clone();
  	         */
  	        clone: function () {
  	            var clone = Base.clone.call(this);
  	            clone.words = this.words.slice(0);

  	            return clone;
  	        },

  	        /**
  	         * Creates a word array filled with random bytes.
  	         *
  	         * @param {number} nBytes The number of random bytes to generate.
  	         *
  	         * @return {WordArray} The random word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
  	         */
  	        random: function (nBytes) {
  	            var words = [];

  	            var r = (function (m_w) {
  	                var m_w = m_w;
  	                var m_z = 0x3ade68b1;
  	                var mask = 0xffffffff;

  	                return function () {
  	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
  	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
  	                    var result = ((m_z << 0x10) + m_w) & mask;
  	                    result /= 0x100000000;
  	                    result += 0.5;
  	                    return result * (Math.random() > .5 ? 1 : -1);
  	                }
  	            });

  	            for (var i = 0, rcache; i < nBytes; i += 4) {
  	                var _r = r((rcache || Math.random()) * 0x100000000);

  	                rcache = _r() * 0x3ade67b7;
  	                words.push((_r() * 0x100000000) | 0);
  	            }

  	            return new WordArray.init(words, nBytes);
  	        }
  	    });

  	    /**
  	     * Encoder namespace.
  	     */
  	    var C_enc = C.enc = {};

  	    /**
  	     * Hex encoding strategy.
  	     */
  	    var Hex = C_enc.Hex = {
  	        /**
  	         * Converts a word array to a hex string.
  	         *
  	         * @param {WordArray} wordArray The word array.
  	         *
  	         * @return {string} The hex string.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
  	         */
  	        stringify: function (wordArray) {
  	            // Shortcuts
  	            var words = wordArray.words;
  	            var sigBytes = wordArray.sigBytes;

  	            // Convert
  	            var hexChars = [];
  	            for (var i = 0; i < sigBytes; i++) {
  	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  	                hexChars.push((bite >>> 4).toString(16));
  	                hexChars.push((bite & 0x0f).toString(16));
  	            }

  	            return hexChars.join('');
  	        },

  	        /**
  	         * Converts a hex string to a word array.
  	         *
  	         * @param {string} hexStr The hex string.
  	         *
  	         * @return {WordArray} The word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
  	         */
  	        parse: function (hexStr) {
  	            // Shortcut
  	            var hexStrLength = hexStr.length;

  	            // Convert
  	            var words = [];
  	            for (var i = 0; i < hexStrLength; i += 2) {
  	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
  	            }

  	            return new WordArray.init(words, hexStrLength / 2);
  	        }
  	    };

  	    /**
  	     * Latin1 encoding strategy.
  	     */
  	    var Latin1 = C_enc.Latin1 = {
  	        /**
  	         * Converts a word array to a Latin1 string.
  	         *
  	         * @param {WordArray} wordArray The word array.
  	         *
  	         * @return {string} The Latin1 string.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
  	         */
  	        stringify: function (wordArray) {
  	            // Shortcuts
  	            var words = wordArray.words;
  	            var sigBytes = wordArray.sigBytes;

  	            // Convert
  	            var latin1Chars = [];
  	            for (var i = 0; i < sigBytes; i++) {
  	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  	                latin1Chars.push(String.fromCharCode(bite));
  	            }

  	            return latin1Chars.join('');
  	        },

  	        /**
  	         * Converts a Latin1 string to a word array.
  	         *
  	         * @param {string} latin1Str The Latin1 string.
  	         *
  	         * @return {WordArray} The word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
  	         */
  	        parse: function (latin1Str) {
  	            // Shortcut
  	            var latin1StrLength = latin1Str.length;

  	            // Convert
  	            var words = [];
  	            for (var i = 0; i < latin1StrLength; i++) {
  	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  	            }

  	            return new WordArray.init(words, latin1StrLength);
  	        }
  	    };

  	    /**
  	     * UTF-8 encoding strategy.
  	     */
  	    var Utf8 = C_enc.Utf8 = {
  	        /**
  	         * Converts a word array to a UTF-8 string.
  	         *
  	         * @param {WordArray} wordArray The word array.
  	         *
  	         * @return {string} The UTF-8 string.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
  	         */
  	        stringify: function (wordArray) {
  	            try {
  	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
  	            } catch (e) {
  	                throw new Error('Malformed UTF-8 data');
  	            }
  	        },

  	        /**
  	         * Converts a UTF-8 string to a word array.
  	         *
  	         * @param {string} utf8Str The UTF-8 string.
  	         *
  	         * @return {WordArray} The word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
  	         */
  	        parse: function (utf8Str) {
  	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  	        }
  	    };

  	    /**
  	     * Abstract buffered block algorithm template.
  	     *
  	     * The property blockSize must be implemented in a concrete subtype.
  	     *
  	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
  	     */
  	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
  	        /**
  	         * Resets this block algorithm's data buffer to its initial state.
  	         *
  	         * @example
  	         *
  	         *     bufferedBlockAlgorithm.reset();
  	         */
  	        reset: function () {
  	            // Initial values
  	            this._data = new WordArray.init();
  	            this._nDataBytes = 0;
  	        },

  	        /**
  	         * Adds new data to this block algorithm's buffer.
  	         *
  	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
  	         *
  	         * @example
  	         *
  	         *     bufferedBlockAlgorithm._append('data');
  	         *     bufferedBlockAlgorithm._append(wordArray);
  	         */
  	        _append: function (data) {
  	            // Convert string to WordArray, else assume WordArray already
  	            if (typeof data == 'string') {
  	                data = Utf8.parse(data);
  	            }

  	            // Append
  	            this._data.concat(data);
  	            this._nDataBytes += data.sigBytes;
  	        },

  	        /**
  	         * Processes available data blocks.
  	         *
  	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
  	         *
  	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
  	         *
  	         * @return {WordArray} The processed data.
  	         *
  	         * @example
  	         *
  	         *     var processedData = bufferedBlockAlgorithm._process();
  	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
  	         */
  	        _process: function (doFlush) {
  	            // Shortcuts
  	            var data = this._data;
  	            var dataWords = data.words;
  	            var dataSigBytes = data.sigBytes;
  	            var blockSize = this.blockSize;
  	            var blockSizeBytes = blockSize * 4;

  	            // Count blocks ready
  	            var nBlocksReady = dataSigBytes / blockSizeBytes;
  	            if (doFlush) {
  	                // Round up to include partial blocks
  	                nBlocksReady = Math.ceil(nBlocksReady);
  	            } else {
  	                // Round down to include only full blocks,
  	                // less the number of blocks that must remain in the buffer
  	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
  	            }

  	            // Count words ready
  	            var nWordsReady = nBlocksReady * blockSize;

  	            // Count bytes ready
  	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

  	            // Process blocks
  	            if (nWordsReady) {
  	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
  	                    // Perform concrete-algorithm logic
  	                    this._doProcessBlock(dataWords, offset);
  	                }

  	                // Remove processed words
  	                var processedWords = dataWords.splice(0, nWordsReady);
  	                data.sigBytes -= nBytesReady;
  	            }

  	            // Return processed words
  	            return new WordArray.init(processedWords, nBytesReady);
  	        },

  	        /**
  	         * Creates a copy of this object.
  	         *
  	         * @return {Object} The clone.
  	         *
  	         * @example
  	         *
  	         *     var clone = bufferedBlockAlgorithm.clone();
  	         */
  	        clone: function () {
  	            var clone = Base.clone.call(this);
  	            clone._data = this._data.clone();

  	            return clone;
  	        },

  	        _minBufferSize: 0
  	    });

  	    /**
  	     * Abstract hasher template.
  	     *
  	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
  	     */
  	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
  	        /**
  	         * Configuration options.
  	         */
  	        cfg: Base.extend(),

  	        /**
  	         * Initializes a newly created hasher.
  	         *
  	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
  	         *
  	         * @example
  	         *
  	         *     var hasher = CryptoJS.algo.SHA256.create();
  	         */
  	        init: function (cfg) {
  	            // Apply config defaults
  	            this.cfg = this.cfg.extend(cfg);

  	            // Set initial values
  	            this.reset();
  	        },

  	        /**
  	         * Resets this hasher to its initial state.
  	         *
  	         * @example
  	         *
  	         *     hasher.reset();
  	         */
  	        reset: function () {
  	            // Reset data buffer
  	            BufferedBlockAlgorithm.reset.call(this);

  	            // Perform concrete-hasher logic
  	            this._doReset();
  	        },

  	        /**
  	         * Updates this hasher with a message.
  	         *
  	         * @param {WordArray|string} messageUpdate The message to append.
  	         *
  	         * @return {Hasher} This hasher.
  	         *
  	         * @example
  	         *
  	         *     hasher.update('message');
  	         *     hasher.update(wordArray);
  	         */
  	        update: function (messageUpdate) {
  	            // Append
  	            this._append(messageUpdate);

  	            // Update the hash
  	            this._process();

  	            // Chainable
  	            return this;
  	        },

  	        /**
  	         * Finalizes the hash computation.
  	         * Note that the finalize operation is effectively a destructive, read-once operation.
  	         *
  	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
  	         *
  	         * @return {WordArray} The hash.
  	         *
  	         * @example
  	         *
  	         *     var hash = hasher.finalize();
  	         *     var hash = hasher.finalize('message');
  	         *     var hash = hasher.finalize(wordArray);
  	         */
  	        finalize: function (messageUpdate) {
  	            // Final message update
  	            if (messageUpdate) {
  	                this._append(messageUpdate);
  	            }

  	            // Perform concrete-hasher logic
  	            var hash = this._doFinalize();

  	            return hash;
  	        },

  	        blockSize: 512/32,

  	        /**
  	         * Creates a shortcut function to a hasher's object interface.
  	         *
  	         * @param {Hasher} hasher The hasher to create a helper for.
  	         *
  	         * @return {Function} The shortcut function.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
  	         */
  	        _createHelper: function (hasher) {
  	            return function (message, cfg) {
  	                return new hasher.init(cfg).finalize(message);
  	            };
  	        },

  	        /**
  	         * Creates a shortcut function to the HMAC's object interface.
  	         *
  	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
  	         *
  	         * @return {Function} The shortcut function.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
  	         */
  	        _createHmacHelper: function (hasher) {
  	            return function (message, key) {
  	                return new C_algo.HMAC.init(hasher, key).finalize(message);
  	            };
  	        }
  	    });

  	    /**
  	     * Algorithm namespace.
  	     */
  	    var C_algo = C.algo = {};

  	    return C;
  	}(Math));


  	return CryptoJS;

  }));
  });

  var sha256 = createCommonjsModule(function (module, exports) {
  (function (root, factory) {
  	{
  		// CommonJS
  		module.exports = exports = factory(core);
  	}
  }(commonjsGlobal, function (CryptoJS) {

  	(function (Math) {
  	    // Shortcuts
  	    var C = CryptoJS;
  	    var C_lib = C.lib;
  	    var WordArray = C_lib.WordArray;
  	    var Hasher = C_lib.Hasher;
  	    var C_algo = C.algo;

  	    // Initialization and round constants tables
  	    var H = [];
  	    var K = [];

  	    // Compute constants
  	    (function () {
  	        function isPrime(n) {
  	            var sqrtN = Math.sqrt(n);
  	            for (var factor = 2; factor <= sqrtN; factor++) {
  	                if (!(n % factor)) {
  	                    return false;
  	                }
  	            }

  	            return true;
  	        }

  	        function getFractionalBits(n) {
  	            return ((n - (n | 0)) * 0x100000000) | 0;
  	        }

  	        var n = 2;
  	        var nPrime = 0;
  	        while (nPrime < 64) {
  	            if (isPrime(n)) {
  	                if (nPrime < 8) {
  	                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
  	                }
  	                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

  	                nPrime++;
  	            }

  	            n++;
  	        }
  	    }());

  	    // Reusable object
  	    var W = [];

  	    /**
  	     * SHA-256 hash algorithm.
  	     */
  	    var SHA256 = C_algo.SHA256 = Hasher.extend({
  	        _doReset: function () {
  	            this._hash = new WordArray.init(H.slice(0));
  	        },

  	        _doProcessBlock: function (M, offset) {
  	            // Shortcut
  	            var H = this._hash.words;

  	            // Working variables
  	            var a = H[0];
  	            var b = H[1];
  	            var c = H[2];
  	            var d = H[3];
  	            var e = H[4];
  	            var f = H[5];
  	            var g = H[6];
  	            var h = H[7];

  	            // Computation
  	            for (var i = 0; i < 64; i++) {
  	                if (i < 16) {
  	                    W[i] = M[offset + i] | 0;
  	                } else {
  	                    var gamma0x = W[i - 15];
  	                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
  	                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
  	                                   (gamma0x >>> 3);

  	                    var gamma1x = W[i - 2];
  	                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
  	                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
  	                                   (gamma1x >>> 10);

  	                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
  	                }

  	                var ch  = (e & f) ^ (~e & g);
  	                var maj = (a & b) ^ (a & c) ^ (b & c);

  	                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
  	                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

  	                var t1 = h + sigma1 + ch + K[i] + W[i];
  	                var t2 = sigma0 + maj;

  	                h = g;
  	                g = f;
  	                f = e;
  	                e = (d + t1) | 0;
  	                d = c;
  	                c = b;
  	                b = a;
  	                a = (t1 + t2) | 0;
  	            }

  	            // Intermediate hash value
  	            H[0] = (H[0] + a) | 0;
  	            H[1] = (H[1] + b) | 0;
  	            H[2] = (H[2] + c) | 0;
  	            H[3] = (H[3] + d) | 0;
  	            H[4] = (H[4] + e) | 0;
  	            H[5] = (H[5] + f) | 0;
  	            H[6] = (H[6] + g) | 0;
  	            H[7] = (H[7] + h) | 0;
  	        },

  	        _doFinalize: function () {
  	            // Shortcuts
  	            var data = this._data;
  	            var dataWords = data.words;

  	            var nBitsTotal = this._nDataBytes * 8;
  	            var nBitsLeft = data.sigBytes * 8;

  	            // Add padding
  	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
  	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
  	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
  	            data.sigBytes = dataWords.length * 4;

  	            // Hash final blocks
  	            this._process();

  	            // Return final computed hash
  	            return this._hash;
  	        },

  	        clone: function () {
  	            var clone = Hasher.clone.call(this);
  	            clone._hash = this._hash.clone();

  	            return clone;
  	        }
  	    });

  	    /**
  	     * Shortcut function to the hasher's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     *
  	     * @return {WordArray} The hash.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hash = CryptoJS.SHA256('message');
  	     *     var hash = CryptoJS.SHA256(wordArray);
  	     */
  	    C.SHA256 = Hasher._createHelper(SHA256);

  	    /**
  	     * Shortcut function to the HMAC's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     * @param {WordArray|string} key The secret key.
  	     *
  	     * @return {WordArray} The HMAC.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hmac = CryptoJS.HmacSHA256(message, key);
  	     */
  	    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
  	}(Math));


  	return CryptoJS.SHA256;

  }));
  });

  var sha224 = createCommonjsModule(function (module, exports) {
  (function (root, factory, undef) {
  	{
  		// CommonJS
  		module.exports = exports = factory(core, sha256);
  	}
  }(commonjsGlobal, function (CryptoJS) {

  	(function () {
  	    // Shortcuts
  	    var C = CryptoJS;
  	    var C_lib = C.lib;
  	    var WordArray = C_lib.WordArray;
  	    var C_algo = C.algo;
  	    var SHA256 = C_algo.SHA256;

  	    /**
  	     * SHA-224 hash algorithm.
  	     */
  	    var SHA224 = C_algo.SHA224 = SHA256.extend({
  	        _doReset: function () {
  	            this._hash = new WordArray.init([
  	                0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
  	                0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
  	            ]);
  	        },

  	        _doFinalize: function () {
  	            var hash = SHA256._doFinalize.call(this);

  	            hash.sigBytes -= 4;

  	            return hash;
  	        }
  	    });

  	    /**
  	     * Shortcut function to the hasher's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     *
  	     * @return {WordArray} The hash.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hash = CryptoJS.SHA224('message');
  	     *     var hash = CryptoJS.SHA224(wordArray);
  	     */
  	    C.SHA224 = SHA256._createHelper(SHA224);

  	    /**
  	     * Shortcut function to the HMAC's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     * @param {WordArray|string} key The secret key.
  	     *
  	     * @return {WordArray} The HMAC.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hmac = CryptoJS.HmacSHA224(message, key);
  	     */
  	    C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
  	}());


  	return CryptoJS.SHA224;

  }));
  });

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

  var userService = {
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

  let components = {};

  function install(Vue, options) {
    if (options && options.components) {
      options.components.forEach(c => Vue.component(c.name, components[c.name]));
    } else {
      Object.keys(components).forEach(key => {
        Vue.component(key, components[key]);
      });
    }
  } // Automatic installation if Vue has been added to the global scope.


  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use({
      install
    });
  }

  var index = {
    install
  };

  exports.default = index;
  exports.graphs = graphs;
  exports.rpc = rpcs;
  exports.status = status;
  exports.user = userService;
  exports.tasks = taskService;
  exports.utils = utils;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
