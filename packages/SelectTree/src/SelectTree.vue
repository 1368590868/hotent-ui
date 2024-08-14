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
      v-if="inputWriteable && ganged"
      ref="treeselect"
      v-model="inputVal"
      v-validate="inputValidate"
      style="width: 100%"
      :name="inputName"
      :size="inputSize"
      :clearable="clearable"
      :placeholder="placeholder"
      :filterable="filterable"
      :filter-method="filterMethod"
      :multiple="multiple"
      :popper-class="isShowPage ? 'has-page' : 'ht-select__dropdown'"
      @clear="() => $emit('clear')"
      @remove-tag="handleSelectTagRemove"
      @focus="selectBlur"
      @visible-change="handleVisibleChange"
    >
      <el-option
        v-for="item in tempoptions"
        v-show="false"
        :key="item.key"
        :value="item.key"
        :label="item.value"
      ></el-option>
      <el-option value disabled>
        <el-tree
          ref="treeselectElTree"
          node-key="key"
          :data="options"
          :highlight-current="true"
          :default-expand-all="true"
          :expand-on-click-node="false"
          :props="defaultProps"
          :indent="indent"
          :filter-node-method="filterNode"
          :show-checkbox="multiple"
          :check-strictly="!cascade"
          @check="handleNodeClick"
          @node-click="handleNodeClick"
          @check-change="handleCheckChange"
        ></el-tree>
      </el-option>
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

    <ht-select
      v-if="inputWriteable && !ganged"
      ref="selected"
      v-model="inputVal"
      :validate="inputValidate"
      :options="options"
      :name="inputName"
      :size="inputSize"
      :clearable="clearable"
      :placeholder="placeholder"
      :filterable="filterable"
      reserve-keyword
      :multiple="multiple"
      :permission="permission_sub"
      @click.native="clickNative"
      @blur="selectBlur"
    />
    <ht-field-tail
      :field-name="inputName"
      :readonly="!inputWriteable"
      input-value
      :tag-format-value="labelValue"
    />
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
    name: 'HtSelectTree',
    mixins: [permission, inputName, linkage, ganged, form],
    props: {
      value: String,
      selectlist: Array,
      multiple: {
        type: Boolean,
        default: false,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      indent: {
        type: Number,
        default: 8,
      },
      filterable: {
        type: Boolean,
        default: false,
      },
      customQuery: Object,
      cascade: {
        type: Boolean,
        default: false,
      },
      limitCount: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        options: [],
        tempoptions: [],
        tagFormatValue: [],
        defaultProps: {
          children: 'children',
          label: 'value',
        },
        pageBean: {
          page: 1,
          pageSize: 20,
          total: 0,
        },
        queryVersion: 0,
      }
    },
    computed: {
      inputVal: {
        get() {
          if (this.multiple) {
            if (this.value) {
              return this.value.split(',')
            } else {
              return []
            }
          } else if (this.value || this.value === 0) {
            return this.value + ''
          } else {
            return this.value
          }
        },
        set(val) {
          if (this.multiple) {
            this.$emit('input', val.join(','))
          } else {
            this.$emit('input', val)
            if (!this.multiple && val) {
              //判断对话框是否绑定了关联查询
              if (
                this.customQuery &&
                this.customQuery.custQueryJson &&
                this.customQuery.custQueryJson.length > 0
              ) {
                let custQueryJson = this.customQuery.custQueryJson
                for (let i = 0; i < custQueryJson.length; i++) {
                  if (custQueryJson[i].conditionfield.length > 0) {
                    this.doSubCustomQuery(custQueryJson[i])
                  } else {
                    console.error(
                      '[' +
                        custQueryJson[i].comment +
                        ']' +
                        this.$t('ht.customDialog.relationSearchNotBindField')
                    )
                  }
                }
              }
            }
          }
        },
      },
      labelValue() {
        const labelAry = []
        this.tempoptions.forEach((opt) => {
          if (this.multiple) {
            if (this.inputVal.some((v) => v == opt.key)) {
              labelAry.push(opt.value)
            }
          } else {
            if (opt.key == this.inputVal) {
              labelAry.push(opt.value)
              return
            }
          }
        })
        return labelAry
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
    mounted() {
      this.loadOption('init')
    },
    methods: {
      handleSelectTagRemove(value) {
        this.$refs.treeselectElTree.setChecked(value, false, this.cascade)
      },
      //判断对象里面的值是否为空
      objIsEmpty(obj) {
        for (let key in obj) {
          if (obj[key]) {
            return false
          }
        }
        return true
      },
      // 加载选项
      loadOption(isInit = '') {
        if (this.ganged && this.ganged.alias) {
          // 如果初始化时不需加载选项时
          if (isInit === 'init' && this.ganged.noInit === 'true') {
            return
          }
          this.dynamicLoadOption()
        } else {
          this.options = this.selectlist ? this.selectlist : []
        }
      },
      // 动态加载选项
      dynamicLoadOption() {
        this.queryVersion += 1
        let versionFlag = this.queryVersion
        this.doCustomQuery(null, false, {
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
          if (data && this.ganged.PId) {
            this.tempoptions = []
            data = utils.tile2nest(
              data,
              this.ganged.valueBind || 'key',
              this.ganged.PId
            )
            this.addSelectList(data)
            this.options = data
          } else if (data) {
            this.tempoptions = []
            this.addSelectList(data)
            this.options = data
          }
        })
      },
      doSubCustomQuery() {
        //TODO 实现关联子查询
      },
      clickNative: function() {
        this.loadOption()
      },
      selectBlur: function() {
        this.loadOption()
      },
      handleCheckChange(data, currentChecked) {
        if (this.multiple) {
          let checkedNodes = this.$refs.treeselectElTree.getCheckedNodes()
          if (
            this.limitCount > 0 &&
            checkedNodes.length > this.limitCount &&
            currentChecked
          ) {
            this.$refs.treeselectElTree.setChecked(data, false, true)
            return
          }
          let modelValue = []
          this.tempoptions = checkedNodes
          for (let data of checkedNodes) {
            modelValue.push(data.key)
          }
          this.$emit('input', modelValue.join(','))
        }
      },
      handleNodeClick(data) {
        if (!this.multiple) {
          this.$emit('input', data.key)
          if (data.key) {
            //判断对话框是否绑定了关联查询
            if (
              this.customQuery &&
              this.customQuery.custQueryJson &&
              this.customQuery.custQueryJson.length > 0
            ) {
              let custQueryJson = this.customQuery.custQueryJson
              for (let i = 0; i < custQueryJson.length; i++) {
                if (custQueryJson[i].conditionfield.length > 0) {
                  this.doSubCustomQuery(custQueryJson[i])
                } else {
                  console.error(
                    '[' +
                      custQueryJson[i].comment +
                      ']' +
                      this.$t('ht.customDialog.relationSearchNotBindField')
                  )
                }
              }
            }
          }
          this.$refs.treeselect.blur()
          setTimeout(() => {
            this.$validator.validate()
          })
        }
      },
      filterNode(value, data) {
        if (!value) return true
        return data.value.indexOf(value) !== -1
      },
      filterMethod(query) {
        this.$refs.treeselectElTree.filter(query)
      },
      addSelectList(list) {
        let valueFiled =
          (this.ganged.valueBind || '') == 'key' ? '' : this.ganged.valueBind
        let labelFiled =
          (this.ganged.labelBind || '') == 'value' ? '' : this.ganged.labelBind
        if (list && list.length > 0) {
          list.forEach((l) => {
            if (valueFiled) {
              l['key'] = l[valueFiled]
            }
            if (labelFiled) {
              l['value'] = l[labelFiled]
            }
            this.tempoptions.push(l)
            if (l.children) {
              this.addSelectList(l.children)
            }
          })
        }
      },
      handleCurrentChange(page) {
        this.isChangePage = true
        this.pageBean.page = page
        this.dynamicLoadOption()
      },
      handleVisibleChange() {
        this.pageBean.page = 1
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

  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background-color: #fff;
  }

  .el-select-dropdown__item {
    font-size: 14px;
    padding: 0 8px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    height: 100%;
    line-height: 34px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;
  }

  li.el-select-dropdown__item.selected {
    font-weight: normal;
  }
</style>
