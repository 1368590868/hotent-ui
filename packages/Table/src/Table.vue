<template>
  <el-main ref="tablePanel" class="ht-table-panel">
    <div
      v-if="!noHeader && !justShowSearch"
      ref="toolbarPanel"
      class="toolbar-panel"
    >
      <div
        v-if="!justShowSearch"
        class="toolbar-panel__search"
        :class="{ 'ht-quick__search': !hideTableSearch }"
      >
        <ht-input
          v-if="quickSearchConfig && quickSearchConfig.length > 0"
          ref="quickSearch"
          v-model.lazy="quickSearchWord"
          class="quick-search"
          :style="quickSearchWidthStyle"
          :placeholder="quickSearchPlaceholder"
          :autofocus="true"
          :disabled="loading || showAdvancedSearch"
          :debounce="2000"
          suffix-icon="el-icon-search"
          style="margin-right: 20px"
          @keydown.enter.native="doQuickSearch"
          @click.native="clickQuickSearch"
        ></ht-input>
        <div class="common-tools">
          <el-button
            v-if="hasSearchPanel && !justShowSearch"
            class="advance-search__button"
            @click="showAdvancedSearch = !showAdvancedSearch"
          >
            {{
              showAdvancedSearch
                ? $t('ht.table.baseSearch')
                : $t('ht.table.baseSearch')
            }}
            <i
              :class="
                showAdvancedSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
              "
            ></i>
          </el-button>
          <el-tooltip
            v-if="showExport"
            :content="$t('ht.table.exportData')"
            placement="top"
          >
            <el-button @click="$emit('export')">
              <ht-icon name="arrow" />
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('ht.table.refresh')" placement="top">
            <el-button
              icon="el-icon-refresh"
              class="refresh-btn-icon"
              @click="load(true)"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            v-if="showCustomColumn && !isCardView"
            :content="$t('ht.table.customColumn')"
            placement="top"
          >
            <el-button @click="customColumnDialogVisible = true">
              <ht-icon name="setting" />
            </el-button>
          </el-tooltip>
          <el-button-group v-if="multiViewSwitch" class="multiview-switcher">
            <el-tooltip :content="$t('ht.table.cardView')" placement="top">
              <el-button
                :type="isCardView ? 'primary' : 'default'"
                @click="isCardView = true"
              >
                <ht-icon name="block" />
              </el-button>
            </el-tooltip>
            <el-tooltip :content="$t('ht.table.tableView')" placement="top">
              <el-button
                :type="isCardView ? 'default' : 'primary'"
                @click="isCardView = false"
              >
                <ht-icon name="line" />
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
      </div>
    </div>
    <el-collapse-transition>
      <div
        v-show="showAdvancedSearch || justShowSearch"
        ref="searchPanel"
        class="search-panel"
      >
        <slot name="search"></slot>
      </div>
    </el-collapse-transition>
    <div v-if="hasToolBar" ref="toolbarContainer" class="toolbar-container">
      <slot name="toolbar"></slot>
    </div>
    <el-table
      v-if="!isCardView"
      ref="htTable"
      v-loading="loading && !noLoading"
      :stripe="stripe"
      border
      class="ht-table"
      :class="{ 'no-data-table': data.length < 1 }"
      :data="data"
      :size="size"
      :empty-text="emptyText"
      :show-header="showHeader"
      :max-height="tableMaxHeight ? tableMaxHeight : 400"
      :tooltip-effect="tooltipEffect"
      :default-querys="defaultQuerys"
      :header-row-class-name="headerRowClassName"
      :header-cell-class-name="headerCellClassName"
      :highlight-current-row="highlightCurrentRow"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :style="{
        height: `${
          isDataView ? auto : tableMaxHeight ? tableMaxHeight + 'px' : '400px'
        }`,
      }"
      :row-key="rowKey"
      @row-click="handleRowClick"
      @select="handleTableSelect"
      @select-all="handleTableSelect"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      @selection-change="(selection) => $emit('selection-change', selection)"
    >
      <el-table-column
        v-if="selectable"
        type="selection"
        align="center"
        :reserve-selection="reserveSelection"
        width="45"
      />
      <slot></slot>
      <template slot="empty">
        <el-image :src="tableNoDataImg"></el-image>
        <p class="no-data-text">{{ emptyText || t('el.table.emptyText') }}</p>
      </template>
    </el-table>
    <div
      v-else
      v-loading="loading && !noLoading"
      class="ht-card"
      :style="{ height: `${tableMaxHeight}` + 'px' }"
    >
      <template v-if="loading || (data && data.length > 0)">
        <div v-if="cardItemMode" class="ht-card__container">
          <el-card
            v-for="(item, index) in data"
            :key="index"
            shadow="hover"
            @click.native="$emit('card-click', item)"
          >
            <slot name="card" :item="item"></slot>
          </el-card>
        </div>
        <div v-else>
          <slot name="card" :data="data"></slot>
        </div>
      </template>
      <div v-else class="el-table__empty-block">
        <template v-if="data.length < 1 && !emptyText">
          <slot name="empty-card"></slot>
        </template>
        <span v-else-if="emptyText" class="el-table__empty-text">
          {{ emptyText || t('el.table.emptyText') }}
        </span>
      </div>
    </div>
    <div v-if="!nopagination" ref="paginationPanel" class="pagination-panel">
      <el-row type="flex" :justify="tablePaginationJustify">
        <el-pagination
          :small="small"
          :class="{ 'page-sizes__hidden': hidePageSizes }"
          :disabled="loading"
          :current-page="pagination.page"
          :page-sizes="pageSizes"
          :page-size="pagination.pageSize"
          :pager-count="pagerCount"
          :background="$paginationBackground"
          :layout="layout"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </el-row>
    </div>
    <custom-column
      :custom-columns="customColumns"
      :visible.sync="customColumnDialogVisible"
      @apply-custom-column="handleApplyCustomColumn"
    ></custom-column>
  </el-main>
