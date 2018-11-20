<template>
  <li class="dropdown" 
    :class="{open:isOpen}" 
    v-click-outside="closeDropDown">

    <a href="javascript:void(0)"
      class="dropdown-toggle btn-rotate" 
      data-toggle="dropdown" 
      :style="style"
      @click="toggleDropDown">

      <slot name="title">
        <i :class="icon"></i>
        <div class="dropdown-title">{{title}}
          <b class="caret"></b>
        </div>
      </slot>

    </a>

    <ul class="dropdown-menu">
      <slot></slot>
    </ul>
  </li>
</template>

<script>
  export default{
    props: {
      title: String,
      icon: String,
      width: {
        type: String,
        default: "170px"
      },
    },
    data () {
      return {
        isOpen: false
      }
    },
    computed: {
      style () {
        return 'width: ' + this.width;
      }
    },
    methods: {
      toggleDropDown () {
        this.isOpen = !this.isOpen
      },
      closeDropDown () {
        this.isOpen = false
      }
    }
  }
</script>

<style lang="scss">
@import "../styles/dropdown.scss"
</style>
