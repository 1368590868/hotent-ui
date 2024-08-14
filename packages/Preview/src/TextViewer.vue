<template>
  <div class="text-container">
    <loading v-if="loading" />
    <pre v-else class="text-viewer__pre">{{ text }}</pre>
  </div>
</template>

<script>
  import Loading from './Loading.vue'
  import watermark from './watermark'

  export default {
    name: 'TextViewer',
    components: { Loading },
    props: {
      src: {
        type: String,
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
        text: '',
        loading: false,
      }
    },
    watch: {
      src: {
        handler: function(newVal) {
          if (newVal) {
            const that = this
            this.loading = true
            this.$requestConfig
              .request({
                url: this.src,
                headers: this.headers,
                responseType: 'arraybuffer',
              })
              .then((response) => {
                var reader = new FileReader()
                reader.onload = function() {
                  var content = reader.result
                  that.$nextTick(() => {
                    that.text = content
                  })
                }
                const { data, headers } = response
                const type = headers['content-type']
                let textBlob = null
                if (type) {
                  textBlob = new Blob([data], { type })
                } else {
                  textBlob = new Blob([data])
                }
                reader.readAsText(textBlob)
              })
              .catch((err) => {
                this.$emit('preview-error', err)
              })
              .finally(() => (this.loading = false))
          }
        },
        immediate: true,
      },
    },
    mounted() {
      this.watermark && this.watermarkRender()
    },
    methods: {
      watermarkRender() {
        watermark('.text-container', this.watermarkOptions)
      },
    },
  }
</script>
<style lang="scss" scoped>
  .text-container {
    .text-viewer__pre {
      word-wrap: break-word;
      white-space: pre-wrap;
      margin: 18px;
    }
  }
</style>
