<template>
  <div v-if="permission != 'n'" :style="containerStyle">
    <canvas v-show="showCode" ref="htQrcode" class="qr-canvas"></canvas>
    <!-- <el-skeleton v-if="!showCode" :rows="3" animated /> -->
    <template v-if="!showCode">
      <span>-</span>
      <div v-if="instId && !isSupportMobile" class="error-tooltip">
        {{ $t('ht.qrCode.tip') }}
      </div>
    </template>
  </div>
</template>

<script>
  import permission from '@/mixins/permission.js'
  export default {
    name: 'HtQrcode',
    mixins: [permission],
    props: {
      width: {
        type: Number,
        default: 130,
      },
      height: {
        type: Number,
        default: 130,
      },
      url: String,
      instId: [String, Number],
      isSupportMobile: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        showCode: false,
        curUrl: null,
      }
    },
    computed: {
      containerStyle() {
        return {
          width: `${this.width}px`,
          height: `${this.height}px`,
          display: 'inline-block',
        }
      },
      urlVal() {
        return this.curUrl ? this.curUrl : this.url
      },
    },
    watch: {
      urlVal: {
        handler: function(newVal) {
          if (newVal) {
            this.$nextTick(() => this.initQrcode())
          }
        },
        immediate: true,
      },
    },
    mounted() {
      if (!this.url && this.instId && this.isSupportMobile) {
        this.getQrcodeUrl()
      }
    },
    methods: {
      getQrcodeUrl() {
        // 未传入url时，调用外部方法获取url
        if (this.$requestConfig.getQrcodeUrl) {
          const result = this.$requestConfig.getQrcodeUrl(this.instId)
          if (result) {
            if (result.constructor == Promise) {
              result.then((data) => {
                this.curUrl = data && data.value.shortUrl
              })
            } else if (result.constructor == String) {
              this.curUrl = result
            }
          }
        }
      },
      initQrcode() {
        let noErr = true
        this.$qrcode.toCanvas(
          this.$refs.htQrcode,
          `${this.$requestConfig.getBaseMobileUrl()}/${this.urlVal}`,
          function(error) {
            if (error) {
              noErr = false
              throw error
            }
          }
        )
        this.showCode = noErr
      },
    },
  }
</script>
<style lang="scss" scoped>
  .qr-canvas {
    height: 100% !important;
    width: 100% !important;
  }
  .error-tooltip {
    color: #f56c6c;
    font-size: 12px;
    line-height: 10px;
  }
</style>
