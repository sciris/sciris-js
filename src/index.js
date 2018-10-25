import status from './libs/status-service.js';
import graphs from './libs/graphs.js';
import rpc from './libs/rpc-service.js';
import tasks from './libs/task-service.js';
import user from './libs/user-service.js';
import utils from './libs/utils.js';
import { EventBus } from './eventbus.js';

export default {
  graphs,
  rpc,
  status,
  user,
  tasks,
  utils,
  eventbus
}
