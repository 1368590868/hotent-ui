<template>
  <div name="online-form" class="data-preview-container">
    <el-row class="top-title__row">
      <h3 class="top-title">{{ queryView.name ? queryView.name : '' }}</h3>
    </el-row>
    <template v-if="html">
      <ht-querysql-runtime-template
        :sql-alias="sqlAlias"
        :alias="alias"
        :single="single"
        :search-form="searchForm"
        :query-view="queryView"
        class="data-preview-wrap"
      />
    </template>
    <div v-if="loadedFail" class="loaded-fail__div">
      {{ alias }}{{ $t('ht.preview.querySqlTip') }}
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import querySqlPreview from '@/mixins/querySqlPreview.js'
  export default {
    name: 'HtQuerySqlPreview',
    props: {
      viewId: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        queryView: {},
        displayFields: [],
        html: '',
        alarmSettingMap: {},
        summaryTypeMap: {},
        loadedFail: false,
        sqlAlias: '',
        alias: '',
      }
    },
    watch: {
      viewId: function (newVal) {
        if (newVal) {
          this.init()
        }
      },
    },
    created() {
      this.init()
    },
    methods: {
      // 根据当前formKey初始化
      init() {
        let _me = this
        this.$requestConfig
          .getQuerySqlView(this.viewId)
          .then((result) => {
            if (result) {
              _me.queryView = result
              _me.sqlAlias = result.sqlAlias
              _me.alias = result.alias
              _me.html = result.template
              this.customInit()
            } else {
              this.loadedFail = true
            }
          })
          .finally(() => {})
      },
      customInit() {
        Vue.component('ht-querysql-runtime-template', {
          mixins: [querySqlPreview],
          props: {
            single: String,
            sqlAlias: String,
            alias: String,
            queryView: Object,
          },
          data() {
            return {}
          },
          template: this.html,
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  >>> th.todo-header-row {
    background-color: #fafafa;
    font-size: 13px;
  }

  >>> tr.todo-row {
    font-size: 13px;
  }

  .el-container {
    background-color: #fff;
  }

  .top-title__row {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    .top-title {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 20px;
      font-size: 14px;
      // border-bottom: 1px solid #ccc;
    }
  }
  .data-preview-container {
    height: 100%;
    .data-preview-wrap {
      height: calc(100% - 30px);
    }
  }

  .el-header {
    border-bottom: 1.5px solid #ededed;
  }

  .i {
    margin-right: 4px;
  }

  .todo-subject {
    cursor: pointer;
  }

  .todo-subject:hover {
  }

  >>> .el-dialog__body {
    padding: 15px 10px;
  }

  >>> .el-checkbox {
    // margin-left: 15px;
  }

  >>> .el-radio {
    margin-left: 15px;
  }

  >>> .el-button {
    margin-left: 0px;
  }
  .loaded-fail__div {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #f56c6c;
  }
</style>
