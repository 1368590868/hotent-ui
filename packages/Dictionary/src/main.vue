<template>
  <div
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <el-select
      v-if="inputWriteable"
      ref="elSelect"
      v-model="valueDesc"
      v-validate="inputValidate"
      :name="inputName"
      :size="inputSize"
      :popper-class="popperClass"
      :clearable="clearable"
      :placeholder="placeholder"
      :style="styles"
      :filterable="filterable"
      :filter-method="filterMethod"
      @visible-change="handleVisibleChange"
      @clear="clear"
    >
      <el-option v-if="selectlist && selectlist.length > 0" :value="inputVal">
        <el-scrollbar style="height: 100%" class="tree-scrollbar">
          <el-tree
            ref="elTree"
            node-key="key"
            style="maxheight: 245px"
            :data="selectlist"
            :indent="indent"
            :highlight-current="true"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          ></el-tree>
        </el-scrollbar>
      </el-option>
    </el-select>
    <ht-field-tail
      v-if="permission != 'n'"
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="valueDesc"
    ></ht-field-tail>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtDictionary',
    mixins: [permission, inputName, form],
    props: {
      value: String,
      dickey: {
        type: String,
        require: true,
      },
      popperClass: String,
      styles: {
        type: Object,
        default() {
          return {}
        },
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      filterable: {
        type: Boolean,
        default: false,
      },
      indent: {
        type: Number,
        default: 8,
      },
      setValue:{
        type:Function,
        default:()=>{}
      }
    },
    data() {
      return {
        selectlist: [],
        defaultProps: {
          children: 'children',
          label: 'name',
        },
        valueDesc: '',
      }
    },
    computed: {
      inputVal: {
        get: function () {
          if (utils.isEmpty(this.value)) {
            return ''
          }
          this.findDesc(this.selectlist)
          return this.value
        },
        set: function (val) {
          this.$emit('input', val)
        },
      },
    },
    watch: {
      value(val) {
        if (val) {
          this.loadOptions()
        }
        this.valueDesc = ''
        this.$emit('input', val)
      },
    },
    created(){
      this.setValue()
    },
    mounted() {
      this.loadOptions()
    },
    methods: {
      handleVisibleChange(val) {
        if (val && !this.valueDesc) {
          this.loadOptions()
        }
      },
      loadOptions() {
        if (this.dickey) {
          this.$requestConfig.getDictionaryByKey(this.dickey).then((resp) => {
            this.selectlist = resp
            if (this.value !== null && this.value !== undefined) {
              this.findDesc(resp)
            }
          })
        }
      },
      clear() {
        this.filterMethod('')
        this.$emit('input', '')
      },
      handleNodeClick(data) {
        this.inputVal = data.key
        this.valueDesc = data.name
        this.$refs.elSelect.blur()
        setTimeout(() => {
          this.$validator.validate()
        })
      },
      filterNode(value, data) {
        if (!value) return true
        return data.name.indexOf(value) !== -1
      },
      findDesc(list) {
        if (list && list.length > 0) {
          list.forEach((l) => {
            if (l.key == this.value) {
              this.valueDesc = l.name
              return
            }
            if (l.children) {
              this.findDesc(l.children)
            }
          })
        }
      },
      filterMethod(query) {
        this.$refs.elTree.filter(query)
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
      .el-select {
        width: 100%;
      }
    }
  }

  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    padding-right: 0;
    padding-left: 0;
    background-color: #fff;
  }

  .el-select-dropdown__item {
    font-size: 14px;
    padding: 0 20px;
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
    padding-right: 0;
    padding-left: 0;
  }
</style>
