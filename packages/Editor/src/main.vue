<template>
  <div
    v-show="permission_sub != 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
      disabled ? 'is-disabled' : '',
    ]"
    :style="styleEditor"
  >
    <input
      v-if="inputWriteable && !hasTextValue"
      v-model="value"
      v-validate="inputValidate"
      :name="inputName"
      type="hidden"
    />
    <div
      v-if="inputWriteable && !hasTextValue && type !== 'property-text'"
      :id="editorId"
    ></div>
    <div
      v-else
      :style="showBorder ? textDivStyle : {}"
      class="w-e-text"
      :class="{ 'empty-div': type === 'property-text' && !hasTextValue }"
      v-html="inputVal"
    ></div>
    <ht-field-tail :field-name="inputName" :readonly="false" />
  </div>
</template>
<script>
  import Vue from 'vue'
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import { encode, decode } from '@/util/base64'

  export default {
    name: 'HtEditor',
    mixins: [inputName, permission, form],
    props: {
      value: String,
      textValue: String,
      showBorder: {
        type: Boolean,
        default: true,
      },
      borderColor: {
        type: String,
        default: '#ccc',
      },
      borderWidth: {
        type: Number,
        default: 1,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      config: {
        type: Object,
        default: () => {
          return {}
        },
      },
      encode: {
        type: Boolean,
        default: false,
      },
      noToolbar: {
        type: String,
        default: 'false',
      },
      initialFrameWidth: {
        type: String,
        default: '',
      },
      type: {
        type: String,
        default: '',
      },
      initialFrameHeight: {
        type: String,
        default: '300',
      },
      customMenus: {
        type: Array,
        default: () => {
          return [
            'head',
            'bold',
            'fontSize',
            'fontName',
            'italic',
            'underline',
            'strikeThrough',
            'indent',
            'lineHeight',
            'foreColor',
            'backColor',
            'link',
            'list',
            'todo',
            'justify',
            'quote',
            'emoticon',
            'image',
            'video',
            'table',
            'code',
            'splitLine',
            'undo',
            'redo',
          ]
        },
      },
    },
    data() {
      return {
        editor: null,
        editorId: `editor_${utils.getName()}`,
        compiledTextValue: null,
        formInstance: null,
      }
    },
    computed: {
      hasTextValue() {
        return this.textValue != null && this.textValue != undefined
      },
      inputVal() {
        return this.hasTextValue
          ? this.compiledTextValue
          : this.getValue(this.value)
      },
      textDivStyle() {
        return {
          border: `${this.borderWidth}px solid ${decode(this.borderColor)}`,
          padding: '0 10px',
        }
      },
      styleEditor() {
        let style = {}
        if (this.initialFrameWidth) {
          style = { width: this.initialFrameWidth + 'px' }
        }
        return style
      },
    },
    watch: {
      value: function(newVal) {
        if (this.editor && newVal) {
          let text = this.editor.txt.html()
          if (text !== newVal && encode(text) !== newVal) {
            this.editor.txt.html(this.getValue(newVal))
          }
        }
      },
      textValue: {
        handler: function(newVal) {
          this.loadCompiledTextValue(newVal)
        },
        immediate: true,
      },
      permission_sub: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 现在是无权限，需要销毁
          newVal == 'n' && this.destroyEditor()
        }
      },
      inputWriteable: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 可编辑，渲染
          if (newVal && !this.hasTextValue) {
            this.initEditor()
          }
          // 不可编辑，销毁
          if (!newVal || this.hasTextValue) {
            this.destroyEditor()
          }
        }
      },
      formInstance: function(newVal, oldVal) {
        if (!oldVal && newVal && newVal.$on) {
          newVal.$off('updateData', this.loadCompiledTextValue)
          newVal.$on('updateData', this.loadCompiledTextValue)
        }
      },
    },
    mounted() {
      this.initEditor()
    },
    beforeDestroy() {
      this.formInstance &&
        this.formInstance.$off &&
        this.formInstance.$off('updateData', this.loadCompiledTextValue)
      this.destroyEditor()
    },
    methods: {
      destroyEditor() {
        if (this.editor) {
          this.editor.destroy()
          this.editor = null
        }
      },
      initEditor() {
        if (!this.$WangEditor) {
          throw this.$t('ht.editor.errorMsg')
        }
        if (this.editor || !this.inputWriteable || this.hasTextValue) {
          return
        }
        const that = this
        this.$nextTick(() => {
          if (!this.inputWriteable) {
            return
          }
          this.editor = new this.$WangEditor(`#${this.editorId}`)
          Object.assign(
            this.editor.config,
            this.$WangEditorConfig,
            this.config,
            {
              onchange() {
                that.$emit('change', that.setValue(that.editor.txt.html()))
                that.$emit('input', that.setValue(that.editor.txt.html()))
              },
              onblur(newHtml) {
                that.$emit('onblur', that.setValue(newHtml))
              },
              onfocus(newHtml) {
                that.$emit('onfocus', that.setValue(newHtml))
              },
            }
          )
          let menus = [...this.customMenus]
          if (eval(this.noToolbar)) {
            menus = []
          }
          this.editor.config.zIndex = 0
          this.editor.config.height = eval(this.initialFrameHeight)

          this.editor.config.menus = menus
          if (
            this.editor.config.uploadImgHeaders &&
            !this.editor.config.uploadImgHeaders.Authorization
          ) {
            this.editor.config.uploadImgHeaders.Authorization = this.$requestConfig.getToken()
          }
          this.editor.create()
          if (this.disabled) {
            this.editor.disable()
          } else {
            this.editor.enable()
          }
          // 首次赋值
          this.editor.txt.html(this.inputVal)
        })
      },
      setValue(val) {
        return this.encode ? encode(val) : val
      },
      getValue(val) {
        return this.encode ? decode(val) : val
      },
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
  div.inputs.ht-form-inputs__inline {
    width: auto;
  }
  input[type='hidden'][aria-invalid='true'] + div[data-we-id] {
    outline: 1px solid #f56c6c;
  }
  .empty-div {
    height: 32px;
  }
  .is-disabled {
    cursor: not-allowed;
    ::v-deep {
      .w-e-text-container {
        background: #f5f7fa;
      }
    }
  }
</style>
