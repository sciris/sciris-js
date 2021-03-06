import VueProgressBar from 'vue-progressbar';
import VModal from 'vue-js-modal';
import { directive as vClickOutside } from 'vue-clickaway';
import DialogDrag from 'vue-dialog-drag';

import PopupSpinner from './components/PopupSpinner.vue';
import Notifications from './components/Notifications.vue';
import Dropdown from './components/Dropdown.vue';

import EventBus from './eventbus.js';
import NotificationStore from './notifications.js';

function setupSpinner(Vue){
  // Create the global $spinner functions the user can call 
  // from inside any component.
  Vue.prototype.$spinner = {
    start() {
      // Send a start event to the bus.
      EventBus.$emit('spinner:start')
    }, 
    stop() {
      // Send a stop event to the bus.
      EventBus.$emit('spinner:stop')
    }
  }
};

function setupNotifications(Vue){
  Object.defineProperty(Vue.prototype, '$notifications', {
    get () {
      return NotificationStore
    }
  });
};

function setupProgressBar(Vue, options){
  Vue.use(VueProgressBar, options)
};

function install(Vue, options = {}) {
  Vue.use(VModal);
  if (!options.notifications || !options.notifications.disabled){
    setupNotifications(Vue);
    Vue.component('Notifications', Notifications);
  }
  if ((
    !options.spinner || !options.spinner.disabled
  ) && !this.spinnerInstalled){
    this.spinnerInstalled = true;
    setupSpinner(Vue);
    Vue.component('PopupSpinner', PopupSpinner);
  }
  if (!options.progressbar || !options.progressbar.disabled){
    var progressbarOptions = (options.progressbar) ? options.progressbar.options : {};
    setupProgressBar(Vue, progressbarOptions)
  }
  Vue.component('Dropdown', Dropdown);
  Vue.component('DialogDrag', DialogDrag);

  Vue.directive('click-outside', vClickOutside)
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({install})
}

export default {
  install
}

export {
  Dropdown,
  PopupSpinner,
  Notifications
}
