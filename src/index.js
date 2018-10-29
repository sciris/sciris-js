import status from './libs/status-service.js';
import graphs from './libs/graphs.js';
import rpc from './libs/rpc-service.js';
import tasks from './libs/task-service.js';
import user from './libs/user-service.js';
import utils from './libs/utils.js';
import EventBus from './eventbus.js';
import ScirisVue from './plugins.js';
import themify from './libs/themify/themify-icons.css';

const sciris = {
  graphs,
  rpc,
  status,
  user,
  tasks,
  utils,
  ScirisVue, 
  EventBus, 
}

export default sciris
