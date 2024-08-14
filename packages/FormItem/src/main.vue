<template>
  <el-form-item
    :key="fieldPath"
    class="ht-form-item"
    :label="label"
    :label-width="finalLabelWidth"
    :class="formItemClass"
  >
    <slot></slot>
    <slot slot="label" name="label"></slot>
  </el-form-item>
</template>

<script>
  export default {
    name: 'HtFormItem',
    componentName: 'HtFormItem',
    inject: {
      elForm: {
        default: '',
      },
    },
    props: {
      label: {
        type: String,
        default: '',
      },
      align: {
        type: String,
        validator: function(value) {
          return ['left', 'center', 'right', 'justify'].indexOf(value) !== -1
        },
      },
      labelColor: {
        type: String,
      },
      labelWidth: {
        type: String,
      },
      customColon: {
        type: Boolean,
        default: false,
      },
      required: {
        type: Boolean,
        default: false,
      },
      fieldPath: {
        type: String,
      },
    },
    data() {
      return {
        formItemAlign: null,
        isRequired: false,
      }
    },
    computed: {
      finalLabelWidth() {
        return this.labelWidth
          ? this.labelWidth
          : this.elForm && this.elForm.labelWidth
          ? this.elForm.labelWidth
          : '100px'
      },
      formItemClass: function() {
        let _className = []
        const formItemAlignVal = this.align
          ? this.align
          : this.formItemAlign
          ? this.formItemAlign
          : ''
        if (!this.customColon) {
          _className.push('ht-form-item-colon')
        }
        switch (formItemAlignVal) {
          case 'left':
            _className.push('ht-form-item-left')
            break
          case 'center':
            _className.push('ht-form-item-center')
            break
          case 'right':
            _className.push('ht-form-item-right')
            break
          case 'justify':
            _className.push('ht-form-item-justify')
        }
        if (this.$slots.default) {
          for (let i = 0; i < this.$slots.default.length; i++) {
            let _vNode = this.$slots.default[i]
            if (_vNode.componentOptions && _vNode.componentOptions.propsData) {
              let propsData = _vNode.componentOptions.propsData
              let _validate = propsData.validate
              if (!_validate && _vNode.data.directives) {
                let validateArry = _vNode.data.directives.filter(
                  (item) => item.name == 'validate'
                )
                if (validateArry && validateArry.length > 0) {
                  _validate = validateArry[0].value
                }
              }
              if (this.required) {
                _className.push('is-required')
              } else if (
                _validate &&
                _validate.constructor == Object &&
                _validate.required
              ) {
                _className.push('is-required')
              } else if (
                _validate &&
                _validate.constructor == String &&
                _validate.indexOf('required') != -1
              ) {
                _className.push('is-required')
              } else if (propsData.permission == 'b') {
                _className.push('is-required')
              }
              if (
                propsData.permission === 'r' &&
                _className.indexOf('is-required') != -1
              ) {
                _className = _className.filter((item) => item != 'is-required')
              }
              if (this.isRequired && !_className.includes('is-required')) {
                _className.push('is-required')
              }
              break
            }
          }
        }
        return _className.join(' ')
      },
    },
    created() {
      this.$on('formExtend:update', (formExtend) => {
        this.formItemAlign = formExtend.formItemAlign
      })
      this.$root.$on('current-required-item', (val) => {
        if (val[`data.${this.fieldPath}`] === 'b') {
          this.isRequired = true
        } else if (['w', 'n', 'r'].includes(val[`data.${this.fieldPath}`])) {
          this.isRequired = false
        }
      })
    },
    mounted() {
      if (this.labelColor) {
        this.$el.firstElementChild &&
          (this.$el.firstElementChild.style.color = this.labelColor)
      }
    },
  }
</script>

<style scoped>
  .ht-form-item-colon ::v-deep .el-form-item__label::after {
    content: ':';
  }
  .ht-form-item-left ::v-deep .el-form-item__label {
    text-align: left;
  }
  .ht-form-item-center ::v-deep .el-form-item__label {
    text-align: center;
  }
  .ht-form-item-right ::v-deep .el-form-item__label {
    text-align: right;
  }
  .ht-form-item-justify ::v-deep .el-form-item__label {
    text-align: justify;
    text-justify: distribute-all-lines;
    text-align-last: justify;
  }
</style>
