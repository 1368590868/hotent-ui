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
    <el-checkbox-group
      v-if="inputWriteable"
      v-model="inputVal"
      v-validate="inputValidate"
      :size="inputSize"
      :name="inputName"
      :min="min"
      :max="max"
      :disabled="disabled || readonly"
    >
      <el-checkbox
        v-for="item in optionsVal"
        :key="item.key"
        :class="{
          'el-checkbox-vertical': optionLayout == 'vertical',
          'el-checkbox-horizontal': optionLayout == 'horizontal',
        }"
        :label="item.key"
        :disabled="item.disabled"
        @change="handleCheckboxChange"
      >
        {{ item.value }}
      </el-checkbox>
    </el-checkbox-group>
    <ht-field-tail
      :field-name="inputName"
      :readonly="!inputWriteable"
      input-value
      :tag-format-value="inputVal"
    />
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import HtFieldTail from '../../FieldTail/index'
  import permission from '@/mixins/permission.js'
  import linkage from '@/mixins/linkage.js'
  import inputName from '@/mixins/inputName.js'
  import ganged from '@/mixins/ganged.js'
  import form from '@/mixins/form.js'
  import formDataUpdate from '@/mixins/formDataUpdate.js'

  export default {
    name: 'HtCheckbox',
    components: {
      HtFieldTail,
    },
    mixins: [permission, inputName, linkage, ganged, form, formDataUpdate],
    props: {
      value: String,
      optionLayout: {
        type: String,
        default: 'horizontal',
        validator: function(value) {
          return ['horizontal', 'vertical'].some((i) => i == value)
        },
      },
      options: Array,
      cklist: String,
      readonly: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      min: Number,
      max: Number,
    },
    data() {
      return {
        optionsVal: [],
      }
    },
    computed: {
      inputVal: {
        get: function() {
          if (
            utils.isEmpty(this.value) ||
            !this.optionsVal ||
            this.optionsVal.length == 0
          ) {
            return []
          }
          if (this.value.constructor == String) {
            const ary = this.value.split(',')
            if (this.inputWriteable) {
              return ary
            } else {
              let opts = []
              ary.forEach((m) => {
                const currentObj = this.optionsVal.find((opt) => opt.key === m)
                currentObj && opts.push(currentObj.value)
              })
              return opts
            }
          }
          return []
        },
        set: function() {},
      },
    },
    watch: {
      options: function() {
        this.loadOption()
      },
    },
    created() {
      this.$on('formDataUpdate', () => {
        this.loadOption()
      })
    },
    mounted() {
      this.$isCheckbox = true
      this.loadOption()
    },
    methods: {
      //加载选项
      loadOption: function() {
        // 动态选项
        if (this.ganged && this.ganged.alias) {
          this.dynamicLoadOption()
        } else {
          // 静态选项
          this.optionsVal = this.cklist
            ? JSON.parse(this.cklist)
            : this.options
            ? this.options
            : []
        }
      },
      // 动态加载选项
      dynamicLoadOption() {
        this.doCustomQuery(null, true).then((data) => {
          if (data != null || data != undefined) {
            this.optionsVal = data
          }
        })
      },
      // 通过选项值数组 获取 选项key数组
      getOptionKeyByValue: function(valueAry) {
        const keyAry = []
        if (
          !valueAry ||
          valueAry.constructor !== Array ||
          valueAry.length == 0
        ) {
          return keyAry
        }
        valueAry.forEach((m) => {
          const _option = this.optionsVal.find((opt) => opt.value === m)
          if (_option) {
            keyAry.push(_option.key)
          }
        })
        return keyAry
      },
      handleCheckboxChange: function(m, n) {
        let vals = [...this.inputVal]
        const currentVal = n.currentTarget.value
        if (m) {
          vals.push(currentVal)
        } else {
          vals.remove(currentVal)
        }
        vals = vals.filter((i) => i !== '')
        this.$emit('input', vals.join(','))
        this.$emit('change', m, n)
      },
    },
  }
</script>
<style lang="scss" scoped>
  label.el-checkbox-horizontal {
    margin: 0px 30px 5px 0;
  }

  label.el-checkbox-vertical {
    display: block;
  }

  label.el-checkbox-vertical ~ label.el-checkbox-vertical {
    margin-top: 10px;
    margin-left: 0px;
  }

  .el-checkbox-group {
    line-height: 14px;
  }

  div.el-checkbox-group[aria-invalid='true'] {
    outline: 1px solid #f56c6c;
  }
</style>
