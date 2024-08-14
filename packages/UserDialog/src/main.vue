<template>
  <div class="inputs">
    <user-selector-dialog
      v-if="!isMobile"
      ref="userSelectorDialog"
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
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @contact-group-change="loadContactUser"
      @load-org-user="loadOrgUser"
      @load-policy-user="loadPolicyUser"
      @load-role-user="loadRoleUser"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('on-confirm', data)"
    />
    <user-selector-mobile-dialog
      v-else
      ref="userSelectorMobileDialog"
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
  import UserSelectorDialog from '../../UserSelector/src/UserSelectorDialog.vue'
  import UserSelectorMobileDialog from '../../UserSelector/src/UserSelectorMobileDialog.vue'
  import { t } from '@/locale'
  export default {
    name: 'HtUserDialog',
    components: {
      UserSelectorDialog,
      UserSelectorMobileDialog,
    },
    mixins: [mobileMode],
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.userAndAccount')
        },
      },
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
          return t('ht.selector.userTitle')
        },
      },
      quickSearchProps: {
        type: String,
        default: 'fullname,account',
      },
      pageSize: {
        type: Number,
        default: 20,
      },
      selectLabel: {
        type: String,
        default: 'fullname',
      },
      currentSelectUsers: Array,
    },
    data() {
      return {
        mode: null, // 搜索模式
        filterType: 'contact', //过滤类型(contact:联系人，org:组织，policy:策略，role:角色)
        currentGroup: null,
        currentOrg: null,
        currentPolicy: null,
        currentRole: null,
        searchWord: null,
        data: [],
        pagination: {
          page: 1,
          pageSize: this.pageSize,
          total: 0,
          showTotal: true,
        },
        selectors: [],
      }
    },
    computed: {
      primaryField: function() {
        return this.config && this.config.hasOwnProperty('id')
          ? 'id'
          : this.config && this.config.hasOwnProperty('account')
          ? 'account'
          : this.selectLabel
      },
    },
    mounted() {
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
      handleSizeChange(size) {
        this.pagination.pageSize = size
        this.handlePageChange(this.pagination.page)
      },
      handlePageChange(page) {
        // 搜索模式下或者未进行过滤时，查询所有数据
        if (this.mode != 'filter') {
          this.handleLoad(page)
        } else {
          // 过滤模式下，根据过滤类型查询数据
          switch (this.filterType) {
            case 'contact':
              this.loadContactUser(this.currentGroup, page)
              break
            case 'org':
              this.loadOrgUser(this.currentOrg, page)
              break
            case 'policy':
              this.loadPolicyUser(this.currentPolicy, page)
              break
            case 'role':
              this.loadRoleUser(this.currentRole, page)
              break
          }
        }
      },
      // 处理过滤类型变化的事件
      handleFilterTypeChange(type) {
        this.filterType = type
      },
      showDialog() {
        this.selectors = this.currentSelectUsers ? this.currentSelectUsers : []
        if (this.isMobile) {
          this.$refs.userSelectorMobileDialog.showDialog()
        } else {
          this.$refs.userSelectorDialog.showDialog()
        }
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
        this.loadAllUser(param)
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
      // 加载全部用户
      loadAllUser(param) {
        this.$requestConfig.getUserList(param).then((data) => {
          const { rows, page, pageSize, total } = data
          if (this.isMobile && page > 1) {
            this.data = this.data.concat(rows)
          } else {
            this.data = rows
          }
          const paginationResult = {
            page,
            pageSize,
            total,
          }
          this.$set(this, 'pagination', paginationResult)
        })
      },
      // 加载常用联系人
      loadContactUser(group, page) {
        this.mode = 'filter'
        this.currentGroup = group
        const param = {
          pageBean: this.getPageBean(page),
        }
        if (group != 'all') {
          param.contactGroupId = group
        }
        if (this.$requestConfig.getContactUser) {
          this.$requestConfig.getContactUser(param).then((data) => {
            if (data.state && data.value) {
              const { rows, page, pageSize, total } = data.value

              if (this.isMobile && page > 1) {
                this.data = this.data.concat(rows)
              } else {
                this.data = rows
              }
              const paginationResult = { page, pageSize, total }
              this.$set(this, 'pagination', paginationResult)
            }
          })
        }
      },
      // 通过组织查询用户
      loadOrgUser(org, page) {
        this.mode = 'filter'
        this.currentOrg = org
        let queryFilter = {
          pageBean: this.getPageBean(page),
          querys: [],
        }
        let query = {
          property: 'uo.path_',
          value: org.path,
          group: 'main',
          operation: 'RIGHT_LIKE',
          relation: 'AND',
        }
        if (org.path) {
          queryFilter.querys.push(query)
        }
        this.loadAllUser(queryFilter)
      },
      // 按照角色查询用户
      loadRoleUser(role, page) {
        this.mode = 'filter'
        this.currentRole = role
        let queryFilter = {
          pageBean: this.getPageBean(page),
          querys: [],
        }
        if (role) {
          queryFilter.params = {
            role_id_: role,
          }
        }
        this.loadAllUser(queryFilter)
      },
      // 通过策略查询用户
      loadPolicyUser(params, page) {
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
              property: 'uo.id_',
              value: params.id,
              group: 'main',
              operation: 'EQUAL',
              relation: 'AND',
            }
            queryFilter.querys.push(query)
            this.loadAllUser(queryFilter)
            break
          // 所在主部门及下级部门
          case '2':
            query = {
              property: 'uo.path_',
              value: params.path,
              group: 'main',
              operation: 'RIGHT_LIKE',
              relation: 'AND',
            }
            queryFilter.querys.push(query)
            this.loadAllUser(queryFilter)
            break
          // 所在部门
          case '3':
            ids.forEach((id) => {
              query = {
                property: 'uo.id_',
                value: id,
                group: 'main',
                operation: 'EQUAL',
                relation: 'OR',
              }
              queryFilter.querys.push(query)
            })
            this.loadAllUser(queryFilter)
            break
          // 所在部门及下级部门
          case '4':
            paths.forEach((path) => {
              query = {
                property: 'uo.path_',
                value: path,
                group: 'main',
                operation: 'RIGHT_LIKE',
                relation: 'OR',
              }
              queryFilter.querys.push(query)
            })
            this.loadAllUser(queryFilter)
            break
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  @import '~@/styles/selector.scss';
  .inputs {
    display: block;
  }

  .el-select__tags {
    background: #fff;
    margin-left: 1px;
  }

  .el-select__tags_readonly {
    position: relative;
    top: 50%;
  }

  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
  }

  ::v-deep .el-main {
    padding-top: 0;
    padding-bottom: 0;
  }

  div.org-find-card ::v-deep .el-card__body {
    padding: 10px;
    max-height: 520px;
    overflow: auto;
  }
</style>
