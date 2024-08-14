<template>
  <el-dialog
    :title="`url${$t('ht.common.content')}`"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    :style="{ '--dialogHeight': dialogHeight }"
    custom-class="template-iframe-dialog"
    top="5vh"
  >
    <iframe
      width="100%"
      class="template-iframe-dialog_iframe"
      frameborder="0"
      hspace="0"
      :src="url"
    ></iframe>
  </el-dialog>
</template>

<script>
  export default {
    name: 'HtTemplateIframeDialog',
    data() {
      return {
        dialogVisible: false,
        dialogWidth: '70%',
        dialogHeight: '740px',
        url: '',
      }
    },
    methods: {
      showDialog(param) {
        this.url = param.url
        if (param.dialogWidth) {
        }
        this.dialogWidth =
          param.dialogWidth && String(param.dialogWidth).includes('px')
            ? param.dialogWidth
            : param.dialogWidth
            ? param.dialogWidth + 'px'
            : '70%'
        this.dialogHeight =
          param.dialogHeight && String(param.dialogHeight).includes('px')
            ? param.dialogHeight
            : param.dialogHeight
            ? param.dialogHeight + 'px'
            : '740px'
        this.dialogVisible = true
      },
    },
  }
</script>

<style lang="scss" scoped>
  ::v-deep {
    .template-iframe-dialog {
      height: var(--dialogHeight);
      box-sizing: border-box;
      .el-dialog__body {
        height: calc(100% - 84px);
        overflow: auto;
        box-sizing: border-box;
        .el-button {
          margin-right: 10px;
        }
        .template-iframe-dialog_iframe {
          height: calc(100% - 4px);
        }
      }
    }
  }
</style>
