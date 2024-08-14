<template>
  <span class="field-tail__wrap">
    <small v-if="hasErrors" class="el-form-item__error">
      {{ errorMessage }}
    </small>
    <div v-if="readonly && tagFormatValue.length == 0" class="field-tail">
      <div v-if="isReadonlyTextarea">
        <div v-for="(item, index) in formatInputValue" :key="index">
          <p v-if="item" class="readonly_p">
            <slot name="prefix" class="el-input-group__append"></slot>
            <slot name="suffix" class="el-input-group__append"></slot>
            <slot name="prepend" class="el-input-group__append"></slot>
            {{ item }}
            <slot name="append" class="el-input-group__append"></slot>
          </p>
          <br v-else />
        </div>
      </div>
      <el-input
        v-else-if="$readonlyInput"
        v-model="inputValue"
        disabled
      ></el-input>
      <span v-else>
        <slot name="prefix" class="el-input-group__append"></slot>
        <slot name="suffix" class="el-input-group__append"></slot>
        <slot name="prepend" class="el-input-group__append"></slot>
        {{ currentShowValue }}
        <template v-if="company && !filterCurrency">{{ company }}</template>
        <slot name="append" class="el-input-group__append"></slot>
      </span>
    </div>
    <template
      v-if="
        readonly &&
          tagFormatValue.constructor == Array &&
          tagFormatValue.length > 0
      "
    >
      <template v-for="(label, index) in tagFormatValue">
        <el-tooltip
          :key="index"
          class="tooltip-item"
          popper-class="tooltip-item-popper"
          effect="dark"
          :content="label"
          placement="top-start"
        >
          <el-tag class="field-tail-tag">
            {{ label }}
          </el-tag>
        </el-tooltip>
      </template>
    </template>
  </span>
</template>
<script>
  import utils from '@/utils.js'

  export default {
    name: 'HtFieldTail',
    props: {
      fieldName: {
        type: String,
        required: true,
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      inputValue: {
        type: [String, Number, Object, Array, Boolean],
      },
      tagFormatValue: {
        type: [Array],
        default() {
          return []
        },
      },
      writeable: {
        type: Boolean,
        default: true,
      },
      company: String,
      filterCurrency: {
        type: Boolean,
        default: false,
      },
      filterthousandBit: {
        type: Boolean,
        default: false,
      },
      type: String,
      precision: Number,
    },
    data() {
      return {
        scopeName: null,
      }
    },
    computed: {
      fieldScopePath: function() {
        let path = this.fieldName
        if (this.scopeName) {
          path = `${this.scopeName}.${this.fieldName}`
        }
        return path
      },
      hasErrors: function() {
        return this.errors && this.errors.has(this.fieldScopePath)
      },
      errorMessage: function() {
        return this.errors && this.errors.first(this.fieldScopePath)
      },
      formatInputValue() {
        let value = []
        if (this.readonly && typeof this.inputValue === 'string') {
          if (this.inputValue.includes('↵')) {
            value = this.inputValue.split('↵')
          } else if (this.inputValue.includes('\n')) {
            value = this.inputValue.split('\n')
          } else {
            value = [this.inputValue]
          }
        }
        return value
      },
      isReadonlyTextarea() {
        return typeof this.inputValue === 'string'
          ? this.inputValue.includes('↵') || this.inputValue.includes('\n')
          : false
      },
      currentShowValue() {
        const isFormat = this.filterthousandBit || this.filterCurrency
        return this.type === 'number' && !isFormat
          ? Number(this.inputValue).toFixed(this.precision)
          : this.inputValue
      },
    },
    mounted() {
      setTimeout(() => {
        this.scopeName = utils.getSomeAttributeFromParentElement(
          this.$el.parentElement,
          'data-vv-scope'
        )
        const { subScopeEl } = utils.getSubScopeElAndIndex(
          this.$el.parentElement
        )
        if (subScopeEl) {
          if (
            subScopeEl.getAttribute('row_readonly') == 'true' ||
            subScopeEl.getAttribute('row_readonly') === true
          ) {
            this.$emit('update:writeable', false)
          } else {
            const className = Array.prototype.find.call(
              subScopeEl.classList,
              (item) => item.startsWith('row_readonly__')
            )
            if (className && className == 'row_readonly__true') {
              this.$emit('update:writeable', false)
            }
          }
        }
      }, 50)
    },
    created() {
      this.$validator = this.$root.$validator
    },
  }
</script>

<style lang="scss" scoped>
  .field-tail {
    font-size: 14px;
    display: block;
    word-break: break-all;
    word-wrap: break-word;
  }
  .el-tag + .el-tag {
    margin-left: 5px;
  }
  td .el-form-item__error,
  th .el-form-item__error {
    transform: scale(0.9);
  }
  td .el-form-item__error,
  th .el-form-item__error {
    top: calc(100% - 3px);
  }
  .readonly_p {
    margin: 0;
  }
  .field-tail-tag {
    white-space: normal;
    height: auto;
  }
</style>
<style>
  .tooltip-item-popper {
    max-width: 98%;
  }
</style>
