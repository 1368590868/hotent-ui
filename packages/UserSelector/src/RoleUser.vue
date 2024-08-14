<template>
  <div class="role-user__container">
    <div class="role-user__search">
      <el-input
        v-model="searchWord"
        size="small"
        clearable
        :placeholder="$t('ht.selector.roleName')"
        @clear="reset"
        @keyup.enter.native="loadRoleWithParam"
      >
        <i
          slot="prefix"
          :title="t('ht.common.search')"
          class="el-input__icon el-icon-search"
          @click="loadRoleWithParam"
        />
      </el-input>
    </div>
    <el-scrollbar v-if="roles.length > 0" class="selector-list__scroll">
      <ht-radio
        v-model="currentRole"
        display-style="block"
        option-layout="vertical"
        :props="{ key: 'id', value: 'name' }"
        :options="roles"
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
    name: 'RoleUser',
    mixins: [Locale],
    props: {
      mode: {
        type: String,
      },
    },
    data() {
      return {
        currentRole: '',
        roles: [],
        searchWord: null,
      }
    },
    watch: {
      mode: function(newVal, oldVal) {
        if (newVal !== oldVal && newVal == 'search') {
          this.currentRole = ''
        }
      },
      currentRole: function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.$emit('load-role-user', newVal)
        }
      },
    },
    mounted() {
      if (!this.roles || this.roles.length == 0) {
        this.loadRoleWithParam()
      }
    },
    methods: {
      reset() {
        this.searchWord = null
        this.$nextTick(() => this.loadRoleWithParam())
      },
      // 按照指定策略加载数据
      loadRoleWithParam() {
        this.$requestConfig.getRoleList(this.getParam()).then((data) => {
          const { rows } = data
          this.roles = rows
        })
      },
      getParam() {
        const queryFilter = {
          querys: [],
          pageBean: {
            page: 1,
            pageSize: 50,
            showTotal: true,
          },
        }

        if (this.searchWord) {
          let query = {
            property: 'name',
            value: this.searchWord,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          }
          queryFilter.querys.push(query)
        }
        return queryFilter
      },
    },
  }
</script>
<style lang="scss" scoped>
  .role-user__container {
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

    .role-user__search {
      padding: 0 10px 10px 10px;
    }
    .selector-list__scroll {
      height: calc(100% - 42px);
    }
  }
</style>
