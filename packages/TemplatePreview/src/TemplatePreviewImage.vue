<template>
  <div>
    <div v-if="imageList.length > 0">
      <span
        v-for="(item, index) in showImage"
        :key="index"
        style="margin-right: 10px"
      >
        <el-image :style="imageStyle" :src="item" :preview-src-list="imageList">
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
      </span>
      <span
        v-if="imageList.length > 3"
        style="
          width: 47px;
          height: 20px;
          font-size: 14px;
          font-family: Source Han Sans SC;
          font-weight: 400;
          line-height: 22px;
          color: #333333;
          opacity: 1;
          margin-left: -10px;
        "
      >
        ...{{
          $t('ht.templatePreview.imageCount', {
            imageListCount: imageList.length,
          })
        }}
      </span>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'HtTemplatePreviewImage',
    props: ['value'],
    data() {
      return {
        imageList: [],
        showImage: [],
      }
    },
    computed: {
      imageStyle() {
        let style = { width: '48px', height: '48px' }
        if (this.imageList > 2) {
          style = { width: '36px', height: '36px' }
        }
        return style
      },
    },
    watch: {
      value() {
        this.loadImg()
      },
    },
    mounted() {
      this.loadImg()
    },
    methods: {
      loadImg() {
        this.imageList = []
        if (this.value) {
          let file = JSON.parse(this.value)
          for (let i = 0; i < file.length; i++) {
            let item = file[i]
            let url =
              this.$requestConfig.portalUrl +
              '/system/file/v1/getImage?fileId=' +
              item.response.fileId
            this.imageList.push(url)
            if (i < 3) {
              this.showImage.push(url)
            }
          }
        }
      },
    },
  }
</script>

<style scoped></style>
