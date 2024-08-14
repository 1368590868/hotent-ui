<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="100%"
    custom-class="preview__dialog"
    :title="titleVal"
    append-to-body
    destroy-on-close
    :show-close="closeable"
    @close="handleClose"
  >
    <loading v-if="loading" />
    <fill-page v-if="errorMessage" type="2" :tip="errorMessage" />
    <!-- 预览pdf.word等文件格式 -->
    <pdf-viewer
      v-else-if="mode == 'pdf'"
      :src="src"
      :headers="headerVal"
      :watermark="watermark"
      :watermark-options="watermarkOptions"
      @preview-error="handlePreviewErr"
    />
    <frame-viewer
      v-else-if="mode == 'html' || mode == 'picture'"
      :src="src"
      :mode="mode"
      :headers="headerVal"
      :watermark="watermark"
      :watermark-options="watermarkOptions"
      @preview-error="handlePreviewErr"
    />
    <text-viewer
      v-else-if="mode == 'txt'"
      :src="src"
      :headers="headerVal"
      :watermark="watermark"
      :watermark-options="watermarkOptions"
      @preview-error="handlePreviewErr"
    />
  </el-dialog>
</template>

<script>
  import Vue from 'vue'
  import Loading from './Loading.vue'
  import PdfViewer from './PdfViewer.vue'
  import FrameViewer from './FrameViewer.vue'
  import TextViewer from './TextViewer.vue'
  import FillPage from './FillPage.vue'
  import { t } from 'hotent-ui/src/locale'

  const reg = new RegExp(/^(http.*?\/\/.*?)\/.*$/)
  export default {
    name: 'HtPreview',
    components: {
      PdfViewer,
      FrameViewer,
      TextViewer,
      FillPage,
      Loading,
    },
    props: {
      title: {
        type: String,
        default() {
          return t('ht.preview.filePreview')
        },
      },
      closeable: {
        type: Boolean,
        default: true,
      },
      headers: {
        type: Object,
        default: null,
      },
      previewMethod: {
        type: Function,
        default: (url, headers, portalBaseUrl = '') => {
          return new Promise((resolve, reject) => {
            Vue.prototype.$requestConfig
              .request({
                url: url,
                headers: headers,
              })
              .then((data) => {
                const result = { src: null, mode: null, errorMessage: null }
                const loadError = t('ht.preview.loadError')
                if (!data) {
                  result.errorMessage = t('ht.preview.notExistMsg')
                } else if (data.result == 'fileNotSupported') {
                  result.errorMessage = t('ht.preview.notSupported')
                } else if (
                  typeof data == 'object' &&
                  data.hasOwnProperty('state') &&
                  (!data.state || !data.result)
                ) {
                  result.errorMessage = data.message || loadError
                } else if (
                  typeof data == 'object' &&
                  data.hasOwnProperty('result') &&
                  data.result === 'error'
                ) {
                  result.errorMessage = loadError
                } else {
                  const baseUrl = portalBaseUrl
                    ? portalBaseUrl
                    : reg.test(url)
                    ? reg.exec(url)[1]
                    : ''
                  switch (data.result) {
                    case 'html':
                      result.src = `${baseUrl}${data.pdfUrl}`
                      break
                    case 'txt':
                      result.src = `${baseUrl}${data.TxtUrl}`
                      break
                    case 'picture':
                      result.src = `${baseUrl}${data.currentUrl}`
                      break
                    case 'compress':
                      result.errorMessage = t(
                        'ht.preview.notSupportedOnlinePreview'
                      )
                      break
                    case 'media':
                      result.errorMessage = t(
                        'ht.preview.notSupportedPlayVideo'
                      )
                      break
                    case 'pdf':
                      result.src = `${baseUrl}${data.pdfUrl}`
                      break
                    default:
                      result.errorMessage = t('ht.preview.notSupportedPreview')
                      break
                  }
                  result.mode = data.result
                }
                resolve(result)
              })
              .catch((err) => {
                reject(err)
              })
          })
        },
      },
      watermark: {
        type: Boolean,
        default: false,
      },
      watermarkOptions: {
        type: Object,
        default: () => {
          return { text: () => 'watermark' }
        },
      },
      portalBaseUrl: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        dialogVisible: false,
        mode: null,
        src: null,
        loading: false,
        tempTitle: null,
        errorMessage: null,
      }
    },
    computed: {
      headerVal: function() {
        return this.headers
          ? this.headers
          : this.$requestConfig.header
          ? this.$requestConfig.header()
          : null
      },
      titleVal: function() {
        return this.tempTitle ? this.tempTitle : this.title
      },
    },
    methods: {
      handleClose() {
        this.src = null
        this.mode = null
        this.errorMessage = null
      },
      handlePreviewErr(err) {
        this.errorMessage = `${this.$t('ht.preview.previewError')}：${err}`
      },
      preview(url, title) {
        this.src = null
        this.mode = null
        this.errorMessage = null
        this.tempTitle = title
        this.loading = true
        this.dialogVisible = true
        this.previewMethod(url, this.headerVal, this.portalBaseUrl)
          .then((resp) => {
            this.mode = resp.mode
            this.errorMessage = resp.errorMessage
            this.src = resp.src
          })
          .catch((err) => {
            this.errorMessage = `${this.$t('ht.preview.previewError')}：${err}`
          })
          .finally(() => {
            this.loading = false
          })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .el-dialog__wrapper {
    overflow: hidden;

    ::v-deep .preview__dialog {
      height: calc(100% - 20px);
      background: transparent;
      margin: 0 !important;

      .el-dialog__header {
        background: #000;
        min-height: 20px;
        padding: 10px;
      }
      .el-dialog__title {
        color: #fff;
      }
      .el-dialog__headerbtn {
        top: 10px;
      }
      .el-dialog__close {
        color: #fff;
      }
      .el-dialog__body {
        padding: 10px 0 20px 0;
        background: #fff;
        height: calc(100% - 50px);
        margin: 0 auto;
        overflow: auto;
      }
    }
  }
</style>
