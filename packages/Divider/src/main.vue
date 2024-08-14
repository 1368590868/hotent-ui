<template>
  <div
    :class="['el-divider', `el-divider--${direction}`]"
    :style="'background-color:' + color"
  >
    <div
      v-if="$slots.default && direction !== 'vertical'"
      :class="['el-divider__text', `is-${contentPosition}`]"
    >
      <slot></slot>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'HtDivider',
    props: {
      direction: {
        type: String,
        default: 'horizontal',
        validator: function(value) {
          return ['horizontal', 'vertical'].indexOf(value) !== -1
        },
      },
      contentPosition: {
        type: String,
        default: 'center',
        validator: function(value) {
          return ['left', 'right', 'center'].indexOf(value) !== -1
        },
      },
      color: {
        type: String,
        default: '#dcdfe6',
      },
    },
  }
</script>
