<template>
  <div name="online-form">
    <el-skeleton v-if="loadStatus == 0" :rows="6" animated />
    <ht-runtime-template
      v-else-if="loadStatus > 0"
      :name="formName"
      :data="data"
      :permission="permission"
      :is-view="isView"
      :is-print="isPrint"
      :mobile-mode="mobileMode"
      :form-key="formKey"
      class="online-form-wrap form-table__wrap"
      :init-fill-data="initFillData"
      :extend-prop="extendProp"
      :is-support-mobile="isSupportMobile"
      :inst-id="instId"
      :is-preview="isPreview"
      @load-fail="handleLoadFail"
      @load-success="handleLoadSuccess"
    />
    <div v-else class="loaded-fail__div">
      {{ $t('ht.onlineForm.loadFormError') }}
    </div>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import onlineHottable from '@/mixins/onlineHottable.js'
  import onlineSubtable from '@/mixins/onlineSubtable.js'
  import regionValidator from '@/mixins/regionValidator.js'
  import emitter from '@/mixins/emitter.js'

  import Vue from 'vue'
  export default {
    name: 'HtOnlineForm',
    componentName: 'HtOnlineForm',
    mixins: [regionValidator, emitter],
    props: {
      html: String,
      data: Object,
      permission: Object,
      initFillData: {
        type: Boolean,
        default: false,
      },
      isView: {
        type: Boolean,
        default: false,
      },
      isPrint: {
        type: Boolean,
        default: false,
      },
      isLook: {
        type: Boolean,
        default: false,
      },
      mobileMode: {
        type: Boolean,
        default: false,
      },
      flowKey: String,
      formId: String,
      formKey: String,
      extendProp: {
        type: Object,
        default: () => {
          return {}
        },
      },
      isSupportMobile: {
        type: Boolean,
        default: false,
      },
      instId: [String, Number],
      isPreview: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        formName: `onlineForm_${utils.getName()}`,
        loadStatus: 0,
        subBackfill: new Map(),
        hotTableFillback: String,
        scopeName: `form-${utils.getName()}`,
        getDataPromiseResolve: null,
        getDataPromiseReject: null,
      }
    },
    watch: {
      html: {
        handler: function(newVal) {
          if (newVal) {
            this.init()
          }
        },
        immediate: true,
      },
    },
    created() {
      this.$on('global-validate-result', (result) => {
        if (result) {
          this.getDataPromiseResolve(this.data)
        } else {
          this.getDataPromiseReject()
        }
      })
    },
    methods: {
      handleLoadSuccess(res) {
        this.loadStatus = 1
        this.$emit('load-success', res)
      },
      handleLoadFail() {
        this.loadStatus = -1
      },
      getData(validate) {
        return new Promise((resolve, reject) => {
          this.getDataPromiseResolve = resolve
          this.getDataPromiseReject = reject
          if (!validate) {
            resolve(this.data)
          } else {
            // 执行校验逻辑
            this.validateRegion(`[name='${this.formName}']`).then(
              (errorItems) => {
                if (errorItems.length > 0) {
                  reject(errorItems)
                } else {
                  this.broadcast('HtGlobalValidate', 'global-validate')
                }
              }
            )
          }
        })
      },
      init() {
        this.loadStatus = 1
        Vue.component('ht-runtime-template', {
          componentName: 'HtRuntimeTemplate',
          mixins: [onlineHottable, onlineSubtable],
          props: {
            html: String,
            data: Object,
            permission: Object,
            initFillData: {
              type: Boolean,
              default: false,
            },
            isView: {
              type: Boolean,
              default: false,
            },
            isPrint: {
              type: Boolean,
              default: false,
            },
            formKey: String,
            mobileMode: {
              type: Boolean,
              default: false,
            },
            extendProp: {
              type: Object,
              default: () => {
                return {}
              },
            },
            isSupportMobile: {
              type: Boolean,
              default: false,
            },
            instId: [String, Number],
            isPreview: {
              type: Boolean,
              default: false,
            },
          },
          template: this.html,
        })
      },
    },
  }
