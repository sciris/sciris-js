/** @module user */

// Lower level user functions that call RPC service functions

import rpcs from './rpc-service.js'
import sha224 from 'crypto-js/sha224';

var state = {
  currentUser: {}
};

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
async function loginCall(username, password) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  const hashPassword = sha224(password).toString();
  const args = [
    username, 
    hashPassword
  ];
  
  return await rpcs.rpc('user_login', args);
}

/**
 * Call rpc() for performing a logout. 
 * The use session is ended.
 *
 * @function
 * @async
 * @returns {Promise}
 */
async function logoutCall() {
  return await rpcs.rpc('user_logout');
}

/**
 * Call rpc() for reading the currently logged in user.
 *
 * @function
 * @async
 * @returns {Promise}
 */
async function getCurrentUserInfo() {
  return await rpcs.rpc('get_current_user_info');
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
async function registerUser(username, password, displayname, email) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  const hashPassword = sha224(password).toString();
  const args = [
    username, 
    hashPassword, 
    displayname, email
  ];
  return await rpcs.rpc('user_register', args);
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
async function changeUserInfo(username, password, displayname, email) {
  // Get a hex version of a hashed password using the SHA224 algorithm.
  const hashPassword = sha224(password).toString();
  const args = [
    username, 
    hashPassword, 
    displayname, 
    email
  ];
  
  return await rpcs.rpc('user_change_info', args); 
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
async function changeUserPassword(oldpassword, newpassword) {
  // Get a hex version of the hashed passwords using the SHA224 algorithm.
  const hashOldPassword = sha224(oldpassword).toString();
  const hashNewPassword = sha224(newpassword).toString();
  const args = [
    hashOldPassword, 
    hashNewPassword
  ];
  
  return await rpcs.rpc('user_change_password', args); 
}

/**
 * Allow a logged in user who is an admin to retreive information about a user 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */
async function adminGetUserInfo(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_get_user_info', args);
}

/**
 * Allow a logged in user who is an admin to delete a user 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */
async function deleteUser(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_delete_user', args);
}

/**
 * Allow a logged in user who is an admin to activate a user's account 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */
async function activateUserAccount(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_activate_account', args);
}

/**
 * Allow a logged in user who is an admin to deactivate a user's account 
 *
 * @function
 * @async
 * @param {string} username - The username of the user 
 * @returns {Promise}
 */
async function deactivateUserAccount(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_deactivate_account', args); 
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
async function grantUserAdminRights(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_grant_admin', args);
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
async function revokeUserAdminRights(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_revoke_admin', args);
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
async function resetUserPassword(username) {
  const args = [
    username
  ];
  return await rpcs.rpc('admin_reset_password', args);   
}

// Higher level user functions that call the lower level ones above

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
    store.commit('newUser', response.data.user)
  } catch (error) {
    // An error probably means the user is not logged in.
    // Set the username to {}.  
    store.commit('newUser', {})
  }
}

/**
 * Check if there is a user currently logged in
 *
 * @function
 * @returns {bool}
 */
function checkLoggedIn() {
  if (this.currentUser.displayname === undefined)
    return false
  else
    return true
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
    return this.currentUser.admin
  }
}

export default {
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
}
