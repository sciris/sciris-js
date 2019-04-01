/** @module task */

// task-service.js -- task queuing functions for Vue to call
//
// Last update: 8/18/18 (gchadder3)

import rpcs from './rpc-service.js'
import utils from './utils.js'

/**
 * getTaskResultWaiting() -- given a task_id string, a waiting time (in 
 * sec.), and a remote task function name and its args, try to launch 
 * the task, then wait for the waiting time, then try to get the 
 * result.
 *
 * @function
 * @async
 * @param {number} task_id - id of the task to keep track of
 * @param {number} waitingtime - time to wait in seconds before checking the status of the task 
 * @param {string} func_name - name of the remote task function 
 * @param {string[]} args - Python style args to pass to the function 
 * @param {Object} kwargs - Python style kwatgs to pass to the function
 * @returns {Promise}
 */
async function getTaskResultWaiting(task_id, waitingtime, func_name, args, kwargs) {
  if (!args) { // Set the arguments to an empty list if none are passed in.
    args = [];
  }

  try {
    const task = await rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]);
    await utils.sleep(waitingtime * 1000);
    const result = await rpcs.rpc('get_task_result', [task_id]);

    // Clean up the task_id task.
    await rpcs.rpc('delete_task', [task_id]);

    return result;

  } catch (error){
    // While we might want to clean up the task as below, the Celery
    // worker is likely to "resurrect" the task if it actually is
    // running the task to completion.
    // Clean up the task_id task.
    // rpcCall('delete_task', [task_id])
    throw new Error(error);
  }
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
  if (!args) { // Set the arguments to an empty list if none are passed in.
    args = []
  }
  await rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]);

  // Do the whole sequence of polling steps, starting with the first (recursive) call.
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
    if ((elapsedtime > timeout) && (timeout > 0)) { 
      throw new Error('Task polling timed out');
    } 
    
    // Sleep timeout seconds.
    await utils.sleep(pollinterval * 1000); 

    // Check the status of the task.
    const task = await rpcs.rpc('check_task', [task_id]); 

    // There was an issue with executing the taks
    if (task.data.task.status == 'error') { 
      throw new Error(task.data.task.errorText);
    }

    // If the task is completed...
    if (task.data.task.status == 'completed') {
      const result = await rpcs.rpc('get_task_result', [task_id]);
      // Clean up the task_id task.
      await rpcs.rpc('delete_task', [task_id]);
      return result;
    }

    // Task is still pending processing, do another poll step, passing in an 
    // incremented elapsed time.
    return await pollStep(task_id, timeout, pollinterval, elapsedtime + pollinterval);
}

export default {
  getTaskResultWaiting,
  getTaskResultPolling
}
