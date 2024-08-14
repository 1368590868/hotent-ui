<template>
  <el-table-column
    v-if="!hiddenCol"
    :type="type"
    :align="align"
    :prop="prop"
    :label="label"
    :width="widthVal"
    :min-width="minWidth"
    :index="index"
    :sortable="columnSortable"
    :filters="filters"
    :filtered-value="filteredValue"
    :filter-method="filterMethod"
    :column-key="prop"
    :formatter="columnFormatter"
    :render-header="columnRenderHeader"
    :show-overflow-tooltip="showOverflowTooltip"
    :class-name="className"
    :fixed="fixed"
    :reserve-selection="reserveSelection"
    :resizable="resizable"
  ></el-table-column>
</template>
<script>
  export default {
    name: 'HtTableColumn',
    componentName: 'HtTableColumn',
    props: {
      resizable: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        validator: (val) => {
          return ['selection', 'index', 'expand'].indexOf(val) !== -1
        },
      },
      align: {
        default: 'center',
        validator: (val) => {
          return ['left', 'center', 'right'].indexOf(val) !== -1
        },
      },
      prop: String,
      label: String,
      width: String,
      minWidth: String,
      index: [Number, Function],
      sortable: {
        type: Boolean,
        default: false,
      },
      filters: Array,
      showOverflowTooltip: {
        type: Boolean,
        default: false,
      },
      fixed: {
        type: [Boolean, String],
        default: false,
        validator: (val) => [true, false, 'left', 'right'].indexOf(val) != -1,
      },
      formatter: Function,
      renderHeader: Function,
      hidden: {
        type: Boolean,
        default: false,
      },
      required: {
        type: Boolean,
        default: false,
      },
      filteredValue: Array,
      filterMethod: Function,
      className: String,
      reserveSelection: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        hiddenCol: null,
        formatterObj: null,
        renderHeaderObj: null,
        curWidth: null,
      }
    },
    computed: {
      hiddenVal() {
        return this.required
          ? false
          : this.hiddenCol != null
          ? this.hiddenCol
          : this.hidden
      },
      widthVal() {
        return this.curWidth ? this.curWidth : this.width
      },
      columnSortable: {
        get() {
          return this.sortable ? 'custom' : this.sortable
        },
      },
      columnFormatter: {
        get() {
          if (
            this.formatter ||
            this.formatterObj ||
            !this.$scopedSlots.default
          ) {
            let formatter = this.formatter ? this.formatter : this.formatterObj
            if (this.$scopedSlots.default) {
              /* eslint-disable */
              this.formatterObj = (row, column, cellValue, index) => {
                return this.$scopedSlots.default({
                  row,
                  column,
                  cellValue: formatter(row, column, cellValue, index),
                  index,
                })
              }
              return this.formatterObj
            } else {
              return formatter
            }
          } else {
            /* eslint-disable */
            this.formatterObj = (row, column, cellValue, index) => {
              return this.$scopedSlots.default({
                row,
                column,
                cellValue,
                index,
              })
            }
            /* eslint-disable */
            return this.formatterObj
          }
        },
      },
      columnRenderHeader: {
        get() {
          if (
            this.renderHeader ||
            this.renderHeaderObj ||
            !this.$scopedSlots.header
          ) {
            return this.renderHeader ? this.renderHeader : this.renderHeaderObj
          } else {
            const headerCB = this.$scopedSlots.header
            /* eslint-disable */
            this.renderHeaderObj = (h, { column, $index }) => {
              return headerCB({ column, $index })
            }
            /* eslint-disable */
            return this.renderHeaderObj
          }
        },
      },
    },
    created() {
      this.$on('customColumn', (columns) => {
        const column = columns.find(
          (c) =>
            (this.prop && this.prop == c.key) ||
            (!this.prop && this.label && this.label == c.value)
        )
        if (column && !column.checked) {
          this.hiddenCol = true
        } else {
          this.hiddenCol = null
        }

        if (column && column.width && this.width !== column.width) {
          const oldHiddenCol = this.hiddenCol
          this.curWidth = column.width
          this.hiddenCol = true
          // 调整宽度时内容可能没有适配新宽度，通过先隐藏再显示列的方式实现适配
          this.$nextTick(() => {
            this.hiddenCol = oldHiddenCol
          })
        }
      })
    },
  }
</script>
