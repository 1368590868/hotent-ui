<template>
  <el-container class="e_c auto_height fullheight">
    <el-container class="fullheight">
      <div class="ht-header__search">
        <el-input
          v-model="searchWord"
          size="small"
          style="max-width: 200px"
          class="ht-header__input"
          clearable
          :placeholder="searchPlaceholder"
          prefix-icon="el-icon-search"
          @clear="clear"
          @keyup.enter.native="search"
        ></el-input>
        <div class="ht-search__btn">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-search"
            :disabled="loading"
            @click="search"
          >
            {{ t('ht.common.search') }}
          </el-button>
          <el-button
            v-if="!isMobile"
            size="small"
            :disabled="loading"
            icon="el-icon-refresh"
            @click="reset"
          >
            {{ t('ht.common.reset') }}
          </el-button>
          <slot name="customBtn"></slot>
        </div>
      </div>
      <el-main class="ht-selector__main">
        <el-table
          ref="selectorTable"
          v-loading="loading"
          style="width: 100%"
          :data="data"
          class="ht-selector__table"
          stripe
          border
          :size="sizeType"
          :highlight-current-row="single"
          @row-click="handleRowClick"
          @select="handleTableSelect"
          @select-all="handleTableSelect"
        >
          <el-table-column
            v-if="!single"
            type="selection"
            align="center"
            width="45"
          ></el-table-column>
          <el-table-column v-if="single" align="center" width="50">
            <template slot-scope="scope">
              <el-radio v-model="selectedId" :label="scope.row.id"></el-radio>
            </template>
          </el-table-column>
          <el-table-column
            v-if="sizeType == 'small'"
            type="index"
            width="60"
            align="center"
            :label="t('ht.common.index')"
          ></el-table-column>
          <el-table-column
            v-for="(column, index) in tableColumns"
            :key="index"
            align="center"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
          >
            <template slot-scope="scope">
              <el-tooltip
                v-if="column.type == 'timestamp'"
                class="item"
                effect="light"
                :disabled="hideTip(column.tipField, scope.row[column.tipField])"
                :content="scope.row[column.tipField]"
                placement="top-end"
              >
                <div class="cell">
                  {{
                    scope.row[column.prop] | dateFormat('YYYY-MM-DD HH:mm:ss')
                  }}
                </div>
              </el-tooltip>
              <div v-else-if="column.prop == 'orgname'" class="cell">
                <el-tooltip
                  class="item"
                  effect="light"
                  :disabled="
                    hideTip(column.tipField, scope.row[column.tipField])
                  "
                  :content="scope.row[column.tipField]"
                  placement="top-end"
                >
                  <span>{{ scope.row[column.prop] }}</span>
                </el-tooltip>
              </div>
              <div v-else class="cell">{{ scope.row[column.prop] }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer class="ht-footer__pagination" height="auto">
        <el-row type="flex" justify="end">
          <el-pagination
            small
            :layout="isMobile ? mobileLayout : pcLayout"
            :disabled="loading"
            :page-sizes="pageSizeArr"
            :page-size="pagination.pageSize"
            :pager-count="5"
            :total="pagination.total"
            :current-page="pagination.page"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </el-row>
      </el-footer>
    </el-container>
    <el-aside v-if="!isMobile" width="80px" class="right-aside">
      <div class="selector-button-group">
        <el-button :size="sizeType" @click="move('up')">
          {{ t('ht.common.up') }}
        </el-button>
        <el-button :size="sizeType" @click="move('down')">
          {{ t('ht.common.down') }}
        </el-button>
        <el-button :size="sizeType" @click="removeSelected">
          {{ t('ht.common.remove') }}
        </el-button>
        <el-button :size="sizeType" @click="clearAllSelects">
          {{ t('ht.common.clear') }}
        </el-button>
      </div>
    </el-aside>
    <el-aside v-if="!isMobile" width="140px" class="select-aside">
      <el-header class="select-header">
        <span style="font-size: 14px">{{ t('ht.common.selected') }}</span>
      </el-header>
      <div class="select-tree-div">
        <el-tree
          ref="selectTree"
          small
          node-key="id"
          :indent="indent"
          :props="treeProps"
          :data="selects"
          :default-checked-keys="defaultCheckedKeys"
          show-checkbox
          check-on-click-node
        ></el-tree>
      </div>
    </el-aside>
  </el-container>
</template>
<script>
  import utils from '@/utils.js'
  import { setTimeout } from 'timers'
  import Locale from '@/mixins/locale'
  import mobileMode from '@/mixins/mobileMode.js'

  export default {
    name: 'HtSelector',
    mixins: [Locale, mobileMode],
    props: {
      searchPlaceholder: {
        type: String,
        default: '',
      },
      selectLabel: {
        type: String,
        default: 'name',
      },
      tableColumns: {
        type: Array,
        default: () => {
          return []
        },
      },
      value: {
        type: Array,
        default: () => {
          return []
        },
      },
      data: Array,
      single: {
        type: Boolean,
        default: false,
      },
      //服务端分页
      pagination: {
        type: Object,
        default: () => {
          return {
            page: 1,
            pageSize: 10,
            total: 31214,
            showTotal: true,
          }
        },
      },
      quickSearchProps: {
        type: [String, Array],
        required: true,
      },
      //唯一标识字段
      primaryField: {
        type: String,
        default: '',
      },
      indent: {
        type: Number,
        default: 8,
      },
    },
    data() {
      return {
        sizeType: 'small',
        loading: false,
        searchWord: null,
        //客户端分页
        paging: {
          page: 1,
          pageSize: 10,
        },
        selectedId: null,
        selects: [],
        defaultCheckedKeys: [],
        currentSelectData: [],
        pageSizeArr: [10, 50, 100, 200, 300],
        pcLayout: 'total, sizes, prev, pager, next ,jumper',
        mobileLayout: 'total, prev, pager, next',
      }
    },
    computed: {
      treeProps: function() {
        return { label: this.selectLabel }
      },
    },
    watch: {
      data: function(newVal) {
        if (newVal && newVal.length > 0) {
          this.syncCheckedStatus()
        }
      },
      selects: {
        handler(val) {
          this.currentSelectData = val
          this.$emit('current-selected', val)
        },
        deep: true,
      },
    },
    created() {
      if (this.pagination.pageSize) {
        this.paging.pageSize = this.pagination.pageSize
        if (this.pageSizeArr.indexOf(this.paging.pageSize) === -1) {
          this.pageSizeArr.push(this.paging.pageSize)
        }
      }
      // 组件初始化时，复制一份分页信息
      this.oldPaging = { ...this.paging }
      if (this.$smallScreenDialog) {
        this.sizeType = 'mini'
      }
    },
    methods: {
      hideTip(tipField, val) {
        if (!tipField || !val) {
          return true
        }
        return false
      },
      getSelectedData() {
        return this.currentSelectData
      },
      // 同步已选行到已选数据中去
      syncSelection2selects() {
        // 复制一份当前已选数据
        let tmpSelects = [...this.selects]
        // 先将当前页中的数据从已选数据中移除
        this.data.forEach((m) => {
          tmpSelects.remove(m)
        })
        // 将剩余的已选数据与当前页选中的数据合并
        tmpSelects = [...tmpSelects, ...this.$refs.selectorTable.selection]
        // 数组去重
        this.selects = tmpSelects.unique(
          this.primaryField ? this.primaryField : 'id'
        )

        this.defaultCheckedKeys = this.defaultCheckedKeys.concat(
          this.$refs.selectorTable.selection.extractByKey('id')
        )
      },
      // 同步已选数据在Table中的选中状态
      syncCheckedStatus() {
        this.selectedId = null
        if (this.single) {
          this.selects.length === 1 && (this.selectedId = this.selects[0].id)
        } else {
          if (
            !this.$refs.selectorTable ||
            !this.$refs.selectorTable.selection
          ) {
            throw this.$t('ht.selector.notGetData')
          }
          this.$refs.selectorTable.clearSelection()
          this.selects.length > 0 &&
            setTimeout(() => {
              this.selects.forEach((m) => {
                if (
                  this.data.some((n) => {
                    return utils.objectEquals(m, n)
                  })
                ) {
                  this.$refs.selectorTable.toggleRowSelection(m)
                }
              })
            })
        }
      },
      onShow(initSelectors) {
        // 每一次显示选择器时，重置当前选中数据为外部的v-model对象
        if (!initSelectors) {
          this.selects = [...this.value]
        } else {
          this.selects = initSelectors
        }
        this.defaultCheckedKeys = this.selects.extractByKey('id')
        this.reset()
      },
      onHide(sure) {
        // 在隐藏选择器时，如果点击的是确定按钮，则将当前选中数据更新到外部的v-model对象上
        if (sure) {
          this.$emit('input', this.selects)
        }
      },
      getQueryFilter(isPageChange) {
        let queryFilter = {
          querys: [],
          pageBean: this.paging,
        }

        if (
          this.quickSearchProps &&
          this.quickSearchProps.constructor == String &&
          this.searchWord
        ) {
          //有搜索条件并且不是切换分页的时候，重置分页
          if (!isPageChange) {
            queryFilter.pageBean.page = 1
          }

          let props = this.quickSearchProps.split(',')
          props.forEach((item) => {
            let query = {
              property: item,
              value: this.searchWord,
              group: 'main',
              operation: 'LIKE',
              relation: 'OR',
            }
            queryFilter.querys.push(query)
          })
        }

        return queryFilter
      },
      // 加载数据，根据当前的搜索关键词及分页条件
      load(isPageChange) {
        this.loading = true

        this.$emit('load', this.getQueryFilter(isPageChange), () => {
          this.loading = false
        })
      },
      // 搜索事件
      search() {
        if (this.loading) {
          return
        }
        this.paging = this.oldPaging
        this.load()
      },
      // 重置事件
      reset() {
        this.$emit('reset')
        this.searchWord = null
        this.paging = this.oldPaging
        this.load()
      },
      clear() {
        this.reset()
      },
      handleRowClick(row, column, event) {
        if (this.single) {
          this.selects = [row]
          this.selectedId = row.id
          this.defaultCheckedKeys = []
          this.defaultCheckedKeys.push(this.selectedId)
        } else {
          if (
            !this.$refs.selectorTable ||
            !this.$refs.selectorTable.selection
          ) {
            throw this.$t('ht.selector.notGetData')
          }
          let _tag = true
          this.$refs.selectorTable.selection.forEach((m) => {
            if (m === row) {
              // 已选中该行时，取消选中状态
              this.$refs.selectorTable.toggleRowSelection(row, false)
              _tag = false
            }
          })
          // 非取消选中情况下，将当前行设置为选中状态
          _tag && this.$refs.selectorTable.toggleRowSelection(row)
          this.syncSelection2selects()
        }
        this.$emit('row-click', row, column, event)
      },
      handleTableSelect(selection, row) {
        this.syncSelection2selects()
        this.$emit('select', selection, row)
      },
      handleSizeChange(size) {
        this.paging.pageSize = size
        this.load()
      },
      handleCurrentChange(currentPage) {
        this.paging.page = currentPage
        this.load(true)
      },
      move(direct) {
        let selectedAry = this.$refs.selectTree.getCheckedNodes()
        // 将调整顺序之后的数组赋值给Tree
        this.selects = utils.arrayMove(this.selects, selectedAry, direct)
        setTimeout(() => {
          // 调整顺序后恢复勾选状态
          this.$refs.selectTree.setCheckedNodes(selectedAry)
        })
      },
      removeSelected() {
        let selectedAry = this.$refs.selectTree.getCheckedNodes()
        selectedAry.forEach((item) => {
          this.selects.remove(item)
        })
        this.syncCheckedStatus()
      },
      clearAllSelects() {
        this.selects = []
        this.syncCheckedStatus()
      },
    },
  }
</script>
<style lang="scss" scoped>
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 23px;
    padding-left: 0px;
    padding-right: 0px;
  }
  .e_c {
    background: #fff;
    width: 100%;
    border: 1px solid #eee;
  }

  .right-aside {
    border-left: 1px solid #eee;
  }

  .select-aside {
    border-left: 1px solid #eee;
  }

  .select-header {
    border-bottom: 1px solid #eee;
    height: 52px !important;
  }

  .select-header > span {
    padding: 10px 0;
    line-height: 53px;
  }

  .select-tree-div {
    height: calc(100% - 60px);
  }

  .selector-button-group {
    width: 60px;
    height: 170px;
    margin: 0px auto;
    position: relative;
    top: 50%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  .selector-button-group > button {
    display: block;
    margin: 8px 0;
  }

  .ht-selector__main {
    padding: 0;
    overflow: hidden;
  }

  ::v-deep .el-footer {
    padding: 10px 20px;
    overflow: hidden;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -ms-flex-negative: 0;
    flex-shrink: 0;
  }

  ::v-deep .el-tree__empty-text {
    font-size: 13px;
  }

  ::v-deep .el-pagination__sizes {
    margin-top: -2px;
  }

  ::v-deep span.el-radio__label {
    display: none;
  }

  .pagination-class ::v-deep {
    padding: 10px;
  }

  .pagination-class ::v-deep .el-pagination__total {
    margin-right: 5px;
  }

  .pagination-class ::v-deep .el-pagination__sizes {
    margin-right: 5px;
  }

  .pagination-class ::v-deep .el-pagination__jump {
    margin-left: 10px;
  }
  //分页样式
  .ht-footer__pagination {
    .el-pagination span:not([class*='suffix']),
    .el-pagination button {
      font-size: 12px;
    }
    .el-pagination__total,
    .el-pagination__sizes {
      margin-right: 5px;
    }
    .el-pagination__sizes {
      .el-input .el-input__inner {
        font-size: 12px;
        height: 24px !important;
        line-height: 24px;
      }
    }
  }
  //查询样式
  .ht-header__search {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    .ht-header__input {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
  //table样式
  .ht-selector__table {
    width: 100%;
    height: 100%;
    ::v-deep .el-table__body-wrapper {
      height: calc(100% - 45px);
      overflow: auto;
      @include base-scrollbar;
    }
  }
  //选择器上移下移删除清空按钮样式
  .selector-button-group {
    width: 60px;
    height: 170px;
    margin: 0px auto;
    position: relative;
    top: 50%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);

    button {
      display: block;
      margin: 8px 0;
    }
  }
</style>
