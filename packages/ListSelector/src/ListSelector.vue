<template>
  <el-row class="list-selector__container" :gutter="20">
    <el-col
      v-show="!isSearchMode"
      class="list-selector__range"
      :span="rangeSpan"
    >
      <slot name="range"></slot>
    </el-col>
    <el-col class="list-selector__main" :span="mainSpan">
      <el-card shadow="hover">
        <div slot="header" class="selector-main__header">
          <span>{{ `${title}${userListCount}` }}</span>
        </div>
        <div class="selector-main__body">
          <el-scrollbar v-if="data.length > 0" class="selector-list__scroll">
            <el-checkbox
              v-if="!single"
              v-model="checkAll"
              class="check-all"
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
            >
              全选
            </el-checkbox>
            <ul
              class="selector-main__list"
              :class="{ 'two-columns': isSearchMode }"
            >
              <li
                v-for="(item, index) in data"
                :key="item[primaryFieldProp] + index + item.code"
              >
                <div class="selector-main__item" @click="handleRowClick(item)">
                  <el-radio
                    v-if="single"
                    v-model="singleSelectedPrimary"
                    :label="item[primaryFieldProp]"
                  ></el-radio>
                  <el-checkbox
                    v-else
                    v-model="multipleSelectedPrimary"
                    :label="item[primaryFieldProp]"
                  ></el-checkbox>
                  <slot name="detail" :item="item"></slot>
                </div>
              </li>
            </ul>
          </el-scrollbar>
          <div v-else class="list-selector__nodata">
            <el-image :src="noDataImg"></el-image>
            <span>{{ t('el.table.emptyText') }}</span>
          </div>
          <div v-if="data.length > 0" class="selector-main__pager">
            <el-pagination
              layout="sizes,prev, pager, next"
              :disabled="loading"
              :page-sizes="pageSizeArr"
              :page-size="pagination.pageSize"
              :pager-count="5"
              :total="pagination.total"
              :current-page="pagination.page"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
            ></el-pagination>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col class="list-selector__selected" :span="7">
      <el-card shadow="hover">
        <div slot="header" class="selector-selected__header">
          <span>{{ $t('ht.common.selected') }}({{ selectsCount }})</span>
          <el-button type="text" @click="clearAllSelects">
            {{ $t('ht.common.clear') }}
          </el-button>
        </div>
        <el-scrollbar v-if="selectsCount > 0" class="selector-selected__scroll">
          <draggable
            v-model="selects"
            class="selector-selected__wrap"
            tag="ul"
            v-bind="dragOptions"
            handle=".list-selector__handle"
            @start="isDragging = true"
            @end="isDragging = false"
          >
            <transition-group type="transition" name="flip-list">
              <li
                v-for="(select, selectIndex) in selects"
                :key="select[primaryFieldProp] + selectIndex"
                class="selector-selected__item"
              >
                <div
                  class="selector-selected__item-left"
                  @dblclick="removeSelected(select)"
                >
                  <ht-icon
                    v-if="!single"
                    name="sort"
                    class="list-selector__handle"
                  />
                  <slot name="selected" :select="select"></slot>
                </div>
                <ht-icon
                  name="close"
                  class="selector-selected__remove"
                  :title="t('ht.common.remove')"
                  @click="removeSelected(select)"
                />
              </li>
            </transition-group>
          </draggable>
        </el-scrollbar>
        <div v-else class="el-tree__empty-block">
          <span class="el-tree__empty-text">{{ t('el.table.emptyText') }}</span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
  import Locale from '@/mixins/locale'
  import mobileMode from '@/mixins/mobileMode.js'
  import { debounce, cloneDeep } from 'lodash'
  import utils from '@/utils.js'
  const draggable = require('vuedraggable')

  export default {
    name: 'HtListSelector',
    components: { draggable },
    mixins: [Locale, mobileMode],
    props: {
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
      title: {
        type: String,
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
            pageSize: 50,
            total: 0,
          }
        },
      },
      //唯一标识字段
      primaryField: {
        type: String,
        default: '',
      },
      mode: {
        type: String,
      },
    },
    data() {
      return {
        isDragging: false,
        loading: false,
        selects: [],
        currentSelectData: [],
        noDataImg: require('@/assets/no-data.png'),
        pageSizeArr: [10, 20, 50, 100, 200, 300],
        checkAll: false,
        isIndeterminate: false,
      }
    },
    computed: {
      isSearchMode: function() {
        return this.mode && this.mode == 'search'
      },
      singleSelectedPrimary: {
        get() {
          return this.selects && this.selects.length == 1
            ? this.selects[0][this.primaryFieldProp]
            : null
        },
        set() {},
      },
      multipleSelectedPrimary: {
        get() {
          return this.selects.map((select) => select[this.primaryFieldProp])
        },
        set() {},
      },
      primaryFieldProp: function() {
        return this.primaryField ? this.primaryField : 'id'
      },
      dragOptions() {
        return {
          animation: 0,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost',
        }
      },
      rangeSpan() {
        return this.isSearchMode ? 0 : 6
      },
      mainSpan() {
        return this.isSearchMode ? 17 : 11
      },
      currentPageSelectedCount() {
        return this.single
          ? this.singleSelectedPrimary
            ? 1
            : 0
          : this.multipleSelectedPrimary.length > 0 && this.data.length > 0
          ? this.data.filter(
              (d) =>
                this.multipleSelectedPrimary.indexOf(d[this.primaryFieldProp]) >
                -1
            ).length
          : 0
      },
      selectsCount() {
        return this.selects && this.selects.length > 0 ? this.selects.length : 0
      },
      userListCount() {
        return this.pagination.total > 0
          ? `(${this.currentPageSelectedCount}/${this.pagination.total})`
          : ''
      },
    },
    watch: {
      selects: {
        handler(val) {
          this.currentSelectData = val
          this.$emit('current-selected', val)
        },
        deep: true,
      },
      currentPageSelectedCount(val) {
        this.checkAll = val === this.data.length
        this.isIndeterminate = val > 0 && val < this.data.length
      },
      data: {
        handler(val) {
          this.checkAll = this.currentPageSelectedCount === val.length
          this.isIndeterminate =
            this.currentPageSelectedCount > 0 &&
            this.currentPageSelectedCount < val.length
        },
        deep: true,
      },
    },
    methods: {
      getSelectedData() {
        return this.currentSelectData
      },
      // 同步已选行到已选数据中去
      syncSelection2selects(row) {
        // 当前在已选数组中，则移除选中状态
        const index = this.selects.findIndex(
          (select) =>
            select[this.primaryFieldProp] == row[this.primaryFieldProp]
        )
        if (index > -1) {
          this.selects.splice(index, 1)
        } else {
          // 复制一份当前已选数据
          let tmpSelects = [...this.selects]
          // 将剩余的已选数据与当前选中的数据合并
          tmpSelects = [...tmpSelects, row]
          // 数组去重
          this.selects = tmpSelects.unique(this.primaryFieldProp)
        }
      },
      onShow(initSelectors) {
        // 每一次显示选择器时，重置当前选中数据为外部的v-model对象
        if (!initSelectors) {
          this.selects = [...this.value]
        } else {
          this.selects = initSelectors
        }
      },
      onHide(sure) {
        // 在隐藏选择器时，如果点击的是确定按钮，则将当前选中数据更新到外部的v-model对象上
        if (sure) {
          this.$emit('input', this.selects)
        }
      },
      // 处理单击数据行的事件(加上防抖，避免用户点击复选框时因为连续触发2次导致无法选中)
      handleRowClick: debounce(function(row) {
        if (this.single) {
          this.selects = [row]
        } else {
          this.syncSelection2selects(row)
        }
        this.$emit('row-click', row)
      }, 10),
      handleCurrentChange(currentPage) {
        this.$emit('page-change', currentPage)
      },
      handleSizeChange(size) {
        this.$emit('size-change', size)
      },
      removeSelected(item) {
        this.selects.remove(item)
      },
      clearAllSelects() {
        this.selects = []
      },
      handleCheckAllChange(val) {
        if (val) {
          const currentPageData = cloneDeep(this.data)
          this.selects = this.selects.length
            ? utils.uniqueArrayObject(
                [...this.selects, ...currentPageData],
                this.primaryFieldProp
              )
            : currentPageData
        } else {
          if (this.selects.length > this.data.length) {
            const cancelSelectedIds = this.data.map((it) => it.id)
            this.selects = this.selects.filter(
              (item) => !cancelSelectedIds.includes(item.id)
            )
          } else {
            this.selects = []
          }
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .list-selector__container {
    height: 100%;

    ::v-deep {
      .el-card__header {
        background-color: #fcfcfc;
        padding: 0 20px;
        height: 48px;
        line-height: 48px;
      }
      .el-card__body {
        height: 480px;
        padding: 0;
      }
      .el-scrollbar {
        height: 100%;

        .el-scrollbar__wrap {
          overflow-x: hidden;
        }
      }
    }

    .list-selector__range {
      height: 100%;
    }
    .list-selector__main {
      height: 100%;

      .list-selector__nodata {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .el-image {
          width: 80%;
          margin-top: 20px;
        }
        span {
          color: #909399;
          font-size: 12px;
        }
      }

      .selector-main__header {
        span {
          color: #333;
          font-size: 14px;
          font-weight: bold;
        }
      }
      .selector-main__body {
        height: 100%;

        .selector-list__scroll {
          height: calc(100% - 42px);
        }
        .check-all {
          padding: 16px 20px 2px 20px;
        }
        .selector-main__list {
          list-style: none;
          padding: 10px 20px;

          li + li {
            margin-top: 10px;
          }

          li {
            line-height: 20px;
            break-inside: avoid;
          }

          &.two-columns {
            columns: 2;
          }
        }

        .selector-main__item {
          cursor: default;
          display: flex;
          align-items: center;

          &:hover {
            background-color: #f8f8f8;
          }

          .el-checkbox,
          .el-radio {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 0;
          }

          .el-radio {
            ::v-deep {
              .el-radio__label {
                display: none;
              }
            }
          }
          .el-checkbox {
            ::v-deep {
              .el-checkbox__label {
                display: none;
              }
            }
          }

          .vue-avatar--wrapper {
            margin-left: 10px;
          }
        }

        .selector-main__pager {
          border-top: 1px solid #e6e6e6;
          height: 42px;

          .el-pagination {
            height: 38px;
            display: flex;
            justify-content: center;
            align-items: center;
            ::v-deep {
              .el-pager {
                line-height: 25px;
              }
              .el-select .el-input {
                width: 86px;

                .el-input__inner {
                  text-align: left;
                  padding-left: 10px;
                  padding-right: 0;
                  border-radius: 2px;
                  color: #333;
                  background: #f4f4f5;
                  border: none;
                }
                .el-select__caret {
                  color: #333;
                }
              }
              .el-pagination__sizes {
                .el-icon-arrow-up:before {
                  content: '\e78f';
                }
              }
            }
          }
        }
      }
    }
    .list-selector__selected {
      height: 100%;

      .selector-selected__header {
        display: flex;
        justify-content: space-between;

        span {
          color: #333;
          font-size: 14px;
          font-weight: bold;
        }
      }

      .selector-selected__wrap {
        list-style: none;
        width: calc(100% - 20px);
        padding: 10px;

        li {
          line-height: 20px;
        }

        li + li {
          margin-top: 10px;
        }

        .selector-selected__item {
          height: 36px;
          padding: 0 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          &:hover {
            background-color: #f8f8f8;
          }

          .selector-selected__remove {
            &:hover {
              color: #dd6161;
            }
          }

          .selector-selected__item-left {
            display: flex;
            align-items: center;

            .list-selector__handle {
              cursor: move;
            }

            div {
              margin-left: 10px;
            }
          }
        }
      }
      .el-tree__empty-block {
        height: 80px;
      }
    }
    .flip-list-move {
      transition: transform 0.5s;
    }
  }
</style>
