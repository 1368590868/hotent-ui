<template>
  <div class="pdf-container">
    <div ref="pdfContainerBody" class="pdf-container__body">
      <loading v-if="loading" />
      <template v-for="item in pageNumber" v-else>
        <vue-pdf
          ref="pdf"
          :key="item"
          :src="vuePdfSrc"
          :page="item"
          @load="onLoad"
        ></vue-pdf>
      </template>
    </div>
  </div>
</template>

<script>
  import Loading from './Loading.vue'
  import watermark from './watermark'
  import VuePdf from 'vue-pdf'
  import mobileMode from 'hotent-ui/src/mixins/mobileMode'
  import CMapReaderFactory from 'vue-pdf/src/CMapReaderFactory.js'
  import panzoom from 'panzoom'
  import { createObjectURL } from 'hotent-ui/src/util/brower.js'

  export default {
    name: 'PdfViewer',
    components: {
      Loading,
      VuePdf,
    },
    mixins: [mobileMode],
    props: {
      src: {
        type: String,
        default: null,
      },
      headers: {
        type: Object,
        default: () => {
          return {}
        },
      },
      watermark: {
        type: Boolean,
        default: false,
      },
      watermarkOptions: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        pdfSrc: '',
        vuePdfSrc: null,
        loading: false,
        pageNumber: 1,
      }
    },
    mounted() {
      this.post()
    },
    methods: {
      onLoad() {
        panzoom(this.$refs.pdfContainerBody)
      },
      handlePaf() {
        const this_ = this
        const loadingPdf = VuePdf.createLoadingTask({
          url: this_.pdfSrc,
          CMapReaderFactory,
        })
        loadingPdf.promise
          .then((pdf) => {
            this_.vuePdfSrc = loadingPdf
            this_.pageNumber = pdf.numPages
          })
          .finally(() => {
            this.loading = false
            this.$nextTick(() => this.watermarkRender())
          })
      },
      post() {
        this.$requestConfig
          .request({
            url: this.src,
            headers: this.headers,
            responseType: 'arraybuffer',
          })
          .then((response) => {
            const { data, headers } = response
            const type = headers['content-type']
            if (type) {
              this.pdfSrc = createObjectURL(new Blob([data], { type }))
            } else {
              this.pdfSrc = createObjectURL(new Blob([data]))
            }
            this.pdfSrc += '#toolbar=0'
            this.handlePaf()
          })
          .catch((err) => {
            this.$emit('preview-error', err)
          })
      },
      watermarkRender() {
        if (this.watermark) {
          watermark('.pdf-container', this.watermarkOptions)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .pdf-container {
    height: 100%;
    .pdf-container__body {
      height: 100%;
    }
  }
</style>
