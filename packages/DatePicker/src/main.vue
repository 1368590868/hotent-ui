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
      :name="inputName"
      :type="dateType"
      :picker-options="pickerOptions"
      :popper-class="popperClass"
      :disabled="disabled"
      :readonly="readonly"
      :editable="editable"
      :clearable="clearable"
      :size="inputSize"
      :start-placeholder="startPlaceholderVal"
      :end-placeholder="endPlaceholderVal"
      :range-separator="rangeSeparator"
      :format="format"
      :value-format="valueFormat"
      :default-value="defaultValue"
      :default-time="defaultTime"
      :placeholder="placeholder"
      :unlink-panels="unlinkPanels"
      @change="(val) => $emit('change', val)"
      @blur="() => $emit('blur')"
      @focus="() => $emit('focus')"
    ></el-date-picker>
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
    name: 'HtDatePicker',
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
      defaultTime: {
        type: String,
      },
      format: {
        type: String,
        default: 'yyyy-MM-dd HH:mm:ss',
      },
      valueFormat: {
        type: String,
        default: 'yyyy-MM-dd HH:mm:ss',
      },
      popperClass: String,
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
      startPlaceholder: {
        type: String,
      },
      endPlaceholder: {
        type: String,
      },
      unlinkPanels: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      dateType() {
        return /^\w{4}-\w{1,2}-\w{1,2}$/.test(this.format)
          ? 'daterange'
          : 'datetimerange'
      },
      startPlaceholderVal() {
        return this.startPlaceholder
          ? this.startPlaceholder
          : this.t('ht.date.startDate')
      },
      endPlaceholderVal() {
        return this.endPlaceholder
          ? this.endPlaceholder
          : this.t('ht.date.endDate')
      },
      inputVal: {
        get: function() {
          if (this.value && this.value.constructor == String) {
            return this.value.split(',')
          }
          return this.value
        },
        set: function(val) {
          if (val && val.constructor == Array) {
            this.$emit('input', val.join(','))
            return
          }
          this.$emit('input', val)
        },
      },
    },
  }
</script>
<style lang="scss" scoped>
  div.inputs.ht-form-inputs__inline {
    width: auto;
  }
  .inputs {
    div.el-date-editor--daterange[aria-invalid='true'],
    div.el-date-editor--datetimerange[aria-invalid='true'] {
      border-color: #f56c6c;
    }
  }
</style>
