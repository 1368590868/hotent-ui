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
    <el-time-picker
      v-if="inputWriteable"
      v-model="inputVal"
      :append-to-body="false"
      v-validate="inputValidate"
      :arrow-control="arrowControl"
      :name="inputName"
      :picker-options="pickerOptions"
      :disabled="disabled"
      :readonly="readonly"
      :editable="editable"
      :clearable="clearable"
      :size="inputSize"
      :start-placeholder="startPlaceholderVal"
      :end-placeholder="endPlaceholderVal"
      :is-range="isRange"
      :range-separator="rangeSeparator"
      :value-format="valueFormat"
      :default-value="defaultValue"
      :placeholder="placeholder"
      @blur="handleBlur"
    ></el-time-picker>
    <ht-field-tail
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="value"
    />
  </div>
</template>
<script>
  import HtFieldTail from '../../FieldTail/index'
  import locale from '@/mixins/locale.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtTimePicker',
    components: {
      HtFieldTail,
    },
    mixins: [locale, permission, inputName, form],
    props: {
      value: String,
      readonly: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      editable: {
        type: Boolean,
        default: true,
      },
      defaultValue: {
        type: [String, Date],
      },
      valueFormat: {
        type: String,
        default: 'HH:mm:ss',
      },
      rangeSeparator: {
        type: String,
        default: '-',
      },
      pickerOptions: {
        type: Object,
        default() {
          return {}
        },
      },
      arrowControl: {
        type: Boolean,
        default: false,
      },
      isRange: {
        type: Boolean,
        default: false,
      },
      endPlaceholder: {
        type: String,
      },
      startPlaceholder: {
        type: String,
      },
    },
    computed: {
      startPlaceholderVal() {
        return this.startPlaceholder
          ? this.startPlaceholder
          : this.t('ht.date.startTime')
      },
      endPlaceholderVal() {
        return this.endPlaceholder
          ? this.endPlaceholder
          : this.t('ht.date.endTime')
      },
      inputVal: {
        get: function() {
          if (this.value && this.isRange && this.value.constructor == String) {
            return this.value.split(',')
          }
          return this.value
        },
        set: function(val) {
          if (val && this.isRange && val.constructor == Array) {
            this.$emit('input', val.join(','))
            return
          }
          this.$emit('input', val)
        },
      },
    },
    methods: {
      handleBlur() {
        // element会触发blur事件，且参数为vue实例对象，在veeValidate中会将该对象识别为日期的值导致必填校验失效。
        // 这里再次触发校验，让其对该控件的值再做一次校验。
        setTimeout(() => {
          this.$validator.validate()
        }, 10)
      },
    },
  }
</script>
<style lang="scss" scoped>
  div.inputs.ht-form-inputs__inline {
    width: auto;
  }
  .inputs {
    div.el-date-editor--timerange[aria-invalid='true'] {
      border-color: #f56c6c;
    }
  }
</style>
