<template>
  <div
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <el-cascader
      v-if="inputWriteable && permission_sub != 'n'"
      :ref="refName"
      v-model="inputVal"
      v-validate="inputValidate"
      :size="inputSize"
      :props="propsVal"
      :name="inputName"
      :validate="validate"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :show-all-levels="showAllLevels"
      :collapse-tags="collapseTags"
      :separator="separator"
      :popper-class="popperClass"
      @change="(node) => $emit('change', node)"
      @expand-change="(parentNodes) => $emit('expand-change', parentNodes)"
      @blur="(event) => $emit('blur', event)"
      @focus="(event) => $emit('focus', event)"
      @visible-change="(show) => $emit('visible-change', show)"
      @remove-tag="(node) => $emit('remove-tag', node)"
    >
      <slot slot="empty" name="empty"></slot>
      <slot slot-scope="{ node, data }" :node="node" :data="data"></slot>
    </el-cascader>
    <ht-field-tail
      v-if="permission != 'n'"
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="inputVal"
    ></ht-field-tail>
  </div>
</template>

<script>
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import ganged from '@/mixins/ganged.js'

  export default {
    name: 'HtCascader',
    mixins: [permission, inputName, form, ganged],
    props: {
      value: String,
      disabled: {
        type: Boolean,
        default: false,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      showAllLevels: {
        type: Boolean,
        default: true,
      },
      collapseTags: {
        type: Boolean,
        default: false,
      },
      separator: {
        type: String,
        default: '>',
      },
      popperClass: {
        type: String,
      },
    },
    data() {
      let _this = this
      return {
        refName: `cascader-${utils.getName()}`,
        lazyLoadResolve: null,
        propsVal: {
          value: _this.ganged.valueBind,
          label: _this.ganged.labelBind,
          lazy: true,
          lazyLoad(node, resolve) {
            _this.dynamicLoadOption(node, resolve)
          },
        },
      }
    },
    computed: {
      inputVal: {
        get() {
          if (this.value) {
            if (this.value.constructor == String) {
              if (!this.value) {
                return ''
              }
              let cascaderModel = JSON.parse(this.value)
              if (!this.inputWriteable) {
                return cascaderModel.pathLabels.join('>')
              }
              return cascaderModel.path
            }
            return this.value.path
          } else {
            return this.value
          }
        },
        set() {
          let selectValArr = this.$refs[this.refName].getCheckedNodes(false)
          if (selectValArr.length > 0 && selectValArr[0] !== null) {
            let result = {
              path: selectValArr[0].path,
              pathLabels: selectValArr[0].pathLabels,
            }
            this.$emit('input', JSON.stringify(result))
          } else {
            this.$emit('input', '')
          }
        },
      },
    },
    methods: {
      /**
       * 获取选中的节点
       */
      getCheckedNodes: function(leafOnly) {
        return this.$refs[this.refName].getCheckedNodes(leafOnly)
      },
      // 动态加载选项
      dynamicLoadOption: function(node, resolve) {
        this.lazyLoadResolve = resolve
        setTimeout(() => {
          const params = this.prepareLoadParams(this.ganged.bind, node)
          this.doCustomQuery(params).then((data) => {
            this.dynamicOptionResponse(data, this.ganged.leafJudge, node)
          })
        }, 0)
      },
      // 准备查询参数
      prepareLoadParams: function(condition, node) {
        let params = {}
        if (condition && !utils.isEmpty(condition)) {
          Object.keys(condition).forEach((k) => {
            const bindSet = condition[k]
            let val = null
            // 参数绑定是对象
            if (bindSet.constructor == Object) {
              // 根节点
              if (node.level == 0) {
                val = !utils.isEmpty(bindSet['default'])
                  ? bindSet['default']
                  : null
              } else {
                val = node.data[bindSet['key']]
              }
            }
            // 参数绑定是字符串
            else if (bindSet.constructor == String && node.level > 0) {
              val = node.data[bindSet]
            }
            if (!utils.isEmpty(val)) {
              params[k] = val
            }
          })
        }
        return params
      },
      // 动态加载选项返回值处理
      dynamicOptionResponse: function(data, leafJudge, node) {
        if (this.lazyLoadResolve) {
          // 判定是否叶子节点的方法
          if (leafJudge && leafJudge.constructor == Function) {
            data.forEach((opt) => {
              opt.leaf = opt
            })
          }
          this.setLeaf(data)
          if (node.level > 0 && !node.hasOwnProperty('leaf')) {
            this.lazyLoadResolve([])
          } else {
            this.lazyLoadResolve(data)
          }
          // 动态加载选项后触发组件视图更新
          this.$refs[this.refName].computePresentContent()
        }
      },
      //递归给级联没有子节点的设置leaf为true
      setLeaf(val) {
        if (!val || !val.map) {
          return []
        }
        let list = val.map((item) => {
          if (item.children) {
            this.setLeaf(item.children)
          }
          if (item && !item.children && item.leaf !== 0) {
            item.leaf = true
          }
          return item
        })
        return list
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
      .el-cascader {
        width: 100%;
      }
    }
  }
</style>
