import status from './libs/status-service.js';
import graphs from './libs/graphs.js';
import rpcs from './libs/rpc-service.js';
import tasks from './libs/task-service.js';
import user from './libs/user-service.js';
import utils from './libs/utils.js';
import EventBus from './eventbus.js';
import ScirisVue from './plugins.js';

const rpc = rpcs.rpc;
const download = rpcs.download;
const upload = rpcs.upload;

const succeed = status.succeed;
const fail = status.fail;
const start = status.start;
const notify = status.notify;

const placeholders = graphs.placeholders; 
const clearGraphs = graphs.clearGraphs; 
const makeGraphs = graphs.makeGraphs; 
const scaleFigs = graphs.scaleFigs; 
const showBrowserWindowSize = graphs.showBrowserWindowSize; 
const addListener = graphs.addListener; 
const onMouseUpdate = graphs.onMouseUpdate; 
const createDialogs = graphs.createDialogs; 
const newDialog = graphs.newDialog; 
const findDialog = graphs.findDialog; 
const maximize = graphs.maximize; 
const minimize = graphs.minimize; 
const mpld3 = graphs.mpld3; 
let draw_figure = null;
if (mpld3 !== null){
  draw_figure = mpld3.draw_figure;
} 
const getTaskResultWaiting = tasks.getTaskResultWaiting;
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

const sleep = utils.sleep;

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
