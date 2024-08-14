<template>
  <div class="file-upload-container">
    <el-upload
      ref="elUploadEl"
      :list-type="listType"
      :action="actionUrl"
      :file-list="files"
      :headers="header"
      :show-file-list="false"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :before-upload="handleBeforeUpload"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-error="handleError"
      :with-credentials="withCredentials"
    >
      <el-tooltip placement="top" effect="light">
        <div slot="content">
          <span>{{ $t('ht.file.fileAcceptType') }}：{{ acceptLabel }}</span>
          <br />
          <span>{{ $t('ht.file.fileSizeLimit') }}{{ size }}MB</span>
          <br />
          <span>{{ $t('ht.file.fileCountLimit', { limit: limit }) }}</span>
        </div>
        <el-button v-if="!readonly" size="mini" round icon="el-icon-plus">
          {{ $t('ht.picture.uploadButtonText') }}
        </el-button>
      </el-tooltip>
    </el-upload>

    <el-button
      v-if="!readonly && files.length > 0"
      v-popconfirm="{
        content: $t('ht.file.confirmClear'),
        confirm: handleClear,
      }"
      size="mini"
      round
      icon="el-icon-delete"
    >
      {{ $t('ht.common.clear') }}
    </el-button>

    <slot name="append"></slot>
  </div>
</template>
<script>
  export default {
    name: 'HtFileUpload',
    props: {
      withCredentials: {
        type: Boolean,
        default: false,
      },
      value: {
        type: Array,
        required: true,
      },
      actionUrl: {
        type: String,
        required: true,
      },
      listType: {
        type: String,
      },
      multiple: {
        type: Boolean,
      },
      accept: {
        type: String,
      },
      limit: {
        type: Number,
        default: 5,
      },
      header: {
        type: Object,
      },
      size: {
        type: Number,
        default: 50,
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      beforeUpload: {
        type: Function,
      },
      onSuccess: {
        type: Function,
      },
      onExceed: {
        type: Function,
      },
      onError: {
        type: Function,
      },
    },
    data() {
      return {
        files: [],
      }
    },
    computed: {
      acceptLabel: function() {
        return this.accept ? this.accept : this.$t('ht.file.all')
      },
    },
    watch: {
      value: {
        handler(val) {
          if (val && val.length < 1) {
            this.files = []
          } else {
            this.files = val
          }
        },
        deep: true,
        immediate: true,
      },
    },
    created() {
      this.files = this.value || []
    },
    methods: {
      reload(files) {
        this.files = files
      },
      // 附件是否超过最大尺寸
      exceedFileSize(file) {
        return file.size > this.size * 1024 * 1024
      },
      handleBeforeUpload(file) {
        let resultVal = false
        if (this.exceedFileSize(file)) {
          let computerSize = this.$options.filters['computerSize'](file.size)
          this.$message({
            message: `${this.$t('ht.file.fileSizeErrorMsg', {
              computerSize: computerSize,
            })}${this.size}MB.`,
            type: 'warning',
          })
          resultVal = false
        } else {
          resultVal = true
        }

        if (
          this.beforeUpload &&
          this.beforeUpload.constructor == Function &&
          resultVal
        ) {
          resultVal = this.beforeUpload(file)
        }

        if (resultVal) {
          this.files.push(file)
        }

        return resultVal
      },
      handleProgress(event, file, fileList) {
        const index = this.files.findIndex((m) => m === file)
        index > -1 && this.$set(this.files, index, file)
        this.$emit('on-progress', event, file, fileList)
      },
      handleExceed(files, fileList) {
        if (this.onExceed && this.onExceed.constructor == Function) {
          this.onExceed(files, fileList)
        } else {
          this.$message({
            message: this.$t('ht.file.fileLimitErrorMsg', {
              limit: this.limit,
            }),
            type: 'warning',
          })
        }
      },
      handleSuccess(response, file, fileList) {
        if (this.onSuccess && this.onSuccess.constructor == Function) {
          this.onSuccess(response, file, fileList)
        }
        const index = this.files.findIndex((m) => m === file)
        file.state = 'success'
        index > -1 && this.$set(this.files, index, file)
      },
      handleError(err, file, fileList) {
        if (this.onError && this.onError.constructor == Function) {
          this.onError(err, file, fileList)
        }
        this.$emit('handle-error', err, file, fileList)
        const index = this.files.findIndex((m) => m === file)
        file.state = 'exception'
        index > -1 && this.$set(this.files, index, file)
        this.$message({
          message: this.$t('ht.file.fileUploadErrorMsg', {
            fileName: file.name,
          }),
          type: 'error',
          onClose: () => {
            this.files.remove(file)
          },
        })
      },
      handleClear() {
        this.files.forEach((m) => {
          this.abort(m)
        })
        this.$refs.elUploadEl.clearFiles()
        this.files = []
        this.$emit('clear')
      },
      abort(file) {
        // 附件还在上传中，则中止上传。
        if (file && file.status === 'uploading') {
          this.$refs.elUploadEl.abort(file)
        }
      },
      remove(file) {
        this.abort(file)
        this.files.remove(file)
        for (var i = 0; i < this.files.length; i++) {
          if (this.files[i].uid == file.uid) {
            this.files.splice(i, 1) //删除数组某一项
          }
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .el-upload {
    display: inline;
    text-align: center;
    cursor: pointer;
    outline: none;
  }

  .file-upload-container {
    margin-bottom: 10px;
  }

  div.file-upload-container > div {
    display: inline-block;
    margin-right: 10px;
  }
</style>
