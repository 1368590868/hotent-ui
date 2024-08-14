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
    <ht-user-selector
      ref="userSelectorEl"
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
      select-label="fullname"
      :quick-search-props="quickSearchProps"
      :mode="mode"
      @filter-type-change="handleFilterTypeChange"
      @valueChange="valueChange"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @contact-group-change="loadContactUser"
      @load-org-user="loadOrgUser"
      @load-policy-user="loadPolicyUser"
      @load-role-user="loadRoleUser"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('select-data', data)"
    ></ht-user-selector>
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
    name: 'HtUserSelectorInput',
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
      }
    },
    mounted() {
      // 没有值而且需要显示当前用户
      if (!this.value && this.selectCurrent) {
        this.$requestConfig.getCurrentUser().then((currentUserDetail) => {
          this.initCurrentValue(currentUserDetail)
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
        this.loadAllUser(param)
      },
      initCurrentValue(user) {
        this.$emit('input', user.fullname)
        // 同时更新绑定的字段
        if (this.config) {
          // 配置了id的绑定关系，则回填到指定属性上
          if (this.config.hasOwnProperty('id')) {
            utils.setValueByConfigKey(this, this.config, 'id', user.id)
          }
          // 配置了fullname的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('fullname')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'fullname',
              user.fullname
            )
          }
          // 配置了account的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('account')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'account',
              user.account
            )
          }
          if (this.config.hasOwnProperty('mobile')) {
            utils.setValueByConfigKey(this, this.config, 'mobile', user.mobile)
          }
          if (this.config.hasOwnProperty('email')) {
            utils.setValueByConfigKey(this, this.config, 'email', user.email)
          }
        }
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
      valueChange(value) {
        this.$emit('input', value)
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
      handleChange(data) {
        this.$emit('change', data)
      },
    },
  }
</script>
