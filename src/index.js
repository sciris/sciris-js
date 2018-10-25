import graphs from './libs/graphs.js';
import rpc from './libs/rpc-service.js';
import status from './libs/status-service.js';
import tasks from './libs/task-service.js';
import user from './libs/user-service.js';
import utils from './libs/utils.js';

let components = {
}

function install(Vue, options) {
  if (options && options.components) {
    options.components.forEach(c => Vue.component(c.name, components[c.name]))
  } else {
    Object.keys(components).forEach((key) => {
      Vue.component(key, components[key])
    });
  }
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({install})
}

export default {
  install,
}

export {
  graphs,
  rpc,
  status,
  user,
  tasks,
  utils
}