</script>
<style lang="scss">
  .transition {
    outline: 1px dotted #85a5ff;
    outline-width: 2px;
    outline-offset: -1px;
  }
  .el-tabs--border-card {
    border: 1px solid #ebeef5;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .tabcheck_btn {
    text-align: right;
    padding-top: 20px;
  }
  .loaded-fail__div {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #f56c6c;
  }
  .main-table {
    border-collapse: separate;
    margin-bottom: 20px;
    tr > td {
      &:empty {
        border: none !important;
      }
    }
  }
  @media print {
    .printHide {
      display: none;
    }
    .main-field {
      line-height: 1.5 !important;
    }
    .el-main {
      padding: 0px !important;
    }
    .sub-table-header ::v-deep th {
      min-width: 110px !important;
    }
    colgroup {
      display: none !important;
    }
    .el-table__header {
      width: 100% !important;
    }
    .el-table__body {
      width: 100% !important;
    }
    .el-table_1_column_1 {
      width: 60px !important;
    }
    .el-table_1_column_3 {
      width: 100px !important;
    }
    .el-table_1_column_4 {
      width: 100px !important;
    }
    .el-table_1_column_5 {
      display: none !important;
    }
    .gutter {
      display: none !important;
    }
    .form-table {
      border: 1px solid rgb(238, 235, 235) !important;
    }
    .form-table > tbody > tr > th,
    .form-table > tbody > tr > td,
    .form-table > tfoot > tr > td,
    .form-table > thead > tr > th {
      border: 1px solid rgb(238, 235, 235) !important;
    }
    .el-table__header {
      border: 1px solid rgb(238, 235, 235) !important;
    }
    .el-table__header > tbody > tr > th,
    .el-table__header > tbody > tr > td,
    .el-table__header > tfoot > tr > td,
    .el-table__header > thead > tr > th {
      border: 1px solid rgb(238, 235, 235) !important;
    }
    .el-table__body > tbody > tr > th,
    .el-table__body > tbody > tr > td,
    .el-table__body > tfoot > tr > td,
    .el-table__body > thead > tr > th {
      border: 1px solid rgb(238, 235, 235) !important;
    }
    .el-table th.is-leaf,
    .el-table td {
      border-bottom: 1px solid rgb(238, 235, 235) !important;
    }
  }
  .main-title {
    word-break: break-all;
    text-align: right;
    font-weight: 100;
    color: #545252;
    font-size: 12px;
    padding: 0px 10px !important;
    font-weight: bold;
    line-height: 28px;
  }
  .main-field {
    padding: 10px;
    line-height: 0;
    .unit {
      display: inline-block;
    }
  }
  .online-form-wrap {
    [name='online-form'] .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: 100%;
    }
    .el-input {
      width: 100% !important;
    }
    .amap-page-container {
      .amap-toolbar,
      .amap-geolocation-con,
      .amap-scalecontrol,
      .amap-logo,
      .amap-copyright {
        z-index: 1 !important;
      }
    }
  }
  .el-tooltip__popper {
    p {
      width: 300px;
    }
  }
  .xh_table tfoot td:empty {
    padding: 0 !important;
    border: none !important;
  }
  .online-form-wrap {
    .table_layout_wrap,
    .grandson_table_wrap {
      overflow: auto;
      .form-table {
        width: 100%;
        .sub-table-header > th {
          text-align: center;
          background: #fafafa;
          border-right: 1px solid #f2f2f2;
        }
      }
    }
    .table_layout_wrap {
      td {
        .inputs {
          position: relative;
        }
      }
    }
  }
  .inputs {
    .file-list__wrap {
      padding-left: 0;
      .file-item {
        .file-icon,
        .file-close__icon {
          padding-top: 11px;
        }
      }
    }
  }
  .form-table__wrap {
    .form-table > thead > tr > th:last-child {
      min-width: 100px !important;
    }
  }
  .inputs {
    .edui-default .edui-editor {
      border: none;
    }
  }
  td.is-required:before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }
  // div子表孙表移动和pc样式
  // pc样式
  .sub-div-pc_header,
  .sun-div-pc_header {
    height: 30px;
    line-height: 30px;
    background: #fafafa;
    font-weight: bold;
    font-size: 14px;
  }
  .formT_box {
    .sub-collapse-item-title {
      display: flex;
      flex: 1;
      justify-content: space-between;
      padding-right: 4px;
    }
    .sun-collapse-item-title {
      display: flex;
      flex: 1;
      justify-content: space-between;
      padding-right: 4px;
    }
    .sub-collapse {
      border: none;
    }
    .sun-collapse {
      border: none;
    }
  }
  // 移动样式
  .sub-div-mobile {
    .formT_box {
      .el-collapse-item__content > table {
        width: 100%;
      }

      .sub-collapse {
        border-radius: 8px;
        margin-top: 8px;
        border: none;

        .sub-collapse-item {
          margin-top: 8px;
          background: #fff;
          border: 1px solid #e5e5e5;

          .el-collapse-item__header {
            border: none;

            .sub-collapse-item-title {
              display: flex;
              flex: 1;
              justify-content: space-between;
              padding: 0 10px;
              height: 44px;
              line-height: 44px;

              > span {
                font-weight: bold;
                font-size: 15px;
                color: #222;
              }

              .el-icon-copy-document,
              .el-icon-delete {
                display: inline-block;
                border: 1px solid #409eff;
                border-radius: 50%;
                padding: 3px;
                color: #409eff;
                background: #fff;
              }
            }

            .el-icon-arrow-right:before {
              content: '';
              color: #666;
            }
          }
          .el-collapse-item__wrap {
            border: none;
            .el-collapse-item__content {
              padding-bottom: 0;
            }
          }
        }
      }

      .add-sub-btn {
        width: 100%;
        border: 1px solid #409eff;
        border-radius: 8px;
        color: #409eff;
        margin-top: 8px;
        background: #fff;
        font-size: 13px;
        height: 44px;

        i {
          font-weight: bold;
        }
      }

      .sun-div-container {
        padding: 0 8px;

        .sun-collapse {
          border-radius: 8px;
          margin-top: 8px;
          border: none;

          .sun-collapse-item {
            background: #f9f9f9;
            border-radius: 8px;
            margin-top: 8px;

            .el-collapse-item__header {
              background: none;
              border: none;

              .sun-collapse-item-title {
                display: flex;
                flex: 1;
                justify-content: space-between;
                padding-right: 16px;
                height: 40px;
                line-height: 40px;

                > span {
                  font-weight: bold;
                  font-size: 14px;
                  color: #333;

                  &::before {
                    display: inline-block;
                    content: '';
                    width: 3px;
                    height: 16px;
                    background: #409eff;
                    vertical-align: sub;
                    margin-right: 9px;
                  }
                }

                .el-icon-copy-document,
                .el-icon-delete {
                  display: inline-block;
                  border: 1px solid #409eff;
                  border-radius: 50%;
                  padding: 3px;
                  color: #409eff;
                  background: #fff;
                }
              }
            }

            .el-collapse-item__wrap {
              background: none;
              border: none;
            }
          }
        }

        .add-sun-btn {
          width: 100%;
          border-radius: 8px;
          color: #409eff;
          margin-top: 8px;
          background: #f0f7ff;
          font-size: 13px;
          height: 44px;

          i {
            font-weight: bold;
          }
        }
      }
    }
  }

  ::v-deep .el-table__header {
    width: 100% !important;
    table-layout: fixed;
  }
  ::v-deep .el-table__body {
    width: 100% !important;
  }
  // 样式调整
  .online-form-wrap .table_layout_wrap {
    margin: 0 -20px;
  }
