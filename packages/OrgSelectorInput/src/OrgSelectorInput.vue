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
    <ht-org-selector
      v-model="value"
      :title="title"
      :form-inputs-display="formInputsDisplay"
      :validate="validate"
      :name="inputName"
      :placeholder="placeholder"
      :permission="permission_sub"
      :single="single"
      :config="config"
      :data="data"
      :pagination="pagination"
      :append-to-body="appendToBody"
      :select-label="selectLabel"
      :quick-search-props="quickSearchProps"
      :mode="mode"
      :show-path="showPath"
      @filter-type-change="handleFilterTypeChange"
      @valueChange="valueChange"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @load-org="loadOrg"
      @load-policy-org="loadPolicyOrg"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('select-data', data)"
    ></ht-org-selector>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import mobileMode from '@/mixins/mobileMode.js'
  import { t } from '@/locale'

  export default {
    name: 'HtOrgSelectorInput',
    mixins: [permission, inputName, form, mobileMode],
    props: {
      value: String,
      single: Boolean,
      config: Object,
      appendToBody: {
        type: Boolean,
        default: false,
      },
      selectCurrent: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default() {
          return t('ht.selector.orgTitle')
        },
      },
      quickSearchProps: {
        type: String,
        default: 'name,code,pathName',
      },
      pageSize: {
        type: Number,
        default: 20,
      },
      showPath: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
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
      selectLabel() {
        return this.showPath ? 'pathName' : 'name'
      },
    },
    mounted() {
      // 没有值而且需要显示当前组织
      if (!this.value && this.selectCurrent) {
        this.$requestConfig.getCurrentUser('org').then((currentUserOrg) => {
          this.initCurrentOrg(currentUserOrg)
        })
      }
      if (!this.data || this.data.length == 0) {
        this.handleLoad()
      }
    },
    methods: {
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
              this.loadOrg(this.currentOrg, page)
              break
            case 'policy':
              this.loadPolicyOrg(this.currentPolicy, page)
              break
          }
        }
      },
      handleSizeChange(size) {
        this.pagination.pageSize = size
        this.handlePageChange(this.pagination.page)
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
        this.loadAllOrg(param)
      },
      initCurrentOrg(org) {
        if (org && this.config) {
          // 配置了id的绑定关系，则回填到指定属性上
          if (this.config.hasOwnProperty('id')) {
            utils.setValueByConfigKey(this, this.config, 'id', org.orgId)
          }
          // 配置了code的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('code')) {
            utils.setValueByConfigKey(this, this.config, 'code', org.orgCode)
          }
          // 配置了name的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('name')) {
            utils.setValueByConfigKey(this, this.config, 'name', org.orgName)
          }
          // 配置了pathName的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('pathName')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'pathName',
              org.pathName
            )
          }
        }
        org &&
          setTimeout(() => {
            this.$emit('input', this.showPath ? org.pathName : org.orgName)
          })
      },
      // 通过组织查询用户
      loadOrg(org, page) {
        this.mode = 'filter'
        this.currentOrg = org
        let queryFilter = {
          pageBean: this.getPageBean(page),
          querys: [],
        }
        let query = {
          property: 'path',
          value: org.path,
          group: 'main',
          operation: 'RIGHT_LIKE',
          relation: 'AND',
        }
        if (org.path) {
          queryFilter.querys.push(query)
        }
        this.loadAllOrg(queryFilter)
      },
      // 通过策略查询用户
      loadPolicyOrg(params, page) {
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
              property: 'id_',
              value: params.id,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND',
            }
            queryFilter.querys.push(query)
            this.loadAllOrg(queryFilter)
            break
          // 所在主部门及下级部门
          case '2':
            query = {
              property: 'path_',
              value: params.path,
              group: 'main',
              operation: 'RIGHT_LIKE',
              relation: 'AND',
            }
            queryFilter.querys.push(query)
            this.loadAllOrg(queryFilter)
            break
          // 所在部门
          case '3':
            ids.forEach((id) => {
              query = {
                property: 'id_',
                value: id,
                group: 'main',
                operation: 'EQUAL',
                relation: 'OR',
              }
              queryFilter.querys.push(query)
            })
            this.loadAllOrg(queryFilter)
            break
          // 所在部门及下级部门
          case '4':
            paths.forEach((path) => {
              query = {
                property: 'path_',
                value: path,
                group: 'main',
                operation: 'RIGHT_LIKE',
                relation: 'OR',
              }
              queryFilter.querys.push(query)
            })
            this.loadAllOrg(queryFilter)
            break
        }
      },
      // 加载全部组织
      loadAllOrg(param) {
        this.$requestConfig.getOrgList(param).then((data) => {
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
    },
  }
</script>
