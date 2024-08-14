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
    <el-select
      v-if="inputWriteable"
      v-model="inputVal"
      v-validate="inputValidate"
      :class="filterable ? 'filterable' : ''"
      style="width: 100%"
      :name="inputName"
      :size="inputSize"
      :clearable="clearable"
      :disabled="readonly || disabled"
      :placeholder="placeholder"
      :filterable="filterable"
      :allow-create="allowCreate"
      :multiple="multiple"
      :multiple-limit="limitCount"
      :collapse-tags="collapseTags"
      :popper-class="popperClass"
      @change="change"
      @visible-change="visibleChange"
      @remove-tag="removeTag"
      @clear="handleClear"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <slot
        v-if="
          optionsAry && optionsAry.constructor == Array && optionsAry.length > 0
        "
        :options="optionsAry"
        :prop-key="propKey"
        :prop-value="propValue"
      >
        <div class="select-options">
          <el-option
            v-for="item in optionsAry"
            :key="item[propKey]"
            :label="item[propValue]"
            :value="item[propKey]"
          ></el-option>
        </div>
      </slot>
      <el-pagination
        v-if="isShowPage"
        :current-page.sync="pageBean.page"
        :page-size="pageBean.pageSize"
        layout="total, prev, pager, next"
        :total="pageBean.total"
        :pager-count="5"
        :hide-on-single-page="false"
        small
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-select>
    <ht-field-tail
      :writeable.sync="writeable"
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="inputVal"
      :tag-format-value="tagFormatValue"
    />
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import deepmerge from 'deepmerge'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import linkage from '@/mixins/linkage.js'
  import ganged from '@/mixins/ganged.js'
  import form from '@/mixins/form.js'
  import formDataUpdate from '@/mixins/formDataUpdate.js'

  export default {
    name: 'HtSelect',
    mixins: [permission, inputName, linkage, ganged, form, formDataUpdate],
    props: {
      value: [String, Number, Boolean, Array],
      options: Array,
      selectlist: Array,
      disabled: {
        type: Boolean,
        default: false,
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      filterable: {
        type: Boolean,
        default: false,
      },
      allowCreate: {
        type: Boolean,
        default: false,
      },
      remoteMethod: Function,
      remote: {
        type: Boolean,
        default: false,
      },
      relatedQuery: {
        type: Array,
        default: function() {
          return []
        },
      },
      limitCount: {
        type: Number,
        default: 0,
      },
      collapseTags: {
        type: Boolean,
        default: false,
      },
      popperClass: {
        type: String,
        default: 'ht-select__dropdown',
      },
    },
    data() {
      return {
        optionsAry: [],
        tagFormatValue: [],
        queryVersion: 0,
        pageBean: {
          page: 1,
          pageSize: 20,
          total: 0,
        },
      }
    },
    computed: {
      inputVal: {
        get() {
          if (utils.isEmpty(this.value)) {
            return ''
          }
          this.relatedQueryLoad() // 触发绑定的关联查询
          if (this.value.constructor == String) {
            const ary = this.value === '' ? [] : this.value.split(',')
            if (this.inputWriteable) {
              if (this.multiple) {
                return ary
              } else {
                return this.value
              }
            } else {
              // 只读 多选
              if (this.multiple) {
                const ary = this.value === '' ? [] : this.value.split(',')
                let optionVals = []
                let tempAry = deepmerge([], ary, { clone: true })
                ary.forEach((m) => {
                  this.optionsAry.find((opt) => {
                    if (
                      opt[this.propKey] &&
                      opt[this.propKey].toString() === m
                    ) {
                      optionVals.push(opt[this.propValue])
                      tempAry.remove(m)
                    }
                    if (opt.children && opt.children.length > 0) {
                      opt.children.find((childOpt) => {
                        if (
                          childOpt[this.propKey] &&
                          childOpt[this.propKey].toString() === m
                        ) {
                          optionVals.push(childOpt[this.propValue])
                          tempAry.remove(m)
                        }
                      })
                    }
                  })
                })
                optionVals = optionVals.concat(tempAry)
                this.tagFormatValue = optionVals // eslint-disable-line
                return ary
              }
              if (this.optionsAry && this.optionsAry.length > 0) {
                let optionVals = []
                let tempAry = deepmerge([], ary, { clone: true })
                ary.forEach((m) => {
                  this.optionsAry.find((opt) => {
                    if (
                      opt[this.propKey] &&
                      opt[this.propKey].toString() === m
                    ) {
                      optionVals.push(opt[this.propValue])
                      tempAry.remove(m)
                    }
                    if (opt.children && opt.children.length > 0) {
                      opt.children.find((childOpt) => {
                        if (
                          childOpt[this.propKey] &&
                          childOpt[this.propKey].toString() === m
                        ) {
                          optionVals.push(childOpt[this.propValue])
                          tempAry.remove(m)
                        }
                      })
                    }
                  })
                })
                optionVals = optionVals.concat(tempAry)
                this.tagFormatValue = optionVals // eslint-disable-line
                return this.value
              }
            }
          }
          return this.value
        },
        set(val) {
          let result = ''
          if (this.multiple) {
            if (val && val.constructor === Array && val.length > 0) {
              if (val[0].constructor === Number) {
                throw this.$t('ht.select.errorMsg')
              }
              result = val.join(',')
            }
          } else {
            result = val
          }
          if (result != '') {
            this.relatedQueryLoad() // 触发绑定的关联查询
          }
          this.$emit('input', result)
        },
      },
      isShowPage() {
        return (
          this.ganged &&
          this.ganged.alias &&
          this.ganged.needPage == 1 &&
          this.pageBean.page
        )
      },
    },
    watch: {
      options: function() {
        this.loadOption()
      },
    },
    created() {
      this.$on('formDataUpdate', () => {
        if (!this.isShowPage) {
          this.loadOption(true)
        }
      })
    },
    mounted() {
      this.loadOption(false, 'init')
    },
    methods: {
      //加载选项
      loadOption: function(resetValue, isInit = '') {
        // 动态选项
        if (this.ganged && this.ganged.alias) {
          // 如果初始化时不需加载选择时
          if (isInit === 'init' && this.ganged.noInit === 'true') {
            return
          }
          this.dynamicLoadOption(resetValue)
        } else {
          // 静态选项
          this.optionsAry = this.selectlist
            ? this.selectlist
            : this.options
            ? this.options
            : []
        }
      },
      // 动态加载选项
      dynamicLoadOption(resetValue) {
        this.queryVersion += 1
        let versionFlag = this.queryVersion
        this.doCustomQuery(null, true, {
          page: this.pageBean.page,
          isChangePage: this.isChangePage,
        }).then((data) => {
          // 如果同一个动态加载项，同时出发多次时，后面的请求会被拦截，所以此处需要将标识减1
          if (data === null) {
            this.queryVersion -= 1
          }
          if (versionFlag < this.queryVersion) {
            return
          }
          if (data != null || data != undefined) {
            // 之前的选项是否是空的
            const preOptionsAryIsEmpty =
              !this.optionsAry || this.optionsAry.length == 0
            // 动态选项是否相同
            const optionsAryEquals = utils.arrayEquals(data, this.optionsAry)
            this.optionsAry = data
            // 选项中是否包含旧值
            const isIncludeOldVal = this.checkValue(data)
            if (
              resetValue &&
              this.inputWriteable &&
              !preOptionsAryIsEmpty &&
              !optionsAryEquals &&
              !isIncludeOldVal
            ) {
              this.$nextTick(() => {
                this.$emit('input', '')
              })
            }
          }
        })
      },
      change: function(data) {
        let selectObj = this.optionsAry.find(
          (opt) => opt[this.propKey] === data
        )
        this.$emit('change', data, selectObj)
      },
      visibleChange: function(m) {
        this.pageBean.page = 1
        this.loadOption()
        this.$emit('visible-change', m)
      },
      removeTag: function(tag) {
        this.$emit('remove-tag', tag)
      },
      handleClear: function() {
        this.$emit('clear')
      },
      handleBlur: function(event) {
        this.$emit('blur', event)
      },
      handleFocus: function(event) {
        this.$emit('focus', event)
        if (
          this.ganged &&
          this.ganged.alias &&
          this.ganged.noInit === 'true' &&
          !this.optionsAry.length
        ) {
          this.dynamicLoadOption()
        }
      },
      // 准备查询参数
      prepareLoadParams: function(condition) {
        let params = {}
        if (condition && !utils.isEmpty(condition)) {
          // 获取当前控件是否在子表某行中
          let { index } = utils.getSubScopeElAndIndex(this.$el)
          if (this.$el) {
            const pInst = utils.getOnlineFormInstance(this)
            Object.keys(condition).forEach((k) => {
              let val = null
              // 主表
              if (index == null) {
                val = utils.getValueByPath(pInst, condition[k])
              }
              // 子表
              else {
                val = utils.getValueByPath(pInst, condition[k], index)
              }
              if (!utils.isEmpty(val)) {
                params[k] = val
              }
            })
          }
        }
        return params
      },
      // 触发绑定的关联查询
      relatedQueryLoad: function() {
        if (
          this.relatedQuery &&
          this.relatedQuery.constructor == Array &&
          this.relatedQuery.length > 0
        ) {
          const pInst = utils.getOnlineFormInstance(this)
          // 遍历所有的关联查询，逐个触发
          this.relatedQuery.forEach((q) => {
            const params = this.prepareLoadParams(q.condition)
            pInst.$emit('related-query:load', q.alias, params, q.result)
          })
        }
      },
      // 判断当前选项是否包含value值
      checkValue(data) {
        let flag = false
        data.forEach((item) => {
          if (this.value.split(',').includes(item[this.propKey])) {
            flag = true
          }
        })
        return flag
      },
      handleCurrentChange(page) {
        this.isChangePage = true
        this.pageBean.page = page
        this.dynamicLoadOption()
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
</style>
