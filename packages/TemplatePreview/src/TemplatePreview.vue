<template>
  <div name="data-view" class="template-preview-container">
    <span v-if="html" class="template-content">
      <div v-if="showDateView" class="data_view">
        <ht-dataview-runtime-template
          :key="refreshTime"
          :template-key="templateKey"
          :html="html"
          :search-form="searchForm"
          :template-info="templateInfo"
          :single="single"
          :task-type="taskType"
          :is-join-flow="isJoinFlow"
          :def-key="defKey"
          :is-data-view="isDataView"
          :data-view="dataView"
          :current-table-height="tableHeight"
          class="data-preview-wrap"
          :parameterq-querys="parameterqQuerys"
        />
      </div>
    </span>
    <div v-if="loadedFail" class="loaded-fail__div">
      {{ $t('ht.templatePreview.noDataText') }}
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import templatePreviewMixin from '@/mixins/templatePreview.js'
  export default {
    name: 'HtTemplatePreview',
    props: {
      templateKey: { type: String, required: true },
      parameterqQuerys: String,
      single: String,
      taskType: {
        type: String,
        default: '',
      },
      defKey: String,
      dataView: Object,
      isDataView: {
        type: Boolean,
        default: false,
      },
      isJoinFlow: {
        type: Boolean,
        default: false,
      },
      tableHeight: {
        type: [Number, Function],
      },
    },
    data() {
      return {
        html: '',
        templateInfo: {},
        loadedFail: false,
        refreshTime: new Date().getTime(),
        showDateView: true,
      }
    },
    watch: {
      templateKey: function(newVal) {
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
          .getBpmDataTemplateInfo({
            templateKey: this.templateKey,
          })
          .then((result) => {
            if (result.state) {
              _me.templateInfo = result.value
              this.getTemplateDataListForm()
            } else {
              this.$message.error(result.message)
            }
          })
      },
      getTemplateDataListForm() {
        this.$requestConfig
          .getTemplateDataListForm(this.templateKey)
          .then((result) => {
            if (result.state) {
              this.html = result.value
              this.customInit()
            } else {
              this.loadedFail = true
              this.$message.error(
                result.message || this.$t('ht.templatePreview.errorMsg')
              )
            }
          })
      },
      customInit() {
        Vue.component('ht-dataview-runtime-template', {
          mixins: [templatePreviewMixin],
          props: {
            templateInfo: {
              type: Object,
            },
            single: String,
            currentTableHeight: {
              type: [Number, Function],
            },
            isDataView: {
              type: Boolean,
              default: false,
            },
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
  .template-preview-container {
    height: 100%;
    .template-content {
      display: inline-block;
      height: 100%;
      width: 100%;
    }
    .data_view,
    .data-preview-wrap {
      height: 100%;
    }
    >>> .navbar-collapse {
      position: absolute;
      top: 45%;
      cursor: pointer;
      width: 0px;
      z-index: 99;
    }

    >>> .navbar-collapse.navbar-collapse-right {
      top: 45%;
    }

    >>> .navbar-collapse:hover {
      transform: scale(1);
    }

    >>> .navbar-collapse:hover .navbar-collapse-arrow {
      color: #333333;
    }

    >>> .navbar-collapse-arrow {
      position: relative;
      top: 25%;
      right: 15px;
      font-size: 18px;
      color: #a8a8a8;
    }

    >>> .navbar-collapse-bg {
      -webkit-transition: all 0.12s ease;
      height: 40px;
      border-bottom: 8px solid transparent;
      border-right: none;
      border-left: 12px solid #ebebeb;
      border-top: 8px solid transparent;
      opacity: 0.9;
    }
  }
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

  .el-row {
    margin-bottom: 20px;
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
  .data-preview-wrap
    ::v-deep
    .dropdown-upload__btn
    > .el-button-group
    > button:first-child {
    margin: 0;
    padding: 0;
  }
  .data_view ::v-deep .el-footer {
    margin-right: 20px;
  }
</style>
<style lang="scss">
  .template-dropdown {
    .el-button:first-child {
      padding: 0 !important;
    }
    .template-dropdown-item {
      span {
        display: inline-block;
        padding: 7px 15px;
      }
    }
  }
</style>
