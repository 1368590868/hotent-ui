<template>
  <el-dialog
    :title="$t('ht.templateForm.formContent')"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    :style="{ '--dialogHeight': dialogHeight }"
    custom-class="template-form-dialog"
    top="5vh"
    :append-to-body="appendToBody"
  >
    <span>
      <ht-template-form
        v-if="dialogVisible"
        class="template-form-dialog_form"
        :template-key="templateKey"
        :is-share="false"
        open-type="dialog"
        :in-dialog="true"
        :dialog-param="dialogParam"
        :action="action"
        :quit-after-saving="quitAfterSaving"
        @close="close"
      ></ht-template-form>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    name: 'HtTemplateFormDialog',
    props: {
      appendToBody: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        dialogVisible: false,
        templateKey: '',
        action: 'get',
        dialogWidth: '70%',
        dialogHeight: '',
        dialogParam: {},
        quitAfterSaving: false,
      }
    },
    methods: {
      showDialog(param) {
        this.templateKey = param.templateKey
        this.action = param.action
        this.dialogParam = param.dialogParam
        this.dialogHeight = param.dialogHeight
        this.dialogWidth = param.dialogWidth
        this.quitAfterSaving = !(
          !param.quitAfterSaving || param.quitAfterSaving == 'false'
        )
        this.dialogVisible = true
      },
      close() {
        this.dialogVisible = false
        this.$emit('close')
      },
    },
  }
</script>

<style lang="scss" scoped>
  ::v-deep {
    .template-form-dialog {
      height: var(--dialogHeight);
      .el-dialog__body {
        height: calc(100% - 84px);
        overflow: auto;
        box-sizing: border-box;
        .el-button {
          margin-right: 10px;
        }
        .template-form-dialog_form {
          width: 100%;
          padding: 0;
          .base-main_box {
            box-sizing: border-box;
            margin: 0;
            width: 100%;
            height: 100%;
            padding: 0 20px;
            #printData {
              max-height: calc(var(--dialogHeight) - 170px);
              overflow-y: auto;
            }
          }
        }
      }
    }
  }
</style>
