/** @module rpcs */
// rpc-service.js -- RPC functions for Vue to call
//
// Last update: 2018aug26

import axios from 'axios'
import saveAs from 'file-saver';

// consoleLogCommand() -- Print an RPC call to the browser console.
function consoleLogCommand (type, funcname, args, kwargs) {
  // Don't show any arguments if none are passed in.
  if (!args) { 
    args = ''
  }

  // Don't show any kwargs if none are passed in.
  if (!kwargs) {
    kwargs = ''
  }
  console.log("RPC service call (" + type + "): " + funcname, args, kwargs)
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
  const reader = new FileReader(); 

  // Create a callback for after the load attempt is finished
  reader.addEventListener("loadend", async function() { 
    try { 
      // Try the conversion.
      return await JSON.parse(reader.result) 
    } catch (e) {
      // On failure to convert to JSON, reject the Promise.
      throw Error('Failed to convert blob to JSON');
    }
  })

  // Start the load attempt, trying to read the blob in as text.
  reader.readAsText(theBlob) 
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
  consoleLogCommand("normal", funcname, args, kwargs);

  // Do the RPC processing, returning results as a Promise.
  
  // Send the POST request for the RPC call.
  try {
    const response = await axios.post('/api/rpcs', { 
      funcname: funcname, 
      args: args, 
      kwargs: kwargs
    })
    
    // If there is not error in the POST response.
    if (typeof(response.data.error) === 'undefined') { 
      console.log('RPC succeeded');

      // Signal success with the response.
      return response; 
    }

    //console.log('RPC error: ' + response.data.error);
    console.log(response.data);
    throw Error(response.data.error);

  } catch (error) {
    console.log('RPC error: ' + error);
    console.log(error);
    console.log("herkjhsdflkjahsdflkjhasdkljfhaslkjdfhalksjdhfkajsdhfkajsdhflkjasdhf>>>>>>>>>>>>");
    // If there was an actual response returned from the server...
    if (error.response) { 

      // If we have exception information in the response 
      // (which indicates an exception on the server side)...
      if (typeof(error.response.data.exception) !== 'undefined') {
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

  consoleLogCommand("download", funcname, args, kwargs) // Log the download RPC call.

  return new Promise((resolve, reject) => { // Do the RPC processing, returning results as a Promise.
    axios.post('/api/rpcs', { // Send the POST request for the RPC call.
      funcname: funcname, 
      args: args, 
      kwargs: kwargs
    }, {
      responseType: 'blob'
    })
    .then(response => {
      readJsonFromBlob(response.data)
      .then(responsedata => {
        if (typeof(responsedata.error) != 'undefined') { // If we have error information in the response (which indicates a logical error on the server side)...
          reject(Error(responsedata.error)) // For now, reject with an error message matching the error.
        }
      })
      .catch(error2 => { // An error here indicates we do in fact have a file to download.
        var blob = new Blob([response.data]) // Create a new blob object (containing the file data) from the response.data component.
        var filename = response.headers.filename // Grab the file name from response.headers.
        saveAs(blob, filename) // Bring up the browser dialog allowing the user to save the file or cancel doing so.
        resolve(response) // Signal success with the response.
      })
    })
    .catch(error => {
      if (error.response) { // If there was an actual response returned from the server...
        readJsonFromBlob(error.response.data)
        .then(responsedata => {
          if (typeof(responsedata.exception) !== 'undefined') { // If we have exception information in the response (which indicates an exception on the server side)...
            reject(Error(responsedata.exception)) // For now, reject with an error message matching the exception.
          }
        })
        .catch(error2 => {
          reject(error) // Reject with the error axios got.
        })
      } else {
        reject(error) // Otherwise (no response was delivered), reject with the error axios got.
      }
    })
  })
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
  consoleLogCommand("upload", funcname, args, kwargs);

  // Function for trapping the change event that has the user-selected file.
  const onFileChange = async (e) => { 

    // Pull out the files (should only be 1) that were selected.
    var files = e.target.files || e.dataTransfer.files;

    // If no files were selected, reject the promise.
    if (!files.length){
      throw Error('No file selected');
    }
    // Create a FormData object for holding the file.
    const formData = new FormData();
    // Put the selected file in the formData object with 'uploadfile' key.
    formData.append('uploadfile', files[0]);
    // Add the RPC function name to the form data.
    formData.append('funcname', funcname);
    // Add args and kwargs to the form data.
    formData.append('args', JSON.stringify(args));
    formData.append('kwargs', JSON.stringify(kwargs));

    try {
      const response = await axios.post('/api/rpcs', formData);
      if (typeof(response.data.error) != 'undefined') {
        throw Error(response.data.error);
      }
      return response;
    } catch (error) {
      // If there was an actual response returned from the server...
      if (!error.response) { 
        throw Error(error);
      }
      // If we have exception information in the response (which 
      // indicates an exception on the server side)...
      if (typeof(error.response.data.exception) != 'undefined') {
        // For now, reject with an error message matching the exception.
        throw Error(error.response.data.exception);
      }
    }
  }

  // Create an invisible file input element and set its change callback 
  // to our onFileChange function.
  const inElem = document.createElement('input');
  inElem.setAttribute('type', 'file');
  inElem.setAttribute('accept', fileType);
  inElem.addEventListener('change', onFileChange);
  // Manually click the button to open the file dialog.
  inElem.click();
}

export default {
  rpc,
  download,
  upload
}
