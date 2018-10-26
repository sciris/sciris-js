import Vue from 'vue';

const EVENT_STATUS_START = 'status:start' 
const EVENT_STATUS_UPDATE = 'status:update' 
const EVENT_STATUS_SUCCEED = 'status:success' 
const EVENT_STATUS_FAIL = 'status:fail' 

const events = {
  EVENT_STATUS_START,
  EVENT_STATUS_UPDATE,
  EVENT_STATUS_SUCCEED,
  EVENT_STATUS_FAIL
}

const EventBus = new Vue();

EventBus.$on(events.EVENT_STATUS_START, (vm) => {
  vm.$spinner.start();
});

EventBus.$on(events.EVENT_STATUS_UPDATE, (vm, progress) => {
  vm.$Progress.set(progress);
});

EventBus.$on(events.EVENT_STATUS_SUCCEED, (vm, notif) => {
  vm.$spinner.stop();
  vm.$Progress.finish();
  if (notif)
    vm.$notifications.notify(notif);
});

EventBus.$on(events.EVENT_STATUS_FAIL, (vm, notif) => {
  vm.$spinner.stop();
  vm.$Progress.fail();
  if (notif)
    vm.$notifications.notify(notif);
}); 

export default EventBus; 
export {
  events
}
