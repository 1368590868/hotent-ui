<template>
  <div class="ht-post-dialog">
    <post-selector-dialog
      v-if="!isMobile"
      ref="postSelectorDialog"
      v-model="selectors"
      :title="title"
      :append-to-body="appendToBody"
      :data="data"
      :pagination="pagination"
      :select-label="selectLabel"
      :quick-search-props="quickSearchProps"
      :single="single"
      :search-placeholder="searchPlaceholder"
      :primary-field="primaryField"
      :mode="mode"
      @filter-type-change="handleFilterTypeChange"
      @search="handleSearch"
      @reset="handleReset"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('on-confirm', data)"
      @page-change="handlePageChange"
      @load-org-post="loadOrgPost"
      @load-policy-post="loadPolicyPost"
    />
    <post-selector-mobile-dialog
      v-else
      ref="postSelectorMobileDialog"
      v-model="selectors"
      :title="title"
      :append-to-body="appendToBody"
      :data="data"
      :pagination="pagination"
      :select-label="selectLabel"
      :single="single"
      :search-placeholder="searchPlaceholder"
      :primary-field="primaryField"
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
  import PostSelectorDialog from '../../PostSelector/src/PostSelectorDialog.vue'
  import PostSelectorMobileDialog from '../../PostSelector/src/PostSelectorMobileDialog.vue'
  import { t } from '@/locale'
  export default {
    name: 'HtPostDialog',
    components: {
      PostSelectorDialog,
      PostSelectorMobileDialog,
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
      selectCurrent: Boolean,
      title: {
        type: String,
        default() {
          return t('ht.selector.postTitle')
        },
      },
      showSwitchDimension: {
        type: Boolean,
        default: true,
      },
      pageSize: {
        type: Number,
        default: 20,
      },
      quickSearchProps: {
        type: String,
        default: 'p.pos_name_,p.code_,o.path_name_',
      },
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.orgDefaultPlaceholder')
        },
      },
      selectLabel: {
        type: String,
        default: 'name',
      },
      currentSelectPost: Array,
    },
    data() {
      return {
        selectors: [],
        mode: null, // 搜索模式
        filterType: 'org', //过滤类型(org:组织，policy:策略)
        currentGroup: null,
        currentOrg: null,
        currentPolicy: null,
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
        this.selectors = this.currentSelectPost ? this.currentSelectPost : []
        if (this.isMobile) {
          this.$refs.postSelectorMobileDialog.showDialog()
        } else {
          this.$refs.postSelectorDialog.showDialog()
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
        this.mode = null
        this.handleLoad()
      },
      handlePageChange(page) {
        // 搜索模式下或者未进行过滤时，查询所有数据
        if (this.mode != 'filter') {
          this.handleLoad(page)
        } else {
          // 过滤模式下，根据过滤类型查询数据
          switch (this.filterType) {
            case 'org':
              this.loadOrgPost(this.currentOrg, page)
              break
            case 'policy':
              this.loadPolicyPost(this.currentPolicy, page)
              break
          }
        }
      },
      // 处理过滤类型变化的事件
      handleFilterTypeChange(type) {
        this.filterType = type
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
      // 获取查询参数中的分页信息(不传page时默认查询第一页)
      getPageBean(page) {
        const pageBean = { ...this.pagination }
        delete pageBean['total']
        pageBean.page = page || 1
        return pageBean
      },
      handleLoad(page) {
        const param = this.getQueryFilter(page)
        this.data = this.data || []
        this.loadAllPost(param)
      },
      // 加载全部岗位
      loadAllPost(param) {
        this.$requestConfig.getPostList(param).then((data) => {
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
      // 通过组织查询岗位
      loadOrgPost(org, page) {
        this.mode = 'filter'
        this.currentOrg = org
        let queryFilter = {
          pageBean: this.getPageBean(page),
          querys: [],
        }
        let query = {
          property: 'path_',
          value: org.path,
          group: 'main',
          operation: 'RIGHT_LIKE',
          relation: 'AND',
        }
        if (org.path) {
          queryFilter.querys.push(query)
        }
        this.loadAllPost(queryFilter)
      },
      // 通过策略查询岗位
      loadPolicyPost(params, page) {
        this.mode = 'filter'
        this.currentOrg = params
        let queryFilter = {
          pageBean: this.getPageBean(page),
          querys: [],
        }
        let query = null
        const { type, ids, paths } = params
        switch (type) {
          // 所在主部门
          case '1':
            query = {
              property: 'o.id_',
              value: params.id,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND',
            }
            queryFilter.querys.push(query)
            this.loadAllPost(queryFilter)
            break
          // 所在主部门及下级部门
          case '2':
            query = {
              property: 'o.path_',
              value: params.path,
              group: 'main',
              operation: 'RIGHT_LIKE',
              relation: 'AND',
            }
            queryFilter.querys.push(query)
            this.loadAllPost(queryFilter)
            break
          // 所在部门
          case '3':
            ids.forEach((id) => {
              query = {
                property: 'o.id_',
                value: id,
                group: 'main',
                operation: 'EQUAL',
                relation: 'OR',
              }
              queryFilter.querys.push(query)
            })
            this.loadAllPost(queryFilter)
            break
          // 所在部门及下级部门
          case '4':
            paths.forEach((path) => {
              query = {
                property: 'o.path_',
                value: path,
                group: 'main',
                operation: 'RIGHT_LIKE',
                relation: 'OR',
              }
              queryFilter.querys.push(query)
            })
            this.loadAllPost(queryFilter)
            break
        }
      },
    },
  }
</script>
<style lang="scss" scoped></style>
