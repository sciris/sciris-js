<template>
  <div
    role="alert"
    class="alert open alert-with-icon"
    data-notify="container"
    data-notify-position="top-center"
    :class="[verticalAlign, horizontalAlign, alertType]"
    :style="customPosition">

    <div class="notification-box">
      <div>
        <span 
          class="alert-icon" 
          data-notify="message" 
          :class="icon">
        </span>
      </div>

      <div class="message-box" >
        <div 
          class="message" 
          data-notify="message" 
          v-html="message">
        </div>
      </div>

      <div>
        <button
          class="btn__trans close-button"
          aria-hidden="true"
          data-notify="dismiss"
          @click="close">
          <i class="ti-close"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'notification',
    props: {
      message: String,
      icon: {
        type: String,
        default: 'ti-info-alt'
      },
      verticalAlign: {
        type: String,
        default: 'top'
      },
      horizontalAlign: {
        type: String,
        default: 'right'
      },
      type: {
        type: String,
        default: 'info'
      },
      timeout: {
        type: Number,
        default: 2000
      },
      timestamp: {
        type: Date,
        default: () => new Date()
      },      
    },
    data () {
      return {}
    },
    computed: {
      hasIcon () {
        return this.icon && this.icon.length > 0
      },
      alertType () {
        return `alert-${this.type}`
      },
      customPosition () {
        let initialMargin = 20
        let alertHeight = 60
        let sameAlertsCount = this.$notifications.state.filter((alert) => {
          return alert.horizontalAlign === this.horizontalAlign && alert.verticalAlign === this.verticalAlign
        }).length
        let pixels = (sameAlertsCount - 1) * alertHeight + initialMargin
        let styles = {}
        if (this.verticalAlign === 'top') {
          styles.top = `${pixels}px`
        } else {
          styles.bottom = `${pixels}px`
        }
        return styles
      }
    },
    methods: {
      close () {
        this.$parent.$emit('on-close', this.timestamp)  
      }
    },
    mounted () {
      if (this.timeout) {
        setTimeout(this.close, this.timeout)
      }
    }
  }

</script>

<style> 
@import "https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css";
</style>

<style lang="scss" scoped>
@import "../styles/notification.scss"
</style>
