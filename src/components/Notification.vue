<template>
  <div
    data-notify="container"
    class="alert open alert-with-icon"
    role="alert"
    :class="[verticalAlign, horizontalAlign, alertType]"
    :style="customPosition"
    data-notify-position="top-center">

    <div class="notification-box">
      <div>
        <span class="alert-icon" data-notify="message" :class="icon"></span>
      </div>
      <div class="message-box" >
        <div class="message" data-notify="message" v-html="message"></div>
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
        default: 'center'
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
//        console.log('Trying to close: ', this.timestamp)
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
  $bg-success: rgba(0, 136, 0, 1.0);
  $bg-info: #7CE4FE;
  $bg-warning: rgba(226, 151, 34, 1.0);
  $bg-danger: #FF8F5E;

  $success-states-color: #229863;
  $info-states-color: #3091B2;
  $warning-states-color: #BB992F;
  $danger-states-color: #B33C12;

  $border-radius-base: 2px;

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .3s
  }

  .fade-enter,
  .fade-leave-to
  /* .fade-leave-active in <2.1.8 */

  {
    opacity: 0
  }

  .close-button,
  .close-button:hover {
    background: none;
    line-height: 0em;
    padding: 5px 5px;
    margin-left: 10px;
    border-radius: 3px;
  }
  .close-button:hover {
    background: #ffffff63;
    color: #737373;
  }

  .alert {
    border: 0;
    border-radius: 0;
    color: #FFFFFF;
    padding: 20px 15px;
    font-size: 14px;
    z-index: 100;
    display: inline-block;
    position: fixed;
    transition: all 0.5s ease-in-out;

    .container & {
      border-radius: 4px;
    }

    &.center {
      left: 0px;
      right: 0px;
      margin: 0 auto;
    }
    &.left {
      left: 20px;
    }
    &.right {
      right: 20px;
    }
    .container & {
      border-radius: 0px;
    }
    .navbar & {
      border-radius: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 85px;
      width: 100%;
      z-index: 3;
    }
    .navbar:not(.navbar-transparent) & {
      top: 70px;
    }

    .alert-icon {
      font-size: 30px;
      margin-right: 5px;
    }

    .close~span {
      display: inline-block;
      max-width: 89%;
    }

    &[data-notify="container"] {
      /*max-width: 400px;*/
      padding: 0; 
      border-radius: $border-radius-base;
    }

    &.alert-with-icon {
    }

    span[data-notify="icon"] {
      font-size: 30px;
      display: block;
      left: 15px;
      position: absolute;
      top: 50%;
      margin-top: -20px;
    }
  }

  .alert-info {
    background-color: $bg-info;
    color: $info-states-color;
  }

  .alert-success {
    background-color: $bg-success;
    color: #fff; // $success-states-color;
  }

  .alert-warning {
    background-color: $bg-warning;
    color: #fff; // $warning-states-color;
  }

  .alert-danger {
    background-color: $bg-danger;
    color: $danger-states-color;
  }

  .message-box {
    font-size: 15px; 
    align-content: center;
    max-width: 400px; 
    min-width: 150px;
    padding-left: 10px;
    flex-grow: 1;
  }

  .message-box .message {
    line-height: 1.5em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
  }

  .notification-box {
    display: flex; 
    justify-content: flex-start;
    padding: 10px 15px;
  }

  .notification-box > div {
    align-self: center;
  }

  .btn__trans {
    font-size: 18px;
    color: rgb(255, 255, 255);
    background-color: transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
    background-image: none;
    outline: none;
  }


</style>
