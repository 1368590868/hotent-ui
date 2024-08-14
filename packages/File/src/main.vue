<template>
  <div
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
    :style="inputsContainerWidth"
  >
    <input
      v-model="value"
      v-validate="inputValidate"
      type="hidden"
      :name="inputName"
    />
    <file-upload
      v-if="inputWriteable"
      ref="fileUpload"
      v-model="inputVal"
      :list-type="pictureWall ? 'picture-card' : null"
      :action-url="actionUrlVal"
      :multiple="multiple"
      :accept="acceptType"
      :before-upload="beforeUploadMethod"
      :on-success="uploadSuccess"
      :on-error="onError"
      :limit="limit"
      :header="headerVal"
      :size="size"
      :readonly="!inputWriteable"
      :with-credentials="withCredentials"
      @on-progress="handleProgress"
      @handle-error="handleError"
      @clear="handleClear"
    >
      <slot slot="append" name="append"></slot>
    </file-upload>
    <div v-if="isMobile && inputWriteable" class="upload-tooltip">
      {{
        $t('ht.file.accept', {
          acceptType: acceptType ? acceptType : $t('ht.file.all'),
        })
      }},{{ $t('ht.file.limitFileSize', { size: size ? size : '50MB' }) }},{{
        $t('ht.file.limitCount', { limit: limit ? limit : 5 })
      }}
    </div>
    <ht-field-tail
      :writeable.sync="writeable"
      :field-name="inputName"
      :input-value="value"
    />
    <!-- 表格模式显示附件 -->
    <file-table
      v-if="typeVal == 'table' && value && JSON.parse(value).length > 0"
      :data="inputVal"
      :permission="permission_sub"
      :size="sizeType"
      :previewable="previewableVal"
      :column-show="columnShow"
      :prop-conf="propConf"
      :downloadable="downloadableVal"
      :sortable="sortable"
      :input-writeable="inputWriteable"
      @preview="preview"
      @download="download"
      @move="move"
      @remove="removeFile"
    />
    <!-- 极简列表模式显示附件 -->
    <file-list
      v-else-if="typeVal == 'list'"
      :data="inputVal"
      :previewable="previewableVal"
      :downloadable="downloadableVal"
      :sortable="sortable"
      :input-writeable="inputWriteable"
      @preview="preview"
      @download="download"
      @move="move"
      @remove="removeFile"
      @sort="handleSort"
    />
    <!-- 图片墙模式 -->
    <file-card
      v-else-if="typeVal == 'card'"
      :data="inputVal"
      :previewable="previewableVal"
      :downloadable="downloadableVal"
      :sortable="sortable"
      :input-writeable="inputWriteable"
      :headers="headerVal"
      :action-url="actionUrlVal"
      :card-badge="cardBadge"
      :thumbnail="thumbnail"
      @preview="preview"
      @download="download"
      @move="move"
      @remove="removeFile"
      @sort="handleSort"
    />
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import HtFieldTail from '../../FieldTail/index'
  import FileUpload from '../../FileUpload/index'
  import Locale from '@/mixins/locale'
  import FileTable from './FileTable'
  import FileList from './FileList'
  import FileCard from './FileCard.vue'
  import mobileMode from '@/mixins/mobileMode.js'
  import _ from 'lodash'
  const { saveAs } = require('file-saver')

  export default {
    name: 'HtFile',
    components: { HtFieldTail, FileUpload, FileTable, FileList, FileCard },
    mixins: [Locale, permission, inputName, form, mobileMode],
    props: {
      type: {
        type: String,
        default: 'table',
        validator: function(value) {
          return ['table', 'list', 'card'].indexOf(value) !== -1
        },
      },
      isSimple: {
        type: Boolean,
        default: false,
      },
      simplicity: {
        type: Boolean,
        default: false,
      },
      withCredentials: {
        type: Boolean,
        default: false,
      },
      actionUrl: {
        type: String,
        default: null,
      },
      value: {
        type: String,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      accept: {
        type: String,
      },
      limit: {
        type: Number,
      },
      pictureWall: {
        type: Boolean,
        default: false,
      },
      header: {
        type: Object,
      },
      size: {
        type: Number,
      },
      sizeType: {
        type: String,
      },
      previewable: {
        type: Boolean,
        default: true,
      },
      allowPreview: {
        type: Boolean,
        default: false,
      },
      downloadable: {
        type: Boolean,
        default: true,
      },
      allowDownload: {
        type: Boolean,
        default: false,
      },
      sortable: {
        type: Boolean,
        default: true,
      },
      propConf: [Array, String],
      beforeUpload: {
        type: Function,
      },
      onSuccess: {
        type: Function,
      },
      onError: {
        type: Function,
      },
      columnShow: {
        type: Object,
        default() {
          return {}
        },
      },
      cardBadge: {
        type: Boolean,
        default: true,
      },
      thumbnail: {
        type: Function,
      },
      flowData: {
        type: Object,
        default: () => {
          return {}
        },
      },
      uploading: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        writeable: true,
        temp: null,
        refreshFileUploadDebounce: _.debounce(this.refreshFileUpload, 200),
        inputVal: [],
      }
    },
    computed: {
      typeVal: function() {
        return this.isSimple || this.simplicity ? 'list' : this.type
      },
      inputsContainerWidth() {
        return this.typeVal !== 'list' && this.formInputsDisplay !== 'block'
          ? { width: 'auto' }
          : {}
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
        return this.header
          ? this.header
          : this.$requestConfig.header
          ? this.$requestConfig.header()
          : null
      },
      acceptType: function() {
        if (this.accept) {
          const ary = []
          this.accept.split(',').forEach((m) => {
            if (m.startsWith('.')) {
              ary.push(m)
            } else {
              ary.push(`.${m}`)
            }
          })
          return ary.join(',')
        }
        return null
      },
      previewableVal: function() {
        return (this.inputWriteable && this.previewable) || this.allowPreview
      },
      downloadableVal: function() {
        return (this.inputWriteable && this.downloadable) || this.allowDownload
      },
    },
    watch: {
      value(val) {
        if (utils.isEmpty(val)) {
          this.inputVal = []
        } else if (val.constructor == String) {
          this.inputVal = [...JSON.parse(val)]
        }
        this.uploadingJudge(this.inputVal)
      },
      inputVal: {
        handler(val) {
          this.$emit('input', val.length > 0 ? JSON.stringify(val) : '')
        },
        deep: true,
      },
    },
    created() {
      if (this.value) {
        this.inputVal = JSON.parse(this.value)
      }
    },
    methods: {
      // 上传前做校验
      beforeUploadMethod(file) {
        if (
          file.name &&
          this.accept &&
          !this.accept.split(',').includes(file.name.split('.')[1])
        ) {
          this.$message(this.$t('ht.file.validateMsg'))
          return false
        }
        if (this.beforeUpload) {
          return this.beforeUpload(file)
        }
        return true
      },
      //获取指定字符串点最后一个字符
      substringType(str) {
        let valueArr = str.split('.')
        return valueArr[valueArr.length - 1]
      },
      // 将文件对象转换为附件对象
      convertFile2Item(file) {
        let name = file.name || (file.response && file.response.fileName)
        const item = {
          name: name,
          size: file.size || (file.response && file.response.size),
          percentage: file.percentage,
          status: file.status,
          state: file.status,
          type: name && name.split('.') ? this.substringType(name) : file.type,
          uid: file.uid,
          prop1: '',
          prop2: '',
          prop3: '',
          prop4: '',
          prop5: '',
          prop6: '',
        }
        if (file.response) {
          item.response = { ...file.response }
          item.username = file.response.username || ''
        }
        return item
      },
      // 对附件对象的操作，包括：添加、更新、删除、清空、调整顺序
      valueOpration(item, opType = 'update', direct) {
        if (opType == 'clear') {
          this.$emit('input', '')
          this.refreshFileUploadDebounce()
          return
        }
        let ary = utils.isEmpty(this.value) ? [] : JSON.parse(this.value)
        const index = ary.findIndex((m) => m.uid == item.uid)
        switch (opType) {
          case 'update': {
            if (index > -1) {
              ary[index] = item
            } else {
              ary.push(item)
            }
            break
          }
          case 'remove':
            ary.splice(index, 1)
            break
          case 'move': {
            const realItem = ary.find((m) => m.uid == item.uid)
            ary = utils.arrayMove(ary, realItem, direct)
            break
          }
        }
        this.$emit('input', ary.length > 0 ? JSON.stringify(ary) : '')
        this.refreshFileUploadDebounce()
      },
      // 当前是否有附件正在上传中的判定
      uploadingJudge(ary) {
        let loadingStatus = false
        if (!ary || ary.constructor != Array || ary.length == 0) {
          loadingStatus = false
        } else {
          ary.forEach((m) => {
            if (
              (m.status === 'success' &&
                m.hasOwnProperty('percentage') &&
                m.percentage === undefined) ||
              m.status === 'uploading'
            ) {
              loadingStatus = true
            }
          })
        }
        this.$emit('update:uploading', loadingStatus)
      },
      // 同步附件数据到上传组件
      refreshFileUpload() {
        this.$nextTick(() => {
          this.$refs.fileUpload.reload(this.inputVal)
        })
      },
      handleError(err, file) {
        this.valueOpration(this.convertFile2Item(file))
        //上传失败的附件在3秒后自动移除
        setTimeout(() => {
          this.valueOpration(this.convertFile2Item(file), 'remove')
        }, 3000)
      },
      handleProgress(event, file) {
        this.valueOpration(this.convertFile2Item(file))
      },
      handleClear() {
        this.valueOpration(null, 'clear')
      },
      move(item, direct) {
        this.valueOpration(item, 'move', direct)
      },
      uploadSuccess(response, file, fileList) {
        this.valueOpration(this.convertFile2Item(file))
        this.$emit('onSuccess', response, file, fileList)
      },
      removeFile(file) {
        this.$refs.fileUpload.abort(file)
        this.valueOpration(this.convertFile2Item(file), 'remove')
        this.$emit('remove', file, this.inputVal)
      },
      download(file) {
        // 组件单独绑定了download事件
        if (this.$options._parentListeners.download) {
          this.$emit('download', file, this.inputVal)
        }
        // 未绑定时触发全局download事件处理函数
        else if (this.$requestConfig.download) {
          this.$requestConfig
            .download(file.response.fileId)
            .then(({ data, headers }) => {
              if (data && headers) {
                // 附件下载
                const fileName = decodeURIComponent(
                  headers['content-disposition']
                    .split(';')[1]
                    .split('filename=')[1]
                )
                const blob = new Blob([data])
                saveAs(blob, fileName)
              }
            })
            .catch((err) => {
              this.$message.error(
                `${this.$t('ht.file.fileDownloadError')}:${err}`
              )
            })
        }
      },
      preview(file) {
        if (file.status !== 'success') {
          this.$message.warning(this.t('ht.file.forbiddenPreview'))
          return
        }
        if (this.previewableVal) {
          // 当前组件未添加preview事件监听 并且 设置了全局预览方法
          if (!this._events.preview && this.$preview) {
            this.$preview(file)
          } else {
            this.$emit('preview', file, this.inputVal)
          }
        } else {
          let msg = this.t('ht.file.nopreview')
          this.$message.warning(msg)
        }
      },
      handleSort(data) {
        this.$emit('input', JSON.stringify(data))
        this.refreshFileUploadDebounce()
      },
    },
  }
</script>
<style lang="scss" scoped>
  input[type='hidden'][aria-invalid='true'] + .file-upload-container {
    border: 1px solid #f56c6c;
  }
  .upload-tooltip {
    word-wrap: break-word;
    font-size: 11px;
    color: #999999;
    line-height: 14px;
  }
</style>
