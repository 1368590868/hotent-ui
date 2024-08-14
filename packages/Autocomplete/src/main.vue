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
    <el-autocomplete
      v-if="inputWriteable && permission_sub != 'n'"
      ref="refName"
      v-model="inputVal"
      v-validate="inputValidate"
      :size="inputSize"
      :name="inputName"
      :style="styles"
      :fetch-suggestions="querySearchAsync"
      :placeholder="placeholder"
      :placement="placement"
      :popper-class="popperClass"
      :trigger-on-focus="triggerOnFocus"
      :select-when-unmatched="selectWhenUnmatched"
      :hide-loading="hideLoading"
      :clearable="clearable"
      :popper-append-to-body="popperAppendToBody"
      :highlight-first-item="highlightFirstItem"
      @select="(opt) => $emit('select', opt)"
      @change="(value) => $emit('change', value)"
    >
      <slot slot="prefix" name="prefix"></slot>
      <slot slot="suffix" name="suffix"></slot>
      <slot slot="prepend" name="prepend"></slot>
      <slot slot="append" name="append"></slot>
      <slot slot-scope="{ item }" :item="item"></slot>
    </el-autocomplete>
    <ht-field-tail
      v-if="permission != 'n'"
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="inputReadonlyVal"
    ></ht-field-tail>
  </div>
</template>

<script>
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import linkage from '@/mixins/linkage.js'
  import ganged from '@/mixins/ganged.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtAutocomplete',
    mixins: [permission, inputName, linkage, ganged, form],
    props: {
      value: String,
      autoTiplist: String,
      styles: Object,
      placement: {
        type: String,
        validator(val) {
          return [
            'top',
            'top-start',
            'top-end',
            'bottom',
            'bottom-start',
            'bottom-end',
            'bottom-start',
          ].includes(val)
        },
      },
      popperClass: String,
      triggerOnFocus: {
        type: Boolean,
        default: true,
      },
      selectWhenUnmatched: {
        type: Boolean,
        default: false,
      },
      hideLoading: {
        type: Boolean,
        default: false,
      },
      popperAppendToBody: {
        type: Boolean,
        default: true,
      },
      highlightFirstItem: {
        type: Boolean,
        default: false,
      },
      props: {
        type: Object,
        default: function() {
          return {
            key: 'value',
          }
        },
      },
      clearable: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        refName: `autocomplete-${utils.getName()}`,
        options: [],
      }
    },
    computed: {
      inputVal: {
        get: function() {
          return this.value
        },
        set: function(val) {
          if (typeof val == 'number') {
            this.$emit('input', val.toString())
          } else {
            this.$emit('input', val)
          }
        },
      },
      inputReadonlyVal: function() {
        if (
          !this.inputWriteable &&
          this.inputVal.length > 0 &&
          this.options.length > 0
        ) {
          var inputValArr = []
          if (this.inputVal && this.options.length > 0) {
            for (var a = 0; a < this.options.length; a++) {
              if (this.options[a][this.props.key] == this.inputVal) {
                inputValArr.push(this.options[a].value)
                break
              }
            }
          }
          return inputValArr.join(',')
        }
        return this.inputVal
      },
    },
    created() {
      this.options = this.autoTiplist ? JSON.parse(this.autoTiplist) : []
    },
    methods: {
      querySearchAsync(queryString, cb) {
        this.doCustomQuery(null, true)
          .then((data) => {
            if (data != null || data != undefined) {
              this.options = data
            }
            var results = [].concat(
              queryString
                ? this.options.filter(this.createStateFilter(queryString))
                : this.options
            )
            cb(results)
          })
          .catch(() => cb(this.options))
      },
      createStateFilter(queryString) {
        return (state) => {
          let _val = state.value
          if (typeof _val == 'number') {
            _val = _val.toString()
          }
          return _val.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
        }
      },
      focus() {
        this.$refs[this.refName].focus()
      },
    },
  }
</script>

<style lang="scss" scoped>
  div[aria-invalid='true'] {
    ::v-deep {
      .el-input__inner,
      .el-input__inner:focus {
        border-color: #f56c6c;
      }
    }
  }

  .inputs {
    ::v-deep {
      .el-autocomplete {
        width: 100%;
      }
    }
  }
</style>
