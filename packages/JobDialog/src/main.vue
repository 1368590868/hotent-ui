<template>
  <div class=" inputs ht-job-dialog">
    <job-selector-mobile-dialog
      v-if="isMobile"
      ref="jobSelectorMobileDialog"
      v-model="selectors"
      :search-placeholder="searchPlaceholder"
      :single="single"
      :data="data"
      :pagination="pagination"
      :select-label="selectLabel"
      :quick-search-props="quickSearchProps"
      :append-to-body="appendToBody"
      :title="title"
      :primary-field="primaryField"
      @search="handleSearch"
      @reset="handleReset"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('on-confirm', data)"
      @page-change="handlePageChange"
    />
    <job-selector-dialog
      v-else
      ref="jobSelectorDialog"
      v-model="selectors"
      :search-placeholder="searchPlaceholder"
      :single="single"
      :data="data"
      :pagination="pagination"
      :select-label="selectLabel"
      :quick-search-props="quickSearchProps"
      :append-to-body="appendToBody"
      :title="title"
      :primary-field="primaryField"
      :mode="mode"
      @search="handleSearch"
      @reset="handleReset"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('on-confirm', data)"
      @page-change="handlePageChange"
    />
  </div>
</template>
<script>
  import mobileMode from '@/mixins/mobileMode.js'
  import JobSelectorDialog from '../../JobSelector/src/JobSelectorDialog.vue'
  import JobSelectorMobileDialog from '../../JobSelector/src/JobSelectorMobileDialog.vue'
  import { t } from '@/locale'
  export default {
    name: 'HtJobDialog',
    components: {
      JobSelectorDialog,
      JobSelectorMobileDialog,
    },
    mixins: [mobileMode],
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
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.nameCode')
        },
      },
      selectLabel: {
        type: String,
        default: 'name',
      },
      currentSelectJob: Array,
    },
    data() {
      return {
        selectors: [],
        mode: 'search', // 搜索模式
        searchWord: null,
        data: [],
        pagination: {
          page: 1,
          pageSize: this.pageSize,
          total: 0,
          showTotal: true,
        },
      }
    },
    computed: {
      primaryField: function() {
        return this.config && this.config.hasOwnProperty('id')
          ? 'id'
          : this.config && this.config.hasOwnProperty('code')
          ? 'code'
          : this.selectLabel
      },
    },
    mounted() {
      if (!this.data || this.data.length == 0) {
        this.handleLoad()
      }
    },
    methods: {
      showDialog() {
        this.selectors = this.currentSelectJob ? this.currentSelectJob : []
        if (this.isMobile) {
          this.$refs.jobSelectorMobileDialog.showDialog()
        } else {
          this.$refs.jobSelectorDialog.showDialog()
        }
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
      // 获取查询参数中的分页信息(不传page时默认查询第一页)
      getPageBean(page) {
        const pageBean = { ...this.pagination }
        delete pageBean['total']
        pageBean.page = page || 1
        return pageBean
      },
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
    },
  }
</script>
<style lang="scss" scoped></style>
