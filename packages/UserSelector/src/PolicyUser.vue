<template>
  <div class="policy-user__container">
    <el-scrollbar v-if="policies.length > 0" class="selector-list__scroll">
      <ht-radio
        v-model="currentPolicy"
        display-style="block"
        option-layout="vertical"
        :props="{ key: 'id', value: 'name' }"
        :options="policies"
      ></ht-radio>
    </el-scrollbar>
    <div v-else class="el-tree__empty-block">
      <span class="el-tree__empty-text">{{ t('el.table.emptyText') }}</span>
    </div>
  </div>
</template>
<script>
  import Locale from '@/mixins/locale'

  export default {
    name: 'PolicyUser',
    mixins: [Locale],
    props: {
      mode: {
        type: String,
      },
    },
    data() {
      return {
        policies: [
          { id: '1', name: this.$t('ht.selector.MyDepartment') },
          { id: '2', name: this.$t('ht.selector.MyDepartmentAndSub') },
          { id: '3', name: this.$t('ht.selector.myAllDepartment') },
          { id: '4', name: this.$t('ht.selector.myAllDepartmentAndSub') },
        ],
        currentPolicy: '',
        currentUserOrgs: [],
      }
    },
    watch: {
      mode: function(newVal, oldVal) {
        if (newVal !== oldVal && newVal == 'search') {
          this.currentPolicy = ''
        }
      },
      currentPolicy: function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.loadUserWithPolicy(newVal)
        }
      },
    },
    methods: {
      // 按照指定策略加载数据
      loadUserWithPolicy(policy) {
        this.loadCurrentUserOrgs()
          .then(() => {
            const param = this.getOrgIdWithPolicy(policy)
            this.$emit('load-policy-user', param)
          })
          .catch(() => {
            this.$message.error(this.$t('ht.selector.notGetDepartmentData'))
            this.currentPolicy = ''
          })
      },
      // 根据策略构建不同的查询参数
      getOrgIdWithPolicy(policy) {
        let result = { type: policy }
        const masterOrg = this.currentUserOrgs.find((org) => org.isMaster == 1)
        switch (policy) {
          case '1':
            result.id = masterOrg ? masterOrg.id : null
            break
          case '2':
            result.path = masterOrg ? masterOrg.path : null
            break
          case '3':
            result.ids = this.currentUserOrgs.map((org) => org.id)
            break
          case '4':
            result.paths = this.currentUserOrgs.map((org) => org.path)
            break
        }
        return result
      },
      // 获取当前用户所属部门数据
      loadCurrentUserOrgs() {
        return new Promise((resolve, reject) => {
          if (this.currentUserOrgs && this.currentUserOrgs.length > 0) {
            resolve()
          } else if (
            this.$requestConfig.getUserId() &&
            this.$requestConfig.getOrgListByUserId
          ) {
            this.$requestConfig
              .getOrgListByUserId(this.$requestConfig.getUserId())
              .then((orgs) => {
                if (orgs && orgs.constructor == Array && orgs.length > 0) {
                  this.currentUserOrgs = orgs
                  resolve()
                } else {
                  reject()
                }
              })
              .catch(() => reject())
          } else {
            reject()
          }
        })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .policy-user__container {
    height: 100%;

    ::v-deep {
      .el-radio-group {
        width: 100%;
      }
      .el-radio-vertical {
        padding: 8px;
        margin-right: 0;

        &:hover {
          background-color: #f8f8f8;
        }

        .el-radio__input {
          display: none;
        }

        .el-radio__label {
          font-size: 14px;
        }
      }
    }
  }
</style>
