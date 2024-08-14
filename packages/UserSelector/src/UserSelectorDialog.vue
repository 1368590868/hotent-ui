<template>
  <el-dialog
    width="1060px"
    :title="title"
    class="userdialog-selector__wrapper"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
  >
    <div class="dialog-selector__body">
      <el-input
        v-model="searchWord"
        size="small"
        clearable
        :placeholder="searchPlaceholder"
        @clear="reset"
        @keyup.enter.native="search"
      >
        <i
          slot="prefix"
          :title="t('ht.common.search')"
          class="el-input__icon el-icon-search"
          @click="search"
        />
      </el-input>
      <ht-list-selector
        ref="selector"
        v-model="selectors"
        class="user-selector"
        :title="$t('ht.selector.userList')"
        :data="data"
        :pagination="pagination"
        :select-label="selectLabel"
        :quick-search-props="quickSearchProps"
        :single="single"
        :search-placeholder="searchPlaceholder"
        :primary-field="primaryField"
        :mode="mode"
        @reset="reset"
        @row-click="(row) => $emit('row-click', row)"
        @page-change="(page) => $emit('page-change', page)"
        @size-change="(size) => $emit('size-change', size)"
      >
        <el-card slot="range" class="selector-range__card" shadow="hover">
          <el-tabs v-model="activeRange">
            <el-tab-pane :label="$t('ht.selector.topContacts')" name="contact">
              <top-contact-user
                :mode="mode"
                @contact-group-change="
                  (group) => $emit('contact-group-change', group)
                "
              />
            </el-tab-pane>
            <el-tab-pane :label="$t('ht.selector.org')" name="org">
              <organization
                :mode="mode"
                @load-org-user="(org) => $emit('load-org-user', org)"
              />
            </el-tab-pane>
            <el-tab-pane :label="$t('ht.selector.tactics')" name="policy">
              <policy-user
                :mode="mode"
                @load-policy-user="
                  (policy) => $emit('load-policy-user', policy)
                "
              />
            </el-tab-pane>
            <el-tab-pane :label="$t('ht.selector.role')" name="role">
              <role-user
                :mode="mode"
                @load-role-user="(role) => $emit('load-role-user', role)"
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <template #detail="{ item }">
          <ht-avatar-image
            class="follow-theme-background-color"
            style="margin-left:15px"
            :username="item[selectLabel]"
            background-color="#409EFF"
            color="#fff"
            :size="36"
          />
          <div class="selector-item__detail">
            <div class="selector-detail__name">
              <label>{{ item[selectLabel] }}</label>
              <span>({{ item['account'] }})</span>
            </div>
            <div class="selector-detail__desc">
              <span :title="item.pathname">
                <ht-icon name="org-tree" />
                {{ item.orgname || $t('ht.selector.not') }}
              </span>
              <span :title="item.postname">
                <ht-icon name="users" />
                {{ item.postname || $t('ht.selector.not') }}
              </span>
            </div>
          </div>
        </template>
        <template #selected="{ select }">
          <ht-avatar-image
            class="follow-theme-background-color"
            style="margin-left:15px"
            :username="select[selectLabel]"
            background-color="#409EFF"
            color="#fff"
            :size="30"
          />
          <p
            class="selector-selected__label"
            :title="
              `${select[selectLabel]}${
                select['account'] ? `(${select['account']})` : ''
              }`
            "
          >
            {{
              `${select[selectLabel]}${
                select['account'] ? `(${select['account']})` : ''
              }`
            }}
          </p>
        </template>
      </ht-list-selector>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="small" @click="handleDialogSure">
        {{ $t('ht.common.confirm') }}
      </el-button>
      <el-button size="small" @click="handleDialogCancel">
        {{ $t('ht.common.cancle') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
  import Locale from '@/mixins/locale'
  import HtListSelector from '../../ListSelector/index'
  import TopContactUser from './TopContactUser.vue'
  import Organization from './Organization.vue'
  import PolicyUser from './PolicyUser.vue'
  import RoleUser from './RoleUser.vue'
  import { t } from '@/locale'

  export default {
    name: 'UserSelectorDialog',
    components: {
      HtListSelector,
      TopContactUser,
      Organization,
      PolicyUser,
      RoleUser,
    },
    mixins: [Locale],
    props: {
      value: {
        type: Array,
        default: () => {
          return []
        },
      },
      title: {
        type: String,
        default() {
          return t('ht.selector.userTitle')
        },
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      data: {
        type: Array,
        default: () => {
          return []
        },
      },
      pagination: {
        type: Object,
        default: () => {
          return {
            page: 1,
            pageSize: 50,
            total: 0,
          }
        },
      },
      selectLabel: {
        type: String,
        default: 'fullname',
      },
      quickSearchProps: {
        type: String,
        required: true,
      },
      single: {
        type: Boolean,
        default: false,
      },
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.userAndAccount')
        },
      },
      primaryField: {
        type: String,
        default: '',
      },
      mode: {
        type: String,
      },
    },
    data() {
      return {
        dialogVisible: false,
        activeRange: 'contact',
        searchWord: null,
        loading: false,
      }
    },
    computed: {
      selectors: {
        get: function() {
          return this.value
        },
        set: function(val) {
          this.$emit('input', val)
        },
      },
    },
    watch: {
      activeRange: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('filter-type-change', newVal)
        }
      },
    },
    methods: {
      search() {
        if (this.loading) {
          return
        }
        this.$emit('search', this.searchWord)
      },
      reset() {
        this.$emit('reset')
        this.searchWord = null
      },
      showDialog() {
        this.dialogVisible = true
        setTimeout(() => {
          this.$refs.selector.onShow()
        }, 10)
      },
      handleClose(done) {
        this.$refs.selector.onHide()
        done && done()
      },
      handleDialogSure() {
        this.$emit('select-data', this.$refs.selector.getSelectedData())
        this.dialogVisible = false
        this.$refs.selector.onHide(true)
      },
      handleDialogCancel() {
        this.dialogVisible = false
        this.$refs.selector.onHide()
      },
    },
  }
