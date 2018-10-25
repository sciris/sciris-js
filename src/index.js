import status from './libs/status-service.js';
import graphs from './libs/graphs.js';
import rpc from './libs/rpc-service.js';
import tasks from './libs/task-service.js';
import user from './libs/user-service.js';
import utils from './libs/utils.js';

import NotificationStore from './notifications.js';

import Notifications from './components/Notifications.vue';
import PopupSpinner from './components/PopupSpinner.vue';

import { EventBus } from './eventbus.js';

function install(Vue) {
  Object.defineProperty(Vue.prototype, '$notifications', {
    get () {
      return NotificationStore
    }
  });
  // Make sure that plugin can be installed only once
  if (!this.spinnerInstalled) {
    this.spinnerInstalled = true

    // Create the global $spinner functions the user can call 
    // from inside any component.
    Vue.prototype.$spinner = {
      start() {
        // Send a start event to the bus.
        EventBus.$emit('start')
      }, 
      stop() {
        // Send a stop event to the bus.
        EventBus.$emit('stop')
      }
    }
  };
  Vue.component('Notifications', Notifications);
  Vue.component('PopupSpinner', PopupSpinner);
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({install})
}

export default {
  install
}

export {
  graphs,
  rpc,
  status,
  user,
  tasks,
  utils,
  PopupSpinner,
  Notifications
}
