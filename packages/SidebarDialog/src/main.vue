<template>
  <el-dialog
    :width="width"
    class="right-dialog"
    height="100%"
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="beforeClose"
    :append-to-body="appendToBody"
    :custom-class="customClass"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :destroy-on-close="destroyOnClose"
    :center="center"
    :fullscreen="fullscreen"
    :top="top"
    @open="open"
    @opened="opened"
    @close="close"
    @closed="closed"
  >
    <slot slot="title" name="title"></slot>
    <slot></slot>
    <slot slot="footer" name="footer"></slot>
  </el-dialog>
</template>

<script>
  export default {
    name: 'HtSidebarDialog',
    props: {
      width: {
        type: String,
        default: () => {
          return '80%'
        },
      },
      title: {
        type: String,
        default: '',
      },
      visible: {
        type: Boolean,
        default: false,
      },
      beforeClose: {
        type: Function,
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      customClass: {
        type: String,
      },
      closeOnClickModal: {
        type: Boolean,
        default: false,
      },
      closeOnPressEscape: {
        type: Boolean,
        default: true,
      },
      showClose: {
        type: Boolean,
        default: true,
      },
      destroyOnClose: {
        type: Boolean,
        default: false,
      },
      center: {
        type: Boolean,
        default: false,
      },
      fullscreen: {
        type: Boolean,
        default: false,
      },
      top: {
        type: String,
        default: '0vh',
      },
      open: {
        type: Function,
        default() {
          return () => {}
        },
      },
      opened: {
        type: Function,
        default() {
          return () => {}
        },
      },
      close: {
        type: Function,
        default() {
          return () => {}
        },
      },
      closed: {
        type: Function,
        default() {
          return () => {}
        },
      },
    },
    data() {
      return {}
    },
    computed: {
      dialogVisible: {
        get() {
          return this.visible
        },
        set(val) {
          this.$emit('update:visible', val)
        },
      },
    },
    watch: {},
    created() {},
    methods: {},
  }
</script>

<style lang="scss" scoped>
  .right-dialog ::v-deep.el-dialog {
    height: 100% !important;
    border-radius: 0 !important;
    right: 0 !important;
    float: right !important;
  }

  .right-dialog ::v-deep .el-dialog__header {
    border-bottom: 1px solid darkgrey;
  }

  ::v-deep .el-dialog__body {
    height: calc(100% - 145px);
    overflow-y: auto;
  }

  .right-dialog ::v-deep .dialog-footer {
    position: absolute;
    bottom: 20px;
    left: 0px;
    right: 0px;
    text-align: center;
  }
  .right-dialog.el-dialog__wrapper {
    overflow: hidden;
  }
</style>
