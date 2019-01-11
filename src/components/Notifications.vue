<!--
Definition of a Paper notification, used via this.$notifications.notify()

Last updated: 2018-07-11
-->

<template>
  <div class="notifications">

    <transition-group 
      name="list" 
      @on-close="removeNotification">

      <notification 
        v-for="(notification,index) in notifications" 
        :message="notification.message" 
        :icon="notification.icon" 
        :type="notification.type" 
        :vertical-align="notification.verticalAlign" 
        :horizontal-align="notification.horizontalAlign" 
        :timeout="notification.timeout" 
        :timestamp="notification.timestamp">
      </notification>

    </transition-group> 

  </div>
</template>

<script>
import Notification from './Notification.vue'

export default {
  components: {
    Notification
  },
  data () {
    return {
      notifications: this.$notifications.state
    }
  },
  methods: {
    removeNotification (timestamp) {
      this.$notifications.removeNotification(timestamp)
    },
    
    clearAllNotifications () {
      this.$notifications.clear()
    }
  }
}
</script>

<style lang="scss">
@import "../styles/notifications.scss"
</style>
