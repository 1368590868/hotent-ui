<template>
  <div class="frame-container">
    <div class="frame-container__body">
      <loading v-if="loading" />
      <iframe
        v-else-if="mode === 'html'"
        id="myNormframe"
        frameborder="0"
        scrolling="no"
        hspace="0"
        :src="dataSrc"
        class="frame-viewer__iframe"
        align="middle"
      ></iframe>
      <img
        v-else-if="mode === 'picture'"
        id="myImg"
        :src="dataSrc"
        class="frame-viewer__img"
      />
    </div>
  </div>
</template>

<script>
  import Loading from './Loading.vue'
  import watermark from './watermark'
  import { createObjectURL } from '../../../src/util/brower.js'

  export default {
    name: 'FrameViewer',
    components: { Loading },
    props: {
      src: {
        type: String,
        default: null,
      },
      mode: {
        type: String,
        default: '',
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
        dataSrc: null,
        loading: false,
      }
    },
    mounted() {
      this.post(this.src)
    },
    methods: {
      post(url) {
        this.loading = true
        this.$requestConfig
          .request({
            url,
            headers: this.headers,
            responseType: 'arraybuffer',
          })
          .then((response) => {
            const { data, headers } = response
            const type = headers['content-type']

            if (type) {
              if (window.navigator && window.navigator.msSaveBlob) {
                //使用Blob构造函数可以直接在客户端上创建和操作Blob。msSaveBlob：只提供一个保存按钮
                this.dataSrc = window.navigator.msSaveBlob(
                  new Blob([data], { type })
                )
              } else {
                this.dataSrc = createObjectURL(new Blob([data], { type }))
              }
              console.log('createObjectURL(new Blob([data], { type }))')
            } else {
              if (window.navigator && window.navigator.msSaveBlob) {
                this.dataSrc = window.navigator.msSaveBlob(new Blob([data]))
              } else {
                this.dataSrc = createObjectURL(new Blob([data]))
              }

              console.log('createObjectURL(new Blob([data]))')
            }
          })
          .catch((err) => {
            this.$emit('preview-error', err)
            console.log('catch')
          })
          .finally(() => {
            this.loading = false
            this.$nextTick(() => this.ready())
            console.log('finally')
          })
      },
      ready() {
        const that = this
        if (this.mode === 'html') {
          const iframe = document.getElementById('myNormframe')
          if (!iframe) {
            return
          }
          if (iframe.attachEvent) {
            iframe.attachEvent('onload', function() {
              that.setFrameBody(this.contentWindow.document)
              that.watermarkRender()
            })
          } else {
            iframe.onload = function() {
              that.setFrameBody(this.contentWindow.document)
              that.watermarkRender()
            }
          }
        } else {
          const myImg = document.getElementById('myImg')
          if (!myImg) {
            return
          }
          myImg.onload = function() {
            that.watermarkRender()
          }
        }
      },
      setFrameBody(doc) {
        const frameBody = doc.querySelector('body')
        frameBody.style.display = 'flex'
        frameBody.style.alignItems = 'center'
        frameBody.style.justifyContent = 'center'
        doc.getElementsByTagName('img')[0].style.maxWidth = '100%'
        doc.getElementsByTagName('img')[0].style.height = '100%'
      },
      watermarkRender() {
        if (this.watermark) {
          watermark('.frame-container', this.watermarkOptions)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .frame-container {
    height: 100%;
    .frame-container__body {
      height: 100%;
    }

    .frame-viewer__iframe {
      width: 100%;
      height: 100%;
      border: 0;
      img {
        max-width: 100%;
        height: auto;
      }
    }
    .frame-viewer__img {
      width: 100%;
      height: auto;
      border: 0;
    }
  }
</style>
