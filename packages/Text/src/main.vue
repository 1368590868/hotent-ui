<template>
  <!-- 大标题 小标题 文字  -->
  <div v-if="permission != 'n'" class="ht-text" :style="textStyle">
    <slot name="tip"></slot>
    {{ doDecode(textValue) }}
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import { decode, isBase64 } from '@/util/base64'
  export default {
    name: 'HtText',
    mixins: [permission],
    props: {
      textValue: String,
      color: {
        type: String,
        default: '#666',
      },
      fontSize: {
        type: String,
        default: '12px',
      },
      fontWeight: {
        type: String,
        default: '400',
      },
      paddingTop: String,
      paddingBottom: String,
      paddingLeft: String,
      paddingRight: String,
      textAlign: {
        type: String,
        default: 'center',
        validator: (val) => {
          return ['left', 'center', 'right'].indexOf(val) > -1
        },
      },
    },
    computed: {
      textStyle() {
        return {
          color: this.color,
          fontSize: this.fontSize,
          textAlign: this.textAlign,
          fontWeight: this.fontWeight,
          paddingTop: this.paddingTop,
          paddingBottom: this.paddingBottom,
          paddingLeft: this.paddingLeft,
          paddingRight: this.paddingRight,
        }
      },
    },
    methods: {
      doDecode(value) {
        return isBase64(value) ? decode(value) : value
      },
    },
  }
</script>
<style lang="scss" scoped>
  .ht-text {
  }
</style>
