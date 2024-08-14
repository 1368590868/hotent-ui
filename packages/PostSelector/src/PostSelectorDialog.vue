<template>
  <el-dialog
    width="900px"
    :title="title"
    class="postdialog-selector__wrapper"
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
        class="post-selector"
        :title="$t('ht.selector.postList')"
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
            <el-tab-pane :label="$t('ht.selector.org')" name="org">
              <organization
                :mode="mode"
                @load-org-post="(org) => $emit('load-org-post', org)"
              />
            </el-tab-pane>
            <el-tab-pane :label="$t('ht.selector.tactics')" name="policy">
              <policy-user
                :mode="mode"
                @load-policy-post="
                  (policy) => $emit('load-policy-post', policy)
                "
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <template #detail="{ item }">
          <ht-icon
            name="post"
            class="follow-theme-color"
            style="margin-left:15px;width:36px;height:36px;"
          />
          <div class="selector-item__detail">
            <div class="selector-detail__name">
              <label>{{ item[selectLabel] }}</label>
              <span>({{ item['code'] }})</span>
            </div>
            <div v-if="item.orgName" class="selector-detail__desc">
              <span :title="item.orgName">
                <ht-icon name="org-tree" />
                {{ item.orgName }}
              </span>
            </div>
          </div>
        </template>
        <template #selected="{ select }">
          <ht-icon
            name="post"
            class="follow-theme-color"
            style="margin-left:15px;width:36px;height:36px;"
          />
          <p
            class="selector-selected__label"
            :title="
              `${select[selectLabel]}${
                select['code'] ? `(${select['code']})` : ''
              }`
            "
          >
            {{
              `${select[selectLabel]}${
                select['code'] ? `(${select['code']})` : ''
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
  import Organization from './Organization.vue'
  import PolicyUser from './PolicyUser.vue'
  import { t } from '@/locale'

  export default {
    name: 'PostSelectorDialog',
    components: {
      HtListSelector,
      Organization,
      PolicyUser,
    },
    mixins: [Locale],
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.orgDefaultPlaceholder')
        },
      },
      value: {
        type: Array,
        default: () => {
          return []
        },
      },
      single: {
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
        default: 'jobName',
      },
      quickSearchProps: {
        type: String,
        required: true,
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default() {
          return t('ht.selector.postTitle')
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
        activeRange: 'org',
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
        })
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
  div.org-find-card ::v-deep .el-card__body {
    padding: 10px;
    max-height: 520px;
    overflow: auto;
  }
  .postdialog-selector__wrapper {
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

    .post-selector {
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
          padding-left: 8px;
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
      width: 109px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
