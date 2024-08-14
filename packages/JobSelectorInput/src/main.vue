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
    <ht-job-selector
      v-model="value"
      :title="title"
      :form-inputs-display="formInputsDisplay"
      :validate="validate"
      select-label="name"
      :placeholder="placeholder"
      :permission="permission_sub"
      :single="single"
      :config="config"
      :name="inputName"
      :data="data"
      :pagination="pagination"
      :quick-search-props="quickSearchProps"
      :mode="mode"
      :append-to-body="appendToBody"
      @valueChange="valueChange"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('select-data', data)"
    ></ht-job-selector>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import mobileMode from '@/mixins/mobileMode.js'
  import { t } from '@/locale'

  export default {
    name: 'HtJobSelectorInput',
    mixins: [permission, inputName, form, mobileMode],
    props: {
      value: String,
      single: Boolean,
      config: Object,
      appendToBody: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default() {
          return t('ht.selector.jobTitle')
        },
      },
      pageSize: {
        type: Number,
        default: 20,
      },
      quickSearchProps: {
        type: String,
        default: 'name,code',
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
        this.loadAllJob(param)
      },
      // 加载全部岗位
      loadAllJob(param) {
        this.$requestConfig.getJobList(param).then((data) => {
          const { rows, page, pageSize, total } = data
          if (this.isMobile && page > 1) {
            this.data = this.data.concat(rows)
          } else {
            this.data = rows
          }
          const paginationResult = { page, pageSize, total }
          this.$set(this, 'pagination', paginationResult)
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