</template>
<script>
  import Locale from '@/mixins/locale'
  import Emitter from '@/mixins/emitter'
  import utils from '@/utils.js'
  import CustomColumn from './CustomColumn.vue'
  import elementResizeDetectorMaker from 'element-resize-detector'
  export default {
    name: 'HtTable',
    components: { CustomColumn },
    mixins: [Locale, Emitter],
    props: {
      //是否使用小型分页样式
      small: {
        type: Boolean,
        default: false,
      },
      size: {
        type: String,
        default: 'mini',
      },
      tooltipEffect: {
        type: String,
        default: 'dark',
      },
      justShowSearch: {
        //为true时只显示高级搜索中的查询条件
        type: Boolean,
        default: false,
      },
      paginationJustify: {
        type: String,
        default: 'start',
        validator: function(value) {
          return ['start', 'end', 'center'].indexOf(value) !== -1
        },
      },
      data: Array,
      showHeader: {
        type: Boolean,
        default: true,
      },
      pageResult: {
        type: Object,
        default: () => {
          return { page: 1, pageSize: 50, total: 0 }
        },
      },
      pageSizes: {
        type: Array,
        default: () => {
          return [10, 20, 50, 100, 200, 300]
        },
      },
      pagerCount: {
        type: Number,
        default: 7,
      },
      nopagination: {
        type: Boolean,
        default: false,
      },
      highlightCurrentRow: {
        type: Boolean,
        default: false,
      },
      selectable: {
        type: Boolean,
        default: true,
      },
      quickSearchProps: [String, Array],
      headerRowClassName: [String, Function],
      headerCellClassName: [String, Function],
      rowClassName: [String, Function],
      cellClassName: [String, Function],
      showExport: {
        type: Boolean,
        default: false,
      },
      showCustomColumn: {
        type: Boolean,
        default: true,
      },
      defaultQuerys: {
        type: Array,
        default() {
          return []
        },
      },
      defaultSorter: {
        type: Array,
        default() {
          return []
        },
      },
      isLoadTable: {
        //是否默认在mounted函数中请求table数据
        type: Boolean,
        default: true,
      },
      quickSearchWidth: {
        type: Number,
        default: 400,
      },
      customTableHeight: {
        type: [String, Number], //自定义传入固定高度
        validator: (val) => {
          if (typeof val == 'number') {
            return val > 0
          } else if (typeof val == 'string') {
            const numVal = Number(val)
            return !isNaN(numVal) && numVal > 0
          } else {
            return false
          }
        },
      },
      multiViewSwitch: {
        // 是否支持多视图切换
        type: Boolean,
        default: false,
      },
      cardView: {
        // 是否卡片视图
        type: Boolean,
        default: false,
      },
      cardItemMode: {
        // 是否单个卡片模式
        type: Boolean,
        default: true,
      },
      noHeader: {
        // 不显示整个工具栏
        type: Boolean,
        default: false,
      },
      emptyText: String,
      rowClickSelect: {
        // 单击行时是否选中该行数据
        type: Boolean,
        default: true,
      },
      autoFix: {
        //是否在表头高度改变时，触发doLayout操作
        type: Boolean,
        default: false,
      },
      hidePageSizes: {
        type: Boolean,
        default: false,
      },
      tableNoDataImg: {
        type: String,
        default: require('@/assets/table-no-data.png'),
      },
      noLoading: {
        type: Boolean,
        default: false,
      },
      rowKey: {
        type: [Function, String],
      },
      reserveSelection: {
        type: Boolean,
        default: false,
      },
      stripe: {
        type: Boolean,
        default: false,
      },
      layout: {
        type: String,
        default: 'total, sizes, prev, pager, next, jumper',
      },
      isDataView: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        resetDefaultFilter: [], // 重置时需把默认筛选条件重置
        querys: [],
        sorter: null,
        quickSearchWord: null,
        quickSearchPlaceholder: this.$t('ht.table.searchPlaceholder'),
        quickSearchConfig: null,
        hasSearchPanel: false,
        filters: {},
        pagination: { ...this.pageResult },
        tableMaxHeight: 400,
        showAdvancedSearch: false,
        loading: false,
        columns: [],
        customColumns: [],
        customColumnDialogVisible: false,
        selection: [],
        tablePanelHeight: 0,
        isCardView: this.cardView,
      }
    },
    computed: {
      calDefaultQuerys: function() {
        let calQuerys = []
        let query = {
          group: 'defaultQueryGroup',
          operation: 'EQUAL',
          relation: 'AND',
        }
        this.defaultQuerys.forEach((c) => {
          // 如果有重置过筛选条件的 需在默认条件中剔除
          if (
            this.resetDefaultFilter.indexOf(c.property) === -1 &&
            c.property &&
            !this.resetDefaultFilter.some((item) => {
              return c.property.includes(item)
            })
          ) {
            calQuerys.push({ ...query, ...c })
          }
        })
        return calQuerys
      },
      hasToolBar() {
        return this.$slots.toolbar && this.$slots.toolbar.length > 0
      },
      hideTableSearch() {
        const hasQuickSearch =
          this.quickSearchConfig && this.quickSearchConfig.length > 0
        return !this.showAdvancedSearch && !this.hasToolBar && !hasQuickSearch
      },
      customTableHeightNum() {
        return typeof this.customTableHeight == 'number'
          ? this.customTableHeight
          : Number(this.customTableHeight)
      },
      quickSearchWidthStyle() {
        return { width: `${this.quickSearchWidth}` + 'px' }
      },
      tablePaginationJustify() {
        return this.$allPaginationJustify || this.paginationJustify
      },
    },
    watch: {
      justShowSearch: {
        handler(val) {
          if (val) {
            this.showAdvancedSearch = true
          }
        },
        immediate: true,
      },
      isCardView: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.selection = []
          this.$emit('view-change', newVal)
        }
      },
      customTableHeight() {
        this.calcTableHeight()
      },
    },
    created() {
      this.initCustomColumns()
      this.$on('advance-search', (data, isSearchBtn) =>
        this.advanceSearch(data, isSearchBtn)
      )
      setTimeout(() => {
        this.quickSearchProps && this.generateQuickSearchConfig()
      }, 100)
    },
    activated() {
      this.doLayout()
    },
    mounted() {
      // 判断是否有高级搜索面板
      this.hasSearchPanel = !!this.$scopedSlots.search
      if (this.isLoadTable) {
        this.load()
      }
      this.calcTableHeight()
      this.$watch('showAdvancedSearch', (n, o) => {
        if (n !== o) {
          if (n) {
            this.quickSearchWord = null
          }
          // 显示或收起搜索面板时，重新计算表格高度
          this.calcTableHeight(300)
          this.$emit('advanced-show', n)
        }
      })
      this.$watch('pageResult', (n, o) => {
        if (n !== o) {
          this.pagination = { ...n }
        }
      })
      this.$root.$on('resize', () => {
        this.tablePanelHeight = 0
        this.calcTableHeight(300)
      })
      if (this.autoFix) {
        this.addResizeListener()
      }
    },
    methods: {
      setColumns(n) {
        if (n && n.componentOptions) {
          this.columns.push(n.componentOptions.propsData)
        }
        if (n && n.componentOptions && n.componentOptions.children) {
          n.componentOptions.children.forEach((i) => {
            this.setColumns(i)
          })
        }
      },
      initCustomColumns() {
        const me = this
        const ary = []
        setTimeout(() => {
          if (
            !me.$slots ||
            !me.$slots.default ||
            me.$slots.default.length == 0
          ) {
            return
          }
          const count = me.$slots.default.length
          // 从插槽中获取到当前表格的所有列
          me.$slots.default &&
            me.$slots.default.forEach((n, index) => {
              // 将当前表格的列放入一个数组 多表头时需递归改造
              me.setColumns(n)
              if (n && n.componentOptions) {
                const pd = n.componentOptions.propsData
                // 将当前有有prop和label的列放入自定义列表项的数组中
                if (pd.label) {
                  const hasChildren =
                    n.componentOptions.children &&
                    n.componentOptions.children.length > 0
                  ary.push({
                    key: pd.prop || pd.label,
                    value: pd.label,
                    checked:
                      !(pd.hidden === true || pd.hidden === '') ||
                      pd.required === true ||
                      pd.required === '' ||
                      index == count - 1 ||
                      hasChildren,
                    required:
                      pd.required === true ||
                      pd.required === '' ||
                      index == count - 1 ||
                      hasChildren,
                    width: pd.width || 'auto',
                  })
                }
              }
            })
          me.customColumns = ary
        }, 0)
      },
      handleApplyCustomColumn(columns) {
        this.broadcast('HtTableColumn', 'customColumn', columns)
        this.$nextTick(() => {
          setTimeout(() => this.doLayout(), 200)
        })
      },
      doQuickSearch() {
        // 先删除快速查询的查询条件
        this.clearQueryByGroupName('quick')
        this.clearQueryByGroupName('advance')
        this.quickSearchWord &&
          this.quickSearchConfig.forEach((c) => {
            let query = {
              property: c.prop,
              value: this.quickSearchWord.trim(),
              group: 'quick',
              relation: 'OR',
              operation: 'LIKE',
            }
            this.querys.push(query)
          })
        this.load()
      },
      clickQuickSearch($event) {
        if (
          !(this.loading || this.showAdvancedSearch) &&
          $event &&
          $event.target &&
          $event.target.tagName == 'I'
        ) {
          this.$nextTick(() => {
            this.doQuickSearch()
          })
        }
      },
      advanceSearch(data, isSearchBtn) {
        if (this.loading || !this.showAdvancedSearch) {
          return
        }
        this.clearQueryByGroupName('quick')
        this.clearQueryByGroupName('advance')
        data &&
          data.forEach((d) => {
            const shouldPush =
              d.value != null && d.value != undefined && d.value != ''
            // 高级搜索中支持一个搜索框中关联多个属性进行搜索
            if (d.prop.indexOf(',') > 0) {
              const propAry = utils.stringSplit(d.prop, ',')
              if (propAry && propAry.length > 0) {
                const groupName = `group_${propAry[0]}`
                this.clearQueryByGroupName(groupName)
                shouldPush &&
                  propAry.forEach((p) => {
                    this.querys.push({
                      property: p,
                      value: d.value,
                      group: groupName,
                      relation: 'OR',
                      operation: d.operation,
                    })
                  })
              }
            } else {
              shouldPush &&
                this.querys.push({
                  property: d.prop,
                  value: d.value,
                  group: 'advance',
                  relation: d.relation,
                  operation: d.operation,
                })
            }
          })
        this.load('', isSearchBtn)
      },
      // 加载数据
      load(doNotResetPage, isSearchBtn) {
        this.loading = true
        // 默认重置页码为第一页
        if (!doNotResetPage) {
          this.pagination.page = 1
        }
        let param = {
          pageBean: this.pagination,
          sorter: [],
        }

        if (this.sorter && this.sorter.length > 0) {
          param.sorter = this.sorter
        }
        // 处理默认排序字段。只有当用户没有选择排序字段才使用默认排序
        if (this.defaultSorter.length > 0 && param.sorter.length == 0) {
          param.sorter = [...this.defaultSorter]
        }
        // 处理过滤条件
        this.handleFilters()

        if (this.querys && this.querys.length > 0) {
          param.querys = this.querys
        }

        // 处理查询条件
        if (this.calDefaultQuerys.length > 0) {
          if (!param.querys) {
            param.querys = []
          }
          this.calDefaultQuerys.forEach((item) => {
            param.querys.remove(item)
          })
          // 默认查询条件和当前查询条件重复时，取消默认条件
          param.querys = param.querys.concat(
            this.calDefaultQuerys.filter((item) => {
              let index = param.querys.findIndex((sub) => {
                return (
                  sub.property === item.property ||
                  (item.property && item.property.includes(sub.property))
                )
              })
              return index === -1
            })
          )
        }

        const me = this
        // 防止外部没有回调，设置10秒后自动取消加载中的状态
        let waitTime = 10000
        if (!this._events || !this._events.load || !this._events.load.length) {
          // 如果没有绑定在当前组件里的load事件，即组件仅仅作展示数据用 直接取消loading
          waitTime = 0
        }
        const finalTickCB = setTimeout(function() {
          me.loading = false
          this.selection = []
        }, waitTime)

        if (this.nopagination) {
          param.pageBean = {}
        }
        const loadedHandler = () => {
          // 外部已经回调的情况下，取消倒计时
          clearTimeout(finalTickCB)
          me.loading = false
          this.selection = []
          // setTimeout(() => {
          //   me.$refs.quickSearch &&
          //     me.$refs.quickSearch.$children[0].$el.children[0].focus()
          // })
        }

        this.$emit('load', { ...param }, loadedHandler, isSearchBtn)
        this.$emit('loading', { ...param }, loadedHandler, isSearchBtn)
      },
      // 通过列属性获取列标签
      getColumnLabelByProp(prop) {
        let label = null
        if (!prop) {
          return label
        }
        this.columns.forEach((c) => {
          if (c.prop && c.prop === prop) {
            label = c.label
          }
        })
        return label
      },
      // 构建快速搜索配置项
      generateQuickSearchConfig() {
        let labelAry = []
        if (typeof this.quickSearchProps == 'string') {
          const props = utils.stringSplit(this.quickSearchProps, ',')
          this.quickSearchConfig = []
          props.forEach((prop) => {
            const label = this.getColumnLabelByProp(prop)
            if (label) {
              labelAry.push(label)
              this.quickSearchConfig.push({ prop, label })
            }
          })
        }
        if (typeof this.quickSearchProps == 'object') {
          this.quickSearchProps.forEach((prop) => {
            if (prop && prop.label) {
              labelAry.push(prop.label)
            }
          })
          this.quickSearchConfig = [...this.quickSearchProps]
        }
        this.quickSearchPlaceholder = `${this.t(
          'ht.common.enter'
        )}${labelAry.join(',')}${this.t('ht.common.toSearch')}`
      },
      // 通过分组名称清除对应查询条件
      clearQueryByGroupName(groupName) {
        // 待删除的查询条件
        let toDelete = []
        this.querys &&
          this.querys.forEach((query) => {
            if (query.group == groupName) {
              toDelete.push(query)
            }
          })
        toDelete.forEach((d) => {
          this.querys.remove(d)
        })
      },
      handleFilters() {
        this.clearQueryByGroupName('filter')
        // 将过滤条件添加查询参数数组中
        if (this.filters && Object.keys(this.filters).length > 0) {
          Object.keys(this.filters).forEach((k) => {
            const filter = this.filters[k]
            let query = {
              property: k,
              value: filter[0],
              group: 'filter',
              relation: 'AND',
            }
            if (filter.length == 1) {
              query.operation = 'EQUAL'
              this.querys.push(query)
            } else if (filter.length > 1) {
              query.operation = 'IN'
              query.value = filter
              this.querys.push(query)
            }
          })
        }
      },
      handleSizeChange(pageSize) {
        this.pagination = { ...this.pagination, pageSize }
        this.$emit('size-change', pageSize)
        this.load()
      },
      handleCurrentChange(page) {
        this.pagination = { ...this.pagination, page }
        // 翻页时不重置页码
        this.$emit('current-change', page)
        this.load(true)
      },
      handleRowClick(row, column, event) {
        if (this.rowClickSelect) {
          if (this.selection.some((s) => s === row)) {
            this.selection.remove(row)
          } else {
            this.selection.push(row)
          }
          this.$refs.htTable.toggleRowSelection(row)
        }
        this.$emit('row-click', row, column, event)
      },
      handleTableSelect(selection, row) {
        this.selection = selection
        if (row) {
          this.$emit('select', selection, row)
        } else {
          this.$emit('select-all', selection)
        }
      },
      handleSortChange(column) {
        if (!column.order) {
          this.sorter = null
        } else {
          this.sorter = [
            {
              property: column.prop,
              direction: column.order == 'ascending' ? 'ASC' : 'DESC',
            },
          ]
        }
        this.load(true)
        this.$emit('sort-change', column)
      },
      handleFilterChange(m) {
        // 如果是点击的是重置 筛选条件 需把默认的筛选条件里数据也删除掉
        if (m) {
          Object.keys(m).forEach((key) => {
            if (
              m[key] &&
              m[key].length == 0 &&
              this.resetDefaultFilter.indexOf(key) === -1
            ) {
              this.resetDefaultFilter.push(key)
            }
          })
        }
        this.filters = { ...this.filters, ...m }
        Object.keys(this.filters).forEach((k) => {
          if (!this.filters[k] || this.filters[k].length == 0) {
            delete this.filters[k]
          }
        })
        this.load()
        this.$emit('filter-change', m)
      },
      doLayout() {
        this.$nextTick(() => {
          this.$refs.htTable && this.$refs.htTable.doLayout()
        })
      },
      initTablePanelHeight() {
        this.tablePanelHeight = this.$refs.tablePanel.$el.clientHeight
      },
      calcTableHeight(delay) {
        // 动态计算表格的高度，自适应当前容器
        setTimeout(() => {
          const toolbarPanelHeight =
            (this.$refs.toolbarPanel && this.$refs.toolbarPanel.clientHeight) ||
            0

          const searchPanelHeight =
            (this.$refs.searchPanel && this.$refs.searchPanel.clientHeight) || 0

          const toolbarContainerHeight =
            (this.$refs.toolbarContainer &&
              this.$refs.toolbarContainer.clientHeight) ||
            0

          const paginationPanelHeight =
            (this.$refs.paginationPanel &&
              this.$refs.paginationPanel.clientHeight) ||
            0
          // 下外边距
          const searchPanelBottom = searchPanelHeight > 0 ? 20 : 0
          const toolbarPanelBottom = toolbarPanelHeight > 0 ? 20 : 0
          const toolbarContainerBottom = toolbarContainerHeight > 0 ? 20 : 0

          //2为边框
          // 表格之外的高度
          const tableOuterHeight =
            toolbarPanelHeight +
            toolbarPanelBottom +
            searchPanelHeight +
            searchPanelBottom +
            toolbarContainerHeight +
            toolbarContainerBottom +
            paginationPanelHeight +
            15

          if (this.$refs.tablePanel) {
            this.tablePanelHeight = this.$refs.tablePanel.$el.clientHeight || 0
          }
          if (this.customTableHeightNum) {
            this.tableMaxHeight = this.customTableHeightNum - tableOuterHeight
          } else {
            if (!this.$refs.tablePanel) {
              return
            }
            if (this.tablePanelHeight == 0) {
              this.initTablePanelHeight()
            }
            const tableHeight = this.tablePanelHeight - tableOuterHeight
            this.tableMaxHeight = tableHeight
          }
        }, delay || 0)
      },
      addResizeListener() {
        //监听表头高度变化，如果
        this.$nextTick(() => {
          let erd = elementResizeDetectorMaker()
          erd.listenTo(
            this.$refs.htTable.$refs.headerWrapper.getElementsByTagName(
              'tr'
            )[0],
            this.doLayout
          )
        })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .ht-table-panel {
    padding: 0px;
    height: 100%;
    overflow: hidden;

    .toolbar-panel,
    .toolbar-container {
      margin-bottom: 16px;
      box-sizing: border-box;
    }

    .search-panel {
      background-color: #f9f9f9;
      padding: 16px 16px 10px 16px;
      margin-bottom: 16px;
      box-sizing: border-box;
    }
  }

  .ht-table {
    width: 100%;
    //min-height: 500px;
  }
  .no-data-table {
    ::v-deep .el-table__body-wrapper {
      height: 100%;
      .el-table__empty-text {
        line-height: unset;
      }
      .no-data-text {
        margin: 8px 0;
        line-height: 20px;
        font-size: 14px;
      }
    }
  }
  .ht-card {
    .el-table__empty-block {
      height: 100%;
    }
  }
  .toolbar-panel__search {
    display: flex;
    justify-content: space-between;
  }

  .search-container__col {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    flex-direction: row;
    align-items: center;
  }

  .ht-quick__search {
    margin-bottom: 15px;
    max-height: 32px;
  }

  .quick-search {
    margin-right: 20px;
  }

  .quick-search + .el-divider {
    margin-right: 20px;
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-input-group__append {
    border-radius: 0;
  }

  .common-tools {
    display: flex;
    justify-content: flex-end;

    .el-button-group {
      margin: 0 0 0 16px;
    }

    .el-button {
      padding: 6px;
      border-radius: 0;
    }
    ::v-deep.el-button.refresh-btn-icon {
      i {
        font-size: 16px;
      }
    }
    .advance-search__button {
      padding: 6px 12px;
    }
  }

  ::v-deep .ht-table .sort-caret.descending {
    bottom: 0px;
  }

  ::v-deep .ht-table .sort-caret.ascending {
    top: -2px;
  }

  ::v-deep .ht-table .caret-wrapper {
    height: 20px;
  }

  ::v-deep .ht-table .el-table__column-filter-trigger {
    line-height: 20px;
  }

  .pagination-panel {
    padding: 10px 0;
  }

  .multiview-switcher {
    width: 59px;
    height: 32px;
    overflow: hidden;
  }

  .ht-card {
    @include base-scrollbar;
    overflow: auto;

    .ht-card__container {
      &::after {
        content: '';
        display: block;
        clear: both;
      }

      .el-card {
        cursor: pointer;
        float: left;
        margin: 8px;

        ::v-deep .el-card__body {
          padding: 16px;
        }
      }
    }
  }

  .page-sizes__hidden {
    ::v-deep .el-pagination__sizes {
      display: none;
    }
  }
  //给固定列设置下边距
  .el-table {
    .el-table__fixed {
      height: auto !important;
      bottom: 8px !important; //具体值是多少根据你横向滚动条的高度进行设置
    }
  }
  //去掉固定列下方的横线
  .el-table__fixed::before,
  .el-table__fixed-right::before {
    display: none;
  }
  ::v-deep .el-table--scrollable-x .el-table__body-wrapper {
    overflow-x: auto;
    z-index: 0;
  }
  ::v-deep .el-table__body-wrapper {
    height: 100%;
  }
</style>