</script>
<style lang="scss" scoped>
  .userdialog-selector__wrapper {
    ::v-deep {
      .el-dialog__header {
        span {
          font-weight: bold;
          color: #222;
        }
      }

      .el-dialog__body {
        padding: 0 20px;
        border-top-width: 0;
        max-height: 600px;
        overflow: hidden;
      }

      .el-dialog__footer {
        text-align: center;
        border-top-width: 0;
      }
    }
    .dialog-selector__body {
      .el-icon-search {
        cursor: pointer;
      }
    }

    .user-selector {
      margin-top: 10px;
    }

    .selector-range__card {
      ::v-deep {
        .el-card__body {
          height: 530px;

          .el-tabs {
            height: 100%;

            .el-tabs__content {
              height: calc(100% - 63px);
              padding: 0;

              .el-tab-pane {
                height: 100%;
              }
            }
          }
        }
        .el-tabs__nav-wrap {
          background-color: #fcfcfc;
          padding: 0;

          .el-tabs__nav-scroll {
            display: flex;
            justify-content: center;
          }
        }
        .el-tabs__item {
          padding: 0 10px;
          height: 48px;
          line-height: 48px;
        }
      }
    }
    .selector-item__detail {
      display: flex;
      flex-direction: column;
      margin-left: 10px;

      .selector-detail__name {
        max-width: 220px;

        label {
          color: #111;
          font-size: 14px;
        }
        span {
          margin-left: 10px;
          color: #777;
        }
      }

      .selector-detail__desc {
        margin-top: 5px;

        span {
          display: inline-block;
          font-size: 12px;
          color: #777;
          max-width: 94px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        span + span {
          margin-left: 10px;
        }
      }
    }
    .selector-selected__label {
      margin-left: 10px;
      width: 115px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
