<template>
  <draggable
    v-model="dataVal"
    class="el-upload-list el-upload-list--picture-card"
    tag="ul"
    v-bind="dragOptions"
    handle=".handle"
    @start="isDragging = true"
    @end="isDragging = false"
  >
    <transition-group type="transition" name="flip-list">
      <li
        v-for="file in dataVal"
        :key="file.uid"
        :class="[
          'file-item',
          'el-upload-list__item',
          {
            'is-success': file.status == 'success',
            'is-uploading': file.status == 'uploading',
          },
        ]"
      >
        <img
          v-if="file.status == 'success'"
          class="el-upload-list__item-thumbnail"
          :src="thumbnailComp(file, actionUrl)"
          @error="defaultImg"
        />
        <!-- <label
          v-if="cardBadge && file.status == 'success'"
          class="el-upload-list__item-status-label"
        >
          <i class="el-icon-upload-success el-icon-check"></i>
        </label> -->
        <el-progress
          v-else-if="file.status == 'uploading'"
          type="circle"
          :percentage="Math.floor(file.percentage)"
        ></el-progress>
        <span
          v-if="inputWriteable || previewable"
          class="el-upload-list__item-actions"
        >
          <span
            v-if="sortable && inputWriteable"
            class="handle"
            :title="t('ht.file.sort')"
          >
            <i class="el-icon-rank"></i>
          </span>
          <span
            v-if="previewable"
            class="el-upload-list__item-preview"
            :title="t('ht.file.preview')"
            @click="$emit('preview', file)"
          >
            <i class="el-icon-zoom-in"></i>
          </span>
          <el-popconfirm
            v-if="inputWriteable"
            :title="$t('ht.file.confirmDelete')"
            @confirm="$emit('remove', file)"
          >
            <span
              slot="reference"
              class="el-upload-list__item-delete"
              :title="t('ht.common.remove')"
            >
              <i class="el-icon-delete"></i>
            </span>
          </el-popconfirm>
        </span>
      </li>
    </transition-group>
  </draggable>
</template>
<script>
  import Locale from '@/mixins/locale'
  import { extract } from '@/util/path'
  const draggable = require('vuedraggable')
  const defaultThumbnailUrl = require('@/assets/icon_found_img.png')

  export default {
    name: 'FileCard',
    components: { draggable },
    mixins: [Locale],
    props: {
      data: {
        type: Array,
      },
      headers: {
        type: Object,
      },
      actionUrl: {
        type: String,
      },
      previewable: {
        type: Boolean,
        default: true,
      },
      inputWriteable: {
        type: Boolean,
        default: true,
      },
      downloadable: {
        type: Boolean,
        default: true,
      },
      sortable: {
        type: Boolean,
        default: true,
      },
      cardBadge: {
        type: Boolean,
        default: true,
      },
      thumbnail: {
        type: Function,
        default: null,
      },
    },
    data() {
      return {
        isDragging: false,
      }
    },
    computed: {
      dataVal: {
        get() {
          return this.data
        },
        set(val) {
          // 只有在拖拽排序时才通过inputVal对value进行更新
          if (this.isDragging && val.constructor == Array && val.length > 0) {
            this.$emit('sort', val)
          }
        },
      },
      dragOptions() {
        return {
          animation: 0,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost',
        }
      },
      thumbnailComp() {
        return this.thumbnail
          ? this.thumbnail
          : this.$requestConfig.thumbnail
          ? this.$requestConfig.thumbnail
          : (file, actionUrl) => {
              const path = extract(actionUrl)
              return file.response && file.response.fileId
                ? `${path}/file/onlinePreviewController/v1/getFileById_${file.response.fileId}`
                : defaultThumbnailUrl
            }
      },
    },
    methods: {
      defaultImg(event) {
        const img = event.srcElement
        img.src = defaultThumbnailUrl
        img.onerror = null
      },
    },
  }
</script>
