<template>
  <el-form v-form data-vv-scope="searchForm">
    <div class="search-panel__container">
      <component
        :is="isFlexLayout ? 'div' : 'el-row'"
        class="search-panel__row"
        :class="{ 'search-field__row': isFlexLayout }"
      >
        <slot></slot>
      </component>
    </div>
    <div
      :class="{ 'flex-search__group': isFlexLayout }"
      class="search-btn__wrap"
    >
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="search(true)"
      >
        {{ $t('ht.common.searchFor') }}
      </el-button>
      <el-button size="small" icon="el-icon-refresh-left" @click="reset">
        {{ $t('ht.common.reset') }}
      </el-button>
    </div>
  </el-form>
</template>
<script>
  import emitter from '@/mixins/emitter.js'
  import utils from 'hotent-ui/src/utils.js'
  import _ from 'lodash'
  export default {
    name: 'HtTableSearchPanel',
    componentName: 'HtTableSearchPanel',
    mixins: [emitter],
    props: {
      value: Object,
      divide: {
        type: Number,
        default: 4,
        validator: (value) => {
          return value > 0 && value < 5
        },
      },
      labelWidth: {
        type: Number,
        default: 70,
      },
      isFlexLayout: {
        type: Boolean,
        default: false,
      },
      displayStyle: String,
    },
    data() {
      return {
        fieldVms: [],
        fieldArray: [],
        formModelExpression: null,
        data: {},
        defaultData: {},
      }
    },
    computed: {
      calcSpan: {
        get() {
          return 24 / this.divide
        },
      },
    },
    created() {
      if (this.$vnode.data.model && this.$vnode.data.model.expression) {
        this.formModelExpression = this.$vnode.data.model.expression
      }
      this.$slots.default.forEach((v) => {
        if (!v.componentOptions) {
          return
        }
        this.fieldArray.push({ ...v.componentOptions.propsData })
      })
      this.$on('field-loaded', (ref) => {
        // 搜索条件挂载完成后，添加其实例到数组中
        this.fieldVms.push(ref)
      })
      this.$on('input-change', (obj, prop) => {
        this.fieldArray = this.fieldArray.map((field) => {
          return field.prop == prop ? { ...field, ...obj } : field
        })
      })
      this.$on('search', (isSearchBtn) => this.search(isSearchBtn))
    },
    mounted() {
      if (this.formModelExpression) {
        this.$set(this.data, this.formModelExpression, this.value)
        this.defaultData = _.cloneDeep(this.value)
      }
      this.broadcast('HtTableSearchField', 'panel-props', [
        this.labelWidth,
        this.calcSpan,
        this.isFlexLayout,
        this.displayStyle,
      ])
    },
    methods: {
      search(isSearchBtn) {
        if (isSearchBtn) {
          utils
            .validateForm(this, 'searchForm')
            .then((result) => {
              this.$parent.$parent.$emit(
                'advance-search',
                this.fieldArray,
                isSearchBtn
              )
            })
            .catch((items) => {
              this.$message.error(
                this.$t('ht.table.validateErrorMsg', {
                  itemsLength: items.length,
                })
              )
              this.multipleTemplateTableloading = false
            })
            .finally(() => {
              this.multipleTemplateTableloading = false
            })
        } else {
          this.$parent.$parent.$emit(
            'advance-search',
            this.fieldArray,
            isSearchBtn
          )
        }
      },
      reset() {
        if (this.formModelExpression) {
          Object.keys(this.data[this.formModelExpression]).forEach((key) => {
            this.$set(
              this.data[this.formModelExpression],
              key,
              this.defaultData[key] ? this.defaultData[key] : null
            )
          })
        }
        this.fieldVms.forEach((vm) => {
          vm.$emit('input-reset')
        })
        this.$nextTick(() => {
          this.search()
        })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .search-panel__container {
    width: 100%;
    overflow-x: auto;
    max-height: 141px;
  }
  .search-panel__row {
    min-width: 1280px;
  }
  .flex-search__group {
    margin: 0 0 8px 0;
    width: 170px;
    display: inline-block;
  }
  .search-btn__wrap {
    ::v-deep {
      .el-button {
        font-size: 14px;
        i {
          font-size: 16px;
        }
      }
      .el-button--small {
        padding: 7px 12px;
      }
    }
  }
</style>
