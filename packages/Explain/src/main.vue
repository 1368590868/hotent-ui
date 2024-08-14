<template>
  <!-- 说明控件 -->
  <div v-if="permission != 'n'" class="ht-explain" :style="textStyle">
    <div
      v-if="isLabelShow"
      class="ht-explain_label"
      :style="{ width: labelWidth }"
    >
      <slot name="tip"></slot>
      <span class="label">{{ $t('ht.explain.label') }}:</span>
    </div>
    <div class="ht-explain_content" v-html="compiledTextValue"></div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import utils from '@/utils.js'
  import { decode } from '@/util/base64'
  import permission from '@/mixins/permission.js'
  export default {
    name: 'HtExplain',
    mixins: [permission],
    props: {
      textValue: String,
      marginTop: String,
      marginBottom: String,
      isLabelShow: {
        type: Boolean,
        default: false,
      },
      labelWidth: {
        type: String,
        default: '120px',
      },
      fontColor: {
        type: String,
        default: '#333333',
      },
    },
    data() {
      return {
        formInstance: null,
        compiledTextValue: null,
      }
    },
    computed: {
      textStyle() {
        return {
          marginTop: this.marginTop,
          marginBottom: this.marginBottom,
          color: this.fontColor,
        }
      },
    },
    watch: {
      textValue: {
        handler: function(newVal) {
          this.loadCompiledTextValue(newVal)
        },
        immediate: true,
      },
      formInstance: function(newVal, oldVal) {
        if (!oldVal && newVal && newVal.$on) {
          newVal.$off('updateData', this.loadCompiledTextValue)
          newVal.$on('updateData', this.loadCompiledTextValue)
        }
      },
    },
    beforeDestroy() {
      this.formInstance &&
        this.formInstance.$off &&
        this.formInstance.$off('updateData', this.loadCompiledTextValue)
    },
    methods: {
      loadCompiledTextValue() {
        if (!this.textValue) {
          return
        }
        this.$nextTick(() => {
          this.getTextValue(decode(this.textValue)).then((result) => {
            this.compiledTextValue = result
          })
        })
      },
      getTextValue(val) {
        if (this.formInstance == null) {
          this.formInstance = utils.getOnlineFormInstance(this)
        }
        const instance = this.formInstance || this
        return new Promise((resolve) => {
          const tempComponent = Vue.extend({
            data() {
              return {
                data: instance.data,
              }
            },
            template: `<div>${val}</div>`,
          })
          const component = new tempComponent().$mount()
          component.$nextTick(() => {
            resolve(component.$el.innerHTML)
          })
        })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .ht-explain {
    display: flex;
    align-items: baseline;
    .ht-explain_label {
      text-align: right;
      font-size: 14px;
      .label {
        padding-right: 12px;
      }
    }
    .ht-explain_content {
      flex: 1;
      ::v-deep p {
        margin: 0;
      }
    }
  }
</style>
