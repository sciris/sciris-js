<!--
PopupSpinner component

Based on MoonLoader.vue from vue-spinner GitHub project:
https://github.com/greyby/vue-spinner/blob/master/src/MoonLoader.vue 

Depends also on vue-js-modal GitHub project:
https://github.com/euvl/vue-js-modal

Last update: 2018-08-13
-->

<template>
  <modal 
    style="opacity: 1.0" 
    name="popup-spinner"
    :height="modalHeight"
    :width="modalWidth"
    :click-to-close="false" 
    @before-open="beforeOpen" 
    @before-close="beforeClose">

   <div class="overlay-box"> 
     <div class="loader-box">
       <fulfilling-bouncing-circle-spinner 
        :color="color" 
        :size="spinnerSize"
        :animation-duration="2000"
      ></fulfilling-bouncing-circle-spinner>
     </div>
      
      <div v-if="title !== ''" :style="titleStyle">
        {{ title }}
      </div>
      
      <div v-if="hasCancelButton" style="padding: 13px">
        <button @click="cancel" :style="cancelButtonStyle">Cancel</button>
      </div>    
    </div>
  </modal>
</template>

<script>
  import EventBus from '../eventbus.js';
  import { FulfillingBouncingCircleSpinner } from 'epic-spinners'

  
  export default {
    name: 'PopupSpinner',

    components: {
      FulfillingBouncingCircleSpinner 
    },
    
    props: {
      loading: {
        type: Boolean,
        default: true
      },
     title: {
        type: String,
        default: ''      
      },
      hasCancelButton: {
        type: Boolean,
        default: false      
      }, 
      color: {
        type: String,
        default: '#0000ff'
      },
      size: {
        type: String,
        default: '50px'
      },
      margin: {
        type: String,
        default: '2px'
      },
      padding: {
        type: String,
        default: '15px'      
      },
      radius: {
        type: String,
        default: '100%'
      }
    },
    
    data() {
      return {
        titleStyle: {
          textAlign: 'center'
        },
        cancelButtonStyle: {
          padding: '2px'
        },          
        opened: false
      }
    },
    
    beforeMount() {
      // Create listener for start event.
      EventBus.$on('spinner:start', () => {
        this.show()
      })
      
      // Create listener for stop event.
      EventBus.$on('spinner:stop', () => {
        this.hide()
      })      
    },
    
    computed: {
      spinnerSize(){
        return parseFloat(this.size) - 25; 
      },
      modalHeight() {
        // Start with the height of the spinner wrapper.
        let fullHeight = parseFloat(this.size) + 2 * parseFloat(this.padding); 
        
        // If there is a title there, add space for the text.
        if (this.title !== '') {
          fullHeight = fullHeight + 20 + parseFloat(this.padding)        
        }
        
        // If there is a cancel button there, add space for it.
        if (this.hasCancelButton) {
          fullHeight = fullHeight + 20 + parseFloat(this.padding)
        }
        
        return fullHeight + 'px'
      },
      
      modalWidth() {
        return parseFloat(this.size) + 2 * parseFloat(this.padding) + 'px'
      },
    }, 
    
    methods: {
      beforeOpen() {
        window.addEventListener('keyup', this.onKey)
        this.opened = true
      }, 
      
      beforeClose() {
        window.removeEventListener('keyup', this.onKey)
        this.opened = false
      }, 
      
      onKey(event) {
        if (event.keyCode == 27) {
          console.log('Exited spinner through Esc key')
          this.cancel()
        }
      }, 
      
      cancel() {
        this.$emit('spinner-cancel')
        this.hide()      
      },
      
      show() {
        this.$modal.show('popup-spinner') // Bring up the spinner modal.
      },
      
      hide() {
        this.$modal.hide('popup-spinner') // Dispel the spinner modal.
      }
    }

  }
</script>

<style lang="scss" scoped>
@import "../styles/popupspinner.scss"
</style>
