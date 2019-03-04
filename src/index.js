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

const loginCall = user.loginCall; 
const logoutCall = user.logoutCall;
const getCurrentUserInfo = user.getCurrentUserInfo;
const registerUser = user.registerUser;
const changeUserInfo = user.changeUserInfo;
const changeUserPassword = user.changeUserPassword;
const adminGetUserInfo = user.adminGetUserInfo;
const deleteUser = user.deleteUser;
const activateUserAccount = user.activateUserAccount;
const deactivateUserAccount = user.deactivateUserAccount;
const grantUserAdminRights = user.grantUserAdminRights;
const revokeUserAdminRights = user.revokeUserAdminRights;
const resetUserPassword = user.resetUserPassword; 
const getUserInfo = user.getUserInfo;
const currentUser = user.currentUser;
const checkLoggedIn = user.checkLoggedIn;
const checkAdminLoggedIn = user.checkAdminLoggedIn;
const logOut = user.logOut; 

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
  logOut,

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
