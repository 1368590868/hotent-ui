<template>
  <div
    v-if="permission != 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <el-date-picker
      v-if="inputWriteable"
      v-model="inputVal"
      v-validate="inputValidate"
      :size="inputSize"
      :name="inputName"
      :type="type"
      :format="dateFormat"
      :clearable="clearable"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :default-time="defaultTime"
      :picker-options="pickerOptions"
      @blur="handleBlur"
    />
    <ht-field-tail
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="inputVal"
    />
  </div>
</template>
<script>
  import HtFieldTail from '../../FieldTail/index'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import mobileMode from '@/mixins/mobileMode.js'

  export default {
    name: 'HtDate',
    components: {
      HtFieldTail,
    },
    mixins: [permission, inputName, form, mobileMode],
    props: {
      value: String,
      defaultTime: {
        type: String,
      },
      showDate: {
        type: Boolean,
        default: false,
      },
      day: Number,
      format: {
        type: String,
        default: 'yyyy-MM-dd HH:mm:ss',
      },
      valueFormat: {
        type: String,
        default: 'yyyy-MM-dd HH:mm:ss',
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      isServerDate: {
        type: Boolean,
        default: false,
      },
      pickerOptions: {
        type: Object,
        default() {
          return {}
        },
      },
    },
    data() {
      return {
        type: 'datetime',
      }
    },
    computed: {
      dateFormat: function() {
        const format = this.format ? this.format : this.valueFormat
        return this.userAgentMobile ? format.replace(/-/g, '/') : format
      },
      inputVal: {
        get: function() {
          // 只读情况
          if (!this.inputWriteable) {
            let date = this.value
            if (this.value && this.value.constructor == String) {
              let showV = this.value.replace(/-/g, '/')
              return new Date(showV).format(this.format)
            }
            return date && date.constructor == Date
              ? date.format(this.format)
              : date
          }
          return this.value
        },
        set: function(val) {
          if (val && val.constructor == Date) {
            this.$emit('input', val.format(this.valueFormat))
          } else {
            this.$emit('input', val)
          }
        },
      },
    },
    watch: {
      format: {
        handler(val) {
          // 通过日期格式来判断控件类型：日期、日期时间
          if (/^\w{4}-\w{1,2}-\w{1,2}$/.test(val)) {
            this.type = 'date'
          }
        },
        immediate: true,
      },
    },
    created() {
      this.initDate()
      setTimeout(() => {
        console.log(this.inputValidate)
      }, 3000);
    },
    methods: {
      handleBlur() {
        // element会触发blur事件，且参数为vue实例对象，在veeValidate中会将该对象识别为日期的值导致必填校验失效。
        // 这里再次触发校验，让其对该控件的值再做一次校验。
        setTimeout(() => {
          this.$validator.validate()
          console.log(this.$validator)
        }, 10)
      },
      // 初始化日期
      initDate() {
        //是否显示当前日期
        if (!this.value && this.showDate) {
          // 设定为获取服务器当前时间 并且 提供了获取的方法
          if (this.isServerDate && this.$requestConfig.getCurrentServerTime) {
            this.$requestConfig
              .getCurrentServerTime(this.dateFormat)
              .then((resp) => this.formatAndSetDate(new Date(resp)))
          } else {
            this.formatAndSetDate(new Date())
          }
        }
      },
      formatAndSetDate(date) {
        if (this.day) {
          //是否指定了相隔的天数
          date = new Date(date.getTime() + this.day * 24 * 60 * 60 * 1000)
        }
        this.inputVal = date.format(this.valueFormat)
      },
    },
  }
</script>
<style lang="scss" scoped>
  div[aria-invalid='true'] ::v-deep .el-input__inner,
  div[aria-invalid='true'] ::v-deep .el-input__inner:focus {
    border-color: #f56c6c;
  }

  .inputs.ht-form-inputs__block {
    ::v-deep {
      .el-date-editor {
        width: 100%;
      }
    }
  }
</style>
