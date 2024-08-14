<template>
  <div
    class="inputs ht-picture"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <div v-show="!!imgList.length" class="ht-picture__images">
      <el-card
        v-for="(item, index) of imgList"
        :key="item.uid"
        class="ht-picture__card"
        :alt="t('ht.picture.viewOriginalImage')"
        :body-style="bodyStyle"
      >
        <el-image
          :key="index"
          v-loading="loading"
          :src="item.url || getCurrentImgSrc(item)"
          :style="style"
          :preview-src-list="srcList"
          class="ht-picture__item-img"
        />
        <div class="ht-picture__footer">
          <div class="ht-picture__name">
            <template v-if="openUrl">
              <a href="javascript:void(0);" @click="hrefClick()">
                {{ item.name || item.fileName }}
              </a>
            </template>
            <template v-else>
              {{ item.name || item.fileName }}
            </template>
          </div>
          <div class="ht-picture__footer-btn">
            <el-button
              v-if="uploadType === 'local' && downloadable"
              icon="el-icon-download"
              class="ht-picture__download"
              circle
              @click="downloadPicture(item)"
            />

            <el-popconfirm
              v-if="inputWriteable"
              :title="
                t('ht.picture.deleteTip', { clear: t('ht.common.clear') })
              "
              @confirm="handleDelete(item)"
            >
              <el-button slot="reference" icon="el-icon-delete" circle />
            </el-popconfirm>
          </div>
        </div>
      </el-card>
    </div>
    <input
      v-model="value"
      v-validate="inputValidate"
      type="hidden"
      :name="inputName"
    />
    <file-upload
      v-if="uploadType === 'local' && inputWriteable && !userAgentMobile"
      ref="fileUpload"
      v-model="inputVal"
      class="ht-picture-upload"
      :action-url="actionUrlVal"
      :header="headerVal"
      :on-success="handleSuccess"
      :on-progress="onProgress"
      :before-upload="beforeImgUpload"
      :multiple="multiple"
      :limit="limit"
      :size="fileSize"
      :accept="accept"
      :show-file-list="false"
      :with-credentials="withCredentials"
      :on-exceed="handleExceed"
      @clear="handleClear"
    />
    <ht-field-tail
      :writeable.sync="inputWriteable"
      :field-name="inputName"
      :input-value="value"
    />
    <!-- 上传网络图片 -->
    <el-button
      v-if="uploadType == 'web' && inputWriteable"
      size="mini"
      round
      icon="el-icon-plus"
      @click="openDialog"
    >
      {{ t('ht.picture.uploadButtonText') }}
    </el-button>

    <el-popconfirm
      v-if="uploadType == 'web' && inputWriteable && imgList.length"
      class="pop-confirm-btn"
      :title="t('ht.picture.deleteTip', { clear: t('ht.common.clear') })"
      @confirm="handleClear"
    >
      <el-button slot="reference" icon="el-icon-delete" round size="mini">
        {{ t('ht.common.clear') }}
      </el-button>
    </el-popconfirm>
    <!-- 移动端本地图片 -->
    <div
      v-if="inputWriteable && uploadType === 'local' && userAgentMobile"
      class="ht-picture__mobile"
    >
      <input
        id="upload"
        ref="mobilePicRef"
        class="ht-picture__hide-input"
        type="file"
        accept="image/*"
        :multiple="multiple"
        @change="handlePicChange($event)"
      />
      <div class="camera">
        <el-button
          v-if="userAgentMobile && uploadType == 'local'"
          size="mini"
          round
          icon="el-icon-plus"
          @click="clickPicture"
        >
          {{ t('ht.picture.uploadButtonText') }}
        </el-button>
        <el-popconfirm
          v-if="imgList.length"
          class="pop-confirm-btn"
          :title="t('ht.picture.deleteTip', { clear: t('ht.common.clear') })"
          @confirm="handleClear"
        >
          <el-button slot="reference" icon="el-icon-delete" round size="mini">
            {{ t('ht.common.clear') }}
          </el-button>
        </el-popconfirm>
      </div>
    </div>
    <el-dialog
      :visible.sync="dialogFormVisible"
      :title="t('ht.picture.uploadWebImg')"
      :close-on-click-modal="false"
      :width="userAgentMobile ? '85%' : '50%'"
      :custom-class="isMobileClass"
      :append-to-body="appendToBody"
    >
      <el-form
        ref="webImgFormRef"
        :model="webImages"
        data-vv-scope="webImgFrom"
      >
        <ht-form-item :label="t('ht.picture.imgName')" label-width="100px">
          <ht-input
            v-model="webImages.fileName"
            style="width: 100%"
            :placeholder="t('ht.picture.imgNamePlaceHolder')"
            validate="required"
          />
        </ht-form-item>
        <ht-form-item :label="t('ht.picture.imgUrl')" label-width="100px">
          <ht-input
            v-model="webImages.url"
            style="width: 100%"
            :placeholder="t('ht.picture.imgUrlPlaceHolder')"
            validate="required"
          />
        </ht-form-item>
        <div class="ht-dialog-footer">
          <el-button
            type="primary"
            size="small"
            class="submit-button"
            :loading="btnLoading"
            @click="handleSubmit"
          >
            {{ t('ht.common.confirm') }}
          </el-button>
          <el-button size="small" @click="dialogFormVisible = false">
            {{ t('ht.common.close') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import mobileMode from '@/mixins/mobileMode.js'
  import locale from '@/mixins/locale.js'
  import form from '@/mixins/form.js'

  import fileUpload from '../../FileUpload'
  import inputName from '@/mixins/inputName.js'

  const { saveAs } = require('file-saver')
  import { createObjectURL } from '@/util/brower.js'
  import utils from '@/utils.js'
  import _ from 'lodash'
  import { compress } from 'image-conversion'

  export default {
    name: 'HtPicture',
    components: {
      fileUpload,
    },
    mixins: [permission, mobileMode, locale, inputName, form],
    props: {
      compress: {
        type: Boolean,
        default: false,
      },
      value: {
        type: String,
      },
      withCredentials: {
        type: Boolean,
        default: false,
      },
      uploadType: {
        type: String,
        default: '',
        validator: (val) => ['web', 'local'].includes(val),
      },
      actionUrl: {
        type: String,
        default: '',
      },
      headers: Object,
      imgHeight: [String, Number],
      imgWidth: [String, Number],
      limit: Number,
      multiple: {
        type: Boolean,
        default: true,
      },
      allowPreview: {
        type: Boolean,
        default: false,
      },
      allowDownload: {
        type: Boolean,
        default: false,
      },
      fileSize: {
        type: Number,
        default: 6,
      },
      bodyStyle: {
        type: Object,
        default: () => {
          return {
            padding: '10px',
            cursor: 'pointer',
          }
        },
      },
      onProgress: Function,
      openUrl: {
        type: String,
        default: '',
      },
      flowData: {
        type: Object,
        default: () => {
          return {}
        },
      },
      appendToBody: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        imgList: [], //上传成功展示图片列表
        dialogFormVisible: false,
        srcList: [], //图片预览url列表
        webImages: {
          fileName: '',
          url: '',
        },
        accept: 'jpg,png,gif,ico,jpeg,GPG,PNG,GIF,JPEG',
        refreshFileUploadDebounce: _.debounce(this.refreshFileUpload, 200),
        loading: false,
        btnLoading: false,
        compressConfig: 0.3,
      }
    },
    computed: {
      inputVal: {
        get() {
          let imgValue = []
          if (utils.isEmpty(this.value)) {
            imgValue = []
          } else if (this.value.constructor == String) {
            imgValue = [...JSON.parse(this.value)]
          }
          return imgValue
        },
        set() {},
      },
      downloadable() {
        return this.inputWriteable || this.allowDownload
      },
      preview() {
        return this.inputWriteable || this.allowPreview
      },
      style() {
        return {
          width: `${this.imgWidth || ''}px`,
          height: `${this.imgHeight || ''}px`,
        }
      },
      isUpload() {
        return !['r', 'n'].includes(this.permission)
      },
      isMobileClass() {
        return this.userAgentMobile ? 'is-mobile' : 'form-dialog'
      },
      actionUrlVal: function() {
        return this.actionUrl
          ? this.actionUrl
          : this.$requestConfig.uploadUrl
          ? this.handlerUploadUrl
          : 'https://jsonplaceholder.typicode.com/posts/'
      },
      handlerUploadUrl() {
        const baseUrl = this.$requestConfig.uploadUrl
        if (!this.flowData.defId) {
          return baseUrl
        }
        const indexOfMark = baseUrl.indexOf('?')
        if (indexOfMark == -1) {
          return `${baseUrl}?defId=${this.flowData.defId}`
        }
        if (indexOfMark > -1 && indexOfMark == baseUrl.length - 1) {
          return `${baseUrl}defId=${this.flowData.defId}`
        }
        if (indexOfMark > -1 && indexOfMark < baseUrl.length - 1) {
          return `${baseUrl}&defId=${this.flowData.defId}`
        }
        return baseUrl
      },
      headerVal: function() {
        return this.headers
          ? this.headers
          : this.$requestConfig.header
          ? this.$requestConfig.header()
          : null
      },
    },
    watch: {
      imgList: {
        handler() {
          this.syncSrcList()
        },
        deep: true,
        immediate: true,
      },
      value(val) {
        if (val) {
          this.initData()
        } else {
          this.imgList = []
        }
      },
    },
    mounted() {
      if (this.value) {
        this.initData()
      }
    },
    methods: {
      initData() {
        const currentImgList =
          this.value.constructor == String ? JSON.parse(this.value) : this.value
        if (currentImgList.constructor == Array && currentImgList.length > -1) {
          this.updateImgListWithCurrentImgList(currentImgList)
        }
      },
      // 比对原来的图片数组和现在的图片数组，如果元素相同时把原图片中url属性复制过来，避免图片反复加载。
      updateImgListWithCurrentImgList(currentImgList) {
        if (
          !this.imgList ||
          this.imgList.length == 0 ||
          !currentImgList ||
          currentImgList.length == 0
        ) {
          this.imgList = currentImgList
        } else {
          currentImgList.forEach((m) => {
            const oldItem = this.imgList.find(
              (n) =>
                m.uid === n.uid ||
                (m.response &&
                  n.response &&
                  m.response.fileId == n.response.fileId)
            )
            if (oldItem && oldItem.url) {
              m.url = oldItem.url
            }
          })
          this.imgList = currentImgList
        }
      },

      getCurrentImgSrc(item) {
        const this_ = this
        if (item && item.response && item.response.fileId && !item.urlLoading) {
          item.urlLoading = true
          this.loading = true
          this.$requestConfig
            .getImgSrc(item.response.fileId)
            .then((res) => {
              if (res.size > 0) {
                const reader = new FileReader()
                reader.readAsDataURL(res)
                reader.onload = function(e) {
                  // this_.$set(item, 'url', e.target.result)
                  item.url = e.target.result
                  delete item['urlLoading']
                  if (this_.imgList && this_.imgList.length > 0) {
                    const firstItem = this_.imgList[0]
                    this_.$set(this_.imgList, 0, firstItem)
                    this_.imgList.forEach((m) => {
                      // console.info([m.uid, m.url ? m.url.length : '0'])
                    })
                    this_.syncSrcList()
                  }
                }
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      },
      syncSrcList() {
        const urlList = this.imgList.map((file) => file.url)
        this.srcList = this.preview ? urlList : []
      },
      downloadPicture(file) {
        // 组件单独绑定了download事件
        if (this.$options._parentListeners.download) {
          this.$emit('download', file)
        }
        // 未绑定时触发全局download事件处理函数
        else if (this.$requestConfig.download) {
          this.$requestConfig
            .download(file.fileId || file.response ? file.response.fileId : '')
            .then(({ data, headers }) => {
              // 附件下载
              const fileName = decodeURIComponent(
                headers['content-disposition']
                  .split(';')[1]
                  .split('filename=')[1]
              )
              const blob = new Blob([data])
              saveAs(blob, fileName)
            })
            .catch((err) => {
              this.$message.error(
                `${this.$t('ht.file.fileDownloadError')}：${err}`
              )
            })
        }
      },
      handleDelete(item) {
        let currentFileList = utils.isEmpty(this.value)
          ? []
          : this.value.constructor == String
          ? JSON.parse(this.value)
          : this.value
        const index = currentFileList.findIndex((file) => file.uid == item.uid)
        currentFileList.splice(index, 1)
        const imgListIndex = this.imgList.findIndex(
          (file) => file.uid == item.uid
        )
        this.imgList.splice(imgListIndex, 1)
        this.$emit(
          'input',
          currentFileList.length > 0 ? JSON.stringify(currentFileList) : ''
        )
        if (this.uploadType === 'local') {
          this.refreshFileUploadDebounce()
        }
        if (this.userAgentMobile) {
          this.$refs.mobilePicRef.value = ''
        }
      },
      handlePicChange(e) {
        const imgData = [...e.target.files]
        // 如果有个数限制
        if (this.limit) {
          let totalLength = imgData.length + this.imgList.length
          if (this.limit < totalLength) {
            this.$message({
              type: 'warning',
              message: this.t('ht.picture.limitCountTip', {
                limit: this.limit,
              }),
            })
            return
          }
        }
        // 图片格式校验
        let wrongFlag = false
        imgData.forEach((item) => {
          if (this.isPictureType(item.name)) {
            wrongFlag = true
          }
        })
        if (wrongFlag) {
          this.toast()
          return
        }
        imgData.forEach((item) => {
          this.mobileUploadFile(item)
        })
      },
      clickPicture() {
        this.$refs.mobilePicRef.click()
      },
      async handleSubmit() {
        let result = await this.$validator.validateAll('webImgFrom')
        if (!result) {
          return
        }
        this.btnLoading = true
        if (
          this.inputVal.length + 1 > this.limit ||
          this.srcList.length + 1 > this.limit
        ) {
          this.btnLoading = false
          return this.$message({
            type: 'warning',
            message: this.t('ht.picture.limitCountTip', { limit: this.limit }),
          })
        }
        this.setImgList(this.webImages)
        this.$emit('input', JSON.stringify(this.imgList))
        this.dialogFormVisible = false
      },
      openDialog() {
        this.dialogFormVisible = true
        this.btnLoading = false
        this.$nextTick(() => {
          this.$refs.webImgFormRef.resetFields()
          this.webImages = {
            fileName: '',
            url: '',
          }
        })
      },
      setImgList(files) {
        this.imgList.push({
          ...files,
          uid: `${new Date().getTime()}_${Math.ceil(Math.random() * 10)}`,
        })
      },
      handleSuccess(response, file, fileList) {
        let url = ''
        if (
          (file.raw && file.raw.type && file.raw.type.indexOf('image/') > -1) ||
          (!file.raw && file.type && file.type.indexOf('image/') > -1)
        ) {
          url = createObjectURL(file.raw ? file.raw : file)
        }
        this.imgList.push({ ...file, url, fileName: file.name })
        this.$emit('input', JSON.stringify(fileList))
        this.$emit('on-success', response, file, fileList)
        this.refreshFileUploadDebounce()
      },
      beforeImgUpload(file) {
        if (this.isPictureType(file.name)) {
          this.toast()
          return false
        }
        if (this.compress) {
          return new Promise((resolve) => {
            compress(
              file,
              this.$imageCompressConfig
                ? this.$imageCompressConfig
                : this.compressConfig
            ).then((res) => {
              resolve(res)
            })
          })
        }
      },
      clearForm() {
        this.webImages.fileName = ''
        this.webImages.url = ''
      },
      isPictureType(name) {
        const fileType = name.replace(/.+\./, '')
        const allowedTypeArr = this.accept.split(',')
        return allowedTypeArr.indexOf(fileType.toLowerCase()) === -1
      },
      toast() {
        this.$message({
          type: 'warning',
          message: this.t('ht.picture.limitTypeTip'),
        })
      },
      handleClear() {
        this.imgList = []
        this.srcList = []
        this.$emit('input', '')
      },
      // 同步附件数据到上传组件
      refreshFileUpload() {
        this.$nextTick(() => {
          this.$refs.fileUpload && this.$refs.fileUpload.reload(this.inputVal)
        })
      },
      hrefClick() {
        let url = this.openUrl
          .replaceAll('${mvue}', this.$requestConfig.manageUrl)
          .replaceAll('${fvue}', this.$requestConfig.frontUrl)
          .replaceAll('${front}', this.$requestConfig.frontUrl)

        window.open(url, '_blank')
      },
      // 移动端发送上传图片请求
      mobileUploadFile(file) {
        let formData = new FormData()
        formData.append('file', file, file.name)
        this.$requestConfig
          .request({
            url: this.actionUrlVal,
            method: 'post',
            data: formData,
            headers: {
              ...this.headerVal,
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((res) => {
            if (res.success) {
              // 成功之后组装数据 组装成跟pc一样格式，预览时可以服用预览
              let uid = `${new Date().getTime()}_${Math.ceil(
                Math.random() * 10
              )}`
              res.uid = uid
              let fileObj = {
                uid: uid,
                name: file.name,
                response: res,
                url: createObjectURL(file),
              }
              this.imgList.push(fileObj)
              let newCopy = JSON.parse(JSON.stringify(this.imgList))
              // 传给后端需把url删除
              newCopy.forEach((item) => {
                delete item.url
              })
              this.$emit('input', JSON.stringify(newCopy))
            }
          })
      },
      handleExceed() {
        this.$message({
          message: this.t('ht.picture.limitCountTip', { limit: this.limit }),
          type: 'warning',
        })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .ht-picture {
    &__images {
      display: flex;
      flex-wrap: wrap;
      margin: 10px;
    }
    &__card {
      margin-right: 10px;
      margin-bottom: 10px;
    }
    &__item-img {
      height: 240px;
      width: 260px;
      border-radius: 4px;
    }
    &__footer {
      min-height: 32px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    &__name {
      line-height: 32px;
      font-size: 12px;
    }
    &__hide-input {
      display: none;
    }
    .is-mobile {
      width: 84% !important;
      margin-top: 30vh !important;
    }
    .ht-picture__download {
      margin-right: 10px;
    }
    .pop-confirm-btn {
      margin-left: 10px;
    }
  }
  .form-dialog {
    .ht-dialog-footer {
      text-align: center;
      .submit-button {
        width: unset;
        margin-right: 10px;
      }
    }
  }
  .ht-dialog-footer {
    text-align: center;
  }
  ::v-deep {
    input[type='hidden'][aria-invalid='true'] + .ht-picture-upload {
      max-width: 220px;
      border: 1px solid #f56c6c;
    }
  }
</style>
