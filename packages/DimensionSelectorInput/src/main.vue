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
    <ht-dimension-selector
      v-model="value"
      :validate="validate"
      select-label="name"
      :placeholder="placeholder"
      :permission="permission_sub"
      :single="single"
      :config="config"
      :name="inputName"
      :data="data"
      :pagination="pagination"
      :append-to-body="appendToBody"
      :quick-search-props="quickSearchProps"
      :mode="mode"
      @valueChange="valueChange"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('select-data', data)"
    ></ht-dimension-selector>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtDimensionSelectorInput',
    mixins: [permission, inputName, form],
    props: {
      value: String,
      single: Boolean,
      config: Object,
      appendToBody: {
        type: Boolean,
        default: false,
      },
      pageSize: {
        type: Number,
        default: 20,
      },
      quickSearchProps: {
        type: String,
        default: 'demName,demCode',
      },
    },
    data() {
      return {
        data: [],
        mode: 'search', // 搜索模式
        searchWord: null,
        pagination: {
          page: 1,
          pageSize: this.pageSize,
          total: 0,
          showTotal: true,
        },
      }
    },
    mounted() {
      if (!this.data || this.data.length == 0) {
        this.handleLoad()
      }
    },
    methods: {
      getQueryFilter(page) {
        const queryFilter = {
          querys: [],
          pageBean: this.getPageBean(page),
        }

        if (
          this.quickSearchProps &&
          this.quickSearchProps.constructor == String &&
          this.searchWord
        ) {
          const props = this.quickSearchProps.split(',')
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
      handleLoad(page) {
        const param = this.getQueryFilter(page)
        this.data = this.data || []
        this.loadAllDimension(param)
      },
      // 加载全部岗位
      loadAllDimension(param) {
        this.$requestConfig.getDimensionList(param).then((data) => {
          const { rows, page, pageSize, total } = data
          if (this.isMobile && page > 1) {
            this.data = this.data.concat(rows)
          } else {
            this.data = rows
          }
          this.pagination.page = page
          this.pagination.pageSize = pageSize
          this.pagination.total = total
        })
      },

      valueChange(value) {
        this.$emit('input', value)
      },
      handleChange(data) {
        this.$emit('change', data)
      },
      handleSearch(word) {
        if (!word || !word.trim()) {
          this.handleReset()
          return
        }
        // 存储搜索关键词
        this.searchWord = word
        // 进入搜索模式
        this.mode = 'search'
        this.handleLoad()
      },
      handleReset() {
        // 置空搜索关键词
        this.searchWord = null
        // 退出搜索模式
        this.mode = 'search'
        this.handleLoad()
      },
      handlePageChange(page) {
        // 搜索模式下或者未进行过滤时，查询所有数据
        this.handleLoad(page)
      },
      handleSizeChange(size) {
        this.pagination.pageSize = size
        this.handlePageChange(this.pagination.page)
      },
      // 获取查询参数中的分页信息(不传page时默认查询第一页)
      getPageBean(page) {
        const pageBean = { ...this.pagination }
        delete pageBean['total']
        pageBean.page = page || 1
        return pageBean
      },
    },
  }
</script>