</style>
<style lang="scss" scoped>
  ::v-deep .el-date-editor {
    .el-input__prefix {
      position: absolute;
      left: calc(100% - 28px);
      top: 0;
    }
    input {
      padding-left: 15px;
    }
    .el-input__suffix {
      right: 13px;
    }
  }
  ::v-deep .el-range__icon {
    position: absolute;
    right: 0;
    top: 2px;
  }
  ::v-deep .el-row--flex {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 32px;
    .el-col[style*='border'] {
      .el-form-item {
        margin: 24px 24px 22px;
      }
    }
  }
  ::v-deep .el-row--flex .el-input-number {
    width: 100%;
  }
  ::v-deep .el-collapse {
    border-top: none;
    border-bottom: none;
    // margin-bottom: 40px;
    .el-collapse-item__header {
      margin-bottom: 24px;
    }
    .el-collapse-item__header.is-active {
      border-bottom-color: #ebeef5;
    }
    .el-collapse-item__wrap {
      border-bottom: none;
      .el-collapse-item__content {
        padding-bottom: 0;
      }
    }
  }
  ::v-deep .file-list__wrap .file-item {
    width: inherit;
  }
  ::v-deep .is-vertical {
    border: 1px solid #f5f5f5;
    margin-bottom: 24px;
    .el-header {
      height: 40px !important;
      line-height: 40px !important;
      background: #f2f2f2 !important;
      font-size: 16px;
      color: #222222;
      font-weight: bold;
    }
    .el-main {
      padding: 0 0 1px 0;
      margin-top: -1px;

      .el-collapse-item__header {
        background: #f9f9f9;
        padding: 0 20px;
        margin-bottom: 0;
        color: #222;
        font-weight: bold;
      }
      .el-collapse-item__wrap {
        padding: 20px 20px 0;
      }
      .el-collapse {
        margin-bottom: 0;
      }
    }
  }
  ::v-deep .el-icon-star-on {
    font-size: 22px;
  }
  ::v-deep .formT_box {
    .el-collapse-item__arrow {
      display: none;
    }
  }
</style>
