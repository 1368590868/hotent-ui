<template>
  <div
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <el-radio-group
      v-if="inputWriteable"
      v-model="inputVal"
      v-validate="inputValidate"
      :size="inputSize"
      :name="inputName"
      :style="styles"
      @change="change"
    >
      <el-radio
        v-for="item in optionsVal"
        :key="item[propKey]"
        :class="{
          'el-radio-vertical': optionLayout == 'vertical',
          'el-radio-horizontal': optionLayout == 'horizontal',
        }"
        :label="item[propKey]"
        :disabled="readonly || disabled || item.disabled"
      >
        {{ item[propValue] }}
      </el-radio>
    </el-radio-group>
    <ht-field-tail
      v-if="permission != 'n'"
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="formatValue || inputVal"
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
    name: 'HtRadio',
    components: {
      HtFieldTail,
    },
    mixins: [permission, inputName, linkage, ganged, form, formDataUpdate],
    props: {
      value: [String, Number, Boolean],
      options: Array,
      optionLayout: {
        type: String,
        default: 'horizontal',
        validator: function(value) {
          return ['horizontal', 'vertical'].some((i) => i == value)
        },
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      rdlist: String,
      styles: Object,
    },
    data() {
      return {
        formatValue: '',
        optionsVal: [],
      }
    },
    computed: {
      inputVal: {
        get: function() {
          if (utils.isEmpty(this.value)) {
            return ''
          }
          if (
            this.value !== null &&
            this.value !== undefined &&
            !this.inputWriteable &&
            this.optionsVal &&
            this.optionsVal.length > 0
          ) {
            // eslint-disable-next-line
            this.formatValue = this.optionsVal.find(
              // eslint-disable-next-line
              (opt) => opt[this.propKey] == this.value
            ).value
          }
          return this.value
        },
        set: function(val) {
          this.$emit('input', val)
        },
      },
    },
    watch: {
      options() {
        this.loadOption()
      },
    },
    created() {
      this.$on('formDataUpdate', () => {
        this.loadOption()
      })
    },
    mounted() {
      this.$nextTick(() => {
        this.loadOption()
      })
    },
    methods: {
      change(radioLabel) {
        this.$emit('change', radioLabel)
      },
      //加载选项
      loadOption() {
        // 动态选项
        if (this.ganged && this.ganged.alias) {
          this.dynamicLoadOption()
        } else {
          // 静态选项
          this.optionsVal = this.rdlist
            ? JSON.parse(this.rdlist)
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
    },
  }
</script>
<style lang="scss" scoped>
  label.el-radio-horizontal {
    margin: 0px 30px 5px 0;
  }

  label.el-radio-vertical {
    display: block;
  }

  label.el-radio-vertical ~ label.el-radio-vertical {
    margin-top: 10px;
    margin-left: 0px;
  }

  .el-radio-group {
    line-height: 14px;
  }

  div.el-radio-group[aria-invalid='true'] {
    outline: 1px solid #f56c6c;
  }
</style>
