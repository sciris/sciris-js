import status from './libs/status-service.js';
import graphs from './libs/graphs.js';
import rpcs from './libs/rpc-service.js';
import tasks from './libs/task-service.js';
import user from './libs/user-service.js';
import utils from './libs/utils.js';
import EventBus from './eventbus.js';
import ScirisVue from './plugins.js';

/**
 * @function
 * @async
 * @see {@link module:rpcs~rpc|rpcs.rpc} 
 */
const rpc = rpcs.rpc;

/**
 * @function
 * @async
 * @see {@link module:rpcs~download|rpcs.download} 
 */
const download = rpcs.download;

/**
 * @function
 * @async
 * @see {@link module:rpcs~upload|rpcs.upload} 
 */
const upload = rpcs.upload;

/**
 * @function
 * @async
 * @see {@link module:status~succeed|status.succeed} 
 */
const succeed = status.succeed;

/**
 * @function
 * @async
 * @see {@link module:status~fail|status.fail} 
 */
const fail = status.fail;

/**
 * @function
 * @async
 * @see {@link module:status~start|status.start} 
 */
const start = status.start;

/**
 * @function
 * @async
 * @see {@link module:status~notify|status.notify} 
 */
const notify = status.notify;

/**
 * @function
 * @async
 * @see {@link module:graphs~placeholders|graphs.placeholders} 
 */
const placeholders = graphs.placeholders; 

/**
 * @function
 * @async
 * @see {@link module:graphs~clearGraphs|graphs.clearGraphs} 
 */
const clearGraphs = graphs.clearGraphs; 

/**
 * @function
 * @async
 * @see {@link module:graphs~makeGraphs|graphs.makeGraphs} 
 */
const makeGraphs = graphs.makeGraphs; 

/**
 * @function
 * @async
 * @see {@link module:graphs~scaleFigs|graphs.scaleFigs} 
 */
const scaleFigs = graphs.scaleFigs; 

/**
 * @function
 * @async
 * @see {@link module:graphs~showBrowserWindowSize|graphs.showBrowserWindowSize} 
 */
const showBrowserWindowSize = graphs.showBrowserWindowSize; 

/**
 * @function
 * @async
 * @see {@link module:graphs~addListener|graphs.addListener} 
 */
const addListener = graphs.addListener; 

/**
 * @function
 * @async
 * @see {@link module:graphs~onMouseUpdate|graphs.onMouseUpdate} 
 */
const onMouseUpdate = graphs.onMouseUpdate; 

/**
 * @function
 * @async
 * @see {@link module:graphs~createDialogs|graphs.createDialogs} 
 */
const createDialogs = graphs.createDialogs; 

/**
 * @function
 * @async
 * @see {@link module:graphs~newDialog|graphs.newDialog} 
 */
const newDialog = graphs.newDialog; 

/**
 * @function
 * @async
 * @see {@link module:graphs~findDialog|graphs.findDialog} 
 */
const findDialog = graphs.findDialog; 

/**
 * @function
 * @async
 * @see {@link module:graphs~maximize|graphs.maximize} 
 */
const maximize = graphs.maximize; 

/**
 * @function
 * @async
 * @see {@link module:graphs~minimize|graphs.minimize} 
 */
const minimize = graphs.minimize; 

/**
 * Access to the mpld3 instance, only if d3 is included in the global scope
 *
 * @function
 * @async
 * @see {@link module:graphs~mpld3|graphs.mpld3} 
 */
const mpld3 = graphs.mpld3; 
let draw_figure = null;
if (mpld3 !== null){
  draw_figure = mpld3.draw_figure;
} 

/**
 * @function
 * @async
 * @see {@link module:tasks~getTaskResultWaiting|tasks.getTaskResultWaiting} 
 */
const getTaskResultWaiting = tasks.getTaskResultWaiting;

/**
 * @function
 * @async
 * @see {@link module:tasks~getTaskResultPolling|tasks.getTaskResultPolling} 
 */
const getTaskResultPolling = tasks.getTaskResultPolling;

/**
 * @function
 * @async
 * @see {@link module:user~loginCall|user.loginCall} 
 */
const loginCall = user.loginCall; 

/**
 * @function
 * @async
 * @see {@link module:user~logoutCall|user.logoutCall}
 */
const logoutCall = user.logoutCall;

/**
 * @function
 * @async
 * @see {@link module:user~getCurrentUserInfo|user.getCurrentUserInfo} 
 */
const getCurrentUserInfo = user.getCurrentUserInfo;

/**
 * @function
 * @async
 * @see {@link module:user~registerUser|user.registerUser} 
 */
const registerUser = user.registerUser;

/**
 * @function
 * @async
 * @see {@link module:user~changeUserInfo|user.changeUserInfo} 
 */
const changeUserInfo = user.changeUserInfo;

/**
 * @function
 * @async
 * @see {@link module:user~changeUserPassword|user.changeUserPassword} 
 */
const changeUserPassword = user.changeUserPassword;

/**
 * @function
 * @async
 * @see {@link module:user~adminGetUserInfo|user.adminGetUserInfo} 
 */
const adminGetUserInfo = user.adminGetUserInfo;

/**
 * @function
 * @async
 * @see {@link module:user~deleteUser|user.deleteUser} 
 */
const deleteUser = user.deleteUser;

/**
 * @function
 * @async
 * @see {@link module:user~activateUserAccount|user.activateUserAccount} 
 */
const activateUserAccount = user.activateUserAccount;

/**
 * @function
 * @async
 * @see {@link module:user~deactivateUserAccount|user.deactivateUserAccount} 
 */
const deactivateUserAccount = user.deactivateUserAccount;

/**
 * @function
 * @async
 * @see {@link module:user~grantUserAdminRights|user.grantUserAdminRights} 
 */
const grantUserAdminRights = user.grantUserAdminRights;

/**
 * @function
 * @async
 * @see {@link module:user~revokeUserAdminRights|user.revokeUserAdminRights} 
 */
const revokeUserAdminRights = user.revokeUserAdminRights;

/**
 * @function
 * @async
 * @see {@link module:user~resetUserPassword|user.resetUserPassword} 
 */
const resetUserPassword = user.resetUserPassword; 

/**
 * @function
 * @async
 * @see {@link module:user~getUserInfo|user.getUserInfo} 
 */
const getUserInfo = user.getUserInfo;

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
const checkLoggedIn = user.checkLoggedIn;

/**
 * @function
 * @async
 * @see {@link module:user~checkAdminLoggedIn|user.checkAdminLoggedIn} 
 */
const checkAdminLoggedIn = user.checkAdminLoggedIn;

/**
 * @function
 * @async
 * @see {@link module:utils~sleep|utils.sleep} 
 */
const sleep = utils.sleep;

/**
 * @function
 * @async
 * @see {@link module:utils~getUniqueName|utils.getUniqueName} 
 */
const getUniqueName = utils.getUniqueName;

const sciris = {
  // rpc-service.js
  rpc,
  download,
  upload,

  // graphs.js
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
  mpld3,
  draw_figure, 

  // status-service.js
  succeed,
  fail,
  start,
  notify,

  // task-service.js
  getTaskResultWaiting,
  getTaskResultPolling,

  // user-service.js
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

  // utils.js
  sleep,
  getUniqueName,

  rpcs,
  graphs,
  status,
  user,
  tasks,
  utils,
  ScirisVue, 
  EventBus, 
}

export default sciris
export { 
  sciris
}
