<template>
  <img
    v-if="permission != 'n'"
    :src="src"
    :style="imgStyle"
    @click="imgClick"
  />
</template>
<script>
  import { createObjectURL } from '@/util/brower.js'
  import permission from '@/mixins/permission.js'

  export default {
    name: 'HtImage',
    mixins: [permission],
    props: {
      isDisplay: {
        type: Boolean,
        default: true,
      },
      imgSrc: String,
      fileJson: String,
      imgHeight: Number,
      imgWidth: Number,
      openUrl: String,
      openType: String,
    },
    data() {
      return {
        src: '',
      }
    },
    computed: {
      imgStyle() {
        return {
          height: this.imgHeight > 0 ? `${this.imgHeight}px` : 'auto',
          width: this.imgWidth > 0 ? `${this.imgWidth}px` : 'auto',
          maxWidth: '100%',
          cursor: this.openUrl ? 'pointer' : '',
        }
      },
    },
    created() {
      if (this.isDisplay) {
        if (this.fileJson && this.$requestConfig.download) {
          var json = JSON.parse(this.fileJson)
          // 全局附件下载方法
          this.$requestConfig
            .download(json[0].id)
            .then((response) => {
              const data =
                response instanceof ArrayBuffer ? response : response.data
              this.src = createObjectURL(new Blob([data]))
            })
            .catch((err) => {
              //表单预览，下载图片等文件失败时，提示语
              this.$message.error(this.$t('ht.image.downloadErrorMsg'))
            })
        }
      } else {
        this.src = this.imgSrc
      }
    },
    methods: {
      imgClick() {
        if (this.openUrl) {
          window.open(this.openUrl, '_blank')
        }
      },
    },
  }
</script>
