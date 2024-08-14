<template>
  <van-action-sheet
    v-if="dialogVisible"
    v-model="dialogVisible"
    class="job-mobile__selector"
    :cancel-text="sureButtonText"
    :closeable="false"
    get-container="body"
    @cancel="handleDialogSure"
    @close="handleDialogClose"
    @click-overlay="handleDialogClose"
  >
    <template #description>
      <span class="job-mobile__title">{{ title }}</span>
      <ht-icon
        class="job-mobile__close"
        name="close"
        @click="handleDialogClose"
      />
    </template>

    <van-search
      v-model="searchWord"
      :placeholder="searchPlaceholder"
      @search="onRefresh"
      @clear="reset"
    />
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
      <van-list
        v-model="isLoading"
        class="job-data__list"
        :finished="finished"
        :finished-text="t('ht.common.noMore')"
        @load="loadMore"
      >
        <van-checkbox-group v-model="selectIds">
          <van-cell
            v-for="item in data"
            :key="item[primaryFieldProp]"
            clickable
            @click="rowClick(item, null, $event)"
          >
            <template #icon>
              <van-checkbox
                :name="item[primaryFieldProp]"
                :shape="single ? 'round' : 'square'"
              />
            </template>
            <div class="job-list__container">
              <ht-icon
                name="job"
                class="follow-theme-color"
                style="margin-left:15px;width:36px;height:36px;"
              />
              <div class="selector-item__detail">
                <div class="selector-detail__name">
                  <label>{{ item[selectLabel] }}</label>
                  <span>({{ item['code'] }})</span>
                </div>
              </div>
            </div>
          </van-cell>
        </van-checkbox-group>
      </van-list>
    </van-pull-refresh>
  </van-action-sheet>
</template>
<script>
  import styles from '@/styles/index.scss'
  import Locale from '@/mixins/locale'
  import { t } from '@/locale'

  export default {
    name: 'JobSelectorMobileDialog',
    mixins: [Locale],
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.nameCode')
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
        default: 'name',
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default() {
          return t('ht.selector.roleTitle')
        },
      },
      primaryField: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        dialogVisible: false,
        isLoading: false,
        finished: false,
        searchWord: null,
        selectIds: [],
        selectedData: [],
      }
    },
    computed: {
      primaryColor() {
        return styles.primary_color
      },
      sureButtonText() {
        const selectedText =
          this.selectIds.length > 0 ? `(${this.selectIds.length})` : ''
        return `${this.$t('ht.common.confirm')}${selectedText}`
      },
      primaryFieldProp: function() {
        return this.primaryField ? this.primaryField : 'id'
      },
    },
    watch: {
      pagination: function(newVal, oldVal) {
        this.isLoading = false
        if (newVal !== oldVal) {
          const { page, pageSize, total } = newVal
          if (page > 0 && pageSize > 0 && total > 0) {
            this.finished = page * pageSize >= total
          } else {
            this.finished = true
          }
        }
      },
    },
    methods: {
      onRefresh() {
        this.isloading = true
        this.$emit('search', this.searchWord)
      },
      reset() {
        this.$emit('reset')
      },
      loadMore() {
        if (this.data && this.data.length > 0) {
          this.$emit('page-change', ++this.pagination.page)
        } else {
          this.isLoading = false
        }
      },
      showDialog() {
        if (this.value && this.value.length > 0) {
          this.selectIds = this.value.map((item) => item[this.primaryFieldProp])
          this.selectedData = this.value
        }
        this.dialogVisible = true
      },
      handleDialogSure() {
        this.$emit('input', this.selectedData)
        this.$emit('select-data', this.selectedData)
        this.selectIds = []
        this.selectedData = []
        this.dialogVisible = false
      },
      handleDialogClose() {
        this.dialogVisible = false
        this.selectIds = []
        this.selectedData = []
      },
      select(selection, row) {
        this.$emit('select', selection, row)
      },
      rowClick(row, column, event) {
        // 单选
        if (this.single) {
          this.selectIds = [row[this.primaryFieldProp]]
          this.selectedData = [row]
        } else {
          // 多选
          if (this.selectIds.some((m) => m == row[this.primaryFieldProp])) {
            this.selectIds.remove(row[this.primaryFieldProp])
            this.selectedData = this.selectedData.filter(
              (item) =>
                item[this.primaryFieldProp] !== row[this.primaryFieldProp]
            )
          } else {
            this.selectIds.push(row[this.primaryFieldProp])
            this.selectedData.push(row)
          }
        }
        this.$emit('row-click', row, column, event)
      },
    },
  }
</script>
<style lang="scss" scoped>
  .job-mobile__selector {
    ::v-deep {
      .van-tab--active {
        font-weight: bold;
        color: $base-color-blue;
      }
    }
    .job-mobile__title {
      font-size: 18px;
      color: #1a1a1a;
    }
    .job-mobile__close {
      float: right;
    }
    .job-demensions__container {
      padding: 0 12px;
    }
    .job-demensions__group {
      margin-right: 6px;
      color: #999999;
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &::before {
        border-width: 0;
      }

      &.current {
        color: $base-color-blue;
      }

      &.current::before {
        border-width: 1px;
      }
    }
    .job-list__container {
      display: flex;
      align-items: center;

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
      }
    }
    .job-data__list {
      min-height: 400px;

      .van-cell {
        padding: 20px 16px;
      }
    }
    .van-action-sheet__cancel {
      padding: 5px;
      background: $base-color-blue;
      color: $base-color-white;
    }
  }
</style>
