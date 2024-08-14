<template>
  <div
    v-if="permission !== 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <el-time-select
      v-if="inputWriteable"
      v-model="inputVal"
      v-validate="inputValidate"
      :name="inputName"
      :clearable="clearable"
      :picker-options="pickerOptions"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :size="inputSize"
      :editable="editable"
      @blur="handleBlur"
    ></el-time-select>
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

  export default {
    name: 'HtTimeSelect',
    components: {
      HtFieldTail,
    },
    mixins: [permission, inputName, form],
    props: {
      value: String,
      pickerOptions: {
        type: Object,
        default() {
          return {
            start: '00:00',
            step: '00:15',
            end: '23:59',
          }
        },
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      editable: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      inputVal: {
        get: function() {
          return this.value
        },
        set: function(val) {
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
